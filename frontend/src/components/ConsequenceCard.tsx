import { Action } from '../game/types';

interface ConsequenceCardProps {
  action: Action;
  onContinue: () => void;
  isFinal: boolean;
  newStory?: boolean;
  securityAfter: number;
}

function renderEffect(
  label: string,
  value: number | undefined,
  suffix: string
): string | null {
  if (value === undefined || value === 0) return null;
  const arrow = value > 0 ? '+' : '';
  return `${label} ${arrow}${value}${suffix}`;
}

export default function ConsequenceCard({
  action,
  onContinue,
  isFinal,
  newStory,
  securityAfter,
}: ConsequenceCardProps) {
  const effects = action.effects || {};
  const effectLines = [
    renderEffect('Security', effects.security, ''),
    renderEffect('Money Saved', effects.moneySaved, ''),
    renderEffect('Threats Stopped', effects.threatsStopped, ''),
    renderEffect('Good Decisions', effects.goodDecisions, ''),
  ].filter((line): line is string => line !== null);

  const hasPositiveEffect = (effects.security || 0) >= 0;

  const continueLabel = isFinal
    ? newStory
      ? 'Next Story →'
      : 'Finish Story'
    : 'See What Happens Next →';

  return (
    <div className="animate-slide-up">
      <div
        className={`rounded-3xl border p-8 sm:p-12 ${
          hasPositiveEffect
            ? 'bg-gradient-to-br from-cyber-green/15 to-cyber-blue/5 border-cyber-green/30'
            : 'bg-gradient-to-br from-red-500/15 to-orange-500/5 border-red-500/30'
        }`}
      >
        <div className="flex items-start gap-4 mb-6">
          <div
            className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-white text-4xl font-bold ${
              hasPositiveEffect ? 'bg-cyber-green' : 'bg-red-500'
            }`}
          >
            {hasPositiveEffect ? '+' : '!'}
          </div>
          <div className="min-w-0">
            <div className="text-lg uppercase tracking-wider font-semibold text-gray-300 mb-1">
              You chose {action.label}
            </div>
            <p className="text-white text-3xl sm:text-4xl font-extrabold leading-tight max-w-4xl">
              {action.consequence}
            </p>
          </div>
        </div>

        {action.newInfo && (
          <div className="bg-black/30 rounded-2xl border border-white/10 p-6 sm:p-8 mb-6">
            <div className="text-cyber-blue font-bold text-2xl mb-2">New Information</div>
            <p className="text-white text-2xl sm:text-3xl leading-relaxed">{action.newInfo}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-8">
          {effectLines.length > 0 ? (
            effectLines.map((line, idx) => (
              <span
                key={idx}
                className={`px-4 py-2 rounded-full text-xl font-bold border ${
                  line.startsWith('+')
                    ? 'bg-cyber-green/20 text-cyber-green border-cyber-green/40'
                    : line.startsWith('-')
                      ? 'bg-red-500/20 text-red-400 border-red-500/40'
                      : 'bg-gray-700/40 text-gray-200 border-gray-500/40'
                }`}
              >
                {line}
              </span>
            ))
          ) : (
            <span className="px-4 py-2 rounded-full text-xl font-bold border bg-gray-700/40 text-gray-300 border-gray-500/40">
              No change
            </span>
          )}
          <span className="px-4 py-2 rounded-full text-xl font-bold border bg-gray-800/60 text-gray-300 border-gray-500/40">
            Security now {securityAfter}
          </span>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className="px-10 py-5 bg-gradient-to-r from-cyber-blue to-cyan-500 text-white text-2xl sm:text-3xl font-bold rounded-2xl hover:from-cyan-500 hover:to-cyber-blue transition-all transform hover:scale-[1.05] active:scale-95 focus:outline-none focus:ring-4 focus:ring-cyber-blue/40"
          >
            {continueLabel}
          </button>
        </div>
      </div>
    </div>
  );
}