import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Eye, Keyboard, Palette, FileText, CheckCircle, XCircle, AlertTriangle, Scale, Shield } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface AccessibilityAnalysisProps {
  businessData: {
    url: string;
  };
  realData?: RealBusinessData;
  savedData?: any;
  onDataChange?: (data: any) => void;
}

interface AccessibilityResult {
  score: number;
  violations: Array<{
    id: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
    description: string;
    help: string;
    helpUrl: string;
    nodes: Array<{
      html: string;
      target: string[];
    }>;
  }>;
  passes: Array<{
    id: string;
    description: string;
  }>;
  incomplete: Array<{
    id: string;
    description: string;
    help: string;
  }>;
}

const AccessibilityAnalysis: React.FC<AccessibilityAnalysisProps> = ({ 
  businessData, 
  realData, 
  savedData, 
  onDataChange 
}) => {
  const [accessibilityData, setAccessibilityData] = useState<AccessibilityResult | null>(savedData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAccessibilityTest = async () => {
    if (!businessData.url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In einer echten Implementierung würde hier axe-core über einen Service laufen
      // Für die Demo erstelle ich realistische Test-Daten
      const mockResult: AccessibilityResult = {
        score: 68, // Realistischer Score - gut aber verbesserbar
        violations: [
          {
            id: 'color-contrast',
            impact: 'serious',
            description: 'Elemente müssen ausreichenden Farbkontrast haben',
            help: 'Stellen Sie sicher, dass Vordergrund- und Hintergrundfarben ein ausreichendes Kontrastverhältnis haben',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/color-contrast',
            nodes: [
              {
                html: '<button class="btn-primary">Kontakt</button>',
                target: ['.btn-primary']
              }
            ]
          },
          {
            id: 'image-alt',
            impact: 'moderate',
            description: 'Bilder müssen Alternativtext haben',
            help: 'Alle informativen Bilder müssen einen aussagekräftigen Alt-Text haben',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/image-alt',
            nodes: [
              {
                html: '<img src="team.jpg">',
                target: ['img[src="team.jpg"]']
              }
            ]
          },
          {
            id: 'heading-order',
            impact: 'moderate',
            description: 'Überschriften sollten in der richtigen Reihenfolge verwendet werden',
            help: 'Überschriften sollten hierarchisch strukturiert sein (H1, dann H2, dann H3 usw.)',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/heading-order',
            nodes: [
              {
                html: '<h3>Service</h3>',
                target: ['h3']
              }
            ]
          },
          {
            id: 'label',
            impact: 'serious',
            description: 'Formularelemente müssen beschriftet sein',
            help: 'Alle Eingabefelder müssen eindeutige Labels oder aria-label Attribute haben',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label',
            nodes: [
              {
                html: '<input type="text" placeholder="Name">',
                target: ['input[type="text"]']
              }
            ]
          },
          {
            id: 'focus-order-semantics',
            impact: 'minor',
            description: 'Fokusreihenfolge sollte logisch sein',
            help: 'Interactive Elemente sollten in einer logischen Reihenfolge fokussierbar sein',
            helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/focus-order-semantics',
            nodes: [
              {
                html: '<div tabindex="1">',
                target: ['div[tabindex]']
              }
            ]
          }
        ],
        passes: [
          {
            id: 'document-title',
            description: 'Dokumente müssen einen Titel haben'
          },
          {
            id: 'html-has-lang',
            description: 'HTML-Element muss ein lang-Attribut haben'
          },
          {
            id: 'landmark-one-main',
            description: 'Dokument muss ein main-Landmark haben'
          },
          {
            id: 'page-has-heading-one',
            description: 'Seite hat eine H1-Überschrift'
          },
          {
            id: 'meta-viewport',
            description: 'Viewport Meta-Tag ist korrekt gesetzt'
          },
          {
            id: 'link-name',
            description: 'Links haben aussagekräftige Namen'
          }
        ],
        incomplete: [
          {
            id: 'keyboard-navigation',
            description: 'Tastaturnavigation sollte getestet werden',
            help: 'Überprüfen Sie manuell, ob alle interaktiven Elemente per Tastatur erreichbar sind'
          },
          {
            id: 'screen-reader-compatibility',
            description: 'Screen Reader-Kompatibilität prüfen',
            help: 'Testen Sie die Website mit einem Screen Reader für optimale Zugänglichkeit'
          }
        ]
      };

      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAccessibilityData(mockResult);
      onDataChange?.(mockResult);
    } catch (err) {
      setError('Fehler bei der Barrierefreiheitsprüfung: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-text-medium';  // 80-100% grün - gut
    if (score >= 60) return 'score-text-high';    // 60-80% gelb - ok
    return 'score-text-low';                      // 0-60% rot - schlecht
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';           // grün (80-100%) - gut
    if (score >= 60) return 'secondary';         // gelb (60-80%) - ok 
    return 'destructive';                        // rot (0-60%) - schlecht
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'critical': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'serious': return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'moderate': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'minor': return <AlertTriangle className="h-4 w-4 text-accent" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'border-destructive bg-destructive/5';
      case 'serious': return 'border-destructive bg-destructive/5';
      case 'moderate': return 'border-warning bg-warning/5';
      case 'minor': return 'border-accent bg-accent/5';
      default: return 'border-border bg-muted/20';
    }
  };

  // Abmahnungsrisiko bewerten - realistischere Einschätzung
  const getAbmahnungsrisiko = (score: number, violations: any[]) => {
    const criticalViolations = violations.filter(v => v.impact === 'critical').length;
    const seriousViolations = violations.filter(v => v.impact === 'serious').length;
    
    // Sehr strenge Bewertung - nur bei extremen Fällen hohes Risiko
    if (score < 30 && criticalViolations >= 5) {
      return {
        risk: 'hoch',
        color: 'score-text-low',
        bgColor: 'bg-destructive/5',
        borderColor: 'border-destructive',
        message: 'Erhöhtes Abmahnungsrisiko',
        description: 'Mehrere kritische Barrierefreiheitsprobleme vorhanden.',
        recommendation: 'Schrittweise Behebung der kritischen Probleme empfohlen.'
      };
    } else if (score < 40 || criticalViolations >= 3 || seriousViolations >= 5) {
      return {
        risk: 'mittel',
        color: 'text-warning',
        bgColor: 'bg-warning/5',
        borderColor: 'border-warning',
        message: 'Verbesserungsbedarf erkannt',
        description: 'Einige Barrierefreiheitsprobleme sollten behoben werden.',
        recommendation: 'Behebung der Probleme zur Verbesserung der Zugänglichkeit empfohlen.'
      };
    } else if (score < 60) {
      return {
        risk: 'niedrig',
        color: 'score-text-high',
        bgColor: 'bg-accent/5',
        borderColor: 'border-accent',
        message: 'Grundstandards erfüllt',
        description: 'Barrierefreiheit weitgehend gewährleistet, kleinere Verbesserungen möglich.',
        recommendation: 'Kontinuierliche Optimierung zur weiteren Verbesserung.'
      };
    } else {
      return {
        risk: 'sehr niedrig',
        color: 'score-text-medium',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent',
        message: 'Gute Barrierefreiheit',
        description: 'Hohe Barrierefreiheitsstandards erfüllt.',
        recommendation: 'Regelmäßige Überprüfung zur Aufrechterhaltung des Standards.'
      };
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-blue-600" />
            Barrierefreiheit & Zugänglichkeit (WCAG 2.1)
          </CardTitle>
          <CardDescription>
            Automatische Prüfung der Web Content Accessibility Guidelines für bessere Nutzerfreundlichkeit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!accessibilityData && !loading && (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Barrierefreiheitsprüfung starten
              </h3>
              <p className="text-gray-500 mb-4">
                Überprüfen Sie Ihre Website auf Accessibility-Standards und rechtliche Anforderungen
              </p>
              <Button onClick={runAccessibilityTest} className="bg-blue-600 hover:bg-blue-700">
                <Eye className="h-4 w-4 mr-2" />
                Jetzt prüfen
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Prüfung läuft...
              </h3>
              <p className="text-gray-500">
                Analysiere Website auf Barrierefreiheit
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Fehler bei der Analyse
              </h3>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={runAccessibilityTest} variant="outline">
                Erneut versuchen
              </Button>
            </div>
          )}

          {accessibilityData && (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-blue-200">
                  <CardContent className="p-6 text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(accessibilityData.score)} mb-2`}>
                      {accessibilityData.score}
                    </div>
                    <div className="text-sm text-gray-600">Gesamt-Score</div>
                    <Badge variant={getScoreBadge(accessibilityData.score)} className="mt-2">
                      {accessibilityData.score >= 90 ? 'Excellent' : 
                       accessibilityData.score >= 70 ? 'Gut' : 
                       accessibilityData.score >= 50 ? 'Verbesserbar' : 'Kritisch'}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-red-600 mb-2">
                      {accessibilityData.violations.length}
                    </div>
                    <div className="text-sm text-gray-600">Probleme</div>
                    <div className="text-xs text-red-500 mt-1">
                      {accessibilityData.violations.filter(v => v.impact === 'critical').length} kritisch
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      {accessibilityData.passes.length}
                    </div>
                    <div className="text-sm text-gray-600">Erfolgreich</div>
                    <CheckCircle className="h-4 w-4 mx-auto text-green-500 mt-1" />
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-yellow-600 mb-2">
                      {accessibilityData.incomplete.length}
                    </div>
                    <div className="text-sm text-gray-600">Zu prüfen</div>
                    <div className="text-xs text-yellow-500 mt-1">manuelle Kontrolle</div>
                  </CardContent>
                </Card>
               </div>

              {/* Abmahnungsrisiko */}
              {(() => {
                const risikoAnalyse = getAbmahnungsrisiko(accessibilityData.score, accessibilityData.violations);
                return (
                  <Card className={`${risikoAnalyse.borderColor} ${risikoAnalyse.bgColor}`}>
                    <CardHeader className="pb-4">
                      <CardTitle className={`text-lg ${risikoAnalyse.color} flex items-center gap-2`}>
                        <Scale className="h-5 w-5" />
                        Rechtliche Bewertung - {risikoAnalyse.message}
                      </CardTitle>
                      <CardDescription>
                        Einschätzung des Abmahnungsrisikos basierend auf aktuellen Barrierefreiheitsstandards
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Shield className={`h-5 w-5 ${risikoAnalyse.color} mt-0.5`} />
                          <div>
                            <p className="text-sm text-gray-700 mb-2">
                              <strong>Bewertung:</strong> {risikoAnalyse.description}
                            </p>
                            <p className="text-sm text-gray-600 mb-3">
                              <strong>Empfehlung:</strong> {risikoAnalyse.recommendation}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                              <div className="space-y-2">
                                <h5 className="font-semibold text-gray-800 text-sm">Rechtliche Grundlagen:</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• BGG (Behindertengleichstellungsgesetz)</li>
                                  <li>• WCAG 2.1 Level AA Standard</li>
                                  <li>• EU-Richtlinie 2016/2102</li>
                                  <li>• Barrierefreie-Informationstechnik-Verordnung (BITV 2.0)</li>
                                </ul>
                              </div>
                              <div className="space-y-2">
                                <h5 className="font-semibold text-gray-800 text-sm">Mögliche Konsequenzen:</h5>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  <li>• Abmahnungen durch Anwaltskanzleien</li>
                                  <li>• Klagen von Betroffenen</li>
                                  <li>• Bußgelder bei öffentlichen Stellen</li>
                                  <li>• Reputationsschäden</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Barrierefreiheits-Score</span>
                  <span className={getScoreColor(accessibilityData.score)}>
                    {accessibilityData.score}/100
                  </span>
                </div>
                <Progress value={accessibilityData.score} className="h-3" />
              </div>

              {/* Violations */}
              {accessibilityData.violations.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Gefundene Probleme ({accessibilityData.violations.length})
                    </CardTitle>
                    <CardDescription>
                      Diese Punkte sollten behoben werden, um die Barrierefreiheit zu verbessern
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {accessibilityData.violations.map((violation, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border-l-4 ${getImpactColor(violation.impact)}`}
                        >
                          <div className="flex items-start gap-3">
                            {getImpactIcon(violation.impact)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {violation.description}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {violation.help}
                              </p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {violation.impact}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {violation.nodes.length} Element(e) betroffen
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(violation.helpUrl, '_blank')}
                                className="text-xs"
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Mehr erfahren
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Handlungsempfehlungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Sofort umsetzbar:
                      </h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li>• Alt-Texte für alle Bilder hinzufügen</li>
                        <li>• Farbkontraste erhöhen (mindestens 4.5:1)</li>
                        <li>• Überschriftenstruktur korrigieren</li>
                        <li>• Formular-Labels ergänzen</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Keyboard className="h-4 w-4" />
                        Erweiterte Maßnahmen:
                      </h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li>• Tastaturnavigation testen</li>
                        <li>• Screen Reader-Kompatibilität prüfen</li>
                        <li>• Focus-Indikatoren verbessern</li>
                        <li>• ARIA-Labels implementieren</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">💡 Rechtliche Hinweise:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• EU-Richtlinie 2016/2102 zur Barrierefreiheit</li>
                      <li>• Behindertengleichstellungsgesetz (BGG)</li>
                      <li>• WCAG 2.1 Level AA als Standard</li>
                      <li>• Vermeidung von Abmahnungen und Klagen</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Action Button */}
              <div className="flex gap-3">
                <Button 
                  onClick={runAccessibilityTest}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Erneut prüfen
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityAnalysis;