
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface PDFExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
}

const PDFExport: React.FC<PDFExportProps> = ({ businessData, realData }) => {
  const handleExport = () => {
    // Hier würde normalerweise ein PDF generiert werden
    console.log('Exporting PDF with real data for:', realData.company.name);
    alert('PDF-Export würde hier die echten Analysedaten enthalten');
  };

  const overallScore = Math.round(
    (realData.seo.score + realData.performance.score + realData.imprint.score) / 3
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            PDF-Export der Echten Analysedaten
          </CardTitle>
          <CardDescription>
            Vollständiger Bericht basierend auf der Live-Analyse von {realData.company.url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Analyse-Zusammenfassung */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Bericht enthält:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Technische Analyse:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• SEO-Bewertung: {realData.seo.score}/100</li>
                    <li>• Performance: {realData.performance.score}/100</li>
                    <li>• Keywords: {realData.keywords.filter(k => k.found).length}/{realData.keywords.length} gefunden</li>
                    <li>• Impressum: {realData.imprint.score}/100</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Datenquellen:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Live Website-Crawling</li>
                    <li>• Echte Performance-Messung</li>
                    <li>• Automatische Keyword-Erkennung</li>
                    <li>• Rechtsprüfung Impressum</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Firmeninformationen */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Analysierte Firma:</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Name:</strong> {realData.company.name}</p>
                <p><strong>Website:</strong> {realData.company.url}</p>
                <p><strong>Adresse:</strong> {realData.company.address}</p>
                <p><strong>Branche:</strong> {realData.company.industry}</p>
                <p><strong>Gesamtbewertung:</strong> {overallScore}/100 Punkte</p>
              </div>
            </div>

            {/* Export Button */}
            <div className="text-center">
              <Button onClick={handleExport} size="lg" className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                PDF-Bericht mit Echtdaten herunterladen
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Der Bericht enthält alle echten Analysedaten, die von der Website abgerufen wurden
              </p>
            </div>

            {/* Hinweis */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✓ Authentische Datenanalyse</h4>
              <p className="text-sm text-green-700">
                Dieser Bericht basiert auf einer echten Analyse Ihrer Website {realData.company.url}. 
                Alle Daten wurden live abgerufen und sind zum Zeitpunkt der Analyse aktuell.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
