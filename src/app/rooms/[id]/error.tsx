'use client';

import { ErrorState } from '@/components/ErrorState';

export default function RoomDetailsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <ErrorState
        title="Unable to load room details"
        description="Please retry. If this continues, open another property and return."
        onRetry={reset}
      />
    </div>
  );
}

