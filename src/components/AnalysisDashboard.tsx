import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { BusinessAnalysisService, RealBusinessData } from '@/services/BusinessAnalysisService';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { useManualData, ManualImprintData, ManualSocialData } from '@/hooks/useManualData';
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

// Industry names mapping
const industryNames = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro'
};

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ businessData, onReset }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [realData, setRealData] = useState<RealBusinessData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(true);
  const [hasValidatedKey, setHasValidatedKey] = useState(false);
  const { toast } = useToast();

  // Verwende den Hook für manuelle Daten
  const {
    manualImprintData,
    manualSocialData,
    updateImprintData,
    updateSocialData
  } = useManualData();

  // Erstelle erweiterte Daten für PDF-Export und Komponenten
  const getEnhancedRealData = (): RealBusinessData | null => {
    if (!realData) return null;

    const enhanced = { ...realData };

    // Impressum-Daten überschreiben falls manuell eingegeben
    if (manualImprintData) {
      const requiredElements = [
        'Firmenname', 'Rechtsform', 'Geschäftsführer/Inhaber', 'Adresse',
        'Telefonnummer', 'E-Mail-Adresse', 'Handelsregisternummer',
        'Steuernummer', 'USt-IdNr.', 'Kammerzugehörigkeit',
        'Berufsbezeichnung', 'Aufsichtsbehörde'
      ];

      enhanced.imprint = {
        found: manualImprintData.found,
        foundElements: manualImprintData.elements,
        missingElements: requiredElements.filter(e => !manualImprintData.elements.includes(e)),
        completeness: Math.round((manualImprintData.elements.length / requiredElements.length) * 100),
        score: Math.round((manualImprintData.elements.length / requiredElements.length) * 100)
      };
    }

    // Social Media-Daten überschreiben falls manuell eingegeben
    if (manualSocialData) {
      enhanced.socialMedia = {
        ...enhanced.socialMedia,
        facebook: {
          found: !!manualSocialData.facebookUrl,
          followers: parseInt(manualSocialData.facebookFollowers) || enhanced.socialMedia.facebook.followers,
          lastPost: manualSocialData.facebookLastPost || enhanced.socialMedia.facebook.lastPost,
          engagement: enhanced.socialMedia.facebook.engagement
        },
        instagram: {
          found: !!manualSocialData.instagramUrl,
          followers: parseInt(manualSocialData.instagramFollowers) || enhanced.socialMedia.instagram.followers,
          lastPost: manualSocialData.instagramLastPost || enhanced.socialMedia.instagram.lastPost,
          engagement: enhanced.socialMedia.instagram.engagement
        }
      };

      // Score neu berechnen
      const facebookScore = enhanced.socialMedia.facebook.found ? 50 : 0;
      const instagramScore = enhanced.socialMedia.instagram.found ? 50 : 0;
      enhanced.socialMedia.overallScore = facebookScore + instagramScore;
    }

    return enhanced;
  };

  // Bei jeder neuen businessData-Änderung den API-Key neu validieren
  useEffect(() => {
    console.log('BusinessData changed - forcing API key validation');
    console.log('BusinessData:', businessData);
    
    // Komplett zurücksetzen für neue Analyse
    setRealData(null);
    setNeedsApiKey(true);
    setHasValidatedKey(false);
    setIsLoading(false);
    
    // API-Key aus localStorage entfernen, um Neuvalidierung zu erzwingen
    localStorage.removeItem('google_api_key');
    GoogleAPIService.setApiKey('');
    
  }, [businessData.url, businessData.address, businessData.industry]);

  const handleApiKeySet = async () => {
    console.log('API-Key wurde gesetzt - validiere und starte Analyse');
    
    const apiKey = GoogleAPIService.getApiKey();
    if (!apiKey) {
      toast({
        title: "Fehler",
        description: "Kein API-Key gefunden.",
        variant: "destructive",
      });
      return;
    }

    // API-Key erneut validieren
    setIsLoading(true);
    try {
      const testResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Berlin&key=${apiKey}`
      );

      if (testResponse.ok) {
        const data = await testResponse.json();
        if (data.status === 'OK') {
          console.log('API-Key erfolgreich validiert');
          setNeedsApiKey(false);
          setHasValidatedKey(true);
          analyzeRealData();
        } else {
          throw new Error(`API-Key ungültig: ${data.status}`);
        }
      } else {
        throw new Error('API-Key Validierung fehlgeschlagen');
      }
    } catch (error) {
      console.error('API-Key Validierung fehlgeschlagen:', error);
      setNeedsApiKey(true);
      setIsLoading(false);
      toast({
        title: "API-Key ungültig",
        description: "Bitte geben Sie einen gültigen Google API-Key ein.",
        variant: "destructive",
      });
    }
  };

  const analyzeRealData = async () => {
    if (!hasValidatedKey) {
      console.log('Keine validierter API-Key - breche Analyse ab');
      setNeedsApiKey(true);
      return;
    }

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

  // Zeige immer zuerst den API-Key Manager an
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

  // Verwende die erweiterten Daten
  const enhancedData = getEnhancedRealData();
  if (!enhancedData) return null;

  const overallScore = Math.round(
    (enhancedData.seo.score + enhancedData.performance.score + 
     (enhancedData.reviews.google.count > 0 ? 80 : 40) + enhancedData.mobile.overallScore) / 4
  );
  const completionRate = 95;

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
                  Live-Analyse: {enhancedData.company.name}
                </h1>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <strong>Website:</strong> {enhancedData.company.url}
                  </p>
                  <p className="text-gray-600">
                    <strong>Adresse:</strong> {enhancedData.company.address}
                  </p>
                  {enhancedData.company.phone && (
                    <p className="text-gray-600">
                      <strong>Telefon:</strong> {enhancedData.company.phone}
                    </p>
                  )}
                  <Badge variant="secondary">
                    {industryNames[businessData.industry]}
                  </Badge>
                  <Badge variant="default" className="ml-2">
                    🔴 Live Google APIs
                  </Badge>
                  {(manualImprintData || manualSocialData) && (
                    <Badge variant="outline" className="ml-2">
                      ✓ Manuelle Eingaben
                    </Badge>
                  )}
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
            <OverallRating businessData={businessData} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="seo">
            <SEOAnalysis url={businessData.url} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="keywords">
            <KeywordAnalysis url={businessData.url} industry={businessData.industry} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceAnalysis url={businessData.url} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="mobile">
            <MobileOptimization url={businessData.url} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="local-seo">
            <LocalSEO businessData={businessData} />
          </TabsContent>

          <TabsContent value="content">
            <ContentAnalysis url={businessData.url} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="competitor">
            <CompetitorAnalysis address={businessData.address} industry={businessData.industry} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="backlinks">
            <BacklinkAnalysis url={businessData.url} />
          </TabsContent>

          <TabsContent value="reviews">
            <GoogleReviews address={businessData.address} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaAnalysis 
              businessData={businessData} 
              realData={enhancedData}
              manualData={manualSocialData}
              onManualDataChange={updateSocialData}
            />
          </TabsContent>

          <TabsContent value="social-proof">
            <SocialProof businessData={businessData} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="conversion">
            <ConversionOptimization url={businessData.url} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="workplace">
            <WorkplaceReviews businessData={businessData} realData={enhancedData} />
          </TabsContent>

          <TabsContent value="imprint">
            <ImprintCheck 
              url={businessData.url} 
              realData={enhancedData}
              manualData={manualImprintData}
              onManualDataChange={updateImprintData}
            />
          </TabsContent>

          <TabsContent value="industry">
            <IndustryFeatures businessData={businessData} />
          </TabsContent>

          <TabsContent value="export">
            <PDFExport 
              businessData={businessData} 
              realData={enhancedData}
              manualImprintData={manualImprintData}
              manualSocialData={manualSocialData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
