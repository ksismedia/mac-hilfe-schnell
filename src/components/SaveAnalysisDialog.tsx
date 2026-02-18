
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSavedAnalyses } from '@/hooks/useSavedAnalyses';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualImprintData, ManualSocialData, ManualWorkplaceData, ManualCompetitor, CompetitorServices, CompanyServices, ManualCorporateIdentityData, StaffQualificationData, HourlyRateData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData, ManualLocalSEOData, ManualIndustryReviewData, ManualOnlinePresenceData, ManualConversionData, ManualMobileData, ManualSEOData } from '@/hooks/useManualData';
import { Save } from 'lucide-react';
import { AIReviewStatus } from '@/hooks/useAIReviewStatus';
import { supabase } from '@/integrations/supabase/client';

interface SaveAnalysisDialogProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung' | 'innenausbau';
  };
  realData: RealBusinessData;
  reviewStatus?: AIReviewStatus;
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
  staffQualificationData?: StaffQualificationData | null;
  hourlyRateData?: HourlyRateData | null;
  quoteResponseData?: QuoteResponseData | null;
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  manualDataPrivacyData?: ManualDataPrivacyData | null;
  manualLocalSEOData?: ManualLocalSEOData | null;
  manualIndustryReviewData?: ManualIndustryReviewData | null;
  manualOnlinePresenceData?: ManualOnlinePresenceData | null;
  manualConversionData?: ManualConversionData | null;
  manualMobileData?: ManualMobileData | null;
  manualReputationData?: any;
  manualSEOData?: ManualSEOData | null;
  privacyData?: any;
  accessibilityData?: any;
  securityData?: any;
  extensionData?: any;
  showNationalProviders?: boolean;
  showRegionalTrends?: boolean;
  regionalTrendsData?: any;
  focusAreas?: string[] | null;
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
  staffQualificationData,
  hourlyRateData,
  quoteResponseData,
  manualContentData,
  manualAccessibilityData,
  manualBacklinkData,
  manualDataPrivacyData,
  manualLocalSEOData,
  manualIndustryReviewData,
  manualOnlinePresenceData,
  manualConversionData,
  manualMobileData,
  manualReputationData,
  manualSEOData,
  privacyData,
  accessibilityData,
  securityData,
  reviewStatus,
  extensionData,
  showNationalProviders,
  showRegionalTrends,
  regionalTrendsData,
  focusAreas
}) => {
  console.log('🔍 SaveAnalysisDialog Props:');
  console.log('  - extensionData prop:', extensionData ? 'RECEIVED' : 'NULL/UNDEFINED');
  if (extensionData) {
    console.log('  - Extension data content:', {
      url: extensionData.url,
      wordCount: extensionData.content?.wordCount,
      hasLinks: !!extensionData.content?.links
    });
  }
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
        staffQualificationData: staffQualificationData || undefined,
        hourlyRateData: hourlyRateData || undefined,
        quoteResponseData: quoteResponseData || undefined,
        manualContentData: manualContentData || undefined,
        manualAccessibilityData: manualAccessibilityData || undefined,
        manualBacklinkData: manualBacklinkData || undefined,
        manualDataPrivacyData: manualDataPrivacyData || undefined,
        manualLocalSEOData: manualLocalSEOData || undefined,
        manualIndustryReviewData: manualIndustryReviewData || undefined,
        manualOnlinePresenceData: manualOnlinePresenceData || undefined,
        manualConversionData: manualConversionData || undefined,
        manualMobileData: manualMobileData || undefined,
        manualReputationData: manualReputationData || undefined,
        manualSEOData: manualSEOData || undefined,
        privacyData: privacyData || undefined,
        accessibilityData: accessibilityData || undefined,
        securityData: securityData || undefined,
        extensionData: extensionData || undefined,
        showNationalProviders: showNationalProviders || undefined,
        showRegionalTrends: showRegionalTrends || undefined,
        regionalTrendsData: regionalTrendsData || undefined,
        focusAreas: focusAreas || undefined
      };

      console.log('=== SAVE ANALYSIS DEBUG ===');
      console.log('Current Analysis ID:', currentAnalysisId);
      console.log('Analysis Name:', analysisName);
      console.log('Business Data:', businessData);
      console.log('Manual Data:', manualData);
      console.log('📍 Local SEO Data being saved:', manualLocalSEOData);
      console.log('📍 Directories being saved:', manualLocalSEOData?.directories);
      console.log('🔍 Extension Data being saved:', extensionData);
      console.log('🔍 Has extension data:', !!extensionData);

      let analysisId = currentAnalysisId;
      
      if (currentAnalysisId) {
        console.log('Updating existing analysis...');
        await updateAnalysis(currentAnalysisId, analysisName, businessData, realData, manualData);
        toast({
          title: "Analyse aktualisiert",
          description: `Die Analyse "${analysisName}" wurde erfolgreich aktualisiert.`,
        });
      } else {
        console.log('Creating new analysis...');
        const newId = await saveAnalysis(analysisName, businessData, realData, manualData);
        console.log('New analysis ID:', newId);
        analysisId = newId;
        toast({
          title: "Analyse gespeichert",
          description: `Die Analyse "${analysisName}" wurde erfolgreich gespeichert.`,
        });
      }

      // Save AI review status if available (wrapped in try-catch to not block main save)
      if (reviewStatus && analysisId) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          console.log('Saving AI review status for analysis:', analysisId);
          
          for (const [category, status] of Object.entries(reviewStatus)) {
            if (status.isReviewed) {
              const { error: reviewError } = await supabase
                .from('ai_review_status')
                .upsert({
                  analysis_id: analysisId,
                  category_name: category,
                  is_reviewed: status.isReviewed,
                  reviewed_at: status.reviewedAt || new Date().toISOString(),
                  reviewer_id: user?.id || null,
                  review_notes: status.reviewNotes || null
                }, {
                  onConflict: 'analysis_id,category_name'
                });
              
              if (reviewError) {
                console.warn('AI review status save warning for category', category, ':', reviewError);
              }
            }
          }
          console.log('AI review status saved successfully');
        } catch (reviewErr) {
          console.warn('AI review status save failed (non-blocking):', reviewErr);
        }
      }

      setIsOpen(false);
      setAnalysisName('');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);

      const err: any = error;

      const messageFromObject =
        err && typeof err === 'object'
          ? (typeof err.message === 'string' ? err.message : null)
          : null;

      const detailsFromObject =
        err && typeof err === 'object'
          ? (typeof err.details === 'string' ? err.details : null)
          : null;

      const hintFromObject =
        err && typeof err === 'object'
          ? (typeof err.hint === 'string' ? err.hint : null)
          : null;

      const codeFromObject =
        err && typeof err === 'object'
          ? (typeof err.code === 'string' ? err.code : null)
          : null;

      const statusFromObject =
        err && typeof err === 'object'
          ? (typeof err.status === 'number' ? String(err.status) : null)
          : null;

      const rawMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : messageFromObject || '';

      const extraParts = [
        detailsFromObject ? `Details: ${detailsFromObject}` : null,
        hintFromObject ? `Hinweis: ${hintFromObject}` : null,
        codeFromObject ? `Code: ${codeFromObject}` : null,
        statusFromObject ? `Status: ${statusFromObject}` : null,
      ].filter(Boolean);

      const combined = [rawMessage, ...extraParts].filter(Boolean).join(' | ');
      const shortMessage = combined && combined.length > 220 ? `${combined.slice(0, 220)}...` : combined;

      toast({
        title: "Speicherfehler",
        description: `Die Analyse konnte nicht gespeichert werden. ${shortMessage || ''}`.trim(),
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
