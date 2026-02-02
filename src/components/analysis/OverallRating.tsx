
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData, HourlyRateData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData, ManualLocalSEOData, ManualIndustryReviewData, ManualOnlinePresenceData, ManualCorporateIdentityData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { 
  calculateLocalSEOScore, 
  calculateStaffQualificationScore, 
  calculateQuoteResponseScore, 
  calculateWorkplaceScore, 
  calculateHourlyRateScore, 
  calculateContentQualityScore, 
  calculateBacklinksScore, 
  calculateAccessibilityScore, 
  calculateDataPrivacyScore, 
  calculateTechnicalSecurityScore, 
  calculateIndustryReviewScore, 
  calculateOnlinePresenceScore, 
  calculateCorporateIdentityScore,
  calculateOnlineQualityAuthorityScore,
  calculateWebsitePerformanceTechScore,
  calculateSocialMediaPerformanceScore,
  calculateMarketEnvironmentScore,
  calculateCorporateAppearanceScore,
  calculateServiceQualityScore,
  calculateOverallScore
} from './export/scoreCalculations';
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
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung' | 'innenausbau';
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
  manualMobileData?: any | null;
  manualReputationData?: any | null;
  privacyData?: any;
  accessibilityData?: any;
  securityData?: any;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  extensionData?: any | null;
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
  securityData,
  manualCorporateIdentityData,
  manualMobileData,
  manualReputationData,
  extensionData
}) => {
  // Keywords-Score - use provided score or calculate default
  const keywords = realData.keywords || [];
  const keywordsFoundCount = keywords.filter(k => k.found).length;
  const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;

  // ========================================
  // KATEGORIE-SCORES MIT ZENTRALISIERTEN FUNKTIONEN
  // ========================================
  
  // Kategorie 1: Online-Qualität · Relevanz · Autorität
  const cat1Avg = calculateOnlineQualityAuthorityScore(
    realData,
    currentKeywordsScore,
    businessData,
    privacyData,
    accessibilityData,
    manualContentData,
    manualBacklinkData,
    manualLocalSEOData,
    manualDataPrivacyData,
    manualAccessibilityData,
    securityData,
    manualReputationData,
    extensionData,
    null  // manualSEOData - OverallRating hat keinen Zugriff auf manualSEOData
  );
  
  // Kategorie 2: Webseiten-Performance & Technik
  const cat2Avg = calculateWebsitePerformanceTechScore(realData, manualConversionData, manualMobileData);
  
  // Kategorie 3: Online-/Web-/Social-Media Performance
  const cat3Avg = calculateSocialMediaPerformanceScore(
    realData,
    manualSocialData,
    manualIndustryReviewData,
    manualOnlinePresenceData
  );
  
  // Kategorie 4: Markt & Marktumfeld
  const cat4Avg = calculateMarketEnvironmentScore(
    realData,
    hourlyRateData,
    staffQualificationData,
    competitorScore,
    manualWorkplaceData
  );
  
  // Kategorie 5: Außendarstellung & Erscheinungsbild
  const cat5Avg = calculateCorporateAppearanceScore(manualCorporateIdentityData);
  
  // Kategorie 6: Qualität · Service · Kundenorientierung
  const cat6Avg = calculateServiceQualityScore(quoteResponseData);

  // Gewichteter Gesamtscore mit dynamischer Gewichtsverteilung
  const overallScore = calculateOverallScore(cat1Avg, cat2Avg, cat3Avg, cat4Avg, cat5Avg, cat6Avg);

  // Alle Metriken für die Detail-Anzeige - individuelle Scores für Tooltips
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const localSEOScore = calculateLocalSEOScore(businessData, realData, manualLocalSEOData);
  const workplaceScoreRaw = calculateWorkplaceScore(realData, manualWorkplaceData);
  const staffQualificationScore = calculateStaffQualificationScore(staffQualificationData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);
  const contentScore = (manualContentData || extensionData) ? calculateContentQualityScore(realData, null, businessData, manualContentData, extensionData) : null;
  const accessibilityScore = (manualAccessibilityData || accessibilityData) ? calculateAccessibilityScore(accessibilityData, manualAccessibilityData) : null;
  const backlinksScore = manualBacklinkData ? calculateBacklinksScore(realData, manualBacklinkData, manualReputationData) : null;
  const dataPrivacyScore = (manualDataPrivacyData || privacyData) 
    ? calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData)
    : null;
  const technicalSecurityScore = privacyData ? calculateTechnicalSecurityScore(privacyData, manualDataPrivacyData) : null;
  const websiteSecurityScore = securityData ? (securityData.isSafe === true ? 100 : securityData.isSafe === false ? 0 : 50) : null;
  const industryReviewScore = manualIndustryReviewData ? calculateIndustryReviewScore(manualIndustryReviewData) : null;
  const onlinePresenceScore = manualOnlinePresenceData ? calculateOnlinePresenceScore(manualOnlinePresenceData) : null;
  const hourlyRateScore = hourlyRateData && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0 || hourlyRateData.azubiRate > 0 || hourlyRateData.helferRate > 0 || hourlyRateData.serviceRate > 0 || hourlyRateData.installationRate > 0 || hourlyRateData.regionalMeisterRate > 0 || hourlyRateData.regionalFacharbeiterRate > 0 || hourlyRateData.regionalAzubiRate > 0 || hourlyRateData.regionalHelferRate > 0 || hourlyRateData.regionalServiceRate > 0 || hourlyRateData.regionalInstallationRate > 0)
    ? calculateHourlyRateScore(hourlyRateData)
    : null;
  const corporateIdentityScore = manualCorporateIdentityData ? calculateCorporateIdentityScore(manualCorporateIdentityData) : null;
  const googleReviewsScore = calculateGoogleReviewsScore(realData);
  const conversionScore = manualConversionData ? (manualConversionData.overallScore || 0) : 0;

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

  // State für Collapsible
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

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

            <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
              <CollapsibleTrigger asChild>
                <div 
                  className="cursor-pointer rounded-lg p-4 transition-all duration-300 hover:scale-[1.01] mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)',
                    border: '2px solid rgba(251, 191, 36, 0.5)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ChevronRight 
                        className={`h-5 w-5 text-[#fbbf24] transition-transform duration-300 ${isCategoriesOpen ? 'rotate-90' : ''}`}
                      />
                      <h3 className="text-[#fbbf24] font-bold text-lg m-0">
                        Bewertung der Hauptkategorien
                      </h3>
                    </div>
                    <div 
                      className="px-3 py-1.5 rounded-md text-sm font-semibold"
                      style={{
                        background: 'rgba(251, 191, 36, 0.2)',
                        color: '#fbbf24'
                      }}
                    >
                      Details anzeigen
                    </div>
                  </div>
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-4 px-1">
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
              </CollapsibleContent>
            </Collapsible>

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
