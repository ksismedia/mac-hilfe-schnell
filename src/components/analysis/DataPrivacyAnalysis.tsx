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

              {/* DSGVO Section */}
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <Scale className="h-5 w-5" />
                    DSGVO-Konformität
                    <div 
                      className={`ml-auto flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                        getEffectiveScore() >= 81 ? 'bg-yellow-400 text-black' : 
                        getEffectiveScore() >= 61 ? 'bg-green-500 text-white' : 
                        'bg-red-500 text-white'
                      }`}
                    >
                      {getEffectiveScore()}%
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Bewertung nach DSGVO Art. 5-22, ePrivacy-VO und TTDSG
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Legal Warning for GDPR Violations specifically in GDPR section */}
                  {getAllViolations().some(v => v.severity === 'high' || v.severity === 'critical') && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        RECHTLICHER HINWEIS: DSGVO-Verstöße erkannt
                      </div>
                      <p className="text-red-700 text-sm mb-3">
                        <strong>Warnung:</strong> Die automatisierte Analyse hat rechtlich relevante DSGVO-Probleme identifiziert.
                      </p>
                      <div className="bg-red-100 border border-red-300 rounded p-3 text-red-800 text-sm">
                        <AlertTriangle className="h-4 w-4 inline mr-2" />
                        <strong>Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Website oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
                      </div>
                      <div className="mt-3 text-red-800 text-sm font-semibold">
                        <strong>Bußgeldrisiko</strong>
                      </div>
                      <p className="text-red-700 text-sm">
                        Bei den identifizierten Verstößen drohen Bußgelder bis zu <strong>20 Millionen Euro</strong> oder <strong>4% des Jahresumsatzes</strong>.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getScoreColor(getEffectiveScore())} mb-2`}>
                        {getEffectiveScore()}%
                      </div>
                      <Badge variant={getScoreBadge(getEffectiveScore())}>
                        {privacyData.gdprComplianceLevel}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>DSGVO-Verstöße:</span>
                        <span className="text-destructive font-semibold">{getAllViolations().length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bußgeldrisiko:</span>
                        <span className="text-warning">{privacyData.legalRisk.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rechtliches Risiko:</span>
                        <span>{privacyData.legalRisk.potentialFine}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>DSGVO-Konformität</span>
                      <span className={getScoreColor(getEffectiveScore())}>
                        {getEffectiveScore()}/100
                      </span>
                    </div>
                    <Progress value={getEffectiveScore()} className="h-3" />
                  </div>

                  {/* DSGVO Parameters */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Untersuchte DSGVO-Parameter
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Art. 7 - Einwilligung</span>
                          <span className={`${privacyData.hasConsentBanner ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData.hasConsentBanner ? 'Vorhanden' : 'Fehlend'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Art. 13-14 - Informationspflichten</span>
                          <span className={`${privacyData.hasPrivacyPolicy ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData.hasPrivacyPolicy ? 'Erfüllt' : 'Mangelhaft'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Art. 44-49 - Drittlandtransfer</span>
                          <span className={`${privacyData.trackingScripts.some(s => s.thirdCountryTransfer) ? 'text-red-600' : 'text-green-600'} font-semibold`}>
                            {privacyData.trackingScripts.some(s => s.thirdCountryTransfer) ? 'Risiko erkannt' : 'Konform'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Tracking-Scripts</span>
                          <span className="font-semibold">{privacyData.trackingScripts.length} erkannt</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Externe Services</span>
                          <span className="font-semibold">{privacyData.externalServices.length} geprüft</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Rechtsbasis</span>
                          <span className={`${getAllViolations().some(v => v.category === 'consent') ? 'text-red-600' : 'text-green-600'} font-semibold`}>
                            {getAllViolations().some(v => v.category === 'consent') ? 'Lückenhaft' : 'Dokumentiert'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Datenschutz Section */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Shield className="h-5 w-5" />
                    Datenschutz & Technische Sicherheit
                    <div 
                      className={`ml-auto flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                        getEffectiveScore() >= 81 ? 'bg-yellow-400 text-black' : 
                        getEffectiveScore() >= 61 ? 'bg-green-500 text-white' : 
                        'bg-red-500 text-white'
                      }`}
                    >
                      {getEffectiveScore()}%
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Technische Sicherheitsmaßnahmen und Cookie-Compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {privacyData.sslRating}
                      </div>
                      <div className="text-sm text-muted-foreground">SSL-Rating</div>
                      <Lock className="h-4 w-4 mx-auto text-green-600 mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-warning mb-2">
                        {privacyData.cookieCount}
                      </div>
                      <div className="text-sm text-muted-foreground">Cookies gefunden</div>
                      <Cookie className="h-4 w-4 mx-auto text-warning mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {privacyData.cookies.filter(c => c.category === 'strictly-necessary').length}
                      </div>
                      <div className="text-sm text-muted-foreground">Notwendige Cookies</div>
                      <CheckCircle className="h-4 w-4 mx-auto text-green-600 mt-1" />
                    </div>
                  </div>

                  {/* Cookie Compliance Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cookie-Management (TTDSG) <span className="text-xs text-muted-foreground">(Rechtskonformes Einholen und Verwalten von Cookie-Einwilligungen nach deutschem TTDSG, z. B. über Consent-Banner mit Auswahlmöglichkeit)</span></span>
                      <span className="text-green-600">
                        {Math.round((privacyData.cookies.filter(c => c.category === 'strictly-necessary').length / privacyData.cookieCount) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(privacyData.cookies.filter(c => c.category === 'strictly-necessary').length / privacyData.cookieCount) * 100} 
                      className="h-3" 
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      <p><strong>Bewertung:</strong> Anteil technisch notwendiger Cookies vs. Tracking-Cookies</p>
                    </div>
                  </div>

                  {/* Technical Parameters */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
                      <Settings className="h-4 w-4" />
                      Untersuchte Datenschutz-Parameter
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>HTTPS-Verschlüsselung <span className="text-xs text-muted-foreground">(Sichere SSL/TLS-Verbindung, die Datenübertragung vor unbefugtem Zugriff schützt und Voraussetzung für DSGVO-Konformität ist)</span></span>
                          <span className={`${privacyData.sslRating !== 'F' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData.sslRating}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cookie-Banner</span>
                          <span className={`${privacyData.hasConsentBanner ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData.hasConsentBanner ? 'Implementiert' : 'Nicht vorhanden'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cookie-Policy</span>
                          <span className={`${privacyData.hasCookiePolicy ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData.hasCookiePolicy ? 'Vorhanden' : 'Fehlend'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Analytics-Cookies</span>
                          <span className="font-semibold text-orange-600">
                            {privacyData.cookies.filter(c => c.category === 'analytics').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Marketing-Cookies</span>
                          <span className="font-semibold text-red-600">
                            {privacyData.cookies.filter(c => c.category === 'marketing').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Impressum</span>
                          <span className={`${privacyData.hasImprint ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData.hasImprint ? 'Vorhanden' : 'Fehlend'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                                  <Info className="h-4 w-4 text-gray-500 mt-1" />
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
                                      <p className="text-sm text-gray-600">
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
                                <Info className="h-4 w-4 text-gray-500 mt-1" />
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
                                    <p className="text-sm text-gray-600">
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