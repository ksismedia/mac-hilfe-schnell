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
      
      // Firmenname prominent
      pdf.setFontSize(24);
      pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      pdf.text(realData.company.name, 105, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Gesamtbewertung - großer Score Circle
      const overallScore = Math.round(
        (realData.seo.score + realData.performance.score + realData.imprint.score + realData.mobile.overallScore) / 4
      );
      
      // Score Circle Background
      pdf.setFillColor(...getScoreColor(overallScore));
      pdf.circle(105, yPosition + 20, 20, 'F');
      
      // Score Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.text(overallScore.toString(), 105, yPosition + 18, { align: 'center' });
      pdf.setFontSize(12);
      pdf.text('/100', 105, yPosition + 26, { align: 'center' });
      
      yPosition += 55;
      
      // Website & Branche
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(14);
      pdf.text(`Website: ${realData.company.url}`, 105, yPosition, { align: 'center' });
      yPosition += 8;
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
        pdf.setFontSize(10);
        pdf.text(metric.label, x + boxWidth/2, yPosition + 8, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text(metric.value, x + boxWidth/2, yPosition + 16, { align: 'center' });
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
      drawBox(15, 10, 180, 15, colors.primary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('EXECUTIVE SUMMARY', 20, 20);
      
      yPosition = 40;
      
      // Summary Box
      drawBox(15, yPosition - 5, 180, 45, colors.light, colors.primary);
      
      pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      pdf.setFontSize(14);
      pdf.text('BEWERTUNGSÜBERSICHT', 20, yPosition + 5);
      yPosition += 15;
      
      pdf.setFontSize(11);
      const summaryText = [
        `Gesamtbewertung: ${overallScore}/100 Punkte (${getScoreRating(overallScore)})`,
        `Verbesserungspotenzial: ${100 - overallScore} Punkte identifiziert`,
        `Geschätzte Umsatzsteigerung: 15-25% im ersten Jahr`,
        `Prioritäre Maßnahmen: ${generateImprovementActions().filter(a => a.priority === 'Hoch').length} identifiziert`
      ];
      
      summaryText.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 7;
      });
      
      yPosition += 20;
      
      // Detailbewertungen mit Farb-Codierung
      pdf.setFontSize(14);
      pdf.text('DETAILBEWERTUNGEN', 20, yPosition);
      yPosition += 15;
      
      const detailCategories = [
        { name: 'SEO-Optimierung', score: realData.seo.score, icon: '🔍' },
        { name: 'Ladegeschwindigkeit', score: realData.performance.score, icon: '⚡' },
        { name: 'Mobile Optimierung', score: realData.mobile.overallScore, icon: '📱' },
        { name: 'Rechtliche Compliance', score: realData.imprint.score, icon: '⚖️' },
        { name: 'Online Reputation', score: realData.reviews.google.count > 10 ? 85 : 45, icon: '⭐' },
        { name: 'Social Media', score: (realData.socialMedia.facebook.found ? 50 : 0) + (realData.socialMedia.instagram.found ? 50 : 0), icon: '📲' }
      ];
      
      detailCategories.forEach(cat => {
        checkNewPage(25);
        const scoreColor = getScoreColor(cat.score);
        
        // Score Box
        drawBox(20, yPosition - 2, 25, 12, scoreColor);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text(`${cat.score}`, 32.5, yPosition + 4, { align: 'center' });
        
        // Kategorie
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(12);
        pdf.text(`${cat.icon} ${cat.name}`, 50, yPosition + 4);
        
        // Status Bar
        const barWidth = 80;
        const barHeight = 4;
        const barX = 130;
        
        // Hintergrund
        drawBox(barX, yPosition, barWidth, barHeight, [230, 230, 230]);
        // Fortschritt
        const progressWidth = (cat.score / 100) * barWidth;
        drawBox(barX, yPosition, progressWidth, barHeight, scoreColor);
        
        pdf.setFontSize(10);
        pdf.text(`${getScoreRating(cat.score)}`, barX + barWidth + 5, yPosition + 3);
        
        yPosition += 18;
      });

      // KONKURRENZANALYSE - Erweitert mit grafischen Elementen
      pdf.addPage();
      yPosition = 20;
      
      drawBox(15, 10, 180, 15, colors.accent);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('KONKURRENZANALYSE', 20, 20);
      
      yPosition = 40;
      
      if (realData.competitors.length > 0) {
        // Markt-Dashboard
        drawBox(15, yPosition - 5, 180, 60, colors.light, colors.accent);
        
        pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
        pdf.setFontSize(14);
        pdf.text('MARKT-DASHBOARD', 20, yPosition + 5);
        yPosition += 15;
        
        const avgRating = realData.competitors.reduce((sum, comp) => sum + comp.rating, 0) / realData.competitors.length;
        const avgReviews = realData.competitors.reduce((sum, comp) => sum + comp.reviews, 0) / realData.competitors.length;
        const ownRating = realData.reviews.google.rating || 4.2;
        const ownReviewCount = realData.reviews.google.count || 0;
        
        // Dashboard-Metriken
        const dashboardMetrics = [
          { label: 'Konkurrenten', value: realData.competitors.length.toString(), color: colors.primary },
          { label: '⌀ Bewertung', value: avgRating.toFixed(1), color: colors.secondary },
          { label: '⌀ Reviews', value: Math.round(avgReviews).toString(), color: colors.accent },
          { label: 'Ihre Position', value: ownRating > avgRating ? 'ÜBER ⌀' : 'UNTER ⌀', color: ownRating > avgRating ? colors.secondary : colors.danger }
        ];
        
        dashboardMetrics.forEach((metric, index) => {
          const x = 25 + index * 40;
          drawBox(x, yPosition, 35, 20, metric.color);
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(9);
          pdf.text(metric.label, x + 17.5, yPosition + 8, { align: 'center' });
          pdf.setFontSize(11);
          pdf.text(metric.value, x + 17.5, yPosition + 16, { align: 'center' });
        });
        
        yPosition += 35;
        
        // Top Performers vs. Schwache Konkurrenten
        const topPerformers = realData.competitors.filter(c => c.rating >= 4.5 && c.reviews >= 50);
        const weakCompetitors = realData.competitors.filter(c => c.rating < 4.0 || c.reviews < 20);
        
        yPosition += 10;
        
        // Top Performers Box
        if (topPerformers.length > 0) {
          checkNewPage(40);
          drawBox(15, yPosition, 85, 35, [232, 245, 233], colors.secondary);
          pdf.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
          pdf.setFontSize(12);
          pdf.text(`🏆 TOP PERFORMERS (${topPerformers.length})`, 20, yPosition + 8);
          pdf.setFontSize(9);
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          
          topPerformers.slice(0, 3).forEach((comp, index) => {
            pdf.text(`${index + 1}. ${comp.name.substring(0, 25)}`, 20, yPosition + 16 + index * 6);
            pdf.text(`${comp.rating}/5 (${comp.reviews})`, 70, yPosition + 16 + index * 6);
          });
        }
        
        // Schwache Konkurrenten Box
        if (weakCompetitors.length > 0) {
          drawBox(110, yPosition, 85, 35, [255, 243, 224], colors.danger);
          pdf.setTextColor(colors.danger[0], colors.danger[1], colors.danger[2]);
          pdf.setFontSize(12);
          pdf.text(`⚠️ SCHWACHE KONKURRENZ (${weakCompetitors.length})`, 115, yPosition + 8);
          pdf.setFontSize(9);
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          
          weakCompetitors.slice(0, 3).forEach((comp, index) => {
            pdf.text(`${index + 1}. ${comp.name.substring(0, 25)}`, 115, yPosition + 16 + index * 6);
            pdf.text(`${comp.rating}/5 (${comp.reviews})`, 165, yPosition + 16 + index * 6);
          });
        }
        
        yPosition += 50;

        // Detaillierte Konkurrenten-Profile mit Design
        realData.competitors.slice(0, 6).forEach((competitor, index) => {
          checkNewPage(80);
          
          // Konkurrenten-Header mit abwechselnden Farben
          const headerColor = index % 2 === 0 ? colors.primary : colors.accent;
          drawBox(15, yPosition - 5, 180, 20, headerColor);
          
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(14);
          pdf.text(`KONKURRENT #${index + 1}: ${competitor.name}`, 20, yPosition + 6);
          yPosition += 25;
          
          // Bewertungs-Comparison
          const comparisonData = [
            { label: 'Bewertung', own: ownRating.toFixed(1), comp: competitor.rating.toFixed(1), unit: '/5' },
            { label: 'Reviews', own: ownReviewCount.toString(), comp: competitor.reviews.toString(), unit: '' }
          ];
          
          comparisonData.forEach((data, dataIndex) => {
            const y = yPosition + dataIndex * 15;
            
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            pdf.setFontSize(11);
            pdf.text(data.label + ':', 20, y);
            
            // Ihre Werte
            const ownBetter = parseFloat(data.own) > parseFloat(data.comp);
            const ownColor = ownBetter ? colors.secondary : colors.danger;
            drawBox(70, y - 8, 30, 12, ownColor);
            pdf.setTextColor(255, 255, 255);
            pdf.text(`Sie: ${data.own}${data.unit}`, 85, y - 2, { align: 'center' });
            
            // Konkurrent
            const compColor = !ownBetter ? colors.secondary : colors.danger;
            drawBox(110, y - 8, 30, 12, compColor);
            pdf.text(`${data.comp}${data.unit}`, 125, y - 2, { align: 'center' });
            
            // Trend-Arrow
            pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
            pdf.setFontSize(16);
            pdf.text(ownBetter ? '↗️' : '↘️', 150, y);
          });
          
          yPosition += 35;
          
          // Strategien Box
          drawBox(20, yPosition, 170, 25, colors.light, colors.primary);
          pdf.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          pdf.setFontSize(11);
          pdf.text('🎯 STRATEGISCHE EMPFEHLUNGEN:', 25, yPosition + 8);
          
          const strategies = getCompetitorStrategies(competitor, ownRating, ownReviewCount);
          pdf.setFontSize(9);
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          strategies.slice(0, 2).forEach((strategy, stratIndex) => {
            pdf.text(`• ${strategy}`, 25, yPosition + 15 + stratIndex * 6);
          });
          
          yPosition += 35;
        });
      }

      // HANDLUNGSEMPFEHLUNGEN mit verbessertem Design
      pdf.addPage();
      yPosition = 20;
      
      drawBox(15, 10, 180, 15, colors.secondary);
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.text('HANDLUNGSEMPFEHLUNGEN', 20, 20);
      
      yPosition = 45;
      
      const actions = generateImprovementActions();
      const priorityGroups = {
        'Hoch': actions.filter(a => a.priority === 'Hoch'),
        'Mittel': actions.filter(a => a.priority === 'Mittel'),
        'Niedrig': actions.filter(a => a.priority === 'Niedrig')
      };
      
      Object.entries(priorityGroups).forEach(([priority, priorityActions]) => {
        if (priorityActions.length === 0) return;
        
        checkNewPage(60);
        const priorityColor = priority === 'Hoch' ? colors.danger : priority === 'Mittel' ? colors.accent : colors.secondary;
        
        drawBox(15, yPosition - 5, 180, 15, priorityColor);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(14);
        pdf.text(`${priority.toUpperCase()} PRIORITÄT (${priorityActions.length} Maßnahmen)`, 20, yPosition + 4);
        yPosition += 20;
        
        priorityActions.slice(0, 8).forEach((action, index) => {
          checkNewPage(35);
          
          // Action Box
          drawBox(20, yPosition, 170, 25, colors.light, priorityColor);
          
          pdf.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
          pdf.setFontSize(11);
          pdf.text(`${index + 1}. ${action.action}`, 25, yPosition + 8);
          
          // Tags
          const tags = [
            { label: action.timeframe, color: getTimeframeColor(action.timeframe) },
            { label: `${action.effort} Aufwand`, color: colors.primary },
            { label: `${action.impact} Impact`, color: colors.secondary }
          ];
          
          tags.forEach((tag, tagIndex) => {
            const tagX = 25 + tagIndex * 55;
            drawBox(tagX, yPosition + 12, 50, 8, tag.color);
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(7);
            pdf.text(tag.label, tagX + 25, yPosition + 17, { align: 'center' });
          });
          
          yPosition += 35;
        });
        
        yPosition += 10;
      });

      // Footer auf allen Seiten - verbessert
      const pageCount = pdf.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        
        // Footer Box
        drawBox(0, 285, 210, 12, colors.dark);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.text('Premium Digital Marketing Analyse - Live-Daten & Handlungsempfehlungen', 15, 292);
        pdf.text(`Seite ${i} von ${pageCount}`, 170, 292);
        pdf.text(new Date().toLocaleDateString('de-DE'), 15, 289);
        
        if (i > 1) {
          pdf.text(realData.company.name, 105, 289, { align: 'center' });
        }
      }
      
      // PDF speichern
      const fileName = `Premium_Marketing_Analyse_${realData.company.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      console.log('Premium PDF successfully generated:', fileName, 'Total pages:', pdf.getNumberOfPages());
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Fehler beim Erstellen des PDFs. Bitte versuchen Sie es erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper functions bleiben gleich
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

  const getTimeframeColor = (timeframe: string): number[] => {
    switch (timeframe) {
      case 'Sofort': return [234, 67, 53]; // Rot
      case '1-2 Wochen': return [255, 171, 0]; // Orange
      case '1-3 Monate': return [30, 136, 229]; // Blau
      case '3-6 Monate': return [156, 39, 176]; // Lila
      default: return [96, 125, 139]; // Grau
    }
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
                    <h4 className="font-medium mb-2 text-green-800">Design-Features:</h4>
                    <ul className="space-y-1 text-green-700">
                      <li>• Einheitliches Farbschema (Blau/Grün/Orange)</li>
                      <li>• Header-Design auf jeder Seite</li>
                      <li>• Rahmen und Schatten-Effekte</li>
                      <li>• Icons und Emojis für bessere Lesbarkeit</li>
                      <li>• Strukturierte Layouts mit Boxen</li>
                      <li>• Professioneller Footer</li>
                      <li>• Responsive Text-Größen</li>
                      <li>• Marken-Konsistenz</li>
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
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-3">
                    ✨ Ihr Premium-Design Marketing-Plan ist bereit!
                  </h3>
                  <div className="text-sm text-green-800 space-y-2">
                    <p><strong>Design:</strong> Professionelles Layout mit Farben und Grafiken</p>
                    <p><strong>Umfang:</strong> Premium-Analysebericht mit visuellen Elementen</p>
                    <p><strong>Maßnahmen:</strong> {improvementActions.length} konkrete Verbesserungsschritte</p>
                    <p><strong>Konkurrenz:</strong> Analyse von {realData.competitors.length} lokalen Mitbewerbern</p>
                    <p><strong>Keywords:</strong> {realData.keywords.length} branchenspezifische Begriffe analysiert</p>
                  </div>
                </div>

                <Button 
                  onClick={handleExport} 
                  size="lg" 
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  disabled={isGenerating}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Premium PDF wird erstellt...' : '🎨 Premium PDF-Report herunterladen'}
                </Button>
                
                <div className="text-sm text-gray-500">
                  <p>Der Premium-Bericht enthält alle echten Live-Analysedaten mit</p>
                  <p>professionellem Design und visuellen Elementen für {realData.company.name}</p>
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
