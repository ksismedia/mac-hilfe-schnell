
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
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface AnalysisDashboardProps {
  initialDomain?: string;
  businessData?: {
    url: string;
    address: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  onReset?: () => void;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ 
  initialDomain, 
  businessData,
  onReset 
}) => {
  const [domain, setDomain] = useState(initialDomain || businessData?.url || '');
  const [analysisData, setAnalysisData] = useState<RealBusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKeySet, setApiKeySet] = useState(GoogleAPIService.hasApiKey());
  const { toast } = useToast();

  useEffect(() => {
    if ((initialDomain || businessData?.url) && apiKeySet) {
      analyzeWebsite(initialDomain || businessData?.url || '');
    }
  }, [initialDomain, businessData?.url, apiKeySet]);

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
      // Wir erstellen Mock-Daten basierend auf WebsiteAnalysisService
      const websiteContent = await WebsiteAnalysisService.analyzeWebsite(domainToAnalyze);
      
      // Konvertiere WebsiteContent zu RealBusinessData
      const mockBusinessData: RealBusinessData = {
        company: {
          name: websiteContent.title || domainToAnalyze,
          url: domainToAnalyze,
          address: businessData?.address || '',
          phone: '',
          email: '',
          description: websiteContent.metaDescription || ''
        },
        seo: {
          title: websiteContent.title,
          metaDescription: websiteContent.metaDescription,
          headings: websiteContent.headings,
          keywords: websiteContent.keywords,
          images: websiteContent.images.length,
          imagesWithAlt: websiteContent.images.filter(img => img.hasAlt).length,
          internalLinks: websiteContent.links.filter(link => link.isInternal).length,
          externalLinks: websiteContent.links.filter(link => !link.isInternal).length,
          score: Math.floor(Math.random() * 40) + 60 // 60-100
        },
        performance: {
          loadTime: Math.random() * 2 + 1, // 1-3 seconds
          mobileScore: Math.floor(Math.random() * 30) + 70, // 70-100
          desktopScore: Math.floor(Math.random() * 20) + 80, // 80-100
          coreWebVitals: {
            lcp: Math.random() * 1.5 + 1.5, // 1.5-3 seconds
            fid: Math.random() * 50 + 50, // 50-100 ms
            cls: Math.random() * 0.1 + 0.05 // 0.05-0.15
          }
        },
        reviews: {
          google: {
            rating: 0,
            count: 0,
            recent: []
          },
          workplace: {
            kununu: { rating: 0, count: 0 },
            glassdoor: { rating: 0, count: 0 },
            indeed: { rating: 0, count: 0 }
          }
        },
        backlinks: {
          total: Math.floor(Math.random() * 50) + 10,
          domains: Math.floor(Math.random() * 20) + 5,
          quality: Math.floor(Math.random() * 30) + 40
        },
        content: {
          wordCount: websiteContent.content.split(' ').length,
          readabilityScore: Math.floor(Math.random() * 30) + 60,
          keywordDensity: Math.random() * 3 + 1
        },
        competitors: [],
        socialMedia: {
          facebook: { url: '', followers: 0, engagement: 0 },
          instagram: { url: '', followers: 0, engagement: 0 },
          linkedin: { url: '', followers: 0, engagement: 0 },
          twitter: { url: '', followers: 0, engagement: 0 }
        },
        localSEO: {
          googleMyBusiness: false,
          citations: Math.floor(Math.random() * 20) + 5,
          reviews: Math.floor(Math.random() * 10),
          localKeywords: Math.floor(Math.random() * 15) + 5
        },
        imprint: WebsiteAnalysisService.detectImprintFromContent(websiteContent)
      };

      setAnalysisData(mockBusinessData);
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

  const currentUrl = analysisData?.company.url || domain;
  const currentAddress = businessData?.address || analysisData?.company.address || '';
  const currentIndustry = businessData?.industry || 'shk';

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
              {onReset && (
                <Button variant="outline" onClick={onReset}>
                  Zurück
                </Button>
              )}
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {analysisData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Analyse Ergebnisse für {currentUrl}</CardTitle>
              <CardDescription>Detaillierte Einblicke in die Performance deiner Website.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <OverallRating 
                  businessData={{
                    address: currentAddress,
                    url: currentUrl,
                    industry: currentIndustry
                  }}
                  realData={analysisData} 
                />
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
                  <SEOAnalysis url={currentUrl} realData={analysisData} />
                </TabsContent>
                <TabsContent value="performance">
                  <PerformanceAnalysis url={currentUrl} realData={analysisData} />
                </TabsContent>
                <TabsContent value="mobile">
                  <MobileOptimization url={currentUrl} realData={analysisData} />
                </TabsContent>
                <TabsContent value="competitor">
                  <CompetitorAnalysis 
                    address={currentAddress} 
                    industry={currentIndustry} 
                    realData={analysisData} 
                  />
                </TabsContent>
                <TabsContent value="local">
                  <LocalSEO 
                    businessData={{
                      address: currentAddress,
                      url: currentUrl,
                      industry: currentIndustry
                    }}
                  />
                </TabsContent>
                <TabsContent value="content">
                  <ContentAnalysis url={currentUrl} industry={currentIndustry} />
                </TabsContent>
                <TabsContent value="backlinks">
                  <BacklinkAnalysis url={currentUrl} />
                </TabsContent>
                <TabsContent value="keywords">
                  <KeywordAnalysis 
                    url={currentUrl} 
                    industry={currentIndustry}
                    realData={analysisData} 
                  />
                </TabsContent>
                <TabsContent value="social">
                  <SocialMediaAnalysis 
                    businessData={{
                      address: currentAddress,
                      url: currentUrl,
                      industry: currentIndustry
                    }}
                    realData={analysisData} 
                  />
                </TabsContent>
                <TabsContent value="conversion">
                  <ConversionOptimization url={currentUrl} industry={currentIndustry} />
                </TabsContent>
                <TabsContent value="reviews">
                  <GoogleReviews address={currentAddress} realData={analysisData} />
                  <WorkplaceReviews 
                    businessData={{
                      address: currentAddress,
                      url: currentUrl,
                      industry: currentIndustry
                    }}
                    realData={analysisData} 
                  />
                </TabsContent>
                <TabsContent value="socialproof">
                  <SocialProof 
                    businessData={{
                      address: currentAddress,
                      url: currentUrl,
                      industry: currentIndustry
                    }}
                    realData={analysisData} 
                  />
                </TabsContent>
                <TabsContent value="imprint">
                  <ImprintCheck url={currentUrl} realData={analysisData} />
                </TabsContent>
                <TabsContent value="industry">
                  <IndustryFeatures 
                    businessData={{
                      address: currentAddress,
                      url: currentUrl,
                      industry: currentIndustry
                    }}
                  />
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
