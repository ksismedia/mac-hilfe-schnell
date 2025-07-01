

import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';

interface CustomerReportData {
  businessData: {
    address: string;
    url: string;
    industry: string;
  };
  realData: RealBusinessData;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: { [competitorName: string]: string[] };
  hourlyRateData?: { ownRate: number; regionAverage: number };
  missingImprintElements?: string[];
  manualSocialData?: ManualSocialData | null;
}

export const generateCustomerHTML = ({
  businessData,
  realData,
  manualCompetitors,
  competitorServices,
  hourlyRateData,
  missingImprintElements = [],
  manualSocialData
}: CustomerReportData) => {
  console.log('HTML Generator received missingImprintElements:', missingImprintElements);
  
  // Calculate social media score - KORRIGIERT!
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  console.log('HTML Generator - Social Media Score:', socialMediaScore);
  console.log('HTML Generator - Manual Social Data:', manualSocialData);

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

  // SEO Analysis
  const getSEOAnalysis = () => {
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
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Keyword-Optimierung für bessere Rankings</li>
            <li>Verbesserung der Meta-Beschreibungen</li>
            <li>Aufbau hochwertiger Backlinks</li>
            <li>Content-Optimierung für Suchmaschinen</li>
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

  // Mobile Optimization Analysis
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
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Responsive Design implementieren</li>
            <li>Touch-freundliche Navigation erstellen</li>
            <li>Mobile-First-Ansatz umsetzen</li>
            <li>Ladezeiten für mobile Geräte optimieren</li>
          </ul>
        </div>
      </div>
    `;
  };

  // Competitor Analysis
  const getCompetitorAnalysis = () => {
    if (!manualCompetitors || manualCompetitors.length === 0) {
      return `
        <div class="metric-card warning">
          <h3>👥 Konkurrenzanalyse</h3>
          <p class="text-center" style="color: #d1d5db; font-style: italic; margin: 20px 0;">
            Keine Konkurrenten zum Vergleich erfasst.
          </p>
          <div class="recommendations">
            <h4>Empfohlene Maßnahmen:</h4>
            <ul>
              <li>Konkurrenzanalyse durchführen</li>
              <li>Marktposition bestimmen</li>
              <li>Differenzierungsmerkmale identifizieren</li>
            </ul>
          </div>
        </div>
      `;
    }

    return `
      <div class="metric-card good">
        <h3>👥 Konkurrenzanalyse</h3>
        <div class="competitor-list">
          ${manualCompetitors.map(competitor => `
            <div class="competitor-item">
              <div class="competitor-rank">
                <strong>${competitor.name}</strong>
              </div>
              <p><strong>Bewertung:</strong> ${competitor.rating}/5 (${competitor.reviews} Bewertungen)</p>
              <p><strong>Status:</strong> ${competitor.rating >= 4 ? 'Starker Konkurrent' : competitor.rating >= 3 ? 'Mittlerer Konkurrent' : 'Schwacher Konkurrent'}</p>
            </div>
          `).join('')}
        </div>
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Stärken der Konkurrenz analysieren</li>
            <li>Eigene Alleinstellungsmerkmale entwickeln</li>
            <li>Preispositionierung überprüfen</li>
            <li>Service-Qualität kontinuierlich verbessern</li>
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

    const scoreClass = socialMediaScore >= 80 ? 'green' : socialMediaScore >= 60 ? 'yellow' : socialMediaScore >= 40 ? 'orange' : 'red';
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

  // Generate the HTML
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Social Listening Report - ${realData.company.name}</title>
  <style>
    ${getHTMLStyles()}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Social Listening Report</h1>
      <div class="subtitle">${realData.company.name} - ${businessData.url}</div>
    </div>

    <div class="section">
      <div class="section-header">🎯 Executive Summary</div>
      <div class="section-content">
        <div class="score-overview">
          <div class="score-card">
            <div class="score-big">${realData.seo.score}%</div>
            <div class="score-label">SEO Optimierung</div>
          </div>
          <div class="score-card">
            <div class="score-big">${socialMediaScore}%</div>
            <div class="score-label">Social Media</div>
          </div>
          <div class="score-card">
            <div class="score-big">${realData.performance.score}%</div>
            <div class="score-label">Performance</div>
          </div>
          <div class="score-card">
            <div class="score-big">${realData.mobile.overallScore}%</div>
            <div class="score-label">Mobile</div>
          </div>
          <div class="score-card">
            <div class="score-big">${impressumScore}%</div>
            <div class="score-label">Rechtssicherheit</div>
          </div>
          <div class="score-card">
            <div class="score-big">${realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0}%</div>
            <div class="score-label">Bewertungen</div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">🏢 Unternehmensdaten</div>
      <div class="section-content">
        <div class="company-info">
          <h3>${realData.company.name}</h3>
          <p><strong>Website:</strong> ${businessData.url}</p>
          <p><strong>Adresse:</strong> ${businessData.address}</p>
          <p><strong>Branche:</strong> ${businessData.industry.toUpperCase()}</p>
          <p><strong>Telefon:</strong> ${realData.company.phone || 'Nicht verfügbar'}</p>
          <p><strong>E-Mail:</strong> ${realData.company.email || 'Nicht verfügbar'}</p>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">🔎 SEO Analyse</div>
      <div class="section-content">
        ${getSEOAnalysis()}
      </div>
    </div>

    <div class="section">
      <div class="section-header">🚀 Performance Analyse</div>
      <div class="section-content">
        ${getPerformanceAnalysis()}
      </div>
    </div>

    <div class="section">
      <div class="section-header">📱 Mobile Optimierung</div>
      <div class="section-content">
        ${getMobileOptimizationAnalysis()}
      </div>
    </div>

    <div class="section">
      <div class="section-header">⭐ Google Bewertungen</div>
      <div class="section-content">
        <div class="metric-card ${realData.reviews.google.count > 0 ? 'good' : 'warning'}">
          <h3>Google My Business Bewertungen</h3>
          <div class="score-display">
            <div class="score-circle ${realData.reviews.google.rating >= 4 ? 'green' : realData.reviews.google.rating >= 3 ? 'yellow' : 'red'}">
              ${realData.reviews.google.rating}/5
            </div>
            <div class="score-details">
              <p><strong>Anzahl Bewertungen:</strong> ${realData.reviews.google.count}</p>
              <p><strong>Durchschnitt:</strong> ${realData.reviews.google.rating}/5 Sternen</p>
              <p><strong>Status:</strong> ${realData.reviews.google.rating >= 4 ? 'Sehr gut' : realData.reviews.google.rating >= 3 ? 'Gut' : 'Verbesserung nötig'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-value="${Math.round((realData.reviews.google.rating * 20)/10)*10}" style="width: ${realData.reviews.google.rating * 20}%"></div>
            </div>
          </div>
          <div class="recommendations">
            <h4>Handlungsempfehlungen:</h4>
            <ul>
              <li>Aktiv um Bewertungen bitten</li>
              <li>Auf alle Bewertungen antworten</li>
              <li>Service-Qualität kontinuierlich verbessern</li>
              <li>Google My Business Profil pflegen</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">🎯 Keywords</div>
      <div class="section-content">
        <div class="metric-card good">
          <h3>Keyword-Analyse</h3>
          <div class="score-display">
            <div class="score-circle ${realData.keywords.filter(k => k.found).length / realData.keywords.length >= 0.7 ? 'green' : 'yellow'}">
              ${realData.keywords.filter(k => k.found).length}/${realData.keywords.length}
            </div>
            <div class="score-details">
              <p><strong>Gefunden:</strong> ${realData.keywords.filter(k => k.found).length} von ${realData.keywords.length} Keywords</p>
              <p><strong>Erfolgsquote:</strong> ${Math.round((realData.keywords.filter(k => k.found).length / realData.keywords.length) * 100)}%</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-value="${Math.round(((realData.keywords.filter(k => k.found).length / realData.keywords.length) * 100)/10)*10}" style="width: ${(realData.keywords.filter(k => k.found).length / realData.keywords.length) * 100}%"></div>
            </div>
          </div>
          <div class="keyword-grid">
            ${realData.keywords.map(keyword => `
              <div class="keyword-item ${keyword.found ? 'found' : 'not-found'}">
                <span>${keyword.keyword}</span>
                <span>${keyword.found ? '✅' : '❌'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">📱 Social Media Analyse</div>
      <div class="section-content">
        ${getSocialMediaAnalysis()}
      </div>
    </div>

    <div class="section">
      <div class="section-header">👥 Konkurrenzanalyse</div>
      <div class="section-content">
        ${getCompetitorAnalysis()}
      </div>
    </div>

    ${hourlyRateData ? `
    <div class="section">
      <div class="section-header">💰 Stundensatz-Analyse</div>
      <div class="section-content">
        <div class="metric-card good">
          <h3>Preispositionierung</h3>
          <div class="score-display">
            <div class="score-circle ${hourlyRateData.ownRate >= hourlyRateData.regionAverage * 0.9 && hourlyRateData.ownRate <= hourlyRateData.regionAverage * 1.1 ? 'green' : 'yellow'}">
              ${hourlyRateData.ownRate}€
            </div>
            <div class="score-details">
              <p><strong>Ihr Stundensatz:</strong> ${hourlyRateData.ownRate}€</p>
              <p><strong>Regionaler Durchschnitt:</strong> ${hourlyRateData.regionAverage}€</p>
              <p><strong>Position:</strong> ${hourlyRateData.ownRate > hourlyRateData.regionAverage ? 'Über Durchschnitt' : hourlyRateData.ownRate < hourlyRateData.regionAverage ? 'Unter Durchschnitt' : 'Marktdurchschnitt'}</p>
            </div>
          </div>
          <div class="recommendations">
            <h4>Handlungsempfehlungen:</h4>
            <ul>
              <li>Marktpreise regelmäßig überprüfen</li>
              <li>Wertargumentation stärken</li>
              <li>Zusatzleistungen anbieten</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <div class="section-header">📜 Impressum & Rechtssicherheit</div>
      <div class="section-content">
        <div class="metric-card ${impressumScore >= 70 ? 'good' : 'warning'}">
          <h3>Impressum-Analyse</h3>
          <div class="score-display">
            <div class="score-circle ${impressumScore >= 70 ? 'green' : impressumScore >= 40 ? 'yellow' : 'red'}">${impressumScore}%</div>
            <div class="score-details">
              <p><strong>Vollständigkeit:</strong> ${impressumScore >= 70 ? 'Vollständig' : 'Unvollständig'}</p>
              <p><strong>Fehlende Angaben:</strong> ${missingImprintElements.length}</p>
              <p><strong>Rechtsstatus:</strong> ${impressumScore >= 70 ? 'Konform' : 'Risiko'}</p>
            </div>
          </div>
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" data-value="${Math.round(impressumScore/10)*10}" style="width: ${impressumScore}%"></div>
            </div>
          </div>
          <h4>Fehlende Angaben:</h4>
          ${getMissingImprintList()}
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-top: 40px; color: #9ca3af;">
      <p>Erstellt am ${new Date().toLocaleDateString()} | Social Listening & Monitoring Report</p>
      <p style="font-size: 0.9em; margin-top: 10px;">Alle Angaben basieren auf automatischer Analyse und manueller Datenerfassung</p>
    </div>
  </div>
</body>
</html>`;
};
