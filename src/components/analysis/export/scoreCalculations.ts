
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

// Verbesserte Funktion zur Bewertung des letzten Posts
const getLastPostScore = (lastPost: string): number => {
  if (!lastPost || lastPost === 'Nicht gefunden') return 0;
  
  const lowerPost = lastPost.toLowerCase();
  if (lowerPost.includes('heute') || lowerPost.includes('1 tag')) return 25;
  if (lowerPost.includes('2') || lowerPost.includes('3') || lowerPost.includes('tag')) return 20;
  if (lowerPost.includes('woche')) return 15;
  if (lowerPost.includes('monat')) return 8;
  return 3; // Älter als ein Monat
};

// Neue fairere Berechnung für Social Media Score
export const calculateSocialMediaScore = (realData: RealBusinessData, manualSocialData?: ManualSocialData | null) => {
  console.log('calculateSocialMediaScore called with:', { realData: realData.socialMedia, manualSocialData });
  
  let totalScore = 0;
  let activePlatforms = 0;
  const platformScores: { [key: string]: number } = {};
  
  // Prüfe ob manuelle Daten vorhanden sind
  const hasManualData = manualSocialData && (
    manualSocialData.facebookUrl || manualSocialData.instagramUrl || 
    manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl
  );
  
  console.log('Has manual data:', hasManualData);
  
  if (hasManualData) {
    // Facebook
    if (manualSocialData.facebookUrl) {
      let platformScore = 40; // Basis-Score für Präsenz (höher als vorher)
      
      if (manualSocialData.facebookFollowers && parseInt(manualSocialData.facebookFollowers) > 100) {
        platformScore += 20; // Follower-Bonus
      } else if (manualSocialData.facebookFollowers && parseInt(manualSocialData.facebookFollowers) > 50) {
        platformScore += 10; // Kleinerer Follower-Bonus
      }
      
      const postScore = getLastPostScore(manualSocialData.facebookLastPost);
      platformScore += postScore;
      
      platformScores.facebook = Math.min(100, platformScore);
      totalScore += platformScores.facebook;
      activePlatforms++;
      console.log('Facebook score:', platformScores.facebook);
    }
    
    // Instagram
    if (manualSocialData.instagramUrl) {
      let platformScore = 40;
      
      if (manualSocialData.instagramFollowers && parseInt(manualSocialData.instagramFollowers) > 100) {
        platformScore += 20;
      } else if (manualSocialData.instagramFollowers && parseInt(manualSocialData.instagramFollowers) > 50) {
        platformScore += 10;
      }
      
      const postScore = getLastPostScore(manualSocialData.instagramLastPost);
      platformScore += postScore;
      
      platformScores.instagram = Math.min(100, platformScore);
      totalScore += platformScores.instagram;
      activePlatforms++;
      console.log('Instagram score:', platformScores.instagram);
    }
    
    // LinkedIn
    if (manualSocialData.linkedinUrl) {
      let platformScore = 40;
      
      if (manualSocialData.linkedinFollowers && parseInt(manualSocialData.linkedinFollowers) > 50) {
        platformScore += 20;
      } else if (manualSocialData.linkedinFollowers && parseInt(manualSocialData.linkedinFollowers) > 25) {
        platformScore += 10;
      }
      
      const postScore = getLastPostScore(manualSocialData.linkedinLastPost);
      platformScore += postScore;
      
      platformScores.linkedin = Math.min(100, platformScore);
      totalScore += platformScores.linkedin;
      activePlatforms++;
      console.log('LinkedIn score:', platformScores.linkedin);
    }
    
    // Twitter
    if (manualSocialData.twitterUrl) {
      let platformScore = 40;
      
      if (manualSocialData.twitterFollowers && parseInt(manualSocialData.twitterFollowers) > 100) {
        platformScore += 20;
      } else if (manualSocialData.twitterFollowers && parseInt(manualSocialData.twitterFollowers) > 50) {
        platformScore += 10;
      }
      
      const postScore = getLastPostScore(manualSocialData.twitterLastPost);
      platformScore += postScore;
      
      platformScores.twitter = Math.min(100, platformScore);
      totalScore += platformScores.twitter;
      activePlatforms++;
      console.log('Twitter score:', platformScores.twitter);
    }
    
    // YouTube
    if (manualSocialData.youtubeUrl) {
      let platformScore = 40;
      
      if (manualSocialData.youtubeSubscribers && parseInt(manualSocialData.youtubeSubscribers) > 50) {
        platformScore += 20;
      } else if (manualSocialData.youtubeSubscribers && parseInt(manualSocialData.youtubeSubscribers) > 25) {
        platformScore += 10;
      }
      
      const postScore = getLastPostScore(manualSocialData.youtubeLastPost);
      platformScore += postScore;
      
      platformScores.youtube = Math.min(100, platformScore);
      totalScore += platformScores.youtube;
      activePlatforms++;
      console.log('YouTube score:', platformScores.youtube);
    }
  } else {
    // Verwende automatisch erkannte Daten (nur Facebook und Instagram verfügbar)
    if (realData.socialMedia.facebook.found) {
      let platformScore = 40;
      
      if (realData.socialMedia.facebook.followers > 100) {
        platformScore += 20;
      } else if (realData.socialMedia.facebook.followers > 50) {
        platformScore += 10;
      }
      
      const postScore = getLastPostScore(realData.socialMedia.facebook.lastPost);
      platformScore += postScore;
      
      platformScores.facebook = Math.min(100, platformScore);
      totalScore += platformScores.facebook;
      activePlatforms++;
      console.log('Facebook score (auto):', platformScores.facebook);
    }
    
    if (realData.socialMedia.instagram.found) {
      let platformScore = 40;
      
      if (realData.socialMedia.instagram.followers > 100) {
        platformScore += 20;
      } else if (realData.socialMedia.instagram.followers > 50) {
        platformScore += 10;
      }
      
      const postScore = getLastPostScore(realData.socialMedia.instagram.lastPost);
      platformScore += postScore;
      
      platformScores.instagram = Math.min(100, platformScore);
      totalScore += platformScores.instagram;
      activePlatforms++;
      console.log('Instagram score (auto):', platformScores.instagram);
    }
  }
  
  // Neue faire Berechnung: Durchschnitt der aktiven Plattformen mit Bonus für Vielfalt
  let finalScore = 0;
  
  if (activePlatforms === 0) {
    finalScore = 0;
  } else {
    // Durchschnittsscore der aktiven Plattformen
    const averageScore = totalScore / activePlatforms;
    
    // Vielfältigkeitsbonus: Je mehr Plattformen, desto besser (aber weniger wichtig)
    let diversityMultiplier = 1.0;
    if (activePlatforms >= 5) diversityMultiplier = 1.2;      // +20% für alle 5
    else if (activePlatforms >= 3) diversityMultiplier = 1.1; // +10% für 3+
    else if (activePlatforms >= 2) diversityMultiplier = 1.05; // +5% für 2+
    
    finalScore = Math.min(100, Math.round(averageScore * diversityMultiplier));
  }
  
  console.log('Social Media Score Details:', {
    activePlatforms,
    platformScores,
    totalScore,
    averageScore: activePlatforms > 0 ? totalScore / activePlatforms : 0,
    finalScore
  });
  
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
