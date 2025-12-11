import { RealBusinessData } from './BusinessAnalysisService';

export interface CookieInfo {
  name: string;
  domain: string;
  category: 'strictly-necessary' | 'functional' | 'analytics' | 'marketing' | 'social-media' | 'unknown';
  secure: boolean;
  httpOnly: boolean;
  sameSite: 'Strict' | 'Lax' | 'None' | 'unset';
  expires: string;
  purpose: string;
  gdprBasis?: string;
  thirdCountry?: boolean;
}

export interface TrackingScript {
  name: string;
  domain: string;
  type: 'analytics' | 'marketing' | 'social' | 'advertising' | 'other';
  gdprCompliant: boolean;
  dataProcessing: string;
  legalBasis: string;
  thirdCountryTransfer: boolean;
  adequacyDecision: boolean;
}

export interface GDPRViolation {
  article: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'consent' | 'information' | 'data-protection' | 'security' | 'transfer';
  description: string;
  recommendation: string;
  fineRisk: string;
  legalReference: string;
  cookieRelated?: boolean;
}

export interface DataPrivacyResult {
  score: number;
  gdprComplianceLevel: 'non-compliant' | 'basic' | 'good' | 'excellent';
  cookieCount: number;
  trackingScripts: TrackingScript[];
  cookies: CookieInfo[];
  sslRating: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'T';
  hasConsentBanner: boolean;
  hasPrivacyPolicy: boolean;
  hasCookiePolicy: boolean;
  consentMechanism: 'none' | 'banner' | 'wall' | 'modal';
  externalServices: Array<{
    name: string;
    category: string;
    gdprCompliant: boolean;
    adequacyDecision: boolean;
  }>;
  violations: GDPRViolation[];
  legalRisk: {
    level: 'very-low' | 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: string[];
    recommendations: string[];
    potentialFine: string;
  };
  realApiData?: {
    ssl: any;
    securityHeaders: any;
    cookieBanner?: any;
    checkedWithRealAPIs: boolean;
  };
}

interface SecurityHeadersResult {
  score: number;
  grade: string;
  headers: {
    'Content-Security-Policy'?: { present: boolean };
    'X-Frame-Options'?: { present: boolean };
    'X-Content-Type-Options'?: { present: boolean };
    'Strict-Transport-Security'?: { present: boolean };
    'Referrer-Policy'?: { present: boolean };
  };
}

interface SSLCheckResult {
  grade: string;
  hasSSL: boolean;
  protocol: string;
  hasCertificate: boolean;
  certificateValid: boolean;
  supportsHTTPS: boolean;
  hasHSTS: boolean;
  vulnerabilities: boolean;
  chainIssues: number;
}

/**
 * DSGVO/GDPR-konformer Datenschutz-Service mit echten API-Prüfungen
 * Nutzt: SSL Labs API, SecurityHeaders.io
 */
export class DataPrivacyService {
  
  /**
   * Führt eine umfassende DSGVO-Compliance-Analyse durch (mit echten APIs)
   */
  static async analyzeDataPrivacy(url: string, realData?: RealBusinessData): Promise<DataPrivacyResult> {
    console.log('Starting real data privacy analysis for:', url);
    
    // Validate URL before processing
    if (!url || typeof url !== 'string' || url.trim() === '') {
      throw new Error('Keine gültige URL angegeben. Bitte geben Sie eine vollständige URL ein (z.B. https://example.com)');
    }
    
    // Ensure URL has protocol
    let validUrl = url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }
    
    let hostname: string;
    try {
      hostname = new URL(validUrl).hostname;
    } catch (e) {
      throw new Error(`Ungültige URL: "${url}". Bitte geben Sie eine gültige URL ein (z.B. https://example.com)`);
    }
    
    // Parallel API calls for faster results
    const [sslResult, securityHeadersResult, cookieBannerResult] = await Promise.all([
      this.checkSSLWithAPI(hostname),
      this.checkSecurityHeaders(validUrl),
      this.detectCookieBanner(validUrl)
    ]);

