
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const getProgressColor = (value: number) => {
  if (value <= 20) {
    // 0-20%: Rot
    return `linear-gradient(90deg, #dc2626 0%, #dc2626 100%)`;
  } else if (value <= 40) {
    // 20-40%: Rot zu Orange
    const progress = ((value - 20) / 20) * 100;
    return `linear-gradient(90deg, #dc2626 0%, #ea580c ${progress}%)`;
  } else if (value <= 60) {
    // 40-60%: Orange zu Gelb
    const progress = ((value - 40) / 20) * 100;
    return `linear-gradient(90deg, #dc2626 0%, #ea580c 50%, #eab308 ${50 + progress/2}%)`;
  } else if (value <= 80) {
    // 60-80%: Gelb zu helles Gold
    const progress = ((value - 60) / 20) * 100;
    return `linear-gradient(90deg, #dc2626 0%, #ea580c 33%, #eab308 66%, #fbbf24 ${66 + progress/3}%)`;
  } else {
    // 80-100%: Knalliges Gold-Gradient mit leuchtenden Farben
    return `linear-gradient(90deg, #dc2626 0%, #ea580c 20%, #f59e0b 40%, #fbbf24 60%, #ffd700 80%, #ffed4a 100%)`;
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
