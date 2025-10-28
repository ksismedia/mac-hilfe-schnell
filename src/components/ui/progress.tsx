
import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value = 0, ...props }, ref) => {
  const percentage = Math.max(0, Math.min(100, Number(value) || 0));
  
  const getBarColor = (val: number): string => {
    if (val <= 60) return 'bg-red-500'; // ROT für 0-60%
    if (val <= 89) return 'bg-green-500'; // GRÜN für 61-89%  
    return 'bg-yellow-500'; // GELB für 90-100%
  };

  // Text color for contrast
  const getTextColor = (val: number): string => {
    if (val <= 60) return 'text-white'; // Weiß auf rot
    if (val <= 89) return 'text-white'; // Weiß auf grün
    return 'text-white'; // Weiß auf gelb für besseren Kontrast
  };

  // Debug logging
  React.useEffect(() => {
    console.log(`🔴 PROGRESS DEBUG: ${percentage}% -> ${getBarColor(percentage)}`);
  }, [percentage]);

  return (
    <div
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-gray-200", className)}
      {...props}
    >
      <div 
        className={cn("h-full transition-all duration-300 rounded-full flex items-center justify-center", getBarColor(percentage))}
        style={{ width: `${percentage}%` }}
      >
        {percentage > 0 && (
          <span className={cn("text-[11px] font-bold leading-none", getTextColor(percentage))}>
            {percentage}%
          </span>
        )}
      </div>
    </div>
  );
})

Progress.displayName = "Progress"
export { Progress }
