
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Tablet, Monitor, AlertTriangle } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface MobileOptimizationProps {
  url: string;
  realData: RealBusinessData;
  manualMobileData?: any;
}

const MobileOptimization: React.FC<MobileOptimizationProps> = ({ url, realData, manualMobileData }) => {
  // Prüfe ob valide manuelle Daten vorhanden sind (nicht nur null/undefined, sondern auch Score > 0)
  const hasManualData = !!(manualMobileData && manualMobileData.overallScore > 0);
  
  // Berechne Score: Wenn manuelle Daten vorhanden -> 50/50 Kombination, sonst nur automatisch
  const autoScore = realData.mobile.overallScore;
  const manualScore = hasManualData ? manualMobileData.overallScore : 0;
  const overallScore = hasManualData 
    ? Math.round((autoScore + manualScore) / 2)
    : autoScore;
  
  // Kombiniere Scores für Detailbereiche
  const autoResponsiveScore = realData.mobile.responsive ? 80 : 40;
  const autoPerformanceScore = realData.mobile.overallScore;
  const autoTouchScore = realData.mobile.touchFriendly ? 80 : 50;
  
  const responsiveDesignScore = hasManualData 
    ? Math.round((autoResponsiveScore + manualMobileData.responsiveDesignScore) / 2)
    : autoResponsiveScore;
  const performanceScore = hasManualData 
    ? Math.round((autoPerformanceScore + manualMobileData.performanceScore) / 2)
    : autoPerformanceScore;
  const touchOptimizationScore = hasManualData 
    ? Math.round((autoTouchScore + manualMobileData.touchOptimizationScore) / 2)
    : autoTouchScore;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "score-text-high";   // 90-100% gold
    if (score >= 61) return "score-text-medium"; // 61-89% grün
    return "score-text-low";                     // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "secondary";        // gold (90-100%)
    if (score >= 61) return "default";          // grün (61-89%)
    return "destructive";                       // rot (0-60%)
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
            Mobile-Optimierung Check {hasManualData && <Badge variant="outline" className="ml-2">Kombiniert (50% Auto + 50% Manuell)</Badge>}
            <div 
              className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                overallScore >= 90 ? 'bg-yellow-400 text-black' : 
                overallScore >= 61 ? 'bg-green-500 text-white' : 
                'bg-red-500 text-white'
              }`}
            >
              {overallScore}%
            </div>
          </CardTitle>
          <CardDescription>
            {hasManualData 
              ? `Kombinierter Score aus automatischer und manueller Analyse (je 50%) für ${url}`
              : `Automatische Analyse der mobilen Benutzerfreundlichkeit für ${url}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Score-Übersicht */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="text-lg">Gesamtbewertung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">📱 Responsive Design</span>
                    <Badge variant={getScoreBadge(responsiveDesignScore)}>
                      {responsiveDesignScore} Punkte
                    </Badge>
                  </div>
                  <Progress value={responsiveDesignScore} className="h-2" />
                  {hasManualData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Viewport: {manualMobileData.viewportConfig}, Layouts: {manualMobileData.flexibleLayouts}%, Bilder: {manualMobileData.imageOptimization}%
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">⚡ Mobile Performance</span>
                    <Badge variant={getScoreBadge(performanceScore)}>
                      {performanceScore} Punkte
                    </Badge>
                  </div>
                  <Progress value={performanceScore} className="h-2" />
                  {hasManualData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Ladezeit: {manualMobileData.mobileLoadTime}s, LCP: {manualMobileData.coreWebVitals.lcp}s
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">👆 Touch-Optimierung</span>
                    <Badge variant={getScoreBadge(touchOptimizationScore)}>
                      {touchOptimizationScore} Punkte
                    </Badge>
                  </div>
                  <Progress value={touchOptimizationScore} className="h-2" />
                  {hasManualData && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Buttons: {manualMobileData.buttonSize}, Abstände: {manualMobileData.tapDistance}, Scroll: {manualMobileData.scrollBehavior}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance-Übersicht - nur wenn keine manuellen Daten */}
          {!hasManualData && (
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
                    <span className={`font-bold ${getScoreColor(realData.mobile.pageSpeedMobile)}`}>
                      {realData.mobile.pageSpeedMobile}/100
                    </span>
                  </div>
                  <Progress value={realData.mobile.pageSpeedMobile} className="h-2 mb-4" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Desktop Geschwindigkeit</span>
                    <span className={`font-bold ${getScoreColor(realData.mobile.pageSpeedDesktop)}`}>
                      {realData.mobile.pageSpeedDesktop}/100
                    </span>
                  </div>
                  <Progress value={realData.mobile.pageSpeedDesktop} className="h-2" />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Responsive Design:</span>
                    <Badge variant={realData.mobile.responsive ? "default" : "destructive"}>
                      {realData.mobile.responsive ? "Erkannt" : "Nicht erkannt"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Touch-freundlich:</span>
                    <Badge variant={realData.mobile.touchFriendly ? "default" : "destructive"}>
                      {realData.mobile.touchFriendly ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Mobile Kompatibilität - nur wenn keine manuellen Daten */}
          {!hasManualData && (
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
                  <Badge variant={realData.mobile.responsive ? "default" : "destructive"}>
                    {realData.mobile.responsive ? "Optimiert" : "Nicht optimiert"}
                  </Badge>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Tablet className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Tablet</p>
                  <Badge variant={realData.mobile.responsive ? "default" : "secondary"}>
                    {realData.mobile.responsive ? "Kompatibel" : "Unbekannt"}
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
                     <span className={`font-medium ${realData.mobile.touchFriendly ? 'score-text-medium' : 'score-text-low'}`}>
                       {realData.mobile.touchFriendly ? "Vorhanden" : "Fehlt"}
                     </span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">Responsive CSS:</span>
                     <span className={`font-medium ${realData.mobile.responsive ? 'score-text-medium' : 'score-text-low'}`}>
                       {realData.mobile.responsive ? "Erkannt" : "Nicht erkannt"}
                     </span>
                   </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* Erkannte Probleme - nur wenn keine manuellen Daten und Issues vorhanden */}
          {!hasManualData && realData.mobile.issues && realData.mobile.issues.length > 0 && (
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
              {realData.mobile.issues.length > 0 ? (
                <div className="space-y-3">
                  {realData.mobile.issues.map((issue, index) => (
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
          )}

          {/* Datenquelle Hinweis */}
          <div className={`mt-6 border rounded-lg p-4 ${hasManualData ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
            <h4 className={`font-semibold mb-2 ${hasManualData ? 'text-blue-800' : 'text-green-800'}`}>
              {hasManualData ? '📝 Kombinierte Analyse' : '✓ Live Mobile-Optimierungsanalyse'}
            </h4>
            <p className={`text-sm ${hasManualData ? 'text-blue-700' : 'text-green-700'}`}>
              {hasManualData 
                ? `Diese Analyse kombiniert automatisch erfasste Daten mit Ihren manuellen Eingaben. Der Gesamtscore von ${overallScore}% basiert auf den manuellen Daten. Sie können die manuellen Daten im Tab "Mobile Manual" bearbeiten.`
                : `Diese Analyse basiert auf einer automatischen Überprüfung der Website ${url} auf mobile Kompatibilität, Viewport-Einstellungen und responsive Design-Elemente. Für eine detailliertere Analyse können Sie manuelle Daten im Tab "Mobile Manual" erfassen.`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimization;
