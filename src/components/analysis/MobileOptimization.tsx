
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Tablet, Monitor, AlertTriangle } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface MobileOptimizationProps {
  url: string;
  realData: RealBusinessData;
}

const MobileOptimization: React.FC<MobileOptimizationProps> = ({ url, realData }) => {
  const mobileData = realData.mobile;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-yellow-600";  // 80-100% gelb
    if (score >= 60) return "text-green-600";   // 60-80% grün
    return "text-red-600";                      // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case "Kritisch": return "destructive";
      case "Warnung": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mobile-Optimierung Check (Echte Daten)
            <Badge variant={getScoreBadge(mobileData.overallScore)}>
              {mobileData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Live-Analyse der mobilen Benutzerfreundlichkeit für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Performance-Übersicht */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Performance-Vergleich (Live-Messung)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Mobile Geschwindigkeit</span>
                    <span className={`font-bold ${getScoreColor(mobileData.pageSpeedMobile)}`}>
                      {mobileData.pageSpeedMobile}/100
                    </span>
                  </div>
                  <Progress value={mobileData.pageSpeedMobile} className="h-2 mb-4" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Desktop Geschwindigkeit</span>
                    <span className={`font-bold ${getScoreColor(mobileData.pageSpeedDesktop)}`}>
                      {mobileData.pageSpeedDesktop}/100
                    </span>
                  </div>
                  <Progress value={mobileData.pageSpeedDesktop} className="h-2" />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Responsive Design:</span>
                    <Badge variant={mobileData.responsive ? "default" : "destructive"}>
                      {mobileData.responsive ? "Erkannt" : "Nicht erkannt"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Touch-freundlich:</span>
                    <Badge variant={mobileData.touchFriendly ? "default" : "destructive"}>
                      {mobileData.touchFriendly ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Kompatibilität */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Mobile Kompatibilität (Live-Analyse)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Mobile</p>
                  <Badge variant={mobileData.responsive ? "default" : "destructive"}>
                    {mobileData.responsive ? "Optimiert" : "Nicht optimiert"}
                  </Badge>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Tablet className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Tablet</p>
                  <Badge variant={mobileData.responsive ? "default" : "secondary"}>
                    {mobileData.responsive ? "Kompatibel" : "Unbekannt"}
                  </Badge>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Desktop</p>
                  <Badge variant="default">
                    Optimiert
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Viewport Meta-Tag:</span>
                  <span className={`font-medium ${mobileData.touchFriendly ? 'text-green-600' : 'text-red-600'}`}>
                    {mobileData.touchFriendly ? "Vorhanden" : "Fehlt"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Responsive CSS:</span>
                  <span className={`font-medium ${mobileData.responsive ? 'text-green-600' : 'text-red-600'}`}>
                    {mobileData.responsive ? "Erkannt" : "Nicht erkannt"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Erkannte Probleme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Erkannte Probleme (Live-Analyse)
              </CardTitle>
              <CardDescription>
                Automatisch identifizierte Verbesserungsmöglichkeiten
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mobileData.issues.length > 0 ? (
                <div className="space-y-3">
                  {mobileData.issues.map((issue, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getIssueColor(issue.type)}>
                          {issue.type}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Impact: {issue.impact}
                        </span>
                      </div>
                      <p className="text-sm">{issue.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-green-600 font-medium mb-2">
                    ✓ Keine kritischen Mobile-Probleme erkannt
                  </p>
                  <p className="text-sm text-gray-600">
                    Die automatische Analyse hat keine offensichtlichen Mobile-Optimierungsprobleme gefunden.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Echte Daten Hinweis */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✓ Live Mobile-Optimierungsanalyse</h4>
            <p className="text-sm text-green-700">
              Diese Analyse basiert auf einer automatischen Überprüfung der Website {url} 
              auf mobile Kompatibilität, Viewport-Einstellungen und responsive Design-Elemente.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimization;
