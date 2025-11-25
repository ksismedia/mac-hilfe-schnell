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

// Calculate reputation monitoring score
export const calculateReputationScore = (
  manualReputationData?: { reputationScore: number } | null
): number => {
  if (!manualReputationData || !manualReputationData.reputationScore) {
    return 0;
  }
  return manualReputationData.reputationScore;
};

export const calculateSocialMediaCategoryScore = (
  realData: RealBusinessData,
  manualSocialData?: ManualSocialData | null,
  manualWorkplaceData?: ManualWorkplaceData | null,
  manualIndustryReviewData?: { platforms: any[]; overallScore?: number } | null,
  manualOnlinePresenceData?: { items: any[]; overallScore?: number } | null,
  manualReputationData?: { reputationScore: number } | null
): number => {
  const socialMediaScore = calculateSocialMediaPerformanceScore(realData, manualSocialData);
  const industryReviewScore = calculateIndustryReviewScore(manualIndustryReviewData);
  const onlinePresenceScore = calculateOnlinePresenceScore(manualOnlinePresenceData);
  const reputationScore = calculateReputationScore(manualReputationData);
  
  // Collect all scores that exist
  const scores = [socialMediaScore];
  if (industryReviewScore > 0) scores.push(industryReviewScore);
  if (onlinePresenceScore > 0) scores.push(onlinePresenceScore);
  if (reputationScore > 0) scores.push(reputationScore);
  
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
  manualLocalSEOData?: any,
  manualDataPrivacyData?: any,
  manualAccessibilityData?: any,
  securityData?: any,
  manualReputationData?: any,
  extensionData?: any
): number => {
  try {
    console.log('🔍 calculateOnlineQualityAuthorityScore called');

    const keywords = realData?.keywords || [];
    const keywordsFoundCount = keywords.filter(k => k?.found).length;
    const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
    const currentKeywordsScore = (keywordsScore !== null && !isNaN(keywordsScore)) ? keywordsScore : defaultKeywordsScore;
    
    const localSEOScore = calculateLocalSEOScore(businessData, realData, manualLocalSEOData) || 0;
    const contentQualityScore = calculateContentQualityScore(realData, keywordsScore, businessData, manualContentData, extensionData) || 0;
    const backlinksScore = calculateBacklinksScore(realData, manualBacklinkData, manualReputationData, extensionData) || 0;
    const accessibilityScore = calculateAccessibilityScore(accessibilityData, manualAccessibilityData) || 0;
    
    // GETRENNTE SCORES für DSGVO, Technische Sicherheit und Website-Sicherheit
    const dsgvoScore = calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData) || 0;
    const technicalSecurityScore = calculateTechnicalSecurityScore(privacyData, manualDataPrivacyData) || 0;
    const websiteSecurityScore = securityData ? (securityData.isSafe === true ? 100 : securityData.isSafe === false ? 0 : 50) : 0;
    
    const seoScore = realData?.seo?.score || 0;
    const imprintScore = realData?.imprint?.score || 0;
    
    // Validate all scores are numbers
    const scores = [
      { name: 'seo', value: seoScore },
      { name: 'localSEO', value: localSEOScore },
      { name: 'content', value: contentQualityScore },
      { name: 'backlinks', value: backlinksScore },
      { name: 'accessibility', value: accessibilityScore },
      { name: 'dsgvo', value: dsgvoScore },
      { name: 'technicalSecurity', value: technicalSecurityScore },
      { name: 'websiteSecurity', value: websiteSecurityScore },
      { name: 'imprint', value: imprintScore }
    ];
    
    for (const score of scores) {
      if (isNaN(score.value)) {
        console.error(`🚨 NaN detected in ${score.name} score, using 0`);
        score.value = 0;
      }
    }
    
    // Durchschnitt aus allen 9 Bereichen - nur Scores > 0 berücksichtigen
    const cat1Scores = [
      seoScore,
      localSEOScore,
      imprintScore
    ].filter(s => s > 0);
    
    if (contentQualityScore > 0) cat1Scores.push(contentQualityScore);
    if (accessibilityScore > 0) cat1Scores.push(accessibilityScore);
    if (backlinksScore > 0) cat1Scores.push(backlinksScore);
    if (dsgvoScore > 0) cat1Scores.push(dsgvoScore);
    if (technicalSecurityScore > 0) cat1Scores.push(technicalSecurityScore);
    if (websiteSecurityScore > 0) cat1Scores.push(websiteSecurityScore);
    
    const result = cat1Scores.length > 0 
      ? Math.round(cat1Scores.reduce((a, b) => a + b, 0) / cat1Scores.length) 
      : 0;
    
    if (isNaN(result) || result < 0 || result > 100) {
      console.error('🚨 Invalid result:', result, 'returning 0');
      return 0;
    }
    
    return result;
  } catch (error) {
    console.error('🚨 calculateOnlineQualityAuthorityScore error:', error);
    return 0;
  }
};

