
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import HTMLExport from './HTMLExport';
import { FileText, Download } from 'lucide-react';

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

const PDFExport: React.FC<PDFExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualCompetitors = [],
  competitorServices = {}
}) => {
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Analyse-Export
          </CardTitle>
          <CardDescription>
            Exportieren Sie die vollständige Analyse als druckoptimierte HTML-Datei
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
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
