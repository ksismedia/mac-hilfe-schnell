
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import HTMLExport from './HTMLExport';
import CustomerHTMLExport from './CustomerHTMLExport';
import HourlyRateInput from './HourlyRateInput';
import { FileText, Download, Users, Euro, Settings } from 'lucide-react';

interface PDFExportProps {
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
}

interface HourlyRateData {
  ownRate: number;
  regionAverage: number;
}

const PDFExport: React.FC<PDFExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualCompetitors = [],
  competitorServices = {}
}) => {
  const [hourlyRateData, setHourlyRateData] = useState<HourlyRateData>();

  const handleHourlyRateChange = (data: HourlyRateData) => {
    setHourlyRateData(data);
  };
  
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl text-blue-800">
            <FileText className="h-8 w-8" />
            Report-Export Center
          </CardTitle>
          <CardDescription className="text-lg text-blue-600">
            Generieren Sie professionelle Analyseberichte für verschiedene Anwendungszwecke
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Configuration Section */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Settings className="h-5 w-5" />
            Konfiguration
          </CardTitle>
          <CardDescription className="text-orange-600">
            Ergänzen Sie zusätzliche Daten für eine vollständige Analyse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <HourlyRateInput 
            data={hourlyRateData}
            onDataChange={handleHourlyRateChange}
          />
        </CardContent>
      </Card>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Report */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Users className="h-6 w-6" />
              Kunden-Report
            </CardTitle>
            <CardDescription className="text-green-600">
              Professioneller Report für Kundenpräsentationen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">✨ Optimiert für Kunden:</h4>
                <ul className="text-sm space-y-1 text-green-700">
                  <li>• Anonymisierte Konkurrenzanalyse</li>
                  <li>• Grafische Fortschrittsbalken</li>
                  <li>• Professionelles Design</li>
                  <li>• Verständliche Sprache</li>
                  <li>• Detaillierte Impressum-Analyse</li>
                  <li>• Strategische Empfehlungen</li>
                </ul>
              </div>
              
              <CustomerHTMLExport 
                businessData={businessData}
                realData={realData}
                manualImprintData={manualImprintData}
                manualSocialData={manualSocialData}
                manualCompetitors={manualCompetitors}
                competitorServices={competitorServices}
                hourlyRateData={hourlyRateData}
              />
            </div>
          </CardContent>
        </Card>

        {/* Technical Report */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Download className="h-6 w-6" />
              Technischer Report
            </CardTitle>
            <CardDescription className="text-blue-600">
              Detaillierte Analyse für interne Zwecke
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🔧 Für interne Analyse:</h4>
                <ul className="text-sm space-y-1 text-blue-700">
                  <li>• Vollständige technische Details</li>
                  <li>• Konkurrenten-Namen sichtbar</li>
                  <li>• Detaillierte Metriken</li>
                  <li>• Debugging-Informationen</li>
                  <li>• Rohdaten-Einblicke</li>
                  <li>• Erweiterte Analysedaten</li>
                </ul>
              </div>
              
              <HTMLExport 
                businessData={businessData}
                realData={realData}
                manualImprintData={manualImprintData}
                manualSocialData={manualSocialData}
                manualCompetitors={manualCompetitors}
                competitorServices={competitorServices}
                hourlyRateData={hourlyRateData}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Footer */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-800">Professionell</h4>
              <p className="text-sm text-gray-600">Hochwertige Reports für jeden Anwendungsfall</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-800">Kundenfreundlich</h4>
              <p className="text-sm text-gray-600">Verständliche Darstellung komplexer Daten</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Settings className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-800">Anpassbar</h4>
              <p className="text-sm text-gray-600">Individuelle Konfiguration für bessere Ergebnisse</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
