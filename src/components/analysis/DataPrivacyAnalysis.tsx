import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
// Tabs nicht mehr verwendet - eigene Tab-Logik für Persistenz
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
import { calculateDataPrivacyScore, calculateTechnicalSecurityScore } from './export/scoreCalculations';

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
  const [activeInternalTab, setActiveInternalTab] = useState<'analysis' | 'manual'>('analysis');
  
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
    console.log('🔒 runSecurityCheck aufgerufen, URL:', businessData?.url);
    
    if (!businessData?.url) {
      console.error('❌ Keine URL für Sicherheitsprüfung vorhanden');
      return;
    }
    
    setSecurityLoading(true);
    
    try {
      console.log('🔒 Starte Safe Browsing-Prüfung für:', businessData.url);
      const result = await SafeBrowsingService.checkUrl(businessData.url);
      console.log('✅ Safe Browsing-Prüfung abgeschlossen:', result);
      
      // Immer das Ergebnis speichern
      if (onSecurityDataChange) {
        onSecurityDataChange(result);
        console.log('✅ Security data aktualisiert');
      } else {
        console.warn('⚠️ onSecurityDataChange ist nicht definiert');
      }
    } catch (err) {
      console.error('❌ Safe Browsing-Prüfung Fehler:', err);
      // Bei unerwarteten Fehlern trotzdem ein Ergebnis setzen
      if (onSecurityDataChange) {
        onSecurityDataChange({
          url: businessData.url,
          isSafe: null,
          threats: [],
          checkedAt: new Date().toISOString(),
          error: err instanceof Error ? err.message : 'Unbekannter Fehler'
        });
      }
    } finally {
      setSecurityLoading(false);
    }
  };

  // Automatische Nachprüfung der Security Headers wenn diese fehlen
  const checkSecurityHeadersIfMissing = async () => {
    if (!privacyData?.realApiData?.securityHeaders && businessData.url) {
      console.log('🔄 Security Headers fehlen - führe automatische Nachprüfung durch...');
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase.functions.invoke('check-security-headers', {
          body: { url: businessData.url }
        });
        
        if (data?.success && data?.data) {
          console.log('✅ Security Headers nachgeladen:', data.data);
          // Update privacyData with new security headers
          const updatedPrivacyData = {
            ...privacyData,
            realApiData: {
              ...privacyData?.realApiData,
              securityHeaders: data.data,
              checkedWithRealAPIs: true
            }
          };
          setPrivacyData(updatedPrivacyData as DataPrivacyResult);
          onDataChange?.(updatedPrivacyData as DataPrivacyResult);
        }
      } catch (err) {
        console.error('❌ Fehler beim Nachladen der Security Headers:', err);
      }
    }
  };

  useEffect(() => {
    // Auto-load security check on mount if no data exists
    if (!securityData && businessData.url && onSecurityDataChange) {
      runSecurityCheck();
    }
    
    // Auto-check security headers if missing from saved analysis
    if (privacyData && !privacyData?.realApiData?.securityHeaders) {
      checkSecurityHeadersIfMissing();
    }
  }, [businessData.url, privacyData?.realApiData?.securityHeaders]);


  // Calculate DSGVO score - use centralized function directly
  const getDSGVOScore = () => {
    return calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData);
  };

  // Calculate Technical Security score - use centralized function directly
  const getTechnicalSecurityScore = () => {
    return calculateTechnicalSecurityScore(privacyData, manualDataPrivacyData);
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
    manualDataPrivacyData?.dataProtectionOfficer,
    manualDataPrivacyData?.processingRegister,
    manualDataPrivacyData?.thirdCountryTransfer,
    manualDataPrivacyData?.trackingScripts,
    manualDataPrivacyData?.externalServices,
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
            <div className="w-full">
              {/* Custom Tab Navigation - verhindert Unmounting */}
              <div className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg mb-6">
                <button
                  onClick={() => setActiveInternalTab('analysis')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeInternalTab === 'analysis'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Automatische Analyse
                </button>
                <button
                  onClick={() => setActiveInternalTab('manual')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeInternalTab === 'manual'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Manuelle Eingabe
                </button>
              </div>
              
              {/* Tab Content - BEIDE bleiben gemounted, nur per CSS versteckt */}
              <div className={activeInternalTab === 'analysis' ? 'block space-y-6' : 'hidden'}>
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
                    {(() => {
                      // Berechne den effektiven Score MIT UI-Kappung
                      const deselected = manualDataPrivacyData?.deselectedViolations || [];
                      const allViolations = privacyData?.violations || [];
                      const securityHeaders = privacyData?.realApiData?.securityHeaders;
                      const hasHSTSFromSSL = privacyData?.realApiData?.ssl?.hasHSTS === true;
                      const hasHSTSFromHeaders = securityHeaders?.headers?.['Strict-Transport-Security']?.present === true;
                      const hasHSTS = hasHSTSFromSSL || hasHSTSFromHeaders;
                      
                      let remainingCount = 0;
                      
                      // HSTS fehlt
                      if (securityHeaders && !hasHSTS) remainingCount++;
                      
                      // Auto-Violations (critical/high, nicht neutralisiert, keine Duplikate)
                      const seenDescriptions = new Set<string>();
                      if (securityHeaders && !hasHSTS) seenDescriptions.add('HSTS');
                      
                      allViolations.forEach((v: any, i: number) => {
                        if (!deselected.includes(`auto-${i}`) && (v.severity === 'critical' || v.severity === 'high')) {
                          const isHSTS = v.description?.includes('HSTS') || v.description?.includes('Strict-Transport-Security');
                          const isCookie = v.description?.includes('Cookie') && v.description?.includes('Banner');
                          const isSSL = (v.description?.includes('SSL') || v.description?.includes('TLS')) && !isHSTS;
                          
                          if (isHSTS && seenDescriptions.has('HSTS')) return;
                          if (isCookie && seenDescriptions.has('Cookie')) return;
                          
                          const neutralized = (isSSL && manualDataPrivacyData?.hasSSL) || 
                                            (isCookie && manualDataPrivacyData?.cookieConsent);
                          if (!neutralized) {
                            remainingCount++;
                            if (isCookie) seenDescriptions.add('Cookie');
                          }
                        }
                      });
                      
                      let scoreCap = 100;
                      if (remainingCount >= 3) scoreCap = 20;
                      else if (remainingCount === 2) scoreCap = 35;
                      else if (remainingCount === 1) scoreCap = 59;
                      
                      const effectiveScore = Math.min(getDSGVOScore(), scoreCap);
                      
                      return (
                        <div 
                          className={`ml-auto flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                            effectiveScore >= 90 ? 'bg-yellow-400 text-black' : 
                            effectiveScore >= 61 ? 'bg-green-500 text-white' : 
                            'bg-red-500 text-white'
                          }`}
                        >
                          {effectiveScore}%
                        </div>
                      );
                    })()}
                  </CardTitle>
                  <CardDescription>
                    Bewertung nach DSGVO Art. 5-22, ePrivacy-VO und TTDSG
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Critical Error Analysis Box */}
                  {(() => {
                    const deselected = manualDataPrivacyData?.deselectedViolations || [];
                    const allViolations = privacyData?.violations || [];
                    const trackingScripts = manualDataPrivacyData?.trackingScripts || [];
                    const externalServices = manualDataPrivacyData?.externalServices || [];
                    
                    // Sammle alle kritischen Fehler mit Details
                    const criticalErrors: { source: string; description: string; neutralized: boolean; neutralizedBy?: string }[] = [];
                    
                    // 0. HSTS-Header Prüfung aus Security Headers (unabhängig von Violations)
                    const securityHeaders = privacyData?.realApiData?.securityHeaders;
                    const hasHSTSFromSSL = privacyData?.realApiData?.ssl?.hasHSTS === true;
                    const hasHSTSFromHeaders = securityHeaders?.headers?.['Strict-Transport-Security']?.present === true;
                    const hasHSTS = hasHSTSFromSSL || hasHSTSFromHeaders;
                    
                    // Fehlender HSTS ist ein kritischer Fehler (wenn wir Daten haben und HSTS fehlt)
                    if (securityHeaders && !hasHSTS) {
                      criticalErrors.push({
                        source: 'Auto',
                        description: 'HSTS-Header fehlt (HTTP Strict Transport Security)',
                        neutralized: false
                      });
                    }
                    
                    // 1. Auto-detected Violations
                    allViolations.forEach((v: any, i: number) => {
                      if (!deselected.includes(`auto-${i}`)) {
                        // WICHTIG: HSTS ist ein separater Security-Header und wird NICHT durch SSL neutralisiert!
                        const isSSLViolation = (v.description?.includes('SSL') || 
                                              v.description?.includes('TLS') ||
                                              v.description?.includes('Verschlüsselung')) &&
                                              !v.description?.includes('HSTS');
                        const isCookieViolation = v.description?.includes('Cookie') && 
                                                  v.description?.includes('Banner');
                        
                        // Überspringe HSTS-Violations wenn wir sie schon oben hinzugefügt haben
                        const isHSTSViolation = v.description?.includes('HSTS') || 
                                               v.description?.includes('Strict-Transport-Security');
                        if (isHSTSViolation && securityHeaders && !hasHSTS) {
                          return; // Schon oben behandelt
                        }
                        
                        const neutralizedBySSL = isSSLViolation && manualDataPrivacyData?.hasSSL === true;
                        const neutralizedByCookie = isCookieViolation && manualDataPrivacyData?.cookieConsent === true;
                        
                        if (v.severity === 'critical' || v.severity === 'high') {
                          criticalErrors.push({
                            source: 'Automatische Erkennung',
                            description: v.description || 'Auto-detected violation',
                            neutralized: neutralizedBySSL || neutralizedByCookie,
                            neutralizedBy: neutralizedBySSL ? 'SSL-Zertifikat vorhanden' : 
                                          neutralizedByCookie ? 'Cookie-Consent vorhanden' : undefined
                          });
                        }
                      }
                    });
                    
                    // 2. Custom Violations
                    manualDataPrivacyData?.customViolations?.forEach((v: any) => {
                      if (v.severity === 'critical' || v.severity === 'high') {
                        criticalErrors.push({
                          source: 'Manuell hinzugefügt',
                          description: v.description || 'Custom violation',
                          neutralized: false
                        });
                      }
                    });
                    
                    // 3. NEUE DSGVO-Parameter als kritische Fehler
                    // Tracking-Scripts ohne Consent (Marketing/Analytics)
                    trackingScripts.forEach((script: any) => {
                      if ((script.type === 'marketing' || script.type === 'analytics') && !script.consentRequired) {
                        criticalErrors.push({
                          source: 'Tracking ohne Consent',
                          description: `Tracking-Script "${script.name}" (${script.type === 'marketing' ? 'Marketing' : 'Analytics'}) ohne Consent-Anforderung`,
                          neutralized: false
                        });
                      }
                    });
                    
                    // Externe Dienste mit Drittland-Transfer OHNE AVV
                    externalServices.forEach((service: any) => {
                      if (service.thirdCountry && !service.dataProcessingAgreement) {
                        criticalErrors.push({
                          source: 'Drittland ohne AVV',
                          description: `Externer Dienst "${service.name}"${service.country ? ` (${service.country})` : ''} in Drittland ohne AVV/DPA`,
                          neutralized: false
                        });
                      }
                    });
                    
                    // Drittland-Transfer ohne Details
                    if (manualDataPrivacyData?.thirdCountryTransfer && !manualDataPrivacyData?.thirdCountryTransferDetails) {
                      criticalErrors.push({
                        source: 'Drittland-Transfer',
                        description: 'Drittland-Transfer aktiviert, aber keine Dokumentation der Rechtsgrundlage (Art. 44-49)',
                        neutralized: false
                      });
                    }
                    
                    const neutralizedErrors = criticalErrors.filter(e => e.neutralized);
                    const remainingErrors = criticalErrors.filter(e => !e.neutralized);
                    
                    let scoreCap = 100;
                    if (remainingErrors.length >= 3) scoreCap = 20;
                    else if (remainingErrors.length === 2) scoreCap = 35;
                    else if (remainingErrors.length === 1) scoreCap = 59;
                    
                    // Prüfe, ob positive manuelle Eingaben vorhanden sind
                    const hasPositiveManualInputs = manualDataPrivacyData?.hasSSL || 
                                                    manualDataPrivacyData?.cookieConsent || 
                                                    manualDataPrivacyData?.privacyPolicy || 
                                                    manualDataPrivacyData?.gdprCompliant ||
                                                    manualDataPrivacyData?.dataProtectionOfficer ||
                                                    manualDataPrivacyData?.processingRegister;
                    
                    // Liste der vorhandenen positiven Eingaben
                    const positiveInputsList = [];
                    if (manualDataPrivacyData?.hasSSL) positiveInputsList.push('SSL vorhanden');
                    if (manualDataPrivacyData?.cookieConsent) positiveInputsList.push('Cookie-Banner vorhanden');
                    if (manualDataPrivacyData?.privacyPolicy) positiveInputsList.push('Datenschutzerklärung vorhanden');
                    if (manualDataPrivacyData?.gdprCompliant) positiveInputsList.push('DSGVO-konform markiert');
                    if (manualDataPrivacyData?.dataProtectionOfficer) positiveInputsList.push('Datenschutzbeauftragter benannt');
                    if (manualDataPrivacyData?.processingRegister) positiveInputsList.push('Verarbeitungsverzeichnis vorhanden');
                    
                    if (criticalErrors.length > 0) {
                      return (
                        <div className={`rounded-lg p-4 border ${remainingErrors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                          <div className="flex items-center gap-2 font-semibold mb-2 text-sm">
                            🔍 Kritische Fehler-Analyse ({criticalErrors.length} erkannt):
                          </div>
                          
                          {neutralizedErrors.length > 0 && (
                            <div className="mb-3">
                              <div className="text-sm text-green-700 font-medium mb-1">
                                ✓ {neutralizedErrors.length} Fehler durch manuelle Eingaben neutralisiert:
                              </div>
                              <ul className="text-xs text-green-600 ml-4 space-y-0.5">
                                {neutralizedErrors.map((err, i) => (
                                  <li key={i}>• {err.description} <span className="text-green-500">(neutralisiert durch: {err.neutralizedBy})</span></li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {remainingErrors.length > 0 && (
                            <div className="mb-3">
                              <div className="text-sm text-red-700 font-medium mb-1">
                                ⚠️ {remainingErrors.length} kritische Fehler verbleibend:
                              </div>
                              <ul className="text-xs text-red-600 ml-4 space-y-0.5">
                                {remainingErrors.map((err, i) => (
                                  <li key={i}>• <span className="text-red-500">[{err.source}]</span> {err.description}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {remainingErrors.length > 0 ? (
                            <>
                              <div className="text-sm text-red-900 font-bold mt-2 p-2 bg-red-100 rounded">
                                📊 Score-Kappung: Maximum {scoreCap}% möglich
                              </div>
                              {hasPositiveManualInputs && positiveInputsList.length > 0 && (
                                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                                  <div className="text-sm text-orange-900">
                                    <strong>ℹ️ Hinweis:</strong> Trotz manueller Angaben ({positiveInputsList.join(', ')}) kann die Bewertung aufgrund der verbleibenden kritischen Fehler nicht höher ausfallen.
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-green-700 font-medium mt-2">
                              ✓ Alle kritischen Fehler neutralisiert - keine Score-Kappung
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
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
                        {privacyData?.gdprComplianceLevel || 'Unbekannt'}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>DSGVO-Verstöße:</span>
                        <span className="text-destructive font-semibold">{getAllViolations().length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bußgeldrisiko:</span>
                        <span className="text-warning">{privacyData?.legalRisk?.level || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rechtliches Risiko:</span>
                        <span>{privacyData?.legalRisk?.potentialFine || 'N/A'}</span>
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
                          <span className={`${privacyData?.hasConsentBanner || manualDataPrivacyData?.cookieConsent ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData?.hasConsentBanner || manualDataPrivacyData?.cookieConsent ? 'Vorhanden' : 'Fehlend'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Art. 13-14 - Informationspflichten</span>
                          <span className={`${privacyData?.hasPrivacyPolicy || manualDataPrivacyData?.privacyPolicy ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData?.hasPrivacyPolicy || manualDataPrivacyData?.privacyPolicy ? 'Erfüllt' : 'Mangelhaft'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Art. 28 - Auftragsverarbeitung</span>
                          <span className={`${manualDataPrivacyData?.dataProcessingAgreement ? 'text-green-600' : 'text-amber-600'} font-semibold`}>
                            {manualDataPrivacyData?.dataProcessingAgreement ? 'Dokumentiert' : 'Nicht angegeben'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Art. 30 - Verarbeitungsverzeichnis</span>
                          <span className={`${manualDataPrivacyData?.processingRegister ? 'text-green-600' : 'text-amber-600'} font-semibold`}>
                            {manualDataPrivacyData?.processingRegister ? 'Vorhanden' : 'Nicht angegeben'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Art. 37 - Datenschutzbeauftragter</span>
                          <span className={`${manualDataPrivacyData?.dataProtectionOfficer ? 'text-green-600' : 'text-amber-600'} font-semibold`}>
                            {manualDataPrivacyData?.dataProtectionOfficer ? 'Bestellt' : 'Nicht angegeben'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Art. 44-49 - Drittlandtransfer</span>
                          <span className={`${manualDataPrivacyData?.thirdCountryTransfer ? 'text-amber-600' : 'text-green-600'} font-semibold`}>
                            {manualDataPrivacyData?.thirdCountryTransfer ? 'Vorhanden' : 'Nicht angegeben'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tracking-Scripts</span>
                          <span className="font-semibold">
                            {(manualDataPrivacyData?.trackingScripts || []).length} erfasst
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Externe Dienste</span>
                          <span className="font-semibold">
                            {(manualDataPrivacyData?.externalServices || []).length} erfasst
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Betroffenenrechte</span>
                          <span className={`${manualDataPrivacyData?.dataSubjectRights ? 'text-green-600' : 'text-amber-600'} font-semibold`}>
                            {manualDataPrivacyData?.dataSubjectRights ? 'Gewährleistet' : 'Nicht angegeben'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Rechtsbasis</span>
                          <span className={`${getAllViolations().some(v => v.category === 'consent') ? 'text-red-600' : 'text-green-600'} font-semibold`}>
                            {getAllViolations().some(v => v.category === 'consent') ? 'Lückenhaft' : 'Dokumentiert'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tracking-Scripts und Externe Dienste Details */}
                    {((manualDataPrivacyData?.trackingScripts || []).length > 0 || (manualDataPrivacyData?.externalServices || []).length > 0) && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        {(manualDataPrivacyData?.trackingScripts || []).length > 0 && (
                          <div className="mb-3">
                            <h5 className="text-xs font-semibold text-muted-foreground mb-2">Erfasste Tracking-Scripts:</h5>
                            <div className="flex flex-wrap gap-1">
                              {(manualDataPrivacyData?.trackingScripts || []).map((script: any) => (
                                <Badge key={script.id} variant={script.consentRequired ? 'outline' : 'destructive'} className="text-xs">
                                  {script.name} ({script.type})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {(manualDataPrivacyData?.externalServices || []).length > 0 && (
                          <div>
                            <h5 className="text-xs font-semibold text-muted-foreground mb-2">Erfasste externe Dienste:</h5>
                            <div className="flex flex-wrap gap-1">
                              {(manualDataPrivacyData?.externalServices || []).map((service: any) => (
                                <Badge 
                                  key={service.id} 
                                  variant={service.dataProcessingAgreement ? 'outline' : 'destructive'} 
                                  className="text-xs"
                                >
                                  {service.name} {service.dataProcessingAgreement ? '✓ AVV' : '✗ AVV'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Rechtlicher Hinweis für manuelle Prüfungen */}
                    {(manualDataPrivacyData?.processingRegister !== undefined || 
                      manualDataPrivacyData?.dataProtectionOfficer !== undefined ||
                      manualDataPrivacyData?.thirdCountryTransfer !== undefined ||
                      (manualDataPrivacyData?.trackingScripts || []).length > 0 ||
                      (manualDataPrivacyData?.externalServices || []).length > 0) && (
                      <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                          <Scale className="h-5 w-5" />
                          Rechtlicher Hinweis: Manuelle DSGVO-Prüfung
                        </div>
                        <p className="text-red-700 text-sm mb-3">
                          <strong>Wichtig:</strong> Die Prüfung der erweiterten DSGVO-Parameter 
                          (Verarbeitungsverzeichnis, Datenschutzbeauftragter, Drittlandtransfer, Tracking-Scripts, externe Dienste) 
                          erfolgte auf Basis manueller Angaben. Für die Richtigkeit und Vollständigkeit dieser Angaben sowie 
                          die rechtliche Konformität kann keine Gewährleistung übernommen werden.
                        </p>
                        <div className="bg-red-100 border border-red-300 rounded p-3 text-red-800 text-sm">
                          <strong>⚠️ Empfehlung:</strong> Bei Zweifeln an der DSGVO-Konformität empfehlen wir ausdrücklich 
                          die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. 
                          Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
                        </div>
                      </div>
                    )}
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
                      {/* Priorität 1: Bei Fehler oder null -> Button für neue Prüfung */}
                      {(securityData.error || securityData.isSafe === null) ? (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground mb-3">
                            {securityData.error ? 'Vorherige Prüfung fehlgeschlagen. Bitte erneut versuchen.' : 'Sicherheitsstatus unbekannt.'}
                          </p>
                          <Button onClick={runSecurityCheck} variant="outline">
                            <ShieldAlert className="h-4 w-4 mr-2" />
                            Sicherheitsprüfung starten
                          </Button>
                        </div>
                      ) : securityData.isSafe === true ? (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertTitle className="text-green-800">Keine Bedrohungen gefunden</AlertTitle>
                          <AlertDescription className="text-green-700">
                            Die Website wurde von Google Safe Browsing als sicher eingestuft. Es wurden keine Malware, Phishing-Versuche oder andere schädliche Inhalte erkannt.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <>
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Sicherheitsbedrohungen erkannt!</AlertTitle>
                            <AlertDescription>
                              Google Safe Browsing hat {securityData.threats?.length || 0} Bedrohung{(securityData.threats?.length || 0) > 1 ? 'en' : ''} auf dieser Website identifiziert.
                            </AlertDescription>
                          </Alert>
                          
                          <div className="space-y-3">
                            <h4 className="font-semibold text-destructive">Erkannte Bedrohungen:</h4>
                            {securityData.threats?.map((threat: any, index: number) => (
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
                            <strong>⚠️ Dringende Handlungsempfehlung:</strong> Kontaktieren Sie umgehend einen IT-Sicherheitsexperten, um die identifizierten Bedrohungen zu beseitigen.
                          </div>
                        </>
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
                        {privacyData?.sslRating || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">SSL-Rating</div>
                      <Lock className="h-4 w-4 mx-auto text-green-600 mt-1" />
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-warning mb-2">
                        {(privacyData?.cookieCount || 0) + (manualDataPrivacyData?.manualCookies?.length || 0)}
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
                        {(privacyData?.cookies || []).filter((c: any) => c.category === 'strictly-necessary').length + 
                         (manualDataPrivacyData?.manualCookies?.filter((c: any) => c.category === 'strictly-necessary').length || 0)}
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
                          <span className={`${(privacyData?.sslRating || 'F') !== 'F' ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData?.sslRating || 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cookie-Banner</span>
                          <span className={`${privacyData?.hasConsentBanner ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData?.hasConsentBanner ? 'Implementiert' : 'Nicht vorhanden'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Cookie-Policy</span>
                          <span className={`${privacyData?.hasCookiePolicy ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                            {privacyData?.hasCookiePolicy ? 'Vorhanden' : 'Fehlend'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span>Analytics-Cookies</span>
                          <span className="font-semibold text-orange-600">
                            {(privacyData?.cookies || []).filter((c: any) => c.category === 'analytics').length + 
                             (manualDataPrivacyData?.manualCookies?.filter((c: any) => c.category === 'analytics').length || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Marketing-Cookies</span>
                          <span className="font-semibold text-red-600">
                            {(privacyData?.cookies || []).filter((c: any) => c.category === 'marketing').length + 
                             (manualDataPrivacyData?.manualCookies?.filter((c: any) => c.category === 'marketing').length || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Security Headers Section */}
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <h5 className="font-semibold mb-2 flex items-center gap-2 text-gray-700">
                        <Shield className="h-4 w-4" />
                        Security Headers
                      </h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {(() => {
                          const securityHeaders = privacyData?.realApiData?.securityHeaders?.headers;
                          const sslData = privacyData?.realApiData?.ssl;
                          const hasHSTS = sslData?.hasHSTS === true || securityHeaders?.['Strict-Transport-Security']?.present === true;
                          
                          const headers = [
                            { name: 'HSTS', present: hasHSTS, critical: true },
                            { name: 'CSP', present: securityHeaders?.['Content-Security-Policy']?.present },
                            { name: 'X-Frame-Options', present: securityHeaders?.['X-Frame-Options']?.present },
                            { name: 'X-Content-Type', present: securityHeaders?.['X-Content-Type-Options']?.present },
                            { name: 'Referrer-Policy', present: securityHeaders?.['Referrer-Policy']?.present },
                          ];
                          
                          return headers.map((header, index) => (
                            <div key={index} className={`flex items-center gap-1 ${header.critical && !header.present ? 'text-red-600 font-semibold' : ''}`}>
                              {header.present ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <XCircle className="h-3 w-3 text-red-600" />
                              )}
                              <span>{header.name}</span>
                            </div>
                          ));
                        })()}
                      </div>
                      {privacyData?.realApiData?.ssl?.analysisComplete === false && (
                        <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          SSL Labs Analyse nicht vollständig abgeschlossen (Timeout)
                        </div>
                      )}
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
                        {(privacyData?.violations || []).map((violation: GDPRViolation, index: number) => {
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
              </div>
              
              <div className={activeInternalTab === 'manual' ? 'block space-y-6' : 'hidden'}>
                {onManualDataChange && (
                  <ManualDataPrivacyInput
                    data={manualDataPrivacyData}
                    onDataChange={onManualDataChange}
                    privacyData={privacyData}
                  />
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPrivacyAnalysis;