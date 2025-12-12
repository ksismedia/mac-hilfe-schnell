import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor } from '@/hooks/useManualData';
import { calculateTechnicalSecurityScore } from './scoreCalculations';

// ============= Berechnungsfunktionen für echte Metriken =============

/**
 * Berechnet den Technischen SEO-Score basierend auf echten Website-Daten
 * Berücksichtigt: Überschriftenstruktur, Alt-Tags, Title-Tag, Meta-Description
 */
const calculateTechnicalSEOScore = (realData: RealBusinessData): number => {
  let score = 0;
  let factors = 0;
  
  // H1-Struktur (25 Punkte) - sollte genau 1 H1 haben
  if (realData.seo.headings.h1.length === 1) {
    score += 25;
  } else if (realData.seo.headings.h1.length > 0) {
    score += 15;
  }
  factors += 25;
  
  // Überschriftenhierarchie (25 Punkte) - H2 und H3 vorhanden
  const hasH2 = realData.seo.headings.h2.length > 0;
  const hasH3 = realData.seo.headings.h3.length > 0;
  if (hasH2 && hasH3) {
    score += 25;
  } else if (hasH2) {
    score += 15;
  }
  factors += 25;
  
  // Alt-Tags (25 Punkte) - Prozentsatz der Bilder mit Alt-Tags
  if (realData.seo.altTags.total !== undefined && realData.seo.altTags.total > 0) {
    const altTagRatio = (realData.seo.altTags.withAlt || 0) / realData.seo.altTags.total;
    score += Math.round(altTagRatio * 25);
  } else {
    // Keine Punkte wenn keine Bilder oder Daten nicht verfügbar
    score += 0;
  }
  factors += 25;
  
  // Title-Tag vorhanden (12.5 Punkte)
  if (realData.seo.titleTag && realData.seo.titleTag.length > 0) {
    score += 12.5;
  }
  factors += 12.5;
  
  // Meta-Description vorhanden (12.5 Punkte)
  if (realData.seo.metaDescription && realData.seo.metaDescription.length > 0) {
    score += 12.5;
  }
  factors += 12.5;
  
  return Math.round((score / factors) * 100);
};

/**
 * Berechnet den User Experience Score basierend auf Core Web Vitals
 * Berücksichtigt: CLS, FID, LCP
 */
const calculateUserExperienceScore = (realData: RealBusinessData): number => {
  let score = 0;
  let factors = 0;
  
  // CLS - Cumulative Layout Shift (gut: < 0.1, mittel: < 0.25, schlecht: >= 0.25)
  if (realData.performance.cls <= 0.1) {
    score += 35;
  } else if (realData.performance.cls <= 0.25) {
    score += 20;
  } else {
    score += 10;
  }
  factors += 35;
  
  // FID - First Input Delay (gut: < 100ms, mittel: < 300ms, schlecht: >= 300ms)
  if (realData.performance.fid <= 100) {
    score += 35;
  } else if (realData.performance.fid <= 300) {
    score += 20;
  } else {
    score += 10;
  }
  factors += 35;
  
  // LCP - Largest Contentful Paint (gut: < 2.5s, mittel: < 4s, schlecht: >= 4s)
  if (realData.performance.lcp <= 2.5) {
    score += 30;
  } else if (realData.performance.lcp <= 4) {
    score += 15;
  } else {
    score += 5;
  }
  factors += 30;
  
  return Math.round((score / factors) * 100);
};

/**
 * Berechnet den Touch-Optimierungscore basierend auf Mobile-Metriken
 */
const calculateTouchOptimizationScore = (realData: RealBusinessData): number => {
  let score = 0;
  
  // Basis: touchFriendly Flag (50%)
  if (realData.mobile.touchFriendly) {
    score += 50;
  } else if (realData.mobile.responsive) {
    score += 30; // Responsive ist besser als nichts
  }
  
  // Mobile PageSpeed (50%)
  score += Math.round((realData.mobile.pageSpeedMobile / 100) * 50);
  
  return Math.min(100, Math.round(score));
};

/**
 * Berechnet den Website-Struktur-Score detaillierter
 */
const calculateWebsiteStructureScore = (realData: RealBusinessData): number => {
  let score = 0;
  let factors = 0;
  
  // Title-Tag (30%)
  if (realData.seo.titleTag && realData.seo.titleTag.length > 0) {
    if (realData.seo.titleTag.length >= 30 && realData.seo.titleTag.length <= 60) {
      score += 30; // Optimal
    } else if (realData.seo.titleTag.length > 0) {
      score += 20; // Vorhanden aber nicht optimal
    }
  }
  factors += 30;
  
  // Meta-Description (30%)
  if (realData.seo.metaDescription && realData.seo.metaDescription.length > 0) {
    if (realData.seo.metaDescription.length >= 120 && realData.seo.metaDescription.length <= 160) {
      score += 30; // Optimal
    } else if (realData.seo.metaDescription.length > 0) {
      score += 20; // Vorhanden aber nicht optimal
    }
  }
  factors += 30;
  
  // H1-Struktur (20%)
  if (realData.seo.headings.h1.length === 1) {
    score += 20; // Perfekt
  } else if (realData.seo.headings.h1.length > 0) {
    score += 10; // Vorhanden aber nicht ideal
  }
  factors += 20;
  
  // Überschriftenhierarchie (20%)
  if (realData.seo.headings.h2.length > 0 && realData.seo.headings.h3.length > 0) {
    score += 20;
  } else if (realData.seo.headings.h2.length > 0) {
    score += 10;
  }
  factors += 20;
  
  return Math.round((score / factors) * 100);
};

export const generateHeaderSection = (
  companyName: string,
  industryName: string,
  currentDate: string,
  overallScore: number,
  seoScore: number,
  performanceScore: number,
  mobileScore: number,
  hourlyRateScore: number,
  socialMediaScore: number,
  dataPrivacyScore: number = 75
) => `
        <!-- Header -->
        <div class="header">
            <h1>Online-Marketing Analyse</h1>
            <div class="subtitle">Professionelle Bewertung Ihres digitalen Auftritts</div>
            <div style="margin-top: 20px; color: #718096; font-size: 1em;">
                ${companyName} • ${industryName} • ${currentDate}
            </div>
        </div>

        <!-- Gesamtbewertung -->
        <div class="score-overview">
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${overallScore < 60 ? '0-60' : overallScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${overallScore}%</button>
                <div class="score-label">Gesamt-Score</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${seoScore < 60 ? '0-60' : seoScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${seoScore}%</button>
                <div class="score-label">SEO-Bestandsanalyse</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${performanceScore < 60 ? '0-60' : performanceScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${performanceScore}%</button>
                <div class="score-label">Website-Performance</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${mobileScore < 60 ? '0-60' : mobileScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${mobileScore}%</button>
                <div class="score-label">Mobile Optimierung</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${hourlyRateScore < 60 ? '0-60' : hourlyRateScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${
                  hourlyRateScore === 100 ? 'Sehr wettbewerbsfähig' : 
                  hourlyRateScore === 85 ? 'Wettbewerbsfähig' : 
                  hourlyRateScore === 70 ? 'Marktgerecht' : 
                  hourlyRateScore === 50 ? 'Über Marktdurchschnitt' : `${hourlyRateScore}/100`
                }</button>
                <div class="score-label">Preisstrategie</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${socialMediaScore < 60 ? '0-60' : socialMediaScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${socialMediaScore}%</button>
                <div class="score-label">Social Media</div>
            </div>
            <div class="score-card">
                <button class="percentage-btn score-big" data-score="${dataPrivacyScore < 60 ? '0-60' : dataPrivacyScore < 80 ? '60-80' : '80-100'}" style="font-size: 2em; padding: 10px 15px;">${dataPrivacyScore}%</button>
                <div class="score-label">Datenschutz</div>
            </div>
        </div>
`;

