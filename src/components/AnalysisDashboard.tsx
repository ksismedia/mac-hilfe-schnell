import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Building } from 'lucide-react';

// Components
import SEOAnalysis from './analysis/SEOAnalysis';
import PerformanceAnalysis from './analysis/PerformanceAnalysis';
import MobileOptimization from './analysis/MobileOptimization';
import LocalSEO from './analysis/LocalSEO';
import ContentAnalysis from './analysis/ContentAnalysis';
import BacklinkAnalysis from './analysis/BacklinkAnalysis';
import CompetitorAnalysis from './analysis/CompetitorAnalysis';
import GoogleReviews from './analysis/GoogleReviews';
import SocialMediaAnalysis from './analysis/SocialMediaAnalysis';
import SocialProof from './analysis/SocialProof';
import ConversionOptimization from './analysis/ConversionOptimization';
import WorkplaceReviews from './analysis/WorkplaceReviews';
import { CorporateIdentityAnalysis } from './analysis/CorporateIdentityAnalysis';
import ImprintCheck from './analysis/ImprintCheck';
import IndustryFeatures from './analysis/IndustryFeatures';
import PDFExport from './analysis/PDFExport';
import HTMLExport from './analysis/HTMLExport';
import CustomerHTMLExport from './analysis/CustomerHTMLExport';
import SaveAnalysisDialog from './SaveAnalysisDialog';
import KeywordAnalysis from './analysis/KeywordAnalysis';
import ManualCompetitorInput from './analysis/ManualCompetitorInput';
import OverallRating from './analysis/OverallRating';
import SocialMediaSimple from './analysis/SocialMediaSimple';
import AccessibilityAnalysis from './analysis/AccessibilityAnalysis';
import DataPrivacyAnalysis from './analysis/DataPrivacyAnalysis';
import { StaffQualificationInput } from './analysis/StaffQualificationInput';
import HourlyRateTab from './analysis/HourlyRateTab';

// Services
import { BusinessAnalysisService, RealBusinessData } from '@/services/BusinessAnalysisService';

// Hooks
import { useManualData } from '@/hooks/useManualData';
import { useSavedAnalyses } from '@/hooks/useSavedAnalyses';
import { loadSavedAnalysisData } from '@/utils/analysisLoader';
import { calculateSocialMediaScore } from './analysis/export/scoreCalculations';
import { calculateSimpleSocialScore } from './analysis/export/simpleSocialScore';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

interface AnalysisDashboardProps {
  businessData: BusinessData;
  onReset: () => void;
  onBusinessDataChange?: (data: BusinessData) => void;
  loadedAnalysisId?: string;
}

