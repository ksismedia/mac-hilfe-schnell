

import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData } from '@/hooks/useManualData';
import { getHTMLStyles } from './htmlStyles';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateSocialMediaScore } from './scoreCalculations';

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
  const socialMediaScore = calculateSocialMediaScore(realData, manualSocialData);
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
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Keyword-Optimierung</li>
            <li>Verbesserung der Meta-Beschreibungen</li>
            <li>Aufbau hochwertiger Backlinks</li>
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
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Bilder optimieren</li>
            <li>Caching aktivieren</li>
            <li>Code minimieren</li>
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
        <div class="recommendations">
          <h4>Handlungsempfehlungen:</h4>
          <ul>
            <li>Responsive Design verwenden</li>
            <li>Touch-freundliche Navigation</li>
            <li>Mobile-First-Ansatz</li>
          </ul>
        </div>
      </div>
    `;
  };

  // Competitor Analysis
  const getCompetitorAnalysis = () => {
    if (!manualCompetitors || manualCompetitors.length === 0) {
      return '<p>Keine Konkurrenten zum Vergleich gefunden.</p>';
    }

    return `
      <ul>
        ${manualCompetitors.map(competitor => `<li>${competitor.name} - Bewertung: ${competitor.rating}, Anzahl Bewertungen: ${competitor.reviews}</li>`).join('')}
      </ul>
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
            ` : `
              <li>Kontinuierliche Content-Strategie beibehalten</li>
              <li>Engagement mit Followern verstärken</li>
              <li>Performance-Monitoring implementieren</li>
            `}
          </ul>
        </div>
      </div>
    `;
  };

  // Generate the HTML
  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Social Listening Report - ${realData.company.name}</title>
      ${getHTMLStyles()}
    </head>
    <body>
      <div class="container">
        <header>
          <h1>Social Listening Report</h1>
          <h2>${realData.company.name} - ${businessData.url}</h2>
        </header>

        <div class="section">
          <h2>🎯 Executive Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-score ${realData.seo.score >= 70 ? 'good' : 'warning'}">${realData.seo.score}%</div>
              <div class="summary-label">SEO Optimierung</div>
            </div>
            <div class="summary-item">
              <div class="summary-score ${socialMediaScore >= 60 ? 'good' : 'warning'}">${socialMediaScore}%</div>
              <div class="summary-label">Social Media</div>
            </div>
            <div class="summary-item">
              <div class="summary-score ${realData.performance.score >= 70 ? 'good' : 'warning'}">${realData.performance.score}%</div>
              <div class="summary-label">Performance</div>
            </div>
            <div class="summary-item">
              <div class="summary-score ${impressumScore >= 70 ? 'good' : 'warning'}">${impressumScore}%</div>
              <div class="summary-label">Rechtssicherheit</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>🔎 SEO Analyse</h2>
          ${getSEOAnalysis()}
        </div>

        <div class="section">
          <h2>🚀 Performance Analyse</h2>
          ${getPerformanceAnalysis()}
        </div>

        <div class="section">
          <h2>📱 Mobile Optimierung</h2>
          ${getMobileOptimizationAnalysis()}
        </div>

        <div class="section">
          <h2>📱 Social Media Analyse</h2>
          ${getSocialMediaAnalysis()}
        </div>

        <div class="section">
          <h2>👥 Konkurrenzanalyse</h2>
          ${getCompetitorAnalysis()}
        </div>

        <div class="section">
          <h2>📜 Impressum</h2>
          <h3>Fehlende Angaben:</h3>
          ${getMissingImprintList()}
        </div>

        <footer>
          <p>Erstellt am ${new Date().toLocaleDateString()}</p>
        </footer>
      </div>
    </body>
    </html>
  `;
};
