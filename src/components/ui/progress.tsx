
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const getProgressColor = (value: number) => {
  // Force browser to recognize change - 0-60%: Rot, 61-80%: Grün, 81-100%: Gelb
  const numValue = Number(value) || 0;
  
  if (numValue <= 60) {
    return '#ef4444'; // Explizit rot für 0-60%
  } else if (numValue <= 80) {
    return '#22c55e'; // Explizit grün für 61-80%  
  } else {
    return '#fbbf24'; // Explizit gelb für 81-100%
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
