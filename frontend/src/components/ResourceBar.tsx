import { ResourceState } from '../game/types';

interface ResourceBarProps {
  resources: ResourceState;
  compact?: boolean;
}

function securityColor(v: number): string {
  if (v >= 75) return 'text-cyber-green';
  if (v >= 50) return 'text-cyber-yellow';
  if (v >= 30) return 'text-orange-400';
  return 'text-cyber-red';
}

function securityBarColor(v: number): string {
  if (v >= 75) return 'bg-cyber-green';
  if (v >= 50) return 'bg-cyber-yellow';
  if (v >= 30) return 'bg-orange-400';
  return 'bg-cyber-red';
}

function secureIcon(v: number): string {
  if (v >= 75) return '🟢';
  if (v >= 50) return '🟡';
  if (v >= 30) return '🟠';
  return '🔴';
}

export default function ResourceBar({ resources, compact }: ResourceBarProps) {
  const money = Math.max(0, resources.moneySaved);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className={`font-bold ${securityColor(resources.security)}`}>
          {secureIcon(resources.security)} Security {resources.security}
        </span>
        <span className="text-cyber-green font-bold">💰 ₹{money}</span>
        <span className="text-cyber-blue font-bold">🛡️ {resources.threatsStopped}</span>
        <span className="text-cyber-yellow font-bold">👍 {resources.goodDecisions}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-stretch gap-3 sm:gap-4">
      <div className="bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700/50 flex-1 min-w-[160px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-gray-400 text-sm">Security</span>
          <span className={`font-bold text-xl ${securityColor(resources.security)}`}>
            {resources.security}
          </span>
        </div>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-700 ${securityBarColor(resources.security)}`}
            style={{ width: `${resources.security}%` }}
          />
        </div>
      </div>

      <div className="bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700/50 flex-1 min-w-[150px]">
        <div className="text-gray-400 text-sm">Money Saved</div>
        <div className="text-cyber-green font-bold text-2xl">₹{money}</div>
      </div>

      <div className="bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700/50 flex-1 min-w-[120px]">
        <div className="text-gray-400 text-sm">Threats Stopped</div>
        <div className="text-cyber-blue font-bold text-2xl">{resources.threatsStopped}</div>
      </div>

      <div className="bg-gray-800/60 rounded-xl px-4 py-3 border border-gray-700/50 flex-1 min-w-[120px]">
        <div className="text-gray-400 text-sm">Good Decisions</div>
        <div className="text-cyber-yellow font-bold text-2xl">{resources.goodDecisions}</div>
      </div>
    </div>
  );
}
