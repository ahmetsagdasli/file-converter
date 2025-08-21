import { Progress } from "@/components/ui/progress";

interface ProgressBarProps {
  value: number;
  text: string;
  className?: string;
}

export function ProgressBar({ value, text, className }: ProgressBarProps) {
  return (
    <div className={className}>
      <Progress value={value} className="mb-2" data-testid="progress-bar" />
      <div className="text-sm text-muted-foreground text-center" data-testid="progress-text">
        {text}
      </div>
    </div>
  );
}
