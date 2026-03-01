import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border/80 bg-card/80 p-10 text-center">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

