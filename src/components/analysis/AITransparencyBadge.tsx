import { Badge } from '@/components/ui/badge';
import { Sparkles, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AITransparencyBadgeProps {
  aiModel?: string;
  confidenceScore?: number;
  tooltip?: string;
}

export const AITransparencyBadge = ({ 
  aiModel = 'AI-Analyse', 
  confidenceScore,
  tooltip = 'Diese Bewertung wurde durch AI-Algorithmen generiert und sollte manuell überprüft werden.'
}: AITransparencyBadgeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="gap-1 cursor-help">
            <Sparkles className="h-3 w-3" />
            <span className="text-xs">{aiModel}</span>
            {confidenceScore !== undefined && (
              <span className="text-xs ml-1">({confidenceScore}%)</span>
            )}
            <Info className="h-3 w-3 ml-1" />
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{tooltip}</p>
          {confidenceScore !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              Confidence Score: {confidenceScore}%
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
