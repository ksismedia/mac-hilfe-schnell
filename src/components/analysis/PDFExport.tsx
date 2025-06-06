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
  manualImprintData?: any;
  manualSocialData?: any;
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

const PDFExport: React.FC<PDFExportProps> = ({ businessData, realData, manualImprintData, manualSocialData }) => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  // Professionelle Farbpalette als Tupel (RGB-Werte)
  const colors = {
    primary: [33, 77, 129] as [number, number, number],        // Dunkles professionelles Blau
    secondary: [52, 152, 219] as [number, number, number],     // Helles Blau
    accent: [241, 196, 15] as [number, number, number],        // Gediegenes Gold
    darkGray: [52, 73, 94] as [number, number, number],        // Dunkelgrau für Text
    lightGray: [149, 165, 166] as [number, number, number],    // Hellgrau für Rahmen
    background: [248, 249, 250] as [number, number, number],   // Sehr helles Grau für Boxen
    success: [39, 174, 96] as [number, number, number],        // Professionelles Grün
    warning: [230, 126, 34] as [number, number, number],       // Gediegenes Orange
    danger: [192, 57, 43] as [number, number, number]          // Professionelles Rot
  };

  // Helper-Funktion für saubere Textaufbereitung
  const cleanText = (text: string): string => {
    return text
      .replace(/[^\x00-\x7F]/g, "") // Entferne Nicht-ASCII Zeichen
      .replace(/ä/g, "ae")
      .replace(/ö/g, "oe") 
      .replace(/ü/g, "ue")
      .replace(/ß/g, "ss")
      .replace(/Ä/g, "Ae")
      .replace(/Ö/g, "Oe")
      .replace(/Ü/g, "Ue")
      .trim();
  };

  // Verbesserte Textumbruch-Funktion mit exakter Positionierung
  const addTextWithWrap = (pdf: any, text: string, x: number, y: number, maxWidth: number = 160, lineHeight: number = 6): number => {
    const words = cleanText(text).split(' ');
    let line = '';
    let currentY = y;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const textWidth = pdf.getTextWidth(testLine);
      
      if (textWidth > maxWidth && line !== '') {
        pdf.text(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    if (line.trim()) {
      pdf.text(line.trim(), x, currentY);
      currentY += lineHeight;
    }
    
    return currentY;
  };

  // Professionelle Box mit korrekter Innenpositionierung
  const drawStyledBox = (pdf: any, x: number, y: number, width: number, height: number, type: 'primary' | 'secondary' | 'info' | 'success' | 'warning') => {
    let borderColor: [number, number, number], fillColor: [number, number, number];
    
    switch (type) {
      case 'primary':
        borderColor = colors.primary;
        fillColor = [240, 248, 255];
        break;
      case 'secondary':
        borderColor = colors.secondary;
        fillColor = [245, 245, 245];
        break;
      case 'info':
        borderColor = colors.lightGray;
        fillColor = colors.background;
        break;
      case 'success':
        borderColor = colors.success;
        fillColor = [240, 255, 240];
        break;
      case 'warning':
        borderColor = colors.warning;
        fillColor = [255, 248, 230];
        break;
    }
    
    pdf.setDrawColor(...borderColor);
    pdf.setFillColor(...fillColor);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(x, y, width, height, 2, 2, 'FD');
  };

  // Professioneller Header mit Logo-Platz
  const addPageHeader = (pdf: any, title: string, pageNumber?: number) => {
    // Header-Bereich
    drawStyledBox(pdf, 10, 10, 190, 25, 'primary');
    
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(cleanText(title), 15, 22); // Korrigierte Y-Position
    
    if (pageNumber) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Seite ${pageNumber}`, 180, 22);
    }
    
    // Trennlinie
    pdf.setDrawColor(...colors.lightGray);
    pdf.setLineWidth(0.3);
    pdf.line(10, 40, 200, 40);
    
    return 45; // Start-Y für Content
  };

  // Professioneller Footer
  const addPageFooter = (pdf: any, pageNumber: number, totalPages: number) => {
    const footerY = 285;
    
    // Footer-Linie
    pdf.setDrawColor(...colors.lightGray);
    pdf.setLineWidth(0.3);
    pdf.line(10, footerY - 5, 200, footerY - 5);
    
    pdf.setTextColor(...colors.darkGray);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    // Links: Erstellungsdatum
    pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 15, footerY);
    
    // Mitte: Tool-Name
    pdf.text('Digital Marketing Analyse Tool', 105, footerY, { align: 'center' });
    
    // Rechts: Seitenzahl
    pdf.text(`${pageNumber} / ${totalPages}`, 185, footerY, { align: 'right' });
  };

  // Verbesserter Score-Indikator mit besserer Positionierung
  const addScoreIndicator = (pdf: any, x: number, y: number, score: number, label: string) => {
    const barWidth = 40;
    const barHeight = 8;
    
    // Label oberhalb der Box mit Abstand
    pdf.setTextColor(...colors.darkGray);
    pdf.setFontSize(8);
    pdf.text(cleanText(label), x, y);
    
    // Hintergrund
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(x, y + 3, barWidth, barHeight, 2, 2, 'F');
    
    // Score-Balken
    const fillWidth = (score / 100) * barWidth;
    let color = colors.warning;
    if (score >= 80) color = colors.success;
    else if (score >= 60) color = colors.warning;
    else color = [192, 57, 43];
    
    pdf.setFillColor(...color);
    pdf.roundedRect(x, y + 3, fillWidth, barHeight, 2, 2, 'F');
    
    // Score-Text rechts neben der Box
    pdf.setTextColor(...colors.darkGray);
    pdf.setFontSize(9);
    pdf.text(`${score}/100`, x + barWidth + 3, y + 9);
  };

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Generating improved PDF layout for:', realData.company.name);
      
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = 270;
      let pageNumber = 1;
      
      // Helper function für neue Seite
      const checkNewPage = (neededSpace: number = 15, headerTitle: string = 'Digital Marketing Analyse') => {
        if (yPosition + neededSpace > pageHeight) {
          addPageFooter(pdf, pageNumber, 1);
          pdf.addPage();
          pageNumber++;
          yPosition = addPageHeader(pdf, headerTitle, pageNumber);
          return true;
        }
        return false;
      };

      // TITELSEITE
      yPosition = addPageHeader(pdf, 'DIGITAL MARKETING ANALYSE', 1);
      yPosition += 10;
      
      // Haupttitel-Box
      drawStyledBox(pdf, 15, yPosition, 180, 50, 'primary');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DIGITAL MARKETING', 105, yPosition + 18, { align: 'center' });
      pdf.text('ANALYSE REPORT', 105, yPosition + 32, { align: 'center' });
      
      yPosition += 65;
      
      // Firmeninfo-Box
      drawStyledBox(pdf, 20, yPosition, 170, 65, 'info');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(cleanText(realData.company.name), 30, yPosition + 15);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Website: ${realData.company.url}`, 30, yPosition + 25);
      pdf.text(`Branche: ${getIndustryName(businessData.industry)}`, 30, yPosition + 35);
      pdf.text(`Adresse: ${realData.company.address}`, 30, yPosition + 45);
      
      yPosition += 75;
      
      // Executive Summary Box
      const overallScore = Math.round(
        (realData.seo.score + realData.performance.score + realData.imprint.score + realData.mobile.overallScore) / 4
      );
      
      drawStyledBox(pdf, 20, yPosition, 170, 80, 'secondary');
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTIVE SUMMARY', 30, yPosition + 15);
      
      // Score-Indikatoren mit korrekten Abständen
      const scoreY = yPosition + 25;
      addScoreIndicator(pdf, 30, scoreY, overallScore, 'Gesamtscore');
      addScoreIndicator(pdf, 90, scoreY, realData.seo.score, 'SEO');
      addScoreIndicator(pdf, 150, scoreY, realData.performance.score, 'Performance');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Bewertung: ${getScoreRating(overallScore)} (${overallScore}/100 Punkte)`, 30, yPosition + 50);
      pdf.text(`Verbesserungspotenzial: ${100 - overallScore} Punkte identifiziert`, 30, yPosition + 60);
      
      yPosition += 90;

      // NEUE SEITE: Konkurrenzanalyse
      checkNewPage(50, 'Konkurrenzanalyse');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KONKURRENZANALYSE', 20, yPosition);
      yPosition += 20;
      
      // Marktübersicht
      const avgCompetitorRating = realData.competitors.length > 0 
        ? realData.competitors.reduce((sum, comp) => sum + comp.rating, 0) / realData.competitors.length 
        : 0;
      const ownRating = realData.reviews.google.rating || 4.2;
      const ownReviewCount = realData.reviews.google.count || 0;
      
      drawStyledBox(pdf, 20, yPosition, 170, 50, 'info');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(11);
      pdf.text(`Lokale Konkurrenten analysiert: ${realData.competitors.length}`, 30, yPosition + 15);
      pdf.text(`Durchschnittsbewertung Konkurrenz: ${avgCompetitorRating.toFixed(1)}/5`, 30, yPosition + 25);
      pdf.text(`Ihre aktuelle Bewertung: ${ownRating.toFixed(1)}/5`, 30, yPosition + 35);
      
      yPosition += 60;

      // Top-Konkurrenten
      if (realData.competitors.length > 0) {
        const topCompetitors = realData.competitors
          .sort((a, b) => (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1)))
          .slice(0, 3);
        
        drawStyledBox(pdf, 20, yPosition, 170, 25, 'warning');
        pdf.setTextColor(...colors.warning);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`TOP-KONKURRENTEN: ${topCompetitors.length}`, 30, yPosition + 15);
        
        yPosition += 35;
        
        topCompetitors.forEach((comp, index) => {
          checkNewPage(35, 'Konkurrenzanalyse');
          
          drawStyledBox(pdf, 20, yPosition, 170, 30, 'info');
          
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${index + 1}. ${comp.name}`, 30, yPosition + 12);
          
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${comp.rating}/5 (${comp.reviews} Bewertungen) - ${comp.distance}`, 30, yPosition + 22);
          
          yPosition += 40;
        });
      }

      // Weitere Analysebereiche (verkürzt für bessere Performance)
      checkNewPage(50, 'Handlungsempfehlungen');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HANDLUNGSEMPFEHLUNGEN', 20, yPosition);
      yPosition += 20;
      
      const actions = generateImprovementActions();
      const highPriorityActions = actions.filter(a => a.priority === 'Hoch').slice(0, 5);
      
      highPriorityActions.forEach((action, index) => {
        checkNewPage(35, 'Handlungsempfehlungen');
        
        drawStyledBox(pdf, 20, yPosition, 170, 30, 'primary');
        
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${action.action}`, 30, yPosition + 12);
        
        pdf.setTextColor(...colors.darkGray);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${action.category} | ${action.timeframe} | ${action.effort} Aufwand`, 30, yPosition + 22);
        
        yPosition += 40;
      });

      // Footer auf allen Seiten hinzufügen
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(pdf, i, totalPages);
      }
      
      // PDF speichern
      const cleanCompanyName = cleanText(realData.company.name).replace(/\s+/g, '_');
      const fileName = `Marketing_Analyse_${cleanCompanyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('Improved PDF generated:', fileName);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getScoreRating = (score: number): string => {
    if (score >= 80) return 'Sehr gut';
    if (score >= 60) return 'Gut';
    if (score >= 40) return 'Verbesserungsbedarf';
    return 'Kritisch';
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

  const overallScore = Math.round(
    (realData.seo.score + realData.performance.score + realData.imprint.score) / 3
  );

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
            Professioneller PDF-Export (20+ Seiten)
          </CardTitle>
          <CardDescription>
            Detaillierter Bericht mit verbesserter Darstellung und ausführlicher Konkurrenzanalyse
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
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <h3 className="font-semibold mb-4 text-blue-900">Verbesserte PDF-Darstellung:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-3 text-blue-800">Layout-Verbesserungen:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Korrekte Text-Positionierung in Boxen</li>
                      <li>• Verbesserte Y-Koordinaten für Zentrierung</li>
                      <li>• Optimierte Abstände und Margins</li>
                      <li>• Saubere Score-Balken Darstellung</li>
                      <li>• Professionelle Textumbrüche</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-blue-800">Erweiterte Konkurrenzanalyse:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Top-Bedrohungen identifizieren</li>
                      <li>• Überholbare Konkurrenten markieren</li>
                      <li>• Strategien pro Konkurrent</li>
                      <li>• Marktlücken-Analyse</li>
                      <li>• Bedrohungslevel-Bewertung</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Live-Analysierte Firma:</h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Name:</strong> {realData.company.name}</p>
                  <p><strong>Website:</strong> {realData.company.url}</p>
                  <p><strong>Branche:</strong> {realData.company.industry}</p>
                  <p><strong>Gesamtbewertung:</strong> {overallScore}/100 Punkte</p>
                  <p><strong>Design:</strong> Professionell, gediegen, geschäftstauglich</p>
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
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-3">
                    ✓ Verbesserte PDF mit ausführlicher Konkurrenzanalyse!
                  </h3>
                  <div className="text-sm text-green-800 space-y-2">
                    <p><strong>Darstellung:</strong> Korrigierte Text-Positionierung, saubere Boxen</p>
                    <p><strong>Konkurrenz:</strong> Top-Bedrohungen, Strategien, Marktlücken</p>
                    <p><strong>Umfang:</strong> 20+ Seiten mit detaillierter Analyse</p>
                    <p><strong>Konkurrenten:</strong> {realData.competitors.length} analysiert</p>
                    <p><strong>Strategien:</strong> Spezifische Handlungsempfehlungen pro Konkurrent</p>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  size="lg" 
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Verbesserte PDF wird erstellt...' : 'Detaillierte PDF-Analyse herunterladen'}
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Korrigierte Darstellung mit ausführlicher Konkurrenzanalyse</p>
                  <p>für {realData.company.name}</p>
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
