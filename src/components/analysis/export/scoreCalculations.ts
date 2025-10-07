import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, ManualWorkplaceData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './simpleSocialScore';
import { calculateWorkplaceScore as newCalculateWorkplaceScore } from '@/utils/workplaceScoreCalculation';

const calculateGoogleReviewsScore = (realData: RealBusinessData): number => {
  const reviews = realData.reviews?.google?.count || 0;
  const rating = realData.reviews?.google?.rating || 0;
  let score = 0;

  // Höhere Bewertung der Google Reviews für bessere Wettbewerbsposition
  if (rating > 0) {
    score += (rating / 5) * 50; // Rating contributes 50% (reduziert von 60%)
  }
  if (reviews > 0) {
    // Stark erhöhte Bewertung der Anzahl der Reviews
    if (reviews >= 500) score += 50;
    else if (reviews >= 200) score += 45;
    else if (reviews >= 100) score += 40;
    else if (reviews >= 50) score += 35;
    else if (reviews >= 20) score += 25;
    else if (reviews >= 10) score += 15;
    else score += Math.min(reviews, 10);
  }

  return Math.min(score, 100);
};

const calculateSocialMediaScore = (
  realData: RealBusinessData,
  manualSocialData?: ManualSocialData | null
): number => {
  let score = 0;
  let foundPlatforms = 0;

  if (realData.socialMedia?.facebook?.found || manualSocialData?.facebookUrl) {
    foundPlatforms++;
    if ((realData.socialMedia?.facebook?.followers || 0) > 100 || manualSocialData?.facebookFollowers) {
      score += 20;
    }
  }
  if (realData.socialMedia?.instagram?.found || manualSocialData?.instagramUrl) {
    foundPlatforms++;
    if ((realData.socialMedia?.instagram?.followers || 0) > 100 || manualSocialData?.instagramFollowers) {
      score += 20;
    }
  }
  // Note: linkedin, youtube, tiktok are not in RealBusinessData, using manual data only
  if (manualSocialData?.linkedinUrl) {
    foundPlatforms++;
    if (manualSocialData?.linkedinFollowers) {
      score += 15;
    }
  }
  if (manualSocialData?.youtubeUrl) {
    foundPlatforms++;
    if (manualSocialData?.youtubeSubscribers) {
      score += 15;
    }
  }
  if (manualSocialData?.tiktokUrl) {
    foundPlatforms++;
    if (manualSocialData?.tiktokFollowers) {
      score += 15;
    }
  }

  if (foundPlatforms >= 3) {
    score += 15;
  }

  return score;
};

export const calculateSocialMediaCategoryScore = (
  realData: RealBusinessData,
  manualSocialData?: ManualSocialData | null,
  manualWorkplaceData?: ManualWorkplaceData | null
): number => {
  return calculateSocialMediaPerformanceScore(realData, manualSocialData);
};

export const calculateWorkplaceScore = newCalculateWorkplaceScore;

// Helper function to check if workplace score should show dash
export const hasWorkplaceData = (
  realData: RealBusinessData,
  manualWorkplaceData?: ManualWorkplaceData | null
): boolean => {
  return calculateWorkplaceScore(realData, manualWorkplaceData) !== -1;
};

// New 6-category scoring functions

