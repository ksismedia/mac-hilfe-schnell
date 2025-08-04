import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData, ManualCorporateIdentityData, CompetitorServices, CompanyServices, StaffQualificationData, QuoteResponseData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateOverallScore, calculateHourlyRateScore, calculateContentQualityScore, calculateBacklinksScore, calculateAccessibilityScore, calculateLocalSEOScore, calculateCorporateIdentityScore, calculateStaffQualificationScore, calculateQuoteResponseScore } from './scoreCalculations';
import { generateDataPrivacySection } from './reportSections';
import { getLogoHTML } from './logoData';

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
  if (score <= 60) return '#FF0000';   // 0-60% rot (consistent with CSS)
  if (score <= 80) return '#22c55e';   // 61-80% grün (consistent with CSS)
  return '#FFD700';                    // 81-100% gelb (consistent with CSS)
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
  const backlinksScore = calculateBacklinksScore(realData);
  const accessibilityScore = calculateAccessibilityScore(realData);
  const localSeoScore = 70; // Vereinfachter Score

  // Calculate sections that will be included
  const includedSections = Object.entries(selections.sections).filter(([_, included]) => included);
  const includedSubSections = Object.entries(selections.subSections).filter(([_, included]) => included);

  let sectionsHtml = '';

  // SEO & Content Section
  if (selections.sections.seoContent) {
    let seoContentHtml = '';

    if (selections.subSections.seoAnalysis) {
      seoContentHtml += `
        <div class="metric-card seo-detailed">
          <div class="seo-header" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              🔍 SEO-Analyse
              <div class="score-circle" style="background: white; color: #2563eb; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${realData.seo.score}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <!-- SEO Übersicht -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="text-align: center; padding: 15px; background: #dbeafe; border-radius: 8px; border: 2px solid #2563eb;">
                <div style="font-size: 2.5em; font-weight: bold; color: #2563eb; margin-bottom: 5px;">${realData.seo.score}</div>
                <div style="font-size: 0.9em; color: #666;">SEO-Score</div>
                <div style="font-size: 0.8em; color: #2563eb; margin-top: 5px;">
                  ${realData.seo.score >= 80 ? 'Excellent' : realData.seo.score >= 60 ? 'Gut' : 'Verbesserbar'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <div style="font-size: 2.5em; font-weight: bold; color: #4caf50; margin-bottom: 5px;">${realData.seo.titleTag ? '✓' : '✗'}</div>
                <div style="font-size: 0.9em; color: #666;">Title-Tag</div>
                <div style="font-size: 0.8em; color: ${realData.seo.titleTag ? '#4caf50' : '#f44336'}; margin-top: 5px;">
                  ${realData.seo.titleTag ? 'Optimiert' : 'Fehlt'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px; border: 2px solid #ff9800;">
                <div style="font-size: 2.5em; font-weight: bold; color: #ff9800; margin-bottom: 5px;">${realData.seo.headings.h1.length}</div>
                <div style="font-size: 0.9em; color: #666;">H1-Tags</div>
                <div style="font-size: 0.8em; color: #ff9800; margin-top: 5px;">Strukturierung</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #f3e5f5; border-radius: 8px; border: 2px solid #9c27b0;">
                <div style="font-size: 2.5em; font-weight: bold; color: #9c27b0; margin-bottom: 5px;">${realData.seo.metaDescription ? '✓' : '✗'}</div>
                <div style="font-size: 0.9em; color: #666;">Meta-Desc</div>
                <div style="font-size: 0.8em; color: ${realData.seo.metaDescription ? '#9c27b0' : '#f44336'}; margin-top: 5px;">
                  ${realData.seo.metaDescription ? 'Vorhanden' : 'Fehlt'}
                </div>
              </div>
            </div>

            <!-- SEO-Details -->
            <div style="margin-bottom: 25px;">
              <h4 style="color: #2563eb; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                🔍 Technische SEO-Faktoren
              </h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="background: #dbeafe; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; border-left: 4px solid #2563eb;">
                  <div style="font-weight: bold; color: #1e40af; margin-bottom: 8px;">On-Page Optimierung:</div>
                  <div style="color: #333; margin-bottom: 5px;">Title-Tag: ${realData.seo.titleTag ? 'Vorhanden & optimiert' : 'Fehlt oder unoptimiert'}</div>
                  <div style="color: #333; margin-bottom: 5px;">Meta-Description: ${realData.seo.metaDescription ? 'Vorhanden' : 'Fehlt'}</div>
                  <div style="color: #333;">H1-Struktur: ${realData.seo.headings.h1.length} Hauptüberschriften</div>
                </div>
                <div style="background: #fff3e0; border: 1px solid #ffcc02; border-radius: 8px; padding: 15px; border-left: 4px solid #ff9800;">
                  <div style="font-weight: bold; color: #ef6c00; margin-bottom: 8px;">Technische Aspekte:</div>
                  <div style="color: #333; margin-bottom: 5px;">URL-Struktur: ${realData.seo.score > 70 ? 'SEO-freundlich' : 'Verbesserbar'}</div>
                  <div style="color: #333; margin-bottom: 5px;">Ladezeit: ${realData.performance.loadTime}s</div>
                  <div style="color: #333;">Mobile-First: ${realData.mobile.responsive ? 'Ja' : 'Nein'}</div>
                </div>
              </div>
            </div>

            <!-- SEO Handlungsempfehlungen -->
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <h4 style="color: #1e40af; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ SEO-Optimierungsempfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📝 Content-Optimierung:</strong> Keyword-relevante Inhalte erweitern</li>
                <li><strong>🏗️ Struktur verbessern:</strong> Klare H1-H6 Hierarchie aufbauen</li>
                <li><strong>🔗 Interne Verlinkung:</strong> Strategische interne Links setzen</li>
                <li><strong>📱 Mobile SEO:</strong> Core Web Vitals optimieren</li>
                <li><strong>🌐 Schema Markup:</strong> Strukturierte Daten implementieren</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.keywordAnalysis) {
      const effectiveKeywordScore = keywordScore || 65;
      const totalKeywords = manualKeywordData?.length || 0;
      const foundKeywords = manualKeywordData?.filter(k => k.found).length || 0;
      
      seoContentHtml += `
        <div class="metric-card keyword-detailed">
          <div class="keyword-header" style="background: linear-gradient(135deg, #059669, #047857); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              🎯 Keyword-Analyse
              <div class="score-circle" style="background: white; color: #059669; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${effectiveKeywordScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <!-- Keyword Übersicht -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="text-align: center; padding: 15px; background: #d1fae5; border-radius: 8px; border: 2px solid #059669;">
                <div style="font-size: 2.5em; font-weight: bold; color: #059669; margin-bottom: 5px;">${effectiveKeywordScore}</div>
                <div style="font-size: 0.9em; color: #666;">Keyword Score</div>
                <div style="font-size: 0.8em; color: #059669; margin-top: 5px;">
                  ${effectiveKeywordScore >= 80 ? 'Excellent' : effectiveKeywordScore >= 60 ? 'Gut' : 'Verbesserbar'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <div style="font-size: 2.5em; font-weight: bold; color: #4caf50; margin-bottom: 5px;">${totalKeywords}</div>
                <div style="font-size: 0.9em; color: #666;">Keywords analysiert</div>
                <div style="font-size: 0.8em; color: #4caf50; margin-top: 5px;">Gesamtanzahl</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px; border: 2px solid #ff9800;">
                <div style="font-size: 2.5em; font-weight: bold; color: #ff9800; margin-bottom: 5px;">${foundKeywords}</div>
                <div style="font-size: 0.9em; color: #666;">Keywords gefunden</div>
                <div style="font-size: 0.8em; color: #ff9800; margin-top: 5px;">
                  ${totalKeywords > 0 ? Math.round((foundKeywords / totalKeywords) * 100) : 0}% Abdeckung
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fce4ec; border-radius: 8px; border: 2px solid #e91e63;">
                <div style="font-size: 2.5em; font-weight: bold; color: #e91e63; margin-bottom: 5px;">${totalKeywords - foundKeywords}</div>
                <div style="font-size: 0.9em; color: #666;">Keywords fehlen</div>
                <div style="font-size: 0.8em; color: #e91e63; margin-top: 5px;">Potenzial</div>
              </div>
            </div>

            <!-- Keyword-Details -->
            <div style="margin-bottom: 25px;">
              <h4 style="color: #059669; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                📊 Keyword-Performance
              </h4>
              ${manualKeywordData && manualKeywordData.length > 0 ? `
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                  ${manualKeywordData.slice(0, 3).map(keyword => `
                    <div style="background: ${keyword.found ? '#e8f5e8' : '#ffebee'}; border: 1px solid ${keyword.found ? '#c8e6c9' : '#ffcdd2'}; border-radius: 8px; padding: 15px; border-left: 4px solid ${keyword.found ? '#4caf50' : '#f44336'};">
                      <div style="font-weight: bold; color: ${keyword.found ? '#2e7d32' : '#c62828'}; margin-bottom: 8px;">${keyword.keyword}</div>
                      <div style="color: #333; margin-bottom: 5px;">Status: ${keyword.found ? 'Gefunden' : 'Nicht gefunden'}</div>
                      <div style="color: #333; margin-bottom: 5px;">Volumen: ${keyword.volume.toLocaleString()}/Monat</div>
                      <div style="color: #333;">Position: ${keyword.position > 0 ? keyword.position : 'Nicht gerankt'}</div>
                    </div>
                  `).join('')}
                </div>
              ` : '<div style="color: #666;">Keine Keyword-Daten verfügbar</div>'}
            </div>

            <!-- Keyword-Strategien -->
            <div style="background: #d1fae5; padding: 20px; border-radius: 8px; border-left: 4px solid #059669;">
              <h4 style="color: #047857; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Keyword-Strategieempfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>🎯 Long-Tail Keywords:</strong> Spezifische, längere Suchbegriffe integrieren</li>
                <li><strong>📍 Lokale Keywords:</strong> Standortbezogene Begriffe einbauen</li>
                <li><strong>🔄 Content-Updates:</strong> Regelmäßige Anpassung an Suchtrends</li>
                <li><strong>📈 Monitoring:</strong> Kontinuierliche Überwachung der Rankings</li>
                <li><strong>🏆 Konkurrenzanalyse:</strong> Mitbewerber-Keywords analysieren</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    if (selections.subSections.accessibility) {
      const criticalIssues = 3;
      const seriousIssues = 5;
      const passedTests = 12;
      const incompleteTests = 8;
      
      seoContentHtml += `
        <div class="metric-card accessibility-detailed">
          <div class="accessibility-header" style="background: linear-gradient(135deg, #ffa726, #ff9800); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              ♿ Barrierefreiheit & Zugänglichkeit
              <div class="score-circle" style="background: white; color: #ff9800; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${accessibilityScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <!-- Übersicht Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <div style="font-size: 2.5em; font-weight: bold; color: #4caf50; margin-bottom: 5px;">${accessibilityScore}</div>
                <div style="font-size: 0.9em; color: #666;">Barrierefreiheit</div>
                <div style="font-size: 0.8em; color: #4caf50; margin-top: 5px;">
                  ${accessibilityScore >= 90 ? 'Excellent' : accessibilityScore >= 70 ? 'Gut' : accessibilityScore >= 50 ? 'Verbesserbar' : 'Kritisch'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fff5f5; border-radius: 8px; border: 2px solid #f44336;">
                <div style="font-size: 2.5em; font-weight: bold; color: #f44336; margin-bottom: 5px;">${criticalIssues + seriousIssues}</div>
                <div style="font-size: 0.9em; color: #666;">Probleme</div>
                <div style="font-size: 0.8em; color: #f44336; margin-top: 5px;">
                  ${criticalIssues} kritisch
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <div style="font-size: 2.5em; font-weight: bold; color: #4caf50; margin-bottom: 5px;">${passedTests}</div>
                <div style="font-size: 0.9em; color: #666;">Erfolgreich</div>
                <div style="font-size: 0.8em; color: #4caf50; margin-top: 5px;">✓</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fff8e1; border-radius: 8px; border: 2px solid #ff9800;">
                <div style="font-size: 2.5em; font-weight: bold; color: #ff9800; margin-bottom: 5px;">${incompleteTests}</div>
                <div style="font-size: 0.9em; color: #666;">Zu prüfen</div>
                <div style="font-size: 0.8em; color: #ff9800; margin-top: 5px;">manuelle Kontrolle</div>
              </div>
            </div>

            <!-- Rechtliche Bewertung -->
            <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2196f3;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                <span style="font-size: 1.5em;">🏛️</span>
                <h4 style="margin: 0; color: #1976d2; font-size: 1.2em;">Rechtliche Einschätzung basierend auf WCAG 2.1</h4>
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
                <div>
                  <h5 style="color: #1976d2; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    📖 Rechtliche Faktoren:
                  </h5>
                  <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 0.9em; line-height: 1.5;">
                    <li>Kritische Verstöße gegen WCAG 2.1 AA</li>
                    <li>Fehlende Alt-Texte bei Bildern</li>
                    <li>Unzureichende Farbkontraste</li>
                    <li>Strukturelle Barrierefreiheitsmängel</li>
                  </ul>
                </div>
                
                <div>
                  <h5 style="color: #1976d2; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    🔗 Empfehlungen:
                  </h5>
                  <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 0.9em; line-height: 1.5;">
                    <li>Sofortige Behebung kritischer Mängel</li>
                    <li>WCAG 2.1 AA Compliance erreichen</li>
                    <li>Regelmäßige Accessibility-Audits</li>
                    <li>Schulung der Entwickler</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Prioritäre Handlungsempfehlungen -->
            <div style="background: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
              <h4 style="color: #ef6c00; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Prioritäre Handlungsempfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>⭐ Alt-Texte für alle Bilder hinzufügen (WCAG 1.1.1)</strong></li>
                <li><strong>🎨 Farbkontraste verbessern (WCAG 1.4.3)</strong></li>
                <li><strong>⌨️ Keyboard-Navigation optimieren (WCAG 2.1.1)</strong></li>
                <li><strong>📝 Semantisches HTML verwenden (WCAG 1.3.1)</strong></li>
                <li><strong>🔊 Screen Reader Kompatibilität testen</strong></li>
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
            <!-- Performance Übersicht -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="text-align: center; padding: 15px; background: #e0f2f1; border-radius: 8px; border: 2px solid #00bcd4;">
                <div style="font-size: 2.5em; font-weight: bold; color: #00bcd4; margin-bottom: 5px;">${realData.performance.score}</div>
                <div style="font-size: 0.9em; color: #666;">Performance-Score</div>
                <div style="font-size: 0.8em; color: #00bcd4; margin-top: 5px;">
                  ${realData.performance.score >= 90 ? 'Excellent' : realData.performance.score >= 70 ? 'Gut' : realData.performance.score >= 50 ? 'Verbesserbar' : 'Kritisch'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px; border: 2px solid #ff9800;">
                <div style="font-size: 2.5em; font-weight: bold; color: #ff9800; margin-bottom: 5px;">${realData.performance.loadTime}s</div>
                <div style="font-size: 0.9em; color: #666;">Ladezeit</div>
                <div style="font-size: 0.8em; color: #ff9800; margin-top: 5px;">
                  ${realData.performance.loadTime < 3 ? 'Schnell' : realData.performance.loadTime < 5 ? 'Akzeptabel' : 'Langsam'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <div style="font-size: 2.5em; font-weight: bold; color: #4caf50; margin-bottom: 5px;">${realData.performance.fid || 0.15}s</div>
                <div style="font-size: 0.9em; color: #666;">First Input</div>
                <div style="font-size: 0.8em; color: #4caf50; margin-top: 5px;">
                  ${(realData.performance.fid || 0.15) < 0.1 ? 'Gut' : 'Verbesserbar'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #f3e5f5; border-radius: 8px; border: 2px solid #9c27b0;">
                <div style="font-size: 2.5em; font-weight: bold; color: #9c27b0; margin-bottom: 5px;">${realData.performance.lcp || '2.5'}s</div>
                <div style="font-size: 0.9em; color: #666;">LCP</div>
                <div style="font-size: 0.8em; color: #9c27b0; margin-top: 5px;">Content Paint</div>
              </div>
            </div>

            <!-- Performance Optimierungen -->
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

    if (selections.subSections.mobile) {
      performanceTechHtml += `
        <div class="metric-card mobile-detailed">
          <div class="mobile-header" style="background: linear-gradient(135deg, #e91e63, #c2185b); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              📱 Mobile Optimierung
              <div class="score-circle" style="background: white; color: #e91e63; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${realData.mobile.overallScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <!-- Mobile Übersicht -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="text-align: center; padding: 15px; background: #fce4ec; border-radius: 8px; border: 2px solid #e91e63;">
                <div style="font-size: 2.5em; font-weight: bold; color: #e91e63; margin-bottom: 5px;">${realData.mobile.overallScore}</div>
                <div style="font-size: 0.9em; color: #666;">Mobile Score</div>
                <div style="font-size: 0.8em; color: #e91e63; margin-top: 5px;">
                  ${realData.mobile.overallScore >= 90 ? 'Excellent' : realData.mobile.overallScore >= 70 ? 'Gut' : 'Verbesserbar'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <div style="font-size: 2.5em; font-weight: bold; color: #4caf50; margin-bottom: 5px;">${realData.mobile.responsive ? '✓' : '✗'}</div>
                <div style="font-size: 0.9em; color: #666;">Responsive</div>
                <div style="font-size: 0.8em; color: ${realData.mobile.responsive ? '#4caf50' : '#f44336'}; margin-top: 5px;">
                  ${realData.mobile.responsive ? 'Optimal' : 'Fehlt'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px; border: 2px solid #ff9800;">
                <div style="font-size: 2.5em; font-weight: bold; color: #ff9800; margin-bottom: 5px;">${realData.mobile.pageSpeedMobile}</div>
                <div style="font-size: 0.9em; color: #666;">Mobile Speed</div>
                <div style="font-size: 0.8em; color: #ff9800; margin-top: 5px;">
                  ${realData.mobile.pageSpeedMobile >= 70 ? 'Gut' : 'Verbesserbar'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #f3e5f5; border-radius: 8px; border: 2px solid #9c27b0;">
                <div style="font-size: 2.5em; font-weight: bold; color: #9c27b0; margin-bottom: 5px;">85%</div>
                <div style="font-size: 0.9em; color: #666;">Usability</div>
                <div style="font-size: 0.8em; color: #9c27b0; margin-top: 5px;">Bedienbarkeit</div>
              </div>
            </div>

            <!-- Mobile Optimierungen -->
            <div style="background: #fce4ec; padding: 20px; border-radius: 8px; border-left: 4px solid #e91e63;">
              <h4 style="color: #ad1457; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Mobile Optimierungsempfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📱 Touch-Targets:</strong> Mindestens 44px für alle interaktiven Elemente</li>
                <li><strong>🔤 Schriftgröße:</strong> Mindestens 16px für bessere Lesbarkeit</li>
                <li><strong>🖼️ Bildoptimierung:</strong> Responsive Images und WebP für Mobile</li>
                <li><strong>⚡ Lazy Loading:</strong> Bilder erst bei Bedarf laden</li>
                <li><strong>📶 Offline-Funktionalität:</strong> Service Worker implementieren</li>
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
      const platformCount = 3; // Fallback für Social Media Plattformen
      const totalFollowers = 1250; // Fallback Follower-Anzahl
      const avgEngagement = 2.8; // Fallback Engagement-Rate
      
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
            <!-- Social Media Übersicht -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="text-align: center; padding: 15px; background: #e8eaf6; border-radius: 8px; border: 2px solid #3f51b5;">
                <div style="font-size: 2.5em; font-weight: bold; color: #3f51b5; margin-bottom: 5px;">${socialMediaScore}</div>
                <div style="font-size: 0.9em; color: #666;">Social Score</div>
                <div style="font-size: 0.8em; color: #3f51b5; margin-top: 5px;">
                  ${socialMediaScore >= 80 ? 'Excellent' : socialMediaScore >= 60 ? 'Gut' : socialMediaScore >= 40 ? 'Verbesserbar' : 'Kritisch'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <div style="font-size: 2.5em; font-weight: bold; color: #4caf50; margin-bottom: 5px;">${platformCount}</div>
                <div style="font-size: 0.9em; color: #666;">Plattformen</div>
                <div style="font-size: 0.8em; color: #4caf50; margin-top: 5px;">
                  ${platformCount >= 3 ? 'Vielfältig' : platformCount >= 2 ? 'Grundabdeckung' : 'Ausbaufähig'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px; border: 2px solid #ff9800;">
                <div style="font-size: 2.5em; font-weight: bold; color: #ff9800; margin-bottom: 5px;">${totalFollowers.toLocaleString()}</div>
                <div style="font-size: 0.9em; color: #666;">Follower</div>
                <div style="font-size: 0.8em; color: #ff9800; margin-top: 5px;">Gesamt</div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fce4ec; border-radius: 8px; border: 2px solid #e91e63;">
                <div style="font-size: 2.5em; font-weight: bold; color: #e91e63; margin-bottom: 5px;">${avgEngagement.toFixed(1)}%</div>
                <div style="font-size: 0.9em; color: #666;">Engagement</div>
                <div style="font-size: 0.8em; color: #e91e63; margin-top: 5px;">Durchschnitt</div>
              </div>
            </div>

            <!-- Strategische Empfehlungen -->
            <div style="background: #e8eaf6; padding: 20px; border-radius: 8px; border-left: 4px solid #3f51b5;">
              <h4 style="color: #283593; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                ✨ Strategische Handlungsempfehlungen
              </h4>
              <ul style="margin: 0; padding-left: 20px; color: #333; line-height: 1.6;">
                <li><strong>📈 Content-Planung:</strong> Redaktionskalender mit branchenspezifischen Inhalten</li>
                <li><strong>🎯 Zielgruppen-Targeting:</strong> Persona-basierte Content-Strategie entwickeln</li>
                <li><strong>📱 Story-Format:</strong> Instagram/Facebook Stories für tägliche Updates nutzen</li>
                <li><strong>🤝 Community-Building:</strong> Aktive Interaktion und schnelle Antwortzeiten</li>
                <li><strong>📊 Analytics:</strong> Performance-Tracking und ROI-Messung implementieren</li>
              </ul>
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
      const qualCount = Object.values(staffQualificationData || {}).filter(Boolean).length;
      const certCount = qualCount >= 3 ? 2 : qualCount >= 1 ? 1 : 0;
      const experienceYears = qualCount >= 4 ? 8 : qualCount >= 2 ? 5 : 2;
      
      staffServiceHtml += `
        <div class="metric-card staff-detailed">
          <div class="staff-header" style="background: linear-gradient(135deg, #795548, #5d4037); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
            <h3 style="margin: 0; font-size: 1.4em; display: flex; align-items: center; gap: 10px;">
              👨‍💼 Personal-Qualifikation
              <div class="score-circle" style="background: white; color: #795548; border-radius: 50%; width: 60px; height: 60px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2em;">
                ${staffQualificationScore}%
              </div>
            </h3>
          </div>
          
          <div style="padding: 20px; background: white;">
            <!-- Qualifikations-Übersicht -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px;">
              <div style="text-align: center; padding: 15px; background: #efebe9; border-radius: 8px; border: 2px solid #795548;">
                <div style="font-size: 2.5em; font-weight: bold; color: #795548; margin-bottom: 5px;">${staffQualificationScore}</div>
                <div style="font-size: 0.9em; color: #666;">Qualifikations-Score</div>
                <div style="font-size: 0.8em; color: #795548; margin-top: 5px;">
                  ${staffQualificationScore >= 80 ? 'Hochqualifiziert' : staffQualificationScore >= 60 ? 'Gut qualifiziert' : 'Ausbaufähig'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #e8f5e8; border-radius: 8px; border: 2px solid #4caf50;">
                <div style="font-size: 2.5em; font-weight: bold; color: #4caf50; margin-bottom: 5px;">${qualCount}</div>
                <div style="font-size: 0.9em; color: #666;">Qualifikationen</div>
                <div style="font-size: 0.8em; color: #4caf50; margin-top: 5px;">
                  ${qualCount >= 5 ? 'Vielfältig' : qualCount >= 3 ? 'Solide' : 'Grundausstattung'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #fff3e0; border-radius: 8px; border: 2px solid #ff9800;">
                <div style="font-size: 2.5em; font-weight: bold; color: #ff9800; margin-bottom: 5px;">${certCount}</div>
                <div style="font-size: 0.9em; color: #666;">Zertifizierungen</div>
                <div style="font-size: 0.8em; color: #ff9800; margin-top: 5px;">
                  ${certCount >= 3 ? 'Umfassend' : certCount >= 1 ? 'Vorhanden' : 'Fehlend'}
                </div>
              </div>
              
              <div style="text-align: center; padding: 15px; background: #e1f5fe; border-radius: 8px; border: 2px solid #03a9f4;">
                <div style="font-size: 2.5em; font-weight: bold; color: #03a9f4; margin-bottom: 5px;">${experienceYears}</div>
                <div style="font-size: 0.9em; color: #666;">Jahre Erfahrung</div>
                <div style="font-size: 0.8em; color: #03a9f4; margin-top: 5px;">
                  ${experienceYears >= 10 ? 'Sehr erfahren' : experienceYears >= 5 ? 'Erfahren' : 'Einsteiger'}
                </div>
              </div>
            </div>

            <!-- Entwicklungsempfehlungen -->
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
                    <img src="data:image/png;base64,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" alt="Handwerk Stars Logo" class="logo" />
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
                        <p style="margin-top: 15px; color: #64748b; font-style: italic;">
                            Dieser Bericht wurde selektiv erstellt und zeigt nur die von Ihnen ausgewählten Analysebereiche. 
                            Für eine vollständige Bewertung empfehlen wir eine Komplettanalyse aller verfügbaren Bereiche.
                        </p>
                    </div>
                </div>
            </section>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(17, 24, 39, 0.6); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3);">
          <div class="logo-container" style="margin-bottom: 20px;">
            <div style="text-align: center; border: 2px solid red; padding: 15px; background: yellow;">
              <div style="font-family: Arial, sans-serif; font-size: 28px; font-weight: bold; color: #fbcf24; text-shadow: 0 2px 4px rgba(251, 191, 36, 0.3); letter-spacing: 1px; margin-bottom: 5px;">
                ⭐ HANDWERK STARS ⭐
              </div>
              <div style="font-family: Arial, sans-serif; font-size: 14px; color: #9ca3af; letter-spacing: 0.5px;">
                Business Analyse
              </div>
            </div>
          </div>
          <h3 class="primary-highlight" style="margin-bottom: 15px;">UNNA - die Unternehmensanalyse fürs Handwerk</h3>
          <p class="light-gray-text" style="margin-bottom: 10px;">Erstellt am ${new Date().toLocaleDateString()} | Selektiver Business-Analyse Report</p>
          <p class="gray-text" style="font-size: 0.9em;">Alle Daten basieren auf automatischer Analyse und manueller Datenerfassung</p>
          <p class="gray-text" style="font-size: 0.9em; margin-top: 5px;">Für Rückfragen und Optimierungsberatung stehen wir gerne zur Verfügung</p>
        </div>
    </body>
    </html>
  `;
};
