import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Scale
} from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface DataPrivacyAnalysisProps {
  businessData: {
    url: string;
  };
  realData?: RealBusinessData;
  savedData?: any;
  onDataChange?: (data: any) => void;
}

interface CookieInfo {
  name: string;
  domain: string;
  category: 'necessary' | 'functional' | 'analytics' | 'marketing' | 'unknown';
  secure: boolean;
  httpOnly: boolean;
  sameSite: string;
  expires: string;
  purpose: string;
}

interface TrackingScript {
  name: string;
  domain: string;
  type: 'analytics' | 'marketing' | 'social' | 'other';
  gdprCompliant: boolean;
  description: string;
}

interface DataPrivacyResult {
  score: number;
  cookieCount: number;
  trackingScripts: TrackingScript[];
  cookies: CookieInfo[];
  sslRating: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  hasConsentBanner: boolean;
  hasPrivacyPolicy: boolean;
  hasImprint: boolean;
  externalServices: string[];
  violations: Array<{
    type: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    message: string;
    recommendation: string;
  }>;
}

const DataPrivacyAnalysis: React.FC<DataPrivacyAnalysisProps> = ({ 
  businessData, 
  realData, 
  savedData, 
  onDataChange 
}) => {
  const [privacyData, setPrivacyData] = useState<DataPrivacyResult | null>(savedData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrivacyAnalysis = async () => {
    if (!businessData.url) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simuliere realistische DSGVO-Analyse
      const mockResult: DataPrivacyResult = {
        score: 58,
        cookieCount: 12,
        hasConsentBanner: false,
        hasPrivacyPolicy: true,
        hasImprint: true,
        sslRating: 'A',
        externalServices: [
          'Google Analytics',
          'Google Fonts (extern)',
          'Facebook Pixel',
          'YouTube Embeds',
          'Google Maps'
        ],
        cookies: [
          {
            name: '_ga',
            domain: '.example.com',
            category: 'analytics',
            secure: true,
            httpOnly: false,
            sameSite: 'Lax',
            expires: '2 Jahre',
            purpose: 'Google Analytics Tracking'
          },
          {
            name: '_fbp',
            domain: '.example.com',
            category: 'marketing',
            secure: true,
            httpOnly: false,
            sameSite: 'Lax',
            expires: '90 Tage',
            purpose: 'Facebook Pixel Tracking'
          },
          {
            name: 'session_id',
            domain: 'example.com',
            category: 'necessary',
            secure: true,
            httpOnly: true,
            sameSite: 'Strict',
            expires: 'Session',
            purpose: 'Session-Verwaltung'
          }
        ],
        trackingScripts: [
          {
            name: 'Google Analytics',
            domain: 'google-analytics.com',
            type: 'analytics',
            gdprCompliant: false,
            description: 'Ohne Consent-Banner geladen'
          },
          {
            name: 'Facebook Pixel',
            domain: 'facebook.net',
            type: 'marketing',
            gdprCompliant: false,
            description: 'Direktes Laden ohne Einwilligung'
          },
          {
            name: 'Google Fonts',
            domain: 'fonts.googleapis.com',
            type: 'other',
            gdprCompliant: false,
            description: 'Externe Einbindung - IP wird übertragen'
          }
        ],
        violations: [
          {
            type: 'critical',
            category: 'Cookies',
            message: 'Tracking-Cookies ohne Einwilligung gesetzt',
            recommendation: 'Cookie-Banner implementieren und Tracking nur nach Consent laden'
          },
          {
            type: 'high',
            category: 'Externe Dienste',
            message: 'Google Fonts extern eingebunden',
            recommendation: 'Google Fonts lokal hosten oder mit Proxy-Lösung einbinden'
          },
          {
            type: 'medium',
            category: 'Consent Management',
            message: 'Kein Cookie-Banner gefunden',
            recommendation: 'DSGVO-konformen Cookie-Banner implementieren'
          },
          {
            type: 'medium',
            category: 'Tracking',
            message: 'Facebook Pixel ohne Opt-In aktiv',
            recommendation: 'Pixel erst nach expliziter Zustimmung laden'
          }
        ]
      };

      // Simuliere API-Aufruf
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPrivacyData(mockResult);
      onDataChange?.(mockResult);
    } catch (err) {
      setError('Fehler bei der Datenschutz-Analyse: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-yellow-600';  // 80-100% gelb
    if (score >= 60) return 'text-green-600';   // 60-80% grün
    return 'text-red-600';                      // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'default';
    if (score >= 70) return 'secondary';
    if (score >= 50) return 'outline';
    return 'destructive';
  };

  const getViolationIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getViolationColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getCookieCategoryBadge = (category: string) => {
    switch (category) {
      case 'necessary': return 'default';
      case 'functional': return 'secondary';
      case 'analytics': return 'outline';
      case 'marketing': return 'destructive';
      default: return 'outline';
    }
  };

  // Abmahnungsrisiko bewerten
  const getAbmahnungsrisiko = (score: number, violations: any[]) => {
    const criticalViolations = violations.filter(v => v.type === 'critical').length;
    const highViolations = violations.filter(v => v.type === 'high').length;
    
    if (score < 50 || criticalViolations >= 2) {
      return {
        risk: 'sehr hoch',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300',
        message: 'Sehr hohes Abmahnungsrisiko',
        description: 'Schwerwiegende DSGVO-Verstöße vorhanden.'
      };
    } else if (score < 70 || criticalViolations >= 1 || highViolations >= 2) {
      return {
        risk: 'hoch',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        message: 'Hohes Abmahnungsrisiko',
        description: 'Mehrere datenschutzrelevante Probleme erkannt.'
      };
    } else if (score < 85) {
      return {
        risk: 'mittel',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        message: 'Mittleres Abmahnungsrisiko',
        description: 'Einige Verbesserungen empfohlen.'
      };
    } else {
      return {
        risk: 'niedrig',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300',
        message: 'Niedriges Abmahnungsrisiko',
        description: 'Gute DSGVO-Compliance erreicht.'
      };
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Datenschutz & DSGVO-Compliance
          </CardTitle>
          <CardDescription>
            Umfassende Analyse von Cookies, Tracking und Datenschutz-Compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!privacyData && !loading && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Datenschutz-Analyse starten
              </h3>
              <p className="text-gray-500 mb-4">
                Überprüfen Sie Ihre Website auf DSGVO-Compliance und Abmahnungsrisiken
              </p>
              <Button onClick={runPrivacyAnalysis} className="bg-blue-600 hover:bg-blue-700">
                <Shield className="h-4 w-4 mr-2" />
                Analyse starten
              </Button>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Datenschutz-Analyse läuft...
              </h3>
              <p className="text-gray-500">
                Prüfe Cookies, Tracking-Skripte und DSGVO-Compliance
              </p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Fehler bei der Analyse
              </h3>
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={runPrivacyAnalysis} variant="outline">
                Erneut versuchen
              </Button>
            </div>
          )}

          {privacyData && (
            <div className="space-y-6">
              {/* Score Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-blue-200">
                  <CardContent className="p-6 text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(privacyData.score)} mb-2`}>
                      {privacyData.score}
                    </div>
                    <div className="text-sm text-gray-600">DSGVO-Score</div>
                    <Badge variant={getScoreBadge(privacyData.score)} className="mt-2">
                      {privacyData.score >= 85 ? 'Sehr gut' : 
                       privacyData.score >= 70 ? 'Gut' : 
                       privacyData.score >= 50 ? 'Verbesserbar' : 'Kritisch'}
                    </Badge>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {privacyData.cookieCount}
                    </div>
                    <div className="text-sm text-gray-600">Cookies gefunden</div>
                    <div className="text-xs text-orange-500 mt-1">
                      {privacyData.cookies.filter(c => c.category === 'marketing').length} Marketing
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {privacyData.violations.length}
                    </div>
                    <div className="text-sm text-gray-600">Verstöße</div>
                    <div className="text-xs text-red-500 mt-1">
                      {privacyData.violations.filter(v => v.type === 'critical').length} kritisch
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {privacyData.sslRating}
                    </div>
                    <div className="text-sm text-gray-600">SSL-Rating</div>
                    <Lock className="h-4 w-4 mx-auto text-green-500 mt-1" />
                  </CardContent>
                </Card>
              </div>

              {/* Abmahnungsrisiko */}
              {(() => {
                const risikoAnalyse = getAbmahnungsrisiko(privacyData.score, privacyData.violations);
                return (
                  <Card className={`${risikoAnalyse.borderColor} ${risikoAnalyse.bgColor}`}>
                    <CardHeader className="pb-4">
                      <CardTitle className={`text-lg ${risikoAnalyse.color} flex items-center gap-2`}>
                        <Scale className="h-5 w-5" />
                        Abmahnungsrisiko: {risikoAnalyse.message}
                      </CardTitle>
                      <CardDescription>
                        {risikoAnalyse.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-semibold text-gray-800 text-sm">Häufige Abmahnungsgründe:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Cookies ohne Einwilligung</li>
                            <li>• Google Fonts extern geladen</li>
                            <li>• Tracking ohne Opt-In</li>
                            <li>• Fehlende Datenschutzerklärung</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-semibold text-gray-800 text-sm">Sofortige Maßnahmen:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Cookie-Banner implementieren</li>
                            <li>• Tracking deaktivieren</li>
                            <li>• Google Fonts lokal hosten</li>
                            <li>• Datenschutzerklärung prüfen</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-semibold text-gray-800 text-sm">Mögliche Kosten:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Abmahnkosten: 500-2.000€</li>
                            <li>• Anwaltskosten: 300-1.500€</li>
                            <li>• Bußgelder bis 4% Umsatz</li>
                            <li>• Unterlassungserklärung</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>DSGVO-Compliance</span>
                  <span className={getScoreColor(privacyData.score)}>
                    {privacyData.score}/100
                  </span>
                </div>
                <Progress value={privacyData.score} className="h-3" />
              </div>

              {/* Violations */}
              {privacyData.violations.length > 0 && (
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Datenschutz-Verstöße ({privacyData.violations.length})
                    </CardTitle>
                    <CardDescription>
                      Diese Probleme sollten umgehend behoben werden
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {privacyData.violations.map((violation, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg border-l-4 ${getViolationColor(violation.type)}`}
                        >
                          <div className="flex items-start gap-3">
                            {getViolationIcon(violation.type)}
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">
                                {violation.message}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                <strong>Empfehlung:</strong> {violation.recommendation}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {violation.category}
                                </Badge>
                                <Badge 
                                  variant={violation.type === 'critical' ? 'destructive' : 'outline'} 
                                  className="text-xs"
                                >
                                  {violation.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cookie Details */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-600 flex items-center gap-2">
                    <Cookie className="h-5 w-5" />
                    Cookie-Analyse ({privacyData.cookies.length} gefunden)
                  </CardTitle>
                  <CardDescription>
                    Detaillierte Aufschlüsselung aller gesetzten Cookies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {privacyData.cookies.map((cookie, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{cookie.name}</span>
                            <Badge variant={getCookieCategoryBadge(cookie.category)}>
                              {cookie.category}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500">
                            {cookie.expires}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {cookie.purpose}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Domain: {cookie.domain}</span>
                          <span>Secure: {cookie.secure ? '✅' : '❌'}</span>
                          <span>HttpOnly: {cookie.httpOnly ? '✅' : '❌'}</span>
                          <span>SameSite: {cookie.sameSite}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Scripts */}
              <Card className="border-purple-200">
                <CardHeader>
                  <CardTitle className="text-lg text-purple-600 flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Tracking-Skripte ({privacyData.trackingScripts.length})
                  </CardTitle>
                  <CardDescription>
                    Externe Skripte und deren DSGVO-Compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {privacyData.trackingScripts.map((script, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{script.name}</span>
                            <Badge variant={script.gdprCompliant ? 'default' : 'destructive'}>
                              {script.gdprCompliant ? 'DSGVO OK' : 'DSGVO Verstoß'}
                            </Badge>
                            <Badge variant="outline">{script.type}</Badge>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {script.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          Domain: {script.domain}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Externe Services */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Externe Dienste ({privacyData.externalServices.length})
                  </CardTitle>
                  <CardDescription>
                    Eingebundene Drittanbieter-Services
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {privacyData.externalServices.map((service, index) => (
                      <Badge key={index} variant="outline" className="justify-center">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Handlungsempfehlungen */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Sofort-Maßnahmen für DSGVO-Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Technische Maßnahmen:</h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          Cookie-Banner mit Opt-In implementieren
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          Google Fonts lokal hosten
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          Tracking nur nach Einwilligung laden
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                          IP-Anonymisierung aktivieren
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">Rechtliche Maßnahmen:</h4>
                      <ul className="text-sm space-y-2 text-gray-600">
                        <li className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                          Datenschutzerklärung aktualisieren
                        </li>
                        <li className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                          Impressum vervollständigen
                        </li>
                        <li className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                          AVV-Verträge abschließen
                        </li>
                        <li className="flex items-start gap-2">
                          <FileText className="h-4 w-4 text-blue-500 mt-0.5" />
                          Verfahrensverzeichnis erstellen
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={runPrivacyAnalysis}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Erneut prüfen
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://www.dsgvo-gesetz.de/', '_blank')}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  DSGVO-Infos
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPrivacyAnalysis;