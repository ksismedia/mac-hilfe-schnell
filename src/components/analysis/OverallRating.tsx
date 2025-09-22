import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData, HourlyRateData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateLocalSEOScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateWorkplaceScore, calculateHourlyRateScore } from './export/scoreCalculations';
import { getScoreTextDescription } from '@/utils/scoreTextUtils';
import { Search, Zap, Share2, Users, Building2, HeartHandshake } from 'lucide-react';

interface OverallRatingProps {
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
}

const OverallRating: React.FC<OverallRatingProps> = ({ businessData, realData, manualSocialData, keywordsScore, staffQualificationData, quoteResponseData, hourlyRateData, manualWorkplaceData, competitorScore }) => {
  // Keywords-Score - use provided score or calculate default
  const keywords = realData.keywords || [];
  const keywordsFoundCount = keywords.filter(k => k.found).length;
  const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;

  // Social Media Score - VEREINFACHT
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  
  // Local SEO Score - STRENGE BEWERTUNG MIT HÖCHSTER GEWICHTUNG
  const localSEOScore = calculateLocalSEOScore(businessData, realData);

  // Workplace Score - korrigierte Berechnung verwenden
  const workplaceScoreRaw = calculateWorkplaceScore(realData, manualWorkplaceData);
  const workplaceScore = workplaceScoreRaw === -1 ? 0 : workplaceScoreRaw;

  // Staff Qualification Score - nur bewerten wenn Daten vorhanden
  const staffQualificationScore = calculateStaffQualificationScore(staffQualificationData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);

  // Calculate overall score from all metrics
  const baseMetrics = [
    { name: 'Local SEO', score: localSEOScore, weight: 24 },
    { name: 'SEO', score: realData.seo.score, weight: 14 },
    { name: 'Performance', score: realData.performance.score, weight: 11 },
    { name: 'Impressum', score: realData.imprint.score, weight: 9 },
    { name: 'Keywords', score: currentKeywordsScore, weight: 8 },
    { name: 'Bewertungen', score: realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0, weight: 7 },
    { name: 'Mobile', score: realData.mobile.overallScore, weight: 6 },
    { name: 'Social Media', score: socialMediaScore, weight: 6 },
    { name: 'Social Proof', score: realData.socialProof.overallScore, weight: 4 },
    { name: 'Arbeitsplatz', score: workplaceScoreRaw, weight: workplaceScoreRaw === -1 ? 0 : 2 },
    { name: 'Konkurrenz', score: competitorScore !== null && competitorScore !== undefined ? competitorScore : (realData.competitors.length > 0 ? Math.min(100, 60 + (realData.competitors.length * 5)) : 30), weight: 1 }
  ];

  const metrics = [...baseMetrics];
  
  if (staffQualificationScore !== null) {
    metrics.push({ name: 'Personal', score: staffQualificationScore, weight: 8 });
  }
  
  if (quoteResponseData && quoteResponseData.responseTime) {
    metrics.push({ name: 'Angebotsbearbeitung', score: quoteResponseScore, weight: 6 });
  }
  
  if (hourlyRateData && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0 || hourlyRateData.azubiRate > 0 || hourlyRateData.helferRate > 0 || hourlyRateData.serviceRate > 0 || hourlyRateData.installationRate > 0 || hourlyRateData.regionalMeisterRate > 0 || hourlyRateData.regionalFacharbeiterRate > 0 || hourlyRateData.regionalAzubiRate > 0 || hourlyRateData.regionalHelferRate > 0 || hourlyRateData.regionalServiceRate > 0 || hourlyRateData.regionalInstallationRate > 0)) {
    const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
    metrics.push({ name: 'Preispositionierung', score: hourlyRateScore, weight: 4 });
  }

  // Calculate overall score
  const totalWeight = metrics.filter(m => m.weight > 0).reduce((sum, metric) => sum + metric.weight, 0);
  const weightedSum = metrics.filter(m => m.weight > 0).reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
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

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 61) return 'secondary';
    return 'destructive';
  };

  // Score Card Component
  const ScoreCard = ({ title, score, subtitle, weight }: { title: string; score: number; subtitle?: string; weight?: number }) => (
    <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h4 className="text-white font-medium text-sm">{title}</h4>
          {weight && (
            <Badge variant="outline" className="text-xs">
              {weight}% Gewichtung
            </Badge>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getScoreBg(score)}`}>
          {score > 0 ? `${Math.round(score)}%` : '—'}
        </div>
      </div>
      {subtitle && (
        <p className="text-gray-400 text-xs">{subtitle}</p>
      )}
      <Progress value={score > 0 ? score : 0} className="h-2 mt-2" />
    </div>
  );

  // Verbessertes Social Media Badge
  const hasSocialData = manualSocialData && (
    manualSocialData.facebookUrl || 
    manualSocialData.instagramUrl || 
    manualSocialData.linkedinUrl || 
    manualSocialData.youtubeUrl || 
    manualSocialData.tiktokUrl
  );

  // Define 6 categories with their metrics
  const categories = [
    {
      id: 'online-quality-authority',
      title: 'Online-Qualität · Relevanz · Autorität',
      icon: Search,
      metrics: [
        { name: 'Local SEO', score: localSEOScore, weight: 24, subtitle: 'Lokale Sichtbarkeit' },
        { name: 'SEO', score: realData.seo.score, weight: 14, subtitle: 'Suchmaschinenoptimierung' },
        { name: 'Keywords', score: currentKeywordsScore, weight: 8, subtitle: 'Keyword-Optimierung' },
        { name: 'Impressum', score: realData.imprint.score, weight: 9, subtitle: 'Rechtssicherheit' }
      ]
    },
    {
      id: 'website-performance-tech',
      title: 'Webseiten-Performance & Technik',
      icon: Zap,
      metrics: [
        { name: 'Performance', score: realData.performance.score, weight: 11, subtitle: `Ladezeit: ${realData.performance.loadTime || 'N/A'}` },
        { name: 'Mobile', score: realData.mobile.overallScore, weight: 6, subtitle: 'Mobilfreundlichkeit' }
      ]
    },
    {
      id: 'social-media-performance',
      title: 'Online-/Web-/Social-Media Performance',
      icon: Share2,
      metrics: [
        { name: 'Social Media', score: socialMediaScore, weight: 6, subtitle: hasSocialData ? `✅ ${socialMediaScore} Punkte` : '❌ Keine Daten' },
        { name: 'Social Proof', score: realData.socialProof.overallScore, weight: 4, subtitle: 'Soziale Bestätigung' }
      ]
    },
    {
      id: 'market-environment',
      title: 'Markt & Marktumfeld',
      icon: Users,
      metrics: [
        { name: 'Bewertungen', score: realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0, weight: 7, subtitle: `Google: ${realData.reviews.google.rating || 0}/5 (${realData.reviews.google.count || 0} Bewertungen)` },
        { name: 'Konkurrenz', score: competitorScore !== null && competitorScore !== undefined ? competitorScore : (realData.competitors.length > 0 ? Math.min(100, 60 + (realData.competitors.length * 5)) : 30), weight: 1, subtitle: 'Wettbewerbsposition' },
        ...(workplaceScoreRaw !== -1 ? [{ name: 'Arbeitsplatz', score: workplaceScore, weight: 2, subtitle: 'Kununu/Glassdoor Bewertungen' }] : [])
      ]
    },
    {
      id: 'corporate-appearance',
      title: 'Außendarstellung & Erscheinungsbild',
      icon: Building2,
      metrics: [
        // Hier würden Corporate Identity Metriken stehen, falls vorhanden
      ]
    },
    {
      id: 'service-quality',
      title: 'Qualität · Service · Kundenorientierung',
      icon: HeartHandshake,
      metrics: [
        ...(staffQualificationScore !== null ? [{ name: 'Personal', score: staffQualificationScore, weight: 8, subtitle: 'Mitarbeiterqualifikation' }] : []),
        ...(quoteResponseData && quoteResponseData.responseTime ? [{ name: 'Angebotsbearbeitung', score: quoteResponseScore, weight: 6, subtitle: 'Reaktionszeit auf Anfragen' }] : []),
        ...(hourlyRateData && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0) ? [{ name: 'Preispositionierung', score: calculateHourlyRateScore(hourlyRateData), weight: 4, subtitle: getScoreTextDescription(calculateHourlyRateScore(hourlyRateData), 'hourlyRate') }] : [])
      ]
    }
  ];

  // Calculate category scores
  const categoriesWithScores = categories.map(category => {
    if (category.metrics.length === 0) return { ...category, score: 0 };
    const totalWeight = category.metrics.reduce((sum, metric) => sum + metric.weight, 0);
    const weightedSum = category.metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
    const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    return { ...category, score };
  });

  return (
    <div className="w-full">
      {/* Overall Score Header */}
      <Card className="mb-6 bg-gray-800 border-yellow-400/30">
        <CardHeader className="text-center">
          <CardTitle className="text-yellow-400 text-2xl">Executive Summary</CardTitle>
          <CardDescription className="text-gray-300">
            Gesamtbewertung basierend auf {metrics.filter(m => m.weight > 0).length} Analysebereichen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(overallScore)}`}>
              {overallScore}%
            </div>
            <Badge variant={getScoreBadge(overallScore)} className="text-lg px-4 py-2">
              {overallScore}/100 Punkte
            </Badge>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {metrics.filter(m => m.score >= 90).length}
                </div>
                <div className="text-sm text-gray-400">Sehr gut (≥90%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {metrics.filter(m => m.score >= 61 && m.score < 90).length}
                </div>
                <div className="text-sm text-gray-400">Gut (61-89%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {metrics.filter(m => m.score < 61).length}
                </div>
                <div className="text-sm text-gray-400">Verbesserung nötig (&lt;61%)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accordion Categories */}
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
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                      {category.metrics.length} Bereiche
                    </Badge>
                    <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getScoreBg(category.score)}`}>
                      {Math.round(category.score)}%
                    </div>
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
                      weight={metric.weight}
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

export default OverallRating;