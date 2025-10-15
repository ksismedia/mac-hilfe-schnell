import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Building, Search, Zap, Share2, Users, TrendingUp, Eye, Headphones } from 'lucide-react';

// Category Components
import SEOContentCategory from './analysis/categories/SEOContentCategory';
import PerformanceMobileCategory from './analysis/categories/PerformanceMobileCategory';
import SocialMediaCategory from './analysis/categories/SocialMediaCategory';
import StaffServiceCategory from './analysis/categories/StaffServiceCategory';
import { CorporateIdentityInput } from './analysis/CorporateIdentityInput';

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
import { calculateOnlineQualityAuthorityScore, calculateWebsitePerformanceTechScore, calculateSocialMediaPerformanceScore, calculateMarketEnvironmentScore, calculateCorporateAppearanceScore, calculateServiceQualityScore } from './analysis/export/scoreCalculations';
import CorporateIdentityAnalysis from './analysis/CorporateIdentityAnalysis';
import QuoteResponseInput from './analysis/QuoteResponseInput';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
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
  const [activeCategory, setActiveCategory] = useState('online-quality-authority');
  const [currentOwnCompanyScore, setCurrentOwnCompanyScore] = useState<number>(75); // Score aus CompetitorAnalysis
  
  const handleKeywordsScoreChange = (score: number | null) => {
    setKeywordsScore(score);
  };

  const handleKeywordDataChange = (keywordData: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null) => {
    setManualKeywordData(keywordData);
  };
  
  const handleCompanyScoreChange = (score: number) => {
    setCurrentOwnCompanyScore(score);
    console.log('SidebarAnalysisDashboard - Received score from CompetitorAnalysis:', score);
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
    manualContentData,
    manualAccessibilityData,
    manualBacklinkData,
    manualDataPrivacyData,
    manualLocalSEOData,
    manualIndustryReviewData,
    manualOnlinePresenceData,
    updateImprintData,
    updateSocialData,
    updateWorkplaceData,
    updateCorporateIdentityData,
    updateCompetitors,
    updateCompetitorServices,
    addRemovedMissingService,
    updateRemovedMissingServices,
    updateCompanyServices,
    addDeletedCompetitor,
    removeDeletedCompetitor,
    updateStaffQualificationData,
    updateHourlyRateData,
    updateQuoteResponseData,
    updateManualDataPrivacyData,
    updateManualLocalSEOData,
    updateManualIndustryReviewData,
    updateManualOnlinePresenceData
  } = useManualData();

  // Access saved analyses hook
  const { loadAnalysis } = useSavedAnalyses();

  // Load analysis data or load saved analysis
  useEffect(() => {
    const loadAnalysisData = async () => {
      if (realData) {
        return;
      }
      
      if (loadedAnalysisId) {
        try {
          console.log('Loading saved analysis with ID:', loadedAnalysisId);
          const savedAnalysis = loadAnalysis(loadedAnalysisId);
          
          if (savedAnalysis) {
            console.log('Found saved analysis:', savedAnalysis.name);
            setRealData(savedAnalysis.realData);
            
            if (savedAnalysis.manualData?.keywordData) {
              console.log('Setting keyword data from saved analysis');
              setManualKeywordData(savedAnalysis.manualData.keywordData);
            }
            if (savedAnalysis.manualData?.keywordScore !== undefined) {
              console.log('Setting keyword score from saved analysis:', savedAnalysis.manualData.keywordScore);
              setKeywordsScore(savedAnalysis.manualData.keywordScore);
            }
            if (savedAnalysis.manualData?.privacyData) {
              console.log('Setting privacy data from saved analysis');
              setPrivacyData(savedAnalysis.manualData.privacyData);
            }
            if (savedAnalysis.manualData?.accessibilityData) {
              console.log('Setting accessibility data from saved analysis');
              setAccessibilityData(savedAnalysis.manualData.accessibilityData);
            }
            
            console.log('Loading manual data via analysisLoader...');
            loadSavedAnalysisData(
              savedAnalysis,
              updateImprintData,
              updateSocialData,
              updateWorkplaceData,
              updateCorporateIdentityData,
              updateCompetitors,
              updateCompetitorServices,
              updateCompanyServices,
              setManualKeywordData,
              updateStaffQualificationData,
              updateHourlyRateData,
              updateQuoteResponseData,
              updateRemovedMissingServices,
              addDeletedCompetitor
            );
            
            console.log('Saved analysis loaded successfully');
            return;
          } else {
            console.error('Saved analysis not found with ID:', loadedAnalysisId);
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
  }, [businessData.url, businessData.address, businessData.industry, loadedAnalysisId, toast, loadAnalysis, updateImprintData, updateSocialData, updateWorkplaceData, updateCorporateIdentityData, updateCompetitors, updateCompetitorServices, updateCompanyServices]);

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

  // Get competitor score from competitors analysis once
  const currentCompetitorScore = manualCompetitors && manualCompetitors.length > 0 ? 
    Math.min(100, 60 + (manualCompetitors.length * 5)) : null;

  // Calculate new 6-category scores
  console.log('🚀 Calculating scores with parameters:', {
    realData: realData ? 'present' : 'null',
    keywordsScore,
    businessData,
    privacyData: privacyData ? 'present' : 'null',
    accessibilityData: accessibilityData ? 'present' : 'null',
    manualContentData: manualContentData ? 'present' : 'null',
    manualBacklinkData: manualBacklinkData ? 'present' : 'null'
  });
  
  const scores = {
    onlineQualityAuthority: calculateOnlineQualityAuthorityScore(
      realData, keywordsScore, businessData, privacyData, accessibilityData, 
      manualContentData, manualBacklinkData
    ),
    websitePerformanceTech: calculateWebsitePerformanceTechScore(realData),
    socialMediaPerformance: calculateSocialMediaPerformanceScore(realData, manualSocialData),
    marketEnvironment: calculateMarketEnvironmentScore(
      realData, hourlyRateData, staffQualificationData, currentCompetitorScore, manualWorkplaceData
    ),
    corporateAppearance: calculateCorporateAppearanceScore(manualCorporateIdentityData),
    serviceQuality: calculateServiceQualityScore(quoteResponseData)
  };
  
  console.log('🚀 Calculated scores:', scores);

  const categories = [
    { 
      id: 'online-quality-authority', 
      title: 'Online-Qualität · Relevanz · Autorität', 
      icon: Search, 
      score: scores.onlineQualityAuthority
    },
    { 
      id: 'website-performance-tech', 
      title: 'Webseiten-Performance & Technik', 
      icon: Zap, 
      score: scores.websitePerformanceTech
    },
    { 
      id: 'social-media-performance', 
      title: 'Online-/Web-/Social-Media Performance', 
      icon: Share2, 
      score: scores.socialMediaPerformance
    },
    { 
      id: 'market-environment', 
      title: 'Markt & Marktumfeld', 
      icon: TrendingUp, 
      score: scores.marketEnvironment
    },
    { 
      id: 'corporate-appearance', 
      title: 'Außendarstellung & Erscheinungsbild', 
      icon: Eye, 
      score: scores.corporateAppearance
    },
    { 
      id: 'service-quality', 
      title: 'Qualität · Service · Kundenorientierung', 
      icon: Headphones, 
      score: scores.serviceQuality
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-400';  // 90-100% gold
    if (score >= 61) return 'text-green-400';   // 61-89% green
    return 'text-red-400';                      // 0-60% red
  };

  const getScoreBorder = (score: number) => {
    if (score >= 80) return 'border-yellow-400';
    if (score >= 60) return 'border-green-400';
    return 'border-red-400';
  };

  const renderActiveCategory = () => {
    console.log('🔄 Rendering category:', activeCategory);
    switch (activeCategory) {
      case 'online-quality-authority':
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
            onCompanyScoreChange={handleCompanyScoreChange}
            manualDataPrivacyData={manualDataPrivacyData}
            updateManualDataPrivacyData={updateManualDataPrivacyData}
          />
        );
      case 'website-performance-tech':
        return (
          <PerformanceMobileCategory
            realData={realData}
            businessData={businessData}
          />
        );
      case 'social-media-performance':
        return (
          <SocialMediaCategory
            realData={realData}
            businessData={businessData}
            manualSocialData={manualSocialData}
            updateSocialData={updateSocialData}
            manualWorkplaceData={manualWorkplaceData}
            updateWorkplaceData={updateWorkplaceData}
            manualIndustryReviewData={manualIndustryReviewData}
            updateIndustryReviewData={updateManualIndustryReviewData}
            manualOnlinePresenceData={manualOnlinePresenceData}
            updateOnlinePresenceData={updateManualOnlinePresenceData}
          />
        );
      case 'market-environment':
        console.log('📊 Rendering market-environment section');
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Markt & Marktumfeld</h2>
              <p className="text-gray-300">Stundensatz, Personal und Wettbewerbsumfeld</p>
            </div>
            <StaffServiceCategory 
              businessData={businessData}
              realData={realData}
              staffQualificationData={staffQualificationData}
              updateStaffQualificationData={updateStaffQualificationData}
              manualCorporateIdentityData={manualCorporateIdentityData}
              updateCorporateIdentityData={updateCorporateIdentityData}
              quoteResponseData={quoteResponseData}
              updateQuoteResponseData={updateQuoteResponseData}
              hourlyRateData={hourlyRateData}
              updateHourlyRateData={updateHourlyRateData}
            />
          </div>
        );
      case 'corporate-appearance':
        console.log('🎨 Rendering corporate-appearance section');
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Außendarstellung & Erscheinungsbild</h2>
              <p className="text-gray-300">Corporate Design</p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
              <CorporateIdentityInput 
                businessData={{
                  companyName: realData.company.name,
                  url: businessData.url
                }}
                manualCorporateIdentityData={manualCorporateIdentityData}
                onUpdate={updateCorporateIdentityData}
              />
            </div>
          </div>
        );
      case 'service-quality':
        console.log('⭐ Rendering service-quality section');
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Qualität · Service · Kundenorientierung</h2>
              <p className="text-gray-300">Kundenservice und Angebotserstellung</p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
              <QuoteResponseInput 
                data={quoteResponseData}
                onDataChange={updateQuoteResponseData}
              />
            </div>
          </div>
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
            hourlyRateData={hourlyRateData}
            updateHourlyRateData={updateHourlyRateData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="w-full p-6 space-y-6">
        {/* Header Section */}
        <div className="w-full bg-gray-800/30 rounded-lg p-6 border border-gray-700">
          <div className="space-y-4">
            {/* Top Row - Button and Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button onClick={onReset} variant="outline" size="sm" className="shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Neue Analyse
                </Button>
                <h1 className="text-2xl font-bold text-yellow-400">Analyse-Ergebnisse</h1>
              </div>
              
              {/* Export Buttons */}
              <div className="flex flex-wrap gap-2">
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
                  manualImprintData={manualImprintData}
                  manualSocialData={manualSocialData}
                  manualWorkplaceData={manualWorkplaceData}
                  manualCorporateIdentityData={manualCorporateIdentityData}
                  manualCompetitors={manualCompetitors}
                  competitorServices={competitorServices}
                  companyServices={companyServices}
                  deletedCompetitors={deletedCompetitors}
                  removedMissingServices={removedMissingServices}
                  hourlyRateData={hourlyRateData}
                  manualKeywordData={manualKeywordData}
                  keywordScore={keywordsScore}
                  staffQualificationData={staffQualificationData}
                  manualContentData={manualContentData}
                  manualAccessibilityData={manualAccessibilityData}
                  manualBacklinkData={manualBacklinkData}
                  manualDataPrivacyData={manualDataPrivacyData}
                  calculatedOwnCompanyScore={currentOwnCompanyScore}
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
                  manualContentData={manualContentData}
                  manualAccessibilityData={manualAccessibilityData}
                  manualBacklinkData={manualBacklinkData}
                  manualDataPrivacyData={manualDataPrivacyData}
                  privacyData={privacyData}
                  accessibilityData={accessibilityData}
                />
              </div>
            </div>
            
            {/* Website Info */}
            <div className="flex flex-wrap items-center gap-3 text-gray-300">
              <Globe className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="text-sm break-all">{businessData.url}</span>
              <Badge variant="secondary" className="shrink-0">
                <Building className="h-3 w-3 mr-1" />
                {industryNames[businessData.industry]}
              </Badge>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              console.log('🔍 Rendering button for category:', category.id, category.title);
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    console.log('🎯 Category clicked:', category.id, 'Current active:', activeCategory);
                    setActiveCategory(category.id);
                    console.log('✅ Set active category to:', category.id);
                  }}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    activeCategory === category.id 
                      ? 'bg-yellow-400 text-black border-yellow-400 shadow-lg' 
                      : 'bg-gray-800/40 text-gray-300 border-gray-600 hover:bg-gray-700/40 hover:border-gray-500'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-center">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-medium">{category.title}</div>
                    <div className={`text-lg font-bold ${
                      activeCategory === category.id ? 'text-black' : getScoreColor(category.score)
                    }`}>
                      {Math.round(category.score)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Overall Rating */}
        <div className="w-full">
          <OverallRating 
            businessData={businessData}
            realData={realData}
            manualSocialData={manualSocialData}
            keywordsScore={keywordsScore}
            staffQualificationData={staffQualificationData}
            quoteResponseData={quoteResponseData}
            hourlyRateData={hourlyRateData}
            manualWorkplaceData={manualWorkplaceData}
            competitorScore={currentOwnCompanyScore}
          />
        </div>

        {/* Active Category Content */}
        <div className="w-full">
          {renderActiveCategory()}
        </div>
      </div>
    </div>
  );
};

export default SidebarAnalysisDashboard;
