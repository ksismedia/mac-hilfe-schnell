
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';

export const generateHeaderSection = (
  companyName: string,
  industryName: string,
  currentDate: string,
  overallScore: number,
  seoScore: number,
  performanceScore: number,
  mobileScore: number,
  hourlyRateScore: number,
  socialMediaScore: number,
  dataPrivacyScore: number = 75
) => `
        <!-- Header -->
        <div class="header">
            <h1>Online-Marketing Analyse</h1>
            <div class="subtitle">Professionelle Bewertung Ihres digitalen Auftritts</div>
            <div style="margin-top: 20px; color: #718096; font-size: 1em;">
                ${companyName} • ${industryName} • ${currentDate}
            </div>
        </div>

        <!-- Gesamtbewertung -->
        <div class="score-overview">
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${overallScore < 60 ? '0-60' : overallScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${overallScore}%</button>
                <div class="score-label">Gesamt-Score</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${seoScore < 60 ? '0-60' : seoScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${seoScore}%</button>
                <div class="score-label">SEO-Bestandsanalyse</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${performanceScore < 60 ? '0-60' : performanceScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${performanceScore}%</button>
                <div class="score-label">Website-Performance</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${mobileScore < 60 ? '0-60' : mobileScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${mobileScore}%</button>
                <div class="score-label">Mobile Optimierung</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${hourlyRateScore < 60 ? '0-60' : hourlyRateScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${
                  hourlyRateScore === 100 ? 'Sehr wettbewerbsfähig' : 
                  hourlyRateScore === 85 ? 'Wettbewerbsfähig' : 
                  hourlyRateScore === 70 ? 'Marktgerecht' : 
                  hourlyRateScore === 50 ? 'Über Marktdurchschnitt' : `${hourlyRateScore}/100`
                }</button>
                <div class="score-label">Preisstrategie</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${socialMediaScore < 60 ? '0-60' : socialMediaScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${socialMediaScore}%</button>
                <div class="score-label">Social Media</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${dataPrivacyScore < 60 ? '0-60' : dataPrivacyScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${dataPrivacyScore}%</button>
                <div class="score-label">Datenschutz</div>
            </div>
        </div>
`;

export const generateSEOSection = (
  realData: RealBusinessData,
  keywordsFoundCount: number,
  keywordsScore: number,
  hasMetaDescription: boolean
) => `
        <!-- SEO-Analyse -->
        <div class="section">
            <div class="section-header">🔍 Suchmaschinenoptimierung (SEO)</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">SEO-Gesamtbewertung</div>
                        <div class="metric-value ${realData.seo.score >= 80 ? 'excellent' : realData.seo.score >= 60 ? 'good' : realData.seo.score >= 40 ? 'warning' : 'danger'}">${realData.seo.score > 0 ? `${realData.seo.score}/100 Punkte` : '—/100 Punkte'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Optimierung</span>
                                <button class="percentage-btn" data-score="${realData.seo.score < 60 ? '0-60' : realData.seo.score < 80 ? '60-80' : '80-100'}">${realData.seo.score > 0 ? `${realData.seo.score}%` : '—'}</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.seo.score < 60 ? 'warning' : ''}" style="width: ${realData.seo.score}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Branchenrelevante Keywords</div>
                        <div class="metric-value ${keywordsScore >= 80 ? 'excellent' : keywordsScore >= 60 ? 'good' : keywordsScore >= 40 ? 'warning' : 'danger'}">${keywordsFoundCount}/${realData.keywords.length} gefunden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Keyword-Abdeckung</span>
                                <button class="percentage-btn" data-score="${keywordsScore < 60 ? '0-60' : keywordsScore < 80 ? '60-80' : '80-100'}">${keywordsScore}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${keywordsScore < 60 ? 'warning' : ''}" data-score="${keywordsScore < 60 ? '0-60' : keywordsScore < 80 ? '60-80' : '80-100'}" style="width: ${keywordsScore}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Website-Struktur</div>
                        <div class="metric-value ${hasMetaDescription ? 'excellent' : 'warning'}">
                            ${hasMetaDescription ? 'Vollständig optimiert' : 'Verbesserungspotenzial'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Meta-Tags & Struktur</span>
                                <button class="percentage-btn">${hasMetaDescription ? '100' : '60'}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${!hasMetaDescription ? 'warning' : ''}" style="width: ${hasMetaDescription ? 100 : 60}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Technische SEO</div>
                        <div class="metric-value good">Grundlagen vorhanden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Technische Umsetzung</span>
                                <button class="percentage-btn">75%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${realData.seo.score < 70 ? `
                <div class="recommendations">
                    <h4>Empfehlungen zur SEO-Verbesserung:</h4>
                    <ul>
                        <li>Optimierung der Seitentitel für bessere Auffindbarkeit</li>
                        <li>Verbesserung der Meta-Beschreibungen für höhere Klickraten</li>
                        <li>Integration branchenspezifischer Keywords in den Content</li>
                        <li>Aufbau einer logischen Überschriftenstruktur</li>
                        <li>Erstellung hochwertiger, relevanter Inhalte</li>
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
`;

export const generatePerformanceSection = (realData: RealBusinessData) => `
        <!-- Performance-Analyse -->
        <div class="section">
            <div class="section-header">⚡ Website-Performance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Performance-Score</div>
                        <div class="metric-value ${realData.performance.score >= 80 ? 'excellent' : realData.performance.score >= 60 ? 'good' : realData.performance.score >= 40 ? 'warning' : 'danger'}">${realData.performance.score > 0 ? `${realData.performance.score}/100 Punkte` : '—/100 Punkte'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Geschwindigkeit</span>
                                <button class="percentage-btn">${realData.performance.score > 0 ? `${realData.performance.score}%` : '—'}</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.score < 60 ? 'warning' : ''}" style="width: ${realData.performance.score}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Ladezeit</div>
                        <div class="metric-value ${realData.performance.loadTime < 2 ? 'excellent' : realData.performance.loadTime < 4 ? 'good' : realData.performance.loadTime < 6 ? 'warning' : 'danger'}">${realData.performance.loadTime} Sekunden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Optimal: unter 3s</span>
                                <span>${realData.performance.loadTime < 3 ? 'Erreicht' : 'Verbesserung nötig'}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.loadTime > 4 ? 'warning' : ''}" style="width: ${Math.max(20, 100 - (realData.performance.loadTime * 15))}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Nutzerfreundlichkeit</div>
                        <div class="metric-value good">Benutzerfreundlich</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>User Experience</span>
                                <button class="percentage-btn">85%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Verfügbarkeit</div>
                        <div class="metric-value excellent">Online & erreichbar</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Uptime & Erreichbarkeit</span>
                                <button class="percentage-btn">100%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;

