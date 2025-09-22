import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Cookie, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Lock,
  Eye,
  FileText,
  Zap,
  Globe,
  Scale,
  BookOpen,
  AlertCircle,
  Info,
  Settings,
  Edit
} from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { DataPrivacyService, DataPrivacyResult, GDPRViolation } from '@/services/DataPrivacyService';
import { ManualDataPrivacyData } from '@/hooks/useManualData';
import ManualDataPrivacyInput from './ManualDataPrivacyInput';

interface DataPrivacyAnalysisProps {
  businessData: {
    url: string;
  };
  realData?: RealBusinessData;
  savedData?: DataPrivacyResult;
  onDataChange?: (data: DataPrivacyResult) => void;
  manualDataPrivacyData?: ManualDataPrivacyData | null;
  onManualDataChange?: (data: ManualDataPrivacyData) => void;
}

const DataPrivacyAnalysis: React.FC<DataPrivacyAnalysisProps> = ({ 
  businessData, 
  realData, 
  savedData, 
  onDataChange,
  manualDataPrivacyData,
  onManualDataChange
}) => {
  const [privacyData, setPrivacyData] = useState<DataPrivacyResult | null>(savedData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrivacyAnalysis = async () => {
    if (!businessData.url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starte DSGVO-konforme Datenschutzanalyse...');
      const result = await DataPrivacyService.analyzeDataPrivacy(businessData.url, realData);
      
      setPrivacyData(result);
      onDataChange?.(result);
      console.log('Datenschutzanalyse abgeschlossen:', result);
    } catch (err) {
      const errorMessage = 'Fehler bei der Datenschutzprüfung: ' + (err as Error).message;
      setError(errorMessage);
      console.error('Datenschutz-Test Fehler:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate effective score considering manual overrides and violation changes
  const getEffectiveScore = () => {
    // If manual score override is set, use it
    if (manualDataPrivacyData?.overallScore !== undefined) {
      return manualDataPrivacyData.overallScore;
    }
    
    // Otherwise calculate dynamic score based on violations AND manual parameters
    if (!privacyData) return 0;
    
    let baseScore = privacyData.score;
    const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
    const customViolations = manualDataPrivacyData?.customViolations || [];
    
    // Add bonus points for manual positive settings
    let manualBonus = 0;
    if (manualDataPrivacyData?.hasSSL) manualBonus += 5;
    if (manualDataPrivacyData?.privacyPolicy) manualBonus += 10;
    if (manualDataPrivacyData?.cookiePolicy) manualBonus += 8;
    if (manualDataPrivacyData?.legalImprint) manualBonus += 10;
    if (manualDataPrivacyData?.gdprCompliant) manualBonus += 15;
    if (manualDataPrivacyData?.cookieConsent) manualBonus += 12;
    if (manualDataPrivacyData?.dataProcessingAgreement) manualBonus += 8;
    if (manualDataPrivacyData?.dataSubjectRights) manualBonus += 7;
    
    // Add points for deselected violations (removing violations improves score)
    const deselectedCount = deselectedViolations.length;
    const scoreBonus = deselectedCount * 8; // 8 points per deselected violation
    
    // Subtract points for custom violations (adding violations worsens score)
    let violationPenalty = 0;
    customViolations.forEach(violation => {
      if (violation.severity === 'high') violationPenalty += 15;
      else if (violation.severity === 'medium') violationPenalty += 10;
      else violationPenalty += 5;
    });
    
    // Calculate adjusted score including manual parameters
    const adjustedScore = Math.max(0, Math.min(100, baseScore + manualBonus + scoreBonus - violationPenalty));
    return Math.round(adjustedScore);
  };

  useEffect(() => {
    if (privacyData && onDataChange) {
      const effectiveScore = getEffectiveScore();
      const activeViolations = getAllViolations();
      
      // Always update when manual data changes to ensure export gets correct score and violations
      const updatedData = {
        ...privacyData,
        score: effectiveScore,
        activeViolations: activeViolations // Add active violations for export
      };
      onDataChange(updatedData);
    }
  }, [
    manualDataPrivacyData?.deselectedViolations, 
    manualDataPrivacyData?.customViolations, 
    manualDataPrivacyData?.overallScore, 
    manualDataPrivacyData?.hasSSL, 
    manualDataPrivacyData?.privacyPolicy, 
    manualDataPrivacyData?.cookiePolicy, 
    manualDataPrivacyData?.legalImprint, 
    manualDataPrivacyData?.gdprCompliant, 
    manualDataPrivacyData?.cookieConsent, 
    manualDataPrivacyData?.dataProcessingAgreement, 
    manualDataPrivacyData?.dataSubjectRights, 
    privacyData?.violations
  ]);

  // Initial update when privacyData is first loaded
  useEffect(() => {
    if (privacyData && onDataChange && !manualDataPrivacyData?.overallScore) {
      const effectiveScore = getEffectiveScore();
      const activeViolations = getAllViolations();
      
      const updatedData = {
        ...privacyData,
        score: effectiveScore,
        activeViolations: activeViolations
      };
      onDataChange(updatedData);
    }
  }, [privacyData]);

  // DSGVO-konforme Score-Darstellung
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-text-medium';    
    if (score >= 60) return 'score-text-high';      
    return 'score-text-low';                        
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';              
    if (score >= 60) return 'secondary';            
    return 'destructive';                           
  };

  // Handle violation deselection
  const toggleViolationSelection = (violationIndex: number) => {
    if (!onManualDataChange) return;
    
    const violationId = `auto-${violationIndex}`;
    const currentDeselected = manualDataPrivacyData?.deselectedViolations || [];
    
    const newDeselected = currentDeselected.includes(violationId)
      ? currentDeselected.filter(id => id !== violationId)
      : [...currentDeselected, violationId];
    
    const updatedManualData: ManualDataPrivacyData = {
      ...manualDataPrivacyData,
      hasSSL: manualDataPrivacyData?.hasSSL ?? true,
      cookiePolicy: manualDataPrivacyData?.cookiePolicy ?? false,
      privacyPolicy: manualDataPrivacyData?.privacyPolicy ?? false,
      legalImprint: manualDataPrivacyData?.legalImprint ?? false,
      gdprCompliant: manualDataPrivacyData?.gdprCompliant ?? false,
      cookieConsent: manualDataPrivacyData?.cookieConsent ?? false,
      dataProcessingAgreement: manualDataPrivacyData?.dataProcessingAgreement ?? false,
      dataSubjectRights: manualDataPrivacyData?.dataSubjectRights ?? false,
      customViolations: manualDataPrivacyData?.customViolations ?? [],
      overallScore: manualDataPrivacyData?.overallScore,
      deselectedViolations: newDeselected
    };
    
    onManualDataChange(updatedManualData);
  };

  // Get filtered violations (excluding deselected ones)
  const getActiveViolations = () => {
    if (!privacyData?.violations) return [];
    
    const deselected = manualDataPrivacyData?.deselectedViolations || [];
    return privacyData.violations.filter((_, index) => 
      !deselected.includes(`auto-${index}`)
    );
  };

  // Get all violations including custom ones
  const getAllViolations = () => {
    const autoViolations = getActiveViolations();
    const customViolations = manualDataPrivacyData?.customViolations || [];
    return [...autoViolations, ...customViolations];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-accent" />
            Datenschutz & DSGVO-Compliance
          </CardTitle>
          <CardDescription>
            Wasserdichte Analyse nach DSGVO Art. 5-22, ePrivacy-VO und TTDSG
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!privacyData && !loading && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-accent mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                DSGVO-Compliance prüfen
              </h3>
              <p className="text-muted-foreground mb-4">
                Rechtssichere Datenschutzanalyse mit Bußgeld-Risikobewertung
              </p>
              <Button onClick={runPrivacyAnalysis} className="bg-accent hover:bg-accent/90">
                <Shield className="h-4 w-4 mr-2" />
                Jetzt prüfen
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                DSGVO-Analyse läuft...
              </h3>
              <p className="text-muted-foreground">
                Prüfe Cookies, Tracking-Scripts und Rechtsverstöße
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-lg font-semibold text-destructive mb-2">
                Fehler bei der Analyse
              </h3>
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={runPrivacyAnalysis} variant="outline">
                Erneut versuchen
              </Button>
            </div>
          )}

          {privacyData && (
            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analysis">Automatische Analyse</TabsTrigger>
                <TabsTrigger value="manual">Manuelle Eingabe</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis" className="space-y-6">
                {/* Legal Warning for Data Privacy Issues */}
                {(getAllViolations().length > 0 || getEffectiveScore() < 90) && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                      <Scale className="h-5 w-5" />
                      Rechtlicher Hinweis: DSGVO-Verstöße erkannt
                    </div>
                    <p className="text-red-700 text-sm mb-3">
                      Die automatisierte Analyse hat rechtlich relevante Datenschutz-Probleme identifiziert. 
                      Bei DSGVO-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
                    </p>
                    <div className="bg-red-100 border border-red-300 rounded p-3 text-red-800 text-sm">
                      <strong>⚠️ Empfehlung:</strong> Konsultieren Sie umgehend einen spezialisierten Datenschutz-Anwalt 
                      für eine rechtssichere Bewertung und zur Vermeidung von Bußgeldern.
                    </div>
                  </div>
                )}

              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-accent">
                  <CardContent className="p-6 text-center">
                    <div className={`text-5xl font-bold ${getScoreColor(getEffectiveScore())} mb-2`}>
                      {getEffectiveScore()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      DSGVO-Score
                      {manualDataPrivacyData?.overallScore !== undefined && (
                        <span className="text-accent ml-1">(manuell)</span>
                      )}
                    </div>
                    <Badge variant={getScoreBadge(getEffectiveScore())} className="mt-2">
                      {privacyData.gdprComplianceLevel}
                    </Badge>
                  </CardContent>
                </Card>
                
                <Card className="border-warning">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-warning mb-2">
                      {privacyData.cookieCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Cookies</div>
                    <div className="text-xs text-warning mt-1">
                      TTDSG-Prüfung
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-destructive mb-2">
                      {getAllViolations().length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      DSGVO-Verstöße
                      {(manualDataPrivacyData?.customViolations?.length || 0) > 0 && (
                        <span className="text-accent ml-1">
                          (+{manualDataPrivacyData?.customViolations?.length} manuell)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-destructive mt-1">
                      Rechtliches Risiko
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-accent">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl font-bold text-accent mb-2">
                      {privacyData.sslRating}
                    </div>
                    <div className="text-sm text-muted-foreground">SSL-Rating</div>
                    <Lock className="h-4 w-4 mx-auto text-accent mt-1" />
                  </CardContent>
                </Card>
              </div>

              {/* Progress Bar with detailed explanation */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>DSGVO-Konformität</span>
                    <span className={getScoreColor(getEffectiveScore())}>
                      {getEffectiveScore()}/100 - Bußgeldrisiko: {privacyData.legalRisk.potentialFine}
                    </span>
                  </div>
                  <Progress value={getEffectiveScore()} className="h-3" />
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <p><strong>Bewertungslogik:</strong></p>
                    <ul className="space-y-1 ml-4">
                      <li>• 90-100%: Vollständige DSGVO-Konformität erreicht</li>
                      <li>• 70-89%: Grundlegende Compliance mit kleineren Mängeln</li>
                      <li>• 50-69%: Wesentliche Verbesserungen erforderlich</li>
                      <li>• Unter 50%: Kritische Defizite mit hohem Bußgeldrisiko</li>
                    </ul>
                    <p className="mt-2"><strong>Einflussfaktoren:</strong> SSL-Verschlüsselung (+5), Datenschutzerklärung (+10), Cookie-Policy (+8), DSGVO-Konformität (+15), Einwilligungsmanagement (+12)</p>
                    {(manualDataPrivacyData?.deselectedViolations?.length || 0) > 0 && (
                      <p className="text-accent"><strong>Manuelle Anpassung:</strong> {manualDataPrivacyData?.deselectedViolations?.length} Verstöße als nicht zutreffend markiert (+{(manualDataPrivacyData?.deselectedViolations?.length || 0) * 8} Punkte)</p>
                    )}
                  </div>
                </div>

                {/* DSGVO Violations Detail */}
                {getAllViolations().length > 0 && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        DSGVO-Verstöße ({getAllViolations().length})
                        {onManualDataChange && (
                          <span className="text-sm text-muted-foreground ml-2">
                            - Klicken zum Ab-/Auswählen
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Diese Punkte sollten umgehend behoben werden, um Bußgelder zu vermeiden
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Auto-detected violations */}
                        {privacyData.violations.map((violation: GDPRViolation, index: number) => {
                          const isDeselected = manualDataPrivacyData?.deselectedViolations?.includes(`auto-${index}`);
                          return (
                            <div 
                              key={`auto-${index}`}
                              className={`p-4 rounded-lg border-l-4 transition-opacity ${
                                isDeselected ? 'opacity-50' : ''
                              } ${
                                violation.severity === 'high' ? 'border-red-500 bg-red-50' :
                                violation.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                                'border-blue-500 bg-blue-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {onManualDataChange && (
                                  <Checkbox
                                    checked={!isDeselected}
                                    onCheckedChange={() => toggleViolationSelection(index)}
                                    className="mt-1"
                                  />
                                )}
                                {violation.severity === 'high' ? 
                                  <AlertTriangle className="h-4 w-4 text-red-500 mt-1" /> :
                                  violation.severity === 'medium' ?
                                  <AlertCircle className="h-4 w-4 text-yellow-500 mt-1" /> :
                                  <Info className="h-4 w-4 text-blue-500 mt-1" />
                                }
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={
                                      violation.severity === 'high' ? 'destructive' : 
                                      violation.severity === 'medium' ? 'secondary' : 'outline'
                                    }>
                                      {violation.severity === 'high' ? 'Kritisch' : 
                                       violation.severity === 'medium' ? 'Wichtig' : 'Info'}
                                    </Badge>
                                    <span className="text-sm font-medium">
                                      {violation.category}: {violation.description.split('.')[0]}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      Automatisch erkannt
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{violation.description}</p>
                                  {violation.article && (
                                    <p className="text-xs text-gray-500">
                                      <strong>Rechtsgrundlage:</strong> {violation.article}
                                    </p>
                                  )}
                                  {violation.recommendation && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                      <p className="text-sm text-blue-800">
                                        <strong>Lösung:</strong> {violation.recommendation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Custom violations */}
                        {manualDataPrivacyData?.customViolations?.map((violation) => (
                          <div 
                            key={violation.id}
                            className={`p-4 rounded-lg border-l-4 ${
                              violation.severity === 'high' ? 'border-red-500 bg-red-50' :
                              violation.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                              'border-blue-500 bg-blue-50'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {violation.severity === 'high' ? 
                                <AlertTriangle className="h-4 w-4 text-red-500 mt-1" /> :
                                violation.severity === 'medium' ?
                                <AlertCircle className="h-4 w-4 text-yellow-500 mt-1" /> :
                                <Info className="h-4 w-4 text-blue-500 mt-1" />
                              }
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant={
                                    violation.severity === 'high' ? 'destructive' : 
                                    violation.severity === 'medium' ? 'secondary' : 'outline'
                                  }>
                                    {violation.severity === 'high' ? 'Kritisch' : 
                                     violation.severity === 'medium' ? 'Wichtig' : 'Info'}
                                  </Badge>
                                  <span className="text-sm font-medium">
                                    {violation.category}: {violation.description.split('.')[0]}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    Manuell hinzugefügt
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{violation.description}</p>
                                {violation.article && (
                                  <p className="text-xs text-gray-500">
                                    <strong>Rechtsgrundlage:</strong> {violation.article}
                                  </p>
                                )}
                                {violation.recommendation && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                      <strong>Lösung:</strong> {violation.recommendation}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Button */}
                <div className="flex gap-3">
                  <Button 
                    onClick={runPrivacyAnalysis}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    Erneut prüfen
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="manual" className="space-y-6">
                {onManualDataChange && (
                  <ManualDataPrivacyInput
                    data={manualDataPrivacyData}
                    onDataChange={onManualDataChange}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPrivacyAnalysis;