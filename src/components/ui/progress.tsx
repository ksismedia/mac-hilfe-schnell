
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Bestimme CSS-Klasse basierend auf Wert - nutzt die in index.css definierten Klassen
  const getColorClass = (val: number) => {
    if (val === 0 || val <= 20) return 'progress-score-0-20'; // 0-20% dunkelrot
    if (val <= 40) return 'progress-score-20-40'; // 21-40% rot
    if (val <= 60) return 'progress-score-40-60'; // 41-60% orange
    if (val <= 80) return 'progress-score-60-80'; // 61-80% grün  
    return 'progress-score-80-100'; // 81-100% gelb
  };

  const numValue = Number(value) || 0;
  console.log('Progress value:', numValue, 'Color class:', getColorClass(numValue));

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full transition-all rounded-full",
          getColorClass(numValue)
        )}
        style={{ 
          width: `${numValue}%`
        }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
