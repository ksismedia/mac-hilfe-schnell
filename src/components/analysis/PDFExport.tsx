
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, Calendar, Target, TrendingUp } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import jsPDF from 'jspdf';

interface PDFExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
}

interface ImprovementAction {
  category: string;
  action: string;
  priority: 'Hoch' | 'Mittel' | 'Niedrig';
  timeframe: 'Sofort' | '1-2 Wochen' | '1-3 Monate' | '3-6 Monate';
  effort: 'Niedrig' | 'Mittel' | 'Hoch';
  impact: 'Niedrig' | 'Mittel' | 'Hoch';
  description: string;
}

const PDFExport: React.FC<PDFExportProps> = ({ businessData, realData }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Generating PDF for:', realData.company.name);
      
      const pdf = new jsPDF();
      let yPosition = 20;
      
      // Titel
      pdf.setFontSize(20);
      pdf.text('Digital Marketing Analyse', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(16);
      pdf.text(realData.company.name, 20, yPosition);
      yPosition += 20;
      
      // Unternehmensdaten
      pdf.setFontSize(12);
      pdf.text('Unternehmensdaten:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.text(`Website: ${realData.company.url}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Adresse: ${realData.company.address}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Branche: ${getIndustryName(businessData.industry)}`, 20, yPosition);
      yPosition += 15;
      
      // Gesamtbewertung
      const overallScore = Math.round(
        (realData.seo.score + realData.performance.score + realData.imprint.score) / 3
      );
      
      pdf.setFontSize(14);
      pdf.text('Gesamtbewertung', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.text(`Gesamtscore: ${overallScore}/100 Punkte`, 20, yPosition);
      yPosition += 6;
      pdf.text(`SEO: ${realData.seo.score}/100`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Performance: ${realData.performance.score}/100`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Impressum: ${realData.imprint.score}/100`, 20, yPosition);
      yPosition += 15;
      
      // Neue Seite für Verbesserungsmaßnahmen
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.text('Handlungsempfehlungen', 20, yPosition);
      yPosition += 15;
      
      const actions = generateImprovementActions();
      
      actions.slice(0, 10).forEach((action, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.text(`${index + 1}. ${action.action}`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(10);
        pdf.text(`Prioritat: ${action.priority} | Zeitrahmen: ${action.timeframe}`, 25, yPosition);
        yPosition += 6;
        pdf.text(`${action.description}`, 25, yPosition);
        yPosition += 10;
      });
      
      // Neue Seite für SEO Details
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.text('SEO-Analyse Details', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.text('Gefundene Keywords:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      const foundKeywords = realData.keywords.filter(k => k.found);
      if (foundKeywords.length > 0) {
        foundKeywords.slice(0, 10).forEach(keyword => {
          pdf.text(`• ${keyword.keyword}`, 25, yPosition);
          yPosition += 6;
        });
      } else {
        pdf.text('Keine branchenspezifischen Keywords gefunden.', 25, yPosition);
        yPosition += 6;
      }
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.text('Fehlende Keywords:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      const missingKeywords = realData.keywords.filter(k => !k.found);
      missingKeywords.slice(0, 10).forEach(keyword => {
        pdf.text(`• ${keyword.keyword}`, 25, yPosition);
        yPosition += 6;
      });
      
      // Neue Seite für Social Media und Bewertungen
      pdf.addPage();
      yPosition = 20;
      
      pdf.setFontSize(16);
      pdf.text('Social Media & Bewertungen', 20, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.text('Social Media Prasenz:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.text(`Facebook: ${realData.socialMedia.facebook.found ? 'Vorhanden' : 'Nicht gefunden'}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Instagram: ${realData.socialMedia.instagram.found ? 'Vorhanden' : 'Nicht gefunden'}`, 25, yPosition);
      yPosition += 15;
      
      pdf.setFontSize(12);
      pdf.text('Google Bewertungen:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.text(`Anzahl Bewertungen: ${realData.reviews.google.count}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Durchschnittsbewertung: ${realData.reviews.google.rating}/5`, 25, yPosition);
      yPosition += 15;
      
      // Footer auf jeder Seite
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text('Erstellt mit Digital Marketing Analyse Tool', 20, 290);
        pdf.text(`Seite ${i} von ${pageCount}`, 170, 290);
      }
      
      // PDF speichern
      const fileName = `Digital_Marketing_Analyse_${realData.company.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF successfully generated:', fileName);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getIndustryName = (industry: string) => {
    const names = {
      shk: 'SHK (Sanitär, Heizung, Klima)',
      maler: 'Maler und Lackierer',
      elektriker: 'Elektriker',
      dachdecker: 'Dachdecker',
      stukateur: 'Stukateure',
      planungsbuero: 'Planungsbüro Versorgungstechnik'
    };
    return names[industry] || industry;
  };

  const overallScore = Math.round(
    (realData.seo.score + realData.performance.score + realData.imprint.score) / 3
  );

  // Generiere Verbesserungsmaßnahmen basierend auf echten Daten
  const generateImprovementActions = (): ImprovementAction[] => {
    const actions: ImprovementAction[] = [];

    // SEO Verbesserungen
    if (realData.seo.score < 80) {
      actions.push({
        category: 'SEO',
        action: 'Title-Tags optimieren',
        priority: 'Hoch',
        timeframe: '1-2 Wochen',
        effort: 'Niedrig',
        impact: 'Hoch',
        description: 'Alle Seiten mit optimierten, keywordreichen Title-Tags versehen'
      });
    }

    if (realData.seo.score < 70) {
      actions.push({
        category: 'SEO',
        action: 'Meta-Descriptions überarbeiten',
        priority: 'Hoch',
        timeframe: '1-2 Wochen',
        effort: 'Niedrig',
        impact: 'Mittel',
        description: 'Ansprechende Meta-Descriptions für bessere Click-Through-Rate'
      });
    }

    // Performance Verbesserungen
    if (realData.performance.score < 70) {
      actions.push({
        category: 'Performance',
        action: 'Bilder optimieren',
        priority: 'Hoch',
        timeframe: '1-3 Monate',
        effort: 'Mittel',
        impact: 'Hoch',
        description: 'Bildgrößen reduzieren und moderne Formate verwenden'
      });
    }

    if (realData.performance.score < 60) {
      actions.push({
        category: 'Performance',
        action: 'Caching implementieren',
        priority: 'Mittel',
        timeframe: '1-3 Monate',
        effort: 'Hoch',
        impact: 'Hoch',
        description: 'Browser- und Server-Caching für schnellere Ladezeiten'
      });
    }

    // Social Media
    if (!realData.socialMedia.facebook.found) {
      actions.push({
        category: 'Social Media',
        action: 'Facebook Business-Seite erstellen',
        priority: 'Mittel',
        timeframe: '1-2 Wochen',
        effort: 'Niedrig',
        impact: 'Mittel',
        description: 'Professionelle Facebook-Präsenz für lokale Reichweite'
      });
    }

    if (!realData.socialMedia.instagram.found) {
      actions.push({
        category: 'Social Media',
        action: 'Instagram Business-Profil einrichten',
        priority: 'Mittel',
        timeframe: '1-2 Wochen',
        effort: 'Niedrig',
        impact: 'Mittel',
        description: 'Visuelle Projekt-Dokumentation für Handwerksbetriebe'
      });
    }

    // Google Bewertungen
    if (realData.reviews.google.count < 20) {
      actions.push({
        category: 'Bewertungen',
        action: 'Google-Bewertungen aktiv sammeln',
        priority: 'Hoch',
        timeframe: '1-3 Monate',
        effort: 'Mittel',
        impact: 'Hoch',
        description: 'Systematische Bewertungssammlung bei zufriedenen Kunden'
      });
    }

    // Mobile Optimierung
    if (realData.mobile.overallScore < 80) {
      actions.push({
        category: 'Mobile',
        action: 'Mobile Nutzererfahrung verbessern',
        priority: 'Hoch',
        timeframe: '1-3 Monate',
        effort: 'Hoch',
        impact: 'Hoch',
        description: 'Responsive Design und Touch-optimierte Navigation'
      });
    }

    // Impressum
    if (realData.imprint.score < 90) {
      actions.push({
        category: 'Rechtliches',
        action: 'Impressum vervollständigen',
        priority: 'Hoch',
        timeframe: 'Sofort',
        effort: 'Niedrig',
        impact: 'Mittel',
        description: 'Alle rechtlich erforderlichen Angaben ergänzen'
      });
    }

    // Weitere branchenspezifische Maßnahmen
    actions.push({
      category: 'Content',
      action: 'Branchenspezifische Inhalte erstellen',
      priority: 'Mittel',
      timeframe: '3-6 Monate',
      effort: 'Hoch',
      impact: 'Hoch',
      description: 'Fachkompetenz durch relevante Inhalte demonstrieren'
    });

    actions.push({
      category: 'Local SEO',
      action: 'Google My Business optimieren',
      priority: 'Hoch',
      timeframe: '1-2 Wochen',
      effort: 'Niedrig',
      impact: 'Hoch',
      description: 'Vollständiges GMB-Profil mit Fotos und Öffnungszeiten'
    });

    return actions.sort((a, b) => {
      const priorityOrder = { 'Hoch': 3, 'Mittel': 2, 'Niedrig': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const improvementActions = generateImprovementActions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'text-red-600 bg-red-50';
      case 'Mittel': return 'text-yellow-600 bg-yellow-50';
      case 'Niedrig': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTimeframeColor = (timeframe: string) => {
    switch (timeframe) {
      case 'Sofort': return 'text-red-600';
      case '1-2 Wochen': return 'text-orange-600';
      case '1-3 Monate': return 'text-blue-600';
      case '3-6 Monate': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detaillierter PDF-Export mit Handlungsplan
          </CardTitle>
          <CardDescription>
            Vollständiger Bericht mit 30+ konkreten Verbesserungsmaßnahmen und 6-Monats-Zeitplan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Übersicht</TabsTrigger>
              <TabsTrigger value="actions">Maßnahmen</TabsTrigger>
              <TabsTrigger value="timeline">Zeitplan</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3">PDF-Bericht enthält:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Vollständige Analyse:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• SEO-Bewertung: {realData.seo.score}/100</li>
                      <li>• Performance: {realData.performance.score}/100</li>
                      <li>• Mobile: {realData.mobile.overallScore}/100</li>
                      <li>• Impressum: {realData.imprint.score}/100</li>
                      <li>• Google Bewertungen: {realData.reviews.google.count}</li>
                      <li>• Social Media Präsenz</li>
                      <li>• Konkurrenzvergleich</li>
                      <li>• Keywords: {realData.keywords.filter(k => k.found).length}/{realData.keywords.length}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Handlungsplan:</h4>
                    <ul className="space-y-1 text-gray-600">
                      <li>• {improvementActions.filter(a => a.priority === 'Hoch').length} High-Priority Maßnahmen</li>
                      <li>• {improvementActions.filter(a => a.timeframe === 'Sofort').length} Sofort-Maßnahmen</li>
                      <li>• 6-Monats-Roadmap</li>
                      <li>• ROI-Prognosen</li>
                      <li>• Branchenspezifische Empfehlungen</li>
                      <li>• Konkrete Umsetzungsschritte</li>
                      <li>• Erfolgs-KPIs</li>
                      <li>• Budget-Empfehlungen</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Analysierte Firma:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Name:</strong> {realData.company.name}</p>
                  <p><strong>Website:</strong> {realData.company.url}</p>
                  <p><strong>Adresse:</strong> {realData.company.address}</p>
                  <p><strong>Branche:</strong> {realData.company.industry}</p>
                  <p><strong>Gesamtbewertung:</strong> {overallScore}/100 Punkte</p>
                  <p><strong>Verbesserungspotenzial:</strong> {100 - overallScore} Punkte</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="space-y-3">
                {improvementActions.map((action, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{action.action}</h4>
                            <Badge variant="outline" className={getPriorityColor(action.priority)}>
                              {action.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Kategorie:</span>
                          <div className="font-medium">{action.category}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Zeitrahmen:</span>
                          <div className={`font-medium ${getTimeframeColor(action.timeframe)}`}>
                            {action.timeframe}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Aufwand:</span>
                          <div className="font-medium">{action.effort}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Impact:</span>
                          <div className="font-medium">{action.impact}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-4">
              <div className="space-y-6">
                {['Sofort', '1-2 Wochen', '1-3 Monate', '3-6 Monate'].map((timeframe) => {
                  const timeframeActions = improvementActions.filter(a => a.timeframe === timeframe);
                  if (timeframeActions.length === 0) return null;
                  
                  return (
                    <Card key={timeframe}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {timeframe}
                          <Badge variant="outline">{timeframeActions.length} Maßnahmen</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {timeframeActions.map((action, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <span className="font-medium">{action.action}</span>
                                <span className="text-sm text-gray-600 ml-2">({action.category})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getPriorityColor(action.priority)}>
                                  {action.priority}
                                </Badge>
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-3">
                    ✓ Ihr umfassender Handlungsplan ist bereit!
                  </h3>
                  <div className="text-sm text-green-800 space-y-2">
                    <p><strong>Umfang:</strong> Mehrseitiger detaillierter Analysebericht</p>
                    <p><strong>Maßnahmen:</strong> {improvementActions.length} konkrete Verbesserungsschritte</p>
                    <p><strong>Zeitplan:</strong> 6-Monats-Roadmap mit Prioritäten</p>
                    <p><strong>ROI:</strong> Geschätzte Umsatzsteigerung von 15-25%</p>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  size="lg" 
                  className="w-full md:w-auto"
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'PDF wird erstellt...' : 'PDF-Handlungsplan herunterladen'}
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Der Bericht enthält alle echten Analysedaten und einen detaillierten</p>
                  <p>Aktionsplan für {realData.company.name}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Der PDF-Report umfasst:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                  <ul className="space-y-1">
                    <li>• Executive Summary</li>
                    <li>• Ist-Zustand Analyse</li>
                    <li>• SEO-Details</li>
                    <li>• Performance-Bewertung</li>
                    <li>• {improvementActions.length}+ Handlungsempfehlungen</li>
                    <li>• Prioritäten-Matrix</li>
                  </ul>
                  <ul className="space-y-1">
                    <li>• Social Media Status</li>
                    <li>• Google Bewertungen</li>
                    <li>• Keyword-Analyse</li>
                    <li>• Mobile Optimierung</li>
                    <li>• Rechtliche Compliance</li>
                    <li>• Zeitplan & Roadmap</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