export const calculateWebsitePerformanceTechScore = (realData: RealBusinessData, manualConversionData?: any, manualMobileData?: any): number => {
  // Durchschnitt aus Performance, Mobile und Conversion
  const performanceScore = realData.performance?.score || 0;
  const mobileScore = manualMobileData?.overallScore || realData.mobile?.overallScore || 0;
  const conversionScore = manualConversionData?.overallScore || 0;
  
  const cat2Scores = [];
  
  // Nur Scores > 0 berücksichtigen
  if (performanceScore > 0) cat2Scores.push(performanceScore);
  if (mobileScore > 0) cat2Scores.push(mobileScore);
  if (conversionScore > 0) cat2Scores.push(conversionScore);
  
  return cat2Scores.length > 0 
    ? Math.round(cat2Scores.reduce((a, b) => a + b, 0) / cat2Scores.length) 
    : 0;
};

// Helper function to calculate conversion score from manual data
const calculateConversionScore = (data: any): number => {
  if (!data) return 0;
  
  // Kombinierter Score aus Conversion-Rate und User Journey
  const conversionScore = data.overallScore || 0;
  const userJourneyScore = data.userJourneyScore || 0;
  
  return Math.round((conversionScore + userJourneyScore) / 2);
};

export const calculateSocialMediaPerformanceScore = (
  realData: RealBusinessData,
  manualSocialData?: ManualSocialData | null,
  manualIndustryReviewData?: { platforms: any[]; overallScore?: number } | null,
  manualOnlinePresenceData?: { items: any[]; overallScore?: number } | null
): number => {
  // NEUE LOGIK: Einfacher arithmetischer Durchschnitt (wie htmlGenerator.ts)
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const googleReviewsScore = calculateGoogleReviewsScore(realData);
  const industryReviewScore = calculateIndustryReviewScore(manualIndustryReviewData);
  const onlinePresenceScore = calculateOnlinePresenceScore(manualOnlinePresenceData);
  
  const cat3Scores = [
    googleReviewsScore,
    socialMediaScore,
    realData.socialProof?.overallScore || 0
  ].filter(s => s > 0);
  
  if (industryReviewScore > 0) cat3Scores.push(industryReviewScore);
  if (onlinePresenceScore > 0) cat3Scores.push(onlinePresenceScore);
  
  return cat3Scores.length > 0 
    ? Math.round(cat3Scores.reduce((a, b) => a + b, 0) / cat3Scores.length) 
    : 0;
};

