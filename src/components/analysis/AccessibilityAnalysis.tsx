import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, Keyboard, Palette, FileText, CheckCircle, XCircle, AlertTriangle, Scale, Shield, ExternalLink, BookOpen, Edit } from 'lucide-react';
import { ManualAccessibilityInput } from './ManualAccessibilityInput';
import { useManualData } from '@/hooks/useManualData';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { AccessibilityService, AccessibilityResult, AccessibilityViolation } from '@/services/AccessibilityService';
import { calculateAccessibilityScore } from './export/scoreCalculations';

interface AccessibilityAnalysisProps {
  businessData: {
    url: string;
  };
  realData?: RealBusinessData;
  savedData?: AccessibilityResult;
  onDataChange?: (data: AccessibilityResult) => void;
  manualAccessibilityData?: any;
  updateManualAccessibilityData?: (data: any) => void;
}

const AccessibilityAnalysis: React.FC<AccessibilityAnalysisProps> = ({ 
  businessData, 
  realData, 
  savedData, 
  onDataChange,
  manualAccessibilityData: propsManualData,
  updateManualAccessibilityData: propsUpdateManualData
}) => {
  const { manualAccessibilityData: hookManualData, updateManualAccessibilityData: hookUpdateManualData } = useManualData();
  
  // Use props if provided, otherwise fall back to hook
  const manualAccessibilityData = propsManualData ?? hookManualData;
  const updateManualAccessibilityData = propsUpdateManualData ?? hookUpdateManualData;
  const [accessibilityData, setAccessibilityData] = useState<AccessibilityResult | null>(savedData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync accessibilityData when savedData changes (e.g., when loading a saved analysis)
  useEffect(() => {
    if (savedData) {
      console.log('📥 Updating accessibilityData from savedData:', savedData);
      setAccessibilityData(savedData);
    }
  }, [savedData]);

  // Helper function to merge manual and automatic accessibility data
  // IMMER zentralisierte Score-Berechnung verwenden für Konsistenz mit HTML-Export
  const getEffectiveAccessibilityData = () => {
    // IMMER den zentralisierten Score berechnen - kombiniert auto + manual Daten
    const calculatedScore = calculateAccessibilityScore(accessibilityData, manualAccessibilityData);
    
    console.log('🎯 Accessibility Score berechnet:', {
      calculatedScore,
      hasAutoData: !!accessibilityData,
      hasManualData: !!manualAccessibilityData,
      autoDataScore: accessibilityData?.score,
      autoDataViolations: accessibilityData?.violations?.length
    });
    
    // Wenn automatische Daten vorhanden - diese als Basis verwenden, aber mit berechnetem Score
    if (accessibilityData) {
      return {
        ...accessibilityData,
        score: calculatedScore, // IMMER den zentralisiert berechneten Score verwenden
        dataSource: manualAccessibilityData ? "combined" as const : "automatic" as const
      };
    }
    
    // Nur manuelle Daten vorhanden
    if (manualAccessibilityData) {
      const allFeaturesEnabled = 
        manualAccessibilityData.keyboardNavigation &&
        manualAccessibilityData.screenReaderCompatible &&
        manualAccessibilityData.colorContrast &&
        manualAccessibilityData.altTextsPresent &&
        manualAccessibilityData.focusVisibility &&
        manualAccessibilityData.textScaling;
      
      return {
        score: calculatedScore,
        wcagLevel: calculatedScore >= 95 ? 'AA' : calculatedScore >= 70 ? 'A' : 'partial',
        violations: [], // Keine automatischen Violations ohne API-Daten
        passes: [],
        incomplete: [],
        legalRisk: {
          level: (calculatedScore === 100 ? 'very-low' : calculatedScore >= 80 ? 'low' : calculatedScore >= 60 ? 'medium' : 'high') as 'very-low' | 'low' | 'medium' | 'high' | 'critical',
          score: calculatedScore,
          factors: manualAccessibilityData.notes ? [manualAccessibilityData.notes] : ['Manuelle Bewertung'],
          recommendations: calculatedScore === 100 ? ['Weiterhin alle Standards einhalten'] : ['Fehlende Features implementieren']
        },
        dataSource: "manual" as const,
        manualNotes: manualAccessibilityData.notes
      };
    }
    
    return null;
  };

  // Get the effective accessibility data (manual overrides automatic)
  const getCurrentAccessibilityData = () => {
    const effectiveData = getEffectiveAccessibilityData();
    console.log('Aktuelle Accessibility Data:', effectiveData);
    return effectiveData;
  };

  const runAccessibilityTest = async () => {
    if (!businessData.url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starte WCAG 2.1 konformen Accessibility-Test...');
      const result = await AccessibilityService.analyzeAccessibility(businessData.url, realData);
      
      setAccessibilityData(result);
      onDataChange?.(result);
      console.log('Accessibility-Analyse abgeschlossen:', result);
    } catch (err) {
      const errorMessage = 'Fehler bei der Barrierefreiheitsprüfung: ' + (err as Error).message;
      setError(errorMessage);
      console.error('Accessibility-Test Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  // WCAG-konforme Score-Darstellung - Spezielle Compliance-basierte Farblogik
  const getScoreColor = (score: number) => {
    if (score >= 95) return 'score-text-high';      // Gelb: Vollständig konform (≥95%)
    return 'score-text-low';                        // Rot: Nicht vollständig konform (<95%)
  };

  const getScoreBadge = (score: number) => {
    if (score >= 95) return 'secondary';            // Gelb: Vollständig konform
    return 'destructive';                           // Rot: Nicht vollständig konform
  };

  const getWcagLevelBadge = (level: string) => {
    switch (level) {
      case 'AAA': return { variant: 'default' as const, text: 'WCAG AAA' };
      case 'AA': return { variant: 'default' as const, text: 'WCAG AA' };
      case 'A': return { variant: 'secondary' as const, text: 'WCAG A' };
      case 'partial': return { variant: 'secondary' as const, text: 'Teilweise konform' };
      default: return { variant: 'destructive' as const, text: 'Nicht konform' };
    }
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

  const getLegalRiskDisplay = (risk: AccessibilityResult['legalRisk']) => {
    const configs = {
      'critical': {
        color: 'score-text-low',
        bgColor: 'bg-destructive/10',
        borderColor: 'border-destructive',
        icon: <Scale className="h-5 w-5 text-destructive" />,
        title: 'Kritisches Rechtsrisiko'
      },
      'high': {
        color: 'score-text-low',
        bgColor: 'bg-destructive/5',
        borderColor: 'border-destructive',
        icon: <AlertCircle className="h-5 w-5 text-destructive" />,
        title: 'Erhöhtes Rechtsrisiko'
      },
      'medium': {
        color: 'text-warning',
        bgColor: 'bg-warning/5',
        borderColor: 'border-warning',
        icon: <AlertTriangle className="h-5 w-5 text-warning" />,
        title: 'Moderates Rechtsrisiko'
      },
      'low': {
        color: 'score-text-high',
        bgColor: 'bg-accent/5',
        borderColor: 'border-accent',
        icon: <Shield className="h-5 w-5 text-accent" />,
        title: 'Geringes Rechtsrisiko'
      },
      'very-low': {
        color: 'score-text-medium',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent',
        icon: <CheckCircle className="h-5 w-5 text-accent" />,
        title: 'Sehr geringes Rechtsrisiko'
      }
    };
    
    return configs[risk.level];
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
          <Tabs defaultValue="automatic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatic">Automatische Analyse</TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Manuelle Bewertung
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="automatic" className="mt-6">
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

          {(() => {
            const currentData = getCurrentAccessibilityData();
            console.log('🔍 ACCESSIBILITY DEBUG - Current Data:', currentData);
            console.log('🔍 ACCESSIBILITY DEBUG - Raw accessibilityData:', accessibilityData);
            console.log('🔍 ACCESSIBILITY DEBUG - manualAccessibilityData:', manualAccessibilityData);
            return currentData && (
            <div className="space-y-6">
              {/* Legal Warning for Accessibility Issues */}
              {(() => {
                const currentData = getCurrentAccessibilityData();
                return (currentData && (currentData.violations.length > 0 || currentData.score < 90)) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                    <Scale className="h-5 w-5" />
                    Rechtlicher Hinweis: Barrierefreiheit-Verstöße erkannt
                  </div>
                  <p className="text-red-700 text-sm mb-3">
                    <strong>Warnung:</strong> Die automatisierte Analyse hat rechtlich relevante Barrierefreiheit-Probleme identifiziert. 
                    Bei Barrierefreiheit-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
                  </p>
                  <div className="bg-red-100 border border-red-300 rounded p-3 text-red-800 text-sm">
                    <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Website oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. 
                    Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. 
                    Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
                  </div>
                </div>
                );
              })()}

              {/* Critical Violations Analysis with Neutralization */}
              {(() => {
                const currentData = getCurrentAccessibilityData();
                
                // Automatische kritische Violations
                const criticalViolations = (currentData?.violations || []).filter((v: AccessibilityViolation) => 
                  v.impact === 'critical' || v.impact === 'serious'
                );
                
                // Check which violations are neutralized by manual inputs
                const neutralizedViolations = criticalViolations.filter((violation: AccessibilityViolation) => {
                  const vid = violation.id || '';
                  
                  if (manualAccessibilityData?.keyboardNavigation && 
                      (vid.includes('keyboard') || vid.includes('button-name') || 
                       vid.includes('link-name') || vid.includes('accesskeys'))) {
                    return true;
                  }
                  
                  if (manualAccessibilityData?.screenReaderCompatible && 
                      (vid.includes('aria-') || vid.includes('label') || 
                       vid.includes('role') || vid.includes('landmark'))) {
                    return true;
                  }
                  
                  if (manualAccessibilityData?.colorContrast && 
                      (vid.includes('color-contrast') || vid.includes('contrast'))) {
                    return true;
                  }
                  
                  if (manualAccessibilityData?.altTextsPresent && 
                      (vid.includes('image-alt') || vid.includes('alt') || vid === 'image-alt')) {
                    return true;
                  }
                  
                  if (manualAccessibilityData?.focusVisibility && 
                      (vid.includes('focus') || vid.includes('focus-order'))) {
                    return true;
                  }
                  
                  if (manualAccessibilityData?.textScaling && 
                      (vid.includes('meta-viewport') || vid.includes('target-size'))) {
                    return true;
                  }
                  
                  return false;
                });
                
                let remainingCriticalCount = criticalViolations.length - neutralizedViolations.length;
                const neutralizedCount = neutralizedViolations.length;
                
                // NEU: Manuell hinzugefügte kritische Violations (wenn User explizit Features als NICHT vorhanden markiert)
                const manualCriticalViolations: string[] = [];
                if (manualAccessibilityData?.altTextsPresent === false) {
                  manualCriticalViolations.push('Alt-Texte nicht VoiceOver-kompatibel');
                  remainingCriticalCount++;
                }
                if (manualAccessibilityData?.screenReaderCompatible === false) {
                  manualCriticalViolations.push('Screen-Reader-Kompatibilität fehlt');
                  remainingCriticalCount++;
                }
                if (manualAccessibilityData?.colorContrast === false) {
                  manualCriticalViolations.push('Farbkontraste nicht ausreichend');
                  remainingCriticalCount++;
                }
                if (manualAccessibilityData?.keyboardNavigation === false) {
                  manualCriticalViolations.push('Tastaturnavigation fehlt');
                  remainingCriticalCount++;
                }
                
                let scoreCap = 100;
                if (remainingCriticalCount === 1) scoreCap = 59;
                else if (remainingCriticalCount === 2) scoreCap = 35;
                else if (remainingCriticalCount >= 3) scoreCap = 20;
                
                // Check for positive manual inputs
                const hasPositiveManualInputs = manualAccessibilityData?.keyboardNavigation || 
                                                manualAccessibilityData?.screenReaderCompatible || 
                                                manualAccessibilityData?.colorContrast || 
                                                manualAccessibilityData?.altTextsPresent || 
                                                manualAccessibilityData?.focusVisibility || 
                                                manualAccessibilityData?.textScaling;
                
                const positiveInputsList = [];
                if (manualAccessibilityData?.keyboardNavigation) positiveInputsList.push('Tastaturnavigation');
                if (manualAccessibilityData?.screenReaderCompatible) positiveInputsList.push('Screen-Reader-kompatibel');
                if (manualAccessibilityData?.colorContrast) positiveInputsList.push('Farbkontraste ausreichend');
                if (manualAccessibilityData?.altTextsPresent) positiveInputsList.push('Alt-Texte vorhanden');
                if (manualAccessibilityData?.focusVisibility) positiveInputsList.push('Fokus-Sichtbarkeit');
                if (manualAccessibilityData?.textScaling) positiveInputsList.push('Text-Skalierung');
                
                // Zeige Box wenn kritische Violations (auto oder manuell) oder Neutralisierungen vorhanden
                if (remainingCriticalCount > 0 || neutralizedCount > 0 || manualCriticalViolations.length > 0) {
                  return (
                    <div className={`rounded-lg p-4 border ${remainingCriticalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <div className="flex items-center gap-2 font-semibold mb-2 text-sm">
                        🔍 Kritische Fehler-Analyse:
                      </div>
                      {neutralizedCount > 0 && (
                        <div className="text-sm text-green-700 mb-1">
                          ✓ {neutralizedCount} kritische Violation(s) durch manuelle Eingaben neutralisiert
                        </div>
                      )}
                      {manualCriticalViolations.length > 0 && (
                        <div className="text-sm text-red-700 mb-2 p-2 bg-red-100 rounded">
                          <div className="font-semibold mb-1">⚠️ Manuell gemeldete Probleme:</div>
                          <ul className="list-disc list-inside">
                            {manualCriticalViolations.map((v, i) => (
                              <li key={i}>{v}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {remainingCriticalCount > 0 ? (
                        <>
                          <div className="text-sm text-red-700 mb-1">
                            ⚠️ {remainingCriticalCount} kritische Violation(s) insgesamt
                          </div>
                          <div className="text-sm text-red-900 font-bold">
                            📊 Score-Kappung: Maximum {scoreCap}% möglich
                          </div>
                          {hasPositiveManualInputs && positiveInputsList.length > 0 && (
                            <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                              <div className="text-sm text-orange-900">
                                <strong>ℹ️ Hinweis:</strong> Trotz manueller Angaben ({positiveInputsList.join(', ')}) kann die Bewertung aufgrund der verbleibenden kritischen Violations nicht höher ausfallen.
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-green-700">
                          ✓ Keine verbleibenden kritischen Violations
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-blue-200">
                  <CardContent className="p-6 text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(getCurrentAccessibilityData()?.score || 0)} mb-2`}>
                      {(getCurrentAccessibilityData()?.score || 0) > 0 ? (getCurrentAccessibilityData()?.score || 0) : '—'}
                    </div>
                    <div className="text-sm text-gray-600">Gesamt-Score</div>
                    <Badge variant={getScoreBadge(getCurrentAccessibilityData()?.score || 0)} className="mt-2">
                      {(getCurrentAccessibilityData()?.score || 0) >= 90 ? 'Excellent' : 
                       (getCurrentAccessibilityData()?.score || 0) >= 70 ? 'Gut' : 
                       (getCurrentAccessibilityData()?.score || 0) >= 50 ? 'Verbesserbar' : 'Kritisch'}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card className="border-red-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-red-600 mb-2">
                      {getCurrentAccessibilityData()?.violations?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Probleme</div>
                    <div className="text-xs text-red-500 mt-1">
                      {getCurrentAccessibilityData()?.violations?.filter(v => v.impact === 'critical').length || 0} kritisch
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-green-600 mb-2">
                      {getCurrentAccessibilityData()?.passes?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Erfolgreich</div>
                    <CheckCircle className="h-4 w-4 mx-auto text-green-500 mt-1" />
                  </CardContent>
                </Card>

                <Card className="border-yellow-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-yellow-600 mb-2">
                      {getCurrentAccessibilityData()?.incomplete?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Zu prüfen</div>
                    <div className="text-xs text-yellow-500 mt-1">manuelle Kontrolle</div>
                  </CardContent>
                </Card>
               </div>

              {/* Rechtliche Bewertung */}
              {(() => {
                const currentAccessibilityData = getCurrentAccessibilityData();
                if (!currentAccessibilityData?.legalRisk) return null;
                const riskDisplay = getLegalRiskDisplay(currentAccessibilityData.legalRisk);
                return (
                  <Card className={`${riskDisplay.borderColor} ${riskDisplay.bgColor}`}>
                    <CardHeader className="pb-4">
                      <CardTitle className={`text-lg ${riskDisplay.color} flex items-center gap-2`}>
                        {riskDisplay.icon}
                        {riskDisplay.title}
                      </CardTitle>
                      <CardDescription>
                        Rechtliche Einschätzung basierend auf WCAG 2.1 und deutschen Barrierefreiheitsgesetzen
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Badge variant={getWcagLevelBadge(currentAccessibilityData?.wcagLevel || 'none').variant}>
                            {getWcagLevelBadge(currentAccessibilityData?.wcagLevel || 'none').text}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Rechtliches Risiko: {currentAccessibilityData?.legalRisk?.score || 0}/100
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h5 className="font-semibold text-foreground flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              Rechtliche Faktoren:
                            </h5>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {(currentAccessibilityData?.legalRisk?.factors || []).map((factor, index) => (
                                <li key={index}>• {factor}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="space-y-3">
                            <h5 className="font-semibold text-foreground flex items-center gap-2">
                              <ExternalLink className="h-4 w-4" />
                              Empfehlungen:
                            </h5>
                            <ul className="text-sm space-y-1 text-muted-foreground">
                              {(currentAccessibilityData?.legalRisk?.recommendations || []).map((rec, index) => (
                                <li key={index}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <h5 className="font-semibold text-foreground mb-2">🏛️ Rechtliche Grundlagen:</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• BGG §4 - Barrierefreie Informationstechnik</li>
                              <li>• WCAG 2.1 Level AA als deutscher Standard</li>
                              <li>• EU-Richtlinie 2016/2102</li>
                            </ul>
                            <ul className="text-xs space-y-1 text-muted-foreground">
                              <li>• BITV 2.0 für öffentliche Stellen</li>
                              <li>• UWG bei Wettbewerbsverzerrung</li>
                              <li>• AGG Benachteiligungsverbot</li>
                            </ul>
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
                  <span className={getScoreColor(getCurrentAccessibilityData()?.score || 0)}>
                    {(getCurrentAccessibilityData()?.score || 0) > 0 ? `${getCurrentAccessibilityData()?.score || 0}/100` : '—/100'}
                  </span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full flex items-center justify-center ${
                      (getCurrentAccessibilityData()?.score || 0) >= 95 ? 'progress-accessibility-compliant' : 'progress-accessibility-non-compliant'
                    }`}
                    style={{ width: `${getCurrentAccessibilityData()?.score || 0}%` }}
                  >
                    {(getCurrentAccessibilityData()?.score || 0) > 0 && (
                      <span className="text-xs font-medium text-white">
                        {getCurrentAccessibilityData()?.score || 0}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Violations */}
              {(getCurrentAccessibilityData()?.violations?.length || 0) > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Gefundene Probleme ({getCurrentAccessibilityData()?.violations?.length || 0})
                    </CardTitle>
                    <CardDescription>
                      Diese Punkte sollten behoben werden, um die Barrierefreiheit zu verbessern
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(getCurrentAccessibilityData()?.violations || []).map((violation: AccessibilityViolation, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border-l-4 ${getImpactColor(violation.impact)}`}
                        >
                          <div className="flex items-start gap-3">
                            {getImpactIcon(violation.impact)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-foreground">
                                  {violation.description}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {violation.wcagCriterion}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {violation.help}
                              </p>
                              <div className="flex items-center gap-2 mb-3">
                                <Badge 
                                  variant={violation.impact === 'critical' ? 'destructive' : 'outline'} 
                                  className="text-xs"
                                >
                                  {violation.impact}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  WCAG {violation.wcagLevel}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {violation.nodes.length} Element(e) betroffen
                                </span>
                              </div>
                              {violation.nodes[0]?.failureSummary && (
                                <p className="text-xs text-muted-foreground mb-2 font-mono bg-muted/50 p-2 rounded">
                                  {violation.nodes[0].failureSummary}
                                </p>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(violation.helpUrl, '_blank')}
                                className="text-xs"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                WCAG Guideline
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* WCAG-konforme Handlungsempfehlungen */}
              <Card className="border-accent">
                <CardHeader>
                  <CardTitle className="text-lg text-accent flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    WCAG 2.1 Handlungsempfehlungen
                  </CardTitle>
                  <CardDescription>
                    Prioritätsliste zur Verbesserung der Barrierefreiheit nach internationalen Standards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-destructive" />
                        Kritische Probleme (Level A):
                      </h4>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Alt-Texte für alle informativen Bilder</li>
                        <li>• Label oder aria-label für Formularfelder</li>
                        <li>• Tastaturnavigation für alle Funktionen</li>
                        <li>• Skip-Links zur Hauptnavigation</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Wichtige Verbesserungen (Level AA):
                      </h4>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Farbkontrast minimum 4.5:1</li>
                        <li>• Logische Überschriftenstruktur</li>
                        <li>• Fokus-Indikatoren sichtbar machen</li>
                        <li>• Zoom bis 200% ohne Datenverlust</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-accent" />
                        Erweiterte Optimierung (Level AAA):
                      </h4>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>• Enhanced Farbkontrast 7:1</li>
                        <li>• Animationen deaktivierbar</li>
                        <li>• Einfache Sprache verwenden</li>
                        <li>• Kontexthilfen anbieten</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                    <h4 className="font-semibold text-accent mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Testing-Empfehlungen:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Automatisierte Tests mit axe-core</li>
                        <li>• Manuelle Tastaturnavigation</li>
                        <li>• Screen Reader Testing (NVDA/JAWS)</li>
                      </ul>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Farbkontrast-Analyzer verwenden</li>
                        <li>• Mobile Accessibility prüfen</li>
                        <li>• Nutzer mit Behinderungen einbeziehen</li>
                      </ul>
                    </div>
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
            );
          })()}
            </TabsContent>
            
            <TabsContent value="manual" className="mt-6">
              <ManualAccessibilityInput 
                onSave={updateManualAccessibilityData}
                initialData={manualAccessibilityData}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilityAnalysis;