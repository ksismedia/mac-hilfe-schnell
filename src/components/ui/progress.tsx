
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 transition-all relative overflow-hidden rounded-full"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: `linear-gradient(90deg, 
          #dc2626 0%,     /* rot bei 0% */
          #f59e0b 40%,    /* orange bei 40% */
          #eab308 70%,    /* gelb bei 70% */
          #fbbf24 100%    /* gold bei 100% */
        )`
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
