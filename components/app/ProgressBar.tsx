import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <Progress value={progress} className="w-full">
      <ProgressLabel>Processando conversao</ProgressLabel>
      <ProgressValue>{Math.round(progress)}%</ProgressValue>
    </Progress>
  );
}
