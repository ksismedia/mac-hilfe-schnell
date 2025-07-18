
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const getProgressColor = (value: number) => {
  // Exact boundaries: 0-60% rot, 61-80% grün, 81-100% gelb
  if (value >= 81) {
    return '#fbbf24'; // Gelb
  } else if (value >= 61) {
    return '#22c55e'; // Grün
  } else {
    return '#ef4444'; // Rot
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
