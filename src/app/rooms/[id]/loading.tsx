import { Skeleton } from '@/components/ui/skeleton';

export default function RoomDetailsLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <Skeleton className="mb-6 h-10 w-40" />
      <Skeleton className="h-[360px] w-full rounded-lg" />
      <Skeleton className="mt-6 h-40 w-full rounded-lg" />
    </div>
  );
}

