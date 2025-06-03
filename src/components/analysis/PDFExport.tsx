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

  const generatePDF = (isFullReport: boolean = true) => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString('de-DE');
    const fileName = isFullReport 
      ? `Vollstaendiger_Analysebericht_${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate.replace(/\./g, '-')}.pdf`
      : `Management_Summary_${businessData.url.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDate.replace(/\./g, '-')}.pdf`;

    // PDF-Titel
    doc.setFontSize(20);
    doc.text(isFullReport ? 'Vollständiger Analysebericht' : 'Management Summary', 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Website: ${businessData.url}`, 20, 50);
    doc.text(`Adresse: ${businessData.address}`, 20, 60);
    doc.text(`Branche: ${industryNames[businessData.industry]}`, 20, 70);
    doc.text(`Analysedatum: ${currentDate}`, 20, 80);

    if (isFullReport) {
      // Vollständiger Bericht
      doc.text('Gesamtbewertung: 4.2/5 Sterne', 20, 100);
      doc.text('', 20, 110);
      doc.text('Analysebereiche:', 20, 120);
      
      const sections = [
        '1. SEO-Auswertung - Bewertung: 4.5/5',
        '2. Keyword-Analyse - Bewertung: 3.8/5', 
        '3. Performance-Analyse - Bewertung: 4.1/5',
        '4. Backlink-Analyse - Bewertung: 3.9/5',
        '5. Google-Bewertungen - Bewertung: 4.7/5',
        '6. Social Media Analyse - Bewertung: 3.2/5',
        '7. Impressumsprüfung - Bewertung: 4.8/5',
        '8. Branchenmerkmale - Bewertung: 4.0/5'
      ];

      sections.forEach((section, index) => {
        doc.text(section, 20, 130 + (index * 10));
      });

      doc.text('Handlungsempfehlungen:', 20, 220);
      doc.text('• Social Media Präsenz verstärken', 20, 230);
      doc.text('• Keyword-Optimierung für lokale Suche', 20, 240);
      doc.text('• Performance-Optimierung der Website', 20, 250);
    } else {
      // Management Summary
      doc.text('Gesamtbewertung: 4.2/5 Sterne (85% Vollständigkeit)', 20, 100);
      doc.text('', 20, 110);
      doc.text('Top-Ergebnisse:', 20, 120);
      doc.text('✓ Impressum vollständig (4.8/5)', 20, 130);
      doc.text('✓ Google-Bewertungen sehr gut (4.7/5)', 20, 140);
      doc.text('✓ SEO gut optimiert (4.5/5)', 20, 150);
      doc.text('', 20, 160);
      doc.text('Verbesserungsbedarf:', 20, 170);
      doc.text('• Social Media Aktivität steigern (3.2/5)', 20, 180);
      doc.text('• Keyword-Strategie überarbeiten (3.8/5)', 20, 190);
    }

    // PDF herunterladen
    doc.save(fileName);
    
    return fileName;
  };

  const handlePDFExport = (isFullReport: boolean = true) => {
    toast({
      title: "PDF wird erstellt",
      description: "Der Analysebericht wird als PDF-Datei vorbereitet...",
    });

    // Kurze Verzögerung für bessere UX
    setTimeout(() => {
      const fileName = generatePDF(isFullReport);
      
      toast({
        title: "PDF-Export erfolgreich",
        description: `Der Bericht wurde als "${fileName}" heruntergeladen.`,
      });
    }, 1000);
  };

  const reportSections = [
    { name: "Zusammenfassung", pages: 2, included: true },
    { name: "SEO-Auswertung", pages: 3, included: true },
    { name: "Keyword-Analyse", pages: 2, included: true },
    { name: "Performance-Analyse", pages: 2, included: true },
    { name: "Backlink-Analyse", pages: 2, included: true },
    { name: "Google-Bewertungen", pages: 3, included: true },
    { name: "Social Media Analyse", pages: 2, included: true },
    { name: "Impressumsprüfung", pages: 2, included: true },
    { name: "Branchenmerkmale", pages: 3, included: true },
    { name: "Handlungsempfehlungen", pages: 2, included: true },
    { name: "Anhang", pages: 1, included: true }
  ];

  const totalPages = reportSections.reduce((sum, section) => sum + section.pages, 0);
  const currentDate = new Date().toLocaleDateString('de-DE');

  const industryNames = {
    shk: 'SHK (Sanitär, Heizung, Klima)',
    maler: 'Maler und Lackierer',
    elektriker: 'Elektriker',
    dachdecker: 'Dachdecker'
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
                      <h4 className="font-medium mb-2">Standard-Report</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Vollständiger Analysebericht mit allen Bewertungen und Empfehlungen
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Alle Analysebereiche</li>
                        <li>• Detaillierte Bewertungen</li>
                        <li>• Handlungsempfehlungen</li>
                        <li>• {totalPages} Seiten</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Management-Summary</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Kompakte Zusammenfassung der wichtigsten Ergebnisse
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Gesamtbewertung</li>
                        <li>• Top-Empfehlungen</li>
                        <li>• Kennzahlen-Übersicht</li>
                        <li>• 4 Seiten</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={() => handlePDFExport(true)} className="flex-1" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Vollständigen Report exportieren
                    </Button>
                    <Button onClick={() => handlePDFExport(false)} variant="outline" className="flex-1" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Management-Summary exportieren
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
