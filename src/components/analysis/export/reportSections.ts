
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
                <div class="score-big">${overallScore}</div>
                <div class="score-label">Gesamt-Score</div>
            </div>
            <div class="score-card">
                <div class="score-big">${seoScore}</div>
                <div class="score-label">SEO-Optimierung</div>
            </div>
            <div class="score-card">
                <div class="score-big">${performanceScore}</div>
                <div class="score-label">Website-Performance</div>
            </div>
            <div class="score-card">
                <div class="score-big">${mobileScore}</div>
                <div class="score-label">Mobile Optimierung</div>
            </div>
            <div class="score-card">
                <div class="score-big">${hourlyRateScore}</div>
                <div class="score-label">Preisstrategie</div>
            </div>
            <div class="score-card">
                <div class="score-big">${socialMediaScore}</div>
                <div class="score-label">Social Media</div>
            </div>
            <div class="score-card">
                <div class="score-big">${dataPrivacyScore}</div>
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
                        <div class="metric-value ${realData.seo.score >= 80 ? 'excellent' : realData.seo.score >= 60 ? 'good' : realData.seo.score >= 40 ? 'warning' : 'danger'}">${realData.seo.score}/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Optimierung</span>
                                <span>${realData.seo.score}%</span>
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
                                <span>${keywordsScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${keywordsScore < 60 ? 'warning' : ''}" style="width: ${keywordsScore}%"></div>
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
                                <span>${hasMetaDescription ? '100' : '60'}%</span>
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
                                <span>75%</span>
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
                        <div class="metric-value ${realData.performance.score >= 80 ? 'excellent' : realData.performance.score >= 60 ? 'good' : realData.performance.score >= 40 ? 'warning' : 'danger'}">${realData.performance.score}/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Geschwindigkeit</span>
                                <span>${realData.performance.score}%</span>
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
                                <span>85%</span>
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
                                <span>100%</span>
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
                        <div class="metric-value ${realData.mobile.overallScore >= 80 ? 'excellent' : realData.mobile.overallScore >= 60 ? 'good' : realData.mobile.overallScore >= 40 ? 'warning' : 'danger'}">${realData.mobile.overallScore}/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mobile Nutzerfreundlichkeit</span>
                                <span>${realData.mobile.overallScore}%</span>
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
                                <span>75%</span>
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
            <div class="section-header">🔒 Datenschutz & DSGVO-Compliance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">DSGVO-Compliance</div>
                        <div class="metric-value ${dataPrivacyScore >= 80 ? 'excellent' : dataPrivacyScore >= 60 ? 'good' : dataPrivacyScore >= 40 ? 'warning' : 'danger'}">${dataPrivacyScore}/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Datenschutz-Konformität</span>
                                <span>${dataPrivacyScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${dataPrivacyScore <= 20 ? '0-20' : dataPrivacyScore <= 40 ? '20-40' : dataPrivacyScore <= 60 ? '40-60' : dataPrivacyScore <= 80 ? '60-80' : '80-100'}" style="width: ${dataPrivacyScore}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Cookie-Compliance</div>
                        <div class="metric-value ${dataPrivacyScore >= 70 ? 'good' : 'warning'}">
                            ${dataPrivacyScore >= 70 ? 'Konform' : 'Nachbesserung nötig'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Cookie-Banner & Einstellungen</span>
                                <span>${Math.min(100, dataPrivacyScore + 10)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${Math.min(100, dataPrivacyScore + 10) <= 20 ? '0-20' : Math.min(100, dataPrivacyScore + 10) <= 40 ? '20-40' : Math.min(100, dataPrivacyScore + 10) <= 60 ? '40-60' : Math.min(100, dataPrivacyScore + 10) <= 80 ? '60-80' : '80-100'}" style="width: ${Math.min(100, dataPrivacyScore + 10)}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">SSL/HTTPS</div>
                        <div class="metric-value excellent">Vollständig verschlüsselt</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Datensicherheit</span>
                                <span>100%</span>
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
                                <span>${dataPrivacyScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${dataPrivacyScore <= 20 ? '0-20' : dataPrivacyScore <= 40 ? '20-40' : dataPrivacyScore <= 60 ? '40-60' : dataPrivacyScore <= 80 ? '60-80' : '80-100'}" style="width: ${dataPrivacyScore}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${dataPrivacyScore < 70 ? `
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
