import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData, ManualCorporateIdentityData, CompetitorServices, CompanyServices, StaffQualificationData, QuoteResponseData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateOverallScore, calculateHourlyRateScore, calculateContentQualityScore, calculateBacklinksScore, calculateAccessibilityScore, calculateLocalSEOScore, calculateCorporateIdentityScore, calculateStaffQualificationScore, calculateQuoteResponseScore } from './scoreCalculations';
import { generateDataPrivacySection } from './reportSections';

interface SectionSelections {
  seoContent: boolean;
  performanceTech: boolean;
  socialMedia: boolean;
  staffService: boolean;
}

interface SubSectionSelections {
  // SEO & Content
  seoAnalysis: boolean;
  keywordAnalysis: boolean;
  localSeo: boolean;
  contentQuality: boolean;
  backlinks: boolean;
  accessibility: boolean;
  dataPrivacy: boolean;
  imprint: boolean;
  competitorAnalysis: boolean;

  // Performance & Technik
  performance: boolean;
  mobile: boolean;
  conversion: boolean;

  // Social Media
  socialMediaSimple: boolean;
  workplaceReviews: boolean;

  // Personal & Service
  staffQualification: boolean;
  corporateIdentity: boolean;
  quoteResponse: boolean;
  hourlyRate: boolean;
}

interface SelectiveReportData {
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
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  manualImprintData?: { elements: string[] } | null;
  dataPrivacyScore?: number;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  privacyData?: any;
  accessibilityData?: any;
  selections: {
    sections: SectionSelections;
    subSections: SubSectionSelections;
  };
}

// Function to get score color (hex value for inline styles)
const getScoreColor = (score: number) => {
  if (score <= 60) return '#dc2626';   // 0-60% rot
  if (score <= 80) return '#16a34a';   // 61-80% grün
  return '#eab308';                    // 81-100% gelb
};

// Function to get score color class
const getScoreColorClass = (score: number) => {
  if (score < 60) return "red";
  if (score < 80) return "green";
  return "yellow";
};

