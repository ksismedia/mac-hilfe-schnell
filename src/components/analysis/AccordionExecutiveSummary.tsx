import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData, HourlyRateData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateOnlineQualityAuthorityScore, calculateWebsitePerformanceTechScore, calculateSocialMediaPerformanceScore, calculateMarketEnvironmentScore, calculateCorporateAppearanceScore, calculateServiceQualityScore } from './export/scoreCalculations';
import { Search, Zap, Share2, Users } from 'lucide-react';

interface AccordionExecutiveSummaryProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
  };
  realData: RealBusinessData;
  manualSocialData?: ManualSocialData | null;
  keywordsScore?: number | null;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  hourlyRateData?: HourlyRateData | null;
  manualWorkplaceData?: any;
  competitorScore?: number | null;
  privacyData?: any;
  accessibilityData?: any;
  manualCorporateIdentityData?: any;
}

const AccordionExecutiveSummary: React.FC<AccordionExecutiveSummaryProps> = ({
  businessData,
  realData,
  manualSocialData,
  keywordsScore,
  staffQualificationData,
  quoteResponseData,
  hourlyRateData,
  manualWorkplaceData,
  competitorScore,
  privacyData,
  accessibilityData,
  manualCorporateIdentityData
}) => {
  // Calculate all category scores
  const scores = {
    onlineQualityAuthority: calculateOnlineQualityAuthorityScore(
      realData, keywordsScore, businessData, privacyData, accessibilityData, null, null
    ),
    websitePerformanceTech: calculateWebsitePerformanceTechScore(realData),
    socialMediaPerformance: calculateSocialMediaPerformanceScore(realData, manualSocialData),
    marketEnvironment: calculateMarketEnvironmentScore(
      realData, hourlyRateData, staffQualificationData, competitorScore, manualWorkplaceData
    ),
    corporateAppearance: calculateCorporateAppearanceScore(manualCorporateIdentityData),
    serviceQuality: calculateServiceQualityScore(quoteResponseData)
  };

  const categories = [
    { 
      id: 'online-quality-authority', 
      title: 'Online-Qualität · Relevanz · Autorität', 
      icon: Search, 
      score: scores.onlineQualityAuthority
    },
    { 
      id: 'website-performance-tech', 
      title: 'Webseiten-Performance & Technik', 
      icon: Zap, 
      score: scores.websitePerformanceTech
    },
    { 
      id: 'social-media-performance', 
      title: 'Online-/Web-/Social-Media Performance', 
      icon: Share2, 
      score: scores.socialMediaPerformance
    },
    { 
      id: 'market-environment', 
      title: 'Markt & Marktumfeld', 
      icon: Users, 
      score: scores.marketEnvironment
    },
    { 
      id: 'corporate-appearance', 
      title: 'Außendarstellung & Erscheinungsbild', 
      icon: Users, 
      score: scores.corporateAppearance
    },
    { 
      id: 'service-quality', 
      title: 'Qualität · Service · Kundenorientierung', 
      icon: Users, 
      score: scores.serviceQuality
    }
  ];

  // Calculate overall score using the same logic as OverallRating
  const totalWeight = Object.values(scores).reduce((sum, score) => sum + (score > 0 ? 1 : 0), 0);
  const weightedSum = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-400';
    if (score >= 61) return 'text-green-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-yellow-500';
    if (score >= 61) return 'bg-green-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      {/* Overall Score Header */}
      <div className="text-center mb-6 p-6 bg-gray-800 rounded-lg border border-yellow-400/30">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Executive Summary</h2>
        <div className="flex items-center justify-center gap-4">
          <div className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}%
          </div>
          <div className="text-left">
            <div className="text-yellow-400 font-semibold">Gesamtscore</div>
            <div className="text-gray-400 text-sm">Basierend auf 6 Hauptkategorien</div>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <Accordion type="multiple" className="w-full space-y-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <AccordionItem 
              key={category.id} 
              value={category.id} 
              className="border border-gray-700 rounded-lg bg-gray-800/50"
            >
              <AccordionTrigger className="px-4 py-3 text-yellow-400 hover:text-yellow-300">
                <div className="flex items-center justify-between w-full mr-4">
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5" />
                    <span className="font-semibold">{category.title}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getScoreBg(category.score)}`}>
                    {Math.round(category.score)}%
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-white font-medium">{category.title}</h4>
                    <div className={`text-2xl font-bold ${getScoreColor(category.score)}`}>
                      {Math.round(category.score)} Punkte
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${getScoreBg(category.score)}`}
                      style={{ width: `${Math.min(100, category.score)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-gray-400 text-sm">
                    Bewertung: {category.score >= 90 ? 'Sehr gut' : category.score >= 61 ? 'Gut' : 'Verbesserung erforderlich'}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default AccordionExecutiveSummary;