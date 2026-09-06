import { Story } from '../game/types';

interface StoryIntroProps {
  story: Story;
  storyNumber: number;
  totalStories: number;
  onBegin: () => void;
}

export default function StoryIntro({
  story,
  storyNumber,
  totalStories,
  onBegin,
}: StoryIntroProps) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center text-center px-6 py-10 animate-scale-in">
      <div className="text-xl sm:text-2xl uppercase tracking-widest text-cyber-blue font-semibold mb-4">
        Scenario <span className="text-white">{storyNumber}</span> of {totalStories}
      </div>

      <div className="text-8xl sm:text-9xl mb-6 animate-float-up">{story.icon}</div>

      <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-4 leading-tight max-w-4xl">
        {story.title}
      </h1>

      <p className="text-2xl sm:text-3xl text-gray-300 max-w-3xl mb-3 leading-relaxed">
        {story.subtitle}
      </p>

      <div className="flex items-center gap-1 text-cyber-yellow text-3xl mb-8">
        {'★'.repeat(story.difficulty)}
      </div>

      <div className="bg-gray-800/60 backdrop-blur rounded-2xl border border-gray-700/50 p-6 sm:p-8 mb-10 max-w-3xl">
        <p className="text-2xl sm:text-3xl text-gray-200 leading-relaxed">{story.intro}</p>
      </div>

      <button
        onClick={onBegin}
        className="px-12 py-6 bg-gradient-to-r from-cyber-blue to-cyan-500 text-white text-3xl font-bold rounded-2xl hover:from-cyan-500 hover:to-cyber-blue transition-all transform hover:scale-[1.05] active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyber-blue/50 animate-glow"
      >
        Let's start!
      </button>
    </div>
  );
}