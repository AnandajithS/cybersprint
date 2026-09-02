interface TimerProps {
  timeRemaining: number;
  totalTime: number;
}

export default function Timer({ timeRemaining, totalTime }: TimerProps) {
  const format = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = (timeRemaining / totalTime) * 100;
  const isUrgent = timeRemaining < 60;
  const isWarning = timeRemaining < 180;

  const colorClass = isUrgent 
    ? 'text-cyber-red animate-pulse' 
    : isWarning 
      ? 'text-cyber-yellow' 
      : 'text-cyber-blue';

  return (
    <div className="flex items-center gap-2">
      <span className={`text-xl font-bold tabular-nums ${colorClass}`}>
        {format(timeRemaining)}
      </span>
      <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isUrgent ? 'bg-cyber-red' : isWarning ? 'bg-cyber-yellow' : 'bg-cyber-blue'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
