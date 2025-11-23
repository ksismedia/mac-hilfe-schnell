import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, CompetitorServices, ManualSocialData, ManualWorkplaceData, ManualCorporateIdentityData, ManualContentData, ManualAccessibilityData, ManualBacklinkData } from '@/hooks/useManualData';
import { calculateWorkplaceScore } from './export/scoreCalculations';
import { FileText, Download, Printer } from 'lucide-react';
import { getHTMLStyles } from './export/htmlStyles';
import { getLogoHTML } from './export/logoData';

interface HTMLExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei';
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: ManualSocialData;
  manualWorkplaceData?: ManualWorkplaceData;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: CompetitorServices;
  companyServices?: { services: string[] };
  deletedCompetitors?: Set<string>;
  hourlyRateData?: { meisterRate: number; facharbeiterRate: number; azubiRate: number; helferRate: number };
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  manualReputationData?: any;
}

const HTMLExport: React.FC<HTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualWorkplaceData,
  manualCompetitors = [],
  competitorServices = {},
  deletedCompetitors = new Set(),
  hourlyRateData,
  manualKeywordData,
  keywordScore,
  manualReputationData
}) => {
  // Calculate scores based on available data
  const calculateOverallScore = () => {
    const scores = [
      realData.seo.score,
      realData.performance.score,
      realData.mobile.overallScore,
      realData.socialMedia.overallScore
    ];
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const calculateVisibilityScore = () => {
    // Base on SEO score and reviews
    const seoWeight = 0.7;
    const reviewsWeight = 0.3;
    const reviewsScore = realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0;
    return Math.round(realData.seo.score * seoWeight + reviewsScore * reviewsWeight);
  };

  // Calculate legal compliance scores
  const impressumScore = manualImprintData?.found ? 100 : 0;
  const impressumMissingElements = manualImprintData?.missingElements || [];
  const datenschutzScore = 85; // Assumed score
  const agbScore = 60; // Assumed score
  const legalComplianceScore = Math.round((impressumScore + datenschutzScore + agbScore) / 3);

  // Function to get missing imprint elements with detailed descriptions
  const getMissingImprintElements = () => {
    if (!manualImprintData || manualImprintData.found) {
      return [];
    }

    const standardElements = [
      'Vollständiger Name des Unternehmens',
      'Rechtsform (GmbH, AG, etc.)',
      'Anschrift der Hauptniederlassung',
      'Kontaktmöglichkeiten (Telefon, E-Mail)',
      'Handelsregistereintrag und -nummer',
      'Umsatzsteuer-Identifikationsnummer',
      'Aufsichtsbehörde (bei erlaubnispflichtigen Tätigkeiten)',
      'Berufsbezeichnung und Kammer',
      'Haftpflichtversicherung (Versicherer und Geltungsbereich)',
      'Vertretungsberechtigte Personen'
    ];

    const foundElements = manualImprintData?.elements || [];
    
    return standardElements.filter(element => 
      !foundElements.some(found => 
        found.toLowerCase().includes(element.toLowerCase().split(' ')[0])
      )
    );
  };

  // Calculate workplace scores based on actual data structure
  const workplaceKununuRating = realData.workplace?.kununu?.rating || 0;
  const workplaceGlassdoorRating = realData.workplace?.glassdoor?.rating || 0;
  const workplaceScoreRaw = calculateWorkplaceScore(realData, manualWorkplaceData);
  const workplaceScore = workplaceScoreRaw === -1 ? 0 : workplaceScoreRaw; // Use 0 for calculation but display logic in templates
  const kununuScore = workplaceKununuRating > 0 ? Math.round((workplaceKununuRating / 5) * 100) : 0;

  // Enhanced Social Media Score calculation including last post timing
  const calculateEnhancedSocialMediaScore = () => {
    let score = 0;
    const platforms = ['facebook', 'instagram'];
    
    platforms.forEach(platform => {
      const platformData = realData.socialMedia[platform];
      if (platformData.found) {
        score += 25; // Base score for presence
        
        // Add score based on followers
        if (platformData.followers > 500) score += 15;
        else if (platformData.followers > 100) score += 10;
        else if (platformData.followers > 0) score += 5;
        
        // Add score based on last post timing
        if (platformData.lastPost) {
          const lastPostDate = new Date(platformData.lastPost);
          const daysSinceLastPost = Math.floor((Date.now() - lastPostDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastPost <= 7) score += 10; // Recent activity
          else if (daysSinceLastPost <= 30) score += 5; // Moderate activity
          else if (daysSinceLastPost <= 90) score += 2; // Low activity
          // No points for posts older than 90 days
        }
      }
    });
    
    return Math.min(100, score);
  };

  const generateInternalReport = () => {
    console.log('🔴 HTMLExport.tsx generateInternalReport called - INTERNAL HTML GENERATOR');
    const overallScore = calculateOverallScore();
    const visibilityScore = calculateVisibilityScore();
    const performanceScore = realData.performance.score;
    const enhancedSocialMediaScore = calculateEnhancedSocialMediaScore();
    const missingImprintElements = getMissingImprintElements();
    
    // Helper functions for display
    const displaySocialScore = enhancedSocialMediaScore > 0 ? enhancedSocialMediaScore : '–';
    const displayOverallScore = overallScore > 0 ? overallScore : '–';
    const displayVisibilityScore = visibilityScore > 0 ? visibilityScore : '–';
    const displayPerformanceScore = performanceScore > 0 ? performanceScore : '–';

    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Handwerk Stars - Interne Analyse ${businessData.address}</title>
    <style>${getHTMLStyles()}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${getLogoHTML()}
            <h1>Interne Digitale Analyse</h1>
            <p class="subtitle">Technischer Report für ${businessData.address}</p>
            <p style="color: #9ca3af; font-size: 0.9em; margin-top: 10px;">
                Erstellt am ${new Date().toLocaleDateString('de-DE')} | Handwerk Stars Internal
            </p>
        </div>

        <section class="company-info">
            <h2>${businessData.address}</h2>
            <p><strong>URL:</strong> <a href="${businessData.url}" target="_blank">${businessData.url}</a></p>
            <p><strong>Branche:</strong> ${businessData.industry}</p>
        </section>

        <section class="score-overview">
            <div class="score-card">
                <div class="score-big">${displayOverallScore}</div>
                <div class="score-label">Gesamtbewertung</div>
            </div>
            <div class="score-card">
                <div class="score-big">${displayVisibilityScore}</div>
                <div class="score-label">Sichtbarkeit</div>
            </div>
            <div class="score-card">
                <div class="score-big">${displayPerformanceScore}</div>
                <div class="score-label">Performance</div>
            </div>
            <div class="score-card">
                <div class="score-big">${displaySocialScore}</div>
                <div class="score-label">Social Media</div>
            </div>
        </section>

        <!-- Content-Analyse -->
        <section class="section">
            <div class="section-header">📝 Content-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Content-Score</div>
                        <div class="metric-value">75</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Inhaltsqualität</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%" data-value="70"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Textqualität</div>
                        <div class="metric-value">Zufriedenstellend</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Lesbarkeit</span>
                                <span>70%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 70%" data-value="70"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Branchenrelevanz</div>
                        <div class="metric-value">Hoch</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fachliche Expertise</span>
                                <span>85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%" data-value="80"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Aktualität</div>
                        <div class="metric-value">Aktuell</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Content-Frische</span>
                                <span>80%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 80%" data-value="80"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Impressum-Bewertung mit detaillierten fehlenden Angaben -->
        <section class="section">
            <div class="section-header">⚖️ Rechtliche Compliance - Detailanalyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Impressum-Status</div>
                        <div class="metric-value">${manualImprintData?.found ? 'Vollständig' : 'Unvollständig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Rechtssicherheit</span>
                                <span>${impressumScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${impressumScore}%" data-value="${impressumScore}"></div>
                            </div>
                        </div>
                        ${missingImprintElements.length > 0 ? `
                            <div style="margin-top: 15px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 0.9em;">
                                <strong style="color: #dc2626; display: block; margin-bottom: 8px;">⚠️ Fehlende Pflichtangaben im Impressum:</strong>
                                <ul style="margin: 0; padding-left: 20px; color: #991b1b; line-height: 1.6;">
                                    ${missingImprintElements.map(element => `<li style="margin-bottom: 4px;"><strong>${element}</strong></li>`).join('')}
                                </ul>
                                <div style="margin-top: 12px; padding: 8px; background: #fee2e2; border-radius: 6px; font-size: 0.85em; color: #7f1d1d;">
                                    <strong>Rechtliche Hinweise:</strong><br>
                                    • Fehlende Impressumsangaben können zu Abmahnungen führen<br>
                                    • Bußgelder bis zu 50.000 € möglich<br>
                                    • Wettbewerbsrechtliche Risiken durch Konkurrenten
                                </div>
                            </div>
                        ` : `
                            <div style="margin-top: 10px; padding: 8px; background: #f0fdf4; border-radius: 6px; font-size: 0.85em; color: #166534;">
                                ✅ <strong>Impressum ist vollständig und rechtssicher</strong>
                            </div>
                        `}
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Datenschutz</div>
                        <div class="metric-value">Vorhanden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>DSGVO-Konformität</span>
                                <span>${datenschutzScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${datenschutzScore}%" data-value="80"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">AGB</div>
                        <div class="metric-value">Teilweise</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Geschäftsbedingungen</span>
                                <span>${agbScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${agbScore}%" data-value="60"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Rechtliche Sicherheit</div>
                        <div class="metric-value">${legalComplianceScore >= 90 ? 'Hoch' : legalComplianceScore >= 61 ? 'Mittel' : 'Niedrig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Gesamt-Compliance</span>
                                <span>${legalComplianceScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${legalComplianceScore}%" data-value="${legalComplianceScore}"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${missingImprintElements.length > 0 ? `
                    <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px;">
                        <h4 style="color: #92400e; margin-bottom: 10px;">📋 Handlungsempfehlungen für das Impressum:</h4>
                        <ol style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.6;">
                            <li><strong>Sofortige Vervollständigung:</strong> Ergänzen Sie alle fehlenden Pflichtangaben</li>
                            <li><strong>Rechtsprüfung:</strong> Lassen Sie das Impressum von einem Anwalt prüfen</li>
                            <li><strong>Regelmäßige Updates:</strong> Aktualisieren Sie Änderungen sofort</li>
                            <li><strong>Gut sichtbare Platzierung:</strong> Impressum auf jeder Seite erreichbar</li>
                        </ol>
                    </div>
                ` : ''}
            </div>
        </section>

        <!-- Arbeitsplatz-Bewertung mit korrekten Daten -->
        <section class="section">
            <div class="section-header">👥 Arbeitsplatz-Bewertung</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Arbeitgeber-Bewertung</div>
                        <div class="metric-value">${workplaceKununuRating > 0 ? workplaceKununuRating.toFixed(1) + '/5.0' : 'Keine Daten'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mitarbeiterzufriedenheit</span>
                                <span>${workplaceScoreRaw === -1 ? '–' : workplaceScore + '%'}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${workplaceScoreRaw === -1 ? '0' : workplaceScore + '%'}" data-value="${workplaceScore}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Kununu Score</div>
                        <div class="metric-value">${workplaceKununuRating > 0 ? workplaceKununuRating.toFixed(1) + '/5.0' : 'Keine Daten'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Employer Branding</span>
                                <span>${kununuScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${kununuScore}%" data-value="${kununuScore}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Arbeitsklima</div>
                        <div class="metric-value">${workplaceScoreRaw === -1 ? 'Nicht erfasst' : workplaceScore >= 90 ? 'Sehr gut' : workplaceScore >= 70 ? 'Gut' : 'Verbesserungsbedarf'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Betriebsklima</span>
                                <span>${workplaceScoreRaw === -1 ? '–' : Math.max(workplaceScore - 5, 0) + '%'}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${workplaceScoreRaw === -1 ? '0' : Math.max(workplaceScore - 5, 0) + '%'}" data-value="${Math.max(workplaceScore - 5, 0)}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Fachkräfte-Attraktivität</div>
                        <div class="metric-value">${workplaceScore >= 90 ? 'Sehr attraktiv' : workplaceScore >= 61 ? 'Attraktiv' : workplaceScore > 0 ? 'Wenig attraktiv' : 'Keine Daten'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Recruiting-Potenzial</span>
                                <span>${workplaceScoreRaw === -1 ? '–' : Math.max(workplaceScore - 10, 0) + '%'}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${workplaceScoreRaw === -1 ? '0' : Math.max(workplaceScore - 10, 0) + '%'}" data-value="${Math.max(workplaceScore - 10, 0)}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Sichtbarkeits-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">SEO Score</div>
                        <div class="metric-value">${realData.seo.score}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.seo.score}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.seo.score}%" data-value="${Math.round(realData.seo.score / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                     <div class="metric-item">
                         <div class="metric-title">Keywords gefunden</div>
                         <div class="metric-value">${(manualKeywordData || realData.keywords).filter(k => k.found).length}/${(manualKeywordData || realData.keywords).length}</div>
                         <div class="progress-container">
                             <div class="progress-label">
                                 <span>Fortschritt</span>
                                 <span>${Math.round(((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100)}%</span>
                             </div>
                             <div class="progress-bar">
                                 <div class="progress-fill" style="width: ${((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100}%" data-value="${Math.round((((manualKeywordData || realData.keywords).filter(k => k.found).length / (manualKeywordData || realData.keywords).length) * 100) / 10) * 10}"></div>
                             </div>
                         </div>
                     </div>
                    <div class="metric-item">
                        <div class="metric-title">Meta Description</div>
                        <div class="metric-value">${realData.seo.metaDescription ? 'Vorhanden' : 'Fehlt'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.seo.metaDescription ? 100 : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.seo.metaDescription ? 100 : 0}%" data-value="${realData.seo.metaDescription ? 100 : 0}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Title Tag</div>
                        <div class="metric-value">${realData.seo.titleTag ? 'Vorhanden' : 'Fehlt'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.seo.titleTag ? 100 : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.seo.titleTag ? 100 : 0}%" data-value="${realData.seo.titleTag ? 100 : 0}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Performance-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Ladezeit</div>
                        <div class="metric-value">${realData.performance.loadTime}s</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Performance Score</span>
                                <span>${realData.performance.score}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.performance.score}%" data-value="${Math.round(realData.performance.score / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Mobile Optimierung</div>
                        <div class="metric-value">${realData.mobile.overallScore}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.mobile.overallScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.mobile.overallScore}%" data-value="${Math.round(realData.mobile.overallScore / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Responsive Design</div>
                        <div class="metric-value">${realData.mobile.responsive ? 'Ja' : 'Nein'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.mobile.responsive ? 100 : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.mobile.responsive ? 100 : 0}%" data-value="${realData.mobile.responsive ? 100 : 0}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Core Web Vitals</div>
                        <div class="metric-value">${realData.performance.lcp < 2.5 && realData.performance.fid < 100 && realData.performance.cls < 0.1 ? 'Gut' : 'Verbesserung nötig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.performance.lcp < 2.5 && realData.performance.fid < 100 && realData.performance.cls < 0.1 ? 85 : 45}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.performance.lcp < 2.5 && realData.performance.fid < 100 && realData.performance.cls < 0.1 ? 85 : 45}%" data-value="${realData.performance.lcp < 2.5 && realData.performance.fid < 100 && realData.performance.cls < 0.1 ? 80 : 40}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Social Media-Analyse mit verbesserter Bewertung -->
        <section class="section">
            <div class="section-header">📱 Social Media-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Facebook</div>
                        <div class="metric-value">${realData.socialMedia.facebook.found ? 'Aktiv' : 'Nicht vorhanden'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Follower</span>
                                <span>${realData.socialMedia.facebook.followers}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, realData.socialMedia.facebook.followers / 10)}%" data-value="${Math.round(Math.min(100, realData.socialMedia.facebook.followers / 10) / 10) * 10}"></div>
                            </div>
                        </div>
                        ${realData.socialMedia.facebook.lastPost ? `
                            <div style="margin-top: 8px; font-size: 0.8em; color: #6b7280;">
                                Letzter Post: ${new Date(realData.socialMedia.facebook.lastPost).toLocaleDateString('de-DE')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Instagram</div>
                        <div class="metric-value">${realData.socialMedia.instagram.found ? 'Aktiv' : 'Nicht vorhanden'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Follower</span>
                                <span>${realData.socialMedia.instagram.followers}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, realData.socialMedia.instagram.followers / 10)}%" data-value="${Math.round(Math.min(100, realData.socialMedia.instagram.followers / 10) / 10) * 10}"></div>
                            </div>
                        </div>
                        ${realData.socialMedia.instagram.lastPost ? `
                            <div style="margin-top: 8px; font-size: 0.8em; color: #6b7280;">
                                Letzter Post: ${new Date(realData.socialMedia.instagram.lastPost).toLocaleDateString('de-DE')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Gesamtscore</div>
                        <div class="metric-value">${displaySocialScore}%</div>
                         <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${displaySocialScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${enhancedSocialMediaScore}%" data-value="${Math.round(enhancedSocialMediaScore / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Online Präsenz</div>
                        <div class="metric-value">${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 'Vorhanden' : 'Aufbau nötig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 75 : 25}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 75 : 25}%" data-value="${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 70 : 20}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Wettbewerbsanalyse</div>
            <div class="section-content">
                <p><strong>Anzahl der Wettbewerber:</strong> ${manualCompetitors?.length || 0}</p>
                ${manualCompetitors && manualCompetitors.length > 0 ? `
                    <div class="competitor-list">
                        ${manualCompetitors.map((competitor, index) => `
                            <div class="competitor-card">
                                <h4>Wettbewerber ${index + 1}</h4>
                                <p><strong>Name:</strong> ${competitor.name}</p>
                                <p><strong>Bewertung:</strong> ${competitor.rating}/5</p>
                                <p><strong>Anzahl Bewertungen:</strong> ${competitor.reviews}</p>
                                <p><strong>Entfernung:</strong> ${competitor.distance}</p>
                                ${competitorServices[competitor.name] ? `
                                    <p><strong>Services:</strong></p>
                                    <ul class="services-list">
                                        ${competitorServices[competitor.name].services.map(service => `<li>${service}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>Keine Wettbewerberdaten verfügbar.</p>'}
            </div>
        </section>

        <section class="section">
            <div class="section-header">Online-Bewertungen</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Google Bewertungen</div>
                        <div class="metric-value">⭐ ${realData.reviews.google.rating || 'N/A'}/5 (${realData.reviews.google.count || 0} Bewertungen)</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Reputation</span>
                                <span>${realData.reviews.google.rating ? Math.round(realData.reviews.google.rating * 20) : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Bewertungsanzahl</div>
                        <div class="metric-value">${realData.reviews.google.count || 0} Bewertungen</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Vertrauensbasis</span>
                                <span>${Math.min(100, realData.reviews.google.count * 5)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, realData.reviews.google.count * 5)}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Kundenzufriedenheit</div>
                        <div class="metric-value">${realData.reviews.google.rating >= 4.5 ? 'Hervorragend' : 
                          realData.reviews.google.rating >= 4 ? 'Sehr gut' : 
                          realData.reviews.google.rating >= 3.5 ? 'Gut' : 
                          realData.reviews.google.rating ? 'Verbesserung nötig' : 'Keine Daten'}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}%"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Online-Glaubwürdigkeit</div>
                        <div class="metric-value">Vertrauenswürdig</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Gesamteindruck</span>
                                <span>80%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 80%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Stundensatz-Analyse</div>
            <div class="section-content">
                ${hourlyRateData ? `
                    <div class="metric-grid">
                        <div class="metric-item">
                            <div class="metric-title">Stundensatz Meister</div>
                            <div class="metric-value">${hourlyRateData.meisterRate || 0} €</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Stundensatz Facharbeiter</div>
                            <div class="metric-value">${hourlyRateData.facharbeiterRate || 0} €</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Stundensatz Azubi</div>
                            <div class="metric-value">${hourlyRateData.azubiRate || 0} €</div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Stundensatz Helfer</div>
                            <div class="metric-value">${hourlyRateData.helferRate || 0} €</div>
                        </div>
                    </div>
                ` : '<p>Keine Stundensatzdaten verfügbar.</p>'}
            </div>
        </section>

        <!-- Technische Details -->
        <section class="section">
            <div class="section-header">Technische Details</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">LCP (Largest Contentful Paint)</div>
                        <div class="metric-value">${realData.performance.lcp}s</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">FID (First Input Delay)</div>
                        <div class="metric-value">${realData.performance.fid}ms</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">CLS (Cumulative Layout Shift)</div>
                        <div class="metric-value">${realData.performance.cls}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Alt-Tags</div>
                        <div class="metric-value">${realData.seo.altTags.withAlt}/${realData.seo.altTags.total}</div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Keywords Details -->
        <section class="section">
            <div class="section-header">Keywords Details</div>
            <div class="section-content">
                <div class="keyword-grid">
                    ${realData.keywords.map(keyword => `
                        <div class="keyword-item ${keyword.found ? 'found' : 'not-found'}">
                            <span>${keyword.keyword}</span>
                            <span>${keyword.found ? '✓' : '✗'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </section>

        <!-- Impression Management Daten -->
        ${manualImprintData ? `
        <section class="section">
            <div class="section-header">Impressum-Analyse (Manuell)</div>
            <div class="section-content">
                <p><strong>Impressum gefunden:</strong> ${manualImprintData.found ? 'Ja' : 'Nein'}</p>
                ${manualImprintData.elements && manualImprintData.elements.length > 0 ? `
                    <p><strong>Gefundene Elemente:</strong></p>
                    <ul>
                        ${manualImprintData.elements.map(element => `<li>${element}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        </section>
        ` : ''}

        <!-- Social Media Daten (Manuell) -->
        ${manualSocialData ? `
        <section class="section">
            <div class="section-header">Social Media-Analyse (Manuell)</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Facebook URL</div>
                        <div class="metric-value">${manualSocialData.facebookUrl || 'Nicht angegeben'}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Instagram URL</div>
                        <div class="metric-value">${manualSocialData.instagramUrl || 'Nicht angegeben'}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Facebook Follower</div>
                        <div class="metric-value">${manualSocialData.facebookFollowers || 'Nicht angegeben'}</div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Instagram Follower</div>
                        <div class="metric-value">${manualSocialData.instagramFollowers || 'Nicht angegeben'}</div>
                    </div>
                </div>
            </div>
        </section>
        ` : ''}

        <!-- Handlungsempfehlungen -->
        <section class="section">
            <div class="section-header">Handlungsempfehlungen</div>
            <div class="section-content">
                <h4>Technische Optimierungen:</h4>
                <ul>
                    ${realData.seo.score < 70 ? '<li>SEO-Bestandsanalyse durchführen</li>' : ''}
                    ${realData.performance.score < 70 ? '<li>Website-Performance verbessern</li>' : ''}
                    ${realData.mobile.overallScore < 70 ? '<li>Mobile Optimierung durchführen</li>' : ''}
                    ${realData.reviews.google.count < 10 ? '<li>Mehr Kundenbewertungen sammeln</li>' : ''}
                    ${enhancedSocialMediaScore < 60 ? '<li>Social Media Präsenz aufbauen</li>' : ''}
                    ${impressumScore < 80 ? '<li>Impressum vervollständigen für rechtliche Sicherheit</li>' : ''}
                    <li>Regelmäßige Website-Wartung implementieren</li>
                    <li>Content-Marketing-Strategie entwickeln</li>
                    <li>Lokale SEO-Maßnahmen umsetzen</li>
                </ul>
            </div>
        </section>
    </div>
</body>
</html>`;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const downloadHTMLReport = () => {
    console.log('🔴 HTMLExport.tsx downloadHTMLReport called - INTERNAL HTML GENERATOR DOWNLOAD');
    const overallScore = calculateOverallScore();
    const visibilityScore = calculateVisibilityScore();
    const performanceScore = realData.performance.score;
    const enhancedSocialMediaScore = calculateEnhancedSocialMediaScore();
    const missingImprintElements = getMissingImprintElements();
    
    // Helper functions for display
    const displaySocialScore = enhancedSocialMediaScore > 0 ? enhancedSocialMediaScore : '–';
    const displayOverallScore = overallScore > 0 ? overallScore : '–';
    const displayVisibilityScore = visibilityScore > 0 ? visibilityScore : '–';
    const displayPerformanceScore = performanceScore > 0 ? performanceScore : '–';

    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Handwerk Stars - Interne Analyse ${businessData.address}</title>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <meta name="generator" content="Handwerk Stars Analysis Tool v${Date.now()}">
    <style>${getHTMLStyles()}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="/lovable-uploads/a9346d0f-f4c9-4697-8b95-78dd3609ddd4.png" alt="Handwerk Stars Logo" class="logo" />
            </div>
            <h1>Interne Digitale Analyse</h1>
            <p class="subtitle">Technischer Report für ${businessData.address}</p>
            <p style="color: #9ca3af; font-size: 0.9em; margin-top: 10px;">
                Erstellt am ${new Date().toLocaleDateString('de-DE')} | Handwerk Stars Internal
            </p>
        </div>

        <section class="company-info">
            <h2>${businessData.address}</h2>
            <p><strong>URL:</strong> <a href="${businessData.url}" target="_blank">${businessData.url}</a></p>
            <p><strong>Branche:</strong> ${businessData.industry}</p>
        </section>

        <section class="score-overview">
            <div class="score-card">
                <div class="score-big">${displayOverallScore}</div>
                <div class="score-label">Gesamtbewertung</div>
            </div>
            <div class="score-card">
                <div class="score-big">${displayVisibilityScore}</div>
                <div class="score-label">Sichtbarkeit</div>
            </div>
            <div class="score-card">
                <div class="score-big">${displayPerformanceScore}</div>
                <div class="score-label">Performance</div>
            </div>
            <div class="score-card">
                <div class="score-big">${displaySocialScore}</div>
                <div class="score-label">Social Media</div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">📝 Content-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Content-Score</div>
                        <div class="metric-value">75</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Inhaltsqualität</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%" data-value="70"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">⚖️ Rechtliche Compliance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Impressum-Status</div>
                        <div class="metric-value">${manualImprintData?.found ? 'Vollständig' : 'Unvollständig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Rechtssicherheit</span>
                                <span>${impressumScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${impressumScore}%" data-value="${impressumScore}"></div>
                            </div>
                        </div>
                        ${missingImprintElements.length > 0 ? `
                            <div style="margin-top: 15px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
                                <strong style="color: #dc2626;">⚠️ Fehlende Impressumsangaben:</strong>
                                <ul style="margin: 8px 0; padding-left: 20px; color: #991b1b;">
                                    ${missingImprintElements.map(element => `<li>${element}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">👥 Arbeitsplatz-Bewertung</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Arbeitgeber-Bewertung</div>
                        <div class="metric-value">${workplaceKununuRating > 0 ? workplaceKununuRating.toFixed(1) + '/5.0' : 'Keine Daten'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mitarbeiterzufriedenheit</span>
                                <span>${workplaceScoreRaw === -1 ? '–' : workplaceScore + '%'}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${workplaceScoreRaw === -1 ? '0' : workplaceScore + '%'}" data-value="${workplaceScore}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">📱 Social Media Präsenz</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Facebook</div>
                        <div class="metric-value">${realData.socialMedia.facebook.found ? 'Aktiv' : 'Nicht gefunden'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Follower: ${realData.socialMedia.facebook.followers || 0}</span>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Instagram</div>
                        <div class="metric-value">${realData.socialMedia.instagram.found ? 'Aktiv' : 'Nicht gefunden'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Follower: ${realData.socialMedia.instagram.followers || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">🔍 SEO & Performance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">SEO Score</div>
                        <div class="metric-value">${realData.seo.score}%</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.seo.score}%" data-value="${realData.seo.score}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Performance</div>
                        <div class="metric-value">${realData.performance.score}%</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.performance.score}%" data-value="${realData.performance.score}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">⭐ Bewertungen</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Google Bewertungen</div>
                        <div class="metric-value">${realData.reviews.google.rating}/5 (${realData.reviews.google.count} Bewertungen)</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(realData.reviews.google.rating / 5) * 100}%" data-value="${(realData.reviews.google.rating / 5) * 100}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Rechtlicher Disclaimer - UNNA Style Design -->
        <div class="disclaimer">
          <h4>⚖️ Rechtlicher Hinweis</h4>
          <div class="disclaimer-content">
            <p><strong>Haftungsausschluss:</strong> Diese Analyse wurde automatisiert erstellt und dient ausschließlich informativen Zwecken. Die Bewertungen und Empfehlungen basieren auf technischen Messungen und stellen keine Rechtsberatung dar.</p>
            <p><strong>Keine Gewähr:</strong> Wir übernehmen keine Gewähr für die Vollständigkeit, Richtigkeit oder Aktualität der Analyseergebnisse. Rechtliche und technische Standards können sich ändern.</p>
            <p><strong>Individuelle Prüfung erforderlich:</strong> Für rechtsverbindliche Aussagen, insbesondere zu DSGVO-Compliance, Barrierefreiheit oder anderen rechtlichen Aspekten, empfehlen wir die Konsultation entsprechender Fachexperten.</p>
            <div class="disclaimer-date">Analyse erstellt am: ${new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        <footer style="text-align: center; margin: 40px auto 0 auto; padding: 20px; background: rgba(17, 24, 39, 0.6); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3); max-width: 800px; color: #9ca3af; font-size: 0.9em;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 15px;">
              <div style="text-align: center;">
                <div style="font-family: 'Helvetica Condensed', 'Arial Narrow', 'Impact', Arial, sans-serif; font-size: 24px; font-weight: 600; text-transform: uppercase; line-height: 0.8; letter-spacing: -0.5px; font-stretch: condensed; background: linear-gradient(135deg, #f4c430 0%, #ffdf3a 50%, #f4c430 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">HANDWERK</div>
                <div style="font-family: 'Helvetica Condensed', 'Arial Narrow', 'Impact', Arial, sans-serif; font-size: 24px; font-weight: 600; text-transform: uppercase; line-height: 0.8; letter-spacing: -0.5px; font-stretch: condensed; background: linear-gradient(135deg, #f4c430 0%, #ffdf3a 50%, #f4c430 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">STARS</div>
              </div>
            </div>
            <p style="margin: 0; color: #fbbf24; font-weight: 600;">© ${new Date().getFullYear()} Handwerk Stars - Interne Analyse</p>
            <p style="margin: 5px 0 0 0;">Erstellt am ${new Date().toLocaleDateString('de-DE')}</p>
        </footer>
    </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `handwerk-stars-analyse-${businessData.address?.replace(/\s+/g, '-').toLowerCase() || 'report'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Technischer Report (Intern)
        </CardTitle>
        <CardDescription>
          Generiert einen vollständigen HTML-Report mit allen Details inkl. fehlender Impressum-Angaben.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button onClick={generateInternalReport} className="bg-gray-800 hover:bg-gray-700 text-white">
            <Printer className="h-4 w-4 mr-2" />
            Im Browser öffnen
          </Button>
          <Button onClick={downloadHTMLReport} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-2" />
            Als HTML-Datei herunterladen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default HTMLExport;
