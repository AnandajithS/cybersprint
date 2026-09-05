import { useState } from 'react';
import { GameState } from '../game/types';
import { getHealthColor, getHealthBarColor } from '../game/gameState';
import Timer from '../components/Timer';
import Score from '../components/Score';
import Leaderboard from '../components/Leaderboard';
import ScenarioDisplay from '../components/ScenarioDisplay';

interface GameProps {
  state: GameState;
  onAction: (actionId: string) => void;
  onEndGame: () => void;
}

export default function Game({ state, onAction, onEndGame }: GameProps) {
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!state.currentScenario) {
    return (
      <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading next scenario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cyber-dark">
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">
                Cyber<span className="text-cyber-blue">Sprint</span>
              </h1>
              {state.team && (
                <span className="text-sm text-gray-400 hidden sm:inline">
                  {state.team.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-6">
              <Score score={state.score} />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">🛡️</span>
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${getHealthBarColor(state.health)}`}
                    style={{ width: `${state.health}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getHealthColor(state.health)}`}>
                  {state.health}%
                </span>
              </div>

              <Timer 
                timeRemaining={state.timeRemaining} 
                totalTime={300}
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLeaderboard(!showLeaderboard)}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Leaderboard"
                >
                  🏆
                </button>
                <button
                  onClick={handleFullscreen}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Fullscreen"
                >
                  ⛶
                </button>
                <button
                  onClick={onEndGame}
                  className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
                >
                  End Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4" onClick={() => setShowLeaderboard(false)}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Leaderboard</h2>
              <button onClick={() => setShowLeaderboard(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>
            <Leaderboard entries={state.leaderboard} />
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ScenarioDisplay
              scenario={state.currentScenario}
              onAction={onAction}
              disabled={state.showFeedback}
              showFeedback={state.showFeedback}
              lastAnswer={state.lastAnswer}
            />
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Activity</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
                {state.team?.answeredIds.size === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">
                    No scenarios answered yet
                  </p>
                )}
                {state.leaderboard.find(e => e.teamId === state.team?.id) && (
                  <div className="text-center py-2">
                    <span className="text-cyber-blue font-medium">
                      Your Position: #{state.leaderboard.find(e => e.teamId === state.team?.id)?.rank || '-'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-400 mb-3">Game Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Answered</span>
                  <span className="text-white">{state.team?.totalAnswers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Perfect</span>
                  <span className="text-cyber-green">{state.team?.correctAnswers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Good instinct</span>
                  <span className="text-cyber-yellow">{state.team?.acceptableAnswers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="text-white">
                    {state.team?.totalAnswers ? 
                      Math.round(((state.team.correctAnswers + state.team.acceptableAnswers) / state.team.totalAnswers) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyber-blue/10 to-cyan-500/10 rounded-xl p-4 border border-cyber-blue/20">
              <h3 className="text-sm font-medium text-cyber-blue mb-2">💡 Tip</h3>
              <p className="text-sm text-gray-300">
                {state.health < 50 
                  ? "Your security is low! Be more careful with your decisions."
                  : state.score > 100 
                    ? "Great job! Keep making smart security decisions."
                    : "Think before you click. Verify suspicious requests!"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
