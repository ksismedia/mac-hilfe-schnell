import * as React from "react"
import { cn } from "@/lib/utils"

interface AccessibilityProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

const AccessibilityProgress = React.forwardRef<HTMLDivElement, AccessibilityProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const percentage = Math.max(0, Math.min(100, Number(value) || 0));
    
    console.log('🟡 ACCESSIBILITY PROGRESS DEBUG:', { value, percentage });
    
    // Spezielle Compliance-basierte Farblogik für Barrierefreiheit
    const getBarColor = (val: number): string => {
      if (val >= 95) {
        console.log('🟡 Accessibility: YELLOW (>=95%)', val);
        return 'bg-yellow-500'; // Gelb: Vollständig konform (≥95%)
      }
      console.log('🔴 Accessibility: RED (<95%)', val);
      return 'bg-red-500'; // Rot: Nicht vollständig konform (<95%)
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

AccessibilityProgress.displayName = "AccessibilityProgress"
export { AccessibilityProgress }