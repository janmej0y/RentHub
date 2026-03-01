'use client';

import { ErrorState } from '@/components/ErrorState';

export default function MyBookingsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <ErrorState
        title="Could not load bookings"
        description="We failed to fetch your booking list."
        onRetry={reset}
      />
    </div>
  );
}