export const generateSEOSection = (
  realData: RealBusinessData,
  keywordsFoundCount: number,
  keywordsScore: number,
  hasMetaDescription: boolean
) => {
    // Echte Berechnungen verwenden
    const websiteStructureScore = calculateWebsiteStructureScore(realData);
    const technicalSEOScore = calculateTechnicalSEOScore(realData);
    
    return `
        <!-- SEO-Analyse -->
        <div class="section">
            <div class="section-header">🔍 Suchmaschinenoptimierung (SEO)</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">SEO-Gesamtbewertung</div>
                        <div class="metric-value ${realData.seo.score >= 80 ? 'excellent' : realData.seo.score >= 60 ? 'good' : realData.seo.score >= 40 ? 'warning' : 'danger'}">${realData.seo.score > 0 ? `${realData.seo.score}/100 Punkte` : '—/100 Punkte'}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.seo.score < 60 ? 'warning' : ''}" style="width: ${realData.seo.score}%; display: flex; align-items: center; justify-content: center; color: ${realData.seo.score < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${realData.seo.score > 0 ? `${realData.seo.score}%` : '—'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Branchenrelevante Keywords</div>
                        <div class="metric-value ${keywordsScore >= 80 ? 'excellent' : keywordsScore >= 60 ? 'good' : keywordsScore >= 40 ? 'warning' : 'danger'}">${keywordsFoundCount}/${realData.keywords.length} gefunden</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${keywordsScore < 60 ? 'warning' : ''}" data-score="${keywordsScore < 60 ? '0-60' : keywordsScore < 80 ? '60-80' : '80-100'}" style="width: ${keywordsScore}%; display: flex; align-items: center; justify-content: center; color: ${keywordsScore < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${keywordsScore}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Website-Struktur</div>
                        <div class="metric-value ${websiteStructureScore >= 80 ? 'excellent' : websiteStructureScore >= 60 ? 'good' : 'warning'}">
                            ${websiteStructureScore >= 80 ? 'Vollständig optimiert' : websiteStructureScore >= 60 ? 'Gut strukturiert' : 'Verbesserungspotenzial'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${websiteStructureScore < 60 ? 'warning' : ''}" style="width: ${websiteStructureScore}%; display: flex; align-items: center; justify-content: center; color: ${websiteStructureScore < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${websiteStructureScore}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Technische SEO</div>
                        <div class="metric-value ${technicalSEOScore >= 80 ? 'excellent' : technicalSEOScore >= 60 ? 'good' : 'warning'}">
                            ${technicalSEOScore >= 80 ? 'Sehr gut umgesetzt' : technicalSEOScore >= 60 ? 'Grundlagen vorhanden' : 'Verbesserungsbedarf'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${technicalSEOScore < 60 ? 'warning' : ''}" style="width: ${technicalSEOScore}%; display: flex; align-items: center; justify-content: center; color: ${technicalSEOScore < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${technicalSEOScore}%</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${realData.seo.score < 70 ? `
                <div class="recommendations">
                    <h4>Empfehlungen zur SEO-Verbesserung:</h4>
                    <ul>
                        <li>Optimierung der Seitentitel für bessere Auffindbarkeit</li>
                        <li>Verbesserung der Meta-Beschreibungen für höhere Klickraten</li>
                        <li>Integration branchenspezifischer Keywords in den Content</li>
                        <li>Aufbau einer logischen Überschriftenstruktur</li>
                        <li>Erstellung hochwertiger, relevanter Inhalte</li>
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};

