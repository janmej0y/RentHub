import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-14 w-full rounded-xl" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="space-y-3">
            <Skeleton className="h-52 w-full rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

