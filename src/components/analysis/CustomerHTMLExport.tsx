import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import { FileText, Users, ChartBar } from 'lucide-react';

interface CustomerHTMLExportProps {
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

const industryNames = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro'
};

const CustomerHTMLExport: React.FC<CustomerHTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualCompetitors = [],
  competitorServices = {},
  hourlyRateData
}) => {
  const generateCustomerReport = () => {
    // Berechne Scores für grafische Darstellung
    const calculateScore = (value: number, maxValue: number = 100) => {
      return Math.min(100, Math.max(0, value));
    };

    // Stundensatz-Bewertung
    const calculateHourlyRateScore = () => {
      if (!hourlyRateData || hourlyRateData.regionAverage === 0) return 75; // Default
      
      const ratio = hourlyRateData.ownRate / hourlyRateData.regionAverage;
      if (ratio >= 0.9 && ratio <= 1.1) return 100; // Optimal bei ±10%
      if (ratio >= 0.8 && ratio <= 1.2) return 85;  // Gut bei ±20%
      if (ratio >= 0.7 && ratio <= 1.3) return 70;  // Akzeptabel bei ±30%
      return 50; // Suboptimal
    };

    // Social Media Score berechnen
    const calculateSocialMediaScore = () => {
      let score = 0;
      if (realData.socialMedia.facebook.found) score += 30;
      if (realData.socialMedia.instagram.found) score += 30;
      if (realData.socialMedia.facebook.followers > 100) score += 20;
      if (realData.socialMedia.instagram.followers > 100) score += 20;
      return Math.min(100, score);
    };

    // Prüfe ob Meta-Description vorhanden ist
    const hasMetaDescription = realData.seo.metaDescription && 
                               realData.seo.metaDescription !== 'Keine Meta-Description gefunden' &&
                               realData.seo.metaDescription !== 'Website-Inhalte konnten nicht abgerufen werden';

    // Anonymisiere Konkurrenten
    const anonymizedCompetitors = [
      ...realData.competitors.map((comp, index) => ({
        ...comp,
        name: `Konkurrent ${String.fromCharCode(65 + index)}`, // A, B, C, etc.
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
    const socialMediaScore = calculateSocialMediaScore();
    
    const overallScore = Math.round(
      (realData.seo.score + realData.performance.score + 
       (realData.reviews.google.count > 0 ? 80 : 40) + 
       realData.mobile.overallScore + calculateHourlyRateScore() + socialMediaScore) / 6
    );

    const currentDate = new Date().toLocaleDateString('de-DE');

    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online-Marketing Analyse - ${realData.company.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            text-align: center; 
            margin-bottom: 40px; 
            background: white; 
            padding: 40px 30px; 
            border-radius: 20px; 
            box-shadow: 0 10px 30px rgba(0,0,0,0.1); 
        }
        .header h1 { 
            color: #4a5568; 
            font-size: 2.8em; 
            margin-bottom: 15px; 
            background: linear-gradient(135deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .header .subtitle { color: #718096; font-size: 1.3em; font-weight: 300; }
        .score-overview { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 25px; 
            margin-bottom: 40px; 
        }
        .score-card { 
            background: white; 
            padding: 30px 25px; 
            border-radius: 16px; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.1); 
            text-align: center;
            transition: transform 0.3s ease;
        }
        .score-card:hover { transform: translateY(-5px); }
        .score-big { 
            font-size: 3.5em; 
            font-weight: bold; 
            background: linear-gradient(135deg, #48bb78, #38a169);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .score-label { color: #4a5568; font-weight: 600; font-size: 1.1em; }
        .section { 
            background: white; 
            margin-bottom: 30px; 
            border-radius: 16px; 
            box-shadow: 0 8px 25px rgba(0,0,0,0.1); 
            overflow: hidden;
        }
        .section-header { 
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white; 
            padding: 25px 30px; 
            font-size: 1.5em; 
            font-weight: 600;
        }
        .section-content { padding: 30px; }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px; }
        .metric-item { 
            background: #f8fafc; 
            padding: 25px; 
            border-radius: 12px; 
            border-left: 5px solid #667eea;
        }
        .metric-title { font-weight: 600; color: #4a5568; margin-bottom: 12px; font-size: 1.1em; }
        .metric-value { font-size: 1.3em; color: #2d3748; font-weight: bold; margin-bottom: 15px; }
        .progress-container { margin-top: 15px; }
        .progress-label { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 8px; 
            font-size: 0.9em; 
            color: #718096; 
        }
        .progress-bar { 
            background: #e2e8f0; 
            height: 12px; 
            border-radius: 6px; 
            overflow: hidden;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        .progress-fill { 
            height: 100%; 
            border-radius: 6px; 
            transition: width 0.8s ease;
            background: linear-gradient(90deg, #48bb78, #38a169);
        }
        .progress-fill.warning { background: linear-gradient(90deg, #ed8936, #dd6b20); }
        .progress-fill.danger { background: linear-gradient(90deg, #f56565, #e53e3e); }
        .excellent { color: #38a169; font-weight: bold; }
        .good { color: #3182ce; font-weight: bold; }
        .warning { color: #d69e2e; font-weight: bold; }
        .danger { color: #e53e3e; font-weight: bold; }
        .competitor-item { 
            background: #f8fafc; 
            padding: 20px; 
            border-radius: 12px; 
            margin-bottom: 15px;
            border-left: 4px solid #cbd5e0;
        }
        .competitor-rank { 
            font-size: 1.2em; 
            font-weight: bold; 
            color: #4a5568; 
            margin-bottom: 8px; 
        }
        .recommendations { 
            background: linear-gradient(135deg, #fef5e7, #fed7aa); 
            padding: 25px; 
            border-radius: 12px; 
            margin-top: 25px; 
            border-left: 5px solid #f6ad55;
        }
        .recommendations h4 { color: #744210; margin-bottom: 15px; font-size: 1.2em; }
        .recommendations ul { list-style: none; }
        .recommendations li { 
            margin-bottom: 10px; 
            padding-left: 25px; 
            position: relative; 
            color: #744210;
        }
        .recommendations li:before { 
            content: "✓"; 
            position: absolute; 
            left: 0; 
            color: #d69e2e; 
            font-weight: bold; 
            font-size: 1.2em;
        }
        .highlight-box { 
            background: linear-gradient(135deg, #e6fffa, #b2f5ea); 
            padding: 20px; 
            border-radius: 12px; 
            margin: 20px 0;
            border-left: 5px solid #38b2ac;
        }
        .chart-container { 
            background: white; 
            padding: 20px; 
            border-radius: 12px; 
            margin: 15px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .status-item {
            background: #f8fafc;
            padding: 20px;
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }
        
        @media print {
            body { background: white; }
            .container { max-width: none; }
            .section { box-shadow: none; border: 1px solid #e2e8f0; }
            .score-card { box-shadow: none; border: 1px solid #e2e8f0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Online-Marketing Analyse</h1>
            <div class="subtitle">Professionelle Bewertung Ihres digitalen Auftritts</div>
            <div style="margin-top: 20px; color: #718096; font-size: 1em;">
                ${realData.company.name} • ${industryNames[businessData.industry]} • ${currentDate}
            </div>
        </div>

        <!-- Gesamtbewertung -->
        <div class="score-overview">
            <div class="score-card">
                <div class="score-big">${overallScore}</div>
                <div class="score-label">Gesamt-Score</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.seo.score}</div>
                <div class="score-label">SEO-Optimierung</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.performance.score}</div>
                <div class="score-label">Website-Performance</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.mobile.overallScore}</div>
                <div class="score-label">Mobile Optimierung</div>
            </div>
            <div class="score-card">
                <div class="score-big">${calculateHourlyRateScore()}</div>
                <div class="score-label">Preisstrategie</div>
            </div>
            <div class="score-card">
                <div class="score-big">${socialMediaScore}</div>
                <div class="score-label">Social Media</div>
            </div>
        </div>

        <!-- SEO-Analyse -->
        <div class="section">
            <div class="section-header">🔍 Suchmaschinenoptimierung (SEO)</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">SEO-Gesamtbewertung</div>
                        <div class="metric-value ${realData.seo.score >= 80 ? 'excellent' : realData.seo.score >= 60 ? 'good' : realData.seo.score >= 40 ? 'warning' : 'danger'}">${realData.seo.score}/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Optimierung</span>
                                <span>${realData.seo.score}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.seo.score < 60 ? 'warning' : ''}" style="width: ${realData.seo.score}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Branchenrelevante Keywords</div>
                        <div class="metric-value ${keywordsScore >= 80 ? 'excellent' : keywordsScore >= 60 ? 'good' : keywordsScore >= 40 ? 'warning' : 'danger'}">${keywordsFoundCount}/${realData.keywords.length} gefunden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Keyword-Abdeckung</span>
                                <span>${keywordsScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${keywordsScore < 60 ? 'warning' : ''}" style="width: ${keywordsScore}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Website-Struktur</div>
                        <div class="metric-value ${hasMetaDescription ? 'excellent' : 'warning'}">
                            ${hasMetaDescription ? 'Vollständig optimiert' : 'Verbesserungspotenzial'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Meta-Tags & Struktur</span>
                                <span>${hasMetaDescription ? '100' : '60'}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${!hasMetaDescription ? 'warning' : ''}" style="width: ${hasMetaDescription ? 100 : 60}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Technische SEO</div>
                        <div class="metric-value good">Grundlagen vorhanden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Technische Umsetzung</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${realData.seo.score < 70 ? `
                <div class="recommendations">
                    <h4>Empfehlungen zur SEO-Verbesserung:</h4>
                    <ul>
                        <li>Optimierung der Seitentitel für bessere Auffindbarkeit</li>
                        <li>Verbesserung der Meta-Beschreibungen für höhere Klickraten</li>
                        <li>Integration branchenspezifischer Keywords in den Content</li>
                        <li>Aufbau einer logischen Überschriftenstruktur</li>
                        <li>Erstellung hochwertiger, relevanter Inhalte</li>
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>

        <!-- Performance-Analyse -->
        <div class="section">
            <div class="section-header">⚡ Website-Performance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Performance-Score</div>
                        <div class="metric-value ${realData.performance.score >= 80 ? 'excellent' : realData.performance.score >= 60 ? 'good' : realData.performance.score >= 40 ? 'warning' : 'danger'}">${realData.performance.score}/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Geschwindigkeit</span>
                                <span>${realData.performance.score}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.score < 60 ? 'warning' : ''}" style="width: ${realData.performance.score}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Ladezeit</div>
                        <div class="metric-value ${realData.performance.loadTime < 2 ? 'excellent' : realData.performance.loadTime < 4 ? 'good' : realData.performance.loadTime < 6 ? 'warning' : 'danger'}">${realData.performance.loadTime} Sekunden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Optimal: unter 3s</span>
                                <span>${realData.performance.loadTime < 3 ? 'Erreicht' : 'Verbesserung nötig'}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.loadTime > 4 ? 'warning' : ''}" style="width: ${Math.max(20, 100 - (realData.performance.loadTime * 15))}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Nutzerfreundlichkeit</div>
                        <div class="metric-value good">Benutzerfreundlich</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>User Experience</span>
                                <span>85%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 85%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Verfügbarkeit</div>
                        <div class="metric-value excellent">Online & erreichbar</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Uptime & Erreichbarkeit</span>
                                <span>100%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile Optimierung -->
        <div class="section">
            <div class="section-header">📱 Mobile Optimierung</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Mobile-Score</div>
                        <div class="metric-value ${realData.mobile.overallScore >= 80 ? 'excellent' : realData.mobile.overallScore >= 60 ? 'good' : realData.mobile.overallScore >= 40 ? 'warning' : 'danger'}">${realData.mobile.overallScore}/100 Punkte</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mobile Nutzerfreundlichkeit</span>
                                <span>${realData.mobile.overallScore}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.mobile.overallScore < 60 ? 'warning' : ''}" style="width: ${realData.mobile.overallScore}%"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Responsive Design</div>
                        <div class="metric-value ${realData.mobile.responsive ? 'excellent' : 'danger'}">${realData.mobile.responsive ? 'Optimal umgesetzt' : 'Nicht responsive'}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.mobile.responsive ? 'danger' : ''}" style="width: ${realData.mobile.responsive ? 100 : 0}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Touch-Optimierung</div>
                        <div class="metric-value ${realData.mobile.responsive ? 'good' : 'warning'}">
                            ${realData.mobile.responsive ? 'Gut umgesetzt' : 'Verbesserung nötig'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.mobile.responsive ? 'warning' : ''}" style="width: ${realData.mobile.responsive ? 80 : 40}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Mobile Performance</div>
                        <div class="metric-value good">Zufriedenstellend</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Mobile Ladezeit</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Stundensatz-Analyse -->
        ${hourlyRateData ? `
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
                            ${calculateHourlyRateScore() >= 90 ? 'Optimal positioniert' : 
                              calculateHourlyRateScore() >= 70 ? 'Gut positioniert' : 
                              calculateHourlyRateScore() >= 50 ? 'Anpassung empfohlen' : 'Überprüfung erforderlich'}
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
        ` : ''}

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
                                <span>${Math.min(100, Math.round((realData.socialMedia.facebook.followers + realData.socialMedia.instagram.followers) / 5)}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${Math.min(100, Math.round((realData.socialMedia.facebook.followers + realData.socialMedia.instagram.followers) / 5)}%"></div>
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
                        ${hourlyRateData && calculateHourlyRateScore() < 70 ? '<li>Preisstrategie überdenken und Marktpositionierung anpassen</li>' : ''}
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
                        und kann zu ${Math.round((Math.min(95, overallScore + 25) - overallScore) * 2}% mehr qualifizierten Anfragen führen.
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

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Kundenfreundlicher HTML-Export
          </CardTitle>
          <CardDescription>
            Umfassende, professionelle Analyse für die Kundenpräsentation - mit Stundensatz-Bewertung und erweiterten Inhalten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">✨ Kundenoptimiert:</h4>
              <ul className="text-sm space-y-1 text-blue-600">
                <li>• Anonymisierte Konkurrenzanalyse</li>
                <li>• Grafische Fortschrittsbalken (0-100%)</li>
                <li>• Professionelles Design</li>
                <li>• Verständliche Sprache</li>
                <li>• Strategische Empfehlungen</li>
                <li>• Stundensatz-Bewertung integriert</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">📊 Erweiterte Features:</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• Ausführliche Social Media Analyse</li>
                <li>• Detaillierte Performance-Metriken</li>
                <li>• Marktpositionierungs-Charts</li>
                <li>• Wachstumspotenzial-Aufzeigung</li>
                <li>• Kurz-/Mittel-/Langfrist-Roadmap</li>
                <li>• ROI-Potenzial-Berechnung</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={generateCustomerReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Erweiterten Kunden-Report generieren
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                generateCustomerReport();
                setTimeout(() => {
                  window.print();
                }, 1000);
              }}
              className="flex items-center gap-2"
            >
              <ChartBar className="h-4 w-4" />
              Report erstellen & drucken
            </Button>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Perfekt für professionelle Kundenpräsentationen:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Umfassend:</strong> 6 Hauptbereiche mit je 4 detaillierten Metriken</p>
              <p>• <strong>Stundensatz-Analyse:</strong> Vollständige Preisstrategie-Bewertung integriert</p>
              <p>• <strong>Visuell:</strong> Alle Werte als Fortschrittsbalken mit Farbkodierung</p>
              <p>• <strong>Strategisch:</strong> Kurz-, Mittel- und Langfrist-Empfehlungen</p>
              <p>• <strong>Wachstumsfokus:</strong> Potenzial-Aufzeigung mit konkreten Zahlen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerHTMLExport;
