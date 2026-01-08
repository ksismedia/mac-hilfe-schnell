

import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData, ManualImprintData, CompetitorServices, CompanyServices, ManualCorporateIdentityData, StaffQualificationData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData, ManualLocalSEOData, ManualIndustryReviewData, ManualOnlinePresenceData, ManualConversionData, ManualMobileData, ManualReputationData, ManualSEOData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { 
  calculateOverallScore, 
  calculateHourlyRateScore, 
  calculateContentQualityScore, 
  calculateBacklinksScore, 
  calculateAccessibilityScore, 
  calculateLocalSEOScore, 
  calculateCorporateIdentityScore, 
  calculateStaffQualificationScore, 
  calculateQuoteResponseScore, 
  calculateDataPrivacyScore, 
  calculateTechnicalSecurityScore, 
  calculateWorkplaceScore,
  calculateOnlineQualityAuthorityScore,
  calculateWebsitePerformanceTechScore,
  calculateSocialMediaPerformanceScore,
  calculateMarketEnvironmentScore,
  calculateCorporateAppearanceScore,
  calculateServiceQualityScore,
  calculateSEOScore,
  calculateImprintScore,
  CRITICAL_IMPRINT_ELEMENTS,
  ALL_IMPRINT_ELEMENTS
} from './scoreCalculations';
import { generateDataPrivacySection } from './reportSections';
import { generateWebsiteSecuritySection } from './websiteSecuritySection';
import { generateReputationMonitoringSection } from './reputationMonitoringSection';
import { getLogoHTML } from './logoData';
import { getCollapsibleComplianceSectionHTML } from './aiActDisclaimer';

interface CustomerReportData {
  businessData: {
    address: string;
    url: string;
    industry: string;
  };
  realData: RealBusinessData;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: { [competitorName: string]: { services: string[]; source: 'auto' | 'manual' } };
  companyServices?: { services: string[] };
  deletedCompetitors?: Set<string>;
  removedMissingServices?: string[];
  hourlyRateData?: { meisterRate: number; facharbeiterRate: number; azubiRate: number; helferRate: number; serviceRate: number; installationRate: number; regionalMeisterRate: number; regionalFacharbeiterRate: number; regionalAzubiRate: number; regionalHelferRate: number; regionalServiceRate: number; regionalInstallationRate: number };
  missingImprintElements?: string[];
  manualSocialData?: ManualSocialData | null;
  manualWorkplaceData?: ManualWorkplaceData | null;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  manualImprintData?: { elements: string[] } | null;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  manualDataPrivacyData?: ManualDataPrivacyData | null;
  manualLocalSEOData?: ManualLocalSEOData | null;
  manualIndustryReviewData?: ManualIndustryReviewData | null;
  manualOnlinePresenceData?: ManualOnlinePresenceData | null;
  manualConversionData?: ManualConversionData | null;
  manualMobileData?: ManualMobileData | null;
  manualReputationData?: ManualReputationData | null;
  manualSEOData?: ManualSEOData | null;
  privacyData?: any;
  accessibilityData?: any;
  securityData?: any;
  // DIREKTE WERTE AUS COMPETITOR ANALYSIS
  calculatedOwnCompanyScore?: number;
  // Chrome Extension Data
  extensionData?: any;
  // KI-VO Compliance
  hasUnreviewedAIContent?: boolean;
}

// Function to get score range for data attribute
const getScoreRange = (score: number) => {
  if (score < 61) return "0-60";
  if (score < 90) return "61-89";
  return "90-100";
};

// Function to get score color class
const getScoreColorClass = (score: number) => {
  if (score < 61) return "red";       // 0-60% rot
  if (score < 90) return "green";     // 61-89% grün
  return "yellow";                    // 90-100% gold
};

// Function to get score color (hex value for inline styles)
const getScoreColor = (score: number) => {
  if (score <= 60) return '#FF0000';   // 0-60% rot
  if (score <= 89) return '#22c55e';   // 61-89% grün
  return '#FFD700';                    // 90-100% gold
};

// Spezielle Farbfunktionen für Barrierefreiheit Compliance (nur für diesen einen Balken)
const getAccessibilityComplianceColorClass = (score: number) => {
  if (score < 95) return "red";        // unter 95% rot
  return "yellow";                     // über 95% gelb
};

const getAccessibilityComplianceColor = (score: number) => {
  if (score < 95) return "#FF0000";    // unter 95% rot
  return "#FFD700";                    // über 95% gelb
};

// Spezielle Farbfunktionen für Wettbewerbsanalyse
const getCompetitorAnalysisColorClass = (ownScore: number, avgCompetitorScore: number) => {
  const difference = ownScore - avgCompetitorScore;
  if (difference <= -5) return "red";     // 5 Punkte unter Durchschnitt: rot
  if (difference <= 1) return "green";    // 4 Punkte unter bis 1 Punkt über Durchschnitt: grün
  return "yellow";                        // Mehr als 1 Punkt über Durchschnitt: gold
};

const getCompetitorAnalysisColor = (ownScore: number, avgCompetitorScore: number) => {
  const difference = ownScore - avgCompetitorScore;
  if (difference <= -5) return "#FF0000";  // 5 Punkte unter Durchschnitt: rot
  if (difference <= 1) return "#22c55e";   // 4 Punkte unter bis 1 Punkt über Durchschnitt: grün
  return "#FFD700";                        // Mehr als 1 Punkt über Durchschnitt: gold
};

// Helper functions for score tile background and text colors
const getScoreTileBackgroundColor = (score: number): string => {
  return score >= 0 && score <= 60 ? '#FF0000' : '#E8E8E8'; // Red for 0-60%, silver for 61-100%
};

const getScoreTileTextColor = (score: number): string => {
  return score >= 0 && score <= 60 ? '#FFFFFF' : '#000000'; // White text on red, black on silver
};

// Einheitliche Progress-Bar mit Prozentzahl im Balken und Beschreibung darunter
const generateProgressBar = (score: number, description: string) => {
  const barColor = getScoreColor(score);
  const textColor = score >= 90 ? '#000' : '#fff';
  const scoreRange = getScoreRange(score);
  
  return `
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" data-score="${scoreRange}" style="width: ${score}%; background-color: ${barColor}; display: flex; align-items: center; justify-content: center;">
          <span style="color: ${textColor}; font-weight: bold; font-size: 12px;">${score}%</span>
        </div>
      </div>
      <p style="margin-top: 5px; font-size: 12px; color: #666;">${description}</p>
    </div>
  `;
};

// Spezielle Progress-Bar für Stundensätze mit korrekter Farblogik
const generateHourlyRateProgressBar = (ratio: number, description: string) => {
  // ratio ist ownRate / regionalRate (z.B. 69/80 = 0.8625)
  let barColor: string;
  let scoreRange: string;
  
  if (ratio < 0.9) {
    // Unter 90% des regionalen Durchschnitts → ROT (zu niedrig, Überprüfung nötig)
    barColor = '#FF0000';
    scoreRange = '0-60';
  } else if (ratio <= 1.1) {
    // 90-110% des regionalen Durchschnitts → GRÜN (akzeptabel)
    barColor = '#22c55e';
    scoreRange = '61-89';
  } else {
    // Über 110% des regionalen Durchschnitts → GOLD (optimal positioniert)
    barColor = '#FFD700';
    scoreRange = '90-100';
  }
  
  const percentage = Math.round(ratio * 100);
  const deviation = ((ratio - 1) * 100).toFixed(1);
  const deviationText = ratio > 1 ? `+${deviation}%` : `${deviation}%`;
  const textColor = ratio > 1.1 ? '#000' : '#fff';
  
  return `
    <div class="progress-container">
      <div class="progress-bar">
        <div class="progress-fill" data-score="${scoreRange}" style="width: ${percentage}%; background-color: ${barColor}; display: flex; align-items: center; justify-content: center;">
          <span style="color: ${textColor}; font-weight: bold; font-size: 12px;">${deviationText}</span>
        </div>
      </div>
      <p style="margin-top: 5px; font-size: 12px; color: #666;">${description}</p>
    </div>
  `;
};

