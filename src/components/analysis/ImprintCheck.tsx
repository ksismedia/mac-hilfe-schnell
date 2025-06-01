
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ImprintCheckProps {
  url: string;
}

const ImprintCheck: React.FC<ImprintCheckProps> = ({ url }) => {
  // Simulierte Impressumsdaten
  const imprintData = {
    found: true,
    completeness: 85,
    missingElements: ['USt-IdNr.', 'Berufsbezeichnung'],
    foundElements: [
      'Firmenname',
      'Anschrift',
      'Kontaktdaten',
      'Geschäftsführer',
      'Handelsregister',
      'Datenschutzerklärung'
    ],
    legalCompliance: {
      tmg: true,
      dsgvo: true,
      impressumspflicht: true
    },
    overallScore: 85
  };

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
            Impressumsprüfung
            <Badge variant={imprintData.overallScore >= 80 ? "default" : imprintData.overallScore >= 60 ? "secondary" : "destructive"}>
              {imprintData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Rechtliche Vollständigkeit für {url}
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vorhandene Angaben</CardTitle>
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

            {/* Fehlende Elemente */}
            {imprintData.missingElements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">
                    Fehlende Angaben
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

            {/* Rechtliche Compliance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rechtliche Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">TMG (Telemediengesetz)</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(imprintData.legalCompliance.tmg)}
                      <Badge variant={imprintData.legalCompliance.tmg ? "default" : "destructive"}>
                        {imprintData.legalCompliance.tmg ? 'Erfüllt' : 'Nicht erfüllt'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DSGVO (Datenschutz)</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(imprintData.legalCompliance.dsgvo)}
                      <Badge variant={imprintData.legalCompliance.dsgvo ? "default" : "destructive"}>
                        {imprintData.legalCompliance.dsgvo ? 'Erfüllt' : 'Nicht erfüllt'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Impressumspflicht</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(imprintData.legalCompliance.impressumspflicht)}
                      <Badge variant={imprintData.legalCompliance.impressumspflicht ? "default" : "destructive"}>
                        {imprintData.legalCompliance.impressumspflicht ? 'Erfüllt' : 'Nicht erfüllt'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Verbesserungsempfehlungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Empfehlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">USt-IdNr. hinzufügen für gewerbliche Kunden</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Berufsbezeichnung und zuständige Kammer angeben</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Datenschutzerklärung ist vollständig vorhanden</span>
                  </div>
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
