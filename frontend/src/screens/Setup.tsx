interface SetupProps {
  onStart: () => void;
  storyCount: number;
  poolCount: number;
}

export default function Setup({ onStart, storyCount, poolCount }: SetupProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-cyber-dark flex items-center justify-center p-4">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8 animate-fade-in">
          <div className="inline-block p-6 rounded-3xl bg-cyber-blue/10 mb-6 animate-glow">
            <span className="text-8xl">🛡️</span>
          </div>
          <h1 className="text-6xl sm:text-7xl font-extrabold text-white mb-3">
            Cyber<span className="text-cyber-blue">Sprint</span>
          </h1>
          <p className="text-cyber-green text-3xl font-semibold">Think Before You Click</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 sm:p-10 border border-gray-700/50 animate-scale-in mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Interactive Cyber Safety Show
          </h2>
          <p className="text-2xl sm:text-3xl text-gray-300 leading-relaxed mb-6">
            Project this screen for the whole class. Call one student at a time to choose a
            decision - then watch the <span className="text-cyber-blue font-semibold">consequences</span>{' '}
            unfold!
          </p>

          <div className="grid grid-cols-3 gap-4 text-center mb-8">
            <div>
              <div className="text-gray-300 font-medium text-2xl">{storyCount} of {poolCount} Stories</div>
            </div>
            <div>
              <div className="text-gray-300 font-medium text-2xl">~10 Minutes</div>
            </div>
            <div>
              <div className="text-gray-300 font-medium text-2xl">Judgment, not luck</div>
            </div>
          </div>

          <button
            onClick={onStart}
            className="px-14 py-6 bg-gradient-to-r from-cyber-blue to-cyan-500 text-white text-3xl sm:text-4xl font-bold rounded-2xl hover:from-cyan-500 hover:to-cyber-blue transition-all transform hover:scale-[1.04] focus:outline-none focus:ring-4 focus:ring-cyber-blue/40"
          >
            Begin the Show
          </button>
        </div>

        <div className="text-gray-500 text-xl sm:text-2xl animate-fade-in">
          <p>Every decision changes your security, money saved, and threats stopped.</p>
          <p className="mt-1 text-gray-400">No typing needed - students just point and click!</p>
        </div>
      </div>
    </div>
  );
}