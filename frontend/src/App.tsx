import { useCallback, useMemo, useState } from 'react';
import {
  Story,
  Step,
  Action,
  ResourceState,
  DecisionRecord,
  GameStage,
} from './game/types';
import {
  getStories,
  getRandomStoryOrder,
  getStep,
  getStoryPoolSize,
  STORIES_PER_SHOW,
} from './game/stories';
import {
  createInitialResources,
  applyEffects,
  computeResult,
  isTerminalStep,
} from './game/gameState';
import Setup from './screens/Setup';
import Game from './screens/Game';
import Results from './screens/Results';

interface GameFlow {
  stage: GameStage;
  storyIndex: number;
  activeStepId: string;
  resources: ResourceState;
  decisions: DecisionRecord[];
  lastAction: Action | null;
}

function createInitialFlow(): GameFlow {
  return {
    stage: GameStage.Setup,
    storyIndex: 0,
    activeStepId: '',
    resources: createInitialResources(),
    decisions: [],
    lastAction: null,
  };
}

export default function App() {
  const [storyOrder, setStoryOrder] = useState<Story[]>([]);
  const [flow, setFlow] = useState<GameFlow>(createInitialFlow());
  const [showResults, setShowResults] = useState(false);

  const handlePlayAgain = useCallback(() => {
    setStoryOrder(getRandomStoryOrder());
    setFlow(createInitialFlow());
    setShowResults(false);
  }, []);

  const handleStart = useCallback(() => {
    const order = getRandomStoryOrder();
    setStoryOrder(order);
    setFlow({
      stage: GameStage.StoryIntro,
      storyIndex: 0,
      activeStepId: order[0]?.steps[0]?.id || '',
      resources: createInitialResources(),
      decisions: [],
      lastAction: null,
    });
    setShowResults(false);
  }, []);

  const currentStory: Story | undefined = storyOrder[flow.storyIndex];

  const currentStep: Step | undefined = useMemo(() => {
    if (!currentStory) return undefined;
    return getStep(currentStory, flow.activeStepId) || currentStory.steps[0];
  }, [currentStory, flow.activeStepId]);

  const handleBeginStory = useCallback(() => {
    if (!currentStory) return;
    setFlow((prev) => ({
      ...prev,
      stage: GameStage.Decision,
      activeStepId: currentStory.steps[0].id,
    }));
  }, [currentStory]);

  const handleAction = useCallback(
    (action: Action) => {
      if (!currentStory) return;
      setFlow((prev) => ({
        ...prev,
        resources: applyEffects(prev.resources, action.effects),
        decisions: [
          ...prev.decisions,
          {
            storyId: currentStory.id,
            stepId: prev.activeStepId,
            actionLabel: action.label,
            consequence: action.consequence,
            effects: action.effects,
          },
        ],
        lastAction: action,
        stage: action.nextStep ? GameStage.Consequence : GameStage.StoryComplete,
      }));
    },
    [currentStory]
  );

  const handleContinue = useCallback(() => {
    setFlow((prev) => {
      if (!currentStory || !prev.lastAction) return prev;

      if (prev.stage === GameStage.Consequence) {
        const targetStepId = prev.lastAction.nextStep;
        if (!targetStepId) {
          return { ...prev, stage: GameStage.StoryComplete };
        }
        const target = getStep(currentStory, targetStepId);
        if (target && isTerminalStep(target)) {
          return { ...prev, stage: GameStage.StoryComplete, activeStepId: targetStepId };
        }
        return { ...prev, stage: GameStage.Decision, activeStepId: targetStepId };
      }

      if (prev.stage === GameStage.StoryComplete) {
        const nextIndex = prev.storyIndex + 1;
        if (nextIndex < storyOrder.length) {
          return {
            ...prev,
            stage: GameStage.StoryIntro,
            storyIndex: nextIndex,
            activeStepId: storyOrder[nextIndex].steps[0].id,
            lastAction: null,
          };
        }
        setShowResults(true);
        return { ...prev, stage: GameStage.Results };
      }

      return prev;
    });
  }, [currentStory, storyOrder]);

  const orderedStories = storyOrder.length > 0 ? storyOrder : getStories();

  if (flow.stage === GameStage.Setup) {
    return (
      <Setup
        onStart={handleStart}
        storyCount={orderedStories.length === getStoryPoolSize() ? STORIES_PER_SHOW : orderedStories.length}
        poolCount={getStoryPoolSize()}
      />
    );
  }

  if (showResults || flow.stage === GameStage.Results) {
    const result = computeResult(flow.resources);
    return (
      <Results
        result={result}
        decisions={flow.decisions}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (!currentStory || !currentStep) {
    return <Setup onStart={handleStart} storyCount={STORIES_PER_SHOW} poolCount={getStoryPoolSize()} />;
  }

  return (
    <Game
      stage={flow.stage}
      story={currentStory}
      storyIndex={flow.storyIndex}
      totalStories={orderedStories.length}
      currentStep={currentStep}
      resources={flow.resources}
      lastAction={flow.lastAction}
      onBeginStory={handleBeginStory}
      onAction={handleAction}
      onContinue={handleContinue}
    />
  );
}