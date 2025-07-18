
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const getProgressColor = (value: number) => {
  console.log('Progress value:', value, 'Color logic check:', value <= 60, value >= 61 && value <= 80, value >= 81);
  // 0-60%: Rot, 61-80%: Grün, 81-100%: Gelb
  if (value <= 60) {
    return 'hsl(var(--progress-red))'; // Rot
  } else if (value <= 80) {
    return 'hsl(var(--progress-green))'; // Grün  
  } else {
    return 'hsl(var(--progress-yellow))'; // Gelb
  }
};

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
      className="h-full transition-all rounded-full"
      style={{ 
        width: `${value ?? 0}%`,
        background: getProgressColor(value ?? 0)
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