export const calculateMarketEnvironmentScore = (
  realData: RealBusinessData,
  hourlyRateData: any,
  staffQualificationData: any,
  competitorScore: number | null,
  manualWorkplaceData: any
): number => {
  // NEUE LOGIK: Einfacher arithmetischer Durchschnitt (wie htmlGenerator.ts)
  const workplaceScoreRaw = calculateWorkplaceScore(realData, manualWorkplaceData);
  
  const cat4Scores = [
    competitorScore !== null && competitorScore !== undefined ? competitorScore : (realData.competitors?.length > 0 ? Math.min(100, 60 + (realData.competitors.length * 5)) : 30),
    workplaceScoreRaw !== -1 ? workplaceScoreRaw : 0
  ].filter(s => s > 0);
  
  if (staffQualificationData && staffQualificationData.totalEmployees > 0) {
    const staffScore = calculateStaffQualificationScore(staffQualificationData);
    cat4Scores.push(staffScore);
  }
  
  if (hourlyRateData && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0 || hourlyRateData.azubiRate > 0 || hourlyRateData.helferRate > 0 || hourlyRateData.serviceRate > 0 || hourlyRateData.installationRate > 0)) {
    const hourlyRateScore = calculateHourlyRateScore(hourlyRateData);
    cat4Scores.push(hourlyRateScore);
  }
  
  return cat4Scores.length > 0 
    ? Math.round(cat4Scores.reduce((a, b) => a + b, 0) / cat4Scores.length) 
    : 0;
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
  return calculateOnlineQualityAuthorityScore(realData, keywordsScore, businessData, privacyData, accessibilityData, null, null, null, null, null, null, null);
};

