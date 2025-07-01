
import { ManualSocialData } from '@/hooks/useManualData';

export const calculateSimpleSocialScore = (manualData?: ManualSocialData | null): number => {
  if (!manualData) return 0;
  
  let score = 0;
  let activePlatforms = 0;
  
  // Facebook
  if (manualData.facebookUrl && manualData.facebookUrl.trim() !== '') {
    let platformScore = 20; // Basis für Präsenz
    const followers = parseInt(manualData.facebookFollowers || '0');
    if (followers >= 500) platformScore += 15;
    else if (followers >= 100) platformScore += 10;
    else if (followers >= 10) platformScore += 5;
    
    if (manualData.facebookLastPost && manualData.facebookLastPost.includes('Tag')) platformScore += 10;
    else if (manualData.facebookLastPost && manualData.facebookLastPost.includes('Woche')) platformScore += 5;
    
    score += Math.min(50, platformScore);
    activePlatforms++;
  }
  
  // Instagram
  if (manualData.instagramUrl && manualData.instagramUrl.trim() !== '') {
    let platformScore = 20;
    const followers = parseInt(manualData.instagramFollowers || '0');
    if (followers >= 500) platformScore += 15;
    else if (followers >= 100) platformScore += 10;
    else if (followers >= 10) platformScore += 5;
    
    if (manualData.instagramLastPost && manualData.instagramLastPost.includes('Tag')) platformScore += 10;
    else if (manualData.instagramLastPost && manualData.instagramLastPost.includes('Woche')) platformScore += 5;
    
    score += Math.min(50, platformScore);
    activePlatforms++;
  }
  
  // LinkedIn
  if (manualData.linkedinUrl && manualData.linkedinUrl.trim() !== '') {
    let platformScore = 20;
    const followers = parseInt(manualData.linkedinFollowers || '0');
    if (followers >= 200) platformScore += 15;
    else if (followers >= 50) platformScore += 10;
    else if (followers >= 10) platformScore += 5;
    
    if (manualData.linkedinLastPost && manualData.linkedinLastPost.includes('Tag')) platformScore += 10;
    else if (manualData.linkedinLastPost && manualData.linkedinLastPost.includes('Woche')) platformScore += 5;
    
    score += Math.min(50, platformScore);
    activePlatforms++;
  }
  
  // Twitter
  if (manualData.twitterUrl && manualData.twitterUrl.trim() !== '') {
    let platformScore = 20;
    const followers = parseInt(manualData.twitterFollowers || '0');
    if (followers >= 200) platformScore += 15;
    else if (followers >= 50) platformScore += 10;
    else if (followers >= 10) platformScore += 5;
    
    if (manualData.twitterLastPost && manualData.twitterLastPost.includes('Tag')) platformScore += 10;
    else if (manualData.twitterLastPost && manualData.twitterLastPost.includes('Woche')) platformScore += 5;
    
    score += Math.min(50, platformScore);
    activePlatforms++;
  }
  
  // YouTube
  if (manualData.youtubeUrl && manualData.youtubeUrl.trim() !== '') {
    let platformScore = 20;
    const subscribers = parseInt(manualData.youtubeSubscribers || '0');
    if (subscribers >= 100) platformScore += 15;
    else if (subscribers >= 25) platformScore += 10;
    else if (subscribers >= 5) platformScore += 5;
    
    if (manualData.youtubeLastPost && manualData.youtubeLastPost.includes('Tag')) platformScore += 10;
    else if (manualData.youtubeLastPost && manualData.youtubeLastPost.includes('Woche')) platformScore += 5;
    
    score += Math.min(50, platformScore);
    activePlatforms++;
  }
  
  if (activePlatforms === 0) return 0;
  
  // Durchschnitt + Bonus für mehrere Plattformen
  const averageScore = score / activePlatforms;
  const diversityBonus = activePlatforms >= 3 ? 10 : activePlatforms >= 2 ? 5 : 0;
  
  return Math.min(100, Math.round(averageScore + diversityBonus));
};
