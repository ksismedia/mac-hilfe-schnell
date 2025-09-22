import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData, HourlyRateData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateLocalSEOScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateWorkplaceScore, calculateHourlyRateScore } from './export/scoreCalculations';
import { getScoreTextDescription } from '@/utils/scoreTextUtils';
import { Search, Zap, Share2, Users, Building2, HeartHandshake } from 'lucide-react';

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
  // Calculate individual scores like in OverallRating
  const keywords = realData.keywords || [];
  const keywordsFoundCount = keywords.filter(k => k.found).length;
  const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;

  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const localSEOScore = calculateLocalSEOScore(businessData, realData);
  const workplaceScoreRaw = calculateWorkplaceScore(realData, manualWorkplaceData);
  const workplaceScore = workplaceScoreRaw === -1 ? 0 : workplaceScoreRaw;
  const staffQualificationScore = calculateStaffQualificationScore(staffQualificationData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);

  // Define 6 categories with their individual metrics (tiles)
  const categories = [
    {
      id: 'online-quality-authority',
      title: 'Online-Qualität · Relevanz · Autorität',
      icon: Search,
      metrics: [
        { name: 'SEO-Auswertung', score: realData.seo.score, subtitle: 'Suchmaschinenoptimierung' },
        { name: 'Lokale SEO', score: localSEOScore, subtitle: 'Lokale Sichtbarkeit' },
        { name: 'Keywords', score: currentKeywordsScore, subtitle: 'Keyword-Optimierung' },
        { name: 'Barrierefreiheit', score: accessibilityData?.score || 0, subtitle: 'Accessibility Score' },
        { name: 'Datenschutz', score: privacyData?.score || 0, subtitle: 'Privacy Compliance' },
        { name: 'DSGVO', score: privacyData?.gdprScore || 0, subtitle: 'GDPR Compliance' },
        { name: 'Impressum', score: realData.imprint.score, subtitle: 'Rechtssicherheit' }
      ]
    },
    {
      id: 'website-performance-tech',
      title: 'Webseiten-Performance & Technik',
      icon: Zap,
      metrics: [
        { name: 'Performance', score: realData.performance.score, subtitle: `Ladezeit: ${realData.performance.loadTime || 'N/A'}` },
        { name: 'Mobile', score: realData.mobile.overallScore, subtitle: 'Mobilfreundlichkeit' }
      ]
    },
    {
      id: 'social-media-performance',
      title: 'Online-/Web-/Social-Media Performance',
      icon: Share2,
      metrics: [
        { name: 'Social Media', score: socialMediaScore, subtitle: 'Social Media Präsenz' },
        { name: 'Social Proof', score: realData.socialProof.overallScore, subtitle: 'Soziale Bestätigung' }
      ]
    },
    {
      id: 'market-environment',
      title: 'Markt & Marktumfeld',
      icon: Users,
      metrics: [
        { name: 'Google Bewertungen', score: realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0, subtitle: `${realData.reviews.google.rating || 0}/5 (${realData.reviews.google.count || 0} Bewertungen)` },
        { name: 'Konkurrenz', score: competitorScore !== null && competitorScore !== undefined ? competitorScore : (realData.competitors.length > 0 ? Math.min(100, 60 + (realData.competitors.length * 5)) : 30), subtitle: 'Wettbewerbsposition' },
        ...(workplaceScoreRaw !== -1 ? [{ name: 'Arbeitsplatz-Bewertungen', score: workplaceScore, subtitle: 'Kununu/Glassdoor Bewertungen' }] : [])
      ]
    },
    {
      id: 'corporate-appearance',
      title: 'Außendarstellung & Erscheinungsbild',
      icon: Building2,
      metrics: [
        // Corporate Identity metrics would go here if available
      ]
    },
    {
      id: 'service-quality',
      title: 'Qualität · Service · Kundenorientierung',
      icon: HeartHandshake,
      metrics: [
        ...(staffQualificationScore !== null ? [{ name: 'Personal-Qualifikation', score: staffQualificationScore, subtitle: 'Mitarbeiterqualifikation' }] : []),
        ...(quoteResponseData && quoteResponseData.responseTime ? [{ name: 'Angebotsbearbeitung', score: quoteResponseScore, subtitle: 'Reaktionszeit auf Anfragen' }] : []),
        ...(hourlyRateData && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0) ? [{ name: 'Preispositionierung', score: calculateHourlyRateScore(hourlyRateData), subtitle: getScoreTextDescription(calculateHourlyRateScore(hourlyRateData), 'hourlyRate') }] : [])
      ]
    }
  ];

  // Calculate category scores
  const categoriesWithScores = categories.map(category => {
    if (category.metrics.length === 0) return { ...category, score: 0 };
    const totalMetrics = category.metrics.length;
    const scoreSum = category.metrics.reduce((sum, metric) => sum + metric.score, 0);
    const score = totalMetrics > 0 ? Math.round(scoreSum / totalMetrics) : 0;
    return { ...category, score };
  });

  // Calculate overall score
  const validCategories = categoriesWithScores.filter(cat => cat.metrics.length > 0);
  const overallScore = validCategories.length > 0 
    ? Math.round(validCategories.reduce((sum, cat) => sum + cat.score, 0) / validCategories.length) 
    : 0;

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

  // Score Card Component - Individual metric tiles
  const ScoreCard = ({ title, score, subtitle }: { title: string; score: number; subtitle?: string }) => (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-white font-medium text-sm">{title}</h4>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getScoreBg(score)}`}>
          {score > 0 ? `${Math.round(score)}%` : '—'}
        </div>
      </div>
      {subtitle && (
        <p className="text-gray-400 text-xs mb-2">{subtitle}</p>
      )}
      <Progress value={score > 0 ? score : 0} className="h-2" />
    </div>
  );

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
        {categoriesWithScores.map((category) => {
          const IconComponent = category.icon;
          if (category.metrics.length === 0) return null; // Skip empty categories
          
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.metrics.map((metric, index) => (
                    <ScoreCard
                      key={index}
                      title={metric.name}
                      score={metric.score}
                      subtitle={metric.subtitle}
                    />
                  ))}
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