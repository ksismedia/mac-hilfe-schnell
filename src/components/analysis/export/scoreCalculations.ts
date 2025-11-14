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
  manualBacklinkData: any,
  manualLocalSEOData?: any
): number => {
  try {
    console.log('🔍 calculateOnlineQualityAuthorityScore called');

    const keywords = realData?.keywords || [];
    const keywordsFoundCount = keywords.filter(k => k?.found).length;
    const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
    const currentKeywordsScore = (keywordsScore !== null && !isNaN(keywordsScore)) ? keywordsScore : defaultKeywordsScore;
    
    const localSEOScore = calculateLocalSEOScore(businessData, realData, manualLocalSEOData) || 0;
    const contentQualityScore = calculateContentQualityScore(realData, null, businessData, manualContentData) || 0;
    const backlinksScore = calculateBacklinksScore(realData, manualBacklinkData) || 0;
    const accessibilityScore = calculateAccessibilityScore(realData, accessibilityData) || 0;
    const dataPrivacyScore = calculateDataPrivacyScore(realData, privacyData) || 0;
    const seoScore = realData?.seo?.score || 0;
    const imprintScore = realData?.imprint?.score || 0;
    
    // Validate all scores are numbers
    const scores = [
      { name: 'seo', value: seoScore },
      { name: 'keywords', value: currentKeywordsScore },
      { name: 'localSEO', value: localSEOScore },
      { name: 'content', value: contentQualityScore },
      { name: 'backlinks', value: backlinksScore },
      { name: 'accessibility', value: accessibilityScore },
      { name: 'privacy', value: dataPrivacyScore },
      { name: 'imprint', value: imprintScore }
    ];
    
    for (const score of scores) {
      if (isNaN(score.value)) {
        console.error(`🚨 NaN detected in ${score.name} score, using 0`);
        score.value = 0;
      }
    }
    
    const metrics = [
      { score: seoScore, weight: 20 },
      { score: currentKeywordsScore, weight: 15 },
      { score: localSEOScore, weight: 20 },
      { score: contentQualityScore, weight: 12 },
      { score: backlinksScore, weight: 10 },
      { score: accessibilityScore, weight: 8 },
      { score: dataPrivacyScore, weight: 8 },
      { score: imprintScore, weight: 7 }
    ];
    
    const totalWeight = metrics.reduce((sum, metric) => sum + (metric.weight || 0), 0);
    const weightedScore = metrics.reduce((sum, metric) => {
      const score = isNaN(metric.score) ? 0 : metric.score;
      const weight = isNaN(metric.weight) ? 0 : metric.weight;
      return sum + (score * weight);
    }, 0);
    
    if (totalWeight === 0 || isNaN(totalWeight) || isNaN(weightedScore)) {
      console.error('🚨 Invalid calculation, returning fallback 50');
      return 50;
    }
    
    const result = Math.round(weightedScore / totalWeight);
    
    if (isNaN(result) || result < 0 || result > 100) {
      console.error('🚨 Invalid result:', result, 'returning fallback 50');
      return 50;
    }
    
    return result;
  } catch (error) {
    console.error('🚨 calculateOnlineQualityAuthorityScore error:', error);
    return 50; // Safe fallback
  }
};

