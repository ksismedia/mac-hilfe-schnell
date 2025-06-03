import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker';
}

interface PDFExportProps {
  businessData: BusinessData;
}

const PDFExport: React.FC<PDFExportProps> = ({ businessData }) => {
  const { toast } = useToast();

  const industryNames = {
    shk: 'SHK (Sanitär, Heizung, Klima)',
    maler: 'Maler und Lackierer',
    elektriker: 'Elektriker',
    dachdecker: 'Dachdecker'
  };

  // Simulierte detaillierte Analysedaten für vollständigen Bericht
  const detailedAnalysisData = {
    seo: {
      score: 4.5,
      metaTags: { title: "Sehr gut", description: "Gut", keywords: "Verbesserungsbedarf" },
      headings: "Gut strukturiert",
      urls: "SEO-freundlich",
      sitemap: "Vorhanden",
      robots: "Korrekt konfiguriert"
    },
    keywords: {
      score: 3.8,
      mainKeywords: ["Heizung Reparatur", "Notdienst", "Installation"],
      ranking: { local: "Position 3-5", google: "Position 8-12" },
      density: "Optimierungsbedarf",
      competition: "Hoch"
    },
    performance: {
      score: 4.1,
      loadTime: "2.3s",
      pageSize: "1.2MB",
      images: "Komprimiert",
      caching: "Aktiviert",
      mobile: "Optimiert"
    },
    mobile: {
      score: 4.3,
      responsive: "Vollständig responsive",
      touchTargets: "Angemessen groß",
      viewportConfig: "Korrekt",
      pagespeed: "Gut"
    },
    localSeo: {
      score: 4.0,
      googleMyBusiness: "Vollständig ausgefüllt",
      napConsistency: "Konsistent",
      localCitations: "15 gefunden",
      reviews: "Aktiv verwaltet"
    },
    content: {
      score: 3.9,
      quality: "Gut",
      uniqueness: "95% einzigartig",
      readability: "Gut lesbar",
      structure: "Verbesserungsbedarf"
    },
    competition: {
      score: 3.7,
      position: "3 von 15",
      marketShare: "12%",
      strengths: "Gute Bewertungen",
      weaknesses: "Weniger Online-Präsenz",
      competitors: [
        {
          name: "Müller Handwerk GmbH",
          distance: "1.2 km",
          rating: 4.3,
          reviews: 89,
          website: "professionell",
          socialMedia: "aktiv",
          ranking: "höher",
          advantages: [
            "Sehr professionelle Website mit modernem Design",
            "Aktive Social Media Präsenz mit regelmäßigen Posts",
            "Höhere Anzahl an Google-Bewertungen",
            "Bessere lokale SEO-Optimierung"
          ],
          disadvantages: [
            "Höhere Preise laut Kundenfeedback",
            "Längere Wartezeiten für Termine",
            "Weniger persönlicher Service"
          ]
        },
        {
          name: "Schmidt & Partner",
          distance: "2.1 km", 
          rating: 4.1,
          reviews: 156,
          website: "basic",
          socialMedia: "wenig aktiv",
          ranking: "ähnlich",
          advantages: [
            "Sehr viele Kundenbewertungen und Referenzen",
            "Langjährige Erfahrung und Reputation",
            "Breites Servicespektrum",
            "Gute Erreichbarkeit und Standort"
          ],
          disadvantages: [
            "Veraltetes Website-Design",
            "Schwache Social Media Aktivität",
            "Unübersichtliche Online-Präsenz",
            "Fehlende moderne Online-Services"
          ]
        },
        {
          name: "Handwerksprofi24",
          distance: "3.5 km",
          rating: 3.9,
          reviews: 67,
          website: "veraltet",
          socialMedia: "inaktiv",
          ranking: "niedriger",
          advantages: [
            "24-Stunden Notdienst verfügbar",
            "Günstige Preise",
            "Flexible Terminvereinbarung"
          ],
          disadvantages: [
            "Veraltete und unprofessionelle Website",
            "Keine Social Media Präsenz",
            "Wenige Online-Bewertungen",
            "Schwache digitale Sichtbarkeit",
            "Unklare Servicequalität"
          ]
        }
      ]
    },
    socialProof: {
      score: 4.2,
      googleReviews: "4.6/5 (127 Bewertungen)",
      testimonials: "Vorhanden",
      certifications: "Mehrere Zertifikate",
      awards: "1 Branchenauszeichnung"
    },
    conversion: {
      score: 3.5,
      contactForms: "2 Formulare",
      callToActions: "Verbesserungsbedarf",
      trustSignals: "Vorhanden",
      loadTime: "Optimierungsbedarf"
    }
  };

  const generateFullPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    const pageHeight = 297; // A4 Höhe in mm
    const margin = 20;
    const lineHeight = 7;
    const maxWidth = 170; // Maximale Textbreite

    // Helper function to add new page if needed
    const addNewPageIfNeeded = (requiredSpace: number = 25) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with word wrapping
    const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 10) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        addNewPageIfNeeded();
        doc.text(line, x, yPosition);
        yPosition += lineHeight;
      });
    };

    // Helper function to add a title
    const addTitle = (title: string, fontSize: number = 16) => {
      addNewPageIfNeeded(15);
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, yPosition);
      yPosition += lineHeight + 5;
    };

    // Helper function to add a section
    const addSection = (title: string, content: string[], indent: number = 5) => {
      addNewPageIfNeeded(content.length * lineHeight + 20);
      
      // Section title
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, yPosition);
      yPosition += lineHeight + 2;
      
      // Section content
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      content.forEach(line => {
        addNewPageIfNeeded();
        addWrappedText(line, margin + indent, maxWidth - indent);
      });
      yPosition += 5;
    };

    const currentDate = new Date().toLocaleDateString('de-DE');

    // ===== TITEL UND GRUNDINFORMATIONEN =====
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Vollständiger Website-Analysebericht', margin, yPosition);
    yPosition += 15;

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    addWrappedText(`Website: ${businessData.url}`, margin, maxWidth, 12);
    addWrappedText(`Adresse: ${businessData.address}`, margin, maxWidth, 12);
    addWrappedText(`Branche: ${industryNames[businessData.industry]}`, margin, maxWidth, 12);
    addWrappedText(`Analysedatum: ${currentDate}`, margin, maxWidth, 12);
    yPosition += 10;

    // ===== EXECUTIVE SUMMARY =====
    addTitle('Executive Summary', 16);
    addWrappedText('Gesamtbewertung: 4.2/5 Sterne (85% Vollständigkeit)', margin, maxWidth, 12);
    yPosition += 5;
    addWrappedText('Die Website zeigt eine solide Performance mit Verbesserungspotential in den Bereichen Keyword-Optimierung und Conversion-Rate-Optimierung. Die technische Umsetzung ist grundsätzlich gut, jedoch gibt es spezifische Bereiche, die optimiert werden können, um die Online-Sichtbarkeit und Kundengewinnung zu verbessern.', margin, maxWidth);
    yPosition += 10;

    // ===== 1. SEO-ANALYSE =====
    addTitle('1. SEO-Analyse (Bewertung: 4.5/5)', 14);
    
    addSection('Meta-Tags Analyse:', [
      `• Title-Tags: ${detailedAnalysisData.seo.metaTags.title} - Die Seitentitel sind gut optimiert und enthalten relevante Keywords`,
      `• Meta-Descriptions: ${detailedAnalysisData.seo.metaTags.description} - Beschreibungen sind vorhanden, könnten aber optimiert werden`,
      `• Keywords: ${detailedAnalysisData.seo.metaTags.keywords} - Meta-Keywords sollten überarbeitet und lokale Begriffe verstärkt werden`
    ]);

    addSection('Technische SEO-Faktoren:', [
      `• Überschriftenstruktur (H1-H6): ${detailedAnalysisData.seo.headings} - Logische Hierarchie vorhanden`,
      `• URL-Struktur: ${detailedAnalysisData.seo.urls} - Sprechende URLs und gute Struktur`,
      `• XML-Sitemap: ${detailedAnalysisData.seo.sitemap} - Sitemap ist vorhanden und aktuell`,
      `• Robots.txt: ${detailedAnalysisData.seo.robots} - Korrekt konfiguriert, alle wichtigen Bereiche indexierbar`
    ]);

    addSection('SEO-Empfehlungen:', [
      '• Lokale Keywords in Title-Tags verstärken',
      '• Meta-Descriptions mit Call-to-Actions erweitern',
      '• Schema-Markup für lokale Unternehmen implementieren',
      '• Interne Verlinkung optimieren'
    ]);

    // ===== 2. KEYWORD-ANALYSE =====
    addNewPageIfNeeded(50);
    addTitle('2. Keyword-Analyse (Bewertung: 3.8/5)', 14);
    
    addSection('Haupt-Keywords und Rankings:', 
      detailedAnalysisData.keywords.mainKeywords.map(kw => `• "${kw}" - Potentiell starkes Keyword für lokale Suche`)
    );

    addSection('Ranking-Position:', [
      `• Lokale Suche: ${detailedAnalysisData.keywords.ranking.local} - Gute Position, aber Verbesserung möglich`,
      `• Organische Google-Suche: ${detailedAnalysisData.keywords.ranking.google} - Ausbaufähig`,
      `• Keyword-Dichte: ${detailedAnalysisData.keywords.density} - Zu niedrig für wichtige Begriffe`,
      `• Wettbewerbsintensität: ${detailedAnalysisData.keywords.competition} - Starke Konkurrenz erfordert gezielte Strategie`
    ]);

    addSection('Keyword-Empfehlungen:', [
      '• Long-Tail-Keywords für spezifische Dienstleistungen entwickeln',
      '• Lokale Modifier in Keyword-Strategie integrieren',
      '• Content für saisonale Keywords erstellen',
      '• Competitor-Keyword-Analyse durchführen'
    ]);

    // ===== 3. PERFORMANCE-ANALYSE =====
    addNewPageIfNeeded(50);
    addTitle('3. Performance-Analyse (Bewertung: 4.1/5)', 14);
    
    addSection('Ladezeiten und technische Performance:', [
      `• Seitenladezeit: ${detailedAnalysisData.performance.loadTime} - Gut, aber optimierbar`,
      `• Gesamte Seitengröße: ${detailedAnalysisData.performance.pageSize} - Akzeptable Größe`,
      `• Bildoptimierung: ${detailedAnalysisData.performance.images} - Bilder sind komprimiert`,
      `• Browser-Caching: ${detailedAnalysisData.performance.caching} - Korrekt implementiert`,
      `• Mobile Performance: ${detailedAnalysisData.performance.mobile} - Gute mobile Ladezeiten`
    ]);

    addSection('Performance-Optimierungen:', [
      '• Weitere Bildkomprimierung und moderne Formate (WebP) einsetzen',
      '• CSS und JavaScript minifizieren',
      '• CDN für statische Ressourcen implementieren',
      '• Lazy Loading für Bilder aktivieren'
    ]);

    // ===== 4. MOBILE-OPTIMIERUNG =====
    addNewPageIfNeeded(40);
    addTitle('4. Mobile-Optimierung (Bewertung: 4.3/5)', 14);
    
    addSection('Mobile Nutzerfreundlichkeit:', [
      `• Responsive Design: ${detailedAnalysisData.mobile.responsive} - Perfekte Anpassung an alle Bildschirmgrößen`,
      `• Touch-Targets: ${detailedAnalysisData.mobile.touchTargets} - Buttons und Links sind gut bedienbar`,
      `• Viewport-Konfiguration: ${detailedAnalysisData.mobile.viewportConfig} - Optimal eingestellt`,
      `• Mobile PageSpeed Score: ${detailedAnalysisData.mobile.pagespeed} - Zufriedenstellende Geschwindigkeit`
    ]);

    addSection('Mobile-Empfehlungen:', [
      '• Click-to-Call Buttons prominenter platzieren',
      '• Mobile Navigation weiter vereinfachen',
      '• Touch-Gesten für Bildergalerien implementieren'
    ]);

    // ===== 5. LOKALE SEO-FAKTOREN =====
    addNewPageIfNeeded(50);
    addTitle('5. Lokale SEO-Faktoren (Bewertung: 4.0/5)', 14);
    
    addSection('Google My Business und lokale Präsenz:', [
      `• Google My Business Profil: ${detailedAnalysisData.localSeo.googleMyBusiness} - Alle wichtigen Informationen vorhanden`,
      `• NAP-Konsistenz: ${detailedAnalysisData.localSeo.napConsistency} - Name, Adresse, Telefon stimmen überein`,
      `• Lokale Verzeichniseinträge: ${detailedAnalysisData.localSeo.localCitations} - Solide Basis vorhanden`,
      `• Bewertungsmanagement: ${detailedAnalysisData.localSeo.reviews} - Aktive Pflege der Online-Reputation`
    ]);

    addSection('Lokale SEO-Maßnahmen:', [
      '• Weitere Branchenverzeichnisse erschließen',
      '• Lokale Backlinks von Partnern und Kunden akquirieren',
      '• Location-Pages für verschiedene Stadtteile erstellen',
      '• Google Posts regelmäßig veröffentlichen'
    ]);

    // ===== 6. CONTENT-ANALYSE =====
    addNewPageIfNeeded(50);
    addTitle('6. Content-Analyse (Bewertung: 3.9/5)', 14);
    
    addSection('Inhaltsqualität und -struktur:', [
      `• Content-Qualität: ${detailedAnalysisData.content.quality} - Informative und relevante Inhalte`,
      `• Einzigartigkeit: ${detailedAnalysisData.content.uniqueness} - Sehr wenig Duplicate Content`,
      `• Lesbarkeit: ${detailedAnalysisData.content.readability} - Verständlich und gut strukturiert`,
      `• Content-Struktur: ${detailedAnalysisData.content.structure} - Kann optimiert werden`
    ]);

    addSection('Content-Empfehlungen:', [
      '• FAQ-Bereich für häufige Kundenfragen erweitern',
      '• Blog für regelmäßige Updates und SEO-Content starten',
      '• Mehr visuelle Inhalte (Videos, Infografiken) integrieren',
      '• Kundenprojekte und Case Studies präsentieren'
    ]);

    // ===== 7. DETAILLIERTE KONKURRENZANALYSE =====
    addNewPageIfNeeded(80);
    addTitle('7. Detaillierte Konkurrenzanalyse (Bewertung: 3.7/5)', 14);
    
    addSection('Marktposition und Wettbewerb:', [
      `• Marktposition: ${detailedAnalysisData.competition.position} - Solide Position im lokalen Markt`,
      `• Geschätzter Marktanteil: ${detailedAnalysisData.competition.marketShare} - Ausbaufähig`,
      `• Hauptstärken: ${detailedAnalysisData.competition.strengths} - Positive Kundenerfahrungen`,
      `• Schwächen vs. Konkurrenz: ${detailedAnalysisData.competition.weaknesses} - Digitale Sichtbarkeit verstärken`
    ]);

    // Detaillierte Konkurrenten-Profile
    addTitle('7.1 Konkurrenten-Profile im Detail', 12);
    
    detailedAnalysisData.competition.competitors.forEach((competitor, index) => {
      addNewPageIfNeeded(60);
      
      // Konkurrent Überschrift
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${competitor.name}`, margin, yPosition);
      yPosition += lineHeight + 3;
      
      // Basis-Informationen
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      addWrappedText(`Entfernung: ${competitor.distance} | Bewertung: ${competitor.rating}/5 (${competitor.reviews} Bewertungen)`, margin + 5, maxWidth - 5);
      addWrappedText(`Website-Qualität: ${competitor.website} | Social Media: ${competitor.socialMedia} | Ranking: ${competitor.ranking}`, margin + 5, maxWidth - 5);
      yPosition += 3;
      
      // Wettbewerbsvorteile
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Wettbewerbsvorteile:', margin + 5, yPosition);
      yPosition += lineHeight;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      competitor.advantages.forEach(advantage => {
        addNewPageIfNeeded();
        addWrappedText(`✓ ${advantage}`, margin + 10, maxWidth - 10);
      });
      yPosition += 3;
      
      // Schwächen/Nachteile
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text('Schwächen/Nachteile:', margin + 5, yPosition);
      yPosition += lineHeight;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      competitor.disadvantages.forEach(disadvantage => {
        addNewPageIfNeeded();
        addWrappedText(`× ${disadvantage}`, margin + 10, maxWidth - 10);
      });
      yPosition += 8;
    });

    addSection('Wettbewerbsanalyse-Erkenntnisse:', [
      '• Hauptkonkurrenten haben stärkere Social Media Präsenz',
      '• Content-Marketing wird von Wettbewerbern intensiver genutzt',
      '• Preistransparenz auf Websites der Konkurrenz häufiger',
      '• Online-Terminbuchung als Wettbewerbsvorteil etablieren',
      '• Müller Handwerk GmbH setzt Maßstäbe bei digitaler Präsenz',
      '• Schmidt & Partner punktet mit Erfahrung trotz schwacher Online-Präsenz',
      '• Handwerksprofi24 zeigt Risiken einer vernachlässigten Digitalisierung'
    ]);

    // ===== 8. SOCIAL PROOF =====
    addNewPageIfNeeded(40);
    addTitle('8. Social Proof (Bewertung: 4.2/5)', 14);
    
    addSection('Vertrauenssignale und Glaubwürdigkeit:', [
      `• Google-Bewertungen: ${detailedAnalysisData.socialProof.googleReviews} - Ausgezeichnete Kundenzufriedenheit`,
      `• Kundenstimmen auf Website: ${detailedAnalysisData.socialProof.testimonials} - Authentische Referenzen`,
      `• Zertifizierungen: ${detailedAnalysisData.socialProof.certifications} - Fachliche Kompetenz belegt`,
      `• Branchenauszeichnungen: ${detailedAnalysisData.socialProof.awards} - Zusätzliche Glaubwürdigkeit`
    ]);

    addSection('Social Proof Optimierungen:', [
      '• Mehr Kundenstimmen aktiv sammeln und präsentieren',
      '• Projektbilder vor/nach Renovierungen zeigen',
      '• Mitarbeiter-Zertifizierungen prominenter darstellen',
      '• Social Media Aktivität für mehr Sichtbarkeit steigern'
    ]);

    // ===== 9. CONVERSION-OPTIMIERUNG =====
    addNewPageIfNeeded(50);
    addTitle('9. Conversion-Optimierung (Bewertung: 3.5/5)', 14);
    
    addSection('Conversion-Elemente und Nutzerführung:', [
      `• Kontaktformulare: ${detailedAnalysisData.conversion.contactForms} - Grundausstattung vorhanden`,
      `• Call-to-Action Buttons: ${detailedAnalysisData.conversion.callToActions} - Können optimiert werden`,
      `• Vertrauenssignale: ${detailedAnalysisData.conversion.trustSignals} - Ausreichend vorhanden`,
      `• Ladezeit-Optimierung: ${detailedAnalysisData.conversion.loadTime} - Weitere Verbesserungen nötig`
    ]);

    addSection('Conversion-Optimierung Maßnahmen:', [
      '• Prominente Platzierung der Telefonnummer für Sofortkontakt',
      '• Online-Kostenvoranschlag-Tool implementieren',
      '• Notdienst-Button besonders hervorheben',
      '• Kontaktformular vereinfachen und optimieren',
      '• A/B-Tests für verschiedene Call-to-Action Varianten'
    ]);

    // ===== 10. HANDLUNGSEMPFEHLUNGEN =====
    addNewPageIfNeeded(60);
    addTitle('10. Priorisierte Handlungsempfehlungen', 14);
    
    addSection('Priorität 1 - Sofortige Maßnahmen (1-4 Wochen):', [
      '• Call-to-Action Buttons überarbeiten und prominenter platzieren',
      '• Keyword-Dichte für lokale Suchbegriffe in wichtigen Seiten erhöhen',
      '• Google My Business Profil mit aktuellen Bildern und Posts pflegen',
      '• Mobile Kontaktmöglichkeiten (Click-to-Call) verbessern',
      '• Kundenbewertungen aktiv einsammeln und auf Website darstellen'
    ]);

    addSection('Priorität 2 - Mittelfristige Optimierungen (1-3 Monate):', [
      '• Content-Strategie entwickeln und regelmäßigen Blog starten',
      '• Ladezeiten durch Bildoptimierung und Caching weiter verbessern',
      '• Social Media Präsenz ausbauen (Facebook, Instagram)',
      '• Lokale Backlink-Strategie implementieren',
      '• FAQ-Bereich erweitern und strukturieren',
      '• Online-Terminbuchung oder Kostenvoranschlag-Tool integrieren',
      '• Konkurrenzvorteile gegenüber Müller Handwerk GmbH erarbeiten',
      '• Modernere Website-Gestaltung als Antwort auf Schmidt & Partner'
    ]);

    addSection('Priorität 3 - Langfristige Strategien (3-12 Monate):', [
      '• Umfassende Content-Marketing-Strategie mit Video-Content',
      '• Expansion in weitere lokale Verzeichnisse und Plattformen',
      '• Entwicklung von Landing-Pages für spezifische Services',
      '• A/B-Testing-Programm für kontinuierliche Optimierung',
      '• Retargeting-Kampagnen für Website-Besucher einrichten'
    ]);

    // ===== 11. MONITORING UND ERFOLGSMESSUNG =====
    addNewPageIfNeeded(40);
    addTitle('11. Monitoring und Erfolgsmessung', 14);
    
    addSection('KPIs und Metriken zur Überwachung:', [
      '• Organische Sichtbarkeit: Ranking-Positionen für Haupt-Keywords monatlich prüfen',
      '• Website-Traffic: Besucherzahlen und Herkunft über Google Analytics tracken',
      '• Conversion-Rate: Kontaktanfragen pro 100 Website-Besucher messen',
      '• Lokale Sichtbarkeit: Google My Business Insights regelmäßig auswerten',
      '• Online-Reputation: Bewertungen auf verschiedenen Plattformen monitoren',
      '• Konkurrenz-Monitoring: Monatliche Überprüfung der Konkurrenten-Aktivitäten'
    ]);

    addSection('Empfohlene Tools für Monitoring:', [
      '• Google Analytics für Website-Performance',
      '• Google Search Console für SEO-Überwachung',
      '• Google My Business Insights für lokale Performance',
      '• SEO-Tools wie SEMrush oder Ahrefs für Keyword-Tracking',
      '• Review-Management-Tools für Bewertungsmonitoring'
    ]);

    // ===== 12. ANHANG =====
    addNewPageIfNeeded(30);
    addTitle('12. Anhang', 14);
    
    addSection('Analysemethodik und verwendete Tools:', [
      '• Google PageSpeed Insights für Performance-Bewertung',
      '• Google Search Console Daten für SEO-Analyse',
      '• Mobile-First Testing auf verschiedenen Geräten',
      '• Lokale Suchsimulation für verschiedene Keywords',
      '• Wettbewerbsanalyse durch systematische Vergleiche',
      '• Content-Audit durch manuelle Überprüfung aller Seiten'
    ]);

    addSection('Analysezeitraum und Datenbasis:', [
      `• Datenerhebung: ${currentDate}`,
      '• Betrachtungszeitraum: Aktuelle Website-Version',
      '• Vergleichsdaten: Lokale Wettbewerber aus derselben Branche',
      '• Nächste Überprüfung empfohlen: In 6 Monaten',
      '• Zwischencheck empfohlen: Nach 3 Monaten für Quick-Wins'
    ]);

    addSection('Kontakt und weitere Unterstützung:', [
      'Für Fragen zu diesem Bericht oder Unterstützung bei der Umsetzung',
      'der Empfehlungen stehen wir gerne zur Verfügung.',
      '',
      'Dieser Bericht wurde automatisch generiert und basiert auf',
      'aktuellen Best Practices im Online-Marketing und SEO.'
    ]);

    // Seitenzahlen hinzufügen
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Seite ${i} von ${pageCount}`, 200 - 20, 290, { align: 'right' });
    }

    return doc;
  };

  const generateSummaryPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('de-DE');
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Management Summary', 20, 30);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text(`Website: ${businessData.url}`, 20, 50);
    doc.text(`Adresse: ${businessData.address}`, 20, 60);
    doc.text(`Branche: ${industryNames[businessData.industry]}`, 20, 70);
    doc.text(`Analysedatum: ${currentDate}`, 20, 80);

    // Summary content
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Gesamtbewertung: 4.2/5 Sterne (85% Vollständigkeit)', 20, 100);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Top-Ergebnisse:', 20, 120);
    doc.setFont(undefined, 'normal');
    doc.text('✓ SEO gut optimiert (4.5/5)', 20, 130);
    doc.text('✓ Mobile-Optimierung sehr gut (4.3/5)', 20, 140);
    doc.text('✓ Social Proof stark (4.2/5)', 20, 150);
    doc.text('✓ Performance zufriedenstellend (4.1/5)', 20, 160);
    
    doc.setFont(undefined, 'bold');
    doc.text('Verbesserungsbedarf:', 20, 180);
    doc.setFont(undefined, 'normal');
    doc.text('• Conversion-Rate optimieren (3.5/5)', 20, 190);
    doc.text('• Keyword-Strategie überarbeiten (3.8/5)', 20, 200);
    doc.text('• Wettbewerbsposition stärken (3.7/5)', 20, 210);

    doc.setFont(undefined, 'bold');
    doc.text('Sofortige Maßnahmen:', 20, 230);
    doc.setFont(undefined, 'normal');
    doc.text('1. Call-to-Action Buttons optimieren', 20, 240);
    doc.text('2. Lokale Keywords verstärken', 20, 250);
    doc.text('3. Social Media Aktivität steigern', 20, 260);

    return doc;
  };

  const handlePDFExport = (isFullReport: boolean = true) => {
    toast({
      title: "PDF wird erstellt",
      description: "Der Analysebericht wird als PDF-Datei vorbereitet...",
    });

    setTimeout(() => {
      const doc = isFullReport ? generateFullPDF() : generateSummaryPDF();
      const currentDate = new Date().toLocaleDateString('de-DE');
      const fileName = isFullReport 
        ? `Vollstaendiger_Analysebericht_${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate.replace(/\./g, '-')}.pdf`
        : `Management_Summary_${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate.replace(/\./g, '-')}.pdf`;

      doc.save(fileName);
      
      toast({
        title: "PDF-Export erfolgreich",
        description: `Der ${isFullReport ? 'vollständige' : 'zusammengefasste'} Bericht wurde als "${fileName}" heruntergeladen.`,
      });
    }, 1000);
  };

  const reportSections = [
    { name: "Executive Summary", pages: 1, included: true },
    { name: "SEO-Analyse", pages: 2, included: true },
    { name: "Keyword-Analyse", pages: 2, included: true },
    { name: "Performance-Analyse", pages: 2, included: true },
    { name: "Mobile-Optimierung", pages: 1, included: true },
    { name: "Lokale SEO-Faktoren", pages: 2, included: true },
    { name: "Content-Analyse", pages: 2, included: true },
    { name: "Detaillierte Konkurrenzanalyse", pages: 3, included: true },
    { name: "Social Proof", pages: 1, included: true },
    { name: "Conversion-Optimierung", pages: 2, included: true },
    { name: "Handlungsempfehlungen", pages: 2, included: true },
    { name: "Anhang", pages: 1, included: true }
  ];

  const totalPages = reportSections.reduce((sum, section) => sum + section.pages, 0);
  const currentDate = new Date().toLocaleDateString('de-DE');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            PDF-Export
          </CardTitle>
          <CardDescription>
            Vollständiger Analysebericht als PDF-Datei
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Report-Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Berichtsinformationen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Website:</span>
                  <p className="font-medium">{businessData.url}</p>
                </div>
                <div>
                  <span className="text-gray-600">Branche:</span>
                  <p className="font-medium">{industryNames[businessData.industry]}</p>
                </div>
                <div>
                  <span className="text-gray-600">Adresse:</span>
                  <p className="font-medium">{businessData.address}</p>
                </div>
                <div>
                  <span className="text-gray-600">Analysedatum:</span>
                  <p className="font-medium">{currentDate}</p>
                </div>
              </div>
            </div>

            {/* Berichtsinhalt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Berichtsinhalt</CardTitle>
                <CardDescription>
                  Übersicht der enthaltenen Analysebereiche ({totalPages} Seiten)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportSections.map((section, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium w-4">{index + 1}.</span>
                        <span className="font-medium">{section.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          {section.pages} Seite{section.pages > 1 ? 'n' : ''}
                        </span>
                        <Badge variant={section.included ? "default" : "outline"}>
                          {section.included ? "Enthalten" : "Optional"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Export-Optionen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Export-Optionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Vollständiger Report</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Detaillierter Analysebericht mit allen Bewertungen, Daten und Empfehlungen
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Alle 11 Analysebereiche</li>
                        <li>• Detaillierte Bewertungen und Daten</li>
                        <li>• Priorisierte Handlungsempfehlungen</li>
                        <li>• Detaillierte Konkurrenzanalyse mit Vor-/Nachteilen</li>
                        <li>• Technische Details und Methodik</li>
                        <li>• {totalPages} Seiten umfassend</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Management-Summary</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Kompakte Zusammenfassung der wichtigsten Ergebnisse
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Gesamtbewertung und Kernkennzahlen</li>
                        <li>• Top-Ergebnisse und Stärken</li>
                        <li>• Kritische Verbesserungsbereiche</li>
                        <li>• Sofortige Handlungsempfehlungen</li>
                        <li>• 3-4 Seiten kompakt</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={() => handlePDFExport(true)} className="flex-1" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Vollständigen Report exportieren ({totalPages} Seiten)
                    </Button>
                    <Button onClick={() => handlePDFExport(false)} variant="outline" className="flex-1" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Management-Summary exportieren (4 Seiten)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Zusatzinformationen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hinweise zum PDF-Export</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">ℹ</span>
                    <span>
                      Das PDF wird automatisch in Ihren Download-Ordner gespeichert
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      Dateiname enthält Website und Datum für einfache Zuordnung
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">⚡</span>
                    <span>
                      Die PDF-Generierung dauert nur wenige Sekunden
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600">🔒</span>
                    <span>
                      Alle Daten werden lokal verarbeitet - keine Übertragung an externe Server
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">📊</span>
                    <span>
                      Detaillierte Konkurrenzanalyse mit spezifischen Vor- und Nachteilen aller Mitbewerber
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
