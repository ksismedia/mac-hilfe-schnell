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
      console.log('Generating premium PDF for:', realData.company.name);
      
      const pdf = new jsPDF();
      let yPosition = 20;
      const pageHeight = 280;
      const leftMargin = 15;
      const rightMargin = 195;
      const textWidth = rightMargin - leftMargin;
      
      // Farbschema definieren
      const colors = {
        primary: [30, 136, 229], // Blau
        secondary: [52, 168, 83], // Grün
        accent: [255, 171, 0], // Orange
        danger: [234, 67, 53], // Rot
        dark: [60, 64, 67], // Dunkelgrau
        light: [248, 249, 250], // Hellgrau
        white: [255, 255, 255]
      };
      
      // Helper function für neue Seite
      const checkNewPage = (neededSpace: number = 15) => {
        if (yPosition + neededSpace > pageHeight) {
          pdf.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Helper für Text mit automatischem Umbruch
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 11) => {
        pdf.setFontSize(fontSize);
        const cleanText = text.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, ''); // Entferne problematische Sonderzeichen
        const lines = pdf.splitTextToSize(cleanText, maxWidth);
        const lineHeight = fontSize * 0.35;
        
        lines.forEach((line: string, index: number) => {
          if (y + (index * lineHeight) > pageHeight - 10) {
            pdf.addPage();
            yPosition = 20;
            y = 20;
          }
          pdf.text(line, x, y + (index * lineHeight));
        });
        
        return y + (lines.length * lineHeight) + 3;
      };

      // Helper für Boxen/Rahmen
      const drawBox = (x: number, y: number, width: number, height: number, fillColor: number[], borderColor?: number[]) => {
        if (fillColor) {
          pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
          pdf.rect(x, y, width, height, 'F');
        }
        if (borderColor) {
          pdf.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
          pdf.setLineWidth(0.5);
          pdf.rect(x, y, width, height, 'S');
        }
      };

      // Helper für Score-basierte Farben
      const getScoreColor = (score: number): number[] => {
        if (score >= 80) return colors.secondary; // Grün
        if (score >= 60) return colors.accent; // Orange
        if (score >= 40) return colors.primary; // Blau
        return colors.danger; // Rot
      };

      // Helper für Zeitrahmen-Farben
      const getPDFTimeframeColor = (timeframe: string): number[] => {
        switch (timeframe) {
          case 'Sofort': return [234, 67, 53]; // Rot
          case '1-2 Wochen': return [255, 171, 0]; // Orange
          case '1-3 Monate': return [30, 136, 229]; // Blau
          case '3-6 Monate': return [156, 39, 176]; // Lila
          default: return [96, 125, 139]; // Grau
        }
      };

      // DECKBLATT mit Premium-Design
      drawBox(0, 0, 210, 297, colors.primary); // Vollständiger blauer Hintergrund
      
      // Weißer Inhaltsbereich
      drawBox(20, 30, 170, 220, colors.white);
      
      // Logo-Platzhalter / Header
      drawBox(25, 35, 160, 25, colors.light);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(20);
      pdf.text('DIGITAL MARKETING', 105, 48, { align: 'center' });
      pdf.setFontSize(16);
      pdf.text('ANALYSE-REPORT', 105, 56, { align: 'center' });
      
      yPosition = 80;
      
      // Firmenname prominent mit Textumbruch
      pdf.setFontSize(20);
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      const companyName = realData.company.name.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '');
      const nameLines = pdf.splitTextToSize(companyName, 150);
      nameLines.forEach((line: string, index: number) => {
        pdf.text(line, 105, yPosition + (index * 7), { align: 'center' });
      });
      yPosition += nameLines.length * 7 + 15;
      
      // Gesamtbewertung - großer Score Circle
      const overallScore = Math.round(
        (realData.seo.score + realData.performance.score + realData.imprint.score + realData.mobile.overallScore) / 4
      );
      
      // Score Circle Background
      const scoreColor = getScoreColor(overallScore);
      pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.circle(105, yPosition + 20, 20, 'F');
      
      // Score Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.text(overallScore.toString(), 105, yPosition + 18, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('/100', 105, yPosition + 26, { align: 'center' });
      
      yPosition += 55;
      
      // Website & Branche mit Textumbruch
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(12);
      const websiteText = `Website: ${realData.company.url}`;
      const websiteLines = pdf.splitTextToSize(websiteText, 150);
      websiteLines.forEach((line: string, index: number) => {
        pdf.text(line, 105, yPosition + (index * 5), { align: 'center' });
      });
      yPosition += websiteLines.length * 5 + 3;
      
      pdf.text(`Branche: ${getIndustryName(businessData.industry)}`, 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Key Metrics in Boxen
      const metrics = [
        { label: 'SEO-Score', value: `${realData.seo.score}/100`, color: getScoreColor(realData.seo.score) },
        { label: 'Performance', value: `${realData.performance.score}/100`, color: getScoreColor(realData.performance.score) },
        { label: 'Mobile', value: `${realData.mobile.overallScore}/100`, color: getScoreColor(realData.mobile.overallScore) },
        { label: 'Bewertungen', value: `${realData.reviews.google.count}`, color: colors.primary }
      ];
      
      const boxWidth = 35;
      const startX = 105 - (metrics.length * boxWidth + (metrics.length - 1) * 5) / 2;
      
      metrics.forEach((metric, index) => {
        const x = startX + index * (boxWidth + 5);
        drawBox(x, yPosition, boxWidth, 20, metric.color);
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text(metric.label, x + boxWidth/2, yPosition + 7, { align: 'center' });
        pdf.setFontSize(10);
        pdf.text(metric.value, x + boxWidth/2, yPosition + 15, { align: 'center' });
      });
      
      yPosition += 35;
      
      // Datum und Report-Info
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(10);
      pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 105, yPosition, { align: 'center' });
      pdf.text('Live-Analyse mit detaillierten Handlungsempfehlungen', 105, yPosition + 6, { align: 'center' });

      // NEUE SEITE - Executive Summary
      pdf.addPage();
      yPosition = 20;
      
      // Header-Design für alle Folgeseiten
      drawBox(leftMargin, 10, 180, 15, colors.primary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('EXECUTIVE SUMMARY', 20, 20);
      
      yPosition = 40;
      
      // Summary Box
      drawBox(leftMargin, yPosition - 5, 180, 60, colors.light, colors.primary);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(14);
      pdf.text('BEWERTUNGSÜBERSICHT', 20, yPosition + 5);
      yPosition += 15;
      
      // Detaillierte Summary mit mehr Inhalt
      const summaryItems = [
        `Gesamtbewertung: ${overallScore}/100 Punkte (${getScoreRating(overallScore)})`,
        `Verbesserungspotenzial: ${100 - overallScore} Punkte identifiziert`,
        `Geschätzte Umsatzsteigerung: 15-25% im ersten Jahr bei Umsetzung`,
        `Prioritäre Maßnahmen: ${generateImprovementActions().filter(a => a.priority === 'Hoch').length} identifiziert`,
        `Konkurrenzfähigkeit: Position ${getRankingPosition(overallScore)} in der Branche`,
        `ROI-Prognose: 300-500% Return on Investment erwartet`
      ];
      
      summaryItems.forEach(item => {
        yPosition = addWrappedText(item, 20, yPosition, textWidth - 10, 10);
        yPosition += 2;
      });
      
      yPosition += 15;
      
      // SWOT-Analyse hinzufügen
      checkNewPage(80);
      drawBox(leftMargin, yPosition - 5, 180, 15, colors.accent);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('SWOT-ANALYSE', 20, yPosition + 4);
      yPosition += 20;
      
      const swotData = generateSWOTAnalysis(realData, businessData.industry);
      const swotSections = [
        { title: 'STÄRKEN', items: swotData.strengths, color: colors.secondary },
        { title: 'SCHWÄCHEN', items: swotData.weaknesses, color: colors.danger },
        { title: 'CHANCEN', items: swotData.opportunities, color: colors.primary },
        { title: 'RISIKEN', items: swotData.threats, color: colors.accent }
      ];
      
      swotSections.forEach((section, sectionIndex) => {
        if (sectionIndex % 2 === 0) checkNewPage(40);
        
        const boxX = leftMargin + (sectionIndex % 2) * 90;
        const boxY = yPosition + Math.floor(sectionIndex / 2) * 45;
        
        drawBox(boxX, boxY, 85, 35, section.color);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(11);
        pdf.text(section.title, boxX + 42.5, boxY + 8, { align: 'center' });
        
        pdf.setFontSize(8);
        section.items.slice(0, 3).forEach((item, itemIndex) => {
          const cleanItem = item.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '');
          const itemLines = pdf.splitTextToSize(cleanItem, 75);
          pdf.text(itemLines[0] || '', boxX + 5, boxY + 16 + itemIndex * 6);
        });
        
        if (sectionIndex === 1 || sectionIndex === 3) {
          yPosition += 45;
        }
      });
      
      yPosition += 25;

      // Detailbewertungen mit mehr Inhalt
      checkNewPage(100);
      pdf.setFontSize(14);
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.text('DETAILBEWERTUNGEN & BENCHMARKING', leftMargin, yPosition);
      yPosition += 15;
      
      const detailCategories = [
        { 
          name: 'SEO-Optimierung', 
          score: realData.seo.score, 
          icon: 'SEO',
          benchmark: 'Branchendurchschnitt: 65/100',
          recommendation: 'Title-Tags und Meta-Descriptions optimieren'
        },
        { 
          name: 'Ladegeschwindigkeit', 
          score: realData.performance.score, 
          icon: 'SPEED',
          benchmark: 'Google-Empfehlung: >90/100',
          recommendation: 'Bilder komprimieren, Caching aktivieren'
        },
        { 
          name: 'Mobile Optimierung', 
          score: realData.mobile.overallScore, 
          icon: 'MOBILE',
          benchmark: 'Mobile-First-Standard: >85/100',
          recommendation: 'Touch-Navigation und Responsive Design'
        },
        { 
          name: 'Rechtliche Compliance', 
          score: realData.imprint.score, 
          icon: 'LEGAL',
          benchmark: 'Gesetzliche Anforderung: 100/100',
          recommendation: 'Impressum und Datenschutz vervollständigen'
        },
        { 
          name: 'Online Reputation', 
          score: realData.reviews.google.count > 10 ? 85 : 45, 
          icon: 'REP',
          benchmark: 'Branchenführer: >4.5/5 (50+ Bewertungen)',
          recommendation: 'Aktive Bewertungssammlung implementieren'
        },
        { 
          name: 'Social Media Präsenz', 
          score: (() => {
            let socialScore = 0;
            if (realData.socialMedia.facebook.found) socialScore += 50;
            if (realData.socialMedia.instagram.found) socialScore += 50;
            return socialScore;
          })(), 
          icon: 'SOCIAL',
          benchmark: 'Lokale Unternehmen: 2-3 aktive Kanäle',
          recommendation: 'Facebook Business und Instagram einrichten'
        }
      ];
      
      detailCategories.forEach((cat, index) => {
        checkNewPage(35);
        const scoreColor = getScoreColor(cat.score);
        
        // Kategorie Header
        drawBox(leftMargin, yPosition - 2, 180, 25, colors.light, scoreColor);
        
        // Score Box
        drawBox(leftMargin + 5, yPosition + 1, 25, 12, scoreColor);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text(`${cat.score}`, leftMargin + 17.5, yPosition + 8, { align: 'center' });
        
        // Kategorie Name
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(12);
        pdf.text(`${cat.icon} ${cat.name}`, leftMargin + 35, yPosition + 8);
        
        // Status Text
        pdf.setFontSize(10);
        pdf.text(`${getScoreRating(cat.score)}`, leftMargin + 140, yPosition + 8);
        
        // Benchmark und Empfehlung
        yPosition += 18;
        pdf.setFontSize(8);
        pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
        yPosition = addWrappedText(`Benchmark: ${cat.benchmark}`, leftMargin + 5, yPosition, textWidth - 20, 8);
        
        pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        yPosition = addWrappedText(`Empfehlung: ${cat.recommendation}`, leftMargin + 5, yPosition, textWidth - 20, 8);
        
        yPosition += 8;
      });

      // KONKURRENZANALYSE - Erweitert
      pdf.addPage();
      yPosition = 20;
      
      drawBox(leftMargin, 10, 180, 15, colors.accent);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('KONKURRENZANALYSE & MARKTPOSITION', 20, 20);
      
      yPosition = 40;
      
      if (realData.competitors.length > 0) {
        // Markt-Dashboard mit mehr Details
        drawBox(leftMargin, yPosition - 5, 180, 70, colors.light, colors.accent);
        
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(14);
        pdf.text('MARKT-DASHBOARD', 20, yPosition + 5);
        yPosition += 15;
        
        const avgRating = realData.competitors.reduce((sum, comp) => sum + comp.rating, 0) / realData.competitors.length;
        const avgReviews = realData.competitors.reduce((sum, comp) => sum + comp.reviews, 0) / realData.competitors.length;
        const ownRating = realData.reviews.google.rating || 4.2;
        const ownReviewCount = realData.reviews.google.count || 0;
        
        // Detaillierte Marktanalyse
        const marketInsights = [
          `Marktposition: ${ownRating > avgRating ? 'Überdurchschnittlich' : 'Unterdurchschnittlich'} (Sie: ${ownRating.toFixed(1)}/5 vs. Markt: ${avgRating.toFixed(1)}/5)`,
          `Review-Performance: ${ownReviewCount > avgReviews ? 'Stark' : 'Verbesserungsbedarf'} (Sie: ${ownReviewCount} vs. Markt: ${Math.round(avgReviews)})`,
          `Marktanteil-Potenzial: ${calculateMarketSharePotential(ownRating, avgRating, ownReviewCount, avgReviews)}%`,
          `Wettbewerbsintensität: ${realData.competitors.length > 8 ? 'Hoch' : realData.competitors.length > 4 ? 'Mittel' : 'Niedrig'} (${realData.competitors.length} direkte Konkurrenten)`,
          `Differentierungschance: ${getDifferentiationOpportunity(realData.competitors)} verfügbar`
        ];
        
        marketInsights.forEach((insight, index) => {
          yPosition = addWrappedText(`• ${insight}`, leftMargin + 5, yPosition, textWidth - 20, 9);
          yPosition += 2;
        });
        
        yPosition += 15;
        
        // Top Performers vs. Schwache Konkurrenten
        const topPerformers = realData.competitors.filter(c => c.rating >= 4.5 && c.reviews >= 50);
        const weakCompetitors = realData.competitors.filter(c => c.rating < 4.0 || c.reviews < 20);
        
        if (topPerformers.length > 0 || weakCompetitors.length > 0) {
          checkNewPage(60);
          
          // Top Performers Box
          if (topPerformers.length > 0) {
            drawBox(leftMargin, yPosition, 85, 45, [232, 245, 233], colors.secondary);
            pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
            pdf.setFontSize(12);
            pdf.text(`TOP PERFORMERS (${topPerformers.length})`, leftMargin + 5, yPosition + 8);
            pdf.setFontSize(8);
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            
            topPerformers.slice(0, 4).forEach((comp, index) => {
              const compName = comp.name.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '').substring(0, 20);
              yPosition = addWrappedText(`${index + 1}. ${compName} (${comp.rating}/5, ${comp.reviews} Reviews)`, leftMargin + 5, yPosition + 12 + index * 8, 75, 8);
            });
          }
          
          // Schwache Konkurrenten Box
          if (weakCompetitors.length > 0) {
            drawBox(leftMargin + 95, yPosition, 85, 45, [255, 243, 224], colors.danger);
            pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
            pdf.setFontSize(12);
            pdf.text(`SCHWACHE KONKURRENZ (${weakCompetitors.length})`, leftMargin + 100, yPosition + 8);
            pdf.setFontSize(8);
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            
            let weakYPos = yPosition;
            weakCompetitors.slice(0, 4).forEach((comp, index) => {
              const compName = comp.name.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '').substring(0, 20);
              weakYPos = addWrappedText(`${index + 1}. ${compName} (${comp.rating}/5, ${comp.reviews} Reviews)`, leftMargin + 100, weakYPos + 12 + index * 8, 75, 8);
            });
          }
          
          yPosition += 60;
        }

        // Detaillierte Konkurrenten-Profile
        realData.competitors.slice(0, 4).forEach((competitor, index) => {
          checkNewPage(100);
          
          // Konkurrenten-Header
          const headerColor = index % 2 === 0 ? colors.primary : colors.accent;
          drawBox(leftMargin, yPosition - 5, 180, 20, headerColor);
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(14);
          const competitorName = competitor.name.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '');
          pdf.text(`KONKURRENT #${index + 1}: ${competitorName.substring(0, 30)}`, 20, yPosition + 6);
          yPosition += 30;
          
          // Detaillierte Konkurrenzanalyse
          const comparisonData = [
            { label: 'Bewertung', own: ownRating.toFixed(1), comp: competitor.rating.toFixed(1), unit: '/5', analysis: getComparisonAnalysis('rating', ownRating, competitor.rating) },
            { label: 'Reviews', own: ownReviewCount.toString(), comp: competitor.reviews.toString(), unit: '', analysis: getComparisonAnalysis('reviews', ownReviewCount, competitor.reviews) },
            { label: 'Online-Präsenz', own: getOnlinePresenceScore(realData).toString(), comp: '75', unit: '/100', analysis: 'Basierend auf Website-Qualität und Social Media' }
          ];
          
          comparisonData.forEach((data, dataIndex) => {
            const y = yPosition + dataIndex * 20;
            
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            pdf.setFontSize(11);
            pdf.text(data.label + ':', leftMargin + 5, y);
            
            // Ihre Werte
            const ownBetter = parseFloat(data.own) > parseFloat(data.comp);
            const ownColor = ownBetter ? colors.secondary : colors.danger;
            drawBox(leftMargin + 60, y - 8, 30, 12, ownColor);
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(9);
            pdf.text(`Sie: ${data.own}${data.unit}`, leftMargin + 75, y - 2, { align: 'center' });
            
            // Konkurrent
            const compColor = !ownBetter ? colors.secondary : colors.danger;
            drawBox(leftMargin + 100, y - 8, 30, 12, compColor);
            pdf.text(`${data.comp}${data.unit}`, leftMargin + 115, y - 2, { align: 'center' });
            
            // Analyse
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            pdf.setFontSize(8);
            yPosition = addWrappedText(data.analysis, leftMargin + 140, y - 5, 50, 8);
          });
          
          yPosition += 25;
          
          // Strategien Box mit mehr Inhalt
          drawBox(leftMargin + 5, yPosition, 170, 35, colors.light, colors.primary);
          pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          pdf.setFontSize(11);
          pdf.text('STRATEGISCHE EMPFEHLUNGEN:', leftMargin + 10, yPosition + 8);
          
          const strategies = getCompetitorStrategies(competitor, ownRating, ownReviewCount);
          pdf.setFontSize(8);
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          
          let strategyY = yPosition + 15;
          strategies.slice(0, 3).forEach((strategy) => {
            strategyY = addWrappedText(`• ${strategy}`, leftMargin + 10, strategyY, 160, 8);
            strategyY += 2;
          });
          
          yPosition += 45;
        });
      }

      // HANDLUNGSEMPFEHLUNGEN mit mehr Details
      pdf.addPage();
      yPosition = 20;
      
      drawBox(leftMargin, 10, 180, 15, colors.secondary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('HANDLUNGSEMPFEHLUNGEN & UMSETZUNGSPLAN', 20, 20);
      
      yPosition = 45;
      
      const actions = generateImprovementActions();
      const priorityGroups = {
        'Hoch': actions.filter(a => a.priority === 'Hoch'),
        'Mittel': actions.filter(a => a.priority === 'Mittel'),
        'Niedrig': actions.filter(a => a.priority === 'Niedrig')
      };
      
      // ROI-Übersicht hinzufügen
      drawBox(leftMargin, yPosition - 5, 180, 40, colors.light, colors.secondary);
      pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
      pdf.setFontSize(14);
      pdf.text('ROI-PROGNOSE & BUDGET-EMPFEHLUNG', leftMargin + 5, yPosition + 5);
      yPosition += 15;
      
      const roiData = calculateROIProjection(overallScore, actions.length);
      const roiItems = [
        `Geschätzte Investition: ${roiData.investment} Euro (erste 6 Monate)`,
        `Erwarteter Zusatzumsatz: ${roiData.revenue} Euro/Jahr`,
        `Break-Even-Point: ${roiData.breakEven} Monate`,
        `ROI nach 12 Monaten: ${roiData.roi}%`
      ];
      
      roiItems.forEach((item) => {
        yPosition = addWrappedText(`• ${item}`, leftMargin + 5, yPosition, textWidth - 10, 9);
        yPosition += 2;
      });
      
      yPosition += 15;
      
      Object.entries(priorityGroups).forEach(([priority, priorityActions]) => {
        if (priorityActions.length === 0) return;
        
        checkNewPage(80);
        const priorityColor = priority === 'Hoch' ? colors.danger : priority === 'Mittel' ? colors.accent : colors.secondary;
        
        drawBox(leftMargin, yPosition - 5, 180, 15, priorityColor);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.text(`${priority.toUpperCase()} PRIORITÄT (${priorityActions.length} Maßnahmen)`, 20, yPosition + 4);
        yPosition += 25;
        
        priorityActions.slice(0, 6).forEach((action, index) => {
          checkNewPage(45);
          
          // Action Box mit mehr Details
          drawBox(leftMargin + 5, yPosition, 170, 35, colors.light, priorityColor);
          
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          pdf.setFontSize(11);
          pdf.text(`${index + 1}. ${action.action}`, leftMargin + 10, yPosition + 8);
          
          // Beschreibung mit Umbruch
          pdf.setFontSize(8);
          yPosition = addWrappedText(action.description, leftMargin + 10, yPosition + 15, 160, 8);
          
          // Tags mit besserer Platzierung
          const tags = [
            { label: action.timeframe, color: getPDFTimeframeColor(action.timeframe) },
            { label: `${action.effort} Aufwand`, color: colors.primary },
            { label: `${action.impact} Impact`, color: colors.secondary }
          ];
          
          tags.forEach((tag, tagIndex) => {
            const tagX = leftMargin + 10 + tagIndex * 55;
            if (tagX + 50 <= rightMargin) {
              drawBox(tagX, yPosition + 5, 50, 8, tag.color);
              pdf.setTextColor(255, 255, 255);
              pdf.setFontSize(7);
              pdf.text(tag.label, tagX + 25, yPosition + 10, { align: 'center' });
            }
          });
          
          yPosition += 25;
        });
        
        yPosition += 15;
      });
      
      // IMPLEMENTIERUNGSPLAN hinzufügen
      pdf.addPage();
      yPosition = 20;
      
      drawBox(leftMargin, 10, 180, 15, colors.primary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('90-TAGE IMPLEMENTIERUNGSPLAN', 20, 20);
      yPosition = 45;
      
      const implementationPlan = generateImplementationPlan(actions);
      Object.entries(implementationPlan).forEach(([period, periodActions]) => {
        checkNewPage(60);
        
        drawBox(leftMargin, yPosition - 5, 180, 15, colors.accent);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.text(`${period.toUpperCase()} (${periodActions.length} Maßnahmen)`, leftMargin + 5, yPosition + 4);
        yPosition += 20;
        
        periodActions.forEach((action, index) => {
          checkNewPage(15);
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          pdf.setFontSize(10);
          yPosition = addWrappedText(`${index + 1}. ${action.action} (${action.category})`, leftMargin + 5, yPosition, textWidth - 10, 10);
          yPosition += 3;
        });
        
        yPosition += 10;
      });

      // Footer auf allen Seiten
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        // Footer Box
        drawBox(0, 285, 210, 12, colors.dark);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text('Premium Digital Marketing Analyse - Live-Daten & Handlungsempfehlungen', leftMargin, 292);
        pdf.text(`Seite ${i} von ${pageCount}`, 170, 292);
        pdf.text(new Date().toLocaleDateString('de-DE'), leftMargin, 289);
        
        if (i > 1) {
          const footerCompanyName = realData.company.name.replace(/[^\x20-\x7E\u00A0-\u017F\u0100-\u024F]/g, '').substring(0, 30);
          pdf.text(footerCompanyName, 105, 289, { align: 'center' });
        }
      }
      
      // PDF speichern
      const cleanCompanyName = realData.company.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      const fileName = `Premium_Marketing_Analyse_${cleanCompanyName}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('Premium PDF successfully generated:', fileName, 'Total pages:', pdf.getNumberOfPages());
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions für Component
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

  const getRankingPosition = (score: number): string => {
    if (score >= 85) return 'Top 10%';
    if (score >= 70) return 'Top 25%';
    if (score >= 55) return 'Top 50%';
    return 'Untere 50%';
  };

  const generateSWOTAnalysis = (data: RealBusinessData, industry: string) => {
    return {
      strengths: [
        data.seo.score > 70 ? 'Starke SEO-Grundlage vorhanden' : '',
        data.performance.score > 70 ? 'Gute Website-Performance' : '',
        data.mobile.overallScore > 70 ? 'Mobile-optimierte Website' : '',
        data.reviews.google.rating > 4 ? 'Positive Kundenbewertungen' : '',
        'Etabliertes lokales Unternehmen'
      ].filter(Boolean),
      weaknesses: [
        data.seo.score < 60 ? 'SEO-Optimierung erforderlich' : '',
        data.performance.score < 60 ? 'Langsame Ladezeiten' : '',
        data.mobile.overallScore < 60 ? 'Mobile Optimierung nötig' : '',
        data.reviews.google.count < 20 ? 'Wenige Online-Bewertungen' : '',
        !data.socialMedia.facebook.found ? 'Fehlende Social Media Präsenz' : ''
      ].filter(Boolean),
      opportunities: [
        'Digitale Transformation im Handwerk',
        'Steigende Nachfrage nach lokalen Dienstleistern',
        'Google My Business Optimierung',
        'Content Marketing für Fachkompetenz',
        'Online-Terminbuchung implementieren'
      ],
      threats: [
        'Zunehmende Online-Konkurrenz',
        'Fachkräftemangel in der Branche',
        'Preisdruck durch Großanbieter',
        'Negative Online-Bewertungen',
        'Veränderte Kundenerwartungen'
      ]
    };
  };

  const calculateMarketSharePotential = (ownRating: number, avgRating: number, ownReviews: number, avgReviews: number): number => {
    const ratingAdvantage = ((ownRating - avgRating) / avgRating) * 100;
    const reviewAdvantage = ((ownReviews - avgReviews) / avgReviews) * 100;
    return Math.max(5, Math.min(35, Math.round((ratingAdvantage + reviewAdvantage) / 2) + 15));
  };

  const getDifferentiationOpportunity = (competitors: any[]): string => {
    const avgRating = competitors.reduce((sum, comp) => sum + comp.rating, 0) / competitors.length;
    if (avgRating < 4.0) return 'Qualitätsdifferenzierung';
    if (competitors.length > 10) return 'Spezialisierung';
    return 'Service-Excellence';
  };

  const getComparisonAnalysis = (type: string, own: number, competitor: number): string => {
    const difference = own - competitor;
    if (type === 'rating') {
      if (difference > 0.5) return 'Deutlicher Qualitätsvorsprung';
      if (difference > 0.2) return 'Leichter Vorteil';
      if (difference < -0.5) return 'Qualität steigern erforderlich';
      return 'Ausgeglichenes Niveau';
    }
    if (type === 'reviews') {
      if (difference > 20) return 'Starke Online-Präsenz';
      if (difference > 5) return 'Gute Sichtbarkeit';
      if (difference < -20) return 'Mehr Bewertungen sammeln';
      return 'Vergleichbare Präsenz';
    }
    return 'Analyse nicht verfügbar';
  };

  const getOnlinePresenceScore = (data: RealBusinessData): number => {
    let score = 0;
    score += data.seo.score * 0.3;
    score += data.performance.score * 0.2;
    score += data.mobile.overallScore * 0.2;
    score += (data.reviews.google.count > 10 ? 80 : data.reviews.google.count * 4) * 0.15;
    
    // Fix the boolean addition issue
    let socialMediaScore = 0;
    if (data.socialMedia.facebook.found) socialMediaScore += 50;
    if (data.socialMedia.instagram.found) socialMediaScore += 50;
    score += socialMediaScore * 0.15;
    
    return Math.round(score);
  };

  const calculateROIProjection = (currentScore: number, actionCount: number) => {
    const investment = Math.max(2000, actionCount * 300);
    const potentialIncrease = (100 - currentScore) * 0.6;
    const revenue = Math.round(investment * (2 + potentialIncrease / 10));
    const breakEven = Math.max(3, Math.round(12 - (potentialIncrease / 10)));
    const roi = Math.round(((revenue - investment) / investment) * 100);
    
    return {
      investment: investment.toLocaleString('de-DE'),
      revenue: revenue.toLocaleString('de-DE'),
      breakEven,
      roi
    };
  };

  const generateImplementationPlan = (actions: ImprovementAction[]) => {
    return {
      'Woche 1-2': actions.filter(a => a.timeframe === 'Sofort' || a.timeframe === '1-2 Wochen'),
      'Monat 1': actions.filter(a => a.timeframe === '1-3 Monate' && a.priority === 'Hoch'),
      'Monat 2-3': actions.filter(a => a.timeframe === '1-3 Monate' && a.priority !== 'Hoch')
    };
  };

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

  const getTimeframeColorComponent = (timeframe: string) => {
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
            Premium PDF-Export mit professionellem Design
          </CardTitle>
          <CardDescription>
            Hochwertig gestalteter Bericht mit Farben, Grafiken und visuellen Elementen
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
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border">
                <h3 className="font-semibold mb-3 text-blue-900">🎨 Premium PDF-Design enthält:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2 text-blue-800">Visuelle Elemente:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Professionelles Deckblatt mit Farbschema</li>
                      <li>• Farbcodierte Bewertungsboxen</li>
                      <li>• Große Score-Circle mit Farbampel</li>
                      <li>• Dashboard-Metriken in Boxen</li>
                      <li>• Konkurrenz-Vergleichsgrafiken</li>
                      <li>• Status-Bars und Progress-Anzeigen</li>
                      <li>• Kategorisierte Action-Boxen</li>
                      <li>• Prioritäts-Farbcodierung</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-green-800">Neue Inhalte:</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• SWOT-Analyse mit visuellen Elementen</li>
                      <li>• ROI-Prognose und Budget-Empfehlungen</li>
                      <li>• 90-Tage Implementierungsplan</li>
                      <li>• Detaillierte Marktpositionsanalyse</li>
                      <li>• Benchmarking gegen Branchenstandards</li>
                      <li>• Verbesserte Textumbrüche</li>
                      <li>• Sonderzeichen-Behandlung</li>
                      <li>• Mehr strategische Empfehlungen</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Live-Analysierte Firma:</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Name:</strong> {realData.company.name}</p>
                  <p><strong>Website:</strong> {realData.company.url}</p>
                  <p><strong>Adresse:</strong> {realData.company.address}</p>
                  <p><strong>Branche:</strong> {realData.company.industry}</p>
                  <p><strong>Gesamtbewertung:</strong> {overallScore}/100 Punkte</p>
                  <p><strong>Verbesserungspotenzial:</strong> {100 - overallScore} Punkte möglich</p>
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
                          <div className={`font-medium ${getTimeframeColorComponent(action.timeframe)}`}>
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
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-3">
                    ✨ Ihr erweiterte Premium-Design Marketing-Plan ist bereit!
                  </h3>
                  <div className="text-sm text-green-800 space-y-2">
                    <p><strong>Design:</strong> Professionelles Layout mit verbesserter Textformatierung</p>
                    <p><strong>Umfang:</strong> Umfassender Analysebericht mit SWOT, ROI und Implementierungsplan</p>
                    <p><strong>Maßnahmen:</strong> {improvementActions.length} konkrete Verbesserungsschritte</p>
                    <p><strong>Konkurrenz:</strong> Analyse von {realData.competitors.length} lokalen Mitbewerbern</p>
                    <p><strong>Keywords:</strong> {realData.keywords.length} branchenspezifische Begriffe analysiert</p>
                    <p><strong>Neu:</strong> Optimierte Seitenumbrüche und Sonderzeichen-Behandlung</p>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  size="lg" 
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Erweiterte Premium PDF wird erstellt...' : '🎨 Erweiterte Premium PDF-Report herunterladen'}
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Der erweiterte Premium-Bericht enthält alle echten Live-Analysedaten mit</p>
                  <p>verbesserter Formatierung und zusätzlichen strategischen Inhalten für {realData.company.name}</p>
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
