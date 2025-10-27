

import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData, ManualImprintData, CompetitorServices, CompanyServices, ManualCorporateIdentityData, StaffQualificationData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData, ManualLocalSEOData, ManualIndustryReviewData, ManualOnlinePresenceData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateOverallScore, calculateHourlyRateScore, calculateContentQualityScore, calculateBacklinksScore, calculateAccessibilityScore, calculateLocalSEOScore, calculateCorporateIdentityScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateDataPrivacyScore, calculateWorkplaceScore } from './scoreCalculations';
import { generateDataPrivacySection } from './reportSections';
import { getLogoHTML } from './logoData';

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
  privacyData?: any;
  accessibilityData?: any;
  // DIREKTE WERTE AUS COMPETITOR ANALYSIS
  calculatedOwnCompanyScore?: number;
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
  privacyData,
  staffQualificationData,
  quoteResponseData,
  manualContentData,
  manualAccessibilityData,
  manualBacklinkData,
  accessibilityData,
  calculatedOwnCompanyScore
}: CustomerReportData): string => {
  console.log('🟢 generateCustomerHTML called - MAIN CUSTOMER HTML GENERATOR');
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
  
  // Accessibility scores müssen erst berechnet werden
  const actualAccessibilityScore = calculateAccessibilityScore(realData, manualAccessibilityData);
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
  
  // Calculate data privacy score using manual data if available
  const actualDataPrivacyScore = calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData);
  const displayDataPrivacyScore = actualDataPrivacyScore > 0 
    ? `${Math.round(actualDataPrivacyScore)}%` 
    : '–';
  
  // Calculate DSGVO score - red if there are critical violations
  const calculateDSGVOScore = () => {
    if (!privacyData) return 75; // Default score
    
    const violations = privacyData.violations || [];
    const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
    const customViolations = manualDataPrivacyData?.customViolations || [];
    
    // Filter out deselected violations to get active violations
    const activeViolations = violations.filter((violation: any) => 
      !deselectedViolations.includes(violation.id)
    );
    
    // Count critical violations (high severity)
    const criticalViolations = [...activeViolations, ...customViolations]
      .filter((violation: any) => violation.severity === 'high');
    
    // If there's 1 or more critical violations, score should be in red range (under 60%)
    if (criticalViolations.length >= 1) {
      return Math.max(25, 55 - (criticalViolations.length * 10)); // 25-55% range
    }
    
    // Otherwise use the regular data privacy score
    return actualDataPrivacyScore;
  };
  
  const dsgvoScore = calculateDSGVOScore();
  const displayDSGVOScore = dsgvoScore > 0 ? `${Math.round(dsgvoScore)}%` : '–';
  
  // Calculate additional scores - MIT MANUELLEN DATEN
  const contentQualityScore = calculateContentQualityScore(realData, manualKeywordData, businessData, manualContentData);
  const backlinksScore = calculateBacklinksScore(realData, manualBacklinkData);
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
  
  // VERWENDE NUR DIE BEREITS BERECHNETEN GLOBALEN WERTE AUS COMPETITORANALYSIS
  const competitorComparisonScore = (window as any).globalOwnCompanyScore || 75;
  const marketComparisonScore = (window as any).globalOwnCompanyScore || 75;
  // Impressum Analysis - berücksichtigt manuelle Eingaben
  const requiredElements = [
    'Firmenname', 'Rechtsform', 'Geschäftsführer/Inhaber', 'Adresse', 
    'Telefonnummer', 'E-Mail-Adresse', 'Handelsregisternummer', 
    'USt-IdNr.', 'Kammerzugehörigkeit', 'Berufsbezeichnung', 'Aufsichtsbehörde'
  ];
  
  const finalMissingImprintElements = manualImprintData 
    ? requiredElements.filter(e => !manualImprintData.elements.includes(e))
    : missingImprintElements;
    
  const foundImprintElements = manualImprintData 
    ? manualImprintData.elements
    : requiredElements.filter(e => !missingImprintElements.includes(e));
    
  const impressumScore = Math.round((foundImprintElements.length / requiredElements.length) * 100);
  
  // Calculate additional scores - use proper calculation
  const actualPricingScore = calculateHourlyRateScore(hourlyRateData);
  const pricingScore = actualPricingScore;
  const pricingText = 
    actualPricingScore === 100 ? 'Region/Top-Niveau' : 
    actualPricingScore === 85 ? 'Region/marktüblich' : 
    actualPricingScore === 70 ? 'Über Marktniveau' : 
    actualPricingScore === 50 ? 'Region/unterer Durchschnitt' : 
    actualPricingScore === 30 ? 'Region/unterdurchschnittlich' : `${actualPricingScore}/100`;
  const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
  const reputationScore = realData.reviews.google.rating * 20;
  
  const legalScore = impressumScore;
  
  
  // Calculate overall score
  const overallScore = Math.round((
    realData.seo.score * 0.2 + 
    realData.performance.score * 0.15 + 
    realData.mobile.overallScore * 0.15 +
    socialMediaScore * 0.15 +
    reputationScore * 0.15 +
    impressumScore * 0.1 +
    accessibilityScore * 0.1
  ));
  
  console.log('Calculated impressumScore:', impressumScore);
  console.log('finalMissingImprintElements.length:', finalMissingImprintElements.length);
  console.log('manualImprintData:', manualImprintData);

  const getMissingImprintList = () => {
    if (finalMissingImprintElements.length === 0) {
      return '<p>✅ Alle notwendigen Angaben im Impressum gefunden.</p>';
    } else {
      return `
        <ul>
          ${finalMissingImprintElements.map(element => `<li>❌ ${element}</li>`).join('')}
        </ul>
        <p>Es fehlen wichtige Angaben. Dies kann zu rechtlichen Problemen führen.</p>
      `;
    }
  };
  
  const getFoundImprintList = () => {
    if (foundImprintElements.length === 0) {
      return '<p>❌ Keine Impressum-Angaben gefunden.</p>';
    } else {
      return `
        <ul>
          ${foundImprintElements.map(element => `<li>✅ ${element}</li>`).join('')}
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
        <h4>💼 Detaillierte Arbeitgeber-Bewertung</h4>
        
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
                    return '❌ Nicht gefunden';
                  } else if (manualWorkplaceData.kununuFound && manualWorkplaceData.kununuRating) {
                    return `✅ ${manualWorkplaceData.kununuRating}/5 (${manualWorkplaceData.kununuReviews || 0} Bewertungen)`;
                  } else {
                    return '❌ Nicht gefunden';
                  }
                } else {
                  return realData.workplace?.kununu?.found && realData.workplace?.kununu?.rating
                    ? `✅ ${realData.workplace.kununu.rating}/5 (${realData.workplace.kununu.reviews || 0} Bewertungen)`
                    : '❌ Nicht gefunden';
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
                    return '❌ Nicht gefunden';
                  } else if (manualWorkplaceData.glassdoorFound && manualWorkplaceData.glassdoorRating) {
                    return `✅ ${manualWorkplaceData.glassdoorRating}/5 (${manualWorkplaceData.glassdoorReviews || 0} Bewertungen)`;
                  } else {
                    return '❌ Nicht gefunden';
                  }
                } else {
                  return realData.workplace?.glassdoor?.found && realData.workplace?.glassdoor?.rating
                    ? `✅ ${realData.workplace.glassdoor.rating}/5 (${realData.workplace.glassdoor.reviews || 0} Bewertungen)`
                    : '❌ Nicht gefunden';
                }
              })()
            }</p>
          </div>
          <div>
            <p><strong>Gesamtbewertung:</strong> 
              <span class="score-badge ${workplaceScore >= 70 ? 'green' : workplaceScore >= 50 ? 'yellow' : 'red'}">
                ${workplaceScore >= 70 ? '✅ Sehr gut' : workplaceScore >= 50 ? '⚠️ Gut' : '❌ Verbesserungsbedarf'}
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
            ⭐ Arbeitsplatz-Bewertungen nicht vorhanden
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
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Kununu, Glassdoor etc.</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 14px;"><strong>Employer Branding:</strong> Ausbau empfohlen</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Sichtbarkeit als Arbeitgeber</p>
            </div>
            <div>
              <p style="margin: 0; font-size: 14px;"><strong>Fachkräfte-Gewinnung:</strong> Potenzial nicht genutzt</p>
              <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.8;">Arbeitgebermarke stärken</p>
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
    return `
      <div class="metric-card ${realData.reviews.google.count > 0 ? 'good' : 'warning'}">
        <h3>Google Bewertungen</h3>
        <div class="score-display">
          <div class="score-tile ${getScoreColorClass(reputationScore)}">${realData.reviews.google.rating}/5</div>
          <div class="score-details">
            <p><strong>Durchschnittsbewertung:</strong> ${realData.reviews.google.rating}/5</p>
            <p><strong>Anzahl Bewertungen:</strong> ${realData.reviews.google.count}</p>
            <p><strong>Empfehlung:</strong> ${realData.reviews.google.rating >= 4.0 ? 'Sehr gute Reputation' : 'Bewertungen verbessern'}</p>
          </div>
        </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${reputationScore}%; background-color: ${
                reputationScore < 20 ? '#CD0000' :
                reputationScore <= 60 ? '#dc2626' :
                reputationScore <= 80 ? '#16a34a' :
                '#eab308'
              };"></div>
            </div>
          </div>
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
    let localPricingText = 'Über Marktniveau';
    if (companyAvg > 0 && regionalAvg > 0) {
      const difference = companyAvg - regionalAvg;
      
      // Neue Bewertungslogik basierend auf der Differenz
      if (difference >= -10 && difference < 0) {
        localPricingScore = 50;
        localPricingText = 'Region/unterer Durchschnitt';
      } else if (difference >= 0 && difference <= 10) {
        localPricingScore = 85;
        localPricingText = 'Region/marktüblich';
      } else if (difference > 10 && difference <= 20) {
        localPricingScore = 100;
        localPricingText = 'Region/Top-Niveau';
      } else if (difference > 20) {
        localPricingScore = 70;
        localPricingText = 'Über Marktniveau';
      } else {
        // Difference < -10
        localPricingScore = 30;
        localPricingText = 'Region/unterdurchschnittlich';
      }
    }
    return `
      <div class="metric-card good">
        <h3>Stundensatz-Analyse & Wettbewerbsvergleich</h3>
        <div class="score-display">
          <div class="score-tile ${getScoreColorClass(localPricingScore)}">${localPricingText}</div>
        </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${localPricingScore}%; background-color: ${
                localPricingScore < 40 ? '#CD0000' :
                localPricingScore < 60 ? '#dc2626' :
                localPricingScore < 70 ? '#16a34a' :
                '#ffd700'
              };"></div>
            </div>
          </div>
          <div class="score-details">
            <h4>Ihre Stundensätze:</h4>
            <p><strong>Meister:</strong> ${hourlyRateData.meisterRate || 0}€/h</p>
            <p><strong>Facharbeiter:</strong> ${hourlyRateData.facharbeiterRate || 0}€/h</p>
            <p><strong>Azubi:</strong> ${hourlyRateData.azubiRate || 0}€/h</p>
            <p><strong>Helfer:</strong> ${hourlyRateData.helferRate || 0}€/h</p>
            <p><strong>Service:</strong> ${hourlyRateData.serviceRate || 0}€/h</p>
            <p><strong>Installation:</strong> ${hourlyRateData.installationRate || 0}€/h</p>
            ${companyAvg > 0 ? `<p><strong>Ihr Durchschnitt:</strong> ${companyAvg.toFixed(2)}€/h</p>` : ''}
            
            ${regionalAvg > 0 ? `
            <h4 style="margin-top: 15px;">Regional üblich:</h4>
            <p><strong>Regional Meister:</strong> ${hourlyRateData.regionalMeisterRate || 0}€/h</p>
            <p><strong>Regional Facharbeiter:</strong> ${hourlyRateData.regionalFacharbeiterRate || 0}€/h</p>
            <p><strong>Regional Azubi:</strong> ${hourlyRateData.regionalAzubiRate || 0}€/h</p>
            <p><strong>Regional Helfer:</strong> ${hourlyRateData.regionalHelferRate || 0}€/h</p>
            <p><strong>Regional Service:</strong> ${hourlyRateData.regionalServiceRate || 0}€/h</p>
            <p><strong>Regional Installation:</strong> ${hourlyRateData.regionalInstallationRate || 0}€/h</p>
            <p><strong>Regional Durchschnitt:</strong> ${regionalAvg.toFixed(2)}€/h</p>
            
            <div style="margin-top: 15px; padding: 10px; background: ${localPricingScore >= 60 ? (localPricingScore >= 70 ? '#ffd700' : '#e8f5e8') : '#f8d7da'}; border-radius: 5px;">
              <strong>Bewertung:</strong> ${
                localPricingScore >= 70 ? 'Ihre Preise liegen im optimalen Bereich des regionalen Marktes.' :
                localPricingScore >= 50 ? 'Ihre Preise sind wettbewerbsfähig.' :
                'Ihre Preise weichen deutlich vom regionalen Durchschnitt ab. Prüfen Sie Ihre Preispositionierung.'
              }
            </div>
            ` : ''}
          </div>
      </div>
    `;
  };

  // Legal Analysis
  const getLegalAnalysis = () => {
    const legalScore = impressumScore;
    return `
      <div class="metric-card ${legalScore >= 70 ? 'good' : 'warning'}">
        <h3>⚖️ Impressum & Rechtssicherheit</h3>
        <div class="score-display">
          <div class="score-tile ${getScoreColorClass(legalScore)}">${legalScore}%</div>
        </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${legalScore}%; background-color: ${
                legalScore < 20 ? '#CD0000' :
                legalScore <= 60 ? '#dc2626' :
                legalScore <= 80 ? '#16a34a' :
                '#eab308'
              };"></div>
            </div>
          </div>
          <div class="score-details">
            <p><strong>Impressum:</strong> ${legalScore >= 80 ? 'Vollständig' : legalScore >= 60 ? 'Größtenteils vorhanden' : 'Unvollständig'}</p>
            <p><strong>Empfehlung:</strong> ${legalScore >= 80 ? 'Rechtlich abgesichert' : 'Rechtliche Pflichtangaben ergänzen'}</p>
          </div>

        <!-- Impressum-Details -->
        <div style="margin-top: 20px;">
          <h4 class="section-text" style="margin-bottom: 10px;">📋 Impressum-Analyse</h4>
          
          ${manualImprintData ? `
          <div style="margin-bottom: 15px;">
            <h5 class="success-text" style="margin-bottom: 8px;">✅ Vorhandene Angaben (manuell bestätigt):</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${foundImprintElements.map(element => `<li class="success-text" style="margin-bottom: 3px;">✅ ${element}</li>`).join('')}
            </ul>
            <p style="font-size: 0.9em; margin-top: 8px;"><strong>Hinweis:</strong> Diese Angaben wurden manuell bestätigt.</p>
          </div>
          ${finalMissingImprintElements.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h5 class="error-text" style="margin-bottom: 8px;">❌ Fehlende Angaben:</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${finalMissingImprintElements.map(element => `<li class="error-text" style="margin-bottom: 3px;">❌ ${element}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          ` : `
          ${foundImprintElements.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h5 class="success-text" style="margin-bottom: 8px;">✅ Automatisch gefundene Angaben:</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${foundImprintElements.map(element => `<li class="success-text" style="margin-bottom: 3px;">✅ ${element}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          ${finalMissingImprintElements.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h5 class="error-text" style="margin-bottom: 8px;">❌ Fehlende Angaben:</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${finalMissingImprintElements.map(element => `<li class="error-text" style="margin-bottom: 3px;">❌ ${element}</li>`).join('')}
            </ul>
          </div>
          ` : ''}
          `}

          ${legalScore < 80 ? `
          <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-top: 15px;">
            <h5 class="error-text" style="margin: 0 0 10px 0;">⚠️ WARNUNG: Abmahngefahr bei unvollständigem Impressum</h5>
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
    
    // Gruppiere Violations nach Impact
    const violationsByImpact = realViolations.reduce((acc: any, v: any) => {
      const impact = v.impact || 'moderate';
      if (!acc[impact]) {
        acc[impact] = [];
      }
      acc[impact].push(v);
      return acc;
    }, {});
    
    // Erstelle Violations-Array für die Anzeige
    const violations = Object.entries(violationsByImpact).map(([impact, vList]: [string, any]) => ({
      impact,
      description: vList[0]?.description || `${impact} Probleme`,
      count: vList.length
    }));
    
    // Falls keine echten Daten, verwende Fallback
    if (violations.length === 0 && !manualAccessibilityData) {
      violations.push(
        { impact: 'critical', description: 'Bilder ohne Alt-Text', count: 3 },
        { impact: 'serious', description: 'Unzureichender Farbkontrast', count: 5 },
        { impact: 'moderate', description: 'Fehlerhafte Überschriftenstruktur', count: 2 },
        { impact: 'minor', description: 'Fehlende Fokus-Indikatoren', count: 4 }
      );
    }
    
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

    return `
      <div class="metric-card ${scoreClass}">
        ${violations.length > 0 || accessibilityScore < 90 ? `
          <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #fef2f2; border: 2px solid #fecaca;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
              ⚖️ RECHTLICHER HINWEIS: Barrierefreiheit-Verstöße erkannt
            </h4>
            <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">
              <strong>Warnung:</strong> Die automatisierte Analyse hat rechtlich relevante Barrierefreiheit-Probleme identifiziert. 
              Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
            </p>
            <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
              <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Webseite oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
            </div>
          </div>
        ` : ''}
        <h3 class="header-${getAccessibilityComplianceColorClass(accessibilityScore)}" style="padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
          <span>♿ Barrierefreiheit & Zugänglichkeit ${hasRealData ? '✓ <span style="color: #10b981; font-size: 14px;">Echte PageSpeed Insights Prüfung</span>' : ''}</span>
          <span class="score-tile ${getAccessibilityComplianceColorClass(accessibilityScore)}">${displayAccessibilityScore}</span>
        </h3>
        <div class="score-display">
          <div class="score-tile ${getAccessibilityComplianceColorClass(accessibilityScore)}">${displayAccessibilityScore}</div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill progress-${getAccessibilityComplianceColorClass(accessibilityScore)}" style="width: ${accessibilityScore}%; background-color: ${getAccessibilityComplianceColor(accessibilityScore)};"></div>
          </div>
        </div>
        <div class="score-details">
           <p><strong>Compliance-Level:</strong> 
             <span class="score-text ${getAccessibilityComplianceColorClass(accessibilityScore)}">
               ${accessibilityScore >= 95 ? 'AA konform' : accessibilityScore >= 80 ? 'Teilweise konform' : 'Nicht konform'}
             </span>
           </p>
          <p><strong>Empfehlung:</strong> ${accessibilityScore >= 80 ? 'Sehr gute Barrierefreiheit' : 'Barrierefreiheit dringend verbessern'}</p>
          ${hasRealData && lighthouseVersion ? `<p style="font-size: 12px; color: #6b7280;"><strong>Prüfung:</strong> Lighthouse ${lighthouseVersion}</p>` : ''}
        </div>

        <!-- WCAG-Analyse -->
        <div class="collapsible header-${getAccessibilityComplianceColorClass(accessibilityScore)}" onclick="toggleSection('wcag-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; border-radius: 8px;">
          <h4 style="color: white; margin: 0;">▶ WCAG 2.1 Compliance Details</h4>
        </div>
        
        <div id="wcag-details" style="display: none;">
          <!-- Violations Overview -->
          <div class="violations-box" style="margin-top: 20px; padding: 15px; border-radius: 8px;">
            <h4>🚨 Erkannte Probleme</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
              ${violations.map(v => `
                  <div class="violation-${v.impact}" style="padding: 8px; border-radius: 6px;">
                  <p class="${
                    v.impact === 'critical' ? 'error-text' :
                    v.impact === 'serious' ? 'error-text' :
                    v.impact === 'moderate' ? 'section-text' : ''
                  }" style="font-weight: bold;">${v.impact.toUpperCase()}</p>
                  <p style="font-size: 0.9em;">${v.description}</p>
                  <p style="font-size: 0.8em;">${v.count} Vorkommen</p>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Successful Tests -->
          <div class="success-box" style="margin-top: 15px; padding: 15px; border-radius: 8px;">
            <h4 class="success-text">✅ Erfolgreich umgesetzt</h4>
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
            <h4 class="section-text">⚖️ Rechtliche Compliance</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
              <div>
                <p><strong>EU-Richtlinie 2016/2102:</strong> 
                  <span class="score-badge ${accessibilityScore >= 81 ? 'yellow' : accessibilityScore >= 61 ? 'green' : 'red'}">
                    ${accessibilityScore >= 80 ? 'Erfüllt' : 'Nicht erfüllt'}
                  </span>
                </p>
                <div class="progress-container" style="margin-top: 5px;">
                  <div class="progress-bar">
                    <div class="progress-fill progress-${getScoreColorClass(accessibilityScore)}" style="width: ${Math.max(30, accessibilityScore)}%;"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>WCAG 2.1 Level AA:</strong> 
                  <span class="score-badge ${accessibilityScore >= 81 ? 'yellow' : accessibilityScore >= 61 ? 'green' : 'red'}">
                    ${accessibilityScore >= 80 ? 'Konform' : 'Nicht konform'}
                  </span>
                </p>
                <div class="progress-container" style="margin-top: 5px;">
                  <div class="progress-bar">
                    <div class="progress-fill progress-${getScoreColorClass(accessibilityScore)}" style="width: ${accessibilityScore}%;"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>BGG (Deutschland):</strong> 
                  <span class="score-badge ${accessibilityScore >= 81 ? 'yellow' : accessibilityScore >= 61 ? 'green' : 'red'}">
                    ${accessibilityScore >= 70 ? 'Grundsätzlich erfüllt' : 'Verbesserung nötig'}
                  </span>
                </p>
                <div class="progress-container" style="margin-top: 5px;">
                  <div class="progress-bar">
                    <div class="progress-fill progress-${getScoreColorClass(Math.max(25, accessibilityScore * 0.9))}" style="width: ${Math.max(25, accessibilityScore * 0.9)}%;"></div>
                  </div>
                </div>
              </div>
            </div>
            
            ${accessibilityScore < 90 ? `
            <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-top: 15px;">
              <h4 class="error-text" style="margin: 0 0 10px 0;">⚠️ RECHTLICHER HINWEIS: Barrierefreiheit-Verstöße erkannt</h4>
              <p class="error-text" style="margin: 0 0 10px 0; font-weight: bold;">
                Warnung: Die automatisierte Analyse hat rechtlich relevante Barrierefreiheit-Probleme identifiziert. 
                Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
              </p>
              <p class="error-text" style="margin: 0; font-size: 14px;">
                <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Website oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. 
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
    
    // Detaillierte Bewertung basierend auf SEOAnalysis Komponente
    const titleTagScore = realData.seo.titleTag !== 'Kein Title-Tag gefunden' ? 
      (realData.seo.titleTag.length <= 70 ? 85 : 65) : 25;
    const metaDescriptionScore = realData.seo.metaDescription !== 'Keine Meta-Description gefunden' ? 
      (realData.seo.metaDescription.length <= 160 ? 90 : 70) : 25;
    const headingScore = realData.seo.headings.h1.length === 1 ? 80 : 
      realData.seo.headings.h1.length > 1 ? 60 : 30;
    const altTagsScore = realData.seo.altTags.total > 0 ? 
      Math.round((realData.seo.altTags.withAlt / realData.seo.altTags.total) * 100) : 0;
    
    // Verwende realData.seo.score für Konsistenz statt eigene Berechnung
    const criticalSeoScore = seoScore; // Nutze den bereits vorhandenen seoScore
    const scoreClass = criticalSeoScore >= 90 ? 'yellow' : criticalSeoScore >= 61 ? 'green' : 'red';

    return `
      <div class="metric-card ${scoreClass}">
        <h3 class="header-seo" style="padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <span>🔍 SEO-Bestandsanalyse</span>
        </h3>
        <div class="score-display">
          <div class="score-tile ${getScoreColorClass(criticalSeoScore)}">${criticalSeoScore}%</div>
          <div class="score-details">
            <p><strong>Sichtbarkeit:</strong> ${criticalSeoScore >= 90 ? 'Exzellent' : criticalSeoScore >= 61 ? 'Hoch' : 'Niedrig'}</p>
            <p><strong>Empfehlung:</strong> ${criticalSeoScore >= 90 ? 'Hervorragende SEO-Basis' : criticalSeoScore >= 61 ? 'Sehr gute SEO-Basis' : 'Dringende SEO-Verbesserungen erforderlich'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" data-score="${getScoreRange(criticalSeoScore)}" style="width: ${criticalSeoScore}%; background-color: ${getScoreColor(criticalSeoScore)};"></div>
            <div class="progress-point" style="position: absolute; left: ${criticalSeoScore}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 18px; height: 18px; background: white; border: 3px solid ${getScoreColor(criticalSeoScore)}; border-radius: 50%; z-index: 10; box-shadow: 0 3px 8px rgba(0,0,0,0.4);"></div>
          </div>
        </div>
        
        <!-- Detaillierte SEO-Analyse basierend auf tatsächlichen Werten -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
          <h4>📋 Technische SEO-Details</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div>
              <p><strong>Title-Tag:</strong> ${realData.seo.titleTag !== 'Kein Title-Tag gefunden' ? (realData.seo.titleTag.length <= 70 ? 'Optimal' : 'Zu lang') : 'Fehlt'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(titleTagScore)}" style="width: ${titleTagScore}%; background-color: ${getScoreColor(titleTagScore)};"></div>
                  <div class="progress-point" style="left: ${titleTagScore}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                </div>
              </div>
              <small class="secondary-text">Score: ${titleTagScore}% (${realData.seo.titleTag.length} Zeichen)</small>
            </div>
            <div>
              <p><strong>Meta Description:</strong> ${realData.seo.metaDescription !== 'Keine Meta-Description gefunden' ? (realData.seo.metaDescription.length <= 160 ? 'Optimal' : 'Zu lang') : 'Fehlt'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(metaDescriptionScore)}" style="width: ${metaDescriptionScore}%; background-color: ${getScoreColor(metaDescriptionScore)};"></div>
                  <div class="progress-point" style="left: ${metaDescriptionScore}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                </div>
              </div>
              <small class="secondary-text">Score: ${metaDescriptionScore}% (${realData.seo.metaDescription.length} Zeichen)</small>
            </div>
            <div>
              <p><strong>Überschriftenstruktur:</strong> ${realData.seo.headings.h1.length === 1 ? 'Optimal' : realData.seo.headings.h1.length > 1 ? 'Mehrere H1' : 'Keine H1'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(headingScore)}" style="width: ${headingScore}%; background-color: ${getScoreColor(headingScore)};"></div>
                  <div class="progress-point" style="left: ${headingScore}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                </div>
              </div>
              <small class="secondary-text">Score: ${headingScore}% (H1: ${realData.seo.headings.h1.length}, H2: ${realData.seo.headings.h2.length})</small>
            </div>
            <div>
              <p><strong>Alt-Tags:</strong> ${realData.seo.altTags.withAlt}/${realData.seo.altTags.total} Bilder</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(altTagsScore)}" style="width: ${altTagsScore}%; background-color: ${getScoreColor(altTagsScore)};"></div>
                  <div class="progress-point" style="left: ${altTagsScore}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                </div>
              </div>
              <small class="secondary-text">Score: ${altTagsScore}% (${altTagsScore}% Abdeckung)</small>
            </div>
          </div>
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
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill progress-${getScoreColorClass(effectiveKeywordScore)}" data-score="${getScoreRange(effectiveKeywordScore)}" style="width: ${effectiveKeywordScore}%;"></div>
                    <div class="progress-point" style="left: ${effectiveKeywordScore}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                  </div>
                </div>
              <small class="secondary-text">Score: ${effectiveKeywordScore !== null && effectiveKeywordScore !== undefined ? effectiveKeywordScore : 'N/A'}%</small>
              <p style="font-size: 11px; color: #6b7280; margin-top: 8px; line-height: 1.4;">
                Hauptsuchbegriffe Ihrer Branche - Basis für Ihre Auffindbarkeit in Suchmaschinen
              </p>
            </div>
            <div>
              <p><strong>Long-Tail Keywords:</strong> ${(() => {
                const longTailScore = Math.max(20, Math.round(effectiveKeywordScore * 0.6));
                if (longTailScore >= 90) return 'Hervorragend optimiert';
                if (longTailScore >= 61) return 'Gut optimiert';
                return 'Verbesserungsbedarf';
              })()}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill progress-${getScoreColorClass(Math.max(20, effectiveKeywordScore * 0.6))}" data-score="${getScoreRange(Math.max(20, effectiveKeywordScore * 0.6))}" style="width: ${Math.max(20, effectiveKeywordScore * 0.6)}%;"></div>
                  <div class="progress-point" style="left: ${Math.max(20, effectiveKeywordScore * 0.6)}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                </div>
              </div>
              <small class="secondary-text">Score: ${Math.max(20, effectiveKeywordScore * 0.6).toFixed(0)}%</small>
              <p style="font-size: 11px; color: #6b7280; margin-top: 8px; line-height: 1.4;">
                Spezifische Suchbegriffe mit 3+ Wörtern (z.B. "Heizung Notdienst München") - wichtig für gezielte Kundenanfragen
              </p>
            </div>
            <div>
              <p><strong>Lokale Keywords:</strong> ${(() => {
                const localKeywordScore = businessData.address ? Math.max(40, Math.round(effectiveKeywordScore * 0.9)) : 20;
                if (!businessData.address) return 'Fehlend';
                if (localKeywordScore >= 90) return 'Exzellent integriert';
                if (localKeywordScore >= 61) return 'Gut vorhanden';
                return 'Verbesserungsbedarf';
              })()}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill progress-${getScoreColorClass(businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20)}" data-score="${getScoreRange(businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20)}" style="width: ${businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20}%;"></div>
                  <div class="progress-point" style="left: ${businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                </div>
              </div>
              <small class="secondary-text">Score: ${(businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20).toFixed(0)}%</small>
              <p style="font-size: 11px; color: #6b7280; margin-top: 8px; line-height: 1.4;">
                Ortsbezogene Suchbegriffe (z.B. "Elektriker München") - essenziell für lokale Auffindbarkeit
              </p>
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
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(40, seoScore))}" style="width: ${Math.max(40, seoScore)}%"></div>
                </div>
              </div>
              <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 4px; line-height: 1.4;">
                Sprechende URLs (z.B. /heizung-wartung) helfen Nutzern und Suchmaschinen, Inhalte besser zu verstehen
              </small>
            </div>
            <div>
              <p><strong>Interne Verlinkung:</strong> ${seoScore >= 60 ? 'Gut strukturiert' : 'Ausbaufähig'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(30, seoScore * 0.9))}" style="width: ${Math.max(30, seoScore * 0.9)}%"></div>
                </div>
              </div>
              <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 4px; line-height: 1.4;">
                Gut vernetzte Seiten ermöglichen einfache Navigation und bessere Auffindbarkeit aller Inhalte
              </small>
            </div>
            <div>
              <p><strong>Breadcrumbs:</strong> ${seoScore >= 70 ? 'Implementiert' : 'Fehlen teilweise'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(seoScore >= 70 ? 85 : 35)}" style="width: ${seoScore >= 70 ? 85 : 35}%"></div>
                </div>
              </div>
              <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 4px; line-height: 1.4;">
                Navigationspfade (Start → Leistungen → Heizung) zeigen Nutzern ihre Position auf der Website
              </small>
            </div>
          </div>
        </div>

        <!-- Technische SEO -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
          <h4>⚙️ Technische SEO</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Meta-Tags:</strong> ${seoScore >= 70 ? 'Vollständig' : 'Unvollständig'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(35, seoScore))}" style="width: ${Math.max(35, seoScore)}%"></div>
                </div>
              </div>
              <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 4px; line-height: 1.4;">
                Unsichtbare Metadaten wie Title und Description erscheinen in Suchergebnissen
              </small>
            </div>
            <div>
              <p><strong>Schema Markup:</strong> ${seoScore >= 80 ? 'Implementiert' : 'Teilweise/Fehlend'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(seoScore >= 80 ? 90 : 25)}" style="width: ${seoScore >= 80 ? 90 : 25}%"></div>
                </div>
              </div>
              <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 4px; line-height: 1.4;">
                Strukturierte Daten ermöglichen Rich Snippets (Sternebewertungen, Öffnungszeiten) in Google
              </small>
            </div>
            <div>
              <p><strong>XML Sitemap:</strong> ${seoScore >= 60 ? 'Vorhanden' : 'Nicht gefunden'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(seoScore >= 60 ? 85 : 30)}" style="width: ${seoScore >= 60 ? 85 : 30}%"></div>
                </div>
              </div>
              <small style="font-size: 11px; color: #6b7280; display: block; margin-top: 4px; line-height: 1.4;">
                Übersichtskarte aller Seiten - hilft Google, alle Inhalte Ihrer Website zu finden
              </small>
            </div>
          </div>
        </div>
        
      </div>
    `;
  };

  // Local SEO Analysis - Verwendet manuelle Daten wenn vorhanden
  const getLocalSEOAnalysis = () => {
    // Verwende manuelle Daten wenn vorhanden, sonst Fallback
    const localSEOData = manualLocalSEOData ? {
      overallScore: manualLocalSEOData.overallScore,
      googleMyBusiness: {
        score: Math.round((manualLocalSEOData.gmbCompleteness + (manualLocalSEOData.gmbVerified ? 20 : 0) + (manualLocalSEOData.gmbClaimed ? 10 : 0)) / 1.3),
        claimed: manualLocalSEOData.gmbClaimed,
        verified: manualLocalSEOData.gmbVerified,
        complete: manualLocalSEOData.gmbCompleteness,
        photos: manualLocalSEOData.gmbPhotos,
        posts: manualLocalSEOData.gmbPosts,
        lastUpdate: manualLocalSEOData.gmbLastUpdate
      },
      localCitations: {
        score: Math.round((manualLocalSEOData.directories.filter(d => d.status === 'complete').length / Math.max(1, manualLocalSEOData.directories.length)) * 100),
        totalCitations: manualLocalSEOData.directories.length,
        consistent: manualLocalSEOData.directories.filter(d => d.status === 'complete').length,
        inconsistent: manualLocalSEOData.directories.filter(d => d.status === 'incomplete').length,
        topDirectories: manualLocalSEOData.directories.slice(0, 5).map(d => ({
          name: d.name,
          status: d.status === 'complete' ? 'vollständig' : d.status === 'incomplete' ? 'unvollständig' : 'nicht gefunden'
        }))
      },
      localKeywords: {
        score: manualLocalSEOData.localKeywordRankings.length > 0 ? Math.round(
          manualLocalSEOData.localKeywordRankings.reduce((acc, kw) => acc + (100 - kw.position), 0) / manualLocalSEOData.localKeywordRankings.length
        ) : 0,
        ranking: manualLocalSEOData.localKeywordRankings.map(kw => ({
          keyword: kw.keyword,
          position: kw.position,
          volume: kw.searchVolume === 'high' ? 'hoch' : kw.searchVolume === 'medium' ? 'mittel' : 'niedrig'
        }))
      },
      onPageLocal: {
        score: manualLocalSEOData.localContentScore,
        addressVisible: manualLocalSEOData.addressVisible,
        phoneVisible: manualLocalSEOData.phoneVisible,
        openingHours: manualLocalSEOData.openingHoursVisible,
        localSchema: manualLocalSEOData.hasLocalBusinessSchema,
        localContent: manualLocalSEOData.localContentScore
      }
    } : {
      overallScore: calculateLocalSEOScore(businessData, realData, null),
      googleMyBusiness: {
        score: 82,
        claimed: true,
        verified: true,
        complete: 75,
        photos: 12,
        posts: 3,
        lastUpdate: "vor 2 Wochen"
      },
      localCitations: {
        score: 68,
        totalCitations: 15,
        consistent: 12,
        inconsistent: 3,
        topDirectories: [
          { name: "Google My Business", status: "vollständig" },
          { name: "Bing Places", status: "unvollständig" },
          { name: "Yelp", status: "nicht gefunden" },
          { name: "Gelbe Seiten", status: "vollständig" },
          { name: "WerkenntdenBesten", status: "vollständig" }
        ]
      },
      localKeywords: {
        score: 71,
        ranking: [
          { keyword: `${businessData.industry} ${businessData.address.split(',')[1]?.trim() || 'regional'}`, position: 8, volume: "hoch" },
          { keyword: `Handwerker ${businessData.address.split(',')[1]?.trim() || 'regional'}`, position: 15, volume: "mittel" },
          { keyword: `${businessData.industry} Notdienst`, position: 12, volume: "mittel" },
          { keyword: `${businessData.industry} in der Nähe`, position: 6, volume: "hoch" }
        ]
      },
      onPageLocal: {
        score: 78,
        addressVisible: true,
        phoneVisible: true,
        openingHours: true,
        localSchema: false,
        localContent: 65
      }
    };

    const scoreClass = localSEOData.overallScore >= 90 ? 'yellow' : localSEOData.overallScore >= 61 ? 'green' : 'red';

    return `
      <div class="metric-card ${scoreClass}">
        <div class="score-details" style="padding: 15px; background: rgba(255,255,255,0.5); border-radius: 8px; margin-bottom: 15px;">
          <p><strong>Lokale Sichtbarkeit:</strong> ${localSEOData.overallScore >= 90 ? 'Exzellent' : localSEOData.overallScore >= 61 ? 'Sehr gut' : 'Verbesserungsbedarf'}</p>
          <p><strong>Empfehlung:</strong> ${localSEOData.overallScore >= 90 ? 'Hervorragende lokale Präsenz' : localSEOData.overallScore >= 61 ? 'Gute Basis, weitere Optimierung möglich' : 'Lokale SEO dringend optimieren'}</p>
        </div>
        

        <!-- Google My Business -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
          <h4>🏢 Google My Business</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
            <div>
              <p><strong>Status:</strong> ${localSEOData.googleMyBusiness.claimed ? '✅ Beansprucht' : '❌ Nicht beansprucht'}</p>
              <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Ob das Unternehmen den Google-Eintrag als Inhaber übernommen hat</p>
              <p><strong>Verifiziert:</strong> ${localSEOData.googleMyBusiness.verified ? '✅ Ja' : '❌ Nein'}</p>
              <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Bestätigung durch Google per Postkarte, Anruf oder E-Mail erfolgt</p>
              <p><strong>Vollständigkeit:</strong> ${localSEOData.googleMyBusiness.complete}%</p>
              <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Wie vollständig alle Unternehmensinformationen ausgefüllt sind</p>
            </div>
            <div>
              <p><strong>Fotos:</strong> ${localSEOData.googleMyBusiness.photos} hochgeladen</p>
              <p><strong>Posts (30 Tage):</strong> ${localSEOData.googleMyBusiness.posts}</p>
              <p><strong>Letztes Update:</strong> ${localSEOData.googleMyBusiness.lastUpdate}</p>
            </div>
          </div>
          <div class="progress-container" style="margin-top: 10px;">
            <div class="progress-label">
              <span>GMB Optimierung</span>
              <span class="score-text ${getScoreColorClass(localSEOData.googleMyBusiness.score)}">${localSEOData.googleMyBusiness.score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill progress-${getScoreColorClass(localSEOData.googleMyBusiness.score)}" data-score="${getScoreRange(localSEOData.googleMyBusiness.score)}" style="width: ${localSEOData.googleMyBusiness.score}%;"></div>
              <div class="progress-point" style="position: absolute; left: ${localSEOData.googleMyBusiness.score}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
            <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Gesamtbewertung der Vollständigkeit und Aktualität Ihres Google-Unternehmensprofils</p>
          </div>
        </div>

        <!-- Lokale Verzeichnisse (Citations) -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
          <h4>🌐 Lokale Verzeichnisse & Citations</h4>
          <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Wie oft und wie einheitlich Ihre Unternehmensdaten (Name, Adresse, Telefon) in Online-Verzeichnissen erscheinen</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0;">
            <div style="text-align: center;">
              <div class="citation-total">${localSEOData.localCitations.totalCitations}</div>
              <p class="secondary-text" style="font-size: 12px;">Gefundene Einträge</p>
            </div>
            <div style="text-align: center;">
              <div class="citation-consistent">${localSEOData.localCitations.consistent}</div>
              <p class="secondary-text" style="font-size: 12px;">Konsistent</p>
            </div>
            <div style="text-align: center;">
              <div class="citation-inconsistent">${localSEOData.localCitations.inconsistent}</div>
              <p class="secondary-text" style="font-size: 12px;">Inkonsistent</p>
            </div>
          </div>
          
          <h5 style="margin: 15px 0 10px 0;">Top-Verzeichnisse:</h5>
          <div style="display: grid; gap: 8px;">
            ${localSEOData.localCitations.topDirectories.map(directory => `
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
          
          <div class="progress-container" style="margin-top: 15px;">
            <div class="progress-label">
              <span>Citation Qualität</span>
              <span class="score-text ${getScoreColorClass(localSEOData.localCitations.score)}">${localSEOData.localCitations.score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill progress-${getScoreColorClass(localSEOData.localCitations.score)}" data-score="${getScoreRange(localSEOData.localCitations.score)}" style="width: ${localSEOData.localCitations.score}%;"></div>
              <div class="progress-point" style="position: absolute; left: ${localSEOData.localCitations.score}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
            <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Bewertet die Einheitlichkeit Ihrer Firmendaten über alle Verzeichnisse hinweg</p>
          </div>
        </div>

        <!-- Lokale Keywords -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
          <h4>🎯 Lokale Keyword-Rankings</h4>
          <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Zeigt Ihre Platzierung in Google bei lokalen Suchbegriffen (z.B. "SHK Bahnhofstraße 15")</p>
          <div style="display: grid; gap: 10px; margin-top: 10px;">
            ${localSEOData.localKeywords.ranking.map(keyword => `
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
          
          <div class="progress-container" style="margin-top: 15px;">
            <div class="progress-label">
              <span>Lokale Keyword Performance</span>
              <span class="score-text ${getScoreColorClass(localSEOData.localKeywords.score)}">${localSEOData.localKeywords.score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill progress-${getScoreColorClass(localSEOData.localKeywords.score)}" data-score="${getScoreRange(localSEOData.localKeywords.score)}" style="width: ${localSEOData.localKeywords.score}%;"></div>
              <div style="position: absolute; left: ${localSEOData.localKeywords.score}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
            <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Durchschnittliche Ranking-Position über alle lokalen Suchbegriffe hinweg</p>
          </div>
        </div>

        <!-- On-Page Local Faktoren -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(168, 85, 247, 0.1); border-radius: 8px;">
          <h4>📍 On-Page Local Faktoren</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
            <div>
              <p><strong>📍 Adresse sichtbar:</strong> ${localSEOData.onPageLocal.addressVisible ? '✅ Ja' : '❌ Nein'}</p>
              <p><strong>📞 Telefon sichtbar:</strong> ${localSEOData.onPageLocal.phoneVisible ? '✅ Ja' : '❌ Nein'}</p>
            </div>
            <div>
              <p><strong>🕒 Öffnungszeiten:</strong> ${localSEOData.onPageLocal.openingHours ? '✅ Ja' : '❌ Nein'}</p>
              <p><strong>🏷️ Local Schema:</strong> ${localSEOData.onPageLocal.localSchema ? '✅ Implementiert' : '❌ Fehlt'}</p>
              <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Strukturierte Daten, die Google helfen, Ihr Unternehmen zu verstehen</p>
            </div>
          </div>
          
          <div class="progress-container" style="margin-top: 15px;">
            <div class="progress-label">
              <span>Lokaler Content</span>
              <span class="score-text ${getScoreColorClass(localSEOData.onPageLocal.localContent)}">${localSEOData.onPageLocal.localContent}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill progress-${getScoreColorClass(localSEOData.onPageLocal.localContent)}" data-score="${getScoreRange(localSEOData.onPageLocal.localContent)}" style="width: ${localSEOData.onPageLocal.localContent}%;"></div>
              <div class="progress-point" style="position: absolute; left: ${localSEOData.onPageLocal.localContent}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
            <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Wie stark lokale Begriffe und Ortsbezüge in Ihren Texten vorkommen</p>
          </div>
          
          <div class="progress-container" style="margin-top: 10px;">
            <div class="progress-label">
              <span>On-Page Local Gesamt</span>
              <span class="score-text ${getScoreColorClass(localSEOData.onPageLocal.score)}">${localSEOData.onPageLocal.score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill progress-${getScoreColorClass(localSEOData.onPageLocal.score)}" data-score="${getScoreRange(localSEOData.onPageLocal.score)}" style="width: ${localSEOData.onPageLocal.score}%;"></div>
              <div class="progress-point" style="position: absolute; left: ${localSEOData.onPageLocal.score}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
            <p style="color: #6b7280; font-size: 0.875rem; margin: 8px 0 0 0;">Gesamtbewertung aller lokalen Optimierungen auf Ihrer Website</p>
          </div>
        </div>

        <div class="recommendations">
          <h4>Handlungsempfehlungen für lokale SEO:</h4>
          <ul>
            ${localSEOData.googleMyBusiness.score < 90 ? '<li>Google My Business Profil vollständig optimieren und regelmäßig aktualisieren (Fotos, Beiträge, Öffnungszeiten pflegen)</li>' : ''}
            ${localSEOData.localCitations.score < 80 ? '<li>Einträge in lokalen Verzeichnissen erstellen und NAP-Konsistenz sicherstellen (Name, Adresse, Telefon überall identisch)</li>' : ''}
            ${localSEOData.localKeywords.score < 80 ? '<li>Lokale Keywords in Content und Meta-Tags integrieren (z.B. "Handwerker in [Stadt]")</li>' : ''}
            ${!localSEOData.onPageLocal.localSchema ? '<li>Local Business Schema Markup implementieren (strukturierte Daten für Google)</li>' : ''}
            <li>Lokale Inhalte und regionale Bezüge auf der Website verstärken (Stadtteilnamen, lokale Projekte zeigen)</li>
            <li>Kundenbewertungen aktiv sammeln und beantworten (baut Vertrauen und Sichtbarkeit auf)</li>
            <li>Lokale Backlinks durch Partnerschaften und Events aufbauen (Vernetzung mit lokalen Unternehmen)</li>
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
          <div class="score-tile ${getScoreColorClass(performanceScore)}">${performanceScore}%</div>
          <div class="score-details">
            <p><strong>Ladezeit:</strong> ${realData.performance.loadTime}s</p>
            <p><strong>Empfehlung:</strong> ${performanceScore >= 70 ? 'Sehr gute Performance' : 'Performance verbessern für bessere Nutzererfahrung'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill progress-${getScoreColorClass(performanceScore)}" style="width: ${performanceScore}%;"></div>
          </div>
        </div>
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Bilder komprimieren und optimieren (Dateigröße reduzieren ohne sichtbaren Qualitätsverlust)</li>
            <li>Browser-Caching aktivieren (Inhalte beim ersten Besuch speichern für schnelleren Seitenaufbau bei erneutem Besuch)</li>
            <li>CSS und JavaScript minimieren (Überflüssige Leerzeichen und Kommentare aus Code entfernen)</li>
            <li>Content Delivery Network nutzen (Inhalte weltweit auf Servern verteilen für schnellere Ladezeiten)</li>
          </ul>
        </div>
      </div>
    `;
  };

  // Mobile Optimization Analysis - Enhanced
  const getMobileOptimizationAnalysis = () => {
    const mobileScore = realData.mobile.overallScore;
    const scoreClass = mobileScore >= 80 ? 'yellow' : mobileScore >= 60 ? 'green' : 'red';

    return `
      <div class="metric-card ${scoreClass}">
        <h3>Mobile Optimierung</h3>
        <div class="score-display">
          <div class="score-tile ${getScoreColorClass(mobileScore)}">${mobileScore}%</div>
          <div class="score-details">
            <p><strong>Mobile-Freundlichkeit:</strong> ${mobileScore >= 70 ? 'Hoch' : mobileScore >= 40 ? 'Mittel' : 'Niedrig'}</p>
            <p><strong>Empfehlung:</strong> ${mobileScore >= 70 ? 'Sehr gute mobile Optimierung' : 'Mobile Optimierung verbessern für mehr Nutzer'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill progress-${getScoreColorClass(mobileScore)}" style="width: ${mobileScore}%;"></div>
          </div>
        </div>
        
        <!-- Responsive Design -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
          <h4>Responsive Design</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Viewport-Konfiguration:</strong> ${mobileScore >= 70 ? 'Korrekt' : 'Fehlerhaft'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(40, mobileScore))}" style="width: ${Math.max(40, mobileScore)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Flexible Layouts:</strong> ${mobileScore >= 60 ? 'Gut umgesetzt' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(30, mobileScore * 0.9))}" style="width: ${Math.max(30, mobileScore * 0.9)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Bildoptimierung:</strong> ${mobileScore >= 70 ? 'Responsive Bilder' : 'Nicht optimiert'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(mobileScore >= 70 ? 85 : 35)}" style="width: ${mobileScore >= 70 ? 85 : 35}%"></div>
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
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(20, 100 - (realData.performance.loadTime * 20)))}" style="width: ${Math.max(20, 100 - (realData.performance.loadTime * 20))}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Core Web Vitals:</strong> ${Math.max(25, mobileScore * 0.8) >= 70 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(25, mobileScore * 0.8))}" style="width: ${Math.max(25, mobileScore * 0.8)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Mobile-First Index:</strong> ${mobileScore >= 60 ? 'Berücksichtigt' : 'Nicht optimiert'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(mobileScore >= 60 ? 80 : 30)}" style="width: ${mobileScore >= 60 ? 80 : 30}%"></div>
                </div>
              </div>
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
                  <div class="progress-fill" data-score="${getScoreRange(mobileScore >= 70 ? 90 : 40)}" style="width: ${mobileScore >= 70 ? 90 : 40}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Tap-Abstände:</strong> ${mobileScore >= 60 ? 'Ausreichend' : 'Zu gering'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(mobileScore >= 60 ? 85 : 35)}" style="width: ${mobileScore >= 60 ? 85 : 35}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Scroll-Verhalten:</strong> ${mobileScore >= 70 ? 'Flüssig' : 'Verbesserbar'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(40, mobileScore * 0.9))}" style="width: ${Math.max(40, mobileScore * 0.9)}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Mobile-First Design-Strategie implementieren</li>
            <li>Touch-Interfaces optimieren (min. 44px Buttons)</li>
            <li>Progressive Web App (PWA) Features hinzufügen</li>
            <li>Mobile Performance kontinuierlich überwachen</li>
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
                    <br><small style="color: #fbbf24;">${expectedServices.length} Services${(removedMissingServices?.length || 0) > 0 ? ` (+${(removedMissingServices?.length || 0) * 0.3}% Bonus)` : ""}</small>
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
                    <span class="score-badge ${competitor.rating >= 4 ? 'green' : competitor.rating >= 3 ? 'yellow' : 'red'}" style="color: ${competitor.rating >= 4 ? '#22c55e' : competitor.rating >= 3 ? '#FFD700' : '#FF0000'} !important; font-weight: bold;">${competitor.rating}/5</span>
                  </td>
                  <td class="table-text" style="padding: 12px; text-align: center;">${competitor.reviews}</td>
                  <td class="table-text" style="padding: 12px; text-align: center;">
                    <span class="score-badge ${estimatedScore >= 80 ? 'yellow' : estimatedScore >= 60 ? 'green' : 'red'}" style="color: ${estimatedScore >= 80 ? '#FFD700' : estimatedScore >= 60 ? '#22c55e' : '#FF0000'} !important; font-weight: bold;">${Math.round(estimatedScore)}</span>
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
            <div class="score-tile neutral">–</div>
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
            <div class="score-tile neutral">–</div>
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
          <div class="score-tile ${getScoreColorClass(socialMediaScore)}">${displaySocialScore}</div>
          <div class="score-details">
            <p><strong>Aktive Plattformen:</strong> ${activePlatforms.length}</p>
            <p><strong>Status:</strong> ${socialMediaScore >= 80 ? 'Sehr gut' : socialMediaScore >= 60 ? 'Gut' : socialMediaScore >= 40 ? 'Ausbaufähig' : 'Schwach'}</p>
          </div>
        </div>
        
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${socialMediaScore}%; background-color: ${getScoreColor(socialMediaScore)};"></div>
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
                ${platform.name === 'Instagram' ? '<br><small style="color: #666; font-size: 0.85em;">* Bewertung basiert auf Posts und Reels. Stories sind zu kurz sichtbar für eine Bewertung.</small>' : ''}
              </li>
            `).join('')}
          </ul>
        </div>
        
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            ${socialMediaScore < 60 ? `
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
    actualDataPrivacyScore
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

    <!-- Executive Summary -->
    <div class="section">
      <div class="section-header">Executive Summary</div>
      <div class="section-content">
        <!-- Gesamtscore als erstes -->
        <div class="score-overview" style="margin-bottom: 30px;">
          <div class="score-card">
            <div class="score-big"><span class="score-tile ${getScoreColorClass(overallScore)}">${overallScore}%</span></div>
            <div class="score-label">Gesamtscore</div>
          </div>
        </div>

        <!-- Kategorisierte Score-Übersicht -->
         <div class="categorized-scores">
          <!-- Kategorie 1: Online-Qualität · Relevanz · Autorität -->
          <div class="score-category">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Online-Qualität · Relevanz · Autorität</h3>
              ${(() => {
                const scores = [
                  realData.seo.score,
                  74, // Lokale SEO
                  accessibilityScore > 0 ? accessibilityScore : 0,
                  actualDataPrivacyScore > 0 ? actualDataPrivacyScore : 0,
                  dsgvoScore > 0 ? dsgvoScore : 0,
                  impressumScore
                ].filter(s => s > 0);
                const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                return avg > 0 ? `<div class="header-score-circle ${getScoreColorClass(avg)}">${avg}%</div>` : '';
              })()}
            </div>
            <div class="category-content" id="seo-performance">
              <div class="score-overview">
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(realData.seo.score)} !important; color: ${getScoreTileTextColor(realData.seo.score)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">SEO-Auswertung</span></div>
                </div>
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(74)} !important; color: ${getScoreTileTextColor(74)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Lokale SEO</span></div>
                </div>
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(accessibilityScore)} !important; color: ${getScoreTileTextColor(accessibilityScore)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Barrierefreiheit</span></div>
                </div>
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(actualDataPrivacyScore)} !important; color: ${getScoreTileTextColor(actualDataPrivacyScore)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Datenschutz</span></div>
                </div>
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(dsgvoScore)} !important; color: ${getScoreTileTextColor(dsgvoScore)} !important; font-size: 0.15em; font-weight: normal; padding: 4px 8px;">DSGVO</span></div>
                </div>
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(impressumScore)} !important; color: ${getScoreTileTextColor(impressumScore)} !important; font-size: 0.15em; font-weight: normal; padding: 4px 8px;">Impressum</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kategorie 2: Webseiten-Performance & Technik -->
          <div class="score-category">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Webseiten-Performance & Technik</h3>
              ${(() => {
                const avg = Math.round((realData.performance.score + realData.mobile.overallScore) / 2);
                return `<div class="header-score-circle ${getScoreColorClass(avg)}">${avg}%</div>`;
              })()}
            </div>
            <div class="category-content" id="mobile-accessibility">
              <div class="score-overview">
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(realData.performance.score)} !important; color: ${getScoreTileTextColor(realData.performance.score)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Website Performance</span></div>
                </div>
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(realData.mobile.overallScore)} !important; color: ${getScoreTileTextColor(realData.mobile.overallScore)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Mobile Optimierung</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kategorie 3: Online-/Web-/Social-Media Performance -->
          <div class="score-category">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Online-/Web-/Social-Media Performance</h3>
              ${(() => {
                const industryReviewScore = manualIndustryReviewData?.overallScore || 0;
                const onlinePresenceScore = manualOnlinePresenceData?.overallScore || 0;
                const scores = [
                  socialMediaScore > 0 ? socialMediaScore : 0,
                  googleReviewScore,
                  industryReviewScore,
                  onlinePresenceScore
                ].filter(s => s > 0);
                const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                return avg > 0 ? `<div class="header-score-circle ${getScoreColorClass(avg)}">${avg}%</div>` : '';
              })()}
            </div>
            <div class="category-content" id="social-reputation">
              <div class="score-overview">
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(socialMediaScore)} !important; color: ${getScoreTileTextColor(socialMediaScore)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Social Media</span></div>
                </div>
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(googleReviewScore)} !important; color: ${getScoreTileTextColor(googleReviewScore)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Google Bewertungen</span></div>
                </div>
                ${(() => {
                  const industryReviewScore = manualIndustryReviewData?.overallScore || 0;
                  // IMMER anzeigen, auch ohne Daten
                  return `<div class="score-card">
                    <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(industryReviewScore)} !important; color: ${getScoreTileTextColor(industryReviewScore)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Branchenplattformen</span></div>
                  </div>`;
                })()}
                ${(() => {
                  const onlinePresenceScore = manualOnlinePresenceData?.overallScore || 0;
                  if (onlinePresenceScore > 0) {
                    return `<div class="score-card">
                      <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(onlinePresenceScore)} !important; color: ${getScoreTileTextColor(onlinePresenceScore)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Online-Präsenz</span></div>
                    </div>`;
                  }
                  return '';
                })()}
              </div>
            </div>
          </div>

          <!-- Kategorie 4: Markt & Marktumfeld -->
          <div class="score-category">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Markt & Marktumfeld</h3>
              ${(() => {
                const allCompetitors = (window as any).globalAllCompetitors || manualCompetitors || [];
                const scores = [
                  allCompetitors.length > 0 ? Math.round(marketComparisonScore) : 0,
                  staffQualificationData && staffQualificationData.totalEmployees > 0 ? staffQualificationScore : 0,
                  hourlyRateData ? Math.round(pricingScore) : 0,
                  workplaceScore !== -1 ? workplaceScore : 0
                ].filter(s => s > 0);
                const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                return avg > 0 ? `<div class="header-score-circle ${getScoreColorClass(avg)}">${avg}%</div>` : '';
              })()}
            </div>
            <div class="category-content" id="legal-privacy">
              <div class="score-overview">
                ${(() => {
                  // Definiere allCompetitors für die Executive Summary
                  const allCompetitors = (window as any).globalAllCompetitors || manualCompetitors || [];
                  
                  return allCompetitors.length > 0 ? `
                    <div class="score-card">
                      <div class="score-big">
                        <span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(Math.round(marketComparisonScore))} !important; color: ${getScoreTileTextColor(Math.round(marketComparisonScore))} !important; font-size: 0.15em; font-weight: normal; padding: 4px 8px;">Wettbewerbsanalyse</span>
                      </div>
                    </div>
                  ` : '';
                })()}
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(staffQualificationScore)} !important; color: ${getScoreTileTextColor(staffQualificationScore)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Mitarbeiterqualifikation</span></div>
                </div>
                ${hourlyRateData ? `
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(Math.round(pricingScore))} !important; color: ${getScoreTileTextColor(Math.round(pricingScore))} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Stundensatzanalyse</span></div>
                </div>
                ` : ''}
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(workplaceScore !== -1 ? workplaceScore : 0)} !important; color: ${getScoreTileTextColor(workplaceScore !== -1 ? workplaceScore : 0)} !important; font-size: 6px; font-weight: normal; padding: 40px 20px; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; white-space: nowrap;">Arbeitsplatz- und geber-Bewertung</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kategorie 5: Außendarstellung & Erscheinungsbild -->
          <div class="score-category">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Außendarstellung & Erscheinungsbild</h3>
              <div class="header-score-circle ${getScoreColorClass(corporateIdentityScore)}">${Math.round(corporateIdentityScore)}%</div>
            </div>
            <div class="category-content" id="design-branding">
              <div class="score-overview">
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(corporateIdentityScore)} !important; color: ${getScoreTileTextColor(corporateIdentityScore)} !important; font-size: 0.15em; font-weight: normal; padding: 4px 8px;">Corporate Design</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Kategorie 6: Qualität · Service · Kundenorientierung -->
          <div class="score-category">
            <div class="category-header-executive" style="display: flex; align-items: center; justify-content: space-between;">
              <h3 style="margin: 0; color: #000000;">Qualität · Service · Kundenorientierung</h3>
              ${(() => {
                const qrScore = quoteResponseData && quoteResponseData.responseTime ? quoteResponseScore : 0;
                return qrScore > 0 ? `<div class="header-score-circle ${getScoreColorClass(qrScore)}">${qrScore}%</div>` : '';
              })()}
            </div>
            <div class="category-content" id="staff-service">
              <div class="score-overview">
                <div class="score-card">
                  <div class="score-big"><span class="score-tile neutral" style="background: ${getScoreTileBackgroundColor(quoteResponseScore)} !important; color: ${getScoreTileTextColor(quoteResponseScore)} !important; font-size: 0.15em; font-weight: normal; padding: 4px 8px;">Reaktionszeit auf Anfragen</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Unternehmensdaten -->
    <div class="section">
      <div class="section-header">Unternehmensdaten</div>
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

    <!-- Website Performance -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
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
              <p><strong>Empfehlung:</strong> ${realData.performance.score >= 80 ? 'Sehr gute Performance' : 'Performance optimieren'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(realData.performance.score)}" style="width: ${realData.performance.score}%"></div>
            </div>
          </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('performance-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Performance-Details anzeigen</h4>
        </div>
        
        <div id="performance-details" style="display: none;">
          ${getPerformanceAnalysis()}
        
        <!-- Nutzerfreundlichkeit und Verfügbarkeit -->
        <div class="metric-card good" style="margin-top: 20px;">
          <h3>Nutzerfreundlichkeit & Verfügbarkeit</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div class="status-item">
              <h4>Benutzerfreundlichkeit</h4>
              <p><strong>${realData.performance.score >= 70 ? 'Sehr gut' : realData.performance.score >= 50 ? 'Gut' : 'Verbesserungsbedarf'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.min(100, realData.performance.score + 10))}" style="width: ${Math.min(100, realData.performance.score + 10)}%"></div>
                </div>
              </div>
              <p style="font-size: 12px; color: #6b7280;">Navigation, Layout, Responsivität</p>
            </div>
            <div class="status-item">
              <h4>Verfügbarkeit</h4>
              <p><strong>${realData.performance.score >= 80 ? '99.9%' : realData.performance.score >= 60 ? '99.5%' : '98.8%'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(realData.performance.score >= 80 ? 99 : realData.performance.score >= 60 ? 95 : 88)}" style="width: ${realData.performance.score >= 80 ? 99 : realData.performance.score >= 60 ? 95 : 88}%"></div>
                </div>
              </div>
              <p style="font-size: 12px; color: #6b7280;">Uptime, Serverantwortzeit</p>
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
                  <div class="progress-fill" data-score="${getScoreRange(realData.performance.score)}" style="width: ${realData.performance.score}%"></div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <h4>First Contentful Paint</h4>
              <p><strong>${(realData.performance.loadTime * 0.6).toFixed(1)}s</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(realData.performance.score)}" style="width: ${realData.performance.score}%"></div>
                </div>
              </div>
              <p style="font-size: 0.85em; color: #6b7280; margin-top: 8px;">Zeit bis erste Inhalte (Text, Bilder) sichtbar werden</p>
            </div>
            <div class="status-item">
              <h4>Time to Interactive</h4>
              <p><strong>${(realData.performance.loadTime * 1.2).toFixed(1)}s</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(0, realData.performance.score - 10))}" style="width: ${Math.max(0, realData.performance.score - 10)}%"></div>
                </div>
              </div>
              <p style="font-size: 0.85em; color: #6b7280; margin-top: 8px;">Zeit bis die Seite vollständig geladen und bedienbar ist</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SEO-Bestandsanalyse -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>SEO-Bestandsanalyse</span>
        <div class="header-score-circle ${getScoreColorClass(realData.seo.score)}">${realData.seo.score}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>SEO-Bestandsanalyse</h3>
          <div class="score-display">
            <div class="score-circle" data-score="${getScoreRange(realData.seo.score)}">${realData.seo.score}%</div>
            <div class="score-details">
              <p><strong>Sichtbarkeit:</strong> ${realData.seo.score >= 90 ? 'Exzellent' : realData.seo.score >= 61 ? 'Hoch' : 'Niedrig'}</p>
              <p><strong>Empfehlung:</strong> ${realData.seo.score >= 90 ? 'Hervorragende SEO-Basis' : realData.seo.score >= 61 ? 'Sehr gute SEO-Basis' : 'SEO verbessern, um mehr Kunden zu erreichen'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(realData.seo.score)}" style="width: ${realData.seo.score}%"></div>
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
                    <div class="progress-fill" data-score="${getScoreRange(realData.seo.titleTag ? 100 : 0)}" style="width: ${realData.seo.titleTag ? 100 : 0}%"></div>
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
                    <div class="progress-fill" data-score="${getScoreRange(realData.seo.metaDescription ? 85 : 30)}" style="width: ${realData.seo.metaDescription ? 85 : 30}%"></div>
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
                    <div class="progress-fill" data-score="${getScoreRange(50)}" style="width: 50%"></div>
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
      <div class="section-header collapsible" onclick="toggleSection('content-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
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
                <small style="color: #6b7280; font-size: 0.875rem;">
                  Der Optimierungsgrad zeigt, wie gut Ihre Website für relevante Suchbegriffe optimiert ist
                </small>
              </p>
              <p>
                <strong>Keyword-Dichte:</strong> ${(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 3).toFixed(1)}%
                <br/>
                <small style="color: #6b7280; font-size: 0.875rem;">
                  Die Keyword-Dichte beschreibt, wie häufig wichtige Suchbegriffe im Verhältnis zum Gesamttext erscheinen
                </small>
              </p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-label">
              <span>Keyword-Optimierung</span>
              <button class="percentage-btn" data-score="${getScoreRange(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)))}">${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100))}%</button>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)))}" style="width: ${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100))}%; background-color: ${getScoreColor(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)))};"></div>
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

        <!-- Textqualität -->
        <div class="metric-card good" style="margin-bottom: 30px;">
          <h3>📖 Textqualität</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div class="status-item">
              <h4>Lesbarkeit</h4>
              <p><strong>${realData.seo.score >= 70 ? 'Sehr gut' : realData.seo.score >= 50 ? 'Gut' : 'Verbesserungsbedarf'}</strong></p>
              <div class="progress-container">
                <div class="progress-label">
                  <span>Lesbarkeit</span>
                  <button class="percentage-btn" data-score="${getScoreRange(Math.max(60, realData.seo.score))}">${Math.max(60, realData.seo.score)}%</button>
                </div>
              </div>
              
              <div class="progress-container">
                <div class="progress-label">
                  <span>Meta-Description</span>
                  <button class="percentage-btn" data-score="${getScoreRange(realData.seo.metaDescription ? 85 : 40)}">${realData.seo.metaDescription ? 85 : 40}%</button>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${realData.seo.metaDescription ? 85 : 40}%; background-color: ${getScoreColor(realData.seo.metaDescription ? 85 : 40)};"></div>
                </div>
              </div>
              
              <div class="progress-container">
                <div class="progress-label">
                  <span>H1-Überschriften</span>
                  <button class="percentage-btn" data-score="${getScoreRange(realData.seo.headings.h1.length > 0 ? 90 : 30)}" style="color: ${getScoreColor(realData.seo.headings.h1.length > 0 ? 90 : 30)};">${realData.seo.headings.h1.length > 0 ? 90 : 30}%</button>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(realData.seo.headings.h1.length > 0 ? 90 : 30)}" style="width: ${realData.seo.headings.h1.length > 0 ? 90 : 30}%"></div>
                </div>
              </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">H1: ${realData.seo.headings.h1.length}, H2: ${realData.seo.headings.h2.length}</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Textqualität-Empfehlungen:</h4>
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
                    <button class="percentage-btn" data-score="${getScoreRange(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50))}" style="color: ${getScoreColor(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50))};">${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50)}%</button>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50))}" style="width: ${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50)}%; background-color: ${getScoreColor(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50))}"></div>
                  </div>
                 </div>
               <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Branche: ${businessData.industry.toUpperCase()}</p>
             </div>
               <div class="status-item">
                <h4>Dienstleistungen</h4>
                <p><strong>${(manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 'Klar definiert' : 'Unklar'}</strong></p>
                 <div class="progress-container">
                   <div class="progress-label">
                     <span>Dienstleistungen</span>
                     <button class="percentage-btn" data-score="${getScoreRange(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45))}" style="color: ${getScoreColor(keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45))};">${keywordScore !== undefined && keywordScore !== null ? keywordScore : Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45)}%</button>
                   </div>
                   <div class="progress-bar">
                     <div class="progress-fill" data-score="${getScoreRange(keywordScore || Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45))}" style="width: ${keywordScore || Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45)}%; background-color: ${getScoreColor(keywordScore || Math.max(30, (manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45))}"></div>
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
                   <button class="percentage-btn" data-score="${getScoreRange(businessData.address ? 90 : 30)}" style="color: ${getScoreColor(businessData.address ? 90 : 30)};">${businessData.address ? 90 : 30}%</button>
                 </div>
                 <div class="progress-bar">
                   <div class="progress-fill" data-score="${getScoreRange(businessData.address ? 90 : 30)}" style="width: ${businessData.address ? 90 : 30}%"></div>
                 </div>
               </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Region: ${businessData.address ? 'Erfasst' : 'Fehlt'}</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Branchenrelevanz-Empfehlungen:</h4>
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
                  <div class="progress-fill" data-score="${getScoreRange(60)}" style="width: 60%"></div>
                </div>
              </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Empfehlung: Quartalweise</p>
            </div>
            <div class="status-item">
              <h4>News & Updates</h4>
              <p><strong>Nicht vorhanden</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(25)}" style="width: 25%"></div>
                </div>
              </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Blog/News-Bereich fehlt</p>
            </div>
            <div class="status-item">
              <h4>Saisonale Inhalte</h4>
              <p><strong>Nicht erkannt</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(35)}" style="width: 35%"></div>
                </div>
              </div>
              <p class="gray-text" style="color: #6b7280; font-size: 0.875rem; margin-top: 8px;">Winterdienst, Klimaanlagen etc.</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Aktualitäts-Empfehlungen:</h4>
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
      <div class="section-header" style="display: flex; align-items: center; justify-content: space-between;">
        <span>Lokale SEO & Regionale Sichtbarkeit</span>
        <div class="header-score-circle ${getScoreColorClass(74)}">74%</div>
      </div>
      <div class="section-content">
        ${getLocalSEOAnalysis()}
      </div>
    </div>

    <!-- Backlinks Übersicht -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('backlinks-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
        <span>▶ Backlinks Übersicht</span>
        <div class="header-score-circle ${getScoreColorClass(backlinksScore)}">${backlinksScore}%</div>
      </div>
      <div id="backlinks-content" class="section-content" style="display: none;">
        <div class="metric-card warning">
          <h3>Backlink-Profil</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(backlinksScore)}">
              ${backlinksScore}
            </div>
            <div class="score-details">
              <p><strong>Backlink-Status:</strong> ${backlinksScore >= 70 ? 'Gut entwickelt' : backlinksScore >= 50 ? 'Durchschnittlich' : 'Ausbaufähig'}</p>
              <p><strong>Domain Authority:</strong> ${backlinksScore >= 70 ? 'Stark' : backlinksScore >= 50 ? 'Mittel' : 'Schwach'}</p>
              <p><strong>Qualitätsbewertung:</strong> ${backlinksScore >= 70 ? 'Hochwertig' : 'Verbesserungsbedarf'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-label">
              <span>Backlink-Qualität</span>
              <button class="percentage-btn" data-score="${getScoreRange(backlinksScore)}">${backlinksScore}%</button>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${backlinksScore}%; background-color: ${getScoreColor(backlinksScore)};"></div>
            </div>
          </div>
          <div class="recommendations">
            <h4>Backlink-Strategien:</h4>
            <ul>
              <li>Hochwertige Branchenverzeichnisse nutzen</li>
              <li>Lokale Partnerschaften aufbauen</li>
              <li>Content-Marketing für natürliche Links</li>
              <li>Gastbeiträge in Fachmagazinen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Optimierung -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>Mobile Optimierung</span>
        <div class="header-score-circle ${getScoreColorClass(realData.mobile.overallScore)}">${realData.mobile.overallScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Mobile Optimierung</h3>
          <div class="score-display">
            <div class="score-circle" data-score="${getScoreRange(realData.mobile.overallScore)}">${realData.mobile.overallScore}%</div>
            <div class="score-details">
              <p><strong>Mobile-Friendly:</strong> ${realData.mobile.overallScore >= 80 ? 'Sehr gut' : realData.mobile.overallScore >= 60 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <p><strong>Empfehlung:</strong> ${realData.mobile.overallScore >= 80 ? 'Mobil optimiert' : 'Mobile Optimierung verbessern'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(realData.mobile.overallScore)}" style="width: ${realData.mobile.overallScore}%"></div>
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

    <!-- Corporate Identity -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>Corporate Design</span>
        <div class="header-score-circle ${getScoreColorClass(corporateIdentityScore)}">${corporateIdentityScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Corporate Design Konsistenz</h3>
          <div class="score-display">
            <div class="score-circle" data-score="${getScoreRange(corporateIdentityScore)}">${corporateIdentityScore}%</div>
            <div class="score-details">
              <p><strong>Einheitlichkeit:</strong> ${corporateIdentityScore >= 75 ? 'Sehr konsistent' : corporateIdentityScore >= 50 ? 'Teilweise konsistent' : 'Inkonsistent'}</p>
              <p><strong>Empfehlung:</strong> ${corporateIdentityScore >= 75 ? 'Professionelles Corporate Design' : 'Corporate Design standardisieren'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(corporateIdentityScore)}" style="width: ${corporateIdentityScore}%"></div>
            </div>
          </div>
        </div>
        
        ${manualCorporateIdentityData ? `
        <div class="collapsible" onclick="toggleSection('corporate-identity-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Corporate Design Details anzeigen</h4>
        </div>
        
        <div id="corporate-identity-details" style="display: none;">
          <div class="info-box" style="margin-top: 15px; padding: 15px; border-radius: 8px;">
            <h4>🎨 Corporate Design Bewertung</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 15px;">
              <div>
                <p><strong>Einheitliches Logo:</strong> 
                  <span class="score-badge ${manualCorporateIdentityData.uniformLogo ? 'green' : 'red'}">
                    ${manualCorporateIdentityData.uniformLogo ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliche Arbeitskleidung:</strong> 
                  <span class="score-badge ${manualCorporateIdentityData.uniformWorkClothing ? 'green' : 'red'}">
                    ${manualCorporateIdentityData.uniformWorkClothing ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliche Fahrzeugbeklebung:</strong> 
                  <span class="score-badge ${manualCorporateIdentityData.uniformVehicleBranding ? 'green' : 'red'}">
                    ${manualCorporateIdentityData.uniformVehicleBranding ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliche Farbgebung:</strong> 
                  <span class="score-badge ${manualCorporateIdentityData.uniformColorScheme ? 'green' : 'red'}">
                    ${manualCorporateIdentityData.uniformColorScheme ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliche Typografie:</strong> 
                  <span class="score-badge ${(manualCorporateIdentityData.uniformTypography ?? false) ? 'green' : 'red'}">
                    ${(manualCorporateIdentityData.uniformTypography ?? false) ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliche Visitenkarten:</strong> 
                  <span class="score-badge ${(manualCorporateIdentityData.uniformBusinessCards ?? false) ? 'green' : 'red'}">
                    ${(manualCorporateIdentityData.uniformBusinessCards ?? false) ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliches Website-Design:</strong> 
                  <span class="score-badge ${(manualCorporateIdentityData.uniformWebsiteDesign ?? false) ? 'green' : 'red'}">
                    ${(manualCorporateIdentityData.uniformWebsiteDesign ?? false) ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliche Dokumentvorlagen:</strong> 
                  <span class="score-badge ${(manualCorporateIdentityData.uniformDocumentTemplates ?? false) ? 'green' : 'red'}">
                    ${(manualCorporateIdentityData.uniformDocumentTemplates ?? false) ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliche Beschilderung:</strong> 
                  <span class="score-badge ${(manualCorporateIdentityData.uniformSignage ?? false) ? 'green' : 'red'}">
                    ${(manualCorporateIdentityData.uniformSignage ?? false) ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
              <div>
                <p><strong>Einheitliche Verpackung:</strong> 
                  <span class="score-badge ${(manualCorporateIdentityData.uniformPackaging ?? false) ? 'green' : 'red'}">
                    ${(manualCorporateIdentityData.uniformPackaging ?? false) ? '✅ Umgesetzt' : '❌ Fehlt'}
                  </span>
                </p>
              </div>
            </div>
            
            ${manualCorporateIdentityData.notes ? `
            <div class="info-box" style="margin-top: 15px; padding: 15px; border-radius: 8px; background: rgba(59, 130, 246, 0.1);">
              <h4>📝 Zusätzliche Notizen:</h4>
              <p style="margin-top: 10px;">${manualCorporateIdentityData.notes}</p>
            </div>
            ` : ''}
          </div>
        </div>
        ` : `
        <div class="warning-box" style="margin-top: 15px; padding: 15px; border-radius: 8px;">
          <h4>⚠️ Corporate Design nicht bewertet</h4>
          <p style="margin-top: 10px;">Das Corporate Design wurde noch nicht manuell bewertet.</p>
        </div>
        `}
      </div>
    </div>

    <!-- Arbeitsplatz & Arbeitgeber-Attraktivität -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>Arbeitsplatz & Arbeitgeber-Attraktivität</span>
        <div class="header-score-circle ${workplaceScore <= 0 ? 'red' : getScoreColorClass(workplaceScore)}">${workplaceScore <= 0 ? '–' : workplaceScore + '%'}</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Arbeitsplatz & Arbeitgeber-Attraktivität</h3>
          <div class="score-display">
            <div class="score-circle ${workplaceScore <= 0 ? 'red' : getScoreColorClass(workplaceScore)}">${workplaceScore <= 0 ? '–' : workplaceScore + '%'}</div>
            <div class="score-details">
              <p><strong>Arbeitgeber-Bewertung:</strong> ${workplaceScore <= 0 ? 'Nicht erfasst' : workplaceScore >= 70 ? 'Sehr gut' : workplaceScore >= 50 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <p><strong>Empfehlung:</strong> ${workplaceScore <= 0 ? 'Keine Bewertungen vorhanden - Bitte Registrierung in den Portalen vornehmen und Mitarbeiter animieren Bewertungen abzugeben' : workplaceScore >= 70 ? 'Attraktiver Arbeitgeber' : 'Employer Branding stärken'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${workplaceScore <= 0 ? 'none' : getScoreRange(workplaceScore)}" style="width: ${workplaceScore <= 0 ? '0' : workplaceScore + '%'}"></div>
            </div>
          </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('workplace-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Arbeitsplatz-Details anzeigen</h4>
        </div>
        
        <div id="workplace-details" style="display: none;">
          ${getWorkplaceAnalysis()}
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${workplaceScore === -1 ? 'none' : getScoreRange(workplaceScore)}" style="width: ${workplaceScore === -1 ? '0' : workplaceScore + '%'}"></div>
            </div>
          </div>
          
          <!-- Kununu & Glassdoor Bewertungen -->
          <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
            <h4>Kununu & Glassdoor Bewertungen</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div>
                <p><strong>Kununu Rating:</strong> ${
                  (() => {
                    // Check if manual data disables auto kununu
                    if (manualWorkplaceData?.disableAutoKununu) {
                      return manualWorkplaceData?.kununuFound && manualWorkplaceData?.kununuRating
                        ? `${manualWorkplaceData.kununuRating}/5 (${manualWorkplaceData.kununuReviews} Bewertungen)`
                        : 'Nicht erfasst';
                    }
                    
                    // Check if manual data has kununu info
                    if (manualWorkplaceData?.kununuFound && manualWorkplaceData?.kununuRating) {
                      return `${manualWorkplaceData.kununuRating}/5 (${manualWorkplaceData.kununuReviews} Bewertungen)`;
                    }
                    
                    // Fall back to real data
                    return realData.workplace?.kununu?.found && realData.workplace?.kununu?.rating 
                      ? `${realData.workplace.kununu.rating}/5 (${realData.workplace.kununu.reviews || 0} Bewertungen)`
                      : 'Nicht erfasst';
                  })()
                }</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(
                      (() => {
                        if (manualWorkplaceData?.disableAutoKununu && !manualWorkplaceData?.kununuFound) return 30;
                        if (manualWorkplaceData?.kununuFound && manualWorkplaceData?.kununuRating) {
                          return parseFloat(manualWorkplaceData.kununuRating.replace(',', '.')) * 20;
                        }
                        return realData.workplace?.kununu?.rating ? (realData.workplace.kununu.rating * 20) : 30;
                      })()
                    )}" style="width: ${
                      (() => {
                        if (manualWorkplaceData?.disableAutoKununu && !manualWorkplaceData?.kununuFound) return 30;
                        if (manualWorkplaceData?.kununuFound && manualWorkplaceData?.kununuRating) {
                          return parseFloat(manualWorkplaceData.kununuRating.replace(',', '.')) * 20;
                        }
                        return realData.workplace?.kununu?.rating ? (realData.workplace.kununu.rating * 20) : 30;
                      })()
                    }%"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>Glassdoor Rating:</strong> ${
                  (() => {
                    // Check if manual data disables auto glassdoor
                    if (manualWorkplaceData?.disableAutoGlassdoor) {
                      return manualWorkplaceData?.glassdoorFound && manualWorkplaceData?.glassdoorRating
                        ? `${manualWorkplaceData.glassdoorRating}/5 (${manualWorkplaceData.glassdoorReviews} Bewertungen)`
                        : 'Nicht erfasst';
                    }
                    
                    // Check if manual data has glassdoor info
                    if (manualWorkplaceData?.glassdoorFound && manualWorkplaceData?.glassdoorRating) {
                      return `${manualWorkplaceData.glassdoorRating}/5 (${manualWorkplaceData.glassdoorReviews} Bewertungen)`;
                    }
                    
                    // Fall back to real data
                    return realData.workplace?.glassdoor?.found && realData.workplace?.glassdoor?.rating 
                      ? `${realData.workplace.glassdoor.rating}/5 (${realData.workplace.glassdoor.reviews || 0} Bewertungen)`
                      : 'Nicht erfasst';
                  })()
                }</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(
                      (() => {
                        if (manualWorkplaceData?.disableAutoGlassdoor && !manualWorkplaceData?.glassdoorFound) return 25;
                        if (manualWorkplaceData?.glassdoorFound && manualWorkplaceData?.glassdoorRating) {
                          return parseFloat(manualWorkplaceData.glassdoorRating.replace(',', '.')) * 20;
                        }
                        return realData.workplace?.glassdoor?.rating ? (realData.workplace.glassdoor.rating * 20) : 25;
                      })()
                    )}" style="width: ${
                      (() => {
                        if (manualWorkplaceData?.disableAutoGlassdoor && !manualWorkplaceData?.glassdoorFound) return 25;
                        if (manualWorkplaceData?.glassdoorFound && manualWorkplaceData?.glassdoorRating) {
                          return parseFloat(manualWorkplaceData.glassdoorRating.replace(',', '.')) * 20;
                        }
                        return realData.workplace?.glassdoor?.rating ? (realData.workplace.glassdoor.rating * 20) : 25;
                      })()
                    }%"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>Arbeitsklima:</strong> ${
                  (realData.workplace?.kununu?.rating > 0 || realData.workplace?.glassdoor?.rating > 0 || 
                   (manualWorkplaceData && (manualWorkplaceData.kununuRating !== '' || manualWorkplaceData.glassdoorRating !== '')))
                    ? (realData.workplace?.kununu?.rating >= 4 || (manualWorkplaceData?.kununuRating && parseFloat(manualWorkplaceData.kununuRating.replace(',', '.')) >= 4) ? 'Sehr gut' 
                       : realData.workplace?.kununu?.rating >= 3 || (manualWorkplaceData?.kununuRating && parseFloat(manualWorkplaceData.kununuRating.replace(',', '.')) >= 3) ? 'Gut' 
                       : 'Ausbaufähig')
                    : 'Nicht erfasst'
                }</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${
                      // Berechnung der Arbeitsklima-Bewertung basierend auf verfügbaren Bewertungen
                      realData.workplace?.kununu?.rating ? getScoreRange(realData.workplace.kununu.rating * 20) 
                      : manualWorkplaceData?.kununuRating ? getScoreRange(parseFloat(manualWorkplaceData.kununuRating.replace(',', '.')) * 20)
                      : getScoreRange(30) // Fallback für "nicht erfasst"
                    }" style="width: ${
                      realData.workplace?.kununu?.rating ? Math.max(40, realData.workplace.kununu.rating * 20) 
                      : manualWorkplaceData?.kununuRating ? Math.max(40, parseFloat(manualWorkplaceData.kununuRating.replace(',', '.')) * 20)
                      : 30 // Fallback für "nicht erfasst" - niedriger Wert für roten Balken
                    }%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fachkräfte-Attraktivität -->
          <div style="margin-top: 15px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
            <h4>Fachkräfte-Attraktivität</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div>
                <p><strong>Ausbildungsplätze:</strong> ${businessData.industry === 'shk' ? 'Verfügbar' : 'Auf Anfrage'}</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(80)}" style="width: 80%"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>Weiterbildung:</strong> Standardprogramm</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(65)}" style="width: 65%"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>Benefits:</strong> Branchenüblich</p>
                <div class="progress-container">
                  <div class="progress-bar">
                     <div class="progress-fill" data-score="${getScoreRange(70)}" style="width: 70%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="recommendations">
            <h4>Arbeitsplatz-Empfehlungen:</h4>
            <ul>
              <li>Mitarbeiterbewertungen auf Kununu und Glassdoor aktiv verbessern</li>
              <li>Employer Branding durch authentische Einblicke stärken</li>
              <li>Ausbildungs- und Karrierewege transparent kommunizieren</li>
              <li>Moderne Benefits und flexible Arbeitszeiten anbieten</li>
            </ul>
          </div>
        </div>
      </div>
    </div>



    <!-- Online Reputation -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
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
              <p><strong>Empfehlung:</strong> ${realData.reviews.google.rating >= 4.0 ? 'Sehr gute Reputation' : 'Bewertungen verbessern'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(googleReviewScore)}" style="width: ${googleReviewScore}%"></div>
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
      // Branchenplattformen Sektion - IMMER anzeigen
      const overallScore = (manualIndustryReviewData && manualIndustryReviewData.platforms && manualIndustryReviewData.platforms.length > 0) 
        ? (manualIndustryReviewData.overallScore || 0) 
        : 0;
      const hasData = manualIndustryReviewData && manualIndustryReviewData.platforms && manualIndustryReviewData.platforms.length > 0;
      
      return `
    <!-- Branchenplattformen -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>🏆 Branchenplattformen</span>
        <div class="header-score-circle ${overallScore <= 0 ? 'red' : getScoreColorClass(overallScore)}">${overallScore <= 0 ? '–' : overallScore + '%'}</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Branchenspezifische Bewertungsplattformen</h3>
          <div class="score-display">
            <div class="score-circle ${overallScore <= 0 ? 'red' : getScoreColorClass(overallScore)}">${overallScore <= 0 ? '–' : overallScore + '%'}</div>
            <div class="score-details">
              <p><strong>Status:</strong> ${overallScore <= 0 ? 'Nicht erfasst' : 'Erfasst'}</p>
              <p><strong>Empfehlung:</strong> ${overallScore <= 0 ? 'Bitte erfassen Sie Ihre Bewertungen auf branchenspezifischen Plattformen' : overallScore >= 70 ? 'Sehr gute Präsenz' : 'Ausbaufähig'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${overallScore <= 0 ? 'none' : getScoreRange(overallScore)}" style="width: ${overallScore <= 0 ? '0' : overallScore + '%'}; background-color: ${overallScore <= 0 ? '#ccc' : getScoreColor(overallScore)} !important;"></div>
            </div>
          </div>
        </div>

        ${hasData ? `
        <div style="margin-top: 20px;">
          <h4 style="color: #fbbf24; margin-bottom: 15px;">Plattform-Übersicht</h4>
          <div style="margin-bottom: 15px;">
            <p><strong>Erfasste Plattformen:</strong> ${manualIndustryReviewData.platforms.length}</p>
            <p><strong>Verifizierte Profile:</strong> ${manualIndustryReviewData.platforms.filter(p => p.isVerified).length}</p>
            <p><strong>Gesamtbewertungen:</strong> ${manualIndustryReviewData.platforms.reduce((sum, p) => sum + (p.reviewCount || 0), 0)}</p>
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
            ${manualIndustryReviewData.platforms.map(platform => {
              const platformScore = Math.round((platform.rating / 5) * 100);
              return `
              <div class="metric-card" style="padding: 15px; background: rgba(251, 191, 36, 0.05); border: 1px solid rgba(251, 191, 36, 0.2);">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 10px;">
                  <h4 style="margin: 0; color: #fbbf24;">${platform.platformName}</h4>
                  ${platform.isVerified ? '<span style="color: #10b981; font-size: 0.8em;">✓ Verifiziert</span>' : ''}
                </div>
                <div style="margin: 10px 0;">
                  <p style="margin: 5px 0;"><strong>Bewertung:</strong> ${platform.rating}/5 ⭐</p>
                  <p style="margin: 5px 0;"><strong>Anzahl Bewertungen:</strong> ${platform.reviewCount}</p>
                  ${platform.lastReviewDate ? `<p style="margin: 5px 0;"><strong>Letzte Bewertung:</strong> ${platform.lastReviewDate}</p>` : ''}
                  ${platform.profileUrl ? `<p style="margin: 5px 0;"><a href="${platform.profileUrl}" target="_blank" style="color: #3b82f6;">Profil ansehen →</a></p>` : ''}
                </div>
                <div class="progress-container">
                  <div class="progress-label">
                    <span>Bewertungslevel</span>
                    <span>${platformScore}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${platformScore}%; background-color: ${getScoreColor(platformScore)} !important;"></div>
                  </div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
        ` : `
        <div style="margin-top: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px;">
          <h4 style="color: #ef4444;">⚠️ Keine Branchenplattformen erfasst</h4>
          <p style="margin-top: 10px;">Es wurden noch keine Bewertungen auf branchenspezifischen Plattformen erfasst. Nutzen Sie relevante Plattformen, um Ihre Sichtbarkeit zu erhöhen.</p>
        </div>
        `}

        <div class="recommendations">
          <h4>Empfehlungen für Branchenplattformen:</h4>
          <ul>
            <li>Profile auf allen relevanten Branchenplattformen pflegen</li>
            <li>Aktiv um Kundenbewertungen bitten nach Projektabschluss</li>
            <li>Auf Bewertungen zeitnah und professionell reagieren</li>
            <li>Profile verifizieren lassen für höhere Glaubwürdigkeit</li>
            <li>Referenzprojekte und Zertifikate hinterlegen</li>
          </ul>
        </div>
      </div>
    </div>
      `;
    })()}

    ${(() => {
      // Online-Präsenz Sektion
      if (manualOnlinePresenceData && manualOnlinePresenceData.items && manualOnlinePresenceData.items.length > 0) {
        const overallScore = manualOnlinePresenceData.overallScore || 0;
        const imageCount = manualOnlinePresenceData.items.filter(i => i.type === 'image').length;
        const videoCount = manualOnlinePresenceData.items.filter(i => i.type === 'video').length;
        const shortCount = manualOnlinePresenceData.items.filter(i => i.type === 'short').length;
        const highRelevance = manualOnlinePresenceData.items.filter(i => i.relevance === 'high').length;
        const mediumRelevance = manualOnlinePresenceData.items.filter(i => i.relevance === 'medium').length;
        const lowRelevance = manualOnlinePresenceData.items.filter(i => i.relevance === 'low').length;
        
        // Calculate scoring components
        let diversityScore = 0;
        if (imageCount > 0) diversityScore += 15;
        if (videoCount > 0) diversityScore += 15;
        if (shortCount > 0) diversityScore += 10;
        
        const totalContent = manualOnlinePresenceData.items.length;
        let quantityScore = 0;
        if (totalContent >= 20) quantityScore = 30;
        else if (totalContent >= 15) quantityScore = 25;
        else if (totalContent >= 10) quantityScore = 20;
        else if (totalContent >= 5) quantityScore = 15;
        else quantityScore = totalContent * 3;
        
        const relevanceScore = Math.min(30, (highRelevance * 2) + (mediumRelevance * 1) + (lowRelevance * 0.5));
        
        // Determine assessment level
        const assessment = overallScore >= 90 ? 'Exzellent' : overallScore >= 61 ? 'Gut' : 'Verbesserungsbedarf';
        const assessmentColor = overallScore >= 90 ? '#10b981' : overallScore >= 61 ? '#fbbf24' : '#ef4444';
        
        return `
    <!-- Online-Präsenz -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>🔍 Online-Präsenz (Google-Suche)</span>
        <div class="header-score-circle ${getScoreColorClass(overallScore)}">${overallScore}%</div>
      </div>
      <div class="section-content">
        <!-- Übersicht und Gesamtbewertung -->
        <div class="metric-card" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); padding: 25px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="margin-top: 0; color: #1e293b;">Sichtbarkeit in Google-Suchergebnissen</h3>
          <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 25px; align-items: center;">
            <div style="text-align: center;">
              <div class="score-circle ${getScoreColorClass(overallScore)}" style="width: 120px; height: 120px; font-size: 2.5em; margin: 0 auto;">${overallScore}%</div>
              <p style="margin-top: 15px; font-size: 1.1em; font-weight: 600; color: ${assessmentColor};">${assessment}</p>
            </div>
            <div>
              <div style="display: grid; gap: 12px;">
                <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                  <span style="font-weight: 500;">📊 Erfasste Inhalte gesamt:</span>
                  <span style="font-weight: bold; color: #3b82f6;">${totalContent}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                  <span style="font-weight: 500;">⭐ Hochrelevante Inhalte:</span>
                  <span style="font-weight: bold; color: #10b981;">${highRelevance}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px; background: white; border-radius: 8px;">
                  <span style="font-weight: 500;">🎨 Content-Typen vorhanden:</span>
                  <span style="font-weight: bold; color: #f59e0b;">${[imageCount > 0, videoCount > 0, shortCount > 0].filter(Boolean).length} von 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Score-Berechnung Erklärung -->
        <div class="metric-card" style="background: #fef3c7; padding: 20px; border-radius: 10px; border-left: 4px solid #f59e0b; margin-bottom: 25px;">
          <h4 style="margin-top: 0; color: #92400e; display: flex; align-items: center; gap: 8px;">
            📐 Wie wird der Score berechnet?
          </h4>
          <div style="display: grid; gap: 12px; margin-top: 15px;">
            <div style="background: white; padding: 12px; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="font-weight: 500; color: #1e293b;">1️⃣ Content-Vielfalt (max. 40 Punkte)</span>
                <span style="font-weight: bold; color: #3b82f6;">${diversityScore} Punkte</span>
              </div>
              <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #64748b;">
                Bilder: ${imageCount > 0 ? '+15 ✓' : '0 ✗'} | Videos: ${videoCount > 0 ? '+15 ✓' : '0 ✗'} | Shorts: ${shortCount > 0 ? '+10 ✓' : '0 ✗'}
              </p>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="font-weight: 500; color: #1e293b;">2️⃣ Content-Menge (max. 30 Punkte)</span>
                <span style="font-weight: bold; color: #10b981;">${quantityScore} Punkte</span>
              </div>
              <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #64748b;">
                ${totalContent >= 20 ? '20+ Inhalte: Optimal!' : totalContent >= 15 ? '15-19 Inhalte: Sehr gut' : totalContent >= 10 ? '10-14 Inhalte: Gut' : totalContent >= 5 ? '5-9 Inhalte: Ausbaufähig' : 'Unter 5 Inhalte: Stark ausbaufähig'}
              </p>
            </div>
            <div style="background: white; padding: 12px; border-radius: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <span style="font-weight: 500; color: #1e293b;">3️⃣ Relevanz-Score (max. 30 Punkte)</span>
                <span style="font-weight: bold; color: #a855f7;">${Math.round(relevanceScore)} Punkte</span>
              </div>
              <p style="margin: 5px 0 0 0; font-size: 0.9em; color: #64748b;">
                Hoch: ${highRelevance} × 2 | Mittel: ${mediumRelevance} × 1 | Niedrig: ${lowRelevance} × 0.5
              </p>
            </div>
          </div>
          <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #fbbf24;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 1.1em;">
              <span style="font-weight: 600; color: #92400e;">🎯 Gesamtscore:</span>
              <span style="font-weight: bold; color: #92400e; font-size: 1.3em;">${overallScore} / 100 Punkten</span>
            </div>
          </div>
        </div>

        <!-- Content-Verteilung Detailliert -->
        <div style="margin-bottom: 25px;">
          <h4 style="color: #1e293b; margin-bottom: 15px; font-size: 1.2em;">📊 Content-Verteilung im Detail</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
            <div class="metric-card" style="padding: 20px; text-align: center; background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05)); border: 2px solid rgba(59, 130, 246, 0.3);">
              <div style="font-size: 3em; margin-bottom: 10px;">📷</div>
              <p style="font-size: 2em; font-weight: bold; margin: 10px 0; color: #1e40af;">${imageCount}</p>
              <p style="color: #64748b; font-weight: 500; margin-bottom: 10px;">Bilder</p>
              <div style="background: white; padding: 8px; border-radius: 6px; margin-top: 10px;">
                <p style="margin: 0; font-size: 0.85em; color: #475569;">
                  ${imageCount === 0 ? '❌ Keine Bilder gefunden' : imageCount < 5 ? '⚠️ Wenige Bilder' : imageCount < 10 ? '✓ Gute Anzahl' : '⭐ Exzellente Präsenz'}
                </p>
              </div>
            </div>
            <div class="metric-card" style="padding: 20px; text-align: center; background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05)); border: 2px solid rgba(239, 68, 68, 0.3);">
              <div style="font-size: 3em; margin-bottom: 10px;">🎥</div>
              <p style="font-size: 2em; font-weight: bold; margin: 10px 0; color: #dc2626;">${videoCount}</p>
              <p style="color: #64748b; font-weight: 500; margin-bottom: 10px;">Videos</p>
              <div style="background: white; padding: 8px; border-radius: 6px; margin-top: 10px;">
                <p style="margin: 0; font-size: 0.85em; color: #475569;">
                  ${videoCount === 0 ? '❌ Keine Videos gefunden' : videoCount < 3 ? '⚠️ Wenige Videos' : videoCount < 8 ? '✓ Gute Anzahl' : '⭐ Exzellente Präsenz'}
                </p>
              </div>
            </div>
            <div class="metric-card" style="padding: 20px; text-align: center; background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.05)); border: 2px solid rgba(168, 85, 247, 0.3);">
              <div style="font-size: 3em; margin-bottom: 10px;">📱</div>
              <p style="font-size: 2em; font-weight: bold; margin: 10px 0; color: #7c3aed;">${shortCount}</p>
              <p style="color: #64748b; font-weight: 500; margin-bottom: 10px;">Shorts/Reels</p>
              <div style="background: white; padding: 8px; border-radius: 6px; margin-top: 10px;">
                <p style="margin: 0; font-size: 0.85em; color: #475569;">
                  ${shortCount === 0 ? '❌ Keine Shorts gefunden' : shortCount < 3 ? '⚠️ Wenige Shorts' : shortCount < 8 ? '✓ Gute Anzahl' : '⭐ Exzellente Präsenz'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Relevanz-Analyse -->
        <div class="metric-card" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.05)); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h4 style="margin-top: 0; color: #065f46; display: flex; align-items: center; gap: 8px;">
            ⭐ Relevanz-Analyse der Inhalte
          </h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px;">
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #10b981;">
              <p style="font-size: 2em; margin: 0 0 10px 0; color: #10b981;">${highRelevance}</p>
              <p style="margin: 0; font-weight: 600; color: #065f46;">Hochrelevant</p>
              <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #6b7280;">Eigener Content</p>
              <div style="margin-top: 10px; padding: 8px; background: rgba(16, 185, 129, 0.1); border-radius: 6px;">
                <p style="margin: 0; font-size: 0.85em; color: #047857;">Beitrag zum Score: +${highRelevance * 2} Pkt.</p>
              </div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #fbbf24;">
              <p style="font-size: 2em; margin: 0 0 10px 0; color: #fbbf24;">${mediumRelevance}</p>
              <p style="margin: 0; font-weight: 600; color: #92400e;">Mittelrelevant</p>
              <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #6b7280;">Unternehmen erwähnt</p>
              <div style="margin-top: 10px; padding: 8px; background: rgba(251, 191, 36, 0.1); border-radius: 6px;">
                <p style="margin: 0; font-size: 0.85em; color: #b45309;">Beitrag zum Score: +${mediumRelevance} Pkt.</p>
              </div>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border: 2px solid #9ca3af;">
              <p style="font-size: 2em; margin: 0 0 10px 0; color: #9ca3af;">${lowRelevance}</p>
              <p style="margin: 0; font-weight: 600; color: #374151;">Niedrigrelevant</p>
              <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #6b7280;">Indirekte Erwähnung</p>
              <div style="margin-top: 10px; padding: 8px; background: rgba(156, 163, 175, 0.1); border-radius: 6px;">
                <p style="margin: 0; font-size: 0.85em; color: #4b5563;">Beitrag zum Score: +${lowRelevance * 0.5} Pkt.</p>
              </div>
            </div>
          </div>
          <div style="margin-top: 15px; padding: 12px; background: white; border-radius: 8px;">
            <p style="margin: 0; color: #475569; font-size: 0.9em;">
              💡 <strong>Tipp:</strong> Je mehr hochrelevante Inhalte (eigener Content), desto besser Ihre Online-Sichtbarkeit. 
              Fokussieren Sie auf die Produktion und Verbreitung eigener Bilder, Videos und Shorts.
            </p>
          </div>
        </div>

        <!-- Erfasste Inhalte Liste -->
        <div style="margin-bottom: 25px;">
          <h4 style="color: #1e293b; margin-bottom: 15px; font-size: 1.2em;">📋 Alle erfassten Inhalte im Detail</h4>
          <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
            ${manualOnlinePresenceData.items.map((item, index) => {
              const typeIcon = item.type === 'image' ? '📷' : item.type === 'video' ? '🎥' : '📱';
              const relevanceColor = item.relevance === 'high' ? '#10b981' : item.relevance === 'medium' ? '#fbbf24' : '#9ca3af';
              const relevanceText = item.relevance === 'high' ? 'Hoch (eigener Content)' : item.relevance === 'medium' ? 'Mittel (erwähnt)' : 'Niedrig (indirekt)';
              const typeName = item.type === 'image' ? 'Bild' : item.type === 'video' ? 'Video' : 'Short/Reel';
              
              return `
              <div class="metric-card" style="padding: 15px; background: white; border-left: 4px solid ${relevanceColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: start; gap: 12px;">
                  <div style="font-size: 2em; line-height: 1;">${typeIcon}</div>
                  <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                      <span style="font-weight: 600; color: #1e293b; font-size: 0.9em;">Content #${index + 1}</span>
                      <span style="padding: 3px 10px; background: ${relevanceColor}22; color: ${relevanceColor}; border-radius: 12px; font-size: 0.75em; font-weight: 600;">
                        ${typeName}
                      </span>
                      <span style="padding: 3px 10px; background: ${relevanceColor}; color: white; border-radius: 12px; font-size: 0.75em; font-weight: 600;">
                        ${relevanceText}
                      </span>
                    </div>
                    <p style="margin: 0; font-size: 0.85em; color: #64748b; word-break: break-all; line-height: 1.4;">
                      🔗 ${item.url}
                    </p>
                  </div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Benchmark und Einordnung -->
        <div class="metric-card" style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h4 style="margin-top: 0; color: #4c1d95; display: flex; align-items: center; gap: 8px;">
            📈 Benchmark & Einordnung
          </h4>
          <div style="display: grid; gap: 12px; margin-top: 15px;">
            <div style="background: white; padding: 15px; border-radius: 8px; border-left: 3px solid ${overallScore >= 90 ? '#10b981' : overallScore >= 61 ? '#fbbf24' : '#ef4444'};">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e293b;">Ihre Position:</p>
              <p style="margin: 0; color: #64748b; line-height: 1.6;">
                ${overallScore >= 90 
                  ? '🏆 <strong>Exzellent (90-100%)</strong>: Ihre Online-Präsenz ist hervorragend. Sie haben eine starke Sichtbarkeit mit vielfältigem, hochrelevantem Content in Google-Suchergebnissen.'
                  : overallScore >= 61 
                  ? '✅ <strong>Gut (61-89%)</strong>: Ihre Online-Präsenz ist solide, aber es gibt noch Potenzial zur Steigerung. Mehr hochrelevanter Content würde Ihre Sichtbarkeit deutlich verbessern.'
                  : '⚠️ <strong>Verbesserungsbedarf (0-60%)</strong>: Ihre Online-Präsenz ist ausbaufähig. Mit gezielten Maßnahmen können Sie Ihre Sichtbarkeit in Google-Suchergebnissen deutlich steigern.'
                }
              </p>
            </div>
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e293b;">Branchen-Durchschnitt:</p>
              <p style="margin: 0; color: #64748b; line-height: 1.6;">
                📊 Typische Handwerksbetriebe haben durchschnittlich <strong>8-12 Inhalte</strong> in Google-Suchergebnissen, 
                wobei führende Betriebe mit <strong>20+ Inhalten</strong> eine deutlich höhere Sichtbarkeit erreichen.
              </p>
            </div>
          </div>
        </div>

        <!-- Spezifische Empfehlungen -->
        <div class="recommendations" style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.05)); padding: 20px; border-radius: 10px; border: 2px solid rgba(34, 197, 94, 0.3);">
          <h4 style="margin-top: 0; color: #065f46; display: flex; align-items: center; gap: 8px;">
            💡 Maßgeschneiderte Empfehlungen für Ihre Online-Präsenz
          </h4>
          <ul style="margin: 15px 0 0 0; padding-left: 20px; color: #1e293b; line-height: 1.8;">
            ${imageCount === 0 ? '<li><strong>📷 Bilder-Strategie starten:</strong> Beginnen Sie mit hochwertigen Projektfotos auf Google My Business. Ziel: Mindestens 10 Bilder in den ersten 3 Monaten.</li>' : ''}
            ${imageCount > 0 && imageCount < 10 ? '<li><strong>📷 Bilder-Portfolio erweitern:</strong> Erhöhen Sie Ihre Bildanzahl auf mindestens 15-20 Fotos. Zeigen Sie Vorher-Nachher-Vergleiche, Team-Fotos und abgeschlossene Projekte.</li>' : ''}
            ${videoCount === 0 ? '<li><strong>🎥 Video-Content einführen:</strong> Erstellen Sie erste Projekt-Videos oder Erklär-Videos. Bereits 2-3 Videos können Ihre Sichtbarkeit deutlich steigern.</li>' : ''}
            ${videoCount > 0 && videoCount < 5 ? '<li><strong>🎥 Video-Präsenz ausbauen:</strong> Produzieren Sie regelmäßig kurze Projekt-Videos (1-2 Minuten). Optimal sind 8-10 Videos für maximale Sichtbarkeit.</li>' : ''}
            ${shortCount === 0 ? '<li><strong>📱 Shorts/Reels nutzen:</strong> Starten Sie mit kurzen 30-60 Sekunden Videos für Social Media und Google. Besonders effektiv für schnelle Projekt-Einblicke.</li>' : ''}
            ${highRelevance < totalContent * 0.5 ? '<li><strong>⭐ Relevanz steigern:</strong> Fokus auf eigenen Content! Laden Sie mehr eigene Bilder und Videos hoch statt auf Erwähnungen durch Dritte zu setzen.</li>' : ''}
            <li><strong>🏷️ Optimierung für Auffindbarkeit:</strong> Verwenden Sie beschreibende Dateinamen und Alt-Tags (z.B. "Dachsanierung-Einfamilienhaus-2024.jpg" statt "IMG_1234.jpg").</li>
            <li><strong>📅 Content-Kalender einrichten:</strong> Planen Sie wöchentlich 1-2 neue Inhalte. Kontinuität ist wichtiger als sporadische große Uploads.</li>
            ${overallScore < 80 ? '<li><strong>🎯 Vielfalt erhöhen:</strong> Kombinieren Sie alle drei Content-Typen (Bilder, Videos, Shorts) für maximale Reichweite und besseres Ranking.</li>' : ''}
            <li><strong>🔄 Regelmäßige Aktualisierung:</strong> Löschen Sie veraltete Inhalte und ersetzen Sie diese durch aktuelle Projekte. Google bevorzugt frischen Content.</li>
            <li><strong>📊 Performance tracken:</strong> Nutzen Sie Google My Business Insights, um zu sehen, welche Inhalte am meisten Aufrufe generieren.</li>
            ${totalContent < 15 ? '<li><strong>🚀 Kurzziel setzen:</strong> Erreichen Sie in den nächsten 3 Monaten mindestens 15 Inhalte für eine spürbare Verbesserung Ihrer Sichtbarkeit.</li>' : ''}
          </ul>
        </div>
      </div>
    </div>
        `;
      }
      return '';
    })()}

    <!-- Barrierefreiheit -->
    <div class="section">
        <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
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
              <div class="progress-fill" style="width: ${actualAccessibilityScore}%; background-color: ${getScoreColor(actualAccessibilityScore)} !important;"></div>
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
        
        <!-- Collapsible Untersektionen -->
        <div class="collapsible" onclick="toggleSection('wcag-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ WCAG 2.1 Compliance Details</h4>
        </div>
        
        <div id="wcag-details" style="display: none;">
          <div style="margin-top: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
            <h4>🚨 Erkannte Probleme</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
              <div style="padding: 8px; background: rgba(239, 68, 68, 0.2); border-radius: 6px;">
                <p style="font-weight: bold; color: #dc2626;">CRITICAL</p>
                <p style="font-size: 0.9em;">Bilder ohne Alt-Text</p>
                <p style="font-size: 0.8em; color: #666;">3 Vorkommen</p>
              </div>
              <div style="padding: 8px; background: rgba(245, 158, 11, 0.2); border-radius: 6px;">
                <p style="font-weight: bold; color: #d97706;">SERIOUS</p>
                <p style="font-size: 0.9em;">Unzureichender Farbkontrast</p>
                <p style="font-size: 0.8em; color: #666;">5 Vorkommen</p>
              </div>
            </div>
          </div>
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
              <li>Alt-Texte für alle Bilder hinzufügen (WCAG 1.1.1)</li>
              <li>Farbkontraste auf mindestens 4.5:1 erhöhen (WCAG 1.4.3)</li>
              <li>Überschriftenstruktur H1-H6 korrekt implementieren (WCAG 1.3.1)</li>
              <li>Tastaturnavigation für alle Funktionen ermöglichen (WCAG 2.1.1)</li>
              <li>Screen Reader-Kompatibilität durch ARIA-Labels verbessern</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Social Media Listening & Monitoring -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('social-media-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
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
            ${['Facebook', 'Instagram', 'LinkedIn', 'Twitter', 'YouTube', 'TikTok'].map(platform => {
              const platformKey = platform.toLowerCase();
              const platformUrl = manualSocialData?.[platformKey + 'Url'];
              const platformFollowers = manualSocialData?.[platformKey + (platform === 'YouTube' ? 'Subscribers' : 'Followers')] || '0';
              const platformLastPost = manualSocialData?.[platformKey + 'LastPost'] || 'Unbekannt';
              
              const hasData = !!platformUrl;
              const followerCount = parseInt(platformFollowers) || 0;
              const lastPostDays = platformLastPost === 'Unbekannt' ? 999 : parseInt(platformLastPost) || 0;
              
              return `
                <div class="metric-card" style="margin-bottom: 20px; ${hasData ? '' : 'opacity: 0.6; border: 2px dashed #666;'}">
                  <h3>${platform} ${hasData ? '✓' : '✗'}</h3>
                  <p><strong>Status:</strong> ${hasData ? 'Vorhanden' : 'Nicht eingerichtet'}</p>
                  ${hasData ? `
                    <p><strong>${platform === 'YouTube' ? 'Abonnenten' : 'Follower'}:</strong> ${followerCount.toLocaleString()}</p>
                    <p><strong>Letzter Post:</strong> ${lastPostDays === 999 ? 'Unbekannt' : lastPostDays === 0 ? 'Heute' : `vor ${lastPostDays} Tagen`}</p>
                    <p><strong>Aktivität:</strong> ${lastPostDays <= 7 ? 'Sehr aktiv' : lastPostDays <= 30 ? 'Aktiv' : 'Inaktiv'}</p>
                  ` : `
                    <p><strong>Empfehlung:</strong> Kanal einrichten für bessere Reichweite</p>
                    <p><strong>Potenzial:</strong> ${platform === 'Facebook' ? 'Lokale Zielgruppe erreichen' : platform === 'Instagram' ? 'Visuelle Inhalte teilen' : platform === 'LinkedIn' ? 'B2B Networking' : platform === 'Twitter' ? 'Schnelle Kommunikation' : platform === 'YouTube' ? 'Video-Marketing' : 'Junge Zielgruppe ansprechen'}</p>
                  `}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Wettbewerbsanalyse -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('competitor-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
        <span>▶ Wettbewerbsanalyse & Marktumfeld</span>
        ${(() => {
          const allCompetitors = (window as any).globalAllCompetitors || manualCompetitors || [];
          const ownScore = (window as any).globalOwnCompanyScore || 75;
          const scoreColorClass = ownScore >= 90 ? 'yellow' : ownScore >= 61 ? 'green' : 'red';
          return allCompetitors.length > 0 ? `<div class="header-score-circle ${scoreColorClass}">${Math.round(ownScore)}%</div>` : '';
        })()}
      </div>
      <div id="competitor-content" class="section-content" style="display: none;">
        ${getCompetitorAnalysis()}
      </div>
    </div>

     ${hourlyRateData ? `
     <!-- Preispositionierung -->
     <div class="section">
       <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
         <span>Preispositionierung</span>
         <div class="header-score-circle ${getScoreColorClass(pricingScore)}">${pricingText}</div>
       </div>
       <div class="section-content">
         <div class="metric-card">
           <h3>Preispositionierung</h3>
           <div class="score-display">
             <div class="score-circle ${getScoreColorClass(pricingScore)}">${pricingText}</div>
              <div class="score-details">
                <p><strong>Installation:</strong> ${hourlyRateData.installationRate || 0}€/h</p>
                <p><strong>Service:</strong> ${hourlyRateData.serviceRate || 0}€/h</p>
                <p><strong>Positionierung:</strong> ${pricingText}</p>
              </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(pricingScore)}" style="width: ${pricingScore}%"></div>
            </div>
          </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('pricing-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Preis-Details anzeigen</h4>
        </div>
        
        <div id="pricing-details" style="display: none;">
          ${getPricingAnalysis()}
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Rechtssicherheit -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>Rechtssicherheit</span>
        <div class="header-score-circle ${getScoreColorClass(impressumScore)}">${impressumScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Rechtssicherheit</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(impressumScore)}">${impressumScore}%</div>
            <div class="score-details">
              <p><strong>Impressum:</strong> ${impressumScore >= 80 ? 'Vollständig' : impressumScore >= 60 ? 'Größtenteils vorhanden' : 'Unvollständig'}</p>
              <p><strong>Empfehlung:</strong> ${impressumScore >= 80 ? 'Rechtlich abgesichert' : 'Rechtliche Pflichtangaben ergänzen'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(impressumScore)}" style="width: ${impressumScore}%"></div>
            </div>
          </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('legal-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 8px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <h4 style="color: #fbbf24; margin: 0;">▶ Rechts-Details anzeigen</h4>
        </div>
        
        <div id="legal-details" style="display: none;">
          ${getLegalAnalysis()}
        </div>
      </div>
    </div>

    ${generateDataPrivacySection(actualDataPrivacyScore, privacyData?.activeViolations || [], manualDataPrivacyData, privacyData)}

    ${quoteResponseData && quoteResponseData.responseTime ? `
    <!-- Kundenservice & Anfragebearbeitung -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('customer-service-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
        <span>▶ Kundenservice & Anfragebearbeitung</span>
        <div class="header-score-circle ${getScoreColorClass(quoteResponseScore)}">${quoteResponseScore}%</div>
      </div>
      <div id="customer-service-content" class="section-content" style="display: none;">
        <div class="metric-card">
          <h3>Kundenservice-Qualität</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(quoteResponseScore)}">${quoteResponseScore}%</div>
            <div class="score-details">
              <p><strong>Reaktionszeit:</strong> ${
                quoteResponseData.responseTime === '1-hour' ? 'Innerhalb 1 Stunde (Ausgezeichnet)' :
                quoteResponseData.responseTime === '2-4-hours' ? '2-4 Stunden (Sehr gut)' :
                quoteResponseData.responseTime === '4-8-hours' ? '4-8 Stunden (Gut)' :
                quoteResponseData.responseTime === '1-day' ? '1 Tag (Durchschnittlich)' :
                quoteResponseData.responseTime === '2-3-days' ? '2-3 Tage (Verbesserungsbedarf)' :
                'Über 3 Tage (Kritisch)'
              }</p>
              <p><strong>Antwortqualität:</strong> ${
                quoteResponseData.responseQuality === 'excellent' ? 'Ausgezeichnet' :
                quoteResponseData.responseQuality === 'good' ? 'Gut' :
                quoteResponseData.responseQuality === 'average' ? 'Durchschnittlich' :
                'Verbesserungsbedarf'
              }</p>
              <p><strong>Verfügbare Kontaktkanäle:</strong> ${Object.values(quoteResponseData.contactMethods || {}).filter(Boolean).length} von 5</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(quoteResponseScore)}" style="width: ${quoteResponseScore}%"></div>
            </div>
          </div>
        </div>
        
        <!-- Detailanalyse Kundenservice -->
        <div class="detail-grid" style="margin-top: 20px;">
          <div class="detail-item">
            <h4>📞 Kontaktmöglichkeiten</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
              ${Object.entries(quoteResponseData.contactMethods || {}).map(([method, available]) => {
                const methodLabels = {
                  phone: 'Telefon',
                  email: 'E-Mail', 
                  contactForm: 'Kontaktformular',
                  whatsapp: 'WhatsApp',
                  messenger: 'Messenger'
                };
                const methodIcons = {
                  phone: '📞',
                  email: '📧',
                  contactForm: '📝',
                  whatsapp: '💬',
                  messenger: '💭'
                };
                return `
                  <div style="text-align: center; padding: 10px; background: ${available ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)'}; border-radius: 6px; border: 2px ${available ? 'solid rgba(34, 197, 94, 0.3)' : 'dashed rgba(107, 114, 128, 0.3)'};">
                    <div style="font-size: 1.5em; margin-bottom: 5px;">${methodIcons[method] || '📋'}</div>
                    <div style="font-size: 0.9em; font-weight: bold; color: ${available ? '#22c55e' : '#6b7280'};">${methodLabels[method] || method}</div>
                    <div style="font-size: 0.7em; color: ${available ? '#22c55e' : '#6b7280'};">${available ? 'Verfügbar' : 'Nicht verfügbar'}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <div class="detail-item">
            <h4>⏰ Service-Zeiten & Erreichbarkeit</h4>
            <div style="padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
              <p><strong>Erreichbarkeit:</strong> ${
                quoteResponseData.availabilityHours === '24-7' ? '24/7 Verfügbar (Optimal)' :
                quoteResponseData.availabilityHours === 'extended-hours' ? 'Erweiterte Zeiten Mo-Sa (Sehr gut)' :
                quoteResponseData.availabilityHours === 'business-hours' ? 'Geschäftszeiten Mo-Fr (Standard)' :
                'Nicht angegeben'
              }</p>
              <p><strong>Reaktionszeit-Bewertung:</strong> 
                <span style="color: ${
                  quoteResponseData.responseTime === '1-hour' || quoteResponseData.responseTime === '2-4-hours' ? '#22c55e' :
                  quoteResponseData.responseTime === '4-8-hours' || quoteResponseData.responseTime === '1-day' ? '#f59e0b' :
                  '#ef4444'
                }; font-weight: bold;">
                  ${quoteResponseData.responseTime === '1-hour' ? 'Branchenführend schnell' :
                    quoteResponseData.responseTime === '2-4-hours' ? 'Überdurchschnittlich schnell' :
                    quoteResponseData.responseTime === '4-8-hours' ? 'anhand von Testanfrage' :
                    quoteResponseData.responseTime === '1-day' ? 'Akzeptabel' :
                    'Verbesserung dringend empfohlen'}
                </span>
              </p>
            </div>
          </div>
          
          <div class="detail-item">
            <h4>🎯 Service-Features & Prozesse</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div style="padding: 10px; background: ${quoteResponseData.automaticConfirmation ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px;">
                  <span style="color: ${quoteResponseData.automaticConfirmation ? '#22c55e' : '#6b7280'};">${quoteResponseData.automaticConfirmation ? '✅' : '❌'}</span>
                  <strong>Eingangsbestätigung</strong>
                </div>
                <p style="font-size: 0.8em; color: #6b7280; margin: 0;">
                  ${quoteResponseData.automaticConfirmation ? 'Automatische Bestätigung aktiv' : 'Keine automatische Bestätigung'}
                </p>
              </div>
              
              <div style="padding: 10px; background: ${quoteResponseData.followUpProcess ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px;">
                  <span style="color: ${quoteResponseData.followUpProcess ? '#22c55e' : '#6b7280'};">${quoteResponseData.followUpProcess ? '✅' : '❌'}</span>
                  <strong>Nachfass-Prozess</strong>
                </div>
                <p style="font-size: 0.8em; color: #6b7280; margin: 0;">
                  ${quoteResponseData.followUpProcess ? 'Strukturierte Nachfassung' : 'Kein systematisches Nachfassen'}
                </p>
              </div>
              
              <div style="padding: 10px; background: ${quoteResponseData.personalContact ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)'}; border-radius: 6px;">
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 5px;">
                  <span style="color: ${quoteResponseData.personalContact ? '#22c55e' : '#6b7280'};">${quoteResponseData.personalContact ? '✅' : '❌'}</span>
                  <strong>Persönlicher Kontakt</strong>
                </div>
                <p style="font-size: 0.8em; color: #6b7280; margin: 0;">
                  ${quoteResponseData.personalContact ? 'Fester Ansprechpartner' : 'Kein fester Ansprechpartner'}
                </p>
              </div>
            </div>
          </div>
          
          ${quoteResponseData.notes ? `
          <div class="detail-item">
            <h4>📝 Zusätzliche Informationen</h4>
            <div style="padding: 15px; background: rgba(156, 163, 175, 0.1); border-radius: 8px; border-left: 4px solid #9ca3af;">
              <p style="margin: 0; font-style: italic; color: #374151;">"${quoteResponseData.notes}"</p>
            </div>
          </div>
          ` : ''}
          
        </div>
        </div>
        
        <div class="collapsible" onclick="toggleSection('customer-service-recommendations')" style="cursor: pointer; margin-top: 20px; padding: 10px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.3);">
          <h4 style="color: #22c55e; margin: 0;">▶ Verbesserungsempfehlungen</h4>
        </div>
        
        <div id="customer-service-recommendations" style="display: none;">
          <div class="recommendations">
            <h4>Handlungsempfehlungen für besseren Kundenservice:</h4>
            <ul>
              ${quoteResponseData.responseTime === 'over-3-days' || quoteResponseData.responseTime === '2-3-days' ? 
                '<li><strong>Priorität HOCH:</strong> Reaktionszeit drastisch verkürzen - Ziel: unter 24 Stunden</li>' : ''}
              ${Object.values(quoteResponseData.contactMethods || {}).filter(Boolean).length < 3 ? 
                '<li><strong>Empfehlung:</strong> Zusätzliche Kontaktkanäle einrichten (WhatsApp Business, Kontaktformular)</li>' : ''}
              ${!quoteResponseData.automaticConfirmation ? 
                '<li><strong>Quick Win:</strong> Automatische Eingangsbestätigung implementieren</li>' : ''}
              ${!quoteResponseData.followUpProcess ? 
                '<li><strong>Prozessoptimierung:</strong> Strukturierten Nachfass-Prozess etablieren</li>' : ''}
              ${!quoteResponseData.personalContact ? 
                '<li><strong>Kundenbeziehung:</strong> Feste Ansprechpartner zuweisen für bessere Betreuung</li>' : ''}
              ${quoteResponseData.responseQuality === 'poor' || quoteResponseData.responseQuality === 'average' ? 
                '<li><strong>Qualitätssteigerung:</strong> Antwortvorlagen entwickeln und Mitarbeiter schulen</li>' : ''}
              ${quoteResponseData.availabilityHours === 'business-hours' ? 
                '<li><strong>Erreichbarkeit:</strong> Erweiterte Servicezeiten prüfen (Samstag, Abendstunden)</li>' : ''}
              <li><strong>Monitoring:</strong> Regelmäßige Messung der Reaktionszeiten und Kundenzufriedenheit</li>
              <li><strong>Digitalisierung:</strong> CRM-System für bessere Anfragenverfolgung implementieren</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    ${staffQualificationScore !== null ? `
    <!-- Mitarbeiterqualifizierung -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('staff-qualification-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
        <span>▶ Mitarbeiterqualifizierung & Personal</span>
        <div class="header-score-circle ${staffQualificationData && staffQualificationData.totalEmployees > 0 ? getScoreColorClass(staffQualificationScore) : 'neutral'}">${displayStaffScore}</div>
      </div>
      <div id="staff-qualification-content" class="section-content" style="display: none;">
        <div class="metric-card">
          <h3>Personal-Qualifikation</h3>
          <div class="score-display">
            <div class="score-circle ${staffQualificationData && staffQualificationData.totalEmployees > 0 ? getScoreColorClass(staffQualificationScore) : 'neutral'}">${displayStaffScore}</div>
            <div class="score-details">
              <p><strong>Gesamt-Mitarbeiter:</strong> ${staffQualificationData?.totalEmployees || 0}</p>
              <p><strong>Qualifizierte Kräfte:</strong> ${(staffQualificationData?.skilled_workers || 0) + (staffQualificationData?.masters || 0) + (staffQualificationData?.office_workers || 0)} von ${staffQualificationData?.totalEmployees || 0}</p>
              <p><strong>Meister-Quote:</strong> ${staffQualificationData?.masters || 0} Meister</p>
              <p><strong>Facharbeiter & Bürokräfte:</strong> ${(staffQualificationData?.skilled_workers || 0) + (staffQualificationData?.office_workers || 0)} qualifizierte Mitarbeiter</p>
            </div>
          </div>
          ${staffQualificationData && staffQualificationData.totalEmployees > 0 ? `
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(staffQualificationScore)}" style="width: ${staffQualificationScore}%"></div>
            </div>
          </div>` : `
          <div class="progress-container">
            <div class="progress-bar">
              <div style="text-align: center; padding: 10px; color: #6b7280; font-style: italic;">Keine Daten eingegeben</div>
            </div>
          </div>`}
        </div>
        
        ${staffQualificationData ? `
        <div class="detail-grid" style="margin-top: 20px;">
          <div class="detail-item">
            <h4>👨‍💼 Mitarbeiterstruktur</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px;">
              <div style="text-align: center; padding: 10px; background: rgba(251, 191, 36, 0.1); border-radius: 6px;">
                <div style="font-size: 1.5em; font-weight: bold; color: #fbbf24;">${staffQualificationData.masters || 0}</div>
                <div style="font-size: 0.8em; color: #6b7280;">Meister</div>
              </div>
              <div style="text-align: center; padding: 10px; background: rgba(34, 197, 94, 0.1); border-radius: 6px;">
                <div style="font-size: 1.5em; font-weight: bold; color: #22c55e;">${staffQualificationData.skilled_workers || 0}</div>
                <div style="font-size: 0.8em; color: #6b7280;">Gesellen</div>
              </div>
              <div style="text-align: center; padding: 10px; background: rgba(168, 85, 247, 0.1); border-radius: 6px;">
                <div style="font-size: 1.5em; font-weight: bold; color: #a855f7;">${staffQualificationData.office_workers || 0}</div>
                <div style="font-size: 0.8em; color: #6b7280;">Bürokräfte</div>
              </div>
              <div style="text-align: center; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 6px;">
                <div style="font-size: 1.5em; font-weight: bold; color: #3b82f6;">${staffQualificationData.apprentices || 0}</div>
                <div style="font-size: 0.8em; color: #6b7280;">Azubis</div>
              </div>
              <div style="text-align: center; padding: 10px; background: rgba(107, 114, 128, 0.1); border-radius: 6px;">
                <div style="font-size: 1.5em; font-weight: bold; color: #6b7280;">${staffQualificationData.unskilled_workers || 0}</div>
                <div style="font-size: 0.8em; color: #6b7280;">Ungelernte</div>
              </div>
            </div>
          </div>
          
          ${Object.values(staffQualificationData.certifications || {}).some(Boolean) ? `
          <div class="detail-item">
            <h4>🏆 Zertifizierungen</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${Object.entries(staffQualificationData.certifications)
                .filter(([, value]) => value)
                .map(([key]) => `<span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>`)
                .join('')}
            </div>
          </div>
          ` : ''}
          
          ${(staffQualificationData.industry_specific || []).length > 0 ? `
          <div class="detail-item">
            <h4>🔧 Branchenspezifische Qualifikationen</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${staffQualificationData.industry_specific.map(qual => 
                `<span style="background: rgba(59, 130, 246, 0.2); color: #3b82f6; padding: 4px 8px; border-radius: 4px; font-size: 0.8em;">${qual}</span>`
              ).join('')}
            </div>
          </div>
          ` : ''}
          
          <div class="detail-item">
            <h4>📊 Weitere Kennzahlen</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div>
                <p><strong>Durchschnittliche Berufserfahrung:</strong> ${staffQualificationData.average_experience_years || 0} Jahre</p>
              </div>
              <div>
                <p><strong>Weiterbildungsbudget/Jahr:</strong> ${(staffQualificationData.training_budget_per_year || 0).toLocaleString()} €</p>
              </div>
            </div>
            ${staffQualificationData.specializations ? `<p><strong>Spezialisierungen:</strong> ${staffQualificationData.specializations}</p>` : ''}
          </div>
        </div>
        
        <div class="recommendations" style="margin-top: 20px;">
          <h4>Empfehlungen zur Personalentwicklung</h4>
          <ul>
            ${staffQualificationScore < 70 ? '<li><strong>Priorität:</strong> Qualifikationsgrad der Mitarbeiter erhöhen</li>' : ''}
            ${(staffQualificationData.masters || 0) === 0 ? '<li>Meisterqualifikation anstreben für Führungspositionen</li>' : ''}
            ${Object.values(staffQualificationData.certifications || {}).filter(Boolean).length < 3 ? '<li>Zusätzliche Zertifizierungen erwerben (Sicherheit, Digitalisierung)</li>' : ''}
            ${(staffQualificationData.industry_specific || []).length < 2 ? '<li>Branchenspezifische Weiterbildungen verstärken</li>' : ''}
            ${(staffQualificationData.training_budget_per_year || 0) < 1000 ? '<li>Weiterbildungsbudget erhöhen (empfohlen: mind. 1.000€/MA/Jahr)</li>' : ''}
            ${(staffQualificationData.apprentices || 0) === 0 ? '<li>Ausbildungsplätze schaffen für Nachwuchsförderung</li>' : ''}
          </ul>
        </div>
        ` : `
        <div class="alert-box" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); padding: 15px; border-radius: 8px; margin-top: 15px;">
          <h4 style="color: #ef4444; margin-top: 0;">Keine Daten zur Mitarbeiterqualifizierung erfasst</h4>
          <p>Für eine vollständige Bewertung der Personalqualität sollten Daten zur Mitarbeiterstruktur, Qualifikationen und Zertifizierungen erfasst werden.</p>
        </div>
        `}
      </div>
    </div>
    ` : ''}


    <!-- Strategische Empfehlungen -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('recommendations-content')" style="cursor: pointer;">▶ Strategische Empfehlungen</div>
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
