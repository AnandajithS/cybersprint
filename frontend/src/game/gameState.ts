import { GameState, Scenario, LeaderboardEntry, Verdict } from './types';

export function createInitialState(): GameState {
  return {
    phase: 'setup',
    team: null,
    currentScenario: null,
    score: 0,
    health: 100,
    timeRemaining: 600,
    isGameRunning: false,
    lastAnswer: null,
    showFeedback: false,
    leaderboard: [],
  };
}

export function evaluateVerdict(scenario: Scenario, action: string): Verdict {
  if (action === scenario.correctAction) return 'perfect';
  if ((scenario.acceptableActions || []).includes(action)) return 'acceptable';
  return 'wrong';
}

export function calculateScore(
  state: GameState,
  scenario: Scenario,
  action: string,
  responseTime: number
): { score: number; health: number } {
  const verdict = evaluateVerdict(scenario, action);
  let scoreChange = 0;
  let healthChange = 0;

  if (verdict === 'perfect') {
    scoreChange = scenario.points;
    healthChange = 5;
  } else if (verdict === 'acceptable') {
    scoreChange = 0;
    healthChange = 2;
  } else {
    scoreChange = -Math.floor(scenario.points / 3);
    healthChange = -10;

    if (scenario.category === 'malware') {
      healthChange = -25;
    } else if (scenario.category === 'phishing') {
      healthChange = -15;
    }
  }

  const speedBonus = Math.max(0, Math.floor((10 - responseTime) * 2));
  if (verdict === 'perfect' && responseTime < 10) {
    scoreChange += speedBonus;
  }

  const newScore = Math.max(0, state.score + scoreChange);
  const newHealth = Math.max(0, Math.min(100, state.health + healthChange));

  return { score: newScore, health: newHealth };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function getHealthColor(health: number): string {
  if (health >= 80) return 'text-cyber-green';
  if (health >= 60) return 'text-cyber-yellow';
  if (health >= 40) return 'text-orange-500';
  return 'text-cyber-red';
}

export function getHealthBarColor(health: number): string {
  if (health >= 80) return 'bg-cyber-green';
  if (health >= 60) return 'bg-cyber-yellow';
  if (health >= 40) return 'bg-orange-500';
  return 'bg-cyber-red';
}

export function getScenarioIcon(type: string): string {
  switch (type) {
    case 'email': return '📧';
    case 'chat': return '💬';
    case 'browser': return '🌐';
    case 'notification': return '🔔';
    case 'qr': return '📱';
    case 'usb': return '💾';
    default: return '📨';
  }
}

export function getConsequenceMessage(consequence: string): string {
  switch (consequence) {
    case 'malware_infection':
      return '⚠️ Malware has been installed on your system! Your files may be at risk.';
    case 'credential_theft':
      return '🔓 Your login credentials may have been stolen! Change your passwords immediately.';
    case 'data_loss':
      return '💾 Important files have been encrypted or deleted!';
    case 'account_compromise':
      return '👤 Your social media account has been compromised!';
    default:
      return '⚠️ This could have led to a security incident.';
  }
}

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return a.avgTime - b.avgTime;
  }).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
