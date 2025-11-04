import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AIActComplianceWarningProps {
  unreviewedCategories: string[];
  isFullyReviewed: boolean;
  onIgnoreWarning?: () => void;
}

export const AIActComplianceWarning = ({ 
  unreviewedCategories, 
  isFullyReviewed,
  onIgnoreWarning 
}: AIActComplianceWarningProps) => {
  if (isFullyReviewed) {
    return (
      <Alert className="border-green-500 bg-green-500/10">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-700">KI-Verordnung konform</AlertTitle>
        <AlertDescription className="text-green-600">
          Alle AI-generierten Inhalte wurden manuell geprüft und freigegeben. 
          Der Export ist gem. EU AI Act zulässig.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-500/10">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        WARNUNG: KI-Verordnung (EU AI Act)
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p className="font-semibold">
          Dieser Report enthält AI-generierte Inhalte, die noch nicht vollständig geprüft wurden.
        </p>
        <div className="space-y-2">
          <p className="text-sm">
            Gem. EU AI-Verordnung (EU) 2024/1689 müssen AI-generierte Inhalte, die an Kunden 
            weitergegeben werden, durch menschliche Überprüfung ("Human Oversight") validiert werden.
          </p>
          <div className="mt-2">
            <p className="text-sm font-semibold mb-1">Noch nicht geprüfte Kategorien:</p>
            <div className="flex flex-wrap gap-2">
              {unreviewedCategories.map(cat => (
                <Badge key={cat} variant="destructive" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-3 border-t border-orange-300">
          <p className="text-sm font-semibold">
            ⚠️ Bitte überprüfen Sie alle markierten AI-Bewertungen, bevor Sie diesen Report 
            an Kunden weitergeben.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
};
