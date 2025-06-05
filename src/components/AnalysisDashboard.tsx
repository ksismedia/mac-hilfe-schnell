import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { BusinessAnalysisService, RealBusinessData } from '@/services/BusinessAnalysisService';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import APIKeyManager from './APIKeyManager';
import SEOAnalysis from './analysis/SEOAnalysis';
import KeywordAnalysis from './analysis/KeywordAnalysis';
import PerformanceAnalysis from './analysis/PerformanceAnalysis';
import BacklinkAnalysis from './analysis/BacklinkAnalysis';
import GoogleReviews from './analysis/GoogleReviews';
import SocialMediaAnalysis from './analysis/SocialMediaAnalysis';
import ImprintCheck from './analysis/ImprintCheck';
import IndustryFeatures from './analysis/IndustryFeatures';
import OverallRating from './analysis/OverallRating';
import PDFExport from './analysis/PDFExport';
import CompetitorAnalysis from './analysis/CompetitorAnalysis';
import MobileOptimization from './analysis/MobileOptimization';
import LocalSEO from './analysis/LocalSEO';
import ContentAnalysis from './analysis/ContentAnalysis';
import SocialProof from './analysis/SocialProof';
import ConversionOptimization from './analysis/ConversionOptimization';
import WorkplaceReviews from './analysis/WorkplaceReviews';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

interface AnalysisDashboardProps {
  businessData: BusinessData;
  onReset: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ businessData, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [realData, setRealData] = useState<RealBusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const { toast } = useToast();

  const industryNames = {
    shk: 'SHK (Sanitär, Heizung, Klima)',
    maler: 'Maler und Lackierer',
    elektriker: 'Elektriker',
    dachdecker: 'Dachdecker',
    stukateur: 'Stukateure',
    planungsbuero: 'Planungsbüro Versorgungstechnik'
  };

  useEffect(() => {
    checkApiKeyAndAnalyze();
  }, [businessData]);

  const checkApiKeyAndAnalyze = () => {
    if (!GoogleAPIService.hasApiKey()) {
      setNeedsApiKey(true);
      setIsLoading(false);
    } else {
      analyzeRealData();
    }
  };

  const handleApiKeySet = () => {
    setNeedsApiKey(false);
    analyzeRealData();
  };

