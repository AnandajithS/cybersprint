import { GameResult, DecisionRecord } from '../game/types';

interface ResultsProps {
  result: GameResult;
  decisions: DecisionRecord[];
  onPlayAgain: () => void;
}

export default function Results({ result, decisions, onPlayAgain }: ResultsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-cyber-dark py-8 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="animate-scale-in mb-8">
          <div className="text-xl sm:text-2xl uppercase tracking-widest text-cyber-blue font-semibold mb-2">
            Cyber Defender Result
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4">
            {result.title}
          </h1>
          <p className="text-2xl sm:text-3xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {result.tagline}
          </p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 mb-8 animate-slide-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gray-900/60 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-cyber-green">
                {result.security}
                <span className="text-2xl text-gray-400">/100</span>
              </div>
              <div className="text-gray-400 text-xl mt-2">Security</div>
            </div>
            <div className="bg-gray-900/60 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-cyber-blue">
                ₹{result.moneySaved.toLocaleString('en-IN')}
              </div>
              <div className="text-gray-400 text-xl mt-2">Money Saved</div>
            </div>
            <div className="bg-gray-900/60 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-cyber-yellow">
                {result.threatsStopped}
              </div>
              <div className="text-gray-400 text-xl mt-2">Threats Stopped</div>
            </div>
            <div className="bg-gray-900/60 rounded-2xl p-6">
              <div className="text-4xl font-extrabold text-cyber-purple">
                {result.goodDecisions}
              </div>
              <div className="text-gray-400 text-xl mt-2">Good Decisions</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl p-6 border border-gray-700/50 mb-8 animate-slide-up">
          <h3 className="text-3xl font-bold text-white mb-4">Your Journey</h3>
          {decisions.length === 0 ? (
            <p className="text-gray-400 text-xl">No decisions recorded yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3 text-left max-h-80 overflow-y-auto scrollbar-hide">
              {decisions.map((d, i) => (
                <div
                  key={i}
                  className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/50"
                >
                  <div className="text-base text-gray-400 mb-1">
                    {i + 1}. {d.storyId}
                  </div>
                  <div className="text-white font-semibold text-xl mb-1">
                    Chose: {d.actionLabel}
                  </div>
                  <p className="text-gray-400 text-base leading-relaxed">{d.consequence}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={onPlayAgain}
            className="px-12 py-5 bg-gradient-to-r from-cyber-blue to-cyan-500 text-white text-2xl font-bold rounded-2xl hover:from-cyan-500 hover:to-cyber-blue transition-all transform hover:scale-[1.04]"
          >
            Play Again
          </button>
        </div>

        <div className="mt-8 text-gray-500 text-xl sm:text-2xl">
          <p>Stop → Think → Verify → Act</p>
          <p className="text-gray-400 mt-1">
            Not everything is a scam - but never share passwords, OTPs, or send money to a
            stranger who claims to be family.
          </p>
        </div>
      </div>
    </div>
  );
}