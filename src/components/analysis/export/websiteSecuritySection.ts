import { SafeBrowsingResult, SafeBrowsingService } from '@/services/SafeBrowsingService';

const getScoreColor = (score: number) => {
  if (score <= 60) return '#FF0000';   // Red for 0-60
  if (score <= 89) return '#22c55e';   // Green for 61-89
  return '#FFD700';                    // Gold for 90-100
};

const getScoreColorClass = (score: number) => {
  if (score < 61) return "red";       // 0-60% rot
  if (score < 90) return "green";     // 61-89% grün
  return "yellow";                    // 90-100% gold
};

export const generateWebsiteSecuritySection = (
  securityData?: SafeBrowsingResult | null
) => {
  if (!securityData) {
    return `
    <!-- Website-Sicherheit -->
    <div class="section">
      <div class="section-header">
        <span>Website-Sicherheit (Google Safe Browsing)</span>
        <div class="header-score-circle" style="background: #9ca3af;">N/A</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <p style="color: #9ca3af; text-align: center; padding: 20px;">
            Keine Sicherheitsdaten verfügbar - Bitte über "Aktualisieren" Button in der Analyse die Prüfung starten
          </p>
        </div>
      </div>
    </div>
    `;
  }

  // Use SafeBrowsingService for consistent scoring
  const securityScore = SafeBrowsingService.calculateSecurityScore(securityData);

  const securityColor = getScoreColor(securityScore);
  const securityColorClass = getScoreColorClass(securityScore);

  let statusHTML = '';
  
  if (securityData.isSafe === true) {
    statusHTML = `
      <div style="background: rgba(16, 185, 129, 0.1); border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <svg style="width: 24px; height: 24px; color: #10b981;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          <h3 style="color: #10b981; margin: 0; font-size: 1.2em;">Website ist sicher</h3>
        </div>
        <p style="color: #059669; margin: 0;">
          Diese Website wurde von Google Safe Browsing überprüft und es wurden <strong>keine bekannten Sicherheitsbedrohungen</strong> gefunden.
        </p>
      </div>
    `;
  } else if (securityData.isSafe === false && securityData.threats && securityData.threats.length > 0) {
    const threatsHTML = securityData.threats.map(threat => `
      <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #dc2626; font-weight: bold; font-size: 1.1em;">${threat.type}</span>
          <span style="background: #ef4444; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85em;">
            ${threat.platform}
          </span>
        </div>
        <p style="color: #991b1b; margin: 0;">${threat.description}</p>
      </div>
    `).join('');

    statusHTML = `
      <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid #ef4444; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
          <svg style="width: 24px; height: 24px; color: #ef4444;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h3 style="color: #dc2626; margin: 0; font-size: 1.2em;">
            ${securityData.threats.length} Sicherheitsbedrohung${securityData.threats.length > 1 ? 'en' : ''} erkannt
          </h3>
        </div>
        <p style="color: #991b1b; margin-bottom: 15px; font-weight: 500;">
          Google Safe Browsing hat folgende Bedrohungen identifiziert:
        </p>
        ${threatsHTML}
        <div style="background: white; border-radius: 6px; padding: 12px; margin-top: 15px;">
          <p style="color: #dc2626; margin: 0; font-size: 0.9em;">
            <strong>⚠️ Dringender Handlungsbedarf:</strong> Diese Sicherheitsbedrohungen sollten umgehend behoben werden, da sie das Vertrauen der Besucher beeinträchtigen und zu Warnungen in Suchmaschinen und Browsern führen können.
          </p>
        </div>
      </div>
    `;
  } else {
    statusHTML = `
      <div style="background: rgba(156, 163, 175, 0.1); border: 2px solid #9ca3af; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 10px;">
          <svg style="width: 24px; height: 24px; color: #6b7280;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 style="color: #6b7280; margin: 0; font-size: 1.2em;">Sicherheitsstatus unbekannt</h3>
        </div>
        <p style="color: #4b5563; margin: 0;">
          Der Sicherheitsstatus der Website konnte nicht ermittelt werden.
        </p>
      </div>
    `;
  }

  const checkedDate = securityData.checkedAt ? 
    new Date(securityData.checkedAt).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 
    'Unbekannt';

  return `
    <!-- Website-Sicherheit -->
    <div class="section">
      <div class="section-header">
        <span>Website-Sicherheit (Google Safe Browsing)</span>
        <div class="header-score-circle ${securityColorClass}">${securityScore}%</div>
      </div>
      <div class="section-content">
        <div class="metric-card">
          <h3 style="color: #1f2937; margin-top: 0;">Überprüfung durch Google Safe Browsing</h3>
          
          ${statusHTML}

          <div style="background: #f3f4f6; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <h4 style="color: #374151; margin-top: 0; margin-bottom: 10px;">Was ist Google Safe Browsing?</h4>
            <p style="color: #6b7280; margin: 0; line-height: 1.6; font-size: 0.95em;">
              Google Safe Browsing ist ein Dienst, der Websites auf Malware, Phishing-Versuche, unerwünschte Software und potenziell schädliche Anwendungen überprüft. Websites, die als unsicher eingestuft werden, können in Browsern mit Warnmeldungen versehen werden und in Suchergebnissen negativ bewertet werden.
            </p>
          </div>

          <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 0.85em; margin: 0;">
              <strong>Letzte Überprüfung:</strong> ${checkedDate}
            </p>
          </div>

          ${securityData.isSafe === true ? `
            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; margin-top: 15px;">
              <p style="color: #059669; margin: 0; font-size: 0.9em;">
                <strong>✓ Empfehlung:</strong> Halten Sie Ihre Website-Software und Plugins aktuell, um die Sicherheit auch weiterhin zu gewährleisten.
              </p>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
};
