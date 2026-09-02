export interface Scenario {
  id: string;
  type: 'email' | 'chat' | 'browser' | 'qr' | 'usb' | 'notification';
  difficulty: 1 | 2 | 3;
  title: string;
  sender?: string;
  content: string;
  metadata?: Record<string, string>;
  actions: { id: string; label: string }[];
  correctAction: string;
  acceptableActions?: string[];
  points: number;
  explanation: string;
  category: string;
}

let scenarios: Scenario[] = [];
let loaded = false;

export async function loadScenarios(): Promise<Scenario[]> {
  if (loaded) return scenarios;
  
  try {
    const response = await fetch('/scenarios/scenarios.json');
    scenarios = await response.json();
    loaded = true;
    return scenarios;
  } catch (error) {
    console.error('Failed to load scenarios:', error);
    return [];
  }
}

export function getScenarioByType(type: string): Scenario | undefined {
  return scenarios.find(s => s.type === type);
}

export function getRandomScenario(excludeIds: Set<string>): Scenario | null {
  const available = scenarios.filter(s => !excludeIds.has(s.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export function getScenariosByDifficulty(difficulty: number): Scenario[] {
  return scenarios.filter(s => s.difficulty === difficulty);
}
