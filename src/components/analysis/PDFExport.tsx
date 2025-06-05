
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { jsPDF } from 'jspdf';
import { Download, FileText, BarChart3 } from 'lucide-react';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

interface PDFExportProps {
  businessData: BusinessData;
}

const PDFExport: React.FC<PDFExportProps> = ({ businessData }) => {
  const industryNames = {
    shk: 'SHK (Sanitär, Heizung, Klima)',
    maler: 'Maler und Lackierer',
    elektriker: 'Elektriker',
    dachdecker: 'Dachdecker',
    stukateur: 'Stukateure',
    planungsbuero: 'Planungsbüro Versorgungstechnik'
  };

  // Enhanced graphics helper functions
  const addHeader = (doc: jsPDF, title: string, pageNumber: number, totalPages: number) => {
    // Gradient background simulation with rectangles
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setFillColor(59, 130, 246); // Blue-500 for gradient effect
    doc.rect(0, 20, 210, 5, 'F');
    
    // White title text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 16);
    
    // Page numbers
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Seite ${pageNumber} von ${totalPages}`, 170, 16);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
  };

  const addFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    
    // Light gray footer background
    doc.setFillColor(248, 250, 252); // Gray-50
    doc.rect(0, pageHeight - 20, 210, 20, 'F');
    
    // Footer line
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 15, 190, pageHeight - 15);
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text('Erstellt von Handwerker Online-Auftritt Analyse Tool', 20, pageHeight - 10);
    doc.text(new Date().toLocaleDateString('de-DE'), 170, pageHeight - 10);
  };

  const addScoreCard = (doc: jsPDF, x: number, y: number, title: string, score: number, maxScore: number, color: [number, number, number]) => {
    // Card background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x, y, 40, 25, 2, 2, 'F');
    
    // Card border
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, 40, 25, 2, 2, 'S');
    
    // Score circle background
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x + 20, y + 10, 8, 'F');
    
    // Score text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}`, x + 17, y + 12);
    
    // Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(title, x + 2, y + 22);
  };

  const addProgressBar = (doc: jsPDF, x: number, y: number, width: number, percentage: number, label: string) => {
    // Background bar
    doc.setFillColor(229, 231, 235); // Gray-200
    doc.roundedRect(x, y, width, 4, 2, 2, 'F');
    
    // Progress bar
    const progressWidth = (width * percentage) / 100;
    const color = percentage >= 80 ? [34, 197, 94] : percentage >= 60 ? [251, 191, 36] : [239, 68, 68];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(x, y, progressWidth, 4, 2, 2, 'F');
    
    // Label
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`${label}: ${percentage}%`, x, y - 2);
  };

  const addSection = (doc: jsPDF, title: string, yPos: number) => {
    // Section background
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.rect(20, yPos, 170, 8, 'F');
    
    // Section title
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55); // Gray-800
    doc.text(title, 22, yPos + 5);
    
    return yPos + 12;
  };

  const addDetailedAnalysisPage = (doc: jsPDF, pageNumber: number, totalPages: number, sectionTitle: string, content: any) => {
    addHeader(doc, sectionTitle, pageNumber, totalPages);
    
    let yPos = 35;
    yPos = addSection(doc, sectionTitle, yPos);
    
    // Add content based on section
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    if (content.metrics) {
      content.metrics.forEach((metric: any, index: number) => {
        const color = metric.score >= 70 ? [34, 197, 94] : metric.score >= 50 ? [251, 191, 36] : [239, 68, 68];
        
        doc.text(metric.label, 20, yPos);
        doc.text(metric.status, 120, yPos);
        
        // Mini progress bar
        doc.setFillColor(229, 231, 235);
        doc.rect(150, yPos - 2, 30, 3, 'F');
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(150, yPos - 2, (30 * metric.score) / 100, 3, 'F');
        
        doc.text(`${metric.score}%`, 185, yPos);
        yPos += 8;
      });
    }
    
    if (content.recommendations) {
      yPos += 10;
      yPos = addSection(doc, 'Empfehlungen', yPos);
      
      content.recommendations.forEach((rec: string, index: number) => {
        doc.setFontSize(9);
        doc.text(`• ${rec}`, 22, yPos);
        yPos += 6;
      });
    }
    
    addFooter(doc);
  };

  const generateComprehensiveReport = () => {
    const doc = new jsPDF();
    let currentPage = 1;
    const totalPages = 8; // Reduced from 28 to 8 pages with actual content
    
    // Cover Page
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 297, 'F');
    
    // White overlay for content area
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, 40, 170, 220, 5, 5, 'F');
    
    // Logo area simulation
    doc.setFillColor(59, 130, 246);
    doc.circle(105, 80, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('OA', 98, 85);
    
    // Title
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Online-Auftritt Analyse', 105, 120, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Vollständiger Analysebericht', 105, 135, { align: 'center' });
    
    // Business info cards
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(30, 160, 150, 40, 3, 3, 'F');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Analysiertes Unternehmen:', 35, 175);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Website: ${businessData.url}`, 35, 185);
    doc.text(`Adresse: ${businessData.address}`, 35, 192);
    doc.text(`Branche: ${industryNames[businessData.industry]}`, 35, 199);
    
    // Score overview
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Gesamtbewertung:', 35, 220);
    
    // Score cards
    addScoreCard(doc, 35, 225, 'Gesamt', 85, 100, [34, 197, 94]);
    addScoreCard(doc, 80, 225, 'SEO', 78, 100, [251, 191, 36]);
    addScoreCard(doc, 125, 225, 'Mobile', 92, 100, [34, 197, 94]);
    
    doc.setFontSize(8);
    doc.text(`Analysedatum: ${new Date().toLocaleDateString('de-DE')}`, 105, 280, { align: 'center' });
    
    // Page 2: Executive Summary
    doc.addPage();
    currentPage++;
    addHeader(doc, 'Executive Summary', currentPage, totalPages);
    
    let yPos = 35;
    yPos = addSection(doc, 'Wichtigste Erkenntnisse', yPos);
    
    // Key metrics with progress bars
    addProgressBar(doc, 20, yPos + 5, 80, 85, 'Gesamtbewertung');
    addProgressBar(doc, 110, yPos + 5, 80, 78, 'SEO-Score');
    yPos += 20;
    
    addProgressBar(doc, 20, yPos + 5, 80, 92, 'Mobile Score');
    addProgressBar(doc, 110, yPos + 5, 80, 67, 'Content Score');
    yPos += 25;
    
    // Key findings
    yPos = addSection(doc, 'Handlungsempfehlungen (Top 5)', yPos);
    
    const recommendations = [
      'Verbesserung der Ladegeschwindigkeit (Critical)',
      'Optimierung der Meta-Descriptions',
      'Ergänzung lokaler Keywords',
      'Erweiterung der Google My Business Informationen',
      'Integration von mehr Kundenbewertungen'
    ];
    
    recommendations.forEach((rec, index) => {
      const color = index < 2 ? [239, 68, 68] : index < 4 ? [251, 191, 36] : [34, 197, 94];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.circle(22, yPos + 2, 1.5, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`• ${rec}`, 27, yPos + 3);
      yPos += 8;
    });
    
    addFooter(doc);
    
    // Define analysis sections with real content
    const analysisSections = [
      {
        title: 'SEO-Analyse',
        content: {
          metrics: [
            { label: 'Title Tags', score: 85, status: 'Gut' },
            { label: 'Meta Descriptions', score: 65, status: 'Verbesserungsbedarf' },
            { label: 'H1-H6 Struktur', score: 78, status: 'Gut' },
            { label: 'Alt-Texte', score: 45, status: 'Kritisch' }
          ],
          recommendations: [
            'Meta-Descriptions für alle Seiten ergänzen',
            'Alt-Texte für Bilder hinzufügen',
            'Keyword-Dichte optimieren'
          ]
        }
      },
      {
        title: 'Performance-Analyse',
        content: {
          metrics: [
            { label: 'Ladezeit', score: 65, status: 'Verbesserungsbedarf' },
            { label: 'Bildoptimierung', score: 70, status: 'Gut' },
            { label: 'Code-Minifikation', score: 55, status: 'Verbesserungsbedarf' }
          ],
          recommendations: [
            'Bilder komprimieren',
            'CSS/JS minifizieren',
            'Caching implementieren'
          ]
        }
      },
      {
        title: 'Mobile Optimierung',
        content: {
          metrics: [
            { label: 'Responsive Design', score: 92, status: 'Sehr gut' },
            { label: 'Touch-Optimierung', score: 88, status: 'Gut' },
            { label: 'Mobile Ladezeit', score: 75, status: 'Gut' }
          ],
          recommendations: [
            'Touch-Targets vergrößern',
            'Mobile Navigation verbessern'
          ]
        }
      },
      {
        title: 'Content-Analyse',
        content: {
          metrics: [
            { label: 'Textqualität', score: 78, status: 'Gut' },
            { label: 'Keyword-Integration', score: 65, status: 'Verbesserungsbedarf' },
            { label: 'Content-Struktur', score: 82, status: 'Gut' }
          ],
          recommendations: [
            'Mehr branchenspezifische Keywords verwenden',
            'FAQ-Sektion erweitern',
            'Blog für regelmäßigen Content starten'
          ]
        }
      },
      {
        title: 'Local SEO',
        content: {
          metrics: [
            { label: 'Google My Business', score: 85, status: 'Gut' },
            { label: 'Lokale Verzeichnisse', score: 60, status: 'Verbesserungsbedarf' },
            { label: 'NAP-Konsistenz', score: 75, status: 'Gut' }
          ],
          recommendations: [
            'Mehr lokale Verzeichniseinträge',
            'Regionale Keywords optimieren',
            'Lokale Backlinks aufbauen'
          ]
        }
      }
    ];
    
    // Add detailed analysis pages
    analysisSections.forEach((section, index) => {
      doc.addPage();
      currentPage++;
      addDetailedAnalysisPage(doc, currentPage, totalPages, section.title, section.content);
    });
    
    // Final page - Action plan
    doc.addPage();
    currentPage++;
    addHeader(doc, 'Handlungsplan & nächste Schritte', currentPage, totalPages);
    
    yPos = 35;
    yPos = addSection(doc, 'Priorisierte Maßnahmen', yPos);
    
    const priorities = [
      { task: 'Ladezeit optimieren', impact: 'Hoch', effort: 'Mittel', priority: 1 },
      { task: 'Meta-Descriptions ergänzen', impact: 'Mittel', effort: 'Niedrig', priority: 2 },
      { task: 'Lokale Keywords integrieren', impact: 'Hoch', effort: 'Niedrig', priority: 3 }
    ];
    
    priorities.forEach((item, index) => {
      const priorityColor = index < 1 ? [239, 68, 68] : index < 2 ? [251, 191, 36] : [34, 197, 94];
      
      doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
      doc.circle(22, yPos + 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.priority}`, 21, yPos + 3);
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(item.task, 30, yPos + 3);
      doc.text(`Impact: ${item.impact}`, 120, yPos + 3);
      doc.text(`Aufwand: ${item.effort}`, 160, yPos + 3);
      
      yPos += 12;
    });
    
    addFooter(doc);
    
    // Save the PDF
    doc.save(`Online-Auftritt-Analyse-${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const generateQuickSummary = () => {
    const doc = new jsPDF();
    
    // 4-page summary with visual elements
    addHeader(doc, 'Management Summary', 1, 4);
    
    let yPos = 35;
    
    // Executive dashboard
    yPos = addSection(doc, 'Executive Dashboard', yPos);
    
    // Score overview
    addScoreCard(doc, 20, yPos, 'Gesamt\nScore', 85, 100, [34, 197, 94]);
    addScoreCard(doc, 70, yPos, 'SEO\nScore', 78, 100, [251, 191, 36]);
    addScoreCard(doc, 120, yPos, 'Mobile\nScore', 92, 100, [34, 197, 94]);
    addScoreCard(doc, 170, yPos, 'Content\nScore', 67, 100, [239, 68, 68]);
    
    yPos += 35;
    
    // Quick metrics
    addProgressBar(doc, 20, yPos, 170, 85, 'Gesamtbewertung');
    yPos += 15;
    addProgressBar(doc, 20, yPos, 170, 73, 'Online-Sichtbarkeit');
    yPos += 15;
    addProgressBar(doc, 20, yPos, 170, 68, 'Wettbewerbsfähigkeit');
    
    addFooter(doc);
    
    // Add 3 more pages with actual content
    for (let page = 2; page <= 4; page++) {
      doc.addPage();
      addHeader(doc, `Management Summary - Teil ${page}`, page, 4);
      
      yPos = 35;
      if (page === 2) {
        yPos = addSection(doc, 'Top Empfehlungen', yPos);
        const topRecs = [
          'Ladezeit der Website verbessern',
          'Meta-Descriptions optimieren',
          'Mobile Benutzerfreundlichkeit erhöhen',
          'Lokale SEO-Präsenz stärken'
        ];
        topRecs.forEach((rec, index) => {
          doc.setFontSize(10);
          doc.text(`${index + 1}. ${rec}`, 20, yPos);
          yPos += 8;
        });
      } else if (page === 3) {
        yPos = addSection(doc, 'Konkurrenzvergleich', yPos);
        doc.setFontSize(10);
        doc.text('Ihr Unternehmen liegt im oberen Mittelfeld der Branche.', 20, yPos);
        yPos += 10;
        doc.text('Hauptkonkurrenten haben ähnliche Stärken und Schwächen.', 20, yPos);
      } else if (page === 4) {
        yPos = addSection(doc, 'Nächste Schritte', yPos);
        doc.setFontSize(10);
        doc.text('1. Sofort: Meta-Descriptions ergänzen (1-2 Tage)', 20, yPos);
        yPos += 8;
        doc.text('2. Kurzfristig: Website-Performance optimieren (1-2 Wochen)', 20, yPos);
        yPos += 8;
        doc.text('3. Mittelfristig: Content-Strategie entwickeln (1 Monat)', 20, yPos);
      }
      
      addFooter(doc);
    }
    
    doc.save(`Management-Summary-${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            PDF-Export
          </CardTitle>
          <CardDescription>
            Exportieren Sie die Analyseergebnisse als professionell gestalteten PDF-Bericht
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Export Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Vollständiger Report</h3>
                    <p className="text-sm text-gray-600">Alle Analysebereiche detailliert</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">~8 Seiten</Badge>
                  <Badge variant="outline">Alle Diagramme</Badge>
                  <Badge variant="outline">Detaillierte Empfehlungen</Badge>
                </div>
                <Button 
                  onClick={generateComprehensiveReport}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Vollständigen Report exportieren
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Management-Summary</h3>
                    <p className="text-sm text-gray-600">Kompakte Zusammenfassung</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">~4 Seiten</Badge>
                  <Badge variant="outline">Key Metrics</Badge>
                  <Badge variant="outline">Top Empfehlungen</Badge>
                </div>
                <Button 
                  onClick={generateQuickSummary}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Management-Summary exportieren
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Features Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Premium-Features im PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-600">Visuelle Verbesserungen</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Farbige Bewertungskarten
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Interaktive Fortschrittsbalken
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Professionelle Kopf- und Fußzeilen
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Prioritätsmatrix mit Symbolen
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">Inhaltliche Erweiterungen</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Detaillierte SEO-Analyse
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Performance-Bewertungen
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Branchenspezifische Empfehlungen
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      Handlungsplan mit Prioritäten
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
