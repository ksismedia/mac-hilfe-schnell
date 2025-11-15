
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData, HourlyRateData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData, ManualLocalSEOData, ManualIndustryReviewData, ManualOnlinePresenceData, ManualCorporateIdentityData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateLocalSEOScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateWorkplaceScore, calculateHourlyRateScore, calculateContentQualityScore, calculateBacklinksScore, calculateAccessibilityScore, calculateDataPrivacyScore, calculateTechnicalSecurityScore, calculateIndustryReviewScore, calculateOnlinePresenceScore, calculateCorporateIdentityScore } from './export/scoreCalculations';
import { getScoreTextDescription } from '@/utils/scoreTextUtils';

// Helper function to calculate Google Reviews Score (same as in scoreCalculations.ts)
const calculateGoogleReviewsScore = (realData: RealBusinessData): number => {
  const reviews = realData.reviews?.google?.count || 0;
  const rating = realData.reviews?.google?.rating || 0;
  let score = 0;
  
  if (rating > 0) {
    score += (rating / 5) * 50;
  }
  if (reviews > 0) {
    if (reviews >= 500) score += 50;
    else if (reviews >= 200) score += 45;
    else if (reviews >= 100) score += 40;
    else if (reviews >= 50) score += 35;
    else if (reviews >= 20) score += 25;
    else if (reviews >= 10) score += 15;
    else score += Math.min(reviews, 10);
  }
  
  return Math.min(score, 100);
};

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
  manualConversionData?: any | null;
  privacyData?: any;
  accessibilityData?: any;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
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
  manualConversionData,
  privacyData,
  accessibilityData,
  manualCorporateIdentityData
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
  const accessibilityScore = (manualAccessibilityData || accessibilityData) ? calculateAccessibilityScore(accessibilityData, manualAccessibilityData) : null;
  const backlinksScore = manualBacklinkData ? calculateBacklinksScore(realData, manualBacklinkData) : null;
  const dataPrivacyScore = (manualDataPrivacyData || privacyData) ? calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData) : null;
  
  // Technical Security Score (separate from DSGVO)
  const technicalSecurityScore = privacyData ? calculateTechnicalSecurityScore(privacyData, manualDataPrivacyData) : null;
  
  // Industry Reviews and Online Presence
  const industryReviewScore = manualIndustryReviewData ? calculateIndustryReviewScore(manualIndustryReviewData) : null;
  const onlinePresenceScore = manualOnlinePresenceData ? calculateOnlinePresenceScore(manualOnlinePresenceData) : null;
  
  // Hourly Rate Score
  const hourlyRateScore = hourlyRateData && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0 || hourlyRateData.azubiRate > 0 || hourlyRateData.helferRate > 0 || hourlyRateData.serviceRate > 0 || hourlyRateData.installationRate > 0 || hourlyRateData.regionalMeisterRate > 0 || hourlyRateData.regionalFacharbeiterRate > 0 || hourlyRateData.regionalAzubiRate > 0 || hourlyRateData.regionalHelferRate > 0 || hourlyRateData.regionalServiceRate > 0 || hourlyRateData.regionalInstallationRate > 0)
    ? calculateHourlyRateScore(hourlyRateData)
    : null;

  // ========================================
  // KATEGORISIERUNG DER METRIKEN (wie in htmlGenerator.ts)
  // ========================================
  
  // Basis-Gewichtungen für die 6 Hauptkategorien
  const baseCat1Weight = 30; // Online-Qualität · Relevanz · Autorität
  const baseCat2Weight = 20; // Webseiten-Performance & Technik
  const baseCat3Weight = 20; // Online-/Web-/Social-Media Performance
  const baseCat4Weight = 10; // Markt & Marktumfeld
  const baseCat5Weight = 10; // Außendarstellung & Erscheinungsbild
  const baseCat6Weight = 10; // Qualität · Service · Kundenorientierung
  
  // Kategorie 1: Online-Qualität · Relevanz · Autorität
  const cat1Scores = [
    realData.seo.score,
    localSEOScore,
    realData.imprint.score
  ].filter(s => s > 0);
  
  if (contentScore !== null) cat1Scores.push(contentScore);
  if (accessibilityScore !== null) cat1Scores.push(accessibilityScore);
  if (backlinksScore !== null) cat1Scores.push(backlinksScore);
  if (dataPrivacyScore !== null) cat1Scores.push(dataPrivacyScore);
  if (technicalSecurityScore !== null) cat1Scores.push(technicalSecurityScore);
  
  const cat1Avg = cat1Scores.length > 0 ? Math.round(cat1Scores.reduce((a, b) => a + b, 0) / cat1Scores.length) : 0;
  
  // Kategorie 2: Webseiten-Performance & Technik
  const conversionScore = manualConversionData ? (manualConversionData.overallScore || 0) : 0;
  const cat2Scores = [
    realData.performance.score,
    realData.mobile.overallScore
  ];
  
  if (conversionScore > 0) {
    cat2Scores.push(conversionScore);
  }
  
  const cat2Avg = cat2Scores.length > 0 ? Math.round(cat2Scores.reduce((a, b) => a + b, 0) / cat2Scores.length) : 0;
  
  // Kategorie 3: Online-/Web-/Social-Media Performance
  const googleReviewsScore = calculateGoogleReviewsScore(realData);
  const cat3Scores = [
    googleReviewsScore,
    socialMediaScore,
    realData.socialProof?.overallScore ?? 0
  ].filter(s => s > 0);
  
  if (industryReviewScore !== null && industryReviewScore > 0) cat3Scores.push(industryReviewScore);
  if (onlinePresenceScore !== null && onlinePresenceScore > 0) cat3Scores.push(onlinePresenceScore);
  
  const cat3Avg = cat3Scores.length > 0 ? Math.round(cat3Scores.reduce((a, b) => a + b, 0) / cat3Scores.length) : 0;
  
  // Kategorie 4: Markt & Marktumfeld
  const cat4Scores = [
    competitorScore !== null && competitorScore !== undefined ? competitorScore : (realData.competitors.length > 0 ? Math.min(100, 60 + (realData.competitors.length * 5)) : 30),
    workplaceScoreRaw !== -1 ? workplaceScoreRaw : 0
  ].filter(s => s > 0);
  
  if (staffQualificationScore !== null) cat4Scores.push(staffQualificationScore);
  if (hourlyRateScore !== null) cat4Scores.push(hourlyRateScore);
  
  const cat4Avg = cat4Scores.length > 0 ? Math.round(cat4Scores.reduce((a, b) => a + b, 0) / cat4Scores.length) : 0;
  
  // Kategorie 5: Außendarstellung & Erscheinungsbild
  const corporateIdentityScore = manualCorporateIdentityData ? calculateCorporateIdentityScore(manualCorporateIdentityData) : null;
  const cat5Scores = [];
  if (corporateIdentityScore !== null) cat5Scores.push(corporateIdentityScore);
  const cat5Avg = cat5Scores.length > 0 ? Math.round(cat5Scores.reduce((a, b) => a + b, 0) / cat5Scores.length) : 0;
  
  // Kategorie 6: Qualität · Service · Kundenorientierung
  const cat6Scores = [];
  if (quoteResponseScore !== null) cat6Scores.push(quoteResponseScore);
  const cat6Avg = cat6Scores.length > 0 ? Math.round(cat6Scores.reduce((a, b) => a + b, 0) / cat6Scores.length) : 0;
  
  // Dynamische Gewichtsverteilung: Fehlende Kategorien auf vorhandene verteilen
  let adjustedCat1Weight = baseCat1Weight;
  let adjustedCat2Weight = baseCat2Weight;
  let adjustedCat3Weight = baseCat3Weight;
  let adjustedCat4Weight = baseCat4Weight;
  let adjustedCat5Weight = baseCat5Weight;
  let adjustedCat6Weight = baseCat6Weight;

  // Berechne fehlende Gewichte
  let missingWeight = 0;
  const categoriesWithData = [];
  
  if (cat1Avg > 0) {
    categoriesWithData.push('cat1');
  } else {
    missingWeight += adjustedCat1Weight;
    adjustedCat1Weight = 0;
  }
  
  if (cat2Avg > 0) {
    categoriesWithData.push('cat2');
  } else {
    missingWeight += adjustedCat2Weight;
    adjustedCat2Weight = 0;
  }
  
  if (cat3Avg > 0) {
    categoriesWithData.push('cat3');
  } else {
    missingWeight += adjustedCat3Weight;
    adjustedCat3Weight = 0;
  }
  
  if (cat4Avg > 0) {
    categoriesWithData.push('cat4');
  } else {
    missingWeight += adjustedCat4Weight;
    adjustedCat4Weight = 0;
  }
  
  if (cat5Avg > 0) {
    categoriesWithData.push('cat5');
  } else {
    missingWeight += adjustedCat5Weight;
    adjustedCat5Weight = 0;
  }
  
  if (cat6Avg > 0) {
    categoriesWithData.push('cat6');
  } else {
    missingWeight += adjustedCat6Weight;
    adjustedCat6Weight = 0;
  }

  // Verteile fehlende Gewichte gleichmäßig auf vorhandene Kategorien
  if (categoriesWithData.length > 0 && missingWeight > 0) {
    const additionalWeight = missingWeight / categoriesWithData.length;
    if (cat1Avg > 0) adjustedCat1Weight += additionalWeight;
    if (cat2Avg > 0) adjustedCat2Weight += additionalWeight;
    if (cat3Avg > 0) adjustedCat3Weight += additionalWeight;
    if (cat4Avg > 0) adjustedCat4Weight += additionalWeight;
    if (cat5Avg > 0) adjustedCat5Weight += additionalWeight;
    if (cat6Avg > 0) adjustedCat6Weight += additionalWeight;
  }

  // Gewichteter Gesamtscore aus den 6 Kategorien mit angepassten Gewichten
  const totalCategoryWeight = adjustedCat1Weight + adjustedCat2Weight + adjustedCat3Weight + adjustedCat4Weight + adjustedCat5Weight + adjustedCat6Weight;
  const overallScore = totalCategoryWeight > 0 ? Math.round((
    cat1Avg * adjustedCat1Weight +
    cat2Avg * adjustedCat2Weight +
    cat3Avg * adjustedCat3Weight +
    cat4Avg * adjustedCat4Weight +
    cat5Avg * adjustedCat5Weight +
    cat6Avg * adjustedCat6Weight
  ) / totalCategoryWeight) : 0;

  // Alle Metriken für die Detail-Anzeige - GEWICHTE BASIEREN AUF KATEGORIE-ZUGEHÖRIGKEIT
  const baseMetrics = [
    // Kategorie 1 Metriken (30% Gewicht total)
    { name: 'Local SEO', score: localSEOScore, weight: 0, maxScore: 100 },
    { name: 'SEO', score: realData.seo.score, weight: 0, maxScore: 100 },
    { name: 'Impressum', score: realData.imprint.score, weight: 0, maxScore: 100 },
    { name: 'Keywords', score: currentKeywordsScore, weight: 0, maxScore: 100 },
    // Kategorie 2 Metriken (20% Gewicht total)
    { name: 'Performance', score: realData.performance.score, weight: 0, maxScore: 100 },
    { name: 'Mobile', score: realData.mobile.overallScore, weight: 0, maxScore: 100 },
    // Kategorie 3 Metriken (20% Gewicht total)
    { name: 'Bewertungen', score: googleReviewsScore, weight: 0, maxScore: 100 },
    { name: 'Social Media', score: socialMediaScore, weight: 0, maxScore: 100 },
    { name: 'Social Proof', score: realData.socialProof?.overallScore ?? 0, weight: 0, maxScore: 100 },
    // Kategorie 4 Metriken (10% Gewicht total)
    { name: 'Arbeitsplatz', score: workplaceScoreRaw, weight: 0, maxScore: 100 },
    { name: 'Konkurrenz', score: competitorScore !== null && competitorScore !== undefined ? competitorScore : (realData.competitors.length > 0 ? Math.min(100, 60 + (realData.competitors.length * 5)) : 30), weight: 0, maxScore: 100 }
  ];

  // Füge nur bewertete Bereiche hinzu
  const metrics = [...baseMetrics];
  
  // Kategorie 4 (Markt) - zusätzliche Metriken
  if (staffQualificationScore !== null) {
    metrics.push({ name: 'Personal', score: staffQualificationScore, weight: 0, maxScore: 100 });
  }
  
  if (hourlyRateScore !== null) {
    metrics.push({ name: 'Preispositionierung', score: hourlyRateScore, weight: 0, maxScore: 100 });
  }
  
  // Kategorie 6 (Service) - zusätzliche Metriken
  if (quoteResponseData && quoteResponseData.responseTime) {
    metrics.push({ name: 'Angebotsbearbeitung', score: quoteResponseScore, weight: 0, maxScore: 100 });
  }
  
  // Kategorie 1 (Online-Qualität) - zusätzliche Metriken
  if (contentScore !== null) {
    metrics.push({ name: 'Content-Qualität', score: contentScore, weight: 0, maxScore: 100 });
  }
  
  if (accessibilityScore !== null) {
    metrics.push({ name: 'Barrierefreiheit', score: accessibilityScore, weight: 0, maxScore: 100 });
  }
  
  if (backlinksScore !== null) {
    metrics.push({ name: 'Backlinks', score: backlinksScore, weight: 0, maxScore: 100 });
  }
  
  if (dataPrivacyScore !== null) {
    metrics.push({ name: 'Datenschutz (DSGVO)', score: dataPrivacyScore, weight: 0, maxScore: 100 });
  }
  
  if (technicalSecurityScore !== null) {
    metrics.push({ name: 'Technische Sicherheit', score: technicalSecurityScore, weight: 0, maxScore: 100 });
  }
  
  // Kategorie 2 (Performance) - zusätzliche Metriken
  if (conversionScore > 0) {
    metrics.push({ name: 'Conversion', score: conversionScore, weight: 0, maxScore: 100 });
  }
  
  // Kategorie 3 (Social Media) - zusätzliche Metriken
  if (industryReviewScore !== null && industryReviewScore > 0) {
    metrics.push({ name: 'Branchenplattformen', score: industryReviewScore, weight: 0, maxScore: 100 });
  }
  
  if (onlinePresenceScore !== null && onlinePresenceScore > 0) {
    metrics.push({ name: 'Online-Präsenz', score: onlinePresenceScore, weight: 0, maxScore: 100 });
  }

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