export const calculateOnlineQualityAuthorityScore = (
  realData: RealBusinessData,
  keywordsScore: number | null,
  businessData: { address: string; url: string; industry: string },
  privacyData: any,
  accessibilityData: any,
  manualContentData: any,
  manualBacklinkData: any
): number => {
  console.log('🔍 calculateOnlineQualityAuthorityScore called with:', {
    realData: realData ? 'present' : 'null',
    keywordsScore,
    businessData,
    privacyData: privacyData ? 'present' : 'null',
    accessibilityData: accessibilityData ? 'present' : 'null'
  });

  const keywords = realData.keywords || [];
  const keywordsFoundCount = keywords.filter(k => k.found).length;
  const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;
  
  const localSEOScore = calculateLocalSEOScore(businessData, realData);
  const contentQualityScore = calculateContentQualityScore(realData, null, businessData, manualContentData);
  const backlinksScore = calculateBacklinksScore(realData, manualBacklinkData);
  const accessibilityScore = calculateAccessibilityScore(realData, accessibilityData);
  const dataPrivacyScore = calculateDataPrivacyScore(realData, privacyData);
  
  console.log('🔍 Individual scores calculated:', {
    seoScore: realData.seo?.score || 0,
    currentKeywordsScore,
    localSEOScore,
    contentQualityScore,
    backlinksScore,
    accessibilityScore,
    dataPrivacyScore,
    imprintScore: realData.imprint?.score || 0
  });
  
  const metrics = [
    { score: realData.seo?.score || 0, weight: 20 }, // SEO-Auswertung
    { score: currentKeywordsScore, weight: 15 }, // Keywords
    { score: localSEOScore, weight: 20 }, // Lokale SEO
    { score: contentQualityScore, weight: 12 }, // Content-Qualität
    { score: backlinksScore, weight: 10 }, // Backlinks
    { score: accessibilityScore, weight: 8 }, // Barrierefreiheit
    { score: dataPrivacyScore, weight: 8 }, // Datenschutz
    { score: realData.imprint?.score || 0, weight: 7 }, // Impressum
  ];
  
  // Check for NaN values in metrics
  const nanCheck = metrics.find(metric => isNaN(metric.score));
  if (nanCheck) {
    console.error('🚨 NaN detected in metric:', nanCheck);
  }
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  console.log('🔍 Final calculation:', {
    totalWeight,
    weightedScore,
    result: Math.round(weightedScore / totalWeight)
  });
  
  const result = Math.round(weightedScore / totalWeight);
  if (isNaN(result)) {
    console.error('🚨 Final result is NaN! Returning 0 as fallback');
    return 0;
  }
  
  return result;
};

