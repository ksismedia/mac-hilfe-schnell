
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
                <button class="percentage-btn score-big" data-score="${hourlyRateScore < 60 ? '0-60' : hourlyRateScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${hourlyRateScore}%</button>
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

export const generateDataPrivacySection = (dataPrivacyScore: number = 75) => `
        <!-- Datenschutz-Analyse -->
        <div class="section">
            <div class="section-header collapsible" onclick="toggleSection('datenschutz-content')" style="cursor: pointer; display: flex; align-items: center; gap: 15px;">
                <span>▶ Datenschutz & DSGVO-Compliance</span>
                <div class="header-score-circle ${dataPrivacyScore >= 80 ? 'yellow' : dataPrivacyScore >= 60 ? 'green' : 'red'}">${dataPrivacyScore}%</div>
            </div>
            <div id="datenschutz-content" class="section-content" style="display: none;">
                ${dataPrivacyScore < 90 ? `
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
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">DSGVO-Bewertung</div>
                        <div class="metric-value ${dataPrivacyScore >= 80 ? 'excellent' : dataPrivacyScore >= 60 ? 'good' : dataPrivacyScore >= 40 ? 'warning' : 'danger'}">${dataPrivacyScore > 0 ? `${dataPrivacyScore}/100 Punkte` : '—/100 Punkte'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Rechtskonformität</span>
                                <button class="percentage-btn">${dataPrivacyScore > 0 ? `${dataPrivacyScore}%` : '—'}</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${dataPrivacyScore < 60 ? '0-60' : dataPrivacyScore < 80 ? '60-80' : '80-100'}" style="width: ${dataPrivacyScore}%; background-color: ${dataPrivacyScore >= 90 ? '#22c55e' : '#FF0000'} !important;"></div>
                            </div>
                        </div>
                    </div>
                    
                    ${dataPrivacyScore < 90 ? `
                      <div class="metric-item" style="grid-column: 1 / -1;">
                        <h4 style="color: #dc2626; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                          🚨 Identifizierte DSGVO-Verstöße
                        </h4>
                        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                          <div style="display: grid; gap: 15px;">
                            <div style="border-left: 4px solid #dc2626; padding-left: 15px; background: white; border-radius: 6px; padding: 12px;">
                              <strong style="color: #dc2626; display: block; margin-bottom: 5px;">🔴 Kritisch: Fehlende Einwilligung</strong>
                              <p style="margin: 0; color: #7f1d1d; font-size: 14px;">Tracking-Cookies werden ohne explizite Einwilligung gesetzt</p>
                              <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 12px;"><strong>Rechtsgrundlage:</strong> Art. 6 DSGVO</p>
                            </div>
                            <div style="border-left: 4px solid #d97706; padding-left: 15px; background: white; border-radius: 6px; padding: 12px;">
                              <strong style="color: #d97706; display: block; margin-bottom: 5px;">🟡 Wichtig: Unvollständige Datenschutzerklärung</strong>
                              <p style="margin: 0; color: #92400e; font-size: 14px;">Informationspflichten nicht vollständig erfüllt</p>
                              <p style="margin: 5px 0 0 0; color: #a16207; font-size: 12px;"><strong>Rechtsgrundlage:</strong> Art. 13/14 DSGVO</p>
                            </div>
                            <div style="border-left: 4px solid #dc2626; padding-left: 15px; background: white; border-radius: 6px; padding: 12px;">
                              <strong style="color: #dc2626; display: block; margin-bottom: 5px;">🔴 Kritisch: Drittlandtransfer ohne Schutzmaßnahmen</strong>
                              <p style="margin: 0; color: #7f1d1d; font-size: 14px;">Datenübertragung ohne angemessene Schutzmaßnahmen</p>
                              <p style="margin: 5px 0 0 0; color: #991b1b; font-size: 12px;"><strong>Rechtsgrundlage:</strong> Art. 44-49 DSGVO</p>
                            </div>
                          </div>
                          <div style="margin-top: 20px; padding: 15px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px;">
                            <strong style="color: #7f1d1d; display: block; margin-bottom: 8px;">💰 Bußgeldrisiko</strong>
                            <p style="margin: 0; color: #7f1d1d; font-size: 14px;">
                              Bei den identifizierten Verstößen drohen Bußgelder bis zu <strong>20 Millionen Euro</strong> oder <strong>4% des Jahresumsatzes</strong>.
                            </p>
                          </div>
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
                    
                    <div class="metric-item">
                        <div class="metric-title">Cookie-Compliance</div>
                        <div class="metric-value ${dataPrivacyScore >= 70 ? 'good' : 'warning'}">
                            ${dataPrivacyScore >= 70 ? 'Konform' : 'Nachbesserung nötig'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Cookie-Banner & Einstellungen</span>
                                <button class="percentage-btn">${Math.min(100, dataPrivacyScore + 10)}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${Math.min(100, dataPrivacyScore + 10) < 60 ? '0-60' : Math.min(100, dataPrivacyScore + 10) < 80 ? '60-80' : '80-100'}" style="width: ${Math.min(100, dataPrivacyScore + 10)}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">SSL/HTTPS</div>
                        <div class="metric-value excellent">Vollständig verschlüsselt</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Datensicherheit</span>
                                <button class="percentage-btn">100%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="80-100" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Abmahn-Risiko</div>
                        <div class="metric-value ${dataPrivacyScore >= 80 ? 'excellent' : dataPrivacyScore >= 60 ? 'good' : dataPrivacyScore >= 40 ? 'warning' : 'danger'}">
                            ${dataPrivacyScore >= 80 ? 'Sehr niedrig' : dataPrivacyScore >= 60 ? 'Niedrig' : dataPrivacyScore >= 40 ? 'Mittel' : 'Hoch'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Rechtssicherheit</span>
                                <button class="percentage-btn">${dataPrivacyScore}%</button>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${dataPrivacyScore < 60 ? '0-60' : dataPrivacyScore < 80 ? '60-80' : '80-100'}" style="width: ${dataPrivacyScore}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${dataPrivacyScore < 90 ? `
                <div class="recommendations">
                    <h4>Empfehlungen zur Datenschutz-Verbesserung:</h4>
                    <ul>
                        <li>Überprüfung und Anpassung der Datenschutzerklärung</li>
                        <li>Implementierung eines DSGVO-konformen Cookie-Banners</li>
                        <li>Prüfung der Datenverarbeitungsverträge mit Dienstleistern</li>
                        <li>Dokumentation der Verarbeitungstätigkeiten</li>
                        <li>Sicherstellung der Betroffenenrechte</li>
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
`;
