
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { FileText, Printer } from 'lucide-react';

interface HTMLExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: any;
}

const industryNames = {
  'shk': 'Sanitär, Heizung, Klima',
  'maler': 'Maler & Lackierer',
  'elektriker': 'Elektroinstallation',
  'dachdecker': 'Dachdeckerei',
  'stukateur': 'Stuckateur & Trockenbau',
  'planungsbuero': 'Planungsbüro'
};

const HTMLExport: React.FC<HTMLExportProps> = ({ businessData, realData, manualImprintData, manualSocialData }) => {
  
  const generateHTMLReport = () => {
    const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
    const keywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);
    
    const overallScore = Math.round(
      (realData.seo.score + realData.performance.score + 
       (realData.reviews.google.count > 0 ? 80 : 40) + realData.mobile.overallScore) / 4
    );

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
        .score-overview { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 40px; }
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
        .recommendations { background: #fef3c7; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .recommendations h4 { color: #92400e; margin-bottom: 10px; }
        .recommendations ul { list-style-type: none; }
        .recommendations li { margin-bottom: 8px; padding-left: 20px; position: relative; }
        .recommendations li:before { content: "→"; position: absolute; left: 0; color: #92400e; font-weight: bold; }
        .competitor-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; }
        .competitor-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .keyword-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
        .keyword-item { padding: 8px 12px; background: #f1f5f9; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
        .found { background: #dcfce7; }
        .not-found { background: #fee2e2; }
        
        @media print {
            body { font-size: 12px; }
            .container { max-width: none; padding: 10px; }
            .section { page-break-inside: avoid; margin-bottom: 30px; }
            .score-overview { grid-template-columns: 1fr; gap: 10px; }
            .metric-grid { grid-template-columns: 1fr; gap: 15px; }
            .two-column { grid-template-columns: 1fr; gap: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Online-Auftritt Analyse</h1>
            <div class="subtitle">Vollständige Bewertung für ${realData.company.name}</div>
            <div style="margin-top: 15px; color: #6b7280;">
                Erstellt am ${new Date().toLocaleDateString('de-DE')} | Live-Datenanalyse mit Google APIs
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
                    <p><strong>Analyse-Typ:</strong> <span class="badge-success">Live Google APIs</span></p>
                </div>
            </div>
        </div>

        <!-- Gesamtbewertung -->
        <div class="score-overview">
            <div class="score-card">
                <div class="score-big">${(overallScore/20).toFixed(1)}/5</div>
                <div>Gesamtbewertung</div>
                <div style="margin-top: 10px; color: #6b7280;">${overallScore}/100 Punkte</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.reviews.google.count}</div>
                <div>Google Bewertungen</div>
                <div style="margin-top: 10px; color: #6b7280;">⭐ ${realData.reviews.google.rating}/5</div>
            </div>
            <div class="score-card">
                <div class="score-big">${realData.competitors.length}</div>
                <div>Konkurrenten</div>
                <div style="margin-top: 10px; color: #6b7280;">analysiert</div>
            </div>
        </div>

        <!-- SEO Analyse -->
        <div class="section">
            <h2 class="section-title">🔍 SEO-Analyse</h2>
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
                </div>
                <div class="metric-card">
                    <div class="metric-title">Meta Description</div>
                    <div class="metric-value">${realData.seo.metaDescription ? 'Vorhanden' : 'Fehlt'}</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">H1 Überschriften</div>
                    <div class="metric-value">${realData.seo.headings.h1.length} gefunden</div>
                </div>
            </div>
            ${realData.seo.score < 70 ? `
            <div class="recommendations">
                <h4>Verbesserungsempfehlungen:</h4>
                <ul>
                    <li>Title-Tags für bessere Suchmaschinen-Rankings optimieren</li>
                    <li>Meta-Descriptions für alle wichtigen Seiten hinzufügen</li>
                    <li>Überschriftenstruktur (H1-H3) überarbeiten</li>
                    <li>Alt-Tags für alle Bilder ergänzen</li>
                </ul>
            </div>
            ` : ''}
        </div>

        <!-- Performance Analyse -->
        <div class="section">
            <h2 class="section-title">⚡ Performance-Analyse</h2>
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-title">Performance-Score</div>
                    <div class="metric-value">${realData.performance.score}/100</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${realData.performance.score}%"></div>
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Ladezeit</div>
                    <div class="metric-value">${realData.performance.loadTime}s</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Largest Contentful Paint</div>
                    <div class="metric-value">${realData.performance.lcp}s</div>
                </div>
                <div class="metric-card">
                    <div class="metric-title">Cumulative Layout Shift</div>
                    <div class="metric-value">${realData.performance.cls}</div>
                </div>
            </div>
        </div>

        <!-- Keywords -->
        <div class="section">
            <h2 class="section-title">🎯 Keyword-Analyse</h2>
            <div class="metric-card" style="margin-bottom: 20px;">
                <div class="metric-title">Keywords gefunden</div>
                <div class="metric-value">${keywordsFoundCount}/${realData.keywords.length} (${keywordsScore}%)</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${keywordsScore}%"></div>
                </div>
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

        <!-- Konkurrenzanalyse -->
        <div class="section">
            <h2 class="section-title">⚔️ Konkurrenzanalyse (Erweitert)</h2>
            <div class="metric-card" style="margin-bottom: 20px;">
                <div class="metric-title">Analysierte Konkurrenten in der Region</div>
                <div class="metric-value">${realData.competitors.length} Unternehmen</div>
            </div>
            
            <div class="competitor-list">
                ${realData.competitors.map(competitor => `
                    <div class="competitor-card">
                        <h4 style="color: #1e40af; margin-bottom: 10px;">${competitor.name}</h4>
                        <p><strong>Bewertungen:</strong> ${competitor.rating}/5 (${competitor.reviews} Bewertungen)</p>
                        <p><strong>Entfernung:</strong> ${competitor.distance}</p>
                        <div style="margin-top: 10px;">
                            ${competitor.rating > 4.0 ? '<span class="badge-success">Starker Konkurrent</span>' : 
                              competitor.rating > 3.5 ? '<span class="badge-warning">Durchschnitt</span>' : 
                              '<span class="badge-error">Schwacher Konkurrent</span>'}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="recommendations">
                <h4>Strategische Empfehlungen:</h4>
                <ul>
                    <li>Fokus auf Verbesserung der Google-Bewertungen (aktuell: ${realData.reviews.google.rating}/5)</li>
                    <li>Lokale SEO-Optimierung für bessere Auffindbarkeit in der Region</li>
                    <li>Unique Selling Points hervorheben, um sich von Konkurrenten abzuheben</li>
                    <li>Social Proof und Kundenstimmen prominenter platzieren</li>
                    <li>Regelmäßige Konkurrenzbeobachtung implementieren</li>
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

        <!-- Handlungsempfehlungen -->
        <div class="section">
            <h2 class="section-title">🎯 Prioritäre Handlungsempfehlungen</h2>
            <div class="recommendations">
                <h4>Kurzfristige Maßnahmen (1-4 Wochen):</h4>
                <ul>
                    ${realData.seo.score < 70 ? '<li>SEO-Grundlagen optimieren (Title, Meta, Headings)</li>' : ''}
                    ${realData.imprint.completeness < 80 ? '<li>Impressum vervollständigen</li>' : ''}
                    ${realData.reviews.google.count < 10 ? '<li>Google My Business optimieren und Bewertungen sammeln</li>' : ''}
                    ${realData.mobile.overallScore < 70 ? '<li>Mobile Optimierung verbessern</li>' : ''}
                </ul>
            </div>
            <div class="recommendations" style="margin-top: 15px;">
                <h4>Mittelfristige Maßnahmen (1-3 Monate):</h4>
                <ul>
                    ${realData.performance.score < 70 ? '<li>Website-Performance optimieren</li>' : ''}
                    ${realData.socialMedia.overallScore < 50 ? '<li>Social Media Präsenz ausbauen</li>' : ''}
                    <li>Content-Marketing-Strategie entwickeln</li>
                    <li>Lokale SEO-Optimierung implementieren</li>
                </ul>
            </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>Dieser Bericht wurde am ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE')} erstellt.</p>
            <p>Analysedaten basieren auf Live-Messungen mit Google APIs.</p>
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
            HTML-Export (Druckoptimiert)
          </CardTitle>
          <CardDescription>
            Generiert eine vollständige, druckbare HTML-Analyse mit automatischen Seitenumbrüchen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">✅ Vorteile HTML-Export:</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• Professionelle Formatierung</li>
                <li>• Perfekte Seitenumbrüche</li>
                <li>• Ausführliche Konkurrenzanalyse</li>
                <li>• Direkt als PDF speicherbar</li>
                <li>• Responsive Design</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">📊 Inhalt (20+ Seiten):</h4>
              <ul className="text-sm space-y-1 text-blue-600">
                <li>• Vollständige SEO-Analyse</li>
                <li>• Detaillierte Konkurrenzanalyse</li>
                <li>• Performance-Metriken</li>
                <li>• Mobile & Social Media</li>
                <li>• Handlungsempfehlungen</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={generateHTMLReport}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              HTML-Report generieren
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
            <h4 className="font-semibold text-blue-800 mb-2">💡 Anleitung:</h4>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Auf "HTML-Report generieren" klicken</li>
              <li>Neues Fenster öffnet sich mit dem vollständigen Report</li>
              <li>Strg+P drücken oder über Browser-Menü drucken</li>
              <li>Als PDF speichern oder direkt drucken</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HTMLExport;
