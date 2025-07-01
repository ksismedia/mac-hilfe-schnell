
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

export const calculateSocialMediaScore = (realData: RealBusinessData, manualSocialData?: ManualSocialData | null) => {
  let score = 0;
  
  // Prüfe ob manuelle Daten vorhanden sind
  const hasManualData = manualSocialData && (manualSocialData.facebookUrl || manualSocialData.instagramUrl);
  
  if (hasManualData) {
    // Verwende manuelle Daten für die Bewertung
    if (manualSocialData.facebookUrl) {
      score += 30; // Facebook vorhanden
      if (manualSocialData.facebookFollowers && parseInt(manualSocialData.facebookFollowers) > 100) {
        score += 20; // Gute Follower-Zahl
      }
    }
    if (manualSocialData.instagramUrl) {
      score += 30; // Instagram vorhanden
      if (manualSocialData.instagramFollowers && parseInt(manualSocialData.instagramFollowers) > 100) {
        score += 20; // Gute Follower-Zahl
      }
    }
  } else {
    // Verwende automatisch erkannte Daten
    if (realData.socialMedia.facebook.found) score += 30;
    if (realData.socialMedia.instagram.found) score += 30;
    if (realData.socialMedia.facebook.followers > 100) score += 20;
    if (realData.socialMedia.instagram.followers > 100) score += 20;
  }
  
  return Math.min(100, score);
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
