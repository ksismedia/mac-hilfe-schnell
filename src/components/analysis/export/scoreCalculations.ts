import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, ManualWorkplaceData, ManualSEOData } from '@/hooks/useManualData';
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

// Calculate SEO score with manual confirmations/rejections
export const calculateSEOScore = (
  realData: RealBusinessData,
  manualSEOData?: ManualSEOData | null,
  extensionData?: any
): number => {
  const baseScore = realData?.seo?.score || 0;
  
  // If no manual SEO data, return base score
  if (!manualSEOData) {
    return baseScore;
  }
  
  const confirmedElements = manualSEOData.confirmedElements || [];
  const rejectedElements = manualSEOData.rejectedElements || [];
  
  // Alt-Tags: Priorisiere Extension-Daten, wenn verfügbar (wie in SEOAnalysis.tsx)
  const useExtensionAltTags = extensionData?.seo?.altTags;
  const altTagsTotal = useExtensionAltTags 
    ? (extensionData.seo.altTags.total || 0) 
    : (realData?.seo?.altTags?.total || 0);
  const altTagsWithAlt = useExtensionAltTags 
    ? (extensionData.seo.altTags.withAlt || 0) 
    : (realData?.seo?.altTags?.withAlt || 0);
  const altTagsScore = (altTagsTotal > 0) ? 
    Math.round((altTagsWithAlt / altTagsTotal) * 100) : 0;
  
  // Define SEO elements and their individual scores
  const seoElements = [
    { id: 'titleTag', baseScore: realData?.seo?.titleTag !== 'Kein Title-Tag gefunden' ? 
      (realData?.seo?.titleTag?.length <= 70 ? 85 : 65) : 25 },
    { id: 'metaDescription', baseScore: realData?.seo?.metaDescription !== 'Keine Meta-Description gefunden' ? 
      (realData?.seo?.metaDescription?.length <= 160 ? 90 : 70) : 25 },
    { id: 'headingStructure', baseScore: realData?.seo?.headings?.h1?.length === 1 ? 80 : 
      realData?.seo?.headings?.h1?.length > 1 ? 60 : 30 },
    { id: 'altTags', baseScore: altTagsScore }
  ];
  
  let totalScore = 0;
  let elementCount = 0;
  
  for (const element of seoElements) {
    let effectiveScore = element.baseScore;
    
    // Rejected elements are capped at 30
    if (rejectedElements.includes(element.id)) {
      effectiveScore = Math.min(effectiveScore, 30);
    }
    // Confirmed elements keep their score (no change needed)
    // Pending elements (not confirmed, not rejected) also keep base score
    
    totalScore += effectiveScore;
    elementCount++;
  }
  
  const calculatedScore = elementCount > 0 ? Math.round(totalScore / elementCount) : baseScore;
  
  console.log('📊 SEO Score calculation:', {
    baseScore,
    confirmedElements,
    rejectedElements,
    calculatedScore
  });
  
  return calculatedScore;
};

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
  extensionData?: any,
  manualSEOData?: ManualSEOData | null
): number => {
  try {
    console.log('🔍 calculateOnlineQualityAuthorityScore called');

    const keywords = realData?.keywords || [];
    const keywordsFoundCount = keywords.filter(k => k?.found).length;
    const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
    const currentKeywordsScore = (keywordsScore !== null && !isNaN(keywordsScore)) ? keywordsScore : defaultKeywordsScore;
    
    const localSEOScore = calculateLocalSEOScore(businessData, realData, manualLocalSEOData) || 0;
    const contentQualityScore = calculateContentQualityScore(realData, keywordsScore, businessData, manualContentData, extensionData) || 0;
    const backlinksScore = calculateBacklinksScore(realData, manualBacklinkData, manualReputationData) || 0;
    const accessibilityScore = calculateAccessibilityScore(accessibilityData, manualAccessibilityData) || 0;
    
    // GETRENNTE SCORES für DSGVO, Technische Sicherheit und Website-Sicherheit
    const dsgvoScore = calculateDataPrivacyScore(realData, privacyData, manualDataPrivacyData) || 0;
    const technicalSecurityScore = calculateTechnicalSecurityScore(privacyData, manualDataPrivacyData) || 0;
    const websiteSecurityScore = securityData ? (securityData.isSafe === true ? 100 : securityData.isSafe === false ? 0 : 50) : 0;
    
    // Use calculateSEOScore with manual confirmations and extension data
    const seoScore = calculateSEOScore(realData, manualSEOData, extensionData);
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
  return calculateOnlineQualityAuthorityScore(realData, keywordsScore, businessData, privacyData, accessibilityData, null, null, null, null, null, null, null, null, null);
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
      return isNaN(combined) ? 0 : Math.max(0, Math.min(100, combined));
    }
    
    if (manualScore !== undefined && !isNaN(manualScore)) {
      return Math.max(0, Math.min(100, manualScore));
    }
    
    if (!isNaN(autoScore) && autoScore > 0) {
      return Math.max(0, Math.min(100, autoScore));
    }
    
    // Kein Fallback auf Standardwert - gibt 0 zurück wenn keine Daten vorhanden
    console.log('📍 Local SEO: Keine Daten für Score-Berechnung vorhanden');
    return 0;
  } catch (error) {
    console.error('📍 calculateLocalSEOScore error:', error);
    return 0;
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
  
  // KRITISCH: Wenn keine Antwort erhalten wurde, ist der Score maximal 10%
  if (data.responseTime === 'no-response') {
    return 10;
  }
  
  // KRITISCH: Nach 2 Tagen keine Reaktion - maximal 15%
  if (data.responseTime === 'no-response-2-days') {
    return 15;
  }
  
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
      : data.responseTime === 'over-3-days'
      ? 5
      : 0;
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

export const calculateBacklinksScore = (realData: any, manualBacklinkData: any, manualReputationData?: any, webMentions?: any[]): number => {
  try {
    const autoScore = Number(realData?.backlinks?.score) || 0;
    
    // NOTE: Extension "external links" are OUTBOUND links, NOT backlinks!
    // Backlinks come only from web mentions (Google Search) and manual data
    
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
    
    // Web-Erwähnungen berücksichtigen - nur aktive (nicht deaktivierte) Backlinks zählen
    let activeWebMentionsCount = manualReputationData?.webMentionsCount || 0;
    
    // If we have webMentions array and disabled list, calculate active count
    if (webMentions && Array.isArray(webMentions)) {
      const disabledBacklinks = manualBacklinkData?.disabledBacklinks || [];
      activeWebMentionsCount = webMentions.filter(mention => 
        !disabledBacklinks.includes(mention.link)
      ).length;
    }
    
    const webMentionsBonus = Math.min(10, activeWebMentionsCount * 1); // Max 10 Bonus-Punkte durch Web-Erwähnungen
    
    // Kombiniere verfügbare Scores (nur autoScore und manualScore - KEINE Extension-Daten!)
    const availableScores = [];
    if (!isNaN(autoScore) && autoScore > 0) availableScores.push({ score: autoScore, weight: 0.5 });
    if (manualScore !== undefined && !isNaN(manualScore)) availableScores.push({ score: manualScore, weight: 0.5 });
    
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
    
    // Count critical violations with NEUTRALIZATION (like DSGVO section)
    let criticalViolationCount = 0;
    if (realData && realData.violations && Array.isArray(realData.violations)) {
      const criticalViolations = realData.violations.filter((v: any) => 
        v.impact === 'critical' || v.impact === 'serious'
      );
      
      // Check which violations can be neutralized by manual inputs
      const neutralizedViolations = criticalViolations.filter((violation: any) => {
        const vid = violation.id || '';
        
        // Keyboard navigation neutralizes keyboard-related violations
        if (manualAccessibilityData?.keyboardNavigation && 
            (vid.includes('keyboard') || vid.includes('button-name') || 
             vid.includes('link-name') || vid.includes('accesskeys'))) {
          console.log('🎯 Accessibility: Violation "' + vid + '" neutralisiert durch Tastaturnavigation');
          return true;
        }
        
        // Screen reader compatibility neutralizes ARIA and label violations
        if (manualAccessibilityData?.screenReaderCompatible && 
            (vid.includes('aria-') || vid.includes('label') || 
             vid.includes('role') || vid.includes('landmark'))) {
          console.log('🎯 Accessibility: Violation "' + vid + '" neutralisiert durch Screen-Reader-Kompatibilität');
          return true;
        }
        
        // Color contrast neutralizes contrast violations
        if (manualAccessibilityData?.colorContrast && 
            (vid.includes('color-contrast') || vid.includes('contrast'))) {
          console.log('🎯 Accessibility: Violation "' + vid + '" neutralisiert durch Farbkontraste');
          return true;
        }
        
        // Alt texts neutralize image-alt violations
        if (manualAccessibilityData?.altTextsPresent && 
            (vid.includes('image-alt') || vid.includes('alt') || vid === 'image-alt')) {
          console.log('🎯 Accessibility: Violation "' + vid + '" neutralisiert durch Alt-Texte');
          return true;
        }
        
        // Focus visibility neutralizes focus violations
        if (manualAccessibilityData?.focusVisibility && 
            (vid.includes('focus') || vid.includes('focus-order'))) {
          console.log('🎯 Accessibility: Violation "' + vid + '" neutralisiert durch Fokus-Sichtbarkeit');
          return true;
        }
        
        // Text scaling neutralizes viewport and target-size violations
        if (manualAccessibilityData?.textScaling && 
            (vid.includes('meta-viewport') || vid.includes('target-size'))) {
          console.log('🎯 Accessibility: Violation "' + vid + '" neutralisiert durch Text-Skalierung');
          return true;
        }
        
        return false;
      });
      
      // Only non-neutralized violations count toward capping
      criticalViolationCount = criticalViolations.length - neutralizedViolations.length;
      
      if (neutralizedViolations.length > 0) {
        console.log('🎯 Accessibility: ' + neutralizedViolations.length + ' kritische Violations durch manuelle Eingaben neutralisiert');
        console.log('🎯 Accessibility: Verbleibende kritische Violations: ' + criticalViolationCount + ' von ' + criticalViolations.length);
      }
    }
    
    // NEU: Manuelle Eingaben können auch kritische Violations HINZUFÜGEN
    // Wenn User explizit sagt "Alt-Texte NICHT vorhanden" (obwohl SEO sie erkennt),
    // dann ist das eine manuelle kritische Violation
    if (manualAccessibilityData) {
      // Prüfe ob manuelle Daten explizit gesetzt wurden (nicht nur default)
      const hasExplicitManualData = manualAccessibilityData.keyboardNavigation !== undefined ||
                                     manualAccessibilityData.screenReaderCompatible !== undefined ||
                                     manualAccessibilityData.colorContrast !== undefined ||
                                     manualAccessibilityData.altTextsPresent !== undefined ||
                                     manualAccessibilityData.focusVisibility !== undefined ||
                                     manualAccessibilityData.textScaling !== undefined;
      
      if (hasExplicitManualData) {
        // Alt-Texte explizit als NICHT vorhanden markiert → kritische Violation
        if (manualAccessibilityData.altTextsPresent === false) {
          criticalViolationCount++;
          console.log('🎯 Accessibility: Alt-Texte manuell als NICHT vorhanden markiert → +1 kritische Violation (VoiceOver-Problem)');
        }
        
        // Screen-Reader-Kompatibilität explizit als NICHT vorhanden markiert → kritische Violation  
        if (manualAccessibilityData.screenReaderCompatible === false) {
          criticalViolationCount++;
          console.log('🎯 Accessibility: Screen-Reader-Kompatibilität manuell als NICHT vorhanden markiert → +1 kritische Violation');
        }
        
        // Farbkontraste explizit als NICHT ausreichend markiert → kritische Violation
        if (manualAccessibilityData.colorContrast === false) {
          criticalViolationCount++;
          console.log('🎯 Accessibility: Farbkontraste manuell als NICHT ausreichend markiert → +1 kritische Violation');
        }
        
        // Tastaturnavigation explizit als NICHT vorhanden markiert → kritische Violation
        if (manualAccessibilityData.keyboardNavigation === false) {
          criticalViolationCount++;
          console.log('🎯 Accessibility: Tastaturnavigation manuell als NICHT vorhanden markiert → +1 kritische Violation');
        }
      }
    }
    
    console.log('🎯 Accessibility: Finale kritische Violation-Anzahl: ' + criticalViolationCount);
    
    // COMBINE scores: Both auto and manual data contribute
    let finalScore = 40; // default
    
    if (hasAutoData && autoScore !== null && hasManualData && manualScore > 0) {
      // When both available: 60% auto (objective) + 40% manual (expert review)
      finalScore = Math.round(autoScore * 0.6 + manualScore * 0.4);
      console.log('🎯 Accessibility: Combined score - Auto (' + autoScore + ') 60% + Manual (' + manualScore + ') 40% = ' + finalScore);
    } else if (hasManualData && manualScore > 0) {
      // Only manual data available
      finalScore = manualScore;
      console.log('🎯 Accessibility: Using only manual score: ' + manualScore);
    } else if (hasAutoData && autoScore !== null) {
      // Only auto data available
      finalScore = autoScore;
      console.log('🎯 Accessibility: Using only auto score: ' + autoScore);
    } else {
      // No data available
      console.log('🎯 Accessibility: No data available, using default 40');
      finalScore = 40;
    }
    
    // Apply capping based on critical violations (like DSGVO)
    let cappedScore = finalScore;
    let scoreCap = 100;
    
    if (criticalViolationCount === 1) {
      scoreCap = 59;
      cappedScore = Math.min(finalScore, scoreCap);
      console.log('🎯 Accessibility: 1 kritischer Fehler → Score gekappt auf max 59% (von ' + finalScore + ' auf ' + cappedScore + ')');
    } else if (criticalViolationCount === 2) {
      scoreCap = 35;
      cappedScore = Math.min(finalScore, scoreCap);
      console.log('🎯 Accessibility: 2 kritische Fehler → Score gekappt auf max 35% (von ' + finalScore + ' auf ' + cappedScore + ')');
    } else if (criticalViolationCount >= 3) {
      scoreCap = 20;
      cappedScore = Math.min(finalScore, scoreCap);
      console.log('🎯 Accessibility: ' + criticalViolationCount + ' kritische Fehler → Score gekappt auf max 20% (von ' + finalScore + ' auf ' + cappedScore + ')');
    }
    
    return Math.max(0, Math.min(100, cappedScore));
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
  
  const deselectedViolations = manualDataPrivacyData?.deselectedViolations || [];
  const customViolations = manualDataPrivacyData?.customViolations || [];
  const totalViolations = privacyData?.violations || [];
  
  // SCHRITT 1: Zähle kritische und high Violations (beide gelten als "kritisch" für Kappung)
  // Struktur wie bei Accessibility: Liste der kritischen Fehler mit Neutralisierung
  let criticalErrors: { id: string; description: string; neutralized: boolean; neutralizedBy?: string }[] = [];
  
  // 1A: Auto-detected Violations
  totalViolations.forEach((violation: any, index: number) => {
    if (!deselectedViolations.includes(`auto-${index}`)) {
      // SSL/TLS-bezogene Violations → können durch hasSSL neutralisiert werden
      // WICHTIG: HSTS ist ein separater Security-Header und wird NICHT durch SSL neutralisiert!
      const isSSLViolation = (violation.description?.includes('SSL') || 
                            violation.description?.includes('TLS') ||
                            violation.description?.includes('Verschlüsselung')) &&
                            !violation.description?.includes('HSTS');
      
      // Cookie-Banner Violation → kann durch cookieConsent neutralisiert werden
      const isCookieViolation = violation.description?.includes('Cookie') && 
                                violation.description?.includes('Banner');
      
      // Prüfe ob Violation durch manuelle Eingabe neutralisiert wurde
      const neutralizedBySSL = isSSLViolation && manualDataPrivacyData?.hasSSL === true;
      const neutralizedByCookie = isCookieViolation && manualDataPrivacyData?.cookieConsent === true;
      
      if (violation.severity === 'critical' || violation.severity === 'high') {
        criticalErrors.push({
          id: `auto-${index}`,
          description: violation.description || 'Auto-detected violation',
          neutralized: neutralizedBySSL || neutralizedByCookie,
          neutralizedBy: neutralizedBySSL ? 'SSL-Zertifikat vorhanden' : 
                        neutralizedByCookie ? 'Cookie-Consent vorhanden' : undefined
        });
      }
    }
  });
  
  // 1B: Custom Violations (können nicht neutralisiert werden)
  customViolations.forEach((violation: any, index: number) => {
    if (violation.severity === 'critical' || violation.severity === 'high') {
      criticalErrors.push({
        id: `custom-${index}`,
        description: violation.description || 'Custom violation',
        neutralized: false
      });
    }
  });
  
  // 1C: NEUE DSGVO-PARAMETER als kritische Fehler
  const trackingScripts = manualDataPrivacyData?.trackingScripts || [];
  const externalServices = manualDataPrivacyData?.externalServices || [];
  
  // Tracking-Scripts ohne Consent-Anforderung (Marketing/Analytics) = kritischer Fehler
  trackingScripts.forEach((script: any, index: number) => {
    if ((script.type === 'marketing' || script.type === 'analytics') && !script.consentRequired) {
      criticalErrors.push({
        id: `tracking-${index}`,
        description: `Tracking-Script "${script.name}" (${script.type}) ohne Consent-Anforderung`,
        neutralized: false
      });
      console.log('🛡️ DSGVO: Tracking-Script ohne Consent als kritischer Fehler: ' + script.name);
    }
  });
  
  // Externe Dienste mit Drittland-Transfer OHNE AVV = kritischer Fehler
  externalServices.forEach((service: any, index: number) => {
    if (service.thirdCountry && !service.dataProcessingAgreement) {
      criticalErrors.push({
        id: `service-${index}`,
        description: `Externer Dienst "${service.name}" in Drittland ohne AVV/DPA`,
        neutralized: false
      });
      console.log('🛡️ DSGVO: Externer Dienst in Drittland ohne AVV als kritischer Fehler: ' + service.name);
    }
  });
  
  // Drittland-Transfer aktiviert aber keine Details angegeben = kritischer Fehler
  if (manualDataPrivacyData?.thirdCountryTransfer && !manualDataPrivacyData?.thirdCountryTransferDetails) {
    criticalErrors.push({
      id: 'third-country-no-details',
      description: 'Drittland-Transfer ohne Dokumentation der Rechtsgrundlage (Art. 44-49)',
      neutralized: false
    });
    console.log('🛡️ DSGVO: Drittland-Transfer ohne Details als kritischer Fehler');
  }
  
  // Zähle nicht-neutralisierte kritische Fehler
  const nonNeutralizedCount = criticalErrors.filter(e => !e.neutralized).length;
  const neutralizedCount = criticalErrors.filter(e => e.neutralized).length;
  
  console.log('🛡️ DSGVO Kritische Fehler: ' + criticalErrors.length + ' gefunden, ' + 
              neutralizedCount + ' neutralisiert, ' + nonNeutralizedCount + ' verbleibend');
  
  // SCHRITT 2: Berechne Basis-Score
  // WICHTIG: 100% nur möglich wenn ALLE Pflichtparameter explizit erfüllt sind
  let score = hasManualOverride ? manualDataPrivacyData.overallScore : 75; // Start bei 75%, nicht 100%
  
  if (!hasManualOverride) {
    // Subtract points ONLY for violations that are NOT deselected AND NOT neutralized
    totalViolations.forEach((violation: any, index: number) => {
      if (!deselectedViolations.includes(`auto-${index}`)) {
        const isSSLViolation = violation.description?.includes('SSL') || 
                              violation.description?.includes('TLS') ||
                              violation.description?.includes('HSTS') ||
                              violation.description?.includes('Verschlüsselung');
        const isCookieViolation = violation.description?.includes('Cookie') && 
                                  violation.description?.includes('Banner');
        
        const neutralizedBySSL = isSSLViolation && manualDataPrivacyData?.hasSSL === true;
        const neutralizedByCookie = isCookieViolation && manualDataPrivacyData?.cookieConsent === true;
        
        // NUR Abzug wenn NICHT neutralisiert
        if (!neutralizedBySSL && !neutralizedByCookie) {
          switch (violation.severity) {
            case 'critical': score -= 30; break;
            case 'high': score -= 15; break;
            case 'medium': score -= 8; break;
            case 'low': score -= 3; break;
          }
        }
      }
    });
    
    // Custom violations ziehen immer Punkte ab (können nicht neutralisiert werden)
    customViolations.forEach((violation: any) => {
      switch (violation.severity) {
        case 'critical': score -= 30; break;
        case 'high': score -= 15; break;
        case 'medium': score -= 8; break;
        case 'low': score -= 3; break;
      }
    });
    
    // NEUE DSGVO-PFLICHTPARAMETER - ohne explizite Bestätigung KEIN 100%
    // Verarbeitungsverzeichnis (Art. 30) - PFLICHT für 100%
    if (manualDataPrivacyData?.processingRegister === true) {
      score += 10; // Bonus für erfüllte Pflicht
      console.log('🛡️ DSGVO: Verarbeitungsverzeichnis vorhanden → +10 Punkte');
    } else if (manualDataPrivacyData?.processingRegister === false) {
      score -= 10; // Malus für explizit nicht vorhanden
      console.log('🛡️ DSGVO: Verarbeitungsverzeichnis explizit nicht vorhanden → -10 Punkte');
    }
    // undefined = "Nicht angegeben" → kein Bonus, Score bleibt bei Basis
    
    // Datenschutzbeauftragter (Art. 37) - PFLICHT für 100%
    if (manualDataPrivacyData?.dataProtectionOfficer === true) {
      score += 10; // Bonus für erfüllte Pflicht
      console.log('🛡️ DSGVO: Datenschutzbeauftragter vorhanden → +10 Punkte');
    } else if (manualDataPrivacyData?.dataProtectionOfficer === false) {
      score -= 5; // Malus für explizit nicht vorhanden (nicht so kritisch wenn klein)
      console.log('🛡️ DSGVO: Datenschutzbeauftragter explizit nicht vorhanden → -5 Punkte');
    }
    // undefined = "Nicht angegeben" → kein Bonus, Score bleibt bei Basis
    
    // Drittland-Transfer (Art. 44-49) - muss dokumentiert sein für 100%
    if (manualDataPrivacyData?.thirdCountryTransfer === false) {
      // Kein Drittland-Transfer = gut
      score += 5;
      console.log('🛡️ DSGVO: Kein Drittland-Transfer → +5 Punkte');
    } else if (manualDataPrivacyData?.thirdCountryTransfer === true && manualDataPrivacyData?.thirdCountryTransferDetails) {
      // Drittland-Transfer mit Dokumentation = akzeptabel
      score += 3;
      console.log('🛡️ DSGVO: Drittland-Transfer mit Dokumentation → +3 Punkte');
    } else if (manualDataPrivacyData?.thirdCountryTransfer === true && !manualDataPrivacyData?.thirdCountryTransferDetails) {
      // Drittland-Transfer OHNE Dokumentation = kritisch
      score -= 15;
      console.log('🛡️ DSGVO: Drittland-Transfer ohne Dokumentation → -15 Punkte');
    }
    // undefined = "Nicht angegeben" → kein Bonus/Malus
    
    // Tracking-Scripts ohne Consent - Malus (pro Script)
    const scriptsWithoutConsent = trackingScripts.filter((s: any) => 
      (s.type === 'marketing' || s.type === 'analytics') && !s.consentRequired
    );
    if (scriptsWithoutConsent.length > 0) {
      score -= scriptsWithoutConsent.length * 10; // Pro Script ohne Consent -10 Punkte
    }
    
    // Externe Dienste ohne AVV bei Drittland - Malus (pro Dienst)
    const servicesWithoutAVV = externalServices.filter((s: any) => s.thirdCountry && !s.dataProcessingAgreement);
    if (servicesWithoutAVV.length > 0) {
      score -= servicesWithoutAVV.length * 8; // Pro Dienst ohne AVV -8 Punkte
    }
  }
  
  // SCHRITT 3: Begrenze auf 0-100
  let finalScore = Math.round(Math.max(0, Math.min(100, score)));
  
  // SCHRITT 4: KAPPUNG basierend auf VERBLEIBENDEN kritischen Fehlern nach Neutralisierung
  // (Gleiche Logik wie bei Barrierefreiheit und Technische Sicherheit)
  let scoreCap = 100;
  if (nonNeutralizedCount >= 3) {
    scoreCap = 20;
    console.log('🛡️ DSGVO: ' + nonNeutralizedCount + ' kritische Fehler → Score gekappt auf max 20%');
  } else if (nonNeutralizedCount === 2) {
    scoreCap = 35;
    console.log('🛡️ DSGVO: 2 kritische Fehler → Score gekappt auf max 35%');
  } else if (nonNeutralizedCount === 1) {
    scoreCap = 59;
    console.log('🛡️ DSGVO: 1 kritischer Fehler → Score gekappt auf max 59%');
  }
  
  const cappedScore = Math.min(finalScore, scoreCap);
  console.log('🛡️ DSGVO: Finaler Score: ' + cappedScore + ' (von ' + finalScore + ', Cap: ' + scoreCap + ')');
  
  return cappedScore;
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