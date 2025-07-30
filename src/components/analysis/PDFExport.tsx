import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, CompanyServices, CompetitorServices, useManualData } from '@/hooks/useManualData';
import HTMLExport from './HTMLExport';
import CustomerHTMLExport from './CustomerHTMLExport';
import { Users, FileText, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  deletedCompetitors?: Set<string>;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  staffQualificationData?: any;
}

const PDFExport: React.FC<PDFExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData,
  manualSocialData,
  manualCompetitors = [],
  competitorServices = {},
  companyServices,
  deletedCompetitors = new Set(),
  manualKeywordData,
  keywordScore,
  staffQualificationData
}) => {
  const { hourlyRateData } = useManualData();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Stundensatz-Warnung */}
      {!hourlyRateData && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Hinweis:</strong> Für vollständige Reports mit Kostenkalkulation muss ein Stundensatz 
            im "Preise"-Tab eingegeben werden. Ohne Stundensatz werden keine Bewertungen generiert.
          </AlertDescription>
        </Alert>
      )}

      {/* Export-Komponenten nur anzeigen wenn Stundensatz vorhanden */}
      {hourlyRateData ? (
        <>
          {/* Kunden-Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Kundenreport
              </CardTitle>
              <CardDescription>
                Professioneller Report für Ihre Kunden mit Handlungsempfehlungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerHTMLExport 
                businessData={businessData}
                realData={realData}
                manualImprintData={manualImprintData}
                manualSocialData={manualSocialData}
                manualWorkplaceData={null}
                manualCorporateIdentityData={null}
                manualCompetitors={manualCompetitors}
                competitorServices={competitorServices}
                companyServices={companyServices}
                deletedCompetitors={deletedCompetitors}
                manualKeywordData={manualKeywordData}
                keywordScore={keywordScore}
                staffQualificationData={staffQualificationData}
                hourlyRateData={hourlyRateData}
              />
            </CardContent>
          </Card>

          {/* Interner Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Interner Report
              </CardTitle>
              <CardDescription>
                Detaillierter technischer Report für interne Zwecke
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
                deletedCompetitors={deletedCompetitors}
                manualKeywordData={manualKeywordData}
                keywordScore={keywordScore}
                hourlyRateData={hourlyRateData}
              />
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Stundensatz erforderlich</h3>
            <p className="text-gray-600">
              Bitte geben Sie zuerst Ihren Stundensatz im "Preise"-Tab ein, 
              um Reports mit Kostenkalkulation zu generieren.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFExport;