import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MousePointer, Phone, Mail, AlertCircle } from 'lucide-react';
import { ManualConversionData } from '@/hooks/useManualData';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConversionOptimizationProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung' | 'innenausbau' | 'metallverarbeitung';
  manualConversionData?: ManualConversionData | null;
}

const ConversionOptimization: React.FC<ConversionOptimizationProps> = ({ url, manualConversionData }) => {
  
  console.log('=== ConversionOptimization Render ===');
  console.log('URL:', url);
  console.log('manualConversionData:', manualConversionData);
  
  // Wenn keine manuellen Daten vorhanden sind, zeige Hinweis
  if (!manualConversionData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Conversion-Optimierung
          </CardTitle>
          <CardDescription>
            Detaillierte Analyse der Konversionsrate für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bitte erfassen Sie die Conversion-Daten manuell im Tab "Manuelle Eingabe", 
              um eine Analyse zu erhalten. Nur reale Daten werden angezeigt.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "secondary";
    if (score >= 60) return "default";
    return "destructive";
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return "bg-yellow-400 text-black";
    if (score >= 60) return "bg-green-500 text-white";
    return "bg-red-500 text-white";
  };

  // Gemeinsamer Score aus Conversion-Rate und User Journey
  const combinedScore = Math.round((manualConversionData.overallScore + manualConversionData.userJourneyScore) / 2);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Conversion-Optimierung & User Journey
            <div 
              className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${getScoreColorClass(combinedScore)}`}
            >
              {combinedScore}%
            </div>
          </CardTitle>
          <CardDescription>
            Kombinierte Analyse: Conversion-Rate ({manualConversionData.overallScore}%) und User Journey ({manualConversionData.userJourneyScore}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Call-to-Actions Statistiken */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Call-to-Actions (CTAs)
                <Badge variant={getScoreBadgeVariant(manualConversionData.ctaScore)}>
                  {manualConversionData.ctaScore}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 border rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">{manualConversionData.totalCTAs}</div>
                  <p className="text-sm text-gray-600">Gesamt CTAs</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">{manualConversionData.visibleCTAs}</div>
                  <p className="text-sm text-gray-600">Sichtbare CTAs</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-yellow-50">
                  <div className="text-2xl font-bold text-yellow-600">{manualConversionData.effectiveCTAs}</div>
                  <p className="text-sm text-gray-600">Effektive CTAs</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-purple-50">
                  <div className="text-2xl font-bold text-purple-600">{manualConversionData.aboveFoldCTAs}</div>
                  <p className="text-sm text-gray-600">Above-the-Fold</p>
                </div>
              </div>

              {manualConversionData.ctaTypes && manualConversionData.ctaTypes.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">CTA-Typen Verteilung</h4>
                  <div className="space-y-2">
                    {manualConversionData.ctaTypes.map((cta, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{cta.type}</Badge>
                          <span className="text-sm text-muted-foreground">× {cta.count}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={cta.effectiveness >= 70 ? "default" : "secondary"}>
                            {cta.effectiveness}% effektiv
                          </Badge>
                          {cta.mobileOptimized && <Badge variant="outline" className="text-xs">📱 Mobile</Badge>}
                          {cta.trackingSetup && <Badge variant="outline" className="text-xs">📊 Tracking</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kontaktmethoden */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Kontaktmöglichkeiten
                <Badge variant={getScoreBadgeVariant(manualConversionData.contactScore)}>
                  {manualConversionData.contactScore}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Telefon */}
                {manualConversionData.contactMethods.phone.visible && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Telefon</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prominent:</span>
                        <Badge variant={manualConversionData.contactMethods.phone.prominent ? "default" : "outline"}>
                          {manualConversionData.contactMethods.phone.prominent ? "Ja" : "Nein"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Klickbar:</span>
                        <Badge variant={manualConversionData.contactMethods.phone.clickable ? "default" : "outline"}>
                          {manualConversionData.contactMethods.phone.clickable ? "Ja" : "Nein"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Email */}
                {manualConversionData.contactMethods.email.visible && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">E-Mail</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Prominent:</span>
                        <Badge variant={manualConversionData.contactMethods.email.prominent ? "default" : "outline"}>
                          {manualConversionData.contactMethods.email.prominent ? "Ja" : "Nein"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* Kontaktformular */}
                {manualConversionData.contactMethods.form.present && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Kontaktformular</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mobile optimiert:</span>
                        <Badge variant={manualConversionData.contactMethods.form.mobileOptimized ? "default" : "outline"}>
                          {manualConversionData.contactMethods.form.mobileOptimized ? "Ja" : "Nein"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                {/* WhatsApp */}
                {manualConversionData.contactMethods.whatsapp.present && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">WhatsApp</span>
                    </div>
                    <Badge variant="default">Verfügbar</Badge>
                  </div>
                )}

                {/* Chat */}
                {manualConversionData.contactMethods.chat.present && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4" />
                      <span className="font-medium">Live Chat</span>
                    </div>
                    <Badge variant="default">Verfügbar</Badge>
                  </div>
                )}

                {/* Callback */}
                {manualConversionData.contactMethods.callback.present && (
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">Rückruf-Service</span>
                    </div>
                    <Badge variant="default">Verfügbar</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User Journey Score */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Mail className="h-5 w-5" />
                User Journey Optimierung
                <Badge variant={getScoreBadgeVariant(manualConversionData.userJourneyScore)}>
                  {manualConversionData.userJourneyScore}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Score basierend auf manueller Bewertung der User Journey und Conversion-Optimierung.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionOptimization;