export const generateSelectiveCustomerHTML = ({
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
  manualCorporateIdentityData,
  manualKeywordData,
  keywordScore,
  manualImprintData,
  dataPrivacyScore = 75,
  staffQualificationData,
  quoteResponseData,
  privacyData,
  accessibilityData,
  selections
}: SelectiveReportData) => {
  
  // Calculate scores
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const corporateIdentityScore = calculateCorporateIdentityScore(manualCorporateIdentityData);
  const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);
  const staffQualificationScore = calculateStaffQualificationScore(staffQualificationData);
  const contentQualityScore = calculateContentQualityScore(realData, manualKeywordData, businessData);
  const backlinksScore = calculateBacklinksScore(realData, businessData);
  const accessibilityScore = calculateAccessibilityScore(realData);
  const localSeoScore = calculateLocalSEOScore(realData, businessData);

  // Calculate sections that will be included
  const includedSections = Object.entries(selections.sections).filter(([_, included]) => included);
  const includedSubSections = Object.entries(selections.subSections).filter(([_, included]) => included);

  let sectionsHtml = '';

  // SEO & Content Section
  if (selections.sections.seoContent) {
    let seoContentHtml = '';

    if (selections.subSections.seoAnalysis) {
      seoContentHtml += `
        <div class="metric-card">
          <h3>🔍 SEO-Analyse</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(realData.seo.score)}">${realData.seo.score}%</div>
            <div class="score-details">
              <p><strong>Title-Tag:</strong> ${realData.seo.titleTag ? 'Vorhanden' : 'Fehlt'}</p>
              <p><strong>Meta-Description:</strong> ${realData.seo.metaDescription ? 'Vorhanden' : 'Fehlt'}</p>
              <p><strong>H1-Überschrift:</strong> ${realData.seo.headings.h1.length} gefunden</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${realData.seo.score}%; background-color: ${getScoreColor(realData.seo.score)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.keywordAnalysis) {
      const effectiveKeywordScore = keywordScore || 65;
      seoContentHtml += `
        <div class="metric-card">
          <h3>🎯 Keyword-Analyse</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(effectiveKeywordScore)}">${effectiveKeywordScore}%</div>
            <div class="score-details">
              <p><strong>Keyword-Dichte:</strong> ${effectiveKeywordScore >= 70 ? 'Optimal' : 'Verbesserungsbedarf'}</p>
              <p><strong>Branchenrelevanz:</strong> ${effectiveKeywordScore >= 60 ? 'Hoch' : 'Niedrig'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${effectiveKeywordScore}%; background-color: ${getScoreColor(effectiveKeywordScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.localSeo) {
      seoContentHtml += `
        <div class="metric-card">
          <h3>📍 Lokales SEO</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(localSeoScore)}">${localSeoScore}%</div>
            <div class="score-details">
              <p><strong>Google My Business:</strong> ${realData.reviews.google.count > 0 ? 'Vorhanden' : 'Fehlt'}</p>
              <p><strong>Bewertungen:</strong> ${realData.reviews.google.count} Google-Bewertungen</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${localSeoScore}%; background-color: ${getScoreColor(localSeoScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.contentQuality) {
      seoContentHtml += `
        <div class="metric-card">
          <h3>📝 Content-Qualität</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(contentQualityScore)}">${contentQualityScore}%</div>
            <div class="score-details">
              <p><strong>Textqualität:</strong> ${contentQualityScore >= 70 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <p><strong>Keywords:</strong> ${manualKeywordData?.length || 0} analysiert</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${contentQualityScore}%; background-color: ${getScoreColor(contentQualityScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.backlinks) {
      seoContentHtml += `
        <div class="metric-card">
          <h3>🔗 Backlink-Analyse</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(backlinksScore)}">${backlinksScore}%</div>
            <div class="score-details">
              <p><strong>Externe Links:</strong> Analysiert</p>
              <p><strong>Interne Links:</strong> Analysiert</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${backlinksScore}%; background-color: ${getScoreColor(backlinksScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.accessibility) {
      seoContentHtml += `
        <div class="metric-card">
          <h3>♿ Barrierefreiheit</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(accessibilityScore)}">${accessibilityScore}%</div>
            <div class="score-details">
              <p><strong>WCAG-Konformität:</strong> ${accessibilityScore >= 80 ? 'AA-Level' : accessibilityScore >= 60 ? 'A-Level' : 'Nicht konform'}</p>
              <p><strong>Alt-Texte:</strong> ${realData.seo.altTags.withAlt === realData.seo.altTags.total ? 'Vollständig' : 'Unvollständig'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${accessibilityScore}%; background-color: ${getScoreColor(accessibilityScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.dataPrivacy) {
      seoContentHtml += `
        <div class="metric-card">
          <h3>🔒 Datenschutz</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(dataPrivacyScore)}">${dataPrivacyScore}%</div>
            <div class="score-details">
              <p><strong>DSGVO-Konformität:</strong> ${dataPrivacyScore >= 80 ? 'Vollständig' : 'Teilweise'}</p>
              <p><strong>Cookie-Banner:</strong> ${dataPrivacyScore >= 70 ? 'Vorhanden' : 'Fehlt'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${dataPrivacyScore}%; background-color: ${getScoreColor(dataPrivacyScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.imprint) {
      const impressumScore = manualImprintData 
        ? Math.round((manualImprintData.elements.length / 12) * 100)
        : (missingImprintElements.length === 0 ? 100 : Math.max(0, 100 - (missingImprintElements.length * 10)));
        
      seoContentHtml += `
        <div class="metric-card">
          <h3>⚖️ Impressum</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(impressumScore)}">${impressumScore}%</div>
            <div class="score-details">
              <p><strong>Vollständigkeit:</strong> ${impressumScore >= 80 ? 'Vollständig' : 'Unvollständig'}</p>
              <p><strong>Fehlende Angaben:</strong> ${missingImprintElements.length}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${impressumScore}%; background-color: ${getScoreColor(impressumScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.competitorAnalysis && manualCompetitors && manualCompetitors.length > 0) {
      const competitorScore = 75; // Placeholder score
      seoContentHtml += `
        <div class="metric-card">
          <h3>⚔️ Konkurrenz-Analyse</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(competitorScore)}">${competitorScore}%</div>
            <div class="score-details">
              <p><strong>Mitbewerber:</strong> ${manualCompetitors.length} analysiert</p>
              <p><strong>Marktposition:</strong> ${competitorScore >= 70 ? 'Stark' : 'Durchschnittlich'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${competitorScore}%; background-color: ${getScoreColor(competitorScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (seoContentHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">🔍 SEO & Content Analyse</div>
          <div class="section-content">
            <div class="metric-grid">
              ${seoContentHtml}
            </div>
          </div>
        </section>
      `;
    }
  }

  // Performance & Technik Section
  if (selections.sections.performanceTech) {
    let performanceTechHtml = '';

    if (selections.subSections.performance) {
      performanceTechHtml += `
        <div class="metric-card">
          <h3>⚡ Performance</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(realData.performance.score)}">${realData.performance.score}%</div>
            <div class="score-details">
              <p><strong>Ladezeit:</strong> ${realData.performance.loadTime}s</p>
              <p><strong>LCP:</strong> ${realData.performance.lcp}s</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${realData.performance.score}%; background-color: ${getScoreColor(realData.performance.score)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.mobile) {
      performanceTechHtml += `
        <div class="metric-card">
          <h3>📱 Mobile Optimierung</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(realData.mobile.overallScore)}">${realData.mobile.overallScore}%</div>
            <div class="score-details">
              <p><strong>Mobile-friendly:</strong> ${realData.mobile.responsive ? 'Ja' : 'Nein'}</p>
              <p><strong>Responsive Design:</strong> ${realData.mobile.overallScore >= 70 ? 'Gut' : 'Verbesserungsbedarf'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${realData.mobile.overallScore}%; background-color: ${getScoreColor(realData.mobile.overallScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.conversion) {
      const conversionScore = 70; // Placeholder score
      performanceTechHtml += `
        <div class="metric-card">
          <h3>🎯 Conversion</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(conversionScore)}">${conversionScore}%</div>
            <div class="score-details">
              <p><strong>Call-to-Action:</strong> ${conversionScore >= 70 ? 'Gut platziert' : 'Verbesserungsbedarf'}</p>
              <p><strong>Kontaktformular:</strong> Analysiert</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${conversionScore}%; background-color: ${getScoreColor(conversionScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (performanceTechHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">⚡ Performance & Technik</div>
          <div class="section-content">
            <div class="metric-grid">
              ${performanceTechHtml}
            </div>
          </div>
        </section>
      `;
    }
  }

  // Social Media Section
  if (selections.sections.socialMedia) {
    let socialMediaHtml = '';

    if (selections.subSections.socialMediaSimple) {
      socialMediaHtml += `
        <div class="metric-card">
          <h3>📱 Social Media</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(socialMediaScore)}">${socialMediaScore}%</div>
            <div class="score-details">
              <p><strong>Facebook:</strong> ${manualSocialData?.facebookUrl ? 'Aktiv' : 'Nicht gefunden'}</p>
              <p><strong>Instagram:</strong> ${manualSocialData?.instagramUrl ? 'Aktiv' : 'Nicht gefunden'}</p>
              <p><strong>LinkedIn:</strong> ${manualSocialData?.linkedinUrl ? 'Aktiv' : 'Nicht gefunden'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${socialMediaScore}%; background-color: ${getScoreColor(socialMediaScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.workplaceReviews) {
      const workplaceScore = realData.workplace ? Math.round(realData.workplace.overallScore) : 65;
      socialMediaHtml += `
        <div class="metric-card">
          <h3>💼 Arbeitsplatz-Bewertungen</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(workplaceScore)}">${workplaceScore}%</div>
            <div class="score-details">
              <p><strong>Kununu:</strong> ${realData.workplace?.kununu?.rating || 'Keine Daten'}</p>
              <p><strong>Glassdoor:</strong> ${realData.workplace?.glassdoor?.rating || 'Keine Daten'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${workplaceScore}%; background-color: ${getScoreColor(workplaceScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (socialMediaHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">📱 Social Media & Online-Präsenz</div>
          <div class="section-content">
            <div class="metric-grid">
              ${socialMediaHtml}
            </div>
          </div>
        </section>
      `;
    }
  }

  // Personal & Service Section
  if (selections.sections.staffService) {
    let staffServiceHtml = '';

    if (selections.subSections.staffQualification) {
      staffServiceHtml += `
        <div class="metric-card">
          <h3>👥 Personal-Qualifikation</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(staffQualificationScore)}">${staffQualificationScore}%</div>
            <div class="score-details">
              <p><strong>Qualifikationen:</strong> ${staffQualificationData ? 'Erfasst' : 'Nicht erfasst'}</p>
              <p><strong>Zertifikate:</strong> ${staffQualificationScore >= 70 ? 'Umfangreich' : 'Basis'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${staffQualificationScore}%; background-color: ${getScoreColor(staffQualificationScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.corporateIdentity) {
      staffServiceHtml += `
        <div class="metric-card">
          <h3>🎨 Corporate Identity</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(corporateIdentityScore)}">${corporateIdentityScore}%</div>
            <div class="score-details">
              <p><strong>Design-Konsistenz:</strong> ${corporateIdentityScore >= 70 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <p><strong>Markenidentität:</strong> ${manualCorporateIdentityData ? 'Definiert' : 'Unklar'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${corporateIdentityScore}%; background-color: ${getScoreColor(corporateIdentityScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.quoteResponse && quoteResponseData) {
      staffServiceHtml += `
        <div class="metric-card">
          <h3>💬 Angebots-Reaktion</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(quoteResponseScore)}">${quoteResponseScore}%</div>
            <div class="score-details">
              <p><strong>Reaktionszeit:</strong> ${quoteResponseData.responseTime}h</p>
              <p><strong>Qualität:</strong> ${quoteResponseScore >= 70 ? 'Hoch' : 'Durchschnittlich'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${quoteResponseScore}%; background-color: ${getScoreColor(quoteResponseScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.hourlyRate && hourlyRateData) {
      staffServiceHtml += `
        <div class="metric-card">
          <h3>💰 Stundensatz-Analyse</h3>
          <div class="score-display">
            <div class="score-tile ${getScoreColorClass(hourlyRateScore)}">${hourlyRateScore}%</div>
            <div class="score-details">
              <p><strong>Ihr Stundensatz:</strong> ${hourlyRateData.ownRate}€/h</p>
              <p><strong>Regionaler Durchschnitt:</strong> ${hourlyRateData.regionAverage}€/h</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${hourlyRateScore}%; background-color: ${getScoreColor(hourlyRateScore)};"></div>
            </div>
          </div>
        </div>
      `;
    }

    if (staffServiceHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">👥 Personal & Kundenservice</div>
          <div class="section-content">
            <div class="metric-grid">
              ${staffServiceHtml}
            </div>
          </div>
        </section>
      `;
    }
  }

  // Calculate overall score based on included sections
  let overallScore = 0;
  let scoreCount = 0;

  if (selections.sections.seoContent) {
    overallScore += realData.seo.score;
    scoreCount++;
  }
  if (selections.sections.performanceTech) {
    overallScore += (realData.performance.score + realData.mobile.overallScore) / 2;
    scoreCount++;
  }
  if (selections.sections.socialMedia) {
    overallScore += socialMediaScore;
    scoreCount++;
  }
  if (selections.sections.staffService) {
    overallScore += (staffQualificationScore + corporateIdentityScore) / 2;
    scoreCount++;
  }

  if (scoreCount > 0) {
    overallScore = Math.round(overallScore / scoreCount);
  } else {
    overallScore = 65; // Default score
  }

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Selektiver Analysebericht - ${businessData.address}</title>
        <style>${getHTMLStyles()}</style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo-container">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzMzNzNkYyIvPgo8cGF0aCBkPSJNMTIgMTJoMTZ2NGgtMTZ6IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMjBoMTJ2NGgtMTJ6IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTIgMjhoOHY0aC04eiIgZmlsbD0id2hpdGUiLz4KPHN2Zz4K" alt="Logo" class="logo" />
                </div>
                <h1>Selektiver Digitaler Analysebericht</h1>
                <p class="subtitle">Maßgeschneiderter Report für ${businessData.address}</p>
                <p style="color: #9ca3af; font-size: 0.9em; margin-top: 10px;">
                    Erstellt am ${new Date().toLocaleDateString('de-DE')} | ${includedSections.length} Hauptbereiche, ${includedSubSections.length} Unterpunkte
                </p>
            </div>

            <section class="company-info">
                <h2>${businessData.address}</h2>
                <p><strong>URL:</strong> <a href="${businessData.url}" target="_blank">${businessData.url}</a></p>
                <p><strong>Branche:</strong> ${businessData.industry}</p>
                <p><strong>Analysierte Bereiche:</strong> ${Object.entries(selections.sections).filter(([_, included]) => included).map(([key]) => {
                  const sectionNames = {
                    seoContent: 'SEO & Content',
                    performanceTech: 'Performance & Technik',
                    socialMedia: 'Social Media',
                    staffService: 'Personal & Service'
                  };
                  return sectionNames[key as keyof typeof sectionNames];
                }).join(', ')}</p>
            </section>

            <section class="score-overview">
                <div class="score-card">
                    <div class="score-big">${overallScore}</div>
                    <div class="score-label">Gesamtbewertung (selektiv)</div>
                </div>
                <div class="score-card">
                    <div class="score-big">${includedSections.length}</div>
                    <div class="score-label">Hauptbereiche</div>
                </div>
                <div class="score-card">
                    <div class="score-big">${includedSubSections.length}</div>
                    <div class="score-label">Unterpunkte</div>
                </div>
                <div class="score-card">
                    <div class="score-big">${Math.round((includedSubSections.length / 16) * 100)}</div>
                    <div class="score-label">Abdeckung %</div>
                </div>
            </section>

            ${sectionsHtml}

            <section class="section">
                <div class="section-header">📋 Zusammenfassung der selektiven Analyse</div>
                <div class="section-content">
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <h4 style="color: #1e293b; margin-bottom: 15px;">Analysierte Bereiche in diesem Report:</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #334155; line-height: 1.8;">
                            ${Object.entries(selections.sections).filter(([_, included]) => included).map(([key]) => {
                              const sectionNames = {
                                seoContent: '🔍 SEO & Content Analyse',
                                performanceTech: '⚡ Performance & Technik',
                                socialMedia: '📱 Social Media & Online-Präsenz',
                                staffService: '👥 Personal & Kundenservice'
                              };
                              return `<li><strong>${sectionNames[key as keyof typeof sectionNames]}</strong></li>`;
                            }).join('')}
                        </ul>
                        
                        <h4 style="color: #1e293b; margin: 20px 0 15px 0;">Spezifische Unterpunkte:</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                            ${Object.entries(selections.subSections).filter(([_, included]) => included).map(([key]) => {
                              const subSectionNames = {
                                seoAnalysis: 'SEO-Analyse',
                                keywordAnalysis: 'Keyword-Analyse',
                                localSeo: 'Lokales SEO',
                                contentQuality: 'Content-Qualität',
                                backlinks: 'Backlink-Analyse',
                                accessibility: 'Barrierefreiheit',
                                dataPrivacy: 'Datenschutz',
                                imprint: 'Impressum',
                                competitorAnalysis: 'Konkurrenz-Analyse',
                                performance: 'Performance',
                                mobile: 'Mobile Optimierung',
                                conversion: 'Conversion',
                                socialMediaSimple: 'Social Media',
                                workplaceReviews: 'Arbeitsplatz-Bewertungen',
                                staffQualification: 'Personal-Qualifikation',
                                corporateIdentity: 'Corporate Identity',
                                quoteResponse: 'Angebots-Reaktion',
                                hourlyRate: 'Stundensatz-Analyse'
                              };
                              return `<div style="background: white; padding: 8px 12px; border-radius: 6px; border: 1px solid #cbd5e1;">✅ ${subSectionNames[key as keyof typeof subSectionNames]}</div>`;
                            }).join('')}
                        </div>
                        
                        <p style="margin-top: 20px; color: #64748b; font-size: 0.9em;">
                            <strong>Hinweis:</strong> Dieser Report wurde speziell auf Ihre Auswahl zugeschnitten und enthält nur die von Ihnen gewählten Analysebereiche.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    </body>
    </html>
  `;
};