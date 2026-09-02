import { Scenario, Answer } from '../game/types';
import { getConsequenceMessage } from '../game/gameState';

interface ScenarioDisplayProps {
  scenario: Scenario;
  onAction: (actionId: string) => void;
  disabled: boolean;
  showFeedback: boolean;
  lastAnswer: Answer | null;
}

const typeStyles: Record<string, { icon: string; bg: string; border: string; label: string; desc: string }> = {
  email: {
    icon: '📧',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    label: 'Inbox',
    desc: 'New email received'
  },
  chat: {
    icon: '💬',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    label: 'Chat',
    desc: 'New message'
  },
  browser: {
    icon: '🌐',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    label: 'Browser',
    desc: 'Browser alert'
  },
  notification: {
    icon: '🔔',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    label: 'Notifications',
    desc: 'System notification'
  },
  qr: {
    icon: '📱',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    label: 'QR Code',
    desc: 'QR code detected'
  },
  usb: {
    icon: '💾',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Devices',
    desc: 'Device connected'
  },
};

export default function ScenarioDisplay({ 
  scenario, 
  onAction, 
  disabled, 
  showFeedback, 
  lastAnswer 
}: ScenarioDisplayProps) {
  const styles = typeStyles[scenario.type] || typeStyles.email;

  const handleAction = (actionId: string) => {
    onAction(actionId);
  };

  const renderContent = () => {
    switch (scenario.type) {
      case 'email':
        return (
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
                📧
              </div>
              <div>
                <div className="text-white font-medium">{scenario.title}</div>
                <div className="text-gray-500 text-sm">From: {scenario.sender || 'Unknown'}</div>
              </div>
            </div>
            <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-700">
              <div className="text-xs text-gray-500 mb-2">
                {scenario.metadata?.subject ? `Subject: ${scenario.metadata.subject}` : 'Message'}
              </div>
              <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{scenario.content}</p>
            </div>
          </div>
        );
      
      case 'chat':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-lg">
                {scenario.sender?.charAt(0) || '?'}
              </div>
              <div>
                <div className="text-white font-medium">{scenario.sender || 'Unknown'}</div>
                <div className="text-gray-500 text-xs">{scenario.metadata?.platform || 'Chat'}</div>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-gray-700/70 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]">
                <p className="text-gray-100 leading-relaxed">{scenario.content}</p>
                <div className="text-[10px] text-gray-500 mt-1 text-right">now</div>
              </div>
            </div>
          </div>
        );
      
      case 'browser':
        return (
          <div className="space-y-3">
            <div className="bg-gray-900/80 rounded-t-lg px-3 py-2 flex items-center gap-2 border-b border-gray-700">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div className="ml-2 flex-1 bg-gray-800 rounded px-3 py-1 text-sm text-gray-400 truncate">
                🔒 {scenario.metadata?.url || scenario.title}
              </div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-gray-700">
              <p className="text-gray-200 leading-relaxed">{scenario.content}</p>
            </div>
          </div>
        );
      
      case 'notification':
        return (
          <div className="space-y-3">
            <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-600">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${styles.bg} flex items-center justify-center text-xl`}>
                  {scenario.sender === 'System' || scenario.sender === 'Settings' || scenario.sender === 'Network' ? '⚙️' : '🔔'}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium">{scenario.title}</div>
                      <div className="text-gray-500 text-xs">{scenario.sender || 'System'}</div>
                    </div>
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-800 rounded">
                      {scenario.metadata?.priority || 'Info'}
                    </span>
                  </div>
                  <div className="mt-3 bg-black/30 rounded-lg p-3">
                    <p className="text-gray-200 text-sm leading-relaxed">{scenario.content}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'qr':
        return (
          <div className="space-y-3">
            <div className="bg-gray-900/80 rounded-xl p-4 border border-gray-600 text-center">
              <div className="text-6xl mb-3 animate-pulse-slow">{styles.icon}</div>
              <div className="bg-white p-3 rounded inline-block mb-3">
                <div className="grid grid-cols-5 gap-0.5 w-24 h-24">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div key={i} className={Math.sin(i * 7) > 0 ? 'bg-black' : 'bg-transparent'} style={{ width: '100%', height: '100%' }}></div>
                  ))}
                </div>
              </div>
              <p className="text-white font-medium mb-2">{scenario.title}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{scenario.content}</p>
              {scenario.metadata?.url && (
                <div className="mt-2 text-xs text-gray-500">
                  <div className="bg-gray-800 rounded px-3 py-1.5 inline-block">
                    URL: {scenario.metadata.url}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'usb':
        return (
          <div className="space-y-3">
            <div className="bg-gray-900/80 rounded-xl p-4 border border-red-500/30 animate-pulse-red">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg red-500/10 flex items-center justify-center text-2xl">
                  💾
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">New Device Detected</div>
                  <div className="text-gray-400 text-sm">{scenario.metadata?.deviceName || 'Unknown'}</div>
                </div>
                <div className="text-xs text-red-400 bg-red-500/10 px-3 py-1 rounded">
                  USB Device
                </div>
              </div>
              <div className="mt-3 bg-black/30 rounded-lg p-3">
                <p className="text-gray-200 text-sm leading-relaxed">{scenario.content}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-900/70 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-200 leading-relaxed">{scenario.content}</p>
          </div>
        );
    }
  };

  const getActionColors = (actionId: string) => {
    const base = "px-4 py-2 rounded-lg font-medium text-sm transition-all transform hover:scale-105 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed";
    switch (actionId) {
      case 'open':
        return `${base} bg-cyber-green/20 text-cyber-green border border-cyber-green/30 hover:bg-cyber-green/30`;
      case 'ignore':
        return `${base} bg-gray-600/20 text-gray-300 border border-gray-500/30 hover:bg-gray-600/30`;
      case 'verify':
        return `${base} bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30 hover:bg-cyber-blue/30`;
      case 'report':
        return `${base} bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30`;
      case 'block':
        return `${base} bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30`;
      default:
        return `${base} bg-gray-600/20 text-gray-300 border border-gray-500/30`;
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
      <div className={`px-4 py-3 border-b border-gray-700/50 flex items-center gap-3 ${styles.bg}`}>
        <div className={`w-10 h-10 rounded-full bg-gray-900/50 flex items-center justify-center text-xl ${styles.border} border`}>
          {styles.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-medium">{scenario.title}</div>
              <div className="text-gray-400 text-xs">
                {styles.label} • {scenario.difficulty === 1 ? 'Easy' : scenario.difficulty === 2 ? 'Medium' : 'Hard'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-yellow-400">
                {Array.from({ length: scenario.difficulty }).map((_, i) => (
                  <span key={i} className="text-xs">★</span>
                ))}
              </div>
              <div className="text-sm text-cyber-green font-mono">+{scenario.points} pts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 animate-fade-in" key={scenario.id}>
        {renderContent()}
      </div>

      <div className="px-6 pb-6">
        {showFeedback && lastAnswer ? (
          (() => {
            const v = lastAnswer.verdict;
            const isPerfect = v === 'perfect';
            const isAcceptable = v === 'acceptable';
            const icon = isPerfect ? '✓' : isAcceptable ? '✓' : '✗';
            const title = isPerfect ? 'Good decision!' : isAcceptable ? 'Good instincts!' : 'Risky decision!';
            const color = isPerfect ? 'text-cyber-green' : isAcceptable ? 'text-cyber-yellow' : 'text-cyber-red';
            const bg = isPerfect ? 'bg-cyber-green/10 border-cyber-green/30' : isAcceptable ? 'bg-cyber-yellow/10 border-cyber-yellow/30' : 'bg-cyber-red/10 border-cyber-red/30';
            return (
              <div className={`rounded-xl p-4 mb-4 animate-scale-in border ${bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-2xl ${color}`}>{icon}</span>
                  <span className={`font-semibold ${color}`}>{title}</span>
                  <span className={`text-sm font-medium ml-auto ${color}`}>
                    {lastAnswer.pointsEarned > 0 ? '+' : ''}{lastAnswer.pointsEarned} pts
                  </span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{lastAnswer.explanation}</p>
                {isAcceptable && (
                  <p className="mt-2 text-cyber-yellow text-sm">
                    ✓ Reasonable choice — but the ideal response was <span className="font-medium">{scenario.actions.find(a => a.id === scenario.correctAction)?.label || scenario.correctAction}</span>.
                  </p>
                )}
                {lastAnswer.consequence && (
                  <div className="mt-2 text-cyber-yellow text-sm">
                    {getConsequenceMessage(lastAnswer.consequence)}
                  </div>
                )}
              </div>
            );
          })()
        ) : (
          <div className="flex flex-wrap gap-2 mb-4">
            {scenario.actions.map((action) => (
              <button
                key={action.id}
                onClick={() => handleAction(action.id)}
                disabled={disabled}
                className={getActionColors(action.id)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
