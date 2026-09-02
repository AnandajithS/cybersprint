package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Scenario struct {
	ID                string            `json:"id"`
	Type              string            `json:"type"`
	Difficulty        int               `json:"difficulty"`
	Title             string            `json:"title"`
	Sender            string            `json:"sender,omitempty"`
	Content           string            `json:"content"`
	Metadata          map[string]string `json:"metadata,omitempty"`
	Actions           []Action          `json:"actions"`
	CorrectAction     string            `json:"correctAction"`
	AcceptableActions []string          `json:"acceptableActions,omitempty"`
	Points            int               `json:"points"`
	Explanation       string            `json:"explanation"`
	Category          string            `json:"category"`
}

type Action struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

type Team struct {
	ID                string           `json:"id"`
	Name              string           `json:"name"`
	Score             int              `json:"score"`
	CorrectAnswers    int              `json:"correctAnswers"`
	AcceptableAnswers int              `json:"acceptableAnswers"`
	TotalAnswers      int              `json:"totalAnswers"`
	TotalResponseTime float64          `json:"totalResponseTime"`
	CurrentScenario   *Scenario        `json:"currentScenario,omitempty"`
	ScenarioIndex     int              `json:"scenarioIndex"`
	AnsweredIDs       map[string]bool  `json:"answeredIds"`
	StartTime         time.Time        `json:"startTime"`
	LastAnswer        *Answer          `json:"lastAnswer,omitempty"`
	mu                sync.Mutex       `json:"-"`
}

type Answer struct {
	ScenarioID    string  `json:"scenarioId"`
	Action        string  `json:"action"`
	Verdict       string  `json:"verdict"` // perfect | acceptable | wrong
	Correct       bool    `json:"correct"`
	PointsEarned  int     `json:"pointsEarned"`
	ResponseTime  float64 `json:"responseTime"`
	Explanation   string  `json:"explanation"`
	Consequence   string  `json:"consequence,omitempty"`
}

type GameSession struct {
	StartTime    time.Time `json:"startTime"`
	EndTime      time.Time `json:"endTime"`
	IsRunning    bool      `json:"isRunning"`
	DurationSecs int       `json:"durationSecs"`
}

type LeaderboardEntry struct {
	Rank       int     `json:"rank"`
	TeamID     string  `json:"teamId"`
	TeamName   string  `json:"teamName"`
	Score      int     `json:"score"`
	Accuracy   float64 `json:"accuracy"`
	AvgTime    float64 `json:"avgTime"`
	Correct    int     `json:"correct"`
	Total      int     `json:"total"`
}

var (
	scenarios    []Scenario
	teams        = make(map[string]*Team)
	teamsMu      sync.RWMutex
	gameSession  GameSession
	sessionMu    sync.RWMutex
	clients      = make(map[*Client]bool)
	clientsMu    sync.RWMutex

	projectRoot string
)

type Client struct {
	conn   *websocket.Conn
	teamID string
	send   chan []byte
}

func main() {
	projectRoot = findProjectRoot()
	loadScenarios()

	gameSession = GameSession{
		DurationSecs: 600,
	}

	http.HandleFunc("/", serveFrontend)
	http.HandleFunc("/api/join", handleJoin)
	http.HandleFunc("/api/start", handleStart)
	http.HandleFunc("/api/decision", handleDecision)
	http.HandleFunc("/api/leaderboard", handleLeaderboard)
	http.HandleFunc("/api/game-status", handleGameStatus)
	http.HandleFunc("/api/scenario", handleGetScenario)
	http.HandleFunc("/api/end-game", handleEndGame)
	http.HandleFunc("/ws", handleWebSocket)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("CyberSprint Server starting on :%s\n", port)
	fmt.Printf("Open http://localhost:%s in your browser\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func findProjectRoot() string {
	if _, err := os.Stat("scenarios/scenarios.json"); err == nil {
		return "."
	}
	if _, err := os.Stat("../scenarios/scenarios.json"); err == nil {
		return ".."
	}
	if _, err := os.Stat("../frontend/dist"); err == nil {
		return ".."
	}
	return "."
}

func loadScenarios() {
	data, err := os.ReadFile(projectRoot + "/scenarios/scenarios.json")
	if err != nil {
		log.Fatalf("Failed to load scenarios: %v", err)
	}
	if err := json.Unmarshal(data, &scenarios); err != nil {
		log.Fatalf("Failed to parse scenarios: %v", err)
	}
	log.Printf("Loaded %d scenarios", len(scenarios))
}

func serveFrontend(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/scenarios/scenarios.json" {
		http.ServeFile(w, r, projectRoot+"/scenarios/scenarios.json")
		return
	}

	staticDir := projectRoot + "/frontend/dist"
	filePath := staticDir + r.URL.Path
	if _, err := os.Stat(filePath); err == nil {
		http.ServeFile(w, r, filePath)
		return
	}
	http.ServeFile(w, r, staticDir+"/index.html")
}

