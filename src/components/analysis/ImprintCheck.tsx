
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ImprintCheckProps {
  url: string;
}

const ImprintCheck: React.FC<ImprintCheckProps> = ({ url }) => {
  // Simulierte Impressumsdaten
  const imprintData = {
    found: true,
    overallScore: 85,
    requirements: [
      {
        name: "Anbietername",
        required: true,
        found: true,
        content: "Schmidt SHK Meisterbetrieb GmbH"
      },
      {
        name: "Vollständige Anschrift",
        required: true,
        found: true,
        content: "Musterstraße 123, 80333 München"
      },
      {
        name: "Kontaktangaben",
        required: true,
        found: true,
        content: "Tel: 089/123456, E-Mail: info@schmidt-shk.de"
      },
      {
        name: "Vertretungsberechtigte Person",
        required: true,
        found: true,
        content: "Geschäftsführer: Hans Schmidt"
      },
      {
        name: "Handelsregistereintrag",
        required: true,
        found: true,
        content: "HRB 123456, Amtsgericht München"
      },
      {
        name: "Umsatzsteuer-ID",
        required: true,
        found: false,
        content: null
      },
      {
        name: "Kammerzugehörigkeit",
        required: false,
        found: true,
        content: "Handwerkskammer München"
      },
      {
        name: "Berufsbezeichnung",
        required: false,
        found: true,
        content: "Installateur- und Heizungsbauermeister"
      },
      {
        name: "Berufshaftpflichtversicherung",
        required: false,
        found: false,
        content: null
      }
    ]
  };

  const getStatusIcon = (found: boolean, required: boolean) => {
    if (found) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (required) return <XCircle className="h-5 w-5 text-red-500" />;
    return <AlertCircle className="h-5 w-5 text-yellow-500" />;
  };

  const getStatusBadge = (found: boolean, required: boolean) => {
    if (found) return "default";
    if (required) return "destructive";
    return "secondary";
  };

  const getStatusText = (found: boolean, required: boolean) => {
    if (found) return "Vorhanden";
    if (required) return "Fehlt (Pflicht)";
    return "Fehlt (Optional)";
  };

  const requiredCount = imprintData.requirements.filter(req => req.required).length;
  const requiredFound = imprintData.requirements.filter(req => req.required && req.found).length;
  const completeness = Math.round((requiredFound / requiredCount) * 100);

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
            Prüfung der rechtlich relevanten Angaben im Impressum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Übersicht */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {imprintData.found ? "✓" : "✗"}
                </div>
                <div className="text-sm text-gray-600">Impressum gefunden</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {requiredFound}/{requiredCount}
                </div>
                <div className="text-sm text-gray-600">Pflichtangaben</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {completeness}%
                </div>
                <div className="text-sm text-gray-600">Vollständigkeit</div>
              </div>
            </div>

            {/* Detaillierte Prüfung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detaillierte Prüfung</CardTitle>
                <CardDescription>
                  Einzelne Impressumsangaben nach § 5 TMG
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imprintData.requirements.map((requirement, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(requirement.found, requirement.required)}
                          <span className="font-medium">{requirement.name}</span>
                          {requirement.required && (
                            <Badge variant="outline" size="sm">Pflicht</Badge>
                          )}
                        </div>
                        <Badge variant={getStatusBadge(requirement.found, requirement.required)}>
                          {getStatusText(requirement.found, requirement.required)}
                        </Badge>
                      </div>
                      {requirement.content && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">
                          {requirement.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Rechtliche Hinweise */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rechtliche Hinweise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>
                      <strong>Kritisch:</strong> Umsatzsteuer-ID fehlt - bei umsatzsteuerpflichtigen Unternehmen 
                      ist die Angabe der Umsatzsteuer-Identifikationsnummer Pflicht.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>
                      <strong>Empfehlung:</strong> Angabe der Berufshaftpflichtversicherung für mehr Vertrauen bei Kunden.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>
                      <strong>Positiv:</strong> Alle wichtigen Pflichtangaben nach § 5 TMG sind vorhanden.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Handlungsempfehlungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Handlungsempfehlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">1.</span>
                    <span>
                      <strong>Sofort:</strong> Umsatzsteuer-ID im Impressum ergänzen (falls zutreffend)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 font-bold">2.</span>
                    <span>
                      <strong>Empfohlen:</strong> Berufshaftpflichtversicherung mit Versicherer und Geltungsbereich angeben
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>
                      <strong>Optional:</strong> Link zum Impressum prominenter auf der Website platzieren
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprintCheck;
