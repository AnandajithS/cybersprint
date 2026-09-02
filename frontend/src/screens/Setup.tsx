import { useState } from 'react';

interface SetupProps {
  onStart: (teamName: string) => void;
}

export default function Setup({ onStart }: SetupProps) {
  const [teamName, setTeamName] = useState('');
  const [isStarting, setIsStarting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teamName.trim() && !isStarting) {
      setIsStarting(true);
      onStart(teamName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-gray-900 to-cyber-dark flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block p-4 rounded-2xl bg-cyber-blue/10 mb-4">
            <span className="text-6xl">🛡️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Cyber<span className="text-cyber-blue">Sprint</span>
          </h1>
          <p className="text-gray-400 text-lg">Think Before You Click</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 animate-scale-in">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            Team Registration
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-300 mb-2">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Cyber Ninjas"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyber-blue focus:border-transparent transition-all"
                maxLength={30}
                disabled={isStarting}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!teamName.trim() || isStarting}
              className="w-full py-4 bg-gradient-to-r from-cyber-blue to-cyan-500 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-cyber-blue transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isStarting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Starting Game...
                </span>
              ) : (
                'Start Game'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>


                <div className="text-2xl mb-1">⏱️</div>
                <div className="text-gray-400">10 Minutes</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-gray-400">30+ Scenarios</div>
              </div>
              <div>
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-gray-400">Live Ranking</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500 text-sm animate-fade-in">
          <p>A cybersecurity awareness game for students</p>
        </div>
      </div>
    </div>
  );
}
