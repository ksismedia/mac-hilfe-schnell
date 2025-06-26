
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const getProgressColor = (value: number) => {
  if (value <= 25) {
    // 0-25%: Rot zu Orange
    return `linear-gradient(90deg, #dc2626 0%, #f59e0b ${(value/25) * 100}%)`;
  } else if (value <= 50) {
    // 25-50%: Orange zu Gelb
    const progress = ((value - 25) / 25) * 100;
    return `linear-gradient(90deg, #dc2626 0%, #f59e0b 50%, #eab308 ${50 + progress/2}%)`;
  } else if (value <= 75) {
    // 50-75%: Gelb zu helles Gold
    const progress = ((value - 50) / 25) * 100;
    return `linear-gradient(90deg, #dc2626 0%, #f59e0b 25%, #eab308 50%, #fbbf24 ${75 + progress/4}%)`;
  } else {
    // 75-100%: Volles Gold-Gradient
    return `linear-gradient(90deg, #dc2626 0%, #f59e0b 25%, #eab308 50%, #fbbf24 100%)`;
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
      className="h-full w-full flex-1 transition-all relative overflow-hidden rounded-full"
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
        background: getProgressColor(value || 0)
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