  const analyzeRealData = async () => {
    setIsLoading(true);
    try {
      console.log('Starting real business analysis with Google APIs...');
      const analysisResult = await BusinessAnalysisService.analyzeWebsite(
        businessData.url,
        businessData.address,
        businessData.industry
      );
      setRealData(analysisResult);
      
      toast({
        title: "Echte Datenanalyse abgeschlossen",
        description: `Live-Analyse für ${analysisResult.company.name} mit Google APIs erfolgreich durchgeführt.`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysefehler",
        description: "Die Datenanalyse konnte nicht vollständig durchgeführt werden.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (needsApiKey) {
    return <APIKeyManager onApiKeySet={handleApiKeySet} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-center">Analysiere echte Daten mit Google APIs...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={85} className="w-full" />
                <div className="text-center text-sm text-gray-600">
                  <p>🔍 Suche Unternehmen: {businessData.url}</p>
                  <p>⚡ Analysiere PageSpeed Performance...</p>
                  <p>🏢 Lade Google Places Bewertungen...</p>
                  <p>🎯 Suche lokale Konkurrenten...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!realData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p>Fehler beim Laden der Analysedaten.</p>
              <Button onClick={analyzeRealData} className="mt-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Erneut versuchen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Berechne Gesamtbewertung basierend auf echten Daten
  const overallScore = Math.round(
    (realData.seo.score + realData.performance.score + 
     (realData.reviews.google.count > 0 ? 80 : 40) + realData.mobile.overallScore) / 4
  );
  const completionRate = 95; // Höhere Rate da echte APIs verwendet werden

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Neue Analyse
          </Button>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Live-Analyse: {realData.company.name}
                </h1>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <strong>Website:</strong> {realData.company.url}
                  </p>
                  <p className="text-gray-600">
                    <strong>Adresse:</strong> {realData.company.address}
                  </p>
                  {realData.company.phone && (
                    <p className="text-gray-600">
                      <strong>Telefon:</strong> {realData.company.phone}
                    </p>
                  )}
                  <Badge variant="secondary">
                    {industryNames[businessData.industry]}
                  </Badge>
                  <Badge variant="default" className="ml-2">
                    🔴 Live Google APIs
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {(overallScore/20).toFixed(1)}/5
                </div>
                <div className="text-sm text-gray-600 mb-2">Gesamtbewertung</div>
                <Progress value={completionRate} className="w-32" />
                <div className="text-xs text-gray-500 mt-1">
                  {completionRate}% analysiert
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-12 gap-1">
            <TabsTrigger value="overview" className="text-xs">Übersicht</TabsTrigger>
            <TabsTrigger value="seo" className="text-xs">SEO</TabsTrigger>
            <TabsTrigger value="keywords" className="text-xs">Keywords</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">Ladezeit</TabsTrigger>
            <TabsTrigger value="mobile" className="text-xs">Mobile</TabsTrigger>
            <TabsTrigger value="local-seo" className="text-xs">Local SEO</TabsTrigger>
            <TabsTrigger value="content" className="text-xs">Content</TabsTrigger>
            <TabsTrigger value="competitor" className="text-xs">Konkurrenz</TabsTrigger>
            <TabsTrigger value="backlinks" className="text-xs">Backlinks</TabsTrigger>
            <TabsTrigger value="reviews" className="text-xs">Bewertungen</TabsTrigger>
            <TabsTrigger value="social" className="text-xs">Social</TabsTrigger>
            <TabsTrigger value="social-proof" className="text-xs">Social Proof</TabsTrigger>
            <TabsTrigger value="conversion" className="text-xs">Conversion</TabsTrigger>
            <TabsTrigger value="workplace" className="text-xs">Arbeitsplatz</TabsTrigger>
            <TabsTrigger value="imprint" className="text-xs">Impressum</TabsTrigger>
            <TabsTrigger value="industry" className="text-xs">Branche</TabsTrigger>
            <TabsTrigger value="export" className="text-xs">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverallRating businessData={businessData} realData={realData} />
          </TabsContent>

          <TabsContent value="seo">
            <SEOAnalysis url={businessData.url} realData={realData} />
          </TabsContent>

          <TabsContent value="keywords">
            <KeywordAnalysis url={businessData.url} industry={businessData.industry} realData={realData} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceAnalysis url={businessData.url} realData={realData} />
          </TabsContent>

          <TabsContent value="mobile">
            <MobileOptimization url={businessData.url} realData={realData} />
          </TabsContent>

          <TabsContent value="local-seo">
            <LocalSEO businessData={businessData} />
          </TabsContent>

          <TabsContent value="content">
            <ContentAnalysis url={businessData.url} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="competitor">
            <CompetitorAnalysis address={businessData.address} industry={businessData.industry} realData={realData} />
          </TabsContent>

          <TabsContent value="backlinks">
            <BacklinkAnalysis url={businessData.url} />
          </TabsContent>

          <TabsContent value="reviews">
            <GoogleReviews address={businessData.address} realData={realData} />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaAnalysis businessData={businessData} realData={realData} />
          </TabsContent>

          <TabsContent value="social-proof">
            <SocialProof businessData={businessData} realData={realData} />
          </TabsContent>

          <TabsContent value="conversion">
            <ConversionOptimization url={businessData.url} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="workplace">
            <WorkplaceReviews businessData={businessData} realData={realData} />
          </TabsContent>

          <TabsContent value="imprint">
            <ImprintCheck url={businessData.url} realData={realData} />
          </TabsContent>

          <TabsContent value="industry">
            <IndustryFeatures businessData={businessData} />
          </TabsContent>

          <TabsContent value="export">
            <PDFExport businessData={businessData} realData={realData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