    console.log('SSL Result:', sslResult);
    console.log('Security Headers Result:', securityHeadersResult);
    console.log('Cookie Banner Result:', cookieBannerResult);
    
    // HINWEIS: Cookies, Tracking-Scripts sind NICHT automatisch prüfbar (kostenpflichtige APIs)
    // Diese müssen manuell eingegeben werden
    const cookies: CookieInfo[] = [];
    const trackingScripts: TrackingScript[] = [];
    const externalServices: Array<{name: string; category: string; gdprCompliant: boolean; adequacyDecision: boolean}> = [];
    
    // Violations basierend auf ECHTEN Daten
    const hasConsentBanner = cookieBannerResult?.hasConsentBanner || false;
    const violations = this.analyzeRealViolations(sslResult, securityHeadersResult, hasConsentBanner);
    
    // Score berechnen basierend auf echten Prüfungen
    const score = this.calculateRealGDPRScore(sslResult, securityHeadersResult, violations);
    
    // SSL-Rating direkt von SSL Labs
    const sslRating = this.mapSSLGrade(sslResult?.grade || 'F');
    
    // Compliance-Level bestimmen
    const gdprComplianceLevel = this.determineComplianceLevel(score, violations);
    
    // Rechtliches Risiko bewerten
    const legalRisk = this.assessLegalRisk(violations, score, 0);
    
