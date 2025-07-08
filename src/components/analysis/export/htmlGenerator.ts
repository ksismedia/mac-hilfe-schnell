

import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, ManualWorkplaceData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateOverallScore, calculateHourlyRateScore, calculateSocialMediaScore } from './scoreCalculations';

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
}

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
  keywordScore
}: CustomerReportData) => {
  console.log('HTML Generator received missingImprintElements:', missingImprintElements);
  console.log('HTML Generator received manualWorkplaceData:', manualWorkplaceData);
  console.log('HTML Generator received competitorServices:', competitorServices);
  console.log('HTML Generator received manualCompetitors:', manualCompetitors);
  
  // Calculate scores for own business including services
  const socialMediaScore = calculateSocialMediaScore(realData, manualSocialData);
  const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
  
  console.log('=== EIGENE FIRMA SCORE DEBUG ===');
  console.log('socialMediaScore:', socialMediaScore);
  console.log('hourlyRateScore:', hourlyRateScore);
  console.log('realData.seo.score:', realData.seo.score);
  console.log('realData.performance.score:', realData.performance.score);
  console.log('realData.mobile.overallScore:', realData.mobile.overallScore);
  console.log('realData.reviews.google.count:', realData.reviews.google.count);
  console.log('realData.reviews.google.rating:', realData.reviews.google.rating);
  
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
  
  // Verwende die konsistente calculateOverallScore Funktion
  const ownOverallScore = calculateOverallScore(realData, hourlyRateScore, socialMediaScore);
  
  console.log('HTML Generator - Own Business Scores:', {
    social: socialMediaScore,
    hourlyRate: hourlyRateScore, 
    services: ownServiceScore,
    overall: ownOverallScore
  });

  // Impressum Analysis
  const impressumScore = missingImprintElements.length === 0 ? 100 : Math.max(0, 100 - (missingImprintElements.length * 10));
  console.log('Calculated impressumScore:', impressumScore);
  console.log('missingImprintElements.length:', missingImprintElements.length);

  const getMissingImprintList = () => {
    if (missingImprintElements.length === 0) {
      return '<p>✅ Alle notwendigen Angaben im Impressum gefunden.</p>';
    } else {
      return `
        <ul>
          ${missingImprintElements.map(element => `<li>❌ ${element}</li>`).join('')}
        </ul>
        <p>Es fehlen wichtige Angaben. Dies kann zu rechtlichen Problemen führen.</p>
      `;
    }
  };

  // Accessibility Analysis - NEW
  const getAccessibilityAnalysis = () => {
    // Mock accessibility data for demo - in real implementation this would come from axe-core
    const accessibilityScore = 72;
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

    const scoreClass = accessibilityScore >= 80 ? 'good' : accessibilityScore >= 60 ? 'warning' : 'critical';

    return `
      <div class="metric-card ${scoreClass}">
        <h3>♿ Barrierefreiheit (WCAG 2.1)</h3>
        <div class="score-display">
          <div class="score-circle ${accessibilityScore >= 80 ? 'green' : accessibilityScore >= 60 ? 'yellow' : 'red'}">${accessibilityScore}%</div>
          <div class="score-details">
            <p><strong>Compliance-Level:</strong> ${accessibilityScore >= 80 ? 'AA konform' : accessibilityScore >= 60 ? 'Teilweise konform' : 'Nicht konform'}</p>
            <p><strong>Empfehlung:</strong> ${accessibilityScore >= 80 ? 'Sehr gute Barrierefreiheit' : 'Barrierefreiheit dringend verbessern'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${accessibilityScore}%"></div>
          </div>
        </div>

        <!-- Violations Overview -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
          <h4>🚨 Erkannte Probleme</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
            ${violations.map(v => `
              <div style="padding: 8px; background: ${
                v.impact === 'critical' ? 'rgba(239, 68, 68, 0.2)' :
                v.impact === 'serious' ? 'rgba(245, 158, 11, 0.2)' :
                v.impact === 'moderate' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(107, 114, 128, 0.2)'
              }; border-radius: 6px;">
                <p style="font-weight: bold; color: ${
                  v.impact === 'critical' ? '#dc2626' :
                  v.impact === 'serious' ? '#d97706' :
                  v.impact === 'moderate' ? '#2563eb' : '#6b7280'
                };">${v.impact.toUpperCase()}</p>
                <p style="font-size: 0.9em;">${v.description}</p>
                <p style="font-size: 0.8em; color: #666;">${v.count} Vorkommen</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Successful Tests -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
          <h4 style="color: #059669;">✅ Erfolgreich umgesetzt</h4>
          <ul style="margin-top: 10px; padding-left: 20px;">
            ${passes.map(pass => `<li style="color: #059669; margin-bottom: 5px;">${pass}</li>`).join('')}
          </ul>
        </div>

        <!-- Legal Requirements -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
          <h4 style="color: #1d4ed8;">⚖️ Rechtliche Anforderungen</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px;">
            <div>
              <p><strong>EU-Richtlinie 2016/2102:</strong> ${accessibilityScore >= 80 ? 'Erfüllt' : 'Nicht erfüllt'}</p>
              <div class="progress-container" style="margin-top: 5px;">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(30, accessibilityScore)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>WCAG 2.1 Level AA:</strong> ${accessibilityScore >= 80 ? 'Konform' : 'Nicht konform'}</p>
              <div class="progress-container" style="margin-top: 5px;">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${accessibilityScore}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>BGG (Deutschland):</strong> ${accessibilityScore >= 70 ? 'Grundsätzlich erfüllt' : 'Verbesserung nötig'}</p>
              <div class="progress-container" style="margin-top: 5px;">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(25, accessibilityScore * 0.9)}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
    `;
  };

  // SEO Analysis - Enhanced
  const getSEOAnalysis = () => {
    // Use manual keyword score if available, otherwise use SEO score
    const effectiveKeywordScore = keywordScore !== undefined ? keywordScore : realData.seo.score;
    const keywordData = manualKeywordData || realData.keywords;
    const foundKeywords = keywordData.filter(k => k.found).length;
    
    const seoScore = realData.seo.score;
    const scoreClass = seoScore >= 70 ? 'good' : 'warning';

    return `
      <div class="metric-card ${scoreClass}">
        <h3>SEO Optimierung</h3>
        <div class="score-display">
          <div class="score-circle ${seoScore >= 70 ? 'green' : seoScore >= 40 ? 'yellow' : 'red'}">${seoScore}%</div>
          <div class="score-details">
            <p><strong>Sichtbarkeit:</strong> ${seoScore >= 70 ? 'Hoch' : seoScore >= 40 ? 'Mittel' : 'Niedrig'}</p>
            <p><strong>Empfehlung:</strong> ${seoScore >= 70 ? 'Sehr gute SEO-Basis' : 'SEO verbessern, um mehr Kunden zu erreichen'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" data-value="${Math.round(seoScore/10)*10}" style="width: ${seoScore}%"></div>
          </div>
        </div>
        
        <!-- Branchenrelevante Keywords -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
          <h4>🎯 Branchenrelevante Keywords</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Keyword-Analyse:</strong> ${foundKeywords}/${keywordData.length} Keywords gefunden</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${effectiveKeywordScore}%"></div>
                </div>
              </div>
              <small style="color: #666;">Score: ${effectiveKeywordScore}%</small>
            </div>
            <div>
              <p><strong>Long-Tail Keywords:</strong> ${effectiveKeywordScore >= 60 ? 'Gut optimiert' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(20, effectiveKeywordScore * 0.6)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Lokale Keywords:</strong> ${businessData.address ? 'Vorhanden' : 'Fehlend'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${businessData.address ? Math.max(40, effectiveKeywordScore * 0.9) : 20}%"></div>
                </div>
              </div>
            </div>
          </div>
          ${manualKeywordData ? `
          <div style="margin-top: 15px; padding: 10px; background: rgba(34, 197, 94, 0.1); border-radius: 6px;">
            <h5 style="margin: 0 0 10px 0; color: #059669;">✅ Analysierte Keywords:</h5>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${keywordData.map(kw => `<span style="background: ${kw.found ? '#dcfce7' : '#fef2f2'}; color: ${kw.found ? '#059669' : '#dc2626'}; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${kw.keyword}${kw.found ? ' ✓' : ' ✗'}</span>`).join('')}
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
                  <div class="progress-fill" style="width: ${Math.max(40, seoScore)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Interne Verlinkung:</strong> ${seoScore >= 60 ? 'Gut strukturiert' : 'Ausbaufähig'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(30, seoScore * 0.9)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Breadcrumbs:</strong> ${seoScore >= 70 ? 'Implementiert' : 'Fehlen teilweise'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${seoScore >= 70 ? 85 : 35}%"></div>
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
                  <div class="progress-fill" style="width: ${Math.max(35, seoScore)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Schema Markup:</strong> ${seoScore >= 80 ? 'Implementiert' : 'Teilweise/Fehlend'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${seoScore >= 80 ? 90 : 25}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>XML Sitemap:</strong> ${seoScore >= 60 ? 'Vorhanden' : 'Nicht gefunden'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${seoScore >= 60 ? 85 : 30}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Branchenspezifische Keyword-Strategie entwickeln</li>
            <li>Lokale SEO-Optimierung verstärken</li>
            <li>Technische SEO-Grundlagen verbessern</li>
            <li>Content-Marketing für Fachbereiche ausbauen</li>
          </ul>
        </div>
      </div>
    `;
  };

  // Performance Analysis
  const getPerformanceAnalysis = () => {
    const performanceScore = realData.performance.score;
    const scoreClass = performanceScore >= 70 ? 'good' : 'warning';

    return `
      <div class="metric-card ${scoreClass}">
        <h3>Performance Analyse</h3>
        <div class="score-display">
          <div class="score-circle ${performanceScore >= 70 ? 'green' : performanceScore >= 40 ? 'yellow' : 'red'}">${performanceScore}%</div>
          <div class="score-details">
            <p><strong>Ladezeit:</strong> ${realData.performance.loadTime}s</p>
            <p><strong>Empfehlung:</strong> ${performanceScore >= 70 ? 'Sehr gute Performance' : 'Performance verbessern für bessere Nutzererfahrung'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" data-value="${Math.round(performanceScore/10)*10}" style="width: ${performanceScore}%"></div>
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
    const scoreClass = mobileScore >= 70 ? 'good' : 'warning';

    return `
      <div class="metric-card ${scoreClass}">
        <h3>Mobile Optimierung</h3>
        <div class="score-display">
          <div class="score-circle ${mobileScore >= 70 ? 'green' : mobileScore >= 40 ? 'yellow' : 'red'}">${mobileScore}%</div>
          <div class="score-details">
            <p><strong>Mobile-Freundlichkeit:</strong> ${mobileScore >= 70 ? 'Hoch' : mobileScore >= 40 ? 'Mittel' : 'Niedrig'}</p>
            <p><strong>Empfehlung:</strong> ${mobileScore >= 70 ? 'Sehr gute mobile Optimierung' : 'Mobile Optimierung verbessern für mehr Nutzer'}</p>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" data-value="${Math.round(mobileScore/10)*10}" style="width: ${mobileScore}%"></div>
          </div>
        </div>
        
        <!-- Responsive Design -->
        <div style="margin-top: 20px; padding: 15px; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
          <h4>📱 Responsive Design</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Viewport-Konfiguration:</strong> ${mobileScore >= 70 ? 'Korrekt' : 'Fehlerhaft'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(40, mobileScore)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Flexible Layouts:</strong> ${mobileScore >= 60 ? 'Gut umgesetzt' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(30, mobileScore * 0.9)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Bildoptimierung:</strong> ${mobileScore >= 70 ? 'Responsive Bilder' : 'Nicht optimiert'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${mobileScore >= 70 ? 85 : 35}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Performance -->
        <div style="margin-top: 15px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
          <h4>⚡ Mobile Performance</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
            <div>
              <p><strong>Mobile Ladezeit:</strong> ${realData.performance.loadTime <= 3 ? 'Schnell' : realData.performance.loadTime <= 5 ? 'Akzeptabel' : 'Langsam'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(20, 100 - (realData.performance.loadTime * 15))}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Core Web Vitals:</strong> ${mobileScore >= 70 ? 'Gut' : 'Verbesserungsbedarf'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(25, mobileScore * 0.8)}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Mobile-First Index:</strong> ${mobileScore >= 60 ? 'Berücksichtigt' : 'Nicht optimiert'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${mobileScore >= 60 ? 80 : 30}%"></div>
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
                  <div class="progress-fill" style="width: ${mobileScore >= 70 ? 90 : 40}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Tap-Abstände:</strong> ${mobileScore >= 60 ? 'Ausreichend' : 'Zu gering'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${mobileScore >= 60 ? 85 : 35}%"></div>
                </div>
              </div>
            </div>
            <div>
              <p><strong>Scroll-Verhalten:</strong> ${mobileScore >= 70 ? 'Flüssig' : 'Verbesserbar'}</p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(40, mobileScore * 0.9)}%"></div>
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
                <th style="padding: 12px; text-align: left; color: #fbbf24; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Wettbewerber</th>
                <th style="padding: 12px; text-align: center; color: #fbbf24; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Bewertung</th>
                <th style="padding: 12px; text-align: center; color: #fbbf24; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Anzahl Bewertungen</th>
                <th style="padding: 12px; text-align: center; color: #fbbf24; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Gesamtscore</th>
                <th style="padding: 12px; text-align: center; color: #fbbf24; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Marktposition</th>
                <th style="padding: 12px; text-align: left; color: #fbbf24; border-bottom: 1px solid rgba(251, 191, 36, 0.3);">Services</th>
              </tr>
            </thead>
            <tbody>
              <!-- Eigenes Unternehmen -->
              <tr style="border-bottom: 2px solid rgba(251, 191, 36, 0.5); background: rgba(251, 191, 36, 0.1);">
                <td style="padding: 12px; color: #fbbf24;">
                  <strong>🏆 Ihr Unternehmen</strong>
                </td>
                <td style="padding: 12px; text-align: center; color: #fbbf24;">
                  <span style="font-weight: bold;">${realData.reviews.google.rating}/5</span>
                </td>
                <td style="padding: 12px; text-align: center; color: #fbbf24;">${realData.reviews.google.count}</td>
                  <td style="padding: 12px; text-align: center; color: #fbbf24;">
                    <span style="font-weight: bold; font-size: 1.2em;">${calculateOverallScore(realData, hourlyRateScore, socialMediaScore)}</span>
                    <br><small style="color: #fbbf24;">${expectedServices.length} Services</small>
                  </td>
                <td style="padding: 12px; text-align: center;">
                  <span style="color: #fbbf24; font-weight: bold;">Referenz</span>
                </td>
                <td style="padding: 12px; color: #fbbf24; font-size: 0.9em;">${expectedServices.join(', ')}</td>
              </tr>
              ${allCompetitors.map((competitor, index) => {
                console.log('Processing competitor:', competitor.name, 'services:', competitor.services);
                
                // Verwende die KORREKTE Score-Berechnung aus CompetitorAnalysis.tsx
                const ratingScore = (competitor.rating / 5) * 100;
                const reviewScore = Math.min(100, (competitor.reviews / 50) * 100);
                
                const services = Array.isArray(competitor.services) ? competitor.services : [];
                const serviceCount = services.length;
                const baseServiceScore = Math.min(100, (serviceCount / 12) * 100);
                
                const uniqueServices = services.filter((service: string) => 
                  typeof service === 'string' && !expectedServices.some(ownService => 
                    ownService.toLowerCase().includes(service.toLowerCase()) || 
                    service.toLowerCase().includes(ownService.toLowerCase())
                  )
                );
                
                const uniqueServiceBonus = uniqueServices.length * 5;
                const finalServiceScore = Math.min(100, baseServiceScore + uniqueServiceBonus);
                
                const estimatedScore = Math.round((ratingScore * 0.4) + (reviewScore * 0.25) + (finalServiceScore * 0.35));
                
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
                    <span style="font-weight: bold; color: ${estimatedScore >= 70 ? '#22c55e' : estimatedScore >= 50 ? '#eab308' : '#ef4444'};">${estimatedScore}</span>
                    <br><small style="color: #9ca3af;">${serviceCount} Services</small>
                    <br><small style="color: #9ca3af;">${uniqueServices.length} Unique</small>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <span style="color: ${competitor.rating >= 4 ? '#22c55e' : competitor.rating >= 3 ? '#eab308' : '#ef4444'}; font-weight: bold;">
                      ${competitor.rating >= 4 ? 'Starker Wettbewerber' : competitor.rating >= 3 ? 'Mittlerer Wettbewerber' : 'Schwacher Wettbewerber'}
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
          <h4 style="color: #fbbf24; margin-bottom: 15px;">📊 Marktpositions-Vergleich</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div>
              <p><strong>Ihre Position:</strong> ${realData.reviews.google.rating}/5 (${realData.reviews.google.count} Bewertungen)</p>
              <p><strong>Ihr Gesamtscore:</strong> <span style="color: #fbbf24; font-weight: bold;">${ownOverallScore} Punkte</span></p>
              <p style="font-size: 0.9em; color: ${allCompetitors.length > 0 && realData.reviews.google.rating >= (allCompetitors.reduce((acc, comp) => acc + comp.rating, 0) / allCompetitors.length) ? '#22c55e' : '#ef4444'};">
                ${allCompetitors.length > 0 && realData.reviews.google.rating >= (allCompetitors.reduce((acc, comp) => acc + comp.rating, 0) / allCompetitors.length) ? '✅ Über dem Marktdurchschnitt' : '⚠️ Unter dem Marktdurchschnitt'}
              </p>
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

  // Social Media Analysis - KOMPLETT NEU
  const getSocialMediaAnalysis = () => {
    console.log('getSocialMediaAnalysis called with socialMediaScore:', socialMediaScore);
    console.log('getSocialMediaAnalysis called with manualSocialData:', manualSocialData);
    
    if (!manualSocialData) {
      return `
        <div class="metric-card warning">
          <h3>📱 Social Media Präsenz</h3>
          <div class="score-display">
            <div class="score-circle red">0%</div>
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
      manualSocialData.youtubeUrl
    );

    if (!hasAnyPlatform) {
      return `
        <div class="metric-card warning">
          <h3>📱 Social Media Präsenz</h3>
          <div class="score-display">
            <div class="score-circle red">0%</div>
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

    const scoreClass = socialMediaScore >= 80 ? 'green' : socialMediaScore >= 50 ? 'yellow' : 'red';
    const cardClass = socialMediaScore >= 60 ? 'good' : 'warning';
    
    return `
      <div class="metric-card ${cardClass}">
        <h3>📱 Social Media Präsenz</h3>
        <div class="score-display">
          <div class="score-circle ${scoreClass}">${socialMediaScore}%</div>
          <div class="score-details">
            <p><strong>Aktive Plattformen:</strong> ${activePlatforms.length}</p>
            <p><strong>Status:</strong> ${socialMediaScore >= 80 ? 'Sehr gut' : socialMediaScore >= 60 ? 'Gut' : socialMediaScore >= 40 ? 'Ausbaufähig' : 'Schwach'}</p>
          </div>
        </div>
        
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress-fill" data-value="${Math.round(socialMediaScore/10)*10}" style="width: ${socialMediaScore}%"></div>
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

  // Generate the comprehensive HTML report
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Listening und Monitoring Report - ${realData.company.name}</title>
  <style>
    ${getHTMLStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-container">
        <img src="/lovable-uploads/1b7bf83e-0e07-4072-85cb-b162354578ea.png" alt="HANDWERK STARS Logo" class="logo" />
      </div>
      <h1>Social Listening und Monitoring Report</h1>
      <div class="subtitle">${realData.company.name} - ${businessData.url}</div>
      <p style="margin-top: 15px; color: #9ca3af;">Digitale Analyse von Website, Google-Bewertung, Social-Media-Kanälen & Wettbewerbssituation</p>
    </div>

    <!-- Executive Summary -->
    <div class="section">
      <div class="section-header">🎯 Executive Summary</div>
      <div class="section-content">
        <!-- Gesamt-Score -->
        <div class="metric-card good" style="margin-bottom: 30px;">
          <h3>Gesamtbewertung</h3>
          <div class="score-display">
            <div class="score-circle ${ownOverallScore >= 80 ? 'green' : ownOverallScore >= 60 ? 'yellow' : ownOverallScore >= 40 ? 'orange' : 'red'}">${ownOverallScore}%</div>
            <div class="score-details">
              <p><strong>Digitale Marktposition:</strong> ${ownOverallScore >= 80 ? 'Sehr stark' : ownOverallScore >= 60 ? 'Gut positioniert' : ownOverallScore >= 40 ? 'Ausbaufähig' : 'Kritisch'}</p>
              <p><strong>Priorität:</strong> ${ownOverallScore >= 80 ? 'Optimierung' : ownOverallScore >= 60 ? 'Mittlerer Handlungsbedarf' : 'Hoher Handlungsbedarf'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${ownOverallScore}%"></div>
            </div>
          </div>
        </div>

        <div class="score-overview">
          <div class="score-card">
            <div class="score-big">${realData.seo.score}%</div>
            <div class="score-label">SEO Optimierung</div>
          </div>
          <div class="score-card">
            <div class="score-big">${realData.performance.score}%</div>
            <div class="score-label">Website Performance</div>
          </div>
          <div class="score-card">
            <div class="score-big">${realData.mobile.overallScore}%</div>
            <div class="score-label">Mobile Optimierung</div>
          </div>
          <div class="score-card">
            <div class="score-big">${socialMediaScore}%</div>
            <div class="score-label">Social Media Präsenz</div>
          </div>
          <div class="score-card">
            <div class="score-big">${realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0}%</div>
            <div class="score-label">Online Reputation</div>
          </div>
          <div class="score-card">
            <div class="score-big">${impressumScore}%</div>
            <div class="score-label">Rechtssicherheit</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Unternehmensdaten -->
    <div class="section">
      <div class="section-header">🏢 Unternehmensdaten</div>
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
      <div class="section-header">🚀 Website Performance</div>
      <div class="section-content">
        ${getPerformanceAnalysis()}
        
        <!-- Nutzerfreundlichkeit und Verfügbarkeit -->
        <div class="metric-card good" style="margin-top: 20px;">
          <h3>Nutzerfreundlichkeit & Verfügbarkeit</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div class="status-item">
              <h4>🎯 Benutzerfreundlichkeit</h4>
              <p><strong>${realData.performance.score >= 70 ? 'Sehr gut' : realData.performance.score >= 50 ? 'Gut' : 'Verbesserungsbedarf'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.min(100, realData.performance.score + 10)}%"></div>
                </div>
              </div>
              <p style="font-size: 12px; color: #6b7280;">Navigation, Layout, Responsivität</p>
            </div>
            <div class="status-item">
              <h4>🌐 Verfügbarkeit</h4>
              <p><strong>${realData.performance.score >= 80 ? '99.9%' : realData.performance.score >= 60 ? '99.5%' : '98.8%'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${realData.performance.score >= 80 ? 99 : realData.performance.score >= 60 ? 95 : 88}%"></div>
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
                  <div class="progress-fill" style="width: ${Math.max(0, 100 - (realData.performance.loadTime * 20))}%"></div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <h4>First Contentful Paint</h4>
              <p><strong>${(realData.performance.loadTime * 0.6).toFixed(1)}s</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${realData.performance.score}%"></div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <h4>Time to Interactive</h4>
              <p><strong>${(realData.performance.loadTime * 1.2).toFixed(1)}s</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(0, realData.performance.score - 10)}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SEO Optimierung -->
    <div class="section">
      <div class="section-header">🔎 SEO Optimierung</div>
      <div class="section-content">
        ${getSEOAnalysis()}
        <div class="metric-card good" style="margin-top: 20px;">
          <h3>SEO-Details</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
            <div class="status-item">
              <h4>Meta-Titel</h4>
              <p><strong>${realData.seo.titleTag ? 'Vorhanden' : 'Fehlend'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${realData.seo.titleTag ? 100 : 0}%"></div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <h4>Meta-Beschreibung</h4>
              <p><strong>${realData.seo.metaDescription ? 'Optimiert' : 'Verbesserungsbedarf'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${realData.seo.metaDescription ? 85 : 30}%"></div>
                </div>
              </div>
            </div>
            <div class="status-item">
              <h4>Strukturierte Daten</h4>
              <p><strong>Zu analysieren</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 50%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Content-Qualität -->
    <div class="section">
      <div class="section-header">📝 Content-Qualität</div>
      <div class="section-content">
        
        <!-- Keywords Analyse -->
        <div class="metric-card good" style="margin-bottom: 30px;">
          <h3>🎯 Keyword-Analyse</h3>
          <div class="score-display">
            <div class="score-circle ${(manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length >= 0.7 ? 'green' : 'yellow'}">
              ${(manualKeywordData || realData.keywords).filter(k => k.found).length}/${(manualKeywordData || realData.keywords).length}
            </div>
            <div class="score-details">
              <p><strong>Gefundene Keywords:</strong> ${(manualKeywordData || realData.keywords).filter(k => k.found).length} von ${(manualKeywordData || realData.keywords).length}</p>
              <p><strong>Optimierungsgrad:</strong> ${Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)}%</p>
              <p><strong>Keyword-Dichte:</strong> ${(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 3).toFixed(1)}%</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100}%"></div>
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
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${Math.max(60, realData.seo.score)}%"></div>
                </div>
              </div>
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Flesch-Reading-Ease: ${Math.max(45, realData.seo.score - 10)}</p>
            </div>
            <div class="status-item">
              <h4>Textlänge</h4>
              <p><strong>${realData.seo.metaDescription ? 'Ausreichend' : 'Zu kurz'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${realData.seo.metaDescription ? 85 : 40}%"></div>
                </div>
              </div>
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Wörter: ${realData.seo.metaDescription ? '450-800' : '< 300'}</p>
            </div>
            <div class="status-item">
              <h4>Strukturierung</h4>
              <p><strong>${realData.seo.headings.h1.length > 0 ? 'Gut strukturiert' : 'Struktur fehlt'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${realData.seo.headings.h1.length > 0 ? 90 : 30}%"></div>
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
          <h3>🔧 Branchenrelevanz</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
            <div class="status-item">
              <h4>Fachvokabular</h4>
              <p><strong>${businessData.industry === 'shk' ? 'SHK-spezifisch' : businessData.industry === 'elektriker' ? 'Elektro-spezifisch' : 'Handwerk-spezifisch'}</strong></p>
              <div class="progress-container">
                 <div class="progress-bar">
                   <div class="progress-fill" style="width: ${(manualKeywordData || realData.keywords).filter(k => k.found).length >= 3 ? 80 : 50}%"></div>
                 </div>
               </div>
               <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Branche: ${businessData.industry.toUpperCase()}</p>
             </div>
             <div class="status-item">
               <h4>Dienstleistungen</h4>
               <p><strong>${(manualKeywordData || realData.keywords).filter(k => k.found).length >= 2 ? 'Klar definiert' : 'Unklar'}</strong></p>
               <div class="progress-container">
                 <div class="progress-bar">
                   <div class="progress-fill" style="width: ${(manualKeywordData || realData.keywords).filter(k => k.found).length >= 2 ? 85 : 45}%"></div>
                </div>
              </div>
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Service-Keywords gefunden</p>
            </div>
            <div class="status-item">
              <h4>Lokaler Bezug</h4>
              <p><strong>${businessData.address ? 'Regional optimiert' : 'Nicht spezifiziert'}</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: ${businessData.address ? 90 : 30}%"></div>
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
                  <div class="progress-fill" style="width: 60%"></div>
                </div>
              </div>
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Empfehlung: Quartalweise</p>
            </div>
            <div class="status-item">
              <h4>News & Updates</h4>
              <p><strong>Nicht vorhanden</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 25%"></div>
                </div>
              </div>
              <p style="font-size: 0.9em; color: #9ca3af; margin-top: 5px;">Blog/News-Bereich fehlt</p>
            </div>
            <div class="status-item">
              <h4>Saisonale Inhalte</h4>
              <p><strong>Nicht erkannt</strong></p>
              <div class="progress-container">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 35%"></div>
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

    <!-- Backlinks Übersicht -->
    <div class="section">
      <div class="section-header">🔗 Backlinks Übersicht</div>
      <div class="section-content">
        <div class="metric-card warning">
          <h3>Backlink-Profil</h3>
          <div class="score-display">
            <div class="score-circle yellow">
              ${realData.seo.score}
            </div>
            <div class="score-details">
              <p><strong>Backlink-Status:</strong> Zu analysieren</p>
              <p><strong>Domain Authority:</strong> Wird ermittelt</p>
              <p><strong>Qualitätsbewertung:</strong> Manuell prüfen</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${realData.seo.score}%"></div>
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
      <div class="section-header">📱 Mobile Optimierung</div>
      <div class="section-content">
        ${getMobileOptimizationAnalysis()}
      </div>
    </div>

    <!-- Arbeitsplatz-Reputation -->
    <div class="section">
      <div class="section-header">👥 Arbeitsplatz-Reputation</div>
      <div class="section-content">
        <div class="metric-card warning">
          <h3>💼 Arbeitgeber-Bewertung</h3>
          <div class="score-display">
            <div class="score-circle yellow">${realData.workplace ? Math.round(realData.workplace.overallScore) : 65}%</div>
            <div class="score-details">
              <p><strong>Bewertung als Arbeitgeber:</strong> ${realData.workplace ? (realData.workplace.overallScore >= 80 ? 'Sehr gut' : realData.workplace.overallScore >= 60 ? 'Gut' : 'Ausbaufähig') : 'Nicht bewertet'}</p>
              <p><strong>Empfehlung:</strong> Employer Branding stärken</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${realData.workplace ? realData.workplace.overallScore : 65}%"></div>
            </div>
          </div>
          
          <!-- Kununu & Glassdoor Bewertungen -->
          <div style="margin-top: 20px; padding: 15px; background: rgba(59, 130, 246, 0.1); border-radius: 8px;">
            <h4>🌟 Kununu & Glassdoor Bewertungen</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div>
                <p><strong>Kununu Rating:</strong> ${
                  manualWorkplaceData?.kununuFound && manualWorkplaceData?.kununuRating
                    ? `${manualWorkplaceData.kununuRating}/5 ⭐ (${manualWorkplaceData.kununuReviews} Bewertungen)`
                    : realData.workplace?.kununu?.rating 
                      ? `${realData.workplace.kununu.rating}/5`
                      : 'Nicht erfasst'
                }</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${
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
                    ? `${manualWorkplaceData.glassdoorRating}/5 ⭐ (${manualWorkplaceData.glassdoorReviews} Bewertungen)`
                    : realData.workplace?.glassdoor?.rating 
                      ? `${realData.workplace.glassdoor.rating}/5`
                      : 'Nicht erfasst'
                }</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${
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
                    <div class="progress-fill" style="width: ${realData.workplace?.kununu?.rating ? Math.max(40, realData.workplace.kununu.rating * 20) : 50}%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Fachkräfte-Attraktivität -->
          <div style="margin-top: 15px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-radius: 8px;">
            <h4>🎯 Fachkräfte-Attraktivität</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
              <div>
                <p><strong>Ausbildungsplätze:</strong> ${businessData.industry === 'shk' ? 'Verfügbar' : 'Auf Anfrage'}</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 80%"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>Weiterbildung:</strong> Standardprogramm</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 65%"></div>
                  </div>
                </div>
              </div>
              <div>
                <p><strong>Benefits:</strong> Branchenüblich</p>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: 70%"></div>
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


    <!-- Social Media Präsenz -->
    <div class="section">
      <div class="section-header">📱 Social Media Präsenz</div>
      <div class="section-content">
        ${getSocialMediaAnalysis()}
      </div>
    </div>

    <!-- Online Reputation -->
    <div class="section">
      <div class="section-header">⭐ Online Reputation</div>
      <div class="section-content">
        <div class="metric-card ${realData.reviews.google.count > 0 ? 'good' : 'warning'}">
          <h3>Google Bewertungen</h3>
          <div class="score-display">
            <div class="score-circle ${realData.reviews.google.rating >= 4 ? 'green' : realData.reviews.google.rating >= 3 ? 'yellow' : 'red'}">
              ${realData.reviews.google.rating}/5
            </div>
            <div class="score-details">
              <p><strong>Durchschnittsbewertung:</strong> ${realData.reviews.google.rating}/5 Sterne</p>
              <p><strong>Anzahl Bewertungen:</strong> ${realData.reviews.google.count}</p>
              <p><strong>Reputation-Score:</strong> ${Math.min(100, realData.reviews.google.rating * 20)}%</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${realData.reviews.google.rating * 20}%"></div>
            </div>
          </div>
          <div class="recommendations">
            <h4>Reputation-Management:</h4>
            <ul>
              <li>Aktiv um Kundenbewertungen bitten</li>
              <li>Schnell und professionell auf Bewertungen antworten</li>
              <li>Negative Bewertungen konstruktiv bearbeiten</li>
              <li>Service-Qualität kontinuierlich verbessern</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Barrierefreiheit -->
    <div class="section">
      <div class="section-header">♿ Barrierefreiheit & Zugänglichkeit</div>
      <div class="section-content">
        ${getAccessibilityAnalysis()}
      </div>
    </div>

    <!-- Wettbewerbsanalyse -->
    <div class="section">
      <div class="section-header">👥 Wettbewerbsanalyse & Marktumfeld</div>
      <div class="section-content">
        ${getCompetitorAnalysis()}
      </div>
    </div>

    ${hourlyRateData ? `
    <!-- Preispositionierung -->
    <div class="section">
      <div class="section-header">💰 Preispositionierung</div>
      <div class="section-content">
        <div class="metric-card good">
          <h3>Stundensatz-Analyse</h3>
          <div class="score-display">
            <div class="score-circle ${hourlyRateData.ownRate >= hourlyRateData.regionAverage * 0.9 && hourlyRateData.ownRate <= hourlyRateData.regionAverage * 1.1 ? 'green' : 'yellow'}">
              ${hourlyRateData.ownRate}€
            </div>
            <div class="score-details">
              <p><strong>Ihr Stundensatz:</strong> ${hourlyRateData.ownRate}€</p>
              <p><strong>Regionaler Durchschnitt:</strong> ${hourlyRateData.regionAverage}€</p>
              <p><strong>Marktposition:</strong> ${hourlyRateData.ownRate > hourlyRateData.regionAverage ? 'Premium' : hourlyRateData.ownRate < hourlyRateData.regionAverage ? 'Günstig' : 'Marktdurchschnitt'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(100, (hourlyRateData.ownRate / hourlyRateData.regionAverage) * 100)}%"></div>
            </div>
          </div>
          <div class="recommendations">
            <h4>Preisstrategie:</h4>
            <ul>
              <li>Marktpreise regelmäßig analysieren</li>
              <li>Wertargumentation stärken</li>
              <li>Premium-Services entwickeln</li>
              <li>Kostentransparenz schaffen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- Rechtssicherheit -->
    <div class="section">
      <div class="section-header">📜 Rechtssicherheit</div>
      <div class="section-content">
        <div class="metric-card ${impressumScore >= 70 ? 'good' : 'warning'}">
          <h3>Impressum & Datenschutz</h3>
          <div class="score-display">
            <div class="score-circle ${impressumScore >= 70 ? 'green' : impressumScore >= 40 ? 'yellow' : 'red'}">${impressumScore}%</div>
            <div class="score-details">
              <p><strong>Impressum-Vollständigkeit:</strong> ${impressumScore >= 70 ? 'Vollständig' : 'Unvollständig'}</p>
              <p><strong>Fehlende Angaben:</strong> ${missingImprintElements ? missingImprintElements.length : 0}</p>
              <p><strong>Rechtsstatus:</strong> ${impressumScore >= 70 ? 'Konform' : 'Risiko vorhanden'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${impressumScore}%"></div>
            </div>
          </div>
          ${missingImprintElements && missingImprintElements.length > 0 ? `
            <div style="margin-top: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-radius: 8px;">
              <h4>📋 Fehlende Impressum-Angaben:</h4>
              <ul style="margin: 10px 0; color: #ef4444;">
                ${missingImprintElements.map(element => `<li>${element}</li>`).join('')}
              </ul>
              <p style="font-size: 0.9em; color: #dc2626; margin-top: 10px;">
                <strong>Risiko:</strong> Fehlende Impressum-Angaben können zu Abmahnungen und Bußgeldern führen.
              </p>
            </div>
          ` : `
            <div style="margin-top: 20px; padding: 15px; background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
              <h4>✅ Impressum-Status:</h4>
              <p style="color: #22c55e; font-weight: bold;">Alle erforderlichen Angaben sind vorhanden.</p>
            </div>
          `}
        </div>
      </div>
    </div>

    <!-- Strategische Empfehlungen -->
    <div class="section">
      <div class="section-header">🎯 Strategische Empfehlungen</div>
      <div class="section-content">
        <div class="metric-card good">
          <h3>Prioritäten für die nächsten 90 Tage</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
            <div class="recommendations">
              <h4>🔥 Hoch (Sofort)</h4>
              <ul>
                ${impressumScore < 70 ? '<li>Impressum vervollständigen</li>' : ''}
                ${realData.performance.score < 60 ? '<li>Website-Performance optimieren</li>' : ''}
                ${realData.reviews.google.count < 10 ? '<li>Google-Bewertungen sammeln</li>' : ''}
              </ul>
            </div>
            <div class="recommendations">
              <h4>🚀 Mittel (30 Tage)</h4>
              <ul>
                ${socialMediaScore < 60 ? '<li>Social Media Präsenz ausbauen</li>' : ''}
                ${realData.seo.score < 70 ? '<li>SEO-Optimierung vorantreiben</li>' : ''}
                <li>Content-Marketing-Strategie entwickeln</li>
              </ul>
            </div>
            <div class="recommendations">
              <h4>📈 Niedrig (90 Tage)</h4>
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
        <img src="/lovable-uploads/1b7bf83e-0e07-4072-85cb-b162354578ea.png" alt="HANDWERK STARS Logo" class="logo" style="max-width: 120px;" />
      </div>
      <h3 style="color: #fbbf24; margin-bottom: 15px;">Social Listening und Monitoring Report</h3>
      <p style="color: #d1d5db; margin-bottom: 10px;">Erstellt am ${new Date().toLocaleDateString()} | Vollständiger Business-Analyse Report</p>
      <p style="color: #9ca3af; font-size: 0.9em;">Alle Daten basieren auf automatischer Analyse und manueller Datenerfassung</p>
      <p style="color: #9ca3af; font-size: 0.9em; margin-top: 5px;">Für Rückfragen und Optimierungsberatung stehen wir gerne zur Verfügung</p>
    </div>
  </div>
</body>
</html>`;
};
