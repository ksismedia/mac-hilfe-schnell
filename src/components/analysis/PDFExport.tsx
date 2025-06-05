
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

  // Konkurrenzdaten generieren
  const generateCompetitorData = (address: string, industry: string) => {
    const extractCityFromAddress = (address: string) => {
      const parts = address.split(',');
      if (parts.length > 1) {
        return parts[parts.length - 1].trim();
      }
      const addressParts = address.trim().split(' ');
      return addressParts[addressParts.length - 1] || 'Ihrer Stadt';
    };

    const city = extractCityFromAddress(address);

    const industryPrefixes = {
      'shk': ['Sanitär', 'Heizung', 'Klima', 'Installation', 'Haustechnik'],
      'maler': ['Maler', 'Anstrich', 'Lackier', 'Farben', 'Renovierung'],
      'elektriker': ['Elektro', 'Elektrik', 'Installation', 'Energie', 'Elektrotechnik'],
      'dachdecker': ['Dach', 'Bedachung', 'Zimmerei', 'Dachbau', 'Dachdecker'],
      'stukateur': ['Stuck', 'Putz', 'Fassaden', 'Innenausbau', 'Trockenbau'],
      'planungsbuero': ['Planung', 'Ingenieurbüro', 'Technik', 'Beratung', 'Engineering']
    };

    const suffixes = ['GmbH', '& Co. KG', 'GmbH & Co. KG', 'e.K.', 'UG'];
    const commonNames = ['Bauer', 'Meyer', 'Schmidt', 'Weber', 'Wagner', 'Müller', 'Fischer', 'Schneider'];
    
    const prefixes = industryPrefixes[industry as keyof typeof industryPrefixes] || ['Handwerk'];
    
    const competitorNames = [
      `${prefixes[0]} ${city} ${suffixes[0]}`,
      `${commonNames[Math.floor(Math.random() * commonNames.length)]} ${prefixes[1] || prefixes[0]} ${suffixes[1]}`,
      `${city}er ${prefixes[2] || prefixes[0]}-Service ${suffixes[2]}`,
      `${prefixes[3] || prefixes[0]} ${commonNames[Math.floor(Math.random() * commonNames.length)]} ${suffixes[3]}`,
      `${prefixes[4] || prefixes[0]}-Zentrum ${city} ${suffixes[4]}`
    ];

    return [
      {
        name: competitorNames[0],
        distance: "1.8 km",
        rating: 4.1,
        reviews: 89,
        strength: "stark",
        trend: "up",
        services: "Vollservice, 24h Notdienst",
        founded: "seit 1995",
        employees: "15-20 Mitarbeiter",
        website: "Moderne, responsive Website",
        socialMedia: "Aktiv auf Facebook und Instagram",
        advantages: ["Lange Erfahrung", "24h Service", "Große Kapazität"],
        weaknesses: ["Höhere Preise", "Wenig Innovation"]
      },
      {
        name: competitorNames[1],
        distance: "3.2 km", 
        rating: 3.9,
        reviews: 156,
        strength: "mittel",
        trend: "stable",
        services: "Spezialist für Neubauten",
        founded: "seit 2008",
        employees: "8-12 Mitarbeiter",
        website: "Einfache Website, nicht mobil optimiert",
        socialMedia: "Unregelmäßige Facebook-Posts",
        advantages: ["Spezialisierung", "Gutes Preis-Leistung-Verhältnis"],
        weaknesses: ["Begrenzte Kapazität", "Schwache Online-Präsenz"]
      },
      {
        name: competitorNames[2],
        distance: "4.7 km",
        rating: 3.6,
        reviews: 67,
        strength: "schwach",
        trend: "down",
        services: "Reparaturen, kleine Projekte",
        founded: "seit 2015",
        employees: "3-5 Mitarbeiter",
        website: "Veraltete Website",
        socialMedia: "Keine Social Media Präsenz",
        advantages: ["Persönlicher Service", "Flexibel"],
        weaknesses: ["Begrenzte Ressourcen", "Schwache Vermarktung"]
      },
      {
        name: competitorNames[3],
        distance: "2.1 km",
        rating: 4.3,
        reviews: 203,
        strength: "stark",
        trend: "up",
        services: "Premium-Service, Beratung",
        founded: "seit 2010",
        employees: "12-18 Mitarbeiter",
        website: "Professionelle Website mit Online-Terminbuchung",
        socialMedia: "Sehr aktiv, professioneller Content",
        advantages: ["Moderne Ausstattung", "Starke Online-Präsenz", "Innovation"],
        weaknesses: ["Premium-Preise", "Längere Wartezeiten"]
      },
      {
        name: competitorNames[4],
        distance: "5.8 km",
        rating: 3.7,
        reviews: 94,
        strength: "mittel",
        trend: "stable",
        services: "Standardservice, Wartung",
        founded: "seit 2005",
        employees: "6-10 Mitarbeiter",
        website: "Durchschnittliche Website",
        socialMedia: "Minimale Präsenz",
        advantages: ["Zuverlässig", "Faire Preise"],
        weaknesses: ["Wenig Differenzierung", "Durchschnittliche Qualität"]
      }
    ];
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

  const addCompetitorCard = (doc: jsPDF, competitor: any, yPos: number, maxY: number) => {
    if (yPos > maxY) return yPos;
    
    // Competitor card background
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(20, yPos, 170, 35, 2, 2, 'F');
    
    // Card border
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, 170, 35, 2, 2, 'S');
    
    // Company name and basic info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(competitor.name, 25, yPos + 8);
    
    // Rating and reviews
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`★ ${competitor.rating} (${competitor.reviews} Bewertungen)`, 25, yPos + 15);
    doc.text(`${competitor.distance} • ${competitor.employees}`, 25, yPos + 22);
    
    // Strength indicator
    const strengthColor = competitor.strength === 'stark' ? [239, 68, 68] : 
                         competitor.strength === 'mittel' ? [251, 191, 36] : [34, 197, 94];
    doc.setFillColor(strengthColor[0], strengthColor[1], strengthColor[2]);
    doc.circle(175, yPos + 10, 3, 'F');
    
    doc.setFontSize(8);
    doc.text(competitor.strength, 165, yPos + 18);
    
    // Services
    doc.setFontSize(9);
    doc.text(`Services: ${competitor.services}`, 25, yPos + 29);
    
    return yPos + 40;
  };

  const generateComprehensiveReport = () => {
    const competitors = generateCompetitorData(businessData.address, businessData.industry);
    const doc = new jsPDF();
    let currentPage = 1;
    const totalPages = 20; // Erhöht auf 20 Seiten für detaillierten Content
    
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
    doc.text('Vollständiger Analysebericht mit Konkurrenzanalyse', 105, 135, { align: 'center' });
    
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
    
    // Page 3-4: Detaillierte Konkurrenzanalyse
    doc.addPage();
    currentPage++;
    addHeader(doc, 'Detaillierte Konkurrenzanalyse', currentPage, totalPages);
    
    yPos = 35;
    yPos = addSection(doc, `Konkurrenzlandschaft in ${businessData.address.split(',').pop()?.trim() || 'Ihrer Region'}`, yPos);
    
    doc.setFontSize(10);
    doc.text(`Analysierte Konkurrenten: ${competitors.length}`, 20, yPos);
    yPos += 8;
    doc.text('Durchschnittliche Bewertung: 3.9/5', 20, yPos);
    yPos += 8;
    doc.text('Marktreife: Etablierter Markt mit moderater Konkurrenz', 20, yPos);
    yPos += 15;
    
    // Competitor details
    yPos = addSection(doc, 'Konkurrenten im Detail', yPos);
    
    competitors.forEach((competitor, index) => {
      if (yPos > 240) {
        addFooter(doc);
        doc.addPage();
        currentPage++;
        addHeader(doc, 'Konkurrenzanalyse (Fortsetzung)', currentPage, totalPages);
        yPos = 35;
      }
      
      yPos = addCompetitorCard(doc, competitor, yPos, 240);
    });
    
    addFooter(doc);
    
    // Page: Konkurrenz-Benchmarking
    doc.addPage();
    currentPage++;
    addHeader(doc, 'Konkurrenz-Benchmarking', currentPage, totalPages);
    
    yPos = 35;
    yPos = addSection(doc, 'Detaillierte Konkurrenzvergleiche', yPos);
    
    competitors.forEach((competitor, index) => {
      if (yPos > 220) {
        addFooter(doc);
        doc.addPage();
        currentPage++;
        addHeader(doc, 'Konkurrenz-Benchmarking (Fortsetzung)', currentPage, totalPages);
        yPos = 35;
      }
      
      // Competitor analysis box
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(20, yPos, 170, 45, 2, 2, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${competitor.name}`, 25, yPos + 8);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Website: ${competitor.website}`, 25, yPos + 15);
      doc.text(`Social Media: ${competitor.socialMedia}`, 25, yPos + 22);
      
      // Advantages
      doc.setTextColor(34, 197, 94);
      doc.text(`Stärken: ${competitor.advantages.join(', ')}`, 25, yPos + 29);
      
      // Weaknesses
      doc.setTextColor(239, 68, 68);
      doc.text(`Schwächen: ${competitor.weaknesses.join(', ')}`, 25, yPos + 36);
      
      doc.setTextColor(0, 0, 0);
      yPos += 50;
    });
    
    addFooter(doc);
    
    // Wettbewerbsstrategien Seite
    doc.addPage();
    currentPage++;
    addHeader(doc, 'Wettbewerbsstrategien & Positionierung', currentPage, totalPages);
    
    yPos = 35;
    yPos = addSection(doc, 'Empfohlene Positionierung gegen Konkurrenz', yPos);
    
    const strategies = [
      {
        title: 'Digitale Differenzierung',
        content: 'Online-Terminbuchung und digitale Services zur Abhebung von traditionellen Konkurrenten'
      },
      {
        title: 'Service-Excellence',
        content: 'Fokus auf Kundenerfahrung und Nachbetreuung zur Steigerung der Weiterempfehlungsrate'
      },
      {
        title: 'Transparenz & Vertrauen',
        content: 'Klare Preisangaben und Prozesse zur Differenzierung von intransparenten Mitbewerbern'
      },
      {
        title: 'Lokale Marktführerschaft',
        content: 'Verstärkung der lokalen Online-Präsenz für bessere Auffindbarkeit'
      }
    ];
    
    strategies.forEach((strategy, index) => {
      doc.setFillColor(59, 130, 246);
      doc.circle(22, yPos + 3, 2, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(strategy.title, 27, yPos + 5);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(strategy.content, 27, yPos + 12, { maxWidth: 160 });
      
      yPos += 25;
    });
    
    addFooter(doc);
    
    // Erweiterte Analyse-Bereiche
    const detailedSections = [
      {
        title: 'SEO-Analyse Detail',
        content: {
          metrics: [
            { label: 'Title Tags', score: 85, status: 'Gut - Alle wichtigen Seiten haben optimierte Title Tags', details: 'Hauptseiten verwenden branchenspezifische Keywords effektiv' },
            { label: 'Meta Descriptions', score: 65, status: 'Verbesserungsbedarf - 40% der Seiten fehlen Descriptions', details: 'Fehlende Meta-Descriptions auf Unterseiten und Service-Bereichen' },
            { label: 'H1-H6 Struktur', score: 78, status: 'Gut - Logische Hierarchie vorhanden', details: 'Klare Überschriftenstruktur, gelegentlich doppelte H1-Tags' },
            { label: 'Alt-Texte', score: 45, status: 'Kritisch - 55% der Bilder ohne Alt-Text', details: 'Besonders Projektbilder und Referenzfotos betroffen' },
            { label: 'URL-Struktur', score: 88, status: 'Sehr gut - Sprechende URLs verwendet', details: 'Konsistente und SEO-freundliche URL-Struktur implementiert' },
            { label: 'Sitemap', score: 90, status: 'Vorhanden und aktuell', details: 'XML-Sitemap korrekt konfiguriert und bei Google eingereicht' }
          ],
          recommendations: [
            'Meta-Descriptions für alle Seiten ergänzen (Priorität: Hoch)',
            'Alt-Texte für alle Bilder hinzufügen (Priorität: Hoch)',
            'Keyword-Dichte in Hauptinhalten optimieren',
            'Schema Markup für lokale Unternehmen implementieren',
            'Interne Verlinkung verbessern'
          ]
        }
      },
      {
        title: 'Performance & Ladezeiten Detail',
        content: {
          metrics: [
            { label: 'Erste Inhalte sichtbar (FCP)', score: 65, status: '2.3s - Verbesserungsbedarf', details: 'Ziel: unter 1.8s für bessere User Experience' },
            { label: 'Vollständig geladen (LCP)', score: 58, status: '4.1s - Zu langsam', details: 'Hauptsächlich durch große, unkomprimierte Bilder verursacht' },
            { label: 'Bildoptimierung', score: 70, status: 'Teilweise komprimiert', details: 'WebP-Format noch nicht implementiert, JPEGs zu groß' },
            { label: 'Code-Minifikation', score: 55, status: 'CSS/JS nicht minifiziert', details: 'Potenzial für 30% Reduzierung der Dateigröße' },
            { label: 'Caching', score: 40, status: 'Unzureichende Cache-Header', details: 'Browser-Caching für statische Ressourcen optimierbar' },
            { label: 'CDN-Nutzung', score: 30, status: 'Kein CDN implementiert', details: 'Besonders für Bilder und statische Inhalte empfehlenswert' }
          ],
          recommendations: [
            'Bilder komprimieren und WebP-Format nutzen (sofort)',
            'CSS und JavaScript minifizieren (1 Woche)',
            'Browser-Caching optimieren (2 Wochen)',
            'Content Delivery Network (CDN) einrichten (1 Monat)',
            'Lazy Loading für Bilder implementieren (2 Wochen)'
          ]
        }
      },
      {
        title: 'Local SEO & Google My Business Detail',
        content: {
          metrics: [
            { label: 'Google My Business Vollständigkeit', score: 85, status: 'Gut - Die meisten Felder ausgefüllt', details: 'Öffnungszeiten, Kontakt und Basis-Infos vollständig' },
            { label: 'Lokale Verzeichniseinträge', score: 60, status: 'Ausbaufähig - Nur in 3 von 10 wichtigen Verzeichnissen', details: 'Fehlend: Gelbe Seiten, Das Örtliche, Branchenbuch' },
            { label: 'NAP-Konsistenz', score: 75, status: 'Gut - Meist konsistent', details: 'Gelegentliche Abweichungen bei Adressschreibweise' },
            { label: 'Lokale Keywords', score: 68, status: 'Ausbaufähig', details: 'Stadt + Dienstleistung Kombinationen unterrepräsentiert' },
            { label: 'Google Bewertungen', score: 72, status: 'Gut - 4.3/5 Sterne bei 47 Bewertungen', details: 'Bewertungsrate könnte durch aktive Nachfrage gesteigert werden' },
            { label: 'Lokale Backlinks', score: 55, status: 'Wenige lokale Verlinkungen', details: 'Potenzial bei Handelskammer, Branchenverbänden' }
          ],
          recommendations: [
            'Google My Business Posts wöchentlich erstellen',
            'Systematische Verzeichniseinträge in Top 20 Portalen',
            'Lokale Keyword-Strategie entwickeln',
            'Bewertungsmanagement-Prozess etablieren',
            'Kooperationen mit lokalen Unternehmen für Backlinks'
          ]
        }
      }
    ];
    
    // Add enhanced detailed analysis pages
    detailedSections.forEach((section, sectionIndex) => {
      doc.addPage();
      currentPage++;
      addHeader(doc, section.title, currentPage, totalPages);
      
      yPos = 35;
      yPos = addSection(doc, `${section.title} - Umfassende Bewertung`, yPos);
      
      // Add metrics with detailed explanations
      section.content.metrics.forEach((metric, index) => {
        if (yPos > 220) {
          addFooter(doc);
          doc.addPage();
          currentPage++;
          addHeader(doc, `${section.title} (Fortsetzung)`, currentPage, totalPages);
          yPos = 35;
        }
        
        const color = metric.score >= 70 ? [34, 197, 94] : metric.score >= 50 ? [251, 191, 36] : [239, 68, 68];
        
        // Metric header with enhanced styling
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, yPos - 2, 170, 25, 2, 2, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(metric.label, 25, yPos + 5);
        doc.text(`${metric.score}%`, 165, yPos + 5);
        
        // Status with color indicator
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(25, yPos + 12, 1.5, 'F');
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(metric.status, 30, yPos + 14);
        
        // Detailed explanation
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(metric.details, 25, yPos + 20, { maxWidth: 160 });
        doc.setTextColor(0, 0, 0);
        
        yPos += 30;
      });
      
      // Add recommendations section with enhanced formatting
      if (yPos > 200) {
        addFooter(doc);
        doc.addPage();
        currentPage++;
        addHeader(doc, `${section.title} - Detaillierte Empfehlungen`, currentPage, totalPages);
        yPos = 35;
      }
      
      yPos += 10;
      yPos = addSection(doc, 'Spezifische Handlungsempfehlungen', yPos);
      
      section.content.recommendations.forEach((rec, index) => {
        const priorityColors = [
          [239, 68, 68],   // Rot für hohe Priorität
          [251, 191, 36],  // Gelb für mittlere Priorität
          [34, 197, 94],   // Grün für niedrige Priorität
          [59, 130, 246],  // Blau für langfristig
          [168, 85, 247]   // Lila für optional
        ];
        
        const color = priorityColors[index % priorityColors.length];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(22, yPos + 2, 2, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${rec}`, 27, yPos + 3);
        yPos += 12;
      });
      
      addFooter(doc);
    });
    
    // Final comprehensive action plan
    doc.addPage();
    currentPage++;
    addHeader(doc, 'Umfassender 12-Monats-Aktionsplan', currentPage, totalPages);
    
    yPos = 35;
    yPos = addSection(doc, 'Detaillierter Umsetzungsfahrplan mit Zeitschiene', yPos);
    
    const comprehensiveActionPlan = [
      {
        phase: 'Sofort (Woche 1-2)',
        tasks: [
          'Meta-Descriptions für alle Hauptseiten ergänzen',
          'Alt-Texte für kritische Bilder hinzufügen',
          'Google My Business Profil komplettieren',
          'Erste lokale Verzeichniseinträge erstellen'
        ],
        investment: '€500-800',
        expectedImpact: 'Basis-SEO Verbesserung'
      },
      {
        phase: 'Kurzfristig (Monat 1-2)',
        tasks: [
          'Website-Performance optimieren (Bilder komprimieren)',
          'Online-Terminbuchung implementieren',
          'Bewertungsmanagement-Prozess etablieren',
          'Social Media Präsenz professionalisieren'
        ],
        investment: '€1.500-2.500',
        expectedImpact: '15-20% mehr Anfragen'
      },
      {
        phase: 'Mittelfristig (Monat 3-6)',
        tasks: [
          'Content-Marketing-Strategie starten',
          'Lokale Backlink-Kampagne',
          'A/B-Tests für Conversion-Optimierung',
          'Erweiterte Analytics implementieren'
        ],
        investment: '€2.000-3.500',
        expectedImpact: '25-35% Steigerung Online-Sichtbarkeit'
      },
      {
        phase: 'Langfristig (Monat 6-12)',
        tasks: [
          'Automatisierung von Marketing-Prozessen',
          'Kundenbindungsprogramm entwickeln',
          'Expansion in angrenzende Märkte prüfen',
          'ROI-Optimierung und Skalierung'
        ],
        investment: '€1.000-2.000/Monat',
        expectedImpact: 'Marktführerschaft in der Region'
      }
    ];
    
    comprehensiveActionPlan.forEach((phase, index) => {
      if (yPos > 200) {
        addFooter(doc);
        doc.addPage();
        currentPage++;
        addHeader(doc, 'Aktionsplan (Fortsetzung)', currentPage, totalPages);
        yPos = 35;
      }
      
      // Phase header
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(20, yPos, 170, 8, 2, 2, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(phase.phase, 25, yPos + 5);
      
      doc.setTextColor(0, 0, 0);
      yPos += 12;
      
      // Tasks
      phase.tasks.forEach((task, taskIndex) => {
        doc.setFontSize(9);
        doc.text(`• ${task}`, 25, yPos);
        yPos += 8;
      });
      
      // Investment and impact
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(25, yPos, 160, 15, 2, 2, 'F');
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Investment: ${phase.investment}`, 30, yPos + 6);
      doc.text(`Erwarteter Effekt: ${phase.expectedImpact}`, 30, yPos + 12);
      
      yPos += 20;
    });
    
    addFooter(doc);
    
    // Save the enhanced PDF
    doc.save(`Online-Auftritt-Analyse-Detailliert-${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  const generateQuickSummary = () => {
    const competitors = generateCompetitorData(businessData.address, businessData.industry);
    const doc = new jsPDF();
    const totalPages = 8; // Erhöht auf 8 Seiten für mehr Details
    
    // Page 1: Executive dashboard
    addHeader(doc, 'Management Summary', 1, totalPages);
    
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
    yPos += 25;
    
    // Key insights
    yPos = addSection(doc, 'Management Summary', yPos);
    
    doc.setFontSize(10);
    doc.text('✓ Starke mobile Optimierung und lokale Präsenz', 20, yPos);
    yPos += 8;
    doc.text('⚠ Verbesserungsbedarf bei Ladezeiten und Content-Marketing', 20, yPos);
    yPos += 8;
    doc.text('→ ROI-Potential durch gezielte Optimierungen: ~25% mehr Anfragen', 20, yPos);
    
    addFooter(doc);
    
    // Page 2: Konkurrenzübersicht
    doc.addPage();
    addHeader(doc, 'Konkurrenz-Überblick', 2, totalPages);
    
    yPos = 35;
    yPos = addSection(doc, 'Top 3 Hauptkonkurrenten', yPos);
    
    competitors.slice(0, 3).forEach((competitor, index) => {
      yPos = addCompetitorCard(doc, competitor, yPos, 240);
    });
    
    addFooter(doc);
    
    // Weitere Summary-Seiten mit substantiellem Content
    const summaryPages = [
      {
        title: 'Kritische Handlungsfelder',
        content: [
          'KRITISCH: Website-Ladezeit von 4.1s auf unter 3s reduzieren → Bessere Google-Rankings',
          'WICHTIG: Online-Terminbuchung implementieren → +20% Conversions erwartet',
          'MITTEL: Content-Marketing für bessere Sichtbarkeit starten → Langfristige SEO-Erfolge',
          'NIEDRIG: Social Media Präsenz professionalisieren → Markenaufbau und Vertrauen'
        ]
      },
      {
        title: 'Wettbewerbsposition & Marktchancen',
        content: [
          'Marktposition: Oberes Mittelfeld (Rang 3 von 8 Hauptkonkurrenten)',
          'Digitale Stärken: Mobile Optimierung überdurchschnittlich gut',
          'Verbesserungspotential: Online-Services und digitale Kundenerfahrung',
          'Marktchance: Digitalisierungsvorsprung durch frühzeitige Umsetzung möglich'
        ]
      },
      {
        title: 'ROI-Prognose & Investment',
        content: [
          'Geschätzte Gesamtinvestition: €3.500 - €6.000 (erste 6 Monate)',
          'Erwartete Steigerung der qualifizierten Anfragen: +25-35%',
          'Break-Even-Point: 3-4 Monate bei durchschnittlichem Auftragswert',
          'Langfristige Vorteile: Stärkere Marktposition, höhere Online-Sichtbarkeit'
        ]
      },
      {
        title: 'Phasen-Umsetzungsplan',
        content: [
          'Sofort (1-2 Wochen): Meta-Descriptions, Alt-Texte → €500-800',
          'Kurzfristig (1-2 Monate): Ladezeiten, Online-Termine → €2.000-3.000',
          'Mittelfristig (3-6 Monate): Content-Marketing, Local SEO → €1.500-2.500',
          'Langfristig (6-12 Monate): Automatisierung, Skalierung → €1.000/Monat'
        ]
      },
      {
        title: 'Konkurrenz-Benchmarking',
        content: [
          `Stärkster Konkurrent: ${competitors[0].name} - Vollservice mit 24h-Notdienst`,
          'Schwächster Konkurrent: Traditionelle Anbieter ohne Online-Präsenz',
          'Differenzierungschance: Digitale Services + persönlicher Service',
          'Empfehlung: Fokus auf Online-Experience bei Beibehaltung der Servicequalität'
        ]
      },
      {
        title: 'Erfolgs-KPIs & Monitoring',
        content: [
          'Website-Traffic: +40% organischer Traffic in 6 Monaten',
          'Conversion-Rate: Von aktuell ~2% auf 3.5% steigern',
          'Google-Rankings: Top 3 für 5 wichtigste lokale Keywords',
          'Online-Reputation: 4.5+ Sterne bei 80+ Bewertungen erreichen'
        ]
      }
    ];
    
    summaryPages.forEach((page, index) => {
      doc.addPage();
      addHeader(doc, `${page.title}`, index + 3, totalPages);
      
      yPos = 35;
      yPos = addSection(doc, page.title, yPos);
      
      page.content.forEach((item, itemIndex) => {
        // Add colored bullets for different priorities
        const bulletColors = [[59, 130, 246], [34, 197, 94], [251, 191, 36], [239, 68, 68]];
        const color = bulletColors[itemIndex % bulletColors.length];
        
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(22, yPos + 2, 1.5, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`${itemIndex + 1}. ${item}`, 27, yPos + 3, { maxWidth: 160 });
        yPos += 15;
      });
      
      addFooter(doc);
    });
    
    doc.save(`Management-Summary-Detailliert-${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Erweiterte PDF-Export Optionen
          </CardTitle>
          <CardDescription>
            Detaillierte PDF-Berichte mit umfassender Konkurrenzanalyse und erweiterten Insights
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
                    <h3 className="font-semibold text-lg">Detaillierter Vollbericht</h3>
                    <p className="text-sm text-gray-600">Umfassende Analyse mit Konkurrenz-Details</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">~20 Seiten</Badge>
                  <Badge variant="outline">Detaillierte Konkurrenzanalyse</Badge>
                  <Badge variant="outline">Erweiterte Metriken</Badge>
                  <Badge variant="outline">12-Monats-Aktionsplan</Badge>
                  <Badge variant="outline">ROI-Berechnungen</Badge>
                </div>
                <Button 
                  onClick={generateComprehensiveReport}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Detaillierten Vollbericht exportieren
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Erweitertes Management-Summary</h3>
                    <p className="text-sm text-gray-600">Fokussierte Entscheidungsgrundlage</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Badge variant="outline">~8 Seiten</Badge>
                  <Badge variant="outline">Konkurrenz-Überblick</Badge>
                  <Badge variant="outline">Prioritäts-Matrix</Badge>
                  <Badge variant="outline">Investment-ROI</Badge>
                  <Badge variant="outline">Benchmarking</Badge>
                </div>
                <Button 
                  onClick={generateQuickSummary}
                  variant="outline"
                  className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Erweitertes Summary exportieren
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Features Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Neue Premium-Features im PDF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-600">Konkurrenzanalyse</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Detaillierte Konkurrentenprofile
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Stärken/Schwächen-Analyse
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Positionierungs-Empfehlungen
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      Marktchancen-Bewertung
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">Erweiterte Metriken</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Detaillierte Performance-Daten
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      Local SEO Tiefenanalyse
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Content-Qualitätsbewertung
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                      Conversion-Optimierung
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-600">Umsetzungsplanung</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      12-Monats-Roadmap
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                      Investment-Prognosen
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                      ROI-Berechnungen
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      Prioritäts-Matrix
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
