import { GameState } from '../game/types';
import Leaderboard from '../components/Leaderboard';

interface ResultsProps {
  state: GameState;
  onPlayAgain: () => void;
}

export default function Results({ state, onPlayAgain }: ResultsProps) {
  const teamStats = state.team;
  const accuracy = teamStats?.totalAnswers 
    ? Math.round(((teamStats.correctAnswers + teamStats.acceptableAnswers) / teamStats.totalAnswers) * 100)
    : 0;
  const avgTime = teamStats?.totalAnswers
    ? (teamStats.totalResponseTime / teamStats.totalAnswers)
    : 0;
  
  const myRank = state.leaderboard.findIndex(e => e.teamId === teamStats?.id) + 1;

  const strengths: string[] = [];
  const watchOuts: string[] = [];

  if (accuracy >= 80) strengths.push('Phishing detection');
  if (accuracy >= 70) strengths.push('Password safety');
  if (avgTime <= 5) strengths.push('Quick decision making');
  if (!strengths.length) strengths.push('Getting started');

  if (accuracy < 60) watchOuts.push('Phishing');
  if (accuracy < 70) watchOuts.push('Social engineering');
  if (avgTime > 10) watchOuts.push('Response speed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-cyber-dark py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-2">
            <span className="text-cyber-red">GAME</span> <span className="text-cyber-blue">OVER</span>
          </h1>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mb-6 animate-slide-in">
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">🏆</div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {teamStats?.name || 'Your Team'}
            </h2>
            {myRank > 0 && (
              <span className="text-cyber-blue font-medium">
                #{myRank} on the leaderboard
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-8">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-cyber-blue">{state.score}</div>
              <div className="text-sm text-gray-400 mt-1">Score</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-white">{accuracy}%</div>
              <div className="text-sm text-gray-400 mt-1">Accuracy</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-white">
                {teamStats?.correctAnswers || 0}/{teamStats?.totalAnswers || 0}
              </div>
              <div className="text-sm text-gray-400 mt-1">Correct</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-white">{avgTime.toFixed(1)}s</div>
              <div className="text-sm text-gray-400 mt-1">Avg Time</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-cyber-green/10 rounded-lg p-4 border border-cyber-green/20">
              <h3 className="text-cyber-green font-semibold mb-3">✓ You did well at</h3>
              <ul className="space-y-2">
                {strengths.map((s, i) => (
                  <li key={i} className="text-gray-300 flex items-center gap-2">
                    <span className="text-cyber-green">✓</span> {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-cyber-yellow/10 rounded-lg p-4 border border-cyber-yellow/20">
              <h3 className="text-cyber-yellow font-semibold mb-3">⚠ Watch out for</h3>
              <ul className="space-y-2">
                {watchOuts.map((w, i) => (
                  <li key={i} className="text-gray-300 flex items-center gap-2">
                    <span className="text-cyber-yellow">⚠</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
            <h3 className="text-sm font-medium text-gray-400 mb-2">💡 Remember</h3>
            <p className="text-gray-300 text-sm">
              Stop → Think → Verify → Act
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Not everything is a scam, but always think before you click. Verify unexpected requests,
              never share OTPs, and trust your instincts when something feels off.
            </p>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 mb-6">
          <Leaderboard entries={state.leaderboard} />
        </div>

        <div className="text-center">
          <button
            onClick={onPlayAgain}
            className="px-8 py-3 bg-gradient-to-r from-cyber-blue to-cyan-500 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-cyber-blue transition-all transform hover:scale-[1.02]"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
}
