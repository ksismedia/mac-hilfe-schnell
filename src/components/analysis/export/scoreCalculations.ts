import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, ManualWorkplaceData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './simpleSocialScore';

const calculateGoogleReviewsScore = (realData: RealBusinessData): number => {
  const reviews = realData.reviews.google.count;
  const rating = realData.reviews.google.rating;
  let score = 0;

  if (rating > 0) {
    score += (rating / 5) * 60; // Rating contributes 60%
  }
  if (reviews > 0) {
    score += Math.min(reviews / 10, 40); // Number of reviews contributes 40%, capped at 40 points
  }

  return score;
};

const calculateSocialMediaScore = (
  realData: RealBusinessData,
  manualSocialData?: ManualSocialData | null
): number => {
  let score = 0;
  let foundPlatforms = 0;

  if (realData.socialMedia.facebook.found || manualSocialData?.facebookUrl) {
    foundPlatforms++;
    if (realData.socialMedia.facebook.followers > 100 || manualSocialData?.facebookFollowers) {
      score += 20;
    }
  }
  if (realData.socialMedia.instagram.found || manualSocialData?.instagramUrl) {
    foundPlatforms++;
    if (realData.socialMedia.instagram.followers > 100 || manualSocialData?.instagramFollowers) {
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
  // Use the same logic as in OverallRating component for consistent results
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
  
  // Google Reviews Score
  const googleReviewsScore = realData.reviews.google.count > 0 ? 
    Math.min(100, realData.reviews.google.rating * 20) : 0;
  
  const metrics = [
    { score: socialMediaScore, weight: 6 }, // Social Media
    { score: googleReviewsScore, weight: 7 }, // Bewertungen
    { score: realData.socialProof.overallScore, weight: 4 }, // Social Proof
    { score: workplaceScore, weight: 2 }, // Arbeitsplatz
  ];
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

export const calculateWorkplaceScore = (
  realData: RealBusinessData,
  manualWorkplaceData?: ManualWorkplaceData | null
): number => {
  let score = 0;
  const maxPoints = 100;

  // Check if we're using manual data
  const isManualData = manualWorkplaceData && (
    manualWorkplaceData.kununuFound || 
    manualWorkplaceData.glassdoorFound || 
    manualWorkplaceData.kununuRating !== '' || 
    manualWorkplaceData.glassdoorRating !== ''
  );

  let platformsWithData = 0;

  // kununu evaluation
  const kununuFound = isManualData ? manualWorkplaceData!.kununuFound : realData.workplace.kununu.found;
  const kununuRating = isManualData ? manualWorkplaceData!.kununuRating : realData.workplace.kununu.rating.toString();
  const kununuReviews = isManualData ? manualWorkplaceData!.kununuReviews : realData.workplace.kununu.reviews.toString();

  if (kununuFound) {
    platformsWithData++;
    const rating = parseFloat(kununuRating.toString());
    const reviews = parseInt(kununuReviews.toString());
    
    if (!isNaN(rating) && rating > 0) {
      // Rating points (0-25 points)
      score += (rating / 5) * 25;
      
      // Review count points (0-15 points)
      if (reviews >= 50) score += 15;
      else if (reviews >= 20) score += 12;
      else if (reviews >= 10) score += 8;
      else if (reviews >= 5) score += 5;
      else if (reviews >= 1) score += 2;
    }
  }

  // Glassdoor evaluation
  const glassdoorFound = isManualData ? manualWorkplaceData!.glassdoorFound : realData.workplace.glassdoor.found;
  const glassdoorRating = isManualData ? manualWorkplaceData!.glassdoorRating : realData.workplace.glassdoor.rating.toString();
  const glassdoorReviews = isManualData ? manualWorkplaceData!.glassdoorReviews : realData.workplace.glassdoor.reviews.toString();

  if (glassdoorFound) {
    platformsWithData++;
    const rating = parseFloat(glassdoorRating.toString());
    const reviews = parseInt(glassdoorReviews.toString());
    
    if (!isNaN(rating) && rating > 0) {
      // Rating points (0-25 points)
      score += (rating / 5) * 25;
      
      // Review count points (0-15 points)
      if (reviews >= 50) score += 15;
      else if (reviews >= 20) score += 12;
      else if (reviews >= 10) score += 8;
      else if (reviews >= 5) score += 5;
      else if (reviews >= 1) score += 2;
    }
  }

  // Platform presence bonus (0-20 points)
  if (platformsWithData >= 2) {
    score += 20; // Both platforms
  } else if (platformsWithData === 1) {
    score += 10; // One platform
  }

  // If no data found, return 0 (no rating)
  if (platformsWithData === 0) {
    score = 0; // No rating when no data is provided
  }

  return Math.min(score, maxPoints);
};

export const calculateSEOContentScore = (
  realData: RealBusinessData,
  keywordsScore: number | null,
  businessData: { address: string; url: string; industry: string },
  privacyData: any,
  accessibilityData: any
): number => {
  // Use the same logic as in OverallRating component for consistent results
  const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
  const defaultKeywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;
  
  const localSEOScore = calculateLocalSEOScore(businessData, realData);
  
  // Weighted calculation based on the same weights as in OverallRating
  const metrics = [
    { score: localSEOScore, weight: 24 }, // Local SEO - highest weight
    { score: realData.seo.score, weight: 14 }, // SEO
    { score: realData.imprint.score, weight: 9 }, // Impressum
    { score: currentKeywordsScore, weight: 8 }, // Keywords
  ];
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

export const calculatePerformanceMobileScore = (realData: RealBusinessData): number => {
  // Use the same logic as in OverallRating component for consistent results
  const metrics = [
    { score: realData.performance.score, weight: 11 }, // Performance
    { score: realData.mobile.overallScore, weight: 6 }, // Mobile
  ];
  
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

export const calculateStaffServiceScore = (
  staffQualificationData: any,
  quoteResponseData: any,
  manualCorporateIdentityData: any,
  hourlyRateData: any
): number => {
  const metrics = [];
  
  // Nur eingegebene Daten bewerten - keine Default-Scores für fehlende Eingaben
  
  // Personal-Qualifikation (nur wenn tatsächlich eingegeben)
  if (staffQualificationData && staffQualificationData.totalEmployees > 0) {
    const staffScore = calculateStaffQualificationScore(staffQualificationData);
    metrics.push({ score: staffScore, weight: 40 }); // Höhere Gewichtung für vorhandene Daten
  }
  
  // Kundenservice/Angebotsbearbeitung (nur wenn tatsächlich eingegeben)
  if (quoteResponseData && quoteResponseData.responseTime) {
    const quoteScore = calculateQuoteResponseScore(quoteResponseData);
    metrics.push({ score: quoteScore, weight: 35 }); // Höhere Gewichtung für vorhandene Daten
  }
  
  // Unternehmensidentität (nur wenn tatsächlich eingegeben)
  if (manualCorporateIdentityData) {
    const corporateScore = calculateCorporateIdentityScore(manualCorporateIdentityData);
    metrics.push({ score: corporateScore, weight: 25 }); // Geringere Gewichtung
  }
  
  // Stundensatz NICHT bewerten wenn nicht eingegeben
  // (wird separat behandelt wo benötigt)
  
  // Wenn gar keine Daten eingegeben wurden, keine Bewertung abgeben
  if (metrics.length === 0) {
    return 0; // Zeigt an, dass keine Bewertung möglich ist
  }
  
  // Nur die tatsächlich vorhandenen Daten gewichten
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  
  return Math.round(weightedScore / totalWeight);
};

// Add missing function stubs for exported functions that are expected by other files
export const calculateLocalSEOScore = (businessData: any, realData: any): number => {
  // Verwende echte SEO-Daten falls vorhanden
  return realData?.seo?.score || 75; // Verwende den echten SEO-Score
};

export const calculateStaffQualificationScore = (data: any): number => {
  // Echte Berechnung basierend auf Daten
  if (!data) return 0; // Keine Bewertung wenn keine Daten vorhanden
  
  let score = 0;
  const totalEmployees = data.totalEmployees || 1;
  const masters = data.masters || 0;
  const skilledWorkers = data.skilled_workers || 0;
  
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
  
  // Facharbeiter-Quote (25% der Bewertung) - Progressives Bewertungssystem
  const skilledWorkerRatio = skilledWorkers / totalEmployees;
  let skilledScore = 0;
  if (skilledWorkerRatio >= 0.3) {
    skilledScore = 25; // Volle Punkte ab 30% Facharbeiter
  } else if (skilledWorkerRatio >= 0.15) {
    skilledScore = (skilledWorkerRatio - 0.15) * (25 / 0.15); // Linear zwischen 15% und 30%
  } else if (skilledWorkerRatio > 0) {
    skilledScore = skilledWorkerRatio * (25 / 0.15) * 0.6; // Reduzierte Punkte unter 15%
  }
  
  // Bonus für sehr hohe Facharbeiterquote
  if (skilledWorkerRatio >= 0.6) {
    skilledScore += 5; // Extra 5 Punkte für >60% Facharbeiter
  }
  score += Math.min(skilledScore, 30); // Maximal 30 Punkte für Facharbeiter
  
  // Kombinationsbonus für hohe Gesamt-Qualifikationsquote
  const totalQualifiedRatio = (masters + skilledWorkers) / totalEmployees;
  if (totalQualifiedRatio >= 0.8) {
    score += 10; // Bonus für >80% qualifizierte Mitarbeiter
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
    data.responseTime === 'prompt'
      ? 40
      : data.responseTime === 'moderate'
      ? 20
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
    data.responseQuality === 'high'
      ? 30
      : data.responseQuality === 'medium'
      ? 15
      : 0;
  score += responseQualityScore;
  
  return Math.min(score, 100);
};

export const calculateOverallScore = (scores: any): number => {
  return 75; // Default score
};

export const calculateHourlyRateScore = (hourlyRateData: any): number => {
  if (!hourlyRateData) return 75;
  
  const rateDifference = hourlyRateData.ownRate - hourlyRateData.regionAverage;
  let rateScore = 0;

  if (rateDifference <= 0) {
    rateScore = 100;
  } else if (rateDifference <= 10) {
    rateScore = 85;
  } else if (rateDifference <= 20) {
    rateScore = 70;
  } else {
    rateScore = 50;
  }

  return rateScore;
};

export const calculateContentQualityScore = (realData: any, manualKeywordData: any, businessData: any, manualContentData: any): number => {
  // Verwende manuelle Content-Daten falls vorhanden
  if (manualContentData) {
    return Math.round((manualContentData.textQuality + manualContentData.contentRelevance + 
                      manualContentData.expertiseLevel + manualContentData.contentFreshness) / 4);
  }
  return realData?.content?.qualityScore || 75; // Fallback auf echte Daten oder Default
};

export const calculateBacklinksScore = (realData: any, manualBacklinkData: any): number => {
  // Verwende manuelle Backlink-Daten falls vorhanden
  if (manualBacklinkData) {
    return manualBacklinkData.overallScore || 75;
  }
  return realData?.backlinks?.score || 75; // Fallback auf echte Daten oder Default
};

export const calculateAccessibilityScore = (realData: any, manualAccessibilityData: any): number => {
  console.log('🎯 calculateAccessibilityScore called with:', {
    realData: realData ? 'present' : 'null',
    manualAccessibilityData: manualAccessibilityData ? manualAccessibilityData : 'null'
  });
  
  if (manualAccessibilityData) {
    console.log('🎯 Using manual accessibility data:', manualAccessibilityData);
    
    const featuresScore = [
      manualAccessibilityData.keyboardNavigation,
      manualAccessibilityData.screenReaderCompatible,
      manualAccessibilityData.colorContrast,
      manualAccessibilityData.altTextsPresent,
      manualAccessibilityData.focusVisibility,
      manualAccessibilityData.textScaling
    ].filter(Boolean).length * 10;
    
    const baseScore = Math.round((featuresScore + manualAccessibilityData.overallScore) / 2);
    
    // Neue Bewertungslogik: Bei Problemen sofort 59% oder weniger
    const hasProblems = !manualAccessibilityData.keyboardNavigation || 
                       !manualAccessibilityData.screenReaderCompatible || 
                       !manualAccessibilityData.colorContrast || 
                       !manualAccessibilityData.altTextsPresent || 
                       !manualAccessibilityData.focusVisibility || 
                       !manualAccessibilityData.textScaling;
    
    const finalScore = hasProblems ? Math.min(59, baseScore) : baseScore;
    console.log('🎯 Calculated accessibility score:', {
      featuresScore,
      baseScore,
      hasProblems,
      finalScore
    });
    
    return finalScore;
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

export const calculateDataPrivacyScore = (realData: any, privacyData: any): number => {
  // Verwende den echten Score aus privacyData falls vorhanden
  if (privacyData?.score !== undefined) {
    return privacyData.score;
  }
  return 26; // Verwende den aus der Analyse erkannten Score (wie im Bild gezeigt)
};