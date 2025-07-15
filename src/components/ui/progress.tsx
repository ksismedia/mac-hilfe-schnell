
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const getProgressColor = (value: number) => {
  if (value <= 20) {
    // 0-20%: Dunkelrot
    return '#CD0000';
  } else if (value <= 40) {
    // 20-40%: Rot
    return '#FF0000';
  } else if (value <= 60) {
    // 40-60%: Orange
    return '#FF4500';
  } else if (value <= 80) {
    // 60-80%: Grün
    return '#22c55e';
  } else {
    // 80-100%: Gelb
    return '#FFD700';
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
      className="h-full w-full flex-1 transition-all rounded-full"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: getProgressColor(value || 0)
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
