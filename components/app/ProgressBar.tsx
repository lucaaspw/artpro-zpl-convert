import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";

export function ProgressBar({ progress }: { progress: number }) {
  return (
    <Progress value={progress} className="w-full">
      <ProgressLabel>Processando conversão</ProgressLabel>
      <ProgressValue>
        {() => `${Math.round(progress)}%`}
      </ProgressValue>
    </Progress>
  );
}
