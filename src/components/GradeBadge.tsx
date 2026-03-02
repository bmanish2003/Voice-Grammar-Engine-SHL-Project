import { Badge } from "@/components/ui/badge";

interface GradeBadgeProps {
  grade: string;
}

const GradeBadge = ({ grade }: GradeBadgeProps) => {
  const getVariantClasses = () => {
    switch (grade) {
      case "Excellent":
        return "bg-success/15 text-success border-success/30";
      case "Good":
        return "bg-primary/15 text-primary border-primary/30";
      case "Average":
        return "bg-warning/15 text-warning border-warning/30";
      case "Poor":
        return "bg-destructive/15 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold tracking-wide uppercase ${getVariantClasses()}`}>
      {grade}
    </span>
  );
};

export default GradeBadge;