export const calculatePerformanceMobileScore = (realData: RealBusinessData, manualConversionData?: any, manualMobileData?: any): number => {
  return calculateWebsitePerformanceTechScore(realData, manualConversionData, manualMobileData);
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
    
    // Wenn detaillierte manuelle Daten vorhanden sind, berechne Score aus diesen
    // Prüfe auf wichtige Felder anstatt nur auf Object.keys().length
    const hasDetailedData = manualData && (
      manualData.directories?.length > 0 ||
      manualData.localKeywordRankings?.length > 0 ||
      manualData.gmbClaimed !== undefined ||
      manualData.napConsistencyScore !== undefined
    );
    
    if (hasDetailedData) {
      let detailedScore = 0;
      
      // 1. Google My Business (30 Punkte)
      if (manualData.gmbClaimed !== undefined || manualData.gmbVerified !== undefined) {
        let gmbScore = 0;
        if (manualData.gmbClaimed) gmbScore += 5;
        if (manualData.gmbVerified) gmbScore += 10;
        gmbScore += (manualData.gmbCompleteness || 0) * 0.15; // max 15 Punkte
        detailedScore += gmbScore;
      }
      
      // 2. Lokale Verzeichnisse (25 Punkte)
      if (manualData.directories && manualData.directories.length > 0) {
        const totalDirs = manualData.directories.length;
        const completeDirs = manualData.directories.filter((d: any) => d.status === 'complete').length;
        const incompleteDirs = manualData.directories.filter((d: any) => d.status === 'incomplete').length;
        const verifiedDirs = manualData.directories.filter((d: any) => d.verified).length;
        
        // Basis-Punkte für Präsenz
        let dirScore = Math.min(totalDirs * 3, 10); // max 10 Punkte für Präsenz
        // Bonus für vollständige Einträge
        dirScore += (completeDirs / Math.max(totalDirs, 1)) * 10; // max 10 Punkte
        // Bonus für verifizierte Einträge
        dirScore += (verifiedDirs / Math.max(totalDirs, 1)) * 5; // max 5 Punkte
        
        detailedScore += Math.min(dirScore, 25);
      }
      
      // 3. NAP Konsistenz (15 Punkte)
      if (manualData.napConsistencyScore !== undefined) {
        detailedScore += (manualData.napConsistencyScore / 100) * 15;
      }
      
      // 4. Lokale Keywords (15 Punkte)
      if (manualData.localKeywordRankings && manualData.localKeywordRankings.length > 0) {
        const keywords = manualData.localKeywordRankings;
        let keywordScore = 0;
        
        // Bewerte nach Positionen
        keywords.forEach((kw: any) => {
          if (kw.position <= 3) keywordScore += 3;
          else if (kw.position <= 10) keywordScore += 2;
          else if (kw.position <= 20) keywordScore += 1;
        });
        
        detailedScore += Math.min(keywordScore, 15);
      }
      
      // 5. Schema & On-Page (15 Punkte)
      let schemaScore = 0;
      if (manualData.hasLocalBusinessSchema) schemaScore += 8;
      if (manualData.hasOrganizationSchema) schemaScore += 3;
      if (manualData.addressVisible) schemaScore += 2;
      if (manualData.phoneVisible) schemaScore += 2;
      detailedScore += schemaScore;
      
      // 6. Lokaler Content (10 Punkte) - falls separat bewertet
      if (manualData.localContentScore !== undefined) {
        detailedScore += (manualData.localContentScore / 100) * 10;
      }
      
      // Verwende berechneten Score, außer es gibt einen expliziten overallScore
      const calculatedScore = Math.round(Math.min(detailedScore, 100));
      
      console.log('📍 Local SEO Score Details:', {
        hasDetailedData,
        directories: manualData.directories?.length || 0,
        calculatedScore,
        overallScore: manualData.overallScore
      });
      
      // Wenn ein overallScore gesetzt ist, bevorzuge diesen, sonst nutze den berechneten
      if (manualData.overallScore !== undefined && !isNaN(manualData.overallScore)) {
        // Wenn auto-Score vorhanden, kombiniere mit manuellem overallScore
        if (!isNaN(autoScore) && autoScore > 0) {
          const combined = Math.round(autoScore * 0.6 + manualData.overallScore * 0.4);
          return Math.max(0, Math.min(100, combined));
        }
        return Math.max(0, Math.min(100, manualData.overallScore));
      }
      
      // Kombiniere berechneten Score mit Auto-Score falls vorhanden
      if (!isNaN(autoScore) && autoScore > 0) {
        const combined = Math.round(autoScore * 0.6 + calculatedScore * 0.4);
        return Math.max(0, Math.min(100, combined));
      }
      
      return calculatedScore;
    }
    
    // Fallback auf alte Logik wenn keine detaillierten Daten
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

export const calculateOverallScore = (
  cat1Avg: number, // Online-Qualität · Relevanz · Autorität
  cat2Avg: number, // Webseiten-Performance & Technik
  cat3Avg: number, // Online-/Web-/Social-Media Performance
  cat4Avg: number, // Markt & Marktumfeld
  cat5Avg: number, // Außendarstellung & Erscheinungsbild
  cat6Avg: number  // Qualität · Service · Kundenorientierung
): number => {
  // Basis-Gewichtungen für die 6 Hauptkategorien
  const baseCat1Weight = 30; // Online-Qualität · Relevanz · Autorität
  const baseCat2Weight = 20; // Webseiten-Performance & Technik
  const baseCat3Weight = 20; // Online-/Web-/Social-Media Performance
  const baseCat4Weight = 10; // Markt & Marktumfeld
  const baseCat5Weight = 10; // Außendarstellung & Erscheinungsbild
  const baseCat6Weight = 10; // Qualität · Service · Kundenorientierung
  
  // Dynamische Gewichtsverteilung: Fehlende Kategorien auf vorhandene verteilen
  let adjustedCat1Weight = baseCat1Weight;
  let adjustedCat2Weight = baseCat2Weight;
  let adjustedCat3Weight = baseCat3Weight;
  let adjustedCat4Weight = baseCat4Weight;
  let adjustedCat5Weight = baseCat5Weight;
  let adjustedCat6Weight = baseCat6Weight;

  // Berechne fehlende Gewichte
  let missingWeight = 0;
  const categoriesWithData = [];
  
  if (cat1Avg > 0) {
    categoriesWithData.push('cat1');
  } else {
    missingWeight += adjustedCat1Weight;
    adjustedCat1Weight = 0;
  }
  
  if (cat2Avg > 0) {
    categoriesWithData.push('cat2');
  } else {
    missingWeight += adjustedCat2Weight;
    adjustedCat2Weight = 0;
  }
  
  if (cat3Avg > 0) {
    categoriesWithData.push('cat3');
  } else {
    missingWeight += adjustedCat3Weight;
    adjustedCat3Weight = 0;
  }
  
  if (cat4Avg > 0) {
    categoriesWithData.push('cat4');
  } else {
    missingWeight += adjustedCat4Weight;
    adjustedCat4Weight = 0;
  }
  
  if (cat5Avg > 0) {
    categoriesWithData.push('cat5');
  } else {
    missingWeight += adjustedCat5Weight;
    adjustedCat5Weight = 0;
  }
  
  if (cat6Avg > 0) {
    categoriesWithData.push('cat6');
  } else {
    missingWeight += adjustedCat6Weight;
    adjustedCat6Weight = 0;
  }

  // Verteile fehlende Gewichte gleichmäßig auf vorhandene Kategorien
  if (categoriesWithData.length > 0 && missingWeight > 0) {
    const additionalWeight = missingWeight / categoriesWithData.length;
    if (cat1Avg > 0) adjustedCat1Weight += additionalWeight;
    if (cat2Avg > 0) adjustedCat2Weight += additionalWeight;
    if (cat3Avg > 0) adjustedCat3Weight += additionalWeight;
    if (cat4Avg > 0) adjustedCat4Weight += additionalWeight;
    if (cat5Avg > 0) adjustedCat5Weight += additionalWeight;
    if (cat6Avg > 0) adjustedCat6Weight += additionalWeight;
  }

  // Gewichteter Gesamtscore aus den 6 Kategorien mit angepassten Gewichten
  const totalCategoryWeight = adjustedCat1Weight + adjustedCat2Weight + adjustedCat3Weight + adjustedCat4Weight + adjustedCat5Weight + adjustedCat6Weight;
  const overallScore = totalCategoryWeight > 0 ? Math.round((
    cat1Avg * adjustedCat1Weight +
    cat2Avg * adjustedCat2Weight +
    cat3Avg * adjustedCat3Weight +
    cat4Avg * adjustedCat4Weight +
    cat5Avg * adjustedCat5Weight +
    cat6Avg * adjustedCat6Weight
  ) / totalCategoryWeight) : 0;
  
  return overallScore;
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
  
  if (ownRates.length === 0 || regionalRates.length === 0) return 0; // Keine Daten = kein Score
  
  const avgOwnRate = ownRates.reduce((sum, rate) => sum + rate, 0) / ownRates.length;
  const avgRegionalRate = regionalRates.reduce((sum, rate) => sum + rate, 0) / regionalRates.length;
  
  const ratio = avgOwnRate / avgRegionalRate;
  let score = 0;

  // NEW SCORING LOGIC:
  // 85-100 Punkte: +10% und mehr vom Markt = Optimal
  // 60-84 Punkte: -10% bis +9% vom Markt = Akzeptabel
  // 40-59 Punkte: unter -10% vom Markt = Überprüfung nötig
  
  if (ratio >= 1.10) {
    // +10% oder mehr über Markt = OPTIMAL (85-100 Punkte)
    // Je höher über 1.10, desto besser der Score
    const bonus = Math.min((ratio - 1.10) * 50, 15); // Max +15 Punkte für sehr hohe Preise
    score = Math.min(100, 85 + bonus);
  } else if (ratio >= 0.90 && ratio < 1.10) {
    // -10% bis +9% vom Markt = AKZEPTABEL (60-84 Punkte)
    // Linear zwischen 60 (bei 0.90) und 84 (bei 1.09)
    score = 60 + ((ratio - 0.90) * 120); // 0.20 Range → 24 Punkte Range (60-84)
  } else {
    // Unter -10% vom Markt = ÜBERPRÜFUNG NÖTIG (40-59 Punkte)
    // Je niedriger unter 0.90, desto schlechter
    score = Math.max(40, 60 + ((ratio - 0.90) * 100));
  }

  return Math.round(Math.max(40, Math.min(100, score)));
};

export const calculateContentQualityScore = (realData: any, keywordScore: number | null, businessData: any, manualContentData: any, extensionData?: any): number => {
  try {
    const autoScore = Number(realData?.content?.qualityScore) || 0;
    
    // Extension Data Score - wenn wordCount vorhanden ist, bewerten wir das positiv
    let extensionScore = 0;
    if (extensionData?.content?.wordCount) {
      const wordCount = extensionData.content.wordCount;
      // Bewertung basierend auf Wortanzahl (optimal: 300-800 Wörter)
      if (wordCount >= 300 && wordCount <= 800) {
        extensionScore = 90; // Optimal
      } else if (wordCount >= 200 && wordCount < 300) {
        extensionScore = 75; // Gut
      } else if (wordCount >= 100 && wordCount < 200) {
        extensionScore = 60; // Ausreichend
      } else if (wordCount > 800) {
        extensionScore = 80; // Viel Content (gut, aber könnte zu viel sein)
      } else {
        extensionScore = 40; // Zu wenig Content
      }
    }
    
    // Keywords Score (Teil des Contents)
    const keywords = realData?.keywords || [];
    const keywordsFoundCount = keywords.filter(k => k?.found).length;
    const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
    const currentKeywordsScore = (keywordScore !== null && !isNaN(keywordScore)) ? keywordScore : defaultKeywordsScore;
    
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
    
    // Content Score berechnen (mit Extension, Auto und manuellen Daten)
    let contentScore = 0;
    const availableScores = [];
    
    if (!isNaN(extensionScore) && extensionScore > 0) availableScores.push({ score: extensionScore, weight: 0.3 });
    if (!isNaN(autoScore) && autoScore > 0) availableScores.push({ score: autoScore, weight: 0.3 });
    if (!isNaN(manualScore) && manualScore > 0) availableScores.push({ score: manualScore, weight: 0.4 });
    
    if (availableScores.length > 0) {
      const totalWeight = availableScores.reduce((sum, item) => sum + item.weight, 0);
      contentScore = Math.round(availableScores.reduce((sum, item) => sum + (item.score * item.weight), 0) / totalWeight);
    } else {
      contentScore = 75;
    }
    
    // Keywords in Content-Score integrieren (arithmetischer Durchschnitt)
    const finalScores = [];
    if (currentKeywordsScore > 0) finalScores.push(currentKeywordsScore);
    if (contentScore > 0) finalScores.push(contentScore);
    
    if (finalScores.length > 0) {
      const result = Math.round(finalScores.reduce((sum, s) => sum + s, 0) / finalScores.length);
      return Math.max(0, Math.min(100, result));
    }
    
    return 75;
  } catch (error) {
    console.error('📝 calculateContentQualityScore error:', error);
    return 75;
  }
};

export const calculateBacklinksScore = (realData: any, manualBacklinkData: any, manualReputationData?: any, extensionData?: any): number => {
  try {
    const autoScore = Number(realData?.backlinks?.score) || 0;
    
    // Extension Data Score - wenn Links vorhanden sind
    let extensionScore = 0;
    if (extensionData?.content?.links) {
      const internalLinks = extensionData.content.links.internal?.length || 0;
      const externalLinks = extensionData.content.links.external?.length || 0;
      
      // Bewertung basierend auf Link-Struktur
      // Ideal: 10-50 interne Links, 3-10 externe Links
      let linkScore = 50; // Basis
      
      if (internalLinks >= 10 && internalLinks <= 50) {
        linkScore += 25; // Gute interne Struktur
      } else if (internalLinks > 0) {
        linkScore += 15; // Einige interne Links
      }
      
      if (externalLinks >= 3 && externalLinks <= 10) {
        linkScore += 25; // Gute externe Links
      } else if (externalLinks > 0) {
        linkScore += 10; // Einige externe Links
      }
      
      extensionScore = Math.min(100, linkScore);
    }
    
    // Calculate manual score using the same logic as in BacklinkAnalysis.tsx
    let manualScore: number | undefined = undefined;
    if (manualBacklinkData && manualBacklinkData.qualityScore !== undefined) {
      const qualityScore = Math.round(
        (manualBacklinkData.qualityScore + 
         manualBacklinkData.domainAuthority + 
         manualBacklinkData.localRelevance) / 3
      );

      // Calculate spam penalty
      const spamPenalty = manualBacklinkData.totalBacklinks > 0 
        ? (manualBacklinkData.spamLinks / manualBacklinkData.totalBacklinks) * 30 
        : 0;
      
      manualScore = Math.max(0, qualityScore - spamPenalty);
    }
    
    // Web-Erwähnungen berücksichtigen
    const webMentionsCount = manualReputationData?.webMentionsCount || 0;
    const webMentionsBonus = Math.min(10, webMentionsCount * 1); // Max 10 Bonus-Punkte durch Web-Erwähnungen
    
    // Kombiniere alle verfügbaren Scores gewichtet
    const availableScores = [];
    if (!isNaN(extensionScore) && extensionScore > 0) availableScores.push({ score: extensionScore, weight: 0.3 });
    if (!isNaN(autoScore) && autoScore > 0) availableScores.push({ score: autoScore, weight: 0.3 });
    if (manualScore !== undefined && !isNaN(manualScore)) availableScores.push({ score: manualScore, weight: 0.4 });
    
    if (availableScores.length > 0) {
      const totalWeight = availableScores.reduce((sum, item) => sum + item.weight, 0);
      const combined = Math.round(availableScores.reduce((sum, item) => sum + (item.score * item.weight), 0) / totalWeight);
      return Math.max(0, Math.min(100, combined + webMentionsBonus));
    }
    
    // No data available - return 0 instead of arbitrary 75
    return 0;
  } catch (error) {
    console.error('🔗 calculateBacklinksScore error:', error);
    return 0;
  }
};

// Helper function stub for Corporate Identity (actual implementation is above)

export const calculateAccessibilityScore = (realData: any, manualAccessibilityData: any): number => {
  try {
    // Calculate automatic score if we have realData
    let autoScore = null;
    let hasAutoData = false;
    
    // Only consider auto data if it has actual accessibility information
    if (realData && realData !== null && typeof realData === 'object') {
      if (realData.violations !== undefined && Array.isArray(realData.violations)) {
        hasAutoData = true;
        // More granular auto scoring based on violations count and severity
        const violationCount = realData.violations.length;
        if (violationCount === 0) {
          autoScore = 95; // Perfect auto score
        } else if (violationCount <= 3) {
          autoScore = 75; // Minor issues
        } else if (violationCount <= 7) {
          autoScore = 55; // Moderate issues
        } else {
          autoScore = 40; // Major issues
        }
      } else if (realData.score !== undefined && realData.score !== null) {
        hasAutoData = true;
        autoScore = realData.score;
      }
    }
    
    // Calculate manual score
    let manualScore = 0;
    let hasManualData = false;
    
    if (manualAccessibilityData) {
      // Calculate score from checkboxes
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
      
      let checkboxScore = 0;
      if (enabledCount === totalCount) {
        checkboxScore = 100;
      } else if (enabledCount > 0) {
        const missingCount = totalCount - enabledCount;
        const maxScore = Math.max(20, 50 - (missingCount - 1) * 8);
        checkboxScore = Math.round((enabledCount / totalCount) * maxScore);
      }
      
      // Get slider score (overall score from manual input)
      const sliderScore = manualAccessibilityData.overallScore || 0;
      
      // Combine checkbox score (50%) and slider score (50%)
      if (sliderScore > 0 && checkboxScore > 0) {
        manualScore = Math.round(checkboxScore * 0.5 + sliderScore * 0.5);
        hasManualData = true;
      } else if (sliderScore > 0) {
        manualScore = sliderScore;
        hasManualData = true;
      } else if (checkboxScore > 0) {
        manualScore = checkboxScore;
        hasManualData = true;
      }
    }
    
    // COMBINE scores: Both auto and manual data contribute
    if (hasAutoData && autoScore !== null && hasManualData && manualScore > 0) {
      // When both available: 60% auto (objective) + 40% manual (expert review)
      const combinedScore = Math.round(autoScore * 0.6 + manualScore * 0.4);
      console.log('🎯 Accessibility: Combined score - Auto (' + autoScore + ') 60% + Manual (' + manualScore + ') 40% = ' + combinedScore);
      return Math.max(0, Math.min(100, combinedScore));
    }
    
    if (hasManualData && manualScore > 0) {
      // Only manual data available
      console.log('🎯 Accessibility: Using only manual score: ' + manualScore);
      return Math.max(0, Math.min(100, manualScore));
    }
    
    if (hasAutoData && autoScore !== null) {
      // Only auto data available
      console.log('🎯 Accessibility: Using only auto score: ' + autoScore);
      return Math.max(0, Math.min(100, autoScore));
    }
    
    // No data available
    console.log('🎯 Accessibility: No data available, using default 40');
    return 40;
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

// Berechnet nur DSGVO-Compliance (rechtliche Aspekte, Cookie-Banner, Violations)
export const calculateDataPrivacyScore = (realData: any, privacyData: any, manualDataPrivacyData?: any): number => {
  const hasManualOverride = manualDataPrivacyData?.overallScore !== undefined;
  
  if (!privacyData && !hasManualOverride) {
    return 0;
  }
  
  // Start with 100 base score for DSGVO (legal aspects only)
  let score = hasManualOverride ? manualDataPrivacyData.overallScore : 100;
  
  const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
  const customViolations = manualDataPrivacyData?.customViolations || [];
  const totalViolations = privacyData?.violations || [];
  
  if (!hasManualOverride) {
    // Subtract points for violations (not deselected) - NEUE GEWICHTUNG wie DataPrivacyService
    totalViolations.forEach((violation: any, index: number) => {
      if (!deselectedViolations.includes(`auto-${index}`)) {
        switch (violation.severity) {
          case 'critical': score -= 30; break;  // Kritisch: 30 Punkte (statt 15)
          case 'high': score -= 15; break;      // Hoch: 15 Punkte (statt 10)
          case 'medium': score -= 8; break;     // Mittel: 8 Punkte (statt 5)
          case 'low': score -= 3; break;        // Niedrig: 3 Punkte (statt 2)
        }
      }
    });
    
    // Subtract points for custom violations
    customViolations.forEach((violation: any) => {
      switch (violation.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 8; break;
        case 'low': score -= 3; break;
      }
    });
  }
  
  const finalScore = Math.round(Math.max(0, Math.min(100, score)));
  
  // NEUE CAPS: Zähle nur kritische Violations (nicht high)
  const criticalCount = (() => {
    const activeCriticalAuto = totalViolations.filter((violation: any, index: number) => 
      violation.severity === 'critical' && !deselectedViolations.includes(`auto-${index}`)
    ).length;
    
    const criticalCustom = customViolations.filter((violation: any) => 
      violation.severity === 'critical'
    ).length;
    
    return activeCriticalAuto + criticalCustom;
  })();
  
  // DSGVO-Score-Caps wie in DataPrivacyService
  if (criticalCount >= 3) {
    return Math.min(20, finalScore);  // 3+ kritische = max 20%
  } else if (criticalCount === 2) {
    return Math.min(35, finalScore);  // 2 kritische = max 35%
  } else if (criticalCount === 1) {
    return Math.min(59, finalScore);  // 1 kritischer = max 59%
  }
  
  return finalScore;
};

// Berechnet Technische Sicherheit
export const calculateTechnicalSecurityScore = (privacyData: any, manualDataPrivacyData?: any): number => {
  if (!privacyData) {
    return 0;
  }
  
  // Check if cookie banner is present based on:
  // 1. Automatic detection
  // 2. Manual override: if "no cookie banner" violation is deselected AND manual checkboxes indicate compliance
  const autoCookieBanner = privacyData?.realApiData?.cookieBanner?.detected || 
                          privacyData?.cookieBanner?.detected || 
                          false;
  const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
  const totalViolations = privacyData?.violations || [];
  
  // Find the "no cookie banner" violation
  const noCookieBannerViolationIndex = totalViolations.findIndex((v: any) => 
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
  
  const sslGrade = privacyData.sslGrade || privacyData?.sslRating;
  const securityHeaders = privacyData.securityHeaders || privacyData?.realApiData?.securityHeaders;
  const hasHSTS = securityHeaders?.headers?.['Strict-Transport-Security']?.present || 
                   securityHeaders?.hsts || 
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
          case 'A-': return 90;
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
      const csp = headers['Content-Security-Policy']?.present || securityHeaders.csp;
      const xFrame = headers['X-Frame-Options']?.present || securityHeaders.xFrameOptions;
      const xContent = headers['X-Content-Type-Options']?.present || securityHeaders.xContentTypeOptions;
      const referrer = headers['Referrer-Policy']?.present || securityHeaders.referrerPolicy;
      
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
        case 'A-': return 8;
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