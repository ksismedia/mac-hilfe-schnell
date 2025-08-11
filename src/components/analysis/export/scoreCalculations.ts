import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, ManualWorkplaceData } from '@/hooks/useManualData';

const calculateGoogleReviewsScore = (realData: RealBusinessData): number => {
  const reviews = realData.google.reviews;
  const rating = realData.google.rating;
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

  if (realData.social.facebook.found || manualSocialData?.facebookUrl) {
    foundPlatforms++;
    if (realData.social.facebook.followers > 100 || manualSocialData?.facebookFollowers) {
      score += 20;
    }
  }
  if (realData.social.instagram.found || manualSocialData?.instagramUrl) {
    foundPlatforms++;
    if (realData.social.instagram.followers > 100 || manualSocialData?.instagramFollowers) {
      score += 20;
    }
  }
  if (realData.social.linkedin.found || manualSocialData?.linkedinUrl) {
    foundPlatforms++;
    if (realData.social.linkedin.followers > 50 || manualSocialData?.linkedinFollowers) {
      score += 15;
    }
  }
  if (realData.social.youtube.found || manualSocialData?.youtubeUrl) {
    foundPlatforms++;
    if (realData.social.youtube.subscribers > 50 || manualSocialData?.youtubeSubscribers) {
      score += 15;
    }
  }
  if (realData.social.tiktok.found || manualSocialData?.tiktokUrl) {
    foundPlatforms++;
    if (realData.social.tiktok.followers > 100 || manualSocialData?.tiktokFollowers) {
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
  let totalScore = 0;
  let maxScore = 0;

  // Google Reviews (30%)
  const googleReviewsScore = calculateGoogleReviewsScore(realData);
  totalScore += googleReviewsScore * 0.3;
  maxScore += 100 * 0.3;

  // Social Media (40%)
  const socialMediaScore = calculateSocialMediaScore(realData, manualSocialData);
  totalScore += socialMediaScore * 0.4;
  maxScore += 100 * 0.4;

  // Workplace Reviews (30%)
  const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);
  totalScore += workplaceScore * 0.3;
  maxScore += 100 * 0.3;

  return Math.round((totalScore / maxScore) * 100);
};

const calculateWorkplaceScore = (
  realData: RealBusinessData,
  manualWorkplaceData?: ManualWorkplaceData | null
): number => {
  let score = 0;
  const maxPoints = 100;

  // Use manual data if available, otherwise use real data
  const workplaceData = manualWorkplaceData || realData.workplace;

  // Check if we're using manual data
  const isManualData = manualWorkplaceData && (
    manualWorkplaceData.kununuFound || 
    manualWorkplaceData.glassdoorFound || 
    manualWorkplaceData.kununuRating !== '' || 
    manualWorkplaceData.glassdoorRating !== ''
  );

  let platformsWithData = 0;
  let totalRating = 0;
  let totalReviews = 0;

  // kununu evaluation
  const kununuFound = isManualData ? manualWorkplaceData!.kununuFound : workplaceData.kununu.found;
  const kununuRating = isManualData ? manualWorkplaceData!.kununuRating : workplaceData.kununu.rating;
  const kununuReviews = isManualData ? manualWorkplaceData!.kununuReviews : workplaceData.kununu.reviews;

  if (kununuFound) {
    platformsWithData++;
    const rating = parseFloat(kununuRating.toString());
    const reviews = parseInt(kununuReviews.toString());
    
    if (!isNaN(rating) && rating > 0) {
      totalRating += rating;
      
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
  const glassdoorFound = isManualData ? manualWorkplaceData!.glassdoorFound : workplaceData.glassdoor.found;
  const glassdoorRating = isManualData ? manualWorkplaceData!.glassdoorRating : workplaceData.glassdoor.rating;
  const glassdoorReviews = isManualData ? manualWorkplaceData!.glassdoorReviews : workplaceData.glassdoor.reviews;

  if (glassdoorFound) {
    platformsWithData++;
    const rating = parseFloat(glassdoorRating.toString());
    const reviews = parseInt(glassdoorReviews.toString());
    
    if (!isNaN(rating) && rating > 0) {
      totalRating += rating;
      
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

  // If no data found, give minimum points for small businesses
  if (platformsWithData === 0) {
    score = 15; // Base points for small businesses without reviews
  }

  return Math.min(score, maxPoints);
};

const calculateSEOContentScore = (
  realData: RealBusinessData,
  keywordsScore: number | null,
  businessData: { address: string; url: string; industry: string },
  privacyData: any,
  accessibilityData: any
): number => {
  let score = 0;

  // Keywords ranking (30%)
  if (keywordsScore !== null) {
    score += keywordsScore * 0.3;
  } else {
    score += 50 * 0.3; // Default keyword score
  }

  // On-page SEO (30%)
  if (realData.seo.title && realData.seo.description) {
    score += 30 * 0.3;
  } else {
    score += 15 * 0.3;
  }

  // Content quality (20%)
  if (realData.content.wordCount > 200) {
    score += 20 * 0.2;
  } else {
    score += 10 * 0.2;
  }

  // Local SEO (10%)
  if (realData.seo.local) {
    score += 10 * 0.1;
  }

  // Privacy (5%)
  if (privacyData?.hasPrivacyPolicy) {
    score += 5 * 0.05;
  }

  // Accessibility (5%)
  if (accessibilityData?.overallScore) {
    score += accessibilityData.overallScore * 0.05;
  }

  return score;
};

const calculatePerformanceMobileScore = (realData: RealBusinessData): number => {
  let score = 0;

  // Performance (50%)
  if (realData.performance.performanceScore) {
    score += realData.performance.performanceScore * 0.5;
  }

  // Accessibility (25%)
  if (realData.performance.accessibilityScore) {
    score += realData.performance.accessibilityScore * 0.25;
  }

  // Best Practices (25%)
  if (realData.performance.bestPracticesScore) {
    score += realData.performance.bestPracticesScore * 0.25;
  }

  return score;
};

const calculateStaffServiceScore = (
  staffQualificationData: any,
  quoteResponseData: any,
  manualCorporateIdentityData: any,
  hourlyRateData: any
): number => {
  let score = 50;

  if (staffQualificationData) {
    // Education and Training (30%)
    const totalEmployees = staffQualificationData.totalEmployees || 1;
    const skilledWorkers = staffQualificationData.skilled_workers || 0;
    const masters = staffQualificationData.masters || 0;
    const apprentices = staffQualificationData.apprentices || 0;

    const educationScore =
      (skilledWorkers / totalEmployees) * 0.4 +
      (masters / totalEmployees) * 0.4 +
      (apprentices / totalEmployees) * 0.2;
    score += Math.min(educationScore * 30, 30);

    // Certifications (20%)
    let certificationPoints = 0;
    if (staffQualificationData.certifications?.welding_certificates)
      certificationPoints += 0.2;
    if (staffQualificationData.certifications?.safety_training)
      certificationPoints += 0.2;
    if (staffQualificationData.certifications?.first_aid)
      certificationPoints += 0.2;
    if (staffQualificationData.certifications?.digital_skills)
      certificationPoints += 0.2;
    if (staffQualificationData.certifications?.instructor_qualification)
      certificationPoints += 0.2;
    if (staffQualificationData.certifications?.business_qualification)
      certificationPoints += 0.2;

    score += Math.min(certificationPoints * 20, 20);
  }

  if (quoteResponseData) {
    // Response Time (20%)
    const responseTimeScore =
      quoteResponseData.responseTime === 'prompt'
        ? 20
        : quoteResponseData.responseTime === 'moderate'
        ? 10
        : 0;
    score += responseTimeScore;

    // Contact Methods (15%)
    let contactMethodPoints = 0;
    if (quoteResponseData.contactMethods?.phone) contactMethodPoints += 0.25;
    if (quoteResponseData.contactMethods?.email) contactMethodPoints += 0.25;
    if (quoteResponseData.contactMethods?.contactForm)
      contactMethodPoints += 0.25;
    if (quoteResponseData.contactMethods?.whatsapp) contactMethodPoints += 0.125;
    if (quoteResponseData.contactMethods?.messenger)
      contactMethodPoints += 0.125;

    score += Math.min(contactMethodPoints * 15, 15);

    // Response Quality (15%)
    const responseQualityScore =
      quoteResponseData.responseQuality === 'high'
        ? 15
        : quoteResponseData.responseQuality === 'medium'
        ? 8
        : 0;
    score += responseQualityScore;
  }

  if (manualCorporateIdentityData) {
    // Uniform Appearance (20%)
    let uniformPoints = 0;
    if (manualCorporateIdentityData.uniformLogo) uniformPoints += 0.25;
    if (manualCorporateIdentityData.uniformWorkClothing) uniformPoints += 0.25;
    if (manualCorporateIdentityData.uniformVehicleBranding)
      uniformPoints += 0.25;
    if (manualCorporateIdentityData.uniformColorScheme) uniformPoints += 0.25;

    score += Math.min(uniformPoints * 20, 20);
  }

  if (hourlyRateData) {
    // Hourly Rate (10%)
    const rateDifference = hourlyRateData.ownRate - hourlyRateData.regionAverage;
    let rateScore = 0;

    if (rateDifference <= 0) {
      rateScore = 10;
    } else if (rateDifference <= 10) {
      rateScore = 7;
    } else if (rateDifference <= 20) {
      rateScore = 4;
    }

    score += rateScore;
  }

  return Math.min(score, 100);
};
