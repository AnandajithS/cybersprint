# 🛡️ CyberSprint: Think Before You Click

A complete, playable **cybersecurity awareness game** for high school students aged 14-17 with little or no prior cybersecurity knowledge. Built for school cybersecurity awareness events where teams compete on a live leaderboard.

**Total session: ~10 minutes maximum.**

---

## What it teaches

Students learn to:
- Recognize phishing attempts and suspicious links
- Identify social engineering tactics
- Understand why passwords and OTPs are never shared
- Verify requests before acting
- Spot suspicious QR codes and unknown USB devices
- Recognize fake account/security notifications
- Develop the **Stop → Think → Verify → Act** habit

The game mixes **legitimate** and **malicious** scenarios on purpose — the correct strategy is NOT "ignore everything." It teaches real judgment.

---

## Features

- Multiple teams play simultaneously over a local network
- Real-time leaderboard via WebSockets (no page refresh)
- Server-authoritative scoring (client cannot submit arbitrary scores)
- 40 data-driven scenarios across 6 message types (email, chat, browser, QR, USB, notification)
- Gradual difficulty progression (easy → medium → hard → rapid-fire)
- Simulated consequences for mistakes (fictional, fully sandboxed in browser)
- Countdown timer, security/health indicator, score, feedback
- Offline / local-network only — no internet required
- Graceful recovery from temporary WebSocket disconnects
- Prevents duplicate submissions and invalid scores
- Fullscreen mode, works in Chrome/Chromium on common laptop resolutions

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite + Tailwind CSS |
| Backend | Go (stdlib + gorilla/websocket) |
| Storage | In-memory (no database needed) |
| Realtime | WebSockets |

---

## Project Structure

```
cybersprint/
├── frontend/           # React app (Vite + Tailwind)
│   └── src/
│       ├── components/ # ScenarioDisplay, Timer, Score, Leaderboard
│       ├── game/       # scenarios, gameState, types
│       └── screens/    # Setup, Game, Results
├── backend/
│   ├── main.go         # HTTP handlers, game logic
│   └── websocket.go    # WebSocket hub/broadcast
├── scenarios/
│   └── scenarios.json  # 40 scenarios
├── build.sh            # One-command build
└── README.md
```

---

## Running the Game (Deployment)

### Prerequisites
- A machine (the server) with **Go** and **Node.js** installed
- Student laptops with any Chrome/Chromium browser

### 1. Build once
```bash
./build.sh
```
This builds the React app into `frontend/dist` and compiles the Go server into `backend/cybersprint-server`.

### 2. Start the server
```bash
cd backend
./cybersprint-server
```
or to choose a port:
```bash
PORT=8080 ./cybersprint-server
```
The server prints the URL and listens on port `8080` by default.

### 3. Connect team laptops
Students open `http://<server-ip>:8080` in their browser (e.g., `http://192.168.1.10:8080`).

- Enter a **Team Name** (a unique ID is auto-generated behind the scenes and remembered in the browser, so reconnecting keeps your score).
- Click **Start Game**.
- A 10-minute timer begins. Scenarios appear one at a time; respond using the action buttons.

---

## API Endpoints

| Method | Endpoint            | Description |
|--------|---------------------|-------------|
| GET    | `/`                 | Serves the React app |
| POST   | `/api/join`         | Register a team |
| POST   | `/api/start`        | Start the 10-minute session |
| POST   | `/api/decision`     | Submit a decision (validated server-side) |
| GET    | `/api/leaderboard`  | Get full live leaderboard |
| GET    | `/api/game-status`  | Running/ended state |
| GET    | `/api/scenario`     | Fetch a scenario for a team |
| POST   | `/api/end-game`     | End the session |
| WS     | `/ws`               | Real-time leaderboard + game-status broadcasts |

---

## Scoring

Every scenario has one **ideal** response (`correctAction`) plus a set of **acceptable** responses (`acceptableActions`) — alternatives that are safe/defensible even if not ideal.

| Verdict | Meaning | Points | Accuracy |
|---------|---------|--------|----------|
| **Perfect** | Chose the ideal action | Full points (Easy 10 / Med 15 / Hard 20–25), + speed bonus | Counts as correct |
| **Acceptable** | Chose a safe-but-not-ideal action (e.g. blocking a phishing email instead of reporting it) | **0 points, no deduction** | Counts as correct |
| **Wrong** | Made a genuinely risky choice (e.g. opening a scam) | Deducts ~⅓ of the points (clamped at zero) | Counts as a miss |

This is intentional: the game rewards good judgment, so a player who *blocks* a phishing email is **not** penalized — they just don't get the full points a *report* would earn. Only clearly dangerous actions (like opening suspicious content) deduct points.

- Leaderboard ranking: **1. Total score → 2. Accuracy → 3. Average response time**.
- Accuracy counts both Perfect and Acceptable answers as well-handled.
- The **server** is the authority — the client never submits its own score, only the chosen action.

> Note: every scenario's `acceptableActions` array is automatically validated against its own `actions` list and `correctAction` — acceptable responses can never overlap the ideal one.

---

## Reliability

- **WebSocket disconnect**: the client keeps running the current scenario and continues; decisions are processed through HTTP and synchronized.
- **Duplicate submissions**: rejected by the server.
- **Invalid/missing scores**: impossible — the server computes everything.
- **Local network only**: no internet access required; the entire game is sandboxed in the browser. It never touches real files or services.

---

## Local Development

```bash
# 1. Terminal — start the Go server
cd backend && ./cybersprint-server

# 2. Terminal — run the Vite dev server (hot reload)
cd frontend && npm run dev
```
The Vite dev server proxies `/api` and `/ws` to `localhost:8080`.

---

## Notes

- Scenario data lives in `scenarios/scenarios.json`. It is intentionally **data-driven** — add or edit scenarios without touching React components.
- No accounts or passwords — it's a temporary event game, by design.
- Everything is fictional: made-up brands, domains, and a made-up school. It does not clone real apps.
