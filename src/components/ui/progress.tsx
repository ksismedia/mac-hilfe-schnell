
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  // Force a unique key to prevent caching
  const [uniqueKey] = React.useState(() => Math.random().toString(36));
  
  // Simple color logic for 0-60% red
  const getProgressStyle = (val: number): React.CSSProperties => {
    const numVal = Number(val) || 0;
    
    let backgroundColor: string;
    if (numVal <= 60) {
      backgroundColor = '#ef4444'; // Red for 0-60%
    } else if (numVal <= 80) {
      backgroundColor = '#22c55e'; // Green for 61-80%
    } else {
      backgroundColor = '#fbbf24'; // Yellow for 81-100%
    }
    
    // Force style with key
    console.log(`[${uniqueKey}] Progress: ${numVal}% = ${backgroundColor}`);
    
    return {
      width: `${numVal}%`,
      backgroundColor,
      height: '100%',
      borderRadius: 'inherit',
      transition: 'all 0.3s ease'
    };
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div style={getProgressStyle(value ?? 0)} />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName
export { Progress }
