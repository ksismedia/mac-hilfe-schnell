
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
import { ArrowLeft } from 'lucide-react';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker';
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
    dachdecker: 'Dachdecker'
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
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="performance">Ladezeit</TabsTrigger>
            <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
            <TabsTrigger value="reviews">Bewertungen</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="imprint">Impressum</TabsTrigger>
            <TabsTrigger value="industry">Branche</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
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

          <TabsContent value="backlinks">
            <BacklinkAnalysis url={businessData.url} />
          </TabsContent>

          <TabsContent value="reviews">
            <GoogleReviews address={businessData.address} />
          </TabsContent>

          <TabsContent value="social">
            <SocialMediaAnalysis businessData={businessData} />
          </TabsContent>

          <TabsContent value="imprint">
            <ImprintCheck url={businessData.url} />
          </TabsContent>

          <TabsContent value="industry">
            <IndustryFeatures industry={businessData.industry} url={businessData.url} />
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
