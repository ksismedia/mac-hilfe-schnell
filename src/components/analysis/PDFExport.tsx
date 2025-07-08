import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, CompanyServices, CompetitorServices } from '@/hooks/useManualData';
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
  competitorServices?: CompetitorServices;
  companyServices?: CompanyServices;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
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
  competitorServices = {},
  companyServices,
  manualKeywordData,
  keywordScore
}) => {
  const [hourlyRateData, setHourlyRateData] = useState<HourlyRateData>();

  const handleHourlyRateChange = (data: HourlyRateData) => {
    setHourlyRateData(data);
  };
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Konfiguration */}
      <Card>
        <CardHeader>
          <CardTitle>Stundensatz-Konfiguration</CardTitle>
          <CardDescription>Geben Sie Ihren Stundensatz für die Kalkulation ein</CardDescription>
        </CardHeader>
        <CardContent>
          <HourlyRateInput 
            data={hourlyRateData}
            onDataChange={handleHourlyRateChange}
          />
        </CardContent>
      </Card>

      {/* Kunden-Report */}
      <Card>
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
            companyServices={companyServices}
            hourlyRateData={hourlyRateData}
            manualKeywordData={manualKeywordData}
            keywordScore={keywordScore}
          />
        </CardContent>
      </Card>

      {/* Technischer Report */}
      <Card>
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
            companyServices={companyServices}
            hourlyRateData={hourlyRateData}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
