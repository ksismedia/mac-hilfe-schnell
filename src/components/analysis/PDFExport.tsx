
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import HTMLExport from './HTMLExport';
import { FileText, Download, AlertTriangle } from 'lucide-react';

interface PDFExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: any;
}

const PDFExport: React.FC<PDFExportProps> = ({ businessData, realData, manualImprintData, manualSocialData }) => {
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Analyse-Export
          </CardTitle>
          <CardDescription>
            Exportieren Sie die vollständige Analyse in verschiedenen Formaten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="html" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="html" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                HTML-Export (Empfohlen)
              </TabsTrigger>
              <TabsTrigger value="legacy" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Legacy PDF
              </TabsTrigger>
            </TabsList>

            <TabsContent value="html">
              <HTMLExport 
                businessData={businessData}
                realData={realData}
                manualImprintData={manualImprintData}
                manualSocialData={manualSocialData}
              />
            </TabsContent>

            <TabsContent value="legacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    Legacy PDF-Export (Deprecated)
                  </CardTitle>
                  <CardDescription>
                    ⚠️ Diese Funktion wird nicht mehr empfohlen aufgrund von Formatierungsproblemen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Bekannte Probleme:</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Unvollständige Seitenumbrüche</li>
                      <li>• Begrenzte Formatierungsmöglichkeiten</li>
                      <li>• Konkurrenzanalyse verkürzt</li>
                      <li>• Hoher Entwicklungsaufwand</li>
                    </ul>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Nicht empfohlen - Bitte HTML-Export verwenden
                  </Badge>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFExport;
