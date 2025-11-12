import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { useAnalysisContext } from '@/contexts/AnalysisContext';

interface AIReviewCheckboxProps {
  categoryName: string;
  isReviewed: boolean;
  onReviewChange: (reviewed: boolean) => void;
  reviewerName?: string;
}

export const AIReviewCheckbox = ({ 
  categoryName, 
  isReviewed, 
  onReviewChange,
  reviewerName 
}: AIReviewCheckboxProps) => {
  const [localReviewed, setLocalReviewed] = useState(isReviewed);
  const { currentAnalysis } = useAnalysisContext();

  const handleChange = (checked: boolean) => {
    setLocalReviewed(checked);
    onReviewChange(checked);
  };

  return (
    <div className="mt-4 p-3 border rounded-lg bg-muted/30">
      {!currentAnalysis && (
        <Alert className="mb-3 bg-orange-500/10 border-orange-500">
          <Save className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Hinweis:</strong> Bitte speichern Sie die Analyse zuerst, damit KI-VO Bestätigungen persistent gespeichert werden können.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex items-start space-x-3">
        <Checkbox 
          id={`review-${categoryName}`}
          checked={localReviewed}
          onCheckedChange={handleChange}
        />
        <div className="flex-1">
          <Label 
            htmlFor={`review-${categoryName}`} 
            className="text-sm font-semibold cursor-pointer flex items-center gap-2"
          >
            {localReviewed ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-500" />
            )}
            <span>
              {localReviewed 
                ? `✓ ${categoryName} manuell geprüft` 
                : `${categoryName} noch nicht geprüft`}
            </span>
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            {localReviewed 
              ? `Diese AI-Bewertung wurde überprüft und freigegeben${reviewerName ? ` von ${reviewerName}` : ''}.`
              : 'Bitte überprüfen Sie die AI-generierten Inhalte manuell, bevor Sie diese an Kunden weitergeben. Dies ist gem. EU AI Act erforderlich.'
            }
          </p>
          {localReviewed && (
            <Badge variant="outline" className="mt-2 bg-green-500/10 border-green-500 text-green-600">
              KI-VO konform geprüft
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
