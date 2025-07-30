import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEOAnalysis from '../SEOAnalysis';
import ContentAnalysis from '../ContentAnalysis';
import KeywordAnalysis from '../KeywordAnalysis';
import LocalSEO from '../LocalSEO';
import BacklinkAnalysis from '../BacklinkAnalysis';
import AccessibilityAnalysis from '../AccessibilityAnalysis';
import DataPrivacyAnalysis from '../DataPrivacyAnalysis';
import ImprintCheck from '../ImprintCheck';
import CompetitorAnalysis from '../CompetitorAnalysis';
import IndustryFeatures from '../IndustryFeatures';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface SEOContentCategoryProps {
  businessData: any;
  realData: RealBusinessData;
  onKeywordsScoreChange: (score: number | null) => void;
  onKeywordDataChange: (data: any) => void;
  keywordsScore: number | null;
  manualKeywordData: any;
  privacyData: any;
  setPrivacyData: (data: any) => void;
  accessibilityData: any;
  setAccessibilityData: (data: any) => void;
  manualImprintData: any;
  updateImprintData: (data: any) => void;
  manualCompetitors: any[];
  competitorServices: any;
  removedMissingServices: string[];
  companyServices: any;
  deletedCompetitors: Set<string>;
  updateCompetitors: (competitors: any[]) => void;
  updateCompetitorServices: (name: string, services: string[]) => void;
  addRemovedMissingService: (service: string) => void;
  updateCompanyServices: (services: string[]) => void;
  addDeletedCompetitor: (competitorName: string) => void;
  removeDeletedCompetitor: (competitorName: string) => void;
}

const SEOContentCategory: React.FC<SEOContentCategoryProps> = ({
  businessData,
  realData,
  onKeywordsScoreChange,
  onKeywordDataChange,
  keywordsScore,
  manualKeywordData,
  privacyData,
  setPrivacyData,
  accessibilityData,
  setAccessibilityData,
  manualImprintData,
  updateImprintData,
  manualCompetitors,
  competitorServices,
  removedMissingServices,
  companyServices,
  deletedCompetitors,
  updateCompetitors,
  updateCompetitorServices,
  addRemovedMissingService,
  updateCompanyServices,
  addDeletedCompetitor,
  removeDeletedCompetitor,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">SEO & Content Analyse</h2>
        <p className="text-gray-300">Suchmaschinenoptimierung, Keywords und Inhaltsqualität</p>
      </div>
      
      <Tabs defaultValue="seo" className="w-full">
        <TabsList className="grid grid-cols-5 lg:grid-cols-10 mb-6">
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="local-seo">Local SEO</TabsTrigger>
          <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
          <TabsTrigger value="accessibility">Barrierefreiheit</TabsTrigger>
          <TabsTrigger value="privacy">Datenschutz</TabsTrigger>
          <TabsTrigger value="imprint">Impressum</TabsTrigger>
          <TabsTrigger value="competitors">Konkurrenz</TabsTrigger>
          <TabsTrigger value="industry">Branche</TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <SEOAnalysis realData={realData} url={businessData.url} />
        </TabsContent>

        <TabsContent value="keywords">
          <KeywordAnalysis 
            url={businessData.url}
            industry={businessData.industry}
            realData={realData}
            onScoreChange={onKeywordsScoreChange}
            onKeywordDataChange={onKeywordDataChange}
            loadedKeywordScore={keywordsScore}
            loadedKeywordData={manualKeywordData}
          />
        </TabsContent>

        <TabsContent value="content">
          <ContentAnalysis url={businessData.url} industry={businessData.industry} />
        </TabsContent>

        <TabsContent value="local-seo">
          <LocalSEO businessData={businessData} realData={realData} />
        </TabsContent>

        <TabsContent value="backlinks">
          <BacklinkAnalysis url={businessData.url} />
        </TabsContent>

        <TabsContent value="accessibility">
          <AccessibilityAnalysis 
            businessData={businessData}
            realData={realData} 
            onDataChange={setAccessibilityData}
            savedData={accessibilityData}
          />
        </TabsContent>

        <TabsContent value="privacy">
          <DataPrivacyAnalysis 
            businessData={businessData}
            realData={realData}
            onDataChange={setPrivacyData}
            savedData={privacyData}
          />
        </TabsContent>

        <TabsContent value="imprint">
          <ImprintCheck 
            url={businessData.url}
            realData={realData}
            manualData={manualImprintData}
            onManualDataChange={updateImprintData}
          />
        </TabsContent>

        <TabsContent value="competitors">
          <CompetitorAnalysis 
            address={businessData.address}
            industry={businessData.industry}
            realData={realData}
            manualCompetitors={manualCompetitors}
            competitorServices={competitorServices}
            removedMissingServices={removedMissingServices}
            companyServices={companyServices}
            deletedCompetitors={deletedCompetitors}
            onCompetitorsChange={updateCompetitors}
            onCompetitorServicesChange={updateCompetitorServices}
            onRemovedMissingServicesChange={addRemovedMissingService}
            onCompanyServicesChange={updateCompanyServices}
            onDeletedCompetitorChange={addDeletedCompetitor}
            onRestoreCompetitorChange={removeDeletedCompetitor}
          />
        </TabsContent>

        <TabsContent value="industry">
          <IndustryFeatures businessData={businessData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOContentCategory;