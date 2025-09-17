
export const generatePricingSection = (
  hourlyRateData: { ownRate: number; regionAverage: number },
  calculateHourlyRateScore: () => number
) => `
        <!-- Stundensatz-Analyse -->
        <div class="section">
            <div class="section-header">💰 Preisstrategie-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Ihr Stundensatz</div>
                        <div class="metric-value excellent">${hourlyRateData.ownRate.toFixed(2)} €</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Regionaler Durchschnitt: ${hourlyRateData.regionAverage.toFixed(2)} €</span>
                                <span>${((hourlyRateData.ownRate / hourlyRateData.regionAverage - 1) * 100).toFixed(1)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${calculateHourlyRateScore()}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Marktpositionierung</div>
                        <div class="metric-value ${calculateHourlyRateScore() >= 80 ? 'excellent' : calculateHourlyRateScore() >= 60 ? 'good' : 'warning'}">
                            ${calculateHourlyRateScore() === 100 ? 'Sehr wettbewerbsfähig' : 
                              calculateHourlyRateScore() === 85 ? 'Wettbewerbsfähig' : 
                              calculateHourlyRateScore() === 70 ? 'Marktgerecht' : 
                              calculateHourlyRateScore() === 50 ? 'Über Marktdurchschnitt' : `${calculateHourlyRateScore()}/100`}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${calculateHourlyRateScore() < 60 ? 'warning' : ''}" style="width: ${calculateHourlyRateScore()}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Preisattraktivität</div>
                        <div class="metric-value ${hourlyRateData.ownRate < hourlyRateData.regionAverage ? 'excellent' : 'good'}">
                            ${hourlyRateData.ownRate < hourlyRateData.regionAverage ? 'Kundenfreundlich' : 'Premium-Bereich'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Preis-Leistungs-Verhältnis</span>
                                <span>${hourlyRateData.ownRate <= hourlyRateData.regionAverage ? '90' : '75'}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${hourlyRateData.ownRate <= hourlyRateData.regionAverage ? 90 : 75}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Wettbewerbsfähigkeit</div>
                        <div class="metric-value good">Marktgerecht</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Konkurrenzfähigkeit</span>
                                <span>85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="highlight-box">
                    <h4 style="color: #2c7a7b; margin-bottom: 10px;">💡 Preisstrategie-Empfehlung</h4>
                    <p style="color: #2c7a7b;">
                        ${hourlyRateData.ownRate < hourlyRateData.regionAverage * 0.8 ? 
                            'Ihr Stundensatz liegt deutlich unter dem Durchschnitt. Eine moderate Erhöhung könnte Ihre Gewinnmarge verbessern, ohne Kunden zu verlieren.' :
                            hourlyRateData.ownRate > hourlyRateData.regionAverage * 1.2 ?
                            'Ihr Stundensatz liegt über dem regionalen Durchschnitt. Stellen Sie sicher, dass Ihre Leistungen diesen Premium-Preis rechtfertigen.' :
                            'Ihr Stundensatz ist marktgerecht positioniert. Dies ist eine solide Basis für nachhaltiges Wachstum.'
                        }
                    </p>
                </div>
            </div>
        </div>
`;
