
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import { FileText, Users, ChartBar } from 'lucide-react';
import { generateCustomerHTML } from './export/htmlGenerator';

interface CustomerHTMLExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: any;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: { [competitorName: string]: string[] };
  hourlyRateData?: { ownRate: number; regionAverage: number };
}

const CustomerHTMLExport: React.FC<CustomerHTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualCompetitors = [],
  competitorServices = {},
  hourlyRateData
}) => {
  const generateCustomerReport = () => {
    const htmlContent = generateCustomerHTML({
      businessData,
      realData,
      manualCompetitors,
      competitorServices,
      hourlyRateData
    });

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Kundenfreundlicher HTML-Export
          </CardTitle>
          <CardDescription>
            Umfassende, professionelle Analyse für die Kundenpräsentation - mit Stundensatz-Bewertung und erweiterten Inhalten
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">✨ Kundenoptimiert:</h4>
              <ul className="text-sm space-y-1 text-blue-600">
                <li>• Anonymisierte Konkurrenzanalyse</li>
                <li>• Grafische Fortschrittsbalken (0-100%)</li>
                <li>• Professionelles Design</li>
                <li>• Verständliche Sprache</li>
                <li>• Strategische Empfehlungen</li>
                <li>• Stundensatz-Bewertung integriert</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">📊 Erweiterte Features:</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• Ausführliche Social Media Analyse</li>
                <li>• Detaillierte Performance-Metriken</li>
                <li>• Marktpositionierungs-Charts</li>
                <li>• Wachstumspotenzial-Aufzeigung</li>
                <li>• Kurz-/Mittel-/Langfrist-Roadmap</li>
                <li>• ROI-Potenzial-Berechnung</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={generateCustomerReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Erweiterten Kunden-Report generieren
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                generateCustomerReport();
                setTimeout(() => {
                  window.print();
                }, 1000);
              }}
              className="flex items-center gap-2"
            >
              <ChartBar className="h-4 w-4" />
              Report erstellen & drucken
            </Button>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Perfekt für professionelle Kundenpräsentationen:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Umfassend:</strong> 6 Hauptbereiche mit je 4 detaillierten Metriken</p>
              <p>• <strong>Stundensatz-Analyse:</strong> Vollständige Preisstrategie-Bewertung integriert</p>
              <p>• <strong>Visuell:</strong> Alle Werte als Fortschrittsbalken mit Farbkodierung</p>
              <p>• <strong>Strategisch:</strong> Kurz-, Mittel- und Langfrist-Empfehlungen</p>
              <p>• <strong>Wachstumsfokus:</strong> Potenzial-Aufzeigung mit konkreten Zahlen</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerHTMLExport;
