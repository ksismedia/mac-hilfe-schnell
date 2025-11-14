import { ManualSocialData } from '@/hooks/useManualData';

export const calculateSimpleSocialScore = (manualData?: ManualSocialData | null): number => {
  if (!manualData) return 0;
  
  let totalScore = 0;
  
  // Facebook (max 30 Punkte) - Großzügigere Bewertung: 60% Basis + Follower + Aktualität
  if (manualData.facebookUrl && manualData.facebookUrl.trim() !== '') {
    let platformScore = 18; // Basis 60% = 18 Punkte (erhöht von 15)
    const followers = parseInt(manualData.facebookFollowers || '0');
    
    // Follower-Bewertung: Niedrigere Schwellen, max 9 Punkte
    if (followers >= 50) {
      platformScore += 4; // +13% für 50+ Follower
      
      // Zusätzliche Punkte für höhere Followerzahlen
      if (followers >= 5000) platformScore += 5;
      else if (followers >= 2000) platformScore += 4;
      else if (followers >= 1000) platformScore += 3;
      else if (followers >= 500) platformScore += 2;
      else if (followers >= 200) platformScore += 1;
    }
    
    // Post-Aktivität: Großzügigere Bewertung, max 3 Punkte
    if (manualData.facebookLastPost) {
      const post = manualData.facebookLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 3;
      else if (post.includes('2 tag') || post.includes('3 tag') || post.includes('4 tag') || post.includes('5 tag')) platformScore += 2.8;
      else if (post.includes('6 tag') || post.includes('7 tag') || post.includes('1 woche')) platformScore += 2.5;
      else if (post.includes('2 woche') || post.includes('3 woche')) platformScore += 2;
      else if (post.includes('4 woche') || post.includes('1 monat')) platformScore += 1.5;
      else if (post.includes('monat')) platformScore += 1;
    }
    
    totalScore += Math.min(30, platformScore);
  }
  
  // Instagram (max 30 Punkte) - Großzügigere Bewertung: 60% Basis + Follower + Aktualität
  if (manualData.instagramUrl && manualData.instagramUrl.trim() !== '') {
    let platformScore = 18; // Basis 60% = 18 Punkte (erhöht von 15)
    const followers = parseInt(manualData.instagramFollowers || '0');
    
    // Follower-Bewertung: Niedrigere Schwellen, max 9 Punkte
    if (followers >= 50) {
      platformScore += 4; // +13% für 50+ Follower
      
      // Zusätzliche Punkte für höhere Followerzahlen
      if (followers >= 5000) platformScore += 5;
      else if (followers >= 2000) platformScore += 4;
      else if (followers >= 1000) platformScore += 3;
      else if (followers >= 500) platformScore += 2;
      else if (followers >= 200) platformScore += 1;
    }
    
    // Post-Aktivität: Großzügigere Bewertung, max 3 Punkte
    if (manualData.instagramLastPost) {
      const post = manualData.instagramLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 3;
      else if (post.includes('2 tag') || post.includes('3 tag') || post.includes('4 tag') || post.includes('5 tag')) platformScore += 2.8;
      else if (post.includes('6 tag') || post.includes('7 tag') || post.includes('1 woche')) platformScore += 2.5;
      else if (post.includes('2 woche') || post.includes('3 woche')) platformScore += 2;
      else if (post.includes('4 woche') || post.includes('1 monat')) platformScore += 1.5;
      else if (post.includes('monat')) platformScore += 1;
    }
    
    totalScore += Math.min(30, platformScore);
  }
  
  // LinkedIn (max 30 Punkte) - Großzügigere Bewertung
  if (manualData.linkedinUrl && manualData.linkedinUrl.trim() !== '') {
    let platformScore = 18; // Basis 60% = 18 Punkte (erhöht von 15)
    const followers = parseInt(manualData.linkedinFollowers || '0');
    
    // Follower-Bewertung (max 15 Punkte) - ursprüngliche Anforderungen
    if (followers >= 2000) platformScore += 15;
    else if (followers >= 1000) platformScore += 12;
    else if (followers >= 500) platformScore += 10;
    else if (followers >= 200) platformScore += 8;
    else if (followers >= 100) platformScore += 6;
    else if (followers >= 50) platformScore += 5;
    else if (followers >= 20) platformScore += 4;
    else if (followers >= 10) platformScore += 3;
    else if (followers >= 1) platformScore += 2;
    
    // Post-Aktivität (max 5 Punkte)
    if (manualData.linkedinLastPost) {
      const post = manualData.linkedinLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 5;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 4;
      else if (post.includes('woche')) platformScore += 3;
      else if (post.includes('monat')) platformScore += 1;
    }
    
    totalScore += Math.min(30, platformScore);
  }
  
  // Twitter (max 20 Punkte) - Ursprüngliche Bewertungslogik beibehalten
  if (manualData.twitterUrl && manualData.twitterUrl.trim() !== '') {
    let platformScore = 8; // Basis für Präsenz
    const followers = parseInt(manualData.twitterFollowers || '0');
    
    // Follower-Bewertung (max 12 Punkte) - ursprüngliche Anforderungen
    if (followers >= 5000) platformScore += 12;
    else if (followers >= 2000) platformScore += 10;
    else if (followers >= 1000) platformScore += 8;
    else if (followers >= 500) platformScore += 6;
    else if (followers >= 200) platformScore += 5;
    else if (followers >= 100) platformScore += 4;
    else if (followers >= 50) platformScore += 3;
    else if (followers >= 20) platformScore += 2;
    else if (followers >= 1) platformScore += 1;
    
    // Post-Aktivität (max 3 Punkte)
    if (manualData.twitterLastPost) {
      const post = manualData.twitterLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 3;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 2;
      else if (post.includes('woche')) platformScore += 1;
    }
    
    totalScore += Math.min(20, platformScore);
  }
  
  // YouTube (max 20 Punkte) - Großzügigere Bewertung: 60% Basis + Abonnenten + Aktivität
  if (manualData.youtubeUrl && manualData.youtubeUrl.trim() !== '') {
    let platformScore = 12; // Basis 60% = 12 Punkte (erhöht von 10)
    const subscribers = parseInt(manualData.youtubeSubscribers || '0');
    
    // Abonnenten-Bewertung: Niedrigere Schwellen, max 6 Punkte
    if (subscribers >= 50) {
      platformScore += 2.5; // für 50+ Abonnenten
      
      // Zusätzliche Punkte für höhere Abonnentenzahlen
      if (subscribers >= 2000) platformScore += 3.5;
      else if (subscribers >= 1000) platformScore += 2.5;
      else if (subscribers >= 500) platformScore += 1.5;
      else if (subscribers >= 200) platformScore += 1;
    }
    
    // Video-Aktivität: Großzügigere Bewertung, max 2 Punkte
    if (manualData.youtubeLastPost) {
      const post = manualData.youtubeLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 2;
      else if (post.includes('2 tag') || post.includes('3 tag') || post.includes('4 tag') || post.includes('5 tag')) platformScore += 1.8;
      else if (post.includes('6 tag') || post.includes('7 tag') || post.includes('1 woche')) platformScore += 1.5;
      else if (post.includes('2 woche') || post.includes('3 woche')) platformScore += 1.2;
      else if (post.includes('4 woche') || post.includes('1 monat')) platformScore += 1;
      else if (post.includes('monat')) platformScore += 0.5;
    }
    
    totalScore += Math.min(20, platformScore);
  }
  
  // TikTok (max 20 Punkte) - Großzügigere Bewertung: 60% Basis + Follower + Aktivität
  if (manualData.tiktokUrl && manualData.tiktokUrl.trim() !== '') {
    let platformScore = 12; // Basis 60% = 12 Punkte (erhöht von 10)
    const followers = parseInt(manualData.tiktokFollowers || '0');
    
    // Follower-Bewertung: Niedrigere Schwellen, max 6 Punkte
    if (followers >= 50) {
      platformScore += 2.5; // für 50+ Follower
      
      // Zusätzliche Punkte für höhere Followerzahlen
      if (followers >= 5000) platformScore += 3.5;
      else if (followers >= 2000) platformScore += 2.5;
      else if (followers >= 1000) platformScore += 1.5;
      else if (followers >= 500) platformScore += 1;
    }
    
    // Video-Aktivität: Großzügigere Bewertung, max 2 Punkte
    if (manualData.tiktokLastPost) {
      const post = manualData.tiktokLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 2;
      else if (post.includes('2 tag') || post.includes('3 tag') || post.includes('4 tag') || post.includes('5 tag')) platformScore += 1.8;
      else if (post.includes('6 tag') || post.includes('7 tag') || post.includes('1 woche')) platformScore += 1.5;
      else if (post.includes('2 woche') || post.includes('3 woche')) platformScore += 1.2;
      else if (post.includes('4 woche') || post.includes('1 monat')) platformScore += 1;
      else if (post.includes('monat')) platformScore += 0.5;
    }
    
    totalScore += Math.min(20, platformScore);
  }
  
  // Bonus für mehrere Plattformen
  let platformCount = 0;
  if (manualData?.facebookUrl && manualData.facebookUrl.trim() !== '') platformCount++;
  if (manualData?.instagramUrl && manualData.instagramUrl.trim() !== '') platformCount++;
  if (manualData?.linkedinUrl && manualData.linkedinUrl.trim() !== '') platformCount++;
  if (manualData?.twitterUrl && manualData.twitterUrl.trim() !== '') platformCount++;
  if (manualData?.youtubeUrl && manualData.youtubeUrl.trim() !== '') platformCount++;
  if (manualData?.tiktokUrl && manualData.tiktokUrl.trim() !== '') platformCount++;
  
  // Plattform-Bonus: 2 Plattformen = +10%, 3+ Plattformen = +25%
  let platformBonus = 0;
  if (platformCount >= 3) {
    platformBonus = totalScore * 0.25; // 25% Bonus für 3+ Plattformen
  } else if (platformCount === 2) {
    platformBonus = totalScore * 0.10; // 10% Bonus für 2 Plattformen
  }
  
  const finalScore = totalScore + platformBonus;
  
  // Normalisierung auf 100 Punkte - großzügigere Bewertung für aktive Social Media Präsenz
  const normalizedScore = Math.round((finalScore / 120) * 100); // Reduziert von 187.5 auf 120 für großzügigere Bewertung
  
  console.log(`Social Media Score: ${normalizedScore}/100 (${finalScore}/187.5 Rohpunkte, ${platformCount} Plattformen)`);
  
  return Math.min(100, normalizedScore);
};