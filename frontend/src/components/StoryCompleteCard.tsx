import { Step, Story } from '../game/types';

interface StoryCompleteCardProps {
  story: Story;
  step: Step;
  isLast: boolean;
  onContinue: () => void;
}

export default function StoryCompleteCard({
  story,
  step,
  isLast,
  onContinue,
}: StoryCompleteCardProps) {
  return (
    <div className="animate-scale-in">
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 sm:p-12 text-center mb-8">
        <div className="text-6xl mb-4">{story.icon}</div>
        <div className="text-sm uppercase tracking-widest text-cyber-yellow font-semibold mb-3">
          {story.title} — Complete
        </div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
          {step.title}
        </h2>
        <p className="text-2xl sm:text-3xl text-gray-200 leading-relaxed max-w-4xl mx-auto mb-8">
          {step.content}
        </p>

        <div className="bg-cyber-blue/10 rounded-2xl border border-cyber-blue/20 p-6 max-w-3xl mx-auto">
          <div className="text-cyber-blue font-bold text-2xl mb-2">📖 Lesson</div>
          <p className="text-xl text-gray-200 leading-relaxed">{story.resolution}</p>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onContinue}
          className="px-12 py-6 bg-gradient-to-r from-cyber-green to-emerald-500 text-white text-3xl font-bold rounded-2xl hover:from-emerald-500 hover:to-cyber-green transition-all transform hover:scale-[1.05] active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyber-green/40"
        >
          {isLast ? '🏆 See My Results' : 'Next Scenario →'}
        </button>
      </div>
    </div>
  );
}