func handleJoin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		TeamID   string `json:"teamId"`
		TeamName string `json:"teamName"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.TeamID == "" || req.TeamName == "" {
		http.Error(w, "Team ID and name required", http.StatusBadRequest)
		return
	}

	teamsMu.Lock()

	if _, exists := teams[req.TeamID]; exists {
		teamsMu.Unlock()
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"teamId":  req.TeamID,
			"message": "Reconnected to existing team",
		})
		return
	}

	team := &Team{
		ID:          req.TeamID,
		Name:        req.TeamName,
		Score:       0,
		AnsweredIDs: make(map[string]bool),
		StartTime:   time.Now(),
	}
	teams[req.TeamID] = team
	teamsMu.Unlock()

	log.Printf("Team joined: %s (%s)", req.TeamName, req.TeamID)
	broadcastLeaderboard()

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"teamId":  req.TeamID,
	})
}

func handleStart(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionMu.Lock()
	gameSession.StartTime = time.Now()
	gameSession.IsRunning = true
	gameSession.EndTime = gameSession.StartTime.Add(time.Duration(gameSession.DurationSecs) * time.Second)
	sessionMu.Unlock()

	log.Println("Game started!")
	broadcastGameStatus()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"startTime": gameSession.StartTime,
		"endTime":   gameSession.EndTime,
	})
}

func handleDecision(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionMu.RLock()
	if !gameSession.IsRunning {
		sessionMu.RUnlock()
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Game has not started",
		})
		return
	}
	sessionMu.RUnlock()

	var req struct {
		TeamID     string  `json:"teamId"`
		ScenarioID string  `json:"scenarioId"`
		Action     string  `json:"action"`
		ActionTime float64 `json:"actionTime"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	teamsMu.Lock()
	team, exists := teams[req.TeamID]
	if !exists {
		teamsMu.Unlock()
		http.Error(w, "Team not found", http.StatusNotFound)
		return
	}
	teamsMu.Unlock()

	team.mu.Lock()
	defer team.mu.Unlock()

	if team.AnsweredIDs[req.ScenarioID] {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Already answered this scenario",
		})
		return
	}

	scenario := findScenario(req.ScenarioID)
	if scenario == nil {
		http.Error(w, "Scenario not found", http.StatusNotFound)
		return
	}

	correct := req.Action == scenario.CorrectAction
	acceptable := !correct && containsString(scenario.AcceptableActions, req.Action)

	pointsEarned := 0
	verdict := "wrong"
	consequence := ""

	switch {
	case correct:
		verdict = "perfect"
		pointsEarned = scenario.Points
	case acceptable:
		verdict = "acceptable"
		pointsEarned = 0
	default:
		verdict = "wrong"
		pointsEarned = -scenario.Points / 3
		if pointsEarned > 0 {
			pointsEarned = 0
		}
		if scenario.Category == "malware" {
			consequence = "malware_infection"
		} else if scenario.Category == "phishing" {
			consequence = "credential_theft"
		}
	}

	team.Score += pointsEarned
	if team.Score < 0 {
		team.Score = 0
	}
	team.AnsweredIDs[req.ScenarioID] = true
	team.TotalAnswers++
	if correct {
		team.CorrectAnswers++
	} else if acceptable {
		team.AcceptableAnswers++
	}
	team.TotalResponseTime += req.ActionTime

	answer := &Answer{
		ScenarioID:    req.ScenarioID,
		Action:        req.Action,
		Verdict:       verdict,
		Correct:       correct || acceptable,
		PointsEarned:  pointsEarned,
		ResponseTime:  req.ActionTime,
		Explanation:   scenario.Explanation,
		Consequence:   consequence,
	}
	team.LastAnswer = answer

	log.Printf("Team %s answered scenario %s: %s (verdict=%s, points=%d)",
		team.Name, req.ScenarioID, req.Action, verdict, pointsEarned)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"verdict":      verdict,
		"correct":      correct || acceptable,
		"pointsEarned": pointsEarned,
		"explanation":  scenario.Explanation,
		"consequence":  consequence,
		"totalScore":   team.Score,
		"accuracy":     float64(team.CorrectAnswers+team.AcceptableAnswers) / float64(team.TotalAnswers) * 100,
	})

	go broadcastLeaderboard()
}

