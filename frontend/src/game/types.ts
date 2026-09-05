export interface Effects {
  security?: number;
  moneySaved?: number;
  threatsStopped?: number;
  goodDecisions?: number;
}

export interface Action {
  id: string;
  label: string;
  nextStep?: string;
  consequence: string;
  newInfo?: string;
  effects: Effects;
}

export interface Step {
  id: string;
  type: 'chat' | 'browser' | 'notification' | 'qr' | 'file' | 'sms' | 'email' | 'result';
  title: string;
  origin?: string;
  time?: string;
  content: string;
  question: string;
  actions: Action[];
}

export interface Story {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  difficulty: 1 | 2 | 3;
  intro: string;
  resolution: string;
  steps: Step[];
}

export interface ResourceState {
  security: number;
  moneySaved: number;
  threatsStopped: number;
  goodDecisions: number;
}

export interface DecisionRecord {
  storyId: string;
  stepId: string;
  actionLabel: string;
  consequence: string;
  effects: Effects;
}

export interface GameResult {
  security: number;
  moneySaved: number;
  threatsStopped: number;
  goodDecisions: number;
  title: string;
  tagline: string;
}

export enum GameStage {
  Setup = 'setup',
  StoryIntro = 'storyIntro',
  Decision = 'decision',
  Consequence = 'consequence',
  StoryComplete = 'storyComplete',
  Results = 'results',
}

export interface ActiveStory {
  story: Story;
  storyIndex: number; // index into the ordered list
  currentStepId: string;
}
