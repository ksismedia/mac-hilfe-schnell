import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Building, Search, Zap, Share2, Users, TrendingUp, Eye, Headphones } from 'lucide-react';
import handwerkStarsLogo from '/lovable-uploads/a9346d0f-f4c9-4697-8b95-78dd3609ddd4.png';

// Category Components
import SEOContentCategory from './analysis/categories/SEOContentCategory';
import PerformanceMobileCategory from './analysis/categories/PerformanceMobileCategory';
import SocialMediaCategory from './analysis/categories/SocialMediaCategory';
import StaffServiceCategory from './analysis/categories/StaffServiceCategory';
import { CorporateIdentityInput } from './analysis/CorporateIdentityInput';
import QuoteResponseInput from './analysis/QuoteResponseInput';

// Components
import SaveAnalysisDialog from './SaveAnalysisDialog';
import CustomerHTMLExport from './analysis/CustomerHTMLExport';
import SelectiveHTMLExport from './analysis/SelectiveHTMLExport';
import OverallRating from './analysis/OverallRating';

// Services
import { BusinessAnalysisService, RealBusinessData } from '@/services/BusinessAnalysisService';

// Hooks
import { useManualData } from '@/hooks/useManualData';
import { useSavedAnalyses, SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { loadSavedAnalysisData } from '@/utils/analysisLoader';
import { calculateOnlineQualityAuthorityScore, calculateWebsitePerformanceTechScore, calculateSocialMediaPerformanceScore, calculateMarketEnvironmentScore, calculateCorporateAppearanceScore, calculateServiceQualityScore } from './analysis/export/scoreCalculations';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
}

interface SimpleAnalysisDashboardProps {
  businessData: BusinessData;
  onReset: () => void;
  analysisData?: SavedAnalysis | null;  // Direct analysis data
}

const industryNames = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro'
};

