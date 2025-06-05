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

  // Optimierte Textumbruch-Funktion ohne Überschriften-Umbruch
  const addText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number = 6, isHeading: boolean = false) => {
    if (isHeading) {
      // Überschriften nicht umbrechen
      doc.text(text, x, y);
      return y + lineHeight;
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
    
    return currentY;
  };

  // Kompakte Header-Funktion
  const addHeader = (doc: jsPDF, title: string, pageNumber: number, totalPages: number = 6) => {
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 20, 12);
    
    doc.setFontSize(10);
    doc.text(`Seite ${pageNumber} von ${totalPages}`, 170, 12);
    doc.setTextColor(0, 0, 0);
  };

  // Kompakte Footer-Funktion
  const addFooter = (doc: jsPDF) => {
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Online-Auftritt Analyse - Alle 17 Bereiche', 20, pageHeight - 10);
    doc.text(new Date().toLocaleDateString('de-DE'), 170, pageHeight - 10);
  };

  // Kompakte Score-Karte
  const addScoreCard = (doc: jsPDF, x: number, y: number, title: string, score: number, color: [number, number, number]) => {
    doc.setFillColor(255, 255, 255);
    doc.rect(x, y, 35, 20, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(x, y, 35, 20, 'S');
    
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x + 17, y + 8, 6, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${score}`, x + 15, y + 10);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.text(title, x + 17, y + 17, { align: 'center' });
  };

  // Detaillierte 17-Bereiche Analyse
  const generateDetailedReport = () => {
    const doc = new jsPDF();
    let pageNumber = 1;
    
    // Seite 1: Cover & Gesamtübersicht aller 17 Bereiche
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 40, 170, 220, 'F');
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Komplette Online-Auftritt Analyse', 105, 80, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Alle 17 Analysebereiche', 105, 95, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Website: ${businessData.url}`, 30, 120);
    doc.text(`Branche: ${industryNames[businessData.industry]}`, 30, 130);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 30, 140);
    
    // Hauptbereiche Scores
    addScoreCard(doc, 30, 160, 'SEO', 78, [251, 191, 36]);
    addScoreCard(doc, 75, 160, 'Keywords', 72, [251, 191, 36]);
    addScoreCard(doc, 120, 160, 'Performance', 92, [34, 197, 94]);
    addScoreCard(doc, 165, 160, 'Mobile', 88, [34, 197, 94]);
    
    // Zweite Reihe
    addScoreCard(doc, 30, 190, 'Local SEO', 85, [34, 197, 94]);
    addScoreCard(doc, 75, 190, 'Content', 67, [239, 68, 68]);
    addScoreCard(doc, 120, 190, 'Konkurrenz', 75, [251, 191, 36]);
    addScoreCard(doc, 165, 190, 'Backlinks', 69, [239, 68, 68]);
    
    // Dritte Reihe
    addScoreCard(doc, 30, 220, 'Bewertungen', 91, [34, 197, 94]);
    addScoreCard(doc, 75, 220, 'Social Media', 58, [239, 68, 68]);
    addScoreCard(doc, 120, 220, 'Social Proof', 73, [251, 191, 36]);
    addScoreCard(doc, 165, 220, 'Conversion', 76, [251, 191, 36]);
    
    // Vierte Reihe
    addScoreCard(doc, 30, 250, 'Arbeitsplatz', 82, [34, 197, 94]);
    addScoreCard(doc, 75, 250, 'Impressum', 95, [34, 197, 94]);
    addScoreCard(doc, 120, 250, 'Branche', 84, [34, 197, 94]);

    // Seite 2: SEO, Keywords & Performance
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'SEO, Keywords & Performance', pageNumber, 6);
    
    let yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'SEO Analyse (78/100)', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Title Tags: Gut optimiert, lokale Keywords ausbaufähig. Meta Descriptions: 40% fehlen. Überschriften: Gute H1-H6 Struktur.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Keyword-Analyse (72/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Branchenrelevante Keywords: 75% Abdeckung. Hauptbegriffe gut positioniert. Longtail-Keywords ausbaufähig.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Performance (92/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Ladezeit: 2.1s (sehr gut). Core Web Vitals: Alle grün. Bildoptimierung: Vollständig komprimiert.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Mobile Optimierung (88/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Responsive Design: Vollständig umgesetzt. Touch-Bedienung: Optimal. Mobile Navigation: Nutzerfreundlich.', 20, yPos + 5, 170, 6);
    
    addFooter(doc);

    // Seite 3: Local SEO, Content & Konkurrenz
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Local SEO, Content & Konkurrenz', pageNumber, 6);
    
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Local SEO (85/100)', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Google My Business: Vollständig, aktuelle Fotos. NAP-Konsistenz: 95%. Lokale Zitate: Ausbaufähig.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content-Analyse (67/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Textqualität: Gut strukturiert. Aktualität: Teilweise veraltet. Mehrwert: Ausbaufähig für Expertenstatus.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Konkurrenzanalyse (75/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Marktposition: Gut etabliert. Alleinstellungsmerkmale: Klar erkennbar. Preispositionierung: Wettbewerbsfähig.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Backlink-Profil (69/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Linkanzahl: 34 externe Links. Qualität: Überwiegend hochwertig. Spam-Links: Keine erkannt.', 20, yPos + 5, 170, 6);
    
    addFooter(doc);

    // Seite 4: Bewertungen & Social Media
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Bewertungen & Social Media', pageNumber, 6);
    
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Google Bewertungen (91/100)', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Durchschnitt: 4.6/5 (127 Bewertungen). Antwortrate: 85%. Aktuelle Bewertungen: Sehr positiv.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Social Media Präsenz (58/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Facebook: Vorhanden, selten aktualisiert. Instagram: Nicht vorhanden. LinkedIn: Geschäftsprofil aktiv.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Social Proof (73/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Kundenstimmen: 8 auf Website. Referenzen: Gut dokumentiert. Zertifikate: Sichtbar präsentiert.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Conversion-Optimierung (76/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Call-to-Actions: Klar erkennbar. Kontaktformular: Nutzerfreundlich. Anfrageprozess: Optimiert.', 20, yPos + 5, 170, 6);
    
    addFooter(doc);

    // Seite 5: Arbeitsplatz & Rechtliches
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Arbeitsplatz & Rechtliches', pageNumber, 6);
    
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Arbeitsplatz-Bewertungen (82/100)', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Kununu: 4.1/5 (23 Bewertungen). Glassdoor: Nicht bewertet. Indeed: Positive Arbeitgeberbewertungen.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Impressum & Datenschutz (95/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Impressum: Vollständig nach TMG. DSGVO: Konforme Datenschutzerklärung. Cookies: Rechtskonforme Einwilligung.', 20, yPos + 5, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Branchenspezifische Features (84/100)', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Notdienst-Hinweis: Prominent platziert. Servicebereiche: Klar definiert. Qualifikationen: Gut dokumentiert.', 20, yPos + 5, 170, 6);
    
    yPos += 25;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Prioritäre Handlungsempfehlungen:', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, '1. Social Media Aktivität erhöhen (Instagram einrichten)', 20, yPos + 5, 170, 6);
    yPos = addText(doc, '2. Content-Marketing für Expertenstatus ausbauen', 20, yPos + 3, 170, 6);
    yPos = addText(doc, '3. Meta-Descriptions für alle Seiten ergänzen', 20, yPos + 3, 170, 6);
    yPos = addText(doc, '4. Bewertungsmanagement systematisieren', 20, yPos + 3, 170, 6);
    
    addFooter(doc);

    // Seite 6: Zusammenfassung & Roadmap
    doc.addPage();
    pageNumber++;
    addHeader(doc, 'Zusammenfassung & Roadmap', pageNumber, 6);
    
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Executive Summary - Gesamtbewertung: 78/100', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Ihre Online-Präsenz zeigt starke technische Fundamente mit exzellenter Performance und mobiler Optimierung. Besonders hervorzuheben sind Ihre sehr guten Google-Bewertungen und die rechtskonforme Umsetzung.', 20, yPos + 8, 170, 6);
    
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Stärken:', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, '• Exzellente technische Performance (92/100)', 20, yPos + 5, 170, 6);
    yPos = addText(doc, '• Sehr gute Kundenbewertungen (91/100)', 20, yPos + 4, 170, 6);
    yPos = addText(doc, '• Vollständige rechtliche Compliance (95/100)', 20, yPos + 4, 170, 6);
    yPos = addText(doc, '• Starke lokale SEO-Basis (85/100)', 20, yPos + 4, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Verbesserungspotenzial:', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, '• Social Media Aktivität steigern', 20, yPos + 5, 170, 6);
    yPos = addText(doc, '• Content-Strategie für Thought Leadership', 20, yPos + 4, 170, 6);
    yPos = addText(doc, '• SEO-Feintuning bei Meta-Daten', 20, yPos + 4, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, '6-Monats-Roadmap:', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Monate 1-2: SEO-Optimierung, Social Media Setup', 20, yPos + 5, 170, 6);
    yPos = addText(doc, 'Monate 3-4: Content-Strategie, Bewertungsmanagement', 20, yPos + 4, 170, 6);
    yPos = addText(doc, 'Monate 5-6: Conversion-Optimierung, Monitoring', 20, yPos + 4, 170, 6);
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Erwartetes ROI: 30-40% mehr qualifizierte Anfragen', 20, yPos, 170, 8, true);
    
    addFooter(doc);
    
    doc.save(`Detaillierte-Analyse-17-Bereiche-${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  // Kompakte 6-Seiten PDF Generierung (aus Originalcode)
  const generateCompactReport = () => {
    const doc = new jsPDF();
    const city = businessData.address.split(',').pop()?.trim() || 'Stadt';
    
    // Seite 1: Cover & Übersicht
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setFillColor(255, 255, 255);
    doc.rect(20, 40, 170, 220, 'F');
    
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Online-Auftritt Analyse', 105, 80, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Website: ${businessData.url}`, 30, 110);
    doc.text(`Branche: ${industryNames[businessData.industry]}`, 30, 120);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 30, 130);
    
    addScoreCard(doc, 30, 150, 'Gesamt', 85, [34, 197, 94]);
    addScoreCard(doc, 75, 150, 'SEO', 78, [251, 191, 36]);
    addScoreCard(doc, 120, 150, 'Mobile', 92, [34, 197, 94]);
    addScoreCard(doc, 165, 150, 'Content', 67, [239, 68, 68]);
    
    // Seite 2: SEO Analyse
    doc.addPage();
    addHeader(doc, 'SEO Analyse', 2);
    
    let yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'SEO Bewertung: 78/100', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Title Tags: Gut optimiert für Hauptseiten, lokale Keywords könnten verstärkt werden.', 20, yPos + 10, 170, 6);
    yPos = addText(doc, 'Meta Descriptions: 40% der Seiten fehlen optimierte Descriptions. Handlungsempfehlung: Alle Seiten mit 150-160 Zeichen Descriptions ausstatten.', 20, yPos + 5, 170, 6);
    yPos = addText(doc, 'Überschriftenstruktur: Logische H1-H6 Hierarchie vorhanden, gelegentlich doppelte H1-Tags.', 20, yPos + 5, 170, 6);
    
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Prioritäre Maßnahmen:', 20, yPos + 15, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, '• Meta-Descriptions ergänzen (Aufwand: 2-3h)', 20, yPos + 5, 170, 6);
    yPos = addText(doc, '• Alt-Texte für Bilder hinzufügen', 20, yPos + 5, 170, 6);
    yPos = addText(doc, '• Schema Markup implementieren', 20, yPos + 5, 170, 6);
    
    addFooter(doc);
    
    // Seite 3: Performance & Mobile
    doc.addPage();
    addHeader(doc, 'Performance & Mobile Optimierung', 3);
    
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Performance Score: 92/100', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Ladegeschwindigkeit: Sehr gut mit 2.1 Sekunden durchschnittlicher Ladezeit.', 20, yPos + 10, 170, 6);
    yPos = addText(doc, 'Mobile Optimierung: Vollständig responsive, Touch-freundliche Navigation implementiert.', 20, yPos + 5, 170, 6);
    yPos = addText(doc, 'Core Web Vitals: Alle Metriken im grünen Bereich.', 20, yPos + 5, 170, 6);
    
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Content Analyse:', 20, yPos + 15, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Keyword-Dichte: Ausgewogen für Hauptbegriffe der Branche.', 20, yPos + 5, 170, 6);
    yPos = addText(doc, 'Lokale Inhalte: Ausbaufähig für bessere regionale Auffindbarkeit.', 20, yPos + 5, 170, 6);
    yPos = addText(doc, 'Call-to-Actions: Klar erkennbar, Conversion-optimiert.', 20, yPos + 5, 170, 6);
    
    addFooter(doc);
    
    // Seite 4: Konkurrenzanalyse
    doc.addPage();
    addHeader(doc, 'Konkurrenzanalyse', 4);
    
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Wettbewerbslandschaft', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, `3 Hauptkonkurrenten identifiziert. Durchschnittsbewertung: 3.9/5 Sterne.`, 20, yPos + 10, 170, 6);
    
    const competitors = [
      { name: `Sanitär ${city} GmbH`, rating: 4.1, reviews: 89, distance: "1.8 km" },
      { name: `Meyer Heizung & Co.`, rating: 3.9, reviews: 156, distance: "3.2 km" },
      { name: `${city}er Klima-Service`, rating: 3.6, reviews: 67, distance: "4.7 km" }
    ];
    
    competitors.forEach((comp, index) => {
      yPos += 15;
      doc.setFont('helvetica', 'bold');
      yPos = addText(doc, comp.name, 20, yPos, 170, 6, true);
      doc.setFont('helvetica', 'normal');
      yPos = addText(doc, `★ ${comp.rating} (${comp.reviews} Bewertungen) • ${comp.distance}`, 20, yPos + 3, 170, 6);
    });
    
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Wettbewerbsvorteil:', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Fokus auf digitale Präsenz und Kundenbewertungen empfohlen.', 20, yPos + 5, 170, 6);
    
    addFooter(doc);
    
    // Seite 5: Handlungsempfehlungen
    doc.addPage();
    addHeader(doc, 'Handlungsempfehlungen', 5);
    
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Prioritätenliste (nach ROI)', 20, yPos, 170, 8, true);
    
    const recommendations = [
      'Meta-Descriptions ergänzen - Aufwand: 2-3h, ROI: Hoch',
      'Google My Business optimieren - Aufwand: 1h, ROI: Sehr hoch',
      'Kundenbewertungen aktiv sammeln - Kontinuierlich, ROI: Hoch',
      'Lokale Keywords integrieren - Aufwand: 4-6h, ROI: Mittel-Hoch',
      'Social Media Präsenz ausbauen - Kontinuierlich, ROI: Mittel'
    ];
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    recommendations.forEach((rec, index) => {
      yPos += 12;
      yPos = addText(doc, `${index + 1}. ${rec}`, 20, yPos, 170, 6);
    });
    
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Erwarteter Gesamteffekt:', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, '25-35% mehr qualifizierte Anfragen über Website innerhalb 3-6 Monaten.', 20, yPos + 5, 170, 6);
    
    addFooter(doc);
    
    // Seite 6: Zusammenfassung & Timeline
    doc.addPage();
    addHeader(doc, 'Zusammenfassung & Timeline', 6);
    
    yPos = 30;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Executive Summary', 20, yPos, 170, 8, true);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Ihre Website zeigt solide Grundlagen mit besonders starker mobiler Optimierung. Hauptverbesserungspotenzial liegt in der SEO-Optimierung und lokalen Auffindbarkeit.', 20, yPos + 10, 170, 6);
    
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, '3-Monats-Plan:', 20, yPos, 170, 8, true);
    doc.setFont('helvetica', 'normal');
    yPos = addText(doc, 'Monat 1: Meta-Descriptions, Google My Business', 20, yPos + 5, 170, 6);
    yPos = addText(doc, 'Monat 2: Lokale Keywords, Bewertungsmanagement', 20, yPos + 5, 170, 6);
    yPos = addText(doc, 'Monat 3: Content-Erweiterung, Social Media', 20, yPos + 5, 170, 6);
    
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    yPos = addText(doc, 'Investment: €800-1.500 für professionelle Umsetzung', 20, yPos, 170, 8, true);
    
    addFooter(doc);
    
    doc.save(`Kompakt-Analyse-${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
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
            Umfassende Analyse mit allen 17 Bereichen oder kompakte 6-Seiten Version
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detaillierte Analyse */}
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Zap className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Detaillierte Analyse</h3>
                    <p className="text-sm text-gray-600">Alle 17 Bereiche ausführlich</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">17 Analysebereiche</Badge>
                  <Badge variant="outline">6 Seiten</Badge>
                  <Badge variant="outline">Vollständige Bewertung</Badge>
                  <Badge variant="outline">Detaillierte Roadmap</Badge>
                </div>
                <Button 
                  onClick={generateDetailedReport}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Detaillierte Analyse (17 Bereiche)
                </Button>
              </CardContent>
            </Card>

            {/* Kompakte Analyse */}
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Kompakte Analyse</h3>
                    <p className="text-sm text-gray-600">6 Seiten Management-Summary</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">6 Seiten</Badge>
                  <Badge variant="outline">Fokussierte Inhalte</Badge>
                  <Badge variant="outline">Management-Ready</Badge>
                </div>
                <Button 
                  onClick={generateCompactReport}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Kompakte Analyse
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysierte Bereiche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  SEO Analyse
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Keyword Analyse
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Performance
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Mobile Optimierung
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Local SEO
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                  Content Analyse
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Konkurrenzanalyse
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  Backlink Analyse
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Google Bewertungen
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                  Social Media
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lime-500 rounded-full"></div>
                  Social Proof
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  Conversion Optimierung
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Arbeitsplatz Bewertungen
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
                  Impressumsprüfung
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  Branchenfeatures
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                  Gesamtbewertung
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-stone-500 rounded-full"></div>
                  PDF Export
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
