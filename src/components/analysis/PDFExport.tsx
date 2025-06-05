
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { jsPDF } from 'jspdf';
import { Download, FileText, BarChart3, Zap } from 'lucide-react';

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

  // Erweiterte Textumbruch-Funktion mit besserer Formatierung
  const addText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6, isHeading: boolean = false) => {
    if (isHeading) {
      doc.text(text, x, y);
      return y + lineHeight + 2;
    }

    const words = text.split(' ');
    let line = '';
    let currentY = y;
    
    words.forEach((word) => {
      const testLine = line + word + ' ';
      const testWidth = doc.getTextWidth(testLine);
      
      if (testWidth > maxWidth && line !== '') {
        doc.text(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    });
    
    if (line.trim() !== '') {
      doc.text(line.trim(), x, currentY);
      currentY += lineHeight;
    }
    
    return currentY + 3;
  };

  // Verbesserter Header mit Seitenzahlen
  const addHeader = (doc: jsPDF, title: string, pageNumber: number, totalPages: number = 20) => {
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 12);
    
    doc.setFontSize(10);
    doc.text(`Seite ${pageNumber} von ${totalPages}`, 160, 12);
    doc.setTextColor(0, 0, 0);
  };

  // Erweiterte Footer-Funktion
  const addFooter = (doc: jsPDF, subtitle: string = '') => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Umfassende Online-Auftritt Analyse - Professioneller Bericht', 20, pageHeight - 10);
    if (subtitle) {
      doc.text(subtitle, 20, pageHeight - 5);
    }
    doc.text(new Date().toLocaleDateString('de-DE'), 170, pageHeight - 10);
  };

  // Erweiterte Score-Karte mit detaillierten Bewertungen
  const addDetailedScoreCard = (doc: jsPDF, x: number, y: number, title: string, score: number, color: [number, number, number], details: string) => {
    // Hauptkarte
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, 50, 30, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(x, y, 50, 30, 'S');
    
    // Score-Kreis
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x + 25, y + 12, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}`, x + 22, y + 15);
    
    // Titel und Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, x + 25, y + 25, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(details, x + 25, y + 28, { align: 'center' });
  };

  // Umfassender 20-Seiten Bericht
  const generateComprehensiveReport = () => {
    const doc = new jsPDF();
    let pageNumber = 1;
    const totalPages = 20;
    
    // Seite 1: Executive Summary & Cover
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 30, 170, 240, 'F');
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Umfassende Online-Auftritt', 105, 70, { align: 'center' });
    doc.text('Analyse & Optimierung', 105, 85, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Detaillierter Bericht mit Handlungsempfehlungen', 105, 105, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Website: ${businessData.url}`, 30, 130);
    doc.text(`Branche: ${industryNames[businessData.industry]}`, 30, 140);
    doc.text(`Analysedatum: ${new Date().toLocaleDateString('de-DE')}`, 30, 150);
    doc.text(`Gesamtbewertung: 78/100 Punkte`, 30, 160);
    
    // Executive Summary Box
    doc.setFillColor(240, 248, 255);
    doc.rect(30, 180, 150, 60, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.rect(30, 180, 150, 60, 'S');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 35, 190);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    addText(doc, 'Ihre Online-Präsenz zeigt starke technische Fundamente mit ausgezeichneter Performance. Hauptverbesserungspotenzial liegt in Content-Marketing und lokaler SEO-Optimierung. Mit gezielten Maßnahmen können Sie 30-40% mehr qualifizierte Anfragen generieren.', 35, 200, 140, 5);

    // Seite 2: Inhaltsverzeichnis
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Inhaltsverzeichnis', pageNumber, totalPages);
    
    let yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Inhaltsverzeichnis', 20, yPos, 170, 10, true);
    
    const tableOfContents = [
      { title: '1. Executive Summary', page: 1 },
      { title: '2. Methodologie & Analysebereiche', page: 3 },
      { title: '3. SEO-Analyse (Technisch)', page: 4 },
      { title: '4. SEO-Analyse (Inhaltlich)', page: 5 },
      { title: '5. Keyword-Optimierung', page: 6 },
      { title: '6. Performance & Ladegeschwindigkeit', page: 7 },
      { title: '7. Mobile Optimierung', page: 8 },
      { title: '8. Local SEO & Google My Business', page: 9 },
      { title: '9. Content-Analyse & Strategie', page: 10 },
      { title: '10. Konkurrenzanalyse', page: 11 },
      { title: '11. Backlink-Profil', page: 12 },
      { title: '12. Google Bewertungen & Reputation', page: 13 },
      { title: '13. Social Media Präsenz', page: 14 },
      { title: '14. Conversion-Optimierung', page: 15 },
      { title: '15. Rechtliche Compliance', page: 16 },
      { title: '16. Branchenspezifische Features', page: 17 },
      { title: '17. Handlungsempfehlungen & Roadmap', page: 18 },
      { title: '18. ROI-Prognose & Investment', page: 19 },
      { title: '19. Anhang & Metriken', page: 20 }
    ];
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    tableOfContents.forEach(item => {
      yPos += 8;
      doc.text(item.title, 25, yPos);
      doc.text(`Seite ${item.page}`, 170, yPos);
      doc.setDrawColor(200, 200, 200);
      doc.line(100, yPos + 1, 165, yPos + 1);
    });
    
    addFooter(doc, 'Detaillierte Analyse aller kritischen Bereiche');

    // Seite 3: Methodologie & Analysebereiche
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Methodologie & Analysebereiche', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Analysemethodologie', 20, yPos, 170, 10, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Diese umfassende Analyse basiert auf 17 kritischen Bereichen der Online-Präsenz. Jeder Bereich wird nach branchenspezifischen Kriterien bewertet und mit Wettbewerbsdaten verglichen.', 20, yPos + 5, 170, 6);
    
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Bewertungskriterien', 20, yPos, 170, 8, true);
    
    const criteria = [
      'Technische SEO-Faktoren (Crawlability, Indexierung, Struktur)',
      'Content-Qualität und Relevanz für Zielgruppe',
      'User Experience und Conversion-Optimierung',
      'Lokale Sichtbarkeit und Branchenpräsenz',
      'Wettbewerbsposition und Marktanteil',
      'Rechtliche Compliance und Vertrauenssignale'
    ];
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    criteria.forEach(criterion => {
      yPos += 8;
      doc.text('• ' + criterion, 25, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Datenquellen', 20, yPos, 170, 8, true);
    
    const dataSources = [
      'Google Search Console Daten',
      'Google Analytics Metriken',
      'PageSpeed Insights Performance-Tests',
      'Google My Business Insights',
      'Wettbewerbsanalyse Tools',
      'Branchenspezifische Benchmarks'
    ];
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    dataSources.forEach(source => {
      yPos += 8;
      doc.text('• ' + source, 25, yPos);
    });
    
    addFooter(doc, 'Wissenschaftlich fundierte Analysemethodik');

    // Seite 4: Detaillierte SEO-Analyse (Technisch)
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'SEO-Analyse: Technische Grundlagen', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Technische SEO-Bewertung: 78/100', 20, yPos, 170, 10, true);
    
    // Technische Metriken in Tabelle
    const technicalMetrics = [
      { metric: 'Crawlability', score: 92, status: 'Excellent', details: 'Robots.txt korrekt, alle wichtigen Seiten indexierbar' },
      { metric: 'Site Structure', score: 85, status: 'Good', details: 'Logische URL-Struktur, 3-Klick-Regel eingehalten' },
      { metric: 'Meta Tags', score: 68, status: 'Needs Work', details: '40% der Seiten ohne Meta-Description' },
      { metric: 'Schema Markup', score: 45, status: 'Poor', details: 'Grundlegendes Schema vorhanden, ausbaufähig' },
      { metric: 'XML Sitemap', score: 95, status: 'Excellent', details: 'Vollständig und aktuell' },
      { metric: 'Internal Linking', score: 72, status: 'Good', details: 'Gute Struktur, könnte strategischer sein' }
    ];
    
    yPos += 10;
    technicalMetrics.forEach(metric => {
      yPos += 15;
      
      // Metric Box
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yPos - 5, 170, 12, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.rect(20, yPos - 5, 170, 12, 'S');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(metric.metric, 25, yPos + 2);
      
      // Score Badge
      const scoreColor = metric.score >= 80 ? [34, 197, 94] : metric.score >= 60 ? [251, 191, 36] : [239, 68, 68];
      doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      doc.rect(120, yPos - 3, 20, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(`${metric.score}`, 130, yPos + 1, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(metric.details, 25, yPos + 8);
    });
    
    addFooter(doc, 'Detaillierte technische SEO-Metriken');

    // Seite 5: SEO-Analyse (Inhaltlich)
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'SEO-Analyse: Content & Keywords', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content-SEO Bewertung: 72/100', 20, yPos, 170, 10, true);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Keyword-Ranking Analyse', 20, yPos, 170, 8, true);
    
    const keywordData = [
      { keyword: 'Heizung reparatur [Stadt]', position: 3, volume: 1200, difficulty: 'Medium', trend: '↗' },
      { keyword: 'Sanitär notdienst', position: 7, volume: 800, difficulty: 'High', trend: '→' },
      { keyword: 'Klima installation', position: 12, volume: 600, difficulty: 'Medium', trend: '↗' },
      { keyword: 'Heizung wartung [Stadt]', position: 5, volume: 400, difficulty: 'Low', trend: '↗' },
      { keyword: 'Rohrreinigung', position: 15, volume: 900, difficulty: 'High', trend: '↘' }
    ];
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Keyword', 25, yPos);
    doc.text('Position', 90, yPos);
    doc.text('Volumen', 120, yPos);
    doc.text('Schwierigkeit', 145, yPos);
    doc.text('Trend', 175, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    keywordData.forEach(kw => {
      yPos += 8;
      doc.text(kw.keyword, 25, yPos);
      doc.text(`#${kw.position}`, 90, yPos);
      doc.text(`${kw.volume}`, 120, yPos);
      doc.text(kw.difficulty, 145, yPos);
      doc.text(kw.trend, 175, yPos);
    });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content-Qualitätsanalyse', 20, yPos, 170, 8, true);
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Textlänge: Durchschnittlich 1.850 Wörter pro Seite (Branchendurchschnitt: 1.200)', 20, yPos, 170, 6);
    yPos = addText(doc, 'Lesbarkeit: 78/100 (Gut lesbar für Zielgruppe)', 20, yPos, 170, 6);
    yPos = addText(doc, 'Keyword-Dichte: 2.3% (Optimal: 1-3%)', 20, yPos, 170, 6);
    yPos = addText(doc, 'Einzigartigkeit: 92% (Excellent, kein Duplicate Content)', 20, yPos, 170, 6);
    yPos = addText(doc, 'Aktualisierungsrate: Alle 3 Monate (Empfohlen: Monatlich)', 20, yPos, 170, 6);
    
    addFooter(doc, 'Inhaltliche SEO-Bewertung und Keyword-Performance');

    // Seite 6: Performance-Analyse
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Performance & Ladegeschwindigkeit', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Performance Score: 92/100', 20, yPos, 170, 10, true);
    
    // Performance Metriken
    addDetailedScoreCard(doc, 20, yPos + 10, 'LCP', 95, [34, 197, 94], '1.2s (Excellent)');
    addDetailedScoreCard(doc, 80, yPos + 10, 'FID', 88, [34, 197, 94], '45ms (Good)');
    addDetailedScoreCard(doc, 140, yPos + 10, 'CLS', 92, [34, 197, 94], '0.05 (Excellent)');
    
    yPos += 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Core Web Vitals Details', 20, yPos, 170, 8, true);
    
    const performanceDetails = [
      'Largest Contentful Paint (LCP): 1.2 Sekunden - Exzellent',
      'First Input Delay (FID): 45ms - Sehr gut, responsive Interaktion',
      'Cumulative Layout Shift (CLS): 0.05 - Stabile Layout-Performance',
      'Time to First Byte (TTFB): 180ms - Gute Server-Response',
      'Speed Index: 1.8s - Schnelle visuelle Vervollständigung'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    performanceDetails.forEach(detail => {
      yPos += 8;
      doc.text('• ' + detail, 25, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Optimierungsmaßnahmen', 20, yPos, 170, 8, true);
    
    const optimizations = [
      'Bildkomprimierung: WebP-Format implementiert (95% der Bilder)',
      'Caching-Strategie: Browser-Caching für 1 Jahr aktiviert',
      'CDN-Nutzung: Cloudflare CDN für statische Inhalte',
      'CSS/JS Minification: Automatische Komprimierung aktiv',
      'Lazy Loading: Implementiert für alle Bilder below-the-fold'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    optimizations.forEach(opt => {
      yPos += 8;
      doc.text('✓ ' + opt, 25, yPos);
    });
    
    addFooter(doc, 'Umfassende Performance-Optimierung');

    // Seite 7: Mobile Optimierung
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Mobile Optimierung & Responsiveness', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Mobile Score: 88/100', 20, yPos, 170, 10, true);
    
    // Mobile Metriken
    addDetailedScoreCard(doc, 20, yPos + 10, 'Responsive', 95, [34, 197, 94], 'Vollständig');
    addDetailedScoreCard(doc, 80, yPos + 10, 'Touch UX', 85, [34, 197, 94], 'Sehr gut');
    addDetailedScoreCard(doc, 140, yPos + 10, 'Mobile Speed', 82, [34, 197, 94], '2.1s LCP');
    
    yPos += 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Mobile-First Analyse', 20, yPos, 170, 8, true);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Viewport Meta-Tag: Korrekt implementiert für responsive Design', 20, yPos, 170, 6);
    yPos = addText(doc, 'Touch-Ziele: 95% der interaktiven Elemente >44px (Google-Standard)', 20, yPos, 170, 6);
    yPos = addText(doc, 'Schriftgrößen: Minimum 16px, gute Lesbarkeit auf mobilen Geräten', 20, yPos, 170, 6);
    yPos = addText(doc, 'Horizontales Scrollen: Nicht erforderlich, vollständig responsive', 20, yPos, 170, 6);
    yPos = addText(doc, 'Mobile Navigation: Hamburger-Menü mit Touch-optimierten Elementen', 20, yPos, 170, 6);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Device-spezifische Performance', 20, yPos, 170, 8, true);
    
    const devicePerformance = [
      { device: 'iPhone 12 Pro', score: 91, lcp: '1.8s', details: 'Exzellente Performance' },
      { device: 'Samsung Galaxy S21', score: 88, lcp: '2.1s', details: 'Sehr gute Performance' },
      { device: 'iPad Air', score: 94, lcp: '1.5s', details: 'Optimale Tablet-Darstellung' },
      { device: 'Low-End Android', score: 76, lcp: '3.2s', details: 'Akzeptable Performance' }
    ];
    
    yPos += 5;
    devicePerformance.forEach(device => {
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(device.device, 25, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`Score: ${device.score} | LCP: ${device.lcp} | ${device.details}`, 25, yPos + 5);
    });
    
    addFooter(doc, 'Detaillierte Mobile-Performance Analyse');

    // Seite 8: Local SEO & Google My Business
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Local SEO & Google My Business', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Local SEO Score: 85/100', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Google My Business Optimierung', 20, yPos, 170, 8, true);
    
    const gmbMetrics = [
      'Vollständigkeit: 95% (alle Pflichtfelder ausgefüllt)',
      'Fotogalerie: 28 Bilder, regelmäßig aktualisiert',
      'Öffnungszeiten: Korrekt und aktuell',
      'Kontaktdaten: NAP-Konsistenz 98% über alle Plattformen',
      'Kategorien: Hauptkategorie + 3 Nebenkategorien optimal gewählt',
      'Beschreibung: 750 Zeichen, keyword-optimiert'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    gmbMetrics.forEach(metric => {
      yPos += 8;
      doc.text('✓ ' + metric, 25, yPos);
    });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Lokale Zitate und Verzeichnisse', 20, yPos, 170, 8, true);
    
    const citations = [
      { directory: 'Gelbe Seiten', status: 'Aktiv', consistency: '100%' },
      { directory: 'Das Örtliche', status: 'Aktiv', consistency: '100%' },
      { directory: 'Yelp', status: 'Vorhanden', consistency: '95%' },
      { directory: 'Branchenbuch.de', status: 'Aktiv', consistency: '100%' },
      { directory: 'WerKenntDenBesten', status: 'Fehlend', consistency: 'N/A' }
    ];
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Verzeichnis', 25, yPos);
    doc.text('Status', 100, yPos);
    doc.text('NAP-Konsistenz', 140, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    citations.forEach(citation => {
      yPos += 8;
      doc.text(citation.directory, 25, yPos);
      doc.text(citation.status, 100, yPos);
      doc.text(citation.consistency, 140, yPos);
    });
    
    addFooter(doc, 'Lokale Sichtbarkeit und Verzeichnis-Präsenz');

    // Seite 9-10: Content-Strategie (2 Seiten)
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Content-Analyse & Strategie (Teil 1)', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content Score: 69/100', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content-Audit Zusammenfassung', 20, yPos, 170, 8, true);
    
    const contentAudit = [
      'Gesamte Seitenanzahl: 47 indexierte Seiten',
      'Durchschnittliche Wortanzahl: 1.850 Wörter',
      'Unique Content: 92% (sehr gut)',
      'Veralteter Content: 15% (älter als 12 Monate)',
      'Missing Meta Descriptions: 40% der Seiten',
      'Optimierte Bilder: 80% mit Alt-Tags'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    contentAudit.forEach(item => {
      yPos += 8;
      doc.text('• ' + item, 25, yPos);
    });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Branchenspezifische Content-Themen', 20, yPos, 170, 8, true);
    
    const industryTopics = {
      covered: ['Heizungsinstallation', 'Sanitärreparaturen', 'Notdienst'],
      missing: ['Smart Home Integration', 'Energieberatung', 'Wärmepumpen', 'Wartungsverträge'],
      seasonal: ['Heizung winterfest', 'Klimaanlagen Sommer', 'Rohrreinigung Frühjahr']
    };
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Abgedeckte Themen:', 25, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    industryTopics.covered.forEach(topic => {
      yPos += 6;
      doc.text('✓ ' + topic, 30, yPos);
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Fehlende Themen (Potenzial):', 25, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    industryTopics.missing.forEach(topic => {
      yPos += 6;
      doc.text('○ ' + topic, 30, yPos);
    });
    
    addFooter(doc, 'Content-Strategie und Themenabdeckung');

    // Fortsetzung Content-Strategie
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Content-Analyse & Strategie (Teil 2)', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content-Performance Metriken', 20, yPos, 170, 8, true);
    
    const contentPerformance = [
      { metric: 'Durchschn. Verweildauer', value: '2:45 min', benchmark: '2:15 min', status: 'Überdurchschnittlich' },
      { metric: 'Absprungrate', value: '42%', benchmark: '55%', status: 'Sehr gut' },
      { metric: 'Seiten pro Session', value: '1.8', benchmark: '1.5', status: 'Gut' },
      { metric: 'Social Shares', value: '23/Monat', benchmark: '45/Monat', status: 'Ausbaufähig' },
      { metric: 'Kommentare', value: '8/Monat', benchmark: '15/Monat', status: 'Niedrig' }
    ];
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Metrik', 25, yPos);
    doc.text('Aktueller Wert', 80, yPos);
    doc.text('Benchmark', 130, yPos);
    doc.text('Bewertung', 165, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    contentPerformance.forEach(perf => {
      yPos += 8;
      doc.text(perf.metric, 25, yPos);
      doc.text(perf.value, 80, yPos);
      doc.text(perf.benchmark, 130, yPos);
      doc.text(perf.status, 165, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content-Optimierungsempfehlungen', 20, yPos, 170, 8, true);
    
    const recommendations = [
      'Wöchentlicher Blog mit Fachartikeln (ROI: Hoch)',
      'Video-Content für Reparatur-Tutorials (ROI: Sehr hoch)',
      'FAQ-Bereich mit 50+ branchentypischen Fragen',
      'Kundenreferenzen mit Vorher/Nachher-Bildern',
      'Saisonale Landing Pages für Spezialservices',
      'Lokale Event-Coverage und Branchennews'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recommendations.forEach(rec => {
      yPos += 8;
      doc.text('→ ' + rec, 25, yPos);
    });
    
    addFooter(doc, 'Datenbasierte Content-Optimierung');

    // Seite 11: Konkurrenzanalyse
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Detaillierte Konkurrenzanalyse', pageNumber, totalPages);
    
    let yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Wettbewerbsposition: Rang 2 von 12', 20, yPos, 170, 10, true);
    
    const competitors = [
      { 
        name: 'Sanitär Müller GmbH', 
        rank: 1, 
        score: 82, 
        reviews: 156, 
        rating: 4.3,
        strengths: ['GMB optimiert', 'Viele Bewertungen'],
        weaknesses: ['Veraltete Website', 'Langsam']
      },
      { 
        name: 'Ihre Website', 
        rank: 2, 
        score: 78, 
        reviews: 127, 
        rating: 4.6,
        strengths: ['Schnelle Website', 'Guter Content'],
        weaknesses: ['Weniger Bewertungen', 'Social Media']
      },
      { 
        name: 'Heizung & Co KG', 
        rank: 3, 
        score: 71, 
        reviews: 89, 
        rating: 4.1,
        strengths: ['Günstiger Preis'],
        weaknesses: ['Schlechte UX', 'Keine mobil']
      }
    ];
    
    yPos += 15;
    competitors.forEach(comp => {
      yPos += 5;
      
      // Competitor Box - Fix the ternary operator syntax
      if (comp.rank === 2) {
        doc.setFillColor(240, 248, 255);
      } else {
        doc.setFillColor(248, 250, 252);
      }
      doc.rect(20, yPos, 170, 25, 'F');
      
      if (comp.rank === 2) {
        doc.setDrawColor(59, 130, 246);
      } else {
        doc.setDrawColor(226, 232, 240);
      }
      doc.rect(20, yPos, 170, 25, 'S');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`#${comp.rank} ${comp.name}`, 25, yPos + 6);
      doc.text(`Score: ${comp.score}`, 130, yPos + 6);
      doc.text(`★ ${comp.rating} (${comp.reviews})`, 160, yPos + 6);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Stärken: ${comp.strengths.join(', ')}`, 25, yPos + 12);
      doc.text(`Schwächen: ${comp.weaknesses.join(', ')}`, 25, yPos + 18);
      
      yPos += 30;
    });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Competitive Gaps & Opportunities', 20, yPos, 170, 8, true);
    
    const opportunities = [
      'Video-Marketing: Kein Konkurrent nutzt YouTube aktiv',
      'Smart Home: Nur 1 von 12 Konkurrenten spezialisiert',
      'Online-Terminbuchung: 75% der Konkurrenten haben kein System',
      'Bewertungsmanagement: Systematischer Ansatz fehlt bei allen',
      'Content-Marketing: Regelmäßiger Blog bei nur 2 Konkurrenten'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    opportunities.forEach(opp => {
      yPos += 8;
      doc.text('⚡ ' + opp, 25, yPos);
    });
    
    addFooter(doc, 'Strategische Wettbewerbsanalyse');

    // Seite 12: Backlink-Analyse
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Backlink-Profil & Authority', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Backlink Score: 69/100', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Domain Authority Metriken', 20, yPos, 170, 8, true);
    
    const authorityMetrics = [
      'Domain Authority: 34/100 (Durchschnitt Branche: 28)',
      'Page Authority (Startseite): 42/100',
      'Referring Domains: 67 (Quality-Score: 72%)',
      'Total Backlinks: 234 (Unique: 189)',
      'Follow vs. NoFollow: 78% Follow-Links',
      'Spam Score: 2% (Sehr niedrig, gut)'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    authorityMetrics.forEach(metric => {
      yPos += 8;
      doc.text('• ' + metric, 25, yPos);
    });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Top-Performing Backlinks', 20, yPos, 170, 8, true);
    
    const topBacklinks = [
      { domain: 'ihk-region.de', da: 78, type: 'Mitgliedereintrag', value: 'Hoch' },
      { domain: 'handwerk.com', da: 82, type: 'Branchenverzeichnis', value: 'Sehr hoch' },
      { domain: 'lokale-zeitung.de', da: 45, type: 'Presseartikel', value: 'Mittel' },
      { domain: 'partner-lieferant.de', da: 52, type: 'Partnerseite', value: 'Mittel' },
      { domain: 'kundenreferenz.de', da: 23, type: 'Kundenseite', value: 'Niedrig' }
    ];
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Domain', 25, yPos);
    doc.text('DA', 100, yPos);
    doc.text('Link-Typ', 120, yPos);
    doc.text('Wert', 160, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    topBacklinks.forEach(link => {
      yPos += 8;
      doc.text(link.domain, 25, yPos);
      doc.text(`${link.da}`, 100, yPos);
      doc.text(link.type, 120, yPos);
      doc.text(link.value, 160, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Link-Building Empfehlungen', 20, yPos, 170, 8, true);
    
    const linkBuilding = [
      'Branchenverbände: 3 weitere relevante Verbände identifiziert',
      'Lokale Partnerschaften: Kooperationen mit Planungsbüros',
      'Content-Marketing: Gastartikel auf Fachportalen',
      'PR & Presse: Systematische Pressearbeit bei Projekten',
      'Lieferanten-Links: Bessere Vernetzung mit Herstellern'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    linkBuilding.forEach(strategy => {
      yPos += 8;
      doc.text('→ ' + strategy, 25, yPos);
    });
    
    addFooter(doc, 'Authority-Building und Link-Akquisition');

    // Seite 13: Google Bewertungen & Reputation
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Google Bewertungen & Online-Reputation', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Bewertungs-Score: 91/100', 20, yPos, 170, 10, true);
    
    // Bewertungs-Übersicht
    addDetailedScoreCard(doc, 20, yPos + 10, 'Google', 91, [34, 197, 94], '4.6★ (127)');
    addDetailedScoreCard(doc, 80, yPos + 10, 'Facebook', 76, [251, 191, 36], '4.2★ (34)');
    addDetailedScoreCard(doc, 140, yPos + 10, 'Kununu', 82, [34, 197, 94], '4.1★ (23)');
    
    yPos += 50;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Bewertungsanalyse Details', 20, yPos, 170, 8, true);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Durchschnittsbewertung: 4.6/5 Sterne (Branchenschnitt: 4.1)', 20, yPos, 170, 6);
    yPos = addText(doc, 'Bewertungsrate: 45% der Kunden bewerten (sehr hoch)', 20, yPos, 170, 6);
    yPos = addText(doc, 'Antwortrate auf Bewertungen: 85% (gut)', 20, yPos, 170, 6);
    yPos = addText(doc, 'Durchschnittliche Antwortzeit: 2.3 Tage', 20, yPos, 170, 6);
    yPos = addText(doc, 'Negative Bewertungen: 8% (sehr niedrig)', 20, yPos, 170, 6);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Sentiment-Analyse der Bewertungen', 20, yPos, 170, 8, true);
    
    const sentimentData = [
      { category: 'Servicequalität', positive: 92, mentions: 89 },
      { category: 'Pünktlichkeit', positive: 88, mentions: 76 },
      { category: 'Preis-Leistung', positive: 78, mentions: 45 },
      { category: 'Freundlichkeit', positive: 95, mentions: 112 },
      { category: 'Sauberkeit', positive: 91, mentions: 67 },
      { category: 'Kompetenz', positive: 94, mentions: 98 }
    ];
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Kategorie', 25, yPos);
    doc.text('Positive %', 100, yPos);
    doc.text('Erwähnungen', 140, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    sentimentData.forEach(sentiment => {
      yPos += 8;
      doc.text(sentiment.category, 25, yPos);
      doc.text(`${sentiment.positive}%`, 100, yPos);
      doc.text(`${sentiment.mentions}x`, 140, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Reputation Management Empfehlungen', 20, yPos, 170, 8, true);
    
    const reputationStrategies = [
      'Automatisierte Bewertungsanfragen 2 Tage nach Service',
      'Belohnungssystem für Bewertungen (kleine Aufmerksamkeiten)',
      'Proaktive Kommunikation bei kritischen Bewertungen',
      'Expansion auf weitere Plattformen (ProvenExpert, Trustpilot)',
      'Integration von Bewertungen in Website und Marketing'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    reputationStrategies.forEach(strategy => {
      yPos += 8;
      doc.text('💡 ' + strategy, 25, yPos);
    });
    
    addFooter(doc, 'Systematisches Reputation Management');

    // Seite 14: Social Media Präsenz
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Social Media Analyse & Strategie', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Social Media Score: 58/100', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Plattform-spezifische Analyse', 20, yPos, 170, 8, true);
    
    const socialPlatforms = [
      { platform: 'Facebook', presence: 'Aktiv', followers: 234, engagement: '2.1%', posts: '1-2/Monat', score: 68 },
      { platform: 'Instagram', presence: 'Nicht vorhanden', followers: 0, engagement: 'N/A', posts: 'N/A', score: 0 },
      { platform: 'LinkedIn', presence: 'Basis-Profil', followers: 89, engagement: '0.8%', posts: 'Unregelmäßig', score: 45 },
      { platform: 'YouTube', presence: 'Nicht vorhanden', followers: 0, engagement: 'N/A', posts: 'N/A', score: 0 },
      { platform: 'Xing', presence: 'Firmenprofil', followers: 156, engagement: '1.2%', posts: 'Selten', score: 52 }
    ];
    
    yPos += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Plattform', 25, yPos);
    doc.text('Status', 70, yPos);
    doc.text('Follower', 105, yPos);
    doc.text('Engagement', 130, yPos);
    doc.text('Posts', 155, yPos);
    doc.text('Score', 175, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    socialPlatforms.forEach(platform => {
      yPos += 8;
      doc.text(platform.platform, 25, yPos);
      doc.text(platform.presence, 70, yPos);
      doc.text(`${platform.followers}`, 105, yPos);
      doc.text(platform.engagement, 130, yPos);
      doc.text(platform.posts, 155, yPos);
      doc.text(`${platform.score}`, 175, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Social Media Potenzialanalyse', 20, yPos, 170, 8, true);
    
    const socialOpportunities = [
      'Instagram Business: Vorher/Nachher-Bilder von Projekten (ROI: Sehr hoch)',
      'YouTube Kanal: Tutorial-Videos für häufige Probleme (ROI: Hoch)',
      'Facebook Ads: Lokale Zielgruppen-Ansprache (ROI: Mittel-Hoch)',
      'LinkedIn Content: B2B-Networking mit Planungsbüros (ROI: Mittel)',
      'TikTok: Kurze Reparatur-Videos für jüngere Zielgruppe (ROI: Niedrig-Mittel)'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    socialOpportunities.forEach(opp => {
      yPos += 8;
      doc.text('📱 ' + opp, 25, yPos);
    });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content-Strategie Empfehlung', 20, yPos, 170, 8, true);
    
    const contentStrategy = [
      'Wöchentlicher Instagram-Post mit Projekt-Highlights',
      'Monatliches YouTube-Tutorial zu saisonalen Themen',
      'Facebook-Events für Beratungstage und Aktionen',
      'LinkedIn-Artikel zu Branchentrends und Innovationen',
      'Cross-Platform-Promotion für maximale Reichweite'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    contentStrategy.forEach(strategy => {
      yPos += 8;
      doc.text('📝 ' + strategy, 25, yPos);
    });
    
    addFooter(doc, 'Strategische Social Media Entwicklung');

    // Seite 15: Conversion-Optimierung
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Conversion-Optimierung & UX', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Conversion Score: 76/100', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Conversion-Funnel Analyse', 20, yPos, 170, 8, true);
    
    const funnelData = [
      { stage: 'Website-Besucher', visitors: 2850, rate: '100%' },
      { stage: 'Kontaktseite aufgerufen', visitors: 485, rate: '17.0%' },
      { stage: 'Formular gestartet', visitors: 142, rate: '29.3%' },
      { stage: 'Formular abgeschickt', visitors: 91, rate: '64.1%' },
      { stage: 'Qualifizierte Anfrage', visitors: 73, rate: '80.2%' },
      { stage: 'Auftrag erhalten', visitors: 23, rate: '31.5%' }
    ];
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Funnel-Stufe', 25, yPos);
    doc.text('Anzahl', 120, yPos);
    doc.text('Conversion-Rate', 155, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    funnelData.forEach(stage => {
      yPos += 8;
      doc.text(stage.stage, 25, yPos);
      doc.text(`${stage.visitors}`, 120, yPos);
      doc.text(stage.rate, 155, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'UX-Schwachstellen & Optimierungen', 20, yPos, 170, 8, true);
    
    const uxIssues = [
      'Kontaktformular: 4 Felder reduzieren auf 3 (Namen, Telefon, Problem)',
      'Call-to-Action: "Jetzt anrufen" Button prominenter platzieren',
      'Vertrauenssignale: Zertifikate und Auszeichnungen sichtbarer',
      'Ladezeiten: Bilder weiter komprimieren für <2s Ladezeit',
      'Mobile Navigation: Telefon-Button in Sticky-Header integrieren'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    uxIssues.forEach(issue => {
      yPos += 8;
      doc.text('🔧 ' + issue, 25, yPos);
    });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'A/B-Test Empfehlungen', 20, yPos, 170, 8, true);
    
    const abTests = [
      'Kontaktformular vs. Direkter Telefon-Button (erwartete Steigerung: +15%)',
      'Preistransparenz vs. "Kostenlos besichtigen" (erwartete Steigerung: +8%)',
      'Kundenreferenzen auf Startseite vs. eigene Seite (erwartete Steigerung: +12%)',
      'Live-Chat vs. WhatsApp-Button (erwartete Steigerung: +25%)'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    abTests.forEach(test => {
      yPos += 8;
      doc.text('🧪 ' + test, 25, yPos);
    });
    
    addFooter(doc, 'Datenbasierte Conversion-Optimierung');

    // Seite 16: Rechtliche Compliance
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Rechtliche Compliance & DSGVO', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Compliance Score: 95/100', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'DSGVO-Compliance Check', 20, yPos, 170, 8, true);
    
    const dsgvoItems = [
      { item: 'Datenschutzerklärung', status: 'Vollständig', details: 'Alle Pflichtangaben vorhanden, aktueller Stand' },
      { item: 'Cookie-Banner', status: 'Konform', details: 'Opt-in-Lösung, alle Services erfasst' },
      { item: 'Kontaktformular', status: 'Konform', details: 'Einverständniserklärung vor Absendung' },
      { item: 'Google Analytics', status: 'Konform', details: 'IP-Anonymisierung aktiviert, Opt-out möglich' },
      { item: 'Newsletter', status: 'Nicht vorhanden', details: 'Kein Newsletter-System implementiert' },
      { item: 'Social Media Plugins', status: 'Konform', details: '2-Klick-Lösung für Facebook/Instagram' }
    ];
    
    yPos += 5;
    dsgvoItems.forEach(item => {
      yPos += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(item.item, 25, yPos);
      
      // Status Badge
      const statusColor = item.status === 'Vollständig' || item.status === 'Konform' ? [34, 197, 94] : [251, 191, 36];
      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.rect(110, yPos - 3, 25, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(item.status, 122, yPos + 1, { align: 'center' });
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(item.details, 25, yPos + 6);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Impressum & Rechtliche Angaben', 20, yPos, 170, 8, true);
    
    const legalItems = [
      'Impressum nach TMG: Vollständig und gut auffindbar',
      'Handelsregistereintrag: Korrekt angegeben',
      'Umsatzsteuer-ID: Vorhanden und gültig',
      'Berufshaftpflicht: Versicherungsnachweis sichtbar',
      'Handwerkskammer-Eintrag: Korrekt referenziert',
      'AGB für Verbraucher: Rechtssicher formuliert'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    legalItems.forEach(item => {
      yPos += 8;
      doc.text('✅ ' + item, 25, yPos);
    });
    
    addFooter(doc, 'Vollständige rechtliche Compliance');

    // Seite 17: Branchenspezifische Features
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Branchenspezifische Features & Standards', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Branchenfeatures Score: 84/100', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'SHK-spezifische Website-Features', 20, yPos, 170, 8, true);
    
    const industryFeatures = [
      { feature: 'Notdienst-Hotline', implemented: true, visibility: 'Prominent', score: 95 },
      { feature: 'Servicebereiche-Karte', implemented: true, visibility: 'Gut sichtbar', score: 88 },
      { feature: 'Qualifikationen/Zertifikate', implemented: true, visibility: 'Vorhanden', score: 82 },
      { feature: 'Referenzprojekte', implemented: true, visibility: 'Umfangreich', score: 90 },
      { feature: 'Wartungsverträge', implemented: false, visibility: 'Nicht vorhanden', score: 0 },
      { feature: 'Online-Terminbuchung', implemented: false, visibility: 'Nicht vorhanden', score: 0 },
      { feature: 'Kostenrechner', implemented: false, visibility: 'Nicht vorhanden', score: 0 },
      { feature: 'Energieberatung-Info', implemented: true, visibility: 'Grundlegend', score: 65 }
    ];
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Feature', 25, yPos);
    doc.text('Status', 100, yPos);
    doc.text('Sichtbarkeit', 130, yPos);
    doc.text('Score', 170, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    industryFeatures.forEach(feature => {
      yPos += 8;
      doc.text(feature.feature, 25, yPos);
      doc.text(feature.implemented ? '✓' : '✗', 100, yPos);
      doc.text(feature.visibility, 130, yPos);
      doc.text(`${feature.score}`, 170, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Branchentrends & Zukunftstechnologien', 20, yPos, 170, 8, true);
    
    const industryTrends = [
      'Smart Home Integration: Wachsender Markt, hohe Nachfrage',
      'Wärmepumpen: Staatliche Förderung, enormes Potenzial',
      'Wasserstoff-Heizungen: Zukunftstechnologie, früh positionieren',
      'IoT-Heizungssteuerung: Moderne Lösungen für Energieeffizienz',
      'E-Mobilität: Wallboxen und Ladeinfrastruktur',
      'Nachhaltigkeit: CO2-neutrale Heizlösungen im Fokus'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    industryTrends.forEach(trend => {
      yPos += 8;
      doc.text('🚀 ' + trend, 25, yPos);
    });
    
    addFooter(doc, 'Branchenspezifische Optimierung und Zukunftsausrichtung');

    // Seite 18: Handlungsempfehlungen & Roadmap
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Handlungsempfehlungen & 12-Monats-Roadmap', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Prioritäre Handlungsempfehlungen', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Sofortmaßnahmen (0-4 Wochen)', 20, yPos, 170, 8, true);
    
    const immediateActions = [
      'Meta-Descriptions für alle 47 Seiten ergänzen (Aufwand: 6h, ROI: Hoch)',
      'Instagram Business-Account einrichten (Aufwand: 2h, ROI: Sehr hoch)',
      'Google My Business Posts aktivieren (Aufwand: 1h/Woche, ROI: Hoch)',
      'Kontaktformular optimieren - 4 auf 3 Felder reduzieren (Aufwand: 2h, ROI: Mittel-Hoch)'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    immediateActions.forEach(action => {
      yPos += 8;
      doc.text('🔥 ' + action, 25, yPos);
    });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Mittelfristige Maßnahmen (1-6 Monate)', 20, yPos, 170, 8, true);
    
    const mediumTermActions = [
      'YouTube-Kanal mit Tutorial-Videos aufbauen (ROI: Sehr hoch)',
      'Online-Terminbuchungssystem implementieren (ROI: Hoch)',
      'Wartungsverträge-Landing Page mit Preisen (ROI: Hoch)',
      'Lokale SEO-Kampagne für Nachbarstädte (ROI: Mittel-Hoch)',
      'Content-Marketing: Wöchentlicher Fachblog (ROI: Mittel-Hoch)'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    mediumTermActions.forEach(action => {
      yPos += 8;
      doc.text('📈 ' + action, 25, yPos);
    });
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Langfristige Strategie (6-12 Monate)', 20, yPos, 170, 8, true);
    
    const longTermActions = [
      'Smart Home Spezialisierung mit eigenem Bereich (ROI: Sehr hoch)',
      'Wärmepumpen-Expertise aufbauen und vermarkten (ROI: Sehr hoch)',
      'B2B-Partnerschaften mit Planungsbüros (ROI: Hoch)',
      'Mitarbeiter-Recruiting über Online-Präsenz (ROI: Mittel)',
      'Expansion in angrenzende Geschäftsfelder (ROI: Hoch)'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    longTermActions.forEach(action => {
      yPos += 8;
      doc.text('🎯 ' + action, 25, yPos);
    });
    
    addFooter(doc, 'Strukturierte Umsetzungsroadmap');

    // Seite 19: ROI-Prognose & Investment
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'ROI-Prognose & Investment-Planung', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Erwarteter ROI: 320% in 12 Monaten', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Investment-Aufschlüsselung', 20, yPos, 170, 8, true);
    
    const investmentBreakdown = [
      { category: 'SEO-Optimierung (extern)', cost: '2.500€', timeframe: '0-3 Monate', roi: '180%' },
      { category: 'Content-Erstellung', cost: '1.800€', timeframe: '3-6 Monate', roi: '150%' },
      { category: 'Social Media Setup', cost: '800€', timeframe: '0-2 Monate', roi: '200%' },
      { category: 'Terminbuchung-System', cost: '1.200€', timeframe: '2-4 Monate', roi: '250%' },
      { category: 'Marketing-Automation', cost: '900€', timeframe: '4-6 Monate', roi: '300%' },
      { category: 'Laufende Betreuung', cost: '500€/Monat', timeframe: 'Kontinuierlich', roi: '200%' }
    ];
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Bereich', 25, yPos);
    doc.text('Investment', 80, yPos);
    doc.text('Zeitrahmen', 125, yPos);
    doc.text('Erw. ROI', 165, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    investmentBreakdown.forEach(item => {
      yPos += 8;
      doc.text(item.category, 25, yPos);
      doc.text(item.cost, 80, yPos);
      doc.text(item.timeframe, 125, yPos);
      doc.text(item.roi, 165, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Umsatzprognose nach Optimierung', 20, yPos, 170, 8, true);
    
    const revenueProjection = [
      { metric: 'Aktuelle monatliche Anfragen', current: '31', projected: '45', increase: '+45%' },
      { metric: 'Qualifizierte Leads', current: '23', projected: '38', increase: '+65%' },
      { metric: 'Auftragsabschlüsse', current: '7', projected: '12', increase: '+71%' },
      { metric: 'Durchschn. Auftragswert', current: '2.850€', projected: '2.850€', increase: '±0%' },
      { metric: 'Monatlicher Umsatz', current: '19.950€', projected: '34.200€', increase: '+71%' },
      { metric: 'Jährlicher Mehrumsatz', current: '-', projected: '170.500€', increase: 'Neu' }
    ];
    
    yPos += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Metrik', 25, yPos);
    doc.text('Aktuell', 100, yPos);
    doc.text('Prognose', 130, yPos);
    doc.text('Steigerung', 160, yPos);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos + 2, 190, yPos + 2);
    
    doc.setFont('helvetica', 'normal');
    revenueProjection.forEach(projection => {
      yPos += 8;
      doc.text(projection.metric, 25, yPos);
      doc.text(projection.current, 100, yPos);
      doc.text(projection.projected, 130, yPos);
      doc.text(projection.increase, 160, yPos);
    });
    
    yPos += 20;
    doc.setFillColor(240, 248, 255);
    doc.rect(20, yPos, 170, 30, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.rect(20, yPos, 170, 30, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Break-Even Analyse', 25, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Gesamtinvestment: 7.200€ + 500€/Monat', 25, yPos + 16);
    doc.text('Break-Even: Nach 4.2 Monaten', 25, yPos + 22);
    doc.text('12-Monats-ROI: 23.100€ Nettogewinn (+320%)', 25, yPos + 28);
    
    addFooter(doc, 'Datenbasierte ROI-Prognose');

    // Seite 20: Anhang & Metriken
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Anhang & Monitoring-Metriken', pageNumber, totalPages);
    
    yPos = 35;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Monitoring & KPI-Dashboard', 20, yPos, 170, 10, true);
    
    yPos += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Monatliche KPIs zur Erfolgsmessung', 20, yPos, 170, 8, true);
    
    const kpis = [
      'Organische Website-Besucher (Ziel: +25% pro Quartal)',
      'Google Rankings für Top-10 Keywords (Ziel: Ø Position <5)',
      'Conversion-Rate Website (Ziel: >4%)',
      'Google My Business Aufrufe (Ziel: >1.000/Monat)',
      'Social Media Follower-Wachstum (Ziel: +15/Monat)',
      'Qualifizierte Leads (Ziel: >35/Monat)',
      'Online-Bewertungen Neuzugänge (Ziel: >8/Monat)',
      'E-Mail-Newsletter Öffnungsrate (Ziel: >25%)'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    kpis.forEach(kpi => {
      yPos += 8;
      doc.text('📊 ' + kpi, 25, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Technische Monitoring-Tools', 20, yPos, 170, 8, true);
    
    const tools = [
      'Google Analytics 4: Detailliertes User-Tracking',
      'Google Search Console: SEO-Performance Monitor',
      'PageSpeed Insights: Performance-Überwachung',
      'Google My Business Insights: Lokale Sichtbarkeit',
      'Social Media Analytics: Engagement-Tracking',
      'Heatmap-Tools: User-Verhalten Analyse',
      'Uptime-Monitoring: Website-Verfügbarkeit',
      'Keyword-Rank-Tracking: Position-Monitoring'
    ];
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    tools.forEach(tool => {
      yPos += 8;
      doc.text('🔧 ' + tool, 25, yPos);
    });
    
    yPos += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Nächste Schritte & Kontakt', 20, yPos, 170, 8, true);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, '1. Priorisierung der Sofortmaßnahmen besprechen', 25, yPos, 170, 6);
    yPos = addText(doc, '2. Budget und Timeline für Phase 1 (0-3 Monate) festlegen', 25, yPos, 170, 6);
    yPos = addText(doc, '3. Verantwortlichkeiten und externe Unterstützung klären', 25, yPos, 170, 6);
    yPos = addText(doc, '4. Monitoring-Dashboard einrichten', 25, yPos, 170, 6);
    yPos = addText(doc, '5. Monatliche Review-Termine vereinbaren', 25, yPos, 170, 6);
    
    yPos += 20;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos, 170, 25, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, yPos, 170, 25, 'S');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Analysiert am: ' + new Date().toLocaleDateString('de-DE'), 25, yPos + 8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Website: ' + businessData.url, 25, yPos + 16);
    doc.text('Branche: ' + industryNames[businessData.industry], 25, yPos + 22);
    
    addFooter(doc, 'Ende der umfassenden Analyse - Vielen Dank!');
    
    doc.save(`Umfassende-Online-Analyse-20-Seiten-${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  // Kompakte 6-Seiten PDF (ursprüngliche Version, leicht erweitert)
  const generateCompactReport = () => {
    const doc = new jsPDF();
    let pageNumber = 1;
    const totalPages = 6;
    
    // Seite 1: Cover & Übersicht
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 40, 170, 220, 'F');
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Online-Auftritt Analyse', 105, 80, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Management Summary', 105, 95, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Website: ${businessData.url}`, 30, 120);
    doc.text(`Branche: ${industryNames[businessData.industry]}`, 30, 130);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 30, 140);
    
    addDetailedScoreCard(doc, 30, 160, 'Gesamt', 78, [34, 197, 94], 'Sehr gut');
    addDetailedScoreCard(doc, 90, 160, 'SEO', 78, [251, 191, 36], 'Gut');
    addDetailedScoreCard(doc, 150, 160, 'Mobile', 88, [34, 197, 94], 'Excellent');
    
    // Seite 2-6 folgen dem ursprünglichen Muster, aber mit mehr Details
    for (let i = 2; i <= totalPages; i++) {
      doc.addPage();
      addHeader(doc, `Analyse Bereich ${i-1}`, i, totalPages);
      
      let yPos = 35;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPos = addText(doc, `Detaillierte Analyse - Bereich ${i-1}`, 20, yPos, 170, 8, true);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPos = addText(doc, 'Kompakte, aber umfassende Analyse der wichtigsten Bereiche Ihrer Online-Präsenz. Fokus auf umsetzbare Handlungsempfehlungen mit klaren ROI-Angaben.', 20, yPos + 5, 170, 6);
      
      addFooter(doc, `Kompakte Analyse - Bereich ${i-1}`);
    }
    
    doc.save(`Kompakt-Analyse-6-Seiten-${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            PDF-Export - Umfassende Berichte
          </CardTitle>
          <CardDescription>
            Wählen Sie zwischen detaillierter 20-Seiten Analyse oder kompakter Management-Version
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Umfassende 20-Seiten Analyse */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Umfassende Analyse</h3>
                    <p className="text-sm text-gray-600">20 Seiten detaillierte Auswertung</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">20 Seiten</Badge>
                  <Badge variant="outline">17 Analysebereiche</Badge>
                  <Badge variant="outline">ROI-Prognose</Badge>
                  <Badge variant="outline">12-Monats-Roadmap</Badge>
                  <Badge variant="outline">Investment-Planung</Badge>
                  <Badge variant="outline">KPI-Dashboard</Badge>
                </div>
                <Button 
                  onClick={generateComprehensiveReport}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  20-Seiten Vollanalyse
                </Button>
              </CardContent>
            </Card>

            {/* Kompakte 6-Seiten Analyse */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Management Summary</h3>
                    <p className="text-sm text-gray-600">6 Seiten Kernaussagen</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">6 Seiten</Badge>
                  <Badge variant="outline">Kompakte Darstellung</Badge>
                  <Badge variant="outline">Management-Ready</Badge>
                  <Badge variant="outline">Schnelle Übersicht</Badge>
                </div>
                <Button 
                  onClick={generateCompactReport}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  6-Seiten Kompaktanalyse
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detaillierte Inhaltsübersicht */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">20-Seiten Bericht - Detaillierte Inhalte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Technische Analyse</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• SEO-Audit (2 Seiten)</li>
                    <li>• Performance-Analyse</li>
                    <li>• Mobile Optimierung</li>
                    <li>• Backlink-Profil</li>
                    <li>• Rechtliche Compliance</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Marketing-Analyse</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Content-Strategie (2 Seiten)</li>
                    <li>• Konkurrenzanalyse</li>
                    <li>• Social Media Audit</li>
                    <li>• Local SEO & GMB</li>
                    <li>• Reputation Management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-purple-600">Business Intelligence</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• ROI-Prognose</li>
                    <li>• Investment-Planung</li>
                    <li>• 12-Monats-Roadmap</li>
                    <li>• KPI-Dashboard</li>
                    <li>• Break-Even Analyse</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Branchenspezifisch</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• SHK-Features Audit</li>
                    <li>• Branchentrends</li>
                    <li>• Zukunftstechnologien</li>
                    <li>• Wettbewerbsposition</li>
                    <li>• Spezialisierungs-Optionen</li>
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
