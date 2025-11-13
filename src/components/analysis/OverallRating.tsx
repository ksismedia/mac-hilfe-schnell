
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData, HourlyRateData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData, ManualLocalSEOData, ManualIndustryReviewData, ManualOnlinePresenceData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateLocalSEOScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateWorkplaceScore, calculateHourlyRateScore, calculateContentQualityScore, calculateBacklinksScore, calculateAccessibilityScore, calculateDataPrivacyScore, calculateIndustryReviewScore, calculateOnlinePresenceScore } from './export/scoreCalculations';
import { getScoreTextDescription } from '@/utils/scoreTextUtils';

interface OverallRatingProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei';
  };
  realData: RealBusinessData;
  manualSocialData?: ManualSocialData | null;
  keywordsScore?: number | null;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  hourlyRateData?: HourlyRateData | null;
  manualWorkplaceData?: any;
  competitorScore?: number | null;
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  manualDataPrivacyData?: ManualDataPrivacyData | null;
  manualLocalSEOData?: ManualLocalSEOData | null;
  manualIndustryReviewData?: ManualIndustryReviewData | null;
  manualOnlinePresenceData?: ManualOnlinePresenceData | null;
  privacyData?: any;
  accessibilityData?: any;
}

const OverallRating: React.FC<OverallRatingProps> = ({ 
  businessData, 
  realData, 
  manualSocialData, 
  keywordsScore, 
  staffQualificationData, 
  quoteResponseData, 
  hourlyRateData, 
  manualWorkplaceData, 
  competitorScore,
  manualContentData,
  manualAccessibilityData,
  manualBacklinkData,
  manualDataPrivacyData,
  manualLocalSEOData,
  manualIndustryReviewData,
  manualOnlinePresenceData,
  privacyData,
  accessibilityData
}) => {
  // Keywords-Score - use provided score or calculate default
  const keywords = realData.keywords || [];
  const keywordsFoundCount = keywords.filter(k => k.found).length;
  const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;

  // Social Media Score - VEREINFACHT
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  
  // Local SEO Score - STRENGE BEWERTUNG MIT HÖCHSTER GEWICHTUNG
  const localSEOScore = calculateLocalSEOScore(businessData, realData, manualLocalSEOData);

  // Workplace Score - korrigierte Berechnung verwenden
  const workplaceScoreRaw = calculateWorkplaceScore(realData, manualWorkplaceData);
  const workplaceScore = workplaceScoreRaw === -1 ? 0 : workplaceScoreRaw; // Use 0 for calculation but keep -1 for display

  // Staff Qualification Score - nur bewerten wenn Daten vorhanden
  const staffQualificationScore = calculateStaffQualificationScore(staffQualificationData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);
  
  // Content, Accessibility, Backlinks, Privacy Scores
  const contentScore = manualContentData ? calculateContentQualityScore(realData, null, businessData, manualContentData) : null;
  const accessibilityScore = (manualAccessibilityData || accessibilityData) ? calculateAccessibilityScore(realData, manualAccessibilityData || accessibilityData) : null;
  const backlinksScore = manualBacklinkData ? calculateBacklinksScore(realData, manualBacklinkData) : null;
  const dataPrivacyScore = (manualDataPrivacyData || privacyData) ? calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData) : null;
  
  // Industry Reviews and Online Presence
  const industryReviewScore = manualIndustryReviewData ? calculateIndustryReviewScore(manualIndustryReviewData) : null;
  const onlinePresenceScore = manualOnlinePresenceData ? calculateOnlinePresenceScore(manualOnlinePresenceData) : null;

  // Alle Metriken - MIT MITARBEITERQUALIFIZIERUNG (nur wenn Daten vorhanden)
  const baseMetrics = [
    { name: 'Local SEO', score: localSEOScore, weight: 24, maxScore: 100 }, // HÖCHSTE GEWICHTUNG für Handwerk
    { name: 'SEO', score: realData.seo.score, weight: 14, maxScore: 100 },
    { name: 'Performance', score: realData.performance.score, weight: 11, maxScore: 100 },
    { name: 'Impressum', score: realData.imprint.score, weight: 9, maxScore: 100 },
    { name: 'Keywords', score: currentKeywordsScore, weight: 8, maxScore: 100 },
    { name: 'Bewertungen', score: realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0, weight: 7, maxScore: 100 },
    { name: 'Mobile', score: realData.mobile.overallScore, weight: 6, maxScore: 100 },
    { name: 'Social Media', score: socialMediaScore, weight: 6, maxScore: 100 },
    { name: 'Social Proof', score: realData.socialProof?.overallScore ?? 0, weight: 4, maxScore: 100 },
    { name: 'Arbeitsplatz', score: workplaceScoreRaw, weight: workplaceScoreRaw === -1 ? 0 : 2, maxScore: 100 }, // Don't count in overall if no data
    { name: 'Konkurrenz', score: competitorScore !== null && competitorScore !== undefined ? competitorScore : (realData.competitors.length > 0 ? Math.min(100, 60 + (realData.competitors.length * 5)) : 30), weight: 1, maxScore: 100 }
  ];

  // Füge nur bewertete Bereiche hinzu
  const metrics = [...baseMetrics];
  
  if (staffQualificationScore !== null) {
    metrics.push({ name: 'Personal', score: staffQualificationScore, weight: 8, maxScore: 100 });
  }
  
  if (quoteResponseData && quoteResponseData.responseTime) {
    metrics.push({ name: 'Angebotsbearbeitung', score: quoteResponseScore, weight: 6, maxScore: 100 });
  }
  
  // Stundensatz - nur bewerten wenn tatsächlich eingegeben
  if (hourlyRateData && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0 || hourlyRateData.azubiRate > 0 || hourlyRateData.helferRate > 0 || hourlyRateData.serviceRate > 0 || hourlyRateData.installationRate > 0 || hourlyRateData.regionalMeisterRate > 0 || hourlyRateData.regionalFacharbeiterRate > 0 || hourlyRateData.regionalAzubiRate > 0 || hourlyRateData.regionalHelferRate > 0 || hourlyRateData.regionalServiceRate > 0 || hourlyRateData.regionalInstallationRate > 0)) {
    const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
    metrics.push({ name: 'Preispositionierung', score: hourlyRateScore, weight: 4, maxScore: 100 });
  }
  
  // Content Quality - wenn manuell eingegeben
  if (contentScore !== null) {
    metrics.push({ name: 'Content-Qualität', score: contentScore, weight: 5, maxScore: 100 });
  }
  
  // Accessibility - wenn manuell eingegeben oder automatisch analysiert
  if (accessibilityScore !== null) {
    metrics.push({ name: 'Barrierefreiheit', score: accessibilityScore, weight: 4, maxScore: 100 });
  }
  
  // Backlinks - wenn manuell eingegeben
  if (backlinksScore !== null) {
    metrics.push({ name: 'Backlinks', score: backlinksScore, weight: 5, maxScore: 100 });
  }
  
  // Data Privacy - wenn manuell eingegeben oder automatisch analysiert
  if (dataPrivacyScore !== null) {
    metrics.push({ name: 'Datenschutz', score: dataPrivacyScore, weight: 6, maxScore: 100 });
  }
  
  // Industry Reviews - wenn manuell eingegeben
  if (industryReviewScore !== null && industryReviewScore > 0) {
    metrics.push({ name: 'Branchenplattformen', score: industryReviewScore, weight: 4, maxScore: 100 });
  }
  
  // Online Presence - wenn manuell eingegeben
  if (onlinePresenceScore !== null && onlinePresenceScore > 0) {
    metrics.push({ name: 'Online-Präsenz', score: onlinePresenceScore, weight: 3, maxScore: 100 });
  }

  // Gewichteter Gesamtscore
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  const overallScore = Math.round(weightedScore / totalWeight);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'score-text-high';   // 90-100% gold
    if (score >= 61) return 'score-text-medium'; // 61-89% grün
    return 'score-text-low';                     // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'secondary'; // gold
    if (score >= 61) return 'default'; // grün
    return 'destructive'; // rot
  };

  const getScoreTextDescriptionLocal = (score: number, metricName: string) => {
    return getScoreTextDescription(score, 
      metricName === 'Preispositionierung' ? 'hourlyRate' :
      metricName === 'SEO' ? 'seo' :
      metricName === 'Performance' ? 'performance' :
      metricName === 'Mobile' ? 'mobile' :
      metricName === 'Impressum' ? 'imprint' :
      metricName === 'Social Media' ? 'social' :
      metricName === 'Arbeitsplatz' ? 'workplace' :
      'general'
    );
  };

  // Prüfung ob Social Media Daten vorhanden
  const hasSocialData = Boolean(manualSocialData && (
    manualSocialData.facebookUrl || manualSocialData.instagramUrl || 
    manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl
  ));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gesamtbewertung - {realData.company.name}</CardTitle>
          <CardDescription>
            Vollständige Analyse für {realData.company.url}
            {hasSocialData && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                ✅ Social Media aktiv
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                {(overallScore/20).toFixed(1)}/5
              </div>
              <Badge variant={getScoreBadge(overallScore)}>
                {overallScore}/100 Punkte
              </Badge>
              <div className="mt-2 text-sm text-gray-600">
                Basierend auf {metrics.length} Analysebereichen
              </div>
            </div>

            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.name}</span>
              <Badge variant="outline" className="text-xs">
                {metric.weight}% Gewichtung
              </Badge>
                      {metric.name === 'Social Media' && (
                        <Badge variant={hasSocialData ? "default" : "destructive"} className="text-xs">
                          {hasSocialData ? `✅ ${socialMediaScore} Punkte` : '❌ Keine Daten'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getScoreColor(metric.score)}`}>
                        {metric.name === 'Preispositionierung' ? getScoreTextDescription(metric.score, 'hourlyRate') : (metric.score > 0 ? `${Math.round(metric.score)}/100` : '—')}
                      </span>
                    </div>
                  </div>
                  <Progress value={metric.score > 0 ? metric.score : 0} className="h-2" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold score-text-high">
                  {metrics.filter(m => m.score >= 90).length}
                </div>
                <div className="text-sm text-gray-600">Sehr gut (≥90%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold score-text-medium">
                  {metrics.filter(m => m.score >= 61 && m.score < 90).length}
                </div>
                <div className="text-sm text-gray-600">Gut (61-89%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold score-text-low">
                  {metrics.filter(m => m.score < 61).length}
                </div>
                <div className="text-sm text-gray-600">Verbesserung nötig (&lt;61%)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverallRating;
