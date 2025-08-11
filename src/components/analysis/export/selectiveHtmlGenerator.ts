import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData, ManualCorporateIdentityData, CompetitorServices, CompanyServices, StaffQualificationData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { getLogoHTML } from './logoData';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateAccessibilityScore, calculateDataPrivacyScore } from './scoreCalculations';

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
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  dataPrivacyScore?: number;
  accessibilityData?: any;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  manualImprintData?: any;
  privacyData?: any;
  selections: {
    sections: SectionSelections;
    subSections: SubSectionSelections;
  };
}

export const generateSelectiveHTML = (data: SelectiveReportData): string => {
  console.log('=== SELECTIVE HTML GENERATOR DEBUG ===');
  console.log('Received data:', data);
  const { businessData, realData, manualSocialData, accessibilityData, privacyData, selections } = data;
  
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const staffQualificationScore = 75; // Fallback value
  
  let sectionsHtml = '';

  // SEO & Content Section
  if (selections.sections.seoContent) {
    let seoContentHtml = '';

    if (selections.subSections.seoAnalysis) {
      seoContentHtml += `
        <div class="metric-card seo-detailed">
          <div class="seo-header" style="background: linear-gradient(135deg, #2196f3, #1976d2); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              🔍 SEO Analyse
              <div class="score-circle" style="background: white; color: #2196f3; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${realData.seo.score}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
              <h4 style="color: #1565c0; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ SEO-Optimierungsempfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📝 Title-Tags optimieren:</strong> Einzigartige, beschreibende Titel für jede Seite</li>
                <li><strong>📋 Meta-Descriptions:</strong> Ansprechende Zusammenfassungen mit Call-to-Action</li>
                <li><strong>🔤 Überschriften-Struktur:</strong> Logische H1-H6 Hierarchie verwenden</li>
                <li><strong>🏷️ Schema Markup:</strong> Strukturierte Daten für bessere Suchergebnisse</li>
                <li><strong>🗺️ XML Sitemap:</strong> Aktuelle Sitemap für Suchmaschinen bereitstellen</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Accessibility section with legal warning
    if (selections.subSections.accessibility) {
      console.log('=== ACCESSIBILITY DEBUG ===');
      console.log('accessibilityData:', accessibilityData);
      // Use manual accessibility data if available (same logic as UI)
      let accessibilityScore: number;
      if (accessibilityData && accessibilityData.overallScore) {
        const featuresScore = [
          accessibilityData.keyboardNavigation,
          accessibilityData.screenReaderCompatible,
          accessibilityData.colorContrast,
          accessibilityData.altTextsPresent,
          accessibilityData.focusVisibility,
          accessibilityData.textScaling
        ].filter(Boolean).length * 10;
        accessibilityScore = Math.round((featuresScore + accessibilityData.overallScore) / 2);
        console.log('Using manual accessibility score:', accessibilityScore);
      } else if (accessibilityData && accessibilityData.score) {
        accessibilityScore = accessibilityData.score;
        console.log('Using automatic accessibility score:', accessibilityScore);
      } else {
        accessibilityScore = calculateAccessibilityScore(realData, accessibilityData);
        console.log('Using calculated accessibility score:', accessibilityScore);
      }
      const hasAccessibilityIssues = accessibilityScore < 90;
      
      seoContentHtml += `
        <div class="metric-card accessibility-detailed">
          ${hasAccessibilityIssues ? `
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
          <div class="accessibility-header" style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              ♿ Barrierefreiheit & Zugänglichkeit
              <div class="score-circle" style="background: white; color: #9c27b0; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${accessibilityScore}%
              </div>
            </h3>
          </div>
          
          ${hasAccessibilityIssues ? `
          <!-- Zusätzliche Warnung nach Header -->
          <div style="background: #fef2f2; border: 2px solid #dc2626; border-radius: 0 0 8px 8px; padding: 15px;">
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
          
          <div style="padding: 20px; background: white;">
            <div style="background: #f3e5f5; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0;">
              <h4 style="color: #6a1b9a; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Barrierefreiheits-Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>🏷️ Alt-Texte:</strong> Beschreibende Texte für alle Bilder hinzufügen</li>
                <li><strong>🎨 Kontraste:</strong> Mindestkontrast von 4.5:1 für Texte gewährleisten</li>
                <li><strong>⌨️ Tastatur-Navigation:</strong> Alle Funktionen ohne Maus erreichbar machen</li>
                <li><strong>📱 Screen Reader:</strong> Semantische HTML-Strukturen verwenden</li>
                <li><strong>🔍 Focus-Indikatoren:</strong> Sichtbare Fokus-Markierungen implementieren</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Data Privacy section with legal warning
    if (selections.subSections.dataPrivacy) {
      console.log('=== DATA PRIVACY DEBUG ===');
      console.log('privacyData:', privacyData);
      // Use manual data privacy score if provided, otherwise fallback to calculated
      const dataPrivacyScore = privacyData?.score || data.dataPrivacyScore || calculateDataPrivacyScore(realData, privacyData);
      console.log('Using data privacy score:', dataPrivacyScore);
      const hasDataPrivacyIssues = dataPrivacyScore < 90;
      
      seoContentHtml += `
        <div class="metric-card privacy-detailed">
          ${hasDataPrivacyIssues ? `
            <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #fef2f2; border: 2px solid #fecaca;">
              <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                ⚖️ RECHTLICHER HINWEIS: DSGVO-Verstöße erkannt
              </h4>
              <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">
                <strong>Warnung:</strong> Die automatisierte Analyse hat rechtlich relevante Datenschutz-Probleme identifiziert. 
                Bei DSGVO-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
              </p>
              <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
                <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Webseite oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
              </div>
            </div>
          ` : ''}
          <div class="privacy-header" style="background: linear-gradient(135deg, #f44336, #d32f2f); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              🔒 Datenschutz & DSGVO
              <div class="score-circle" style="background: white; color: #f44336; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${dataPrivacyScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336;">
              <h4 style="color: #c62828; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ DSGVO-Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📋 Datenschutzerklärung:</strong> Vollständig und aktuell halten</li>
                <li><strong>🍪 Cookie-Consent:</strong> Rechtskonforme Einwilligung implementieren</li>
                <li><strong>📊 Datenverarbeitung:</strong> Zwecke klar definieren und dokumentieren</li>
                <li><strong>🔐 Datensicherheit:</strong> Technische und organisatorische Maßnahmen</li>
                <li><strong>📧 Betroffenenrechte:</strong> Auskunft, Löschung und Berichtigung gewährleisten</li>
              </ul>
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
        <div class="metric-card performance-detailed">
          <div class="performance-header" style="background: linear-gradient(135deg, #00bcd4, #0097a7); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              ⚡ Performance-Analyse
              <div class="score-circle" style="background: white; color: #00bcd4; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${realData.performance.score}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #e0f2f1; padding: 20px; border-radius: 8px; border-left: 4px solid #00bcd4;">
              <h4 style="color: #00695c; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Performance-Optimierungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>⭐ Bildoptimierung:</strong> WebP-Format nutzen, Größen anpassen</li>
                <li><strong>📦 Code-Splitting:</strong> JavaScript aufteilen und lazy loading</li>
                <li><strong>🚀 CDN einsetzen:</strong> Globale Auslieferung beschleunigen</li>
                <li><strong>💾 Browser-Caching:</strong> Cache-Header optimieren</li>
                <li><strong>🗜️ Komprimierung:</strong> Gzip/Brotli aktivieren</li>
              </ul>
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
        <div class="metric-card social-detailed">
          <div class="social-header" style="background: linear-gradient(135deg, #3f51b5, #303f9f); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              📱 Social Media Analyse
              <div class="score-circle" style="background: white; color: #3f51b5; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${socialMediaScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #e8eaf6; padding: 20px; border-radius: 8px; border-left: 4px solid #3f51b5;">
              <h4 style="color: #283593; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Social Media Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📅 Regelmäßige Posts:</strong> Mindestens 2-3 Posts pro Woche</li>
                <li><strong>📸 Hochwertige Inhalte:</strong> Bilder und Videos in guter Qualität</li>
                <li><strong>💬 Community Management:</strong> Auf Kommentare und Nachrichten antworten</li>
                <li><strong>📈 Analytics nutzen:</strong> Erfolg messen und optimieren</li>
                <li><strong>🎯 Zielgruppen-Targeting:</strong> Relevante Inhalte für die Zielgruppe</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (socialMediaHtml) {
      sectionsHtml += `
        <section class="section">
          <div class="section-header">📱 Social Media</div>
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

    if (selections.subSections.staffQualification && staffQualificationScore !== null) {
      staffServiceHtml += `
        <div class="metric-card staff-detailed">
          <div class="staff-header" style="background: linear-gradient(135deg, #795548, #5d4037); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              👨‍💼 Personal-Qualifikation
              <div class="score-circle" style="background: white; color: #795548; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${Math.round(staffQualificationScore)}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <div style="background: #efebe9; padding: 20px; border-radius: 8px; border-left: 4px solid #795548;">
              <h4 style="color: #4e342e; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Personalentwicklungs-Empfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📚 Kontinuierliche Weiterbildung:</strong> Jährliche Fortbildungen in Kernkompetenzen</li>
                <li><strong>🏆 Zertifizierungsprogramme:</strong> Branchenspezifische Zertifikate erwerben</li>
                <li><strong>👥 Mentoring-Programme:</strong> Wissenstransfer zwischen Mitarbeitern</li>
                <li><strong>🎯 Spezialisierung:</strong> Nischenkompetenz in gefragten Bereichen aufbauen</li>
                <li><strong>📈 Performance-Tracking:</strong> Regelmäßige Kompetenz-Bewertung</li>
              </ul>
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
  let overallScore = 75; // Default fallback

  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Website-Analyse für ${businessData.url}</title>
      <style>
        ${getHTMLStyles()}
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          font-size: 1.4em;
          font-weight: bold;
          margin-bottom: 20px;
          border-radius: 10px;
          text-align: center;
        }
        
        .section-content {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .metric-grid {
          display: grid;
          gap: 20px;
          padding: 20px;
        }
        
        .warning-box {
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          background: #fef2f2;
          border: 2px solid #fecaca;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <header class="header">
          <div class="header-content">
            <div class="logo-section">
              ${getLogoHTML()}
              <div class="company-info">
                <h1>Website-Analyse</h1>
                <p class="company-name">${businessData.url}</p>
                <p class="report-date">Erstellt am: ${new Date().toLocaleDateString('de-DE')}</p>
              </div>
            </div>
            <div class="overall-score">
              <div class="score-circle-large">
                <span class="score-number">${overallScore}</span>
                <span class="score-label">Gesamt-Score</span>
              </div>
            </div>
          </div>
        </header>

        <main class="main-content">
          ${sectionsHtml}
        </main>

        <footer class="footer">
          <div class="footer-content">
            <div class="footer-logo">
              ${getLogoHTML()}
            </div>
            <div class="footer-text">
              <p><strong>HANDWERK STARS</strong></p>
              <p>Professionelle Website-Analyse für das Handwerk</p>
              <p>© ${new Date().getFullYear()} Alle Rechte vorbehalten</p>
            </div>
          </div>
        </footer>
      </div>
    </body>
    </html>
  `;
};

// Export the function with the expected name for backward compatibility
export const generateSelectiveCustomerHTML = generateSelectiveHTML;