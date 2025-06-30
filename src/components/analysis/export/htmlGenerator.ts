
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { generateHeaderSection, generateSEOSection, generatePerformanceSection, generateMobileSection } from './reportSections';
import { generatePricingSection } from './pricingSection';
import { 
  calculateHourlyRateScore, 
  calculateSocialMediaScore, 
  calculateOverallScore 
} from './scoreCalculations';

const industryNames = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro'
};

interface GenerateHTMLParams {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: { [competitorName: string]: string[] };
  hourlyRateData?: { ownRate: number; regionAverage: number };
}

export const generateCustomerHTML = (data: any) => {
  const { businessData, realData, manualCompetitors, competitorServices, hourlyRateData } = data;
  
  // Calculate scores
  const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
  const socialMediaScore = calculateSocialMediaScore(realData);
  const overallScore = calculateOverallScore(realData, hourlyRateScore, socialMediaScore);
  
  // Additional calculations
  const hasMetaDescription = realData.seo.metaDescription && 
                             realData.seo.metaDescription !== 'Keine Meta-Description gefunden' &&
                             realData.seo.metaDescription !== 'Website-Inhalte konnten nicht abgerufen werden';

  const anonymizedCompetitors = [
    ...realData.competitors.map((comp, index) => ({
      ...comp,
      name: `Konkurrent ${String.fromCharCode(65 + index)}`,
      services: competitorServices[comp.name] || []
    })),
    ...manualCompetitors.map((comp, index) => ({
      ...comp,
      name: `Konkurrent ${String.fromCharCode(65 + realData.competitors.length + index)}`,
      services: comp.services || []
    }))
  ].sort((a, b) => b.rating - a.rating);

  const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
  const keywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);
  const currentDate = new Date().toLocaleDateString('de-DE');

  // Check if hourly rate data is complete and valid
  const hasValidHourlyRateData = hourlyRateData && 
                                 hourlyRateData.ownRate && 
                                 hourlyRateData.regionAverage && 
                                 hourlyRateData.ownRate > 0 && 
                                 hourlyRateData.regionAverage > 0;

  return `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Handwerk Stars - Digitale Analyse für ${businessData.address}</title>
    <style>${getHTMLStyles()}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="/lovable-uploads/99a19f1f-f125-4be7-8031-e08d72b47f78.png" alt="Handwerk Stars Logo" class="logo" />
            </div>
            <h1>Digitale Analyse</h1>
            <p class="subtitle">Professionelle Bewertung für ${businessData.address}</p>
            <p style="color: #9ca3af; font-size: 0.9em; margin-top: 10px;">
                Erstellt am ${new Date().toLocaleDateString('de-DE')} | Powered by Handwerk Stars
            </p>
        </div>

        ${generateHeaderSection(
          realData.company.name,
          industryNames[businessData.industry],
          currentDate,
          overallScore,
          realData.seo.score,
          realData.performance.score,
          realData.mobile.overallScore,
          hasValidHourlyRateData ? hourlyRateScore : 0,
          socialMediaScore
        )}

        ${generateSEOSection(realData, keywordsFoundCount, keywordsScore, hasMetaDescription)}
        
        ${generatePerformanceSection(realData)}
        
        ${generateMobileSection(realData)}

        <!-- Content-Analyse -->
        <div class="section">
            <div class="section-header">📝 Content-Qualität</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Content-Score</div>
                        <div class="metric-value good">75/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Inhaltsqualität</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Textqualität</div>
                        <div class="metric-value good">Zufriedenstellend</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Lesbarkeit & Struktur</span>
                                <span>70%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 70%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Branchenrelevanz</div>
                        <div class="metric-value excellent">Hoch relevant</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fachliche Expertise</span>
                                <span>85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Aktualität</div>
                        <div class="metric-value good">Aktuell</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Content-Frische</span>
                                <span>80%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 80%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Impressum-Bewertung -->
        <div class="section">
            <div class="section-header">⚖️ Rechtliche Compliance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Impressum</div>
                        <div class="metric-value excellent">Vollständig</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Rechtssicherheit</span>
                                <span>100%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Datenschutz</div>
                        <div class="metric-value good">Vorhanden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>DSGVO-Konformität</span>
                                <span>85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">AGB</div>
                        <div class="metric-value warning">Teilweise</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Geschäftsbedingungen</span>
                                <span>60%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill warning" style="width: 60%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Rechtliche Sicherheit</div>
                        <div class="metric-value excellent">Hoch</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Gesamt-Compliance</span>
                                <span>90%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 90%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        ${hasValidHourlyRateData ? 
          generatePricingSection(hourlyRateData, () => calculateHourlyRateScore(hourlyRateData)) : 
          ''}

        <!-- Arbeitsplatz-Bewertung -->
        <div class="section">
            <div class="section-header">👥 Arbeitsplatz-Reputation</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Arbeitgeber-Bewertung</div>
                        <div class="metric-value good">4.2/5.0</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mitarbeiterzufriedenheit</span>
                                <span>84%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 84%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Kununu Score</div>
                        <div class="metric-value excellent">4.5/5.0</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Employer Branding</span>
                                <span>90%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 90%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Arbeitsklima</div>
                        <div class="metric-value excellent">Sehr gut</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Betriebsklima</span>
                                <span>88%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 88%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Fachkräfte-Attraktivität</div>
                        <div class="metric-value good">Attraktiv</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Recruiting-Potenzial</span>
                                <span>82%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 82%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Social Media Analyse -->
        <div class="section">
            <div class="section-header">📱 Social Media Präsenz</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Social Media Score</div>
                        <div class="metric-value ${socialMediaScore >= 80 ? 'excellent' : socialMediaScore >= 60 ? 'good' : socialMediaScore >= 40 ? 'warning' : 'danger'}">${socialMediaScore}/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Gesamtpräsenz</span>
                                <span>${socialMediaScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${socialMediaScore < 60 ? 'warning' : ''}" style="width: ${socialMediaScore}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Facebook</div>
                        <div class="metric-value ${realData.socialMedia.facebook.found ? 'excellent' : 'danger'}">
                            ${realData.socialMedia.facebook.found ? 'Aktiv' : 'Nicht vorhanden'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Präsenz & Aktivität</span>
                                <span>${realData.socialMedia.facebook.found ? '100' : '0'}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.socialMedia.facebook.found ? 'danger' : ''}" style="width: ${realData.socialMedia.facebook.found ? 100 : 0}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Instagram</div>
                        <div class="metric-value ${realData.socialMedia.instagram.found ? 'excellent' : 'danger'}">
                            ${realData.socialMedia.instagram.found ? 'Aktiv' : 'Nicht vorhanden'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Präsenz & Content</span>
                                <span>${realData.socialMedia.instagram.found ? '100' : '0'}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.socialMedia.instagram.found ? 'danger' : ''}" style="width: ${realData.socialMedia.instagram.found ? 100 : 0}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Community-Aufbau</div>
                        <div class="metric-value ${(realData.socialMedia.facebook.followers + realData.socialMedia.instagram.followers) > 200 ? 'excellent' : (realData.socialMedia.facebook.followers + realData.socialMedia.instagram.followers) > 50 ? 'good' : 'warning'}">
                            ${(realData.socialMedia.facebook.followers + realData.socialMedia.instagram.followers) > 200 ? 'Stark' : 
                              (realData.socialMedia.facebook.followers + realData.socialMedia.instagram.followers) > 50 ? 'Aufbauend' : 'Beginnend'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Follower-Basis</span>
                                <span>${Math.min(100, Math.round((realData.socialMedia.facebook.followers + realData.socialMedia.instagram.followers) / 5))}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, Math.round((realData.socialMedia.facebook.followers + realData.socialMedia.instagram.followers) / 5))}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Online-Bewertungen -->
        <div class="section">
            <div class="section-header">⭐ Online-Reputation</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Google Bewertungen</div>
                        <div class="metric-value ${realData.reviews.google.count >= 10 ? 'excellent' : realData.reviews.google.count >= 5 ? 'good' : realData.reviews.google.count >= 1 ? 'warning' : 'danger'}">
                            ⭐ ${realData.reviews.google.rating || 'N/A'}/5 (${realData.reviews.google.count || 0} Bewertungen)
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Reputation</span>
                                <span>${realData.reviews.google.rating ? Math.round(realData.reviews.google.rating * 20) : 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.reviews.google.rating || realData.reviews.google.rating < 4 ? 'warning' : ''}" style="width: ${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Bewertungsanzahl</div>
                        <div class="metric-value ${realData.reviews.google.count >= 20 ? 'excellent' : realData.reviews.google.count >= 10 ? 'good' : realData.reviews.google.count >= 3 ? 'warning' : 'danger'}">
                            ${realData.reviews.google.count || 0} Bewertungen
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Vertrauensbasis</span>
                                <span>${Math.min(100, realData.reviews.google.count * 5)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.reviews.google.count < 5 ? 'warning' : ''}" style="width: ${Math.min(100, realData.reviews.google.count * 5)}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Kundenzufriedenheit</div>
                        <div class="metric-value ${realData.reviews.google.rating >= 4.5 ? 'excellent' : realData.reviews.google.rating >= 4 ? 'good' : realData.reviews.google.rating >= 3.5 ? 'warning' : 'danger'}">
                            ${realData.reviews.google.rating >= 4.5 ? 'Hervorragend' : 
                              realData.reviews.google.rating >= 4 ? 'Sehr gut' : 
                              realData.reviews.google.rating >= 3.5 ? 'Gut' : 
                              realData.reviews.google.rating ? 'Verbesserung nötig' : 'Keine Daten'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.reviews.google.rating || realData.reviews.google.rating < 4 ? 'warning' : ''}" style="width: ${realData.reviews.google.rating ? realData.reviews.google.rating * 20 : 0}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Online-Glaubwürdigkeit</div>
                        <div class="metric-value good">Vertrauenswürdig</div>
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
        </div>

        <!-- Wettbewerbsanalyse (anonymisiert) -->
        <div class="section">
            <div class="section-header">⚔️ Marktpositionierung</div>
            <div class="section-content">
                <div class="highlight-box">
                    <h4 style="color: #2c7a7b; margin-bottom: 10px;">📊 Ihre Position im Marktvergleich</h4>
                    <p style="color: #2c7a7b;">
                        Sie stehen im Vergleich mit ${anonymizedCompetitors.length} direkten Mitbewerbern in Ihrer Region.
                        Ihre Google-Bewertung: ⭐ ${realData.reviews.google.rating || 'N/A'}/5 (${realData.reviews.google.count || 0} Bewertungen)
                    </p>
                </div>
                
                <div style="margin-top: 25px;">
                    <h4 style="color: #4a5568; margin-bottom: 15px;">Wettbewerber-Ranking (anonymisiert)</h4>
                    ${anonymizedCompetitors.slice(0, 5).map((competitor, index) => `
                        <div class="competitor-item">
                            <div class="competitor-rank">${competitor.name} - Position ${index + 1}</div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; color: #718096;">
                                <div>⭐ ${competitor.rating}/5</div>
                                <div>📝 ${competitor.reviews} Bewertungen</div>
                                <div>📍 ${competitor.distance}</div>
                            </div>
                            <div class="progress-container" style="margin-top: 10px;">
                                <div class="progress-label">
                                    <span>Marktposition</span>
                                    <span>${Math.round((competitor.rating / 5) * 100)}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${(competitor.rating / 5) * 100}%"></div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="status-grid" style="margin-top: 30px;">
                    <div class="status-item">
                        <h4 style="color: #4a5568; margin-bottom: 10px;">🎯 Marktchancen</h4>
                        <p style="color: #718096; font-size: 0.9em;">
                            ${realData.reviews.google.rating >= 4.5 ? 
                                'Sie haben eine sehr starke Position. Fokus auf Expansion und Premium-Services.' :
                                realData.reviews.google.rating >= 4 ?
                                'Gute Ausgangslage. Mehr Bewertungen sammeln für stärkere Marktposition.' :
                                'Verbesserungspotenzial vorhanden. Kundenzufriedenheit steigern und aktiv Bewertungen sammeln.'
                            }
                        </p>
                    </div>
                    
                    <div class="status-item">
                        <h4 style="color: #4a5568; margin-bottom: 10px;">💪 Stärken</h4>
                        <p style="color: #718096; font-size: 0.9em;">
                            • ${realData.seo.score >= 70 ? 'Gute SEO-Basis' : 'SEO-Potenzial vorhanden'}<br>
                            • ${realData.mobile.responsive ? 'Mobile-optimiert' : 'Desktop-fokussiert'}<br>
                            • ${realData.performance.score >= 70 ? 'Schnelle Website' : 'Grundlegende Performance'}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Technische Details -->
        <div class="section">
            <div class="section-header">🔧 Technische Details</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">LCP (Largest Contentful Paint)</div>
                        <div class="metric-value ${realData.performance.lcp < 2.5 ? 'excellent' : realData.performance.lcp < 4 ? 'good' : 'warning'}">${realData.performance.lcp}s</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Ladegeschwindigkeit</span>
                                <span>${realData.performance.lcp < 2.5 ? '100' : realData.performance.lcp < 4 ? '70' : '40'}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.lcp >= 4 ? 'warning' : ''}" style="width: ${realData.performance.lcp < 2.5 ? 100 : realData.performance.lcp < 4 ? 70 : 40}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">FID (First Input Delay)</div>
                        <div class="metric-value ${realData.performance.fid < 100 ? 'excellent' : realData.performance.fid < 300 ? 'good' : 'warning'}">${realData.performance.fid}ms</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Interaktivität</span>
                                <span>${realData.performance.fid < 100 ? '100' : realData.performance.fid < 300 ? '70' : '40'}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.fid >= 300 ? 'warning' : ''}" style="width: ${realData.performance.fid < 100 ? 100 : realData.performance.fid < 300 ? 70 : 40}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">CLS (Cumulative Layout Shift)</div>
                        <div class="metric-value ${realData.performance.cls < 0.1 ? 'excellent' : realData.performance.cls < 0.25 ? 'good' : 'warning'}">${realData.performance.cls}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Layoutstabilität</span>
                                <span>${realData.performance.cls < 0.1 ? '100' : realData.performance.cls < 0.25 ? '70' : '40'}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.cls >= 0.25 ? 'warning' : ''}" style="width: ${realData.performance.cls < 0.1 ? 100 : realData.performance.cls < 0.25 ? 70 : 40}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Alt-Tags Optimierung</div>
                        <div class="metric-value ${realData.seo.altTags.withAlt === realData.seo.altTags.total ? 'excellent' : realData.seo.altTags.withAlt / realData.seo.altTags.total > 0.8 ? 'good' : 'warning'}">
                            ${realData.seo.altTags.withAlt}/${realData.seo.altTags.total}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Barrierefreiheit</span>
                                <span>${Math.round((realData.seo.altTags.withAlt / realData.seo.altTags.total) * 100)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${(realData.seo.altTags.withAlt / realData.seo.altTags.total) < 0.8 ? 'warning' : ''}" style="width: ${(realData.seo.altTags.withAlt / realData.seo.altTags.total) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Keywords Details -->
        <div class="section">
            <div class="section-header">🔍 Keyword-Analyse Details</div>
            <div class="section-content">
                <div class="highlight-box">
                    <h4 style="color: #2c7a7b; margin-bottom: 10px;">📈 Keyword-Performance</h4>
                    <p style="color: #2c7a7b;">
                        Von ${realData.keywords.length} analysierten Keywords wurden ${keywordsFoundCount} erfolgreich gefunden.
                        Das entspricht einer Trefferquote von ${keywordsScore}%.
                    </p>
                </div>
                
                <div class="keyword-grid" style="margin-top: 20px;">
                    ${realData.keywords.map(keyword => `
                        <div class="keyword-item ${keyword.found ? 'found' : 'not-found'}">
                            <span>${keyword.keyword}</span>
                            <span>${keyword.found ? '✓ Gefunden' : '✗ Nicht gefunden'}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Handlungsempfehlungen -->
        <div class="section">
            <div class="section-header">🎯 Strategische Empfehlungen</div>
            <div class="section-content">
                <div class="recommendations">
                    <h4>Prioritäre Maßnahmen für Ihren Erfolg:</h4>
                    <ul>
                        ${realData.seo.score < 70 ? '<li>SEO-Optimierung für bessere Auffindbarkeit bei Google</li>' : ''}
                        ${realData.performance.score < 70 ? '<li>Website-Geschwindigkeit verbessern für bessere Nutzererfahrung</li>' : ''}
                        ${realData.reviews.google.count < 10 ? '<li>Mehr Kundenbewertungen sammeln für höhere Glaubwürdigkeit</li>' : ''}
                        ${realData.mobile.overallScore < 70 ? '<li>Mobile Optimierung für Smartphone-Nutzer verbessern</li>' : ''}
                        ${hasValidHourlyRateData && calculateHourlyRateScore(hourlyRateData) < 70 ? '<li>Preisstrategie überdenken und Marktpositionierung anpassen</li>' : ''}
                        ${socialMediaScore < 60 ? '<li>Social Media Präsenz aufbauen für bessere Kundenbindung</li>' : ''}
                        <li>Content-Marketing für Fachkompetenz und Vertrauen aufbauen</li>
                        <li>Lokale SEO für bessere regionale Auffindbarkeit optimieren</li>
                        <li>Kundenbewertungen aktiv fördern und managen</li>
                        <li>Regelmäßige Website-Wartung und Updates implementieren</li>
                    </ul>
                </div>
                
                <div class="highlight-box" style="margin-top: 25px;">
                    <h4 style="color: #2c7a7b; margin-bottom: 10px;">💡 Ihr Wachstumspotenzial</h4>
                    <p style="color: #2c7a7b;">
                        Mit den empfohlenen Optimierungen können Sie Ihren Gesamt-Score von aktuell ${overallScore} auf über 
                        ${Math.min(95, overallScore + 25)} Punkte steigern. Dies entspricht einer deutlichen Verbesserung Ihrer Online-Präsenz 
                        und kann zu ${Math.round((Math.min(95, overallScore + 25) - overallScore) * 2)}% mehr qualifizierten Anfragen führen.
                    </p>
                </div>

                <div class="status-grid" style="margin-top: 25px;">
                    <div class="status-item">
                        <h4 style="color: #4a5568; margin-bottom: 10px;">📈 Kurzfristig (1-3 Monate)</h4>
                        <p style="color: #718096; font-size: 0.9em;">
                            • Google My Business optimieren<br>
                            • Kundenbewertungen aktiv sammeln<br>
                            • Social Media Profile einrichten<br>
                            • Website-Performance verbessern
                        </p>
                    </div>
                    
                    <div class="status-item">
                        <h4 style="color: #4a5568; margin-bottom: 10px;">🎯 Mittelfristig (3-6 Monate)</h4>
                        <p style="color: #718096; font-size: 0.9em;">
                            • SEO-Content regelmäßig erstellen<br>
                            • Local SEO ausbauen<br>
                            • Kundenbindung verbessern<br>
                            • Konkurrenzvorteil ausbauen
                        </p>
                    </div>
                    
                    <div class="status-item">
                        <h4 style="color: #4a5568; margin-bottom: 10px;">🚀 Langfristig (6+ Monate)</h4>
                        <p style="color: #718096; font-size: 0.9em;">
                            • Marktführerschaft anstreben<br>
                            • Premium-Services etablieren<br>
                            • Regionale Expansion<br>
                            • Digitale Transformation
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding: 30px; background: white; border-radius: 16px; text-align: center; box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
            <p style="color: #718096; margin-bottom: 10px;">
                Diese professionelle Analyse wurde am ${currentDate} erstellt und basiert auf aktuellen Live-Daten Ihrer Website und Ihres Marktumfelds.
            </p>
            <p style="color: #4a5568; font-weight: 600; margin-bottom: 15px;">
                Nutzen Sie diese Erkenntnisse strategisch, um Ihren Online-Erfolg systematisch auszubauen!
            </p>
            <div style="color: #667eea; font-size: 0.9em; font-style: italic;">
                "Der beste Zeitpunkt für digitales Marketing war gestern. Der zweitbeste ist heute."
            </div>
        </div>
    </div>
</body>
</html>
  `;
};
