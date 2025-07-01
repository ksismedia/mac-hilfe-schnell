
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import HTMLExport from './HTMLExport';
import CustomerHTMLExport from './CustomerHTMLExport';
import HourlyRateInput from './HourlyRateInput';
import { FileText, Download, Users, Settings, Zap } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Report Export</h2>
        <p className="text-gray-600">Generieren Sie professionelle Analyseberichte</p>
      </div>

      {/* Configuration */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5 text-blue-600" />
            Konfiguration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HourlyRateInput 
            data={hourlyRateData}
            onDataChange={handleHourlyRateChange}
          />
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Report */}
        <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg text-green-700">
                <Users className="h-5 w-5" />
                Kunden-Report
              </CardTitle>
              <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                Empfohlen
              </div>
            </div>
            <CardDescription className="text-green-600">
              Professioneller Report für Kundenpräsentationen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Zap className="h-4 w-4" />
                <span>Kundenoptimierte Darstellung</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="h-4 w-4" />
                <span>Detaillierte Impressum-Analyse</span>
              </div>
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
          </CardContent>
        </Card>

        {/* Technical Report */}
        <Card className="border-2 border-gray-100 hover:border-gray-200 transition-colors">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg text-gray-700">
              <FileText className="h-5 w-5" />
              Technischer Report
            </CardTitle>
            <CardDescription className="text-gray-600">
              Detaillierte Analyse für interne Zwecke
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Download className="h-4 w-4" />
                <span>Vollständige Rohdaten</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Settings className="h-4 w-4" />
                <span>Technische Details</span>
              </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PDFExport;
