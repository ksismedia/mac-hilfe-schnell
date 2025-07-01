
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import HTMLExport from './HTMLExport';
import CustomerHTMLExport from './CustomerHTMLExport';
import HourlyRateInput from './HourlyRateInput';
import { Users, FileText } from 'lucide-react';

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
    <div className="space-y-4">
      <div className="mb-6">
        <HourlyRateInput 
          data={hourlyRateData}
          onDataChange={handleHourlyRateChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Users className="h-5 w-5" />
              Kunden-Report
            </CardTitle>
            <CardDescription>
              Professioneller Report für Kundenpräsentationen
            </CardDescription>
          </CardHeader>
          <CardContent>
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

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <FileText className="h-5 w-5" />
              Technischer Report
            </CardTitle>
            <CardDescription>
              Detaillierte Analyse für interne Zwecke
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
      </div>
    </div>
  );
};

export default PDFExport;
