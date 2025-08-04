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

interface SimpleAnalysisDashboardProps {
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

const SimpleAnalysisDashboard: React.FC<SimpleAnalysisDashboardProps> = ({ 
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
  const scores = {
    seoAndContent: calculateSEOContentScore(realData, keywordsScore, businessData, privacyData, accessibilityData),
    performanceAndMobile: calculatePerformanceMobileScore(realData),
    socialMedia: calculateSocialMediaCategoryScore(realData, manualSocialData, manualWorkplaceData),
    staffAndService: calculateStaffServiceScore(staffQualificationData, quoteResponseData, manualCorporateIdentityData, hourlyRateData)
  };

  const categories = [
    { 
      id: 'seo-content', 
      title: 'SEO & Content', 
      icon: Search, 
      score: scores.seoAndContent
    },
    { 
      id: 'performance-mobile', 
      title: 'Performance & Technik', 
      icon: Zap, 
      score: scores.performanceAndMobile
    },
    { 
      id: 'social-media', 
      title: 'Social Media', 
      icon: Share2, 
      score: scores.socialMedia
    },
    { 
      id: 'staff-service', 
      title: 'Personal & Service', 
      icon: Users, 
      score: scores.staffAndService
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#facc15';
    if (score >= 60) return '#10b981';
    return '#ef4444';
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
              manualKeywordData={manualKeywordData}
              keywordScore={keywordsScore}
              privacyData={privacyData}
              accessibilityData={accessibilityData}
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