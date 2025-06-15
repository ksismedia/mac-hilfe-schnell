
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import HTMLExport from './HTMLExport';
import CustomerHTMLExport from './CustomerHTMLExport';
import HourlyRateInput from './HourlyRateInput';
import { FileText, Download, Users, Euro } from 'lucide-react';

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
      {/* Stundensatz-Eingabe */}
      <HourlyRateInput 
        data={hourlyRateData}
        onDataChange={handleHourlyRateChange}
      />

      {/* Interner HTML-Export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Detaillierte Analyse (Intern)
          </CardTitle>
          <CardDescription>
            Vollständiger technischer Report mit allen Details für interne Zwecke
          </CardDescription>
        </CardHeader>
        <CardContent>
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

      {/* Kunden-HTML-Export */}
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
  );
};

export default PDFExport;
