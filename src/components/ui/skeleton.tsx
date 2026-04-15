import { cn } from "~/components/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-[--clr-surface-a10]", className)}
      {...props}
    />
  )
}

export { Skeleton }