const industryNames = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro'
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ 
  businessData, 
  onReset, 
  onBusinessDataChange,
  loadedAnalysisId 
}) => {
  const [realData, setRealData] = useState<RealBusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [keywordsScore, setKeywordsScore] = useState<number | null>(null);
  const [manualKeywordData, setManualKeywordData] = useState<Array<{ keyword: string; found: boolean; volume: number; position: number }> | null>(null);
  const [privacyData, setPrivacyData] = useState<any>(null);
  const [accessibilityData, setAccessibilityData] = useState<any>(null);
  
  const handleKeywordsScoreChange = (score: number | null) => {
    console.log('=== KEYWORDS SCORE CHANGE IN DASHBOARD ===');
    console.log('New score received:', score);
    setKeywordsScore(score);
  };

  const handleKeywordDataChange = (keywordData: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null) => {
    console.log('=== KEYWORD DATA CHANGE IN DASHBOARD ===');
    console.log('New keyword data received:', keywordData);
    setManualKeywordData(keywordData);
  };
  const { toast } = useToast();

  // Manual data management
  const {
    manualImprintData,
    manualSocialData,
    manualWorkplaceData,
    manualCorporateIdentityData,
    manualCompetitors,
    competitorServices,
    removedMissingServices,
    companyServices,
    deletedCompetitors,
    staffQualificationData,
    hourlyRateData,
    updateImprintData,
    updateSocialData,
    updateWorkplaceData,
    updateCorporateIdentityData,
    updateCompetitors,
    updateCompetitorServices,
    addRemovedMissingService,
    updateCompanyServices,
    addDeletedCompetitor,
    removeDeletedCompetitor,
    updateStaffQualificationData
  } = useManualData();

  // Access saved analyses hook
  const { loadAnalysis } = useSavedAnalyses();

  // No transformation needed - use competitorServices directly

  // Load analysis data or load saved analysis - FIXED: Don't reload on businessData changes
  useEffect(() => {
    const loadAnalysisData = async () => {
      console.log('=== LOAD ANALYSIS EFFECT ===');
      console.log('loadedAnalysisId:', loadedAnalysisId);
      console.log('realData exists:', !!realData);
      
      // If we have a saved analysis to load
      if (loadedAnalysisId && !realData) {
        console.log('Loading saved analysis with ID:', loadedAnalysisId);
        try {
          const savedAnalysis = loadAnalysis(loadedAnalysisId);
          
          if (savedAnalysis) {
            console.log('Found saved analysis:', savedAnalysis);
            
            // Set the real data from saved analysis
            setRealData(savedAnalysis.realData);
            
            // Load keyword data if available
            if (savedAnalysis.manualData?.keywordData) {
              console.log('Loading saved keyword data:', savedAnalysis.manualData.keywordData);
              setManualKeywordData(savedAnalysis.manualData.keywordData);
            }
            if (savedAnalysis.manualData?.keywordScore !== undefined) {
              console.log('Loading saved keyword score:', savedAnalysis.manualData.keywordScore);
              setKeywordsScore(savedAnalysis.manualData.keywordScore);
            }
            
            // Load privacy and accessibility data if available
            if (savedAnalysis.manualData?.privacyData) {
              console.log('Loading saved privacy data:', savedAnalysis.manualData.privacyData);
              setPrivacyData(savedAnalysis.manualData.privacyData);
            }
            if (savedAnalysis.manualData?.accessibilityData) {
              console.log('Loading saved accessibility data:', savedAnalysis.manualData.accessibilityData);
              setAccessibilityData(savedAnalysis.manualData.accessibilityData);
            }
            
            // Load manual data using the loader utility  
            loadSavedAnalysisData(
              savedAnalysis,
              updateImprintData,
              updateSocialData,
              updateWorkplaceData,
              updateCorporateIdentityData,
              updateCompetitors,
              updateCompetitorServices,
              updateCompanyServices
            );
            
            console.log('Saved analysis loaded successfully');
            return;
          } else {
            console.error('Saved analysis not found for ID:', loadedAnalysisId);
            toast({
              title: "Fehler beim Laden",
              description: "Die gespeicherte Analyse konnte nicht gefunden werden.",
              variant: "destructive",
            });
            return;
          }
        } catch (error) {
          console.error('Error loading saved analysis:', error);
          toast({
            title: "Fehler beim Laden", 
            description: "Beim Laden der Analyse ist ein Fehler aufgetreten.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // If we already have data, skip
      if (realData) {
        console.log('Analysis data already loaded, skipping');
        return;
      }
      
      // If no saved analysis ID, perform new analysis
      if (!loadedAnalysisId) {
        console.log('Performing new analysis for:', businessData);
        setIsLoading(true);
        
        try {
          const analysisData = await BusinessAnalysisService.analyzeWebsite(businessData.url, businessData.address, businessData.industry);
          setRealData(analysisData);
          console.log('New analysis completed successfully');
        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysefehler",
            description: "Die Website-Analyse konnte nicht durchgeführt werden.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAnalysisData();
  }, [toast, loadedAnalysisId, realData, loadAnalysis, updateImprintData, updateSocialData, updateWorkplaceData, updateCompetitors, updateCompetitorServices]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Website wird analysiert...</h2>
            <p className="text-gray-300">Dies kann einige Sekunden dauern</p>
          </div>
        </div>
      </div>
    );
  }

  if (!realData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Analysefehler</h2>
            <p className="text-gray-300 mb-4">Die Website konnte nicht analysiert werden</p>
            <Button onClick={onReset} variant="outline">Zurück zur Eingabe</Button>
          </div>
        </div>
      </div>
    );
  }

  // KORRIGIERTE Score-Berechnungen - Social Media Score wird LIVE berechnet
  const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
  const defaultKeywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);
  const reviewsScore = realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0;
  
  // Use manual keywords score if set (including 0), otherwise use default
  const currentKeywordsScore = keywordsScore !== null ? keywordsScore : defaultKeywordsScore;
  
  console.log('=== DASHBOARD KEYWORDS SCORE CALCULATION ===');
  console.log('keywordsScore state:', keywordsScore);
  console.log('defaultKeywordsScore:', defaultKeywordsScore);
  console.log('currentKeywordsScore (final):', currentKeywordsScore);
  
  // WICHTIG: Social Media Score wird mit aktuellen manuellen Daten berechnet
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  console.log('Dashboard - LIVE Social Media Score:', socialMediaScore, 'Manual Data:', manualSocialData);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-text-high';
    if (score >= 60) return 'score-text-medium';
    return 'score-text-low';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-yellow-900/20 border-handwerk-gold/30';
    if (score >= 60) return 'bg-green-900/20 border-green-400/30';
    return 'bg-red-900/20 border-red-400/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Button onClick={onReset} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Neue Analyse
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-yellow-400">Analyse-Ergebnisse</h1>
              <div className="flex items-center gap-2 mt-1">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 break-all">{businessData.url}</span>
                <Badge variant="secondary" className="shrink-0">
                  <Building className="h-3 w-3 mr-1" />
                  {industryNames[businessData.industry]}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Rating Component */}
        <div className="mb-8">
          <OverallRating 
            businessData={businessData}
            realData={realData}
            manualSocialData={manualSocialData}
            keywordsScore={currentKeywordsScore}
            staffQualificationData={staffQualificationData}
          />
        </div>

        {/* Score Overview Tiles - KORRIGIERT: Verwendet live berechneten socialMediaScore */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-4">Detailbewertung - {realData.company.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className={`p-4 rounded-lg border ${getScoreBg(realData.seo.score)}`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(realData.seo.score)}`}>
                  {realData.seo.score}
                </div>
                <div className="text-sm text-gray-300 mt-1">SEO</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${getScoreBg(realData.performance.score)}`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(realData.performance.score)}`}>
                  {realData.performance.score}
                </div>
                <div className="text-sm text-gray-300 mt-1">Performance</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${getScoreBg(realData.mobile.overallScore)}`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(realData.mobile.overallScore)}`}>
                  {realData.mobile.overallScore}
                </div>
                <div className="text-sm text-gray-300 mt-1">Mobile</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${getScoreBg(currentKeywordsScore)}`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(currentKeywordsScore)}`}>
                  {currentKeywordsScore}
                </div>
                <div className="text-sm text-gray-300 mt-1">Keywords</div>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border ${getScoreBg(reviewsScore)}`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(reviewsScore)}`}>
                  {reviewsScore}
                </div>
                <div className="text-sm text-gray-300 mt-1">Bewertungen</div>
              </div>
            </div>
            
            {/* KORRIGIERT: Hier wird jetzt der live berechnete socialMediaScore verwendet */}
            <div className={`p-4 rounded-lg border ${getScoreBg(socialMediaScore)}`}>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(socialMediaScore)} relative`}>
                  {socialMediaScore}
                  {socialMediaScore > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs bg-green-500 text-white px-1 rounded">✓</span>
                  )}
                </div>
                <div className="text-sm text-gray-300 mt-1">Social Media</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <div className="text-lg font-semibold text-yellow-400">{realData.performance.loadTime}s</div>
              <div className="text-sm text-gray-300">Ladezeit</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <div className="text-lg font-semibold text-yellow-400">{keywordsFoundCount}/{realData.keywords.length}</div>
              <div className="text-sm text-gray-300">Keywords gefunden</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <div className="text-lg font-semibold text-yellow-400">{realData.reviews.google.count}</div>
              <div className="text-sm text-gray-300">Google Bewertungen</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <div className="text-lg font-semibold text-yellow-400">{realData.competitors.length}</div>
              <div className="text-sm text-gray-300">Konkurrenten</div>
            </div>
          </div>
        </div>

        {/* Analysis Tabs */}
        <div className="space-y-6">
          <Tabs defaultValue="seo" className="w-full">
            <div className="mb-6 overflow-x-auto">
               <TabsList className="inline-flex h-12 items-center justify-center rounded-lg bg-gray-800 border border-yellow-400/30 p-1 text-muted-foreground min-w-full">
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="mobile">Mobile</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="competitors">Konkurrenz</TabsTrigger>
                <TabsTrigger value="legal">Legal</TabsTrigger>
                <TabsTrigger value="accessibility">Barrierefreiheit</TabsTrigger>
                <TabsTrigger value="dataprivacy">Datenschutz</TabsTrigger>
                 <TabsTrigger value="workplace">Arbeitgeber</TabsTrigger>
                 <TabsTrigger value="corporate">Corporate Identity</TabsTrigger>
                 <TabsTrigger value="staff">Personal</TabsTrigger>
                 <TabsTrigger value="pricing">Preise</TabsTrigger>
                 <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="seo" className="space-y-6 mt-0">
              <SEOAnalysis url={businessData.url} realData={realData} />
              <KeywordAnalysis 
                url={businessData.url} 
                industry={businessData.industry} 
                realData={realData}
                onScoreChange={handleKeywordsScoreChange}
                onKeywordDataChange={handleKeywordDataChange}
                loadedKeywordData={manualKeywordData}
                loadedKeywordScore={keywordsScore}
              />
              <LocalSEO businessData={businessData} realData={realData} />
              <ContentAnalysis url={businessData.url} industry={businessData.industry} />
              <BacklinkAnalysis url={businessData.url} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 mt-0">
              <PerformanceAnalysis url={businessData.url} realData={realData} />
            </TabsContent>

            <TabsContent value="mobile" className="space-y-6 mt-0">
              <MobileOptimization url={businessData.url} realData={realData} />
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <SocialMediaSimple
                businessData={businessData}
                realData={realData}
                manualData={manualSocialData}
                onManualDataChange={updateSocialData}
              />
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6 mt-0">
              <GoogleReviews address={businessData.address} realData={realData} />
            </TabsContent>

            <TabsContent value="competitors" className="space-y-6 mt-0">
              <CompetitorAnalysis 
                address={businessData.address} 
                industry={businessData.industry}
                realData={realData}
                manualCompetitors={manualCompetitors}
                competitorServices={competitorServices}
                removedMissingServices={removedMissingServices}
                companyServices={companyServices}
                deletedCompetitors={deletedCompetitors}
                onCompetitorsChange={updateCompetitors}
                onCompetitorServicesChange={updateCompetitorServices}
                onRemovedMissingServicesChange={addRemovedMissingService}
                onCompanyServicesChange={updateCompanyServices}
                onDeletedCompetitorChange={addDeletedCompetitor}
                onRestoreCompetitorChange={removeDeletedCompetitor}
              />
              <ManualCompetitorInput 
                competitors={manualCompetitors}
                onCompetitorsChange={updateCompetitors}
              />
            </TabsContent>

            <TabsContent value="legal" className="space-y-6 mt-0">
              <ImprintCheck 
                url={businessData.url} 
                realData={realData}
                manualData={manualImprintData}
                onManualDataChange={updateImprintData}
              />
              <IndustryFeatures businessData={businessData} />
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-6 mt-0">
              <AccessibilityAnalysis 
                businessData={businessData}
                realData={realData}
                savedData={accessibilityData}
                onDataChange={setAccessibilityData}
              />
            </TabsContent>

            <TabsContent value="dataprivacy" className="space-y-6 mt-0">
              <DataPrivacyAnalysis 
                businessData={businessData}
                realData={realData}
                savedData={privacyData}
                onDataChange={setPrivacyData}
              />
            </TabsContent>

            <TabsContent value="workplace" className="space-y-6 mt-0">
              <WorkplaceReviews 
                businessData={businessData} 
                realData={realData}
                manualData={manualWorkplaceData}
                onManualDataChange={updateWorkplaceData}
              />
            </TabsContent>

            <TabsContent value="corporate" className="space-y-6 mt-0">
              <CorporateIdentityAnalysis 
                businessData={{ companyName: realData.company.name, url: businessData.url }}
                manualData={manualCorporateIdentityData}
                onUpdate={updateCorporateIdentityData}
              />
            </TabsContent>

            <TabsContent value="staff" className="space-y-6 mt-0">
              <StaffQualificationInput 
                businessData={businessData}
                data={staffQualificationData}
                onUpdate={updateStaffQualificationData}
              />
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6 mt-0">
              <HourlyRateTab />
            </TabsContent>

            <TabsContent value="export" className="space-y-6 mt-0">
              <div className="space-y-6">
                <SaveAnalysisDialog 
                  businessData={businessData}
                  realData={realData}
                  manualImprintData={manualImprintData}
                  manualSocialData={manualSocialData}
                  manualWorkplaceData={manualWorkplaceData}
                  manualCorporateIdentityData={manualCorporateIdentityData}
                  manualCompetitors={manualCompetitors}
                  competitorServices={competitorServices}
                  removedMissingServices={removedMissingServices}
                  deletedCompetitors={deletedCompetitors}
                  currentAnalysisId={loadedAnalysisId}
                  manualKeywordData={manualKeywordData}
                  keywordScore={keywordsScore}
                  companyServices={companyServices}
                  privacyData={privacyData}
                  accessibilityData={accessibilityData}
                />
                <HTMLExport
                  businessData={businessData}
                  realData={realData}
                  manualImprintData={manualImprintData}
                  manualSocialData={manualSocialData}
                  manualCompetitors={manualCompetitors}
                  competitorServices={competitorServices}
                  companyServices={companyServices}
                  deletedCompetitors={deletedCompetitors}
                  manualKeywordData={manualKeywordData}
                  keywordScore={keywordsScore}
                />
                <CustomerHTMLExport 
                  businessData={businessData}
                  realData={realData}
                  manualImprintData={manualImprintData}
                  manualSocialData={manualSocialData}
                  manualWorkplaceData={manualWorkplaceData}
                  manualCorporateIdentityData={manualCorporateIdentityData}
                  manualCompetitors={manualCompetitors}
                  competitorServices={competitorServices}
                  companyServices={companyServices}
                  deletedCompetitors={deletedCompetitors}
                  manualKeywordData={manualKeywordData}
                  keywordScore={currentKeywordsScore}
                  staffQualificationData={staffQualificationData}
                />
                <PDFExport 
                  businessData={businessData} 
                  realData={realData}
                  manualImprintData={manualImprintData}
                  manualSocialData={manualSocialData}
                  manualCompetitors={manualCompetitors}
                  competitorServices={competitorServices}
                  companyServices={companyServices}
                  deletedCompetitors={deletedCompetitors}
                  manualKeywordData={manualKeywordData}
                  keywordScore={keywordsScore}
                  staffQualificationData={staffQualificationData}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
