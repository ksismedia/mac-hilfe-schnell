import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Building } from 'lucide-react';

// Category Components
import SEOContentCategory from './analysis/categories/SEOContentCategory';
import PerformanceMobileCategory from './analysis/categories/PerformanceMobileCategory';
import SocialMediaCategory from './analysis/categories/SocialMediaCategory';
import StaffServiceCategory from './analysis/categories/StaffServiceCategory';

// Components
import SaveAnalysisDialog from './SaveAnalysisDialog';
import CustomerHTMLExport from './analysis/CustomerHTMLExport';
import SelectiveHTMLExport from './analysis/SelectiveHTMLExport';
import OverallRating from './analysis/OverallRating';

// Services
import { BusinessAnalysisService, RealBusinessData } from '@/services/BusinessAnalysisService';

// Hooks
import { useManualData } from '@/hooks/useManualData';
import { useSavedAnalyses } from '@/hooks/useSavedAnalyses';
import { loadSavedAnalysisData } from '@/utils/analysisLoader';
import { calculateSEOContentScore, calculatePerformanceMobileScore, calculateSocialMediaCategoryScore, calculateStaffServiceScore } from './analysis/export/scoreCalculations';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

interface SidebarAnalysisDashboardProps {
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

const SidebarAnalysisDashboard: React.FC<SidebarAnalysisDashboardProps> = ({ 
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
  const [activeCategory, setActiveCategory] = useState('seo-content');
  
  const handleKeywordsScoreChange = (score: number | null) => {
    setKeywordsScore(score);
  };

  const handleKeywordDataChange = (keywordData: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null) => {
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
    quoteResponseData,
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
    updateStaffQualificationData,
    updateQuoteResponseData
  } = useManualData();

  // Access saved analyses hook
  const { loadAnalysis } = useSavedAnalyses();

  // Load analysis data or load saved analysis
  useEffect(() => {
    const loadAnalysisData = async () => {
      // Prevent duplicate analysis loading
      if (realData) {
        return;
      }
      
      if (loadedAnalysisId) {
        try {
          const savedAnalysis = loadAnalysis(loadedAnalysisId);
          
          if (savedAnalysis) {
            setRealData(savedAnalysis.realData);
            
            if (savedAnalysis.manualData?.keywordData) {
              setManualKeywordData(savedAnalysis.manualData.keywordData);
            }
            if (savedAnalysis.manualData?.keywordScore !== undefined) {
              setKeywordsScore(savedAnalysis.manualData.keywordScore);
            }
            if (savedAnalysis.manualData?.privacyData) {
              setPrivacyData(savedAnalysis.manualData.privacyData);
            }
            if (savedAnalysis.manualData?.accessibilityData) {
              setAccessibilityData(savedAnalysis.manualData.accessibilityData);
            }
            
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
            
            return;
          } else {
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
      } else {
        setIsLoading(true);
        
        try {
          const analysisData = await BusinessAnalysisService.analyzeWebsite(businessData.url, businessData.address, businessData.industry);
          setRealData(analysisData);
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
  }, [businessData.url, businessData.address, businessData.industry, loadedAnalysisId, toast, loadAnalysis]);

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

  // Calculate category scores
  const scores = {
    seoAndContent: calculateSEOContentScore(realData, keywordsScore, businessData, privacyData, accessibilityData),
    performanceAndMobile: calculatePerformanceMobileScore(realData),
    socialMedia: calculateSocialMediaCategoryScore(realData, manualSocialData, manualWorkplaceData),
    staffAndService: calculateStaffServiceScore(staffQualificationData, quoteResponseData, manualCorporateIdentityData, hourlyRateData)
  };

  const renderActiveCategory = () => {
    switch (activeCategory) {
      case 'seo-content':
        return (
          <SEOContentCategory
            businessData={businessData}
            realData={realData}
            onKeywordsScoreChange={handleKeywordsScoreChange}
            onKeywordDataChange={handleKeywordDataChange}
            keywordsScore={keywordsScore}
            manualKeywordData={manualKeywordData}
            privacyData={privacyData}
            setPrivacyData={setPrivacyData}
            accessibilityData={accessibilityData}
            setAccessibilityData={setAccessibilityData}
            manualImprintData={manualImprintData}
            updateImprintData={updateImprintData}
            manualCompetitors={manualCompetitors}
            competitorServices={competitorServices}
            removedMissingServices={removedMissingServices}
            companyServices={companyServices}
            deletedCompetitors={deletedCompetitors}
            updateCompetitors={updateCompetitors}
            updateCompetitorServices={updateCompetitorServices}
            addRemovedMissingService={addRemovedMissingService}
            updateCompanyServices={updateCompanyServices}
            addDeletedCompetitor={addDeletedCompetitor}
            removeDeletedCompetitor={removeDeletedCompetitor}
          />
        );
      case 'performance-mobile':
        return (
          <PerformanceMobileCategory
            realData={realData}
            businessData={businessData}
          />
        );
      case 'social-media':
        return (
          <SocialMediaCategory
            realData={realData}
            businessData={businessData}
            manualSocialData={manualSocialData}
            updateSocialData={updateSocialData}
            manualWorkplaceData={manualWorkplaceData}
            updateWorkplaceData={updateWorkplaceData}
          />
        );
      case 'staff-service':
        return (
          <StaffServiceCategory
            businessData={businessData}
            realData={realData}
            staffQualificationData={staffQualificationData}
            updateStaffQualificationData={updateStaffQualificationData}
            manualCorporateIdentityData={manualCorporateIdentityData}
            updateCorporateIdentityData={updateCorporateIdentityData}
            quoteResponseData={quoteResponseData}
            updateQuoteResponseData={updateQuoteResponseData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="flex min-h-screen">
        {/* Custom Sidebar */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 flex-shrink-0">
          <div className="p-4">
            <h2 className="text-yellow-400 font-bold text-lg mb-4">Analyse-Kategorien</h2>
            <div className="space-y-2">
              {[
                { id: 'seo-content', title: 'SEO & Content', score: scores.seoAndContent, icon: '🔍' },
                { id: 'performance-mobile', title: 'Performance & Technik', score: scores.performanceAndMobile, icon: '⚡' },
                { id: 'social-media', title: 'Social Media', score: scores.socialMedia, icon: '📱' },
                { id: 'staff-service', title: 'Personal & Service', score: scores.staffAndService, icon: '👥' }
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full p-3 rounded-lg text-left border-l-4 transition-all ${
                    activeCategory === category.id 
                      ? 'bg-gray-700 border-yellow-400' 
                      : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                  } ${
                    category.score >= 80 ? 'border-yellow-400' :
                    category.score >= 60 ? 'border-green-400' : 'border-red-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-white">{category.title}</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      category.score >= 80 ? 'text-yellow-400' :
                      category.score >= 60 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {category.score}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 bg-background overflow-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
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
              
              <div className="flex items-center gap-2">
                <SaveAnalysisDialog 
                  businessData={businessData}
                  realData={realData}
                  manualImprintData={manualImprintData}
                  manualSocialData={manualSocialData}
                  manualWorkplaceData={manualWorkplaceData}
                  manualCorporateIdentityData={manualCorporateIdentityData}
                  manualCompetitors={manualCompetitors}
                  competitorServices={competitorServices}
                  companyServices={companyServices}
                  manualKeywordData={manualKeywordData}
                  keywordScore={keywordsScore}
                  privacyData={privacyData}
                  accessibilityData={accessibilityData}
                />
                <CustomerHTMLExport 
                  businessData={businessData}
                  realData={realData}
                  manualSocialData={manualSocialData}
                  keywordScore={keywordsScore}
                  manualKeywordData={manualKeywordData}
                />
                <SelectiveHTMLExport
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
                  hourlyRateData={hourlyRateData}
                  manualKeywordData={manualKeywordData}
                  keywordScore={keywordsScore}
                  staffQualificationData={staffQualificationData}
                  quoteResponseData={quoteResponseData}
                  privacyData={privacyData}
                  accessibilityData={accessibilityData}
                />
              </div>
            </div>

            {/* Overall Rating */}
            <div className="mb-8">
              <OverallRating 
                businessData={businessData}
                realData={realData}
                manualSocialData={manualSocialData}
                keywordsScore={keywordsScore}
                staffQualificationData={staffQualificationData}
                quoteResponseData={quoteResponseData}
              />
            </div>

            {/* Active Category Content */}
            {renderActiveCategory()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarAnalysisDashboard;