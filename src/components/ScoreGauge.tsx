interface ScoreGaugeProps {
  score: number;
  size?: number;
}

const ScoreGauge = ({ score, size = 180 }: ScoreGaugeProps) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score <= 40) return "hsl(0, 72%, 51%)";
    if (score <= 60) return "hsl(38, 92%, 50%)";
    if (score <= 80) return "hsl(174, 72%, 46%)";
    return "hsl(152, 69%, 45%)";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(222, 30%, 18%)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${getColor()})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold font-mono text-foreground">{score}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
