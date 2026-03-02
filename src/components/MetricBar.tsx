interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  unit?: string;
}

const MetricBar = ({ label, value, max, unit }: MetricBarProps) => {
  const percentage = Math.min(100, (value / max) * 100);

  const getBarColor = () => {
    const ratio = value / max;
    if (ratio >= 0.8) return "bg-success";
    if (ratio >= 0.5) return "bg-primary";
    if (ratio >= 0.3) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-mono font-semibold text-foreground">
          {value}{unit ? unit : `/${max}`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default MetricBar;
