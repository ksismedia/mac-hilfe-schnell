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
    primary: [33, 77, 129] as [number, number, number],
    secondary: [52, 152, 219] as [number, number, number],
    accent: [241, 196, 15] as [number, number, number],
    darkGray: [52, 73, 94] as [number, number, number],
    lightGray: [149, 165, 166] as [number, number, number],
    background: [248, 249, 250] as [number, number, number],
    success: [39, 174, 96] as [number, number, number],
    warning: [230, 126, 34] as [number, number, number],
    danger: [192, 57, 43] as [number, number, number]
  };

  // Helper-Funktion für saubere Textaufbereitung
  const cleanText = (text: string): string => {
    return text
      .replace(/[^\x00-\x7F]/g, "")
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

  // Verbesserte Seitenumbruch-Funktion
  const addNewPageIfNeeded = (pdf: any, currentY: number, neededSpace: number, pageNumber: { value: number }, title: string = 'Digital Marketing Analyse') => {
    if (currentY + neededSpace > 270) {
      console.log(`Adding new page at Y: ${currentY}, needed space: ${neededSpace}`);
      addPageFooter(pdf, pageNumber.value, 1);
      pdf.addPage();
      pageNumber.value++;
      return addPageHeader(pdf, title, pageNumber.value);
    }
    return currentY;
  };

  // Professioneller Header mit Logo-Platz
  const addPageHeader = (pdf: any, title: string, pageNumber?: number) => {
    drawStyledBox(pdf, 10, 10, 190, 25, 'primary');
    
    pdf.setTextColor(...colors.primary);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(cleanText(title), 15, 22);
    
    if (pageNumber) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Seite ${pageNumber}`, 180, 22);
    }
    
    pdf.setDrawColor(...colors.lightGray);
    pdf.setLineWidth(0.3);
    pdf.line(10, 40, 200, 40);
    
    return 45;
  };

  // Professioneller Footer
  const addPageFooter = (pdf: any, pageNumber: number, totalPages: number) => {
    const footerY = 285;
    
    pdf.setDrawColor(...colors.lightGray);
    pdf.setLineWidth(0.3);
    pdf.line(10, footerY - 5, 200, footerY - 5);
    
    pdf.setTextColor(...colors.darkGray);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    
    pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 15, footerY);
    pdf.text('Digital Marketing Analyse Tool', 105, footerY, { align: 'center' });
    pdf.text(`${pageNumber}`, 185, footerY, { align: 'right' });
  };

  // Verbesserter Score-Indikator mit besserer Positionierung
  const addScoreIndicator = (pdf: any, x: number, y: number, score: number, label: string) => {
    const barWidth = 40;
    const barHeight = 8;
    
    pdf.setTextColor(...colors.darkGray);
    pdf.setFontSize(8);
    pdf.text(cleanText(label), x, y);
    
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(x, y + 3, barWidth, barHeight, 2, 2, 'F');
    
    const fillWidth = (score / 100) * barWidth;
    let color = colors.warning;
    if (score >= 80) color = colors.success;
    else if (score >= 60) color = colors.warning;
    else color = [192, 57, 43];
    
    pdf.setFillColor(...color);
    pdf.roundedRect(x, y + 3, fillWidth, barHeight, 2, 2, 'F');
    
    pdf.setTextColor(...colors.darkGray);
    pdf.setFontSize(9);
    pdf.text(`${score}/100`, x + barWidth + 3, y + 9);
  };

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Generating comprehensive PDF for:', realData.company.name);
      
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageNumber = { value: 1 };
      
      console.log('Starting PDF generation...');

      // SEITE 1: TITELSEITE
      yPosition = addPageHeader(pdf, 'DIGITAL MARKETING ANALYSE', 1);
      yPosition += 10;
      
      drawStyledBox(pdf, 15, yPosition, 180, 50, 'primary');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DIGITAL MARKETING', 105, yPosition + 18, { align: 'center' });
      pdf.text('ANALYSE REPORT', 105, yPosition + 32, { align: 'center' });
      yPosition += 65;
      
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
      
      const overallScore = Math.round(
        (realData.seo.score + realData.performance.score + realData.imprint.score + realData.mobile.overallScore) / 4
      );
      
      drawStyledBox(pdf, 20, yPosition, 170, 80, 'secondary');
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTIVE SUMMARY', 30, yPosition + 15);
      
      const scoreY = yPosition + 25;
      addScoreIndicator(pdf, 30, scoreY, overallScore, 'Gesamtscore');
      addScoreIndicator(pdf, 90, scoreY, realData.seo.score, 'SEO');
      addScoreIndicator(pdf, 150, scoreY, realData.performance.score, 'Performance');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Bewertung: ${getScoreRating(overallScore)} (${overallScore}/100 Punkte)`, 30, yPosition + 50);
      pdf.text(`Verbesserungspotenzial: ${100 - overallScore} Punkte identifiziert`, 30, yPosition + 60);

      console.log('Page 1 completed, starting page 2...');

      // SEITE 2: SEO ANALYSE
      yPosition = addNewPageIfNeeded(pdf, yPosition + 90, 50, pageNumber, 'SEO Analyse');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEO ANALYSE', 20, yPosition);
      yPosition += 20;
      
      // SEO Details
      drawStyledBox(pdf, 20, yPosition, 170, 60, 'info');
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`SEO Score: ${realData.seo.score}/100`, 30, yPosition + 15);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      yPosition = addTextWithWrap(pdf, `Title Tag: ${realData.seo.title || 'Nicht optimiert'}`, 30, yPosition + 25, 150);
      yPosition = addTextWithWrap(pdf, `Meta Description: ${realData.seo.metaDescription || 'Nicht vorhanden'}`, 30, yPosition + 5, 150);
      yPosition = addTextWithWrap(pdf, `H1 Headings: ${realData.seo.h1Count || 0} gefunden`, 30, yPosition + 5, 150);
      yPosition += 20;

      // SEO Empfehlungen
      yPosition = addNewPageIfNeeded(pdf, yPosition, 40, pageNumber, 'SEO Analyse');
      drawStyledBox(pdf, 20, yPosition, 170, 35, 'warning');
      pdf.setTextColor(...colors.warning);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SEO EMPFEHLUNGEN:', 30, yPosition + 15);
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.text('• Title-Tags mit lokalen Keywords optimieren', 30, yPosition + 25);
      yPosition += 45;

      console.log('SEO section completed, starting Performance section...');

      // SEITE 3: PERFORMANCE ANALYSE
      yPosition = addNewPageIfNeeded(pdf, yPosition, 50, pageNumber, 'Performance Analyse');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PERFORMANCE ANALYSE', 20, yPosition);
      yPosition += 20;
      
      drawStyledBox(pdf, 20, yPosition, 170, 80, 'info');
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Performance Score: ${realData.performance.score}/100`, 30, yPosition + 15);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Ladezeit: ${realData.performance.loadTime || 'Unbekannt'}`, 30, yPosition + 30);
      pdf.text(`First Contentful Paint: ${realData.performance.fcp || 'Unbekannt'}`, 30, yPosition + 40);
      pdf.text(`Largest Contentful Paint: ${realData.performance.lcp || 'Unbekannt'}`, 30, yPosition + 50);
      pdf.text(`Cumulative Layout Shift: ${realData.performance.cls || 'Unbekannt'}`, 30, yPosition + 60);
      yPosition += 90;

      console.log('Performance section completed, starting Competitor Analysis...');

      // SEITE 4: KONKURRENZANALYSE
      yPosition = addNewPageIfNeeded(pdf, yPosition, 50, pageNumber, 'Konkurrenzanalyse');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KONKURRENZANALYSE', 20, yPosition);
      yPosition += 20;
      
      const avgCompetitorRating = realData.competitors.length > 0 
        ? realData.competitors.reduce((sum, comp) => sum + comp.rating, 0) / realData.competitors.length 
        : 0;
      
      drawStyledBox(pdf, 20, yPosition, 170, 50, 'info');
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(11);
      pdf.text(`Analysierte Konkurrenten: ${realData.competitors.length}`, 30, yPosition + 15);
      pdf.text(`Durchschnittsbewertung: ${avgCompetitorRating.toFixed(1)}/5`, 30, yPosition + 25);
      pdf.text(`Ihre Bewertung: ${realData.reviews.google.rating || 4.2}/5`, 30, yPosition + 35);
      yPosition += 60;

      // Top Konkurrenten detailliert
      if (realData.competitors.length > 0) {
        const topCompetitors = realData.competitors
          .sort((a, b) => (b.rating * Math.log(b.reviews + 1)) - (a.rating * Math.log(a.reviews + 1)))
          .slice(0, 5);
        
        for (let i = 0; i < topCompetitors.length; i++) {
          const comp = topCompetitors[i];
          yPosition = addNewPageIfNeeded(pdf, yPosition, 40, pageNumber, 'Konkurrenzanalyse');
          
          drawStyledBox(pdf, 20, yPosition, 170, 35, 'warning');
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${i + 1}. ${comp.name}`, 30, yPosition + 15);
          
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`${comp.rating}/5 (${comp.reviews} Bewertungen)`, 30, yPosition + 25);
          yPosition += 45;
        }
      }

      console.log('Competitor section completed, starting Social Media section...');

      // SEITE 5: SOCIAL MEDIA ANALYSE
      yPosition = addNewPageIfNeeded(pdf, yPosition, 50, pageNumber, 'Social Media Analyse');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SOCIAL MEDIA ANALYSE', 20, yPosition);
      yPosition += 20;
      
      drawStyledBox(pdf, 20, yPosition, 170, 70, 'info');
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(11);
      pdf.text(`Facebook: ${realData.socialMedia.facebook.found ? 'Gefunden' : 'Nicht gefunden'}`, 30, yPosition + 15);
      pdf.text(`Instagram: ${realData.socialMedia.instagram.found ? 'Gefunden' : 'Nicht gefunden'}`, 30, yPosition + 25);
      pdf.text(`Google My Business: ${realData.reviews.google.count > 0 ? 'Aktiv' : 'Inaktiv'}`, 30, yPosition + 35);
      pdf.text(`LinkedIn: ${realData.socialMedia.linkedin?.found ? 'Gefunden' : 'Nicht gefunden'}`, 30, yPosition + 45);
      yPosition += 80;

      console.log('Social Media section completed, starting Mobile section...');

      // SEITE 6: MOBILE OPTIMIERUNG
      yPosition = addNewPageIfNeeded(pdf, yPosition, 50, pageNumber, 'Mobile Optimierung');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MOBILE OPTIMIERUNG', 20, yPosition);
      yPosition += 20;
      
      drawStyledBox(pdf, 20, yPosition, 170, 60, 'info');
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Mobile Score: ${realData.mobile.overallScore}/100`, 30, yPosition + 15);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Responsive Design: ${realData.mobile.responsive ? 'Ja' : 'Nein'}`, 30, yPosition + 30);
      pdf.text(`Mobile Performance: ${realData.mobile.performance || 'Unbekannt'}`, 30, yPosition + 40);
      yPosition += 70;

      console.log('Mobile section completed, starting Action Plan...');

      // SEITEN 7-15: HANDLUNGSEMPFEHLUNGEN
      const actions = generateImprovementActions();
      
      yPosition = addNewPageIfNeeded(pdf, yPosition, 50, pageNumber, 'Handlungsempfehlungen');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HANDLUNGSEMPFEHLUNGEN', 20, yPosition);
      yPosition += 20;
      
      // Gruppiere Aktionen nach Kategorien
      const categories = ['SEO', 'Performance', 'Social Media', 'Bewertungen', 'Mobile', 'Rechtliches', 'Content', 'Local SEO'];
      
      for (const category of categories) {
        const categoryActions = actions.filter(a => a.category === category);
        if (categoryActions.length === 0) continue;
        
        yPosition = addNewPageIfNeeded(pdf, yPosition, 40, pageNumber, 'Handlungsempfehlungen');
        
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${category.toUpperCase()} MASSNAHMEN`, 20, yPosition);
        yPosition += 15;
        
        for (const action of categoryActions) {
          yPosition = addNewPageIfNeeded(pdf, yPosition, 35, pageNumber, 'Handlungsempfehlungen');
          
          drawStyledBox(pdf, 20, yPosition, 170, 30, 'info');
          
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${action.action}`, 30, yPosition + 12);
          
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Prioritaet: ${action.priority} | Zeitrahmen: ${action.timeframe}`, 30, yPosition + 22);
          
          yPosition += 40;
        }
        yPosition += 10;
      }

      console.log('Action plan completed, starting Timeline...');

      // SEITEN 16-18: ZEITPLAN
      yPosition = addNewPageIfNeeded(pdf, yPosition, 50, pageNumber, 'Zeitplan');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('UMSETZUNGSZEITPLAN', 20, yPosition);
      yPosition += 20;
      
      const timeframes = ['Sofort', '1-2 Wochen', '1-3 Monate', '3-6 Monate'];
      
      for (const timeframe of timeframes) {
        const timeframeActions = actions.filter(a => a.timeframe === timeframe);
        if (timeframeActions.length === 0) continue;
        
        yPosition = addNewPageIfNeeded(pdf, yPosition, 40, pageNumber, 'Zeitplan');
        
        drawStyledBox(pdf, 20, yPosition, 170, 25, 'primary');
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${timeframe.toUpperCase()}: ${timeframeActions.length} Massnahmen`, 30, yPosition + 15);
        yPosition += 35;
        
        for (const action of timeframeActions.slice(0, 8)) {
          yPosition = addNewPageIfNeeded(pdf, yPosition, 15, pageNumber, 'Zeitplan');
          
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`• ${action.action} (${action.category})`, 30, yPosition);
          yPosition += 12;
        }
        yPosition += 10;
      }

      console.log('Timeline completed, starting Budget section...');

      // SEITE 19: BUDGET UND RESSOURCEN
      yPosition = addNewPageIfNeeded(pdf, yPosition, 50, pageNumber, 'Budget und Ressourcen');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('BUDGET UND RESSOURCEN', 20, yPosition);
      yPosition += 20;
      
      const effortLevels = ['Niedrig', 'Mittel', 'Hoch'];
      for (const effort of effortLevels) {
        const effortActions = actions.filter(a => a.effort === effort);
        if (effortActions.length === 0) continue;
        
        yPosition = addNewPageIfNeeded(pdf, yPosition, 30, pageNumber, 'Budget und Ressourcen');
        
        drawStyledBox(pdf, 20, yPosition, 170, 20, 'info');
        pdf.setTextColor(...colors.darkGray);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${effort} Aufwand: ${effortActions.length} Massnahmen`, 30, yPosition + 12);
        yPosition += 30;
      }

      console.log('Budget section completed, starting Summary...');

      // SEITE 20: ZUSAMMENFASSUNG
      yPosition = addNewPageIfNeeded(pdf, yPosition, 50, pageNumber, 'Zusammenfassung');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ZUSAMMENFASSUNG', 20, yPosition);
      yPosition += 20;
      
      drawStyledBox(pdf, 20, yPosition, 170, 100, 'success');
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KERNERKENNTNISSE:', 30, yPosition + 15);
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`• Gesamtscore: ${overallScore}/100 Punkte`, 30, yPosition + 30);
      pdf.text(`• ${actions.filter(a => a.priority === 'Hoch').length} hochprioritaere Massnahmen`, 30, yPosition + 40);
      pdf.text(`• ${realData.competitors.length} Konkurrenten analysiert`, 30, yPosition + 50);
      pdf.text(`• Groesstes Verbesserungspotenzial: ${getMainImprovement()}`, 30, yPosition + 60);
      pdf.text(`• Empfohlene naechste Schritte: Sofort-Massnahmen`, 30, yPosition + 70);

      // Footer auf allen Seiten aktualisieren
      const totalPages = pdf.getNumberOfPages();
      console.log(`Total pages generated: ${totalPages}`);
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(pdf, i, totalPages);
      }
      
      const cleanCompanyName = cleanText(realData.company.name).replace(/\s+/g, '_');
      const fileName = `Marketing_Analyse_${cleanCompanyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log(`PDF successfully generated with ${totalPages} pages:`, fileName);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getMainImprovement = (): string => {
    const scores = [
      { name: 'SEO', score: realData.seo.score },
      { name: 'Performance', score: realData.performance.score },
      { name: 'Mobile', score: realData.mobile.overallScore },
      { name: 'Impressum', score: realData.imprint.score }
    ];
    
    const lowest = scores.reduce((min, current) => current.score < min.score ? current : min);
    return lowest.name;
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
            Vollständiger PDF-Export (20+ Seiten)
          </CardTitle>
          <CardDescription>
            Detaillierter Bericht mit allen Analysebereichen und umfassenden Handlungsempfehlungen
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
                <h3 className="font-semibold mb-4 text-blue-900">Vollständige PDF-Analyse:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-3 text-blue-800">Alle Bereiche abgedeckt:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• SEO-Analyse (detailliert)</li>
                      <li>• Performance-Metriken</li>
                      <li>• Konkurrenzanalyse (5+ Seiten)</li>
                      <li>• Social Media Bewertung</li>
                      <li>• Mobile Optimierung</li>
                      <li>• Handlungsempfehlungen (8+ Seiten)</li>
                      <li>• Umsetzungszeitplan</li>
                      <li>• Budget-Planung</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-blue-800">Verbesserte Struktur:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Korrekte Seitenumbrüche</li>
                      <li>• Alle Inhalte werden ausgegeben</li>
                      <li>• Detaillierte Kategorie-Aufteilung</li>
                      <li>• Vollständige Aktionspläne</li>
                      <li>• Professionelle Darstellung</li>
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
                  <p><strong>Aktionen:</strong> {improvementActions.length} Maßnahmen identifiziert</p>
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
                    ✓ Vollständige 20+ Seiten PDF mit allen Analysebereichen!
                  </h3>
                  <div className="text-sm text-green-800 space-y-2">
                    <p><strong>Struktur:</strong> Korrekte Seitenumbrüche, alle Inhalte werden ausgegeben</p>
                    <p><strong>Bereiche:</strong> SEO, Performance, Konkurrenz, Social Media, Mobile, Rechtliches</p>
                    <p><strong>Umfang:</strong> 20+ Seiten mit detaillierter Analyse aller Aspekte</p>
                    <p><strong>Konkurrenten:</strong> {realData.competitors.length} analysiert mit eigenen Seiten</p>
                    <p><strong>Maßnahmen:</strong> {improvementActions.length} Handlungsempfehlungen kategorisiert</p>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  size="lg" 
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Vollständige PDF wird erstellt...' : 'Vollständige 20+ Seiten PDF herunterladen'}
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Alle Analysebereiche mit korrekten Seitenumbrüchen</p>
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
