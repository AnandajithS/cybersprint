import {
  Story,
  Step,
  ResourceState,
  Action,
  GameStage,
} from '../game/types';
import ResourceBar from '../components/ResourceBar';
import StoryIntro from '../components/StoryIntro';
import StepDisplay from '../components/StepDisplay';
import ConsequenceCard from '../components/ConsequenceCard';
import StoryCompleteCard from '../components/StoryCompleteCard';

interface GameProps {
  stage: GameStage;
  story: Story;
  storyIndex: number;
  totalStories: number;
  currentStep: Step;
  resources: ResourceState;
  lastAction: Action | null;
  onBeginStory: () => void;
  onAction: (action: Action) => void;
  onContinue: () => void;
}

const stageLabels: Record<string, string> = {
  [GameStage.StoryIntro]: 'Story Intro',
  [GameStage.Decision]: 'Decision Time',
  [GameStage.Consequence]: 'Consequences',
  [GameStage.StoryComplete]: 'Story Complete',
};

export default function Game({
  stage,
  story,
  storyIndex,
  totalStories,
  currentStep,
  resources,
  lastAction,
  onBeginStory,
  onAction,
  onContinue,
}: GameProps) {
  const isLast = storyIndex >= totalStories - 1;

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => undefined);
    } else {
      document.exitFullscreen().catch(() => undefined);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-dark flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              <span className="text-cyber-blue">Cyber</span>
              <span className="text-white">Sprint</span>
            </h1>
            <span className="hidden sm:inline text-xl text-gray-400">
              {stageLabels[stage] || ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-xl font-bold">
              <span className="text-white">{storyIndex + 1}/{totalStories}</span>
              <span className="text-gray-300">{story.icon} {story.title}</span>
            </div>
            <button
              onClick={handleFullscreen}
              className="px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700/60 text-sm transition-colors"
              title="Toggle fullscreen"
            >
              ⛶ Fullscreen
            </button>
          </div>
        </div>
      </header>

      {(stage === GameStage.Decision || stage === GameStage.Consequence) && (
        <div className="bg-gray-900/40 border-b border-gray-700/50 px-4 sm:px-8 py-3">
          <div className="max-w-6xl mx-auto">
            <ResourceBar resources={resources} />
          </div>
        </div>
      )}

      <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {stage === GameStage.StoryIntro && (
            <StoryIntro
              story={story}
              storyNumber={storyIndex + 1}
              totalStories={totalStories}
              onBegin={onBeginStory}
            />
          )}

          {stage === GameStage.Decision && (
            <StepDisplay step={currentStep} onAction={onAction} />
          )}

          {stage === GameStage.Consequence && lastAction && (
            <ConsequenceCard
              action={lastAction}
              onContinue={onContinue}
              isFinal={false}
              securityAfter={resources.security}
            />
          )}

          {stage === GameStage.StoryComplete && (
            <StoryCompleteCard
              story={story}
              step={currentStep}
              isLast={isLast}
              onContinue={onContinue}
            />
          )}

          {stage === GameStage.Results && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏁</div>
              <h2 className="text-4xl font-bold text-white">Game Over — loading results...</h2>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}