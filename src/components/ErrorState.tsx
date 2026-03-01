import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
        <div className="space-y-2">
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {onRetry ? (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