    return {
      score,
      gdprComplianceLevel,
      cookieCount: 0, // Nicht automatisch prüfbar
      trackingScripts,
      cookies,
      sslRating,
      hasConsentBanner,
      hasPrivacyPolicy: false, // Nicht automatisch prüfbar
      hasCookiePolicy: false, // Nicht automatisch prüfbar
      consentMechanism: 'none', // Nicht automatisch prüfbar
      externalServices,
      violations,
      legalRisk,
      realApiData: {
        ssl: sslResult,
        securityHeaders: securityHeadersResult,
        cookieBanner: cookieBannerResult,
        checkedWithRealAPIs: true
      }
    };
  }

  /**
   * Prüft SSL/TLS mit SSL Labs API über Edge Function
   */
  private static async checkSSLWithAPI(hostname: string): Promise<SSLCheckResult | null> {
    try {
      const response = await fetch(
        `https://dfzuijskqjbtpckzzemh.supabase.co/functions/v1/check-ssl`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hostname })
        }
      );

      if (!response.ok) {
        console.error('SSL check failed:', response.status);
        return null;
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error checking SSL:', error);
      return null;
    }
  }

  /**
   * Erkennt Cookie-Banner automatisch über Edge Function
   */
  private static async detectCookieBanner(url: string): Promise<{hasConsentBanner: boolean; detectionMethod: string | null; detectedPlatform: string | null} | null> {
    try {
      const response = await fetch(
        `https://dfzuijskqjbtpckzzemh.supabase.co/functions/v1/detect-cookie-banner`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        }
      );

      if (!response.ok) {
        console.error('Cookie banner detection failed:', response.status);
        return null;
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Error detecting cookie banner:', error);
      return null;
    }
  }

  /**
   * Prüft Security Headers mit SecurityHeaders.io API
   */
  private static async checkSecurityHeaders(url: string): Promise<SecurityHeadersResult | null> {
    try {
      const hostname = new URL(url).hostname;
      const response = await fetch(
        `https://securityheaders.com/?q=${encodeURIComponent(hostname)}&followRedirects=on`,
        { 
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'Handwerk-Stars-Analyzer'
          } 
        }
      );

      // SecurityHeaders.io doesn't have a public JSON API, so we'll do a basic fetch
      // and check response headers directly
      const testResponse = await fetch(url, { method: 'HEAD' }).catch(() => null);
      
      if (!testResponse) return null;

      const headers = testResponse.headers;
      const result = {
        score: 0,
        grade: 'F',
        headers: {
          'Content-Security-Policy': { present: headers.has('content-security-policy') },
          'X-Frame-Options': { present: headers.has('x-frame-options') },
          'X-Content-Type-Options': { present: headers.has('x-content-type-options') },
          'Strict-Transport-Security': { present: headers.has('strict-transport-security') },
          'Referrer-Policy': { present: headers.has('referrer-policy') }
        }
      };

      // Calculate score
      const presentHeaders = Object.values(result.headers).filter(h => h.present).length;
      result.score = (presentHeaders / 5) * 100;
      
      if (result.score >= 90) result.grade = 'A';
      else if (result.score >= 70) result.grade = 'B';
      else if (result.score >= 50) result.grade = 'C';
      else if (result.score >= 30) result.grade = 'D';
      else result.grade = 'F';

      return result;
    } catch (error) {
      console.error('Error checking security headers:', error);
      return null;
    }
  }

  /**
   * Analysiert Violations basierend auf ECHTEN API-Daten
   */
  private static analyzeRealViolations(
    sslResult: SSLCheckResult | null,
    securityHeaders: SecurityHeadersResult | null,
    hasConsentBanner: boolean = false
  ): GDPRViolation[] {
    const violations: GDPRViolation[] = [];

    // Cookie-Banner Prüfung (TTDSG § 25)
    if (!hasConsentBanner) {
      violations.push({
        article: 'TTDSG § 25 / Art. 7 DSGVO',
        severity: 'high',
        category: 'consent',
        description: 'Kein Cookie-Consent-Banner implementiert',
        recommendation: 'Cookie-Banner mit Einwilligungsmanagement implementieren (z.B. Cookiebot, Usercentrics)',
        fineRisk: 'Bis zu 20 Mio. € oder 4% des Jahresumsatzes',
        legalReference: 'https://www.gesetze-im-internet.de/ttdsg/__25.html',
        cookieRelated: true
      });
    }

    // SSL/TLS Probleme - Grade D, E, F und T sind kritisch
    const criticalSSLGrades = ['D', 'E', 'F', 'T'];
    if (!sslResult?.hasSSL || (sslResult?.grade && criticalSSLGrades.includes(sslResult.grade))) {
      violations.push({
        article: 'Art. 32 DSGVO',
        severity: 'critical',
        category: 'security',
        description: 'Keine oder unzureichende SSL/TLS-Verschlüsselung',
        recommendation: 'SSL-Zertifikat installieren und TLS 1.2+ aktivieren',
        fineRisk: 'Bis zu 4% des Jahresumsatzes',
        legalReference: 'https://eur-lex.europa.eu/eli/reg/2016/679/art_32'
      });
    }

    // HSTS-Prüfung - verwende sslResult ODER securityHeaders als Fallback
    const hasHSTSFromSSL = sslResult?.hasHSTS === true;
    const hasHSTSFromHeaders = securityHeaders?.headers?.['Strict-Transport-Security']?.present === true;
    const hasHSTS = hasHSTSFromSSL || hasHSTSFromHeaders;
    
    // Nur als Violation markieren wenn wir sicher wissen dass es fehlt (nicht bei null/undefined)
    if (sslResult?.hasHSTS === false && !hasHSTSFromHeaders) {
      violations.push({
        article: 'Art. 32 DSGVO',
        severity: 'critical',
        category: 'security',
        description: 'HSTS-Header fehlt (HTTP Strict Transport Security)',
        recommendation: 'HSTS-Header auf dem Server konfigurieren',
        fineRisk: 'Bis zu 4% des Jahresumsatzes',
        legalReference: 'https://eur-lex.europa.eu/eli/reg/2016/679/art_32'
      });
    }

    if (sslResult?.vulnerabilities) {
      violations.push({
        article: 'Art. 32 DSGVO',
        severity: 'critical',
        category: 'security',
        description: 'Bekannte SSL/TLS-Sicherheitslücken erkannt',
        recommendation: 'Server-Software aktualisieren und Schwachstellen beheben',
        fineRisk: 'Bis zu 4% des Jahresumsatzes',
        legalReference: 'https://eur-lex.europa.eu/eli/reg/2016/679/art_32'
      });
    }

    // Security Headers
    if (securityHeaders) {
      if (!securityHeaders.headers['Content-Security-Policy']?.present) {
        violations.push({
          article: 'Art. 32 DSGVO',
          severity: 'medium',
          category: 'security',
          description: 'Content-Security-Policy Header fehlt',
          recommendation: 'CSP-Header implementieren zum Schutz vor XSS-Angriffen',
          fineRisk: 'Abmahnung möglich',
          legalReference: 'https://eur-lex.europa.eu/eli/reg/2016/679/art_32'
        });
      }

      if (!securityHeaders.headers['X-Frame-Options']?.present) {
        violations.push({
          article: 'Art. 32 DSGVO',
          severity: 'medium',
          category: 'security',
          description: 'X-Frame-Options Header fehlt (Clickjacking-Schutz)',
          recommendation: 'X-Frame-Options: SAMEORIGIN oder DENY setzen',
          fineRisk: 'Abmahnung möglich',
          legalReference: 'https://eur-lex.europa.eu/eli/reg/2016/679/art_32'
        });
      }
      
      // Zusätzliche Security Header Prüfungen
      if (!securityHeaders.headers['X-Content-Type-Options']?.present) {
        violations.push({
          article: 'Art. 32 DSGVO',
          severity: 'low',
          category: 'security',
          description: 'X-Content-Type-Options Header fehlt (MIME-Sniffing-Schutz)',
          recommendation: 'X-Content-Type-Options: nosniff setzen',
          fineRisk: 'Gering',
          legalReference: 'https://eur-lex.europa.eu/eli/reg/2016/679/art_32'
        });
      }
      
      if (!securityHeaders.headers['Referrer-Policy']?.present) {
        violations.push({
          article: 'Art. 32 DSGVO',
          severity: 'low',
          category: 'security',
          description: 'Referrer-Policy Header fehlt (Datenweitergabe-Kontrolle)',
          recommendation: 'Referrer-Policy Header konfigurieren',
          fineRisk: 'Gering',
          legalReference: 'https://eur-lex.europa.eu/eli/reg/2016/679/art_32'
        });
      }
    }

    return violations;
  }

  /**
   * Berechnet Score basierend auf ECHTEN Prüfungen
   */
  private static calculateRealGDPRScore(
    sslResult: SSLCheckResult | null,
    securityHeaders: SecurityHeadersResult | null,
    violations: GDPRViolation[]
  ): number {
    let score = 100;

    // SSL-Bewertung
    if (sslResult) {
      if (sslResult.grade === 'A+' || sslResult.grade === 'A') score -= 0;
      else if (sslResult.grade === 'B') score -= 10;
      else if (sslResult.grade === 'C') score -= 20;
      else if (sslResult.grade === 'D') score -= 30;
      else if (sslResult.grade === 'E') score -= 35;
      else if (sslResult.grade === 'T') score -= 40;
      else score -= 40; // F oder schlechter
    } else {
      score -= 40; // Keine SSL-Daten = schlecht
    }

    // Security Headers
    if (securityHeaders) {
      score -= (100 - securityHeaders.score) * 0.3; // Max 30 Punkte Abzug
    } else {
      score -= 30;
    }

    // Violations - Kritische Fehler deutlich schwerer gewichten
    violations.forEach(v => {
      switch (v.severity) {
        case 'critical': score -= 30; break;  // Kritisch: 30 Punkte Abzug (statt 15)
        case 'high': score -= 15; break;      // Hoch: 15 Punkte Abzug (statt 10)
        case 'medium': score -= 8; break;     // Mittel: 8 Punkte Abzug (statt 5)
        case 'low': score -= 3; break;        // Niedrig: 3 Punkte Abzug (statt 2)
      }
    });

    const finalScore = Math.max(0, Math.min(100, Math.round(score)));
    
    // Bei mehreren kritischen Verstößen deutlich schärfere Caps
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    if (criticalCount >= 3) {
      return Math.min(20, finalScore);  // 3+ kritische = max 20%
    } else if (criticalCount === 2) {
      return Math.min(35, finalScore);  // 2 kritische = max 35%
    } else if (criticalCount === 1) {
      return Math.min(59, finalScore);  // 1 kritischer = max 59%
    }

    return finalScore;
  }

  /**
   * Mapped SSL Labs Grade zu Standard-Rating
   */
  private static mapSSLGrade(grade: string): 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'T' {
    if (grade === 'A+') return 'A+';
    if (grade === 'A' || grade === 'A-') return 'A';
    if (grade.startsWith('B')) return 'B';
    if (grade.startsWith('C')) return 'C';
    if (grade.startsWith('D')) return 'D';
    if (grade.startsWith('E')) return 'E';
    if (grade === 'T') return 'T';
    return 'F';
  }
  
  // Removed - cookies cannot be checked automatically with free APIs
  
  // Removed - tracking scripts cannot be checked automatically with free APIs
  
  // Removed - external services cannot be checked automatically with free APIs
  
  // Moved to analyzeRealViolations()
  
  // Moved to checkSSLWithAPI() and mapSSLGrade()
  
  // Removed - consent mechanism cannot be checked automatically
  
  // Moved to calculateRealGDPRScore()
  
  private static determineComplianceLevel(score: number, violations: GDPRViolation[]): 'non-compliant' | 'basic' | 'good' | 'excellent' {
    const criticalViolations = violations.filter(v => v.severity === 'critical').length;
    
    // Ausgewogenere Bewertung
    if (criticalViolations >= 3 || score < 25) return 'non-compliant';
    if (score < 45) return 'basic';
    if (score < 70) return 'good';
    return 'excellent';
  }
  
  private static assessLegalRisk(violations: GDPRViolation[], score: number, cookieCount: number) {
    const criticalCount = violations.filter(v => v.severity === 'critical').length;
    const highCount = violations.filter(v => v.severity === 'high').length;
    
    let level: 'very-low' | 'low' | 'medium' | 'high' | 'critical';
    let riskScore: number;
    let factors: string[] = [];
    let recommendations: string[] = [];
    let potentialFine: string;
    
    // AUSGEWOGENERE BEWERTUNG - Realistische DSGVO-Risikobewertung
    if (criticalCount >= 3 || score < 20) {
      level = 'high';
      riskScore = 70;
      potentialFine = 'Mögliche Bußgelder bei Beschwerden';
      factors = [
        'Mehrere DSGVO-Compliance-Probleme',
        'Datenschutz-Grundlagen fehlen',
        'Erhöhtes Beschwerde-Risiko'
      ];
      recommendations = [
        'Datenschutzerklärung überarbeiten',
        'Cookie-Consent implementieren',
        'DSGVO-Grundlagen umsetzen'
      ];
    } else if (criticalCount >= 2 || score < 40) {
      level = 'medium';
      riskScore = 50;
      potentialFine = 'Verwarnungen möglich';
      factors = [
        'Einzelne DSGVO-Verstöße vorhanden',
        'Verbesserungsbedarf bei Transparenz',
        'Cookie-Compliance optimierbar'
      ];
      recommendations = [
        'Schrittweise DSGVO-Optimierung',
        'Datenschutzdokumentation verbessern',
        'Consent-Management prüfen'
      ];
    } else if (criticalCount >= 1 || highCount >= 2 || score < 60) {
      level = 'low';
      riskScore = 30;
      potentialFine = 'Niedrig bei proaktiver Verbesserung';
      factors = [
        'Grundlegende DSGVO-Konformität vorhanden',
        'Kleinere Optimierungen erforderlich',
        'Datenschutz teilweise implementiert'
      ];
      recommendations = [
        'Verbleibende Punkte systematisch angehen',
        'Dokumentation vervollständigen',
        'Regelmäßige Compliance-Prüfung'
      ];
    } else {
      level = 'very-low';
      riskScore = 15;
      potentialFine = 'Sehr gering bei guter Compliance';
      factors = [
        'Solide DSGVO-Grundlagen',
        'Transparente Datenverarbeitung',
        'Proaktiver Datenschutz'
      ];
      recommendations = [
        'Aktuelle Standards beibehalten',
        'Bei Änderungen Compliance prüfen',
        'Mitarbeiterschulungen durchführen'
      ];
    }
    
    return {
      level,
      score: riskScore,
      factors,
      recommendations,
      potentialFine
    };
  }
}