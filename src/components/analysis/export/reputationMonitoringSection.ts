import { ManualReputationData } from '@/hooks/useManualData';

// Helper function to get score color
const getScoreColor = (score: number) => {
  if (score >= 90) return '#FFD700';   // Gold
  if (score >= 60) return '#22c55e';   // Green
  return '#FF0000';                    // Red
};

// Helper function to get score color class
const getScoreColorClass = (score: number) => {
  if (score >= 90) return "yellow";
  if (score >= 60) return "green";
  return "red";
};

export const generateReputationMonitoringSection = (
  manualReputationData?: ManualReputationData | null,
  url?: string,
  manualBacklinkData?: any
) => {
  // If no data available, show N/A section
  if (!manualReputationData || !manualReputationData.searchResults) {
    return `
      <div class="section">
        <div class="section-header">
          <span>Reputation Monitoring</span>
          <div class="header-score-circle red">N/A</div>
        </div>
        <div class="section-content">
          <div class="metric-card warning">
            <h3>Online-Reputation & Web-Erwähnungen</h3>
            <p class="light-gray-text" style="font-style: italic; text-align: center; margin: 20px 0;">
              Keine Daten verfügbar. Reputation Monitoring wurde nicht durchgeführt.
            </p>
            <div class="recommendations">
              <h4>Handlungsempfehlungen:</h4>
              <ul>
                <li>Regelmäßiges Monitoring der Online-Reputation einrichten</li>
                <li>Erwähnungen des Unternehmens im Web verfolgen</li>
                <li>Auf Kundenfeedback zeitnah reagieren</li>
                <li>Aktive PR-Arbeit zur Steigerung der Sichtbarkeit</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Filter out own domain, disabled backlinks, and disabled mentions from results
  let searchResults = manualReputationData.searchResults || [];
  const disabledBacklinks = manualBacklinkData?.disabledBacklinks || [];
  const disabledMentions = manualReputationData.disabledMentions || [];
  
  if (url) {
    const cleanUrl = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
    searchResults = searchResults.filter((item: any) => {
      const itemDomain = (item.displayLink || item.link || '')
        .replace('https://', '')
        .replace('http://', '')
        .replace('www.', '')
        .split('/')[0];
      
      // Filter out own domain, disabled backlinks, AND disabled mentions
      return itemDomain !== cleanUrl && !disabledBacklinks.includes(item.link) && !disabledMentions.includes(item.link);
    });
  } else {
    // Even without URL, filter out disabled backlinks and disabled mentions
    searchResults = searchResults.filter((item: any) => !disabledBacklinks.includes(item.link) && !disabledMentions.includes(item.link));
  }
  
  const reputationScore = manualReputationData.reputationScore || 0;
  const mentionsCount = searchResults.length; // Use filtered count
  const sentiment = manualReputationData.sentiment || 'neutral';
  const lastChecked = manualReputationData.lastChecked 
    ? new Date(manualReputationData.lastChecked).toLocaleDateString('de-DE')
    : 'Unbekannt';

  // Determine sentiment label and color
  const sentimentLabel = sentiment === 'positive' ? 'Überwiegend positiv' : 
                        sentiment === 'negative' ? 'Verbesserungsbedarf' : 
                        'Neutral';
  const sentimentColor = sentiment === 'positive' ? '#22c55e' : 
                        sentiment === 'negative' ? '#ef4444' : 
                        '#fbbf24';

  return `
    <div class="section">
      <div class="section-header">
        <span>Reputation Monitoring</span>
        <div class="header-score-circle ${getScoreColorClass(reputationScore)}">${reputationScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3>Online-Reputation & Web-Erwähnungen</h3>
          
          <!-- Score Overview -->
          <div class="score-display">
            <div class="score-circle ${getScoreColorClass(reputationScore)}">
              ${reputationScore}%
            </div>
            <div class="score-details">
              <p><strong>Reputation-Score:</strong> ${
                reputationScore >= 90 ? 'Ausgezeichnet' : 
                reputationScore >= 60 ? 'Gut' : 
                'Ausbaufähig'
              }</p>
              <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">
                Bewertung der Online-Präsenz und Wahrnehmung im Web
              </p>
              <p><strong>Web-Erwähnungen:</strong> ${mentionsCount} gefunden</p>
              <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">
                Anzahl der gefundenen Erwähnungen in Suchmaschinen
              </p>
              <p><strong>Sentiment-Analyse:</strong> <span style="color: ${sentimentColor};">${sentimentLabel}</span></p>
              <p style="color: #6b7280; font-size: 0.85rem; margin: 4px 0 12px 0; line-height: 1.4;">
                Letzte Prüfung: ${lastChecked}
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <div class="progress-label">
              <span>Reputation-Bewertung</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${reputationScore}%; background-color: ${getScoreColor(reputationScore)}; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 11px; font-weight: bold; color: ${reputationScore >= 90 ? '#000' : '#fff'}; z-index: 5;">${reputationScore}%</span>
              </div>
            </div>
          </div>

          <!-- Key Metrics Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 24px;">
            <div style="background: rgba(59, 130, 246, 0.1); padding: 16px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h4 style="color: #1e40af; margin: 0 0 8px 0; font-size: 0.95em;">Erwähnungen</h4>
              <p style="font-size: 2em; font-weight: bold; margin: 0; color: #1e40af;">${mentionsCount}</p>
              <p style="margin: 8px 0 0 0; font-size: 0.85em; color: #6b7280;">
                Gefundene Online-Erwähnungen
              </p>
            </div>
            <div style="background: ${sentiment === 'positive' ? 'rgba(34, 197, 94, 0.1)' : sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(251, 191, 36, 0.1)'}; padding: 16px; border-radius: 8px; border-left: 4px solid ${sentimentColor};">
              <h4 style="color: ${sentimentColor}; margin: 0 0 8px 0; font-size: 0.95em;">Sentiment</h4>
              <p style="font-size: 1.5em; font-weight: bold; margin: 0; color: ${sentimentColor};">${sentimentLabel}</p>
              <p style="margin: 8px 0 0 0; font-size: 0.85em; color: #6b7280;">
                Gesamteindruck der Erwähnungen
              </p>
            </div>
            <div style="background: ${reputationScore >= 60 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(251, 191, 36, 0.1)'}; padding: 16px; border-radius: 8px; border-left: 4px solid ${reputationScore >= 60 ? '#22c55e' : '#fbbf24'};">
              <h4 style="color: ${reputationScore >= 60 ? '#22c55e' : '#fbbf24'}; margin: 0 0 8px 0; font-size: 0.95em;">Bewertung</h4>
              <p style="font-size: 1.5em; font-weight: bold; margin: 0; color: ${reputationScore >= 60 ? '#22c55e' : '#fbbf24'};">
                ${reputationScore >= 90 ? 'Ausgezeichnet' : reputationScore >= 60 ? 'Gut' : 'Ausbaufähig'}
              </p>
              <p style="margin: 8px 0 0 0; font-size: 0.85em; color: #6b7280;">
                Online-Reputation Status
              </p>
            </div>
          </div>

          ${searchResults.length > 0 ? `
          <!-- Search Results -->
          <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <h4 style="color: #374151; margin-bottom: 16px;">Gefundene Erwähnungen (Top ${Math.min(5, searchResults.length)})</h4>
            ${searchResults.slice(0, 5).map((result: any, index: number) => `
              <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 4px solid #3b82f6;">
                <h5 style="color: #1f2937; margin: 0 0 8px 0; font-size: 1em; font-weight: 600;">
                  ${index + 1}. ${result.title || 'Unbekannter Titel'}
                </h5>
                <p style="color: #6b7280; font-size: 0.9em; margin: 0 0 8px 0; line-height: 1.5;">
                  ${result.snippet || result.description || 'Keine Beschreibung verfügbar'}
                </p>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: #9ca3af; font-size: 0.85em;">
                    <strong>Quelle:</strong> ${result.displayLink || 'Unbekannt'}
                  </span>
                  ${result.link ? `
                    <a href="${result.link}" target="_blank" rel="noopener noreferrer" style="color: #3b82f6; font-size: 0.85em; text-decoration: none;">
                      → Link öffnen
                    </a>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Scoring Contribution -->
          <div style="margin-top: 24px; padding: 16px; background: rgba(59, 130, 246, 0.05); border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2);">
            <h4 style="color: #1e40af; margin: 0 0 12px 0;">Score-Berechnung</h4>
            <p style="margin: 0; font-size: 0.9em; color: #6b7280; line-height: 1.6;">
              Der Reputation-Score setzt sich zusammen aus:<br>
              • <strong>Anzahl der Erwähnungen</strong> (bis zu 70 Punkte)<br>
              • <strong>Sentiment-Analyse</strong> (bis zu 30 Punkte Bonus/Malus)<br>
              • Positive Keywords erhöhen, negative Keywords verringern den Score
            </p>
          </div>

          <!-- Recommendations -->
          <div class="recommendations">
            <h4>Handlungsempfehlungen:</h4>
            <ul>
              ${reputationScore < 60 ? `
                <li>Aktive Online-Präsenz aufbauen durch regelmäßige Social Media Aktivitäten</li>
                <li>Kunden um Bewertungen auf Google und Branchenportalen bitten</li>
                <li>Content-Marketing betreiben, um mehr Web-Erwähnungen zu generieren</li>
              ` : ''}
              ${sentiment === 'negative' ? `
                <li>Negative Erwähnungen analysieren und Verbesserungsmaßnahmen einleiten</li>
                <li>Professionell auf kritisches Feedback reagieren</li>
              ` : ''}
              <li>Regelmäßiges Monitoring der Online-Reputation durchführen (mindestens monatlich)</li>
              <li>Auf alle Bewertungen zeitnah und professionell reagieren</li>
              <li>PR-Aktivitäten intensivieren, um positive Erwähnungen zu fördern</li>
              <li>Lokale Partnerschaften und Kooperationen für mehr Sichtbarkeit nutzen</li>
              ${reputationScore >= 80 ? `
                <li>Bestehende positive Reputation durch kontinuierliche Qualitätsarbeit erhalten</li>
                <li>Erfolgsgeschichten und Kundenstimmen aktiv kommunizieren</li>
              ` : ''}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
};
