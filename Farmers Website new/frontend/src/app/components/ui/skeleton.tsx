import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-400 animate-pulse rounded-md shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
