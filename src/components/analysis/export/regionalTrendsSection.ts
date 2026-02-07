interface ProductTrend {
  trend: string;
  description: string;
  relevance: 'high' | 'medium' | 'low';
  source?: string;
}

interface TrendResponse {
  trends: ProductTrend[];
  summary: string;
  generatedAt: string;
  region: string;
  industry: string;
}

/**
 * Generiert die HTML-Sektion für regionale Produkttrends im Export-Report
 */
export const generateRegionalTrendsSection = (
  trendsData: TrendResponse | null,
  showInReport: boolean
): string => {
  if (!showInReport || !trendsData || trendsData.trends.length === 0) {
    return '';
  }

  const getRelevanceColor = (relevance: 'high' | 'medium' | 'low'): { bg: string; text: string; border: string } => {
    switch (relevance) {
      case 'high':
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'medium':
        return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' };
      case 'low':
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const getRelevanceLabel = (relevance: 'high' | 'medium' | 'low'): string => {
    switch (relevance) {
      case 'high':
        return 'Hohe Relevanz';
      case 'medium':
        return 'Mittlere Relevanz';
      case 'low':
        return 'Geringe Relevanz';
    }
  };

  const trendsHtml = trendsData.trends.map((trend, index) => {
    const colors = getRelevanceColor(trend.relevance);
    return `
      <div style="padding: 16px; border: 1px solid #e9d5ff; border-radius: 8px; background: #faf5ff; margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <strong style="color: #7c3aed; font-size: 15px;">${index + 1}. ${trend.trend}</strong>
          <span style="padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border};">
            ${getRelevanceLabel(trend.relevance)}
          </span>
        </div>
        <p style="color: #4b5563; font-size: 13px; line-height: 1.5; margin: 0;">
          ${trend.description}
        </p>
        ${trend.source ? `
          <a href="${trend.source}" target="_blank" rel="noopener noreferrer" 
             style="display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; font-size: 11px; color: #7c3aed; text-decoration: none;">
            🔗 Quelle
          </a>
        ` : ''}
      </div>
    `;
  }).join('');

  const formattedDate = new Date(trendsData.generatedAt).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!-- Regionale Produkttrends -->
    <div class="section" style="page-break-inside: avoid;">
      <div class="section-header" style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white;">
        Regionale Produkttrends
      </div>
      <div class="section-content">
        <div style="margin-bottom: 16px; padding: 12px; background: #f3e8ff; border-radius: 8px; border-left: 4px solid #7c3aed;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #5b21b6;">Region: ${trendsData.region}</strong>
            <span style="font-size: 11px; color: #6b7280;">Branche: ${trendsData.industry}</span>
          </div>
          <p style="color: #6b21a8; font-size: 13px; margin: 0; line-height: 1.5;">
            ${trendsData.summary}
          </p>
          <p style="font-size: 11px; color: #9ca3af; margin: 8px 0 0 0;">
            Aktualisiert: ${formattedDate}
          </p>
        </div>

        <div style="margin-top: 16px;">
          <h4 style="color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 12px;">
            Identifizierte Markttrends (${trendsData.trends.length})
          </h4>
          ${trendsHtml}
        </div>

        <div class="recommendations" style="margin-top: 20px; padding: 16px; background: #faf5ff; border: 2px solid #c4b5fd; border-radius: 8px;">
          <h4 style="color: #5b21b6; margin: 0 0 12px 0; font-size: 14px;">
            ★ Handlungsempfehlungen basierend auf Markttrends:
          </h4>
          <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px; line-height: 1.8;">
            ${trendsData.trends
              .filter(t => t.relevance === 'high')
              .slice(0, 3)
              .map(t => `<li><strong>${t.trend}:</strong> Prüfen Sie, ob Sie diesen Trend in Ihrem Leistungsangebot abbilden können.</li>`)
              .join('')}
            <li>Positionieren Sie sich als regionaler Experte für die identifizierten Trendthemen.</li>
            <li>Nutzen Sie die Trends für Ihre Marketingkommunikation und Content-Strategie.</li>
          </ul>
        </div>

        <div style="margin-top: 16px; padding: 12px; background: #fef3c7; border-radius: 8px; border: 1px solid #fcd34d;">
          <p style="font-size: 11px; color: #92400e; margin: 0;">
            ⚠️ <strong>Hinweis:</strong> Diese Trendanalyse basiert auf KI-gestützter Webrecherche (Perplexity AI) und 
            stellt eine Momentaufnahme dar. Die Relevanz der Trends kann je nach spezifischer Marktlage variieren. 
            Eine individuelle Beratung wird empfohlen.
          </p>
        </div>
      </div>
    </div>
  `;
};
