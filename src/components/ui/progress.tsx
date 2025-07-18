
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Bestimme Farbe basierend auf Wert
  const getColorClass = (val: number) => {
    if (val <= 60) return 'bg-red-500'; // 0-60% rot
    if (val <= 80) return 'bg-green-500'; // 61-80% grün  
    return 'bg-yellow-500'; // 81-100% gelb
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
