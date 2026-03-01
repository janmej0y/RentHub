import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="h-10 w-1/3" />
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-72 w-full md:col-span-2" />
      </div>
    </div>
  );
}