func handleGetScenario(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	teamID := r.URL.Query().Get("teamId")
	if teamID == "" {
		scenario := getRandomScenario(nil)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(scenario)
		return
	}

	teamsMu.RLock()
	team, exists := teams[teamID]
	teamsMu.RUnlock()

	if !exists {
		scenario := getRandomScenario(nil)
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(scenario)
		return
	}

	team.mu.Lock()
	scenario := getRandomScenario(team.AnsweredIDs)
	if scenario != nil {
		team.CurrentScenario = scenario
		team.ScenarioIndex++
	}
	team.mu.Unlock()

	if scenario == nil {
		scenario = &scenarios[0]
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scenario)
}

func handleLeaderboard(w http.ResponseWriter, r *http.Request) {
	entries := getLeaderboard()
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(entries)
}

func handleGameStatus(w http.ResponseWriter, r *http.Request) {
	sessionMu.RLock()
	defer sessionMu.RUnlock()

	teamsMu.RLock()
	teamCount := len(teams)
	teamsMu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"isRunning":    gameSession.IsRunning,
		"startTime":    gameSession.StartTime,
		"endTime":      gameSession.EndTime,
		"durationSecs": gameSession.DurationSecs,
		"teamCount":    teamCount,
	})
}

func handleEndGame(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	sessionMu.Lock()
	gameSession.IsRunning = false
	gameSession.EndTime = time.Now()
	sessionMu.Unlock()

	log.Println("Game ended!")
	broadcastGameStatus()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
	})
}

func findScenario(id string) *Scenario {
	for _, s := range scenarios {
		if s.ID == id {
			return &s
		}
	}
	return nil
}

func getRandomScenario(exclude map[string]bool) *Scenario {
	available := make([]Scenario, 0)
	for _, s := range scenarios {
		if exclude == nil || !exclude[s.ID] {
			available = append(available, s)
		}
	}
	if len(available) == 0 {
		return nil
	}
	return &available[time.Now().UnixNano()%int64(len(available))]
}

func containsString(list []string, s string) bool {
	for _, v := range list {
		if v == s {
			return true
		}
	}
	return false
}

func getLeaderboard() []LeaderboardEntry {
	teamsMu.RLock()
	defer teamsMu.RUnlock()

	entries := make([]LeaderboardEntry, 0, len(teams))
	for _, team := range teams {
		team.mu.Lock()
		accuracy := 0.0
		if team.TotalAnswers > 0 {
			accuracy = float64(team.CorrectAnswers+team.AcceptableAnswers) / float64(team.TotalAnswers) * 100
		}
		avgTime := 0.0
		if team.TotalAnswers > 0 {
			avgTime = team.TotalResponseTime / float64(team.TotalAnswers)
		}
		entries = append(entries, LeaderboardEntry{
			TeamID:   team.ID,
			TeamName: team.Name,
			Score:    team.Score,
			Accuracy: accuracy,
			AvgTime:  avgTime,
			Correct:  team.CorrectAnswers,
			Total:    team.TotalAnswers,
		})
		team.mu.Unlock()
	}

	sortLeaderboard(entries)
	for i := range entries {
		entries[i].Rank = i + 1
	}

	return entries
}

func sortLeaderboard(entries []LeaderboardEntry) {
	for i := 0; i < len(entries); i++ {
		for j := i + 1; j < len(entries); j++ {
			if entries[j].Score > entries[i].Score {
				entries[i], entries[j] = entries[j], entries[i]
			} else if entries[j].Score == entries[i].Score {
				if entries[j].Accuracy > entries[i].Accuracy {
					entries[i], entries[j] = entries[j], entries[i]
				} else if entries[j].Accuracy == entries[i].Accuracy {
					if entries[j].AvgTime < entries[i].AvgTime {
						entries[i], entries[j] = entries[j], entries[i]
					}
				}
			}
		}
	}
}
