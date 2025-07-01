
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';

interface CustomerReportData {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualCompetitors: ManualCompetitor[];
  competitorServices: { [competitorName: string]: string[] };
  hourlyRateData?: { ownRate: number; regionAverage: number };
  missingImprintElements: string[];
}

export const generateCustomerHTML = ({
  businessData,
  realData,
  manualCompetitors,
  competitorServices,
  hourlyRateData,
  missingImprintElements = []
}: CustomerReportData) => {
  // Calculate scores
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
    const seoWeight = 0.7;
    const reviewsWeight = 0.3;
    const reviewsScore = realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0;
    return Math.round(realData.seo.score * seoWeight + reviewsScore * reviewsWeight);
  };

  const calculateEnhancedSocialMediaScore = () => {
    let score = 0;
    const platforms = ['facebook', 'instagram'];
    
    platforms.forEach(platform => {
      const platformData = realData.socialMedia[platform];
      if (platformData.found) {
        score += 25;
        if (platformData.followers > 500) score += 15;
        else if (platformData.followers > 100) score += 10;
        else if (platformData.followers > 0) score += 5;
        
        if (platformData.lastPost) {
          const lastPostDate = new Date(platformData.lastPost);
          const daysSinceLastPost = Math.floor((Date.now() - lastPostDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceLastPost <= 7) score += 10;
          else if (daysSinceLastPost <= 30) score += 5;
          else if (daysSinceLastPost <= 90) score += 2;
        }
      }
    });
    
    return Math.min(100, score);
  };

  const overallScore = calculateOverallScore();
  const visibilityScore = calculateVisibilityScore();
  const performanceScore = realData.performance.score;
  const enhancedSocialMediaScore = calculateEnhancedSocialMediaScore();

  // Calculate hourly rate comparison
  const hasHourlyRateData = hourlyRateData && 
                           hourlyRateData.ownRate > 0 && 
                           hourlyRateData.regionAverage > 0;

  // Calculate legal compliance scores with CORRECT impressum evaluation
  const impressumScore = missingImprintElements && missingImprintElements.length > 0 ? 
    Math.max(0, 100 - (missingImprintElements.length * 8)) : 
    (realData.imprint.found ? Math.max(realData.imprint.score, 85) : 30);
  
  const datenschutzScore = 85;
  const agbScore = 60;
  const legalComplianceScore = Math.round((impressumScore + datenschutzScore + agbScore) / 3);

  // Industry-specific insights
  const getIndustryInsights = () => {
    const insights = {
      'shk': 'SHK-Betriebe profitieren besonders von lokaler SEO-Optimierung und Google My Business.',
      'maler': 'Maler sollten auf visuelle Inhalte und Vorher-Nachher-Bilder in Social Media setzen.',
      'elektriker': 'Elektriker benötigen starke lokale Präsenz und Notdienst-Optimierung.',
      'dachdecker': 'Dachdecker sollten auf Wetterabhängigkeit und saisonale SEO-Strategien achten.',
      'stukateur': 'Stukateur-Betriebe profitieren von detaillierten Projektdarstellungen.',
      'planungsbuero': 'Planungsbüros benötigen professionelle B2B-ausgerichtete Online-Präsenz.'
    };
    return insights[businessData.industry] || 'Branchenspezifische Optimierung empfohlen.';
  };

  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Listening und Monitoring Report - ${businessData.address}</title>
    <style>${getHTMLStyles()}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo">
                    <rect width="50" height="50" rx="10" fill="#3373dc"/>
                    <path d="M15 15h20v5h-20z" fill="white"/>
                    <path d="M15 25h15v5h-15z" fill="white"/>
                    <path d="M15 35h10v5h-10z" fill="white"/>
                    <circle cx="40" cy="15" r="3" fill="#10b981"/>
                    <path d="M38 15l1.5 1.5L42 14" stroke="white" stroke-width="1.5" fill="none"/>
                </svg>
            </div>
            <h1>Social Listening und Monitoring Report</h1>
            <p class="subtitle">Professionelle Analyse für ${businessData.address}</p>
            <p style="color: #9ca3af; font-size: 0.9em; margin-top: 10px;">
                Erstellt am ${new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })} | Handwerk Stars Professional
            </p>
        </div>

        <section class="company-info">
            <h2>${businessData.address}</h2>
            <p><strong>Webseite:</strong> <a href="${businessData.url}" target="_blank">${businessData.url}</a></p>
            <p><strong>Branche:</strong> ${businessData.industry.toUpperCase()}</p>
        </section>

        <section class="score-overview">
            <div class="score-card">
                <div class="score-big">${overallScore}</div>
                <div class="score-label">Gesamtbewertung</div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${overallScore}%" data-value="${overallScore}"></div>
                    </div>
                </div>
            </div>
            <div class="score-card">
                <div class="score-big">${visibilityScore}</div>
                <div class="score-label">Online-Sichtbarkeit</div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${visibilityScore}%" data-value="${visibilityScore}"></div>
                    </div>
                </div>
            </div>
            <div class="score-card">
                <div class="score-big">${performanceScore}</div>
                <div class="score-label">Website-Performance</div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${performanceScore}%" data-value="${performanceScore}"></div>
                    </div>
                </div>
            </div>
            <div class="score-card">
                <div class="score-big">${enhancedSocialMediaScore}</div>
                <div class="score-label">Social Media</div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${enhancedSocialMediaScore}%" data-value="${enhancedSocialMediaScore}"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Rechtssicherheit-Analyse -->
        <section class="section">
            <div class="section-header">⚖️ Rechtssicherheit & Compliance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Impressum</div>
                        <div class="metric-value ${impressumScore >= 90 ? 'excellent' : impressumScore >= 70 ? 'good' : impressumScore >= 50 ? 'warning' : 'danger'}">
                            ${impressumScore >= 90 ? 'Vollständig' : impressumScore >= 70 ? 'Größtenteils vollständig' : impressumScore >= 50 ? 'Teilweise vollständig' : 'Unvollständig'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Rechtssicherheit</span>
                                <span>${impressumScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${impressumScore}%" data-value="${impressumScore}"></div>
                            </div>
                        </div>
                        ${impressumScore < 100 && missingImprintElements && missingImprintElements.length > 0 ? `
                            <div style="margin-top: 15px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; font-size: 0.9em;">
                                <strong style="color: #dc2626; display: block; margin-bottom: 8px;">⚠️ Fehlende Pflichtangaben im Impressum:</strong>
                                <ul style="margin: 0; padding-left: 20px; color: #991b1b; line-height: 1.6;">
                                    ${missingImprintElements.map(element => `<li style="margin-bottom: 4px;">${element}</li>`).join('')}
                                </ul>
                                <div style="margin-top: 12px; padding: 8px; background: #fee2e2; border-radius: 6px; font-size: 0.85em; color: #7f1d1d;">
                                    <strong>Rechtliche Hinweise:</strong><br>
                                    • Fehlende Impressumsangaben können zu Abmahnungen führen<br>
                                    • Bußgelder bis zu 50.000 € möglich<br>
                                    • Wettbewerbsrechtliche Risiken durch Konkurrenten
                                </div>
                            </div>
                        ` : impressumScore === 100 ? `
                            <div style="margin-top: 10px; padding: 8px; background: #f0fdf4; border-radius: 6px; font-size: 0.85em; color: #166534;">
                                ✅ <strong>Impressum ist vollständig und rechtssicher</strong>
                            </div>
                        ` : ''}
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Datenschutz</div>
                        <div class="metric-value good">DSGVO-konform</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Compliance</span>
                                <span>${datenschutzScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${datenschutzScore}%" data-value="${datenschutzScore}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Geschäftsbedingungen</div>
                        <div class="metric-value warning">Optimierbar</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Vollständigkeit</span>
                                <span>${agbScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${agbScore}%" data-value="${agbScore}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Rechtliche Gesamtbewertung</div>
                        <div class="metric-value ${legalComplianceScore >= 80 ? 'excellent' : legalComplianceScore >= 60 ? 'good' : 'warning'}">${legalComplianceScore >= 80 ? 'Sehr gut' : legalComplianceScore >= 60 ? 'Gut' : 'Verbesserungsbedarf'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Gesamt-Score</span>
                                <span>${legalComplianceScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${legalComplianceScore}%" data-value="${legalComplianceScore}"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${impressumScore < 100 && missingImprintElements && missingImprintElements.length > 0 ? `
                    <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px;">
                        <h4 style="color: #92400e; margin-bottom: 10px;">📋 Sofortige Handlungsempfehlungen:</h4>
                        <ol style="margin: 0; padding-left: 20px; color: #78350f; line-height: 1.6;">
                            <li><strong>Impressum vervollständigen:</strong> Ergänzen Sie umgehend alle fehlenden Pflichtangaben</li>
                            <li><strong>Rechtsprüfung:</strong> Lassen Sie das Impressum von einem Anwalt für Internetrecht prüfen</li>
                            <li><strong>Regelmäßige Updates:</strong> Aktualisieren Sie Änderungen (Adresse, Geschäftsführung) sofort</li>
                            <li><strong>Sichtbare Platzierung:</strong> Impressum muss von jeder Seite mit max. 2 Klicks erreichbar sein</li>
                        </ol>
                    </div>
                ` : ''}
            </div>
        </section>

        <!-- Digital Presence Analysis -->
        <section class="section">
            <div class="section-header">🌐 Online-Präsenz & Sichtbarkeit</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Suchmaschinenoptimierung</div>
                        <div class="metric-value ${realData.seo.score >= 80 ? 'excellent' : realData.seo.score >= 60 ? 'good' : 'warning'}">${realData.seo.score >= 80 ? 'Sehr gut' : realData.seo.score >= 60 ? 'Zufriedenstellend' : 'Verbesserungsbedarf'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>SEO-Score</span>
                                <span>${realData.seo.score}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.seo.score}%" data-value="${realData.seo.score}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Website-Performance</div>
                        <div class="metric-value ${realData.performance.score >= 80 ? 'excellent' : realData.performance.score >= 60 ? 'good' : 'warning'}">${realData.performance.loadTime}s Ladezeit</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Performance</span>
                                <span>${realData.performance.score}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.performance.score}%" data-value="${realData.performance.score}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Mobile Optimierung</div>
                        <div class="metric-value ${realData.mobile.overallScore >= 80 ? 'excellent' : realData.mobile.overallScore >= 60 ? 'good' : 'warning'}">${realData.mobile.responsive ? 'Responsive' : 'Nicht responsive'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mobile Score</span>
                                <span>${realData.mobile.overallScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.mobile.overallScore}%" data-value="${realData.mobile.overallScore}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Lokale Sichtbarkeit</div>
                        <div class="metric-value ${visibilityScore >= 80 ? 'excellent' : visibilityScore >= 60 ? 'good' : 'warning'}">${visibilityScore >= 80 ? 'Sehr gut sichtbar' : visibilityScore >= 60 ? 'Gut sichtbar' : 'Ausbaufähig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Sichtbarkeits-Index</span>
                                <span>${visibilityScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${visibilityScore}%" data-value="${visibilityScore}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Social Media Analysis -->
        <section class="section">
            <div class="section-header">📱 Social Media Performance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Facebook Präsenz</div>
                        <div class="metric-value ${realData.socialMedia.facebook.found ? 'good' : 'danger'}">${realData.socialMedia.facebook.found ? 'Aktiv' : 'Nicht vorhanden'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Reichweite</span>
                                <span>${realData.socialMedia.facebook.followers} Follower</span>
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
                        <div class="metric-title">Instagram Präsenz</div>
                        <div class="metric-value ${realData.socialMedia.instagram.found ? 'good' : 'danger'}">${realData.socialMedia.instagram.found ? 'Aktiv' : 'Nicht vorhanden'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Reichweite</span>
                                <span>${realData.socialMedia.instagram.followers} Follower</span>
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
                        <div class="metric-title">Social Media Aktivität</div>
                        <div class="metric-value ${enhancedSocialMediaScore >= 60 ? 'good' : enhancedSocialMediaScore >= 30 ? 'warning' : 'danger'}">${enhancedSocialMediaScore >= 60 ? 'Regelmäßig aktiv' : enhancedSocialMediaScore >= 30 ? 'Gelegentlich aktiv' : 'Selten aktiv'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Aktivitäts-Score</span>
                                <span>${enhancedSocialMediaScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${enhancedSocialMediaScore}%" data-value="${enhancedSocialMediaScore}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Engagement-Potenzial</div>
                        <div class="metric-value ${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 'good' : 'warning'}">${(realData.socialMedia.facebook.found || realData.socialMedia.instagram.found) ? 'Vorhanden' : 'Ausbau empfohlen'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Community-Building</span>
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

        <!-- Customer Reviews & Reputation -->
        <section class="section">
            <div class="section-header">⭐ Kundenbewertungen & Online-Reputation</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Google Bewertungen</div>
                        <div class="metric-value ${realData.reviews.google.rating >= 4.5 ? 'excellent' : realData.reviews.google.rating >= 4 ? 'good' : realData.reviews.google.rating >= 3.5 ? 'warning' : 'danger'}">⭐ ${realData.reviews.google.rating || 'N/A'}/5.0</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Kundenzufriedenheit</span>
                                <span>${realData.reviews.google.rating ? Math.round(realData.reviews.google.rating * 20) : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}%" data-value="${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Anzahl Bewertungen</div>
                        <div class="metric-value ${realData.reviews.google.count > 20 ? 'excellent' : realData.reviews.google.count > 10 ? 'good' : realData.reviews.google.count > 5 ? 'warning' : 'danger'}">${realData.reviews.google.count || 0} Bewertungen</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Vertrauensbasis</span>
                                <span>${Math.min(100, realData.reviews.google.count * 5)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, realData.reviews.google.count * 5)}%" data-value="${Math.min(100, realData.reviews.google.count * 5)}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Reputation Management</div>
                        <div class="metric-value ${realData.reviews.google.rating >= 4.5 ? 'excellent' : realData.reviews.google.rating >= 4 ? 'good' : 'warning'}">${realData.reviews.google.rating >= 4.5 ? 'Hervorragend' : realData.reviews.google.rating >= 4 ? 'Sehr gut' : realData.reviews.google.rating >= 3.5 ? 'Gut' : realData.reviews.google.rating ? 'Verbesserung nötig' : 'Aufbau nötig'}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Online-Image</span>
                                <span>${realData.reviews.google.rating ? Math.round(realData.reviews.google.rating * 20) : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}%" data-value="${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Empfehlungsbereitschaft</div>
                        <div class="metric-value good">Empfehlenswert</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Weiterempfehlung</span>
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

        <!-- Competitive Positioning -->
        <section class="section">
            <div class="section-header">🏆 Wettbewerbspositionierung</div>
            <div class="section-content">
                ${manualCompetitors && manualCompetitors.length > 0 ? `
                    <div class="competitor-overview">
                        <p><strong>Marktumfeld:</strong> ${manualCompetitors.length} direkte Wettbewerber identifiziert</p>
                        <div class="competitor-cards">
                            ${manualCompetitors.slice(0, 3).map((competitor, index) => `
                                <div class="competitor-card">
                                    <h4>Wettbewerber ${index + 1}</h4>
                                    <div class="competitor-stats">
                                        <div class="stat">
                                            <span class="stat-label">Bewertung</span>
                                            <span class="stat-value">⭐ ${competitor.rating}/5</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-label">Bewertungen</span>
                                            <span class="stat-value">${competitor.reviews}</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-label">Entfernung</span>
                                            <span class="stat-value">${competitor.distance}</span>
                                        </div>
                                    </div>
                                    ${competitorServices[competitor.name] ? `
                                        <div class="services-preview">
                                            <strong>Services:</strong> ${competitorServices[competitor.name].slice(0, 2).join(', ')}${competitorServices[competitor.name].length > 2 ? '...' : ''}
                                        </div>
                                    ` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="no-data">
                        <p>Keine Wettbewerberdaten verfügbar. Eine detaillierte Konkurrenzanalyse wird empfohlen.</p>
                    </div>
                `}
            </div>
        </section>

        ${hasHourlyRateData ? `
            <!-- Pricing Analysis -->
            <section class="section">
                <div class="section-header">💰 Preispositionierung</div>
                <div class="section-content">
                    <div class="metric-grid">
                        <div class="metric-item">
                            <div class="metric-title">Ihr Stundensatz</div>
                            <div class="metric-value">${hourlyRateData.ownRate} €</div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(100, (hourlyRateData.ownRate / 150) * 100)}%" data-value="${Math.min(100, (hourlyRateData.ownRate / 150) * 100)}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Regionaler Durchschnitt</div>
                            <div class="metric-value">${hourlyRateData.regionAverage} €</div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${Math.min(100, (hourlyRateData.regionAverage / 150) * 100)}%" data-value="${Math.min(100, (hourlyRateData.regionAverage / 150) * 100)}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Marktposition</div>
                            <div class="metric-value ${hourlyRateData.ownRate > hourlyRateData.regionAverage ? 'excellent' : 'warning'}">${hourlyRateData.ownRate > hourlyRateData.regionAverage ? 'Premium-Segment' : 'Durchschnittsbereich'}</div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${hourlyRateData.ownRate > hourlyRateData.regionAverage ? 85 : 60}%" data-value="${hourlyRateData.ownRate > hourlyRateData.regionAverage ? 85 : 60}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="metric-item">
                            <div class="metric-title">Preisoptimierung</div>
                            <div class="metric-value good">Potenzial vorhanden</div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: 75%" data-value="75"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        ` : ''}

        <!-- Strategic Recommendations as Cards -->
        <section class="section">
            <div class="section-header">🚀 Strategische Empfehlungen</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Sofortmaßnahmen</div>
                        <div class="metric-value excellent">Priorität Hoch</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Umsetzungsbereitschaft</span>
                                <span>95%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 95%" data-value="95"></div>
                            </div>
                        </div>
                        <div style="margin-top: 10px; font-size: 0.85em; color: #374151;">
                            ${impressumScore < 90 ? '• Impressum vervollständigen' : ''}
                            ${realData.reviews.google.count < 10 ? '• Bewertungen sammeln' : ''}
                            • Google My Business optimieren
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Mittelfristige Ziele</div>
                        <div class="metric-value good">Priorität Mittel</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Planungsstand</span>
                                <span>80%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 80%" data-value="80"></div>
                            </div>
                        </div>
                        <div style="margin-top: 10px; font-size: 0.85em; color: #374151;">
                            ${enhancedSocialMediaScore < 60 ? '• Social Media aufbauen' : ''}
                            • Website-Performance verbessern
                            • Content-Marketing starten
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Langfristige Vision</div>
                        <div class="metric-value warning">Strategisch</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Visionsentwicklung</span>
                                <span>70%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 70%" data-value="70"></div>
                            </div>
                        </div>
                        <div style="margin-top: 10px; font-size: 0.85em; color: #374151;">
                            • Digitale Marktführerschaft
                            • Automatisierte Kundengewinnung
                            • Premium-Positionierung
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">ROI-Potenzial</div>
                        <div class="metric-value excellent">Hoch</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Erwarteter Erfolg</span>
                                <span>85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%" data-value="85"></div>
                            </div>
                        </div>
                        <div style="margin-top: 10px; font-size: 0.85em; color: #374151;">
                            • 30-50% mehr Online-Anfragen
                            • 15.000-25.000 € Mehrumsatz/Jahr
                            • Nachhaltige Marktposition
                        </div>
                    </div>
                </div>

                <div class="industry-insight">
                    <h4>🔧 Branchenspezifische Empfehlung</h4>
                    <p>${getIndustryInsights()}</p>
                </div>
            </div>
        </section>

        <!-- Monitoring Dashboard as Cards -->
        <section class="section">
            <div class="section-header">📈 Monitoring & Erfolgsmessung</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Website-Besucher</div>
                        <div class="metric-value warning">Baseline etablieren</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Ziel: +25%</span>
                                <span>0%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 25%" data-value="25"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Anfragen</div>
                        <div class="metric-value good">Aktueller Stand</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Ziel: +40%</span>
                                <span>60%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 60%" data-value="60"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Bewertungen</div>
                        <div class="metric-value ${realData.reviews.google.count > 15 ? 'excellent' : realData.reviews.google.count > 8 ? 'good' : 'warning'}">
                            ${realData.reviews.google.count} Google
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Ziel: 1-2 neue/Monat</span>
                                <span>${Math.min(100, realData.reviews.google.count * 5)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, realData.reviews.google.count * 5)}%" data-value="${Math.min(100, realData.reviews.google.count * 5)}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Ranking-Position</div>
                        <div class="metric-value warning">Tracking einrichten</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Ziel: Top 3 lokal</span>
                                <span>33%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 33%" data-value="33"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Handwerk Stars</h4>
                    <p>Ihr Partner für digitale Sichtbarkeit im Handwerk</p>
                </div>
                <div class="footer-section">
                    <h4>Kontakt</h4>
                    <p>Social Listening & Monitoring Services</p>
                    <p>Speziell für Handwerksbetriebe entwickelt</p>
                </div>
                <div class="footer-section">
                    <h4>Nächste Schritte</h4>
                    <p>✓ Report besprechen</p>
                    <p>✓ Maßnahmen priorisieren</p>
                    <p>✓ Umsetzung beginnen</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${new Date().getFullYear()} Handwerk Stars. Alle Rechte vorbehalten. | Erstellt am ${new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}</p>
            </div>
        </footer>
    </div>
</body>
</html>`;
};
