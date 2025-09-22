import React, { useState, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Building, Search, Zap, Share2, Users } from 'lucide-react';
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
import AccordionExecutiveSummary from './analysis/AccordionExecutiveSummary';

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
    updateHourlyRateData,
    updateQuoteResponseData,
    updateManualContentData,
    updateManualAccessibilityData,
    updateManualBacklinkData,
    updateManualDataPrivacyData
  } = useManualData();

  // Access saved analyses hook
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
          updateCompetitors,
          updateCompetitorServices,
          updateCompanyServices,
          setManualKeywordData,
          updateStaffQualificationData,
          updateHourlyRateData,
          updateQuoteResponseData
        );
        
        console.log('=== DIRECT ANALYSIS DATA LOADED SUCCESSFULLY ===');
        setIsLoadingFromStorage(false);
        return;
      } 
      
      if (!realData) {
        // Only load new analysis if we don't have real data yet
        setIsLoading(true);
        
        try {
          const newAnalysisData = await BusinessAnalysisService.analyzeWebsite(businessData.url, businessData.address, businessData.industry);
          setRealData(newAnalysisData);
        } catch (error) {
          console.error('Analysis error:', error);
          toast({
            title: "Analysefehler",
            description: "Die Website-Analyse konnte nicht durchgeführt werden.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
          setIsLoadingFromStorage(false);
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
            Website wird analysiert...
          </h2>
          <p style={{ color: '#d1d5db' }}>Dies kann einige Sekunden dauern</p>
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
          <h2 style={{ color: '#ef4444', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
            Analysefehler
          </h2>
          <p style={{ color: '#d1d5db', marginBottom: '20px' }}>
            Die Website konnte nicht analysiert werden
          </p>
          <Button onClick={onReset} variant="outline">Zurück zur Eingabe</Button>
        </div>
      </div>
    );
  }

  // Calculate category scores
  // Get competitor score from competitors analysis
  const competitorScore = manualCompetitors && manualCompetitors.length > 0 ? 
    Math.min(100, 60 + (manualCompetitors.length * 5)) : null;

  // Calculate new 6-category scores
  const scores = {
    onlineQualityAuthority: calculateOnlineQualityAuthorityScore(
      realData, keywordsScore, businessData, privacyData, accessibilityData, 
      manualContentData, manualBacklinkData
    ),
    websitePerformanceTech: calculateWebsitePerformanceTechScore(realData),
    socialMediaPerformance: calculateSocialMediaPerformanceScore(realData, manualSocialData),
    marketEnvironment: calculateMarketEnvironmentScore(
      realData, hourlyRateData, staffQualificationData, competitorScore, manualWorkplaceData
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
            onNavigateToCategory={(categoryId: string) => setActiveCategory(categoryId)}
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
          />
        );
      case 'market-environment':
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
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Außendarstellung & Erscheinungsbild</h2>
              <p className="text-gray-300">Corporate Design und Unternehmensidentität</p>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
              <CorporateIdentityInput 
                businessData={{
                  companyName: realData?.company?.name || businessData.url,
                  url: businessData.url
                }}
                manualCorporateIdentityData={manualCorporateIdentityData}
                onUpdate={updateCorporateIdentityData}
              />
            </div>
          </div>
        );
      case 'service-quality':
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
    <div style={{ 
      minHeight: '100vh', 
      background: '#000000',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Logo Section */}
        <div style={{ 
          textAlign: 'center',
          marginBottom: '48px',
          paddingTop: '40px'
        }}>
          <img 
            src={handwerkStarsLogo} 
            alt="Handwerk Stars Logo" 
            style={{ 
              height: '120px', 
              maxWidth: '400px',
              objectFit: 'contain',
              margin: '0 auto'
            }}
          />
        </div>

        {/* Button Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{ 
            display: 'inline-flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <Button onClick={onReset} variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Neue Analyse
            </Button>
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
              deletedCompetitors={deletedCompetitors}
              removedMissingServices={removedMissingServices}
              hourlyRateData={hourlyRateData}
              staffQualificationData={staffQualificationData}
              quoteResponseData={quoteResponseData}
              manualContentData={manualContentData}
              manualAccessibilityData={manualAccessibilityData}
              manualBacklinkData={manualBacklinkData}
              keywordScore={keywordsScore}
              manualKeywordData={manualKeywordData}
              privacyData={privacyData}
              accessibilityData={accessibilityData}
              currentAnalysisId={analysisData?.id}
            />
          </div>
        </div>

        {/* Title Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <h1 style={{ 
            color: '#facc15', 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0 0 16px 0' 
          }}>
            Analyse-Ergebnisse
          </h1>
          
          {/* Website Info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap' 
          }}>
            <Globe className="h-4 w-4" style={{ color: '#9ca3af' }} />
            <span style={{ color: '#d1d5db', fontSize: '16px' }}>{businessData.url}</span>
            <Badge variant="secondary">
              <Building className="h-3 w-3 mr-1" />
              {industryNames[businessData.industry]}
            </Badge>
          </div>
        </div>

        {/* Export Buttons Section */}
        <div style={{
          marginBottom: '40px'
        }}>
          <div style={{ 
            display: 'flex',
            gap: '20px',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
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
              staffQualificationData={staffQualificationData}
              quoteResponseData={quoteResponseData}
              manualContentData={manualContentData}
              manualAccessibilityData={manualAccessibilityData}
              manualBacklinkData={manualBacklinkData}
              manualDataPrivacyData={manualDataPrivacyData}
              calculatedOwnCompanyScore={currentOwnCompanyScore}
              keywordScore={keywordsScore}
              manualKeywordData={manualKeywordData}
              privacyData={privacyData}
              accessibilityData={accessibilityData}
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
              staffQualificationData={staffQualificationData}
              quoteResponseData={quoteResponseData}
              manualContentData={manualContentData}
              manualAccessibilityData={manualAccessibilityData}
              manualBacklinkData={manualBacklinkData}
              manualDataPrivacyData={manualDataPrivacyData}
              manualKeywordData={manualKeywordData}
              keywordScore={keywordsScore}
              privacyData={privacyData}
              accessibilityData={accessibilityData}
            />
        </div>
        </div>

        {/* Executive Summary mit Accordions */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ color: '#facc15', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '30px' }}>
            Executive Summary
          </h3>
          
          {/* Category Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div 
                  key={category.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors cursor-pointer"
                  onClick={() => {
                    setActiveCategory(category.id);
                    setShowCategoryNav(true);
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <IconComponent className="h-5 w-5 text-yellow-400" />
                    <div 
                      className="px-3 py-1 rounded-full text-white text-sm font-bold"
                      style={{ backgroundColor: getScoreColor(category.score) }}
                    >
                      {Math.round(category.score)}%
                    </div>
                  </div>
                  <h3 className="text-white font-medium text-sm mb-2">{category.title}</h3>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, category.score)}%`,
                        backgroundColor: getScoreColor(category.score)
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
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
                          className={`px-4 py-2 rounded-full text-white text-lg font-bold ${
                            category.score >= 90 ? 'bg-yellow-500' : 
                            category.score >= 61 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        >
                          {Math.round(category.score)} Punkte
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="mt-4">
                      {/* Hier wird der Category Content gerendert */}
                      {renderActiveCategory && category.id === 'online-quality-authority' && (
                        <div onClick={() => setActiveCategory(category.id)}>
                          {renderActiveCategory()}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Executive Summary mit Accordions */}
        <div style={{ marginBottom: '40px' }}>
          <AccordionExecutiveSummary 
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

        {/* Active Category Content - nur anzeigen wenn Navigation aktiv ist */}
        {showCategoryNav && (
          <div>
            {renderActiveCategory()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleAnalysisDashboard;