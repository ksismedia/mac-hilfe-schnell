import { ManualSocialData } from '@/hooks/useManualData';

export const calculateSimpleSocialScore = (manualData?: ManualSocialData | null): number => {
  if (!manualData) return 0;
  
  let totalScore = 0;
  
  // Facebook (max 30 Punkte)
  if (manualData.facebookUrl && manualData.facebookUrl.trim() !== '') {
    let platformScore = 10; // Basis für Präsenz
    const followers = parseInt(manualData.facebookFollowers || '0');
    
    // Follower-Bewertung (max 15 Punkte)
    if (followers >= 10000) platformScore += 15;
    else if (followers >= 5000) platformScore += 12;
    else if (followers >= 2000) platformScore += 10;
    else if (followers >= 1000) platformScore += 8;
    else if (followers >= 500) platformScore += 6;
    else if (followers >= 100) platformScore += 4;
    else if (followers >= 50) platformScore += 2;
    else if (followers >= 10) platformScore += 1;
    
    // Post-Aktivität (max 5 Punkte)
    if (manualData.facebookLastPost) {
      const post = manualData.facebookLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 5;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 4;
      else if (post.includes('woche')) platformScore += 3;
      else if (post.includes('monat')) platformScore += 1;
    }
    
    totalScore += Math.min(30, platformScore);
  }
  
  // Instagram (max 30 Punkte)
  if (manualData.instagramUrl && manualData.instagramUrl.trim() !== '') {
    let platformScore = 10; // Basis für Präsenz
    const followers = parseInt(manualData.instagramFollowers || '0');
    
    // Follower-Bewertung (max 15 Punkte)
    if (followers >= 10000) platformScore += 15;
    else if (followers >= 5000) platformScore += 12;
    else if (followers >= 2000) platformScore += 10;
    else if (followers >= 1000) platformScore += 8;
    else if (followers >= 500) platformScore += 6;
    else if (followers >= 100) platformScore += 4;
    else if (followers >= 50) platformScore += 2;
    else if (followers >= 10) platformScore += 1;
    
    // Post-Aktivität (max 5 Punkte)
    if (manualData.instagramLastPost) {
      const post = manualData.instagramLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 5;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 4;
      else if (post.includes('woche')) platformScore += 3;
      else if (post.includes('monat')) platformScore += 1;
    }
    
    totalScore += Math.min(30, platformScore);
  }
  
  // LinkedIn (max 30 Punkte)
  if (manualData.linkedinUrl && manualData.linkedinUrl.trim() !== '') {
    let platformScore = 10; // Basis für Präsenz
    const followers = parseInt(manualData.linkedinFollowers || '0');
    
    // Follower-Bewertung (max 15 Punkte)
    if (followers >= 5000) platformScore += 15;
    else if (followers >= 2000) platformScore += 12;
    else if (followers >= 1000) platformScore += 10;
    else if (followers >= 500) platformScore += 8;
    else if (followers >= 200) platformScore += 6;
    else if (followers >= 100) platformScore += 4;
    else if (followers >= 50) platformScore += 2;
    else if (followers >= 10) platformScore += 1;
    
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
  
  // Twitter (max 20 Punkte)
  if (manualData.twitterUrl && manualData.twitterUrl.trim() !== '') {
    let platformScore = 5; // Basis für Präsenz
    const followers = parseInt(manualData.twitterFollowers || '0');
    
    // Follower-Bewertung (max 12 Punkte)
    if (followers >= 10000) platformScore += 12;
    else if (followers >= 5000) platformScore += 10;
    else if (followers >= 2000) platformScore += 8;
    else if (followers >= 1000) platformScore += 6;
    else if (followers >= 500) platformScore += 4;
    else if (followers >= 100) platformScore += 3;
    else if (followers >= 50) platformScore += 2;
    else if (followers >= 10) platformScore += 1;
    
    // Post-Aktivität (max 3 Punkte)
    if (manualData.twitterLastPost) {
      const post = manualData.twitterLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 3;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 2;
      else if (post.includes('woche')) platformScore += 1;
    }
    
    totalScore += Math.min(20, platformScore);
  }
  
  // YouTube (max 20 Punkte)
  if (manualData.youtubeUrl && manualData.youtubeUrl.trim() !== '') {
    let platformScore = 5; // Basis für Präsenz
    const subscribers = parseInt(manualData.youtubeSubscribers || '0');
    
    // Abonnenten-Bewertung (max 12 Punkte)
    if (subscribers >= 5000) platformScore += 12;
    else if (subscribers >= 2000) platformScore += 10;
    else if (subscribers >= 1000) platformScore += 8;
    else if (subscribers >= 500) platformScore += 6;
    else if (subscribers >= 200) platformScore += 4;
    else if (subscribers >= 100) platformScore += 3;
    else if (subscribers >= 50) platformScore += 2;
    else if (subscribers >= 10) platformScore += 1;
    
    // Video-Aktivität (max 3 Punkte)
    if (manualData.youtubeLastPost) {
      const post = manualData.youtubeLastPost.toLowerCase();
      if (post.includes('heute') || post.includes('1 tag')) platformScore += 3;
      else if (post.includes('2 tag') || post.includes('3 tag')) platformScore += 2;
      else if (post.includes('woche')) platformScore += 1;
    }
    
    totalScore += Math.min(20, platformScore);
  }
  
  // Normalisierung auf 100 Punkte (Gesamtmaximum: 130 Punkte)
  const normalizedScore = Math.round((totalScore / 130) * 100);
  
  console.log(`Social Media Score: ${normalizedScore}/100 (${totalScore}/130 Rohpunkte)`);
  
  return Math.min(100, normalizedScore);
};