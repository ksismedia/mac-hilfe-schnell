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

// Calculate industry review platforms score
export const calculateIndustryReviewScore = (
  manualIndustryReviewData?: { platforms: any[]; overallScore?: number } | null
): number => {
  if (!manualIndustryReviewData || !manualIndustryReviewData.overallScore) {
    return 0;
  }
  return manualIndustryReviewData.overallScore;
};

// Calculate online presence score
export const calculateOnlinePresenceScore = (
  manualOnlinePresenceData?: { items: any[]; overallScore?: number } | null
): number => {
  if (!manualOnlinePresenceData || !manualOnlinePresenceData.overallScore) {
    return 0;
  }
  return manualOnlinePresenceData.overallScore;
};

export const calculateSocialMediaCategoryScore = (
  realData: RealBusinessData,
  manualSocialData?: ManualSocialData | null,
  manualWorkplaceData?: ManualWorkplaceData | null,
  manualIndustryReviewData?: { platforms: any[]; overallScore?: number } | null,
  manualOnlinePresenceData?: { items: any[]; overallScore?: number } | null
): number => {
  const socialMediaScore = calculateSocialMediaPerformanceScore(realData, manualSocialData);
  const industryReviewScore = calculateIndustryReviewScore(manualIndustryReviewData);
  const onlinePresenceScore = calculateOnlinePresenceScore(manualOnlinePresenceData);
  
  // Collect all scores that exist
  const scores = [socialMediaScore];
  if (industryReviewScore > 0) scores.push(industryReviewScore);
  if (onlinePresenceScore > 0) scores.push(onlinePresenceScore);
  
  // Return average of all available scores
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
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
  manualSocialData?: ManualSocialData | null,
  manualIndustryReviewData?: { platforms: any[]; overallScore?: number } | null,
  manualOnlinePresenceData?: { items: any[]; overallScore?: number } | null
): number => {
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const googleReviewsScore = (realData.reviews?.google?.count || 0) > 0 ? 
    Math.min(100, (realData.reviews?.google?.rating || 0) * 20) : 0;
  const industryReviewScore = calculateIndustryReviewScore(manualIndustryReviewData);
  const onlinePresenceScore = calculateOnlinePresenceScore(manualOnlinePresenceData);
  
  const metrics = [
    { score: socialMediaScore, weight: 30 }, // Social Media (reduced from 40)
    { score: realData.socialProof?.overallScore || 0, weight: 20 }, // Social Proof (reduced from 25)
    { score: googleReviewsScore, weight: 15 }, // Google-Bewertungen
  ];
  
  // Add Industry Review score if available
  if (industryReviewScore > 0) {
    metrics.push({ score: industryReviewScore, weight: 20 }); // Branchenplattformen
  }
  
  // Add Online Presence score if available
  if (onlinePresenceScore > 0) {
    metrics.push({ score: onlinePresenceScore, weight: 15 }); // Online-Präsenz
  }
  
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
export const calculateLocalSEOScore = (businessData: any, realData: any, manualData?: any): number => {
  console.log('📍 calculateLocalSEOScore called');
  
  const autoScore = realData?.seo?.score || 0;
  const manualScore = manualData?.overallScore;
  
  // Wenn beide Datenquellen vorhanden sind, kombiniere sie
  if (autoScore > 0 && manualScore !== undefined) {
    // Gewichteter Durchschnitt: 60% automatisch, 40% manuell
    const combined = Math.round(autoScore * 0.6 + manualScore * 0.4);
    console.log('📍 Combined Local SEO score (auto + manual):', { autoScore, manualScore, combined });
    return combined;
  }
  
  // Wenn nur manuelle Daten vorhanden
  if (manualScore !== undefined) {
    console.log('📍 Using manual Local SEO score:', manualScore);
    return manualScore;
  }
  
  // Wenn nur automatische Daten vorhanden
  if (autoScore > 0) {
    console.log('📍 Using auto Local SEO score:', autoScore);
    return autoScore;
  }
  
  // Fallback
  console.log('📍 No data available, using default 75');
  return 75;
};

export const calculateStaffQualificationScore = (data: any): number => {
  // Echte Berechnung basierend auf Daten
  if (!data) return 0;
  
  let score = 0;
  const totalEmployees = data.totalEmployees || 1;
  const masters = data.masters || 0;
  const skilledWorkers = data.skilled_workers || 0;
  const officeWorkers = data.office_workers || 0;
  
  // NEUE LOGIK: Basis-Score für hohe Gesamtqualifikation
  const totalQualified = masters + skilledWorkers + officeWorkers;
  const totalQualifiedRatio = totalQualified / totalEmployees;
  
  // Basis-Score: 40 Punkte für hohe Gesamtqualifikation
  if (totalQualifiedRatio >= 0.9) {
    score += 40; // Exzellent: >90% qualifiziert
  } else if (totalQualifiedRatio >= 0.8) {
    score += 35; // Sehr gut: 80-90%
  } else if (totalQualifiedRatio >= 0.7) {
    score += 30; // Gut: 70-80%
  } else if (totalQualifiedRatio >= 0.5) {
    score += 20; // Mittel: 50-70%
  } else if (totalQualifiedRatio > 0) {
    score += totalQualifiedRatio * 40; // Linear unter 50%
  }
  
  // Meister-Quote (25 Punkte max) - weniger streng
  const masterRatio = masters / totalEmployees;
  let masterScore = 0;
  if (masterRatio >= 0.15) {
    masterScore = 25; // Volle Punkte ab 15% Meister
  } else if (masterRatio >= 0.05) {
    masterScore = 15 + ((masterRatio - 0.05) / 0.1) * 10; // 15-25 Punkte zwischen 5-15%
  } else if (masterRatio > 0) {
    masterScore = (masterRatio / 0.05) * 15; // 0-15 Punkte unter 5%
  }
  score += masterScore;
  
  // Facharbeiter-Anteil (20 Punkte max)
  const totalQualifiedWorkers = skilledWorkers + officeWorkers;
  const qualifiedWorkerRatio = totalQualifiedWorkers / totalEmployees;
  let skilledScore = 0;
  if (qualifiedWorkerRatio >= 0.6) {
    skilledScore = 20; // Volle Punkte ab 60%
  } else if (qualifiedWorkerRatio > 0) {
    skilledScore = (qualifiedWorkerRatio / 0.6) * 20;
  }
  score += skilledScore;
  
  // Bonus für sehr hohe Gesamtqualifikation
  if (totalQualifiedRatio >= 0.95) {
    score += 10; // Bonus für >95% qualifiziert
  } else if (totalQualifiedRatio >= 0.85) {
    score += 5; // Bonus für >85% qualifiziert
  }
  
  // Zertifizierungen (5 Punkte)
  let certificationPoints = 0;
  if (data.certifications?.welding_certificates) certificationPoints += 1;
  if (data.certifications?.safety_training) certificationPoints += 1;
  if (data.certifications?.first_aid) certificationPoints += 1;
  if (data.certifications?.digital_skills) certificationPoints += 1;
  if (data.certifications?.instructor_qualification) certificationPoints += 1;
  if (data.certifications?.business_qualification) certificationPoints += 1;
  score += (certificationPoints / 6) * 5;
  
  // Branchenspezifische Qualifikationen (10 Punkte)
  const industrySpecificCount = data.industry_specific?.length || 0;
  score += (industrySpecificCount / 6) * 10;
  
  // Mitarbeiterschulungen (10 Punkte)
  if (data.offers_employee_training) {
    score += 10;
  }
  
  // Mitarbeiterzertifikate (10 Punkte)
  const certifications = data.employee_certifications || [];
  const certCount = certifications.length;
  if (certCount >= 5) score += 10;
  else score += (certCount / 5) * 10;
  
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
  
  const autoScore = realData?.content?.qualityScore || 0;
  
  // Berechne manuellen Score falls Daten vorhanden
  let manualScore = 0;
  if (manualContentData) {
    const scores = [
      manualContentData.textQuality,
      manualContentData.contentRelevance,
      manualContentData.expertiseLevel,
      manualContentData.contentFreshness
    ];
    
    const hasNaN = scores.some(score => isNaN(score));
    if (!hasNaN) {
      manualScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    }
  }
  
  // Wenn beide Datenquellen vorhanden sind, kombiniere sie
  if (autoScore > 0 && manualScore > 0) {
    // Gewichteter Durchschnitt: 50% automatisch, 50% manuell (Content-Qualität gleichwertig)
    const combined = Math.round(autoScore * 0.5 + manualScore * 0.5);
    console.log('📝 Combined content score (auto + manual):', { autoScore, manualScore, combined });
    return combined;
  }
  
  // Wenn nur manuelle Daten vorhanden
  if (manualScore > 0) {
    console.log('📝 Using manual content score:', manualScore);
    return manualScore;
  }
  
  // Wenn nur automatische Daten vorhanden
  if (autoScore > 0) {
    console.log('📝 Using auto content score:', autoScore);
    return autoScore;
  }
  
  // Fallback
  console.log('📝 No data available, using default 75');
  return 75;
};

export const calculateBacklinksScore = (realData: any, manualBacklinkData: any): number => {
  console.log('🔗 calculateBacklinksScore called with:', {
    realData: realData ? 'present' : 'null',
    manualBacklinkData: manualBacklinkData ? 'present' : 'null'
  });
  
  const autoScore = realData?.backlinks?.score || 0;
  const manualScore = manualBacklinkData?.overallScore;
  
  // Wenn beide Datenquellen vorhanden sind, kombiniere sie
  if (autoScore > 0 && manualScore !== undefined && !isNaN(manualScore)) {
    // Gewichteter Durchschnitt: 60% automatisch, 40% manuell
    const combined = Math.round(autoScore * 0.6 + manualScore * 0.4);
    console.log('🔗 Combined backlink score (auto + manual):', { autoScore, manualScore, combined });
    return combined;
  }
  
  // Wenn nur manuelle Daten vorhanden
  if (manualScore !== undefined && !isNaN(manualScore)) {
    console.log('🔗 Using manual backlink score:', manualScore);
    return manualScore;
  }
  
  // Wenn nur automatische Daten vorhanden
  if (autoScore > 0) {
    console.log('🔗 Using auto backlink score:', autoScore);
    return autoScore;
  }
  
  // Fallback
  console.log('🔗 No data available, using default 75');
  return 75;
};

// Helper function stub for Corporate Identity (actual implementation is above)

export const calculateAccessibilityScore = (realData: any, manualAccessibilityData: any): number => {
  console.log('🎯 calculateAccessibilityScore called with:', {
    realData: realData ? 'present' : 'null',
    manualAccessibilityData: manualAccessibilityData ? manualAccessibilityData : 'null'
  });
  
  // Berechne automatischen Score
  let autoScore = 40; // Default
  if (realData?.violations && realData.violations.length > 0) {
    autoScore = Math.min(59, 40); // Grundwert bei automatisch erkannten Problemen
  } else if (realData?.violations && realData.violations.length === 0) {
    autoScore = 85; // Keine automatisch erkannten Probleme
  }
  
  // Berechne manuellen Score falls Daten vorhanden
  let manualScore = 0;
  if (manualAccessibilityData) {
    const allFeaturesEnabled = 
      manualAccessibilityData.keyboardNavigation &&
      manualAccessibilityData.screenReaderCompatible &&
      manualAccessibilityData.colorContrast &&
      manualAccessibilityData.altTextsPresent &&
      manualAccessibilityData.focusVisibility &&
      manualAccessibilityData.textScaling;
    
    if (allFeaturesEnabled) {
      manualScore = 100;
    } else {
      const missingFeatures = [
        !manualAccessibilityData.keyboardNavigation,
        !manualAccessibilityData.screenReaderCompatible,
        !manualAccessibilityData.colorContrast,
        !manualAccessibilityData.altTextsPresent,
        !manualAccessibilityData.focusVisibility,
        !manualAccessibilityData.textScaling
      ].filter(Boolean).length;
      
      if (missingFeatures > 0) {
        const maxScore = Math.max(20, 50 - (missingFeatures - 1) * 8);
        const enabledFeatures = 6 - missingFeatures;
        manualScore = Math.round((enabledFeatures / 6) * maxScore);
      }
    }
  }
  
  // Wenn beide Datenquellen vorhanden sind, kombiniere sie
  if (manualScore > 0 && autoScore > 0) {
    // Nutze den höheren Wert, da manuelle Prüfung oft genauer ist
    // Aber kombiniere mit 70% manuell, 30% auto für Ausgleich
    const combined = Math.round(manualScore * 0.7 + autoScore * 0.3);
    console.log('🎯 Combined accessibility score (auto + manual):', { autoScore, manualScore, combined });
    return combined;
  }
  
  // Wenn nur manuelle Daten vorhanden
  if (manualScore > 0) {
    console.log('🎯 Using manual accessibility score:', manualScore);
    return manualScore;
  }
  
  // Wenn nur automatische Daten vorhanden
  console.log('🎯 Using auto accessibility score:', autoScore);
  return autoScore;
};

export const calculateCorporateIdentityScore = (data: any): number => {
  // Wenn keine Außendarstellungs-Daten vorhanden, verwende Defaultwert
  if (!data) return 50;
  
  // Zähle alle Felder
  const allFields = [
    // Corporate Design (5 Felder)
    data.uniformLogo,
    data.uniformWorkClothing,
    data.uniformColorScheme,
    data.uniformTypography,
    data.uniformWebsiteDesign,
    // Eingesetzte Werbemittel (2 Felder)
    data.hauszeitung,
    data.herstellerInfos,
    // Außenwirkung Fahrzeugflotte (2 Felder)
    data.uniformVehicleBranding,
    data.vehicleCondition,
    // Außenwerbung (2 Felder)
    data.bauzaunBanner,
    data.bandenWerbung
  ];
  
  // Zähle nur "yes" - alles andere (no, unknown) wird nicht negativ gewertet
  const yesCount = allFields.filter(f => f === 'yes').length;
  const totalFields = allFields.length; // 11 Felder insgesamt
  
  // Wenn gar keine "yes" vorhanden sind, gib 50% zurück (neutral)
  if (yesCount === 0) return 50;
  
  // Berechne Score: Nur vorhandene Elemente zählen positiv
  // 0 yes = 50%, 11 yes = 100%, linear dazwischen
  const score = 50 + (yesCount / totalFields) * 50;
  
  return Math.round(score);
};

export const calculateDataPrivacyScore = (realData: any, privacyData: any, manualDataPrivacyData?: any): number => {
  // If manual score override is set, use it
  if (manualDataPrivacyData?.overallScore !== undefined && manualDataPrivacyData.overallScore !== privacyData?.score) {
    return manualDataPrivacyData.overallScore;
  }
  
  // Calculate compliance bonus from manual checkboxes
  let complianceBonus = 0;
  if (manualDataPrivacyData) {
    // Each positive compliance element adds points
    if (manualDataPrivacyData.hasSSL) complianceBonus += 15;
    if (manualDataPrivacyData.privacyPolicy) complianceBonus += 15;
    if (manualDataPrivacyData.cookiePolicy) complianceBonus += 10;
    if (manualDataPrivacyData.gdprCompliant) complianceBonus += 20;
    if (manualDataPrivacyData.cookieConsent) complianceBonus += 15;
    if (manualDataPrivacyData.dataProcessingAgreement) complianceBonus += 10;
    if (manualDataPrivacyData.dataSubjectRights) complianceBonus += 15;
    // Total possible bonus: 100 points
  }
  
  // If all compliance elements are checked, return 100%
  if (complianceBonus === 100) {
    return 100;
  }
  
  // Otherwise calculate dynamic score based on violations
  if (!privacyData?.score) {
    return Math.min(100, complianceBonus); // Use compliance bonus if no privacy data
  }
  
  const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
  const customViolations = manualDataPrivacyData?.customViolations || [];
  const totalViolations = privacyData.violations || [];
  
  // Calculate active violations (not deselected)
  const activeViolations = totalViolations.filter(
    (v: any) => !deselectedViolations.includes(v.article)
  );
  
  // If no active violations and no custom violations, combine base score with compliance bonus
  if (activeViolations.length === 0 && customViolations.length === 0) {
    return Math.min(100, privacyData.score + complianceBonus);
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
    
    if (totalViolationCount === 0) return Math.min(100, complianceBonus);
    
    const baseScore = Math.min(privacyData.score, maxScore);
    const scoreRange = maxScore - baseScore;
    const resolvedRatio = 1 - (activeViolationCount / totalViolationCount);
    const proportionalScore = baseScore + (scoreRange * resolvedRatio);
    
    // Add compliance bonus but respect the cap
    const finalScore = Math.min(maxScore, proportionalScore + (complianceBonus * 0.3));
    return Math.round(Math.max(0, finalScore));
  }
  
  // No critical violations - calculate normal proportional score with compliance bonus
  const totalViolationCount = totalViolations.length + customViolations.length;
  const activeViolationCount = activeViolations.length + customViolations.length;
  
  if (totalViolationCount === 0) return Math.min(100, privacyData.score + complianceBonus);
  
  const baseScore = privacyData.score;
  const scoreRange = 100 - baseScore;
  const resolvedRatio = 1 - (activeViolationCount / totalViolationCount);
  const proportionalScore = baseScore + (scoreRange * resolvedRatio);
  
  // Add full compliance bonus
  const finalScore = proportionalScore + (complianceBonus * 0.5);
  return Math.round(Math.max(0, Math.min(100, finalScore)));
};