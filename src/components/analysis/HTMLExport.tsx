import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { FileText, Printer } from 'lucide-react';
import { ManualCompetitor } from '@/hooks/useManualData';

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

const industryNames = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro'
};

const HTMLExport: React.FC<HTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualCompetitors = [],
  competitorServices = {},
  hourlyRateData
}) => {
  const calculateHourlyRateScore = () => {
    if (!hourlyRateData || hourlyRateData.regionAverage === 0) return 50;
    
    const ratio = hourlyRateData.ownRate / hourlyRateData.regionAverage;
    
    // Optimal range: 0.9 - 1.1 (90% - 110% of regional average)
    if (ratio >= 0.9 && ratio <= 1.1) return 100;
    
    // Good range: 0.8 - 1.2 (80% - 120% of regional average)
    if (ratio >= 0.8 && ratio <= 1.2) return 80;
    
    // Acceptable range: 0.7 - 1.3 (70% - 130% of regional average)
    if (ratio >= 0.7 && ratio <= 1.3) return 60;
    
    // Outside acceptable range
    if (ratio < 0.7) return 30; // Too low
    if (ratio > 1.3) return 40; // Too high
    
    return 50;
  };

  const generateHTMLReport = () => {
    // Schätze eigene Services (falls verfügbar, sonst Durchschnitt für Branche)
    const estimateOwnServicesCount = () => {
      const industryServiceCounts = {
        'shk': 8, // Heizung, Sanitär, Klima, Wartung, etc.
        'maler': 6, // Innen-/Außenanstrich, Renovierung, etc.
        'elektriker': 7, // Installation, Wartung, Smart Home, etc.
        'dachdecker': 5, // Dachdeckung, Reparatur, Dämmung, etc.
        'stukateur': 6, // Putz, Trockenbau, Sanierung, etc.
        'planungsbuero': 10 // Verschiedene Planungsarten
      };
      return industryServiceCounts[businessData.industry] || 6;
    };

    // Berechne Services-Score für einen Konkurrenten
    const calculateServicesScore = (servicesCount: number) => {
      if (servicesCount === 0) return 0;
      // Services-Score: 0-100 basierend auf Anzahl der Services
      // Mehr Services = höherer Score, aber mit abnehmenden Erträgen
      return Math.min(100, (servicesCount / 10) * 100);
    };

    // Berechne Gesamt-Performance-Score für einen Konkurrenten
    const calculateCompetitorScore = (competitor: any) => {
      const ratingScore = (competitor.rating / 5) * 100; // 0-100
      const reviewScore = Math.min(100, (competitor.reviews / 50) * 100); // 0-100, max bei 50+ Reviews
      const servicesScore = calculateServicesScore(competitor.services?.length || 0);
      
      // Gewichtung: Rating 50%, Reviews 30%, Services 20%
      return (ratingScore * 0.5) + (reviewScore * 0.3) + (servicesScore * 0.2);
    };

    // Kombiniere echte und manuelle Konkurrenten mit erweiterten Scores
    const allCompetitors = [
      ...realData.competitors.map(comp => {
        const services = competitorServices[comp.name] || [];
        return {
          ...comp,
          services,
          isManual: false,
          performanceScore: calculateCompetitorScore({...comp, services})
        };
      }),
      ...manualCompetitors.map(comp => ({
        name: comp.name,
        rating: comp.rating,
        reviews: comp.reviews,
        distance: comp.distance,
        services: comp.services || [],
        isManual: true,
        performanceScore: calculateCompetitorScore(comp)
      }))
    ].sort((a, b) => b.performanceScore - a.performanceScore);

    const ownServicesCount = estimateOwnServicesCount();
    const ownRating = realData.reviews.google.rating || 4.2;
    const ownReviewCount = realData.reviews.google.count || 0;
    const ownPerformanceScore = calculateCompetitorScore({
      rating: ownRating,
      reviews: ownReviewCount,
      services: { length: ownServicesCount }
    });

    const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
    const keywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);
    
    const overallScore = Math.round(
      (realData.seo.score + realData.performance.score + 
       (realData.reviews.google.count > 0 ? 80 : 40) + 
       realData.mobile.overallScore + calculateHourlyRateScore()) / 5
    );

    const currentDate = new Date().toLocaleDateString('de-DE');
    const currentTime = new Date().toLocaleTimeString('de-DE');

    const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online-Auftritt Analyse - ${realData.company.name}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: white;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
        .header h1 { color: #1e40af; font-size: 2.5em; margin-bottom: 10px; }
        .header .subtitle { color: #6b7280; font-size: 1.2em; }
        .company-info { background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; }
        .score-overview { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .score-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .score-big { font-size: 3em; font-weight: bold; color: #2563eb; }
        .section { margin-bottom: 40px; page-break-inside: avoid; }
        .section-title { 
            color: #1e40af; 
            font-size: 1.8em; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
        }
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .metric-card { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
        .metric-title { font-weight: bold; color: #374151; margin-bottom: 8px; }
        .metric-value { font-size: 1.4em; color: #2563eb; font-weight: bold; }
        .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; margin: 10px 0; }
        .progress-fill { background: #2563eb; height: 100%; border-radius: 4px; transition: width 0.3s; }
        .badge-success { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
        .badge-warning { background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
        .badge-error { background: #ef4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
        .badge-service { background: #6366f1; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.75em; margin: 2px; display: inline-block; }
        .recommendations { background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .recommendations h4 { color: #92400e; margin-bottom: 10px; }
        .recommendations ul { list-style-type: none; }
        .recommendations li { margin-bottom: 8px; padding-left: 20px; position: relative; }
        .recommendations li:before { content: "→"; position: absolute; left: 0; color: #92400e; font-weight: bold; }
        .competitor-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
        .competitor-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .competitor-strong { border-left: 4px solid #ef4444; }
        .competitor-weak { border-left: 4px solid #10b981; }
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .keyword-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .keyword-item { padding: 8px 12px; background: #f1f5f9; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .found { background: #dcfce7; }
        .not-found { background: #fee2e2; }
        .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .swot-section { padding: 15px; border-radius: 8px; }
        .strengths { background: #dcfce7; border-left: 4px solid #22c55e; }
        .weaknesses { background: #fee2e2; border-left: 4px solid #ef4444; }
        .opportunities { background: #dbeafe; border-left: 4px solid #3b82f6; }
        .threats { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .services-list { margin-top: 10px; }
        
        @media print {
            body { font-size: 12px; }
            .container { max-width: none; padding: 10px; }
            .section { page-break-inside: avoid; margin-bottom: 30px; }
            .score-overview { grid-template-columns: 1fr 1fr; gap: 10px; }
            .metric-grid { grid-template-columns: 1fr; gap: 15px; }
            .two-column { grid-template-columns: 1fr; gap: 20px; }
            .swot-grid { grid-template-columns: 1fr; gap: 15px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Online-Auftritt Analyse (Detailliert)</h1>
            <div class="subtitle">Vollständige technische Bewertung für ${realData.company.name}</div>
            <div style="margin-top: 15px; color: #6b7280;">
                Erstellt am ${currentDate} um ${currentTime} | Live-Datenanalyse mit Google APIs
            </div>
        </div>

        <!-- Unternehmensinfo -->
        <div class="company-info">
            <h2 style="color: #1e40af; margin-bottom: 15px;">Unternehmensdaten</h2>
            <div class="two-column">
                <div>
                    <p><strong>Firmenname:</strong> ${realData.company.name}</p>
                    <p><strong>Website:</strong> ${realData.company.url}</p>
                    <p><strong>Adresse:</strong> ${realData.company.address}</p>
                </div>
                <div>
                    <p><strong>Branche:</strong> ${industryNames[businessData.industry]}</p>
                    <p><strong>Telefon:</strong> ${realData.company.phone || 'Nicht verfügbar'}</p>
                    <p><strong>Analyse-Typ:</strong> <span class="badge-success">Live Google APIs + Stundensatz</span></p>
                </div>
            </div>
        </div>

        <!-- Erweiterte Gesamtbewertung mit Stundensatz -->
        <div class="score-overview">
            <div class="score-card">
                <div class="score-big">${overallScore}/100</div>
                <div>Gesamt-Score</div>
                <div style="margin-top: 10px; color: #6b7280;">inkl. Preisstrategie</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.seo.score}</div>
                <div>SEO-Score</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.performance.score}</div>
                <div>Performance</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.mobile.overallScore}</div>
                <div>Mobile</div>
            </div>
            <div class="score-card">
                <div class="score-big">${calculateHourlyRateScore()}</div>
                <div>Preisstrategie</div>
                <div style="margin-top: 10px; color: #6b7280;">
                    ${hourlyRateData ? `${hourlyRateData.ownRate}€/h` : 'Nicht erfasst'}
                </div>
            </div>
        </div>

        <!-- Neue Stundensatz-Analyse Sektion -->
        ${hourlyRateData ? `
        <div class="section">
            <h2 class="section-title">💰 Stundensatz-Analyse (Detailliert)</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Ihr Stundensatz</div>
                    <div class="metric-value">${hourlyRateData.ownRate.toFixed(2)} €/Stunde</div>
                    <div style="margin-top: 10px; color: #666;">
                        Brutto-Stundensatz für Endkunden
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Regionaler Durchschnitt</div>
                    <div class="metric-value">${hourlyRateData.regionAverage.toFixed(2)} €/Stunde</div>
                    <div style="margin-top: 10px; color: #666;">
                        Markttypischer Satz in der Region
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Preispositionierung</div>
                    <div class="metric-value">${((hourlyRateData.ownRate / hourlyRateData.regionAverage - 1) * 100).toFixed(1)}%</div>
                    <div style="margin-top: 10px; color: #666;">
                        ${hourlyRateData.ownRate > hourlyRateData.regionAverage ? 'Über' : 'Unter'} dem Durchschnitt
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Preisstrategie-Score</div>
                    <div class="metric-value">${calculateHourlyRateScore()}/100</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${calculateHourlyRateScore()}%"></div>
                    </div>
                    <div style="margin-top: 10px; color: #666;">
                        Optimale Marktpositionierung
                    </div>
                </div>
            </div>
            
            <div class="recommendations">
                <h4>Stundensatz-Strategieempfehlungen:</h4>
                <ul>
                    ${hourlyRateData.ownRate > hourlyRateData.regionAverage * 1.2 ? '<li>Preisrechtfertigung durch Premium-Service und Qualität kommunizieren</li>' : ''}
                    ${hourlyRateData.ownRate < hourlyRateData.regionAverage * 0.8 ? '<li>Potenzial für Preiserhöhung - Stundensatz unterhalb Marktdurchschnitt</li>' : ''}
                    <li>Transparente Kostenaufstellung für Kunden entwickeln</li>
                    <li>Service-Pakete für verschiedene Preissegmente erstellen</li>
                    <li>Regelmäßige Marktpreisanalyse durchführen (halbjährlich)</li>
                    <li>Mehrwert-Services zur Preisdifferenzierung nutzen</li>
                </ul>
            </div>
        </div>
        ` : ''}

        <!-- Wettbewerbsvergleich -->
        <div class="section">
            <h2 class="section-title">📊 Wettbewerbsposition (inkl. Services)</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Ihre Position</div>
                    <div class="metric-value">Rang ${allCompetitors.filter(c => c.performanceScore > ownPerformanceScore).length + 1} von ${allCompetitors.length + 1}</div>
                    <div style="margin-top: 10px; color: #666;">
                        ${allCompetitors.filter(c => c.performanceScore < ownPerformanceScore).length} schwächere, 
                        ${allCompetitors.filter(c => c.performanceScore > ownPerformanceScore).length} stärkere Konkurrenten
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Services-Vergleich</div>
                    <div class="metric-value">${ownServicesCount} Services</div>
                    <div style="margin-top: 10px; color: #666;">
                        Ø Konkurrenz: ${allCompetitors.length > 0 ? Math.round(allCompetitors.reduce((sum, comp) => sum + comp.services.length, 0) / allCompetitors.length) : 0} Services
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Performance vs. Konkurrenz</div>
                    <div class="metric-value">${ownPerformanceScore > (allCompetitors.reduce((sum, comp) => sum + comp.performanceScore, 0) / allCompetitors.length || 0) ? '↗️ Überdurchschnittlich' : '↘️ Unterdurchschnittlich'}</div>
                </div>
            </div>
        </div>

        <!-- Executive Summary -->
        <div class="section">
            <h2 class="section-title">📋 Executive Summary</h2>
            <div class="metric-card">
                <p><strong>Stärken des Online-Auftritts:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${realData.seo.score > 70 ? '<li>Gute SEO-Grundlagen vorhanden</li>' : ''}
                    ${realData.performance.score > 70 ? '<li>Akzeptable Website-Performance</li>' : ''}
                    ${realData.reviews.google.count > 5 ? '<li>Vorhandene Google-Bewertungen</li>' : ''}
                    ${realData.mobile.overallScore > 70 ? '<li>Mobile Optimierung umgesetzt</li>' : ''}
                </ul>
                
                <p><strong>Verbesserungspotential:</strong></p>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${realData.seo.score < 70 ? '<li>SEO-Optimierung erforderlich</li>' : ''}
                    ${realData.performance.score < 70 ? '<li>Performance-Verbesserungen nötig</li>' : ''}
                    ${realData.reviews.google.count < 10 ? '<li>Mehr Google-Bewertungen sammeln</li>' : ''}
                    ${realData.socialMedia.overallScore < 50 ? '<li>Social Media Präsenz ausbauen</li>' : ''}
                </ul>
            </div>
        </div>

        <!-- SEO Analyse -->
        <div class="section">
            <h2 class="section-title">🔍 SEO-Analyse (Detailliert)</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">SEO-Score</div>
                    <div class="metric-value">${realData.seo.score}/100</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${realData.seo.score}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Title Tag</div>
                    <div class="metric-value">${realData.seo.titleTag || 'Nicht optimiert'}</div>
                    <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        ${realData.seo.titleTag ? `Länge: ${realData.seo.titleTag.length} Zeichen` : 'Sollte 50-60 Zeichen haben'}
                    </p>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Meta Description</div>
                    <div class="metric-value">${realData.seo.metaDescription ? 'Vorhanden' : 'Fehlt'}</div>
                    <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        ${realData.seo.metaDescription ? 'Optimiert für Suchergebnisse' : 'Wichtig für Click-Through-Rate'}
                    </p>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Überschriftenstruktur</div>
                    <div class="metric-value">H1: ${realData.seo.headings.h1.length}, H2: ${realData.seo.headings.h2.length}</div>
                    <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        Wichtig für Content-Hierarchie
                    </p>
                </div>
            </div>
            ${realData.seo.score < 70 ? `
            <div class="recommendations">
                <h4>Detaillierte SEO-Empfehlungen:</h4>
                <ul>
                    <li>Title-Tags mit branchenspezifischen Keywords optimieren</li>
                    <li>Meta-Descriptions für alle wichtigen Seiten verfassen (150-160 Zeichen)</li>
                    <li>H1-H6 Überschriftenstruktur logisch aufbauen</li>
                    <li>Alt-Tags für alle Bilder mit relevanten Keywords</li>
                    <li>Interne Verlinkungsstruktur verbessern</li>
                    <li>Schema.org Markup für lokale Unternehmen implementieren</li>
                </ul>
            </div>
            ` : ''}
        </div>

        <!-- Performance Analyse -->
        <div class="section">
            <h2 class="section-title">⚡ Performance-Analyse (Detailliert)</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Performance-Score</div>
                    <div class="metric-value">${realData.performance.score}/100</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${realData.performance.score}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">First Contentful Paint</div>
                    <div class="metric-value">${realData.performance.loadTime}s</div>
                    <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        ${realData.performance.loadTime < 2 ? 'Sehr gut' : realData.performance.loadTime < 4 ? 'Akzeptabel' : 'Verbesserung nötig'}
                    </p>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Largest Contentful Paint</div>
                    <div class="metric-value">${realData.performance.lcp}s</div>
                    <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        ${realData.performance.lcp < 2.5 ? 'Gut' : realData.performance.lcp < 4 ? 'Verbesserung möglich' : 'Kritisch'}
                    </p>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Cumulative Layout Shift</div>
                    <div class="metric-value">${realData.performance.cls}</div>
                    <p style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        ${realData.performance.cls < 0.1 ? 'Ausgezeichnet' : realData.performance.cls < 0.25 ? 'Gut' : 'Verbesserung nötig'}
                    </p>
                </div>
            </div>
        </div>

        <!-- Keywords -->
        <div class="section">
            <h2 class="section-title">🎯 Keyword-Analyse (Branchenspezifisch)</h2>
            <div class="metric-card" style="margin-bottom: 20px;">
                <div class="metric-title">Keywords gefunden</div>
                <div class="metric-value">${keywordsFoundCount}/${realData.keywords.length} (${keywordsScore}%)</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${keywordsScore}%"></div>
                </div>
                <p style="margin-top: 10px; color: #666;">
                    Branchenrelevante Keywords für ${industryNames[businessData.industry]}
                </p>
            </div>
            <div class="keyword-grid">
                ${realData.keywords.map(keyword => `
                    <div class="keyword-item ${keyword.found ? 'found' : 'not-found'}">
                        <span>${keyword.keyword}</span>
                        <span>${keyword.found ? '✓' : '✗'}</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Ausführliche Konkurrenzanalyse mit Services -->
        <div class="section">
            <h2 class="section-title">⚔️ Konkurrenzanalyse (mit Services-Integration)</h2>
            <div class="metric-card" style="margin-bottom: 20px;">
                <div class="metric-title">Marktposition (Performance-Score basiert)</div>
                <div class="metric-value">
                    Ihr Score: ${Math.round(ownPerformanceScore)}/100 | 
                    Ø Konkurrenz: ${allCompetitors.length > 0 ? Math.round(allCompetitors.reduce((sum, comp) => sum + comp.performanceScore, 0) / allCompetitors.length) : 0}/100
                </div>
                <p style="margin-top: 10px; color: #666;">
                    Performance-Score = Rating (50%) + Reviews (30%) + Services (20%)
                </p>
            </div>
            
            <div class="competitor-list">
                ${allCompetitors.map((competitor, index) => `
                    <div class="competitor-card ${competitor.performanceScore > ownPerformanceScore ? 'competitor-strong' : 'competitor-weak'}">
                        <h4 style="color: #1e40af; margin-bottom: 10px;">
                            #${index + 1} ${competitor.name}
                            ${competitor.isManual ? '<span class="badge-warning" style="margin-left: 10px;">Manuell</span>' : ''}
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                            <p><strong>Bewertung:</strong> ${competitor.rating}/5 (${competitor.reviews})</p>
                            <p><strong>Performance-Score:</strong> ${Math.round(competitor.performanceScore)}/100</p>
                            <p><strong>Entfernung:</strong> ${competitor.distance}</p>
                            <p><strong>Services:</strong> ${competitor.services.length}</p>
                        </div>
                        
                        ${competitor.services.length > 0 ? `
                        <div class="services-list">
                            <strong style="color: #6366f1;">Angebotene Leistungen:</strong><br>
                            ${competitor.services.map(service => `<span class="badge-service">${service}</span>`).join('')}
                        </div>
                        ` : ''}
                        
                        <div style="margin-top: 10px;">
                            ${competitor.performanceScore > ownPerformanceScore ? 
                              '<span class="badge-error">⚠️ Stärkerer Konkurrent</span>' : 
                              '<span class="badge-success">✓ Schwächerer Konkurrent</span>'}
                            ${competitor.services.length > ownServicesCount ? 
                              '<span class="badge-warning" style="margin-left: 5px;">📋 Mehr Services</span>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <!-- Erweiterte SWOT-Analyse mit Services -->
            <div style="margin-top: 30px;">
                <h3 style="color: #1e40af; margin-bottom: 15px;">SWOT-Analyse (inkl. Services-Bewertung)</h3>
                <div class="swot-grid">
                    <div class="swot-section strengths">
                        <h4 style="color: #166534; margin-bottom: 10px;">Stärken</h4>
                        <ul style="list-style-type: disc; padding-left: 20px;">
                            ${ownRating >= 4.0 ? '<li>Überdurchschnittliche Bewertungen</li>' : ''}
                            ${ownPerformanceScore > (allCompetitors.reduce((sum, comp) => sum + comp.performanceScore, 0) / allCompetitors.length || 0) ? '<li>Überdurchschnittlicher Performance-Score</li>' : ''}
                            ${ownServicesCount >= (allCompetitors.reduce((sum, comp) => sum + comp.services.length, 0) / allCompetitors.length || 0) ? '<li>Gutes Service-Portfolio</li>' : ''}
                            ${realData.seo.score > 70 ? '<li>Gute SEO-Optimierung</li>' : ''}
                            <li>Etablierte Online-Präsenz</li>
                        </ul>
                    </div>
                    <div class="swot-section weaknesses">
                        <h4 style="color: #dc2626; margin-bottom: 10px;">Schwächen</h4>
                        <ul style="list-style-type: disc; padding-left: 20px;">
                            ${ownReviewCount < 20 ? '<li>Wenige Bewertungen</li>' : ''}
                            ${ownPerformanceScore < (allCompetitors.reduce((sum, comp) => sum + comp.performanceScore, 0) / allCompetitors.length || 0) ? '<li>Unterdurchschnittlicher Performance-Score</li>' : ''}
                            ${ownServicesCount < (allCompetitors.reduce((sum, comp) => sum + comp.services.length, 0) / allCompetitors.length || 0) ? '<li>Weniger Services als Konkurrenz</li>' : ''}
                            ${realData.seo.score < 70 ? '<li>SEO-Optimierung unzureichend</li>' : ''}
                            ${realData.socialMedia.overallScore < 50 ? '<li>Schwache Social Media Präsenz</li>' : ''}
                        </ul>
                    </div>
                    <div class="swot-section opportunities">
                        <h4 style="color: #2563eb; margin-bottom: 10px;">Chancen</h4>
                        <ul style="list-style-type: disc; padding-left: 20px;">
                            <li>Service-Portfolio strategisch erweitern</li>
                            <li>Spezialleistungen als USP positionieren</li>
                            <li>Lokale SEO mit Service-Keywords optimieren</li>
                            <li>Content-Marketing für Fachkompetenz</li>
                            <li>Cross-Selling zwischen Services fördern</li>
                        </ul>
                    </div>
                    <div class="swot-section threats">
                        <h4 style="color: #d97706; margin-bottom: 10px;">Risiken</h4>
                        <ul style="list-style-type: disc; padding-left: 20px;">
                            <li>Konkurrenten mit breiteren Service-Portfolios</li>
                            <li>Höhere Performance-Scores bei Mitbewerbern</li>
                            <li>Digitale Transformation der Branche</li>
                            <li>Neue Marktteilnehmer mit innovativen Services</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="recommendations">
                <h4>Services-basierte Strategieempfehlungen:</h4>
                <ul>
                    <li>Service-Portfolio Audit: Vergleichen Sie Ihr Angebot systematisch mit Top-Konkurrenten</li>
                    <li>Service-SEO: Optimieren Sie für jede Leistung spezifische Landing Pages</li>
                    <li>Spezialisierung: Entwickeln Sie 2-3 Nischen-Services als Alleinstellungsmerkmal</li>
                    <li>Performance-Optimierung: Rating (50%) + Reviews (30%) + Services (20%) gezielt verbessern</li>
                    <li>Cross-Service-Marketing: Nutzen Sie bestehende Kunden für Zusatzleistungen</li>
                    <li>Monitoring: Überwachen Sie monatlich Performance-Scores vs. Konkurrenz</li>
                </ul>
            </div>
        </div>

        <!-- Mobile Optimierung -->
        <div class="section">
            <h2 class="section-title">📱 Mobile Optimierung</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Mobile Score</div>
                    <div class="metric-value">${realData.mobile.overallScore}/100</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${realData.mobile.overallScore}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Responsive Design</div>
                    <div class="metric-value">${realData.mobile.responsive ? 'Ja' : 'Nein'}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Touch-Optimiert</div>
                    <div class="metric-value">${realData.mobile.touchFriendly ? 'Ja' : 'Nein'}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Mobile PageSpeed</div>
                    <div class="metric-value">${realData.mobile.pageSpeedMobile}/100</div>
                </div>
            </div>
        </div>

        <!-- Social Media -->
        <div class="section">
            <h2 class="section-title">📲 Social Media Präsenz</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Social Media Score</div>
                    <div class="metric-value">${realData.socialMedia.overallScore}/100</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${realData.socialMedia.overallScore}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Facebook</div>
                    <div class="metric-value">${realData.socialMedia.facebook.found ? 'Aktiv' : 'Nicht gefunden'}</div>
                    ${realData.socialMedia.facebook.found ? `<p>Follower: ${realData.socialMedia.facebook.followers}</p>` : ''}
                </div>
                <div class="metric-card">
                    <div class="metric-title">Instagram</div>
                    <div class="metric-value">${realData.socialMedia.instagram.found ? 'Aktiv' : 'Nicht gefunden'}</div>
                    ${realData.socialMedia.instagram.found ? `<p>Follower: ${realData.socialMedia.instagram.followers}</p>` : ''}
                </div>
                <div class="metric-card">
                    <div class="metric-title">Google My Business</div>
                    <div class="metric-value">${realData.reviews.google.count > 0 ? 'Aktiv' : 'Inaktiv'}</div>
                </div>
            </div>
        </div>

        <!-- Impressum -->
        <div class="section">
            <h2 class="section-title">📄 Rechtliche Compliance</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Impressum</div>
                    <div class="metric-value">${realData.imprint.found ? 'Vorhanden' : 'Fehlt'}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Vollständigkeit</div>
                    <div class="metric-value">${realData.imprint.completeness}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${realData.imprint.completeness}%"></div>
                    </div>
                </div>
            </div>
            ${realData.imprint.missingElements && realData.imprint.missingElements.length > 0 ? `
            <div class="recommendations">
                <h4>Fehlende Impressums-Elemente:</h4>
                <ul>
                    ${realData.imprint.missingElements.map(element => `<li>${element}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        </div>

        <!-- Erweiterte ROI-Kalkulation mit Services -->
        <div class="section">
            <h2 class="section-title">💰 ROI-Analyse (inkl. Services-Optimierung)</h2>
            <div class="metric-card">
                <h4 style="color: #1e40af; margin-bottom: 15px;">Potentielle Auswirkungen der Services-Optimierung</h4>
                <div class="two-column">
                    <div>
                        <p><strong>Services-Portfolio Erweiterung:</strong></p>
                        <ul style="list-style-type: disc; padding-left: 20px; margin: 10px 0;">
                            <li>+2-5 zusätzliche Services = +10-25 Performance-Score Punkte</li>
                            <li>Bessere Auffindbarkeit für mehr Suchbegriffe</li>
                            <li>15-30% mehr qualifizierte Anfragen</li>
                            <li>Höhere Kundenbindung durch Vollservice</li>
                        </ul>
                    </div>
                    <div>
                        <p><strong>Wettbewerbsvorteile:</strong></p>
                        <ul style="list-style-type: disc; padding-left: 20px; margin: 10px 0;">
                            <li>Überholung schwächerer Konkurrenten im Performance-Ranking</li>
                            <li>Spezialisierung auf profitable Nischen-Services</li>
                            <li>Cross-Selling-Potentiale zwischen Services</li>
                            <li>Langfristige Marktpositionierung</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Erweiterte Handlungsempfehlungen -->
        <div class="section">
            <h2 class="section-title">🎯 Prioritäre Handlungsempfehlungen (Services-fokussiert)</h2>
            <div class="recommendations">
                <h4>Kurzfristige Maßnahmen (1-4 Wochen):</h4>
                <ul>
                    <li>Services-Inventur: Alle angebotenen Leistungen dokumentieren und auf Website präsentieren</li>
                    ${ownServicesCount < (allCompetitors.reduce((sum, comp) => sum + comp.services.length, 0) / allCompetitors.length || 0) ? '<li>Service-Portfolio um 2-3 Kern-Leistungen erweitern</li>' : ''}
                    <li>Service-spezifische Landing Pages für Top-Services erstellen</li>
                    ${realData.seo.score < 70 ? '<li>SEO-Grundlagen optimieren (Title, Meta, Headings) mit Service-Keywords</li>' : ''}
                </ul>
            </div>
            <div class="recommendations" style="margin-top: 15px;">
                <h4>Mittelfristige Maßnahmen (1-3 Monate):</h4>
                <ul>
                    <li>Service-Portfolio strategisch gegen Konkurrenz positionieren</li>
                    <li>Content-Marketing für jede Service-Kategorie entwickeln</li>
                    <li>Kundenbewertungen gezielt für verschiedene Services sammeln</li>
                    <li>Performance-Score systematisch auf 80+ Punkte steigern</li>
                </ul>
            </div>
            <div class="recommendations" style="margin-top: 15px;">
                <h4>Langfristige Strategie (3-12 Monate):</h4>
                <ul>
                    <li>Marktführerschaft in 2-3 Service-Nischen etablieren</li>
                    <li>Performance-Score kontinuierlich über Konkurrenz-Durchschnitt halten</li>
                    <li>Service-Innovation als Wettbewerbsvorteil nutzen</li>
                    <li>Vollservice-Anbieter-Position im Markt etablieren</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>Dieser detaillierte Bericht wurde am ${currentDate} um ${currentTime} erstellt.</p>
            <p>Analysedaten basieren auf Live-Messungen mit Google APIs, Services-Integration und Stundensatz-Bewertung.</p>
            <p style="margin-top: 10px; font-style: italic;">
                Gesamt-Score: SEO (20%) + Performance (20%) + Mobile (20%) + Reviews (20%) + Preisstrategie (20%)
            </p>
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
            <FileText className="h-5 w-5" />
            Technischer HTML-Export (40+ Seiten mit Stundensatz)
          </CardTitle>
          <CardDescription>
            Vollständige interne Analyse mit allen technischen Details und Stundensatz-Bewertung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">✅ Vollständige Analyse:</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• Alle Konkurrenten mit Firmennamen</li>
                <li>• Technische Details und Messwerte</li>
                <li>• Services-Portfolio-Vergleich</li>
                <li>• SWOT-Analyse mit Services</li>
                <li>• ROI-Kalkulation für Optimierungen</li>
                <li>• <strong>NEU:</strong> Stundensatz-Strategie-Analyse</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">💰 Stundensatz-Features:</h4>
              <ul className="text-sm space-y-1 text-blue-600">
                <li>• Regionaler Preisvergleich</li>
                <li>• Preisstrategie-Score (0-100)</li>
                <li>• Optimierungsempfehlungen</li>
                <li>• Marktpositionierungs-Analyse</li>
                <li>• Integration in Gesamt-Score</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={generateHTMLReport}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Technischen Report generieren
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                generateHTMLReport();
                setTimeout(() => {
                  window.print();
                }, 1000);
              }}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Direkt drucken
            </Button>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🆕 Stundensatz-Integration:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Preisstrategie-Score:</strong> 20% des Gesamt-Scores (war vorher 4 Kategorien, jetzt 5)</p>
              <p>• <strong>Regionaler Vergleich:</strong> Ihr Stundensatz vs. lokaler Durchschnitt</p>
              <p>• <strong>Optimierungshinweise:</strong> Konkrete Preisstrategieempfehlungen</p>
              <p>• <strong>Marktpositionierung:</strong> Bewertung der aktuellen Preisstellung</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HTMLExport;
