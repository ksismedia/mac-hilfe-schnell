import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData, HourlyRateData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateLocalSEOScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateWorkplaceScore, calculateHourlyRateScore } from './export/scoreCalculations';

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
  accessibilityData
}) => {
  // Score calculations
  const keywords = realData.keywords || [];
  const keywordsFoundCount = keywords.filter(k => k.found).length;
  const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;

  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const localSEOScore = calculateLocalSEOScore(businessData, realData);
  const workplaceScoreRaw = calculateWorkplaceScore(realData, manualWorkplaceData);
  const workplaceScore = workplaceScoreRaw === -1 ? 0 : workplaceScoreRaw;

  // Simple calculations for accessibility and data privacy
  const accessibilityScore = accessibilityData ? 
    Math.round((accessibilityData.accessibility?.violations?.length || 0) === 0 ? 100 : 40) : 0;
  
  const dataPrivacyScore = privacyData ? 
    Math.round(((privacyData.imprint ? 1 : 0) + (privacyData.dataPrivacy ? 1 : 0)) * 50) : 0;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 61) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 61) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const ScoreCard = ({ title, score, subtitle }: { title: string; score: number; subtitle?: string }) => (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium text-sm">{title}</h4>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getScoreBg(score)}`}>
          {score}%
        </div>
      </div>
      {subtitle && (
        <p className="text-gray-400 text-xs">{subtitle}</p>
      )}
    </div>
  );

  // Calculate overall score
  const baseMetrics = [
    { score: realData.seo.score, weight: 20 },
    { score: localSEOScore, weight: 20 },
    { score: accessibilityScore, weight: 15 },
    { score: dataPrivacyScore, weight: 15 },
    { score: realData.performance.score, weight: 15 },
    { score: realData.mobile.overallScore, weight: 15 }
  ];

  const totalWeight = baseMetrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedSum = baseMetrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  const overallScore = Math.round(weightedSum / totalWeight);

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
        {/* Online-Qualität & Autorität */}
        <AccordionItem value="online-quality" className="border border-gray-700 rounded-lg bg-gray-800/50">
          <AccordionTrigger className="px-4 py-3 text-yellow-400 hover:text-yellow-300">
            <div className="flex items-center justify-between w-full mr-4">
              <span className="font-semibold">Online-Qualität • Relevanz • Autorität</span>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                4 Bereiche
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreCard 
                title="SEO-Auswertung" 
                score={realData.seo.score}
                subtitle="Suchmaschinenoptimierung"
              />
              <ScoreCard 
                title="Lokale SEO" 
                score={localSEOScore}
                subtitle="Lokale Sichtbarkeit"
              />
              <ScoreCard 
                title="Barrierefreiheit" 
                score={accessibilityScore}
                subtitle="Zugänglichkeit der Website"
              />
              <ScoreCard 
                title="Datenschutz" 
                score={dataPrivacyScore}
                subtitle="Rechtssicherheit"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Webseiten-Performance & Technik */}
        <AccordionItem value="performance-tech" className="border border-gray-700 rounded-lg bg-gray-800/50">
          <AccordionTrigger className="px-4 py-3 text-yellow-400 hover:text-yellow-300">
            <div className="flex items-center justify-between w-full mr-4">
              <span className="font-semibold">Webseiten-Performance & Technik</span>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                2 Bereiche
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScoreCard 
                title="Website Performance" 
                score={realData.performance.score}
                subtitle={`Ladezeit: ${realData.performance.loadTime || 'N/A'}`}
              />
              <ScoreCard 
                title="Mobile Optimierung" 
                score={realData.mobile.overallScore}
                subtitle="Mobilfreundlichkeit"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Social Media Performance */}
        <AccordionItem value="social-media" className="border border-gray-700 rounded-lg bg-gray-800/50">
          <AccordionTrigger className="px-4 py-3 text-yellow-400 hover:text-yellow-300">
            <div className="flex items-center justify-between w-full mr-4">
              <span className="font-semibold">Social Media Performance</span>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                1 Bereich
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid grid-cols-1 gap-4">
              <ScoreCard 
                title="Social Media Präsenz" 
                score={socialMediaScore}
                subtitle={manualSocialData ? "Manuell bewertet" : "Automatisch ermittelt"}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Personal & Service */}
        {(staffQualificationData || workplaceScore > 0 || quoteResponseData) && (
          <AccordionItem value="staff-service" className="border border-gray-700 rounded-lg bg-gray-800/50">
            <AccordionTrigger className="px-4 py-3 text-yellow-400 hover:text-yellow-300">
              <div className="flex items-center justify-between w-full mr-4">
                <span className="font-semibold">Personal & Service</span>
                <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                  Zusatzanalyse
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffQualificationData && (
                  <ScoreCard 
                    title="Mitarbeiterqualifikation" 
                    score={calculateStaffQualificationScore(staffQualificationData)}
                    subtitle="Fachkompetenz"
                  />
                )}
                {workplaceScore > 0 && (
                  <ScoreCard 
                    title="Arbeitsplatz-Bewertungen" 
                    score={workplaceScore}
                    subtitle="Kununu/Glassdoor"
                  />
                )}
                {quoteResponseData && (
                  <ScoreCard 
                    title="Angebotsverhalten" 
                    score={calculateQuoteResponseScore(quoteResponseData)}
                    subtitle="Reaktionszeit"
                  />
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};

export default AccordionExecutiveSummary;