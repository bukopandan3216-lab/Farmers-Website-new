import { Skeleton } from "./ui/skeleton";

export interface LoadingSkeletonProps {
  count?: number;
  type?: "product" | "store" | "review" | "card";
}

export function LoadingSkeleton({
  count = 6,
  type = "product",
}: LoadingSkeletonProps) {
  const skeletonClass =
    "bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-400 animate-pulse";

  if (type === "product") {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className={`${skeletonClass} h-48 w-full rounded-lg`} />
            <Skeleton className={`${skeletonClass} h-4 w-3/4 rounded`} />
            <Skeleton className={`${skeletonClass} h-4 w-1/2 rounded`} />
            <Skeleton className={`${skeletonClass} h-10 w-full rounded`} />
          </div>
        ))}
      </div>
    );
  }

  if (type === "store") {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className={`${skeletonClass} h-24 w-full rounded-lg`} />
            <Skeleton className={`${skeletonClass} h-4 w-3/4 rounded`} />
            <Skeleton className={`${skeletonClass} h-4 w-1/2 rounded`} />
            <div className="flex gap-2">
              <Skeleton className={`${skeletonClass} h-10 flex-1 rounded`} />
              <Skeleton className={`${skeletonClass} h-10 w-10 rounded`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "review") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2 p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className={`${skeletonClass} h-10 w-10 rounded-full`} />
              <div className="flex-1 space-y-1">
                <Skeleton className={`${skeletonClass} h-4 w-1/3 rounded`} />
                <Skeleton className={`${skeletonClass} h-3 w-1/4 rounded`} />
              </div>
            </div>
            <Skeleton className={`${skeletonClass} h-4 w-full rounded`} />
            <Skeleton className={`${skeletonClass} h-4 w-2/3 rounded`} />
          </div>
        ))}
      </div>
    );
  }

  // card type
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={`${skeletonClass} h-24 w-full rounded-lg`}
        />
      ))}
    </div>
  );
}