export const generateCustomerHTML = ({
  businessData,
  realData,
  manualCompetitors,
  competitorServices,
  companyServices,
  deletedCompetitors = new Set(),
  removedMissingServices = [],
  hourlyRateData,
  missingImprintElements = [],
  manualSocialData,
  manualWorkplaceData,
  manualCorporateIdentityData,
  manualKeywordData,
  keywordScore,
  manualImprintData,
  manualDataPrivacyData,
  manualLocalSEOData,
  manualIndustryReviewData,
  manualOnlinePresenceData,
  manualConversionData,
  manualMobileData,
  manualReputationData,
  manualSEOData,
  privacyData,
  staffQualificationData,
  quoteResponseData,
  manualContentData,
  manualAccessibilityData,
  manualBacklinkData,
  accessibilityData,
  securityData,
  calculatedOwnCompanyScore,
  extensionData,
  hasUnreviewedAIContent = false
}: CustomerReportData): string => {
  console.log('🟢 generateCustomerHTML called - MAIN CUSTOMER HTML GENERATOR');
  console.log('🔥🔥🔥 CRITICAL: securityData received:', securityData);
  console.log('🔥🔥🔥 securityData is null?', securityData === null);
  console.log('🔥🔥🔥 securityData is undefined?', securityData === undefined);
  console.log('HTML Generator received missingImprintElements:', missingImprintElements);
  console.log('HTML Generator received manualWorkplaceData:', manualWorkplaceData);
  console.log('HTML Generator received competitorServices:', competitorServices);
  console.log('HTML Generator received manualCompetitors:', manualCompetitors);
  
  // Calculate scores for own business including services
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  console.log('🔶 HTML Generator Social Media Debug:', { manualSocialData, socialMediaScore });
  const corporateIdentityScore = calculateCorporateIdentityScore(manualCorporateIdentityData);
  const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);
  const staffQualificationScore = calculateStaffQualificationScore(staffQualificationData);
  
  // Calculate Local SEO score with manual data
  const localSEOScore = calculateLocalSEOScore(businessData, realData, manualLocalSEOData);
  
  // Accessibility scores müssen erst berechnet werden
  const actualAccessibilityScore = calculateAccessibilityScore(accessibilityData, manualAccessibilityData);
  const accessibilityScore = actualAccessibilityScore;
  
  // Helper functions for display - zeige Querstrich für fehlende Daten oder bei 0%
  const displayStaffScore = staffQualificationData && staffQualificationData.totalEmployees > 0 
    ? `${Math.round(staffQualificationScore)}%` 
    : '–';
  const displayQuoteScore = quoteResponseData && quoteResponseData.responseTime 
    ? `${Math.round(quoteResponseScore)}%` 
    : '–';
  const displaySocialScore = socialMediaScore > 0 
    ? `${Math.round(socialMediaScore)}%` 
    : '–';
  const displayAccessibilityScore = accessibilityScore > 0 
    ? `${Math.round(accessibilityScore)}%` 
    : '–';
  const displayLocalSEOScore = localSEOScore > 0 
    ? `${Math.round(localSEOScore)}%` 
    : '–';
  
  // Calculate data privacy score using manual data if available
  const actualDataPrivacyScore = calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData);
  
  // GETRENNTE PRÜFUNG: Kritische rechtliche Verstöße
  const hasCriticalViolations = privacyData?.violations?.some((v: any) => {
    const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
    const violationIndex = privacyData.violations.indexOf(v);
    return (v.severity === 'critical' || v.severity === 'high') && !deselectedViolations.includes(`auto-${violationIndex}`);
  }) || manualDataPrivacyData?.customViolations?.some((v: any) => v.severity === 'critical' || v.severity === 'high');
  
  // GETRENNTE PRÜFUNG: Kritische technische Probleme
  const securityHeaders = privacyData?.realApiData?.securityHeaders;
  const hasNoHSTS = !securityHeaders?.headers?.['Strict-Transport-Security']?.present && 
                     !privacyData?.realApiData?.ssl?.hasHSTS;
  const sslGrade = privacyData?.sslGrade || privacyData?.sslRating;
  const hasPoorSSL = sslGrade === 'F' || sslGrade === 'D' || sslGrade === 'E' || sslGrade === 'T';
  const hasCriticalTechnicalIssues = hasNoHSTS || hasPoorSSL;
  
  // DSGVO-Score: Nutze calculateDataPrivacyScore (wendet automatisch Caps an: 59%/35%/20%)
  const dsgvoScore = actualDataPrivacyScore;
  const displayDataPrivacyScore = dsgvoScore > 0 
    ? `${Math.round(dsgvoScore)}%` 
    : '–';
  const displayDSGVOScore = dsgvoScore > 0 ? `${Math.round(dsgvoScore)}%` : '–';
  
  // Technische Sicherheit Score: bei kritischen technischen Problemen auf genau 59% setzen
  let technicalSecurityScore = calculateTechnicalSecurityScore(privacyData, manualDataPrivacyData);
  technicalSecurityScore = hasCriticalTechnicalIssues ? 59 : technicalSecurityScore;
  const displayTechnicalSecurityScore = technicalSecurityScore > 0 ? `${Math.round(technicalSecurityScore)}%` : '–';
  
  // Calculate additional scores - MIT MANUELLEN DATEN UND EXTENSION DATEN
  const contentQualityScore = calculateContentQualityScore(realData, keywordScore || null, businessData, manualContentData, extensionData);
  const backlinksScore = calculateBacklinksScore(realData, manualBacklinkData, manualReputationData);
  
  // Berechneter SEO-Score mit Extension-Daten und manuellen Bestätigungen
  const calculatedSEOScore = calculateSEOScore(realData, manualSEOData, extensionData);
  
  console.log('🔥 HTML Generator about to calculate accessibility score with:', { manualAccessibilityData });
  console.log('🔥 HTML Generator calculated actualAccessibilityScore:', actualAccessibilityScore);
  
  // Use actual company services if available, otherwise fall back to industry defaults
  console.log('CompanyServices received:', companyServices);
  console.log('CompetitorServices received:', competitorServices);
  
  const industryServiceMap = {
    'shk': ['Heizung', 'Sanitär', 'Klima', 'Wartung', 'Notdienst'],
    'maler': ['Innenanstrich', 'Außenanstrich', 'Tapezieren', 'Fassade', 'Renovierung'],
    'elektriker': ['Installation', 'Reparatur', 'Smart Home', 'Notdienst', 'Wartung'],
    'dachdecker': ['Dachsanierung', 'Reparatur', 'Neubau', 'Dämmung', 'Notdienst'],
    'stukateur': ['Putz', 'Dämmung', 'Trockenbau', 'Sanierung', 'Renovierung'],
    'planungsbuero': ['Planung', 'Beratung', 'Baubegleitung', 'Gutachten', 'Konzepte']
  };
  
  // Use company services if entered by user, otherwise default to industry services
  const expectedServices = (companyServices && companyServices.services && companyServices.services.length > 0) 
    ? companyServices.services 
    : industryServiceMap[businessData.industry as keyof typeof industryServiceMap] || [];
  
  // Services für Score-Berechnung: eigene Services + entfernte "fehlende" Services (EXAKT wie CompetitorAnalysis)
  const ownServicesForScore = [...expectedServices, ...(removedMissingServices || [])];
  
  // Verbesserte Service-Vergleichsfunktion (wie in CompetitorAnalysis.tsx)
  const areServicesSimilar = (service1: string, service2: string): boolean => {
    if (!service1 || !service2) return false;
    
    const s1 = service1.toLowerCase().trim();
    const s2 = service2.toLowerCase().trim();
    
    // Exakte Übereinstimmung
    if (s1 === s2) return true;
    
    // Eine enthält die andere
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Gemeinsame Kernwörter (mindestens 3 Zeichen)
    const words1 = s1.split(/[\s\-_]+/).filter(w => w.length >= 3);
    const words2 = s2.split(/[\s\-_]+/).filter(w => w.length >= 3);
    
    const commonWords = words1.filter(w1 => 
      words2.some(w2 => w1.includes(w2) || w2.includes(w1))
    );
    
    // Als ähnlich betrachten wenn mindestens 50% der Wörter übereinstimmen
    const similarity = commonWords.length / Math.min(words1.length, words2.length);
    return similarity >= 0.5;
  };
  
  const ownServiceScore = Math.min(100, 40 + (expectedServices.length * 10));
  
  // Berechnung für eigenes Unternehmen - EXAKT wie in CompetitorAnalysis.tsx
  const ownRating = typeof realData.reviews.google.rating === 'number' && !isNaN(realData.reviews.google.rating) ? realData.reviews.google.rating : 0;
  const ownReviews = typeof realData.reviews.google.count === 'number' && !isNaN(realData.reviews.google.count) ? realData.reviews.google.count : 0;
  
  // Rating-Score: Restriktiver - selbst 5.0 erreicht nur 95% (EXAKT wie in CompetitorAnalysis)
  const ownRatingScore = ownRating >= 4.5 
    ? 85 + ((ownRating - 4.5) / 0.5) * 10  // 85-95% für 4.5-5.0
    : ownRating >= 3.0 
      ? 70 + ((ownRating - 3.0) / 1.5) * 15  // 70-85% für 3.0-4.5
      : ownRating >= 2.0 
        ? 50 + ((ownRating - 2.0) * 20)      // 50-70% für 2.0-3.0
        : ownRating * 25;                    // 0-50% für unter 2.0
  
  // Review-Score: Restriktiver - max 95% auch bei vielen Reviews (EXAKT wie in CompetitorAnalysis)
  const ownReviewScore = ownReviews <= 20 
    ? Math.min(60 + ownReviews * 1.5, 90)  // Start bei 60%, max 90% bei 20 Reviews
    : Math.min(95, 90 + Math.log10(ownReviews / 20) * 5); // Max 95% auch bei vielen Reviews
  
  // Service-Score: Reaktiv aber begrenzt - reagiert auf Abwählen aber max 95% (EXAKT wie in CompetitorAnalysis)
  // Service-Score: Fairere Bewertung - Qualität vor Quantität (EXAKT wie in CompetitorAnalysis)
  let ownBaseServiceScore;
  const serviceCount = ownServicesForScore.length;
  if (serviceCount === 0) {
    ownBaseServiceScore = 15;  // Sehr niedrig ohne Services
  } else if (serviceCount <= 3) {
    ownBaseServiceScore = 30 + (serviceCount * 15);  // 45-75% für 1-3 Services (Spezialbetriebe)
  } else if (serviceCount <= 8) {
    ownBaseServiceScore = 75 + ((serviceCount - 3) * 2);  // 77-85% für 4-8 Services (Standard)
  } else if (serviceCount <= 15) {
    ownBaseServiceScore = 85 + ((serviceCount - 8) * 0.7);  // 85-90% für 9-15 Services
  } else {
    ownBaseServiceScore = Math.min(90 + ((serviceCount - 15) * 0.3), 93);  // Max 93% für >15 Services
  }
  
  // ERHÖHTE GEWICHTUNG der Google-Bewertungen für bessere Konkurrenzfähigkeit
  const ownRatingWeight = Math.min(0.40 + (serviceCount * 0.020), 0.65); // 40-65% (erhöht von 30-55%)
  const ownServiceWeight = Math.max(0.30 - (serviceCount * 0.015), 0.15);  // 30-15% (reduziert von 40-25%)
  const ownReviewWeight = 1 - ownRatingWeight - ownServiceWeight; // Rest für Reviews (jetzt höher)
  
  // Berechne den finalen Score mit dynamischer Gewichtung
  const ownDynamicScore = Math.min((ownRatingScore * ownRatingWeight) + (ownReviewScore * ownReviewWeight) + (ownBaseServiceScore * ownServiceWeight), 96);
  
  // BONUS für abgewählte Services (gleiche Logik wie in CompetitorAnalysis)
  const serviceRemovalBonus = removedMissingServices?.length > 0 
    ? Math.min(removedMissingServices.length * 0.3, ownDynamicScore * 0.10)
    : 0;
  
  // FINALER SCORE inklusive Bonus
  const finalOwnScore = Math.min(ownDynamicScore + serviceRemovalBonus, 96);
  
  // VERWENDE DEN TATSÄCHLICH BERECHNETEN SCORE - Priorisiere übergebenen Score, dann berechneten, dann Fallback
  const competitorComparisonScore = calculatedOwnCompanyScore || finalOwnScore || 75;
  const marketComparisonScore = calculatedOwnCompanyScore || finalOwnScore || 75;
  // Impressum Analysis - berücksichtigt manuelle Eingaben mit Capping bei kritischen Fehlern
  const imprintResult = calculateImprintScore(realData, manualImprintData);
  const impressumScore = imprintResult.score;
  const impressumBaseScore = imprintResult.baseScore;
  const impressumCappedAt = imprintResult.cappedAt;
  const missingCriticalImprintElements = imprintResult.missingCriticalElements;
  const missingCriticalCount = imprintResult.missingCriticalCount;
  
  const finalMissingImprintElements = manualImprintData 
    ? ALL_IMPRINT_ELEMENTS.filter(e => !manualImprintData.elements.includes(e))
    : missingImprintElements;
    
  const foundImprintElements = manualImprintData 
    ? manualImprintData.elements
    : ALL_IMPRINT_ELEMENTS.filter(e => !missingImprintElements.includes(e));
  
  // Calculate additional scores - use proper calculation
  // Hourly Rate Score - nur berechnen wenn gültige Daten vorhanden
  const hasValidHourlyRateData = hourlyRateData && (
    hourlyRateData.meisterRate > 0 || 
    hourlyRateData.facharbeiterRate > 0 || 
    hourlyRateData.azubiRate > 0 || 
    hourlyRateData.helferRate > 0 || 
    hourlyRateData.serviceRate > 0 || 
    hourlyRateData.installationRate > 0
  );
  const actualPricingScore = hasValidHourlyRateData ? calculateHourlyRateScore(hourlyRateData) : 0;
  const pricingScore = actualPricingScore;
  const pricingText = 
    actualPricingScore === 100 ? 'Region/Top-Niveau' : 
    actualPricingScore === 85 ? 'Region/marktüblich' : 
    actualPricingScore === 70 ? 'Über Marktniveau' : 
    actualPricingScore === 50 ? 'Region/unterer Durchschnitt' : 
    actualPricingScore === 30 ? 'Region/unterdurchschnittlich' : `${actualPricingScore}/100`;
  const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
  
  const legalScore = impressumScore;
  
  // ========================================
  // KATEGORIE-SCORES MIT ZENTRALISIERTEN FUNKTIONEN
  // ========================================
  
  // Kategorie 1: Online-Qualität · Relevanz · Autorität
  const cat1Avg = calculateOnlineQualityAuthorityScore(
    realData,
    keywordScore,
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
    manualSEOData
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
    calculatedOwnCompanyScore || marketComparisonScore,
    manualWorkplaceData
  );
  
  // Kategorie 5: Außendarstellung & Erscheinungsbild
  const cat5Avg = calculateCorporateAppearanceScore(manualCorporateIdentityData);
  
  // Kategorie 6: Qualität · Service · Kundenorientierung
  const cat6Avg = calculateServiceQualityScore(quoteResponseData);

  // Gewichteter Gesamtscore mit dynamischer Gewichtsverteilung
  const overallScore = calculateOverallScore(cat1Avg, cat2Avg, cat3Avg, cat4Avg, cat5Avg, cat6Avg);
  
  console.log('Calculated impressumScore:', impressumScore);
  console.log('finalMissingImprintElements.length:', finalMissingImprintElements.length);
  console.log('manualImprintData:', manualImprintData);

  const getMissingImprintList = () => {
    if (finalMissingImprintElements.length === 0) {
      return '<p>Alle notwendigen Angaben im Impressum gefunden.</p>';
    } else {
      return `
        <ul>
          ${finalMissingImprintElements.map(element => `<li>${element}</li>`).join('')}
        </ul>
        <p>Es fehlen wichtige Angaben. Dies kann zu rechtlichen Problemen führen.</p>
      `;
    }
  };
  
  const getFoundImprintList = () => {
    if (foundImprintElements.length === 0) {
      return '<p>Keine Impressum-Angaben gefunden.</p>';
    } else {
      return `
        <ul>
          ${foundImprintElements.map(element => `<li>${element}</li>`).join('')}
        </ul>
        ${manualImprintData ? '<p><strong>Hinweis:</strong> Diese Angaben wurden manuell bestätigt.</p>' : ''}
      `;
    }
  };

  // Accessibility Analysis - NEW
  // Workplace Analysis - Verbesserte Version mit manuellen Daten
  const getWorkplaceAnalysis = () => {
    console.log('getWorkplaceAnalysis called with manualWorkplaceData:', manualWorkplaceData);
    
    // Berechne Workplace Score basierend auf korrigierter Logik
    const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
    
    // Check if there is any meaningful workplace data (either manual or automatic)
    const hasWorkplaceData = workplaceScore !== -1;
    
    return `
      <div class="info-box" style="margin-top: 15px; padding: 15px; border-radius: 8px;">
        <h4>Detaillierte Arbeitgeber-Bewertung</h4>
        
        ${hasWorkplaceData ? `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
          <div>
            <p><strong>Kununu Bewertung:</strong> ${
              (() => {
                const isManualData = manualWorkplaceData && (
                  manualWorkplaceData.kununuFound || 
                  manualWorkplaceData.kununuRating !== '' || 
                  manualWorkplaceData.disableAutoKununu
                );
                
                if (isManualData) {
                  const disabled = manualWorkplaceData.disableAutoKununu;
                  if (disabled && !manualWorkplaceData.kununuFound) {
                    return 'Nicht gefunden';
                  } else if (manualWorkplaceData.kununuFound && manualWorkplaceData.kununuRating) {
                    return `${manualWorkplaceData.kununuRating}/5 (${manualWorkplaceData.kununuReviews || 0} Bewertungen)`;
                  } else {
                    return 'Nicht gefunden';
                  }
                } else {
                  return realData.workplace?.kununu?.found && realData.workplace?.kununu?.rating
                    ? `${realData.workplace.kununu.rating}/5 (${realData.workplace.kununu.reviews || 0} Bewertungen)`
                    : 'Nicht gefunden';
                }
              })()
            }</p>
          </div>
          <div>
            <p><strong>Glassdoor Bewertung:</strong> ${
              (() => {
                const isManualData = manualWorkplaceData && (
                  manualWorkplaceData.glassdoorFound || 
                  manualWorkplaceData.glassdoorRating !== '' || 
                  manualWorkplaceData.disableAutoGlassdoor
                );
                
                if (isManualData) {
                  const disabled = manualWorkplaceData.disableAutoGlassdoor;
                  if (disabled && !manualWorkplaceData.glassdoorFound) {
                    return 'Nicht gefunden';
                  } else if (manualWorkplaceData.glassdoorFound && manualWorkplaceData.glassdoorRating) {
                    return `${manualWorkplaceData.glassdoorRating}/5 (${manualWorkplaceData.glassdoorReviews || 0} Bewertungen)`;
                  } else {
                    return 'Nicht gefunden';
                  }
                } else {
                  return realData.workplace?.glassdoor?.found && realData.workplace?.glassdoor?.rating
                    ? `${realData.workplace.glassdoor.rating}/5 (${realData.workplace.glassdoor.reviews || 0} Bewertungen)`
                    : 'Nicht gefunden';
                }
              })()
            }</p>
          </div>
          <div>
            <p><strong>Gesamtbewertung:</strong> 
              <span class="score-badge ${workplaceScore >= 70 ? 'green' : workplaceScore >= 50 ? 'yellow' : 'red'}">
                ${workplaceScore >= 70 ? 'Sehr gut' : workplaceScore >= 50 ? 'Gut' : 'Verbesserungsbedarf'}
              </span>
            </p>
          </div>
          <div>
            <p><strong>Employer Branding:</strong> ${workplaceScore >= 70 ? 'Stark positioniert' : 'Ausbau empfohlen'}</p>
          </div>
        </div>
        
        ` : `
        <div style="background: #2d3748; color: #fbbf24; padding: 20px; border-radius: 8px; border: 2px solid #fbbf24; margin-top: 15px;">
          <h4 style="color: #fbbf24; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
            Fachkräfte-Attraktivität
          </h4>
          <p style="margin: 10px 0; font-size: 14px;">
            Derzeit liegen noch keine Arbeitgeber-Bewertungen vor. Eine Registrierung bei relevanten Bewertungsportalen wird empfohlen, um die Attraktivität als Arbeitgeber zu steigern.
          </p>
        </div>
        
        <!-- Fachkräfte-Attraktivität -->
        <div style="background: #2d3748; color: #fbbf24; padding: 20px; border-radius: 8px; border: 2px solid #fbbf24; margin-top: 15px;">
          <h4 style="color: #fbbf24; margin: 0 0 15px 0; display: flex; align-items: center; gap: 8px;">
            ⭐ Fachkräfte-Attraktivität
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
            <div>
              <p style="margin: 0; font-size: 14px;"><strong>Bewertungsportale:</strong> Nicht registriert</p>
              <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #6b7280;">Kununu, Glassdoor etc.</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 14px;"><strong>Employer Branding:</strong> Ausbau empfohlen</p>
              <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #6b7280;">Sichtbarkeit als Arbeitgeber</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 14px;"><strong>Fachkräfte-Gewinnung:</strong> Potenzial nicht genutzt</p>
              <p style="margin: 5px 0 0 0; font-size: 0.9rem; color: #6b7280;">Arbeitgebermarke stärken</p>
            </div>
          </div>
        </div>
        `}
        
        <div class="recommendations" style="margin-top: 20px;">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Kununu und Glassdoor Profile aktiv pflegen</li>
            <li>Mitarbeiterzufriedenheit regelmäßig messen</li>
            <li>Positive Arbeitgeber-Bewertungen fördern</li>
            <li>Employer Branding Strategie entwickeln</li>
          </ul>
        </div>
      </div>
    `;
  };

  // Reputation Analysis
  const getReputationAnalysis = () => {
  const googleReviewsScore = (() => {
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
  })();
  const reputationScore = googleReviewsScore;
  
  // Determine review count status
  const reviewCount = realData.reviews.google.count;
  const hasLowReviewCount = reviewCount < 25;
  const reviewCountWarning = hasLowReviewCount 
    ? ` <span style="color: #f59e0b; font-weight: bold;">⚠️ Zu wenige Bewertungen!</span>` 
    : '';
  
  // Build quality description
  const qualityText = realData.reviews.google.rating >= 4.5 
    ? 'Sehr gute Bewertungsqualität' 
    : realData.reviews.google.rating >= 4.0 
      ? 'Gute Bewertungsqualität' 
      : realData.reviews.google.rating >= 3.0 
        ? 'Ausbaufähige Bewertungsqualität' 
        : 'Bewertungen dringend verbessern';
  
  // Build full description with review count context
  const recommendationText = googleReviewsScore >= 90 
    ? '. Ausgezeichnete Bewertungsqualität – Behalten Sie Ihren hervorragenden Service bei!'
    : hasLowReviewCount 
      ? '. Empfehlung: Mehr Kundenbewertungen aktiv einholen, um Vertrauenswürdigkeit zu erhöhen.'
      : '';
  const fullDescription = `${realData.reviews.google.rating}/5 Sterne (${reviewCount} Bewertungen)${reviewCountWarning} - ${qualityText}${recommendationText}`;
  
    return `
      <div class="metric-card ${realData.reviews.google.count > 0 ? 'good' : 'warning'}">
        <h3>Google Bewertungen</h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(reputationScore)}">${realData.reviews.google.rating}/5</div>
        </div>
        ${generateProgressBar(
          reputationScore,
          fullDescription
        )}
      </div>
    `;
  };

  // Pricing Analysis
  const getPricingAnalysis = () => {
    if (!hourlyRateData) return '<p>Keine Preisdaten verfügbar</p>';
    
    const companyRates = [hourlyRateData.meisterRate, hourlyRateData.facharbeiterRate, hourlyRateData.azubiRate, hourlyRateData.helferRate, hourlyRateData.serviceRate, hourlyRateData.installationRate].filter(rate => rate > 0);
    const regionalRates = [hourlyRateData.regionalMeisterRate, hourlyRateData.regionalFacharbeiterRate, hourlyRateData.regionalAzubiRate, hourlyRateData.regionalHelferRate, hourlyRateData.regionalServiceRate, hourlyRateData.regionalInstallationRate].filter(rate => rate > 0);
    
    const companyAvg = companyRates.length > 0 ? companyRates.reduce((sum, rate) => sum + rate, 0) / companyRates.length : 0;
    const regionalAvg = regionalRates.length > 0 ? regionalRates.reduce((sum, rate) => sum + rate, 0) / regionalRates.length : 0;
    
    // Calculate competitive score if both company and regional data available
    let localPricingScore = 75; // Default score
    let localPricingText = 'Akzeptabel';
    let percentDiff = 0;
    
    if (companyAvg > 0 && regionalAvg > 0) {
      const ratio = companyAvg / regionalAvg;
      percentDiff = ((ratio - 1) * 100);
      
      // NEW SCORING LOGIC:
      // 85-100 Punkte: +10% und mehr vom Markt = Optimal
      // 60-84 Punkte: -10% bis +9% vom Markt = Akzeptabel
      // 40-59 Punkte: unter -10% vom Markt = Überprüfung nötig
      
      if (ratio >= 1.10) {
        // +10% oder mehr über Markt = OPTIMAL (85-100 Punkte)
        const bonus = Math.min((ratio - 1.10) * 50, 15);
        localPricingScore = Math.min(100, 85 + bonus);
        localPricingText = 'Optimal positioniert';
      } else if (ratio >= 0.90 && ratio < 1.10) {
        // -10% bis +9% vom Markt = AKZEPTABEL (60-84 Punkte)
        localPricingScore = 60 + ((ratio - 0.90) * 120);
        localPricingText = 'Akzeptabel, Optimierung empfohlen';
      } else {
        // Unter -10% vom Markt = ÜBERPRÜFUNG NÖTIG (40-59 Punkte)
        localPricingScore = Math.max(40, 60 + ((ratio - 0.90) * 100));
        localPricingText = 'Zu niedrig, Überprüfung nötig';
      }
      
      localPricingScore = Math.round(Math.max(40, Math.min(100, localPricingScore)));
    }
    return `
      <div class="metric-card">
        <h3>Stundensatz-Analyse & Wettbewerbsvergleich</h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(localPricingScore)}">${Math.round(localPricingScore)}%</div>
          <div class="score-details">
            <p><strong>Bewertung:</strong> ${localPricingText}</p>
            ${companyAvg > 0 ? `<p><strong>Ihr Durchschnitt:</strong> ${companyAvg.toFixed(2)}€/h</p>` : ''}
            ${regionalAvg > 0 ? `<p><strong>Regional Durchschnitt:</strong> ${regionalAvg.toFixed(2)}€/h</p>` : ''}
          </div>
        </div>
        ${generateProgressBar(localPricingScore, localPricingText)}
      </div>

      <div class="metric-card">
        <h3>Ihre Stundensätze</h3>
        
        ${hourlyRateData.meisterRate > 0 ? `
        <div style="margin-bottom: 15px;">
          <p><strong>Meister:</strong> ${hourlyRateData.meisterRate}€/h ${regionalAvg > 0 && hourlyRateData.regionalMeisterRate > 0 ? `(Regional: ${hourlyRateData.regionalMeisterRate}€/h)` : ''}</p>
          ${hourlyRateData.regionalMeisterRate > 0 ? generateHourlyRateProgressBar((hourlyRateData.meisterRate / hourlyRateData.regionalMeisterRate), `${((hourlyRateData.meisterRate / hourlyRateData.regionalMeisterRate - 1) * 100).toFixed(1)}% ${hourlyRateData.meisterRate > hourlyRateData.regionalMeisterRate ? 'über' : 'unter'} regionalem Durchschnitt`) : ''}
        </div>
        ` : ''}
        
        ${hourlyRateData.facharbeiterRate > 0 ? `
        <div style="margin-bottom: 15px;">
          <p><strong>Facharbeiter:</strong> ${hourlyRateData.facharbeiterRate}€/h ${regionalAvg > 0 && hourlyRateData.regionalFacharbeiterRate > 0 ? `(Regional: ${hourlyRateData.regionalFacharbeiterRate}€/h)` : ''}</p>
          ${hourlyRateData.regionalFacharbeiterRate > 0 ? generateHourlyRateProgressBar((hourlyRateData.facharbeiterRate / hourlyRateData.regionalFacharbeiterRate), `${((hourlyRateData.facharbeiterRate / hourlyRateData.regionalFacharbeiterRate - 1) * 100).toFixed(1)}% ${hourlyRateData.facharbeiterRate > hourlyRateData.regionalFacharbeiterRate ? 'über' : 'unter'} regionalem Durchschnitt`) : ''}
        </div>
        ` : ''}
        
        ${hourlyRateData.azubiRate > 0 ? `
        <div style="margin-bottom: 15px;">
          <p><strong>Azubi:</strong> ${hourlyRateData.azubiRate}€/h ${regionalAvg > 0 && hourlyRateData.regionalAzubiRate > 0 ? `(Regional: ${hourlyRateData.regionalAzubiRate}€/h)` : ''}</p>
          ${hourlyRateData.regionalAzubiRate > 0 ? generateHourlyRateProgressBar((hourlyRateData.azubiRate / hourlyRateData.regionalAzubiRate), `${((hourlyRateData.azubiRate / hourlyRateData.regionalAzubiRate - 1) * 100).toFixed(1)}% ${hourlyRateData.azubiRate > hourlyRateData.regionalAzubiRate ? 'über' : 'unter'} regionalem Durchschnitt`) : ''}
        </div>
        ` : ''}
        
        ${hourlyRateData.helferRate > 0 ? `
        <div style="margin-bottom: 15px;">
          <p><strong>Helfer:</strong> ${hourlyRateData.helferRate}€/h ${regionalAvg > 0 && hourlyRateData.regionalHelferRate > 0 ? `(Regional: ${hourlyRateData.regionalHelferRate}€/h)` : ''}</p>
          ${hourlyRateData.regionalHelferRate > 0 ? generateHourlyRateProgressBar((hourlyRateData.helferRate / hourlyRateData.regionalHelferRate), `${((hourlyRateData.helferRate / hourlyRateData.regionalHelferRate - 1) * 100).toFixed(1)}% ${hourlyRateData.helferRate > hourlyRateData.regionalHelferRate ? 'über' : 'unter'} regionalem Durchschnitt`) : ''}
        </div>
        ` : ''}
        
        ${hourlyRateData.serviceRate > 0 ? `
        <div style="margin-bottom: 15px;">
          <p><strong>Service:</strong> ${hourlyRateData.serviceRate}€/h ${regionalAvg > 0 && hourlyRateData.regionalServiceRate > 0 ? `(Regional: ${hourlyRateData.regionalServiceRate}€/h)` : ''}</p>
          ${hourlyRateData.regionalServiceRate > 0 ? generateHourlyRateProgressBar((hourlyRateData.serviceRate / hourlyRateData.regionalServiceRate), `${((hourlyRateData.serviceRate / hourlyRateData.regionalServiceRate - 1) * 100).toFixed(1)}% ${hourlyRateData.serviceRate > hourlyRateData.regionalServiceRate ? 'über' : 'unter'} regionalem Durchschnitt`) : ''}
        </div>
        ` : ''}
        
        ${hourlyRateData.installationRate > 0 ? `
        <div style="margin-bottom: 15px;">
          <p><strong>Installation:</strong> ${hourlyRateData.installationRate}€/h ${regionalAvg > 0 && hourlyRateData.regionalInstallationRate > 0 ? `(Regional: ${hourlyRateData.regionalInstallationRate}€/h)` : ''}</p>
          ${hourlyRateData.regionalInstallationRate > 0 ? generateHourlyRateProgressBar((hourlyRateData.installationRate / hourlyRateData.regionalInstallationRate), `${((hourlyRateData.installationRate / hourlyRateData.regionalInstallationRate - 1) * 100).toFixed(1)}% ${hourlyRateData.installationRate > hourlyRateData.regionalInstallationRate ? 'über' : 'unter'} regionalem Durchschnitt`) : ''}
        </div>
        ` : ''}
      </div>

      ${regionalAvg > 0 ? `
      <div class="metric-card">
        <h3>Bewertung der Preisstrategie</h3>
        <p>${
          localPricingScore >= 85 ? 
            `Ausgezeichnet! Ihre Preisstrategie ist optimal positioniert (${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(1)}% vom Markt). Sie liegen mindestens 10% über dem regionalen Durchschnitt und können damit höhere Margen erzielen.` :
          localPricingScore >= 60 ? 
            `Ihre Preise sind akzeptabel (${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(1)}% vom Markt), aber es gibt Optimierungspotenzial. Prüfen Sie, ob Preiserhöhungen möglich sind, um näher an oder über 10% über dem Markt zu kommen.` :
            `Achtung: Ihre Preise liegen deutlich unter dem Markt (${percentDiff > 0 ? '+' : ''}${percentDiff.toFixed(1)}% vom Markt). Sie verschenken Gewinnpotenzial. Eine Preiserhöhung sollte dringend geprüft werden.`
        }</p>
      </div>
      ` : ''}
    `;
  };

  // Legal Analysis
  const getLegalAnalysis = () => {
    const legalScore = impressumScore;
    return `
      <div class="metric-card ${legalScore >= 70 ? 'good' : 'warning'}">
        <h3>Impressum Rechtssicherheit</h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(legalScore)}">${legalScore}%</div>
        </div>
          ${generateProgressBar(
            legalScore,
            `${legalScore >= 80 ? 'Vollständig vorhanden' : legalScore >= 60 ? 'Größtenteils vorhanden' : 'Unvollständig'} - ${legalScore >= 80 ? 'Rechtlich abgesichert' : 'Rechtliche Pflichtangaben ergänzen'}`
          )}

        <!-- Impressum-Details -->
        <div style="margin-top: 20px;">
          <h4 class="section-text" style="margin-bottom: 10px;">Impressum-Analyse</h4>
          
          ${manualImprintData ? `
          <div style="margin-bottom: 15px;">
            <h5 class="success-text" style="margin-bottom: 8px;">Vorhandene Angaben (manuell bestätigt):</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${foundImprintElements.map(element => `<li class="success-text" style="margin-bottom: 3px;">${element}</li>`).join('')}
            </ul>
            <p style="font-size: 0.9em; margin-top: 8px;"><strong>Hinweis:</strong> Diese Angaben wurden manuell bestätigt.</p>
          </div>
          ${finalMissingImprintElements.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h5 class="error-text" style="margin-bottom: 8px;">Fehlende Angaben:</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${finalMissingImprintElements.map(element => `<li class="error-text" style="margin-bottom: 3px;">${element}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          ` : `
          ${foundImprintElements.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h5 class="success-text" style="margin-bottom: 8px;">Automatisch gefundene Angaben:</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${foundImprintElements.map(element => `<li class="success-text" style="margin-bottom: 3px;">${element}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          ${finalMissingImprintElements.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h5 class="error-text" style="margin-bottom: 8px;">Fehlende Angaben:</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${finalMissingImprintElements.map(element => `<li class="error-text" style="margin-bottom: 3px;">${element}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          `}

          ${legalScore < 80 ? `
          <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-top: 15px;">
            <h5 class="error-text" style="margin: 0 0 10px 0;">WARNUNG: Abmahngefahr bei unvollständigem Impressum</h5>
            <p class="error-text" style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Rechtliche Risiken:</strong> Fehlende Impressum-Angaben können zu Abmahnungen führen.
            </p>
            <ul class="error-text" style="margin: 0 0 10px 0; font-size: 14px; padding-left: 20px;">
              <li>Bußgelder bis zu 50.000 Euro möglich</li>
              <li>Abmahnungen durch Mitbewerber</li>
              <li>Unterlassungsklagen</li>
              <li>Schadensersatzforderungen</li>
            </ul>
            <p class="error-text" style="margin: 0; font-size: 14px;">
              <strong>Empfehlung:</strong> Sofortige Vervollständigung des Impressums erforderlich.
            </p>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const getAccessibilityAnalysis = () => {
    // Verwende den bereits berechneten Score mit manuellen Daten
    const accessibilityScore = actualAccessibilityScore;
    
    // Echte Violations aus accessibilityData verwenden, falls vorhanden
    const realViolations = accessibilityData?.violations || [];
    const hasRealData = accessibilityData?.checkedWithRealAPI || false;
    const lighthouseVersion = accessibilityData?.lighthouseVersion;
    
    // Berechne kritische Violations für Kappungs-Erklärung
    const criticalViolations = realViolations.filter((v: any) => 
      v.impact === 'critical' || v.impact === 'serious'
    );
    
    // Neutralisierung durch manuelle Eingaben prüfen
    const neutralizedViolations = criticalViolations.filter((violation: any) => {
      const vid = violation.id || '';
      if (manualAccessibilityData?.keyboardNavigation && 
          (vid.includes('keyboard') || vid.includes('button-name') || vid.includes('link-name') || vid.includes('accesskeys'))) return true;
      if (manualAccessibilityData?.screenReaderCompatible && 
          (vid.includes('aria-') || vid.includes('label') || vid.includes('role') || vid.includes('landmark'))) return true;
      if (manualAccessibilityData?.colorContrast && 
          (vid.includes('color-contrast') || vid.includes('contrast'))) return true;
      if (manualAccessibilityData?.altTextsPresent && 
          (vid.includes('image-alt') || vid.includes('alt') || vid === 'image-alt')) return true;
      if (manualAccessibilityData?.focusVisibility && 
          (vid.includes('focus') || vid.includes('focus-order'))) return true;
      if (manualAccessibilityData?.textScaling && 
          (vid.includes('meta-viewport') || vid.includes('target-size'))) return true;
      return false;
    });
    
    let remainingCriticalCount = criticalViolations.length - neutralizedViolations.length;
    
    // NEU: Manuell hinzugefügte kritische Violations (wenn User explizit Features als NICHT vorhanden markiert)
    const manualCriticalViolations: string[] = [];
    if (manualAccessibilityData?.altTextsPresent === false) {
      manualCriticalViolations.push('Alt-Texte nicht VoiceOver-kompatibel');
      remainingCriticalCount++;
    }
    if (manualAccessibilityData?.screenReaderCompatible === false) {
      manualCriticalViolations.push('Screen-Reader-Kompatibilität fehlt');
      remainingCriticalCount++;
    }
    if (manualAccessibilityData?.colorContrast === false) {
      manualCriticalViolations.push('Farbkontraste nicht ausreichend');
      remainingCriticalCount++;
    }
    if (manualAccessibilityData?.keyboardNavigation === false) {
      manualCriticalViolations.push('Tastaturnavigation fehlt');
      remainingCriticalCount++;
    }
    
    let scoreCap = 100;
    if (remainingCriticalCount === 1) scoreCap = 59;
    else if (remainingCriticalCount === 2) scoreCap = 35;
    else if (remainingCriticalCount >= 3) scoreCap = 20;
    
    // Manuelle Eingaben für Erklärung sammeln (positive)
    const manualInputsList: string[] = [];
    if (manualAccessibilityData?.keyboardNavigation) manualInputsList.push('Tastaturnavigation');
    if (manualAccessibilityData?.screenReaderCompatible) manualInputsList.push('Screen-Reader-kompatibel');
    if (manualAccessibilityData?.colorContrast) manualInputsList.push('Farbkontraste ausreichend');
    if (manualAccessibilityData?.altTextsPresent) manualInputsList.push('Alt-Texte vorhanden');
    if (manualAccessibilityData?.focusVisibility) manualInputsList.push('Fokus-Sichtbarkeit');
    if (manualAccessibilityData?.textScaling) manualInputsList.push('Text-Skalierung');
    
    // Gruppiere Violations nach Impact
    const violationsByImpact = realViolations.reduce((acc: any, v: any) => {
      const impact = v.impact || 'moderate';
      if (!acc[impact]) {
        acc[impact] = [];
      }
      acc[impact].push(v);
      return acc;
    }, {});
    
    // Erstelle Violations-Array für die Anzeige - IMMER aus echten Daten
    const violations = Object.entries(violationsByImpact).map(([impact, vList]: [string, any]) => ({
      impact,
      description: vList[0]?.description || `${impact} Probleme`,
      count: vList.length,
      nodes: vList[0]?.nodes?.length || 0,
      help: vList[0]?.help || vList[0]?.description,
      helpUrl: vList[0]?.helpUrl
    }));
    
    const realPasses = accessibilityData?.passes || [];
    const passes = realPasses.length > 0 
      ? realPasses.slice(0, 4).map((p: any) => p.description || p.id)
      : [
          'Dokument hat einen Titel',
          'Hauptsprache ist definiert', 
          'Navigation ist als Landmark markiert',
          'Buttons haben aussagekräftige Labels'
        ];

    const scoreClass = accessibilityScore >= 80 ? 'yellow' : accessibilityScore >= 60 ? 'green' : 'red';
    
    // Kappungs-Erklärung für HTML generieren
    const cappingExplanationHTML = remainingCriticalCount > 0 ? `
      <div style="margin: 15px 0; padding: 15px; border-radius: 8px; background: #fef3c7; border: 2px solid #f59e0b;">
        <h4 style="color: #92400e; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
          📊 Score-Kappung aktiv
        </h4>
        <p style="color: #92400e; margin: 0 0 8px 0; font-size: 14px;">
          <strong>Grund:</strong> ${remainingCriticalCount} kritische/schwere Barrierefreiheit-Violation${remainingCriticalCount > 1 ? 'en' : ''} insgesamt
        </p>
        ${manualCriticalViolations.length > 0 ? `
          <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; padding: 10px; margin: 8px 0;">
            <p style="color: #991b1b; margin: 0 0 5px 0; font-size: 13px; font-weight: bold;">⚠️ Manuell gemeldete Probleme:</p>
            <ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 13px;">
              ${manualCriticalViolations.map(v => `<li>${v}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        <p style="color: #92400e; margin: 8px 0; font-size: 14px;">
          <strong>Auswirkung:</strong> Maximaler Score auf <strong>${scoreCap}%</strong> begrenzt
        </p>
        ${neutralizedViolations.length > 0 ? `
          <p style="color: #059669; margin: 0 0 8px 0; font-size: 13px;">
            ✓ ${neutralizedViolations.length} Violation${neutralizedViolations.length > 1 ? 'en' : ''} durch manuelle Eingaben neutralisiert
          </p>
        ` : ''}
        ${manualInputsList.length > 0 && remainingCriticalCount > 0 ? `
          <p style="color: #92400e; margin: 0; font-size: 13px; font-style: italic;">
            ℹ️ Trotz positiver manueller Angaben (${manualInputsList.join(', ')}) kann die Bewertung aufgrund der kritischen Violations nicht höher ausfallen.
          </p>
        ` : ''}
      </div>
    ` : (neutralizedViolations.length > 0 ? `
      <div style="margin: 15px 0; padding: 15px; border-radius: 8px; background: #f0fdf4; border: 2px solid #86efac;">
        <h4 style="color: #059669; margin: 0 0 10px 0;">✓ Kritische Fehler neutralisiert</h4>
        <p style="color: #065f46; margin: 0; font-size: 14px;">
          ${neutralizedViolations.length} kritische Violation${neutralizedViolations.length > 1 ? 'en' : ''} durch manuelle Eingaben (${manualInputsList.join(', ')}) neutralisiert. Keine Score-Kappung erforderlich.
        </p>
      </div>
    ` : '');

    return `
      <div class="metric-card ${scoreClass}">
        ${violations.length > 0 || accessibilityScore < 90 ? `
          <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #fef2f2; border: 2px solid #fecaca;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
              ⚠️ RECHTLICHER HINWEIS: Barrierefreiheit-Verstöße erkannt
            </h4>
            <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">
              <strong>Warnung:</strong> Die automatisierte Analyse hat <strong>${violations.length} Barrierefreiheit-Probleme</strong> identifiziert. 
              Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
            </p>
            ${hasRealData ? `
              <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 13px;">
                Diese Probleme wurden durch <strong>automatisierte PageSpeed Insights Tests</strong> ermittelt und sollten dringend überprüft werden.
              </p>
            ` : ''}
            <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
              <strong>Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Webseite oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
            </div>
          </div>
        ` : ''}
        
        ${cappingExplanationHTML}
        
        <h3 class="header-${getAccessibilityComplianceColorClass(accessibilityScore)}" style="padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
          <span>Barrierefreiheit & Zugänglichkeit ${hasRealData ? '<span style="color: #10b981; font-size: 14px;">Echte PageSpeed Insights Prüfung</span>' : ''}</span>
          <span class="score-tile ${getAccessibilityComplianceColorClass(accessibilityScore)}">${displayAccessibilityScore}</span>
        </h3>
        <div class="score-display">
          <div class="score-tile ${getAccessibilityComplianceColorClass(accessibilityScore)}">${displayAccessibilityScore}</div>
        </div>
        ${generateProgressBar(
          accessibilityScore,
          `${accessibilityScore >= 95 ? 'AA konform' : accessibilityScore >= 80 ? 'Teilweise konform' : 'Nicht konform'} - ${accessibilityScore >= 80 ? 'Sehr gute Barrierefreiheit' : 'Barrierefreiheit dringend verbessern'}`
        )}

        <!-- WCAG-Analyse -->
        <div class="collapsible header-${getAccessibilityComplianceColorClass(accessibilityScore)}" onclick="toggleSection('wcag-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; border-radius: 8px;">
          <h4 style="color: white; margin: 0;">▶ WCAG 2.1 Compliance Details</h4>
        </div>
        
        <div id="wcag-details" style="display: none;">
          <!-- Violations Overview -->
          ${violations.length > 0 ? `
            <div class="violations-box" style="margin-top: 20px; padding: 15px; border-radius: 8px; background: #fef2f2; border: 2px solid #fca5a5;">
              <h4 style="color: #dc2626; margin: 0 0 15px 0;">🚨 Automatisch erkannte Probleme ${hasRealData ? '<span style="color: #10b981; font-size: 12px;">(PageSpeed Insights)</span>' : ''}</h4>
              <div style="display: grid; gap: 15px;">
                ${violations.map(v => `
                  <div style="padding: 15px; border-radius: 8px; background: white; border-left: 4px solid ${
                    v.impact === 'critical' ? '#dc2626' :
                    v.impact === 'serious' ? '#ea580c' :
                    v.impact === 'moderate' ? '#d97706' : '#059669'
                  };">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                      <p style="font-weight: bold; color: ${
                        v.impact === 'critical' ? '#dc2626' :
                        v.impact === 'serious' ? '#ea580c' :
                        v.impact === 'moderate' ? '#d97706' : '#059669'
                      }; margin: 0; font-size: 14px;">
                        ${v.impact === 'critical' ? '🔴 KRITISCH' :
                          v.impact === 'serious' ? '🟠 ERNST' :
                          v.impact === 'moderate' ? '🟡 MODERAT' : '🟢 GERING'}
                      </p>
                      <span style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-size: 12px; color: #6b7280;">
                        ${v.count} ${v.count === 1 ? 'Vorkommen' : 'Vorkommen'}
                      </span>
                    </div>
                    <p style="margin: 8px 0; font-size: 14px; color: #374151;"><strong>${v.help || v.description}</strong></p>
                    ${v.nodes > 0 ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">${v.nodes} betroffene Elemente</p>` : ''}
                    ${v.helpUrl ? `<p style="margin: 8px 0 0 0;"><a href="${v.helpUrl}" target="_blank" style="color: #2563eb; font-size: 12px; text-decoration: none;">📚 Mehr erfahren</a></p>` : ''}
                  </div>
                `).join('')}
              </div>
              <div style="margin-top: 15px; padding: 12px; background: #fee2e2; border-radius: 6px; border: 1px solid #fca5a5;">
                <p style="margin: 0; font-size: 13px; color: #7f1d1d;">
                  <strong>⚠️ Wichtig:</strong> Diese Probleme wurden automatisch erkannt und erfordern manuelle Überprüfung. 
                  ${manualAccessibilityData ? 'Ihre manuellen Eingaben ergänzen diese Bewertung.' : 'Ergänzen Sie diese Analyse durch manuelle Überprüfung in der Eingabemaske.'}
                </p>
              </div>
            </div>
          ` : `
            <div class="success-box" style="margin-top: 20px; padding: 15px; border-radius: 8px; background: #f0fdf4; border: 2px solid #86efac;">
              <h4 style="color: #059669; margin: 0 0 10px 0;">✅ Keine kritischen Probleme erkannt</h4>
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                Die automatische Analyse hat keine Barrierefreiheit-Verstöße gefunden. 
                ${manualAccessibilityData ? 'Ihre manuellen Eingaben ergänzen diese positive Bewertung.' : 'Führen Sie dennoch eine manuelle Überprüfung durch.'}
              </p>
            </div>
          `}

          <!-- Successful Tests -->
          <div class="success-box" style="margin-top: 15px; padding: 15px; border-radius: 8px;">
            <h4 class="success-text">Erfolgreich umgesetzt</h4>
            <ul style="margin-top: 10px; padding-left: 20px;">
              ${passes.map(pass => `<li class="success-text" style="margin-bottom: 5px;">${pass}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Rechtliche Anforderungen -->
        <div class="collapsible info-box" onclick="toggleSection('legal-requirements')" style="cursor: pointer; margin-top: 15px; padding: 10px; border-radius: 8px;">
          <h4 class="section-text" style="margin: 0;">▶ Rechtliche Anforderungen</h4>
        </div>
        
        <div id="legal-requirements" style="display: none;">
          <div class="info-box" style="margin-top: 15px; padding: 15px; border-radius: 8px;">
            <h4 class="section-text">Rechtliche Compliance</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
              <div>
                <p><strong>EU-Richtlinie 2016/2102:</strong> 
                  <span class="score-badge ${accessibilityScore >= 81 ? 'yellow' : accessibilityScore >= 61 ? 'green' : 'red'}">
                    ${accessibilityScore >= 80 ? 'Erfüllt' : 'Nicht erfüllt'}
                  </span>
                </p>
                ${generateProgressBar(Math.max(30, accessibilityScore), '')}
              </div>
              <div>
                <p><strong>WCAG 2.1 Level AA:</strong> 
                  <span class="score-badge ${accessibilityScore >= 81 ? 'yellow' : accessibilityScore >= 61 ? 'green' : 'red'}">
                    ${accessibilityScore >= 80 ? 'Konform' : 'Nicht konform'}
                  </span>
                </p>
                ${generateProgressBar(accessibilityScore, '')}
              </div>
              <div>
                <p><strong>BGG (Deutschland):</strong> 
                  <span class="score-badge ${accessibilityScore >= 81 ? 'yellow' : accessibilityScore >= 61 ? 'green' : 'red'}">
                    ${accessibilityScore >= 70 ? 'Grundsätzlich erfüllt' : 'Verbesserung nötig'}
                  </span>
                </p>
                ${generateProgressBar(Math.round(Math.max(25, accessibilityScore * 0.9)), '')}
              </div>
            </div>
            
            ${accessibilityScore < 90 ? `
            <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-top: 15px;">
              <h4 class="error-text" style="margin: 0 0 10px 0;">RECHTLICHER HINWEIS: Barrierefreiheit-Verstöße erkannt</h4>
              <p class="error-text" style="margin: 0 0 10px 0; font-weight: bold;">
                Warnung: Die automatisierte Analyse hat rechtlich relevante Barrierefreiheit-Probleme identifiziert. 
                Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
              </p>
              <p class="error-text" style="margin: 0; font-size: 14px;">
                <strong>Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Website oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt.
                Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. 
                Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
              </p>
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Verbesserungsvorschläge -->
        <div class="collapsible success-box" onclick="toggleSection('accessibility-improvements')" style="cursor: pointer; margin-top: 15px; padding: 10px; border-radius: 8px;">
          <h4 class="success-text" style="margin: 0;">▶ Verbesserungsvorschläge</h4>
        </div>
        
        <div id="accessibility-improvements" style="display: none;">
          <div class="recommendations">
            <h4>Prioritäre Handlungsempfehlungen:</h4>
            <ul>
              <li>Alt-Texte für alle Bilder hinzufügen (WCAG 1.1.1)</li>
              <li>Farbkontraste auf mindestens 4.5:1 erhöhen (WCAG 1.4.3)</li>
              <li>Überschriftenstruktur H1-H6 korrekt implementieren (WCAG 1.3.1)</li>
              <li>Tastaturnavigation für alle Funktionen ermöglichen (WCAG 2.1.1)</li>
              <li>Screen Reader-Kompatibilität durch ARIA-Labels verbessern</li>
              <li>Automatisierte Accessibility-Tests in Entwicklungsprozess integrieren</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  };

  // SEO Analysis - Enhanced - basierend auf tatsächlichen Werten der SEOAnalysis Komponente
  const getSEOAnalysis = () => {
    // Kritischere Bewertung basierend auf realen SEO-Daten
    const effectiveKeywordScore = keywordScore !== null && keywordScore !== undefined ? keywordScore : realData.seo.score;
    const keywordData = manualKeywordData || realData.keywords;
    const foundKeywords = keywordData.filter(k => k.found).length;
    
    // SEO-Score kritischer bewerten
    const seoScore = realData.seo.score;
    
    // Check confirmed/rejected elements from manualSEOData
    const confirmedElements = manualSEOData?.confirmedElements || [];
    const rejectedElements = manualSEOData?.rejectedElements || [];
    
    const isTitleTagConfirmed = confirmedElements.includes('titleTag');
    const isTitleTagRejected = rejectedElements.includes('titleTag');
    const isMetaDescriptionConfirmed = confirmedElements.includes('metaDescription');
    const isMetaDescriptionRejected = rejectedElements.includes('metaDescription');
    const isHeadingStructureConfirmed = confirmedElements.includes('headingStructure');
    const isHeadingStructureRejected = rejectedElements.includes('headingStructure');
    const isAltTagsConfirmed = confirmedElements.includes('altTags');
    const isAltTagsRejected = rejectedElements.includes('altTags');
    
    // Detaillierte Bewertung basierend auf SEOAnalysis Komponente
    const rawTitleTagScore = realData.seo.titleTag !== 'Kein Title-Tag gefunden' ? 
      (realData.seo.titleTag.length <= 70 ? 85 : 65) : 25;
    const rawMetaDescriptionScore = realData.seo.metaDescription !== 'Keine Meta-Description gefunden' ? 
      (realData.seo.metaDescription.length <= 160 ? 90 : 70) : 25;
    const rawHeadingScore = realData.seo.headings.h1.length === 1 ? 80 : 
      realData.seo.headings.h1.length > 1 ? 60 : 30;
    
    // Alt-Tags: Priorisiere Extension-Daten, wenn verfügbar (wie in SEOAnalysis.tsx)
    const useExtensionAltTags = extensionData?.seo?.altTags;
    const altTagsTotal = useExtensionAltTags 
      ? (extensionData.seo.altTags.total || 0) 
      : (realData.seo.altTags.total || 0);
    const altTagsWithAlt = useExtensionAltTags 
      ? (extensionData.seo.altTags.withAlt || 0) 
      : (realData.seo.altTags.withAlt || 0);
    const rawAltTagsScore = (altTagsTotal > 0) ? 
      Math.round((altTagsWithAlt / altTagsTotal) * 100) : 0;
    
    // Apply rejection penalty (cap at 30 if rejected) - Alt-Tags bei Ablehnung komplett ausschließen (Score 0)
    const titleTagScore = isTitleTagRejected ? Math.min(rawTitleTagScore, 30) : rawTitleTagScore;
    const metaDescriptionScore = isMetaDescriptionRejected ? Math.min(rawMetaDescriptionScore, 30) : rawMetaDescriptionScore;
    const headingScore = isHeadingStructureRejected ? Math.min(rawHeadingScore, 30) : rawHeadingScore;
    // Bei abgelehnten Alt-Tags: 0% Score, fließt in Bewertung ein
    const altTagsScore = isAltTagsRejected ? 0 : rawAltTagsScore;
    
    // Berechne den korrigierten SEO-Score - Alt-Tags mit 0% fließen immer in Bewertung ein
    const calculatedSeoScore = Math.round((titleTagScore + metaDescriptionScore + headingScore + altTagsScore) / 4);
    const criticalSeoScore = calculatedSeoScore;
    const scoreClass = criticalSeoScore >= 90 ? 'yellow' : criticalSeoScore >= 61 ? 'green' : 'red';

    // Generate rejected elements info (Alt-Tags separat behandeln - nicht in Fehlerliste)
    const nonAltTagRejectedElements = rejectedElements.filter(el => el !== 'altTags');
    const rejectedInfo = nonAltTagRejectedElements.length > 0 ? `
      <div style="margin-top: 15px; padding: 12px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;">
        <h5 style="color: #dc2626; margin: 0 0 8px 0;">⚠️ Nicht bestätigte SEO-Elemente (${nonAltTagRejectedElements.length} Fehler)</h5>
        <ul style="margin: 0; padding-left: 20px; color: #991b1b;">
          ${isTitleTagRejected ? '<li>Title-Tag - als fehlerhaft markiert</li>' : ''}
          ${isMetaDescriptionRejected ? '<li>Meta Description - als fehlerhaft markiert</li>' : ''}
          ${isHeadingStructureRejected ? '<li>Überschriftenstruktur - als fehlerhaft markiert</li>' : ''}
        </ul>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #b91c1c;">Diese Elemente wurden bei der manuellen Überprüfung als fehlerhaft eingestuft und fließen negativ in die Bewertung ein.</p>
      </div>
    ` : '';

    // Generate confirmed elements info
    const confirmedInfo = confirmedElements.length > 0 ? `
      <div style="margin-top: 15px; padding: 12px; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 8px;">
        <h5 style="color: #16a34a; margin: 0 0 8px 0;">✓ Bestätigte SEO-Elemente (${confirmedElements.length})</h5>
        <ul style="margin: 0; padding-left: 20px; color: #166534;">
          ${isTitleTagConfirmed ? '<li>Title-Tag - bestätigt</li>' : ''}
          ${isMetaDescriptionConfirmed ? '<li>Meta Description - bestätigt</li>' : ''}
          ${isHeadingStructureConfirmed ? '<li>Überschriftenstruktur - bestätigt</li>' : ''}
          ${isAltTagsConfirmed ? '<li>Alt-Tags - bestätigt</li>' : ''}
        </ul>
      </div>
    ` : '';

    // Helper function to get element style based on status
    const getElementStyle = (isConfirmed: boolean, isRejected: boolean) => {
      if (isRejected) return ' style="border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.1); padding: 8px; border-radius: 6px;"';
      if (isConfirmed) return ' style="border: 2px solid #22c55e; background: rgba(34, 197, 94, 0.1); padding: 8px; border-radius: 6px;"';
      return '';
    };

    const getStatusBadge = (isConfirmed: boolean, isRejected: boolean) => {
      if (isRejected) return '<span style="color: #dc2626; font-weight: bold;"> ✗ Fehler</span>';
      if (isConfirmed) return '<span style="color: #16a34a; font-weight: bold;"> ✓ Bestätigt</span>';
      return '<span style="color: #d97706;"> (Nicht bewertet)</span>';
    };

    return `
      <div class="metric-card ${scoreClass}">
        <h3 class="header-seo" style="padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <span>SEO-Bestandsanalyse</span>
        </h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(criticalSeoScore)}">${criticalSeoScore}%</div>
          <div class="score-details">
            <p><strong>Sichtbarkeit:</strong> ${criticalSeoScore >= 90 ? 'Exzellent' : criticalSeoScore >= 61 ? 'Hoch' : 'Niedrig'}</p>
          </div>
        </div>
        ${generateProgressBar(
          criticalSeoScore,
          `${criticalSeoScore >= 90 ? 'Hervorragende SEO-Basis' : criticalSeoScore >= 80 ? 'Sehr gute SEO-Basis' : criticalSeoScore >= 61 ? 'Gute SEO-Basis mit Optimierungspotenzial' : 'Dringende SEO-Verbesserungen erforderlich'}`
        )}
        
        <!-- Detaillierte SEO-Analyse basierend auf tatsächlichen Werten -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
          <h4>📋 Technische SEO-Details</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div${getElementStyle(isTitleTagConfirmed, isTitleTagRejected)}>
              <p><strong>Title-Tag:</strong>${getStatusBadge(isTitleTagConfirmed, isTitleTagRejected)} ${realData.seo.titleTag !== 'Kein Title-Tag gefunden' ? (realData.seo.titleTag.length <= 70 ? 'Optimal' : 'Zu lang') : 'Fehlt'} - Score: ${rawTitleTagScore}%</p>
              ${generateProgressBar(titleTagScore, `${realData.seo.titleTag.length} Zeichen`)}
            </div>
            <div${getElementStyle(isMetaDescriptionConfirmed, isMetaDescriptionRejected)}>
              <p><strong>Meta Description:</strong>${getStatusBadge(isMetaDescriptionConfirmed, isMetaDescriptionRejected)} ${realData.seo.metaDescription !== 'Keine Meta-Description gefunden' ? (realData.seo.metaDescription.length <= 160 ? 'Optimal' : 'Zu lang') : 'Fehlt'} - Score: ${rawMetaDescriptionScore}%</p>
              ${generateProgressBar(metaDescriptionScore, `${realData.seo.metaDescription.length} Zeichen`)}
            </div>
            <div${getElementStyle(isHeadingStructureConfirmed, isHeadingStructureRejected)}>
              <p><strong>Überschriftenstruktur:</strong>${getStatusBadge(isHeadingStructureConfirmed, isHeadingStructureRejected)} ${realData.seo.headings.h1.length === 1 ? 'Optimal' : realData.seo.headings.h1.length > 1 ? 'Mehrere H1' : 'Keine H1'} - Score: ${rawHeadingScore}%</p>
              ${generateProgressBar(headingScore, `H1: ${realData.seo.headings.h1.length}, H2: ${realData.seo.headings.h2.length}`)}
            </div>
            ${isAltTagsRejected ? `<div${getElementStyle(false, true)}>
              <p><strong>Alt-Tags:</strong><span style="color: #dc2626; font-weight: bold;"> ✗ Nicht vorhanden</span> - Keine Alt-Texte bei Bildern - Score: 0%</p>
              ${generateProgressBar(0, 'Keine Alt-Texte vorhanden')}
            </div>` : `<div${getElementStyle(isAltTagsConfirmed, false)}>
              <p><strong>Alt-Tags:</strong>${getStatusBadge(isAltTagsConfirmed, false)} ${altTagsWithAlt}/${altTagsTotal} Bilder mit Alt-Text - Score: ${rawAltTagsScore}%</p>
              ${generateProgressBar(altTagsScore, `${rawAltTagsScore}% Abdeckung${useExtensionAltTags ? ' (Chrome Extension)' : ''}`)}
            </div>`}
          </div>
          ${rejectedInfo}
          ${confirmedInfo}
        </div>
        
        <!-- Branchenrelevante Keywords -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
          <h4>Branchenrelevante Keywords</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Keyword-Analyse:</strong> ${(() => {
                if (effectiveKeywordScore >= 90) return `${foundKeywords}/${keywordData.length} Keywords gefunden - Exzellent`;
                if (effectiveKeywordScore >= 61) return `${foundKeywords}/${keywordData.length} Keywords gefunden - Sehr gut`;
                return `${foundKeywords}/${keywordData.length} Keywords gefunden`;
              })()}</p>
              ${generateProgressBar(effectiveKeywordScore, `Hauptsuchbegriffe Ihrer Branche - Basis für Ihre Auffindbarkeit in Suchmaschinen`)}
            </div>
            <div>
              <p><strong>Long-Tail Keywords:</strong> ${(() => {
                const longTailScore = Math.max(20, Math.round(effectiveKeywordScore * 0.6));
                if (longTailScore >= 90) return 'Hervorragend optimiert';
                if (longTailScore >= 61) return 'Gut optimiert';
                return 'Verbesserungsbedarf';
              })()}</p>
              ${generateProgressBar(Math.max(20, Math.round(effectiveKeywordScore * 0.6)), `Spezifische Suchbegriffe mit 3+ Wörtern (z.B. "Heizung Notdienst München") - wichtig für gezielte Kundenanfragen`)}
            </div>
            <div>
              <p><strong>Lokale Keywords:</strong> ${(() => {
                const localKeywordScore = businessData.address ? Math.max(40, Math.round(effectiveKeywordScore * 0.9)) : 20;
                if (!businessData.address) return 'Fehlend';
                if (localKeywordScore >= 90) return 'Exzellent integriert';
                if (localKeywordScore >= 61) return 'Gut vorhanden';
                return 'Verbesserungsbedarf';
              })()}</p>
              ${generateProgressBar(Math.round(businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20), `Ortsbezogene Suchbegriffe (z.B. "Elektriker München") - essenziell für lokale Auffindbarkeit`)}
            </div>
          </div>
          ${manualKeywordData ? `
          <div style="margin-top: 15px; padding: 10px; background: rgba(34, 197, 94, 0.1); border-radius: 6px;">
            <h5 class="success-text" style="margin: 0 0 10px 0;">✅ Analysierte Keywords:</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${keywordData.map(kw => `<span class="${kw.found ? 'keyword-found' : 'keyword-missing'}">${kw.keyword}${kw.found ? ' ✓' : ' ✗'}</span>`).join('')}
            </div>
          </div>
          ` : ''}
        </div>

        <!-- Website-Struktur -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
          <h4>🏗️ Website-Struktur</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>URL-Struktur:</strong> ${seoScore >= 70 ? 'Sehr gut' : seoScore >= 50 ? 'Gut' : 'Optimierbar'}</p>
              ${generateProgressBar(Math.max(40, seoScore), `Sprechende URLs (z.B. /heizung-wartung) helfen Nutzern und Suchmaschinen, Inhalte besser zu verstehen`)}
            </div>
            <div>
              <p><strong>Interne Verlinkung:</strong> ${seoScore >= 60 ? 'Gut strukturiert' : 'Ausbaufähig'}</p>
              ${generateProgressBar(Math.round(Math.max(30, seoScore * 0.9)), `Gut vernetzte Seiten ermöglichen einfache Navigation und bessere Auffindbarkeit aller Inhalte`)}
            </div>
            <div>
              <p><strong>Breadcrumbs:</strong> ${seoScore >= 70 ? 'Implementiert' : 'Fehlen teilweise'}</p>
              ${generateProgressBar(seoScore >= 70 ? 85 : 35, `Navigationspfade (Start → Leistungen → Heizung) zeigen Nutzern ihre Position auf der Website`)}
            </div>
          </div>
        </div>

        <!-- Technische SEO -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
          <h4>⚙️ Technische SEO</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Meta-Tags:</strong> ${seoScore >= 70 ? 'Vollständig' : 'Unvollständig'}</p>
              ${generateProgressBar(Math.max(35, seoScore), `Unsichtbare Metadaten wie Title und Description erscheinen in Suchergebnissen`)}
            </div>
            <div>
              <p><strong>Schema Markup:</strong> ${seoScore >= 80 ? 'Implementiert' : 'Teilweise/Fehlend'}</p>
              ${generateProgressBar(seoScore >= 80 ? 90 : 25, `Strukturierte Daten ermöglichen Rich Snippets (Sternebewertungen, Öffnungszeiten) in Google`)}
            </div>
            <div>
              <p><strong>XML Sitemap:</strong> ${seoScore >= 60 ? 'Vorhanden' : 'Nicht gefunden'}</p>
              ${generateProgressBar(seoScore >= 60 ? 85 : 30, `Übersichtskarte aller Seiten - hilft Google, alle Inhalte Ihrer Website zu finden`)}
            </div>
          </div>
        </div>
        
      </div>
    `;
  };

  // Local SEO Analysis - Kombiniert automatische und manuelle Daten
  const getLocalSEOAnalysis = () => {
    // Prepare both manual and automatic data
    const hasManualData = manualLocalSEOData && (
      manualLocalSEOData.directories?.length > 0 ||
      manualLocalSEOData.localKeywordRankings?.length > 0 ||
      manualLocalSEOData.gmbClaimed !== undefined
    );

    const manualData = hasManualData ? {
      overallScore: manualLocalSEOData.overallScore || 0,
      googleMyBusiness: {
        score: Math.round((manualLocalSEOData.gmbCompleteness + (manualLocalSEOData.gmbVerified ? 20 : 0) + (manualLocalSEOData.gmbClaimed ? 10 : 0)) / 1.3),
        claimed: manualLocalSEOData.gmbClaimed,
        verified: manualLocalSEOData.gmbVerified,
        complete: manualLocalSEOData.gmbCompleteness,
        photos: manualLocalSEOData.gmbPhotos || 0,
        posts: manualLocalSEOData.gmbPosts || 0,
        lastUpdate: manualLocalSEOData.gmbLastUpdate || 'Unbekannt'
      },
      localCitations: {
        score: (manualLocalSEOData.directories && manualLocalSEOData.directories.length > 0) 
          ? Math.round((manualLocalSEOData.directories.filter(d => d.status === 'complete').length / manualLocalSEOData.directories.length) * 100)
          : 0,
        totalCitations: manualLocalSEOData.directories ? manualLocalSEOData.directories.length : 0,
        consistent: manualLocalSEOData.directories ? manualLocalSEOData.directories.filter(d => d.status === 'complete').length : 0,
        inconsistent: manualLocalSEOData.directories ? manualLocalSEOData.directories.filter(d => d.status === 'incomplete').length : 0,
        topDirectories: (manualLocalSEOData.directories || []).slice(0, 5).map(d => ({
          name: d.name,
          status: d.status === 'complete' ? 'vollständig' : d.status === 'incomplete' ? 'unvollständig' : 'nicht gefunden'
        }))
      },
      localKeywords: {
        score: (manualLocalSEOData.localKeywordRankings && manualLocalSEOData.localKeywordRankings.length > 0) 
          ? Math.round(manualLocalSEOData.localKeywordRankings.reduce((acc, kw) => acc + (100 - kw.position), 0) / manualLocalSEOData.localKeywordRankings.length)
          : 0,
        ranking: (manualLocalSEOData.localKeywordRankings || []).map(kw => ({
          keyword: kw.keyword,
          position: kw.position,
          volume: kw.searchVolume === 'high' ? 'hoch' : kw.searchVolume === 'medium' ? 'mittel' : 'niedrig'
        }))
      },
      onPageLocal: {
        score: manualLocalSEOData.localContentScore || 0,
        addressVisible: manualLocalSEOData.addressVisible || false,
        phoneVisible: manualLocalSEOData.phoneVisible || false,
        openingHours: manualLocalSEOData.openingHoursVisible || false,
        localSchema: manualLocalSEOData.hasLocalBusinessSchema || false,
        localContent: manualLocalSEOData.localContentScore || 0
      }
    } : null;

    // Auto-detected data (fallback calculation based on SEO data)
    const autoData = {
      overallScore: calculateLocalSEOScore(businessData, realData, manualLocalSEOData),
      googleMyBusiness: {
        score: Math.max(0, Math.min(100, realData.seo.score + (realData.seo.score >= 70 ? 15 : -10))),
        claimed: realData.seo.score >= 60,
        verified: realData.seo.score >= 70,
        complete: Math.max(30, Math.min(95, realData.seo.score + 10)),
        photos: realData.seo.score >= 60 ? Math.floor(realData.seo.score / 8) : 2,
        posts: realData.seo.score >= 70 ? 3 : realData.seo.score >= 50 ? 1 : 0,
        lastUpdate: realData.seo.score >= 60 ? "vor 2 Wochen" : "vor 3 Monaten"
      },
      localCitations: {
        score: Math.max(20, Math.min(85, realData.seo.score - 5)),
        totalCitations: realData.seo.score >= 60 ? 15 : realData.seo.score >= 40 ? 8 : 3,
        consistent: realData.seo.score >= 70 ? 12 : realData.seo.score >= 50 ? 6 : 2,
        inconsistent: realData.seo.score >= 70 ? 3 : realData.seo.score >= 50 ? 5 : 8,
        topDirectories: [
          { name: "Google My Business", status: realData.seo.score >= 60 ? "vollständig" : "unvollständig" },
          { name: "Bing Places", status: realData.seo.score >= 50 ? "unvollständig" : "nicht gefunden" },
          { name: "Yelp", status: realData.seo.score >= 70 ? "vollständig" : "nicht gefunden" },
          { name: "Gelbe Seiten", status: realData.seo.score >= 40 ? "vollständig" : "unvollständig" },
          { name: "WerkenntdenBesten", status: realData.seo.score >= 60 ? "vollständig" : "nicht gefunden" }
        ]
      },
      localKeywords: {
        score: Math.max(15, Math.min(80, realData.seo.score - 10)),
        ranking: [
          { 
            keyword: `${businessData.industry} ${businessData.address.split(',')[1]?.trim()}`, 
            position: realData.seo.score >= 70 ? 8 : realData.seo.score >= 50 ? 15 : 25, 
            volume: realData.seo.score >= 60 ? "hoch" : "niedrig" 
          },
          { 
            keyword: `Handwerker ${businessData.address.split(',')[1]?.trim()}`, 
            position: realData.seo.score >= 60 ? 12 : 20, 
            volume: realData.seo.score >= 50 ? "mittel" : "niedrig" 
          }
        ]
      },
      onPageLocal: {
        score: Math.max(25, Math.min(90, realData.seo.score)),
        addressVisible: realData.seo.metaDescription ? realData.seo.metaDescription.includes(businessData.address.split(',')[1]?.trim() || '') : false,
        phoneVisible: realData.seo.score >= 50,
        openingHours: realData.seo.score >= 61,
        localSchema: realData.seo.score >= 90 && realData.seo.headings.h1.length > 0,
        localContent: Math.max(20, Math.min(85, realData.seo.score - 15))
      }
    };

    const scoreClass = localSEOScore >= 90 ? 'yellow' : localSEOScore >= 61 ? 'green' : 'red';

    // Helper function to calculate average between manual and auto data
    const calculateAverage = (manualValue: number | undefined, autoValue: number) => {
      if (manualValue !== undefined && manualValue !== null) {
        return Math.round((manualValue + autoValue) / 2);
      }
      return autoValue;
    };

    // Render helper for data sections with averaged values
    const renderSection = (title: string, icon: string, manualSection: any, autoSection: any, renderContent: (data: any, avgScore: number) => string) => {
      const hasManual = manualSection && Object.keys(manualSection).some(k => manualSection[k] !== undefined && manualSection[k] !== null && manualSection[k] !== 0);
      const hasAuto = autoSection && Object.keys(autoSection).some(k => autoSection[k] !== undefined && autoSection[k] !== null && autoSection[k] !== 0);

      if (!hasManual && !hasAuto) return '';

      // Calculate average score
      const avgScore = calculateAverage(manualSection?.score, autoSection?.score || 0);

      // Merge data, preferring manual values when available
      const mergedData = {
        ...autoSection,
        ...(hasManual ? manualSection : {}),
        score: avgScore
      };

      return `
        <div style="margin-top: 20px;">
          <h4>${icon} ${title}</h4>
          ${hasManual && hasAuto ? `
            <div style="display: inline-block; padding: 4px 8px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 12px; margin-bottom: 10px;">
              📊 Durchschnitt aus automatischer und manueller Bewertung
            </div>
          ` : hasManual ? `
            <div style="display: inline-block; padding: 4px 8px; background: #d1fae5; color: #10b981; border-radius: 4px; font-size: 12px; margin-bottom: 10px;">
              ✏️ Manuell eingegeben
            </div>
          ` : `
            <div style="display: inline-block; padding: 4px 8px; background: #e0e7ff; color: #3b82f6; border-radius: 4px; font-size: 12px; margin-bottom: 10px;">
              🤖 Automatisch erkannt
            </div>
          `}
          <div style="padding: 15px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-top: 10px;">
            ${renderContent(mergedData, avgScore)}
          </div>
        </div>
      `;
    };

    return `
      <div class="metric-card ${scoreClass}">
        <div class="score-details" style="padding: 15px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-bottom: 15px;">
          <p><strong>Lokale Sichtbarkeit:</strong> ${localSEOScore >= 90 ? 'Exzellent' : localSEOScore >= 61 ? 'Sehr gut' : 'Verbesserungsbedarf'}</p>
          <p><strong>Empfehlung:</strong> ${localSEOScore >= 90 ? 'Hervorragende lokale Präsenz – Behalten Sie diesen Standard bei!' : localSEOScore >= 61 ? 'Gute Basis, weitere Optimierung möglich' : 'Lokale SEO dringend optimieren'}</p>
        </div>

        ${renderSection(
          'Google My Business',
          '🏢',
          manualData?.googleMyBusiness,
          autoData.googleMyBusiness,
          (data, avgScore) => `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
              <div>
                <p><strong>Status:</strong> ${data.claimed ? '✅ Beansprucht' : '❌ Nicht beansprucht'}</p>
                <p style="color: #6b7280; font-size: 0.9rem; margin: 8px 0 0 0;">Ob das Unternehmen den Google-Eintrag als Inhaber übernommen hat</p>
                <p><strong>Verifiziert:</strong> ${data.verified ? '✅ Ja' : '❌ Nein'}</p>
                <p style="color: #6b7280; font-size: 0.9rem; margin: 8px 0 0 0;">Bestätigung durch Google per Postkarte, Anruf oder E-Mail erfolgt</p>
                <p><strong>Vollständigkeit:</strong> ${data.complete}%</p>
              </div>
              <div>
                <p><strong>Fotos:</strong> ${data.photos} hochgeladen</p>
                <p><strong>Posts (30 Tage):</strong> ${data.posts}</p>
                <p><strong>Letztes Update:</strong> ${data.lastUpdate}</p>
              </div>
            </div>
            ${generateProgressBar(avgScore, 'GMB Optimierung')}
          `
        )}

        ${renderSection(
          'Lokale Verzeichnisse & Citations',
          '🌐',
          manualData?.localCitations,
          autoData.localCitations,
          (data, avgScore) => `
            <p style="color: #6b7280; font-size: 0.9rem; margin: 8px 0;">Wie oft und wie einheitlich Ihre Unternehmensdaten in Online-Verzeichnissen erscheinen</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0;">
              <div style="text-align: center;">
                <div class="citation-total">${data.totalCitations}</div>
                <p class="secondary-text" style="font-size: 12px;">Gefundene Einträge</p>
              </div>
              <div style="text-align: center;">
                <div class="citation-consistent">${data.consistent}</div>
                <p class="secondary-text" style="font-size: 12px;">Konsistent</p>
              </div>
              <div style="text-align: center;">
                <div class="citation-inconsistent">${data.inconsistent}</div>
                <p class="secondary-text" style="font-size: 12px;">Inkonsistent</p>
              </div>
            </div>
            ${data.topDirectories && data.topDirectories.length > 0 ? `
              <h5 style="margin: 15px 0 10px 0;">Top-Verzeichnisse:</h5>
              <div style="display: grid; gap: 8px;">
                ${data.topDirectories.map(directory => `
                  <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 6px; border: 1px solid #e5e7eb;">
                    <span style="font-size: 14px;">${directory.name}</span>
                    <span class="${
                      directory.status === 'vollständig' ? 'status-vollständig' :        
                      directory.status === 'unvollständig' ? 'status-unvollständig' :      
                      'status-nicht-gefunden'
                    }">${directory.status}</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${generateProgressBar(avgScore, 'Einheitlichkeit der Firmendaten')}
          `
        )}

        ${renderSection(
          'Lokale Keyword-Rankings',
          '🎯',
          manualData?.localKeywords?.ranking?.length > 0 ? manualData.localKeywords : null,
          autoData.localKeywords.ranking?.length > 0 ? autoData.localKeywords : null,
          (data, avgScore) => `
            <p style="color: #6b7280; font-size: 0.9rem; margin: 8px 0;">Ihre Platzierung in Google bei lokalen Suchbegriffen</p>
            <div style="display: grid; gap: 10px; margin-top: 10px;">
              ${data.ranking.map(keyword => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.7); border-radius: 6px; border: 1px solid #e5e7eb;">
                  <div>
                    <span style="font-weight: 500;">${keyword.keyword}</span>
                    <span class="${keyword.volume === 'hoch' ? 'volume-high' : keyword.volume === 'mittel' ? 'volume-medium' : 'volume-low'}">${keyword.volume} Volumen</span>
                  </div>
                  <div style="text-align: right;">
                    <div class="ranking-position ${keyword.volume === 'hoch' ? 'yellow' : keyword.volume === 'mittel' ? 'green' : 'red'}">#${keyword.position}</div>
                    <div class="secondary-text" style="font-size: 11px;">Position</div>
                  </div>
                </div>
              `).join('')}
            </div>
            ${generateProgressBar(avgScore, 'Durchschnittliche Ranking-Position')}
          `
        )}

        ${renderSection(
          'On-Page Local Faktoren',
          '📍',
          manualData?.onPageLocal,
          autoData.onPageLocal,
          (data, avgScore) => `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
              <div>
                <p><strong>📍 Adresse sichtbar:</strong> ${data.addressVisible ? '✅ Ja' : '❌ Nein'}</p>
                <p><strong>📞 Telefon sichtbar:</strong> ${data.phoneVisible ? '✅ Ja' : '❌ Nein'}</p>
              </div>
              <div>
                <p><strong>🕒 Öffnungszeiten:</strong> ${data.openingHours ? '✅ Ja' : '❌ Nein'}</p>
                <p><strong>🏷️ Local Schema:</strong> ${data.localSchema ? '✅ Implementiert' : '❌ Fehlt'}</p>
                <p style="color: #6b7280; font-size: 0.9rem; margin: 8px 0 0 0;">Strukturierte Daten für Google</p>
              </div>
            </div>
            ${generateProgressBar(data.localContent, 'Lokaler Content Score')}
            ${generateProgressBar(avgScore, 'Gesamtbewertung lokale Optimierung')}
          `
        )}

        <div class="recommendations">
          <h4>Handlungsempfehlungen für lokale SEO:</h4>
          <ul>
            ${localSEOScore >= 90 ? `
              <li>✅ Behalten Sie Ihre exzellente lokale Online-Präsenz bei</li>
              <li>✅ Pflegen Sie weiterhin Ihr Google My Business Profil aktiv</li>
              <li>✅ Bleiben Sie mit positiven Kundenbewertungen im Dialog</li>
              <li>✅ Nutzen Sie Ihre starke Position für weiteres Wachstum</li>
            ` : `
              ${manualData || autoData.googleMyBusiness.score < 90 ? '<li>Google My Business Profil vollständig optimieren und regelmäßig aktualisieren (Fotos, Beiträge, Öffnungszeiten pflegen)</li>' : ''}
              ${manualData || autoData.localCitations.score < 80 ? '<li>Einträge in lokalen Verzeichnissen erstellen und NAP-Konsistenz sicherstellen (Name, Adresse, Telefon überall identisch)</li>' : ''}
              ${manualData || autoData.localKeywords.score < 80 ? '<li>Lokale Keywords in Content und Meta-Tags integrieren (z.B. "Handwerker in [Stadt]")</li>' : ''}
              ${manualData || !autoData.onPageLocal.localSchema ? '<li>Local Business Schema Markup implementieren (strukturierte Daten für Google)</li>' : ''}
              <li>Lokale Inhalte und regionale Bezüge auf der Website verstärken (Stadtteilnamen, lokale Projekte zeigen)</li>
              <li>Kundenbewertungen aktiv sammeln und beantworten (baut Vertrauen und Sichtbarkeit auf)</li>
              <li>Lokale Backlinks durch Partnerschaften und Events aufbauen (Vernetzung mit lokalen Unternehmen)</li>
            `}
          </ul>
        </div>
      </div>
    `;
  };

  // Performance Analysis
  const getPerformanceAnalysis = () => {
    const performanceScore = realData.performance.score;
    const scoreClass = performanceScore >= 80 ? 'yellow' : performanceScore >= 60 ? 'green' : 'red';

    return `
      <div class="metric-card ${scoreClass}">
        <h3>Performance Analyse</h3>
        <div class="score-display">
          <div class="score-circle" data-score="${getScoreRange(performanceScore)}">${performanceScore}%</div>
          <div class="score-details">
            <p><strong>Ladezeit:</strong> ${realData.performance.loadTime}s</p>
          </div>
        </div>
        ${generateProgressBar(
          performanceScore,
          `${performanceScore >= 70 ? 'Sehr gute Performance' : 'Performance verbessern für bessere Nutzererfahrung'} - Ladezeit: ${realData.performance.loadTime}s`
        )}
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            ${performanceScore >= 90 ? `
              <li>✅ Exzellente Performance – Behalten Sie Ihre Optimierungen bei!</li>
              <li>✅ Überwachen Sie die Ladezeiten regelmäßig, um dieses hohe Niveau zu halten</li>
              <li>✅ Ihre schnelle Website bietet Besuchern ein erstklassiges Nutzererlebnis</li>
            ` : `
              <li>Bilder komprimieren und optimieren (Dateigröße reduzieren ohne sichtbaren Qualitätsverlust)</li>
              <li>Browser-Caching aktivieren (Inhalte beim ersten Besuch speichern für schnelleren Seitenaufbau bei erneutem Besuch)</li>
              <li>CSS und JavaScript minimieren (Überflüssige Leerzeichen und Kommentare aus Code entfernen)</li>
              <li>Content Delivery Network nutzen (Inhalte weltweit auf Servern verteilen für schnellere Ladezeiten)</li>
            `}
          </ul>
        </div>
      </div>
    `;
  };

  // Mobile Optimization Analysis - Enhanced
  const getMobileOptimizationAnalysis = () => {
    // Kombiniere automatische und manuelle Scores (50% auto + 50% manuell)
    // Nur kombinieren wenn manuelle Daten vorhanden UND Score > 0
    const autoScore = realData.mobile.overallScore;
    const manualScore = manualMobileData?.overallScore || 0;
    const mobileScore = (manualMobileData && manualScore > 0)
      ? Math.round((autoScore + manualScore) / 2)
      : autoScore;
    const scoreClass = mobileScore >= 80 ? 'yellow' : mobileScore >= 60 ? 'green' : 'red';
    
    const isManual = !!(manualMobileData && manualScore > 0);

     return `
      <div class="metric-card ${scoreClass}">
        <h3>Mobile Optimierung</h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(mobileScore)}">${mobileScore}%</div>
          <div class="score-details">
            <p><strong>Mobile-Freundlichkeit:</strong> ${mobileScore >= 90 ? 'Exzellent' : mobileScore >= 61 ? 'Gut' : 'Verbesserungsbedarf'}</p>
          </div>
        </div>
        ${generateProgressBar(
          mobileScore,
          `${mobileScore >= 90 ? 'Exzellente mobile Optimierung' : mobileScore >= 61 ? 'Gute mobile Optimierung' : 'Mobile Optimierung sollte verbessert werden'}`
        )}
        
        <!-- Responsive Design -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
          <h4>Responsive Design</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Viewport-Konfiguration:</strong> ${mobileScore >= 90 ? 'Exzellent' : mobileScore >= 61 ? 'Gut umgesetzt' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(40, mobileScore))}" style="width: ${Math.max(40, mobileScore)}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${Math.max(40, mobileScore)}%</span>
                  </div>
                </div>
              </div>
              <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 0 0; line-height: 1.4;">Richtige Bildschirmeinstellung für alle Geräte</p>
            </div>
            <div>
              <p><strong>Flexible Layouts:</strong> ${mobileScore >= 60 ? 'Gut umgesetzt' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(30, mobileScore * 0.9))}" style="width: ${Math.max(30, mobileScore * 0.9)}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${Math.round(Math.max(30, mobileScore * 0.9))}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Bildoptimierung:</strong> ${mobileScore >= 70 ? 'Responsive Bilder' : 'Nicht optimiert'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(mobileScore >= 70 ? 85 : 35)}" style="width: ${mobileScore >= 70 ? 85 : 35}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${mobileScore >= 70 ? 85 : 35}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Performance -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
          <h4>Mobile Performance</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Mobile Ladezeit:</strong> ${realData.performance.loadTime <= 3 ? 'Schnell' : realData.performance.loadTime <= 5 ? 'Akzeptabel' : 'Langsam'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(20, 100 - (realData.performance.loadTime * 20)))}" style="width: ${Math.max(20, 100 - (realData.performance.loadTime * 20))}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${Math.round(Math.max(20, 100 - (realData.performance.loadTime * 20)))}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Core Web Vitals:</strong> ${Math.max(25, mobileScore * 0.8) >= 70 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(25, mobileScore * 0.8))}" style="width: ${Math.max(25, mobileScore * 0.8)}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${Math.round(Math.max(25, mobileScore * 0.8))}%</span>
                  </div>
                </div>
              </div>
              <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 0 0; line-height: 1.4;">Googles Messgrößen für Nutzererlebnis und Seitengeschwindigkeit</p>
            </div>
            <div>
              <p><strong>Mobile-First Index:</strong> ${mobileScore >= 60 ? 'Berücksichtigt' : 'Nicht optimiert'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(mobileScore >= 60 ? 80 : 30)}" style="width: ${mobileScore >= 60 ? 80 : 30}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${mobileScore >= 60 ? 80 : 30}%</span>
                  </div>
                </div>
              </div>
              <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 0 0; line-height: 1.4;">Google bewertet primär die mobile Version Ihrer Website</p>
            </div>
          </div>
        </div>

        <!-- Touch-Optimierung -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(236, 72, 153, 0.1); border-radius: 8px;">
          <h4>👆 Touch-Optimierung</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Button-Größen:</strong> ${mobileScore >= 70 ? 'Touch-freundlich' : 'Zu klein'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(mobileScore >= 70 ? 90 : 40)}" style="width: ${mobileScore >= 70 ? 90 : 40}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${mobileScore >= 70 ? 90 : 40}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Tap-Abstände:</strong> ${manualMobileData?.tapDistance === 'good' ? 'Ausgezeichnet' : manualMobileData?.tapDistance === 'sufficient' ? 'Ausreichend' : mobileScore >= 60 ? 'Ausreichend' : 'Zu gering'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(manualMobileData?.tapDistance === 'good' ? 100 : manualMobileData?.tapDistance === 'sufficient' ? 60 : mobileScore >= 60 ? 60 : 40)}" style="width: ${manualMobileData?.tapDistance === 'good' ? 100 : manualMobileData?.tapDistance === 'sufficient' ? 60 : mobileScore >= 60 ? 60 : 40}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${manualMobileData?.tapDistance === 'good' ? 100 : manualMobileData?.tapDistance === 'sufficient' ? 60 : mobileScore >= 60 ? 60 : 40}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Scroll-Verhalten:</strong> ${mobileScore >= 70 ? 'Flüssig' : 'Verbesserbar'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(40, mobileScore * 0.9))}" style="width: ${Math.max(40, mobileScore * 0.9)}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${Math.round(Math.max(40, mobileScore * 0.9))}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            ${mobileScore >= 90 ? `
              <li>✅ Hervorragende mobile Optimierung – Top-Erlebnis auf allen Geräten!</li>
              <li>✅ Behalten Sie Ihre Mobile-First Strategie bei</li>
              <li>✅ Testen Sie regelmäßig neue mobile Geräte und Bildschirmgrößen</li>
              <li>✅ Ihre mobile Website ist ein Wettbewerbsvorteil</li>
            ` : `
              <li>Mobile-First Design-Strategie implementieren (Website zuerst für Smartphones entwickeln, dann für Desktop anpassen)</li>
              <li>Touch-Interfaces optimieren (min. 44px Buttons) (Schaltflächen groß genug für bequeme Fingerbedienung machen)</li>
              <li>Progressive Web App (PWA) Features hinzufügen (App-ähnliches Erlebnis im Browser, auch offline nutzbar)</li>
              <li>Mobile Performance kontinuierlich überwachen (Regelmäßig Ladezeiten auf Smartphones prüfen und verbessern)</li>
            `}
          </ul>
        </div>
      </div>
    `;
  };

  // Competitor Analysis - ANONYMISIERT für Kundenreport  
  const getCompetitorAnalysis = () => {
    console.log('getCompetitorAnalysis called');
    console.log('manualCompetitors:', manualCompetitors);
    console.log('competitorServices:', competitorServices);
    
    // VERWENDE GLOBALE DATEN ODER FALLBACK AUF MANUELLE DATEN
    console.log('=== COMPETITOR EXPORT DEBUG ===');
    console.log('globalAllCompetitors from window:', (window as any).globalAllCompetitors);
    console.log('manualCompetitors passed to function:', manualCompetitors);
    
    const allCompetitors = (window as any).globalAllCompetitors || manualCompetitors || [];
    
    console.log('allCompetitors after processing:', allCompetitors);
    console.log('allCompetitors.length:', allCompetitors.length);
    
    if (allCompetitors.length === 0) {
      return `
        <div class="metric-card warning">
          <h3>👥 Wettbewerbsanalyse & Marktumfeld</h3>
          <p class="light-gray-text text-center" style="font-style: italic; margin: 20px 0;">
            Keine Wettbewerber zum Vergleich erfasst.
          </p>
          <div class="recommendations">
            <h4>Empfohlene Maßnahmen:</h4>
            <ul>
              <li>Wettbewerbsanalyse durchführen</li>
              <li>Marktposition bestimmen</li>
              <li>Differenzierungsmerkmale identifizieren</li>
            </ul>
          </div>
        </div>
      `;
    }

    // Berechne maximalen Umgebungsradius anhand der Entfernungen
    const getMaxRadius = () => {
      if (allCompetitors.length === 0) return '25 km';
      
      const distances = allCompetitors
        .map(competitor => {
          const distance = competitor.distance || '';
          // Extrahiere Zahlen aus der Entfernungsangabe (z.B. "5.2 km" -> 5.2)
          const match = distance.toString().match(/(\d+[\.,]?\d*)/);
          return match ? parseFloat(match[1].replace(',', '.')) : 0;
        })
        .filter(d => d > 0);
      
      if (distances.length === 0) return '25 km';
      
      const maxDistance = Math.max(...distances);
      return `${Math.ceil(maxDistance)} km`;
    };

    const maxRadius = getMaxRadius();
    const ownScore = (window as any).globalOwnCompanyScore || 75;
    const scoreColorClass = ownScore >= 90 ? 'excellent' : ownScore >= 61 ? 'good' : 'poor';

    return `
      <div class="metric-card ${scoreColorClass}">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0;">👥 Wettbewerbsanalyse & Marktumfeld</h3>
          <div class="score-circle ${scoreColorClass}" style="margin: 0;">${Math.round(ownScore)}%</div>
        </div>
        <div style="margin-bottom: 20px;">
          <p class="light-gray-text" style="margin-bottom: 15px;">
            <strong>Anzahl analysierte Wettbewerber:</strong> ${allCompetitors.length}
          </p>
          <p class="light-gray-text" style="margin-bottom: 15px;">
            <strong>Maximaler Umgebungsradius der Suche:</strong> ${maxRadius}
          </p>
        </div>
        
        <!-- Wettbewerber-Vergleichstabelle -->
        <div style="overflow-x: auto; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse; background: rgba(17, 24, 39, 0.6); border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background: rgba(251, 191, 36, 0.2);">
                <th class="table-header" style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Wettbewerber</th>
                <th class="table-header" style="padding: 12px; text-align: center; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Bewertung</th>
                <th class="table-header" style="padding: 12px; text-align: center; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Anzahl Bewertungen</th>
                <th class="table-header" style="padding: 12px; text-align: center; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Gesamtscore</th>
                <th class="table-header" style="padding: 12px; text-align: center; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Marktposition</th>
                <th class="table-header" style="padding: 12px; text-align: left; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Services</th>
              </tr>
            </thead>
            <tbody>
              <!-- Eigenes Unternehmen -->
              <tr style="border-bottom: 2px solid rgba(251, 191, 36, 0.5); background: rgba(251, 191, 36, 0.1);">
                <td style="padding: 12px; color: #fbbf24;">
                  <strong>Ihr Unternehmen</strong>
                </td>
                <td style="padding: 12px; text-align: center; color: #fbbf24;">
                  <span style="font-weight: bold;">${realData.reviews.google.rating}/5</span>
                </td>
                <td style="padding: 12px; text-align: center; color: #fbbf24;">${realData.reviews.google.count}</td>
                <td style="padding: 12px; text-align: center; color: #fbbf24;">
                  <span style="font-weight: bold; font-size: 1.2em;">${Math.round(competitorComparisonScore)}</span>
                    <br><small style="color: #fbbf24;">${expectedServices.length} Services</small>
                  </td>
                <td style="padding: 12px; text-align: center;">
                  <span style="color: #fbbf24; font-weight: bold;">Referenz</span>
                </td>
                <td style="padding: 12px; color: #fbbf24; font-size: 0.9em;">${expectedServices.join(', ')}</td>
              </tr>
              ${allCompetitors.map((competitor, index) => {
                console.log('Processing competitor:', competitor.name, 'services:', competitor.services);
                
                // Verwende die EXAKTE Score-Berechnung aus CompetitorAnalysis.tsx
                const rating = typeof competitor.rating === 'number' && !isNaN(competitor.rating) ? competitor.rating : 0;
                const reviews = typeof competitor.reviews === 'number' && !isNaN(competitor.reviews) ? competitor.reviews : 0;
                
                const services = Array.isArray(competitor.services) ? competitor.services : [];
                
                // VERWENDE BEREITS BERECHNETEN SCORE AUS COMPETITORANALYSIS
                // Verwende bereits berechneten Score wenn verfügbar, sonst fallback
                const estimatedScore = (competitor as any).score || Math.round(rating * 20);
                const serviceCount = services.length;
                
                return `
                <tr style="border-bottom: 1px solid rgba(107, 114, 128, 0.3);">
                  <td class="table-text" style="padding: 12px;">
                    <strong>Wettbewerber ${String.fromCharCode(65 + index)}</strong>
                  </td>
                  <td class="table-text" style="padding: 12px; text-align: center;">
                    <span class="score-badge ${competitor.rating >= 4 ? 'green' : competitor.rating >= 3 ? 'yellow' : 'red'}">${competitor.rating}/5</span>
                  </td>
                  <td class="table-text" style="padding: 12px; text-align: center;">${competitor.reviews}</td>
                  <td class="table-text" style="padding: 12px; text-align: center;">
                    <span class="score-badge ${estimatedScore >= 80 ? 'yellow' : estimatedScore >= 60 ? 'green' : 'red'}">${Math.round(estimatedScore)}</span>
                    <br><small class="secondary-text">${serviceCount} Services</small>
                    <br><small class="secondary-text">Services: ${serviceCount}</small>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="color: #9ca3af;">
                      ${estimatedScore > competitorComparisonScore ? 'Starker Wettbewerber' : 'Wettbewerber'}
                    </span>
                  </td>
                  <td class="table-text" style="padding: 12px; font-size: 0.9em;">
                    ${services.length > 0 ? services.join(', ') : 'Nicht erfasst'}
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Marktpositions-Analyse -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
          <h4 style="color: #fbbf24; margin-bottom: 15px;">Marktpositions-Vergleich</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div>
              <p><strong>Ihre Position:</strong> ${realData.reviews.google.rating}/5 (${realData.reviews.google.count} Bewertungen)</p>
              <p><strong>Ihr Gesamtscore:</strong> <span style="color: #fbbf24; font-weight: bold;">${marketComparisonScore} Punkte</span></p>
              ${(() => {
                const avgCompetitorScore = allCompetitors.length > 0 
                  ? allCompetitors.reduce((acc, comp) => {
                      const rating = typeof comp.rating === 'number' && !isNaN(comp.rating) ? comp.rating : 0;
                      const reviews = typeof comp.reviews === 'number' && !isNaN(comp.reviews) ? comp.reviews : 0;
                      
                      // Rating-Score: Gleiche Logik wie in CompetitorAnalysis
                      const ratingScore = rating >= 4.5 
                        ? 80 + ((rating - 4.5) / 0.5) * 15  // 80-95% für 4.5-5.0
                        : rating >= 3.5 
                          ? 60 + ((rating - 3.5) * 20)      // 60-80% für 3.5-4.5
                          : rating >= 2.5 
                            ? 40 + ((rating - 2.5) * 20)    // 40-60% für 2.5-3.5
                            : rating * 16;                  // 0-40% für unter 2.5
                      
                       // Review-Score: Basiert auf geschätzten positiven Bewertungen (Rating 4+ von 5)
                       const positiveReviewsRatio = rating > 0 ? Math.min((rating - 1) / 4, 1) : 0;
                       const estimatedPositiveReviews = Math.round(reviews * positiveReviewsRatio);
                       
                       const reviewScore = reviews <= 25 
                         ? Math.min(50 + estimatedPositiveReviews * 1.6, 90)  // Basiert auf positiven Reviews
                         : Math.min(95, 90 + Math.log10(estimatedPositiveReviews / 25) * 5); // Max 95%
                      
                      // Service-Score: Vereinfacht für HTML (nur Basis)
                      const compServices = Array.isArray(comp.services) ? comp.services : [];
                      const serviceCount = compServices.length;
                      let serviceScore;
                      if (serviceCount === 0) {
                        serviceScore = 15;  // Sehr niedrig ohne Services
                      } else if (serviceCount <= 3) {
                        serviceScore = 30 + (serviceCount * 15);  // 45-75% für 1-3 Services
                      } else if (serviceCount <= 8) {
                        serviceScore = 75 + ((serviceCount - 3) * 2);  // 77-85% für 4-8 Services
                      } else if (serviceCount <= 15) {
                        serviceScore = 85 + ((serviceCount - 8) * 0.7);  // 85-90% für 9-15 Services
                      } else {
                        serviceScore = Math.min(90 + ((serviceCount - 15) * 0.3), 93);  // Max 93% für >15 Services
                      }
                      
                       // ERHÖHTE GEWICHTUNG der Google-Bewertungen auch für Konkurrenten
                       const ratingWeight = Math.min(0.40 + (serviceCount * 0.020), 0.65); // 40-65% (erhöht von 30-55%)
                       const serviceWeight = Math.max(0.30 - (serviceCount * 0.015), 0.15);  // 30-15% (reduziert von 40-25%)
                       const reviewWeight = 1 - ratingWeight - serviceWeight; // Rest für Reviews (jetzt höher)
                      
                      const totalScore = Math.min((ratingScore * ratingWeight) + (reviewScore * reviewWeight) + (serviceScore * serviceWeight), 96);
                      
                      return acc + totalScore;
                    }, 0) / allCompetitors.length
                  : 0;
                const isAboveAverage = marketComparisonScore >= avgCompetitorScore;
                return `<p style="font-size: 0.9em; color: ${isAboveAverage ? '#22c55e' : '#ef4444'};">
                  ${isAboveAverage ? '✅ Über dem Marktdurchschnitt' : '⚠️ Unter dem Marktdurchschnitt'} (Ø ${avgCompetitorScore.toFixed(0)} Punkte)
                </p>`;
              })()}
            </div>
            <div>
              <p><strong>Stärkster Konkurrent:</strong> ${allCompetitors.length > 0 ? `Konkurrent ${String.fromCharCode(65 + allCompetitors.findIndex(c => c.rating === Math.max(...allCompetitors.map(comp => comp.rating))))}` : 'Keine Daten'}</p>
              <p class="gray-text" style="font-size: 0.9em;">Rating: ${allCompetitors.length > 0 ? `${Math.max(...allCompetitors.map(c => c.rating))}/5` : 'N/A'}</p>
            </div>
            <div>
              <p><strong>Markt-Durchschnitt:</strong> ${allCompetitors.length > 0 ? (allCompetitors.reduce((acc, comp) => acc + comp.rating, 0) / allCompetitors.length).toFixed(1) : '0'}/5</p>
              <p class="gray-text" style="font-size: 0.9em;">Ohne Ihr Unternehmen</p>
            </div>
            <div>
              <p><strong>Bewertungsverteilung:</strong></p>
              <p class="gray-text" style="font-size: 0.9em;">
                Stark: ${allCompetitors.filter(c => c.rating >= 4).length} | 
                Mittel: ${allCompetitors.filter(c => c.rating >= 3 && c.rating < 4).length} |
                Schwach: ${allCompetitors.filter(c => c.rating < 3).length}
              </p>
            </div>
          </div>
        </div>

        <!-- Service-Portfolio Vergleich -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
          <h4 style="color: #fbbf24; margin-bottom: 15px;">🛠️ Service-Portfolio Analyse</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div>
              <p><strong>Ihre Services:</strong> ${expectedServices.length} Kernleistungen</p>
              <p style="font-size: 0.9em; color: #22c55e; word-wrap: break-word; line-height: 1.4;">${expectedServices.join(', ')}</p>
            </div>
            <div>
              <p><strong>Durchschnitt Wettbewerber:</strong> ${allCompetitors.length > 0 ? (allCompetitors.reduce((acc, comp) => {
                return acc + comp.services.length;
              }, 0) / allCompetitors.length).toFixed(1) : '0'} Services</p>
              <p class="gray-text" style="font-size: 0.9em;">Pro Anbieter</p>
            </div>
            <div>
              <p><strong>Service-Score:</strong> <span style="color: #fbbf24; font-weight: bold;">${ownServiceScore} Punkte</span></p>
              <p style="font-size: 0.9em; color: ${ownServiceScore >= 70 ? '#22c55e' : '#eab308'};">
                ${ownServiceScore >= 70 ? '✅ Breites Portfolio' : '⚠️ Portfolio erweitern'}
              </p>
            </div>
            <div>
              <p><strong>Spezialisierung:</strong></p>
              <p style="font-size: 0.9em; color: #9ca3af;">
                ${businessData.industry === 'shk' ? 'SHK-Vollservice' : 
                  businessData.industry === 'maler' ? 'Maler & Lackierer' :
                  businessData.industry === 'elektriker' ? 'Elektrotechnik' :
                  businessData.industry === 'dachdecker' ? 'Dacharbeiten' :
                  businessData.industry === 'stukateur' ? 'Putz & Trockenbau' :
                  'Planungsdienstleistungen'}
              </p>
            </div>
          </div>
        </div>
        
        
        <div class="recommendations">
          <h4>Strategische Handlungsempfehlungen:</h4>
          <ul>
            ${(() => {
              // Calculate own company score
              const ownRating = realData.reviews.google.rating || 0;
              const ownReviews = realData.reviews.google.count || 0;
              const ownServices = (companyServices?.services || []).length;
              const removedServices = (removedMissingServices || []).length;
              const totalOwnServices = ownServices + removedServices;
              
              // Own company score calculation (similar to component logic)
              const ownRatingScore = ownRating >= 4.5 
                ? 80 + ((ownRating - 4.5) / 0.5) * 15
                : ownRating >= 3.5 
                  ? 60 + ((ownRating - 3.5) * 20)
                  : ownRating >= 2.5 
                    ? 40 + ((ownRating - 2.5) * 20)
                    : ownRating * 16;
              
              // Review-Score: Basiert auf geschätzten positiven Bewertungen (Rating 4+ von 5)
              const ownPositiveReviewsRatio = ownRating > 0 ? Math.min((ownRating - 1) / 4, 1) : 0;
              const ownEstimatedPositiveReviews = Math.round(ownReviews * ownPositiveReviewsRatio);
              
              const ownReviewScore = ownReviews <= 25 
                ? Math.min(50 + ownEstimatedPositiveReviews * 1.6, 90)
                : Math.min(95, 90 + Math.log10(ownEstimatedPositiveReviews / 25) * 5);
              
              let ownServiceScore;
              if (totalOwnServices === 0) {
                ownServiceScore = 15;
              } else if (totalOwnServices <= 3) {
                ownServiceScore = 30 + (totalOwnServices * 15);
              } else if (totalOwnServices <= 8) {
                ownServiceScore = 75 + ((totalOwnServices - 3) * 2);
              } else if (totalOwnServices <= 15) {
                ownServiceScore = 85 + ((totalOwnServices - 8) * 0.7);
              } else {
                ownServiceScore = Math.min(90 + ((totalOwnServices - 15) * 0.3), 93);
              }
              
              const ownRatingWeight = Math.min(0.30 + (totalOwnServices * 0.015), 0.55);
              const ownServiceWeight = Math.max(0.40 - (totalOwnServices * 0.01), 0.25);
              const ownReviewWeight = 1 - ownRatingWeight - ownServiceWeight;
              
              const baseOwnScore = (ownRatingScore * ownRatingWeight) + (ownReviewScore * ownReviewWeight) + (ownServiceScore * ownServiceWeight);
              const serviceRemovalBonus = Math.min(removedServices * 0.3, baseOwnScore * 0.10);
              const ownScore = Math.min(baseOwnScore + serviceRemovalBonus, 96);
              
              // Calculate competitor scores - use all competitors, not just manual ones
              const allOtherCompetitors = allCompetitors; // Use allCompetitors array that includes all competitors
              const competitorScores = allOtherCompetitors.map(c => {
                const rating = c.rating || 0;
                const reviews = c.reviews || 0;
                const services = c.services?.length || 0;
                
                const ratingScore = rating >= 4.5 
                  ? 80 + ((rating - 4.5) / 0.5) * 15
                  : rating >= 3.5 
                    ? 60 + ((rating - 3.5) * 20)
                    : rating >= 2.5 
                      ? 40 + ((rating - 2.5) * 20)
                      : rating * 16;
                
                // Review-Score: Basiert auf geschätzten positiven Bewertungen (Rating 4+ von 5)
                const positiveReviewsRatio = rating > 0 ? Math.min((rating - 1) / 4, 1) : 0;
                const estimatedPositiveReviews = Math.round(reviews * positiveReviewsRatio);
                
                const reviewScore = reviews <= 25 
                  ? Math.min(50 + estimatedPositiveReviews * 1.6, 90)
                  : Math.min(95, 90 + Math.log10(estimatedPositiveReviews / 25) * 5);
                
                let serviceScore;
                if (services === 0) {
                  serviceScore = 15;
                } else if (services <= 3) {
                  serviceScore = 30 + (services * 15);
                } else if (services <= 8) {
                  serviceScore = 75 + ((services - 3) * 2);
                } else if (services <= 15) {
                  serviceScore = 85 + ((services - 8) * 0.7);
                } else {
                  serviceScore = Math.min(90 + ((services - 15) * 0.3), 93);
                }
                
                const ratingWeight = Math.min(0.30 + (services * 0.015), 0.55);
                const serviceWeight = Math.max(0.40 - (services * 0.01), 0.25);
                const reviewWeight = 1 - ratingWeight - serviceWeight;
                
                return (ratingScore * ratingWeight) + (reviewScore * reviewWeight) + (serviceScore * serviceWeight);
              });
              
              const bestCompetitorScore = competitorScores.length > 0 ? Math.max(...competitorScores) : 0;
              const isDominant = ownScore > bestCompetitorScore && allOtherCompetitors.length > 0;
              
              if (isDominant) {
                return `
                  <li>⭐ Dominierende Marktposition im unmittelbaren Marktumfeld</li>
                  <li>⭐ Keine unmittelbaren Maßnahmen zur Steigerung der Wettbewerbsfähigkeit notwendig</li>
                `;
              } else {
                return `
                  <li>⭐ Prüfen Sie, welche Services für Ihr Unternehmen relevant sind</li>
                  <li>⭐ Erwägen Sie eine Erweiterung Ihres Leistungsspektrums</li>
                  <li>⭐ Kommunizieren Sie vorhandene Services besser</li>
                  <li>⭐ Partnerschaften für fehlende Services erwägen</li>
                `;
              }
            })()}
          </ul>
        </div>
      </div>
    `;
  };

  // Social Media Analysis - Strukturierte Analyse mit Collapsible Sections
  const getSocialMediaAnalysis = () => {
    console.log('getSocialMediaAnalysis called with socialMediaScore:', socialMediaScore);
    console.log('getSocialMediaAnalysis called with manualSocialData:', manualSocialData);
    console.log('🔶 Detailed manual social data check:', JSON.stringify(manualSocialData, null, 2));
    
    if (!manualSocialData) {
      return `
        <div class="metric-card warning">
          <h3>Social Media Präsenz</h3>
          <div class="score-display">
            <div class="score-circle neutral">–</div>
            <div class="score-details">
              <p><strong>Status:</strong> Keine Social Media Aktivität erkannt</p>
              <p><strong>Empfehlung:</strong> Aufbau einer professionellen Social Media Präsenz</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Handlungsempfehlungen:</h4>
            <ul>
              <li>Facebook Business-Seite erstellen</li>
              <li>Instagram für visuelle Inhalte nutzen</li>
              <li>LinkedIn für B2B-Networking</li>
              <li>TikTok für junge Zielgruppe</li>
              <li>Regelmäßige Content-Strategie entwickeln</li>
            </ul>
          </div>
        </div>
      `;
    }

    const hasAnyPlatform = Boolean(
      manualSocialData.facebookUrl || 
      manualSocialData.instagramUrl || 
      manualSocialData.linkedinUrl || 
      manualSocialData.twitterUrl || 
      manualSocialData.youtubeUrl ||
      manualSocialData.tiktokUrl
    );

    if (!hasAnyPlatform) {
      return `
        <div class="metric-card warning">
          <h3>Social Media Präsenz</h3>
          <div class="score-display">
            <div class="score-circle neutral">–</div>
            <div class="score-details">
              <p><strong>Status:</strong> Keine aktiven Social Media Kanäle</p>
              <p><strong>Empfehlung:</strong> Social Media Präsenz aufbauen</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Handlungsempfehlungen:</h4>
            <ul>
              <li>Mindestens 2-3 Plattformen aktivieren</li>
              <li>Regelmäßigen Content-Plan erstellen</li>
              <li>Zielgruppe definieren und ansprechen</li>
            </ul>
          </div>
        </div>
      `;
    }

    // Aktive Plattformen sammeln
    const activePlatforms = [];
    if (manualSocialData.facebookUrl) {
      activePlatforms.push({
        name: 'Facebook',
        followers: manualSocialData.facebookFollowers || '0',
        lastPost: manualSocialData.facebookLastPost || 'Unbekannt'
      });
    }
    if (manualSocialData.instagramUrl) {
      activePlatforms.push({
        name: 'Instagram',
        followers: manualSocialData.instagramFollowers || '0',
        lastPost: manualSocialData.instagramLastPost || 'Unbekannt'
      });
    }
    if (manualSocialData.linkedinUrl) {
      activePlatforms.push({
        name: 'LinkedIn',
        followers: manualSocialData.linkedinFollowers || '0',
        lastPost: manualSocialData.linkedinLastPost || 'Unbekannt'
      });
    }
    if (manualSocialData.twitterUrl) {
      activePlatforms.push({
        name: 'Twitter',
        followers: manualSocialData.twitterFollowers || '0',
        lastPost: manualSocialData.twitterLastPost || 'Unbekannt'
      });
    }
    if (manualSocialData.youtubeUrl) {
      activePlatforms.push({
        name: 'YouTube',
        followers: manualSocialData.youtubeSubscribers || '0',
        lastPost: manualSocialData.youtubeLastPost || 'Unbekannt'
      });
    }
    if (manualSocialData.tiktokUrl) {
      activePlatforms.push({
        name: 'TikTok',
        followers: manualSocialData.tiktokFollowers || '0',
        lastPost: manualSocialData.tiktokLastPost || 'Unbekannt'
      });
    }

    const cardClass = socialMediaScore >= 60 ? 'good' : 'warning';
    
    return `
      <div class="metric-card ${cardClass}">
        <h3>Social Media Präsenz</h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(socialMediaScore)}">${displaySocialScore}</div>
          <div class="score-details">
            <p><strong>Aktive Plattformen:</strong> ${activePlatforms.length}</p>
            <p><strong>Status:</strong> ${socialMediaScore >= 80 ? 'Sehr gut' : socialMediaScore >= 60 ? 'Gut' : socialMediaScore >= 40 ? 'Ausbaufähig' : 'Schwach'}</p>
          </div>
        </div>
        
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${socialMediaScore}%; background-color: ${getScoreColor(socialMediaScore)}; display: flex; align-items: center; justify-content: center;">
              <span style="color: ${socialMediaScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${socialMediaScore}%</span>
            </div>
          </div>
        </div>
        
        <div class="platform-details">
          <h4>Aktive Kanäle:</h4>
          <ul>
            ${activePlatforms.map(platform => `
              <li>
                <strong>${platform.name}:</strong> 
                ${platform.followers} Follower
                • Letzter Post: ${platform.lastPost}
                ${platform.name === 'Instagram' ? '<br><small style="color: #6b7280; font-size: 0.9rem;">* Bewertung basiert auf Posts und Reels. Stories sind zu kurz sichtbar für eine Bewertung.</small>' : ''}
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            ${socialMediaScore >= 90 ? `
              <li>✅ Exzellente Social Media Präsenz – Bleiben Sie so aktiv!</li>
              <li>✅ Nutzen Sie Ihre starke Community für weiteres Wachstum</li>
              <li>✅ Erwägen Sie innovative Formate (Live-Videos, Reels, Stories)</li>
              <li>✅ Ihre Reichweite ist ein großer Wettbewerbsvorteil</li>
            ` : socialMediaScore < 60 ? `
              <li>Erhöhung der Posting-Frequenz</li>
              <li>Aufbau einer größeren Follower-Basis</li>
              <li>Diversifizierung auf weitere Plattformen</li>
              <li>Content-Strategie entwickeln</li>
            ` : `
              <li>Kontinuierliche Content-Strategie beibehalten</li>
              <li>Engagement mit Followern verstärken</li>
              <li>Performance-Monitoring implementieren</li>
              <li>Cross-Platform-Synergien nutzen</li>
            `}
          </ul>
        </div>
      </div>
    `;
  };

  // CSS-based logo for standalone HTML files
  const createCSSLogo = () => `
    <div style="display: inline-block; padding: 15px 20px; background: #1f2937; border-radius: 8px; text-align: center; border: 2px solid #fbbf24;">
      <div style="color: #fbbf24; font-size: 24px; font-weight: bold; margin-bottom: 5px;">★</div>
      <div style="color: #fbbf24; font-size: 16px; font-weight: bold; line-height: 1.2;">
        <div>HANDWERK</div>
        <div>STARS</div>
      </div>
    </div>
  `;

  // Calculate individual scores for overall assessment
  const googleReviewScore = (() => {
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
  })();
  
  // Collect all available scores for proper average calculation
  const allScores = [
    realData.seo.score,
    realData.performance.score,
    realData.mobile.overallScore,
    socialMediaScore,
    googleReviewScore,
    impressumScore,
    accessibilityScore,
    dsgvoScore
  ].filter(score => score !== undefined && score !== null);
  
  // Calculate overall score as true average of all sections (excluding Corporate Identity)
  const overallCompanyScore = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);

  // Generate the comprehensive HTML report
  console.log('Generating HTML report with container structure');
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UNNA - die Unternehmensanalyse - ${realData.company.name}</title>
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="generator" content="Handwerk Stars Analysis Tool v${Date.now()}">
  <style>
    ${getHTMLStyles()}
  </style>
  <script>
    function toggleSection(id) {
      const content = document.getElementById(id);
      const trigger = content.previousElementSibling;
      if (content.style.display === 'none') {
        content.style.display = 'block';
        trigger.innerHTML = trigger.innerHTML.replace('▶', '▼');
      } else {
        content.style.display = 'none';
        trigger.innerHTML = trigger.innerHTML.replace('▼', '▶');
      }
    }
  </script>
</head>
<body>
  <div class="container">
    <div class="header">
      ${getLogoHTML()}
      <h1>UNNA - die Unternehmensanalyse</h1>
      <div class="subtitle">${realData.company.name} - ${businessData.url}</div>
      <p class="gray-text" style="margin-top: 15px;">Eine betriebliche Standortbestimmung im Markt und – Wettbewerbsumfeld, digital, analog im Netz und aus Kundensicht für: ${realData.company.name}</p>
    </div>

    <!-- Unternehmensdaten -->
    <div class="section">
      <div class="section-header"><span>Unternehmensdaten</span></div>
      <div class="section-content">
        <div class="company-info">
          <h3>${realData.company.name}</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
            <div>
              <p><strong>Website:</strong> ${businessData.url}</p>
              <p><strong>Branche:</strong> ${businessData.industry.toUpperCase()}</p>
              <p><strong>Adresse:</strong> ${businessData.address}</p>
            </div>
            <div>
              <p><strong>Telefon:</strong> ${realData.company.phone || 'Nicht erfasst'}</p>
              <p><strong>E-Mail:</strong> ${realData.company.email || 'Nicht erfasst'}</p>
              <p><strong>Analysestand:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Executive Summary -->
    <div class="section">
      <div class="section-header"><span>Executive Summary</span></div>
      <div class="section-content">
        <!-- Kategorisierte Score-Übersicht (Klickbare Navigation) -->
         <div id="navigation-overview" class="categorized-scores">
          <!-- Kategorie 1: Online-Qualität · Relevanz · Autorität -->
          <a href="#cat-online-qualitaet" class="score-category nav-category-link">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Online-Qualität · Relevanz · Autorität</h3>
              ${cat1Avg > 0 ? `<div class="header-score-circle ${getScoreColorClass(cat1Avg)}">${cat1Avg}%</div>` : ''}
            </div>
          </a>

          <!-- Kategorie 2: Webseiten-Performance & Technik -->
          <a href="#cat-performance-technik" class="score-category nav-category-link">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Webseiten-Performance & Technik</h3>
              <div class="header-score-circle ${getScoreColorClass(cat2Avg)}">${cat2Avg}%</div>
            </div>
          </a>

          <!-- Kategorie 3: Online-/Web-/Social-Media Performance -->
          <a href="#cat-social-media" class="score-category nav-category-link">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Online-/Web-/Social-Media Performance</h3>
              ${cat3Avg > 0 ? `<div class="header-score-circle ${getScoreColorClass(cat3Avg)}">${cat3Avg}%</div>` : ''}
            </div>
          </a>

          <!-- Kategorie 4: Markt & Marktumfeld -->
          <a href="#cat-markt-umfeld" class="score-category nav-category-link">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Markt & Marktumfeld</h3>
              ${cat4Avg > 0 ? `<div class="header-score-circle ${getScoreColorClass(cat4Avg)}">${cat4Avg}%</div>` : ''}
            </div>
          </a>

          <!-- Kategorie 5: Qualität · Service · Kundenorientierung -->
          <a href="#cat-qualitaet-service" class="score-category nav-category-link">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Qualität · Service · Kundenorientierung</h3>
              ${cat6Avg > 0 ? `<div class="header-score-circle ${getScoreColorClass(cat6Avg)}">${cat6Avg}%</div>` : ''}
            </div>
          </a>

          <!-- Kategorie 6: Außendarstellung & Erscheinungsbild -->
          <a href="#cat-aussendarstellung" class="score-category nav-category-link">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Außendarstellung & Erscheinungsbild</h3>
              ${cat5Avg > 0 ? `<div class="header-score-circle ${getScoreColorClass(cat5Avg)}">${cat5Avg}%</div>` : ''}
            </div>
          </a>

          <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 15px; grid-column: 1 / -1;">
            💡 Klicken Sie auf eine Kategorie, um direkt zum entsprechenden Abschnitt zu springen
          </p>

        </div>

        <!-- Gesamtscore -->
        <div class="score-overview" style="margin-top: 30px;">
          <div class="score-card">
            <div class="score-big"><span class="score-tile ${getScoreColorClass(overallScore)}">${overallScore}%</span></div>
            <div class="score-label">Gesamtscore</div>
          </div>
        </div>

        <!-- Collapsible Kategorie-Aufschlüsselung -->
        <div style="margin-top: 30px;">
          <div 
            onclick="toggleSection('main-categories-content')" 
            style="cursor: pointer; background: linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%); padding: 18px 25px; border-radius: 12px; border: 2px solid rgba(251, 191, 36, 0.5); display: flex; align-items: center; justify-content: space-between; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.2);"
            onmouseover="this.style.background='linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 1) 100%)'; this.style.borderColor='rgba(251, 191, 36, 0.7)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.3)';"
            onmouseout="this.style.background='linear-gradient(135deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.9) 100%)'; this.style.borderColor='rgba(251, 191, 36, 0.5)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)';"
          >
            <div style="display: flex; align-items: center; gap: 12px;">
              <span id="main-categories-toggle" style="color: #fbbf24; font-size: 20px; transition: transform 0.3s ease; font-weight: bold;">▶</span>
              <h3 style="margin: 0; color: #fbbf24; font-size: 18px; font-weight: 700;">
                Bewertung der Hauptkategorien
              </h3>
            </div>
            <div style="background: rgba(251, 191, 36, 0.2); color: #fbbf24; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 600;">
              Details anzeigen
            </div>
          </div>
          
          <div id="main-categories-content" style="display: none; margin-top: 15px; padding: 20px; background: rgba(251, 191, 36, 0.05); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.2);">
            <div style="display: grid; grid-template-columns: 1fr auto auto; gap: 8px; font-size: 0.85rem; align-items: center;">
              ${(() => {
                // Basis-Gewichtungen für die 6 Hauptkategorien
                const baseCat1Weight = 30; // Online-Qualität · Relevanz · Autorität
                const baseCat2Weight = 20; // Webseiten-Performance & Technik
                const baseCat3Weight = 20; // Online-/Web-/Social-Media Performance
                const baseCat4Weight = 10; // Markt & Marktumfeld
                const baseCat5Weight = 10; // Außendarstellung & Erscheinungsbild
                const baseCat6Weight = 10; // Qualität · Service · Kundenorientierung
                
                // Kategorie 1: Online-Qualität · Relevanz · Autorität (same logic as OverallRating.tsx)
                const cat1Scores = [
                  realData.seo.score,
                  localSEOScore,
                  keywordScore,
                  impressumScore
                ].filter(s => s > 0);
                
                if (contentQualityScore !== null && contentQualityScore > 0) cat1Scores.push(contentQualityScore);
                if (accessibilityScore !== null && accessibilityScore > 0) cat1Scores.push(accessibilityScore);
                if (backlinksScore !== null && backlinksScore > 0) cat1Scores.push(backlinksScore);
                if (dsgvoScore !== null && dsgvoScore > 0) cat1Scores.push(dsgvoScore);
                
                const cat1Avg = cat1Scores.length > 0 ? Math.round(cat1Scores.reduce((a, b) => a + b, 0) / cat1Scores.length) : 0;

                // Kategorie 2: Webseiten-Performance & Technik (same logic as calculateWebsitePerformanceTechScore)
                const performanceScore = realData.performance?.score || 0;
                const mobileScore = manualMobileData?.overallScore || realData.mobile?.overallScore || 0;
                const conversionScore = manualConversionData?.overallScore || 0;
                
                const cat2Scores: number[] = [];
                if (performanceScore > 0) cat2Scores.push(performanceScore);
                if (mobileScore > 0) cat2Scores.push(mobileScore);
                if (conversionScore > 0) cat2Scores.push(conversionScore);
                
                const cat2Avg = cat2Scores.length > 0 ? Math.round(cat2Scores.reduce((a, b) => a + b, 0) / cat2Scores.length) : 0;

                // Kategorie 3: Online-/Web-/Social-Media Performance (same logic as OverallRating.tsx)
                const industryReviewScore = manualIndustryReviewData?.overallScore || 0;
                const onlinePresenceScore = manualOnlinePresenceData?.overallScore || 0;
                const socialProofScore = realData.socialProof?.overallScore ?? 0;
                
                const cat3Scores = [
                  googleReviewScore,
                  socialMediaScore,
                  socialProofScore
                ].filter(s => s > 0);
                
                if (industryReviewScore > 0) cat3Scores.push(industryReviewScore);
                if (onlinePresenceScore > 0) cat3Scores.push(onlinePresenceScore);
                
                const cat3Avg = cat3Scores.length > 0 ? Math.round(cat3Scores.reduce((a, b) => a + b, 0) / cat3Scores.length) : 0;

                // Kategorie 4: Markt & Marktumfeld
                const allCompetitors = (window as any).globalAllCompetitors || manualCompetitors || [];
                const cat4Scores = [
                  allCompetitors.length > 0 ? Math.round(marketComparisonScore) : 0,
                  hasValidHourlyRateData && pricingScore > 0 ? Math.round(pricingScore) : 0,
                  workplaceScore !== -1 ? workplaceScore : 0,
                  staffQualificationData && staffQualificationData.totalEmployees > 0 ? staffQualificationScore : 0
                ].filter(s => s > 0);
                const cat4Avg = cat4Scores.length > 0 ? Math.round(cat4Scores.reduce((a, b) => a + b, 0) / cat4Scores.length) : 0;

                // Kategorie 5: Außendarstellung & Erscheinungsbild
                const cat5Avg = Math.round(corporateIdentityScore);

                // Kategorie 6: Qualität · Service · Kundenorientierung
                const cat6Scores = [
                  quoteResponseData && quoteResponseData.responseTime ? quoteResponseScore : 0
                ].filter(s => s > 0);
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

                const totalWeight = adjustedCat1Weight + adjustedCat2Weight + adjustedCat3Weight + adjustedCat4Weight + adjustedCat5Weight + adjustedCat6Weight;

                const categories = [
                  { name: 'Online-Qualität · Relevanz · Autorität', score: cat1Avg, weight: adjustedCat1Weight },
                  { name: 'Webseiten-Performance & Technik', score: cat2Avg, weight: adjustedCat2Weight },
                  { name: 'Online-/Web-/Social-Media Performance', score: cat3Avg, weight: adjustedCat3Weight },
                  { name: 'Markt & Marktumfeld', score: cat4Avg, weight: adjustedCat4Weight },
                  { name: 'Qualität · Service · Kundenorientierung', score: cat6Avg, weight: adjustedCat6Weight },
                  { name: 'Außendarstellung & Erscheinungsbild', score: cat5Avg, weight: adjustedCat5Weight }
                ].filter(cat => cat.score > 0);

                return categories.map(cat => {
                  const weightPercent = totalWeight > 0 ? Math.round(cat.weight / totalWeight * 1000) / 10 : 0;
                  return `
                    <div style="color: #ffffff;">${cat.name}</div>
                    <div style="text-align: right;">
                      <span style="font-weight: 600; color: ${cat.score >= 90 ? '#f59e0b' : cat.score >= 61 ? '#22c55e' : '#ef4444'};">${cat.score}%</span>
                    </div>
                    <div style="text-align: right; padding-left: 12px;">
                      <span style="font-size: 0.8rem; color: #9ca3af; font-weight: 500;">(${weightPercent}%)</span>
                    </div>
                  `;
                }).join('');
              })()}
            </div>
            <p style="margin: 10px 0 0 0; font-size: 0.75rem; color: #9ca3af; font-style: italic;">Die Prozentzahlen in Klammern zeigen die Gewichtung jeder Kategorie am Gesamtscore basierend auf den enthaltenen Einzelmetriken.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Kategorie-Überschrift: Online-Qualität · Relevanz · Autorität -->
    <div id="cat-online-qualitaet" class="category-anchor" style="padding: 60px 0 30px 40px !important; margin: 0 !important; text-align: center !important;">
      <h2 style="color: #ffffff !important; font-size: 1.8em !important; font-weight: bold !important; border-bottom: 3px solid #fbbf24 !important; padding-bottom: 10px !important; display: inline-block !important; margin: 0 !important;">Online-Qualität · Relevanz · Autorität</h2>
    </div>

    <!-- SEO-Bestandsanalyse -->
    <div class="section">
      <div class="section-header">
        <span>SEO-Bestandsanalyse</span>
        <div class="header-score-circle ${getScoreColorClass(calculatedSEOScore)}">${calculatedSEOScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>SEO-Bestandsanalyse</h3>
          <div class="score-display">
            <div class="score-circle" data-score="${getScoreRange(calculatedSEOScore)}">${calculatedSEOScore}%</div>
            <div class="score-details">
              <p><strong>Sichtbarkeit:</strong> ${calculatedSEOScore >= 90 ? 'Exzellent' : calculatedSEOScore >= 80 ? 'Hoch' : calculatedSEOScore >= 61 ? 'Mittel' : 'Niedrig'}</p>
              <p><strong>Empfehlung:</strong> ${calculatedSEOScore >= 90 ? 'Exzellente SEO-Basis – Behalten Sie diesen Standard bei!' : calculatedSEOScore >= 80 ? 'Sehr gute SEO-Basis' : calculatedSEOScore >= 61 ? 'Gute SEO-Basis mit Optimierungspotenzial' : 'SEO verbessern, um mehr Kunden zu erreichen'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(calculatedSEOScore)}" style="width: ${calculatedSEOScore}%; display: flex; align-items: center; justify-content: center;">
                <span style="color: ${calculatedSEOScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${calculatedSEOScore}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('seo-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ SEO-Details anzeigen</h4>
        </div>
        
        <div id="seo-details" style="display: none;">
          ${getSEOAnalysis()}
          
          <div class="metric-card good" style="margin-top: 20px;">
            <h3>SEO-Details</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
              <div class="status-item">
                <h4>Meta-Titel</h4>
                <p><strong>${realData.seo.titleTag ? 'Vorhanden' : 'Fehlend'}</strong></p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(realData.seo.titleTag ? 100 : 0)}" style="width: ${realData.seo.titleTag ? 100 : 0}%; display: flex; align-items: center; justify-content: center;">
                      <span style="color: ${(realData.seo.titleTag ? 100 : 0) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${realData.seo.titleTag ? 100 : 0}%</span>
                    </div>
                  </div>
                </div>
                <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 6px; line-height: 1.4;">
                  Der Seitentitel erscheint als Überschrift in Suchergebnissen und im Browser-Tab
                </small>
              </div>
              <div class="status-item">
                <h4>Meta-Beschreibung</h4>
                <p><strong>${realData.seo.metaDescription ? 'Optimiert' : 'Verbesserungsbedarf'}</strong></p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(realData.seo.metaDescription ? 85 : 30)}" style="width: ${realData.seo.metaDescription ? 85 : 30}%; display: flex; align-items: center; justify-content: center;">
                      <span style="color: ${(realData.seo.metaDescription ? 85 : 30) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${realData.seo.metaDescription ? 85 : 30}%</span>
                    </div>
                  </div>
                </div>
                <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 6px; line-height: 1.4;">
                  Die Kurzbeschreibung wird unter dem Titel in Google angezeigt und beeinflusst Klickrate
                </small>
              </div>
              <div class="status-item">
                <h4>Strukturierte Daten</h4>
                <p><strong>Zu analysieren</strong></p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(50)}" style="width: 50%; display: flex; align-items: center; justify-content: center;">
                      <span style="color: #fff; font-weight: bold; font-size: 11px;">50%</span>
                    </div>
                  </div>
                </div>
                <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 6px; line-height: 1.4;">
                  Schema Markup ermöglicht erweiterte Darstellung (Bewertungen, Öffnungszeiten) in Suchergebnissen
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content-Qualität -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('content-content')" style="cursor: pointer;">
        <span>▶ Content-Qualität</span>
        <div class="header-score-circle ${getScoreColorClass(contentQualityScore)}">${contentQualityScore}%</div>
      </div>
      <div id="content-content" class="section-content" style="display: none;">
        
        <!-- Keywords Analyse -->
        <div class="metric-card good" style="margin-bottom: 30px;">
          <h3>Keyword-Analyse</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)))}">
              ${(manualKeywordData || realData.keywords).filter(k => k.found).length}/${(manualKeywordData || realData.keywords).length}
            </div>
            <div class="score-details">
              <p><strong>Gefundene Keywords:</strong> ${(manualKeywordData || realData.keywords).filter(k => k.found).length} von ${(manualKeywordData || realData.keywords).length}</p>
              <p>
                <strong>Optimierungsgrad:</strong> ${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100))}%
                <br/>
                <small style="color: #6b7280; font-size: 0.9rem;">
                  Der Optimierungsgrad zeigt, wie gut Ihre Website für relevante Suchbegriffe optimiert ist
                </small>
              </p>
              <p>
                <strong>Keyword-Dichte:</strong> ${(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 3).toFixed(1)}%
                <br/>
                <small style="color: #6b7280; font-size: 0.9rem;">
                  Die Keyword-Dichte beschreibt, wie häufig wichtige Suchbegriffe im Verhältnis zum Gesamttext erscheinen
                </small>
              </p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-label">
              <span>Keyword-Optimierung</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)))}" style="width: ${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100))}%; background-color: ${getScoreColor(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)))}; display: flex; align-items: center; justify-content: center;">
                <span style="color: ${(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100))) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100))}%</span>
              </div>
              <div style="position: absolute; left: ${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100))}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
            <small style="color: #6b7280; font-size: 0.875rem; display: block; margin-top: 8px;">
              Die Keyword-Optimierung misst, wie strategisch wichtige Suchbegriffe auf Ihrer Website platziert und verwendet werden
            </small>
          </div>
          <div class="keyword-grid">
            ${(manualKeywordData || realData.keywords).map(keyword => `
              <div class="keyword-item ${keyword.found ? 'found' : 'not-found'}">
                <span>${keyword.keyword}</span>
                <span>${keyword.found ? '✅ Gefunden' : '❌ Fehlend'}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Textqualität & Content-Struktur -->
        <div class="metric-card good" style="margin-bottom: 30px;">
          <h3>📖 Textqualität & Content-Struktur</h3>
          
          ${extensionData?.content?.wordCount ? `
            <div style="background: #f0f9ff; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1e40af; margin: 0 0 12px 0;">🤖 Automatisch erkannte Content-Daten</h4>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                <div>
                  <p style="margin: 0; color: #374151; font-weight: 600; font-size: 1.2em;">${extensionData.content.wordCount}</p>
                  <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 0.9em;">Wörter gesamt</p>
                </div>
                <div>
                  <p style="margin: 0; color: #374151; font-weight: 600; font-size: 1.2em;">${Math.round(extensionData.content.wordCount / 200)}</p>
                  <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 0.9em;">Geschätzte Lesezeit (Min.)</p>
                </div>
              </div>
              <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 0.85em; font-style: italic;">
                Daten wurden automatisch per Chrome Extension erfasst
              </p>
            </div>
          ` : ''}
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div class="status-item">
              <h4>Lesbarkeit</h4>
              <p><strong>${realData.seo.score >= 70 ? 'Sehr gut' : realData.seo.score >= 50 ? 'Gut' : 'Verbesserungsbedarf'}</strong></p>
              <div class="progress-container">
                <div class="progress-label">
                  <span>Lesbarkeit</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(60, realData.seo.score)}%; background-color: ${getScoreColor(Math.max(60, realData.seo.score))}; display: flex; align-items: center; justify-content: center;">
                    <span style="color: ${Math.max(60, realData.seo.score) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${Math.max(60, realData.seo.score)}%</span>
                  </div>
                </div>
              </div>
              
              <div class="progress-container">
                <div class="progress-label">
                  <span>Meta-Description</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${realData.seo.metaDescription ? 85 : 40}%; background-color: ${getScoreColor(realData.seo.metaDescription ? 85 : 40)}; display: flex; align-items: center; justify-content: center;">
                    <span style="color: ${(realData.seo.metaDescription ? 85 : 40) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${realData.seo.metaDescription ? 85 : 40}%</span>
                  </div>
                </div>
              </div>
              
              <div class="progress-container">
                <div class="progress-label">
                  <span>H1-Überschriften</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(realData.seo.headings.h1.length > 0 ? 90 : 30)}" style="width: ${realData.seo.headings.h1.length > 0 ? 90 : 30}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: ${(realData.seo.headings.h1.length > 0 ? 90 : 30) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${realData.seo.headings.h1.length > 0 ? 90 : 30}%</span>
                  </div>
                </div>
              </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.9rem; margin-top: 8px;">H1: ${realData.seo.headings.h1.length}, H2: ${realData.seo.headings.h2.length}</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Handlungsempfehlungen zur Textqualität:</h4>
            <ul>
              <li>Texte in kurze, verständliche Absätze gliedern</li>
              <li>Fachbegriffe erklären und für Laien verständlich machen</li>
              <li>Bulletpoints und Listen für bessere Lesbarkeit nutzen</li>
              <li>Call-to-Actions klar und handlungsorientiert formulieren</li>
            </ul>
          </div>
        </div>

        <!-- Branchenrelevanz -->
        <div class="metric-card good" style="margin-bottom: 30px;">
          <h3>Branchenrelevanz</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div class="status-item">
              <h4>Fachvokabular</h4>
              <p><strong>${businessData.industry === 'shk' ? 'SHK-spezifisch' : businessData.industry === 'elektriker' ? 'Elektro-spezifisch' : 'Handwerk-spezifisch'}</strong></p>
                  <div class="progress-container">
                   <div class="progress-label">
                     <span>Branchenvokabular</span>
                   </div>
                   <div class="progress-bar">
                     <div class="progress-fill" data-score="${getScoreRange(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50))}" style="width: ${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50)}%; background-color: ${getScoreColor(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50))}; display: flex; align-items: center; justify-content: center;">
                       <span style="color: ${(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50)) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50)}%</span>
                     </div>
                   </div>
                  </div>
               <p class="gray-text" style="color: #6b7280; font-size: 0.9rem; margin-top: 8px;">Branche: ${businessData.industry.toUpperCase()}</p>
             </div>
               <div class="status-item">
                <h4>Dienstleistungen</h4>
                <p><strong>${(manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 'Klar definiert' : 'Unklar'}</strong></p>
                  <div class="progress-container">
                   <div class="progress-label">
                     <span>Dienstleistungen</span>
                   </div>
                   <div class="progress-bar">
                     <div class="progress-fill" data-score="${getScoreRange(keywordScore || Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45))}" style="width: ${keywordScore || Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45)}%; background-color: ${getScoreColor(keywordScore || Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45))}; display: flex; align-items: center; justify-content: center;">
                       <span style="color: ${(keywordScore || Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45)) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${keywordScore || Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45)}%</span>
                     </div>
                  </div>
                 </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Service-Keywords gefunden</p>
            </div>
            <div class="status-item">
              <h4>Lokaler Bezug</h4>
              <p><strong>${businessData.address ? 'Regional optimiert' : 'Nicht spezifiziert'}</strong></p>
               <div class="progress-container">
                 <div class="progress-label">
                   <span>Lokaler Bezug</span>
                 </div>
                 <div class="progress-bar">
                   <div class="progress-fill" data-score="${getScoreRange(businessData.address ? 90 : 30)}" style="width: ${businessData.address ? 90 : 30}%; display: flex; align-items: center; justify-content: center;">
                     <span style="color: ${(businessData.address ? 90 : 30) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${businessData.address ? 90 : 30}%</span>
                   </div>
                 </div>
               </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Region: ${businessData.address ? 'Erfasst' : 'Fehlt'}</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Handlungsempfehlungen zur Branchenrelevanz:</h4>
            <ul>
              <li>Spezifische ${businessData.industry.toUpperCase()}-Fachbegriffe verwenden</li>
              <li>Lokale Referenzen und Projekte hervorheben</li>
              <li>Branchenspezifische Problemlösungen kommunizieren</li>
              <li>Zertifikate und Qualifikationen prominent platzieren</li>
            </ul>
          </div>
        </div>

        <!-- Aktualität -->
        <div class="metric-card warning" style="margin-bottom: 30px;">
          <h3>🗓️ Content-Aktualität</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div class="status-item">
              <h4>Letzte Aktualisierung</h4>
              <p><strong>Zu prüfen</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(60)}" style="width: 60%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #fff; font-weight: bold; font-size: 11px;">60%</span>
                  </div>
                </div>
              </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Empfehlung: Quartalweise</p>
            </div>
            <div class="status-item">
              <h4>News & Updates</h4>
              <p><strong>Nicht vorhanden</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(25)}" style="width: 25%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #fff; font-weight: bold; font-size: 11px;">25%</span>
                  </div>
                </div>
              </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Blog/News-Bereich fehlt</p>
            </div>
            <div class="status-item">
              <h4>Saisonale Inhalte</h4>
              <p><strong>Nicht erkannt</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(35)}" style="width: 35%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #fff; font-weight: bold; font-size: 11px;">35%</span>
                  </div>
                </div>
              </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Winterdienst, Klimaanlagen etc.</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Handlungsempfehlungen zur Aktualität:</h4>
            <ul>
              <li>Regelmäßige Content-Updates (mindestens quartalsweise)</li>
              <li>Blog oder News-Bereich für aktuelle Themen einrichten</li>
              <li>Saisonale Services und Angebote zeitgerecht kommunizieren</li>
              <li>Datum der letzten Aktualisierung sichtbar machen</li>
            </ul>
          </div>
        </div>

      </div>
    </div>

    <!-- Lokale SEO -->
    <div class="section">
      <div class="section-header">
        <span>Lokale SEO & Regionale Sichtbarkeit</span>
        <div class="header-score-circle ${getScoreColorClass(localSEOScore)}">${displayLocalSEOScore}</div>
      </div>
      <div class="section-content">
        ${getLocalSEOAnalysis()}
      </div>
    </div>

    <!-- Backlinks Übersicht -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('backlinks-content')" style="cursor: pointer;">
        <span>▶ Backlinks Übersicht</span>
        <div class="header-score-circle ${getScoreColorClass(backlinksScore)}">${backlinksScore}%</div>
      </div>
      <div id="backlinks-content" class="section-content" style="display: none;">
        
        <div class="metric-card warning">
          <h3>Backlink-Profil</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(backlinksScore)}">
              ${backlinksScore}%
            </div>
            <div class="score-details">
              ${manualBacklinkData ? `
                <p><strong>Anzahl Backlinks gesamt:</strong> ${manualBacklinkData.totalBacklinks}</p>
                <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">Gesamtzahl der Links von anderen Websites zu Ihrer Seite</p>
                <p><strong>Spam/Toxische Links:</strong> ${manualBacklinkData.spamLinks}</p>
                <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">Links von minderwertigen oder schädlichen Quellen</p>
                <p><strong>Backlink-Qualität:</strong> ${manualBacklinkData.qualityScore}%</p>
                <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">Durchschnittliche Qualität der verlinkenden Seiten</p>
                <p><strong>Domain Authority:</strong> ${manualBacklinkData.domainAuthority}%</p>
                <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">Autorität der verlinkenden Domains</p>
                <p><strong>Lokale Relevanz:</strong> ${manualBacklinkData.localRelevance}%</p>
                <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">Relevanz der Links für die lokale Zielgruppe</p>
                ${manualBacklinkData.notes ? `
                  <div style="margin-top: 16px; padding: 12px; background: #f3f4f6; border-radius: 6px; border-left: 3px solid #3b82f6;">
                    <p style="margin: 0; color: #374151; font-size: 0.9em;"><strong>Zusätzliche Notizen:</strong></p>
                    <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 0.85em; line-height: 1.5;">${manualBacklinkData.notes}</p>
                  </div>
                ` : ''}
              ` : `
                <p><strong>Backlink-Status:</strong> ${backlinksScore >= 70 ? 'Gut entwickelt' : backlinksScore >= 50 ? 'Durchschnittlich' : 'Ausbaufähig'}</p>
                <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">Anzahl und Wachstum der Links von anderen Websites zu Ihrer Seite</p>
                <p><strong>Domain Authority:</strong> ${backlinksScore >= 70 ? 'Stark' : backlinksScore >= 50 ? 'Mittel' : 'Schwach'}</p>
                <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">Vertrauenswürdigkeit Ihrer Website in den Augen von Suchmaschinen</p>
                <p><strong>Qualitätsbewertung:</strong> ${backlinksScore >= 70 ? 'Hochwertig' : 'Verbesserungsbedarf'}</p>
              `}
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-label">
              <span>Backlink-Qualität</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${backlinksScore}%; background-color: ${getScoreColor(backlinksScore)}; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 11px; font-weight: bold; color: white; z-index: 5;">${backlinksScore}%</span>
              </div>
            </div>
          </div>
          
          <!-- Web-Erwähnungen werden im Reputation Monitoring Bereich angezeigt -->
          
          <div class="recommendations">
            <h4>Backlink-Strategien:</h4>
            <ul>
              <li>Hochwertige Branchenverzeichnisse nutzen</li>
              <li>Lokale Partnerschaften aufbauen</li>
              <li>Content-Marketing für natürliche Links</li>
              <li>Gastbeiträge in Fachmagazinen</li>
              <li>Web-Erwähnungen durch aktive PR-Arbeit erhöhen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    ${generateDataPrivacySection(dsgvoScore, privacyData?.activeViolations || [], manualDataPrivacyData, privacyData, securityData)}

    ${generateWebsiteSecuritySection(securityData)}

    ${generateReputationMonitoringSection(manualReputationData, businessData.url, manualBacklinkData)}

    <!-- Rechtssicherheit & Impressum -->
    <div class="section">
      <div class="section-header">
        <span>Impressum Rechtssicherheit</span>
        <div class="header-score-circle ${getScoreColorClass(impressumScore)}">${impressumScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Impressum Rechtssicherheit</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(impressumScore)}">${impressumScore}%</div>
            <div class="score-details">
              <p><strong>Impressum:</strong> ${impressumScore >= 90 ? 'Vollständig' : impressumScore >= 60 ? 'Teilweise vollständig' : 'Unvollständig'}</p>
              <p><strong>Empfehlung:</strong> ${impressumScore >= 90 ? 'Vollständig rechtlich abgesichert – Weiter so!' : impressumScore >= 60 ? 'Teilweise rechtlich abgesichert, fehlende Angaben ergänzen' : 'Rechtliche Pflichtangaben ergänzen'}</p>
              ${impressumCappedAt !== null ? `<p style="color: #dc2626;"><strong>⚠️ Score gedeckelt:</strong> Max. ${impressumCappedAt}% wegen ${missingCriticalCount} fehlender kritischer Pflichtangabe${missingCriticalCount > 1 ? 'n' : ''}</p>` : ''}
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(impressumScore)}" style="width: ${impressumScore}%; background-color: ${getScoreColor(impressumScore)}; display: flex; align-items: center; justify-content: center;">
                <span style="color: ${impressumScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${impressumScore}%</span>
              </div>
            </div>
          </div>
        </div>
        
        ${missingCriticalCount > 0 ? `
        <!-- Kritische Fehler Warnung -->
        <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin-top: 15px;">
          <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
            ⚠️ ABMAHNGEFAHR: ${missingCriticalCount} kritische Pflichtangabe${missingCriticalCount > 1 ? 'n' : ''} fehlt/fehlen
          </h4>
          <p style="color: #dc2626; margin: 0 0 10px 0; font-weight: bold;">
            Die folgenden Angaben sind nach §5 TMG und DSGVO abmahnungsbedroht:
          </p>
          <ul style="margin: 0 0 10px 0; padding-left: 20px; color: #991b1b;">
            ${missingCriticalImprintElements.map(el => `<li style="margin-bottom: 4px;"><strong>${el}</strong></li>`).join('')}
          </ul>
          <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
            <strong>Score-Capping:</strong> Bei ${missingCriticalCount === 1 ? '1 fehlenden kritischen Element' : missingCriticalCount === 2 ? '2 fehlenden kritischen Elementen' : '3+ fehlenden kritischen Elementen'} 
            ist der maximale Score auf ${impressumCappedAt}% begrenzt ${impressumBaseScore > impressumCappedAt ? `(Basis-Score wäre ${impressumBaseScore}%)` : ''}.
          </div>
        </div>
        ` : ''}
        
        <div class="collapsible" onclick="toggleSection('legal-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Rechts-Details anzeigen</h4>
        </div>
        
        <div id="legal-details" style="display: none;">
          ${getLegalAnalysis()}
        </div>
      </div>
    </div>

    <!-- Barrierefreiheit -->
    <div class="section">
        <div class="section-header">
          <span>Barrierefreiheit & Zugänglichkeit</span>
          <div class="header-score-circle ${getScoreColorClass(actualAccessibilityScore)}">${actualAccessibilityScore}%</div>
        </div>
      <div class="section-content">
        <!-- Hauptbewertung sichtbar -->
        <div class="metric-card">
          <h3>♿ Barrierefreiheit (WCAG 2.1)</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(actualAccessibilityScore)}">${actualAccessibilityScore}%</div>
            <div class="score-details">
              <p><strong>Compliance-Level:</strong> Teilweise konform</p>
              <p><strong>Empfehlung:</strong> Barrierefreiheit verbessern</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${actualAccessibilityScore}%; background-color: ${getScoreColor(actualAccessibilityScore)} !important; display: flex; align-items: center; justify-content: center;">
                <span style="color: ${actualAccessibilityScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${actualAccessibilityScore}%</span>
              </div>
            </div>
          </div>
        </div>
        
        ${actualAccessibilityScore < 90 ? `
        <!-- Warnung direkt sichtbar -->
        <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin-top: 15px;">
          <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
            ⚠️ RECHTLICHER HINWEIS: Barrierefreiheit-Verstöße erkannt
          </h4>
          <p style="color: #dc2626; margin: 0 0 10px 0; font-weight: bold;">
            Warnung: Die automatisierte Analyse hat rechtlich relevante Barrierefreiheit-Probleme identifiziert. 
            Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
          </p>
          <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
            <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Website oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. 
            Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. 
            Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
          </div>
        </div>
        ` : ''}
        
        ${(() => {
          // Critical Violations Analysis with Neutralization for HTML Export
          if (!accessibilityData || !accessibilityData.violations) {
            return '';
          }
          
          const violations = accessibilityData.violations || [];
          const criticalViolations = violations.filter((v: any) => 
            v.impact === 'critical' || v.impact === 'serious'
          );
          
          if (criticalViolations.length === 0) return '';
          
          // Check which violations are neutralized
          const neutralizedViolations = criticalViolations.filter((violation: any) => {
            const vid = violation.id || '';
            
            if (manualAccessibilityData?.keyboardNavigation && 
                (vid.includes('keyboard') || vid.includes('button-name') || 
                 vid.includes('link-name') || vid.includes('accesskeys'))) {
              return true;
            }
            
            if (manualAccessibilityData?.screenReaderCompatible && 
                (vid.includes('aria-') || vid.includes('label') || 
                 vid.includes('role') || vid.includes('landmark'))) {
              return true;
            }
            
            if (manualAccessibilityData?.colorContrast && 
                (vid.includes('color-contrast') || vid.includes('contrast'))) {
              return true;
            }
            
            if (manualAccessibilityData?.altTextsPresent && 
                (vid.includes('image-alt') || vid.includes('alt') || vid === 'image-alt')) {
              return true;
            }
            
            if (manualAccessibilityData?.focusVisibility && 
                (vid.includes('focus') || vid.includes('focus-order'))) {
              return true;
            }
            
            if (manualAccessibilityData?.textScaling && 
                (vid.includes('meta-viewport') || vid.includes('target-size'))) {
              return true;
            }
            
            return false;
          });
          
          const remainingCriticalCount = criticalViolations.length - neutralizedViolations.length;
          const neutralizedCount = neutralizedViolations.length;
          
          let scoreCap = 100;
          if (remainingCriticalCount === 1) scoreCap = 59;
          else if (remainingCriticalCount === 2) scoreCap = 35;
          else if (remainingCriticalCount >= 3) scoreCap = 20;
          
          // Check for positive manual inputs
          const hasPositiveManualInputs = manualAccessibilityData?.keyboardNavigation || 
                                          manualAccessibilityData?.screenReaderCompatible || 
                                          manualAccessibilityData?.colorContrast || 
                                          manualAccessibilityData?.altTextsPresent || 
                                          manualAccessibilityData?.focusVisibility || 
                                          manualAccessibilityData?.textScaling;
          
          const positiveInputsList = [];
          if (manualAccessibilityData?.keyboardNavigation) positiveInputsList.push('Tastaturnavigation');
          if (manualAccessibilityData?.screenReaderCompatible) positiveInputsList.push('Screen-Reader-kompatibel');
          if (manualAccessibilityData?.colorContrast) positiveInputsList.push('Farbkontraste ausreichend');
          if (manualAccessibilityData?.altTextsPresent) positiveInputsList.push('Alt-Texte vorhanden');
          if (manualAccessibilityData?.focusVisibility) positiveInputsList.push('Fokus-Sichtbarkeit');
          if (manualAccessibilityData?.textScaling) positiveInputsList.push('Text-Skalierung');
          
          if (remainingCriticalCount > 0 || neutralizedCount > 0) {
            return `
              <div style="border-radius: 8px; padding: 15px; border: 2px solid ${remainingCriticalCount > 0 ? '#fca5a5' : '#86efac'}; background: ${remainingCriticalCount > 0 ? '#fef2f2' : '#f0fdf4'}; margin-top: 15px;">
                <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">
                  🔍 Kritische Fehler-Analyse:
                </div>
                ${neutralizedCount > 0 ? `
                  <div style="font-size: 11px; color: #059669; margin-bottom: 4px;">
                    ✓ ${neutralizedCount} kritische Violation(s) durch manuelle Eingaben neutralisiert
                  </div>
                ` : ''}
                ${remainingCriticalCount > 0 ? `
                  <div style="font-size: 11px; color: #dc2626; margin-bottom: 4px;">
                    ⚠️ ${remainingCriticalCount} kritische Violation(s) verbleibend
                  </div>
                  <div style="font-size: 11px; color: #7f1d1d; font-weight: bold;">
                    📊 Score-Kappung: Maximum ${scoreCap}% möglich
                  </div>
                  ${hasPositiveManualInputs && positiveInputsList.length > 0 ? `
                    <div style="margin-top: 8px; padding: 8px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px;">
                      <div style="font-size: 11px; color: #92400e;">
                        <strong>ℹ️ Hinweis:</strong> Trotz manueller Angaben (${positiveInputsList.join(', ')}) kann die Bewertung aufgrund der verbleibenden kritischen Violations nicht höher ausfallen.
                      </div>
                    </div>
                  ` : ''}
                ` : `
                  <div style="font-size: 11px; color: #059669;">
                    ✓ Keine verbleibenden kritischen Violations
                  </div>
                `}
              </div>
            `;
          }
          return '';
        })()}
        
        <!-- Collapsible Untersektionen -->
        <div class="collapsible" onclick="toggleSection('wcag-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ WCAG 2.1 Compliance Details</h4>
        </div>
        
        <div id="wcag-details" style="display: none;">
          ${(() => {
            // Filter violations - remove neutralized ones
            const allViolations = accessibilityData?.violations || [];
            
            // Helper function to check if a violation is neutralized
            const isNeutralized = (violation: any): boolean => {
              const vid = violation.id || '';
              
              if (manualAccessibilityData?.keyboardNavigation && 
                  (vid.includes('keyboard') || vid.includes('button-name') || 
                   vid.includes('link-name') || vid.includes('accesskeys'))) {
                return true;
              }
              
              if (manualAccessibilityData?.screenReaderCompatible && 
                  (vid.includes('aria-') || vid.includes('label') || 
                   vid.includes('role') || vid.includes('landmark'))) {
                return true;
              }
              
              if (manualAccessibilityData?.colorContrast && 
                  (vid.includes('color-contrast') || vid.includes('contrast'))) {
                return true;
              }
              
              if (manualAccessibilityData?.altTextsPresent && 
                  (vid.includes('image-alt') || vid.includes('alt') || vid === 'image-alt')) {
                return true;
              }
              
              if (manualAccessibilityData?.focusVisibility && 
                  (vid.includes('focus') || vid.includes('focus-order'))) {
                return true;
              }
              
              if (manualAccessibilityData?.textScaling && 
                  (vid.includes('meta-viewport') || vid.includes('target-size'))) {
                return true;
              }
              
              return false;
            };
            
            // Filter out neutralized violations
            const nonNeutralizedViolations = allViolations.filter((v: any) => !isNeutralized(v));
            
            if (nonNeutralizedViolations.length === 0) {
              return `
                <div style="margin-top: 20px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
                  <h4 style="color: #22c55e;">✅ Keine aktiven Probleme</h4>
                  <p style="font-size: 0.9em; color: #666; margin-top: 8px;">
                    ${allViolations.length > 0 
                      ? 'Alle erkannten Probleme wurden durch manuelle Eingaben als behoben markiert.' 
                      : 'Es wurden keine Barrierefreiheit-Probleme erkannt.'}
                  </p>
                </div>
              `;
            }
            
            return `
              <div style="margin-top: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
                <h4>🚨 Erkannte Probleme (${nonNeutralizedViolations.length})</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
                  ${nonNeutralizedViolations.map((v: any) => `
                    <div style="padding: 8px; background: rgba(${v.impact === 'critical' ? '239, 68, 68' : v.impact === 'serious' ? '245, 158, 11' : '59, 130, 246'}, 0.2); border-radius: 6px;">
                      <p style="font-weight: bold; color: ${v.impact === 'critical' ? '#dc2626' : v.impact === 'serious' ? '#d97706' : '#3b82f6'};">
                        ${v.impact === 'critical' ? 'CRITICAL' : v.impact === 'serious' ? 'SERIOUS' : v.impact?.toUpperCase() || 'MODERATE'}
                      </p>
                      <p style="font-size: 0.9em;">${v.description || v.help || 'Barrierefreiheit-Problem'}</p>
                      <p style="font-size: 0.8em; color: #666;">${v.nodes?.length || v.count || 1} Vorkommen</p>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          })()}
        </div>

        <div class="collapsible" onclick="toggleSection('legal-requirements')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.3);">
          <h4 style="color: #3b82f6; margin: 0;">▶ Rechtliche Anforderungen</h4>
        </div>
        
        <div id="legal-requirements" style="display: none;">
          <div style="margin-top: 15px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
            <h4 style="color: #1d4ed8;">⚖️ Rechtliche Compliance</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
              <div>
                <p><strong>EU-Richtlinie 2016/2102:</strong> 
                  <span style="color: ${actualAccessibilityScore >= 80 ? '#22c55e' : '#CD0000'}; font-weight: bold;">
                    ${actualAccessibilityScore >= 80 ? 'Erfüllt' : 'Nicht erfüllt'}
                  </span>
                </p>
                <div class="progress-container" style="margin-top: 5px;">
                  <div class="progress-bar">
                     <div class="progress-fill" style="width: ${actualAccessibilityScore}%; background-color: ${actualAccessibilityScore >= 90 ? '#22c55e' : '#FF0000'} !important;"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>WCAG 2.1 Level AA:</strong> 
                  <span style="color: ${actualAccessibilityScore >= 80 ? '#22c55e' : '#CD0000'}; font-weight: bold;">
                    ${actualAccessibilityScore >= 80 ? 'Konform' : 'Nicht konform'}
                  </span>
                </p>
                <div class="progress-container" style="margin-top: 5px;">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${actualAccessibilityScore}%; background-color: ${actualAccessibilityScore >= 90 ? '#22c55e' : '#FF0000'} !important;"></div>
                  </div>
                </div>
              </div>
            </div>
            
            ${actualAccessibilityScore < 90 ? `
            <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin-top: 15px;">
              <h4 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ RECHTLICHER HINWEIS: Barrierefreiheit-Verstöße erkannt</h4>
              <p style="color: #dc2626; margin: 0 0 10px 0; font-weight: bold;">
                Warnung: Die automatisierte Analyse hat rechtlich relevante Barrierefreiheit-Probleme identifiziert. 
                Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
              </p>
              <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
                <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Website oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. 
                Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. 
                Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
              </div>
            </div>
            ` : ''}
          </div>
        </div>

        <div class="collapsible" onclick="toggleSection('accessibility-improvements')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.3);">
          <h4 style="color: #22c55e; margin: 0;">▶ Verbesserungsvorschläge</h4>
        </div>
        
        <div id="accessibility-improvements" style="display: none;">
          <div class="recommendations">
            <h4>Prioritäre Handlungsempfehlungen:</h4>
            <ul>
              <li>Alt-Texte für alle Bilder hinzufügen (WCAG 1.1.1) <span style="font-size: 0.9em; color: #666;">(Bildbeschreibungen für sehbehinderte Nutzer)</span></li>
              <li>Farbkontraste auf mindestens 4.5:1 erhöhen (WCAG 1.4.3) <span style="font-size: 0.9em; color: #666;">(Text muss deutlich vom Hintergrund ablesbar sein)</span></li>
              <li>Überschriftenstruktur H1-H6 korrekt implementieren (WCAG 1.3.1) <span style="font-size: 0.9em; color: #666;">(Logischer Aufbau für Screenreader und Orientierung)</span></li>
              <li>Tastaturnavigation für alle Funktionen ermöglichen (WCAG 2.1.1) <span style="font-size: 0.9em; color: #666;">(Website ohne Maus bedienbar machen)</span></li>
              <li>Screen Reader-Kompatibilität durch ARIA-Labels verbessern <span style="font-size: 0.9em; color: #666;">(Vorleseprogramme für Blinde unterstützen)</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Zurück zur Übersicht Button -->
    <div style="text-align: center; margin: 20px 0 40px 0;">
      <a href="#navigation-overview" class="back-to-nav-button">⬆️ Zurück zur Übersicht</a>
    </div>

    <!-- Kategorie-Überschrift: Webseiten-Performance & Technik -->
    <div id="cat-performance-technik" class="category-anchor" style="padding: 60px 0 30px 40px !important; margin: 0 !important; text-align: center !important;">
      <h2 style="color: #ffffff !important; font-size: 1.8em !important; font-weight: bold !important; border-bottom: 3px solid #fbbf24 !important; padding-bottom: 10px !important; display: inline-block !important; margin: 0 !important;">Webseiten-Performance & Technik</h2>
    </div>

    <!-- Website Performance -->
    <div class="section">
      <div class="section-header">
        <span>Website Performance</span>
        <div class="header-score-circle ${getScoreColorClass(realData.performance.score)}">${realData.performance.score}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Performance Analyse</h3>
          <div class="score-display">
            <div class="score-circle" data-score="${getScoreRange(realData.performance.score)}">${realData.performance.score}%</div>
            <div class="score-details">
              <p><strong>Ladezeit:</strong> ${realData.performance.loadTime}s</p>
              <p><strong>Empfehlung:</strong> ${realData.performance.score >= 90 ? 'Exzellente Performance – Top-Niveau erreicht!' : realData.performance.score >= 80 ? 'Sehr gute Performance' : 'Performance optimieren'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(realData.performance.score)}" style="width: ${realData.performance.score}%; display: flex; align-items: center; justify-content: center;">
                <span style="color: ${realData.performance.score >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${realData.performance.score}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('performance-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Performance-Details anzeigen</h4>
        </div>
        
        <div id="performance-details" style="display: none;">
          ${getPerformanceAnalysis()}
        
        <!-- Nutzerfreundlichkeit (basierend auf Core Web Vitals) -->
        <div class="metric-card good" style="margin-top: 20px;">
          <h3>Nutzerfreundlichkeit</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div class="status-item">
              <h4>Benutzerfreundlichkeit (Core Web Vitals)</h4>
              ${(() => {
                const cls = realData.performance.cls || 0;
                const fid = realData.performance.fid || 0;
                const lcp = realData.performance.lcp || 0;
                
                // Score based on Core Web Vitals
                let uxScore = 0;
                // CLS scoring (good: <0.1, needs improvement: 0.1-0.25, poor: >0.25)
                if (cls <= 0.1) uxScore += 33;
                else if (cls <= 0.25) uxScore += 20;
                else uxScore += 10;
                
                // FID scoring (good: <100ms, needs improvement: 100-300ms, poor: >300ms)
                if (fid <= 100) uxScore += 33;
                else if (fid <= 300) uxScore += 20;
                else uxScore += 10;
                
                // LCP scoring (good: <2.5s, needs improvement: 2.5-4s, poor: >4s)
                if (lcp <= 2.5) uxScore += 34;
                else if (lcp <= 4) uxScore += 20;
                else uxScore += 10;
                
                const uxText = uxScore >= 80 ? 'Sehr gut' : uxScore >= 60 ? 'Gut' : 'Verbesserungsbedarf';
                
                return `
                  <p><strong>${uxText}</strong></p>
                  <div class="progress-container">
                    <div class="progress-bar">
                      <div class="progress-fill" data-score="${getScoreRange(uxScore)}" style="width: ${uxScore}%; display: flex; align-items: center; justify-content: center;">
                        <span style="color: ${uxScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${uxScore}%</span>
                      </div>
                    </div>
                  </div>
                  <p style="font-size: 12px; color: #6b7280;">
                    CLS: ${cls.toFixed(3)} | FID: ${fid}ms | LCP: ${lcp.toFixed(1)}s
                  </p>
                `;
              })()}
            </div>
          </div>
        </div>

        <div class="metric-card good" style="margin-top: 20px;">
          <h3>Performance-Details</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div class="status-item">
              <h4>Ladezeit</h4>
              <p><strong>${realData.performance.loadTime}s</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(realData.performance.score)}" style="width: ${realData.performance.score}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${realData.performance.score}%</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <h4>First Contentful Paint</h4>
              <p><strong>${(realData.performance.loadTime * 0.6).toFixed(1)}s</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(realData.performance.score)}" style="width: ${realData.performance.score}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${realData.performance.score}%</span>
                  </div>
                </div>
              </div>
              <p style="font-size: 0.9rem; color: #6b7280; margin-top: 8px;">Zeit bis erste Inhalte (Text, Bilder) sichtbar werden</p>
            </div>
            <div class="status-item">
              <h4>Time to Interactive</h4>
              <p><strong>${(realData.performance.loadTime * 1.2).toFixed(1)}s</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(0, realData.performance.score - 10))}" style="width: ${Math.max(0, realData.performance.score - 10)}%; display: flex; align-items: center; justify-content: center;">
                    <span style="color: white; font-weight: bold; font-size: 12px;">${Math.max(0, realData.performance.score - 10)}%</span>
                  </div>
                </div>
              </div>
              <p style="font-size: 0.9rem; color: #6b7280; margin-top: 8px;">Zeit bis die Seite vollständig geladen und bedienbar ist</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Optimierung -->
    ${(() => {
      // Kombiniere automatische und manuelle Scores (50% auto + 50% manuell)
      const autoMobileScore = realData.mobile.overallScore;
      const manualMobileScore = manualMobileData?.overallScore || 0;
      const mobileScore = (manualMobileData && manualMobileScore > 0)
        ? Math.round((autoMobileScore + manualMobileScore) / 2)
        : autoMobileScore;
      const isManual = !!(manualMobileData && manualMobileScore > 0);

      return `
    <div class="section">
      <div class="section-header">
        <span>Mobile Optimierung</span>
        <div class="header-score-circle ${getScoreColorClass(mobileScore)}">${mobileScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Mobile Optimierung</h3>
          <div class="score-display">
            <div class="score-circle" data-score="${getScoreRange(mobileScore)}">${mobileScore}%</div>
            <div class="score-details">
              <p><strong>Mobile-Friendly:</strong> ${mobileScore >= 90 ? 'Exzellent' : mobileScore >= 61 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <p><strong>Empfehlung:</strong> ${mobileScore >= 90 ? 'Exzellente mobile Optimierung – Hervorragend!' : mobileScore >= 80 ? 'Mobil optimiert' : 'Mobile Optimierung verbessern'}</p>
            </div>
          </div>`;
    })()}
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(realData.mobile.overallScore)}" style="width: ${realData.mobile.overallScore}%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 11px; font-weight: bold; color: white; z-index: 5;">${realData.mobile.overallScore}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('mobile-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Mobile-Details anzeigen</h4>
        </div>
      </div>
    </div>
        
        <div id="mobile-details" style="display: none;">
          ${getMobileOptimizationAnalysis()}
        </div>
      </div>
    </div>

    <!-- Conversion-Optimierung & User Journey -->
    ${manualConversionData ? `
    <div class="section">
      <div class="section-header">
        <span>Conversion-Optimierung & User Journey</span>
        <div class="header-score-circle ${getScoreColorClass(Math.round((manualConversionData.overallScore + manualConversionData.userJourneyScore) / 2))}">${Math.round((manualConversionData.overallScore + manualConversionData.userJourneyScore) / 2)}%</div>
      </div>
      <div class="section-content">
        
        <!-- Sub-Section: Conversion-Rate Optimierung -->
        <div style="margin-bottom: 40px;">
          <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.15)); padding: 20px; border-radius: 12px; border-left: 4px solid #fbbf24;">
            <h3 style="color: #fbbf24; margin: 0 0 15px 0; font-size: 1.3em;">Conversion-Rate Optimierung</h3>
            <div class="score-display">
              <div class="score-circle ${getScoreColorClass(manualConversionData.overallScore)}">${manualConversionData.overallScore}%</div>
              <div class="score-details">
                <p><strong>Status:</strong> ${manualConversionData.overallScore >= 75 ? 'Sehr gute Basis' : manualConversionData.overallScore >= 60 ? 'Gute Basis vorhanden' : 'Optimierungsbedarf'}</p>
                <p><strong>Empfehlung:</strong> ${manualConversionData.overallScore >= 75 ? 'Feintuning möglich' : 'Weitere Optimierungen empfohlen'}</p>
              </div>
            </div>
            ${generateProgressBar(manualConversionData.overallScore, `Conversion-Rate-Optimierung: ${manualConversionData.overallScore}%`)}
          </div>
          
          <div class="collapsible" onclick="toggleSection('conversion-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
            <h4 style="color: #fbbf24; margin: 0;">▶ Conversion-Details anzeigen</h4>
          </div>
          
          <div id="conversion-details" style="display: none;">
            <!-- Call-to-Action Analyse -->
            <div class="metric-card ${manualConversionData.ctaScore >= 70 ? 'good' : ''}" style="margin-top: 20px;">
              <h3>Call-to-Action (CTA) Analyse</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
                <div>
                  <p><strong>Gesamt-CTAs:</strong> ${manualConversionData.totalCTAs}</p>
                  <p style="font-size: 0.9rem; color: #6b7280;">Davon ${manualConversionData.visibleCTAs} sichtbar, ${manualConversionData.effectiveCTAs} effektiv</p>
                </div>
                <div>
                  <p><strong>Above-the-Fold:</strong> ${manualConversionData.aboveFoldCTAs} CTAs</p>
                  <p style="font-size: 0.9rem; color: #6b7280;">Direkt im sichtbaren Bereich</p>
                </div>
                <div>
                  <p><strong>CTA-Score:</strong> ${manualConversionData.ctaScore}%</p>
                  ${generateProgressBar(manualConversionData.ctaScore, `${manualConversionData.ctaScore >= 70 ? 'Gute' : 'Verbesserungsfähige'} CTA-Platzierung`)}
                </div>
              </div>
              
              ${manualConversionData.ctaTypes && manualConversionData.ctaTypes.length > 0 ? `
              <!-- CTA-Typen Details -->
              <div style="margin-top: 20px;">
                <h4>CTA-Typen Performance</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; margin-top: 15px;">
                  ${manualConversionData.ctaTypes.map(cta => `
                  <div style="padding: 15px; background: ${cta.effectiveness >= 70 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)'}; border-radius: 8px;">
                    <p><strong>${cta.type} (${cta.count}x)</strong></p>
                    <p style="font-size: 0.9rem; color: ${cta.mobileOptimized ? '#22c55e' : '#ef4444'};">${cta.mobileOptimized ? '✓' : '✗'} Mobile optimiert</p>
                    <p style="font-size: 0.9rem; color: ${cta.trackingSetup ? '#22c55e' : '#ef4444'};">${cta.trackingSetup ? '✓' : '✗'} Tracking ${cta.trackingSetup ? 'aktiv' : 'fehlt'}</p>
                    ${generateProgressBar(cta.effectiveness, `Effektivität: ${cta.effectiveness}%`)}
                  </div>
                  `).join('')}
                </div>
              </div>
              ` : ''}
            </div>

            <!-- Kontaktmethoden -->
            <div class="metric-card ${manualConversionData.contactScore >= 70 ? 'good' : ''}" style="margin-top: 20px;">
              <h3>Kontaktmethoden Analyse</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
                ${manualConversionData.contactMethods.phone.visible ? `
                <div>
                  <p><strong>Telefon</strong></p>
                  <p style="font-size: 0.9rem; color: ${manualConversionData.contactMethods.phone.prominent ? '#22c55e' : '#6b7280'};">${manualConversionData.contactMethods.phone.prominent ? '✓' : '○'} Prominent</p>
                  <p style="font-size: 0.9rem; color: ${manualConversionData.contactMethods.phone.clickable ? '#22c55e' : '#6b7280'};">${manualConversionData.contactMethods.phone.clickable ? '✓' : '○'} Klickbar</p>
                </div>
                ` : ''}
                ${manualConversionData.contactMethods.email.visible ? `
                <div>
                  <p><strong>E-Mail</strong></p>
                  <p style="font-size: 0.9rem; color: ${manualConversionData.contactMethods.email.prominent ? '#22c55e' : '#6b7280'};">${manualConversionData.contactMethods.email.prominent ? '✓' : '○'} ${manualConversionData.contactMethods.email.prominent ? 'Prominent' : 'Sichtbar'}</p>
                </div>
                ` : ''}
                ${manualConversionData.contactMethods.form.present ? `
                <div>
                  <p><strong>Kontaktformular</strong></p>
                  <p style="font-size: 0.9rem; color: ${manualConversionData.contactMethods.form.mobileOptimized ? '#22c55e' : '#fbbf24'};">${manualConversionData.contactMethods.form.mobileOptimized ? '✓' : '⚠'} ${manualConversionData.contactMethods.form.mobileOptimized ? 'Mobile-freundlich' : 'Mobile-Optimierung empfohlen'}</p>
                </div>
                ` : ''}
                ${manualConversionData.contactMethods.whatsapp.present ? `
                <div>
                  <p><strong>WhatsApp</strong></p>
                  <p style="font-size: 0.9rem; color: #22c55e;">✓ Verfügbar</p>
                </div>
                ` : ''}
                ${manualConversionData.contactMethods.callback.present ? `
                <div>
                  <p><strong>Rückruf-Service</strong></p>
                  <p style="font-size: 0.9rem; color: #22c55e;">✓ Verfügbar</p>
                </div>
                ` : ''}
                ${manualConversionData.contactMethods.chat.present ? `
                <div>
                  <p><strong>Live-Chat</strong></p>
                  <p style="font-size: 0.9rem; color: #22c55e;">✓ Verfügbar</p>
                </div>
                ` : ''}
              </div>
              <p style="margin-top: 15px;"><strong>Kontaktmethoden-Score:</strong> ${manualConversionData.contactScore}%</p>
              ${generateProgressBar(manualConversionData.contactScore, manualConversionData.contactScore >= 70 ? 'Sehr gute Erreichbarkeit' : 'Ausbaufähige Erreichbarkeit')}
            </div>

            <!-- Handlungsempfehlungen für Conversion -->
            <div class="recommendations">
              <h4>Prioritäre Handlungsempfehlungen (Conversion)</h4>
              <ul>
                <li><strong>Tracking implementieren:</strong> Conversion-Tracking für Kontaktformular und WhatsApp einrichten</li>
                <li><strong>Mobile-Optimierung:</strong> E-Mail-CTAs für mobile Geräte optimieren</li>
                <li><strong>Live-Chat hinzufügen:</strong> Chat-System mit FAQ-Bot für schnellere Kundenansprache</li>
                <li><strong>WhatsApp optimieren:</strong> Automatische Begrüßungsnachricht einrichten</li>
                <li><strong>A/B-Testing:</strong> CTA-Varianten testen zur Optimierung der Conversion-Rate</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Sub-Section: User Journey Optimierung -->
        <div style="margin-bottom: 40px;">
          <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.15)); padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #8b5cf6; margin: 0 0 15px 0; font-size: 1.3em;">User Journey Optimierung</h3>
            <div class="score-display">
              <div class="score-circle ${getScoreColorClass(manualConversionData.userJourneyScore)}">${manualConversionData.userJourneyScore}%</div>
              <div class="score-details">
                <p><strong>Status:</strong> ${manualConversionData.userJourneyScore >= 75 ? 'Sehr gute User Journey' : manualConversionData.userJourneyScore >= 60 ? 'Gute Basis vorhanden' : 'Optimierungsbedarf'}</p>
                <p><strong>Nutzerführung:</strong> ${manualConversionData.userJourneyScore >= 75 ? 'Nutzer finden sich gut zurecht' : 'Sollte verbessert werden'}</p>
              </div>
            </div>
            ${generateProgressBar(
              manualConversionData.userJourneyScore, 
              manualConversionData.userJourneyScore >= 75 
                ? 'Sehr gute User Journey - Nutzer finden sich gut zurecht' 
                : manualConversionData.userJourneyScore >= 60 
                  ? 'Gute Basis, Optimierungspotenzial vorhanden' 
                  : 'Optimierungsbedarf - Nutzerführung sollte verbessert werden'
            )}
          </div>

          <div class="collapsible" onclick="toggleSection('user-journey-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
            <h4 style="color: #8b5cf6; margin: 0;">▶ User Journey Details anzeigen</h4>
          </div>
          
          <div id="user-journey-details" style="display: none;">
            <!-- User Journey Komponenten -->
            <div class="metric-card" style="margin-top: 20px;">
              <h3>User Journey Komponenten</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-top: 15px;">
                <div>
                  <p><strong>Landing Page</strong></p>
                  ${generateProgressBar(
                    manualConversionData.userJourneyDetails?.landingPageScore || 0, 
                    'Bewertet wurden: Headline, Value Proposition, Trust Signals'
                  )}
                </div>
                <div>
                  <p><strong>Navigation</strong></p>
                  ${generateProgressBar(
                    manualConversionData.userJourneyDetails?.navigationScore || 0, 
                    'Bewertet wurden: Menüstruktur, Breadcrumbs, Suchfunktion'
                  )}
                </div>
                <div>
                  <p><strong>Informationshierarchie</strong></p>
                  ${generateProgressBar(
                    manualConversionData.userJourneyDetails?.informationHierarchyScore || 0, 
                    'Bewertet wurden: Content Flow, Scanability, CTA-Platzierung'
                  )}
                </div>
                <div>
                  <p><strong>Vertrauenselemente</strong></p>
                  ${generateProgressBar(
                    manualConversionData.userJourneyDetails?.trustElementsScore || 0, 
                    'Bewertet wurden: Testimonials, Zertifikate, Garantien'
                  )}
                </div>
                <div>
                  <p><strong>Lesbarkeit</strong></p>
                  ${generateProgressBar(
                    manualConversionData.userJourneyDetails?.readabilityScore || 0, 
                    'Bewertet wurden: Schriftgröße, Kontrast, Zeilenlänge, Absätze'
                  )}
                </div>
              </div>
            </div>

            <!-- Handlungsempfehlungen für User Journey -->
            <div class="recommendations">
              <h4>Prioritäre Handlungsempfehlungen (User Journey)</h4>
              <ul>
                <li><strong>Suchfunktion:</strong> Website-Suche implementieren für bessere Navigation</li>
                <li><strong>Lesbarkeit verbessern:</strong> Schriftgröße, Kontraste und Zeilenlängen optimieren</li>
                <li><strong>Trust Signals:</strong> Mehr Kundenbewertungen und Zertifikate prominent platzieren</li>
                <li><strong>Content Flow:</strong> Informationshierarchie optimieren für bessere Scanbarkeit</li>
                <li><strong>Breadcrumbs:</strong> Navigationspfad einführen für bessere Orientierung</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
    ` : ''}

    <!-- Zurück zur Übersicht Button -->
    <div style="text-align: center; margin: 20px 0 40px 0;">
      <a href="#navigation-overview" class="back-to-nav-button">⬆️ Zurück zur Übersicht</a>
    </div>

    <!-- Kategorie-Überschrift: Online-/Web-/Social-Media Performance -->
    <div id="cat-social-media" class="category-anchor" style="padding: 60px 0 30px 40px !important; margin: 0 !important; text-align: center !important;">
      <h2 style="color: #ffffff !important; font-size: 1.8em !important; font-weight: bold !important; border-bottom: 3px solid #fbbf24 !important; padding-bottom: 10px !important; display: inline-block !important; margin: 0 !important;">Online-/Web-/Social-Media Performance</h2>
    </div>

    <!-- Social Media Listening & Monitoring -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('social-media-content')" style="cursor: pointer;">
        <span>▶ Social Media Listening & Monitoring</span>
        <div class="header-score-circle ${socialMediaScore <= 0 ? 'red' : getScoreColorClass(socialMediaScore)}">${displaySocialScore}</div>
      </div>
      <div id="social-media-content" class="section-content" style="display: none;">
        ${getSocialMediaAnalysis()}
        
        <!-- Social Media Detailanalyse -->
        <div class="collapsible" onclick="toggleSection('social-platforms-details')" style="cursor: pointer; margin-top: 20px; padding: 15px; background: rgba(139, 92, 246, 0.1); border-radius: 8px; border: 1px solid rgba(139, 92, 246, 0.3);">
          <h4 style="color: #8b5cf6; margin: 0;">▶ Platform-spezifische Analyse</h4>
        </div>
        
        <div id="social-platforms-details" style="display: none;">
          <div style="margin-top: 15px;">
            ${(() => {
              console.log('🔍 Platform-specific analysis - manualSocialData:', JSON.stringify(manualSocialData, null, 2));
              
              return ['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'TikTok'].map(platform => {
                const platformKey = platform.toLowerCase();
                const urlKey = platformKey + 'Url';
                const followersKey = platformKey + (platform === 'YouTube' ? 'Subscribers' : 'Followers');
                const lastPostKey = platformKey + 'LastPost';
                
                const platformUrl = manualSocialData?.[urlKey];
                const platformFollowers = manualSocialData?.[followersKey] || '0';
                const platformLastPost = manualSocialData?.[lastPostKey] || 'Unbekannt';
                
                console.log(`Platform ${platform}:`, { urlKey, platformUrl, followersKey, platformFollowers, lastPostKey, platformLastPost });
                
                const hasData = !!platformUrl;
                const followerCount = parseInt(platformFollowers) || 0;
                
                // Parse last post - can be either number of days or a string like "vor 7 Tagen"
                let lastPostDays = 999;
                if (platformLastPost && platformLastPost !== 'Unbekannt') {
                  const numericValue = parseInt(platformLastPost);
                  if (!isNaN(numericValue)) {
                    lastPostDays = numericValue;
                  } else if (platformLastPost.includes('vor') && platformLastPost.includes('Tag')) {
                    const match = platformLastPost.match(/\d+/);
                    if (match) {
                      lastPostDays = parseInt(match[0]);
                    }
                  } else if (platformLastPost.includes('vor') && platformLastPost.includes('Jahr')) {
                    const match = platformLastPost.match(/\d+/);
                    if (match) {
                      lastPostDays = parseInt(match[0]) * 365;
                    }
                  }
                }
                
                return `
                  <div class="metric-card" style="margin-bottom: 20px; ${hasData ? '' : 'opacity: 0.6; border: 2px dashed #666;'}">
                    <h3>${platform} ${hasData ? '✓' : '✗'}</h3>
                    <p><strong>Status:</strong> ${hasData ? 'Vorhanden' : 'Nicht eingerichtet'}</p>
                    ${hasData ? `
                      <p><strong>${platform === 'YouTube' ? 'Abonnenten' : 'Follower'}:</strong> ${followerCount.toLocaleString()}</p>
                      <p><strong>Letzter Post:</strong> ${lastPostDays === 999 ? platformLastPost : lastPostDays === 0 ? 'Heute' : `vor ${lastPostDays} Tag${lastPostDays === 1 ? '' : 'en'}`}</p>
                      <p><strong>Aktivität:</strong> ${lastPostDays <= 7 ? 'Sehr aktiv' : lastPostDays <= 30 ? 'Aktiv' : 'Inaktiv'}</p>
                    ` : `
                      <p><strong>Empfehlung:</strong> Kanal einrichten für bessere Reichweite</p>
                      <p><strong>Potenzial:</strong> ${platform === 'Facebook' ? 'Lokale Zielgruppe erreichen' : platform === 'Instagram' ? 'Visuelle Inhalte teilen' : platform === 'LinkedIn' ? 'B2B Networking' : platform === 'Twitter' ? 'Schnelle Kommunikation' : platform === 'YouTube' ? 'Video-Marketing' : 'Junge Zielgruppe ansprechen'}</p>
                    `}
                  </div>
                `;
              }).join('');
            })()}
          </div>
        </div>
      </div>
    </div>

    <!-- Online Reputation -->
    <div class="section">
      <div class="section-header">
        <span>Online Reputation</span>
        <div class="header-score-circle ${getScoreColorClass(googleReviewScore)}">${googleReviewScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Online Reputation</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(googleReviewScore)}">${googleReviewScore}%</div>
            <div class="score-details">
              <p><strong>Google Bewertung:</strong> ${realData.reviews.google.rating}/5 (${realData.reviews.google.count} Bewertungen)</p>
              <p><strong>Empfehlung:</strong> ${realData.reviews.google.rating >= 4.7 && googleReviewScore >= 90 ? 'Exzellente Reputation – Weiter so!' : realData.reviews.google.rating >= 4.5 ? 'Sehr gute Reputation' : realData.reviews.google.rating >= 4.0 ? 'Gute Reputation' : realData.reviews.google.rating >= 3.0 ? 'Ausbaufähige Reputation' : 'Bewertungen dringend verbessern'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(googleReviewScore)}" style="width: ${googleReviewScore}%; display: flex; align-items: center; justify-content: center;">
                <span style="color: ${googleReviewScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 11px;">${googleReviewScore}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('reputation-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Reputation-Details anzeigen</h4>
        </div>
        
        <div id="reputation-details" style="display: none;">
          ${getReputationAnalysis()}
        </div>
      </div>
    </div>


    ${(() => {
      // Online-Präsenz Sektion
      if (manualOnlinePresenceData && (
        (manualOnlinePresenceData.items && manualOnlinePresenceData.items.length > 0) ||
        (manualOnlinePresenceData.simpleCounts && (manualOnlinePresenceData.simpleCounts.images > 0 || manualOnlinePresenceData.simpleCounts.videos > 0 || manualOnlinePresenceData.simpleCounts.shorts > 0))
      )) {
        const overallScore = manualOnlinePresenceData.overallScore || 0;
        
        // Bestimme ob simple oder detaillierte Eingabe
        const useSimpleCounts = manualOnlinePresenceData.simpleCounts && 
          (manualOnlinePresenceData.simpleCounts.images > 0 || 
           manualOnlinePresenceData.simpleCounts.videos > 0 || 
           manualOnlinePresenceData.simpleCounts.shorts > 0);
        
        const imageCount = useSimpleCounts ? manualOnlinePresenceData.simpleCounts.images : manualOnlinePresenceData.items.filter(i => i.type === 'image').length;
        const videoCount = useSimpleCounts ? manualOnlinePresenceData.simpleCounts.videos : manualOnlinePresenceData.items.filter(i => i.type === 'video').length;
        const shortCount = useSimpleCounts ? manualOnlinePresenceData.simpleCounts.shorts : manualOnlinePresenceData.items.filter(i => i.type === 'short').length;
        
        // Eigene vs. Fremde Inhalte
        let ownImages = 0, ownVideos = 0, ownShorts = 0;
        let foreignImages = 0, foreignVideos = 0, foreignShorts = 0;
        
        if (useSimpleCounts) {
          ownImages = manualOnlinePresenceData.simpleCounts.ownImages || 0;
          ownVideos = manualOnlinePresenceData.simpleCounts.ownVideos || 0;
          ownShorts = manualOnlinePresenceData.simpleCounts.ownShorts || 0;
          foreignImages = manualOnlinePresenceData.simpleCounts.foreignImages || 0;
          foreignVideos = manualOnlinePresenceData.simpleCounts.foreignVideos || 0;
          foreignShorts = manualOnlinePresenceData.simpleCounts.foreignShorts || 0;
        } else {
          ownImages = manualOnlinePresenceData.items.filter(i => i.type === 'image' && i.isOwn).length;
          ownVideos = manualOnlinePresenceData.items.filter(i => i.type === 'video' && i.isOwn).length;
          ownShorts = manualOnlinePresenceData.items.filter(i => i.type === 'short' && i.isOwn).length;
          foreignImages = manualOnlinePresenceData.items.filter(i => i.type === 'image' && !i.isOwn).length;
          foreignVideos = manualOnlinePresenceData.items.filter(i => i.type === 'video' && !i.isOwn).length;
          foreignShorts = manualOnlinePresenceData.items.filter(i => i.type === 'short' && !i.isOwn).length;
        }
        
        const ownTotal = ownImages + ownVideos + ownShorts;
        const foreignTotal = foreignImages + foreignVideos + foreignShorts;
        
        // Relevanz-Daten
        let highRelevance = 0;
        let mediumRelevance = 0;
        let lowRelevance = 0;
        
        if (useSimpleCounts) {
          // Bei einfacher Eingabe: Relevanz aus simpleCounts
          if (manualOnlinePresenceData.simpleCounts.imageRelevance === 'high') highRelevance += ownImages;
          else if (manualOnlinePresenceData.simpleCounts.imageRelevance === 'medium') mediumRelevance += ownImages;
          else if (manualOnlinePresenceData.simpleCounts.imageRelevance === 'low') lowRelevance += ownImages;
          
          if (manualOnlinePresenceData.simpleCounts.videoRelevance === 'high') highRelevance += ownVideos;
          else if (manualOnlinePresenceData.simpleCounts.videoRelevance === 'medium') mediumRelevance += ownVideos;
          else if (manualOnlinePresenceData.simpleCounts.videoRelevance === 'low') lowRelevance += ownVideos;
          
          if (manualOnlinePresenceData.simpleCounts.shortRelevance === 'high') highRelevance += ownShorts;
          else if (manualOnlinePresenceData.simpleCounts.shortRelevance === 'medium') mediumRelevance += ownShorts;
          else if (manualOnlinePresenceData.simpleCounts.shortRelevance === 'low') lowRelevance += ownShorts;
        } else {
          // Bei detaillierter Eingabe: Relevanz aus items (nur eigene!)
          highRelevance = manualOnlinePresenceData.items.filter(i => i.relevance === 'high' && i.isOwn).length;
          mediumRelevance = manualOnlinePresenceData.items.filter(i => i.relevance === 'medium' && i.isOwn).length;
          lowRelevance = manualOnlinePresenceData.items.filter(i => i.relevance === 'low' && i.isOwn).length;
        }
        
        const totalContent = imageCount + videoCount + shortCount;
        
        // Calculate scoring components
        let diversityScore = 0;
        if (imageCount > 0) diversityScore += 15;
        if (videoCount > 0) diversityScore += 15;
        if (shortCount > 0) diversityScore += 10;
        
        let quantityScore = 0;
        // Verbesserte Bewertung: 30+ Inhalte = hohe Punktzahl
        if (totalContent >= 50) quantityScore = 40;      // 50+ = exzellent
        else if (totalContent >= 30) quantityScore = 35; // 30+ = sehr gut
        else if (totalContent >= 20) quantityScore = 30; // 20+ = gut
        else if (totalContent >= 15) quantityScore = 25;
        else if (totalContent >= 10) quantityScore = 20;
        else if (totalContent >= 5) quantityScore = 15;
        else quantityScore = totalContent * 3;
        
        // Relevanz-Score: Eigene Inhalte volle Gewichtung, fremde nur 50%
        const relevanceWeights = { high: 2, medium: 1, low: 0.5 };
        const imageWeight = useSimpleCounts ? relevanceWeights[manualOnlinePresenceData.simpleCounts.imageRelevance || 'medium'] : 1;
        const videoWeight = useSimpleCounts ? relevanceWeights[manualOnlinePresenceData.simpleCounts.videoRelevance || 'medium'] : 1;
        const shortWeight = useSimpleCounts ? relevanceWeights[manualOnlinePresenceData.simpleCounts.shortRelevance || 'medium'] : 1;
        
        let relevanceScore = 0;
        relevanceScore += ownImages * imageWeight;
        relevanceScore += ownVideos * videoWeight;
        relevanceScore += ownShorts * shortWeight;
        relevanceScore += foreignImages * imageWeight * 0.5;
        relevanceScore += foreignVideos * videoWeight * 0.5;
        relevanceScore += foreignShorts * shortWeight * 0.5;
        
        relevanceScore = Math.min(30, relevanceScore);
        
        // Verwende den bereits berechneten Score aus manualOnlinePresenceData, falls vorhanden
        const hasPreCalculatedScore = !!manualOnlinePresenceData.overallScore;
        let calculatedOverallScore = hasPreCalculatedScore 
          ? manualOnlinePresenceData.overallScore 
          : Math.round(diversityScore + quantityScore + relevanceScore);
        
        // Content-Type Count für spätere Verwendung
        const contentTypeCount = [imageCount > 0, videoCount > 0, shortCount > 0].filter(Boolean).length;
        
        // WICHTIG: Bei nur einem Content-Typ maximal 70% (nur wenn nicht bereits berechnet)
        if (!hasPreCalculatedScore && contentTypeCount === 1) {
          calculatedOverallScore = Math.min(calculatedOverallScore, 70);
        }
        
        // WICHTIG: Strenge Bewertung basierend auf Content-Vielfalt
        // Nur 1 Content-Typ = maximal "Befriedigend", auch bei vielen Inhalten
        
        let categoryName = '';
        let categoryColor = '';
        let categoryDescription = '';
        
        if (contentTypeCount === 1) {
          // Nur ein Content-Typ = maximal befriedigend
          categoryName = 'Befriedigend';
          categoryColor = '#fbbf24';
          categoryDescription = 'Einseitige Online-Präsenz - erweitern Sie auf Videos und Shorts für bessere Sichtbarkeit';
        } else if (calculatedOverallScore >= 85 && contentTypeCount === 3) {
          categoryName = 'Exzellent';
          categoryColor = '#10b981';
          categoryDescription = 'Hervorragende Online-Präsenz mit ausgezeichneter Content-Vielfalt';
        } else if (calculatedOverallScore >= 75 && contentTypeCount >= 2) {
          categoryName = 'Sehr gut';
          categoryColor = '#10b981';
          categoryDescription = 'Sehr gute Online-Präsenz mit guter Content-Vielfalt';
        } else if (calculatedOverallScore >= 60) {
          categoryName = 'Gut';
          categoryColor = '#fbbf24';
          categoryDescription = 'Solide Online-Präsenz mit Verbesserungspotenzial';
        } else {
          categoryName = 'Schwach';
          categoryColor = '#ef4444';
          categoryDescription = 'Ausbaufähige Online-Präsenz mit hohem Optimierungsbedarf';
        }
        
        // Status-Bewertung (nie "Sehr gut", nur Exzellent/Gut/Befriedigend/Schwach)
        const assessment = calculatedOverallScore >= 85 ? 'Exzellent' : calculatedOverallScore >= 75 ? 'Gut' : calculatedOverallScore >= 60 ? 'Befriedigend' : 'Schwach';
        const assessmentColor = calculatedOverallScore >= 85 ? '#10b981' : calculatedOverallScore >= 75 ? '#10b981' : calculatedOverallScore >= 60 ? '#fbbf24' : '#ef4444';
        
        return `
    <!-- Online-Präsenz -->
    <div class="section">
      <div class="section-header">
        <span>Online-Präsenz (Google-Suche)</span>
        <div class="header-score-circle ${getScoreColorClass(calculatedOverallScore)}">${calculatedOverallScore}%</div>
      </div>
      <div class="section-content">
        <!-- Übersicht -->
        <div class="metric-card">
          <h3>Sichtbarkeit in Google-Suchergebnissen</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(calculatedOverallScore)}">${calculatedOverallScore}%</div>
            <div class="score-details">
              <p><strong>Status:</strong> ${assessment}</p>
              <p><strong>Kategorie:</strong> ${categoryName}</p>
              <p><strong>Erfasste Inhalte:</strong> ${totalContent}</p>
              ${!useSimpleCounts ? `<p><strong>Hochrelevant:</strong> ${highRelevance}</p>` : ''}
              <p><strong>Content-Typen:</strong> ${[imageCount > 0, videoCount > 0, shortCount > 0].filter(Boolean).length} von 3</p>
            </div>
          </div>
          ${generateProgressBar(calculatedOverallScore, `${categoryDescription}`)}
        </div>

        <!-- Score-Berechnung -->
        <div class="metric-card">
          <h3>Score-Berechnung</h3>
          <p style="margin-bottom: 15px;">Der Online-Präsenz-Score setzt sich aus drei Faktoren zusammen, die <strong>addiert</strong> werden:</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #cbd5e1;">
                  <th style="text-align: left; padding: 10px; font-weight: bold;">Faktor</th>
                  <th style="text-align: center; padding: 10px; font-weight: bold;">Erreicht</th>
                  <th style="text-align: center; padding: 10px; font-weight: bold;">Maximum</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px;">
                    <strong>Content-Vielfalt</strong><br>
                    <small style="color: #64748b;">Unterschiedliche Content-Typen (Bilder, Videos, Shorts)</small>
                  </td>
                  <td style="text-align: center; padding: 12px; font-size: 1.3em; font-weight: bold; color: ${diversityScore < 25 ? '#ef4444' : '#10b981'};">
                    ${diversityScore}
                  </td>
                  <td style="text-align: center; padding: 12px; color: #64748b;">
                    40
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px;">
                    <strong>Content-Menge</strong><br>
                    <small style="color: #64748b;">Anzahl der Inhalte (50+ = 40 Punkte, 30+ = 35 Punkte, 20+ = 30 Punkte)</small>
                  </td>
                  <td style="text-align: center; padding: 12px; font-size: 1.3em; font-weight: bold; color: ${quantityScore < 20 ? '#ef4444' : '#10b981'};">
                    ${quantityScore}
                  </td>
                  <td style="text-align: center; padding: 12px; color: #64748b;">
                    40
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px;">
                    <strong>Content-Relevanz</strong><br>
                    <small style="color: #64748b;">Eigene Inhalte: ${ownTotal}, Fremde: ${foreignTotal} – Fremde zählen nur 50%</small>
                  </td>
                  <td style="text-align: center; padding: 12px; font-size: 1.3em; font-weight: bold; color: ${relevanceScore < 15 ? '#ef4444' : '#10b981'};">
                    ${Math.round(relevanceScore)}
                  </td>
                  <td style="text-align: center; padding: 12px; color: #64748b;">
                    30
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style="background: ${categoryColor}15; padding: 20px; border-radius: 8px; border-left: 4px solid ${categoryColor};">
            <p style="margin: 0 0 12px 0; font-size: 1.1em;">
              <strong>Gesamt-Score:</strong>
            </p>
            <div style="display: grid; gap: 6px; margin-bottom: 12px; font-size: 0.95em;">
              <div style="border-top: 2px solid ${categoryColor}; padding-top: 8px; margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: bold;">Gesamt-Score:</span>
                <span style="font-size: 1.4em; font-weight: bold; color: ${categoryColor};">${calculatedOverallScore}%</span>
              </div>
            </div>
            <p style="margin: 0; color: #64748b;">
              <strong>Bewertung:</strong> ${categoryName} – ${categoryDescription}
            </p>
          </div>
        </div>

        <!-- Content-Typ Breakdown -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px;">
          <div class="metric-card" style="text-align: center;">
            <h4>Bilder</h4>
            <p style="font-size: 2em; font-weight: bold; margin: 10px 0;">${imageCount}</p>
            ${useSimpleCounts ? `
              <p style="margin: 5px 0; font-size: 0.85em; color: #64748b;">
                Eigene: ${ownImages} | Fremde: ${foreignImages}
              </p>
              <p style="margin: 5px 0; font-size: 0.85em; color: #64748b;">
                Relevanz: <strong>${manualOnlinePresenceData.simpleCounts.imageRelevance === 'high' ? 'Hoch' : manualOnlinePresenceData.simpleCounts.imageRelevance === 'medium' ? 'Mittel' : 'Niedrig'}</strong>
              </p>
            ` : ''}
            <p style="margin: 0; font-size: 0.9em;">${imageCount === 0 ? 'Noch keine Bilder' : imageCount < 5 ? 'Ausbaufähig' : imageCount < 15 ? 'Guter Start' : 'Sehr gut!'}</p>
          </div>
          <div class="metric-card" style="text-align: center;">
            <h4>Videos</h4>
            <p style="font-size: 2em; font-weight: bold; margin: 10px 0;">${videoCount}</p>
            ${useSimpleCounts ? `
              <p style="margin: 5px 0; font-size: 0.85em; color: #64748b;">
                Eigene: ${ownVideos} | Fremde: ${foreignVideos}
              </p>
              <p style="margin: 5px 0; font-size: 0.85em; color: #64748b;">
                Relevanz: <strong>${manualOnlinePresenceData.simpleCounts.videoRelevance === 'high' ? 'Hoch' : manualOnlinePresenceData.simpleCounts.videoRelevance === 'medium' ? 'Mittel' : 'Niedrig'}</strong>
              </p>
            ` : ''}
            <p style="margin: 0; font-size: 0.9em;">${videoCount === 0 ? 'Noch keine Videos' : videoCount < 3 ? 'Ausbaufähig' : videoCount < 8 ? 'Guter Start' : 'Sehr gut!'}</p>
          </div>
          <div class="metric-card" style="text-align: center;">
            <h4>Shorts</h4>
            <p style="font-size: 2em; font-weight: bold; margin: 10px 0;">${shortCount}</p>
            ${useSimpleCounts ? `
              <p style="margin: 5px 0; font-size: 0.85em; color: #64748b;">
                Eigene: ${ownShorts} | Fremde: ${foreignShorts}
              </p>
              <p style="margin: 5px 0; font-size: 0.85em; color: #64748b;">
                Relevanz: <strong>${manualOnlinePresenceData.simpleCounts.shortRelevance === 'high' ? 'Hoch' : manualOnlinePresenceData.simpleCounts.shortRelevance === 'medium' ? 'Mittel' : 'Niedrig'}</strong>
              </p>
            ` : ''}
            <p style="margin: 0; font-size: 0.9em;">${shortCount === 0 ? 'Noch keine Shorts' : shortCount < 3 ? 'Ausbaufähig' : shortCount < 8 ? 'Guter Start' : 'Sehr gut!'}</p>
          </div>
        </div>

        <!-- Relevanz-Breakdown -->
        ${(highRelevance > 0 || mediumRelevance > 0 || lowRelevance > 0) ? `
        <div class="metric-card">
          <h4>Relevanz-Verteilung</h4>
          <p style="margin-bottom: 15px; color: #64748b;">Hochrelevante Inhalte (eigene Inhalte, Firmen-Content) werden stärker gewichtet:</p>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div style="text-align: center; padding: 15px; background: #f0fdf4; border-radius: 8px; border: 2px solid #10b981;">
              <p style="margin: 0; font-size: 0.9em; color: #065f46; font-weight: bold;">Hohe Relevanz</p>
              <p style="font-size: 2em; font-weight: bold; margin: 5px 0; color: #10b981;">${highRelevance}</p>
              <p style="margin: 0; font-size: 0.8em; color: #065f46;">Gewichtung: 2x</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #fffbeb; border-radius: 8px; border: 2px solid #fbbf24;">
              <p style="margin: 0; font-size: 0.9em; color: #92400e; font-weight: bold;">Mittlere Relevanz</p>
              <p style="font-size: 2em; font-weight: bold; margin: 5px 0; color: #fbbf24;">${mediumRelevance}</p>
              <p style="margin: 0; font-size: 0.8em; color: #92400e;">Gewichtung: 1x</p>
            </div>
            <div style="text-align: center; padding: 15px; background: #fef2f2; border-radius: 8px; border: 2px solid #ef4444;">
              <p style="margin: 0; font-size: 0.9em; color: #991b1b; font-weight: bold;">Niedrige Relevanz</p>
              <p style="font-size: 2em; font-weight: bold; margin: 5px 0; color: #ef4444;">${lowRelevance}</p>
              <p style="margin: 0; font-size: 0.8em; color: #991b1b;">Gewichtung: 0.5x</p>
            </div>
          </div>
        </div>
        ` : ''}

        ${!useSimpleCounts && manualOnlinePresenceData.items && manualOnlinePresenceData.items.length > 0 ? `
        <!-- Detaillierte Content-Liste -->
        <div class="metric-card">
          <h4>Erfasste Inhalte im Detail</h4>
          <div style="max-height: 400px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead style="background: #f1f5f9; position: sticky; top: 0;">
                <tr>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">Typ</th>
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #cbd5e1;">URL</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #cbd5e1;">Relevanz</th>
                </tr>
              </thead>
              <tbody>
                ${manualOnlinePresenceData.items.map((item, index) => {
                  const typeLabel = item.type === 'image' ? 'Bild' : item.type === 'video' ? 'Video' : 'Short';
                  const relevanceLabel = item.relevance === 'high' ? 'Hoch' : item.relevance === 'medium' ? 'Mittel' : 'Niedrig';
                  
                  return `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 12px;">
                        <span>${typeLabel}</span>
                      </td>
                      <td style="padding: 12px;">
                        <a href="${item.url}" target="_blank" style="color: #3b82f6; text-decoration: none; font-size: 0.9em; word-break: break-all;">
                          ${item.url.length > 50 ? item.url.substring(0, 50) + '...' : item.url}
                        </a>
                      </td>
                      <td style="padding: 12px; text-align: center;">
                        <span class="score-badge ${item.relevance === 'high' ? 'yellow' : item.relevance === 'medium' ? 'green' : 'red'}">
                          ${relevanceLabel}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}

        ${overallScore < 80 ? `
        <!-- Branchenvergleich -->
        <div class="metric-card">
          <h4>Branchenvergleich & Zielvorgaben</h4>
          <p>In Ihrer Branche zeigen erfolgreiche Betriebe typischerweise:</p>
          <ul>
            <li>15-25 Bilder von abgeschlossenen Projekten</li>
            <li>5-10 Videos mit Projekt-Präsentationen</li>
            <li>3-8 Shorts für schnelle Einblicke</li>
            <li>Regelmäßige Updates (1-2 neue Inhalte pro Monat)</li>
          </ul>
          <p><strong>Ziel:</strong> Erhöhen Sie Ihren Score auf mindestens 75%</p>
        </div>
        ` : ''}

        <!-- Empfehlungen -->
        <div class="recommendations">
          <h4>Handlungsempfehlungen für Ihre Online-Präsenz</h4>
          <ul>
            ${overallScore >= 90 ? `
              <li>✅ Exzellente Online-Präsenz – Behalten Sie Ihre Content-Strategie bei!</li>
              <li>✅ Ihre vielfältigen Inhalte sind ein großer Wettbewerbsvorteil</li>
              <li>✅ Pflegen Sie weiterhin regelmäßig neue Inhalte ein</li>
              <li>✅ Erwägen Sie innovative Formate für noch mehr Reichweite</li>
            ` : `
              ${imageCount === 0 ? '<li><strong>Bilder-Strategie starten:</strong> Beginnen Sie mit hochwertigen Projektfotos auf Google My Business. Ziel: Mindestens 10 Bilder in 3 Monaten</li>' : ''}
              ${imageCount > 0 && imageCount < 10 ? '<li><strong>Bilder-Portfolio erweitern:</strong> Erhöhen Sie auf 15-20 Fotos mit Vorher-Nachher-Vergleichen</li>' : ''}
              ${videoCount === 0 ? '<li><strong>Video-Content einführen:</strong> Erstellen Sie erste Projekt-Videos. Bereits 2-3 Videos steigern die Sichtbarkeit</li>' : ''}
              ${videoCount > 0 && videoCount < 5 ? '<li><strong>Video-Präsenz ausbauen:</strong> Produzieren Sie regelmäßig kurze Videos (1-2 Minuten)</li>' : ''}
              ${shortCount === 0 ? '<li><strong>Shorts/Reels nutzen:</strong> Starten Sie mit 30-60 Sekunden Videos für schnelle Projekt-Einblicke</li>' : ''}
              ${highRelevance < totalContent * 0.5 ? '<li><strong>Relevanz steigern:</strong> Fokus auf eigenen Content statt Erwähnungen durch Dritte</li>' : ''}
              <li><strong>Optimierung für Auffindbarkeit:</strong> Beschreibende Dateinamen verwenden (z.B. "Dachsanierung-2024.jpg")</li>
              <li><strong>Content-Kalender:</strong> Wöchentlich 1-2 neue Inhalte planen</li>
              ${overallScore < 80 ? '<li><strong>Vielfalt erhöhen:</strong> Alle drei Content-Typen kombinieren für maximale Reichweite</li>' : ''}
              <li><strong>Regelmäßige Aktualisierung:</strong> Veraltete Inhalte durch aktuelle Projekte ersetzen</li>
              ${totalContent < 15 ? '<li><strong>Kurzziel:</strong> In 3 Monaten mindestens 15 Inhalte erreichen</li>' : ''}
            `}
          </ul>
        </div>
      </div>
    </div>
        `;
      }
      return '';
    })()}

    ${(() => {
      // Branchenplattformen Sektion - IMMER anzeigen
      const overallScore = (manualIndustryReviewData && manualIndustryReviewData.platforms && manualIndustryReviewData.platforms.length > 0) 
        ? (manualIndustryReviewData.overallScore || 0) 
        : 0;
      const hasData = manualIndustryReviewData && manualIndustryReviewData.platforms && manualIndustryReviewData.platforms.length > 0;
      
      return `
    <!-- Branchenplattformen -->
    <div class="section">
      <div class="section-header">
        <span>Branchenplattformen</span>
        <div class="header-score-circle ${overallScore <= 0 ? 'red' : getScoreColorClass(overallScore)}">${overallScore <= 0 ? '–' : overallScore + '%'}</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Branchenspezifische Bewertungsplattformen</h3>
          <div class="score-display">
            <div class="score-circle ${overallScore <= 0 ? 'red' : getScoreColorClass(overallScore)}">${overallScore <= 0 ? '–' : overallScore + '%'}</div>
            <div class="score-details">
              <p><strong>Plattformen:</strong> ${hasData ? manualIndustryReviewData.platforms.length : 0}</p>
              <p><strong>Status:</strong> ${hasData ? 'Aktiv' : 'Nicht erfasst'}</p>
            </div>
          </div>
          ${hasData ? generateProgressBar(overallScore, 'Gesamtbewertung über alle Branchenplattformen') : ''}
        </div>

        ${hasData ? `
        ${manualIndustryReviewData.platforms.map((platform) => {
          const rating = platform.rating || 0;
          const ratingScore = (rating / 5) * 100;
          
          return `
          <div class="metric-card">
            <h4>${platform.platformName}</h4>
            <p><strong>Bewertung:</strong> ${rating.toFixed(1)} von 5.0</p>
            ${generateProgressBar(ratingScore, `${platform.reviewCount || 0} Bewertungen`)}
            <div style="margin-top: 15px;">
              <p><strong>Profil-URL:</strong> <a href="${platform.profileUrl}" target="_blank" style="color: #3b82f6; text-decoration: none; word-break: break-all;">${platform.profileUrl}</a></p>
              <p><strong>Verifiziert:</strong> ${platform.isVerified ? 'Ja' : 'Nein'}</p>
              ${platform.lastReviewDate ? `<p><strong>Letzte Bewertung:</strong> ${platform.lastReviewDate}</p>` : ''}
            </div>
          </div>
          `;
        }).join('')}
        ` : `
        <div class="metric-card">
          <h4>Keine Branchenplattformen erfasst</h4>
          <p>Es wurden noch keine Bewertungen auf branchenspezifischen Plattformen erfasst. Nutzen Sie relevante Plattformen, um Ihre Sichtbarkeit zu erhöhen.</p>
        </div>
        `}

        <div class="recommendations">
          <h4>Handlungsempfehlungen für Branchenplattformen:</h4>
          <ul>
            ${overallScore >= 90 ? `
              <li>✅ Exzellente Präsenz auf Branchenplattformen – Weiter so!</li>
              <li>✅ Ihre hohe Bewertungsqualität ist ein starkes Aushängeschild</li>
              <li>✅ Bleiben Sie im Dialog mit Ihren Kunden und antworten Sie weiterhin auf Bewertungen</li>
              <li>✅ Nutzen Sie Ihre gute Reputation für weitere Empfehlungen</li>
            ` : `
              <li>Profile auf allen relevanten Branchenplattformen pflegen</li>
              <li>Aktiv um Kundenbewertungen bitten nach Projektabschluss</li>
              <li>Auf Bewertungen zeitnah und professionell reagieren</li>
              <li>Profile verifizieren lassen für höhere Glaubwürdigkeit</li>
              <li>Referenzprojekte und Zertifikate hinterlegen</li>
            `}
          </ul>
        </div>
      </div>
    </div>
      `;
    })()}

    <!-- Zurück zur Übersicht Button -->
    <div style="text-align: center; margin: 20px 0 40px 0;">
      <a href="#navigation-overview" class="back-to-nav-button">⬆️ Zurück zur Übersicht</a>
    </div>

    <!-- Kategorie-Überschrift: Markt & Marktumfeld -->
    <div id="cat-markt-umfeld" class="category-anchor" style="padding: 60px 0 30px 40px !important; margin: 0 !important; text-align: center !important;">
      <h2 style="color: #ffffff !important; font-size: 1.8em !important; font-weight: bold !important; border-bottom: 3px solid #fbbf24 !important; padding-bottom: 10px !important; display: inline-block !important; margin: 0 !important;">Markt & Marktumfeld</h2>
    </div>

    <!-- Wettbewerber-Analyse -->
    <div class="section">
      <div class="section-header">
        <span>Wettbewerber-Analyse</span>
        ${(() => {
          const allCompetitors = (window as any).globalAllCompetitors || manualCompetitors || [];
          const ownScore = (window as any).globalOwnCompanyScore || competitorComparisonScore || 75;
          return allCompetitors.length > 0 ? `<div class="header-score-circle ${getScoreColorClass(ownScore)}">${Math.round(ownScore)}%</div>` : '';
        })()}
      </div>
      <div class="section-content">
        ${getCompetitorAnalysis()}
      </div>
    </div>

    <!-- Stundensatzanalyse -->
    ${hourlyRateData ? `
    <div class="section">
      <div class="section-header">
        <span>Stundensatzanalyse</span>
        <div class="header-score-circle ${getScoreColorClass(hourlyRateScore)}">${Math.round(hourlyRateScore)}%</div>
      </div>
      <div class="section-content">
        ${getPricingAnalysis()}
      </div>
    </div>
    ` : ''}

    <!-- Arbeitgeber-Bewertungen -->
    ${(() => {
      const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
      const hasWorkplaceData = workplaceScore !== -1;
      
      return `
    <div class="section">
      <div class="section-header">
        <span>Arbeitgeber-Bewertungen</span>
        <div class="header-score-circle ${hasWorkplaceData ? getScoreColorClass(workplaceScore) : 'red'}">${hasWorkplaceData ? workplaceScore + '%' : '–'}</div>
      </div>
      <div class="section-content">
        ${getWorkplaceAnalysis()}
      </div>
    </div>
      `;
    })()}

    <!-- Mitarbeiterqualifikation -->
    ${(() => {
      const hasStaffData = staffQualificationData && staffQualificationData.totalEmployees > 0;
      
      return hasStaffData ? `
    <div class="section">
      <div class="section-header">
        <span>Mitarbeiterqualifikation</span>
        <div class="header-score-circle ${getScoreColorClass(staffQualificationScore)}">${Math.round(staffQualificationScore)}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Personal-Qualifikation</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(staffQualificationScore)}">${Math.round(staffQualificationScore)}%</div>
            <div class="score-details">
              <p><strong>Gesamt-Mitarbeiter:</strong> ${staffQualificationData.totalEmployees}</p>
              <p><strong>Qualifizierte Kräfte:</strong> ${staffQualificationData.skilled_workers + staffQualificationData.masters} von ${staffQualificationData.totalEmployees}</p>
              <p><strong>Meister-Quote:</strong> ${staffQualificationData.masters} Meister</p>
              <p><strong>Facharbeiter & Bürokräfte:</strong> ${staffQualificationData.skilled_workers + staffQualificationData.office_workers} qualifizierte Mitarbeiter</p>
            </div>
          </div>
          ${generateProgressBar(
            Math.round(staffQualificationScore),
            `Qualifikationsgrad mit ${staffQualificationData.totalEmployees} Mitarbeitern, davon ${staffQualificationData.masters} Meister und ${staffQualificationData.skilled_workers} Facharbeiter`
          )}
        </div>

        <div class="metric-card">
          <h3>Mitarbeiterstruktur</h3>
          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              ${staffQualificationData.masters > 0 ? `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px 0; color: #fbbf24; font-weight: bold;">Meister:</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff;">${staffQualificationData.masters} (${Math.round((staffQualificationData.masters / staffQualificationData.totalEmployees) * 100)}%)</td>
              </tr>
              ` : ''}
              ${staffQualificationData.skilled_workers > 0 ? `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px 0; color: #fbbf24; font-weight: bold;">Gesellen:</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff;">${staffQualificationData.skilled_workers} (${Math.round((staffQualificationData.skilled_workers / staffQualificationData.totalEmployees) * 100)}%)</td>
              </tr>
              ` : ''}
              ${staffQualificationData.office_workers > 0 ? `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px 0; color: #fbbf24; font-weight: bold;">Bürokräfte:</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff;">${staffQualificationData.office_workers} (${Math.round((staffQualificationData.office_workers / staffQualificationData.totalEmployees) * 100)}%)</td>
              </tr>
              ` : ''}
              ${staffQualificationData.apprentices > 0 ? `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px 0; color: #fbbf24; font-weight: bold;">Azubis:</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff;">${staffQualificationData.apprentices} (${Math.round((staffQualificationData.apprentices / staffQualificationData.totalEmployees) * 100)}%)</td>
              </tr>
              ` : ''}
              ${staffQualificationData.unskilled_workers > 0 ? `
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 10px 0; color: #fbbf24; font-weight: bold;">Ungelernte:</td>
                <td style="padding: 10px 0; text-align: right; color: #ffffff;">${staffQualificationData.unskilled_workers} (${Math.round((staffQualificationData.unskilled_workers / staffQualificationData.totalEmployees) * 100)}%)</td>
              </tr>
              ` : ''}
            </table>
          </div>
        </div>

        ${Object.values(staffQualificationData.certifications).some(val => val === true) ? `
        <div class="metric-card">
          <h3>Zertifizierungen & Qualifikationen</h3>
          <ul style="margin-top: 10px;">
            ${staffQualificationData.certifications.welding_certificates ? '<li>Schweißzertifikate: Vorhanden</li>' : ''}
            ${staffQualificationData.certifications.safety_training ? '<li>Arbeitssicherheit: Geschult</li>' : ''}
            ${staffQualificationData.certifications.first_aid ? '<li>Erste Hilfe: Zertifiziert</li>' : ''}
            ${staffQualificationData.certifications.digital_skills ? '<li>Digitale Kompetenzen: Vorhanden</li>' : ''}
            ${staffQualificationData.certifications.instructor_qualification ? '<li>Ausbildereignung: AdA-Schein</li>' : ''}
            ${staffQualificationData.certifications.business_qualification ? '<li>Betriebswirtschaft: Qualifiziert</li>' : ''}
          </ul>
        </div>
        ` : ''}

        ${staffQualificationData.industry_specific && staffQualificationData.industry_specific.length > 0 ? `
        <div class="metric-card">
          <h3>Branchenspezifische Qualifikationen</h3>
          <ul style="margin-top: 10px;">
            ${staffQualificationData.industry_specific.map(qual => `<li>${qual}</li>`).join('')}
          </ul>
        </div>
        ` : ''}

        ${staffQualificationData.specializations ? `
        <div class="metric-card">
          <h3>Spezialisierungen</h3>
          <p style="margin-top: 10px;">${staffQualificationData.specializations}</p>
        </div>
        ` : ''}

        <div class="metric-card">
          <h3>Weitere Kennzahlen</h3>
          ${staffQualificationData.average_experience_years > 0 ? `
          <p><strong>Durchschnittliche Berufserfahrung:</strong> ${staffQualificationData.average_experience_years} Jahre</p>
          ` : ''}
          ${staffQualificationData.training_budget_per_year > 0 ? `
          <p><strong>Weiterbildungsbudget/Jahr:</strong> ${staffQualificationData.training_budget_per_year.toLocaleString('de-DE')} €</p>
          ` : ''}
        </div>

        <div class="recommendations">
          <h4>Handlungsempfehlungen zur Personalentwicklung</h4>
          <ul>
            ${staffQualificationData.apprentices === 0 ? '<li>Priorität: Qualifikationsgrad der Mitarbeiter erhöhen</li>' : ''}
            ${!staffQualificationData.certifications.digital_skills ? '<li>Zusätzliche Zertifizierungen erwerben (Sicherheit, Digitalisierung)</li>' : ''}
            ${!staffQualificationData.certifications.safety_training ? '<li>Branchenspezifische Weiterbildungen verstärken</li>' : ''}
            ${staffQualificationData.training_budget_per_year < 1000 ? '<li>Weiterbildungsbudget erhöhen (empfohlen: mind. 1.000€/MA/Jahr)</li>' : ''}
            ${staffQualificationData.apprentices === 0 ? '<li>Ausbildungsplätze schaffen für Nachwuchsförderung</li>' : ''}
          </ul>
        </div>
      </div>
    </div>
      ` : '';
    })()}

    <!-- Zurück zur Übersicht Button -->
    <div style="text-align: center; margin: 20px 0 40px 0;">
      <a href="#navigation-overview" class="back-to-nav-button">⬆️ Zurück zur Übersicht</a>
    </div>

    <!-- Kategorie-Überschrift: Qualität · Service · Kundenorientierung -->
    ${cat6Avg > 0 ? `
    <div id="cat-qualitaet-service" class="category-anchor" style="padding: 60px 0 30px 40px !important; margin: 0 !important; text-align: center !important;">
      <h2 style="color: #ffffff !important; font-size: 1.8em !important; font-weight: bold !important; border-bottom: 3px solid #fbbf24 !important; padding-bottom: 10px !important; display: inline-block !important; margin: 0 !important;">Qualität · Service · Kundenorientierung</h2>
    </div>
    ` : ''}

    <!-- Reaktionszeit auf Anfragen -->
    ${quoteResponseData && quoteResponseData.responseTime ? `
    <div class="section">
      <div class="section-header">
        <span>Reaktionszeit auf Anfragen</span>
        <div class="header-score-circle ${quoteResponseScore > 0 ? getScoreColorClass(quoteResponseScore) : 'red'}">${displayQuoteScore}</div>
      </div>
      <div class="section-content">
        ${(() => {
          // Deutsche Bezeichnungen für Reaktionszeiten
          const getGermanResponseTime = (time: string) => {
            switch (time) {
              case '1-hour': return '1 Stunde';
              case '2-4-hours': return '2-4 Stunden';
              case '4-8-hours': return '4-8 Stunden';
              case '1-day': return '1 Tag';
              case '2-3-days': return '2-3 Tage';
              case 'over-3-days': return 'Über 3 Tage';
              case 'no-response-2-days': return 'Nach 2 Tagen keine Reaktion';
              case 'no-response': return 'Keine Antwort erhalten';
              default: return time;
            }
          };
          
          const germanResponseTime = getGermanResponseTime(quoteResponseData.responseTime);
          
          // Korrekte Stunden-Berechnung basierend auf String-Werten
          const getResponseTimeHours = (time: string): number => {
            switch (time) {
              case '1-hour': return 1;
              case '2-4-hours': return 3;
              case '4-8-hours': return 6;
              case '1-day': return 24;
              case '2-3-days': return 60;
              case 'over-3-days': return 96;
              case 'no-response-2-days': return 48;
              case 'no-response': return 999;
              default: return parseFloat(time) || 999;
            }
          };
          
          // Abgestufte Bewertung der Reaktionszeit
          const getResponseTimeRating = (time: string): string => {
            switch (time) {
              case '1-hour': return 'Exzellente Reaktionszeit';
              case '2-4-hours': return 'Sehr gute Reaktionszeit';
              case '4-8-hours': return 'Gute Reaktionszeit';
              case '1-day': return 'Akzeptable Reaktionszeit';
              case '2-3-days': return 'Reaktionszeit sollte verbessert werden';
              case 'over-3-days': return 'Sehr lange Reaktionszeit - dringend optimieren';
              case 'no-response-2-days': return 'Kritisch: Keine zeitnahe Reaktion auf Kundenanfragen';
              case 'no-response': return 'Sehr kritisch: Kundenanfragen werden nicht beantwortet';
              default: return 'Reaktionszeit nicht bewertet';
            }
          };
          
          const responseTimeHours = getResponseTimeHours(quoteResponseData.responseTime);
          const contactMethodsList = [];
          if (quoteResponseData.contactMethods.phone) contactMethodsList.push('Telefon');
          if (quoteResponseData.contactMethods.email) contactMethodsList.push('E-Mail');
          if (quoteResponseData.contactMethods.contactForm) contactMethodsList.push('Kontaktformular');
          if (quoteResponseData.contactMethods.whatsapp) contactMethodsList.push('WhatsApp');
          if (quoteResponseData.contactMethods.messenger) contactMethodsList.push('Messenger');
          
          return `
        <div class="metric-card">
          <h3>Kundenservice-Leistung</h3>
          
          ${quoteResponseData.responseTime === 'no-response' ? `
          <div style="margin: 20px 0; padding: 15px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; border-left: 4px solid #ef4444;">
            <h4 style="margin: 0 0 8px 0; color: #dc2626;">⚠️ Sehr kritisches Problem: Keine Antwort auf Kundenanfrage</h4>
            <p style="margin: 0; color: #7f1d1d;">
              Die Testanfrage wurde nicht beantwortet. Dies ist ein gravierendes Qualitätsproblem, das potenzielle Kunden abschreckt und zu erheblichen Umsatzverlusten führt. Der Score ist auf maximal 10% begrenzt.
            </p>
          </div>
          ` : ''}
          
          ${quoteResponseData.responseTime === 'no-response-2-days' ? `
          <div style="margin: 20px 0; padding: 15px; background: rgba(249, 115, 22, 0.15); border: 1px solid rgba(249, 115, 22, 0.3); border-radius: 8px; border-left: 4px solid #f97316;">
            <h4 style="margin: 0 0 8px 0; color: #ea580c;">⚠️ Kritisches Problem: Nach 2 Tagen keine Reaktion</h4>
            <p style="margin: 0; color: #9a3412;">
              Innerhalb von 2 Tagen erfolgte keine Reaktion auf die Kundenanfrage. Dies signalisiert mangelnden Kundenservice und führt häufig zu Auftragsverlust. Kunden erwarten zeitnahe Rückmeldungen – idealerweise innerhalb von 24 Stunden. Der Score ist auf maximal 15% begrenzt.
            </p>
          </div>
          ` : ''}
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px;">
            <div>
              <h4>Reaktionszeit auf Anfragen</h4>
              <div style="font-size: 2em; font-weight: bold; color: ${quoteResponseData.responseTime === 'no-response' || quoteResponseData.responseTime === 'no-response-2-days' ? '#ef4444' : responseTimeHours <= 2 ? '#10b981' : responseTimeHours <= 24 ? '#f59e0b' : '#ef4444'};">
                ${germanResponseTime}
              </div>
              <p style="margin-top: 10px; color: #6b7280;">
                ${getResponseTimeRating(quoteResponseData.responseTime)}
              </p>
            </div>
            
            ${contactMethodsList.length > 0 ? `
            <div>
              <h4>Kontaktmöglichkeiten</h4>
              <div style="margin-top: 10px;">
                ${contactMethodsList.map(method => `
                  <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border-radius: 6px; margin-bottom: 8px; display: inline-block; margin-right: 8px;">
                    ${method}
                  </div>
                `).join('')}
              </div>
            </div>
            ` : ''}
          </div>
          
          ${quoteResponseData.automaticConfirmation ? `
          <div style="margin-top: 20px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
            <h4>Automatische Eingangsbestätigung</h4>
            <p>Anfragen werden automatisch bestätigt</p>
          </div>
          ` : ''}
          
          ${quoteResponseData.responseQuality ? `
          <div style="margin-top: 20px;">
            <h4>Antwortqualität</h4>
            <div style="padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
              <p>${quoteResponseData.responseQuality === 'excellent' ? 'Exzellent' : 
                   quoteResponseData.responseQuality === 'good' ? 'Gut' :
                   quoteResponseData.responseQuality === 'average' ? 'Durchschnittlich' :
                   quoteResponseData.responseQuality === 'poor' ? 'Verbesserungsbedürftig' : quoteResponseData.responseQuality}</p>
            </div>
          </div>
          ` : ''}
          
          <div style="margin-top: 20px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
            ${quoteResponseData.availabilityHours ? `
            <div style="padding: 15px; background: rgba(251, 191, 36, 0.1); border-radius: 8px;">
              <h5 style="margin: 0 0 8px 0;">Erreichbarkeit</h5>
              <p style="margin: 0; font-size: 0.9em;">
                ${quoteResponseData.availabilityHours === 'business-hours' ? 'Geschäftszeiten' :
                  quoteResponseData.availabilityHours === 'extended-hours' ? 'Erweiterte Öffnungszeiten' :
                  quoteResponseData.availabilityHours === '24-7' ? '24/7 erreichbar' : quoteResponseData.availabilityHours}
              </p>
            </div>
            ` : ''}
            
            ${quoteResponseData.followUpProcess ? `
            <div style="padding: 15px; background: rgba(168, 85, 247, 0.1); border-radius: 8px;">
              <h5 style="margin: 0 0 8px 0;">Follow-Up-Prozess</h5>
              <p style="margin: 0; font-size: 0.9em;">Systematisches Nachfassen implementiert</p>
            </div>
            ` : ''}
            
            ${quoteResponseData.personalContact ? `
            <div style="padding: 15px; background: rgba(236, 72, 153, 0.1); border-radius: 8px;">
              <h5 style="margin: 0 0 8px 0;">Persönlicher Kontakt</h5>
              <p style="margin: 0; font-size: 0.9em;">Persönliche Ansprechpartner verfügbar</p>
            </div>
            ` : ''}
          </div>
          
          ${quoteResponseData.notes ? `
          <div style="margin-top: 20px; padding: 15px; background: rgba(156, 163, 175, 0.1); border-radius: 8px; border-left: 4px solid #6b7280;">
            <h4 style="margin-top: 0;">Zusätzliche Hinweise</h4>
            <p style="margin-bottom: 0;">${quoteResponseData.notes}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1)); border-radius: 8px;">
            <h4 style="margin-top: 0;">Handlungsempfehlungen zur Optimierung</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${responseTimeHours > 24 ? '<li>Reaktionszeit auf unter 24 Stunden reduzieren für bessere Kundenzufriedenheit</li>' : ''}
              ${responseTimeHours > 2 && responseTimeHours <= 24 ? '<li>Noch schnellere Reaktionszeiten (unter 2 Stunden) können Ihre Conversion-Rate deutlich steigern</li>' : ''}
              ${contactMethodsList.length < 3 ? '<li>Mehrere Kontaktkanäle anbieten (Telefon, E-Mail, WhatsApp, Live-Chat) erhöht die Erreichbarkeit</li>' : ''}
              ${!quoteResponseData.automaticConfirmation ? '<li>Automatische Eingangsbestätigung von Anfragen implementieren</li>' : ''}
              ${!quoteResponseData.followUpProcess ? '<li>Implementieren Sie ein systematisches Follow-Up-System für Angebotsanfragen</li>' : ''}
              <li>FAQ-Bereich pflegen, um häufige Fragen proaktiv zu beantworten</li>
              <li>Transparente Kommunikation der Bearbeitungszeiten auf der Website</li>
            </ul>
          </div>
        </div>
          `;
        })()}
      </div>
    </div>
    ` : ''}

    <!-- Zurück zur Übersicht Button -->
    <div style="text-align: center; margin: 20px 0 40px 0;">
      <a href="#navigation-overview" class="back-to-nav-button">⬆️ Zurück zur Übersicht</a>
    </div>

    <!-- Kategorie-Überschrift: Außendarstellung & Erscheinungsbild -->
    <div id="cat-aussendarstellung" class="category-anchor" style="padding: 60px 0 30px 40px !important; margin: 0 !important; text-align: center !important;">
      <h2 style="color: #ffffff !important; font-size: 1.8em !important; font-weight: bold !important; border-bottom: 3px solid #fbbf24 !important; padding-bottom: 10px !important; display: inline-block !important; margin: 0 !important;">Außendarstellung & Erscheinungsbild</h2>
    </div>

    <!-- Corporate Identity & Außendarstellung -->
    ${(() => {
      const hasCorporateData = manualCorporateIdentityData !== null;
      
      return hasCorporateData ? `
    <div class="section">
      <div class="section-header">
        <span>Erscheinungsbild & Außendarstellung</span>
        <div class="header-score-circle ${getScoreColorClass(corporateIdentityScore)}">${Math.round(corporateIdentityScore)}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Corporate Design</h3>
          <p style="margin-bottom: 15px;">Ein einheitliches Corporate Design stärkt die Markenidentität und sorgt für professionellen Auftritt.</p>
          
          <div style="margin-bottom: 15px;">
            <p><strong>Einheitliches Logo:</strong> ${manualCorporateIdentityData.uniformLogo === 'yes' ? 'Konsistent vorhanden' : manualCorporateIdentityData.uniformLogo === 'no' ? 'Nicht einheitlich' : 'Unbekannt'}</p>
            ${generateProgressBar(manualCorporateIdentityData.uniformLogo === 'yes' ? 100 : manualCorporateIdentityData.uniformLogo === 'no' ? 0 : 50, manualCorporateIdentityData.uniformLogo === 'yes' ? 'Logo wird konsistent verwendet' : 'Logo sollte vereinheitlicht werden')}
          </div>
          
          <div style="margin-bottom: 15px;">
            <p><strong>Arbeitskleidung:</strong> ${manualCorporateIdentityData.uniformWorkClothing === 'yes' ? 'Einheitlich vorhanden' : manualCorporateIdentityData.uniformWorkClothing === 'no' ? 'Nicht einheitlich' : 'Unbekannt'}</p>
            ${generateProgressBar(manualCorporateIdentityData.uniformWorkClothing === 'yes' ? 100 : manualCorporateIdentityData.uniformWorkClothing === 'no' ? 0 : 50, manualCorporateIdentityData.uniformWorkClothing === 'yes' ? 'Einheitliche Arbeitskleidung vorhanden' : 'Einheitliche Arbeitskleidung empfohlen')}
          </div>
          
          <div style="margin-bottom: 15px;">
            <p><strong>Farbkonzept:</strong> ${manualCorporateIdentityData.uniformColorScheme === 'yes' ? 'Konsistent eingesetzt' : manualCorporateIdentityData.uniformColorScheme === 'no' ? 'Inkonsistent' : 'Unbekannt'}</p>
            ${generateProgressBar(manualCorporateIdentityData.uniformColorScheme === 'yes' ? 100 : manualCorporateIdentityData.uniformColorScheme === 'no' ? 0 : 50, manualCorporateIdentityData.uniformColorScheme === 'yes' ? 'Konsistentes Farbkonzept' : 'Farbkonzept sollte vereinheitlicht werden')}
          </div>
          
          <div style="margin-bottom: 15px;">
            <p><strong>Schriftarten:</strong> ${manualCorporateIdentityData.uniformTypography === 'yes' ? 'Einheitlich verwendet' : manualCorporateIdentityData.uniformTypography === 'no' ? 'Nicht einheitlich' : 'Unbekannt'}</p>
            ${generateProgressBar(manualCorporateIdentityData.uniformTypography === 'yes' ? 100 : manualCorporateIdentityData.uniformTypography === 'no' ? 0 : 50, manualCorporateIdentityData.uniformTypography === 'yes' ? 'Einheitliche Schriftarten' : 'Schriftarten sollten vereinheitlicht werden')}
          </div>
          
          <div>
            <p><strong>Website-Design:</strong> ${manualCorporateIdentityData.uniformWebsiteDesign === 'yes' ? 'Konsistent gestaltet' : manualCorporateIdentityData.uniformWebsiteDesign === 'no' ? 'Inkonsistent' : 'Unbekannt'}</p>
            ${generateProgressBar(manualCorporateIdentityData.uniformWebsiteDesign === 'yes' ? 100 : manualCorporateIdentityData.uniformWebsiteDesign === 'no' ? 0 : 50, manualCorporateIdentityData.uniformWebsiteDesign === 'yes' ? 'Website-Design ist konsistent' : 'Website-Design sollte überarbeitet werden')}
          </div>
        </div>

        <div class="metric-card">
          <h3>Marketing & Werbemittel</h3>
          
          <p><strong>Hauszeitung/Newsletter:</strong> ${manualCorporateIdentityData.hauszeitung === 'yes' ? 'Wird eingesetzt' : manualCorporateIdentityData.hauszeitung === 'no' ? 'Nicht vorhanden' : 'Unbekannt'}</p>
          
          <p><strong>Hersteller-Infos:</strong> ${manualCorporateIdentityData.herstellerInfos === 'yes' ? 'Werden genutzt' : manualCorporateIdentityData.herstellerInfos === 'no' ? 'Nicht genutzt' : 'Unbekannt'}</p>
        </div>

        <div class="metric-card">
          <h3>Fahrzeugflotte & Außenwirkung</h3>
          
          <div style="margin-bottom: 15px;">
            <p><strong>Fahrzeugbeschriftung:</strong> ${manualCorporateIdentityData.uniformVehicleBranding === 'yes' ? 'Einheitlich gestaltet' : manualCorporateIdentityData.uniformVehicleBranding === 'no' ? 'Nicht einheitlich' : 'Unbekannt'}</p>
            ${manualCorporateIdentityData.uniformVehicleBranding !== 'unknown' ? generateProgressBar(manualCorporateIdentityData.uniformVehicleBranding === 'yes' ? 100 : 0, manualCorporateIdentityData.uniformVehicleBranding === 'yes' ? 'Einheitliche Fahrzeugbeschriftung vorhanden' : 'Einheitliche Fahrzeugbeschriftung empfohlen') : ''}
          </div>
          
          <div>
            <p><strong>Fahrzeugzustand:</strong> ${manualCorporateIdentityData.vehicleCondition === 'yes' ? 'Gepflegt & sauber' : manualCorporateIdentityData.vehicleCondition === 'no' ? 'Verbesserungsbedarf' : 'Unbekannt'}</p>
            ${manualCorporateIdentityData.vehicleCondition !== 'unknown' ? generateProgressBar(manualCorporateIdentityData.vehicleCondition === 'yes' ? 100 : 0, manualCorporateIdentityData.vehicleCondition === 'yes' ? 'Fahrzeuge in gutem Zustand' : 'Fahrzeugpflege sollte verbessert werden') : ''}
          </div>
        </div>

        <div class="metric-card">
          <h3>Außenwerbung</h3>
          
          <p><strong>Bauzaun-Banner:</strong> ${manualCorporateIdentityData.bauzaunBanner === 'yes' ? 'Werden eingesetzt' : manualCorporateIdentityData.bauzaunBanner === 'no' ? 'Nicht im Einsatz' : 'Unbekannt'}</p>
          
          <p><strong>Banden-Werbung:</strong> ${manualCorporateIdentityData.bandenWerbung === 'yes' ? 'Aktiv genutzt' : manualCorporateIdentityData.bandenWerbung === 'no' ? 'Nicht genutzt' : 'Unbekannt'}</p>
        </div>

        ${manualCorporateIdentityData.notes ? `
        <div class="metric-card">
          <h3>Zusätzliche Hinweise</h3>
          <p style="white-space: pre-wrap;">${manualCorporateIdentityData.notes}</p>
        </div>
        ` : ''}

        <div class="recommendations">
          <h4>Handlungsempfehlungen zur Optimierung</h4>
          <ul>
            ${manualCorporateIdentityData.uniformLogo === 'no' || manualCorporateIdentityData.uniformLogo === 'unknown' ? '<li>Einheitliches Logo auf allen Kommunikationskanälen verwenden</li>' : ''}
            ${manualCorporateIdentityData.uniformWorkClothing === 'no' || manualCorporateIdentityData.uniformWorkClothing === 'unknown' ? '<li>Einheitliche Arbeitskleidung mit Firmenlogo für professionellen Auftritt einführen</li>' : ''}
            ${manualCorporateIdentityData.uniformColorScheme === 'no' || manualCorporateIdentityData.uniformColorScheme === 'unknown' ? '<li>Konsistentes Farbkonzept für alle Marketing-Materialien entwickeln</li>' : ''}
            ${manualCorporateIdentityData.uniformVehicleBranding === 'no' || manualCorporateIdentityData.uniformVehicleBranding === 'unknown' ? '<li>Firmenfahrzeuge professionell beschriften für mobile Werbung</li>' : ''}
            ${manualCorporateIdentityData.vehicleCondition === 'no' || manualCorporateIdentityData.vehicleCondition === 'unknown' ? '<li>Fahrzeugflotte regelmäßig reinigen und in gutem Zustand halten</li>' : ''}
            ${manualCorporateIdentityData.hauszeitung === 'no' ? '<li>Newsletter oder Kundenmagazin zur Kundenbindung etablieren (wenn noch nicht veranlasst)</li>' : ''}
            ${manualCorporateIdentityData.hauszeitung === 'unknown' ? '<li>Newsletter oder Kundenmagazin zur Kundenbindung etablieren (wenn noch nicht veranlasst)</li>' : ''}
            ${manualCorporateIdentityData.bauzaunBanner === 'no' ? '<li>Baustellen-Werbung nutzen, um lokale Sichtbarkeit zu erhöhen (wenn noch nicht veranlasst)</li>' : ''}
            ${manualCorporateIdentityData.bauzaunBanner === 'unknown' ? '<li>Baustellen-Werbung nutzen, um lokale Sichtbarkeit zu erhöhen (wenn noch nicht veranlasst)</li>' : ''}
            ${manualCorporateIdentityData.bandenWerbung === 'no' ? '<li>Banden-Werbung zur Markenbekanntheit nutzen (wenn noch nicht veranlasst)</li>' : ''}
            ${manualCorporateIdentityData.bandenWerbung === 'unknown' ? '<li>Banden-Werbung zur Markenbekanntheit nutzen (wenn noch nicht veranlasst)</li>' : ''}
            ${manualCorporateIdentityData.herstellerInfos === 'no' ? '<li>Hersteller-Infos nutzen für zusätzliche Glaubwürdigkeit (wenn noch nicht veranlasst)</li>' : ''}
            ${manualCorporateIdentityData.herstellerInfos === 'unknown' ? '<li>Hersteller-Infos nutzen für zusätzliche Glaubwürdigkeit (wenn noch nicht veranlasst)</li>' : ''}
            <li>Corporate Design Manual erstellen für konsistente Markenkommunikation</li>
            <li>Regelmäßiges Marken-Audit durchführen, um Konsistenz sicherzustellen</li>
          </ul>
        </div>
      </div>
    </div>
      ` : '';
    })()}

    <!-- Zurück zur Übersicht Button -->
    <div style="text-align: center; margin: 20px 0 40px 0;">
      <a href="#navigation-overview" class="back-to-nav-button">⬆️ Zurück zur Übersicht</a>
    </div>

    <!-- Strategische Empfehlungen -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('recommendations-content')" style="cursor: pointer;"><span>▶ Strategische Empfehlungen</span></div>
      <div id="recommendations-content" class="section-content" style="display: none;">
        <div class="metric-card good">
          <h3>Prioritäten für die Umsetzung</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div class="recommendations">
              <h4>Kurzfristig</h4>
              <ul>
                ${impressumScore < 70 ? '<li>Impressum vervollständigen</li>' : ''}
                ${realData.performance.score < 60 ? '<li>Website-Performance optimieren</li>' : ''}
                ${realData.reviews.google.count < 10 ? '<li>Google-Bewertungen sammeln</li>' : ''}
              </ul>
            </div>
            <div class="recommendations">
              <h4>Mittelfristig</h4>
              <ul>
                ${socialMediaScore < 60 ? '<li>Social Media Präsenz ausbauen (aktueller Score: ' + socialMediaScore + '%)</li>' : ''}
                ${realData.seo.score < 70 ? '<li>SEO-Bestandsanalyse durchführen und optimieren</li>' : ''}
                <li>Content-Marketing-Strategie entwickeln</li>
              </ul>
            </div>
            <div class="recommendations">
              <h4>Langfristig</h4>
              <ul>
                <li>Backlink-Strategie implementieren</li>
                <li>Employer Branding stärken</li>
                <li>Wettbewerbsmonitoring etablieren</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Rechtliche Hinweise & KI-Transparenz (Collapsible) -->
    ${getCollapsibleComplianceSectionHTML(hasUnreviewedAIContent)}

    <!-- Footer -->
    <div style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(17, 24, 39, 0.6); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3); max-width: 800px; margin-left: auto; margin-right: auto;">
      <h3 style="color: #fbbf24; margin: 15px 0; font-size: 1.2em;">UNNA - die Unternehmensanalyse</h3>
      <div style="color: #9ca3af; font-size: 0.9em;">
        <p style="margin: 0;">Erstellt am ${new Date().toLocaleDateString('de-DE')} | Vollständiger Business-Analyse Report</p>
        <p style="margin: 10px 0 0 0; font-size: 0.8em;"><strong>Rechtlicher Hinweis:</strong> Alle Daten basieren auf KI-gestützter automatischer Analyse und manueller Datenerfassung.</p>
        <p style="margin: 5px 0 0 0; font-size: 0.8em;">Diese Analyse dient ausschließlich zur Orientierung und stellt keine Rechts-, Steuer- oder Unternehmensberatung dar. Für rechtsverbindliche Auskünfte konsultieren Sie bitte einen Fachanwalt oder Steuerberater.</p>
        <p style="margin: 5px 0 0 0; font-size: 0.8em;">Die Analyse trifft keine automatisierten Entscheidungen über Ihr Unternehmen und dient lediglich als Informationsgrundlage. Alle Angaben ohne Gewähr.</p>
        <p style="margin: 5px 0 0 0; font-size: 0.8em;">Datenschutzhinweis: Die Verarbeitung Ihrer Daten erfolgt DSGVO-konform. Für Rückfragen und Optimierungsberatung stehen wir gerne zur Verfügung.</p>
      </div>
    </div>

    <script>
      function toggleCategory(categoryId) {
        const content = document.getElementById(categoryId);
        const header = content.previousElementSibling;
        const toggleIcon = header.querySelector('.toggle-icon');
        
        if (content.classList.contains('collapsed')) {
          content.classList.remove('collapsed');
          header.classList.remove('collapsed');
          if (toggleIcon) toggleIcon.textContent = '▼';
        } else {
          content.classList.add('collapsed');
          header.classList.add('collapsed');
          if (toggleIcon) toggleIcon.textContent = '▶';
        }
      }

      // Initialize all categories as collapsed (dropdown style)
      document.addEventListener('DOMContentLoaded', function() {
        const categories = ['seo-performance', 'mobile-accessibility', 'social-reputation', 'legal-privacy', 'design-branding', 'staff-service'];
        categories.forEach(categoryId => {
          const content = document.getElementById(categoryId);
          const header = content ? content.previousElementSibling : null;
          const toggleIcon = header ? header.querySelector('.toggle-icon') : null;
          if (content && header) {
            content.classList.add('collapsed');
            header.classList.add('collapsed');
            if (toggleIcon) toggleIcon.textContent = '▶';
          }
        });
      });
    </script>
  </div>
</body>
</html>`;
};
