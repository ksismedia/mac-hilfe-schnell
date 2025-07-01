
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const getProgressColor = (value: number) => {
  if (value <= 20) {
    // 0-20%: Reines Rot
    return `#dc2626`;
  } else if (value <= 40) {
    // 20-40%: Rot zu Dunkelorange
    const progress = (value - 20) / 20;
    return `linear-gradient(90deg, #dc2626 0%, #dc2626 ${(1-progress)*100}%, #ea580c ${progress*100}%)`;
  } else if (value <= 60) {
    // 40-60%: Orange zu Grün
    const progress = (value - 40) / 20;
    return `linear-gradient(90deg, #dc2626 0%, #ea580c 25%, #f59e0b ${50 + (1-progress)*25}%, #22c55e ${75 + progress*25}%)`;
  } else if (value <= 80) {
    // 60-80%: Grün zu Gold
    const progress = (value - 60) / 20;
    return `linear-gradient(90deg, #dc2626 0%, #ea580c 20%, #f59e0b 40%, #22c55e ${60 + (1-progress)*20}%, #ffd700 ${80 + progress*20}%)`;
  } else {
    // 80-100%: Volles Gold-Spektrum
    return `linear-gradient(90deg, #dc2626 0%, #ea580c 15%, #f59e0b 30%, #22c55e 45%, #ffd700 60%, #ffed4a 80%, #fbbf24 100%)`;
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
