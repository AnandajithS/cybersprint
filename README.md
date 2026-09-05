# 🛡️ CyberSprint: Think Before You Click

An **interactive cybersecurity storytelling show** projected live from ONE laptop to a classroom.
Call a student up, let them make decisions on the big screen, and watch the **consequences** unfold.

**For 13–14-year-old Indian school students. Total session: ~10 minutes.**

Each show pulls a **random 7 of the 13 available stories** (calibrated to
the ~10-minute session and the scoring curve), so no two shows are identical.

---

## The New Format — An Interactive Story, Not a Quiz

CyberSprint is an **interactive, branching storytelling show**:

1. The presenter projects the game from one laptop (or a deployed web URL).
2. The presenter calls a student from the audience and asks *"What should I do?"*
3. The student picks an action by tapping the big button on the screen.
4. The game shows the **consequence**, reveals **new information**, and maybe presents another decision.
5. The story continues until it reaches a resolution.

The core loop is:

```
SCENARIO → Student decision → Consequence → New info → Decision → Consequence → Resolution
```

There is **no single "correct" answer**. Many options are reasonable — "Ignore" and "Report"
are both sensible — but they lead to *different consequences*. The goal is to build real
cybersecurity **judgment**, not to reward a single right click.

---

## What it teaches

Students learn to:
- Recognize phishing links and social-engineering tricks
- Understand why passwords, OTPs and UPI details are never shared
- Verify suspicious requests before acting
- Spot fake QR codes and unexpected files
- Recover calmly when something goes wrong
- And, importantly, **not treat every message as a scam** — legitimate situations are included

Covered topics include: WhatsApp chats, Instagram/social media, YouTube, online games,
free game rewards, school competitions, QR codes, UPI/payment scams, passwords, 2FA,
fake account alerts, compromised friends, suspicious files and fake updates.

---

## Architecture — 100% Frontend, Zero Backend

The game is a **fully client-side React/Vite app**. There is **no server, no API, no
WebSocket, and no runtime fetch of scenario data**.

- **Scenarios are bundled** into the JavaScript at build time
  (`frontend/src/game/data/scenarios.json` is `import`-ed by `stories.ts`).
- **The QR code image is bundled** too (`frontend/src/assets/qr_code.jpeg`) and emitted as
  a hashed asset by Vite.
- The whole thing can be served as **static files** — perfect for Vercel, Netlify, GitHub
  Pages, or opening the build locally.

---

## Features

- **13 branching stories** (7 random per show), many connected into mini-stories where an earlier decision affects what happens next
- **Consequence screens** after every meaningful decision (no "CORRECT!" / "WRONG!" — the game teaches through outcomes)
- **Live resource state**: Security, Money Saved (₹), Threats Stopped, Good Decisions
- **Friendly end screen** — "Cyber Defender Result" with a fun title, not a grade
- **Designed for projection**: large readable text, big buttons, strong visual hierarchy, clear transitions and animations
- **No typing by students** — they just point and click
- Fully **data-driven**: stories live in a single JSON file, no hardcoded React components

---

## Project Structure

```
cybersprint/
├── frontend/                    # React app (Vite + Tailwind) — the deployable app
│   └── src/
│       ├── components/          # StepDisplay, ConsequenceCard, StoryIntro, ResourceBar, StoryCompleteCard
│       ├── game/                # stories (loader), gameState (effects & scoring), types
│       │   └── data/
│       │       └── scenarios.json   # ← the 13 branching stories (bundled into the app)
│       ├── assets/qr_code.jpeg  # bundled via Vite
│       └── screens/             # Setup, Game, Results
├── vercel.json                  # Vercel build/output configuration
├── build.sh                     # Local build (frontend only)
└── README.md
```

---

## Scenario Data Model

Each story is a list of **steps** that branch on the student's choice. Each action carries its
own `nextStep`, a `consequence`, optional `newInfo`, and `effects`.

```json
{
  "id": "story-01",
  "title": "Your Friend's Account",
  "subtitle": "A friend sends you a link that seems too good to be true.",
  "icon": "👥",
  "difficulty": 2,
  "intro": "Aarav from your class has sent you a WhatsApp message...",
  "resolution": "Keep talking to your friends if something feels off...",
  "steps": [
    {
      "id": "step-1",
      "type": "chat",
      "title": "WhatsApp",
      "origin": "Aarav",
      "time": "10:42 PM",
      "content": "Bro!! Check out this site giving FREE unlimited game coins!!...",
      "question": "Aarav sent you a link promising free game coins. What should you do?",
      "actions": [
        {
          "id": "ask",
          "label": "Ask Aarav about it",
          "nextStep": "step-b-ask",
          "consequence": "You reply: 'Hey dude, did you really send this? 👀'",
          "newInfo": "Aarav replies: 'What?! I never sent that! My account got hacked...'",
          "effects": { "security": 3, "goodDecisions": 1 }
        }
      ]
    }
  ]
}
```

An action with no `nextStep` (or a step with no `actions`) ends that branch of the story.

### Effect dimensions

| Effect | Meaning |
|--------|---------|
| `security` | 0–100 gauge, starts at 50. Falls on risky choices, rises on good ones. |
| `moneySaved` | ₹ saved/kept by avoiding scams (a scammer who didn't get paid counts as saved). |
| `threatsStopped` | Count of scams reported / prevented. |
| `goodDecisions` | Number of sensible judgment calls. |

The 13 stories cover: a compromised friend's account, a fake YouTube free-coins ad, a school
QR-code scam, a fake "parent" UPI request, a fake Instagram security alert, a suspicious
file from a friend, a genuinely legitimate school notice, a fake browser update, a thumb
drive found at school, an OTP account-takeover attempt, a free-mobile-data SIM-swap scam,
an in-game item trade that asks for your password, and a "friend" begging you to buy a gift
card for them. Each show plays a random 7 of these 13.

---

## Deploying to Vercel (recommended)

The repo is configured for a zero-config Vercel deployment of the Vite frontend.

### Option A — GitHub → Vercel (simplest)

1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project**.
3. Import the repo. Vercel auto-detects `vercel.json`:
   - **Framework Preset:** Vite
   - **Build Command:** `npm --prefix frontend install && npm --prefix frontend run build`
   - **Output Directory:** `frontend/dist`
4. Click **Deploy**. Vercel gives you a public URL like `https://cybersprint.vercel.app`.

Every push to the default branch re-deploys automatically.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel            # first time: link the project
vercel --prod     # production deploy
```

---

## Local Development

```bash
cd frontend
npm install
npm run dev        # Vite dev server with hot reload, http://localhost:5173
```

Build and preview the production bundle locally:

```bash
cd frontend
npm run build      # tsc + vite build → frontend/dist
npm run preview    # serves built app, any asset works from the URL base
```

### Editing stories

Edit **`frontend/src/game/data/scenarios.json`** (single source of truth) and rebuild —
it's bundled into the JS. After editing, run `npm run build` to pick up the change.

---

## Notes

- Scenario data is **data-driven** — edit the JSON to change stories without touching React components.
- No accounts, no networking, no leaderboard, no backend — it's one live show, fully static.
- Everything is fictional: made-up brands, domains, and schools (Greenvalley High). Amounts are in ₹.