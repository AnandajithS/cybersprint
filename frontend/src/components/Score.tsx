interface ScoreProps {
  score: number;
}

export default function Score({ score }: ScoreProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">Score</span>
      <span className="text-xl font-bold text-cyber-green tabular-nums">
        {score}
      </span>
    </div>
  );
}
