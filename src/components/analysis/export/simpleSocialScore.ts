
import { ManualSocialData } from '@/hooks/useManualData';

export const calculateSimpleSocialScore = (manualData?: ManualSocialData | null): number => {
  if (!manualData) return 0;
  
  let totalScore = 0;
  let activePlatforms = 0;
  
  // Facebook
  if (manualData.facebookUrl && manualData.facebookUrl.trim() !== '') {
    let platformScore = 40; // Erhöhte Basis für Präsenz
    const followers = parseInt(manualData.facebookFollowers || '0');
    
    // Verbesserte Follower-Bewertung
    if (followers >= 5000) platformScore += 25;
    else if (followers >= 2000) platformScore += 20;
    else if (followers >= 1000) platformScore += 15;
    else if (followers >= 500) platformScore += 12;
    else if (followers >= 100) platformScore += 10;
    else if (followers >= 50) platformScore += 7;
    else if (followers >= 10) platformScore += 5;
    
    // Verbesserte Post-Aktivität Bewertung
    let activityBonus = 0;
    if (manualData.facebookLastPost) {
      const post = manualData.facebookLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) activityBonus = 20; // Sehr aktuell
      else if (post.includes('2 tag') || post.includes('3 tag')) activityBonus = 15;
      else if (post.includes('woche')) activityBonus = 10;
      else if (post.includes('monat')) activityBonus = 5;
    }
    platformScore += activityBonus;
    
    // Bonus für Kombination: Gute Follower + sehr aktuelle Posts
    if (followers >= 500 && activityBonus >= 15) {
      platformScore += 10; // Exzellenz-Bonus
    }
    
    totalScore += Math.min(85, platformScore); // Erhöhtes Maximum
    activePlatforms++;
  }
  
  // Instagram
  if (manualData.instagramUrl && manualData.instagramUrl.trim() !== '') {
    let platformScore = 40; // Erhöhte Basis für Präsenz
    const followers = parseInt(manualData.instagramFollowers || '0');
    
    // Verbesserte Follower-Bewertung für Instagram
    if (followers >= 10000) platformScore += 25;
    else if (followers >= 5000) platformScore += 20;
    else if (followers >= 2000) platformScore += 15;
    else if (followers >= 1000) platformScore += 12;
    else if (followers >= 500) platformScore += 10;
    else if (followers >= 100) platformScore += 7;
    else if (followers >= 50) platformScore += 5;
    
    // Verbesserte Post-Aktivität Bewertung
    let activityBonus = 0;
    if (manualData.instagramLastPost) {
      const post = manualData.instagramLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) activityBonus = 20; // Sehr aktuell
      else if (post.includes('2 tag') || post.includes('3 tag')) activityBonus = 15;
      else if (post.includes('woche')) activityBonus = 10;
      else if (post.includes('monat')) activityBonus = 5;
    }
    platformScore += activityBonus;
    
    // Bonus für Kombination: Gute Follower + sehr aktuelle Posts
    if (followers >= 500 && activityBonus >= 15) {
      platformScore += 10; // Exzellenz-Bonus
    }
    
    totalScore += Math.min(85, platformScore); // Erhöhtes Maximum
    activePlatforms++;
  }
  
  // LinkedIn
  if (manualData.linkedinUrl && manualData.linkedinUrl.trim() !== '') {
    let platformScore = 30;
    const followers = parseInt(manualData.linkedinFollowers || '0');
    
    if (followers >= 2000) platformScore += 20;
    else if (followers >= 1000) platformScore += 15;
    else if (followers >= 500) platformScore += 12;
    else if (followers >= 200) platformScore += 10;
    else if (followers >= 100) platformScore += 8;
    else if (followers >= 50) platformScore += 5;
    else if (followers >= 10) platformScore += 3;
    
    if (manualData.linkedinLastPost) {
      const post = manualData.linkedinLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 15;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 12;
      else if (post.includes('woche')) platformScore += 8;
      else if (post.includes('monat')) platformScore += 4;
    }
    
    totalScore += Math.min(70, platformScore);
    activePlatforms++;
  }
  
  // Twitter
  if (manualData.twitterUrl && manualData.twitterUrl.trim() !== '') {
    let platformScore = 30;
    const followers = parseInt(manualData.twitterFollowers || '0');
    
    if (followers >= 5000) platformScore += 20;
    else if (followers >= 2000) platformScore += 15;
    else if (followers >= 1000) platformScore += 12;
    else if (followers >= 500) platformScore += 10;
    else if (followers >= 200) platformScore += 8;
    else if (followers >= 50) platformScore += 5;
    else if (followers >= 10) platformScore += 3;
    
    if (manualData.twitterLastPost) {
      const post = manualData.twitterLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 15;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 12;
      else if (post.includes('woche')) platformScore += 8;
      else if (post.includes('monat')) platformScore += 4;
    }
    
    totalScore += Math.min(70, platformScore);
    activePlatforms++;
  }
  
  // YouTube
  if (manualData.youtubeUrl && manualData.youtubeUrl.trim() !== '') {
    let platformScore = 30;
    const subscribers = parseInt(manualData.youtubeSubscribers || '0');
    
    if (subscribers >= 1000) platformScore += 20;
    else if (subscribers >= 500) platformScore += 15;
    else if (subscribers >= 200) platformScore += 12;
    else if (subscribers >= 100) platformScore += 10;
    else if (subscribers >= 50) platformScore += 8;
    else if (subscribers >= 25) platformScore += 5;
    else if (subscribers >= 5) platformScore += 3;
    
    if (manualData.youtubeLastPost) {
      const post = manualData.youtubeLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 15;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 12;
      else if (post.includes('woche')) platformScore += 8;
      else if (post.includes('monat')) platformScore += 4;
    }
    
    totalScore += Math.min(70, platformScore);
    activePlatforms++;
  }
  
  if (activePlatforms === 0) return 0;
  
  // Durchschnitt berechnen
  const averageScore = totalScore / activePlatforms;
  
  // Kleiner Bonus für mehrere Plattformen (max 10%)
  let diversityBonus = 0;
  if (activePlatforms >= 5) diversityBonus = 10;
  else if (activePlatforms >= 4) diversityBonus = 8;
  else if (activePlatforms >= 3) diversityBonus = 6;
  else if (activePlatforms >= 2) diversityBonus = 4;
  
  const finalScore = Math.min(100, Math.round(averageScore + diversityBonus));
  
  console.log(`Social Media Score: ${finalScore} (${activePlatforms} Plattformen, Durchschnitt: ${averageScore.toFixed(1)}, Bonus: ${diversityBonus})`);
  
  return finalScore;
};