export const generatePerformanceSection = (realData: RealBusinessData) => {
    // Echte User Experience Berechnung
    const userExperienceScore = calculateUserExperienceScore(realData);
    
    return `
        <!-- Performance-Analyse -->
        <div class="section">
            <div class="section-header">⚡ Website-Performance</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Performance-Score</div>
                        <div class="metric-value ${realData.performance.score >= 80 ? 'excellent' : realData.performance.score >= 60 ? 'good' : realData.performance.score >= 40 ? 'warning' : 'danger'}">${realData.performance.score > 0 ? `${realData.performance.score}/100 Punkte` : '—/100 Punkte'}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.score < 60 ? 'warning' : ''}" style="width: ${realData.performance.score}%; display: flex; align-items: center; justify-content: center; color: ${realData.performance.score < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${realData.performance.score > 0 ? `${realData.performance.score}%` : '—'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Ladezeit</div>
                        <div class="metric-value ${realData.performance.loadTime < 2 ? 'excellent' : realData.performance.loadTime < 4 ? 'good' : realData.performance.loadTime < 6 ? 'warning' : 'danger'}">${realData.performance.loadTime} Sekunden</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Optimal: unter 3s</span>
                                <span>${realData.performance.loadTime < 3 ? 'Erreicht' : 'Verbesserung nötig'}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.performance.loadTime > 4 ? 'warning' : ''}" style="width: ${Math.max(20, 100 - (realData.performance.loadTime * 20))}%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Nutzerfreundlichkeit (Core Web Vitals)</div>
                        <div class="metric-value ${userExperienceScore >= 80 ? 'excellent' : userExperienceScore >= 60 ? 'good' : 'warning'}">
                            ${userExperienceScore >= 80 ? 'Hervorragend' : userExperienceScore >= 60 ? 'Gut' : 'Verbesserungsbedarf'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${userExperienceScore < 60 ? 'warning' : ''}" style="width: ${userExperienceScore}%; display: flex; align-items: center; justify-content: center; color: ${userExperienceScore < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${userExperienceScore}%</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
                            <strong>Metriken:</strong> CLS: ${realData.performance.cls.toFixed(2)} | FID: ${realData.performance.fid}ms | LCP: ${realData.performance.lcp.toFixed(1)}s
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export const generateMobileSection = (realData: RealBusinessData) => {
    // Echte Touch-Optimierung und Mobile Performance Berechnungen
    const touchOptimizationScore = calculateTouchOptimizationScore(realData);
    const mobilePerformanceScore = realData.mobile.pageSpeedMobile;
    
    return `
        <!-- Mobile Optimierung -->
        <div class="section">
            <div class="section-header">📱 Mobile Optimierung</div>
            <div class="section-content">
                <div class="metric-grid">
                    <div class="metric-item">
                        <div class="metric-title">Mobile-Score</div>
                        <div class="metric-value ${realData.mobile.overallScore >= 80 ? 'excellent' : realData.mobile.overallScore >= 60 ? 'good' : realData.mobile.overallScore >= 40 ? 'warning' : 'danger'}">${realData.mobile.overallScore > 0 ? `${realData.mobile.overallScore}/100 Punkte` : '—/100 Punkte'}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${realData.mobile.overallScore < 60 ? 'warning' : ''}" style="width: ${realData.mobile.overallScore}%; display: flex; align-items: center; justify-content: center; color: ${realData.mobile.overallScore < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${realData.mobile.overallScore > 0 ? `${realData.mobile.overallScore}%` : '—'}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="metric-item">
                        <div class="metric-title">Responsive Design</div>
                        <div class="metric-value ${realData.mobile.responsive ? 'excellent' : 'danger'}">${realData.mobile.responsive ? 'Optimal umgesetzt' : 'Nicht responsive'}</div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${!realData.mobile.responsive ? 'danger' : ''}" style="width: ${realData.mobile.responsive ? 100 : 0}%; display: flex; align-items: center; justify-content: center; color: ${realData.mobile.responsive ? '#000' : '#fff'}; font-weight: bold; font-size: 14px;">${realData.mobile.responsive ? '100' : '0'}%</div>
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Touch-Optimierung</div>
                        <div class="metric-value ${touchOptimizationScore >= 80 ? 'excellent' : touchOptimizationScore >= 60 ? 'good' : 'warning'}">
                            ${touchOptimizationScore >= 80 ? 'Hervorragend' : touchOptimizationScore >= 60 ? 'Gut umgesetzt' : 'Verbesserung nötig'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${touchOptimizationScore < 60 ? 'warning' : ''}" style="width: ${touchOptimizationScore}%; display: flex; align-items: center; justify-content: center; color: ${touchOptimizationScore < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${touchOptimizationScore}%</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
                            <strong>Touch-Friendly:</strong> ${realData.mobile.touchFriendly ? 'Ja ✓' : 'Nein ✗'} | <strong>Mobile PageSpeed:</strong> ${realData.mobile.pageSpeedMobile}
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Mobile Performance</div>
                        <div class="metric-value ${mobilePerformanceScore >= 80 ? 'excellent' : mobilePerformanceScore >= 60 ? 'good' : mobilePerformanceScore >= 40 ? 'warning' : 'danger'}">
                            ${mobilePerformanceScore >= 80 ? 'Hervorragend' : mobilePerformanceScore >= 60 ? 'Gut' : mobilePerformanceScore >= 40 ? 'Zufriedenstellend' : 'Verbesserungsbedarf'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${mobilePerformanceScore < 60 ? 'warning' : ''}" style="width: ${mobilePerformanceScore}%; display: flex; align-items: center; justify-content: center; color: ${mobilePerformanceScore < 90 ? '#fff' : '#000'}; font-weight: bold; font-size: 14px;">${mobilePerformanceScore}%</div>
                            </div>
                        </div>
                        <div style="margin-top: 8px; font-size: 12px; color: #6b7280;">
                            <strong>PageSpeed Mobile:</strong> ${realData.mobile.pageSpeedMobile}/100 | <strong>Desktop:</strong> ${realData.mobile.pageSpeedDesktop}/100
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};

export const generateDataPrivacySection = (
  dataPrivacyScore: number = 75, 
  activeViolations: any[] = [],
  manualDataPrivacyData?: any,
  privacyData?: any,
  securityData?: any
) => {
  // Check for critical technical issues
  const securityHeaders = privacyData?.realApiData?.securityHeaders;
  const hasNoHSTS = !securityHeaders?.headers?.['Strict-Transport-Security']?.present && 
                     !privacyData?.realApiData?.ssl?.hasHSTS;
  const sslGrade = privacyData?.sslGrade || privacyData?.sslRating;
  const hasPoorSSL = sslGrade === 'F' || sslGrade === 'D' || sslGrade === 'E' || sslGrade === 'T';
  const hasCriticalViolations = activeViolations.some((v: any) => v.severity === 'critical' || v.severity === 'high');
  const hasCriticalTechnicalIssues = hasNoHSTS || hasPoorSSL;
  
  // Zähle kritische/high Violations nach Neutralisierung
  const deselected = manualDataPrivacyData?.deselectedViolations || [];
  const allViolations = privacyData?.violations || [];
  let criticalCount = 0;
  let neutralizedCount = 0;
  
  // Liste der kritischen Fehler für detaillierte Anzeige
  const criticalErrorsList: { source: string; description: string; article?: string; recommendation?: string }[] = [];
  
  // 0. HSTS-Header Prüfung aus Security Headers (unabhängig von Violations)
  const hasHSTSFromSSL = privacyData?.realApiData?.ssl?.hasHSTS === true;
  const hasHSTSFromSecurityHeaders = securityHeaders?.headers?.['Strict-Transport-Security']?.present === true;
  const hasHSTSHeaderData = hasHSTSFromSSL || hasHSTSFromSecurityHeaders;
  
  // Fehlender HSTS ist ein kritischer Fehler (wenn wir Security Headers Daten haben und HSTS fehlt)
  if (securityHeaders && !hasHSTSHeaderData) {
    criticalCount++;
    criticalErrorsList.push({
      source: 'Auto',
      description: 'HSTS-Header fehlt (HTTP Strict Transport Security)',
      article: 'Art. 32 DSGVO',
      recommendation: 'HSTS-Header auf dem Server konfigurieren'
    });
  }
  
  allViolations.forEach((v: any, i: number) => {
    if (!deselected.includes(`auto-${i}`)) {
      // WICHTIG: HSTS ist ein separater Security-Header und wird NICHT durch SSL neutralisiert!
      const isSSLViolation = (v.description?.includes('SSL') || 
                            v.description?.includes('TLS') ||
                            v.description?.includes('Verschlüsselung')) &&
                            !v.description?.includes('HSTS');
      const isCookieViolation = v.description?.includes('Cookie') && 
                                v.description?.includes('Banner');
      // Überspringe HSTS-Violations aus allViolations wenn wir sie schon oben hinzugefügt haben
      const isHSTSViolation = v.description?.includes('HSTS');
      if (isHSTSViolation && securityHeaders) {
        return; // Schon oben behandelt
      }
      
      const neutralizedBySSL = isSSLViolation && manualDataPrivacyData?.hasSSL === true;
      const neutralizedByCookie = isCookieViolation && manualDataPrivacyData?.cookieConsent === true;
      
      if (neutralizedBySSL || neutralizedByCookie) {
        neutralizedCount++;
      } else if (v.severity === 'critical' || v.severity === 'high') {
        criticalCount++;
        criticalErrorsList.push({
          source: 'Auto',
          description: v.description || 'Auto-detected violation',
          article: v.article,
          recommendation: v.recommendation
        });
      }
    }
  });
  
  // Zähle custom kritische/high Violations
  if (manualDataPrivacyData?.customViolations) {
    manualDataPrivacyData.customViolations.forEach((v: any) => {
      if (v.severity === 'critical' || v.severity === 'high') {
        criticalCount++;
        criticalErrorsList.push({
          source: 'Manuell',
          description: v.description || 'Custom violation',
          article: v.article,
          recommendation: v.recommendation
        });
      }
    });
  }
  
  // Bestimme Kappung
  let scoreCap = 100;
  if (criticalCount >= 3) scoreCap = 20;
  else if (criticalCount === 2) scoreCap = 35;
  else if (criticalCount === 1) scoreCap = 59;
  
  // Prüfe, ob positive manuelle Eingaben vorhanden sind
  const hasPositiveManualInputs = manualDataPrivacyData?.hasSSL || 
                                  manualDataPrivacyData?.cookieConsent || 
                                  manualDataPrivacyData?.privacyPolicy || 
                                  manualDataPrivacyData?.gdprCompliant;
  
  // Liste der vorhandenen positiven Eingaben
  const positiveInputsList = [];
  if (manualDataPrivacyData?.hasSSL) positiveInputsList.push('SSL vorhanden');
  if (manualDataPrivacyData?.cookieConsent) positiveInputsList.push('Cookie-Banner vorhanden');
  if (manualDataPrivacyData?.privacyPolicy) positiveInputsList.push('Datenschutzerklärung vorhanden');
  if (manualDataPrivacyData?.gdprCompliant) positiveInputsList.push('DSGVO-konform markiert');
  
  // GETRENNTE BEWERTUNG:
  // DSGVO-Score (rechtliche Aspekte) - Nutze dataPrivacyScore direkt (Caps werden in calculateDataPrivacyScore angewendet)
  const dsgvoScore = dataPrivacyScore;
  
  // Technische Sicherheit-Score (SSL, HSTS, Security Headers) - bei kritischen technischen Problemen auf genau 59% setzen
  let technicalSecurityScore = calculateTechnicalSecurityScore(privacyData, manualDataPrivacyData);
  if (hasCriticalTechnicalIssues) {
    technicalSecurityScore = 59;
  }
  
  // Calculate cookie score based on whether cookie-related violations are active
  const hasCookieViolations = activeViolations.some(v => v.cookieRelated);
  let cookieScore: number;
  
  if (manualDataPrivacyData?.cookieConsent) {
    // If cookie consent is manually confirmed, give high score
    cookieScore = 90;
  } else if (!hasCookieViolations) {
    // If no cookie violations are active (either none detected or deselected), give perfect score
    cookieScore = 100;
  } else {
    // Cookie violations are active, calculate based on data privacy score
    cookieScore = Math.max(30, Math.round((dataPrivacyScore + 15) * 0.8));
  }
  
  return `
        <!-- DSGVO-Konformität -->
        <div class="section">
            <div class="section-header collapsible" onclick="toggleSection('dsgvo-content')" style="cursor: pointer;">
              <span>▶ DSGVO-Konformität</span>
              <div class="header-score-circle ${(() => {
                const scoreClass = dsgvoScore >= 90 ? 'yellow' : dsgvoScore >= 61 ? 'green' : 'red';
                return hasCriticalViolations ? `${scoreClass} critical-border` : scoreClass;
              })()}">${dsgvoScore}%</div>
            </div>
            <div id="dsgvo-content" class="section-content" style="display: none;">
                <div class="grid-container" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    
                     <div class="metric-item">
                        <div class="metric-title">DSGVO-Score</div>
                        <div class="metric-value ${dsgvoScore >= 80 ? 'excellent' : dsgvoScore >= 60 ? 'good' : dsgvoScore >= 40 ? 'warning' : 'danger'}">
                            ${dsgvoScore >= 80 ? 'Vollständig konform' : dsgvoScore >= 60 ? 'Grundlegend konform' : dsgvoScore >= 40 ? 'Verbesserung nötig' : 'Kritische Mängel'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>DSGVO Art. 5-22 Compliance <span style="font-size: 11px; color: #6b7280;">(Einhaltung der Datenschutzgrundsätze und Nutzerrechte gemäß DSGVO, z. B. Rechtmäßigkeit, Transparenz, Löschung und Auskunftspflicht)</span></span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${dsgvoScore < 60 ? '0-60' : dsgvoScore < 80 ? '60-80' : '80-100'}" style="width: ${dsgvoScore}%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: ${dsgvoScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${dsgvoScore}%</span>
                                </div>
                            </div>
                            ${criticalCount > 0 || neutralizedCount > 0 ? `
                              <div style="margin-top: 10px; padding: 10px; background: ${criticalCount > 0 ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${criticalCount > 0 ? '#fecaca' : '#bbf7d0'}; border-radius: 6px;">
                                <div style="font-size: 12px; color: #374151; margin-bottom: 6px;">
                                  <strong>🔍 Kritische Fehler-Analyse (DSGVO):</strong>
                                </div>
                                ${neutralizedCount > 0 ? `
                                  <div style="font-size: 11px; color: #059669; margin-bottom: 4px;">
                                    ✓ ${neutralizedCount} kritische Fehler durch manuelle Eingaben neutralisiert
                                  </div>
                                ` : ''}
                                ${criticalCount > 0 ? `
                                  <div style="font-size: 11px; color: #dc2626; margin-bottom: 8px;">
                                    ⚠️ ${criticalCount} kritische Fehler verbleibend:
                                  </div>
                                  <div style="margin-left: 8px; margin-bottom: 8px;">
                                    ${criticalErrorsList.map(err => `
                                      <div style="font-size: 11px; color: #b91c1c; margin-bottom: 2px;">
                                        <span style="color: #dc2626;">[${err.source}]</span> ${err.description}
                                      </div>
                                    `).join('')}
                                  </div>
                                  <div style="font-size: 11px; color: #7f1d1d; font-weight: bold; background: #fee2e2; padding: 8px; border-radius: 4px;">
                                    📊 Score-Kappung: Maximum ${scoreCap}% erreichbar
                                  </div>
                                  ${hasPositiveManualInputs && positiveInputsList.length > 0 ? `
                                    <div style="margin-top: 8px; padding: 8px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px;">
                                      <div style="font-size: 11px; color: #92400e;">
                                        <strong>ℹ️</strong> Trotz positiver Angaben (${positiveInputsList.join(', ')}) ist die Bewertung aufgrund verbleibender kritischer Fehler gekappt.
                                      </div>
                                    </div>
                                  ` : ''}
                                ` : `
                                  <div style="font-size: 11px; color: #059669;">
                                    ✓ Keine verbleibenden kritischen Fehler
                                  </div>
                                `}
                              </div>
                            ` : ''}
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> Einwilligung (Art. 7), Informationspflichten (Art. 13-14), Drittlandtransfer (Art. 44-49), Rechtsbasis, Tracking-Scripts, Externe Services
                            </div>
                            ${(manualDataPrivacyData?.processingRegister !== undefined || 
                              manualDataPrivacyData?.dataProtectionOfficer !== undefined ||
                              manualDataPrivacyData?.thirdCountryTransfer !== undefined ||
                              (manualDataPrivacyData?.trackingScripts || []).length > 0 ||
                              (manualDataPrivacyData?.externalServices || []).length > 0) ? `
                              <div style="margin-top: 12px; padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;">
                                <div style="display: flex; align-items: center; gap: 8px; color: #991b1b; font-weight: 600; margin-bottom: 8px; font-size: 13px;">
                                  ⚖️ Rechtlicher Hinweis: Manuelle DSGVO-Prüfung
                                </div>
                                <p style="font-size: 12px; color: #b91c1c; margin-bottom: 10px;">
                                  <strong>Wichtig:</strong> Die Prüfung der erweiterten DSGVO-Parameter 
                                  (Verarbeitungsverzeichnis, Datenschutzbeauftragter, Drittlandtransfer, Tracking-Scripts, externe Dienste) 
                                  erfolgte auf Basis manueller Angaben. Für die Richtigkeit und Vollständigkeit dieser Angaben sowie 
                                  die rechtliche Konformität kann keine Gewährleistung übernommen werden.
                                </p>
                                <div style="background: #fee2e2; border: 1px solid #fca5a5; border-radius: 6px; padding: 10px; color: #991b1b; font-size: 11px;">
                                  <strong>⚠️ Empfehlung:</strong> Bei Zweifeln an der DSGVO-Konformität empfehlen wir ausdrücklich 
                                  die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. 
                                  Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
                                </div>
                              </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Rechtsverstöße</div>
                        <div class="metric-value ${activeViolations.length === 0 ? 'excellent' : activeViolations.length <= 2 ? 'warning' : 'danger'}">
                            ${activeViolations.length === 0 ? 'Keine erkannt' : `${activeViolations.length} festgestellt`}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>DSGVO-Verstöße</span>
                            </div>
                            ${activeViolations.length > 0 ? `
                            <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
                                <strong>Erkannte Verstöße:</strong><br>
                                ${activeViolations.map(v => `• ${v.category}: ${v.description.substring(0, 50)}...`).join('<br>')}
                            </div>
                            ` : `
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Kategorien:</strong> Einwilligung, Drittlandtransfer, Informationspflichten, Datenschutz, Sicherheit
                            </div>
                            `}
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Rechtliches Risiko</div>
                        <div class="metric-value ${dataPrivacyScore >= 80 ? 'excellent' : dataPrivacyScore >= 60 ? 'good' : dataPrivacyScore >= 40 ? 'warning' : 'danger'}">
                            ${dataPrivacyScore >= 80 ? 'Sehr niedrig' : dataPrivacyScore >= 60 ? 'Niedrig' : dataPrivacyScore >= 40 ? 'Mittel' : 'Hoch'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Bußgeldrisiko</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${dataPrivacyScore < 60 ? '0-60' : dataPrivacyScore < 80 ? '60-80' : '80-100'}" style="width: ${100 - dataPrivacyScore}%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: ${(100 - dataPrivacyScore) >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${100 - dataPrivacyScore}%</span>
                                </div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Faktoren:</strong> Verstöße, Drittlandtransfer, Consent-Management, Dokumentation
                            </div>
                        </div>
                    </div>
                </div>
                
                ${(() => {
                  // Kombiniere activeViolations mit kritischen Fehlern (z.B. HSTS)
                  const combinedViolations = [...activeViolations];
                  
                  // HSTS-Fehler hinzufügen wenn nicht schon in activeViolations enthalten
                  if (securityHeaders && !hasHSTSFromSSL && !hasHSTSFromSecurityHeaders) {
                    const hstsAlreadyIncluded = activeViolations.some((v: any) => 
                      v.description?.includes('HSTS')
                    );
                    if (!hstsAlreadyIncluded) {
                      combinedViolations.push({
                        severity: 'high',
                        category: 'security',
                        description: 'HSTS-Header fehlt (HTTP Strict Transport Security)',
                        article: 'Art. 32 DSGVO',
                        recommendation: 'HSTS-Header auf dem Server konfigurieren'
                      });
                    }
                  }
                  
                  if (combinedViolations.length > 0) {
                    return `
                  <div class="metric-item" style="grid-column: 1 / -1;">
                    <h4 style="color: #dc2626; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                      🚨 Detaillierte DSGVO-Verstöße
                    </h4>
                    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px;">
                      <div style="display: grid; gap: 15px;">
                        ${combinedViolations.map((violation: any) => `
                          <div style="border-left: 4px solid ${violation.severity === 'high' || violation.severity === 'critical' ? '#dc2626' : violation.severity === 'medium' ? '#d97706' : '#059669'}; padding-left: 15px; background: white; border-radius: 6px; padding: 12px;">
                            <strong style="color: ${violation.severity === 'high' || violation.severity === 'critical' ? '#dc2626' : violation.severity === 'medium' ? '#d97706' : '#059669'}; display: block; margin-bottom: 8px; font-size: 16px;">
                              ${violation.severity === 'high' || violation.severity === 'critical' ? '🔴 Kritisch' : violation.severity === 'medium' ? '🟡 Wichtig' : '🟢 Info'}: ${violation.category}
                            </strong>
                            <div style="margin-bottom: 8px; padding: 8px; background: #f8fafc; border-radius: 4px;">
                              <strong style="color: #374151; font-size: 14px;">Problem:</strong>
                              <p style="margin: 4px 0 0 0; color: #374151; font-size: 14px;">${violation.description}</p>
                            </div>
                            ${violation.article ? `
                              <div style="margin-bottom: 8px; padding: 8px; background: #fef3c7; border-radius: 4px; border: 1px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 12px;"><strong>⚖️ Rechtsgrundlage:</strong> ${violation.article}</p>
                              </div>
                            ` : ''}
                            ${violation.recommendation ? `
                              <div style="margin-top: 8px; padding: 8px; background: #f0f9ff; border-radius: 4px; border: 1px solid #059669;">
                                <strong style="color: #047857; font-size: 12px;">💡 Empfohlene Lösung:</strong>
                                <p style="margin: 4px 0 0 0; color: #047857; font-size: 12px;">${violation.recommendation}</p>
                              </div>
                            ` : ''}
                          </div>
                        `).join('')}
                      </div>
                      ${combinedViolations.filter((v: any) => v.severity === 'high' || v.severity === 'critical').length > 0 ? `
                        <div style="margin-top: 20px; padding: 15px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px;">
                          <strong style="color: #374151; display: block; margin-bottom: 8px;">💰 Bußgeldrisiko</strong>
                          <p style="margin: 0; color: #374151; font-size: 14px;">
                            Bei den identifizierten Verstößen drohen Bußgelder bis zu <strong>20 Millionen Euro</strong> oder <strong>4% des Jahresumsatzes</strong>.
                          </p>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
                  } else {
                    return `
                  <div class="metric-item" style="grid-column: 1 / -1;">
                    <h4 style="color: #059669; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                      ✅ DSGVO-Konformität erreicht
                    </h4>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px;">
                      <p style="margin: 0; color: #065f46; font-size: 14px;">
                        Ihre Website erfüllt die grundlegenden DSGVO-Anforderungen. Regelmäßige Überprüfungen werden empfohlen.
                      </p>
                    </div>
                  </div>
                `;
                  }
                })()}
                
                ${(activeViolations.length > 0 || criticalCount > 0) && dataPrivacyScore < 90 ? `
                    <div class="warning-box" style="border-radius: 8px; padding: 15px; margin-top: 20px; background: #fef2f2; border: 2px solid #fecaca;">
                        <h4 style="color: #dc2626; margin: 0 0 10px 0; display: flex; align-items: center; gap: 8px;">
                            ⚖️ RECHTLICHER HINWEIS: DSGVO-Verstöße erkannt
                        </h4>
                        <p style="color: #991b1b; margin: 0 0 10px 0; font-size: 14px;">
                            <strong>Warnung:</strong> Die automatisierte Analyse hat rechtlich relevante Datenschutz-Probleme identifiziert. 
                            Bei DSGVO-Verstößen drohen Bußgelder bis zu 20 Millionen Euro oder 4% des Jahresumsatzes.
                        </p>
                        <div style="background: #fee2e2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; color: #7f1d1d; font-size: 13px;">
                            <strong>⚠️ Empfehlung:</strong> Es bestehen Zweifel, ob Ihre Webseite oder Ihr Online-Angebot den gesetzlichen Anforderungen genügt. Daher empfehlen wir ausdrücklich die Einholung rechtlicher Beratung durch eine spezialisierte Anwaltskanzlei. Nur eine individuelle juristische Prüfung kann sicherstellen, dass Sie rechtlich auf der sicheren Seite sind.
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>

        <!-- Datenschutz & Technische Sicherheit -->
        <div class="section">
            <div class="section-header collapsible" onclick="toggleSection('datenschutz-content')" style="cursor: pointer;">
              <span>▶ Datenschutz & Technische Sicherheit</span>
              <div class="header-score-circle ${(() => {
                const scoreClass = technicalSecurityScore >= 90 ? 'yellow' : technicalSecurityScore >= 61 ? 'green' : 'red';
                return (hasNoHSTS || hasPoorSSL) ? `${scoreClass} critical-border` : scoreClass;
              })()}">${technicalSecurityScore}%</div>
            </div>
            <div id="datenschutz-content" class="section-content" style="display: none;">
                ${(() => {
                  if (hasNoHSTS || hasPoorSSL) {
                    return `
                      <div style="background: #fee2e2; border: 2px solid #ef4444; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #991b1b; font-weight: bold; margin-bottom: 8px; font-size: 15px;">
                          <span style="font-size: 20px;">⚠️</span>
                          Achtung: Kritische Sicherheitsmängel erkannt
                        </div>
                        <p style="color: #7f1d1d; font-size: 13px; margin: 0;">
                          Es wurden kritische technische Mängel identifiziert (z.B. fehlender HSTS-Header, mangelhaftes SSL-Rating). 
                          Diese können zu erheblichen Sicherheitsrisiken und DSGVO-Bußgeldern führen und sollten unverzüglich behoben werden.
                        </p>
                      </div>
                    `;
                  }
                  return '';
                })()}
                <div class="grid-container" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 25px;">
                    
                    <div class="metric-item">
                        <div class="metric-title">SSL-Rating</div>
                        ${(() => {
                          const sslData = privacyData?.realApiData?.ssl;
                          const securityHeaders = privacyData?.realApiData?.securityHeaders;
                          const sslRating = privacyData?.sslRating || 'F';
                          const hasRealData = privacyData?.realApiData?.checkedWithRealAPIs;
                          
                          // HSTS aus BEIDEN Quellen prüfen (SSL Labs ODER Security Headers Edge Function)
                          const hasHSTSFromSSL = sslData?.hasHSTS === true;
                          const hasHSTSFromHeaders = securityHeaders?.headers?.['Strict-Transport-Security']?.present === true;
                          const hasHSTS = hasHSTSFromSSL || hasHSTSFromHeaders;
                          
                          let sslScore = 0;
                          let sslStatus = 'Nicht verschlüsselt';
                          let sslClass = 'danger';
                          
                          if (sslRating === 'A+' || sslRating === 'A') {
                            sslScore = 100;
                            sslStatus = `${sslRating} (Vollständig verschlüsselt)`;
                            sslClass = 'excellent';
                          } else if (sslRating === 'B') {
                            sslScore = 80;
                            sslStatus = `${sslRating} (Gut verschlüsselt)`;
                            sslClass = 'good';
                          } else if (sslRating === 'C') {
                            sslScore = 60;
                            sslStatus = `${sslRating} (Ausreichend)`;
                            sslClass = 'warning';
                          } else if (sslRating === 'D') {
                            sslScore = 40;
                            sslStatus = `${sslRating} (Schwach)`;
                            sslClass = 'warning';
                          } else {
                            sslScore = 20;
                            sslStatus = `${sslRating} (Mangelhaft)`;
                            sslClass = 'danger';
                          }
                          
                          return `
                        <div class="metric-value ${sslClass}">${sslStatus}</div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>HTTPS-Verschlüsselung ${hasRealData ? '✓ <strong style="color: #10b981;">Echte SSL Labs Prüfung</strong>' : ''} <span style="font-size: 11px; color: #6b7280;">(Sichere SSL/TLS-Verbindung, die Datenübertragung vor unbefugtem Zugriff schützt und Voraussetzung für DSGVO-Konformität ist)</span></span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${sslScore < 60 ? '0-60' : sslScore < 80 ? '60-80' : '80-100'}" style="width: ${sslScore}%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: ${sslScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${sslScore}%</span>
                                </div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> Zertifikat ${sslData?.hasCertificate ? '✓' : '✗'}, Verschlüsselungsstärke, HSTS ${hasHSTS ? '✓' : '✗'}, Sicherheitslücken ${sslData?.vulnerabilities ? '⚠️' : '✓'}
                            </div>
                        </div>
                            </div>
                        </div>
                          `;
                        })()}
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Cookie-Banner</div>
                        ${(() => {
                          const hasCookieBanner = privacyData?.hasConsentBanner || manualDataPrivacyData?.cookieConsent || false;
                          const bannerScore = hasCookieBanner ? 100 : 0;
                          
                          return `
                        <div class="metric-value ${hasCookieBanner ? 'excellent' : 'danger'}">
                            ${hasCookieBanner ? 'Implementiert' : 'Nicht vorhanden'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Cookie-Consent-Banner (TTDSG) <span style="font-size: 11px; color: #6b7280;">(Pflicht-Element für datenschutzkonformes Cookie-Management nach TTDSG § 25)</span></span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${bannerScore >= 80 ? '80-100' : '0-60'}" style="width: ${bannerScore}%; display: flex; align-items: center; justify-content: center; color: ${bannerScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 14px;">${bannerScore}%</div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Prüfung:</strong> Einwilligungspflichtige Cookies, Opt-in/Opt-out-Mechanismus, Granularität der Einwilligung
                            </div>
                        </div>
                          `;
                        })()}
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Cookie-Compliance</div>
                        <div class="metric-value ${cookieScore >= 70 ? 'good' : 'warning'}">
                            ${cookieScore >= 70 ? 'TTDSG-konform' : 'Nachbesserung nötig'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Cookie-Management (TTDSG) <span style="font-size: 11px; color: #6b7280;">(Rechtskonformes Einholen und Verwalten von Cookie-Einwilligungen nach deutschem TTDSG, z. B. über Consent-Banner mit Auswahlmöglichkeit)</span></span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${cookieScore < 60 ? '0-60' : cookieScore < 80 ? '60-80' : '80-100'}" style="width: ${cookieScore}%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: ${cookieScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${cookieScore}%</span>
                                </div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> Cookie-Banner, Einwilligungsmanagement, Cookie-Kategorisierung, Granularität, Opt-out-Möglichkeiten
                            </div>
                        </div>
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Cookie-Anzahl</div>
                        ${(() => {
                          const cookieCount = privacyData?.cookieCount || 0;
                          const cookies = privacyData?.cookies || [];
                          const manualCookies = manualDataPrivacyData?.manualCookies || [];
                          
                          // Combine automatic and manual cookies
                          const totalCookieCount = cookieCount + manualCookies.length;
                          const necessaryCookies = cookies.filter((c: any) => c.category === 'strictly-necessary').length + 
                                                   manualCookies.filter((c: any) => c.category === 'strictly-necessary').length;
                          const analyticsCookies = cookies.filter((c: any) => c.category === 'analytics').length + 
                                                   manualCookies.filter((c: any) => c.category === 'analytics').length;
                          const marketingCookies = cookies.filter((c: any) => c.category === 'marketing').length + 
                                                   manualCookies.filter((c: any) => c.category === 'marketing').length;
                          const functionalCookies = cookies.filter((c: any) => c.category === 'functional').length + 
                                                    manualCookies.filter((c: any) => c.category === 'functional').length;
                          const optionalCookies = totalCookieCount - necessaryCookies;
                          const cookieRatio = totalCookieCount > 0 ? Math.round((necessaryCookies / totalCookieCount) * 100) : 0;
                          
                          return `
                        <div class="metric-value ${totalCookieCount <= 5 ? 'good' : totalCookieCount <= 10 ? 'warning' : 'danger'}">
                            ${totalCookieCount === 0 ? 'Keine Cookies' : `Gesamt: ${totalCookieCount}`}
                            ${manualCookies.length > 0 ? `<span style="font-size: 11px; color: #6b7280;"> (${manualCookies.length} manuell)</span>` : ''}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Cookie-Kategorisierung</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${cookieRatio < 50 ? '0-60' : cookieRatio < 80 ? '60-80' : '80-100'}" style="width: ${cookieRatio}%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: ${cookieRatio >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${cookieRatio}%</span>
                                </div>
                            </div>
                            ${totalCookieCount > 0 ? `
                            <div style="margin-top: 8px; font-size: 11px; color: #6b7280;">
                                <strong>Nach Kategorien:</strong><br>
                                • Notwendig: ${necessaryCookies} (ohne Einwilligung erlaubt)<br>
                                • Analytics: ${analyticsCookies} (Einwilligung erforderlich)<br>
                                • Marketing: ${marketingCookies} (Einwilligung erforderlich)<br>
                                • Funktional: ${functionalCookies} (Einwilligung erforderlich)
                            </div>
                            ` : `
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Hinweis:</strong> Keine Cookies erkannt. Nutzen Sie die manuelle Eingabe für eine vollständige Analyse.
                            </div>
                            `}
                        </div>
                          `;
                        })()}
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Technische Sicherheit</div>
                        ${(() => {
                          const securityHeaders = privacyData?.realApiData?.securityHeaders;
                          const hasRealData = privacyData?.realApiData?.checkedWithRealAPIs;
                          
                          let securityScore = dataPrivacyScore;
                          if (securityHeaders) {
                            const headers = securityHeaders.headers || {};
                            const presentHeaders = Object.values(headers).filter((h: any) => h.present).length;
                            securityScore = Math.round((presentHeaders / 5) * 100);
                          }
                          
                          const csp = securityHeaders?.headers?.['Content-Security-Policy']?.present;
                          const xFrame = securityHeaders?.headers?.['X-Frame-Options']?.present;
                          const xContent = securityHeaders?.headers?.['X-Content-Type-Options']?.present;
                          const hsts = securityHeaders?.headers?.['Strict-Transport-Security']?.present;
                          const referrer = securityHeaders?.headers?.['Referrer-Policy']?.present;
                          
                          return `
                        <div class="metric-value ${securityScore >= 80 ? 'excellent' : securityScore >= 60 ? 'good' : 'warning'}">
                            ${securityScore >= 80 ? 'Vollständig umgesetzt' : securityScore >= 60 ? 'Grundlegend vorhanden' : 'Verbesserungsbedarf'}
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Sicherheitsmaßnahmen ${hasRealData ? '✓ <strong style="color: #10b981;">Echte Headerprüfung</strong>' : ''}</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="${securityScore < 60 ? '0-60' : securityScore < 80 ? '60-80' : '80-100'}" style="width: ${securityScore}%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: ${securityScore >= 90 ? '#000' : '#fff'}; font-weight: bold; font-size: 12px;">${securityScore}%</span>
                                </div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #6b7280;">
                                <strong>Untersuchte Parameter:</strong> CSP ${csp ? '✓' : '✗'}, X-Frame-Options ${xFrame ? '✓' : '✗'}, X-Content-Type ${xContent ? '✓' : '✗'}, HSTS ${hsts ? '✓' : '✗'}, Referrer-Policy ${referrer ? '✓' : '✗'}
                            </div>
                        </div>
                          `;
                        })()}
                    </div>

                    <div class="metric-item">
                        <div class="metric-title">Website-Sicherheit (Google Safe Browsing)</div>
                        ${(() => {
                          if (!securityData) {
                            return `
                        <div class="metric-value" style="color: #9ca3af;">
                            Keine Daten verfügbar
                        </div>
                        <div class="progress-container">
                            <p style="color: #9ca3af; margin: 0;">Keine Sicherheitsdaten verfügbar</p>
                        </div>
                            `;
                          }
                          
                          const websiteSecurityScore = securityData.isSafe === true ? 100 : securityData.isSafe === false ? 0 : 50;
                          
                          if (securityData.isSafe === true) {
                            return `
                        <div class="metric-value excellent">
                            ✓ Website ist sicher
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Google Safe Browsing Prüfung</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="90-100" style="width: 100%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: #000; font-weight: bold; font-size: 12px;">100%</span>
                                </div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #059669;">
                                <strong>Status:</strong> Keine bekannten Sicherheitsbedrohungen gefunden
                            </div>
                        </div>
                            `;
                          } else if (securityData.isSafe === false && securityData.threats && securityData.threats.length > 0) {
                            const threatsHTML = securityData.threats.map((threat: any) => `
                              • ${threat.threatType || 'Unbekannte Bedrohung'}
                            `).join('<br>');
                            
                            return `
                        <div class="metric-value danger">
                            ⚠️ ${securityData.threats.length} Bedrohung${securityData.threats.length > 1 ? 'en' : ''} erkannt
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Google Safe Browsing Prüfung</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="0-60" style="width: 0%; background-color: #dc2626;"></div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #991b1b;">
                                <strong>Erkannte Bedrohungen:</strong><br>${threatsHTML}
                            </div>
                        </div>
                            `;
                          }
                          
                          return `
                        <div class="metric-value warning">
                            Status unbekannt
                        </div>
                        <div class="progress-container">
                            <div class="progress-label">
                                <span>Google Safe Browsing Prüfung</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" data-score="60-80" style="width: 50%; display: flex; align-items: center; justify-content: center;">
                                    <span style="color: #fff; font-weight: bold; font-size: 12px;">50%</span>
                                </div>
                            </div>
                            <div style="margin-top: 6px; font-size: 11px; color: #9ca3af;">
                                <strong>Status:</strong> Prüfung konnte nicht durchgeführt werden
                            </div>
                        </div>
                          `;
                        })()}
                    </div>

                    <!-- Kritische Fehler-Analyse Box mit Score-Kappung -->
                    ${(() => {
                      const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
                      const trackingScripts = manualDataPrivacyData?.trackingScripts || [];
                      const externalServices = manualDataPrivacyData?.externalServices || [];
                      
                      // Sammle kritische Fehler
                      const criticalErrors: { source: string; description: string; neutralized: boolean; neutralizedBy?: string }[] = [];
                      
                      // 1. Auto-detected Violations
                      (privacyData?.violations || []).forEach((v: any, i: number) => {
                        if (!deselectedViolations.includes(`auto-${i}`)) {
                          const isSSLViolation = (v.description?.includes('SSL') || v.description?.includes('TLS') || v.description?.includes('Verschlüsselung')) && !v.description?.includes('HSTS');
                          const isCookieViolation = v.description?.includes('Cookie') && v.description?.includes('Banner');
                          
                          const neutralizedBySSL = isSSLViolation && manualDataPrivacyData?.hasSSL === true;
                          const neutralizedByCookie = isCookieViolation && manualDataPrivacyData?.cookieConsent === true;
                          
                          if (v.severity === 'critical' || v.severity === 'high') {
                            criticalErrors.push({
                              source: 'Auto',
                              description: v.description || 'Auto-detected violation',
                              neutralized: neutralizedBySSL || neutralizedByCookie,
                              neutralizedBy: neutralizedBySSL ? 'SSL vorhanden' : neutralizedByCookie ? 'Cookie-Consent vorhanden' : undefined
                            });
                          }
                        }
                      });
                      
                      // 2. Custom Violations
                      (manualDataPrivacyData?.customViolations || []).forEach((v: any) => {
                        if (v.severity === 'critical' || v.severity === 'high') {
                          criticalErrors.push({ source: 'Manuell', description: v.description || 'Custom violation', neutralized: false });
                        }
                      });
                      
                      // 3. Tracking-Scripts ohne Consent
                      trackingScripts.forEach((s: any) => {
                        if ((s.type === 'marketing' || s.type === 'analytics') && !s.consentRequired) {
                          criticalErrors.push({ source: 'Tracking', description: `"${s.name}" (${s.type}) ohne Consent`, neutralized: false });
                        }
                      });
                      
                      // 4. Externe Dienste in Drittland ohne AVV
                      externalServices.forEach((s: any) => {
                        if (s.thirdCountry && !s.dataProcessingAgreement) {
                          criticalErrors.push({ source: 'Drittland', description: `"${s.name}"${s.country ? ` (${s.country})` : ''} ohne AVV`, neutralized: false });
                        }
                      });
                      
                      // 5. Drittland-Transfer ohne Details
                      if (manualDataPrivacyData?.thirdCountryTransfer && !manualDataPrivacyData?.thirdCountryTransferDetails) {
                        criticalErrors.push({ source: 'Art. 44-49', description: 'Drittland-Transfer ohne Dokumentation der Rechtsgrundlage', neutralized: false });
                      }
                      
                      const neutralizedErrors = criticalErrors.filter(e => e.neutralized);
                      const remainingErrors = criticalErrors.filter(e => !e.neutralized);
                      
                      let scoreCap = 100;
                      if (remainingErrors.length >= 3) scoreCap = 20;
                      else if (remainingErrors.length === 2) scoreCap = 35;
                      else if (remainingErrors.length === 1) scoreCap = 59;
                      
                      if (criticalErrors.length === 0) return '';
                      
                      const positiveInputs = [];
                      if (manualDataPrivacyData?.hasSSL) positiveInputs.push('SSL');
                      if (manualDataPrivacyData?.cookieConsent) positiveInputs.push('Cookie-Banner');
                      if (manualDataPrivacyData?.privacyPolicy) positiveInputs.push('DSE');
                      if (manualDataPrivacyData?.dataProtectionOfficer) positiveInputs.push('DSB');
                      if (manualDataPrivacyData?.processingRegister) positiveInputs.push('VV');
                      
                      return `
                    <div class="metric-item" style="grid-column: span 2;">
                        <div class="metric-title">🔍 Kritische Fehler-Analyse (DSGVO)</div>
                        <div style="padding: 12px; border-radius: 8px; background: ${remainingErrors.length > 0 ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${remainingErrors.length > 0 ? '#fecaca' : '#bbf7d0'}; margin-top: 8px;">
                            <div style="font-size: 13px; margin-bottom: 8px;">
                                <strong>Erkannte kritische Fehler: ${criticalErrors.length}</strong>
                            </div>
                            ${neutralizedErrors.length > 0 ? `
                            <div style="font-size: 12px; color: #166534; margin-bottom: 8px;">
                                ✓ ${neutralizedErrors.length} Fehler durch manuelle Eingaben neutralisiert:
                                <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 11px;">
                                    ${neutralizedErrors.map(e => `<li>${e.description} <span style="color: #059669;">(${e.neutralizedBy})</span></li>`).join('')}
                                </ul>
                            </div>
                            ` : ''}
                            ${remainingErrors.length > 0 ? `
                            <div style="font-size: 12px; color: #991b1b; margin-bottom: 8px;">
                                ⚠️ ${remainingErrors.length} kritische Fehler verbleibend:
                                <ul style="margin: 4px 0 0 16px; padding: 0; font-size: 11px;">
                                    ${remainingErrors.map(e => `<li><span style="color: #dc2626;">[${e.source}]</span> ${e.description}</li>`).join('')}
                                </ul>
                            </div>
                            <div style="font-size: 13px; font-weight: bold; color: #991b1b; padding: 8px; background: #fee2e2; border-radius: 4px;">
                                📊 Score-Kappung: Maximum ${scoreCap}% erreichbar
                            </div>
                            ${positiveInputs.length > 0 ? `
                            <div style="margin-top: 8px; font-size: 11px; color: #92400e; padding: 6px 8px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px;">
                                <strong>ℹ️</strong> Trotz positiver Angaben (${positiveInputs.join(', ')}) ist die Bewertung aufgrund verbleibender kritischer Fehler gekappt.
                            </div>
                            ` : ''}
                            ` : `
                            <div style="font-size: 12px; color: #166534; font-weight: 500;">
                                ✓ Alle kritischen Fehler neutralisiert - keine Score-Kappung
                            </div>
                            `}
                        </div>
                    </div>
                      `;
                    })()}

                    <!-- DSGVO Compliance Checkliste -->
                    <div class="metric-item" style="grid-column: span 2;">
                        <div class="metric-title">DSGVO-Compliance Checkliste</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px;">
                            <div style="font-size: 13px;">
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span>Art. 7 - Einwilligung</span>
                                    <span style="color: ${privacyData?.hasConsentBanner || manualDataPrivacyData?.cookieConsent ? '#059669' : '#dc2626'}; font-weight: 600;">
                                        ${privacyData?.hasConsentBanner || manualDataPrivacyData?.cookieConsent ? '✓ Vorhanden' : '✗ Fehlend'}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span>Art. 13-14 - Informationspflichten</span>
                                    <span style="color: ${privacyData?.hasPrivacyPolicy || manualDataPrivacyData?.privacyPolicy ? '#059669' : '#dc2626'}; font-weight: 600;">
                                        ${privacyData?.hasPrivacyPolicy || manualDataPrivacyData?.privacyPolicy ? '✓ Erfüllt' : '✗ Mangelhaft'}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span>Art. 28 - Auftragsverarbeitung</span>
                                    <span style="color: ${manualDataPrivacyData?.dataProcessingAgreement ? '#059669' : '#d97706'}; font-weight: 600;">
                                        ${manualDataPrivacyData?.dataProcessingAgreement ? '✓ Dokumentiert' : '○ Nicht angegeben'}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span>Art. 30 - Verarbeitungsverzeichnis</span>
                                    <span style="color: ${manualDataPrivacyData?.processingRegister ? '#059669' : '#d97706'}; font-weight: 600;">
                                        ${manualDataPrivacyData?.processingRegister ? '✓ Vorhanden' : '○ Nicht angegeben'}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                                    <span>Art. 37 - Datenschutzbeauftragter</span>
                                    <span style="color: ${manualDataPrivacyData?.dataProtectionOfficer ? '#059669' : '#d97706'}; font-weight: 600;">
                                        ${manualDataPrivacyData?.dataProtectionOfficer ? '✓ Bestellt' : '○ Nicht angegeben'}
                                    </span>
                                </div>
                            </div>
                            <div style="font-size: 13px;">
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span>Art. 44-49 - Drittlandtransfer</span>
                                    <span style="color: ${manualDataPrivacyData?.thirdCountryTransfer ? (manualDataPrivacyData?.thirdCountryTransferDetails ? '#d97706' : '#dc2626') : '#059669'}; font-weight: 600;">
                                        ${manualDataPrivacyData?.thirdCountryTransfer ? (manualDataPrivacyData?.thirdCountryTransferDetails ? '⚠ Dokumentiert' : '✗ Undokumentiert') : '✓ Nicht relevant'}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span>Betroffenenrechte</span>
                                    <span style="color: ${manualDataPrivacyData?.dataSubjectRights ? '#059669' : '#d97706'}; font-weight: 600;">
                                        ${manualDataPrivacyData?.dataSubjectRights ? '✓ Gewährleistet' : '○ Nicht angegeben'}
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span>Tracking-Scripts erfasst</span>
                                    <span style="font-weight: 600;">${(manualDataPrivacyData?.trackingScripts || []).length}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb;">
                                    <span>Externe Dienste erfasst</span>
                                    <span style="font-weight: 600;">${(manualDataPrivacyData?.externalServices || []).length}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 6px 0;">
                                    <span>Dienste mit AVV</span>
                                    <span style="font-weight: 600; color: ${(manualDataPrivacyData?.externalServices || []).filter((s: any) => s.dataProcessingAgreement).length === (manualDataPrivacyData?.externalServices || []).length && (manualDataPrivacyData?.externalServices || []).length > 0 ? '#059669' : (manualDataPrivacyData?.externalServices || []).length === 0 ? '#6b7280' : '#d97706'};">
                                        ${(manualDataPrivacyData?.externalServices || []).filter((s: any) => s.dataProcessingAgreement).length}/${(manualDataPrivacyData?.externalServices || []).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                        ${(manualDataPrivacyData?.trackingScripts || []).length > 0 || (manualDataPrivacyData?.externalServices || []).length > 0 ? `
                        <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb;">
                            ${(manualDataPrivacyData?.trackingScripts || []).length > 0 ? `
                            <div style="margin-bottom: 12px;">
                                <strong style="font-size: 12px; color: #6b7280;">Erfasste Tracking-Scripts:</strong>
                                <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${(manualDataPrivacyData?.trackingScripts || []).map((s: any) => `
                                        <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: ${s.consentRequired ? '#f0f9ff' : '#fef2f2'}; color: ${s.consentRequired ? '#0369a1' : '#dc2626'}; border: 1px solid ${s.consentRequired ? '#bae6fd' : '#fecaca'};">
                                            ${s.name} (${s.type})${s.consentRequired ? '' : ' ⚠'}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            ` : ''}
                            ${(manualDataPrivacyData?.externalServices || []).length > 0 ? `
                            <div>
                                <strong style="font-size: 12px; color: #6b7280;">Erfasste externe Dienste:</strong>
                                <div style="margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px;">
                                    ${(manualDataPrivacyData?.externalServices || []).map((s: any) => `
                                        <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: ${s.dataProcessingAgreement ? '#f0fdf4' : '#fef2f2'}; color: ${s.dataProcessingAgreement ? '#166534' : '#dc2626'}; border: 1px solid ${s.dataProcessingAgreement ? '#bbf7d0' : '#fecaca'};">
                                            ${s.name} ${s.dataProcessingAgreement ? '✓ AVV' : '✗ AVV'}${s.thirdCountry ? ' 🌍' : ''}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                            ` : ''}
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                ${technicalSecurityScore < 90 ? `
                <div class="recommendations">
                    <h4>Empfehlungen zur technischen Datenschutz-Verbesserung:</h4>
                    <ul>
                        <li><strong>SSL-Konfiguration und Sicherheitsheader optimieren</strong><br>
                        <span style="font-size: 14px; color: #666; display: block; margin-top: 4px;">Durch moderne Verschlüsselungsmethoden und Security-Header schützen Sie die Daten Ihrer Besucher vor Angriffen und erfüllen gleichzeitig gesetzliche Anforderungen.</span></li>
                        ${(() => {
                          const hasCookieViolations = activeViolations.some(v => v.cookieRelated);
                          return hasCookieViolations ? '<li><strong>Implementierung eines TTDSG-konformen Cookie-Banners</strong><br><span style="font-size: 14px; color: #666; display: block; margin-top: 4px;">Ein rechtskonformes Cookie-Banner stellt sicher, dass Ihre Besucher vor dem Setzen von Cookies aktiv zustimmen können - das schützt Sie vor teuren Abmahnungen.</span></li>' : '';
                        })()}
                        <li><strong>Cookie-Policy erstellen und verlinken</strong><br>
                        <span style="font-size: 14px; color: #666; display: block; margin-top: 4px;">Eine transparente Cookie-Richtlinie informiert Ihre Kunden darüber, welche Daten erfasst werden und schafft Vertrauen in Ihre Website.</span></li>
                        <li><strong>Technische Sicherheitsmaßnahmen verstärken</strong><br>
                        <span style="font-size: 14px; color: #666; display: block; margin-top: 4px;">Moderne Sicherheitstechnologien wie Content Security Policy und sichere Cookie-Einstellungen schützen Ihre Website vor Hackerangriffen und Datenlecks.</span></li>
                        <li><strong>Regelmäßige Sicherheitsupdates durchführen</strong><br>
                        <span style="font-size: 14px; color: #666; display: block; margin-top: 4px;">Durch kontinuierliche Updates Ihrer Website-Software schließen Sie Sicherheitslücken frühzeitig und minimieren das Risiko von Cyberangriffen.</span></li>
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};
