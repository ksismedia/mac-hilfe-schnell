import { RealBusinessData } from '@/services/BusinessAnalysisService';

export interface MarketDemandSection {
  serviceDemands: Array<{
    service: string;
    demandScore: number;
    searchVolume: number;
    competitorCount: number;
    marketGap: number;
    trend: 'up' | 'down' | 'stable';
    seasonality: string;
  }>;
  regionalInsights: {
    region: string;
    topServices: string[];
    emergingTrends: string[];
    marketSaturation: number;
  };
  marketOpportunities: string[];
  competitorAnalysis: {
    averageServices: number;
    mostCommonServices: string[];
    serviceGaps: string[];
  };
  score: number;
}

export const generateMarketDemandSection = (
  businessData: any,
  realData: RealBusinessData,
  marketData?: any
): string => {
  if (!marketData) {
    return `
      <div class="market-section">
        <h2 class="section-title">Marktbedarfs-Analyse</h2>
        <div class="info-box">
          <p><strong>Status:</strong> Noch nicht durchgeführt</p>
          <p class="note">Die Marktbedarfs-Analyse zeigt regionale Nachfrage-Trends und Marktchancen für Ihre Branche auf.</p>
        </div>
      </div>
    `;
  }

  const { serviceDemands = [], regionalInsights = {}, marketOpportunities = [], competitorAnalysis = {} } = marketData;
  
  // Sort services by demand score
  const topServices = serviceDemands
    .sort((a: any, b: any) => b.demandScore - a.demandScore)
    .slice(0, 8);

  const highDemandServices = serviceDemands.filter((s: any) => s.demandScore >= 70);
  const marketGaps = serviceDemands.filter((s: any) => s.marketGap >= 60);
  const trendingServices = serviceDemands.filter((s: any) => s.trend === 'up');

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getDemandColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green
    if (score >= 60) return '#eab308'; // yellow
    return '#ef4444'; // red
  };

  return `
    <div class="market-section">
      <h2 class="section-title">Marktbedarfs-Analyse</h2>
      
      <!-- Regional Overview -->
      <div class="market-overview">
        <h3>Regionale Marktübersicht</h3>
        <div class="market-stats">
          <div class="stat-item">
            <div class="stat-label">Region</div>
            <div class="stat-value">${regionalInsights.region || 'Nicht ermittelt'}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Marktsättigung</div>
            <div class="stat-value">${regionalInsights.marketSaturation || 0}%</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${regionalInsights.marketSaturation || 0}%"></div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Analysierte Services</div>
            <div class="stat-value">${serviceDemands.length}</div>
          </div>
        </div>
      </div>

      <!-- Service Demand Analysis -->
      <div class="service-demand">
        <h3>Service-Nachfrage Ranking</h3>
        <div class="service-list">
          ${topServices.map((service: any, index: number) => `
            <div class="service-item">
              <div class="service-rank">#${index + 1}</div>
              <div class="service-details">
                <div class="service-name">${service.service}</div>
                <div class="service-metrics">
                  <span class="metric">
                    <strong>Nachfrage:</strong> 
                    <span style="color: ${getDemandColor(service.demandScore)}">${service.demandScore}%</span>
                  </span>
                  <span class="metric">
                    <strong>Suchvolumen:</strong> ${service.searchVolume}/Monat
                  </span>
                  <span class="metric">
                    <strong>Konkurrenten:</strong> ${service.competitorCount}
                  </span>
                  <span class="metric">
                    <strong>Marktlücke:</strong> ${service.marketGap}%
                  </span>
                  <span class="trend">${getTrendIcon(service.trend)}</span>
                </div>
                ${service.seasonality ? `<div class="seasonality">${service.seasonality}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Market Opportunities -->
      ${marketOpportunities.length > 0 ? `
        <div class="market-opportunities">
          <h3>Identifizierte Marktchancen</h3>
          <div class="opportunities-list">
            ${marketOpportunities.map((opportunity: string) => `
              <div class="opportunity-item">
                <span class="opportunity-icon">🎯</span>
                <span class="opportunity-text">${opportunity}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- High Demand Services -->
      ${highDemandServices.length > 0 ? `
        <div class="high-demand">
          <h3>Services mit hoher Nachfrage</h3>
          <div class="high-demand-list">
            ${highDemandServices.map((service: any) => `
              <div class="demand-badge high">${service.service} (${service.demandScore}%)</div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Market Gaps -->
      ${marketGaps.length > 0 ? `
        <div class="market-gaps">
          <h3>Marktlücken (> 60% Gap)</h3>
          <div class="gaps-list">
            ${marketGaps.map((service: any) => `
              <div class="gap-item">
                <span class="gap-service">${service.service}</span>
                <span class="gap-percentage">${service.marketGap}% Lücke</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Trending Services -->
      ${trendingServices.length > 0 ? `
        <div class="trending-services">
          <h3>Aufkommende Trends</h3>
          <div class="trending-list">
            ${trendingServices.map((service: any) => `
              <div class="trending-badge">${service.service} 📈</div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Regional Top Services -->
      ${regionalInsights.topServices && regionalInsights.topServices.length > 0 ? `
        <div class="regional-top">
          <h3>Gefragteste Services in der Region</h3>
          <div class="regional-services">
            ${regionalInsights.topServices.map((service: string) => `
              <div class="regional-service">${service}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Emerging Trends -->
      ${regionalInsights.emergingTrends && regionalInsights.emergingTrends.length > 0 ? `
        <div class="emerging-trends">
          <h3>Neue Trends in der Region</h3>
          <div class="trends-list">
            ${regionalInsights.emergingTrends.map((trend: string) => `
              <div class="trend-badge">${trend}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Competitor Analysis Summary -->
      ${competitorAnalysis.serviceGaps && competitorAnalysis.serviceGaps.length > 0 ? `
        <div class="competitor-gaps">
          <h3>Von Konkurrenten wenig angebotene Services</h3>
          <div class="competitor-gaps-list">
            ${competitorAnalysis.serviceGaps.slice(0, 5).map((gap: string) => `
              <div class="competitor-gap">${gap}</div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Recommendations -->
      <div class="market-recommendations">
        <h3>Handlungsempfehlungen</h3>
        <div class="recommendations-list">
          ${highDemandServices.length > 0 ? `
            <div class="recommendation">
              <strong>Fokus auf nachfragestarke Services:</strong> 
              Konzentrieren Sie sich auf ${highDemandServices.slice(0, 3).map((s: any) => s.service).join(', ')}
            </div>
          ` : ''}
          ${marketGaps.length > 0 ? `
            <div class="recommendation">
              <strong>Marktlücken nutzen:</strong> 
              Erwägen Sie die Expansion in ${marketGaps.slice(0, 2).map((s: any) => s.service).join(', ')}
            </div>
          ` : ''}
          ${trendingServices.length > 0 ? `
            <div class="recommendation">
              <strong>Trends beobachten:</strong> 
              Bereiten Sie sich auf wachsende Nachfrage bei ${trendingServices.slice(0, 2).map((s: any) => s.service).join(', ')} vor
            </div>
          ` : ''}
          ${regionalInsights.marketSaturation > 80 ? `
            <div class="recommendation warning">
              <strong>Hohe Marktsättigung:</strong> 
              Differenzierung und Spezialisierung werden wichtiger
            </div>
          ` : ''}
        </div>
      </div>
    </div>

    <style>
      .market-section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }

      .market-overview {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 25px;
      }

      .market-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 15px;
      }

      .stat-item {
        text-align: center;
      }

      .stat-label {
        font-size: 0.85em;
        color: #666;
        margin-bottom: 5px;
      }

      .stat-value {
        font-size: 1.2em;
        font-weight: bold;
        color: #2563eb;
      }

      .progress-bar {
        width: 100%;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 5px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
        transition: width 0.3s ease;
      }

      .service-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .service-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 8px;
        border-left: 4px solid #2563eb;
      }

      .service-rank {
        font-size: 1.2em;
        font-weight: bold;
        color: #2563eb;
        min-width: 30px;
      }

      .service-details {
        flex: 1;
      }

      .service-name {
        font-weight: bold;
        margin-bottom: 8px;
        color: #1f2937;
      }

      .service-metrics {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-bottom: 5px;
      }

      .metric {
        font-size: 0.85em;
        color: #6b7280;
      }

      .trend {
        font-size: 1.1em;
      }

      .seasonality {
        font-size: 0.8em;
        color: #6b7280;
        font-style: italic;
      }

      .opportunities-list, .recommendations-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .opportunity-item, .recommendation {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px;
        background: #f0f9ff;
        border-radius: 6px;
        border-left: 3px solid #3b82f6;
      }

      .opportunity-icon {
        font-size: 1.1em;
      }

      .high-demand-list, .gaps-list, .trending-list, .regional-services, .trends-list, .competitor-gaps-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }

      .demand-badge, .gap-item, .trending-badge, .regional-service, .trend-badge, .competitor-gap {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 500;
      }

      .demand-badge.high {
        background: #dcfce7;
        color: #166534;
        border: 1px solid #22c55e;
      }

      .gap-item {
        background: #fef3c7;
        color: #92400e;
        border: 1px solid #f59e0b;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }

      .trending-badge {
        background: #e0f2fe;
        color: #0c4a6e;
        border: 1px solid #0ea5e9;
      }

      .regional-service {
        background: #f3e8ff;
        color: #6b21a8;
        border: 1px solid #a855f7;
      }

      .trend-badge {
        background: #ecfdf5;
        color: #065f46;
        border: 1px solid #10b981;
      }

      .competitor-gap {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #ef4444;
      }

      .recommendation.warning {
        background: #fef3c7;
        border-left-color: #f59e0b;
      }

      @media (max-width: 768px) {
        .service-metrics {
          flex-direction: column;
          gap: 5px;
        }

        .market-stats {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
};