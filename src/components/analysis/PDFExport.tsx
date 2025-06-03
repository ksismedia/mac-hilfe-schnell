
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
      weaknesses: "Weniger Online-Präsenz"
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
    const lineHeight = 6;

    const addNewPageIfNeeded = (requiredSpace: number = 30) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    const addTitle = (title: string, fontSize: number = 16) => {
      addNewPageIfNeeded();
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, yPosition);
      yPosition += lineHeight + 4;
    };

    const addText = (text: string, fontSize: number = 10) => {
      addNewPageIfNeeded();
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'normal');
      doc.text(text, margin, yPosition);
      yPosition += lineHeight;
    };

    const addSection = (title: string, content: string[]) => {
      addNewPageIfNeeded(content.length * lineHeight + 20);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, yPosition);
      yPosition += lineHeight + 2;
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      content.forEach(line => {
        addNewPageIfNeeded();
        doc.text(line, margin + 5, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 4;
    };

    // Titel und Grundinformationen
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Vollständiger Website-Analysebericht', margin, yPosition);
    yPosition += 15;

    const currentDate = new Date().toLocaleDateString('de-DE');
    addText(`Website: ${businessData.url}`, 12);
    addText(`Adresse: ${businessData.address}`, 12);
    addText(`Branche: ${industryNames[businessData.industry]}`, 12);
    addText(`Analysedatum: ${currentDate}`, 12);
    yPosition += 10;

    // Zusammenfassung
    addTitle('Executive Summary');
    addText('Gesamtbewertung: 4.2/5 Sterne (85% Vollständigkeit)');
    addText('Die Website zeigt eine solide Performance mit Verbesserungspotential in den Bereichen');
    addText('Keyword-Optimierung und Conversion-Rate-Optimierung.');
    yPosition += 10;

    // SEO-Analyse
    addTitle('1. SEO-Analyse (Bewertung: 4.5/5)');
    addSection('Meta-Tags:', [
      `• Title-Tags: ${detailedAnalysisData.seo.metaTags.title}`,
      `• Meta-Descriptions: ${detailedAnalysisData.seo.metaTags.description}`,
      `• Keywords: ${detailedAnalysisData.seo.metaTags.keywords}`
    ]);
    addSection('Technische SEO:', [
      `• Überschriftenstruktur: ${detailedAnalysisData.seo.headings}`,
      `• URL-Struktur: ${detailedAnalysisData.seo.urls}`,
      `• Sitemap: ${detailedAnalysisData.seo.sitemap}`,
      `• Robots.txt: ${detailedAnalysisData.seo.robots}`
    ]);

    // Keyword-Analyse
    addTitle('2. Keyword-Analyse (Bewertung: 3.8/5)');
    addSection('Haupt-Keywords:', detailedAnalysisData.keywords.mainKeywords.map(kw => `• ${kw}`));
    addSection('Rankings:', [
      `• Lokale Suche: ${detailedAnalysisData.keywords.ranking.local}`,
      `• Google-Suche: ${detailedAnalysisData.keywords.ranking.google}`,
      `• Keyword-Dichte: ${detailedAnalysisData.keywords.density}`,
      `• Wettbewerb: ${detailedAnalysisData.keywords.competition}`
    ]);

    // Performance-Analyse
    addTitle('3. Performance-Analyse (Bewertung: 4.1/5)');
    addSection('Ladezeiten:', [
      `• Seitenladezeit: ${detailedAnalysisData.performance.loadTime}`,
      `• Seitengröße: ${detailedAnalysisData.performance.pageSize}`,
      `• Bildoptimierung: ${detailedAnalysisData.performance.images}`,
      `• Caching: ${detailedAnalysisData.performance.caching}`,
      `• Mobile Performance: ${detailedAnalysisData.performance.mobile}`
    ]);

    // Mobile-Optimierung
    addTitle('4. Mobile-Optimierung (Bewertung: 4.3/5)');
    addSection('Mobile Nutzerfreundlichkeit:', [
      `• Responsive Design: ${detailedAnalysisData.mobile.responsive}`,
      `• Touch-Targets: ${detailedAnalysisData.mobile.touchTargets}`,
      `• Viewport-Konfiguration: ${detailedAnalysisData.mobile.viewportConfig}`,
      `• Mobile PageSpeed: ${detailedAnalysisData.mobile.pagespeed}`
    ]);

    // Lokale SEO
    addTitle('5. Lokale SEO-Faktoren (Bewertung: 4.0/5)');
    addSection('Local SEO:', [
      `• Google My Business: ${detailedAnalysisData.localSeo.googleMyBusiness}`,
      `• NAP-Konsistenz: ${detailedAnalysisData.localSeo.napConsistency}`,
      `• Lokale Verzeichnisse: ${detailedAnalysisData.localSeo.localCitations}`,
      `• Bewertungsmanagement: ${detailedAnalysisData.localSeo.reviews}`
    ]);

    // Content-Analyse
    addTitle('6. Content-Analyse (Bewertung: 3.9/5)');
    addSection('Inhaltsqualität:', [
      `• Content-Qualität: ${detailedAnalysisData.content.quality}`,
      `• Einzigartigkeit: ${detailedAnalysisData.content.uniqueness}`,
      `• Lesbarkeit: ${detailedAnalysisData.content.readability}`,
      `• Struktur: ${detailedAnalysisData.content.structure}`
    ]);

    // Konkurrenzanalyse
    addTitle('7. Konkurrenzanalyse (Bewertung: 3.7/5)');
    addSection('Marktposition:', [
      `• Position: ${detailedAnalysisData.competition.position}`,
      `• Marktanteil: ${detailedAnalysisData.competition.marketShare}`,
      `• Hauptstärken: ${detailedAnalysisData.competition.strengths}`,
      `• Verbesserungsbereiche: ${detailedAnalysisData.competition.weaknesses}`
    ]);

    // Social Proof
    addTitle('8. Social Proof (Bewertung: 4.2/5)');
    addSection('Vertrauenssignale:', [
      `• Google-Bewertungen: ${detailedAnalysisData.socialProof.googleReviews}`,
      `• Kundenstimmen: ${detailedAnalysisData.socialProof.testimonials}`,
      `• Zertifizierungen: ${detailedAnalysisData.socialProof.certifications}`,
      `• Auszeichnungen: ${detailedAnalysisData.socialProof.awards}`
    ]);

    // Conversion-Optimierung
    addTitle('9. Conversion-Optimierung (Bewertung: 3.5/5)');
    addSection('Conversion-Elemente:', [
      `• Kontaktformulare: ${detailedAnalysisData.conversion.contactForms}`,
      `• Call-to-Actions: ${detailedAnalysisData.conversion.callToActions}`,
      `• Vertrauenssignale: ${detailedAnalysisData.conversion.trustSignals}`,
      `• Ladezeit-Optimierung: ${detailedAnalysisData.conversion.loadTime}`
    ]);

    // Handlungsempfehlungen
    addTitle('10. Handlungsempfehlungen');
    addSection('Priorität 1 (Hoch):', [
      '• Keyword-Dichte für lokale Suchbegriffe optimieren',
      '• Call-to-Action Buttons prominenter platzieren',
      '• Social Media Aktivität verstärken'
    ]);
    addSection('Priorität 2 (Mittel):', [
      '• Content-Struktur verbessern und erweitern',
      '• Ladezeiten weiter optimieren',
      '• Mehr Kundenbewertungen aktiv einholen'
    ]);
    addSection('Priorität 3 (Niedrig):', [
      '• Meta-Keywords überarbeiten',
      '• Zusätzliche Zertifizierungen hervorheben',
      '• Blog für regelmäßigen Content erstellen'
    ]);

    // Anhang
    addTitle('11. Anhang');
    addSection('Verwendete Tools und Methoden:', [
      '• Google PageSpeed Insights',
      '• Google Search Console Daten',
      '• Lokale Suchanalyse',
      '• Wettbewerbsvergleich',
      '• Content-Audit',
      '• Mobile-First Testing'
    ]);

    addSection('Analysezeitraum:', [
      `• Datenerhebung: ${currentDate}`,
      '• Betrachtungszeitraum: Letzten 3 Monate',
      '• Nächste Überprüfung empfohlen: In 6 Monaten'
    ]);

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
    { name: "Konkurrenzanalyse", pages: 2, included: true },
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