const SimpleAnalysisDashboard: React.FC<SimpleAnalysisDashboardProps> = ({ 
  businessData, 
  onReset, 
  analysisData 
}) => {
  const [realData, setRealData] = useState<RealBusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFromStorage, setIsLoadingFromStorage] = useState(false);
  const [keywordsScore, setKeywordsScore] = useState<number | null>(null);
  const [currentOwnCompanyScore, setCurrentOwnCompanyScore] = useState<number>(75);
  const [manualKeywordData, setManualKeywordData] = useState<Array<{ keyword: string; found: boolean; volume: number; position: number }> | null>(null);
  const [privacyData, setPrivacyData] = useState<any>(null);
  const [accessibilityData, setAccessibilityData] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('');
  const [showCategoryNav, setShowCategoryNav] = useState(false);
  
  const handleKeywordsScoreChange = (score: number | null) => {
    setKeywordsScore(score);
  };
  
  const handleCompanyScoreChange = (score: number) => {
    setCurrentOwnCompanyScore(score);
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
    staffQualificationData,
    hourlyRateData,
    quoteResponseData,
    manualContentData,
    manualAccessibilityData,
    manualBacklinkData,
    manualDataPrivacyData,
    updateImprintData,
    updateSocialData,
    updateWorkplaceData,
    updateCorporateIdentityData,
    updateStaffQualificationData,
    updateHourlyRateData,
    updateQuoteResponseData,
    updateManualContentData,
    updateManualAccessibilityData,
    updateManualBacklinkData,
    updateManualDataPrivacyData
  } = useManualData();

  const { saveAnalysis, deleteAnalysis } = useSavedAnalyses();
  const { loadAnalysis } = useSavedAnalyses();

  // Load analysis data or use direct analysis data
  useEffect(() => {
    const loadAnalysisData = async () => {
      if (analysisData) {
        console.log('=== LOADING DIRECT ANALYSIS DATA ===');
        console.log('Analysis data:', analysisData);
        
        setIsLoadingFromStorage(true);
        
        // Set real data directly from analysisData
        setRealData(analysisData.realData);
        
        // Load all manual data directly
        if (analysisData.manualData?.keywordData) {
          setManualKeywordData(analysisData.manualData.keywordData);
        }
        if (analysisData.manualData?.keywordScore !== undefined) {
          setKeywordsScore(analysisData.manualData.keywordScore);
        }
        if (analysisData.manualData?.privacyData) {
          setPrivacyData(analysisData.manualData.privacyData);
        }
        if (analysisData.manualData?.accessibilityData) {
          setAccessibilityData(analysisData.manualData.accessibilityData);
        }
        
        // Load manual data for Staff/Service section
        if (analysisData.manualData?.staffQualificationData) {
          updateStaffQualificationData(analysisData.manualData.staffQualificationData);
        }
        if (analysisData.manualData?.hourlyRateData) {
          updateHourlyRateData(analysisData.manualData.hourlyRateData);
        }
        if (analysisData.manualData?.quoteResponseData) {
          updateQuoteResponseData(analysisData.manualData.quoteResponseData);
        }
        if (analysisData.manualData?.manualContentData) {
          updateManualContentData(analysisData.manualData.manualContentData);
        }
        if (analysisData.manualData?.manualAccessibilityData) {
          updateManualAccessibilityData(analysisData.manualData.manualAccessibilityData);
        }
        if (analysisData.manualData?.manualBacklinkData) {
          updateManualBacklinkData(analysisData.manualData.manualBacklinkData);
        }
        
        // Load saved analysis data using utility function
        loadSavedAnalysisData(
          analysisData,
          updateImprintData,
          updateSocialData,
          updateWorkplaceData,
          updateCorporateIdentityData,
          () => {}, // updateCompetitors - not used in this version
          () => {}, // updateCompetitorServices - not used in this version
          undefined, // updateCompanyServices - not used
          undefined, // setManualKeywordData - not used
          updateStaffQualificationData,
          updateHourlyRateData,
          updateQuoteResponseData
        );
        
        setIsLoadingFromStorage(false);
        
      } else {
        console.log('=== LOADING FRESH ANALYSIS ===');
        console.log('Business data:', businessData);
        
        // Only load new analysis if we don't have real data yet
        setIsLoading(true);
        
        try {
          const newAnalysisData = await BusinessAnalysisService.analyzeWebsite(businessData.url, businessData.address, businessData.industry);
          setRealData(newAnalysisData);
        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysefehler",
            description: "Die Webseite konnte nicht analysiert werden. Bitte versuchen Sie es erneut.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadAnalysisData();
  }, [analysisData]); // Depend on analysisData instead of loadedAnalysisId

  if (isLoading || isLoadingFromStorage) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #000000 100%)',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            border: '4px solid #facc15', 
            borderTop: '4px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <h2 style={{ color: '#facc15', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            {isLoadingFromStorage ? 'Lade gespeicherte Analyse...' : 'Analysiere Webseite...'}
          </h2>
          <p style={{ color: '#888', fontSize: '16px' }}>
            {isLoadingFromStorage ? 'Daten werden aus dem Speicher geladen' : 'Bitte warten, dies kann einige Sekunden dauern'}
          </p>
        </div>
      </div>
    );
  }

  if (!realData) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #000000 100%)',
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
          <h2 style={{ color: '#facc15', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            Keine Daten verfügbar
          </h2>
          <Button onClick={onReset} style={{ marginTop: '20px' }}>
            Neue Analyse starten
          </Button>
        </div>
      </div>
    );
  }

  // Calculate category scores
  const scores = {
    onlineQualityAuthority: calculateOnlineQualityAuthorityScore(
      realData, keywordsScore, businessData, privacyData, accessibilityData, manualContentData, manualBacklinkData
    ),
    websitePerformanceTech: calculateWebsitePerformanceTechScore(realData),
    socialMediaPerformance: calculateSocialMediaPerformanceScore(realData, manualSocialData),
    marketEnvironment: calculateMarketEnvironmentScore(
      realData, hourlyRateData, staffQualificationData, currentOwnCompanyScore, manualWorkplaceData
    ),
    corporateAppearance: calculateCorporateAppearanceScore(manualCorporateIdentityData),
    serviceQuality: calculateServiceQualityScore(quoteResponseData)
  };

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
      icon: Users, 
      score: scores.marketEnvironment
    },
    { 
      id: 'corporate-appearance', 
      title: 'Außendarstellung & Erscheinungsbild', 
      icon: Users, 
      score: scores.corporateAppearance
    },
    { 
      id: 'service-quality', 
      title: 'Qualität · Service · Kundenorientierung', 
      icon: Users, 
      score: scores.serviceQuality
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#facc15';  // 90-100% gold
    if (score >= 61) return '#10b981';  // 61-89% green
    return '#ef4444';                   // 0-60% red
  };

  const renderActiveCategory = () => {
    // Nur rendern wenn die Navigation aktiviert ist
    if (!showCategoryNav) {
      return null;
    }
    
    switch (activeCategory) {
      case 'online-quality-authority':
        return (
          <SEOContentCategory
            businessData={businessData}
            realData={realData}
            keywordsScore={keywordsScore}
            onKeywordsScoreChange={handleKeywordsScoreChange}
            onKeywordDataChange={handleKeywordDataChange}
            manualKeywordData={manualKeywordData}
            privacyData={privacyData}
            setPrivacyData={setPrivacyData}
            accessibilityData={accessibilityData}
            setAccessibilityData={setAccessibilityData}
            manualImprintData={manualImprintData}
            updateImprintData={updateImprintData}
            manualCompetitors={[]}
            competitorServices={{}}
            removedMissingServices={[]}
            companyServices={[]}
            deletedCompetitors={new Set()}
            updateCompetitors={() => {}}
            updateCompetitorServices={() => {}}
            addRemovedMissingService={() => {}}
            updateCompanyServices={() => {}}
            addDeletedCompetitor={() => {}}
            removeDeletedCompetitor={() => {}}
            manualDataPrivacyData={manualDataPrivacyData}
            updateManualDataPrivacyData={updateManualDataPrivacyData}
          />
        );
      case 'website-performance-tech':
        return (
          <PerformanceMobileCategory
            businessData={businessData}
            realData={realData}
          />
        );
      case 'social-media-performance':
        return (
          <SocialMediaCategory
            businessData={businessData}
            realData={realData}
            manualSocialData={manualSocialData}
            updateSocialData={updateSocialData}
            manualWorkplaceData={manualWorkplaceData}
            updateWorkplaceData={updateWorkplaceData}
          />
        );
      case 'market-environment':
      case 'corporate-appearance':
      case 'service-quality':
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #000000 0%, #1f2937 50%, #000000 100%)', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
          <Button 
            onClick={onReset}
            variant="outline"
            style={{ 
              background: 'rgba(31, 41, 55, 0.8)', 
              border: '2px solid #facc15', 
              color: '#facc15' 
            }}
          >
            <ArrowLeft style={{ marginRight: '8px', width: '16px', height: '16px' }} />
            Neue Analyse
          </Button>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <SaveAnalysisDialog
              businessData={businessData}
              realData={realData}
              manualCompetitors={[]}
              competitorServices={{}}
              manualImprintData={manualImprintData}
              manualSocialData={manualSocialData}
              manualWorkplaceData={manualWorkplaceData}
              manualCorporateIdentityData={manualCorporateIdentityData}
              staffQualificationData={staffQualificationData}
              hourlyRateData={hourlyRateData}
              quoteResponseData={quoteResponseData}
              manualContentData={manualContentData}
              manualAccessibilityData={manualAccessibilityData}
              manualBacklinkData={manualBacklinkData}
              keywordScore={keywordsScore}
              manualKeywordData={manualKeywordData}
              privacyData={privacyData}
              accessibilityData={accessibilityData}
            />
            <SelectiveHTMLExport 
              businessData={businessData}
              realData={realData}
              manualSocialData={manualSocialData}
              manualImprintData={manualImprintData}
              keywordScore={keywordsScore}
              manualKeywordData={manualKeywordData}
              privacyData={privacyData}
              accessibilityData={accessibilityData}
            />
          </div>
        </div>

        {/* Company Info */}
        <div style={{ marginBottom: '30px', padding: '20px', background: 'rgba(31, 41, 55, 0.9)', borderRadius: '16px', border: '2px solid rgba(250, 204, 21, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
            <Globe style={{ color: '#facc15', width: '24px', height: '24px' }} />
            <h2 style={{ color: '#facc15', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {realData.company.name}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building style={{ color: '#d1d5db', width: '16px', height: '16px' }} />
              <span style={{ color: '#d1d5db' }}>{businessData.address}</span>
            </div>
            <Badge variant="secondary" style={{ background: '#facc15', color: '#000' }}>
              {industryNames[businessData.industry] || businessData.industry}
            </Badge>
          </div>
        </div>

        {/* Overall Rating */}
        <div style={{ marginBottom: '40px' }}>
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

        {/* Executive Summary als Accordions */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#facc15', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }}>
            Executive Summary - Kategorien
          </h3>
          
          <Accordion type="multiple" className="w-full space-y-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <AccordionItem 
                  key={category.id} 
                  value={category.id} 
                  className="border border-gray-700 rounded-lg bg-gray-800/50"
                >
                  <AccordionTrigger className="px-4 py-3 text-yellow-400 hover:text-yellow-300">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6" />
                        <span className="font-semibold text-lg">{category.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`px-4 py-2 rounded-full text-white text-lg font-bold`}
                          style={{ 
                            backgroundColor: category.score >= 90 ? '#facc15' : 
                                           category.score >= 61 ? '#10b981' : '#ef4444'
                          }}
                        >
                          {Math.round(category.score)} Punkte
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="p-4 bg-gray-900/50 rounded-lg">
                      <h4 className="text-white font-medium mb-4">{category.title}</h4>
                      <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                        <div 
                          className="h-3 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${Math.min(100, category.score)}%`,
                            backgroundColor: getScoreColor(category.score)
                          }}
                        />
                      </div>
                      <div className="text-gray-400 text-sm">
                        Bewertung: {category.score >= 90 ? 'Sehr gut' : category.score >= 61 ? 'Gut' : 'Verbesserung erforderlich'}
                      </div>
                      
                      {/* Category specific content */}
                      <div className="mt-4" onClick={() => setActiveCategory(category.id)}>
                        {category.id === 'online-quality-authority' && (
                          <SEOContentCategory
                            businessData={businessData}
                            realData={realData}
                            keywordsScore={keywordsScore}
                            onKeywordsScoreChange={handleKeywordsScoreChange}
                            onKeywordDataChange={handleKeywordDataChange}
                            manualKeywordData={manualKeywordData}
                            privacyData={privacyData}
                            setPrivacyData={setPrivacyData}
                            accessibilityData={accessibilityData}
                            setAccessibilityData={setAccessibilityData}
                            manualImprintData={manualImprintData}
                            updateImprintData={updateImprintData}
                            manualCompetitors={[]}
                            competitorServices={{}}
                            removedMissingServices={[]}
                            companyServices={[]}
                            deletedCompetitors={new Set()}
                            updateCompetitors={() => {}}
                            updateCompetitorServices={() => {}}
                            addRemovedMissingService={() => {}}
                            updateCompanyServices={() => {}}
                            addDeletedCompetitor={() => {}}
                            removeDeletedCompetitor={() => {}}
                            manualDataPrivacyData={manualDataPrivacyData}
                            updateManualDataPrivacyData={updateManualDataPrivacyData}
                          />
                        )}
                        {category.id === 'website-performance-tech' && (
                          <PerformanceMobileCategory
                            businessData={businessData}
                            realData={realData}
                          />
                        )}
                        {category.id === 'social-media-performance' && (
                          <SocialMediaCategory
                            businessData={businessData}
                            realData={realData}
                            manualSocialData={manualSocialData}
                            updateSocialData={updateSocialData}
                            manualWorkplaceData={manualWorkplaceData}
                            updateWorkplaceData={updateWorkplaceData}
                          />
                        )}
                        {(category.id === 'market-environment' || category.id === 'corporate-appearance' || category.id === 'service-quality') && (
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
                        )}
                      </div>
                      
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default SimpleAnalysisDashboard;