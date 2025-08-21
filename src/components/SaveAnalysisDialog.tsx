
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useSavedAnalyses } from '@/hooks/useSavedAnalyses';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualImprintData, ManualSocialData, ManualWorkplaceData, ManualCompetitor, CompetitorServices, CompanyServices, ManualCorporateIdentityData } from '@/hooks/useManualData';
import { Save } from 'lucide-react';

interface SaveAnalysisDialogProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management';
  };
  realData: RealBusinessData;
  manualImprintData?: ManualImprintData | null;
  manualSocialData?: ManualSocialData | null;
  manualWorkplaceData?: ManualWorkplaceData | null;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  manualCompetitors: ManualCompetitor[];
  competitorServices: CompetitorServices;
  removedMissingServices?: string[];
  deletedCompetitors?: Set<string>;
  currentAnalysisId?: string;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null;
  keywordScore?: number | null;
  companyServices?: CompanyServices;
  privacyData?: any;
  accessibilityData?: any;
}

const SaveAnalysisDialog: React.FC<SaveAnalysisDialogProps> = ({
  businessData,
  realData,
  manualImprintData,
  manualSocialData,
  manualWorkplaceData,
  manualCorporateIdentityData,
  manualCompetitors,
  competitorServices,
  removedMissingServices = [],
  deletedCompetitors = new Set(),
  currentAnalysisId,
  manualKeywordData,
  keywordScore,
  companyServices,
  privacyData,
  accessibilityData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [analysisName, setAnalysisName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { saveAnalysis, updateAnalysis } = useSavedAnalyses();
  const { toast } = useToast();

  const generateDefaultName = () => {
    const companyName = realData.company.name || new URL(businessData.url).hostname;
    const date = new Date().toLocaleDateString('de-DE');
    return `${companyName} - ${date}`;
  };

  const handleSave = async () => {
    if (!analysisName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen für die Analyse ein.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const manualData = {
        imprint: manualImprintData || undefined,
        social: manualSocialData || undefined,
        workplace: manualWorkplaceData || undefined,
        corporateIdentity: manualCorporateIdentityData || undefined,
        competitors: manualCompetitors,
        competitorServices,
        removedMissingServices: removedMissingServices || [],
        deletedCompetitors: Array.from(deletedCompetitors),
        keywordData: manualKeywordData || undefined,
        keywordScore: keywordScore || undefined,
        companyServices: companyServices || undefined,
        privacyData: privacyData || undefined,
        accessibilityData: accessibilityData || undefined
      };

      if (currentAnalysisId) {
        updateAnalysis(currentAnalysisId, analysisName, businessData, realData, manualData);
        toast({
          title: "Analyse aktualisiert",
          description: `Die Analyse "${analysisName}" wurde erfolgreich aktualisiert.`,
        });
      } else {
        const newId = saveAnalysis(analysisName, businessData, realData, manualData);
        toast({
          title: "Analyse gespeichert",
          description: `Die Analyse "${analysisName}" wurde erfolgreich gespeichert.`,
        });
      }

      setIsOpen(false);
      setAnalysisName('');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast({
        title: "Speicherfehler",
        description: "Die Analyse konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpen = () => {
    setAnalysisName(generateDefaultName());
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" onClick={handleOpen}>
          <Save className="h-4 w-4 mr-2" />
          {currentAnalysisId ? 'Speichern' : 'Analyse speichern'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentAnalysisId ? 'Analyse aktualisieren' : 'Analyse speichern'}
          </DialogTitle>
          <DialogDescription>
            Geben Sie einen Namen für Ihre Analyse ein und speichern Sie diese für spätere Verwendung.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="analysisName">Name der Analyse</Label>
            <Input
              id="analysisName"
              value={analysisName}
              onChange={(e) => setAnalysisName(e.target.value)}
              placeholder="z.B. Musterfirma GmbH - 07.06.2025"
              className="mt-1"
            />
          </div>
          <div className="text-sm text-gray-600">
            <p><strong>Website:</strong> {businessData.url}</p>
            <p><strong>Adresse:</strong> {businessData.address}</p>
            <p><strong>Manuelle Eingaben:</strong> {
              [manualImprintData, manualSocialData, manualWorkplaceData].filter(Boolean).length + 
              (manualCompetitors.length > 0 ? 1 : 0)
            } Bereiche</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Speichere...' : (currentAnalysisId ? 'Aktualisieren' : 'Speichern')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveAnalysisDialog;
