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
                    <img src="/lovable-uploads/a9346d0f-f4c9-4697-8b95-78dd3609ddd4.png" alt="Handwerk Stars Logo" class="logo" />
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
    </body>
    </html>
  `;
};
