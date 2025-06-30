import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import { FileText, Download, Printer } from 'lucide-react';
import { generateHTML } from './export/htmlGenerator';
import { getHTMLStyles } from './export/htmlStyles';

interface HTMLExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: any;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: { [competitorName: string]: string[] };
  hourlyRateData?: { ownRate: number; regionAverage: number };
}

const HTMLExport: React.FC<HTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualCompetitors = [],
  competitorServices = {},
  hourlyRateData
}) => {
  const generateInternalReport = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Handwerk Stars - Interne Analyse ${businessData.address}</title>
    <style>${getHTMLStyles()}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-container">
                <img src="/lovable-uploads/99a19f1f-f125-4be7-8031-e08d72b47f78.png" alt="Handwerk Stars Logo" class="logo" />
            </div>
            <h1>Interne Digitale Analyse</h1>
            <p class="subtitle">Technischer Report für ${businessData.address}</p>
            <p style="color: #9ca3af; font-size: 0.9em; margin-top: 10px;">
                Erstellt am ${new Date().toLocaleDateString('de-DE')} | Handwerk Stars Internal
            </p>
        </div>

        <section class="company-info">
            <h2>${businessData.address}</h2>
            <p><strong>URL:</strong> <a href="${businessData.url}" target="_blank">${businessData.url}</a></p>
            <p><strong>Branche:</strong> ${businessData.industry}</p>
        </section>

        <section class="score-overview">
            <div class="score-card">
                <div class="score-big">${realData.overallScore.toFixed(2)}</div>
                <div class="score-label">Gesamtbewertung</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.visibilityScore.toFixed(2)}</div>
                <div class="score-label">Sichtbarkeit</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.performanceScore.toFixed(2)}</div>
                <div class="score-label">Performance</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.socialMediaScore.toFixed(2)}</div>
                <div class="score-label">Social Media</div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Sichtbarkeits-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Google Ranking</div>
                        <div class="metric-value">${realData.googleRanking}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.googleRanking}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.googleRanking}%" data-value="${Math.round(realData.googleRanking / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Lokale Suche</div>
                        <div class="metric-value">${realData.localSearch}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.localSearch}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.localSearch}%" data-value="${Math.round(realData.localSearch / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Backlinks</div>
                        <div class="metric-value">${realData.backlinks}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.backlinks}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.backlinks}%" data-value="${Math.round(realData.backlinks / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Keyword-Optimierung</div>
                        <div class="metric-value">${realData.keywordOptimization}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.keywordOptimization}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.keywordOptimization}%" data-value="${Math.round(realData.keywordOptimization / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Performance-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Ladezeit</div>
                        <div class="metric-value">${realData.loadingTime}s</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.loadingTime}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.loadingTime}%" data-value="${Math.round(realData.loadingTime / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Mobile Optimierung</div>
                        <div class="metric-value">${realData.mobileOptimization}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.mobileOptimization}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.mobileOptimization}%" data-value="${Math.round(realData.mobileOptimization / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Benutzerfreundlichkeit</div>
                        <div class="metric-value">${realData.userExperience}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.userExperience}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.userExperience}%" data-value="${Math.round(realData.userExperience / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Absprungrate</div>
                        <div class="metric-value">${realData.bounceRate}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.bounceRate}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.bounceRate}%" data-value="${Math.round(realData.bounceRate / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Social Media-Analyse</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Follower</div>
                        <div class="metric-value">${realData.socialMediaFollowers}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.socialMediaFollowers}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.socialMediaFollowers}%" data-value="${Math.round(realData.socialMediaFollowers / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Engagement Rate</div>
                        <div class="metric-value">${realData.socialMediaEngagement}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.socialMediaEngagement}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.socialMediaEngagement}%" data-value="${Math.round(realData.socialMediaEngagement / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Social Shares</div>
                        <div class="metric-value">${realData.socialMediaShares}</div>
                         <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.socialMediaShares}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.socialMediaShares}%" data-value="${Math.round(realData.socialMediaShares / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                    <div class="metric-item">
                        <div class="metric-title">Influencer Kooperationen</div>
                        <div class="metric-value">${realData.socialMediaInfluence}%</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Fortschritt</span>
                                <span>${realData.socialMediaInfluence}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${realData.socialMediaInfluence}%" data-value="${Math.round(realData.socialMediaInfluence / 10) * 10}"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <div class="section-header">Wettbewerbsanalyse</div>
            <div class="section-content">
                <p><strong>Anzahl der Wettbewerber:</strong> ${manualCompetitors?.length || 0}</p>
                ${manualCompetitors && manualCompetitors.length > 0 ? `
                    <div class="competitor-list">
                        ${manualCompetitors.map((competitor, index) => `
                            <div class="competitor-card">
                                <h4>Wettbewerber ${index + 1}</h4>
                                <p><strong>Name:</strong> ${competitor.name}</p>
                                <p><strong>URL:</strong> <a href="${competitor.url}" target="_blank">${competitor.url}</a></p>
                                ${competitorServices[competitor.name] ? `
                                    <p><strong>Services:</strong></p>
                                    <ul class="services-list">
                                        ${competitorServices[competitor.name].map(service => `<li>${service}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : '<p>Keine Wettbewerberdaten verfügbar.</p>'}
            </div>
        </section>

        <section class="section">
            <div class="section-header">Stundensatz-Analyse</div>
            <div class="section-content">
                ${hourlyRateData ? `
                    <p><strong>Eigener Stundensatz:</strong> ${hourlyRateData.ownRate} €</p>
                    <p><strong>Regionaler Durchschnitt:</strong> ${hourlyRateData.regionAverage} €</p>
                    <p><strong>Differenz:</strong> ${hourlyRateData.ownRate - hourlyRateData.regionAverage} €</p>
                ` : '<p>Keine Stundensatzdaten verfügbar.</p>'}
            </div>
        </section>
    </div>
</body>
</html>`;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Technischer Report (Intern)
        </CardTitle>
        <CardDescription>
          Generiert einen vollständigen HTML-Report mit allen Details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generateInternalReport} className="bg-gray-800 hover:bg-gray-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Report generieren
        </Button>
      </CardContent>
    </Card>
  );
};

export default HTMLExport;
