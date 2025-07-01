
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
import ImprintCheck from './analysis/ImprintCheck';
import IndustryFeatures from './analysis/IndustryFeatures';
import PDFExport from './analysis/PDFExport';
import HTMLExport from './analysis/HTMLExport';
import CustomerHTMLExport from './analysis/CustomerHTMLExport';
import OverallRating from './analysis/OverallRating';
import SaveAnalysisDialog from './SaveAnalysisDialog';
import KeywordAnalysis from './analysis/KeywordAnalysis';
import ManualCompetitorInput from './analysis/ManualCompetitorInput';

// Services
import { BusinessAnalysisService, RealBusinessData } from '@/services/BusinessAnalysisService';

// Hooks
import { useManualData } from '@/hooks/useManualData';

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
  const { toast } = useToast();

  // Manual data management
  const {
    manualImprintData,
    manualSocialData,
    manualWorkplaceData,
    manualCompetitors,
    competitorServices,
    updateImprintData,
    updateSocialData,
    updateWorkplaceData,
    updateCompetitors,
    updateCompetitorServices
  } = useManualData();

  // Transform competitorServices for export components
  const transformedCompetitorServices = Object.keys(competitorServices).reduce((acc, key) => {
    acc[key] = competitorServices[key].services;
    return acc;
  }, {} as { [competitorName: string]: string[] });

  // Load analysis data
  useEffect(() => {
    const loadAnalysisData = async () => {
      console.log('Performing analysis for:', businessData);
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
    };

    loadAnalysisData();
  }, [businessData, toast]);

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
          
          <div className="flex flex-wrap items-center gap-2">
            <SaveAnalysisDialog 
              businessData={businessData}
              realData={realData}
              manualImprintData={manualImprintData}
              manualSocialData={manualSocialData}
              manualWorkplaceData={manualWorkplaceData}
              manualCompetitors={manualCompetitors}
              competitorServices={competitorServices}
            />
            <HTMLExport 
              businessData={businessData}
              realData={realData}
              manualImprintData={manualImprintData}
              manualSocialData={manualSocialData}
              manualCompetitors={manualCompetitors}
              competitorServices={transformedCompetitorServices}
            />
            <CustomerHTMLExport 
              businessData={businessData}
              realData={realData}
              manualImprintData={manualImprintData}
              manualSocialData={manualSocialData}
              manualCompetitors={manualCompetitors}
              competitorServices={transformedCompetitorServices}
            />
            <PDFExport 
              businessData={businessData} 
              realData={realData}
              manualImprintData={manualImprintData}
              manualSocialData={manualSocialData}
              manualCompetitors={manualCompetitors}
              competitorServices={transformedCompetitorServices}
            />
          </div>
        </div>

        {/* Overall Rating */}
        <div className="mb-6">
          <OverallRating 
            businessData={businessData}
            realData={realData}
          />
        </div>

        {/* Analysis Tabs - Fixed Layout */}
        <div className="space-y-6">
          <Tabs defaultValue="seo" className="w-full">
            <div className="mb-6">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-gray-800 border border-yellow-400/30 h-auto">
                <TabsTrigger value="seo" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs lg:text-sm py-2">
                  SEO
                </TabsTrigger>
                <TabsTrigger value="performance" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs lg:text-sm py-2">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="mobile" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs lg:text-sm py-2">
                  Mobile
                </TabsTrigger>
                <TabsTrigger value="social" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs lg:text-sm py-2">
                  Social
                </TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs lg:text-sm py-2">
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="competitors" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs lg:text-sm py-2">
                  Konkurrenz
                </TabsTrigger>
                <TabsTrigger value="legal" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs lg:text-sm py-2">
                  Legal
                </TabsTrigger>
                <TabsTrigger value="workplace" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black text-xs lg:text-sm py-2">
                  Arbeitgeber
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="seo" className="space-y-6 mt-0">
              <SEOAnalysis url={businessData.url} realData={realData} />
              <KeywordAnalysis url={businessData.url} industry={businessData.industry} realData={realData} />
              <LocalSEO businessData={businessData} />
              <ContentAnalysis url={businessData.url} industry={businessData.industry} />
              <BacklinkAnalysis url={businessData.url} />
            </TabsContent>

            <TabsContent value="performance" className="space-y-6 mt-0">
              <PerformanceAnalysis url={businessData.url} realData={realData} />
            </TabsContent>

            <TabsContent value="mobile" className="space-y-6 mt-0">
              <MobileOptimization url={businessData.url} realData={realData} />
            </TabsContent>

            <TabsContent value="social" className="space-y-6 mt-0">
              <SocialMediaAnalysis 
                businessData={businessData} 
                realData={realData}
                manualData={manualSocialData}
                onManualDataChange={updateSocialData}
              />
              <SocialProof businessData={businessData} realData={realData} />
              <ConversionOptimization url={businessData.url} industry={businessData.industry} />
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
                onCompetitorsChange={updateCompetitors}
                onCompetitorServicesChange={updateCompetitorServices}
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

            <TabsContent value="workplace" className="space-y-6 mt-0">
              <WorkplaceReviews 
                businessData={businessData} 
                realData={realData}
                manualData={manualWorkplaceData}
                onManualDataChange={updateWorkplaceData}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
