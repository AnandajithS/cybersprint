export interface Action {
  id: string;
  label: string;
}

export interface Scenario {
  id: string;
  type: 'email' | 'chat' | 'browser' | 'qr' | 'usb' | 'notification';
  difficulty: 1 | 2 | 3;
  title: string;
  sender?: string;
  content: string;
  metadata?: Record<string, string>;
  actions: Action[];
  correctAction: string;
  acceptableActions?: string[];
  points: number;
  explanation: string;
  category: string;
}

export type Verdict = 'perfect' | 'acceptable' | 'wrong';

export interface Answer {
  scenarioId: string;
  action: string;
  verdict: Verdict;
  correct: boolean;
  pointsEarned: number;
  explanation: string;
  consequence?: string;
}

export interface Team {
  id: string;
  name: string;
  score: number;
  correctAnswers: number;
  acceptableAnswers: number;
  totalAnswers: number;
  totalResponseTime: number;
  currentScenario?: Scenario;
  scenarioIndex: number;
  answeredIds: Set<string>;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  score: number;
  accuracy: number;
  avgTime: number;
  correct: number;
  total: number;
}

export type GamePhase = 'setup' | 'playing' | 'results';

export interface GameState {
  phase: GamePhase;
  team: Team | null;
  currentScenario: Scenario | null;
  score: number;
  health: number;
  timeRemaining: number;
  isGameRunning: boolean;
  lastAnswer: Answer | null;
  showFeedback: boolean;
  leaderboard: LeaderboardEntry[];
}
