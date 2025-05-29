
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FileText, Download } from 'lucide-react';

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

  const handlePDFExport = () => {
    // Simuliere PDF-Export
    toast({
      title: "PDF wird erstellt",
      description: "Der Analysebericht wird als PDF-Datei vorbereitet...",
    });

    // Simuliere Verarbeitungszeit
    setTimeout(() => {
      toast({
        title: "PDF-Export erfolgreich",
        description: "Der Analysebericht wurde als PDF-Datei gespeichert.",
      });
    }, 2000);
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
                    <Button onClick={handlePDFExport} className="flex-1" size="lg">
                      <Download className="h-4 w-4 mr-2" />
                      Vollständigen Report exportieren
                    </Button>
                    <Button onClick={handlePDFExport} variant="outline" className="flex-1" size="lg">
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
                      Der PDF-Report enthält alle aktuellen Analysedaten vom {currentDate}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>
                      Hochauflösende Grafiken und Diagramme für professionelle Präsentation
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">⚡</span>
                    <span>
                      Die PDF-Generierung kann bei umfangreichen Berichten einige Sekunden dauern
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
