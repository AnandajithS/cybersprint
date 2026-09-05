import { Story } from './types';
import scenarioData from './data/scenarios.json';

const stories: Story[] = scenarioData as Story[];

export const STORIES_PER_SHOW = 7;

export function getStories(): Story[] {
  return stories;
}

export function getStoryPoolSize(): number {
  return stories.length;
}

export function getStep(story: Story, stepId: string) {
  return story.steps.find((s) => s.id === stepId);
}

export function getRandomStoryOrder(): Story[] {
  return [...stories]
    .sort(() => Math.random() - 0.5)
    .slice(0, STORIES_PER_SHOW);
}
