
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
  console.log('calculateSocialMediaScore called with:', { realData: realData.socialMedia, manualSocialData });
  
  let score = 0;
  const platforms = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube'];
  const maxScorePerPlatform = 20; // 100 / 5 Plattformen
  
  // Prüfe ob manuelle Daten vorhanden sind
  const hasManualData = manualSocialData && (
    manualSocialData.facebookUrl || manualSocialData.instagramUrl || 
    manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl
  );
  
  console.log('Has manual data:', hasManualData);
  
  if (hasManualData) {
    // Facebook
    if (manualSocialData.facebookUrl) {
      score += 12; // Basis-Score für Präsenz
      console.log('Facebook found (manual), score +12:', score);
      if (manualSocialData.facebookFollowers && parseInt(manualSocialData.facebookFollowers) > 100) {
        score += 4; // Follower-Bonus
        console.log('Facebook follower bonus +4:', score);
      }
      const postScore = getLastPostScore(manualSocialData.facebookLastPost) * 0.2;
      score += postScore;
      console.log('Facebook last post bonus +' + postScore + ':', score);
    }
    
    // Instagram
    if (manualSocialData.instagramUrl) {
      score += 12;
      console.log('Instagram found (manual), score +12:', score);
      if (manualSocialData.instagramFollowers && parseInt(manualSocialData.instagramFollowers) > 100) {
        score += 4;
        console.log('Instagram follower bonus +4:', score);
      }
      const postScore = getLastPostScore(manualSocialData.instagramLastPost) * 0.2;
      score += postScore;
      console.log('Instagram last post bonus +' + postScore + ':', score);
    }
    
    // LinkedIn
    if (manualSocialData.linkedinUrl) {
      score += 12;
      console.log('LinkedIn found (manual), score +12:', score);
      if (manualSocialData.linkedinFollowers && parseInt(manualSocialData.linkedinFollowers) > 50) {
        score += 4;
        console.log('LinkedIn follower bonus +4:', score);
      }
      const postScore = getLastPostScore(manualSocialData.linkedinLastPost) * 0.2;
      score += postScore;
      console.log('LinkedIn last post bonus +' + postScore + ':', score);
    }
    
    // Twitter
    if (manualSocialData.twitterUrl) {
      score += 12;
      console.log('Twitter found (manual), score +12:', score);
      if (manualSocialData.twitterFollowers && parseInt(manualSocialData.twitterFollowers) > 100) {
        score += 4;
        console.log('Twitter follower bonus +4:', score);
      }
      const postScore = getLastPostScore(manualSocialData.twitterLastPost) * 0.2;
      score += postScore;
      console.log('Twitter last post bonus +' + postScore + ':', score);
    }
    
    // YouTube
    if (manualSocialData.youtubeUrl) {
      score += 12;
      console.log('YouTube found (manual), score +12:', score);
      if (manualSocialData.youtubeSubscribers && parseInt(manualSocialData.youtubeSubscribers) > 50) {
        score += 4;
        console.log('YouTube subscriber bonus +4:', score);
      }
      const postScore = getLastPostScore(manualSocialData.youtubeLastPost) * 0.2;
      score += postScore;
      console.log('YouTube last post bonus +' + postScore + ':', score);
    }
  } else {
    // Verwende automatisch erkannte Daten (nur Facebook und Instagram verfügbar)
    if (realData.socialMedia.facebook.found) {
      score += 12;
      console.log('Facebook found (auto), score +12:', score);
      if (realData.socialMedia.facebook.followers > 100) {
        score += 4;
        console.log('Facebook follower bonus (auto) +4:', score);
      }
      const postScore = getLastPostScore(realData.socialMedia.facebook.lastPost) * 0.2;
      score += postScore;
      console.log('Facebook last post bonus (auto) +' + postScore + ':', score);
    }
    if (realData.socialMedia.instagram.found) {
      score += 12;
      console.log('Instagram found (auto), score +12:', score);
      if (realData.socialMedia.instagram.followers > 100) {
        score += 4;
        console.log('Instagram follower bonus (auto) +4:', score);
      }
      const postScore = getLastPostScore(realData.socialMedia.instagram.lastPost) * 0.2;
      score += postScore;
      console.log('Instagram last post bonus (auto) +' + postScore + ':', score);
    }
  }
  
  const finalScore = Math.min(100, Math.round(score));
  console.log('Final social media score:', finalScore);
  return finalScore;
};

export const calculateOverallScore = (
  realData: RealBusinessData,
  hourlyRateScore: number,
  socialMediaScore: number
) => {
  const overallScore = Math.round(
    (realData.seo.score + realData.performance.score + 
     (realData.reviews.google.count > 0 ? 80 : 40) + 
     realData.mobile.overallScore + hourlyRateScore + socialMediaScore) / 6
  );
  console.log('Overall score calculation:', {
    seo: realData.seo.score,
    performance: realData.performance.score,
    reviews: realData.reviews.google.count > 0 ? 80 : 40,
    mobile: realData.mobile.overallScore,
    hourlyRate: hourlyRateScore,
    socialMedia: socialMediaScore,
    overall: overallScore
  });
  return overallScore;
};
