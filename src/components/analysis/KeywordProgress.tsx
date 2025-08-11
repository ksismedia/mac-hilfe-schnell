import * as React from "react"
import { cn } from "@/lib/utils"

interface KeywordProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const KeywordProgress = React.forwardRef<HTMLDivElement, KeywordProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const percentage = Math.max(0, Math.min(100, Number(value) || 0));
    
    console.log('🎯 KEYWORD PROGRESS DEBUG:', { originalValue: value, percentage });
    
    // Standard Score-basierte Farblogik für Keywords
    const getBarColor = (val: number): string => {
      if (val <= 60) return 'bg-red-500'; // Rot für 0-60%
      if (val <= 80) return 'bg-green-500'; // Grün für 61-80%
      return 'bg-yellow-500'; // Gelb für 81-100%
    };

    const getTextColor = (): string => {
      return 'text-white'; // Weiß für besseren Kontrast
    };

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
            <span className={cn("text-xs font-medium", getTextColor())}>
              {percentage}%
            </span>
          )}
        </div>
      </div>
    );
  }
)

KeywordProgress.displayName = "KeywordProgress"
export { KeywordProgress }