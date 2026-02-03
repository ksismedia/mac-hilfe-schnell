import React, { useState } from 'react';
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
import NationalProvidersSection from '../NationalProvidersSection';
import RegionalProductTrends from '../RegionalProductTrends';
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
  onCompanyScoreChange?: (score: number) => void;
  onNavigateToCategory?: (categoryId: string) => void;
  manualDataPrivacyData?: any;
  updateManualDataPrivacyData?: (data: any) => void;
  manualLocalSEOData?: any;
  onManualLocalSEOChange?: (data: any) => void;
  securityData?: any;
  onSecurityDataChange?: (data: any) => void;
  manualAccessibilityData?: any;
  updateManualAccessibilityData?: (data: any) => void;
  manualContentData?: any;
  updateManualContentData?: (data: any) => void;
  manualBacklinkData?: any;
  updateManualBacklinkData?: (data: any) => void;
  manualReputationData?: any;
  manualSEOData?: any;
  updateManualSEOData?: (data: any) => void;
  showNationalProviders?: boolean;
  onToggleNationalProviders?: (show: boolean) => void;
  showRegionalTrends?: boolean;
  onToggleRegionalTrends?: (show: boolean) => void;
  regionalTrendsData?: any;
  onRegionalTrendsLoaded?: (data: any) => void;
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
  onCompanyScoreChange,
  onNavigateToCategory,
  manualDataPrivacyData,
  updateManualDataPrivacyData,
  manualLocalSEOData,
  onManualLocalSEOChange,
  securityData,
  onSecurityDataChange,
  manualAccessibilityData,
  updateManualAccessibilityData,
  manualContentData,
  updateManualContentData,
  manualBacklinkData,
  updateManualBacklinkData,
  manualReputationData,
  manualSEOData,
  updateManualSEOData,
  showNationalProviders = false,
  onToggleNationalProviders,
  showRegionalTrends = false,
  onToggleRegionalTrends,
  regionalTrendsData,
  onRegionalTrendsLoaded
}) => {
  const [activeTab, setActiveTab] = useState("seo");

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2 border-b border-white pb-2 inline-block">SEO & Content Analyse</h2>
        <p className="text-gray-300 mt-4">Suchmaschinenoptimierung, Keywords und Inhaltsqualität</p>
      </div>
      
      
      {/* Custom Tab Navigation - Vereinfacht */}
      <div className="w-full">
        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-gray-800 rounded-lg">
          {[
            { id: 'seo', label: 'SEO' },
            { id: 'keywords', label: 'Keywords' },
            { id: 'content', label: 'Content' },
            { id: 'local-seo', label: 'Local SEO' },
            { id: 'backlinks', label: 'Backlinks' },
            { id: 'accessibility', label: 'Barrierefreiheit' },
            { id: 'privacy', label: 'Datenschutz' },
            { id: 'imprint', label: 'Impressum' },
            { id: 'competitors', label: 'Konkurrenz' },
            { id: 'industry', label: 'Branche' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                console.log('Clicking tab:', tab.id);
                handleTabChange(tab.id);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-600 text-white hover:bg-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content - ALLE Komponenten bleiben gemounted, nur per CSS versteckt */}
        {/* Dies verhindert Datenverlust bei Tab-Wechsel */}
        <div className="w-full">
          <div className={activeTab === 'seo' ? 'block' : 'hidden'}>
            <SEOAnalysis 
              realData={realData} 
              url={businessData.url}
              manualSEOData={manualSEOData}
              onManualSEODataChange={updateManualSEOData}
            />
          </div>

          <div className={activeTab === 'keywords' ? 'block' : 'hidden'}>
            <KeywordAnalysis 
              url={businessData.url}
              industry={businessData.industry}
              realData={realData}
              onScoreChange={onKeywordsScoreChange}
              onKeywordDataChange={onKeywordDataChange}
              loadedKeywordScore={keywordsScore}
              loadedKeywordData={manualKeywordData}
              onNavigateToNextCategory={() => {
                onNavigateToCategory?.('performance-mobile');
                setActiveTab('content');
              }}
            />
          </div>

          <div className={activeTab === 'content' ? 'block' : 'hidden'}>
            <ContentAnalysis 
              url={businessData.url} 
              industry={businessData.industry}
              manualContentData={manualContentData}
              updateManualContentData={updateManualContentData}
              realData={realData}
              businessData={businessData}
              keywordsScore={keywordsScore}
            />
          </div>

          <div className={activeTab === 'local-seo' ? 'block' : 'hidden'}>
            <LocalSEO 
              businessData={businessData} 
              realData={realData}
              manualData={manualLocalSEOData}
              onManualDataChange={onManualLocalSEOChange}
            />
          </div>

          <div className={activeTab === 'backlinks' ? 'block' : 'hidden'}>
            <BacklinkAnalysis 
              url={businessData.url}
              manualBacklinkData={manualBacklinkData}
              updateManualBacklinkData={updateManualBacklinkData}
              realData={realData}
              manualReputationData={manualReputationData}
            />
          </div>

          <div className={activeTab === 'accessibility' ? 'block' : 'hidden'}>
            <AccessibilityAnalysis 
              businessData={businessData}
              realData={realData} 
              onDataChange={setAccessibilityData}
              savedData={accessibilityData}
              manualAccessibilityData={manualAccessibilityData}
              updateManualAccessibilityData={updateManualAccessibilityData}
            />
          </div>

          <div className={activeTab === 'privacy' ? 'block' : 'hidden'}>
            <DataPrivacyAnalysis 
              businessData={businessData}
              realData={realData}
              onDataChange={setPrivacyData}
              savedData={privacyData}
              manualDataPrivacyData={manualDataPrivacyData}
              onManualDataChange={updateManualDataPrivacyData}
              securityData={securityData}
              onSecurityDataChange={onSecurityDataChange}
            />
          </div>

          <div className={activeTab === 'imprint' ? 'block' : 'hidden'}>
            <ImprintCheck 
              url={businessData.url}
              realData={realData}
              manualData={manualImprintData}
              onManualDataChange={updateImprintData}
            />
          </div>

          <div className={activeTab === 'competitors' ? 'block' : 'hidden'}>
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
              onCompanyScoreChange={onCompanyScoreChange}
            />
            
            {/* Separate Sektion für überregionale Großanbieter */}
            <div className="mt-6">
              <NationalProvidersSection
                industry={businessData.industry}
                showNationalProviders={showNationalProviders}
                onToggleNationalProviders={onToggleNationalProviders || (() => {})}
              />
            </div>
            
            {/* Regionale Produkttrends */}
            <div className="mt-6">
              <RegionalProductTrends
                industry={businessData.industry}
                region={businessData.address}
                companyName={businessData.companyName}
                showInReport={showRegionalTrends}
                onToggleShowInReport={onToggleRegionalTrends || (() => {})}
                onTrendsLoaded={onRegionalTrendsLoaded}
              />
            </div>
          </div>

          <div className={activeTab === 'industry' ? 'block' : 'hidden'}>
            <IndustryFeatures businessData={businessData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SEOContentCategory;
