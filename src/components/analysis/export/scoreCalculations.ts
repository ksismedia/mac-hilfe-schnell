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
  if (!lastPost || lastPost === 'Nicht gefunden' || lastPost === '') return 0;
  
  const lowerPost = lastPost.toLowerCase();
  if (lowerPost.includes('heute') || lowerPost.includes('1 tag')) return 30;
  if (lowerPost.includes('2') || lowerPost.includes('3') || lowerPost.includes('tag')) return 25;
  if (lowerPost.includes('woche')) return 20;
  if (lowerPost.includes('monat')) return 12;
  return 8; // Älter als ein Monat
};

// KOMPLETT ÜBERARBEITETE Social Media Score Berechnung - NUR MANUELLE DATEN
export const calculateSocialMediaScore = (realData: RealBusinessData, manualSocialData?: ManualSocialData | null) => {
  console.log('=== SOCIAL MEDIA SCORE BERECHNUNG (NUR MANUELL) GESTARTET ===');
  console.log('Manual Data:', manualSocialData);
  
  let totalScore = 0;
  let activePlatforms = 0;
  
  // Prüfe ob überhaupt manuelle Daten vorhanden sind
  if (!manualSocialData) {
    console.log('Keine manuellen Daten -> Score: 0');
    return 0;
  }
  
  console.log('=== BEWERTE NUR MANUELLE EINGABEN ===');
  
  // FACEBOOK - nur wenn URL eingegeben
  if (manualSocialData.facebookUrl && manualSocialData.facebookUrl.trim() !== '') {
    let score = 50; // Basis für Präsenz
    const followers = parseInt(manualSocialData.facebookFollowers || '0');
    
    // Follower Bewertung
    if (followers >= 1000) score += 30;
    else if (followers >= 500) score += 25;
    else if (followers >= 100) score += 20;
    else if (followers >= 50) score += 15;
    else if (followers >= 10) score += 10;
    
    // Post Aktivität
    score += getLastPostScore(manualSocialData.facebookLastPost || '');
    
    const facebookScore = Math.min(100, score);
    totalScore += facebookScore;
    activePlatforms++;
    console.log(`Facebook: ${facebookScore} Punkte (${followers} Follower, Post: ${manualSocialData.facebookLastPost})`);
  }
  
  // INSTAGRAM - nur wenn URL eingegeben
  if (manualSocialData.instagramUrl && manualSocialData.instagramUrl.trim() !== '') {
    let score = 50;
    const followers = parseInt(manualSocialData.instagramFollowers || '0');
    
    // Instagram hat höhere Follower-Standards
    if (followers >= 2000) score += 30;
    else if (followers >= 1000) score += 25;
    else if (followers >= 500) score += 20;
    else if (followers >= 100) score += 15;
    else if (followers >= 50) score += 10;
    
    score += getLastPostScore(manualSocialData.instagramLastPost || '');
    
    const instagramScore = Math.min(100, score);
    totalScore += instagramScore;
    activePlatforms++;
    console.log(`Instagram: ${instagramScore} Punkte (${followers} Follower, Post: ${manualSocialData.instagramLastPost})`);
  }
  
  // LINKEDIN - nur wenn URL eingegeben
  if (manualSocialData.linkedinUrl && manualSocialData.linkedinUrl.trim() !== '') {
    let score = 50;
    const followers = parseInt(manualSocialData.linkedinFollowers || '0');
    
    // LinkedIn hat niedrigere Standards
    if (followers >= 500) score += 30;
    else if (followers >= 200) score += 25;
    else if (followers >= 100) score += 20;
    else if (followers >= 50) score += 15;
    else if (followers >= 10) score += 10;
    
    score += getLastPostScore(manualSocialData.linkedinLastPost || '');
    
    const linkedinScore = Math.min(100, score);
    totalScore += linkedinScore;
    activePlatforms++;
    console.log(`LinkedIn: ${linkedinScore} Punkte (${followers} Follower, Post: ${manualSocialData.linkedinLastPost})`);
  }
  
  // TWITTER - nur wenn URL eingegeben
  if (manualSocialData.twitterUrl && manualSocialData.twitterUrl.trim() !== '') {
    let score = 50;
    const followers = parseInt(manualSocialData.twitterFollowers || '0');
    
    if (followers >= 1000) score += 30;
    else if (followers >= 500) score += 25;
    else if (followers >= 100) score += 20;
    else if (followers >= 50) score += 15;
    else if (followers >= 10) score += 10;
    
    score += getLastPostScore(manualSocialData.twitterLastPost || '');
    
    const twitterScore = Math.min(100, score);
    totalScore += twitterScore;
    activePlatforms++;
    console.log(`Twitter: ${twitterScore} Punkte (${followers} Follower, Post: ${manualSocialData.twitterLastPost})`);
  }
  
  // YOUTUBE - nur wenn URL eingegeben
  if (manualSocialData.youtubeUrl && manualSocialData.youtubeUrl.trim() !== '') {
    let score = 50;
    const subscribers = parseInt(manualSocialData.youtubeSubscribers || '0');
    
    // YouTube hat niedrigere Standards
    if (subscribers >= 500) score += 30;
    else if (subscribers >= 100) score += 25;
    else if (subscribers >= 50) score += 20;
    else if (subscribers >= 10) score += 15;
    else if (subscribers >= 1) score += 10;
    
    score += getLastPostScore(manualSocialData.youtubeLastPost || '');
    
    const youtubeScore = Math.min(100, score);
    totalScore += youtubeScore;
    activePlatforms++;
    console.log(`YouTube: ${youtubeScore} Punkte (${subscribers} Subscriber, Video: ${manualSocialData.youtubeLastPost})`);
  }
  
  // FINALE BERECHNUNG
  let finalScore = 0;
  
  if (activePlatforms === 0) {
    finalScore = 0;
    console.log('Keine manuell eingegebenen Plattformen -> Score: 0');
  } else {
    // Durchschnitt aller manuell eingegebenen Plattformen
    const averageScore = totalScore / activePlatforms;
    console.log(`Durchschnittsscore: ${averageScore} (${totalScore} / ${activePlatforms})`);
    
    // Multi-Platform Bonus für Diversität
    let diversityBonus = 0;
    if (activePlatforms >= 5) diversityBonus = 15;      // Alle 5 Plattformen
    else if (activePlatforms >= 4) diversityBonus = 12; // 4 Plattformen
    else if (activePlatforms >= 3) diversityBonus = 8;  // 3 Plattformen
    else if (activePlatforms >= 2) diversityBonus = 5;  // 2 Plattformen
    
    console.log(`Diversitäts-Bonus: ${diversityBonus} für ${activePlatforms} manuell eingegebene Plattformen`);
    
    finalScore = Math.min(100, Math.round(averageScore + diversityBonus));
  }
  
  console.log('=== FINALES ERGEBNIS (NUR MANUELL) ===');
  console.log(`Manuell eingegebene Plattformen: ${activePlatforms}`);
  console.log(`Gesamt-Score: ${totalScore}`);
  console.log(`Durchschnitt: ${activePlatforms > 0 ? (totalScore / activePlatforms).toFixed(1) : 0}`);
  console.log(`Diversitäts-Bonus: ${activePlatforms >= 5 ? 15 : activePlatforms >= 4 ? 12 : activePlatforms >= 3 ? 8 : activePlatforms >= 2 ? 5 : 0}`);
  console.log(`FINALER SOCIAL MEDIA SCORE (NUR MANUELL): ${finalScore}`);
  console.log('=== BERECHNUNG BEENDET ===');
  
  return finalScore;
};

