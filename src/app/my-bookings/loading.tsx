import { Skeleton } from '@/components/ui/skeleton';

export default function MyBookingsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="mb-8 h-10 w-1/3" />
      <div className="space-y-4">
        <Skeleton className="h-36 w-full" />
        <Skeleton className="h-36 w-full" />
      </div>
    </div>
  );
}

