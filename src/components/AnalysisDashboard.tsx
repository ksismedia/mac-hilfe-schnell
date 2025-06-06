import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Analysis Components
import SEOAnalysis from './analysis/SEOAnalysis';
import PerformanceAnalysis from './analysis/PerformanceAnalysis';
import MobileOptimization from './analysis/MobileOptimization';
import CompetitorAnalysis from './analysis/CompetitorAnalysis';
import LocalSEO from './analysis/LocalSEO';
import ContentAnalysis from './analysis/ContentAnalysis';
import BacklinkAnalysis from './analysis/BacklinkAnalysis';
import KeywordAnalysis from './analysis/KeywordAnalysis';
import SocialMediaAnalysis from './analysis/SocialMediaAnalysis';
import ConversionOptimization from './analysis/ConversionOptimization';
import GoogleReviews from './analysis/GoogleReviews';
import WorkplaceReviews from './analysis/WorkplaceReviews';
import SocialProof from './analysis/SocialProof';
import { PDFExport } from './analysis/PDFExport';
import OverallRating from './analysis/OverallRating';
import ImprintCheck from './analysis/ImprintCheck';
import IndustryFeatures from './analysis/IndustryFeatures';

// Services
import { WebsiteAnalysisService } from '@/services/WebsiteAnalysisService';
import { GoogleAPIService } from '@/services/GoogleAPIService';

interface AnalysisDashboardProps {
  initialDomain?: string;
}

interface AnalysisData {
  domain?: string;
  overallRating?: { score: number };
  seoData?: any;
  performanceData?: any;
  mobileData?: any;
  competitorData?: any;
  localSeoData?: any;
  contentData?: any;
  backlinkData?: any;
  keywordData?: any;
  socialMediaData?: any;
  conversionData?: any;
  googleReviewsData?: any;
  workplaceReviewsData?: any;
  socialProofData?: any;
  imprintCheckData?: any;
  industryFeaturesData?: any;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ initialDomain }) => {
  const [domain, setDomain] = useState(initialDomain || '');
  const [analysisData, setAnalysisData] = useState<AnalysisData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySet, setApiKeySet] = useState(GoogleAPIService.hasApiKey());
  const { toast } = useToast();

  useEffect(() => {
    if (initialDomain && apiKeySet) {
      analyzeWebsite(initialDomain);
    }
  }, [initialDomain, apiKeySet]);

  const handleApiKeySet = () => {
    setApiKeySet(true);
  };

  const analyzeWebsite = async (domainToAnalyze: string = domain) => {
    if (!domainToAnalyze.trim()) {
      toast({
        title: 'Bitte gib eine Domain ein.',
        description: 'Gib eine gültige Domain ein, um die Analyse zu starten.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await WebsiteAnalysisService.analyzeWebsite(domainToAnalyze);
      setAnalysisData(data);
      toast({
        title: 'Analyse abgeschlossen!',
        description: `Die Analyse für ${domainToAnalyze} wurde erfolgreich durchgeführt.`,
      });
    } catch (err: any) {
      console.error('Analysis Error:', err);
      setError(err.message || 'Ein Fehler ist bei der Analyse aufgetreten.');
      toast({
        title: 'Analyse fehlgeschlagen!',
        description: err.message || 'Es gab einen Fehler bei der Durchführung der Analyse.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Website Analyse</CardTitle>
            <CardDescription>Gib eine Domain ein, um eine umfassende Analyse zu starten.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="domain">Domain:</Label>
              <Input
                id="domain"
                type="url"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={isLoading}
              />
              <Button onClick={() => analyzeWebsite()} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analysiere...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analysieren
                  </>
                )}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {analysisData.domain && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Analyse Ergebnisse für {analysisData.domain}</CardTitle>
              <CardDescription>Detaillierte Einblicke in die Performance deiner Website.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <OverallRating overallRating={analysisData.overallRating} />
              </div>
              <Tabs defaultValue="seo" className="w-full">
                <TabsList>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="mobile">Mobile</TabsTrigger>
                  <TabsTrigger value="competitor">Konkurrenzanalyse</TabsTrigger>
                  <TabsTrigger value="local">Lokales SEO</TabsTrigger>
                  <TabsTrigger value="content">Inhaltsanalyse</TabsTrigger>
                  <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="social">Soziale Medien</TabsTrigger>
                  <TabsTrigger value="conversion">Conversion</TabsTrigger>
                  <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
                  <TabsTrigger value="imprint">Impressum</TabsTrigger>
                  <TabsTrigger value="industry">Branche</TabsTrigger>
                  <TabsTrigger value="socialproof">Social Proof</TabsTrigger>
                </TabsList>
                <TabsContent value="seo">
                  <SEOAnalysis seoData={analysisData.seoData} />
                </TabsContent>
                <TabsContent value="performance">
                  <PerformanceAnalysis performanceData={analysisData.performanceData} />
                </TabsContent>
                <TabsContent value="mobile">
                  <MobileOptimization mobileData={analysisData.mobileData} />
                </TabsContent>
                <TabsContent value="competitor">
                  <CompetitorAnalysis competitorData={analysisData.competitorData} />
                </TabsContent>
                <TabsContent value="local">
                  <LocalSEO localSeoData={analysisData.localSeoData} />
                </TabsContent>
                <TabsContent value="content">
                  <ContentAnalysis contentData={analysisData.contentData} />
                </TabsContent>
                <TabsContent value="backlinks">
                  <BacklinkAnalysis backlinkData={analysisData.backlinkData} />
                </TabsContent>
                <TabsContent value="keywords">
                  <KeywordAnalysis keywordData={analysisData.keywordData} />
                </TabsContent>
                <TabsContent value="social">
                  <SocialMediaAnalysis socialMediaData={analysisData.socialMediaData} />
                </TabsContent>
                <TabsContent value="conversion">
                  <ConversionOptimization conversionData={analysisData.conversionData} />
                </TabsContent>
                <TabsContent value="reviews">
                  <GoogleReviews googleReviewsData={analysisData.googleReviewsData} />
                  <WorkplaceReviews workplaceReviewsData={analysisData.workplaceReviewsData} />
                </TabsContent>
                 <TabsContent value="socialproof">
                  <SocialProof socialProofData={analysisData.socialProofData} />
                </TabsContent>
                <TabsContent value="imprint">
                  <ImprintCheck imprintCheckData={analysisData.imprintCheckData} />
                </TabsContent>
                <TabsContent value="industry">
                  <IndustryFeatures industryFeaturesData={analysisData.industryFeaturesData} />
                </TabsContent>
              </Tabs>
              <div className="mt-4">
                <PDFExport analysisData={analysisData} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AnalysisDashboard;
