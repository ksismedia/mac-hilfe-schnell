
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData } from '@/hooks/useManualData';

export const calculateScore = (value: number, maxValue: number = 100) => {
  return Math.min(100, Math.max(0, value));
};

export const calculateHourlyRateScore = (hourlyRateData?: { ownRate: number; regionAverage: number }) => {
  if (!hourlyRateData || hourlyRateData.regionAverage === 0) return 75; // Default
  
  const ratio = hourlyRateData.ownRate / hourlyRateData.regionAverage;
  if (ratio >= 0.9 && ratio <= 1.1) return 100; // Optimal bei ±10%
  if (ratio >= 0.8 && ratio <= 1.2) return 85;  // Gut bei ±20%
  if (ratio >= 0.7 && ratio <= 1.3) return 70;  // Akzeptabel bei ±30%
  return 50; // Suboptimal
};

// Neue Funktion zur Bewertung des letzten Posts
const getLastPostScore = (lastPost: string): number => {
  if (!lastPost || lastPost === 'Nicht gefunden') return 0;
  
  const lowerPost = lastPost.toLowerCase();
  if (lowerPost.includes('heute') || lowerPost.includes('1 tag')) return 20;
  if (lowerPost.includes('2') || lowerPost.includes('3') || lowerPost.includes('tag')) return 15;
  if (lowerPost.includes('woche')) return 10;
  if (lowerPost.includes('monat')) return 5;
  return 2; // Älter als ein Monat
};

export const calculateSocialMediaScore = (realData: RealBusinessData, manualSocialData?: ManualSocialData | null) => {
  let score = 0;
  const platforms = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'];
  const maxScorePerPlatform = 20; // 100 / 5 Plattformen
  
  // Prüfe ob manuelle Daten vorhanden sind
  const hasManualData = manualSocialData && (
    manualSocialData.facebookUrl || manualSocialData.instagramUrl || 
    manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl
  );
  
  if (hasManualData) {
    // Facebook
    if (manualSocialData.facebookUrl) {
      score += 12; // Basis-Score für Präsenz
      if (manualSocialData.facebookFollowers && parseInt(manualSocialData.facebookFollowers) > 100) {
        score += 4; // Follower-Bonus
      }
      score += getLastPostScore(manualSocialData.facebookLastPost) * 0.2; // Letzter Post Bonus
    }
    
    // Instagram
    if (manualSocialData.instagramUrl) {
      score += 12;
      if (manualSocialData.instagramFollowers && parseInt(manualSocialData.instagramFollowers) > 100) {
        score += 4;
      }
      score += getLastPostScore(manualSocialData.instagramLastPost) * 0.2;
    }
    
    // LinkedIn
    if (manualSocialData.linkedinUrl) {
      score += 12;
      if (manualSocialData.linkedinFollowers && parseInt(manualSocialData.linkedinFollowers) > 50) {
        score += 4;
      }
      score += getLastPostScore(manualSocialData.linkedinLastPost) * 0.2;
    }
    
    // Twitter
    if (manualSocialData.twitterUrl) {
      score += 12;
      if (manualSocialData.twitterFollowers && parseInt(manualSocialData.twitterFollowers) > 100) {
        score += 4;
      }
      score += getLastPostScore(manualSocialData.twitterLastPost) * 0.2;
    }
    
    // YouTube
    if (manualSocialData.youtubeUrl) {
      score += 12;
      if (manualSocialData.youtubeSubscribers && parseInt(manualSocialData.youtubeSubscribers) > 50) {
        score += 4;
      }
      score += getLastPostScore(manualSocialData.youtubeLastPost) * 0.2;
    }
  } else {
    // Verwende automatisch erkannte Daten (nur Facebook und Instagram verfügbar)
    if (realData.socialMedia.facebook.found) {
      score += 12;
      if (realData.socialMedia.facebook.followers > 100) score += 4;
      score += getLastPostScore(realData.socialMedia.facebook.lastPost) * 0.2;
    }
    if (realData.socialMedia.instagram.found) {
      score += 12;
      if (realData.socialMedia.instagram.followers > 100) score += 4;
      score += getLastPostScore(realData.socialMedia.instagram.lastPost) * 0.2;
    }
  }
  
  return Math.min(100, Math.round(score));
};

export const calculateOverallScore = (
  realData: RealBusinessData,
  hourlyRateScore: number,
  socialMediaScore: number
) => {
  return Math.round(
    (realData.seo.score + realData.performance.score + 
     (realData.reviews.google.count > 0 ? 80 : 40) + 
     realData.mobile.overallScore + hourlyRateScore + socialMediaScore) / 6
  );
};
