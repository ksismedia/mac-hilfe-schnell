import { ManualSocialData } from '@/hooks/useManualData';

export const calculateSimpleSocialScore = (manualData?: ManualSocialData | null): number => {
  if (!manualData) return 0;
  
  let totalScore = 0;
  
  // Facebook (max 30 Punkte) - Neue Bewertungslogik: 50% + 20% für 100+ Follower + 15% für Aktualität + 15% für sehr hohe Followerzahlen
  if (manualData.facebookUrl && manualData.facebookUrl.trim() !== '') {
    let platformScore = 15; // Basis 50% = 15 Punkte
    const followers = parseInt(manualData.facebookFollowers || '0');
    
    // Follower-Bewertung: +20% für 100+ Follower, weitere +15% für hohe Zahlen
    if (followers >= 100) {
      platformScore += 6; // +20% = 6 Punkte (70% erreicht)
      
      // Zusätzliche Punkte für sehr hohe Followerzahlen (max +9 Punkte = 15%)
      if (followers >= 5000) platformScore += 9;
      else if (followers >= 2000) platformScore += 7;
      else if (followers >= 1000) platformScore += 5;
      else if (followers >= 500) platformScore += 3;
    }
    
    // Post-Aktivität: +15% für aktuelle Posts = max 4.5 Punkte
    if (manualData.facebookLastPost) {
      const post = manualData.facebookLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 4.5;
      else if (post.includes('2 tag') || post.includes('3 tag') || post.includes('4 tag') || post.includes('5 tag')) platformScore += 3;
      else if (post.includes('6 tag') || post.includes('7 tag') || post.includes('1 woche')) platformScore += 2;
      else if (post.includes('woche')) platformScore += 1.5;
      else if (post.includes('monat')) platformScore += 0.5;
    }
    
    totalScore += Math.min(30, platformScore);
  }
  
  // Instagram (max 30 Punkte) - Neue Bewertungslogik: 50% + 20% für 100+ Follower + 15% für Aktualität + 15% für sehr hohe Followerzahlen
  if (manualData.instagramUrl && manualData.instagramUrl.trim() !== '') {
    let platformScore = 15; // Basis 50% = 15 Punkte
    const followers = parseInt(manualData.instagramFollowers || '0');
    
    // Follower-Bewertung: +20% für 100+ Follower, weitere +15% für hohe Zahlen
    if (followers >= 100) {
      platformScore += 6; // +20% = 6 Punkte (70% erreicht)
      
      // Zusätzliche Punkte für sehr hohe Followerzahlen (max +9 Punkte = 15%)
      if (followers >= 5000) platformScore += 9;
      else if (followers >= 2000) platformScore += 7;
      else if (followers >= 1000) platformScore += 5;
      else if (followers >= 500) platformScore += 3;
    }
    
    // Post-Aktivität: +15% für aktuelle Posts = max 4.5 Punkte
    if (manualData.instagramLastPost) {
      const post = manualData.instagramLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 4.5;
      else if (post.includes('2 tag') || post.includes('3 tag') || post.includes('4 tag') || post.includes('5 tag')) platformScore += 3;
      else if (post.includes('6 tag') || post.includes('7 tag') || post.includes('1 woche')) platformScore += 2;
      else if (post.includes('woche')) platformScore += 1.5;
      else if (post.includes('monat')) platformScore += 0.5;
    }
    
    totalScore += Math.min(30, platformScore);
  }
  
  // LinkedIn (max 30 Punkte) - Ursprüngliche Bewertungslogik beibehalten
  if (manualData.linkedinUrl && manualData.linkedinUrl.trim() !== '') {
    let platformScore = 15; // Basis für Präsenz
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
  
  // YouTube (max 20 Punkte) - Neue Bewertungslogik: 50% + 20% für 100+ Abonnenten + 15% für Aktualität + 15% für hohe Zahlen
  if (manualData.youtubeUrl && manualData.youtubeUrl.trim() !== '') {
    let platformScore = 10; // Basis 50% = 10 Punkte
    const subscribers = parseInt(manualData.youtubeSubscribers || '0');
    
    // Abonnenten-Bewertung: +20% für 100+ Abonnenten, weitere +15% für hohe Zahlen
    if (subscribers >= 100) {
      platformScore += 4; // +20% = 4 Punkte (70% erreicht)
      
      // Zusätzliche Punkte für sehr hohe Abonnentenzahlen (max +6 Punkte = 15%)
      if (subscribers >= 2000) platformScore += 6;
      else if (subscribers >= 1000) platformScore += 4;
      else if (subscribers >= 500) platformScore += 2;
    }
    
    // Video-Aktivität: +15% für aktuelle Videos = max 3 Punkte
    if (manualData.youtubeLastPost) {
      const post = manualData.youtubeLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 3;
      else if (post.includes('2 tag') || post.includes('3 tag') || post.includes('4 tag') || post.includes('5 tag')) platformScore += 2;
      else if (post.includes('6 tag') || post.includes('7 tag') || post.includes('1 woche')) platformScore += 1.5;
      else if (post.includes('woche')) platformScore += 1;
    }
    
    totalScore += Math.min(20, platformScore);
  }
  
  // TikTok (max 20 Punkte) - Neue Bewertungslogik: 50% + 20% für 100+ Follower + 15% für Aktualität + 15% für hohe Zahlen
  if (manualData.tiktokUrl && manualData.tiktokUrl.trim() !== '') {
    let platformScore = 10; // Basis 50% = 10 Punkte
    const followers = parseInt(manualData.tiktokFollowers || '0');
    
    // Follower-Bewertung: +20% für 100+ Follower, weitere +15% für hohe Zahlen
    if (followers >= 100) {
      platformScore += 4; // +20% = 4 Punkte (70% erreicht)
      
      // Zusätzliche Punkte für sehr hohe Followerzahlen (max +6 Punkte = 15%)
      if (followers >= 5000) platformScore += 6;
      else if (followers >= 2000) platformScore += 4;
      else if (followers >= 1000) platformScore += 3;
      else if (followers >= 500) platformScore += 2;
    }
    
    // Video-Aktivität: +15% für aktuelle Videos = max 3 Punkte
    if (manualData.tiktokLastPost) {
      const post = manualData.tiktokLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 3;
      else if (post.includes('2 tag') || post.includes('3 tag') || post.includes('4 tag') || post.includes('5 tag')) platformScore += 2;
      else if (post.includes('6 tag') || post.includes('7 tag') || post.includes('1 woche')) platformScore += 1.5;
      else if (post.includes('woche')) platformScore += 1;
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
  
  // Normalisierung auf 100 Punkte (Gesamtmaximum mit Bonus: ca. 187.5 Punkte)
  const normalizedScore = Math.round((finalScore / 187.5) * 100);
  
  console.log(`Social Media Score: ${normalizedScore}/100 (${finalScore}/187.5 Rohpunkte, ${platformCount} Plattformen)`);
  
  return Math.min(100, normalizedScore);
};