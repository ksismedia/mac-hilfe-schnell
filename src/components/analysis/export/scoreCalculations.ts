
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
  if (!lastPost || lastPost === 'Nicht gefunden' || lastPost === '') return 8;
  
  const lowerPost = lastPost.toLowerCase();
  if (lowerPost.includes('heute') || lowerPost.includes('1 tag')) return 30;
  if (lowerPost.includes('2') || lowerPost.includes('3') || lowerPost.includes('tag')) return 25;
  if (lowerPost.includes('woche')) return 20;
  if (lowerPost.includes('monat')) return 12;
  return 8; // Älter als ein Monat
};

// KOMPLETT ÜBERARBEITETE Social Media Score Berechnung
export const calculateSocialMediaScore = (realData: RealBusinessData, manualSocialData?: ManualSocialData | null) => {
  console.log('=== SOCIAL MEDIA SCORE BERECHNUNG GESTARTET ===');
  console.log('Manual Data:', manualSocialData);
  console.log('Real Data Social Media:', realData.socialMedia);
  
  let totalScore = 0;
  let activePlatforms = 0;
  
  // Prüfe ob manuelle Daten vorhanden sind
  const hasManualData = manualSocialData && (
    manualSocialData.facebookUrl || manualSocialData.instagramUrl || 
    manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl
  );
  
  console.log('Hat manuelle Daten:', hasManualData);
  
  if (hasManualData) {
    console.log('=== VERWENDE MANUELLE DATEN ===');
    
    // FACEBOOK
    if (manualSocialData.facebookUrl) {
      let score = 60; // Höhere Basis für Präsenz
      const followers = parseInt(manualSocialData.facebookFollowers || '0');
      
      // Follower Bonus
      if (followers >= 1000) score += 25;
      else if (followers >= 500) score += 20;
      else if (followers >= 100) score += 15;
      else if (followers >= 50) score += 10;
      else if (followers >= 10) score += 5;
      
      // Post Aktivität
      score += getLastPostScore(manualSocialData.facebookLastPost || '');
      
      const facebookScore = Math.min(100, score);
      totalScore += facebookScore;
      activePlatforms++;
      console.log(`Facebook: ${facebookScore} Punkte (${followers} Follower, Post: ${manualSocialData.facebookLastPost})`);
    }
    
    // INSTAGRAM
    if (manualSocialData.instagramUrl) {
      let score = 60;
      const followers = parseInt(manualSocialData.instagramFollowers || '0');
      
      // Instagram hat höhere Follower-Standards
      if (followers >= 2000) score += 25;
      else if (followers >= 1000) score += 20;
      else if (followers >= 500) score += 15;
      else if (followers >= 100) score += 10;
      else if (followers >= 50) score += 5;
      
      score += getLastPostScore(manualSocialData.instagramLastPost || '');
      
      const instagramScore = Math.min(100, score);
      totalScore += instagramScore;
      activePlatforms++;
      console.log(`Instagram: ${instagramScore} Punkte (${followers} Follower, Post: ${manualSocialData.instagramLastPost})`);
    }
    
    // LINKEDIN
    if (manualSocialData.linkedinUrl) {
      let score = 60;
      const followers = parseInt(manualSocialData.linkedinFollowers || '0');
      
      // LinkedIn hat niedrigere Standards
      if (followers >= 500) score += 25;
      else if (followers >= 200) score += 20;
      else if (followers >= 100) score += 15;
      else if (followers >= 50) score += 10;
      else if (followers >= 10) score += 5;
      
      score += getLastPostScore(manualSocialData.linkedinLastPost || '');
      
      const linkedinScore = Math.min(100, score);
      totalScore += linkedinScore;
      activePlatforms++;
      console.log(`LinkedIn: ${linkedinScore} Punkte (${followers} Follower, Post: ${manualSocialData.linkedinLastPost})`);
    }
    
    // TWITTER
    if (manualSocialData.twitterUrl) {
      let score = 60;
      const followers = parseInt(manualSocialData.twitterFollowers || '0');
      
      if (followers >= 1000) score += 25;
      else if (followers >= 500) score += 20;
      else if (followers >= 100) score += 15;
      else if (followers >= 50) score += 10;
      else if (followers >= 10) score += 5;
      
      score += getLastPostScore(manualSocialData.twitterLastPost || '');
      
      const twitterScore = Math.min(100, score);
      totalScore += twitterScore;
      activePlatforms++;
      console.log(`Twitter: ${twitterScore} Punkte (${followers} Follower, Post: ${manualSocialData.twitterLastPost})`);
    }
    
    // YOUTUBE
    if (manualSocialData.youtubeUrl) {
      let score = 60;
      const subscribers = parseInt(manualSocialData.youtubeSubscribers || '0');
      
      // YouTube hat niedrigere Standards
      if (subscribers >= 500) score += 25;
      else if (subscribers >= 100) score += 20;
      else if (subscribers >= 50) score += 15;
      else if (subscribers >= 10) score += 10;
      else if (subscribers >= 1) score += 5;
      
      score += getLastPostScore(manualSocialData.youtubeLastPost || '');
      
      const youtubeScore = Math.min(100, score);
      totalScore += youtubeScore;
      activePlatforms++;
      console.log(`YouTube: ${youtubeScore} Punkte (${subscribers} Subscriber, Video: ${manualSocialData.youtubeLastPost})`);
    }
  } else {
    console.log('=== VERWENDE AUTOMATISCH ERKANNTE DATEN ===');
    
    // Automatisch erkannte Daten (nur Facebook und Instagram verfügbar)
    if (realData.socialMedia.facebook.found) {
      let score = 60;
      
      if (realData.socialMedia.facebook.followers >= 1000) score += 25;
      else if (realData.socialMedia.facebook.followers >= 500) score += 20;
      else if (realData.socialMedia.facebook.followers >= 100) score += 15;
      else if (realData.socialMedia.facebook.followers >= 50) score += 10;
      else if (realData.socialMedia.facebook.followers >= 10) score += 5;
      
      score += getLastPostScore(realData.socialMedia.facebook.lastPost);
      
      const facebookScore = Math.min(100, score);
      totalScore += facebookScore;
      activePlatforms++;
      console.log(`Facebook (auto): ${facebookScore} Punkte`);
    }
    
    if (realData.socialMedia.instagram.found) {
      let score = 60;
      
      if (realData.socialMedia.instagram.followers >= 2000) score += 25;
      else if (realData.socialMedia.instagram.followers >= 1000) score += 20;
      else if (realData.socialMedia.instagram.followers >= 500) score += 15;
      else if (realData.socialMedia.instagram.followers >= 100) score += 10;
      else if (realData.socialMedia.instagram.followers >= 50) score += 5;
      
      score += getLastPostScore(realData.socialMedia.instagram.lastPost);
      
      const instagramScore = Math.min(100, score);
      totalScore += instagramScore;
      activePlatforms++;
      console.log(`Instagram (auto): ${instagramScore} Punkte`);
    }
  }
  
  // FINALE BERECHNUNG
  let finalScore = 0;
  
  if (activePlatforms === 0) {
    finalScore = 0;
    console.log('Keine aktiven Plattformen gefunden -> Score: 0');
  } else {
    // Durchschnitt aller Plattformen
    const averageScore = totalScore / activePlatforms;
    console.log(`Durchschnittsscore: ${averageScore} (${totalScore} / ${activePlatforms})`);
    
    // Multi-Platform Bonus für Diversität
    let diversityBonus = 0;
    if (activePlatforms >= 5) diversityBonus = 15;      // Alle 5 Plattformen
    else if (activePlatforms >= 4) diversityBonus = 12; // 4 Plattformen -> WICHTIG!
    else if (activePlatforms >= 3) diversityBonus = 8;  // 3 Plattformen
    else if (activePlatforms >= 2) diversityBonus = 5;  // 2 Plattformen
    
    console.log(`Diversitäts-Bonus: ${diversityBonus} für ${activePlatforms} Plattformen`);
    
    finalScore = Math.min(100, Math.round(averageScore + diversityBonus));
  }
  
  console.log('=== FINALES ERGEBNIS ===');
  console.log(`Aktive Plattformen: ${activePlatforms}`);
  console.log(`Gesamt-Score: ${totalScore}`);
  console.log(`Durchschnitt: ${activePlatforms > 0 ? (totalScore / activePlatforms).toFixed(1) : 0}`);
  console.log(`Diversitäts-Bonus: ${activePlatforms >= 5 ? 15 : activePlatforms >= 4 ? 12 : activePlatforms >= 3 ? 8 : activePlatforms >= 2 ? 5 : 0}`);
  console.log(`FINALER SOCIAL MEDIA SCORE: ${finalScore}`);
  console.log('=== BERECHNUNG BEENDET ===');
  
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
