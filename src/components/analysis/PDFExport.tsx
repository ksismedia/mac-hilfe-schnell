
import React from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface PDFExportProps {
  analysisData: any;
}

const pageHeight = 297; // A4 height in mm

// Helper function to draw a box with background color
const drawBox = (doc: jsPDF, x: number, y: number, width: number, height: number, fillColor: string) => {
  doc.setFillColor(fillColor);
  doc.rect(x, y, width, height, 'F');
};

// Helper function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 40) return '#f97316'; // orange
  return '#ef4444'; // red
};

// Helper function to add wrapped text
const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number): number => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return lines.length * 5; // Return height used
};

export const PDFExport: React.FC<PDFExportProps> = ({ analysisData }) => {
  const handleExport = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title Page
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Website-Analyse Bericht', 20, yPosition);
    yPosition += 20;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`Domain: ${analysisData.domain || 'Nicht angegeben'}`, 20, yPosition);
    yPosition += 10;
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 20, yPosition);
    yPosition += 30;

    // Executive Summary
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const summaryText = `Diese umfassende Website-Analyse untersucht verschiedene Aspekte Ihrer Online-Präsenz, 
    einschließlich SEO, Performance, Mobile Optimierung, Konkurrenzanalyse und Conversion-Optimierung. 
    Der Bericht bietet detaillierte Einblicke und konkrete Handlungsempfehlungen zur Verbesserung 
    Ihrer Website-Performance und Online-Sichtbarkeit.`;
    
    yPosition += addWrappedText(doc, summaryText, 20, yPosition, 170);
    yPosition += 20;

    // Overall Rating
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Gesamtbewertung', 20, yPosition);
    yPosition += 15;

    const overallScore = analysisData.overallRating?.score || 0;
    const scoreColor = getScoreColor(overallScore);
    drawBox(doc, 20, yPosition - 5, 50, 15, scoreColor);
    doc.setTextColor('#ffffff');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${overallScore.toString()}/100`, 25, yPosition + 5);
    doc.setTextColor('#000000');
    yPosition += 25;

    // Key Metrics Overview
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Schlüssel-Metriken:', 20, yPosition);
    yPosition += 10;

    const metrics = [
      { label: 'SEO Score', value: analysisData.seoData?.score || 0 },
      { label: 'Performance Score', value: analysisData.performanceData?.score || 0 },
      { label: 'Mobile Score', value: analysisData.mobileData?.score || 0 },
      { label: 'Conversion Score', value: analysisData.conversionData?.score || 0 }
    ];

    metrics.forEach(metric => {
      const color = getScoreColor(metric.value);
      drawBox(doc, 20, yPosition - 2, 30, 8, color);
      doc.setTextColor('#ffffff');
      doc.setFontSize(10);
      doc.text(metric.value.toString(), 22, yPosition + 3);
      doc.setTextColor('#000000');
      doc.setFontSize(12);
      doc.text(metric.label, 55, yPosition + 3);
      yPosition += 12;
    });

    // Add new page for detailed analysis
    doc.addPage();
    yPosition = 20;

    // SEO Analysis Section
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SEO Analyse', 20, yPosition);
    yPosition += 15;

    if (analysisData.seoData) {
      const seoScore = analysisData.seoData.score || 0;
      const seoColor = getScoreColor(seoScore);
      drawBox(doc, 20, yPosition - 5, 40, 12, seoColor);
      doc.setTextColor('#ffffff');
      doc.setFontSize(12);
      doc.text(`Score: ${seoScore.toString()}`, 22, yPosition + 2);
      doc.setTextColor('#000000');
      yPosition += 20;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      // SEO Details
      const seoDetails = [
        `Title Tag: ${analysisData.seoData.titleTag || 'Nicht gefunden'}`,
        `Meta Description: ${analysisData.seoData.metaDescription || 'Nicht gefunden'}`,
        `H1 Tags: ${analysisData.seoData.h1Count || 0} gefunden`,
        `Alt Tags: ${analysisData.seoData.altTagsCount || 0} von ${analysisData.seoData.totalImages || 0} Bildern`,
        `Interne Links: ${analysisData.seoData.internalLinks || 0}`,
        `Externe Links: ${analysisData.seoData.externalLinks || 0}`
      ];

      seoDetails.forEach(detail => {
        yPosition += addWrappedText(doc, detail, 20, yPosition, 170);
        yPosition += 5;
      });
    }

    yPosition += 15;

    // Performance Analysis
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Analyse', 20, yPosition);
    yPosition += 15;

    if (analysisData.performanceData) {
      const perfScore = analysisData.performanceData.score || 0;
      const perfColor = getScoreColor(perfScore);
      drawBox(doc, 20, yPosition - 5, 40, 12, perfColor);
      doc.setTextColor('#ffffff');
      doc.setFontSize(12);
      doc.text(`Score: ${perfScore.toString()}`, 22, yPosition + 2);
      doc.setTextColor('#000000');
      yPosition += 20;

      const perfDetails = [
        `Ladezeit: ${analysisData.performanceData.loadTime || 'N/A'}`,
        `First Contentful Paint: ${analysisData.performanceData.fcp || 'N/A'}`,
        `Largest Contentful Paint: ${analysisData.performanceData.lcp || 'N/A'}`,
        `Time to Interactive: ${analysisData.performanceData.tti || 'N/A'}`,
        `Cumulative Layout Shift: ${analysisData.performanceData.cls || 'N/A'}`
      ];

      doc.setFontSize(12);
      perfDetails.forEach(detail => {
        yPosition += addWrappedText(doc, detail, 20, yPosition, 170);
        yPosition += 5;
      });
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = 20;
    }

    // Mobile Optimization
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Mobile Optimierung', 20, yPosition);
    yPosition += 15;

    if (analysisData.mobileData) {
      const mobileScore = analysisData.mobileData.score || 0;
      const mobileColor = getScoreColor(mobileScore);
      drawBox(doc, 20, yPosition - 5, 40, 12, mobileColor);
      doc.setTextColor('#ffffff');
      doc.setFontSize(12);
      doc.text(`Score: ${mobileScore.toString()}`, 22, yPosition + 2);
      doc.setTextColor('#000000');
      yPosition += 20;

      const mobileDetails = [
        `Responsive Design: ${analysisData.mobileData.responsive ? 'Ja' : 'Nein'}`,
        `Mobile Performance: ${analysisData.mobileData.mobilePerformance || 'N/A'}`,
        `Touch-freundlich: ${analysisData.mobileData.touchFriendly ? 'Ja' : 'Nein'}`,
        `Mobile Viewport: ${analysisData.mobileData.viewport ? 'Konfiguriert' : 'Nicht konfiguriert'}`
      ];

      doc.setFontSize(12);
      mobileDetails.forEach(detail => {
        yPosition += addWrappedText(doc, detail, 20, yPosition, 170);
        yPosition += 5;
      });
    }

    yPosition += 15;

    // Add new page for competitor analysis
    doc.addPage();
    yPosition = 20;

    // Competitor Analysis Section
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Konkurrenzanalyse', 20, yPosition);
    yPosition += 15;

    if (analysisData.competitorData) {
      const compScore = analysisData.competitorData.score || 0;
      const compColor = getScoreColor(compScore);
      drawBox(doc, 20, yPosition - 5, 40, 12, compColor);
      doc.setTextColor('#ffffff');
      doc.setFontSize(12);
      doc.text(`Score: ${compScore.toString()}`, 22, yPosition + 2);
      doc.setTextColor('#000000');
      yPosition += 20;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Identifizierte Konkurrenten:', 20, yPosition);
      yPosition += 10;

      const competitors = analysisData.competitorData.competitors || [];
      competitors.forEach((competitor: any, index: number) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${competitor.name || 'Unbekannter Konkurrent'}`, 20, yPosition);
        yPosition += 8;

        doc.setFont('helvetica', 'normal');
        const competitorDetails = [
          `Domain: ${competitor.domain || 'N/A'}`,
          `Geschätzter Traffic: ${competitor.traffic || 'N/A'}`,
          `SEO Score: ${competitor.seoScore || 'N/A'}`,
          `Top Keywords: ${competitor.keywords ? competitor.keywords.slice(0, 3).join(', ') : 'N/A'}`,
          `Stärken: ${competitor.strengths || 'Nicht analysiert'}`,
          `Schwächen: ${competitor.weaknesses || 'Nicht analysiert'}`
        ];

        competitorDetails.forEach(detail => {
          yPosition += addWrappedText(doc, detail, 25, yPosition, 165);
          yPosition += 3;
        });
        yPosition += 10;
      });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Konkurrenzanalyse nicht verfügbar oder noch nicht durchgeführt.', 20, yPosition);
      yPosition += 15;

      doc.text('Empfehlung:', 20, yPosition);
      yPosition += 8;
      const compRecommendation = `Führen Sie eine detaillierte Konkurrenzanalyse durch, um Ihre Position 
      im Markt zu verstehen und Verbesserungsmöglichkeiten zu identifizieren. Analysieren Sie mindestens 
      3-5 direkte Konkurrenten in Bezug auf SEO, Content-Strategie und User Experience.`;
      yPosition += addWrappedText(doc, compRecommendation, 20, yPosition, 170);
    }

    // Add new page for action plan
    doc.addPage();
    yPosition = 20;

    // Action Plan / Maßnahmenkatalog
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Maßnahmenkatalog', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Sofortige Maßnahmen (Priorität: Hoch)', 20, yPosition);
    yPosition += 10;

    const immediateActions = [
      'Meta-Descriptions für alle wichtigen Seiten optimieren',
      'Alt-Tags für alle Bilder hinzufügen',
      'Ladezeiten durch Bildoptimierung verbessern',
      'Mobile Responsive Design überprüfen und optimieren',
      'SSL-Zertifikat implementieren (falls nicht vorhanden)',
      'Google Analytics und Search Console einrichten'
    ];

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    immediateActions.forEach((action, index) => {
      drawBox(doc, 20, yPosition - 2, 5, 5, '#ef4444');
      doc.setTextColor('#ffffff');
      doc.setFontSize(8);
      doc.text('!', 21.5, yPosition + 1);
      doc.setTextColor('#000000');
      doc.setFontSize(11);
      yPosition += addWrappedText(doc, `${index + 1}. ${action}`, 30, yPosition, 160);
      yPosition += 8;
    });

    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Mittelfristige Maßnahmen (Priorität: Mittel)', 20, yPosition);
    yPosition += 10;

    const mediumTermActions = [
      'Content-Strategie entwickeln und umsetzen',
      'Linkbuilding-Kampagne starten',
      'Local SEO optimieren (falls relevant)',
      'Social Media Integration verbessern',
      'Conversion-Optimierung durchführen',
      'Konkurrenzanalyse vertiefen',
      'Schema Markup implementieren'
    ];

    mediumTermActions.forEach((action, index) => {
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = 20;
      }
      
      drawBox(doc, 20, yPosition - 2, 5, 5, '#eab308');
      doc.setTextColor('#ffffff');
      doc.setFontSize(8);
      doc.text('!', 21.5, yPosition + 1);
      doc.setTextColor('#000000');
      doc.setFontSize(11);
      yPosition += addWrappedText(doc, `${index + 1}. ${action}`, 30, yPosition, 160);
      yPosition += 8;
    });

    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Langfristige Maßnahmen (Priorität: Niedrig)', 20, yPosition);
    yPosition += 10;

    const longTermActions = [
      'Erweiterte Tracking-Implementierung',
      'A/B Testing für wichtige Conversion-Elemente',
      'Progressive Web App (PWA) Funktionen',
      'Mehrsprachige Website-Version',
      'Erweiterte Personalisierung',
      'Voice Search Optimierung',
      'AI-basierte Chat-Funktionen'
    ];

    longTermActions.forEach((action, index) => {
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = 20;
      }
      
      drawBox(doc, 20, yPosition - 2, 5, 5, '#22c55e');
      doc.setTextColor('#ffffff');
      doc.setFontSize(8);
      doc.text('→', 21, yPosition + 1);
      doc.setTextColor('#000000');
      doc.setFontSize(11);
      yPosition += addWrappedText(doc, `${index + 1}. ${action}`, 30, yPosition, 160);
      yPosition += 8;
    });

    // Add new page for detailed recommendations
    doc.addPage();
    yPosition = 20;

    // Detailed Recommendations
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Detaillierte Empfehlungen', 20, yPosition);
    yPosition += 15;

    // SEO Recommendations
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SEO Optimierung:', 20, yPosition);
    yPosition += 10;

    const seoRecommendations = [
      {
        title: 'Title Tags optimieren',
        description: 'Jede Seite sollte einen einzigartigen, beschreibenden Title Tag haben (50-60 Zeichen).'
      },
      {
        title: 'Meta Descriptions verbessern',
        description: 'Überzeugende Meta Descriptions schreiben (150-160 Zeichen) mit Call-to-Action.'
      },
      {
        title: 'Header-Struktur optimieren',
        description: 'Logische H1-H6 Struktur verwenden, nur eine H1 pro Seite.'
      },
      {
        title: 'Interne Verlinkung stärken',
        description: 'Strategische interne Links setzen, um Link Juice zu verteilen.'
      }
    ];

    doc.setFontSize(11);
    seoRecommendations.forEach(rec => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${rec.title}:`, 25, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      yPosition += addWrappedText(doc, rec.description, 30, yPosition, 160);
      yPosition += 10;
    });

    // Performance Recommendations
    yPosition += 5;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Optimierung:', 20, yPosition);
    yPosition += 10;

    const performanceRecommendations = [
      {
        title: 'Bilder optimieren',
        description: 'WebP Format verwenden, Bilder komprimieren, Lazy Loading implementieren.'
      },
      {
        title: 'CSS und JavaScript minimieren',
        description: 'Dateien minifizieren, unnötige Code entfernen, Critical CSS inline laden.'
      },
      {
        title: 'Caching implementieren',
        description: 'Browser-Caching und Server-Side Caching für bessere Ladezeiten.'
      },
      {
        title: 'CDN einsetzen',
        description: 'Content Delivery Network für globale Performance-Verbesserung.'
      }
    ];

    doc.setFontSize(11);
    performanceRecommendations.forEach(rec => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`• ${rec.title}:`, 25, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      yPosition += addWrappedText(doc, rec.description, 30, yPosition, 160);
      yPosition += 10;
    });

    // Add final page with timeline and budget estimates
    doc.addPage();
    yPosition = 20;

    // Implementation Timeline
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Umsetzungsplan & Budget', 20, yPosition);
    yPosition += 15;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Zeitplan (Empfehlung):', 20, yPosition);
    yPosition += 10;

    const timeline = [
      { phase: 'Woche 1-2', tasks: 'Technische SEO Grundlagen, Meta-Tags, Alt-Tags' },
      { phase: 'Woche 3-4', tasks: 'Performance-Optimierung, Mobile Optimierung' },
      { phase: 'Monat 2', tasks: 'Content-Erstellung, Linkbuilding Start' },
      { phase: 'Monat 3-6', tasks: 'Kontinuierliche Optimierung, Monitoring, Anpassungen' }
    ];

    doc.setFontSize(11);
    timeline.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.phase}:`, 25, yPosition);
      yPosition += 6;
      
      doc.setFont('helvetica', 'normal');
      yPosition += addWrappedText(doc, item.tasks, 30, yPosition, 160);
      yPosition += 10;
    });

    yPosition += 10;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Geschätzte Kosten:', 20, yPosition);
    yPosition += 10;

    const budgetItems = [
      { item: 'SEO-Tools & Software', cost: '50-200€/Monat' },
      { item: 'Content-Erstellung', cost: '500-2000€/Monat' },
      { item: 'Technische Optimierung', cost: '1000-5000€ einmalig' },
      { item: 'Linkbuilding', cost: '300-1500€/Monat' },
      { item: 'Monitoring & Reporting', cost: '200-800€/Monat' }
    ];

    doc.setFontSize(11);
    budgetItems.forEach(item => {
      doc.setFont('helvetica', 'normal');
      doc.text(`• ${item.item}:`, 25, yPosition);
      doc.setFont('helvetica', 'bold');
      doc.text(item.cost, 140, yPosition);
      yPosition += 8;
    });

    yPosition += 15;

    // Final note
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    const finalNote = `Hinweis: Dieser Bericht basiert auf einer automatisierten Analyse. 
    Für eine detaillierte, manuelle Überprüfung und individuelle Strategieentwicklung 
    empfehlen wir eine Beratung durch SEO-Experten.`;
    
    yPosition += addWrappedText(doc, finalNote, 20, yPosition, 170);

    // Save the PDF
    doc.save(`website-analyse-${analysisData.domain || 'report'}-${new Date().getTime()}.pdf`);
  };

  return (
    <Button onClick={handleExport} className="w-full">
      <Download className="mr-2 h-4 w-4" />
      PDF Report herunterladen
    </Button>
  );
};