export const calculateWebsitePerformanceTechScore = (realData: RealBusinessData, manualConversionData?: any): number => {
  // Calculate conversion score from manual data if available
  const conversionScore = manualConversionData ? 
    calculateConversionScore(manualConversionData) : 0;
  
  const metrics = [
    { score: realData.performance?.score || 0, weight: 50 }, // Website-Performance
    { score: realData.mobile?.overallScore || 0, weight: 35 }, // Mobile-Optimierung
    { score: conversionScore, weight: 15 }, // Conversion-Optimierung from manual data
  ];
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

// Helper function to calculate conversion score from manual data
const calculateConversionScore = (data: any): number => {
  if (!data) return 0;
  
  let score = 0;
  
  // CTA Score (40% weight)
  if (data.totalCTAs > 0) {
    const ctaEffectiveness = (data.effectiveCTAs / data.totalCTAs) * 100;
    score += ctaEffectiveness * 0.4;
  }
  
  // Form Score (30% weight)
  if (data.contactForms > 0) {
    const formEffectiveness = (data.workingForms / data.contactForms) * 100;
    score += formEffectiveness * 0.3;
  }
  
  // Contact Options Score (30% weight)
  const contactOptions = [
    data.phoneClickable,
    data.emailClickable,
    data.chatAvailable,
    data.callbackOption
  ].filter(Boolean).length;
  score += (contactOptions / 4) * 100 * 0.3;
  
  return Math.round(Math.min(score, 100));
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
  return calculateOnlineQualityAuthorityScore(realData, keywordsScore, businessData, privacyData, accessibilityData, null, null, null);
};

export const calculatePerformanceMobileScore = (realData: RealBusinessData, manualConversionData?: any): number => {
  return calculateWebsitePerformanceTechScore(realData, manualConversionData);
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
  try {
    const autoScore = Number(realData?.seo?.score) || 0;
    const manualScore = manualData?.overallScore;
    
    if (!isNaN(autoScore) && autoScore > 0 && manualScore !== undefined && !isNaN(manualScore)) {
      const combined = Math.round(autoScore * 0.6 + manualScore * 0.4);
      return isNaN(combined) ? 75 : Math.max(0, Math.min(100, combined));
    }
    
    if (manualScore !== undefined && !isNaN(manualScore)) {
      return Math.max(0, Math.min(100, manualScore));
    }
    
    if (!isNaN(autoScore) && autoScore > 0) {
      return Math.max(0, Math.min(100, autoScore));
    }
    
    return 75;
  } catch (error) {
    console.error('📍 calculateLocalSEOScore error:', error);
    return 75;
  }
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
  // Calculate weighted average from all category scores if available
  if (!scores) return 0;
  
  const categoryScores = [
    scores.onlineQualityAuthority,
    scores.websitePerformanceTech,
    scores.socialMediaPerformance,
    scores.marketEnvironment,
    scores.corporateAppearance,
    scores.serviceQuality
  ].filter(score => score > 0); // Only include scores that have data
  
  if (categoryScores.length === 0) return 0;
  
  const average = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
  return Math.round(average);
};

export const calculateHourlyRateScore = (hourlyRateData: any): number => {
  if (!hourlyRateData) return 0; // No data = no score
  
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
  try {
    const autoScore = Number(realData?.content?.qualityScore) || 0;
    
    let manualScore = 0;
    if (manualContentData) {
      const scores = [
        Number(manualContentData.textQuality) || 0,
        Number(manualContentData.contentRelevance) || 0,
        Number(manualContentData.expertiseLevel) || 0,
        Number(manualContentData.contentFreshness) || 0
      ].filter(score => !isNaN(score) && score > 0);
      
      if (scores.length > 0) {
        manualScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
      }
    }
    
    if (!isNaN(autoScore) && autoScore > 0 && !isNaN(manualScore) && manualScore > 0) {
      const combined = Math.round(autoScore * 0.5 + manualScore * 0.5);
      return isNaN(combined) ? 75 : Math.max(0, Math.min(100, combined));
    }
    
    if (!isNaN(manualScore) && manualScore > 0) {
      return Math.max(0, Math.min(100, manualScore));
    }
    
    if (!isNaN(autoScore) && autoScore > 0) {
      return Math.max(0, Math.min(100, autoScore));
    }
    
    return 75;
  } catch (error) {
    console.error('📝 calculateContentQualityScore error:', error);
    return 75;
  }
};

export const calculateBacklinksScore = (realData: any, manualBacklinkData: any): number => {
  try {
    const autoScore = Number(realData?.backlinks?.score) || 0;
    const manualScore = manualBacklinkData?.overallScore;
    
    if (!isNaN(autoScore) && autoScore > 0 && manualScore !== undefined && !isNaN(manualScore)) {
      const combined = Math.round(autoScore * 0.6 + manualScore * 0.4);
      return isNaN(combined) ? 75 : Math.max(0, Math.min(100, combined));
    }
    
    if (manualScore !== undefined && !isNaN(manualScore)) {
      return Math.max(0, Math.min(100, manualScore));
    }
    
    if (!isNaN(autoScore) && autoScore > 0) {
      return Math.max(0, Math.min(100, autoScore));
    }
    
    return 75;
  } catch (error) {
    console.error('🔗 calculateBacklinksScore error:', error);
    return 75;
  }
};

// Helper function stub for Corporate Identity (actual implementation is above)

export const calculateAccessibilityScore = (realData: any, manualAccessibilityData: any): number => {
  try {
    let autoScore = 40;
    if (realData?.violations) {
      autoScore = realData.violations.length > 0 ? Math.min(59, 40) : 85;
    }
    
    let manualScore = 0;
    if (manualAccessibilityData) {
      const features = [
        manualAccessibilityData.keyboardNavigation,
        manualAccessibilityData.screenReaderCompatible,
        manualAccessibilityData.colorContrast,
        manualAccessibilityData.altTextsPresent,
        manualAccessibilityData.focusVisibility,
        manualAccessibilityData.textScaling
      ];
      
      const enabledCount = features.filter(Boolean).length;
      const totalCount = features.length;
      
      if (enabledCount === totalCount) {
        manualScore = 100;
      } else if (enabledCount > 0) {
        const missingCount = totalCount - enabledCount;
        const maxScore = Math.max(20, 50 - (missingCount - 1) * 8);
        manualScore = Math.round((enabledCount / totalCount) * maxScore);
      }
    }
    
    if (!isNaN(manualScore) && manualScore > 0 && !isNaN(autoScore) && autoScore > 0) {
      const combined = Math.round(manualScore * 0.7 + autoScore * 0.3);
      return isNaN(combined) ? 40 : Math.max(0, Math.min(100, combined));
    }
    
    if (!isNaN(manualScore) && manualScore > 0) {
      return Math.max(0, Math.min(100, manualScore));
    }
    
    return Math.max(0, Math.min(100, autoScore));
  } catch (error) {
    console.error('🎯 calculateAccessibilityScore error:', error);
    return 40;
  }
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
  // If manual score override is set, use it (but still cap at 59% if critical violations exist)
  const hasManualOverride = manualDataPrivacyData?.overallScore !== undefined;
  
  // If privacyData has a score (from the service), use it as base
  // This score already includes HSTS violations and other security checks
  if (!privacyData?.score && !hasManualOverride) {
    return 0;
  }
  
  // Start with the score calculated by the service (includes HSTS, SSL, etc.) or manual override
  let score = hasManualOverride ? manualDataPrivacyData.overallScore : privacyData.score;
  
  const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
  const customViolations = manualDataPrivacyData?.customViolations || [];
  const totalViolations = privacyData?.violations || [];
  
  // Only apply violation adjustments if not using manual override
  if (!hasManualOverride) {
    // Add back points for deselected violations (using index-based IDs)
    totalViolations.forEach((violation: any, index: number) => {
      if (deselectedViolations.includes(`auto-${index}`)) {
        switch (violation.severity) {
          case 'critical': score += 15; break;
          case 'high': score += 10; break;
          case 'medium': score += 5; break;
          case 'low': score += 2; break;
        }
      }
    });
    
    // Subtract points for custom violations
    customViolations.forEach((violation: any) => {
      switch (violation.severity) {
        case 'critical': score -= 15; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });
  }
  
  // Check if there are any critical violations (not deselected)
  const hasCriticalViolations = () => {
    // Check active auto violations
    const activeCriticalAuto = totalViolations.some((violation: any, index: number) => 
      violation.severity === 'critical' && !deselectedViolations.includes(`auto-${index}`)
    );
    
    // Check custom violations
    const criticalCustom = customViolations.some((violation: any) => 
      violation.severity === 'critical'
    );
    
    return activeCriticalAuto || criticalCustom;
  };
  
  const finalScore = Math.round(Math.max(0, Math.min(100, score)));
  
  // Cap at 59% if there are any critical violations
  if (hasCriticalViolations()) {
    return Math.min(59, finalScore);
  }
  
  return finalScore;
};