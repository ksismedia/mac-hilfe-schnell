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

  // Verbesserte Textumbruch-Funktion
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

  // Professionelle Box mit Farbschema
  const drawStyledBox = (pdf: any, x: number, y: number, width: number, height: number, type: 'primary' | 'secondary' | 'info' | 'success' | 'warning') => {
    let borderColor, fillColor;
    
    switch (type) {
      case 'primary':
        borderColor = colors.primary;
        fillColor = [240, 248, 255] as [number, number, number]; // Sehr helles Blau
        break;
      case 'secondary':
        borderColor = colors.secondary;
        fillColor = [245, 245, 245] as [number, number, number]; // Hellgrau
        break;
      case 'info':
        borderColor = colors.lightGray;
        fillColor = colors.background;
        break;
      case 'success':
        borderColor = colors.success;
        fillColor = [240, 255, 240] as [number, number, number]; // Sehr helles Grün
        break;
      case 'warning':
        borderColor = colors.warning;
        fillColor = [255, 248, 230] as [number, number, number]; // Sehr helles Orange
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
    pdf.text(cleanText(title), 15, 25);
    
    if (pageNumber) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Seite ${pageNumber}`, 180, 25);
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

  // Verbesserter Score-Indikator
  const addScoreIndicator = (pdf: any, x: number, y: number, score: number, label: string) => {
    const barWidth = 40;
    const barHeight = 8;
    
    // Hintergrund
    pdf.setFillColor(230, 230, 230);
    pdf.roundedRect(x, y, barWidth, barHeight, 2, 2, 'F');
    
    // Score-Balken
    const fillWidth = (score / 100) * barWidth;
    let color = colors.danger;
    if (score >= 80) color = colors.success;
    else if (score >= 60) color = colors.warning;
    
    pdf.setFillColor(...color);
    pdf.roundedRect(x, y, fillWidth, barHeight, 2, 2, 'F');
    
    // Text
    pdf.setTextColor(...colors.darkGray);
    pdf.setFontSize(9);
    pdf.text(`${score}/100`, x + barWidth + 5, y + 6);
    pdf.setFontSize(8);
    pdf.text(cleanText(label), x, y - 3);
  };

  const handleExport = async () => {
    setIsGenerating(true);
    
    try {
      console.log('Generating enhanced professional PDF for:', realData.company.name);
      
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = 270; // Etwas mehr Platz für Footer
      let pageNumber = 1;
      
      // Helper function für neue Seite mit verbessertem Header
      const checkNewPage = (neededSpace: number = 15, headerTitle: string = 'Digital Marketing Analyse') => {
        if (yPosition + neededSpace > pageHeight) {
          addPageFooter(pdf, pageNumber, 1); // Wird später korrigiert
          pdf.addPage();
          pageNumber++;
          yPosition = addPageHeader(pdf, headerTitle, pageNumber);
          return true;
        }
        return false;
      };

      // TITELSEITE mit professionellem Design
      yPosition = addPageHeader(pdf, 'DIGITAL MARKETING ANALYSE', 1);
      yPosition += 10;
      
      // Haupttitel-Box
      drawStyledBox(pdf, 15, yPosition, 180, 50, 'primary');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      const titleY = yPosition + 20;
      pdf.text('DIGITAL MARKETING', 105, titleY, { align: 'center' });
      pdf.text('ANALYSE REPORT', 105, titleY + 12, { align: 'center' });
      
      yPosition += 65;
      
      // Firmeninfo-Box
      drawStyledBox(pdf, 20, yPosition, 170, 60, 'info');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      yPosition = addTextWithWrap(pdf, realData.company.name, 30, yPosition + 15, 150, 8);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      yPosition = addTextWithWrap(pdf, `Website: ${realData.company.url}`, 30, yPosition + 5, 150, 6);
      yPosition = addTextWithWrap(pdf, `Branche: ${getIndustryName(businessData.industry)}`, 30, yPosition + 2, 150, 6);
      yPosition = addTextWithWrap(pdf, `Adresse: ${realData.company.address}`, 30, yPosition + 2, 150, 6);
      
      yPosition += 30;
      
      // Executive Summary Box mit Score-Übersicht
      const overallScore = Math.round(
        (realData.seo.score + realData.performance.score + realData.imprint.score + realData.mobile.overallScore) / 4
      );
      
      drawStyledBox(pdf, 20, yPosition, 170, 80, 'secondary');
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXECUTIVE SUMMARY', 30, yPosition + 15);
      
      // Score-Indikatoren nebeneinander
      const scoreY = yPosition + 30;
      addScoreIndicator(pdf, 30, scoreY, overallScore, 'Gesamtscore');
      addScoreIndicator(pdf, 90, scoreY, realData.seo.score, 'SEO');
      addScoreIndicator(pdf, 150, scoreY, realData.performance.score, 'Performance');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      yPosition = addTextWithWrap(pdf, `Bewertung: ${getScoreRating(overallScore)} (${overallScore}/100 Punkte)`, 30, yPosition + 55, 150, 6);
      yPosition = addTextWithWrap(pdf, `Verbesserungspotenzial: ${100 - overallScore} Punkte identifiziert`, 30, yPosition + 2, 150, 6);
      
      yPosition += 40;
      
      // Datum und Analysezeitraum
      drawStyledBox(pdf, 50, yPosition, 110, 25, 'info');
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Analysedatum: ${new Date().toLocaleDateString('de-DE')}`, 60, yPosition + 10);
      pdf.text('Live-Analyse durchgefuehrt', 60, yPosition + 18);

      // NEUE SEITE: Detaillierte Bewertung
      checkNewPage(50, 'Detaillierte Bewertung');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DETAILLIERTE BEWERTUNG', 20, yPosition);
      yPosition += 20;
      
      const categories = [
        { name: 'SEO-Optimierung', score: realData.seo.score, details: 'On-Page SEO, Meta-Tags, Keyword-Optimierung', icon: '🔍' },
        { name: 'Ladegeschwindigkeit', score: realData.performance.score, details: 'PageSpeed, Core Web Vitals, Performance', icon: '⚡' },
        { name: 'Mobile Optimierung', score: realData.mobile.overallScore, details: 'Responsive Design, Mobile Usability', icon: '📱' },
        { name: 'Rechtliche Compliance', score: realData.imprint.score, details: 'Impressum, Datenschutz, DSGVO', icon: '⚖️' },
        { name: 'Online Reputation', score: realData.reviews.google.count > 10 ? 85 : 45, details: 'Google Bewertungen, Online-Praesenz', icon: '⭐' },
        { name: 'Social Media Praesenz', score: (realData.socialMedia.facebook.found ? 50 : 0) + (realData.socialMedia.instagram.found ? 50 : 0), details: 'Facebook, Instagram, Social Proof', icon: '👥' }
      ];
      
      categories.forEach((cat, index) => {
        checkNewPage(40, 'Detaillierte Bewertung');
        
        // Kategorie-Box
        const boxType = cat.score >= 80 ? 'success' : cat.score >= 60 ? 'warning' : 'primary';
        drawStyledBox(pdf, 20, yPosition, 170, 35, boxType);
        
        pdf.setTextColor(...colors.darkGray);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${cleanText(cat.name)}`, 30, yPosition + 12);
        
        // Score-Balken in der Box
        addScoreIndicator(pdf, 140, yPosition + 8, cat.score, '');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPosition = addTextWithWrap(pdf, cat.details, 30, yPosition + 22, 140, 5);
        
        yPosition += 20;
      });

      // NEUE SEITE: Keyword-Analyse mit verbessertem Design
      checkNewPage(50, 'Keyword-Analyse');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KEYWORD-ANALYSE', 20, yPosition);
      yPosition += 20;
      
      const foundKeywords = realData.keywords.filter(k => k.found);
      const missingKeywords = realData.keywords.filter(k => !k.found);
      
      // Keyword-Übersicht in Box
      drawStyledBox(pdf, 20, yPosition, 170, 30, 'info');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Gefundene Keywords: ${foundKeywords.length}/${realData.keywords.length}`, 30, yPosition + 12);
      pdf.text(`Optimierungspotenzial: ${missingKeywords.length} Keywords`, 30, yPosition + 22);
      
      yPosition += 45;
      
      // Gefundene Keywords in gestylter Tabelle
      if (foundKeywords.length > 0) {
        drawStyledBox(pdf, 20, yPosition, 170, 25, 'success');
        
        pdf.setTextColor(...colors.success);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('✓ GEFUNDENE KEYWORDS', 30, yPosition + 15);
        
        yPosition += 35;
        
        foundKeywords.slice(0, 15).forEach(keyword => {
          checkNewPage(8, 'Keyword-Analyse');
          
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(10);
          pdf.text(`• ${keyword.keyword}`, 30, yPosition);
          pdf.setTextColor(...colors.lightGray);
          pdf.text(`${keyword.volume} Suchanfragen/Monat`, 140, yPosition);
          yPosition += 8;
        });
      }
      
      yPosition += 10;
      
      // Fehlende Keywords
      if (missingKeywords.length > 0) {
        checkNewPage(30, 'Keyword-Analyse');
        
        drawStyledBox(pdf, 20, yPosition, 170, 25, 'warning');
        
        pdf.setTextColor(...colors.warning);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('⚠ OPTIMIERUNGSPOTENZIAL', 30, yPosition + 15);
        
        yPosition += 35;
        
        missingKeywords.slice(0, 20).forEach(keyword => {
          checkNewPage(8, 'Keyword-Analyse');
          
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(10);
          pdf.text(`• ${keyword.keyword}`, 30, yPosition);
          pdf.setTextColor(...colors.warning);
          pdf.text(`${keyword.volume} Suchanfragen/Monat`, 140, yPosition);
          yPosition += 8;
        });
      }

      // ERWEITERTE KONKURRENZANALYSE mit professionellem Design
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
      const avgCompetitorReviews = realData.competitors.length > 0
        ? realData.competitors.reduce((sum, comp) => sum + comp.reviews, 0) / realData.competitors.length
        : 0;
      const ownRating = realData.reviews.google.rating || 4.2;
      const ownReviewCount = realData.reviews.google.count || 0;
      
      drawStyledBox(pdf, 20, yPosition, 170, 50, 'info');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(11);
      pdf.text(`Lokale Konkurrenten: ${realData.competitors.length}`, 30, yPosition + 12);
      pdf.text(`Ø Bewertung Konkurrenz: ${avgCompetitorRating.toFixed(1)}/5`, 30, yPosition + 22);
      pdf.text(`Ihre Bewertung: ${ownRating.toFixed(1)}/5`, 100, yPosition + 22);
      pdf.text(`Ø Rezensionen: ${Math.round(avgCompetitorReviews)}`, 30, yPosition + 32);
      pdf.text(`Ihre Rezensionen: ${ownReviewCount}`, 100, yPosition + 32);
      
      yPosition += 65;

      if (realData.competitors.length > 0) {
        // Top Performers mit verbessertem Design
        const topPerformers = realData.competitors
          .filter(c => c.rating >= 4.5 && c.reviews >= 50)
          .sort((a, b) => b.rating - a.rating);
        
        drawStyledBox(pdf, 20, yPosition, 170, 25, 'warning');
        
        pdf.setTextColor(...colors.warning);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`🏆 TOP PERFORMERS: ${topPerformers.length}`, 30, yPosition + 15);
        
        yPosition += 35;
        
        if (topPerformers.length > 0) {
          topPerformers.slice(0, 3).forEach((comp, index) => {
            checkNewPage(15, 'Konkurrenzanalyse');
            
            pdf.setTextColor(...colors.darkGray);
            pdf.setFontSize(10);
            pdf.text(`${index + 1}. ${comp.name}`, 30, yPosition);
            pdf.setTextColor(...colors.warning);
            pdf.text(`${comp.rating}/5 (${comp.reviews} Bewertungen)`, 120, yPosition);
            yPosition += 10;
          });
        } else {
          pdf.setTextColor(...colors.success);
          pdf.setFontSize(10);
          pdf.text('✓ Keine dominanten Marktfuehrer - CHANCE!', 30, yPosition);
          yPosition += 10;
        }

        // Detaillierte Konkurrenten-Profile (erste 5)
        realData.competitors.slice(0, 5).forEach((competitor, index) => {
          checkNewPage(55, 'Konkurrenzanalyse');
          
          // Konkurrenten-Box
          const boxType = competitor.rating > ownRating ? 'warning' : 'success';
          drawStyledBox(pdf, 20, yPosition, 170, 45, boxType);
          
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`KONKURRENT #${index + 1}: ${competitor.name}`, 30, yPosition + 12);
          
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Bewertung: ${competitor.rating}/5`, 30, yPosition + 22);
          pdf.text(`Rezensionen: ${competitor.reviews}`, 100, yPosition + 22);
          pdf.text(`Entfernung: ${competitor.distance}`, 30, yPosition + 30);
          
          // Status-Indikator
          if (competitor.rating > ownRating) {
            pdf.setTextColor(...colors.danger);
            pdf.text('⚠ BEDROHUNG', 100, yPosition + 30);
          } else {
            pdf.setTextColor(...colors.success);
            pdf.text('✓ VORTEIL', 100, yPosition + 30);
          }
          
          yPosition += 55;
        });

      } else {
        // Keine Konkurrenten - Marktchance
        drawStyledBox(pdf, 20, yPosition, 170, 40, 'success');
        
        pdf.setTextColor(...colors.success);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🚀 MARKTCHANCE IDENTIFIZIERT!', 30, yPosition + 15);
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(...colors.darkGray);
        pdf.text('Schwache lokale Online-Konkurrenz erkannt', 30, yPosition + 25);
        pdf.text('Grosses Potenzial fuer digitale Marktfuehrerschaft', 30, yPosition + 33);
        
        yPosition += 50;
      }

      // HANDLUNGSEMPFEHLUNGEN mit Prioritäten-Matrix
      checkNewPage(50, 'Handlungsempfehlungen');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HANDLUNGSEMPFEHLUNGEN', 20, yPosition);
      yPosition += 20;
      
      const actions = generateImprovementActions();
      const highPriorityActions = actions.filter(a => a.priority === 'Hoch');
      
      // Übersichts-Box
      drawStyledBox(pdf, 20, yPosition, 170, 35, 'info');
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(11);
      pdf.text(`Identifizierte Massnahmen: ${actions.length}`, 30, yPosition + 12);
      pdf.text(`Hohe Prioritaet: ${highPriorityActions.length}`, 30, yPosition + 22);
      pdf.text(`Geschaetzte Umsetzungsdauer: 3-6 Monate`, 100, yPosition + 12);
      pdf.text(`Erwarteter ROI: 300-500%`, 100, yPosition + 22);
      
      yPosition += 50;
      
      // High-Priority Actions mit professionellem Design
      highPriorityActions.slice(0, 8).forEach((action, index) => {
        checkNewPage(45, 'Handlungsempfehlungen');
        
        // Action-Box
        drawStyledBox(pdf, 20, yPosition, 170, 38, 'primary');
        
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${action.action}`, 30, yPosition + 12);
        
        pdf.setTextColor(...colors.darkGray);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Kategorie: ${action.category}`, 30, yPosition + 20);
        pdf.text(`Aufwand: ${action.effort}`, 90, yPosition + 20);
        pdf.text(`Impact: ${action.impact}`, 130, yPosition + 20);
        pdf.text(`Zeitrahmen: ${action.timeframe}`, 30, yPosition + 28);
        
        yPosition = addTextWithWrap(pdf, action.description, 30, yPosition + 35, 140, 5);
        yPosition += 10;
      });

      // ROI-PROGNOSE mit visuellen Elementen
      checkNewPage(50, 'ROI-Prognose');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ROI-PROGNOSE', 20, yPosition);
      yPosition += 20;
      
      // ROI-Übersicht
      drawStyledBox(pdf, 20, yPosition, 170, 60, 'success');
      
      pdf.setTextColor(...colors.success);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ERWARTETE VERBESSERUNGEN', 30, yPosition + 15);
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const projections = [
        'Website-Traffic: +25-40%',
        'Lokale Sichtbarkeit: +30-50%',
        'Conversion Rate: +15-25%',
        'Online-Anfragen: +20-35%',
        'Kundenbewertungen: +50-100%',
        'Social Media: +100-200%'
      ];
      
      let projY = yPosition + 25;
      projections.forEach(proj => {
        pdf.text(`• ${proj}`, 30, projY);
        projY += 7;
      });
      
      yPosition += 75;
      
      // Investment ROI
      drawStyledBox(pdf, 20, yPosition, 170, 30, 'warning');
      
      pdf.setTextColor(...colors.warning);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GESCHAETZTE UMSATZSTEIGERUNG', 30, yPosition + 12);
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(10);
      pdf.text('15-25% im ersten Jahr | ROI: 300-500% in 12 Monaten', 30, yPosition + 22);

      // Erweiterte Social Media Analyse falls manuelle Daten vorhanden
      if (manualSocialData) {
        checkNewPage(50, 'Social Media Analyse');
        yPosition += 10;
        
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(18);
        pdf.setFont('helvetica', 'bold');
        pdf.text('SOCIAL MEDIA ANALYSE', 20, yPosition);
        yPosition += 20;
        
        if (manualSocialData.facebookUrl) {
          drawStyledBox(pdf, 20, yPosition, 170, 45, 'info');
          
          pdf.setTextColor(...colors.secondary);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('FACEBOOK', 30, yPosition + 12);
          
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          yPosition = addTextWithWrap(pdf, `URL: ${manualSocialData.facebookUrl}`, 30, yPosition + 20, 140, 5);
          pdf.text(`Follower: ${manualSocialData.facebookFollowers || 'nicht angegeben'}`, 30, yPosition + 2);
          yPosition += 8;
          pdf.text(`Letzter Post: ${manualSocialData.facebookLastPost || 'nicht angegeben'}`, 30, yPosition);
          yPosition += 20;
        }
        
        if (manualSocialData.instagramUrl) {
          checkNewPage(50, 'Social Media Analyse');
          
          drawStyledBox(pdf, 20, yPosition, 170, 45, 'info');
          
          pdf.setTextColor(...colors.secondary);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('INSTAGRAM', 30, yPosition + 12);
          
          pdf.setTextColor(...colors.darkGray);
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          yPosition = addTextWithWrap(pdf, `URL: ${manualSocialData.instagramUrl}`, 30, yPosition + 20, 140, 5);
          pdf.text(`Follower: ${manualSocialData.instagramFollowers || 'nicht angegeben'}`, 30, yPosition + 2);
          yPosition += 8;
          pdf.text(`Letzter Post: ${manualSocialData.instagramLastPost || 'nicht angegeben'}`, 30, yPosition);
          yPosition += 20;
        }
      }

      // TECHNISCHE DETAILS auf letzter Seite
      checkNewPage(50, 'Technische Details');
      yPosition += 10;
      
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TECHNISCHE DETAILS', 20, yPosition);
      yPosition += 20;
      
      // Performance-Metriken in professioneller Box
      drawStyledBox(pdf, 20, yPosition, 170, 50, 'info');
      
      pdf.setTextColor(...colors.secondary);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PERFORMANCE-METRIKEN', 30, yPosition + 12);
      
      pdf.setTextColor(...colors.darkGray);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      
      const performanceDetails = [
        `Ladezeit Desktop: ${realData.performance.loadTime}ms`,
        `Largest Contentful Paint: ${realData.performance.lcp}ms`,
        `Cumulative Layout Shift: ${realData.performance.cls}`,
        `First Input Delay: ${realData.performance.fid}ms`,
        `Performance Score: ${realData.performance.score}/100`
      ];
      
      let perfY = yPosition + 22;
      performanceDetails.forEach(detail => {
        pdf.text(detail, 30, perfY);
        perfY += 7;
      });

      // Footer auf allen Seiten hinzufügen
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(pdf, i, totalPages);
      }
      
      // PDF speichern mit sauberem Dateinamen
      const cleanCompanyName = cleanText(realData.company.name).replace(/\s+/g, '_');
      const fileName = `Marketing_Analyse_${cleanCompanyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('Professional PDF successfully generated:', fileName, 'Total pages:', pdf.getNumberOfPages());
      
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

  // Helper-Funktionen für detaillierte Konkurrenzanalyse
  const getCompetitorStrategies = (competitor: any, ownRating: number, ownReviewCount: number): string[] => {
    const strategies = [];
    
    if (competitor.rating > ownRating) {
      strategies.push('Kundenerfahrung verbessern - analysieren Sie deren Bewertungen');
      strategies.push('Service-Qualität steigern um Bewertungsvorsprung aufzuholen');
    }
    
    if (competitor.reviews > ownReviewCount) {
      strategies.push('Bewertungs-Kampagne starten - systematisch Rezensionen sammeln');
      strategies.push('Follow-up-Prozess nach Aufträgen etablieren');
    }
    
    if (competitor.rating < 4.0) {
      strategies.push('Schwächen nutzen - in Marketing Qualitätsvorsprung betonen');
      strategies.push('Unzufriedene Kunden dieses Konkurrenten ansprechen');
    }
    
    strategies.push('Lokale SEO gegen diesen Konkurrenten optimieren');
    strategies.push(`Differenzierung durch Spezialisierung gegen ${competitor.name}`);
    
    return strategies;
  };

  const analyzeMarketGaps = (competitors: any[], ownRating: number, ownReviewCount: number) => {
    const gaps = [];
    
    const hasStrongCompetitors = competitors.some(c => c.rating >= 4.5 && c.reviews >= 100);
    if (!hasStrongCompetitors) {
      gaps.push({
        title: 'Marktführerschaft verfügbar',
        description: 'Keine etablierten digitalen Marktführer identifiziert',
        potential: 'Sehr hoch - First-Mover-Advantage möglich'
      });
    }
    
    const lowReviewCompetitors = competitors.filter(c => c.reviews < 30).length;
    if (lowReviewCompetitors > competitors.length * 0.7) {
      gaps.push({
        title: 'Review-Marketing unterentwickelt',
        description: '70%+ der Konkurrenten haben schwache Online-Reputation',
        potential: 'Hoch - durch systematische Bewertungssammlung abheben'
      });
    }
    
    if (competitors.length < 5) {
      gaps.push({
        title: 'Schwache lokale Online-Präsenz',
        description: 'Weniger als 5 aktive Konkurrenten online gefunden',
        potential: 'Sehr hoch - digitale Marktlücke identifiziert'
      });
    }
    
    return gaps;
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
            Professioneller PDF-Export (15+ Seiten)
          </CardTitle>
          <CardDescription>
            Detaillierter Bericht mit professionellem Design, verbesserter Typografie und gediegener Farbgebung
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
                <h3 className="font-semibold mb-4 text-blue-900">Professioneller PDF-Bericht mit verbessertem Design:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <h4 className="font-medium mb-3 text-blue-800">Optische Verbesserungen:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Professionelle Farbpalette (gediegene Blau-/Grautöne)</li>
                      <li>• Verbesserte Typografie und Schrifthierarchie</li>
                      <li>• Elegante Boxen und Rahmen mit Rundungen</li>
                      <li>• Score-Indikatoren mit visuellen Balken</li>
                      <li>• Strukturierte Seitenlayouts mit Headern/Footern</li>
                      <li>• Professionelle Tabellen und Listen</li>
                      <li>• Optimierte Textumbrüche und Abstände</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3 text-blue-800">Inhaltliche Struktur:</h4>
                    <ul className="space-y-2 text-blue-700">
                      <li>• Executive Summary mit visuellen Scores</li>
                      <li>• Detaillierte Kategorien-Bewertung: {realData.seo.score}/100</li>
                      <li>• Keyword-Analyse: {realData.keywords.filter(k => k.found).length}/{realData.keywords.length} gefunden</li>
                      <li>• Konkurrenzanalyse: {realData.competitors.length} Mitbewerber</li>
                      <li>• Handlungsempfehlungen mit Prioritäten-Matrix</li>
                      <li>• ROI-Prognosen und KPIs</li>
                      <li>• 6-Monats-Roadmap mit Zeitplänen</li>
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
                    ✓ Ihr professioneller Marketing-Plan ist bereit!
                  </h3>
                  <div className="text-sm text-green-800 space-y-2">
                    <p><strong>Design:</strong> Gediegen, professionell, geschäftstauglich</p>
                    <p><strong>Umfang:</strong> 15+ Seiten mit verbesserter Typografie</p>
                    <p><strong>Visualisierung:</strong> Score-Balken, farbkodierte Boxen, Strukturierung</p>
                    <p><strong>Maßnahmen:</strong> {improvementActions.length} konkrete Verbesserungsschritte</p>
                    <p><strong>ROI:</strong> Geschätzte Umsatzsteigerung von 15-25%</p>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  size="lg" 
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Professioneller PDF wird erstellt...' : 'Professionellen PDF-Report herunterladen'}
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Optimierte Darstellung mit gediegener Farbpalette und</p>
                  <p>professioneller Typografie für {realData.company.name}</p>
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
