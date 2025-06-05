
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface ImprintCheckProps {
  url: string;
  realData: RealBusinessData;
}

const ImprintCheck: React.FC<ImprintCheckProps> = ({ url, realData }) => {
  const imprintData = realData.imprint;

  const getStatusIcon = (present: boolean) => {
    return present ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Impressumsprüfung (Echte Daten)
            <Badge variant={imprintData.score >= 80 ? "default" : imprintData.score >= 60 ? "secondary" : "destructive"}>
              {imprintData.score}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Live-Analyse der rechtlichen Vollständigkeit für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Gesamtübersicht */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {imprintData.found ? '✓' : '✗'}
                </div>
                <p className="text-sm text-gray-600">
                  Impressum gefunden
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {imprintData.completeness}%
                </div>
                <p className="text-sm text-gray-600">
                  Vollständigkeit
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {imprintData.foundElements.length}
                </div>
                <p className="text-sm text-gray-600">
                  Vorhandene Elemente
                </p>
              </div>
            </div>

            <Progress value={imprintData.completeness} className="h-3" />

            {/* Gefundene Elemente */}
            {imprintData.foundElements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Vorhandene Angaben (Live-Analyse)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {imprintData.foundElements.map((element, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{element}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fehlende Elemente */}
            {imprintData.missingElements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">
                    Fehlende Angaben (Live-Analyse)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {imprintData.missingElements.map((element, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{element}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Echte Daten Hinweis */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">✓ Live-Impressumsanalyse</h4>
              <p className="text-sm text-green-700">
                Diese Analyse basiert auf dem tatsächlichen Inhalt Ihrer Website {url}. 
                Alle gefundenen und fehlenden Elemente wurden automatisch erkannt.
              </p>
            </div>

            {/* Verbesserungsempfehlungen basierend auf echten Daten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Empfehlungen (basierend auf Echtdaten)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {imprintData.missingElements.map((element, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{element} hinzufügen</span>
                    </div>
                  ))}
                  {imprintData.foundElements.map((element, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{element} ist vorhanden</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprintCheck;
