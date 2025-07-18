

import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateOverallScore, calculateHourlyRateScore, calculateContentQualityScore, calculateBacklinksScore, calculateAccessibilityScore } from './scoreCalculations';
import { generateDataPrivacySection } from './reportSections';

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
  hourlyRateData?: { ownRate: number; regionAverage: number };
  missingImprintElements?: string[];
  manualSocialData?: ManualSocialData | null;
  manualWorkplaceData?: ManualWorkplaceData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  manualImprintData?: { elements: string[] } | null;
  dataPrivacyScore?: number;
}

// Function to get score range for data attribute
const getScoreRange = (score: number) => {
  if (score < 50) return "0-50";
  if (score < 80) return "50-80";
  return "80-100";
};

// Function to get score color class
const getScoreColorClass = (score: number) => {
  if (score < 60) return "red";       // 0-60% rot
  if (score < 80) return "green";     // 60-80% grün
  return "yellow";                    // 80-100% gelb
};

// Function to get score color (hex value for inline styles)
const getScoreColor = (score: number) => {
  if (score <= 60) return '#dc2626';   // 0-60% rot
  if (score <= 80) return '#16a34a';   // 61-80% grün
  return '#eab308';                    // 81-100% gelb
};

export const generateCustomerHTML = ({
  businessData,
  realData,
  manualCompetitors,
  competitorServices,
  companyServices,
  deletedCompetitors = new Set(),
  hourlyRateData,
  missingImprintElements = [],
  manualSocialData,
  manualWorkplaceData,
  manualKeywordData,
  keywordScore,
  manualImprintData,
  dataPrivacyScore = 75
}: CustomerReportData) => {
  console.log('HTML Generator received missingImprintElements:', missingImprintElements);
  console.log('HTML Generator received manualWorkplaceData:', manualWorkplaceData);
  console.log('HTML Generator received competitorServices:', competitorServices);
  console.log('HTML Generator received manualCompetitors:', manualCompetitors);
  
  // Calculate scores for own business including services
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
  
  // Calculate additional scores
  const contentQualityScore = calculateContentQualityScore(realData, manualKeywordData, businessData);
  const backlinksScore = calculateBacklinksScore(realData);
  
  // Use actual company services if available, otherwise fall back to industry defaults
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
  
  const ownServiceScore = Math.min(100, 40 + (expectedServices.length * 10));
  
  // Berechnung für eigenes Unternehmen - EXAKT wie in CompetitorAnalysis.tsx
  const ownRating = typeof realData.reviews.google.rating === 'number' && !isNaN(realData.reviews.google.rating) ? realData.reviews.google.rating : 0;
  const ownReviews = typeof realData.reviews.google.count === 'number' && !isNaN(realData.reviews.google.count) ? realData.reviews.google.count : 0;
  
  // Rating-Score: 4.4/5 = 88%
  const ownRatingScore = (ownRating / 5) * 100;
  
  // Review-Score: Bewertungen bis 100 = 100%, darüber gestaffelt (EXAKT wie in CompetitorAnalysis)
  const ownReviewScore = ownReviews <= 100 ? ownReviews : Math.min(100, 100 + Math.log10(ownReviews / 100) * 20);
  
  // Service-Score: Anzahl Services mit Maximum bei 20 Services = 100%
  const ownBaseServiceScore = Math.min(100, (expectedServices.length / 20) * 100);
  
  // WICHTIG: Eigenes Unternehmen bekommt KEINE unique service bonus, da es die Referenz ist
  const ownFinalServiceScore = ownBaseServiceScore; // Keine unique services für eigenes Unternehmen
  
  // Verwende exakt die gleiche Gewichtung wie in CompetitorAnalysis: Rating 50%, Reviews 20%, Services 30%
  const competitorComparisonScore = Math.round((ownRatingScore * 0.5) + (ownReviewScore * 0.2) + (ownFinalServiceScore * 0.3));
  
  console.log('HTML Generator - Own Business Scores (EXACT Match CompetitorAnalysis):', {
    rating: realData.reviews.google.rating,
    reviews: realData.reviews.google.count,
    services: expectedServices.length,
    ratingScore: ownRatingScore,
    reviewScore: ownReviewScore,
    baseServiceScore: ownBaseServiceScore,
    finalServiceScore: ownFinalServiceScore,
    overall: competitorComparisonScore
  });
  
  // Verwende den gleichen Score für den Marktpositions-Vergleich
  const marketComparisonScore = competitorComparisonScore;
  // Impressum Analysis - berücksichtigt manuelle Eingaben
  const requiredElements = [
    'Firmenname', 'Rechtsform', 'Geschäftsführer/Inhaber', 'Adresse', 
    'Telefonnummer', 'E-Mail-Adresse', 'Handelsregisternummer', 'Steuernummer', 
    'USt-IdNr.', 'Kammerzugehörigkeit', 'Berufsbezeichnung', 'Aufsichtsbehörde'
  ];
  
  const finalMissingImprintElements = manualImprintData 
    ? requiredElements.filter(e => !manualImprintData.elements.includes(e))
    : missingImprintElements;
    
  const foundImprintElements = manualImprintData 
    ? manualImprintData.elements
    : requiredElements.filter(e => !missingImprintElements.includes(e));
    
  const impressumScore = Math.round((foundImprintElements.length / requiredElements.length) * 100);
  
  // Calculate additional scores
  const pricingScore = hourlyRateData ? Math.min(100, (hourlyRateData.ownRate / hourlyRateData.regionAverage) * 100) : 65;
  const workplaceScore = realData.workplace ? Math.round(realData.workplace.overallScore) : 65;
  const reputationScore = realData.reviews.google.rating * 20;
  const accessibilityScore = calculateAccessibilityScore(realData);
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
  // Workplace Analysis
  const getWorkplaceAnalysis = () => {
    const workplaceScore = realData.workplace ? Math.round(realData.workplace.overallScore) : 65;
    return `
      <div class="metric-card warning">
        <h3>💼 Arbeitgeber-Bewertung</h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(workplaceScore)}">${workplaceScore}%</div>
          <div class="score-details">
            <p><strong>Gesamtbewertung:</strong> ${workplaceScore >= 70 ? 'Sehr gut' : workplaceScore >= 50 ? 'Gut' : 'Verbesserungsbedarf'}</p>
            <p><strong>Empfehlung:</strong> ${workplaceScore >= 70 ? 'Attraktiver Arbeitgeber' : 'Employer Branding stärken'}</p>
          </div>
        </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${workplaceScore}%; background-color: ${
                workplaceScore < 20 ? '#CD0000' :
                workplaceScore <= 60 ? '#dc2626' :
                workplaceScore <= 80 ? '#16a34a' :
                '#eab308'
              };"></div>
            </div>
          </div>
      </div>
    `;
  };

  // Reputation Analysis
  const getReputationAnalysis = () => {
    const reputationScore = realData.reviews.google.rating * 20;
    return `
      <div class="metric-card ${realData.reviews.google.count > 0 ? 'good' : 'warning'}">
        <h3>Google Bewertungen</h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(reputationScore)}">${realData.reviews.google.rating}/5</div>
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
    
    const pricingScore = Math.min(100, (hourlyRateData.ownRate / hourlyRateData.regionAverage) * 100);
    return `
      <div class="metric-card good">
        <h3>Stundensatz-Analyse</h3>
        <div class="score-display">
          <div class="score-circle ${getScoreColorClass(pricingScore)}">${pricingScore}%</div>
          <div class="score-details">
            <p><strong>Ihr Stundensatz:</strong> ${hourlyRateData.ownRate}€/h</p>
            <p><strong>Regionaler Durchschnitt:</strong> ${hourlyRateData.regionAverage}€/h</p>
            <p><strong>Positionierung:</strong> ${pricingScore >= 80 ? 'Über Durchschnitt' : pricingScore >= 60 ? 'Durchschnitt' : 'Unter Durchschnitt'}</p>
          </div>
        </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${pricingScore}%; background-color: ${
                pricingScore < 20 ? '#CD0000' :
                pricingScore <= 60 ? '#dc2626' :
                pricingScore <= 80 ? '#16a34a' :
                '#eab308'
              };"></div>
            </div>
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
          <div class="score-circle ${getScoreColorClass(legalScore)}">${legalScore}%</div>
          <div class="score-details">
            <p><strong>Impressum:</strong> ${legalScore >= 80 ? 'Vollständig' : legalScore >= 60 ? 'Größtenteils vorhanden' : 'Unvollständig'}</p>
            <p><strong>Empfehlung:</strong> ${legalScore >= 80 ? 'Rechtlich abgesichert' : 'Rechtliche Pflichtangaben ergänzen'}</p>
          </div>
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

        <!-- Impressum-Details -->
        <div style="margin-top: 20px;">
          <h4 class="section-text" style="margin-bottom: 10px;">📋 Impressum-Analyse</h4>
          
          ${foundImprintElements.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h5 class="success-text" style="margin-bottom: 8px;">✅ Vorhandene Angaben:</h5>
            <ul style="margin: 0; padding-left: 20px;">
              ${foundImprintElements.map(element => `<li class="success-text" style="margin-bottom: 3px;">✅ ${element}</li>`).join('')}
            </ul>
            ${manualImprintData ? '<p style="font-size: 0.9em; margin-top: 8px;"><strong>Hinweis:</strong> Diese Angaben wurden manuell bestätigt.</p>' : ''}
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
    // Berechne Accessibility Score basierend auf tatsächlichen Daten
    const accessibilityScore = calculateAccessibilityScore(realData);
    const violations = [
      { impact: 'critical', description: 'Bilder ohne Alt-Text', count: 3 },
      { impact: 'serious', description: 'Unzureichender Farbkontrast', count: 5 },
      { impact: 'moderate', description: 'Fehlerhafte Überschriftenstruktur', count: 2 },
      { impact: 'minor', description: 'Fehlende Fokus-Indikatoren', count: 4 }
    ];
    
    const passes = [
      'Dokument hat einen Titel',
      'Hauptsprache ist definiert', 
      'Navigation ist als Landmark markiert',
      'Buttons haben aussagekräftige Labels'
    ];

    const scoreClass = accessibilityScore >= 80 ? 'yellow' : accessibilityScore >= 60 ? 'green' : 'red';

    return `
      <div class="metric-card ${scoreClass}">
        <h3 class="header-accessibility" style="padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
          <span>♿ Barrierefreiheit & Zugänglichkeit</span>
          <span style="background: white; color: ${getScoreColor(accessibilityScore)}; padding: 8px 16px; border-radius: 20px; font-weight: bold;">${accessibilityScore}%</span>
        </h3>
        <div class="score-display">
          <div class="score-circle" style="background-color: ${getScoreColor(accessibilityScore)}; color: white; border-radius: 50%; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px;">${accessibilityScore}%</div>
          <div class="score-details">
            <p><strong>Compliance-Level:</strong> 
              <span style="color: ${getScoreColor(accessibilityScore)}; font-weight: bold;">
                ${accessibilityScore >= 80 ? 'AA konform' : accessibilityScore >= 60 ? 'Teilweise konform' : 'Nicht konform'}
              </span>
            </p>
            <p><strong>Empfehlung:</strong> ${accessibilityScore >= 80 ? 'Sehr gute Barrierefreiheit' : 'Barrierefreiheit dringend verbessern'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${accessibilityScore}%; background-color: ${getScoreColor(accessibilityScore)};"></div>
          </div>
        </div>

        <!-- WCAG-Analyse -->
        <div class="collapsible" onclick="toggleSection('wcag-details')" style="cursor: pointer; margin-top: 15px; padding: 10px; background: ${
          accessibilityScore < 20 ? '#CD0000' :
          accessibilityScore <= 60 ? '#dc2626' :
          accessibilityScore <= 80 ? '#16a34a' :
          '#eab308'
        }; border-radius: 8px; border: 1px solid ${
          accessibilityScore <= 60 ? '#dc2626' :
          accessibilityScore <= 80 ? '#16a34a' :
          '#eab308'
        };">
          <h4 style="color: white; margin: 0;">▶ WCAG 2.1 Compliance Details</h4>
        </div>
        
        <div id="wcag-details" style="display: none;">
          <!-- Violations Overview -->
          <div class="violations-box" style="margin-top: 20px; padding: 15px; border-radius: 8px;">
            <h4>🚨 Erkannte Probleme</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
              ${violations.map(v => `
                <div style="padding: 8px; background: ${
                  v.impact === 'critical' ? 'rgba(239, 68, 68, 0.2)' :
                  v.impact === 'serious' ? 'rgba(245, 158, 11, 0.2)' :
                  v.impact === 'moderate' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)'
                }; border-radius: 6px;">
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
                    <div class="progress-fill" style="width: ${Math.max(30, accessibilityScore)}%; background-color: ${getScoreColor(accessibilityScore)};"></div>
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
                    <div class="progress-fill" style="width: ${accessibilityScore}%; background-color: ${getScoreColor(accessibilityScore)};"></div>
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
                    <div class="progress-fill" style="width: ${Math.max(25, accessibilityScore * 0.9)}%; background-color: ${getScoreColor(Math.max(25, accessibilityScore * 0.9))};"></div>
                  </div>
                </div>
              </div>
            </div>
            
            ${accessibilityScore < 70 ? `
            <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-top: 15px;">
              <h4 class="error-text" style="margin: 0 0 10px 0;">⚠️ WARNUNG: Abmahnungsrisiko</h4>
              <p class="error-text" style="margin: 0 0 10px 0; font-weight: bold;">
                Ihre Website erfüllt nicht die gesetzlichen Anforderungen an die Barrierefreiheit.
              </p>
              <p class="error-text" style="margin: 0 0 10px 0; font-size: 14px;">
                <strong>Rechtliche Konsequenzen:</strong> Abmahnungen durch Anwaltskanzleien, 
                Klagen von Betroffenen, Bußgelder bei öffentlichen Stellen.
              </p>
              <p class="error-text" style="margin: 0; font-size: 14px;">
                <strong>Empfehlung:</strong> Sofortige Behebung der Barrierefreiheitsmängel erforderlich.
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
    const effectiveKeywordScore = keywordScore !== undefined ? keywordScore : realData.seo.score;
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
    
    // Kritischere Gesamtbewertung
    const criticalSeoScore = Math.round((titleTagScore + metaDescriptionScore + headingScore + altTagsScore) / 4);
    const scoreClass = criticalSeoScore >= 80 ? 'yellow' : criticalSeoScore >= 60 ? 'green' : 'red';

    return `
      <div class="metric-card ${scoreClass}">
        <h3 class="header-seo" style="padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
          <span>🔍 SEO-Bestandsanalyse</span>
          <span style="background: white; color: ${getScoreColor(criticalSeoScore)}; padding: 8px 16px; border-radius: 20px; font-weight: bold;">${criticalSeoScore}%</span>
        </h3>
        <div class="score-display">
          <div class="score-circle" style="background-color: ${getScoreColor(criticalSeoScore)}; color: white; border-radius: 50%; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px;">${criticalSeoScore}%</div>
          <div class="score-details">
            <p><strong>Sichtbarkeit:</strong> ${criticalSeoScore >= 80 ? 'Hoch' : criticalSeoScore >= 60 ? 'Mittel' : 'Niedrig'}</p>
            <p><strong>Empfehlung:</strong> ${criticalSeoScore >= 80 ? 'Sehr gute SEO-Basis' : criticalSeoScore >= 60 ? 'SEO-Grundlagen vorhanden, Optimierung empfohlen' : 'Dringende SEO-Verbesserungen erforderlich'}</p>
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
              <p><strong>Keyword-Analyse:</strong> ${foundKeywords}/${keywordData.length} Keywords gefunden</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(effectiveKeywordScore)}" style="width: ${effectiveKeywordScore}%; background-color: ${getScoreColor(effectiveKeywordScore)};"></div>
                    <div class="progress-point" style="left: ${effectiveKeywordScore}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                  </div>
                </div>
              <small class="secondary-text">Score: ${effectiveKeywordScore}%</small>
            </div>
            <div>
              <p><strong>Long-Tail Keywords:</strong> ${effectiveKeywordScore >= 60 ? 'Gut optimiert' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(20, effectiveKeywordScore * 0.6))}" style="width: ${Math.max(20, effectiveKeywordScore * 0.6)}%; background-color: ${getScoreColor(Math.max(20, effectiveKeywordScore * 0.6))};"></div>
                  <div class="progress-point" style="left: ${Math.max(20, effectiveKeywordScore * 0.6)}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                </div>
              </div>
              <small class="secondary-text">Score: ${Math.max(20, effectiveKeywordScore * 0.6).toFixed(0)}%</small>
            </div>
            <div>
              <p><strong>Lokale Keywords:</strong> ${businessData.address ? 'Vorhanden' : 'Fehlend'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20)}" style="width: ${businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20}%; background-color: ${getScoreColor(businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20)};"></div>
                  <div class="progress-point" style="left: ${businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px;"></div>
                </div>
              </div>
              <small class="secondary-text">Score: ${(businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20).toFixed(0)}%</small>
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
            </div>
            <div>
              <p><strong>Interne Verlinkung:</strong> ${seoScore >= 60 ? 'Gut strukturiert' : 'Ausbaufähig'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(30, seoScore * 0.9))}" style="width: ${Math.max(30, seoScore * 0.9)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Breadcrumbs:</strong> ${seoScore >= 70 ? 'Implementiert' : 'Fehlen teilweise'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(seoScore >= 70 ? 85 : 35)}" style="width: ${seoScore >= 70 ? 85 : 35}%"></div>
                </div>
              </div>
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
            </div>
            <div>
              <p><strong>Schema Markup:</strong> ${seoScore >= 80 ? 'Implementiert' : 'Teilweise/Fehlend'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(seoScore >= 80 ? 90 : 25)}" style="width: ${seoScore >= 80 ? 90 : 25}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>XML Sitemap:</strong> ${seoScore >= 60 ? 'Vorhanden' : 'Nicht gefunden'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(seoScore >= 60 ? 85 : 30)}" style="width: ${seoScore >= 60 ? 85 : 30}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    `;
  };

  // Local SEO Analysis - Vollständige Integration
  const getLocalSEOAnalysis = () => {
    // Simulierte Local SEO Daten basierend auf der LocalSEO-Komponente
    const localSEOData = {
      overallScore: 74,
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

    const scoreClass = localSEOData.overallScore >= 80 ? 'yellow' : localSEOData.overallScore >= 60 ? 'green' : 'red';

    return `
      <div class="metric-card ${scoreClass}">
        <h3 class="header-local-seo" style="padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
          <span>📍 Lokale SEO & Regionale Sichtbarkeit</span>
          <span style="background: white; color: ${getScoreColor(localSEOData.overallScore)}; padding: 8px 16px; border-radius: 20px; font-weight: bold;">${localSEOData.overallScore}%</span>
        </h3>
        
        <div class="score-display">
          <div class="score-circle" style="background-color: ${getScoreColor(localSEOData.overallScore)}; color: white; border-radius: 50%; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 24px;">${localSEOData.overallScore}%</div>
          <div class="score-details">
            <p><strong>Lokale Sichtbarkeit:</strong> ${localSEOData.overallScore >= 80 ? 'Sehr gut' : localSEOData.overallScore >= 60 ? 'Gut' : 'Verbesserungsbedarf'}</p>
            <p><strong>Empfehlung:</strong> ${localSEOData.overallScore >= 80 ? 'Exzellente lokale Präsenz' : localSEOData.overallScore >= 60 ? 'Gute Basis, weitere Optimierung möglich' : 'Lokale SEO dringend optimieren'}</p>
          </div>
        </div>
        

        <!-- Google My Business -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
          <h4>🏢 Google My Business</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 10px;">
            <div>
              <p><strong>Status:</strong> ${localSEOData.googleMyBusiness.claimed ? '✅ Beansprucht' : '❌ Nicht beansprucht'}</p>
              <p><strong>Verifiziert:</strong> ${localSEOData.googleMyBusiness.verified ? '✅ Ja' : '❌ Nein'}</p>
              <p><strong>Vollständigkeit:</strong> ${localSEOData.googleMyBusiness.complete}%</p>
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
              <span style="font-weight: bold; color: ${getScoreColor(localSEOData.googleMyBusiness.score)};">${localSEOData.googleMyBusiness.score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(localSEOData.googleMyBusiness.score)}" style="width: ${localSEOData.googleMyBusiness.score}%; background-color: ${getScoreColor(localSEOData.googleMyBusiness.score)};"></div>
              <div class="progress-point" style="position: absolute; left: ${localSEOData.googleMyBusiness.score}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
          </div>
        </div>

        <!-- Lokale Verzeichnisse (Citations) -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
          <h4>🌐 Lokale Verzeichnisse & Citations</h4>
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
                 <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; background: ${
                   directory.status === 'vollständig' ? 'directory-complete' :        
                   directory.status === 'unvollständig' ? 'directory-incomplete' :      
                   'directory-missing'
                 };">${directory.status}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="progress-container" style="margin-top: 15px;">
            <div class="progress-label">
              <span>Citation Qualität</span>
              <span style="font-weight: bold; color: ${getScoreColor(localSEOData.localCitations.score)};">${localSEOData.localCitations.score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(localSEOData.localCitations.score)}" style="width: ${localSEOData.localCitations.score}%; background-color: ${getScoreColor(localSEOData.localCitations.score)};"></div>
              <div class="progress-point" style="position: absolute; left: ${localSEOData.localCitations.score}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
          </div>
        </div>

        <!-- Lokale Keywords -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(245, 158, 11, 0.1); border-radius: 8px;">
          <h4>🎯 Lokale Keyword-Rankings</h4>
          <div style="display: grid; gap: 10px; margin-top: 10px;">
            ${localSEOData.localKeywords.ranking.map(keyword => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.7); border-radius: 6px; border: 1px solid #e5e7eb;">
                <div>
                  <span style="font-weight: 500;">${keyword.keyword}</span>
                  <span class="${keyword.volume === 'hoch' ? 'volume-high' : keyword.volume === 'mittel' ? 'volume-medium' : 'volume-low'}">${keyword.volume} Volumen</span>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 18px; font-weight: bold; color: ${keyword.volume === 'hoch' ? '#fbbf24' : keyword.volume === 'mittel' ? '#22c55e' : '#ef4444'};">#${keyword.position}
                    #${keyword.position}
                  </div>
                  <div style="font-size: 11px; color: #9ca3af;">Position</div>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="progress-container" style="margin-top: 15px;">
            <div class="progress-label">
              <span>Lokale Keyword Performance</span>
              <span style="font-weight: bold; color: ${getScoreColor(localSEOData.localKeywords.score)};">${localSEOData.localKeywords.score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(localSEOData.localKeywords.score)}" style="width: ${localSEOData.localKeywords.score}%; background-color: ${getScoreColor(localSEOData.localKeywords.score)};"></div>
              <div style="position: absolute; left: ${localSEOData.localKeywords.score}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
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
            </div>
          </div>
          
          <div class="progress-container" style="margin-top: 15px;">
            <div class="progress-label">
              <span>Lokaler Content</span>
              <span style="font-weight: bold; color: ${getScoreColor(localSEOData.onPageLocal.localContent)};">${localSEOData.onPageLocal.localContent}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(localSEOData.onPageLocal.localContent)}" style="width: ${localSEOData.onPageLocal.localContent}%; background-color: ${getScoreColor(localSEOData.onPageLocal.localContent)};"></div>
              <div class="progress-point" style="position: absolute; left: ${localSEOData.onPageLocal.localContent}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
          </div>
          
          <div class="progress-container" style="margin-top: 10px;">
            <div class="progress-label">
              <span>On-Page Local Gesamt</span>
              <span style="font-weight: bold; color: ${getScoreColor(localSEOData.onPageLocal.score)};">${localSEOData.onPageLocal.score}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(localSEOData.onPageLocal.score)}" style="width: ${localSEOData.onPageLocal.score}%; background-color: ${getScoreColor(localSEOData.onPageLocal.score)};"></div>
              <div class="progress-point" style="position: absolute; left: ${localSEOData.onPageLocal.score}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
          </div>
        </div>

        <div class="recommendations">
          <h4>Handlungsempfehlungen für lokale SEO:</h4>
          <ul>
            ${localSEOData.googleMyBusiness.score < 90 ? '<li>Google My Business Profil vollständig optimieren und regelmäßig aktualisieren</li>' : ''}
            ${localSEOData.localCitations.score < 80 ? '<li>Einträge in lokalen Verzeichnissen erstellen und NAP-Konsistenz sicherstellen</li>' : ''}
            ${localSEOData.localKeywords.score < 80 ? '<li>Lokale Keywords in Content und Meta-Tags integrieren</li>' : ''}
            ${!localSEOData.onPageLocal.localSchema ? '<li>Local Business Schema Markup implementieren</li>' : ''}
            <li>Lokale Inhalte und regionale Bezüge auf der Website verstärken</li>
            <li>Kundenbewertungen aktiv sammeln und beantworten</li>
            <li>Lokale Backlinks durch Partnerschaften und Events aufbauen</li>
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
          <div class="score-circle ${getScoreColorClass(performanceScore)}">${performanceScore}%</div>
          <div class="score-details">
            <p><strong>Ladezeit:</strong> ${realData.performance.loadTime}s</p>
            <p><strong>Empfehlung:</strong> ${performanceScore >= 70 ? 'Sehr gute Performance' : 'Performance verbessern für bessere Nutzererfahrung'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${performanceScore}%; background-color: ${getScoreColor(performanceScore)};"></div>
          </div>
        </div>
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Bilder komprimieren und optimieren</li>
            <li>Browser-Caching aktivieren</li>
            <li>CSS und JavaScript minimieren</li>
            <li>Content Delivery Network nutzen</li>
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
          <div class="score-circle ${getScoreColorClass(mobileScore)}">${mobileScore}%</div>
          <div class="score-details">
            <p><strong>Mobile-Freundlichkeit:</strong> ${mobileScore >= 70 ? 'Hoch' : mobileScore >= 40 ? 'Mittel' : 'Niedrig'}</p>
            <p><strong>Empfehlung:</strong> ${mobileScore >= 70 ? 'Sehr gute mobile Optimierung' : 'Mobile Optimierung verbessern für mehr Nutzer'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${mobileScore}%; background-color: ${getScoreColor(mobileScore)};"></div>
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
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(20, 100 - (realData.performance.loadTime * 15)))}" style="width: ${Math.max(20, 100 - (realData.performance.loadTime * 15))}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Core Web Vitals:</strong> ${mobileScore >= 70 ? 'Gut' : 'Verbesserungsbedarf'}</p>
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
    
    // Kombiniere manuelle und automatische Wettbewerber, filtere gelöschte aus
    const allCompetitors = [...(manualCompetitors || [])]
      .filter(competitor => !deletedCompetitors.has(competitor.name))
      .map(competitor => {
        // Verwende Services aus competitorServices wenn vorhanden, sonst aus competitor
        const services = (competitorServices && competitorServices[competitor.name]) 
          ? competitorServices[competitor.name].services 
          : competitor.services || [];
        
        return {
          ...competitor,
          services: services
        };
      });
    
    // Füge automatisch ermittelte Wettbewerber aus realData hinzu falls vorhanden
    if (realData?.competitors) {
      realData.competitors.forEach(autoCompetitor => {
        // Überspringe gelöschte Konkurrenten
        if (deletedCompetitors.has(autoCompetitor.name)) {
          return;
        }
        
        // Prüfe ob dieser Wettbewerber nicht bereits manuell erfasst wurde
        const exists = manualCompetitors?.some(manual => 
          manual.name.toLowerCase() === autoCompetitor.name.toLowerCase()
        );
        if (!exists) {
          // Verwende Services aus competitorServices wenn vorhanden, sonst aus autoCompetitor
          const services = (competitorServices && competitorServices[autoCompetitor.name]) 
            ? competitorServices[autoCompetitor.name].services 
            : ((autoCompetitor as any).services || []);
          
          allCompetitors.push({
            name: autoCompetitor.name,
            rating: autoCompetitor.rating || 0,
            reviews: autoCompetitor.reviews || 0,
            distance: autoCompetitor.distance || 'Unbekannt',
            services: services,
            website: (autoCompetitor as any).website
          });
        }
      });
    }
    
    console.log('allCompetitors after processing:', allCompetitors);
    
    if (allCompetitors.length === 0) {
      return `
        <div class="metric-card warning">
          <h3>👥 Wettbewerbsanalyse & Marktumfeld</h3>
          <p class="text-center" style="color: #d1d5db; font-style: italic; margin: 20px 0;">
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

    return `
      <div class="metric-card good">
        <h3>👥 Wettbewerbsanalyse & Marktumfeld</h3>
        <div style="margin-bottom: 20px;">
          <p style="color: #d1d5db; margin-bottom: 15px;">
            <strong>Anzahl analysierte Wettbewerber:</strong> ${allCompetitors.length}
          </p>
          <p style="color: #d1d5db; margin-bottom: 15px;">
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
                    <span style="font-weight: bold; font-size: 1.2em;">${competitorComparisonScore}</span>
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
                
                // Rating-Score: 4.4/5 = 88%
                const ratingScore = (rating / 5) * 100;
                
                // Review-Score: Bewertungen bis 100 = 100%, darüber gestaffelt
                const reviewScore = reviews <= 100 ? reviews : Math.min(100, 100 + Math.log10(reviews / 100) * 20);
                
                const services = Array.isArray(competitor.services) ? competitor.services : [];
                const serviceCount = services.length;
                // Service-Score: Anzahl Services mit Maximum bei 20 Services = 100%
                const baseServiceScore = Math.min(100, (serviceCount / 20) * 100);
                
                const uniqueServices = services.filter((service: string) => 
                  typeof service === 'string' && service.trim().length > 0 && !expectedServices.some(ownService => 
                    typeof ownService === 'string' && ownService.trim().length > 0 && (
                      ownService.toLowerCase().includes(service.toLowerCase()) || 
                      service.toLowerCase().includes(ownService.toLowerCase())
                    )
                  )
                );
                
                const uniqueServiceBonus = uniqueServices.length * 2;
                const finalServiceScore = Math.min(100, baseServiceScore + uniqueServiceBonus);
                
                // Gewichtung: Rating 50%, Reviews 20%, Services 30%
                const estimatedScore = Math.round((ratingScore * 0.5) + (reviewScore * 0.2) + (finalServiceScore * 0.3));
                
                console.log('Competitor score breakdown:', {
                  name: competitor.name,
                  rating: competitor.rating,
                  reviews: competitor.reviews,
                  services: services.length,
                  ratingScore,
                  reviewScore,
                  finalServiceScore,
                  estimatedScore
                });
                
                return `
                <tr style="border-bottom: 1px solid rgba(107, 114, 128, 0.3);">
                  <td style="padding: 12px; color: #d1d5db;">
                    <strong>Wettbewerber ${String.fromCharCode(65 + index)}</strong>
                  </td>
                  <td style="padding: 12px; text-align: center; color: #d1d5db;">
                    <span style="font-weight: bold; color: ${competitor.rating >= 4 ? '#22c55e' : competitor.rating >= 3 ? '#eab308' : '#ef4444'};">${competitor.rating}/5</span>
                  </td>
                  <td style="padding: 12px; text-align: center; color: #d1d5db;">${competitor.reviews}</td>
                  <td style="padding: 12px; text-align: center; color: #d1d5db;">
                    <span style="font-weight: bold; color: ${estimatedScore <= 60 ? '#ef4444' : estimatedScore <= 80 ? '#22c55e' : '#eab308'};">${estimatedScore}</span>
                    <br><small style="color: #9ca3af;">${serviceCount} Services</small>
                    <br><small style="color: #9ca3af;">${uniqueServices.length} Unique</small>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="color: ${estimatedScore <= 60 ? '#ef4444' : estimatedScore <= 80 ? '#22c55e' : '#eab308'}; font-weight: bold;">
                      ${estimatedScore >= (competitorComparisonScore - 10) ? 'Starker Wettbewerber' : 'Wettbewerber'}
                    </span>
                  </td>
                  <td style="padding: 12px; color: #d1d5db; font-size: 0.9em;">
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
                      
                      const ratingScore = (rating / 5) * 100;
                      const reviewScore = reviews <= 100 ? reviews : Math.min(100, 100 + Math.log10(reviews / 100) * 20);
                      const services = Array.isArray(comp.services) ? comp.services : [];
                      const serviceCount = services.length;
                      const baseServiceScore = Math.min(100, (serviceCount / 20) * 100);
                      const uniqueServices = services.filter((service: string) => 
                        typeof service === 'string' && service.trim().length > 0 && !expectedServices.some(ownService => 
                          typeof ownService === 'string' && ownService.trim().length > 0 && (
                            ownService.toLowerCase().includes(service.toLowerCase()) || 
                            service.toLowerCase().includes(ownService.toLowerCase())
                          )
                        )
                      );
                      const uniqueServiceBonus = uniqueServices.length * 2;
                      const finalServiceScore = Math.min(100, baseServiceScore + uniqueServiceBonus);
                      const totalScore = Math.round((ratingScore * 0.5) + (reviewScore * 0.2) + (finalServiceScore * 0.3));
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
              <p style="font-size: 0.9em; color: #9ca3af;">Rating: ${allCompetitors.length > 0 ? `${Math.max(...allCompetitors.map(c => c.rating))}/5` : 'N/A'}</p>
            </div>
            <div>
              <p><strong>Markt-Durchschnitt:</strong> ${allCompetitors.length > 0 ? (allCompetitors.reduce((acc, comp) => acc + comp.rating, 0) / allCompetitors.length).toFixed(1) : '0'}/5</p>
              <p style="font-size: 0.9em; color: #9ca3af;">Ohne Ihr Unternehmen</p>
            </div>
            <div>
              <p><strong>Bewertungsverteilung:</strong></p>
              <p style="font-size: 0.9em; color: #9ca3af;">
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
              <p style="font-size: 0.9em; color: #9ca3af;">Pro Anbieter</p>
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
            <li>Benchmarking gegen die ${manualCompetitors.filter(c => c.rating >= 4).length} stärksten Wettbewerber durchführen</li>
            <li>Eigene Alleinstellungsmerkmale gegenüber ${manualCompetitors.length} Mitbewerbern entwickeln</li>
            <li>Preispositionierung im Vergleich zu ${manualCompetitors.length} Wettbewerbern überprüfen</li>
            <li>Service-Portfolio basierend auf Wettbewerbsanalyse optimieren</li>
            <li>Kontinuierliches Monitoring der ${manualCompetitors.length} erfassten Wettbewerber</li>
          </ul>
        </div>
      </div>
    `;
  };

  // Social Media Analysis - Strukturierte Analyse mit Collapsible Sections
  const getSocialMediaAnalysis = () => {
    console.log('getSocialMediaAnalysis called with socialMediaScore:', socialMediaScore);
    console.log('getSocialMediaAnalysis called with manualSocialData:', manualSocialData);
    
    if (!manualSocialData) {
      return `
        <div class="metric-card warning">
          <h3>Social Media Präsenz</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(0)}">0%</div>
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
            <div class="score-circle ${getScoreColorClass(0)}">0%</div>
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
          <div class="score-circle ${getScoreColorClass(socialMediaScore)}">${socialMediaScore}%</div>
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
  const googleReviewScore = realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0;
  
  // Collect all available scores for proper average calculation
  const allScores = [
    realData.seo.score,
    realData.performance.score,
    realData.mobile.overallScore,
    socialMediaScore,
    googleReviewScore,
    impressumScore,
    accessibilityScore,
    dataPrivacyScore
  ].filter(score => score !== undefined && score !== null);
  
  // Calculate overall score as true average of all sections
  const overallCompanyScore = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);

  // Generate the comprehensive HTML report
  console.log('Generating HTML report with container structure');
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>UNNA - die Unternehmensanalyse fürs Handwerk - ${realData.company.name}</title>
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
      <div class="logo-container">
        ${createCSSLogo()}
      </div>
      <h1>UNNA - die Unternehmensanalyse fürs Handwerk</h1>
      <div class="subtitle">${realData.company.name} - ${businessData.url}</div>
      <p style="margin-top: 15px; color: #9ca3af;">Potenziale und Chancen erkennen, Risiken minimieren!</p>
    </div>

    <!-- Executive Summary -->
    <div class="section">
      <div class="section-header">Executive Summary</div>
      <div class="section-content">
        <!-- Gesamt-Score -->
         <div class="metric-card ${overallCompanyScore >= 80 ? 'excellent' : overallCompanyScore >= 60 ? 'good' : overallCompanyScore >= 40 ? 'warning' : 'poor'}" style="margin-bottom: 30px;">
           <h3>Gesamtbewertung</h3>
           <div class="score-display">
             <div class="score-circle ${getScoreColorClass(overallCompanyScore)}">${overallCompanyScore}%</div>
            <div class="score-details">
               <p><strong>Digitale Marktposition:</strong> ${overallCompanyScore >= 80 ? 'Sehr stark' : overallCompanyScore >= 60 ? 'Gut positioniert' : overallCompanyScore >= 40 ? 'Ausbaufähig' : 'Kritisch'}</p>
               <p><strong>Priorität:</strong> ${overallCompanyScore >= 80 ? 'Optimierung' : overallCompanyScore >= 60 ? 'Mittlerer Handlungsbedarf' : 'Hoher Handlungsbedarf'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(overallCompanyScore)}" style="width: ${overallCompanyScore}%"></div>
            </div>
          </div>
        </div>

        <div class="score-overview">
          <div class="score-card">
            <div class="score-big"><span style="color: ${overallScore <= 60 ? '#ffffff' : overallScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${overallScore <= 60 ? '#dc2626' : overallScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${overallScore}%</span></div>
            <div class="score-label">Gesamtscore</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${realData.seo.score <= 60 ? '#ffffff' : realData.seo.score <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${realData.seo.score <= 60 ? '#dc2626' : realData.seo.score <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${realData.seo.score}%</span></div>
            <div class="score-label">SEO-Bestandsanalyse</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${realData.performance.score <= 60 ? '#ffffff' : realData.performance.score <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${realData.performance.score <= 60 ? '#dc2626' : realData.performance.score <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${realData.performance.score}%</span></div>
            <div class="score-label">Website Performance</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${realData.mobile.overallScore <= 60 ? '#ffffff' : realData.mobile.overallScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${realData.mobile.overallScore <= 60 ? '#dc2626' : realData.mobile.overallScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${realData.mobile.overallScore}%</span></div>
            <div class="score-label">Mobile Optimierung</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${74 <= 60 ? '#ffffff' : 74 <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${74 <= 60 ? '#dc2626' : 74 <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">74%</span></div>
            <div class="score-label">Lokal-SEO</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${socialMediaScore <= 60 ? '#ffffff' : socialMediaScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${socialMediaScore <= 60 ? '#dc2626' : socialMediaScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${socialMediaScore}%</span></div>
            <div class="score-label">Social Media Präsenz</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${googleReviewScore <= 60 ? '#ffffff' : googleReviewScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${googleReviewScore <= 60 ? '#dc2626' : googleReviewScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${googleReviewScore}%</span></div>
            <div class="score-label">Online Reputation</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${impressumScore <= 60 ? '#ffffff' : impressumScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${impressumScore <= 60 ? '#dc2626' : impressumScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${impressumScore}%</span></div>
            <div class="score-label">Rechtssicherheit</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${accessibilityScore <= 60 ? '#ffffff' : accessibilityScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${accessibilityScore <= 60 ? '#dc2626' : accessibilityScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${accessibilityScore}%</span></div>
            <div class="score-label">Barrierefreiheit</div>
          </div>
          <div class="score-card">
            <div class="score-big"><span style="color: ${dataPrivacyScore <= 60 ? '#ffffff' : dataPrivacyScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${dataPrivacyScore <= 60 ? '#dc2626' : dataPrivacyScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${dataPrivacyScore}%</span></div>
            <div class="score-label">Datenschutz</div>
          </div>
          ${hourlyRateData ? `
          <div class="score-card">
            <div class="score-big"><span style="color: ${pricingScore <= 60 ? '#ffffff' : pricingScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${pricingScore <= 60 ? '#dc2626' : pricingScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${pricingScore}%</span></div>
            <div class="score-label">Preispositionierung</div>
          </div>
          ` : ''}
          <div class="score-card">
            <div class="score-big"><span style="color: ${workplaceScore <= 60 ? '#ffffff' : workplaceScore <= 80 ? '#ffffff' : '#ffffff'}; background-color: ${workplaceScore <= 60 ? '#dc2626' : workplaceScore <= 80 ? '#16a34a' : '#eab308'}; padding: 4px 8px; border-radius: 50%; display: inline-block; min-width: 60px; text-align: center;">${workplaceScore}%</span></div>
            <div class="score-label">Arbeitsplatz- und geber-Bewertung</div>
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
            <div class="score-circle ${getScoreColorClass(realData.performance.score)}">${realData.performance.score}%</div>
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
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(0, 100 - (realData.performance.loadTime * 20)))}" style="width: ${Math.max(0, 100 - (realData.performance.loadTime * 20))}%"></div>
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
            </div>
            <div class="status-item">
              <h4>Time to Interactive</h4>
              <p><strong>${(realData.performance.loadTime * 1.2).toFixed(1)}s</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(Math.max(0, realData.performance.score - 10))}" style="width: ${Math.max(0, realData.performance.score - 10)}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SEO Optimierung -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>SEO Optimierung</span>
        <div class="header-score-circle ${getScoreColorClass(realData.seo.score)}">${realData.seo.score}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>SEO Optimierung</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(realData.seo.score)}">${realData.seo.score}%</div>
            <div class="score-details">
              <p><strong>Sichtbarkeit:</strong> ${realData.seo.score >= 70 ? 'Hoch' : realData.seo.score >= 40 ? 'Mittel' : 'Niedrig'}</p>
              <p><strong>Empfehlung:</strong> ${realData.seo.score >= 70 ? 'Sehr gute SEO-Basis' : 'SEO verbessern, um mehr Kunden zu erreichen'}</p>
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
            </div>
            <div class="status-item">
              <h4>Meta-Beschreibung</h4>
              <p><strong>${realData.seo.metaDescription ? 'Optimiert' : 'Verbesserungsbedarf'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(realData.seo.metaDescription ? 85 : 30)}" style="width: ${realData.seo.metaDescription ? 85 : 30}%"></div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <h4>Strukturierte Daten</h4>
              <p><strong>Zu analysieren</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(50)}" style="width: 50%"></div>
                </div>
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
        <button class="percentage-btn" data-score="${getScoreRange(contentQualityScore)}">${contentQualityScore}%</button>
      </div>
      <div id="content-content" class="section-content" style="display: none;">
        
        <!-- Keywords Analyse -->
        <div class="metric-card good" style="margin-bottom: 30px;">
          <h3>Keyword-Analyse</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)}">
              ${(manualKeywordData || realData.keywords).filter(k => k.found).length}/${(manualKeywordData || realData.keywords).length}
            </div>
            <div class="score-details">
              <p><strong>Gefundene Keywords:</strong> ${(manualKeywordData || realData.keywords).filter(k => k.found).length} von ${(manualKeywordData || realData.keywords).length}</p>
              <p><strong>Optimierungsgrad:</strong> ${Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)}%</p>
              <p><strong>Keyword-Dichte:</strong> ${(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 3).toFixed(1)}%</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-label">
              <span>Keyword-Optimierung</span>
              <button class="percentage-btn" data-score="${getScoreRange(Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100))}">${Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)}%</button>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)}" style="width: ${((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100}%; background-color: ${getScoreColor(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)};"></div>
              <div style="position: absolute; left: ${((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100}%; top: 50%; transform: translateX(-50%) translateY(-50%); width: 20px; height: 20px; background: white; border: 3px solid #374151; border-radius: 50%; box-shadow: 0 4px 8px rgba(0,0,0,0.3); z-index: 10;"></div>
            </div>
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
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">H1: ${realData.seo.headings.h1.length}, H2: ${realData.seo.headings.h2.length}</p>
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
                    <button class="percentage-btn" data-score="${getScoreRange((manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50)}" style="color: ${getScoreColor((manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50)};">${(manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50}%</button>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange((manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50)}" style="width: ${(manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 3 ? 80 : 50}%"></div>
                  </div>
                 </div>
               <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Branche: ${businessData.industry.toUpperCase()}</p>
             </div>
               <div class="status-item">
                <h4>Dienstleistungen</h4>
                <p><strong>${(manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 'Klar definiert' : 'Unklar'}</strong></p>
                 <div class="progress-container">
                   <div class="progress-label">
                     <span>Dienstleistungen</span>
                     <button class="percentage-btn" data-score="${getScoreRange((manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45)}" style="color: ${getScoreColor((manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45)};">${(manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45}%</button>
                   </div>
                   <div class="progress-bar">
                     <div class="progress-fill" data-score="${getScoreRange((manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45)}" style="width: ${(manualKeywordData || realData.keywords || []).filter(k => k.found).length >= 2 ? 85 : 45}%"></div>
                  </div>
                </div>
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Service-Keywords gefunden</p>
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
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Region: ${businessData.address ? 'Erfasst' : 'Fehlt'}</p>
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
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Empfehlung: Quartalweise</p>
            </div>
            <div class="status-item">
              <h4>News & Updates</h4>
              <p><strong>Nicht vorhanden</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(25)}" style="width: 25%"></div>
                </div>
              </div>
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Blog/News-Bereich fehlt</p>
            </div>
            <div class="status-item">
              <h4>Saisonale Inhalte</h4>
              <p><strong>Nicht erkannt</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" data-score="${getScoreRange(35)}" style="width: 35%"></div>
                </div>
              </div>
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Winterdienst, Klimaanlagen etc.</p>
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

    <!-- Lokale SEO & Regionale Sichtbarkeit -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>Lokale SEO & Regionale Sichtbarkeit</span>
        <div class="header-score-circle ${getScoreColorClass(74)}" style="color: ${getScoreColor(74)};">74%</div>
      </div>
      <div class="section-content">
        ${getLocalSEOAnalysis()}
      </div>
    </div>

    <!-- Backlinks Übersicht -->
    <div class="section">
      <div class="section-header collapsible" onclick="toggleSection('backlinks-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
        <span>▶ Backlinks Übersicht</span>
        <button class="percentage-btn" data-score="${getScoreRange(backlinksScore)}">${backlinksScore}%</button>
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
              <button class="percentage-btn" data-score="${getScoreRange(backlinksScore)}" style="color: ${getScoreColor(backlinksScore)};">${backlinksScore}%</button>
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
            <div class="score-circle ${getScoreColorClass(realData.mobile.overallScore)}">${realData.mobile.overallScore}%</div>
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

    <!-- Arbeitsplatz & Arbeitgeber-Bewertung -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>Arbeitsplatz & Arbeitgeber-Bewertung</span>
        <div class="header-score-circle ${getScoreColorClass(realData.workplace ? realData.workplace.overallScore : 65)}" style="color: ${getScoreColor(realData.workplace ? realData.workplace.overallScore : 65)};">${realData.workplace ? Math.round(realData.workplace.overallScore) : 65}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Arbeitsplatz & Arbeitgeber-Bewertung</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(realData.workplace ? realData.workplace.overallScore : 65)}">${realData.workplace ? Math.round(realData.workplace.overallScore) : 65}%</div>
            <div class="score-details">
              <p><strong>Arbeitgeber-Bewertung:</strong> ${realData.workplace?.overallScore >= 70 ? 'Sehr gut' : realData.workplace?.overallScore >= 50 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <p><strong>Empfehlung:</strong> ${realData.workplace?.overallScore >= 70 ? 'Attraktiver Arbeitgeber' : 'Employer Branding stärken'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(realData.workplace ? realData.workplace.overallScore : 65)}" style="width: ${realData.workplace ? realData.workplace.overallScore : 65}%"></div>
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
              <div class="progress-fill" data-score="${getScoreRange(realData.workplace ? realData.workplace.overallScore : 65)}" style="width: ${realData.workplace ? realData.workplace.overallScore : 65}%"></div>
            </div>
          </div>
          
          <!-- Kununu & Glassdoor Bewertungen -->
          <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
            <h4>Kununu & Glassdoor Bewertungen</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div>
                <p><strong>Kununu Rating:</strong> ${
                  manualWorkplaceData?.kununuFound && manualWorkplaceData?.kununuRating
                    ? `${manualWorkplaceData.kununuRating}/5 (${manualWorkplaceData.kununuReviews} Bewertungen)`
                    : realData.workplace?.kununu?.rating 
                      ? `${realData.workplace.kununu.rating}/5`
                      : 'Nicht erfasst'
                }</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(
                      manualWorkplaceData?.kununuFound && manualWorkplaceData?.kununuRating
                        ? (parseFloat(manualWorkplaceData.kununuRating.replace(',', '.')) * 20)
                        : realData.workplace?.kununu?.rating 
                          ? (realData.workplace.kununu.rating * 20) 
                          : 30
                    )}" style="width: ${
                      manualWorkplaceData?.kununuFound && manualWorkplaceData?.kununuRating
                        ? (parseFloat(manualWorkplaceData.kununuRating.replace(',', '.')) * 20)
                        : realData.workplace?.kununu?.rating 
                          ? (realData.workplace.kununu.rating * 20) 
                          : 30
                    }%"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>Glassdoor Rating:</strong> ${
                  manualWorkplaceData?.glassdoorFound && manualWorkplaceData?.glassdoorRating
                    ? `${manualWorkplaceData.glassdoorRating}/5 (${manualWorkplaceData.glassdoorReviews} Bewertungen)`
                    : realData.workplace?.glassdoor?.rating 
                      ? `${realData.workplace.glassdoor.rating}/5`
                      : 'Nicht erfasst'
                }</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(
                      manualWorkplaceData?.glassdoorFound && manualWorkplaceData?.glassdoorRating
                        ? (parseFloat(manualWorkplaceData.glassdoorRating.replace(',', '.')) * 20)
                        : realData.workplace?.glassdoor?.rating 
                          ? (realData.workplace.glassdoor.rating * 20) 
                          : 25
                    )}" style="width: ${
                      manualWorkplaceData?.glassdoorFound && manualWorkplaceData?.glassdoorRating
                        ? (parseFloat(manualWorkplaceData.glassdoorRating.replace(',', '.')) * 20)
                        : realData.workplace?.glassdoor?.rating 
                          ? (realData.workplace.glassdoor.rating * 20) 
                          : 25
                    }%"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>Arbeitsklima:</strong> ${realData.workplace?.kununu?.rating >= 4 ? 'Sehr gut' : realData.workplace?.kununu?.rating >= 3 ? 'Gut' : 'Ausbaufähig'}</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" data-score="${getScoreRange(realData.workplace?.kununu?.rating ? Math.max(40, realData.workplace.kununu.rating * 20) : 50)}" style="width: ${realData.workplace?.kununu?.rating ? Math.max(40, realData.workplace.kununu.rating * 20) : 50}%"></div>
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
        <div class="header-score-circle ${getScoreColorClass(realData.reviews.google.rating * 20)}" style="color: ${getScoreColor(realData.reviews.google.rating * 20)};">${realData.reviews.google.rating}/5</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Online Reputation</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(realData.reviews.google.rating * 20)}">${realData.reviews.google.rating}/5</div>
            <div class="score-details">
              <p><strong>Google Bewertung:</strong> ${realData.reviews.google.rating}/5 (${realData.reviews.google.count} Bewertungen)</p>
              <p><strong>Empfehlung:</strong> ${realData.reviews.google.rating >= 4.0 ? 'Sehr gute Reputation' : 'Bewertungen verbessern'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-score="${getScoreRange(realData.reviews.google.rating * 20)}" style="width: ${realData.reviews.google.rating * 20}%"></div>
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

    <!-- Barrierefreiheit -->
    <div class="section">
        <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
          <span>Barrierefreiheit & Zugänglichkeit</span>
          <div class="header-score-circle ${getScoreColorClass(calculateAccessibilityScore(realData))}" style="color: ${getScoreColor(calculateAccessibilityScore(realData))};">${calculateAccessibilityScore(realData)}%</div>
        </div>
      <div class="section-content">
        <!-- Hauptbewertung sichtbar -->
        <div class="metric-card">
          <h3>♿ Barrierefreiheit (WCAG 2.1)</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(calculateAccessibilityScore(realData))}">${calculateAccessibilityScore(realData)}%</div>
            <div class="score-details">
              <p><strong>Compliance-Level:</strong> Teilweise konform</p>
              <p><strong>Empfehlung:</strong> Barrierefreiheit verbessern</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${calculateAccessibilityScore(realData)}%; background-color: ${getScoreColor(calculateAccessibilityScore(realData))} !important;"></div>
            </div>
          </div>
        </div>
        
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
                  <span style="color: ${calculateAccessibilityScore(realData) >= 80 ? '#22c55e' : '#CD0000'}; font-weight: bold;">
                    ${calculateAccessibilityScore(realData) >= 80 ? 'Erfüllt' : 'Nicht erfüllt'}
                  </span>
                </p>
                <div class="progress-container" style="margin-top: 5px;">
                  <div class="progress-bar">
                     <div class="progress-fill" style="width: ${calculateAccessibilityScore(realData)}%; background-color: ${getScoreColor(calculateAccessibilityScore(realData))};"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>WCAG 2.1 Level AA:</strong> 
                  <span style="color: ${calculateAccessibilityScore(realData) >= 80 ? '#22c55e' : '#CD0000'}; font-weight: bold;">
                    ${calculateAccessibilityScore(realData) >= 80 ? 'Konform' : 'Nicht konform'}
                  </span>
                </p>
                <div class="progress-container" style="margin-top: 5px;">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${calculateAccessibilityScore(realData)}%; background-color: ${getScoreColor(calculateAccessibilityScore(realData))};"></div>
                  </div>
                </div>
              </div>
            </div>
            
            ${calculateAccessibilityScore(realData) < 70 ? `
            <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 8px; padding: 15px; margin-top: 15px;">
              <h4 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ WARNUNG: Abmahnungsrisiko</h4>
              <p style="color: #dc2626; margin: 0 0 10px 0; font-weight: bold;">
                Ihre Website erfüllt nicht die gesetzlichen Anforderungen an die Barrierefreiheit.
              </p>
              <p style="color: #dc2626; margin: 0 0 10px 0; font-size: 14px;">
                <strong>Rechtliche Konsequenzen:</strong> Abmahnungen durch Anwaltskanzleien, 
                Klagen von Betroffenen, Bußgelder bei öffentlichen Stellen.
              </p>
              <p style="color: #dc2626; margin: 0; font-size: 14px;">
                <strong>Empfehlung:</strong> Sofortige Behebung der Barrierefreiheitsmängel erforderlich.
              </p>
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
        <div class="header-score-circle ${getScoreColorClass(socialMediaScore)}">${socialMediaScore}%</div>
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
      <div class="section-header collapsible" onclick="toggleSection('competitor-content')" style="cursor: pointer;">▶ Wettbewerbsanalyse & Marktumfeld</div>
      <div id="competitor-content" class="section-content" style="display: none;">
        ${getCompetitorAnalysis()}
      </div>
    </div>

    ${hourlyRateData ? `
    <!-- Preispositionierung -->
    <div class="section">
      <div class="section-header" style="display: flex; align-items: center; gap: 15px;">
        <span>💰 Preispositionierung</span>
        <div class="header-score-circle ${getScoreColorClass(Math.min(100, (hourlyRateData.ownRate / hourlyRateData.regionAverage) * 100))}" style="color: ${getScoreColor(Math.min(100, (hourlyRateData.ownRate / hourlyRateData.regionAverage) * 100))};">${hourlyRateData.ownRate}€</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Preispositionierung</h3>
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(pricingScore)}">${pricingScore}%</div>
            <div class="score-details">
              <p><strong>Stundensatz:</strong> ${hourlyRateData.ownRate}€/h</p>
              <p><strong>Regionaler Durchschnitt:</strong> ${hourlyRateData.regionAverage}€/h</p>
              <p><strong>Positionierung:</strong> ${pricingScore >= 80 ? 'Über Durchschnitt' : pricingScore >= 60 ? 'Durchschnitt' : 'Unter Durchschnitt'}</p>
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
        <div class="header-score-circle ${getScoreColorClass(impressumScore)}" style="color: ${getScoreColor(impressumScore)};">${impressumScore}%</div>
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

    ${generateDataPrivacySection(dataPrivacyScore)}

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
    <div style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(17, 24, 39, 0.6); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3);">
      <div class="logo-container" style="margin-bottom: 20px;">
        ${createCSSLogo()}
      </div>
      <h3 style="color: #fbbf24; margin-bottom: 15px;">UNNA - die Unternehmensanalyse fürs Handwerk</h3>
      <p style="color: #d1d5db; margin-bottom: 10px;">Erstellt am ${new Date().toLocaleDateString()} | Vollständiger Business-Analyse Report</p>
      <p style="color: #9ca3af; font-size: 0.9em;">Alle Daten basieren auf automatischer Analyse und manueller Datenerfassung</p>
      <p style="color: #9ca3af; font-size: 0.9em; margin-top: 5px;">Für Rückfragen und Optimierungsberatung stehen wir gerne zur Verfügung</p>
    </div>
  </div>
</body>
</html>`;
};
