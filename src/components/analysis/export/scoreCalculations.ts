
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
  if (!lastPost || lastPost === 'Nicht gefunden' || lastPost === '') return 5;
  
  const lowerPost = lastPost.toLowerCase();
  if (lowerPost.includes('heute') || lowerPost.includes('1 tag')) return 25;
  if (lowerPost.includes('2') || lowerPost.includes('3') || lowerPost.includes('tag')) return 20;
  if (lowerPost.includes('woche')) return 15;
  if (lowerPost.includes('monat')) return 10;
  return 8; // Älter als ein Monat
};

// KOMPLETT ÜBERARBEITETE Social Media Score Berechnung
export const calculateSocialMediaScore = (realData: RealBusinessData, manualSocialData?: ManualSocialData | null) => {
  console.log('=== SOCIAL MEDIA SCORE BERECHNUNG START ===');
  console.log('Manual Data:', manualSocialData);
  console.log('Real Data:', realData.socialMedia);
  
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
    // FACEBOOK - Manuelle Daten
    if (manualSocialData.facebookUrl) {
      let score = 25; // Basis für Präsenz
      
      // Follower Bonus
      const followers = parseInt(manualSocialData.facebookFollowers || '0');
      if (followers >= 1000) score += 20;
      else if (followers >= 500) score += 15;
      else if (followers >= 100) score += 10;
      else if (followers >= 50) score += 5;
      
      // Post Aktivität Bonus
      score += getLastPostScore(manualSocialData.facebookLastPost || '');
      
      platformScores.facebook = Math.min(100, score);
      totalScore += platformScores.facebook;
      activePlatforms++;
      console.log(`Facebook Score: ${platformScores.facebook} (Follower: ${followers}, Post: ${manualSocialData.facebookLastPost})`);
    }
    
    // INSTAGRAM - Manuelle Daten
    if (manualSocialData.instagramUrl) {
      let score = 25; // Basis für Präsenz
      
      // Follower Bonus (Instagram hat höhere Standards)
      const followers = parseInt(manualSocialData.instagramFollowers || '0');
      if (followers >= 2000) score += 20;
      else if (followers >= 1000) score += 15;
      else if (followers >= 500) score += 10;
      else if (followers >= 100) score += 5;
      
      // Post Aktivität Bonus
      score += getLastPostScore(manualSocialData.instagramLastPost || '');
      
      platformScores.instagram = Math.min(100, score);
      totalScore += platformScores.instagram;
      activePlatforms++;
      console.log(`Instagram Score: ${platformScores.instagram} (Follower: ${followers}, Post: ${manualSocialData.instagramLastPost})`);
    }
    
    // LINKEDIN - Manuelle Daten
    if (manualSocialData.linkedinUrl) {
      let score = 25; // Basis für Präsenz
      
      // Follower Bonus (LinkedIn hat niedrigere Standards)
      const followers = parseInt(manualSocialData.linkedinFollowers || '0');
      if (followers >= 500) score += 20;
      else if (followers >= 200) score += 15;
      else if (followers >= 100) score += 10;
      else if (followers >= 50) score += 5;
      
      // Post Aktivität Bonus
      score += getLastPostScore(manualSocialData.linkedinLastPost || '');
      
      platformScores.linkedin = Math.min(100, score);
      totalScore += platformScores.linkedin;
      activePlatforms++;
      console.log(`LinkedIn Score: ${platformScores.linkedin} (Follower: ${followers}, Post: ${manualSocialData.linkedinLastPost})`);
    }
    
    // TWITTER - Manuelle Daten
    if (manualSocialData.twitterUrl) {
      let score = 25; // Basis für Präsenz
      
      // Follower Bonus
      const followers = parseInt(manualSocialData.twitterFollowers || '0');
      if (followers >= 1000) score += 20;
      else if (followers >= 500) score += 15;
      else if (followers >= 100) score += 10;
      else if (followers >= 50) score += 5;
      
      // Post Aktivität Bonus
      score += getLastPostScore(manualSocialData.twitterLastPost || '');
      
      platformScores.twitter = Math.min(100, score);
      totalScore += platformScores.twitter;
      activePlatforms++;
      console.log(`Twitter Score: ${platformScores.twitter} (Follower: ${followers}, Post: ${manualSocialData.twitterLastPost})`);
    }
    
    // YOUTUBE - Manuelle Daten
    if (manualSocialData.youtubeUrl) {
      let score = 25; // Basis für Präsenz
      
      // Subscriber Bonus (YouTube hat niedrigere Standards)
      const subscribers = parseInt(manualSocialData.youtubeSubscribers || '0');
      if (subscribers >= 500) score += 20;
      else if (subscribers >= 100) score += 15;
      else if (subscribers >= 50) score += 10;
      else if (subscribers >= 10) score += 5;
      
      // Video Aktivität Bonus
      score += getLastPostScore(manualSocialData.youtubeLastPost || '');
      
      platformScores.youtube = Math.min(100, score);
      totalScore += platformScores.youtube;
      activePlatforms++;
      console.log(`YouTube Score: ${platformScores.youtube} (Subscriber: ${subscribers}, Video: ${manualSocialData.youtubeLastPost})`);
    }
  } else {
    // Automatisch erkannte Daten (nur Facebook und Instagram verfügbar)
    if (realData.socialMedia.facebook.found) {
      let score = 25;
      
      if (realData.socialMedia.facebook.followers >= 1000) score += 20;
      else if (realData.socialMedia.facebook.followers >= 500) score += 15;
      else if (realData.socialMedia.facebook.followers >= 100) score += 10;
      else if (realData.socialMedia.facebook.followers >= 50) score += 5;
      
      score += getLastPostScore(realData.socialMedia.facebook.lastPost);
      
      platformScores.facebook = Math.min(100, score);
      totalScore += platformScores.facebook;
      activePlatforms++;
      console.log(`Facebook Score (auto): ${platformScores.facebook}`);
    }
    
    if (realData.socialMedia.instagram.found) {
      let score = 25;
      
      if (realData.socialMedia.instagram.followers >= 2000) score += 20;
      else if (realData.socialMedia.instagram.followers >= 1000) score += 15;
      else if (realData.socialMedia.instagram.followers >= 500) score += 10;
      else if (realData.socialMedia.instagram.followers >= 100) score += 5;
      
      score += getLastPostScore(realData.socialMedia.instagram.lastPost);
      
      platformScores.instagram = Math.min(100, score);
      totalScore += platformScores.instagram;
      activePlatforms++;
      console.log(`Instagram Score (auto): ${platformScores.instagram}`);
    }
  }
  
  // FINALE BERECHNUNG
  let finalScore = 0;
  
  if (activePlatforms === 0) {
    finalScore = 0;
  } else {
    // Durchschnittsscore der aktiven Plattformen
    const averageScore = totalScore / activePlatforms;
    
    // Diversity Bonus: Mehr Plattformen = höherer Bonus
    let diversityBonus = 0;
    if (activePlatforms >= 5) diversityBonus = 20;      // +20 für alle 5
    else if (activePlatforms >= 4) diversityBonus = 15; // +15 für 4
    else if (activePlatforms >= 3) diversityBonus = 10; // +10 für 3
    else if (activePlatforms >= 2) diversityBonus = 5;  // +5 für 2
    
    finalScore = Math.min(100, Math.round(averageScore + diversityBonus));
  }
  
  console.log('=== FINAL CALCULATION ===');
  console.log('Active Platforms:', activePlatforms);
  console.log('Platform Scores:', platformScores);
  console.log('Total Score:', totalScore);
  console.log('Average Score:', activePlatforms > 0 ? totalScore / activePlatforms : 0);
  console.log('Diversity Bonus:', activePlatforms >= 5 ? 20 : activePlatforms >= 4 ? 15 : activePlatforms >= 3 ? 10 : activePlatforms >= 2 ? 5 : 0);
  console.log('FINAL SCORE:', finalScore);
  console.log('=== SOCIAL MEDIA SCORE BERECHNUNG ENDE ===');
  
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
