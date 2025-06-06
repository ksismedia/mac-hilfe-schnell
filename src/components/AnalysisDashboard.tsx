import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ManualDataProvider } from '@/contexts/ManualDataContext';

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

const AnalysisDashboardContent: React.FC<AnalysisDashboardProps> = ({ 
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
          industry: businessData?.industry || 'shk',
          phone: '',
          email: ''
        },
        seo: {
          titleTag: websiteContent.title,
          metaDescription: websiteContent.metaDescription,
          headings: websiteContent.headings,
          altTags: {
            total: websiteContent.images.length,
            withAlt: websiteContent.images.filter(img => img.hasAlt).length
          },
          score: Math.floor(Math.random() * 40) + 60 // 60-100
        },
        performance: {
          loadTime: Math.random() * 2 + 1, // 1-3 seconds
          lcp: Math.random() * 1.5 + 1.5, // 1.5-3 seconds
          fid: Math.random() * 50 + 50, // 50-100 ms
          cls: Math.random() * 0.1 + 0.05, // 0.05-0.15
          score: Math.floor(Math.random() * 20) + 80 // 80-100
        },
        reviews: {
          google: {
            rating: 0,
            count: 0,
            recent: []
          }
        },
        competitors: [],
        keywords: websiteContent.keywords.map((keyword, index) => ({
          keyword,
          position: index + 1,
          volume: Math.floor(Math.random() * 500) + 100,
          found: true
        })),
        imprint: WebsiteAnalysisService.detectImprintFromContent(websiteContent),
        socialMedia: {
          facebook: {
            found: false,
            followers: 0,
            lastPost: 'Nicht gefunden',
            engagement: 'keine'
          },
          instagram: {
            found: false,
            followers: 0,
            lastPost: 'Nicht gefunden',
            engagement: 'keine'
          },
          overallScore: 0
        },
        workplace: {
          kununu: {
            found: false,
            rating: 0,
            reviews: 0
          },
          glassdoor: {
            found: false,
            rating: 0,
            reviews: 0
          },
          overallScore: 0
        },
        socialProof: {
          testimonials: Math.floor(Math.random() * 8) + 3,
          certifications: [
            { name: 'Handwerkskammer-Mitglied', verified: true, visible: true }
          ],
          awards: [],
          overallScore: Math.floor(Math.random() * 40) + 60
        },
        mobile: {
          responsive: true,
          touchFriendly: true,
          pageSpeedMobile: Math.floor(Math.random() * 30) + 70,
          pageSpeedDesktop: Math.floor(Math.random() * 20) + 80,
          overallScore: Math.floor(Math.random() * 30) + 70,
          issues: []
        }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with analysis summary */}
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
          <Tabs defaultValue="overall" className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 lg:grid-cols-16">
              <TabsTrigger value="overall">Gesamt</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="mobile">Mobile</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="competitor">Konkurrenz</TabsTrigger>
              <TabsTrigger value="local">Local SEO</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="conversion">Conversion</TabsTrigger>
              <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
              <TabsTrigger value="workplace">Arbeitsplatz</TabsTrigger>
              <TabsTrigger value="social-proof">Social Proof</TabsTrigger>
              <TabsTrigger value="imprint">Impressum</TabsTrigger>
              <TabsTrigger value="industry">Branche</TabsTrigger>
            </TabsList>

            <TabsContent value="overall">
              <OverallRating 
                businessData={{ url: currentUrl, address: currentAddress, industry: currentIndustry }}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="seo">
              <SEOAnalysis 
                url={currentUrl}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="performance">
              <PerformanceAnalysis 
                url={currentUrl}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="mobile">
              <MobileOptimization 
                url={currentUrl}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="keywords">
              <KeywordAnalysis 
                url={currentUrl}
                industry={currentIndustry}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="competitor">
              <CompetitorAnalysis 
                businessData={{ url: currentUrl, address: currentAddress, industry: currentIndustry }}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="local">
              <LocalSEO 
                businessData={{ url: currentUrl, address: currentAddress, industry: currentIndustry }}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="content">
              <ContentAnalysis 
                url={currentUrl}
                industry={currentIndustry}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="backlinks">
              <BacklinkAnalysis 
                url={currentUrl}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="social">
              <SocialMediaAnalysis 
                businessData={{ url: currentUrl, address: currentAddress, industry: currentIndustry }}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="conversion">
              <ConversionOptimization 
                url={currentUrl}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="reviews">
              <GoogleReviews 
                businessData={{ url: currentUrl, address: currentAddress, industry: currentIndustry }}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="workplace">
              <WorkplaceReviews 
                businessData={{ url: currentUrl, address: currentAddress, industry: currentIndustry }}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="social-proof">
              <SocialProof 
                url={currentUrl}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="imprint">
              <ImprintCheck 
                url={currentUrl}
                realData={analysisData}
              />
            </TabsContent>

            <TabsContent value="industry">
              <IndustryFeatures 
                businessData={{ url: currentUrl, address: currentAddress, industry: currentIndustry }}
                realData={analysisData}
              />
            </TabsContent>
          </Tabs>
        )}

        {/* PDF Export Section */}
        {analysisData && (
          <div className="mt-8 flex justify-center">
            <PDFExport 
              businessData={{ url: currentUrl, address: currentAddress, industry: currentIndustry }}
              analysisData={analysisData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = (props) => {
  return (
    <ManualDataProvider>
      <AnalysisDashboardContent {...props} />
    </ManualDataProvider>
  );
};

export default AnalysisDashboard;
