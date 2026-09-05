import { GameResult, ResourceState, Step } from './types';

export function createInitialResources(): ResourceState {
  return {
    security: 50,
    moneySaved: 0,
    threatsStopped: 0,
    goodDecisions: 0,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function applyEffects(
  state: ResourceState,
  effects: Partial<ResourceState>
): ResourceState {
  return {
    security: clamp(state.security + (effects.security || 0), 0, 100),
    moneySaved: state.moneySaved + (effects.moneySaved || 0),
    threatsStopped: state.threatsStopped + (effects.threatsStopped || 0),
    goodDecisions: state.goodDecisions + (effects.goodDecisions || 0),
  };
}

export function isTerminalStep(step: Step): boolean {
  return step.actions.length === 0;
}

export function getStepGoesToResult(step: Step): boolean {
  return step.type === 'result' || isTerminalStep(step);
}

export function computeResult(state: ResourceState): GameResult {
  const security = clamp(state.security, 0, 100);
  const moneySaved = Math.max(0, state.moneySaved);
  const threatsStopped = Math.max(0, state.threatsStopped);
  const goodDecisions = Math.max(0, state.goodDecisions);

  const score =
    security * 0.7 +
    goodDecisions * 10 +
    threatsStopped * 8 +
    clamp(moneySaved / 100, 0, 20);

  let title: string;
  let tagline: string;

  if (score >= 120) {
    title = 'Cyber Defender';
    tagline = 'You see through scams like a pro! The class is in the safest hands.';
  } else if (score >= 95) {
    title = 'Sharp-eyed Investigator';
    tagline = 'Great instincts! You catch most traps and keep people safe.';
  } else if (score >= 70) {
    title = 'Security Pro';
    tagline = 'You make solid calls. A few more checks and you will be unstoppable.';
  } else if (score >= 45) {
    title = 'Getting Suspicious 😅';
    tagline = 'You trusted too easily. Ask more questions before you act!';
  } else {
    title = 'Needs More Suspicion 😅';
    tagline = 'Whoa! Watch out for red flags like passwords, OTPs and too-good deals.';
  }

  return {
    security,
    moneySaved,
    threatsStopped,
    goodDecisions,
    title,
    tagline,
  };
}

export function clampSecurity(n: number): number {
  return clamp(n, 0, 100);
}
