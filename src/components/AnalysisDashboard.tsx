
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Separator } from '@/components/ui/separator';
import { BusinessAnalysisService, RealBusinessData } from '@/services/BusinessAnalysisService';
import OverallRating from '@/components/analysis/OverallRating';
import SEOAnalysis from '@/components/analysis/SEOAnalysis';
import PerformanceAnalysis from '@/components/analysis/PerformanceAnalysis';
import MobileOptimization from '@/components/analysis/MobileOptimization';
import KeywordAnalysis from '@/components/analysis/KeywordAnalysis';
import LocalSEO from '@/components/analysis/LocalSEO';
import ContentAnalysis from '@/components/analysis/ContentAnalysis';
import CompetitorAnalysis from '@/components/analysis/CompetitorAnalysis';
import BacklinkAnalysis from '@/components/analysis/BacklinkAnalysis';
import GoogleReviews from '@/components/analysis/GoogleReviews';
import SocialMediaAnalysis from '@/components/analysis/SocialMediaAnalysis';
import SocialProof from '@/components/analysis/SocialProof';
import ConversionOptimization from '@/components/analysis/ConversionOptimization';
import WorkplaceReviews from '@/components/analysis/WorkplaceReviews';
import ImprintCheck from '@/components/analysis/ImprintCheck';
import IndustryFeatures from '@/components/analysis/IndustryFeatures';
import PDFExport from '@/components/analysis/PDFExport';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';

interface AnalysisDashboardProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
    extensionData?: any;
  };
  onReset: () => void;
}

interface ManualSocialData {
  facebookUrl: string;
  instagramUrl: string;
  facebookFollowers: string;
  instagramFollowers: string;
  facebookLastPost: string;
  instagramLastPost: string;
}

interface ManualImprintData {
  found: boolean;
  elements: string[];
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ businessData, onReset }) => {
  const [manualSocialData, setManualSocialData] = useState<ManualSocialData | null>(null);
  const [manualImprintData, setManualImprintData] = useState<ManualImprintData | null>(null);

  console.log('AnalysisDashboard: Starting analysis for:', businessData.url);

  const { data: realData, isLoading, error, refetch } = useQuery({
    queryKey: ['businessAnalysis', businessData.url, businessData.address],
    queryFn: async () => {
      console.log('useQuery: Calling BusinessAnalysisService.analyzeWebsite with:', {
        url: businessData.url,
        address: businessData.address,
        industry: businessData.industry
      });
      const result = await BusinessAnalysisService.analyzeWebsite(businessData.url, businessData.address, businessData.industry);
      console.log('useQuery: Analysis completed, result:', result);
      return result;
    },
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const handleRefetch = () => {
    console.log('Manual refetch triggered');
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Analyse wird durchgeführt...</CardTitle>
            <CardDescription>Bitte warten Sie, während wir Ihre Daten analysieren.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <RefreshCw className="animate-spin h-6 w-6" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    console.error('Analysis error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Fehler bei der Analyse</CardTitle>
            <CardDescription>Es gab ein Problem beim Abrufen der Daten. Bitte versuchen Sie es später noch einmal.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-red-500">{error.message}</p>
            <Button onClick={handleRefetch}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log('AnalysisDashboard: Rendering with data:', realData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">Analyse-Dashboard</CardTitle>
            <Button variant="outline" onClick={onReset}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Neue Analyse
            </Button>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="local-seo">Lokales SEO</TabsTrigger>
            <TabsTrigger value="content">Inhalt</TabsTrigger>
            <TabsTrigger value="social-media">Social Media</TabsTrigger>
            <TabsTrigger value="imprint">Impressum</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverallRating businessData={businessData} realData={realData} />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOAnalysis url={businessData.url} realData={realData} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceAnalysis url={businessData.url} realData={realData} />
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <MobileOptimization url={businessData.url} realData={realData} />
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <KeywordAnalysis url={businessData.url} industry={businessData.industry} realData={realData} />
          </TabsContent>

          <TabsContent value="local-seo" className="space-y-6">
            <LocalSEO businessData={businessData} />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <ContentAnalysis url={businessData.url} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="social-media" className="space-y-6">
            <SocialMediaAnalysis 
              businessData={businessData} 
              realData={realData} 
              onManualDataChange={setManualSocialData}
            />
          </TabsContent>

          <TabsContent value="imprint" className="space-y-6">
            <ImprintCheck 
              url={businessData.url} 
              realData={realData}
              onManualDataChange={setManualImprintData}
            />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <PDFExport 
              businessData={businessData} 
              realData={realData} 
              manualSocialData={manualSocialData}
              manualImprintData={manualImprintData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
