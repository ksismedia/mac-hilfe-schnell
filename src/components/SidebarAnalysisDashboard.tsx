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
  const [currentOwnCompanyScore, setCurrentOwnCompanyScore] = useState<number>(75);
  const [manualKeywordData, setManualKeywordData] = useState<Array<{ keyword: string; found: boolean; volume: number; position: number }> | null>(null);
  const [privacyData, setPrivacyData] = useState<any>(null);
  const [accessibilityData, setAccessibilityData] = useState<any>(null);

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
  
  const [showCategoryDetails, setShowCategoryDetails] = useState(false);
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

  const { saveAnalysis } = useSavedAnalyses();

  useEffect(() => {
    if (loadedAnalysisId) {
      console.log('Loading saved analysis:', loadedAnalysisId);
      // Load analysis from storage would go here
    } else {
      console.log('Loading fresh analysis for:', businessData.url);
      const loadAnalysis = async () => {
        setIsLoading(true);
        try {
          const data = await BusinessAnalysisService.analyzeWebsite(businessData.url, businessData.address, businessData.industry);
          setRealData(data);
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
      };

      loadAnalysis();
    }
  }, [businessData, loadedAnalysisId, toast]);

  if (isLoading) {
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
            Analysiere Webseite...
          </h2>
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
            {/* Export components temporarily removed to fix build */}
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

        {/* Executive Summary mit Accordions */}
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
      </div>
    </div>
  );
};

export default SidebarAnalysisDashboard;