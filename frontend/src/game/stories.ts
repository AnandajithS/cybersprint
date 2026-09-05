import { Story } from './types';
import scenarioData from './data/scenarios.json';

const stories: Story[] = scenarioData as Story[];

export function getStories(): Story[] {
  return stories;
}

export function getStep(story: Story, stepId: string) {
  return story.steps.find((s) => s.id === stepId);
}

export function getRandomStoryOrder(): Story[] {
  return [...stories].sort(() => Math.random() - 0.5);
}