// Berechnung für Content-Qualität Score
export const calculateContentQualityScore = (realData: RealBusinessData, manualKeywordData?: any, businessData?: any) => {
  let totalScore = 0;
  let metrics = 0;

  // Keyword-Analyse (40% Gewichtung)
  if (manualKeywordData || realData.keywords) {
    const keywords = manualKeywordData || realData.keywords;
    const keywordScore = (keywords.filter((k: any) => k.found).length / keywords.length) * 100;
    totalScore += keywordScore * 0.4;
    metrics++;
  }

  // Textqualität basierend auf SEO-Score (30% Gewichtung)
  const readabilityScore = Math.max(60, realData.seo.score);
  totalScore += readabilityScore * 0.3;
  metrics++;

  // Struktur-Score (20% Gewichtung)
  const structureScore = realData.seo.headings.h1.length > 0 ? 90 : 30;
  totalScore += structureScore * 0.2;
  metrics++;

  // Aktualität (10% Gewichtung)
  const freshnessScore = 60; // Standardwert, da schwer automatisch zu ermitteln
  totalScore += freshnessScore * 0.1;
  
  return Math.round(totalScore);
};

// Berechnung für Backlinks Score
export const calculateBacklinksScore = (realData: RealBusinessData) => {
  // Basis-Score aus SEO-Daten ableiten
  let baseScore = realData.seo.score;
  
  // Adjustierung basierend auf Domain-Stärke Indikatoren
  // Wenn Meta-Description vorhanden, deutet auf bessere SEO-Pflege hin
  if (realData.seo.metaDescription) baseScore += 10;
  
  // Wenn strukturierte Daten vorhanden (H1, H2 Tags)
  if (realData.seo.headings.h1.length > 0 && realData.seo.headings.h2.length > 0) {
    baseScore += 5;
  }
  
  // Cap at 100 und Minimum 30 für realistische Bewertung
  return Math.min(100, Math.max(30, Math.round(baseScore * 0.7))); // Leicht reduziert da Backlinks oft schwächer sind
};

