
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
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
import { ArrowLeft } from 'lucide-react';

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

  const industryNames = {
    shk: 'SHK (Sanitär, Heizung, Klima)',
    maler: 'Maler und Lackierer',
    elektriker: 'Elektriker',
    dachdecker: 'Dachdecker',
    stukateur: 'Stukateure',
    planungsbuero: 'Planungsbüro Versorgungstechnik'
  };

  // Simulierte Gesamtbewertung
  const overallScore = 4.2;
  const completionRate = 85;

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
                  Analyse-Ergebnisse
                </h1>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    <strong>Website:</strong> {businessData.url}
                  </p>
                  <p className="text-gray-600">
                    <strong>Adresse:</strong> {businessData.address}
                  </p>
                  <Badge variant="secondary">
                    {industryNames[businessData.industry]}
                  </Badge>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {overallScore}/5
                </div>
                <div className="text-sm text-gray-600 mb-2">Gesamtbewertung</div>
                <Progress value={completionRate} className="w-32" />
                <div className="text-xs text-gray-500 mt-1">
                  {completionRate}% vollständig
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
            <OverallRating businessData={businessData} />
          </TabsContent>

          <TabsContent value="seo">
            <SEOAnalysis url={businessData.url} />
          </TabsContent>

          <TabsContent value="keywords">
            <KeywordAnalysis url={businessData.url} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceAnalysis url={businessData.url} />
          </TabsContent>

          <TabsContent value="mobile">
            <MobileOptimization url={businessData.url} />
          </TabsContent>

          <TabsContent value="local-seo">
            <LocalSEO businessData={businessData} />
          </TabsContent>

          <TabsContent value="content">
            <ContentAnalysis url={businessData.url} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="competitor">
            <CompetitorAnalysis address={businessData.address} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="backlinks">
            <BacklinkAnalysis url={businessData.url} />
          </TabsContent>

          <TabsContent value="reviews">
            <GoogleReviews address={businessData.address} />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaAnalysis businessData={businessData} />
          </TabsContent>

          <TabsContent value="social-proof">
            <SocialProof businessData={businessData} />
          </TabsContent>

          <TabsContent value="conversion">
            <ConversionOptimization url={businessData.url} industry={businessData.industry} />
          </TabsContent>

          <TabsContent value="workplace">
            <WorkplaceReviews businessData={businessData} />
          </TabsContent>

          <TabsContent value="imprint">
            <ImprintCheck url={businessData.url} />
          </TabsContent>

          <TabsContent value="industry">
            <IndustryFeatures businessData={businessData} />
          </TabsContent>

          <TabsContent value="export">
            <PDFExport businessData={businessData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
