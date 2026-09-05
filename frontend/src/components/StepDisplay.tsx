import { Step, Action } from '../game/types';
import qrCode from '../assets/qr_code.jpeg';

interface StepDisplayProps {
  step: Step;
  onAction: (action: Action) => void;
}

function getIcon(type: Step['type']): string {
  switch (type) {
    case 'chat': return '💬';
    case 'browser': return '🌐';
    case 'notification': return '🔔';
    case 'qr': return '📱';
    case 'file': return '📁';
    case 'sms': return '📩';
    case 'email': return '📧';
    default: return '📨';
  }
}

function getSenderAvatar(origin: string | undefined): string {
  return (origin || '?').charAt(0).toUpperCase();
}

function renderMessage(type: Step['type'], step: Step) {
  const deco = 'text-2xl sm:text-3xl mb-3';

  switch (type) {
    case 'chat':
      return (
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-2xl shrink-0">
            {getSenderAvatar(step.origin)}
          </div>
          <div className="min-w-0">
            <div className="text-white font-bold text-2xl">{step.origin || 'Unknown'}</div>
            <div className="text-gray-400 text-sm">{step.time}</div>
          </div>
        </div>
      );

    case 'browser':
      return (
        <div className="mb-3">
          <div className="flex items-center gap-2 bg-gray-900 rounded-t-xl border border-gray-600 px-3 py-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 flex-1 bg-gray-800 rounded px-3 py-1 text-cyber-blue text-sm truncate">
              🔒 {step.origin || step.title}
            </span>
          </div>
        </div>
      );

    case 'notification':
      return (
        <div className="mb-2">
          <div className="inline-flex items-center gap-2 bg-gray-700/40 rounded-full px-3 py-1 text-sm text-gray-300">
            <span className={`text-xl ${deco.replace('mb-3', '')}`}>{getIcon(type)}</span>
            {step.origin || step.title} · {step.time}
          </div>
        </div>
      );

    case 'qr':
      return (
        <div className="flex items-center justify-center mb-3">
          <div className="bg-white rounded-xl p-3">
            <img src={qrCode} alt="QR code" className="w-40 h-40 object-contain" />
          </div>
        </div>
      );

    case 'file':
      return (
        <div className="mb-3">
          <div className="inline-flex items-center gap-3 bg-gray-700/40 rounded-xl px-4 py-3 border border-gray-600">
            <span className="text-3xl">📎</span>
            <div>
              <div className="text-cyber-blue font-medium">{step.origin || step.title}</div>
              <div className="text-gray-400 text-xs">1.2 MB · received {step.time}</div>
            </div>
          </div>
        </div>
      );

    case 'sms':
      return (
        <div className="mb-2">
          <div className="inline-flex items-center gap-2 text-sm text-gray-300">
            <span className="text-xl">{getIcon(type)}</span>
            <span className="font-medium text-white">{step.origin || step.title}</span>
            <span className="text-gray-500">{step.time}</span>
          </div>
        </div>
      );

    case 'email':
      return (
        <div className="mb-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl shrink-0">
              {getSenderAvatar(step.origin)}
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold text-2xl leading-tight">{step.title}</div>
              <div className="text-gray-400 text-sm">From: {step.origin}</div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

const toneForLabel = (label: string): string => {
  const lower = label.toLowerCase();

  const dangerWords = [
    'open', 'enter', 'claim', 'log in', 'login', 'type your', 'click', 'verify now',
    'install', 'download', 'pay', 'send the money', 'send more', 'enter details', 'enter your',
    'share', 'ask aarav for his password', 'hide it',
  ];
  const safeWords = [
    'report', 'ask', 'check', 'verify', 'call', 'write the password', 'tell', 'warn',
    'ignore', 'skip', 'close', 'stop', 'realize', 'asked', 'official', 'teacher', 'school', 'it',
    'change password', 'warn your', 'report aarav',
  ];

  if (dangerWords.some((w) => lower.includes(w))) return 'danger';
  if (safeWords.some((w) => lower.includes(w))) return 'safe';
  return 'neutral';
};

const actionStyles: Record<string, string> = {
  danger:
    'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-300 border-red-500/40 hover:from-red-500/30 hover:to-red-500/20 hover:border-red-400 hover:text-white',
  safe:
    'bg-gradient-to-r from-cyber-green/20 to-cyber-green/10 text-cyber-green border-cyber-green/40 hover:from-cyber-green/30 hover:to-cyber-green/20 hover:border-cyber-green hover:text-white',
  neutral:
    'bg-gradient-to-r from-gray-600/30 to-gray-600/15 text-gray-200 border-gray-500/40 hover:from-gray-600/50 hover:to-gray-600/30 hover:text-white',
};

export default function StepDisplay({ step, onAction }: StepDisplayProps) {
  const isResult = step.type === 'result' || step.actions.length === 0;

  if (isResult) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 sm:p-12 text-center animate-scale-in">
        <div className="text-5xl mb-4">{getIcon(step.type)}</div>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
          {step.title}
        </h2>
        <p className="text-2xl sm:text-3xl text-gray-200 leading-relaxed max-w-3xl mx-auto">
          {step.content}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm rounded-3xl border border-gray-700/50 overflow-hidden">
      <div className="px-6 sm:px-10 pt-6 sm:pt-8 animate-fade-in" key={step.id}>
        <div className="mb-4">
          <span className="inline-flex items-center gap-2 text-cyber-blue font-semibold text-lg sm:text-xl">
            <span className="text-3xl">{getIcon(step.type)}</span>
            {step.title}
          </span>
        </div>

        {renderMessage(step.type, step)}

        <div className="bg-gray-900/70 rounded-2xl border border-gray-700 p-6 sm:p-8 mb-8">
          <p className="text-white text-2xl sm:text-3xl leading-relaxed whitespace-pre-wrap">
            {step.content}
          </p>
        </div>

        <div className="mb-8">
          <div className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            {step.question || 'What should I do?'}
          </div>
          <div className="text-xl text-cyber-blue font-medium">🎤 Ask the audience!</div>
        </div>
      </div>

      <div className="px-6 sm:px-10 pb-8 sm:pb-10">
        <div className="grid sm:grid-cols-2 gap-4">
          {step.actions.map((action) => (
            <button
              key={action.id}
              onClick={() => onAction(action)}
              className={`px-6 py-5 rounded-2xl border text-left text-2xl font-bold transition-all transform hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-cyber-blue/40 ${actionStyles[toneForLabel(action.label)]}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}