export const generateMobileSection = (realData: RealBusinessData) => `
        <!-- Mobile Optimierung -->
        <div class="section">
            <div class="section-header">📱 Mobile Optimierung</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Mobile-Score</div>
                        <div class="metric-value ${realData.mobile.overallScore >= 80 ? 'excellent' : realData.mobile.overallScore >= 60 ? 'good' : realData.mobile.overallScore >= 40 ? 'warning' : 'danger'}">${realData.mobile.overallScore > 0 ? `${realData.mobile.overallScore}/100 Punkte` : '—/100 Punkte'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mobile Nutzerfreundlichkeit</span>
                                <button class="percentage-btn">${realData.mobile.overallScore > 0 ? `${realData.mobile.overallScore}%` : '—'}</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.mobile.overallScore < 60 ? 'warning' : ''}" style="width: ${realData.mobile.overallScore}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Responsive Design</div>
                        <div class="metric-value ${realData.mobile.responsive ? 'excellent' : 'danger'}">${realData.mobile.responsive ? 'Optimal umgesetzt' : 'Nicht responsive'}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.mobile.responsive ? 'danger' : ''}" style="width: ${realData.mobile.responsive ? 100 : 0}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Touch-Optimierung</div>
                        <div class="metric-value ${realData.mobile.responsive ? 'good' : 'warning'}">
                            ${realData.mobile.responsive ? 'Gut umgesetzt' : 'Verbesserung nötig'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.mobile.responsive ? 'warning' : ''}" style="width: ${realData.mobile.responsive ? 80 : 40}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Mobile Performance</div>
                        <div class="metric-value good">Zufriedenstellend</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mobile Ladezeit</span>
                                <button class="percentage-btn">75%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;

export const generateDataPrivacySection = (
  dataPrivacyScore: number = 75, 
  activeViolations: any[] = [],
  manualDataPrivacyData?: any,
  privacyData?: any
) => {
  // Calculate cookie score based on whether cookie-related violations are active
  const hasCookieViolations = activeViolations.some(v => v.cookieRelated);
  let cookieScore: number;
  
  if (manualDataPrivacyData?.cookieConsent) {
    // If cookie consent is manually confirmed, give high score
    cookieScore = 90;
  } else if (!hasCookieViolations) {
    // If no cookie violations are active (either none detected or deselected), give perfect score
    cookieScore = 100;
  } else {
    // Cookie violations are active, calculate based on data privacy score
    cookieScore = Math.max(30, Math.round((dataPrivacyScore + 15) * 0.8));
  }
  
  return `
        <!-- DSGVO-Konformität -->
        <div class="section">
            <div class="section-header collapsible" onclick="toggleSection('dsgvo-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
              <span>▶ DSGVO-Konformität</span>
              <div class="header-score-circle ${dataPrivacyScore >= 90 ? 'yellow' : dataPrivacyScore >= 61 ? 'green' : 'red'}">${dataPrivacyScore}%</div>
            </div>
            <div id="dsgvo-content" class="section-content" style="display: none;">
                <div class="grid-container" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    
                    <div class="metric-item">
                        <div class="metric-title">DSGVO-Score</div>
                        <div class="metric-value ${dataPrivacyScore >= 80 ? 'excellent' : dataPrivacyScore >= 60 ? 'good' : dataPrivacyScore >= 40 ? 'warning' : 'danger'}">
                            ${dataPrivacyScore >= 80 ? 'Vollständig konform' : dataPrivacyScore >= 60 ? 'Grundlegend konform' : dataPrivacyScore >= 40 ? 'Verbesserung nötig' : 'Kritische Mängel'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>DSGVO Art. 5-22 Compliance <span style="font-size: 11px; color: #6b7280;">(Einhaltung der Datenschutzgrundsätze und Nutzerrechte gemäß DSGVO, z. B. Rechtmäßigkeit, Transparenz, Löschung und Auskunftspflicht)</span></span>
                                <button class="percentage-btn">${dataPrivacyScore}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${dataPrivacyScore < 60 ? '0-60' : dataPrivacyScore < 80 ? '60-80' : '80-100'}" style="width: ${dataPrivacyScore}%"></div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> Einwilligung (Art. 7), Informationspflichten (Art. 13-14), Drittlandtransfer (Art. 44-49), Rechtsbasis, Tracking-Scripts, Externe Services
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Rechtsverstöße</div>
                        <div class="metric-value ${activeViolations.length === 0 ? 'excellent' : activeViolations.length <= 2 ? 'warning' : 'danger'}">
                            ${activeViolations.length === 0 ? 'Keine erkannt' : `${activeViolations.length} festgestellt`}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>DSGVO-Verstöße</span>
                                <button class="percentage-btn" style="background-color: ${activeViolations.length === 0 ? '#10b981' : activeViolations.length <= 2 ? '#f59e0b' : '#ef4444'};">${activeViolations.length}</button>
                            </div>
                            ${activeViolations.length > 0 ? `
                            <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
                                <strong>Erkannte Verstöße:</strong><br>
                                ${activeViolations.map(v => `• ${v.category}: ${v.description.substring(0, 50)}...`).join('<br>')}
                            </div>
                            ` : `
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Kategorien:</strong> Einwilligung, Drittlandtransfer, Informationspflichten, Datenschutz, Sicherheit
                            </div>
                            `}
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Rechtliches Risiko</div>
                        <div class="metric-value ${dataPrivacyScore >= 80 ? 'excellent' : dataPrivacyScore >= 60 ? 'good' : dataPrivacyScore >= 40 ? 'warning' : 'danger'}">
                            ${dataPrivacyScore >= 80 ? 'Sehr niedrig' : dataPrivacyScore >= 60 ? 'Niedrig' : dataPrivacyScore >= 40 ? 'Mittel' : 'Hoch'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Bußgeldrisiko</span>
                                <button class="percentage-btn">${100 - dataPrivacyScore}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${dataPrivacyScore < 60 ? '0-60' : dataPrivacyScore < 80 ? '60-80' : '80-100'}" style="width: ${100 - dataPrivacyScore}%"></div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Faktoren:</strong> Verstöße, Drittlandtransfer, Consent-Management, Dokumentation
                            </div>
                        </div>
                    </div>
                </div>
                
                ${activeViolations.length > 0 ? `
                  <div class="metric-item" style="grid-column: 1 / -1;">
                    <h4 style="color: #dc2626; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                      🚨 Detaillierte DSGVO-Verstöße
                    </h4>
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                      <div style="display: grid; gap: 15px;">
                        ${activeViolations.map((violation, index) => `
                          <div style="border-left: 4px solid ${violation.severity === 'high' ? '#dc2626' : violation.severity === 'medium' ? '#d97706' : '#059669'}; padding-left: 15px; background: white; border-radius: 6px; padding: 12px;">
                            <strong style="color: ${violation.severity === 'high' ? '#dc2626' : violation.severity === 'medium' ? '#d97706' : '#059669'}; display: block; margin-bottom: 8px; font-size: 16px;">
                              ${violation.severity === 'high' ? '🔴 Kritisch' : violation.severity === 'medium' ? '🟡 Wichtig' : '🟢 Info'}: ${violation.category}
                            </strong>
                            <div style="margin-bottom: 8px; padding: 8px; background: #f8fafc; border-radius: 4px;">
                              <strong style="color: #374151; font-size: 14px;">Problem:</strong>
                              <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px;">${violation.description}</p>
                            </div>
                            ${violation.article ? `
                              <div style="margin-bottom: 8px; padding: 8px; background: #fef3c7; border-radius: 4px; border: 1px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 12px;"><strong>⚖️ Rechtsgrundlage:</strong> ${violation.article}</p>
                              </div>
                            ` : ''}
                            ${violation.recommendation ? `
                              <div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-radius: 4px; border: 1px solid #059669;">
                                <strong style="color: #047857; font-size: 12px;">💡 Empfohlene Lösung:</strong>
                                <p style="margin: 4px 0 0 0; color: #047857; font-size: 12px;">${violation.recommendation}</p>
                              </div>
                            ` : ''}
                          </div>
                        `).join('')}
                      </div>
                      ${activeViolations.filter(v => v.severity === 'high').length > 0 ? `
                        <div style="margin-top: 20px; padding: 15px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px;">
                          <strong style="color: #374151; display: block; margin-bottom: 8px;">💰 Bußgeldrisiko</strong>
                          <p style="margin: 0; color: #374151; font-size: 14px;">
                            Bei den identifizierten Verstößen drohen Bußgelder bis zu <strong>20 Millionen Euro</strong> oder <strong>4% des Jahresumsatzes</strong>.
                          </p>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                ` : `
                  <div class="metric-item" style="grid-column: 1 / -1;">
                    <h4 style="color: #059669; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                      ✅ DSGVO-Konformität erreicht
                    </h4>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px;">
                      <p style="margin: 0; color: #065f46; font-size: 14px;">
                        Ihre Website erfüllt die grundlegenden DSGVO-Anforderungen. Regelmäßige Überprüfungen werden empfohlen.
                      </p>
                    </div>
                  </div>
                `}
                
                ${activeViolations.length > 0 && dataPrivacyScore < 90 ? `
                    <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-top: 20px; background: #fef2f2; border: 2px solid #fecaca;">
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
            </div>
        </div>

        <!-- Datenschutz & Technische Sicherheit -->
        <div class="section">
            <div class="section-header collapsible" onclick="toggleSection('datenschutz-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
              <span>▶ Datenschutz & Technische Sicherheit</span>
              <div class="header-score-circle ${dataPrivacyScore >= 90 ? 'yellow' : dataPrivacyScore >= 61 ? 'green' : 'red'}">${dataPrivacyScore}%</div>
            </div>
            <div id="datenschutz-content" class="section-content" style="display: none;">
                <div class="grid-container" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    
                    <div class="metric-item">
                        <div class="metric-title">SSL-Rating</div>
                        ${(() => {
                          const sslData = privacyData?.realApiData?.ssl;
                          const sslRating = privacyData?.sslRating || 'F';
                          const hasRealData = privacyData?.realApiData?.checkedWithRealAPIs;
                          
                          let sslScore = 0;
                          let sslStatus = 'Nicht verschlüsselt';
                          let sslClass = 'danger';
                          
                          if (sslRating === 'A+' || sslRating === 'A') {
                            sslScore = 100;
                            sslStatus = `${sslRating} (Vollständig verschlüsselt)`;
                            sslClass = 'excellent';
                          } else if (sslRating === 'B') {
                            sslScore = 80;
                            sslStatus = `${sslRating} (Gut verschlüsselt)`;
                            sslClass = 'good';
                          } else if (sslRating === 'C') {
                            sslScore = 60;
                            sslStatus = `${sslRating} (Ausreichend)`;
                            sslClass = 'warning';
                          } else if (sslRating === 'D') {
                            sslScore = 40;
                            sslStatus = `${sslRating} (Schwach)`;
                            sslClass = 'warning';
                          } else {
                            sslScore = 20;
                            sslStatus = `${sslRating} (Mangelhaft)`;
                            sslClass = 'danger';
                          }
                          
                          return `
                        <div class="metric-value ${sslClass}">${sslStatus}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>HTTPS-Verschlüsselung ${hasRealData ? '✓ <strong style="color: #10b981;">Echte SSL Labs Prüfung</strong>' : ''} <span style="font-size: 11px; color: #6b7280;">(Sichere SSL/TLS-Verbindung, die Datenübertragung vor unbefugtem Zugriff schützt und Voraussetzung für DSGVO-Konformität ist)</span></span>
                                <button class="percentage-btn">${sslScore}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${sslScore < 60 ? '0-60' : sslScore < 80 ? '60-80' : '80-100'}" style="width: ${sslScore}%"></div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> Zertifikat ${sslData?.hasCertificate ? '✓' : '✗'}, Verschlüsselungsstärke, HSTS ${sslData?.hasHSTS ? '✓' : '✗'}, Sicherheitslücken ${sslData?.vulnerabilities ? '⚠️' : '✓'}
                            </div>
                        </div>
                          `;
                        })()}
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Cookie-Compliance</div>
                        <div class="metric-value ${cookieScore >= 70 ? 'good' : 'warning'}">
                            ${cookieScore >= 70 ? 'TTDSG-konform' : 'Nachbesserung nötig'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Cookie-Management (TTDSG) <span style="font-size: 11px; color: #6b7280;">(Rechtskonformes Einholen und Verwalten von Cookie-Einwilligungen nach deutschem TTDSG, z. B. über Consent-Banner mit Auswahlmöglichkeit)</span></span>
                                <button class="percentage-btn">${cookieScore}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${cookieScore < 60 ? '0-60' : cookieScore < 80 ? '60-80' : '80-100'}" style="width: ${cookieScore}%"></div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> Cookie-Banner, Einwilligungsmanagement, Cookie-Kategorisierung, Granularität, Opt-out-Möglichkeiten
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Cookie-Anzahl</div>
                        ${(() => {
                          const cookieCount = privacyData?.cookieCount || 0;
                          const cookies = privacyData?.cookies || [];
                          const necessaryCookies = cookies.filter((c: any) => c.category === 'strictly-necessary').length;
                          const optionalCookies = cookieCount - necessaryCookies;
                          const cookieRatio = cookieCount > 0 ? Math.round((necessaryCookies / cookieCount) * 100) : 0;
                          
                          return `
                        <div class="metric-value ${cookieCount <= 5 ? 'good' : cookieCount <= 10 ? 'warning' : 'danger'}">
                            ${cookieCount === 0 ? 'Keine Cookies erkannt' : `Gesamt: ${cookieCount} (${necessaryCookies} notwendig, ${optionalCookies} optional)`}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Cookie-Verhältnis ${cookieCount === 0 ? '(Manuelle Eingabe erforderlich)' : ''}</span>
                                <button class="percentage-btn">${cookieRatio}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${cookieRatio < 50 ? '0-60' : cookieRatio < 80 ? '60-80' : '80-100'}" style="width: ${cookieRatio}%"></div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> Notwendige vs. optionale Cookies, Analytics-Cookies, Marketing-Cookies, Functional-Cookies
                            </div>
                        </div>
                          `;
                        })()}
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Technische Sicherheit</div>
                        ${(() => {
                          const securityHeaders = privacyData?.realApiData?.securityHeaders;
                          const hasRealData = privacyData?.realApiData?.checkedWithRealAPIs;
                          
                          let securityScore = dataPrivacyScore;
                          if (securityHeaders) {
                            const headers = securityHeaders.headers || {};
                            const presentHeaders = Object.values(headers).filter((h: any) => h.present).length;
                            securityScore = Math.round((presentHeaders / 5) * 100);
                          }
                          
                          const csp = securityHeaders?.headers?.['Content-Security-Policy']?.present;
                          const xFrame = securityHeaders?.headers?.['X-Frame-Options']?.present;
                          const xContent = securityHeaders?.headers?.['X-Content-Type-Options']?.present;
                          const hsts = securityHeaders?.headers?.['Strict-Transport-Security']?.present;
                          const referrer = securityHeaders?.headers?.['Referrer-Policy']?.present;
                          
                          return `
                        <div class="metric-value ${securityScore >= 80 ? 'excellent' : securityScore >= 60 ? 'good' : 'warning'}">
                            ${securityScore >= 80 ? 'Vollständig umgesetzt' : securityScore >= 60 ? 'Grundlegend vorhanden' : 'Verbesserungsbedarf'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Sicherheitsmaßnahmen ${hasRealData ? '✓ <strong style="color: #10b981;">Echte Headerprüfung</strong>' : ''}</span>
                                <button class="percentage-btn">${securityScore}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${securityScore < 60 ? '0-60' : securityScore < 80 ? '60-80' : '80-100'}" style="width: ${securityScore}%"></div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> CSP ${csp ? '✓' : '✗'}, X-Frame-Options ${xFrame ? '✓' : '✗'}, X-Content-Type ${xContent ? '✓' : '✗'}, HSTS ${hsts ? '✓' : '✗'}, Referrer-Policy ${referrer ? '✓' : '✗'}
                            </div>
                        </div>
                          `;
                        })()}
                    </div>
                </div>
                
                ${dataPrivacyScore < 90 ? `
                <div class="recommendations">
                    <h4>Empfehlungen zur technischen Datenschutz-Verbesserung:</h4>
                    <ul>
                        <li>SSL-Konfiguration und Sicherheitsheader optimieren</li>
                        ${(() => {
                          const hasCookieViolations = activeViolations.some(v => v.cookieRelated);
                          return hasCookieViolations ? '<li>Implementierung eines TTDSG-konformen Cookie-Banners</li>' : '';
                        })()}
                        <li>Cookie-Policy erstellen und verlinken</li>
                        <li>Technische Sicherheitsmaßnahmen verstärken</li>
                        <li>Regelmäßige Sicherheitsupdates durchführen</li>
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};
