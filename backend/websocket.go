package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		conn: conn,
		send: make(chan []byte, 256),
	}

	clientsMu.Lock()
	clients[client] = true
	clientsMu.Unlock()

	log.Println("New WebSocket client connected")

	go client.writePump()
	go client.readPump()

	sendLeaderboardToClient(client)
	sendGameStatusToClient(client)
}

func (c *Client) readPump() {
	defer func() {
		clientsMu.Lock()
		delete(clients, c)
		clientsMu.Unlock()
		c.conn.Close()
	}()

	for {
		_, _, err := c.conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (c *Client) writePump() {
	defer c.conn.Close()

	for msg := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
}

func sendLeaderboardToClient(client *Client) {
	entries := getLeaderboard()
	data, _ := json.Marshal(map[string]interface{}{
		"type":       "leaderboard",
		"leaderboard": entries,
	})
	select {
	case client.send <- data:
	default:
	}
}

func sendGameStatusToClient(client *Client) {
	sessionMu.RLock()
	defer sessionMu.RUnlock()

	data, _ := json.Marshal(map[string]interface{}{
		"type":      "gameStatus",
		"isRunning": gameSession.IsRunning,
		"startTime": gameSession.StartTime,
		"endTime":   gameSession.EndTime,
		"remaining": gameSession.DurationSecs,
	})
	select {
	case client.send <- data:
	default:
	}
}

func broadcastLeaderboard() {
	entries := getLeaderboard()
	data, _ := json.Marshal(map[string]interface{}{
		"type":       "leaderboard",
		"leaderboard": entries,
	})
	broadcast(data)
}

func broadcastGameStatus() {
	sessionMu.RLock()
	defer sessionMu.RUnlock()

	data, _ := json.Marshal(map[string]interface{}{
		"type":      "gameStatus",
		"isRunning": gameSession.IsRunning,
		"startTime": gameSession.StartTime,
		"endTime":   gameSession.EndTime,
		"remaining": gameSession.DurationSecs,
	})
	broadcast(data)
}

func broadcast(msg []byte) {
	clientsMu.RLock()
	defer clientsMu.RUnlock()

	for client := range clients {
		select {
		case client.send <- msg:
		default:
			close(client.send)
			delete(clients, client)
		}
	}
}

var (
	scenarioMu   sync.Mutex
	scenarioPool []Scenario
	scenarioIdx  int
)

func initScenarioPool() {
	scenarioMu.Lock()
	scenarioPool = make([]Scenario, len(scenarios))
	copy(scenarioPool, scenarios)
	scenarioIdx = 0
	scenarioMu.Unlock()
}
