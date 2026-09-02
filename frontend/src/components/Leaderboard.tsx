import { LeaderboardEntry } from '../game/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-4xl mb-3">🏆</div>
        <p>No teams have joined yet</p>
      </div>
    );
  }

  const getMedal = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRowStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500/20 to-yellow-500/5 border-yellow-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400/20 to-gray-400/5 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-orange-500/20 to-orange-500/5 border-orange-500/30';
    return 'bg-gray-800/50 border-gray-700/50';
  };

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.teamId}
          className={`flex items-center gap-3 p-3 rounded-lg border ${getRowStyle(entry.rank)}`}
        >
          <div className="w-10 h-10 flex items-center justify-center text-xl">
            {getMedal(entry.rank)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white font-medium truncate">{entry.teamName}</div>
            <div className="text-xs text-gray-400">
              {entry.total > 0 ? 
                `${Math.round(entry.accuracy)}% accuracy • ${entry.avgTime.toFixed(1)}s avg` : 
                'No answers yet'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-cyber-blue tabular-nums">
              {entry.score}
            </div>
            <div className="text-xs text-gray-500">
              {entry.correct}/{entry.total} correct
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
