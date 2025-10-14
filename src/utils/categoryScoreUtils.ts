import { RealBusinessData } from '@/services/BusinessAnalysisService';

/**
 * Calculate average score from a list of scores
 * @param scores - Array of scores (may include null/undefined values which will be filtered)
 */
export const calculateAverageScore = (scores: (number | null | undefined)[]): number => {
  const validScores = scores.filter((score): score is number => 
    score !== null && score !== undefined && !isNaN(score)
  );
  
  if (validScores.length === 0) return 0;
  
  const sum = validScores.reduce((acc, score) => acc + score, 0);
  return Math.round(sum / validScores.length);
};

/**
 * Get color class for score badge based on score value
 */
export const getScoreBadgeColor = (score: number): string => {
  if (score >= 90) return 'text-yellow-400';  // 90-100% gold
  if (score >= 61) return 'text-green-400';   // 61-89% green
  return 'text-red-400';                      // 0-60% red
};

/**
 * Get background color class for score badge
 */
export const getScoreBadgeBackground = (score: number): string => {
  if (score >= 90) return 'bg-yellow-400/20 border-yellow-400';  // 90-100% gold
  if (score >= 61) return 'bg-green-400/20 border-green-400';    // 61-89% green
  return 'bg-red-400/20 border-red-400';                         // 0-60% red
};

/**
 * Get hex color for HTML export based on score
 */
export const getScoreHexColor = (score: number): string => {
  if (score >= 90) return '#facc15';  // yellow-400
  if (score >= 61) return '#4ade80';  // green-400
  return '#f87171';                   // red-400
};

/**
 * Calculate individual scores for Online-Qualität category
 */
export const calculateOnlineQualityCategoryScores = (
  realData: RealBusinessData,
  keywordsScore: number | null,
  privacyData: any,
  accessibilityData: any,
  manualContentData: any,
  manualBacklinkData: any,
  businessData: { address: string; url: string; industry: string }
): number[] => {
  const keywords = realData.keywords || [];
  const keywordsFoundCount = keywords.filter(k => k.found).length;
  const defaultKeywordsScore = keywords.length > 0 ? Math.round((keywordsFoundCount / keywords.length) * 100) : 0;
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;

  return [
    realData.seo?.score || 0,
    currentKeywordsScore,
    realData.imprint?.score || 0,
    privacyData?.score || 75,
    accessibilityData?.score || 0,
  ];
};

/**
 * Calculate individual scores for Webseiten-Performance category
 */
export const calculatePerformanceCategoryScores = (realData: RealBusinessData): number[] => {
  return [
    realData.performance?.score || 0,
    realData.mobile?.overallScore || 0,
    75, // Conversion placeholder
  ];
};

/**
 * Calculate individual scores for Social Media category
 */
export const calculateSocialMediaCategoryScores = (
  realData: RealBusinessData,
  manualSocialData: any
): number[] => {
  const socialMediaScore = manualSocialData ? 
    calculateSimpleSocialScore(manualSocialData) : 0;
  const googleReviewsScore = (realData.reviews?.google?.count || 0) > 0 ? 
    Math.min(100, (realData.reviews?.google?.rating || 0) * 20) : 0;

  return [
    socialMediaScore,
    realData.socialProof?.overallScore || 0,
    googleReviewsScore,
  ];
};

// Helper to calculate simple social score
const calculateSimpleSocialScore = (manualSocialData: any): number => {
  if (!manualSocialData) return 0;
  
  let score = 0;
  let count = 0;
  
  if (manualSocialData.facebookUrl) {
    score += manualSocialData.facebookFollowers ? 20 : 10;
    count++;
  }
  if (manualSocialData.instagramUrl) {
    score += manualSocialData.instagramFollowers ? 20 : 10;
    count++;
  }
  if (manualSocialData.linkedinUrl) {
    score += manualSocialData.linkedinFollowers ? 15 : 8;
    count++;
  }
  if (manualSocialData.youtubeUrl) {
    score += manualSocialData.youtubeSubscribers ? 15 : 8;
    count++;
  }
  if (manualSocialData.tiktokUrl) {
    score += manualSocialData.tiktokFollowers ? 15 : 8;
    count++;
  }
  
  if (count >= 3) score += 15;
  
  return Math.min(score, 100);
};