// Berechnung für Accessibility Score - SEHR STRENGE BEWERTUNG
export const calculateAccessibilityScore = (realData: RealBusinessData) => {
  console.log('=== ACCESSIBILITY SCORE BERECHNUNG GESTARTET (SEHR STRENG) ===');
  
  // VIEL STRENGERE BEWERTUNG - Rechtliche Compliance hat Priorität
  let complianceScore = 45; // Deutlich niedrigerer Startwert
  
  // Simuliere Violation-Detektion basierend auf SEO-Qualität
  const hasImageAltIssues = !realData.seo.metaDescription || realData.seo.metaDescription.length < 50;
  const hasHeadingIssues = realData.seo.headings.h1.length === 0 || realData.seo.headings.h2.length === 0;
  const hasContrastIssues = realData.seo.score < 60; // Indikator für schlechte Webqualität
  
  // SEHR STRENGE BEWERTUNG - Jeder Verstoß führt zu drastischen Abzügen
  if (hasImageAltIssues) {
    complianceScore -= 25; // Fehlende Alt-Texte = kritischer Verstoß
    console.log('Kritischer Verstoß: Fehlende/schlechte Alt-Texte -> -25');
  }
  
  if (hasHeadingIssues) {
    complianceScore -= 20; // Schlechte Heading-Struktur
    console.log('Kritischer Verstoß: Schlechte Heading-Struktur -> -20');
  }
  
  if (hasContrastIssues) {
    complianceScore -= 25; // Kontrast-Probleme
    console.log('Kritischer Verstoß: Potentielle Kontrast-Probleme -> -25');
  }
  
  // Zusätzliche Abzüge für schlechte allgemeine Webqualität
  if (realData.seo.score < 40) {
    complianceScore -= 15; // Sehr schlechte Webqualität
    console.log('Zusätzlicher Abzug: Sehr schlechte Webqualität -> -15');
  }
  
  // Weitere Abzüge für fehlende SEO-Grundlagen
  if (!realData.seo.titleTag || realData.seo.titleTag.length < 30) {
    complianceScore -= 10; // Schlechter Titel deutet auf schlechte Barrierefreiheit hin
    console.log('Zusätzlicher Abzug: Schlechter/fehlender Titel -> -10');
  }
  
  // Finaler Score - minimum 0, maximum 100
  const finalScore = Math.max(0, Math.min(100, complianceScore));
  
  console.log('=== ACCESSIBILITY SCORE ERGEBNIS (SEHR STRENG) ===');
  console.log(`Startwert: 45`);
  console.log(`Compliance-Score: ${complianceScore}`);
  console.log(`Finaler Score: ${finalScore}`);
  console.log(`Rechtliche Compliance: ${finalScore >= 80 ? 'ERFÜLLT' : finalScore >= 60 ? 'TEILWEISE' : 'NICHT ERFÜLLT'}`);
  console.log('=== BERECHNUNG BEENDET ===');
  
  return finalScore;
};

export const calculateOverallScore = (
  seoScore: number,
  performanceScore: number,
  mobileScore: number,
  socialMediaScore: number,
  impressumScore: number,
  hourlyRateScore: number,
  dataPrivacyScore: number = 75
) => {
  const overallScore = Math.round(
    (seoScore + performanceScore + mobileScore + socialMediaScore + impressumScore + hourlyRateScore + dataPrivacyScore) / 7
  );
  console.log('Overall score calculation:', {
    seo: seoScore,
    performance: performanceScore,
    mobile: mobileScore,
    socialMedia: socialMediaScore,
    impressum: impressumScore,
    hourlyRate: hourlyRateScore,
    dataPrivacy: dataPrivacyScore,
    overall: overallScore
  });
  return overallScore;
};
