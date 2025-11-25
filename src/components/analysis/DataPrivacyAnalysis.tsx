import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Edit,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { DataPrivacyService, DataPrivacyResult, GDPRViolation } from '@/services/DataPrivacyService';
import { ManualDataPrivacyData } from '@/hooks/useManualData';
import { useExtensionData } from '@/hooks/useExtensionData';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import ManualDataPrivacyInput from './ManualDataPrivacyInput';
import { SafeBrowsingResult, SafeBrowsingService } from '@/services/SafeBrowsingService';
import { calculateDataPrivacyScore } from './export/scoreCalculations';

interface DataPrivacyAnalysisProps {
  businessData: {
    url: string;
  };
  realData?: RealBusinessData;
  savedData?: DataPrivacyResult;
  onDataChange?: (data: DataPrivacyResult) => void;
  manualDataPrivacyData?: ManualDataPrivacyData | null;
  onManualDataChange?: (data: ManualDataPrivacyData) => void;
  securityData?: SafeBrowsingResult | null;
  onSecurityDataChange?: (data: SafeBrowsingResult) => void;
}

const DataPrivacyAnalysis: React.FC<DataPrivacyAnalysisProps> = ({ 
  businessData, 
  realData, 
  savedData, 
  onDataChange,
  manualDataPrivacyData,
  onManualDataChange,
  securityData,
  onSecurityDataChange
}) => {
  const { extensionData } = useExtensionData();
  const { savedExtensionData } = useAnalysisContext();
  const [privacyData, setPrivacyData] = useState<DataPrivacyResult | null>(savedData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [securityLoading, setSecurityLoading] = useState(false);
  
  // Use live extension data or fallback to saved extension data
  const activeExtensionData = extensionData || savedExtensionData;
  
  // Get extension technical data
  const hasExtensionData = activeExtensionData !== null;
  const hasPrivacyPolicyDetected = activeExtensionData?.technical?.hasPrivacyPolicy;
  const hasContactFormDetected = activeExtensionData?.technical?.hasContactForm;

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

  const runSecurityCheck = async () => {
    if (!businessData.url) return;
    
    setSecurityLoading(true);
    
    try {
      console.log('Starte Safe Browsing-Prüfung...');
      const result = await SafeBrowsingService.checkUrl(businessData.url);
      onSecurityDataChange?.(result);
      console.log('Safe Browsing-Prüfung abgeschlossen:', result);
    } catch (err) {
      console.error('Safe Browsing-Prüfung Fehler:', err);
    } finally {
      setSecurityLoading(false);
    }
  };

  useEffect(() => {
    // Auto-load security check on mount if no data exists
    if (!securityData && businessData.url && onSecurityDataChange) {
      runSecurityCheck();
    }
  }, [businessData.url]);


  // Calculate DSGVO score with ABSOLUTE ENFORCEMENT of cap
  const getDSGVOScore = () => {
    let score = calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData);
    
    // BRUTALE KAPPUNG: Zähle kritische Violations DIREKT hier
    if (privacyData?.violations) {
      const deselected = manualDataPrivacyData?.deselectedViolations || [];
      let criticalCount = 0;
      
      // Zähle nicht-deselektierte kritische Violations
      privacyData.violations.forEach((v: any, i: number) => {
        if (v.severity === 'critical' && !deselected.includes(`auto-${i}`)) {
          criticalCount++;
        }
      });
      
      // Zähle custom kritische Violations
      if (manualDataPrivacyData?.customViolations) {
        manualDataPrivacyData.customViolations.forEach((v: any) => {
          if (v.severity === 'critical') {
            criticalCount++;
          }
        });
      }
      
      // ERZWINGE Kappung - NICHT VERHANDELBAR
      if (criticalCount >= 3) {
        score = Math.min(20, score);
      } else if (criticalCount === 2) {
        score = Math.min(35, score);
      } else if (criticalCount === 1) {
        score = Math.min(59, score);
      }
    }
    
    return score;
  };

  // Calculate Technical Security score
  const getTechnicalSecurityScore = () => {
    if (!privacyData) return 0;
    
    // Check if cookie banner is present based on:
    // 1. Automatic detection
    // 2. Manual override: if "no cookie banner" violation is deselected AND manual checkboxes indicate compliance
    const autoCookieBanner = privacyData?.realApiData?.cookieBanner?.detected || false;
    const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
    const totalViolations = privacyData?.violations || [];
    
    // Find the "no cookie banner" violation
    const noCookieBannerViolationIndex = totalViolations.findIndex(v => 
      v.description?.includes('Cookie-Consent-Banner') || 
      v.description?.includes('Cookie-Banner')
    );
    
    const cookieBannerViolationDeselected = noCookieBannerViolationIndex >= 0 && 
      deselectedViolations.includes(`auto-${noCookieBannerViolationIndex}`);
    
    // Check manual cookie compliance indicators
    const manualCookieCompliance = manualDataPrivacyData?.cookiePolicy || 
                                   manualDataPrivacyData?.cookieConsent;
    
    // Cookie banner is considered present if:
    // - Auto-detected OR
    // - The "no banner" violation was deselected AND manual data indicates compliance
    const hasCookieBanner = autoCookieBanner || 
                           (cookieBannerViolationDeselected && manualCookieCompliance);
    
    const sslGrade = privacyData?.sslRating;
    const securityHeaders = privacyData?.realApiData?.securityHeaders;
    const hasHSTS = securityHeaders?.headers?.['Strict-Transport-Security']?.present || 
                     privacyData?.realApiData?.ssl?.hasHSTS;
    
    // Check for critical technical issues
    const hasCriticalIssues = 
      (sslGrade && ['D', 'E', 'F', 'T'].includes(sslGrade)) ||
      !hasHSTS;
    
    // If cookie banner exists and critical issues exist → 59%
    if (hasCookieBanner && hasCriticalIssues) {
      return 59;
    }
    
    // If cookie banner exists and NO critical issues → calculate normally
    if (hasCookieBanner && !hasCriticalIssues) {
      let score = 0;
      let componentCount = 0;
      
      if (sslGrade) {
        componentCount++;
        const sslScore = (() => {
          switch (sslGrade) {
            case 'A+': return 100;
            case 'A': return 95;
            case 'B': return 80;
            case 'C': return 70;
            default: return 60;
          }
        })();
        score += sslScore * 0.6;
      }
      
      if (securityHeaders) {
        componentCount++;
        const headers = securityHeaders.headers || {};
        const csp = headers['Content-Security-Policy']?.present;
        const xFrame = headers['X-Frame-Options']?.present;
        const xContent = headers['X-Content-Type-Options']?.present;
        const referrer = headers['Referrer-Policy']?.present;
        
        const presentHeaders = [csp, xFrame, xContent, hasHSTS, referrer].filter(Boolean).length;
        const headerScore = Math.round((presentHeaders / 5) * 100);
        score += headerScore * 0.4;
      }
      
      return componentCount > 0 ? Math.round(score) : 0;
    }
    
    // If cookie banner does NOT exist → less than 59%
    let score = 40; // Base score without cookie banner
    
    // SSL adjustment
    if (sslGrade) {
      const sslBonus = (() => {
        switch (sslGrade) {
          case 'A+': return 15;
          case 'A': return 10;
          case 'B': return 5;
          case 'C': return 0;
          case 'D': return -10;
          case 'E': return -15;
          case 'F': return -20;
          case 'T': return -25;
          default: return 0;
        }
      })();
      score += sslBonus;
    }
    
    // HSTS adjustment
    if (hasHSTS) {
      score += 5;
    } else {
      score -= 5;
    }
    
    return Math.max(0, Math.min(58, score)); // Cap at 58% max without cookie banner
  };

  // Check if there are critical violations despite positive score
  const hasCriticalViolationsWithPositiveScore = () => {
    const score = getDSGVOScore();
    const criticalViolations = getAllViolations().filter(v => v.severity === 'critical');
    return score > 0 && criticalViolations.length > 0;
  };

  useEffect(() => {
    if (privacyData && onDataChange) {
      const effectiveScore = getDSGVOScore();
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
    manualDataPrivacyData?.gdprCompliant, 
    manualDataPrivacyData?.cookieConsent, 
    manualDataPrivacyData?.dataProcessingAgreement, 
    manualDataPrivacyData?.dataSubjectRights, 
    privacyData?.violations
  ]);

  // Initial update when privacyData is first loaded
  useEffect(() => {
    if (privacyData && onDataChange && !manualDataPrivacyData?.overallScore) {
      const effectiveScore = getDSGVOScore();
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
          {/* Extension-Daten Anzeige */}
          {hasExtensionData && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                {hasPrivacyPolicyDetected ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Chrome Extension hat Datenschutzerklärung erkannt
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Chrome Extension hat keine Datenschutzerklärung erkannt
                    </span>
                  </>
                )}
              </div>
              {hasContactFormDetected !== undefined && (
                <div className="flex items-center gap-2">
                  {hasContactFormDetected ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-700">
                        Kontaktformular vorhanden
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-blue-700">
                      Kein Kontaktformular gefunden
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          
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
                {(getAllViolations().length > 0 || getDSGVOScore() < 90) && (
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
                        getDSGVOScore() >= 90 ? 'bg-yellow-400 text-black' : 
                        getDSGVOScore() >= 61 ? 'bg-green-500 text-white' : 
                        'bg-red-500 text-white'
                      }`}
                    >
                      {getDSGVOScore()}%
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
                      <div className={`text-4xl font-bold ${getScoreColor(getDSGVOScore())} mb-2`}>
                        {getDSGVOScore()}%
                      </div>
                      <Badge variant={getScoreBadge(getDSGVOScore())}>
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

                  {/* Warning Alert for Critical Violations despite positive score */}
                  {hasCriticalViolationsWithPositiveScore() && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Achtung: Kritische Sicherheitsmängel erkannt</AlertTitle>
                      <AlertDescription>
                        Trotz eines positiven Scores wurden kritische Verstöße identifiziert (z.B. fehlender HSTS-Header). 
                        Diese können zu erheblichen Sicherheitsrisiken und DSGVO-Bußgeldern führen und sollten unverzüglich behoben werden.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>DSGVO-Konformität</span>
                      <span className={getScoreColor(getDSGVOScore())}>
                        {getDSGVOScore()}/100
                      </span>
                    </div>
                    <Progress value={getDSGVOScore()} className="h-3" />
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

              {/* Website Security (Safe Browsing) Section */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <ShieldAlert className="h-5 w-5" />
                    Website-Sicherheit (Google Safe Browsing)
                    <div 
                      className={`ml-auto flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                        !securityData ? 'bg-gray-400 text-white' :
                        securityData.isSafe === true ? 'bg-green-500 text-white' :
                        securityData.isSafe === false ? 'bg-red-500 text-white' :
                        'bg-gray-400 text-white'
                      }`}
                    >
                      {!securityData ? 'N/A' :
                       securityData.isSafe === true ? '100%' :
                       securityData.isSafe === false ? '0%' :
                       '50%'}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Prüfung auf Malware, Phishing und schädliche Inhalte
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {securityLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Prüfe Website-Sicherheit...</p>
                    </div>
                  ) : !securityData ? (
                    <div className="text-center py-4">
                      <Button onClick={runSecurityCheck} variant="outline">
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        Sicherheitsprüfung starten
                      </Button>
                    </div>
                  ) : (
                    <>
                      {securityData.isSafe === true ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">Keine Bedrohungen gefunden</AlertTitle>
                          <AlertDescription className="text-green-700">
                            Die Website wurde von Google Safe Browsing als sicher eingestuft. Es wurden keine Malware, Phishing-Versuche oder andere schädliche Inhalte erkannt.
                          </AlertDescription>
                        </Alert>
                      ) : securityData.isSafe === false ? (
                        <>
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Sicherheitsbedrohungen erkannt!</AlertTitle>
                            <AlertDescription>
                              Google Safe Browsing hat {securityData.threats.length} Bedrohung{securityData.threats.length > 1 ? 'en' : ''} auf dieser Website identifiziert.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-destructive">Erkannte Bedrohungen:</h4>
                            {securityData.threats.map((threat: any, index: number) => (
                              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                  <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold text-red-800">{threat.type}</p>
                                    <p className="text-sm text-red-700">{threat.description}</p>
                                    <p className="text-xs text-red-600 mt-1">Plattform: {threat.platform}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-red-100 border border-red-300 rounded p-3 text-red-800 text-sm">
                            <strong>⚠️ Dringende Handlungsempfehlung:</strong> Kontaktieren Sie umgehend einen IT-Sicherheitsexperten, um die identifizierten Bedrohungen zu beseitigen. Der Betrieb einer Website mit erkannten Sicherheitsbedrohungen kann rechtliche Konsequenzen haben und das Vertrauen Ihrer Kunden gefährden.
                          </div>
                        </>
                      ) : (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertTitle>Status unbekannt</AlertTitle>
                          <AlertDescription>
                            Der Sicherheitsstatus konnte nicht eindeutig ermittelt werden. {securityData.error && `Fehler: ${securityData.error}`}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Letzte Prüfung: {new Date(securityData.checkedAt).toLocaleString('de-DE')}</p>
                      </div>
                      
                      <Button onClick={runSecurityCheck} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Erneut prüfen
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Technical Security Section */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Shield className="h-5 w-5" />
                    Datenschutz & Technische Sicherheit
                    <div 
                      className={`ml-auto flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                        getTechnicalSecurityScore() >= 90 ? 'bg-yellow-400 text-black' : 
                        getTechnicalSecurityScore() >= 61 ? 'bg-green-500 text-white' : 
                        'bg-red-500 text-white'
                      }`}
                    >
                      {getTechnicalSecurityScore()}%
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
                        {privacyData.cookieCount + (manualDataPrivacyData?.manualCookies?.length || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cookies gesamt
                        {(manualDataPrivacyData?.manualCookies?.length || 0) > 0 && (
                          <span className="block text-xs text-blue-600">
                            ({manualDataPrivacyData?.manualCookies?.length || 0} manuell)
                          </span>
                        )}
                      </div>
                      <Cookie className="h-4 w-4 mx-auto text-warning mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {privacyData.cookies.filter(c => c.category === 'strictly-necessary').length + 
                         (manualDataPrivacyData?.manualCookies?.filter(c => c.category === 'strictly-necessary').length || 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Notwendige Cookies</div>
                      <CheckCircle className="h-4 w-4 mx-auto text-green-600 mt-1" />
                    </div>
                  </div>

                  {/* Cookie Compliance Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Cookie-Einwilligung (TTDSG § 25)</span>
                      <span className={`font-semibold ${(() => {
                        const activeViolations = getActiveViolations();
                        const hasCookieViolations = activeViolations.some(v => v.cookieRelated);
                        let cookieScore: number;
                        
                        if (manualDataPrivacyData?.cookieConsent) {
                          cookieScore = 90;
                        } else if (!hasCookieViolations) {
                          cookieScore = 100;
                        } else {
                          cookieScore = Math.max(30, Math.round((getTechnicalSecurityScore() + 15) * 0.8));
                        }
                        
                        return cookieScore >= 70 ? 'text-green-600' : cookieScore >= 50 ? 'text-yellow-600' : 'text-red-600';
                      })()}`}>
                        {(() => {
                          const activeViolations = getActiveViolations();
                          const hasCookieViolations = activeViolations.some(v => v.cookieRelated);
                          
                          if (manualDataPrivacyData?.cookieConsent) {
                            return '90%';
                          } else if (!hasCookieViolations) {
                            return '100%';
                          } else {
                            return `${Math.max(30, Math.round((getTechnicalSecurityScore() + 15) * 0.8))}%`;
                          }
                        })()}
                      </span>
                    </div>
                    <Progress 
                      value={(() => {
                        const activeViolations = getActiveViolations();
                        const hasCookieViolations = activeViolations.some(v => v.cookieRelated);
                        
                        if (manualDataPrivacyData?.cookieConsent) {
                          return 90;
                        } else if (!hasCookieViolations) {
                          return 100;
                        } else {
                          return Math.max(30, Math.round((getTechnicalSecurityScore() + 15) * 0.8));
                        }
                      })()} 
                      className="h-3" 
                    />
                    <div className="text-xs text-muted-foreground mt-2">
                      <p className="flex items-start gap-1">
                        <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>
                          Rechtskonformes Einholen und Verwalten von Cookie-Einwilligungen, z.B. über einen Consent-Banner mit Auswahlmöglichkeit
                        </span>
                      </p>
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
                          <span>HTTPS-Verschlüsselung</span>
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
                            {privacyData.cookies.filter(c => c.category === 'analytics').length + 
                             (manualDataPrivacyData?.manualCookies?.filter(c => c.category === 'analytics').length || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Marketing-Cookies</span>
                          <span className="font-semibold text-red-600">
                            {privacyData.cookies.filter(c => c.category === 'marketing').length + 
                             (manualDataPrivacyData?.manualCookies?.filter(c => c.category === 'marketing').length || 0)}
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
                    privacyData={privacyData}
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