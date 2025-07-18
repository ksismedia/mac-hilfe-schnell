
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const getProgressColor = (value: number) => {
  // Explizite Logik: 0-60% = ROT, 61-80% = GRÜN, 81-100% = GELB
  const numValue = Number(value) || 0;
  console.log('PROGRESS DEBUG:', numValue, numValue <= 60 ? 'RED' : numValue <= 80 ? 'GREEN' : 'YELLOW');
  
  if (numValue === 0 || numValue <= 60) {
    return '#ef4444'; // ROT für 0-60%
  } else if (numValue <= 80) {
    return '#22c55e'; // GRÜN für 61-80%  
  } else {
    return '#fbbf24'; // GELB für 81-100%
  }
};

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Debug: Force re-render
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    forceUpdate();
  }, [value]);

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
        className="h-full transition-all rounded-full"
        style={{ 
          width: `${value ?? 0}%`,
          backgroundColor: `${getProgressColor(value ?? 0)} !important`,
          background: `${getProgressColor(value ?? 0)} !important`
        }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
