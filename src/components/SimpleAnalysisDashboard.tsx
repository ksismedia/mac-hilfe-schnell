import React, { useState, useEffect } from 'react';
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
import OverallRating from './analysis/OverallRating';
import { CompanyDataInput } from './analysis/CompanyDataInput';

// Services
import { BusinessAnalysisService, RealBusinessData } from '@/services/BusinessAnalysisService';

// Hooks
import { useManualData } from '@/hooks/useManualData';
import { useSavedAnalyses, SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { useAIReviewStatus } from '@/hooks/useAIReviewStatus';
import { loadSavedAnalysisData } from '@/utils/analysisLoader';
import { calculateOnlineQualityAuthorityScore, calculateWebsitePerformanceTechScore, calculateSocialMediaPerformanceScore, calculateMarketEnvironmentScore, calculateCorporateAppearanceScore, calculateServiceQualityScore } from './analysis/export/scoreCalculations';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei';
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
  'planungsbuero': 'Planungsbüro',
  'facility-management': 'Facility-Management',
  'holzverarbeitung': 'Holzverarbeitung',
  'baeckerei': 'Bäckereifachbetrieb'
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
  const [activeCategory, setActiveCategory] = useState('online-quality-authority');
  
  const handleKeywordsScoreChange = (score: number | null) => {
    setKeywordsScore(score);
  };
  
  const handleCompanyScoreChange = (score: number) => {
    setCurrentOwnCompanyScore(score);
  };

  const handleKeywordDataChange = (keywordData: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null) => {
    setManualKeywordData(keywordData);
  };

  const handleCompanyDataUpdate = (data: { phone: string; email: string }) => {
    if (realData) {
      setRealData({
        ...realData,
        company: {
          ...realData.company,
          phone: data.phone,
          email: data.email
        }
      });
    }
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
    updateManualContentData,
    updateManualAccessibilityData,
    updateManualBacklinkData,
    updateManualDataPrivacyData,
    updateManualLocalSEOData,
    updateManualIndustryReviewData,
    updateManualOnlinePresenceData,
    manualConversionData,
    updateManualConversionData
  } = useManualData();

  // Access saved analyses hook
  const { loadAnalysis } = useSavedAnalyses();

  // AI Review Status Hook
  const { reviewStatus } = useAIReviewStatus(analysisData?.id);

  // Load analysis data or use direct analysis data
  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        if (analysisData) {
          console.log('=== LOADING DIRECT ANALYSIS DATA ===');
          console.log('Analysis data:', analysisData);
          
          setIsLoadingFromStorage(true);
          
          // Validate realData before setting
          if (!analysisData.realData) {
            console.error('🚨 No realData in analysisData');
            toast({
              title: "Fehler",
              description: "Analysedaten sind unvollständig.",
              variant: "destructive",
            });
            setIsLoadingFromStorage(false);
            return;
          }
          
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
          if (analysisData.manualData?.manualConversionData) {
            updateManualConversionData(analysisData.manualData.manualConversionData);
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
            updateQuoteResponseData,
            updateRemovedMissingServices,
            addDeletedCompetitor,
            updateManualContentData,
            updateManualAccessibilityData,
            updateManualBacklinkData,
            updateManualDataPrivacyData,
            updateManualLocalSEOData,
            updateManualIndustryReviewData,
            updateManualOnlinePresenceData,
            updateManualConversionData
          );
          
          console.log('=== DIRECT ANALYSIS DATA LOADED SUCCESSFULLY ===');
          setIsLoadingFromStorage(false);
          return;
        } 
        
        if (!realData) {
          // Only load new analysis if we don't have real data yet
          console.log('🔄 Starting new analysis...');
          console.log('Business data:', businessData);
          setIsLoading(true);
          
          try {
            const newAnalysisData = await BusinessAnalysisService.analyzeWebsite(businessData.url, businessData.address, businessData.industry);
            console.log('✅ Analysis completed, data received:', !!newAnalysisData);
            console.log('Analysis data keys:', newAnalysisData ? Object.keys(newAnalysisData) : 'none');
            
            // Validate analysis result
            if (!newAnalysisData || !newAnalysisData.company) {
              console.error('🚨 Invalid analysis data returned');
              toast({
                title: "Analysefehler",
                description: "Die Website-Analyse lieferte ungültige Daten.",
                variant: "destructive",
              });
              setIsLoading(false);
              setIsLoadingFromStorage(false);
              return;
            }
            
            console.log('📊 Setting real data to state...');
            setRealData(newAnalysisData);
            console.log('✅ Real data set successfully');
            console.log('✅ Loading states will be reset in finally block');
          } catch (analysisError) {
            console.error('❌ Analysis threw error:', analysisError);
            toast({
              title: "Analysefehler",
              description: analysisError instanceof Error ? analysisError.message : "Die Website-Analyse konnte nicht durchgeführt werden.",
              variant: "destructive",
            });
            setIsLoading(false);
            setIsLoadingFromStorage(false);
            return;
          }
        }
      } catch (error) {
        console.error('❌ Outer catch - Analysis error:', error);
        console.error('Error type:', error instanceof Error ? 'Error' : typeof error);
        console.error('Error details:', error);
        toast({
          title: "Analysefehler",
          description: "Die Website-Analyse konnte nicht durchgeführt werden.",
          variant: "destructive",
        });
        setIsLoading(false);
        setIsLoadingFromStorage(false);
      } finally {
        console.log('🏁 Finally block - resetting loading states');
        setIsLoading(false);
        setIsLoadingFromStorage(false);
        console.log('✅ Loading states reset complete');
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

  // Calculate category scores with error handling
  // Get competitor score from competitors analysis
  const competitorScore = manualCompetitors && manualCompetitors.length > 0 ? 
    Math.min(100, 60 + (manualCompetitors.length * 5)) : null;

  // Calculate new 6-category scores with fallbacks
  let scores;
  try {
    const onlineQualityAuthority = calculateOnlineQualityAuthorityScore(
      realData, keywordsScore, businessData, privacyData, accessibilityData, 
      manualContentData, manualBacklinkData, manualLocalSEOData
    );
    const websitePerformanceTech = calculateWebsitePerformanceTechScore(realData);
    const socialMediaPerformance = calculateSocialMediaPerformanceScore(
      realData, manualSocialData, manualIndustryReviewData, manualOnlinePresenceData
    );
    const marketEnvironment = calculateMarketEnvironmentScore(
      realData, hourlyRateData, staffQualificationData, competitorScore, manualWorkplaceData
    );
    const corporateAppearance = calculateCorporateAppearanceScore(manualCorporateIdentityData);
    const serviceQuality = calculateServiceQualityScore(quoteResponseData);

    // Validate all scores
    scores = {
      onlineQualityAuthority: isNaN(onlineQualityAuthority) ? 50 : Math.max(0, Math.min(100, onlineQualityAuthority)),
      websitePerformanceTech: isNaN(websitePerformanceTech) ? 50 : Math.max(0, Math.min(100, websitePerformanceTech)),
      socialMediaPerformance: isNaN(socialMediaPerformance) ? 50 : Math.max(0, Math.min(100, socialMediaPerformance)),
      marketEnvironment: isNaN(marketEnvironment) ? 50 : Math.max(0, Math.min(100, marketEnvironment)),
      corporateAppearance: isNaN(corporateAppearance) ? 50 : Math.max(0, Math.min(100, corporateAppearance)),
      serviceQuality: isNaN(serviceQuality) ? 50 : Math.max(0, Math.min(100, serviceQuality))
    };

    console.log('✅ Category scores calculated:', scores);
  } catch (error) {
    console.error('🚨 Error calculating category scores:', error);
    scores = {
      onlineQualityAuthority: 50,
      websitePerformanceTech: 50,
      socialMediaPerformance: 50,
      marketEnvironment: 50,
      corporateAppearance: 50,
      serviceQuality: 50
    };
  }

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
            manualConversionData={manualConversionData}
            updateManualConversionData={updateManualConversionData}
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
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2 border-b border-white pb-2 inline-block">Markt & Marktumfeld</h2>
              <p className="text-gray-300 mt-4">Stundensatz, Personal und Wettbewerbsumfeld</p>
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
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2 border-b border-white pb-2 inline-block">Außendarstellung & Erscheinungsbild</h2>
              <p className="text-gray-300 mt-4">Corporate Design</p>
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
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2 border-b border-white pb-2 inline-block">Qualität · Service · Kundenorientierung</h2>
              <p className="text-gray-300 mt-4">Kundenservice und Angebotserstellung</p>
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
          <Button onClick={onReset} variant="outline" size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Neue Analyse
          </Button>
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

        {/* Company Data Input */}
        {realData && (
          <div style={{ 
            maxWidth: '800px',
            margin: '0 auto 40px auto'
          }}>
            <CompanyDataInput
              companyName={realData.company.name}
              currentPhone={realData.company.phone}
              currentEmail={realData.company.email}
              onUpdate={handleCompanyDataUpdate}
            />
          </div>
        )}

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
            <SaveAnalysisDialog
              businessData={businessData}
              realData={realData || {} as RealBusinessData}
              reviewStatus={reviewStatus}
              manualImprintData={manualImprintData}
              manualSocialData={manualSocialData}
              manualWorkplaceData={manualWorkplaceData}
              manualCorporateIdentityData={manualCorporateIdentityData}
              manualCompetitors={manualCompetitors}
              competitorServices={competitorServices}
              removedMissingServices={removedMissingServices}
              deletedCompetitors={deletedCompetitors}
              currentAnalysisId={analysisData?.id}
              manualKeywordData={manualKeywordData}
              keywordScore={keywordsScore}
              companyServices={companyServices}
              staffQualificationData={staffQualificationData}
              hourlyRateData={hourlyRateData}
              quoteResponseData={quoteResponseData}
              manualContentData={manualContentData}
              manualAccessibilityData={manualAccessibilityData}
              manualBacklinkData={manualBacklinkData}
              manualDataPrivacyData={manualDataPrivacyData}
              manualLocalSEOData={manualLocalSEOData}
              manualIndustryReviewData={manualIndustryReviewData}
              manualOnlinePresenceData={manualOnlinePresenceData}
              manualConversionData={manualConversionData}
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
              manualConversionData={manualConversionData}
              deletedCompetitors={deletedCompetitors}
              removedMissingServices={removedMissingServices}
              hourlyRateData={hourlyRateData}
              staffQualificationData={staffQualificationData}
              quoteResponseData={quoteResponseData}
              manualContentData={manualContentData}
              manualAccessibilityData={manualAccessibilityData}
              manualBacklinkData={manualBacklinkData}
              manualDataPrivacyData={manualDataPrivacyData}
              manualLocalSEOData={manualLocalSEOData}
              manualIndustryReviewData={manualIndustryReviewData}
              manualOnlinePresenceData={manualOnlinePresenceData}
              calculatedOwnCompanyScore={currentOwnCompanyScore}
              keywordScore={keywordsScore}
              manualKeywordData={manualKeywordData}
              privacyData={privacyData}
              accessibilityData={accessibilityData}
            />
          </div>
        </div>

        {/* Category Navigation */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                style={{
                  background: isActive ? '#facc15' : 'rgba(31, 41, 55, 0.8)',
                  color: isActive ? '#000' : '#d1d5db',
                  border: isActive ? '3px solid #facc15' : '2px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 8px 25px rgba(250, 204, 21, 0.3)' : '0 4px 15px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <IconComponent style={{ width: '28px', height: '28px', margin: '0 auto' }} />
                </div>
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                  {category.title}
                </div>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '20px',
                  color: isActive ? '#000' : getScoreColor(category.score)
                }}>
                  {Math.round(category.score)} Punkte
                </div>
              </button>
            );
          })}
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
            manualContentData={manualContentData}
            manualAccessibilityData={manualAccessibilityData}
            manualBacklinkData={manualBacklinkData}
            manualDataPrivacyData={manualDataPrivacyData}
            manualLocalSEOData={manualLocalSEOData}
            manualIndustryReviewData={manualIndustryReviewData}
            manualOnlinePresenceData={manualOnlinePresenceData}
            privacyData={privacyData}
            accessibilityData={accessibilityData}
          />
        </div>

        {/* Active Category Content */}
        <div>
          {renderActiveCategory()}
        </div>
      </div>
    </div>
  );
};

export default SimpleAnalysisDashboard;