export const calculateWebsitePerformanceTechScore = (realData: RealBusinessData): number => {
  const metrics = [
    { score: realData.performance?.score || 0, weight: 50 }, // Website-Performance
    { score: realData.mobile?.overallScore || 0, weight: 35 }, // Mobile-Optimierung
    { score: 75, weight: 15 }, // Conversion-Optimierung (placeholder)
  ];
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

export const calculateSocialMediaPerformanceScore = (
  realData: RealBusinessData,
  manualSocialData?: ManualSocialData | null
): number => {
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const googleReviewsScore = (realData.reviews?.google?.count || 0) > 0 ? 
    Math.min(100, (realData.reviews?.google?.rating || 0) * 20) : 0;
  
  const metrics = [
    { score: socialMediaScore, weight: 40 }, // Social Media
    { score: realData.socialProof?.overallScore || 0, weight: 25 }, // Social Proof
    { score: socialMediaScore, weight: 20 }, // Social Media Analyse (same as Social Media for now)
    { score: googleReviewsScore, weight: 15 }, // Google-Bewertungen
  ];
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

export const calculateMarketEnvironmentScore = (
  realData: RealBusinessData,
  hourlyRateData: any,
  staffQualificationData: any,
  competitorScore: number | null,
  manualWorkplaceData: any
): number => {
  const metrics = [];
  
  // Stundensatzanalyse
  if (hourlyRateData && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0 || hourlyRateData.azubiRate > 0 || hourlyRateData.helferRate > 0 || hourlyRateData.serviceRate > 0 || hourlyRateData.installationRate > 0)) {
    const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
    metrics.push({ score: hourlyRateScore, weight: 30 });
  }
  
  // Mitarbeiterqualifikation
  if (staffQualificationData && staffQualificationData.totalEmployees > 0) {
    const staffScore = calculateStaffQualificationScore(staffQualificationData);
    metrics.push({ score: staffScore, weight: 35 });
  }
  
  // Konkurrenz in Wettbewerbsanalyse
  const competitorAnalysisScore = competitorScore !== null && competitorScore !== undefined ? 
    competitorScore : (realData.competitors?.length > 0 ? Math.min(100, 60 + (realData.competitors.length * 5)) : 30);
  metrics.push({ score: competitorAnalysisScore, weight: 20 });
  
  // Arbeitsplatz-Bewertungen
  const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
  if (workplaceScore !== -1) {
    metrics.push({ score: workplaceScore, weight: 15 });
  }
  
  if (metrics.length === 0) return 0;
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

export const calculateCorporateAppearanceScore = (manualCorporateIdentityData: any): number => {
  if (!manualCorporateIdentityData) return 0;
  return calculateCorporateIdentityScore(manualCorporateIdentityData);
};

export const calculateServiceQualityScore = (quoteResponseData: any): number => {
  if (!quoteResponseData || !quoteResponseData.responseTime) return 0;
  return calculateQuoteResponseScore(quoteResponseData);
};

// Keep existing functions for backward compatibility
export const calculateSEOContentScore = (
  realData: RealBusinessData,
  keywordsScore: number | null,
  businessData: { address: string; url: string; industry: string },
  privacyData: any,
  accessibilityData: any
): number => {
  return calculateOnlineQualityAuthorityScore(realData, keywordsScore, businessData, privacyData, accessibilityData, null, null);
};

export const calculatePerformanceMobileScore = (realData: RealBusinessData): number => {
  return calculateWebsitePerformanceTechScore(realData);
};

export const calculateStaffServiceScore = (
  staffQualificationData: any,
  quoteResponseData: any,
  manualCorporateIdentityData: any,
  hourlyRateData: any
): number => {
  // This function is kept for backward compatibility
  // Market & Environment category now handles staff and hourly rate
  // Service Quality category handles quote response
  // Corporate Appearance category handles corporate identity
  
  // For backward compatibility, combine all scores
  const metrics = [];
  
  if (staffQualificationData && staffQualificationData.totalEmployees > 0) {
    const staffScore = calculateStaffQualificationScore(staffQualificationData);
    metrics.push({ score: staffScore, weight: 30 });
  }
  
  if (quoteResponseData && quoteResponseData.responseTime) {
    const quoteScore = calculateQuoteResponseScore(quoteResponseData);
    metrics.push({ score: quoteScore, weight: 35 });
  }
  
  if (manualCorporateIdentityData) {
    const corporateScore = calculateCorporateIdentityScore(manualCorporateIdentityData);
    metrics.push({ score: corporateScore, weight: 35 });
  }
  
  if (metrics.length === 0) return 0;
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

// Add missing function stubs for exported functions that are expected by other files
export const calculateLocalSEOScore = (businessData: any, realData: any): number => {
  console.log('📍 calculateLocalSEOScore called');
  // Verwende echte SEO-Daten falls vorhanden
  const result = realData?.seo?.score || 75;
  console.log('📍 Local SEO score:', result);
  return isNaN(result) ? 75 : result;
};

export const calculateStaffQualificationScore = (data: any): number => {
  // Echte Berechnung basierend auf Daten
  if (!data) return 0; // Keine Bewertung wenn keine Daten vorhanden
  
  let score = 0;
  const totalEmployees = data.totalEmployees || 1;
  const masters = data.masters || 0;
  const skilledWorkers = data.skilled_workers || 0;
  const officeWorkers = data.office_workers || 0; // Bürokräfte hinzufügen
  
  // Meister-Quote (35% der Bewertung) - Progressives Bewertungssystem
  const masterRatio = masters / totalEmployees;
  let masterScore = 0;
  if (masterRatio >= 0.2) {
    masterScore = 35; // Volle Punkte ab 20% Meister
  } else if (masterRatio >= 0.1) {
    masterScore = (masterRatio - 0.1) * (35 / 0.1); // Linear zwischen 10% und 20%
  } else if (masterRatio > 0) {
    masterScore = masterRatio * (35 / 0.1) * 0.5; // Reduzierte Punkte unter 10%
  }
  
  // Bonus für sehr hohe Meisterquote
  if (masterRatio >= 0.4) {
    masterScore += 5; // Extra 5 Punkte für >40% Meister
  }
  score += Math.min(masterScore, 40); // Maximal 40 Punkte für Meister
  
  // Facharbeiter-Quote + Bürokräfte (25% der Bewertung) - Bürokräfte als vollwertige Facharbeiter bewerten
  const totalQualifiedWorkers = skilledWorkers + officeWorkers; // Bürokräfte + Facharbeiter zusammenrechnen
  const qualifiedWorkerRatio = totalQualifiedWorkers / totalEmployees;
  let skilledScore = 0;
  if (qualifiedWorkerRatio >= 0.3) {
    skilledScore = 25; // Volle Punkte ab 30% qualifizierte Arbeiter (Facharbeiter + Bürokräfte)
  } else if (qualifiedWorkerRatio >= 0.15) {
    skilledScore = (qualifiedWorkerRatio - 0.15) * (25 / 0.15); // Linear zwischen 15% und 30%
  } else if (qualifiedWorkerRatio > 0) {
    skilledScore = qualifiedWorkerRatio * (25 / 0.15) * 0.6; // Reduzierte Punkte unter 15%
  }
  
  // Bonus für sehr hohe Qualifiziertenquote (Facharbeiter + Bürokräfte)
  if (qualifiedWorkerRatio >= 0.6) {
    skilledScore += 5; // Extra 5 Punkte für >60% qualifizierte Arbeiter
  }
  score += Math.min(skilledScore, 30); // Maximal 30 Punkte für qualifizierte Arbeiter
  
  // Kombinationsbonus für hohe Gesamt-Qualifikationsquote
  const totalQualifiedRatio = (masters + skilledWorkers + officeWorkers) / totalEmployees; // Bürokräfte in Gesamtqualifikation einbeziehen
  if (totalQualifiedRatio >= 0.8) {
    score += 10; // Bonus für >80% qualifizierte Mitarbeiter (Meister + Facharbeiter + Bürokräfte)
  } else if (totalQualifiedRatio >= 0.6) {
    score += 5; // Bonus für >60% qualifizierte Mitarbeiter
  }
  
  // Zertifizierungen (20% der Bewertung)
  let certificationPoints = 0;
  if (data.certifications?.welding_certificates) certificationPoints += 1;
  if (data.certifications?.safety_training) certificationPoints += 1;
  if (data.certifications?.first_aid) certificationPoints += 1;
  if (data.certifications?.digital_skills) certificationPoints += 1;
  if (data.certifications?.instructor_qualification) certificationPoints += 1;
  if (data.certifications?.business_qualification) certificationPoints += 1;
  score += (certificationPoints / 6) * 20;
  
  // Branchenspezifische Qualifikationen (20% der Bewertung)
  const industrySpecificCount = data.industry_specific?.length || 0;
  // Annahme: maximal 6 branchenspezifische Qualifikationen verfügbar
  score += (industrySpecificCount / 6) * 20;
  
  return Math.min(Math.round(score), 100);
};

export const calculateQuoteResponseScore = (data: any): number => {
  // Echte Berechnung basierend auf Quote Response Daten
  if (!data) return 0; // Keine Bewertung wenn keine Daten vorhanden
  
  let score = 0;
  
  // Response Time (40%)
  const responseTimeScore =
    data.responseTime === '1-hour'
      ? 40
      : data.responseTime === '2-4-hours'
      ? 35
      : data.responseTime === '4-8-hours'
      ? 30
      : data.responseTime === '1-day'
      ? 20
      : data.responseTime === '2-3-days'
      ? 10
      : 0; // 'over-3-days' or no response time
  score += responseTimeScore;

  // Contact Methods (30%)
  let contactMethodPoints = 0;
  if (data.contactMethods?.phone) contactMethodPoints += 0.25;
  if (data.contactMethods?.email) contactMethodPoints += 0.25;
  if (data.contactMethods?.contactForm) contactMethodPoints += 0.25;
  if (data.contactMethods?.whatsapp) contactMethodPoints += 0.125;
  if (data.contactMethods?.messenger) contactMethodPoints += 0.125;

  score += Math.min(contactMethodPoints * 30, 30);

  // Response Quality (30%)
  const responseQualityScore =
    data.responseQuality === 'excellent'
      ? 30
      : data.responseQuality === 'good'
      ? 20
      : data.responseQuality === 'average'
      ? 10
      : 0; // 'poor' or no quality rating
  score += responseQualityScore;
  
  return Math.min(score, 100);
};

export const calculateOverallScore = (scores: any): number => {
  return 75; // Default score
};

export const calculateHourlyRateScore = (hourlyRateData: any): number => {
  if (!hourlyRateData) return 75;
  
  // Calculate average own rate and regional average from all available rates
  const ownRates = [
    hourlyRateData.meisterRate,
    hourlyRateData.facharbeiterRate,
    hourlyRateData.azubiRate,
    hourlyRateData.helferRate,
    hourlyRateData.serviceRate,
    hourlyRateData.installationRate
  ].filter(rate => rate > 0);
  
  const regionalRates = [
    hourlyRateData.regionalMeisterRate,
    hourlyRateData.regionalFacharbeiterRate,
    hourlyRateData.regionalAzubiRate,
    hourlyRateData.regionalHelferRate,
    hourlyRateData.regionalServiceRate,
    hourlyRateData.regionalInstallationRate
  ].filter(rate => rate > 0);
  
  if (ownRates.length === 0 || regionalRates.length === 0) return 75;
  
  const avgOwnRate = ownRates.reduce((sum, rate) => sum + rate, 0) / ownRates.length;
  const avgRegionalRate = regionalRates.reduce((sum, rate) => sum + rate, 0) / regionalRates.length;
  
  const rateDifference = avgOwnRate - avgRegionalRate;
  let rateScore = 0;

  if (rateDifference < -10) {
    rateScore = 30; // Region/unterdurchschnittlich
  } else if (rateDifference >= -10 && rateDifference < 0) {
    rateScore = 50; // Region/unterer Durchschnitt
  } else if (rateDifference >= 0 && rateDifference <= 10) {
    rateScore = 85; // Region/marktüblich
  } else if (rateDifference > 10 && rateDifference <= 20) {
    rateScore = 100; // Region/Top-Niveau
  } else {
    rateScore = 70; // Über 20€ teurer
  }

  return rateScore;
};

export const calculateContentQualityScore = (realData: any, manualKeywordData: any, businessData: any, manualContentData: any): number => {
  console.log('📝 calculateContentQualityScore called with:', {
    realData: realData ? 'present' : 'null',
    manualContentData: manualContentData ? 'present' : 'null'
  });
  
  // Verwende manuelle Content-Daten falls vorhanden
  if (manualContentData) {
    const scores = [
      manualContentData.textQuality,
      manualContentData.contentRelevance,
      manualContentData.expertiseLevel,
      manualContentData.contentFreshness
    ];
    
    console.log('📝 Manual content scores:', scores);
    
    // Check for NaN values
    const hasNaN = scores.some(score => isNaN(score));
    if (hasNaN) {
      console.error('🚨 NaN detected in manual content scores:', scores);
      return 75; // Fallback
    }
    
    const result = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    console.log('📝 Calculated content quality score:', result);
    return result;
  }
  
  const fallbackScore = realData?.content?.qualityScore || 75;
  console.log('📝 Using fallback content score:', fallbackScore);
  return fallbackScore;
};

export const calculateBacklinksScore = (realData: any, manualBacklinkData: any): number => {
  console.log('🔗 calculateBacklinksScore called with:', {
    realData: realData ? 'present' : 'null',
    manualBacklinkData: manualBacklinkData ? 'present' : 'null'
  });
  
  // Verwende manuelle Backlink-Daten falls vorhanden
  if (manualBacklinkData) {
    const result = manualBacklinkData.overallScore || 75;
    console.log('🔗 Using manual backlink score:', result);
    return isNaN(result) ? 75 : result;
  }
  
  const result = realData?.backlinks?.score || 75;
  console.log('🔗 Using fallback backlink score:', result);
  return isNaN(result) ? 75 : result;
};

// Helper function stub for Corporate Identity (actual implementation is above)

export const calculateAccessibilityScore = (realData: any, manualAccessibilityData: any): number => {
  console.log('🎯 calculateAccessibilityScore called with:', {
    realData: realData ? 'present' : 'null',
    manualAccessibilityData: manualAccessibilityData ? manualAccessibilityData : 'null'
  });
  
  if (manualAccessibilityData) {
    console.log('🎯 Using manual accessibility data:', manualAccessibilityData);
    
    // Check if all features are enabled (all checkboxes checked)
    const allFeaturesEnabled = 
      manualAccessibilityData.keyboardNavigation &&
      manualAccessibilityData.screenReaderCompatible &&
      manualAccessibilityData.colorContrast &&
      manualAccessibilityData.altTextsPresent &&
      manualAccessibilityData.focusVisibility &&
      manualAccessibilityData.textScaling;
    
    // If all features are enabled, return 100%
    if (allFeaturesEnabled) {
      console.log('🎯 All accessibility features enabled - returning 100%');
      return 100;
    }
    
    // Count missing critical features (critical violations)
    const missingFeatures = [
      !manualAccessibilityData.keyboardNavigation,
      !manualAccessibilityData.screenReaderCompatible,
      !manualAccessibilityData.colorContrast,
      !manualAccessibilityData.altTextsPresent,
      !manualAccessibilityData.focusVisibility,
      !manualAccessibilityData.textScaling
    ].filter(Boolean).length;
    
    // If there are missing features (critical issues), cap score at 50% for one, lower for more
    if (missingFeatures > 0) {
      const maxScore = Math.max(20, 50 - (missingFeatures - 1) * 8);
      const enabledFeatures = 6 - missingFeatures;
      const proportionalScore = (enabledFeatures / 6) * maxScore;
      
      console.log('🎯 Critical issues present, capped score:', Math.round(proportionalScore));
      return Math.round(proportionalScore);
    }
    
    return 100;
  }
  
  // Für automatische Daten: Bei vorhandenen Violations sofort 59% oder weniger
  if (realData?.violations && realData.violations.length > 0) {
    console.log('🎯 Using real data with violations, returning 40');
    return Math.min(59, 40); // Grundwert bei automatisch erkannten Problemen
  }
  
  console.log('🎯 No data available, returning default 75');
  return 40; // FESTER WERT - Default auf 40%
};

export const calculateCorporateIdentityScore = (data: any): number => {
  // Wenn keine Corporate Design Daten vorhanden, verwende Defaultwert
  if (!data) return 50;
  
  let score = 0; // Start bei 0
  
  // Jedes Element gibt 10 Punkte (100/10)
  if (data.uniformLogo) score += 10;
  if (data.uniformWorkClothing) score += 10;
  if (data.uniformVehicleBranding) score += 10;
  if (data.uniformColorScheme) score += 10;
  if (data.uniformTypography) score += 10;
  if (data.uniformBusinessCards) score += 10;
  if (data.uniformWebsiteDesign) score += 10;
  if (data.uniformDocumentTemplates) score += 10;
  if (data.uniformSignage) score += 10;
  if (data.uniformPackaging) score += 10;
  
  return Math.round(score);
};

export const calculateDataPrivacyScore = (realData: any, privacyData: any, manualDataPrivacyData?: any): number => {
  // If manual score override is set, use it
  if (manualDataPrivacyData?.overallScore !== undefined && manualDataPrivacyData.overallScore !== privacyData?.score) {
    return manualDataPrivacyData.overallScore;
  }
  
  // Otherwise calculate dynamic score based on violations
  if (!privacyData?.score) {
    return 26; // Fallback-Score
  }
  
  const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
  const customViolations = manualDataPrivacyData?.customViolations || [];
  const totalViolations = privacyData.violations || [];
  
  // Calculate active violations (not deselected)
  const activeViolations = totalViolations.filter(
    (v: any) => !deselectedViolations.includes(v.article)
  );
  
  // If no active violations and no custom violations, return 100%
  if (activeViolations.length === 0 && customViolations.length === 0) {
    return 100;
  }
  
  // Check for critical/high severity violations in active violations
  const activeCriticalViolations = [...activeViolations, ...customViolations].filter(
    (v: any) => v.severity === 'critical' || v.severity === 'high'
  );
  
  // If there are critical violations, cap score at 50% for one, lower for more
  if (activeCriticalViolations.length > 0) {
    const maxScore = Math.max(20, 50 - (activeCriticalViolations.length - 1) * 10);
    
    const totalViolationCount = totalViolations.length + customViolations.length;
    const activeViolationCount = activeViolations.length + customViolations.length;
    
    if (totalViolationCount === 0) return 100;
    
    const baseScore = Math.min(privacyData.score, maxScore);
    const scoreRange = maxScore - baseScore;
    const resolvedRatio = 1 - (activeViolationCount / totalViolationCount);
    const proportionalScore = baseScore + (scoreRange * resolvedRatio);
    
    return Math.round(Math.max(0, Math.min(maxScore, proportionalScore)));
  }
  
  // No critical violations - calculate normal proportional score
  const totalViolationCount = totalViolations.length + customViolations.length;
  const activeViolationCount = activeViolations.length + customViolations.length;
  
  if (totalViolationCount === 0) return 100;
  
  const baseScore = privacyData.score;
  const scoreRange = 100 - baseScore;
  const resolvedRatio = 1 - (activeViolationCount / totalViolationCount);
  const proportionalScore = baseScore + (scoreRange * resolvedRatio);
  
  return Math.round(Math.max(0, Math.min(100, proportionalScore)));
};