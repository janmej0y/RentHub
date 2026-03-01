'use client';

import { ErrorState } from '@/components/ErrorState';

export default function ProfileError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <ErrorState
        title="Could not load profile"
        description="There was an error loading your profile information."
        onRetry={reset}
      />
    </div>
  );
}

