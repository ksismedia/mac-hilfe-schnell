import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, ManualCorporateIdentityData, QuoteResponseData } from '@/hooks/useManualData';

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

export const calculateCorporateIdentityScore = (manualCorporateIdentityData?: ManualCorporateIdentityData | null): number => {
  if (!manualCorporateIdentityData) {
    return 50; // Default neutral score when not assessed
  }
  
  const checks = [
    manualCorporateIdentityData.uniformLogo,
    manualCorporateIdentityData.uniformWorkClothing,
    manualCorporateIdentityData.uniformVehicleBranding,
    manualCorporateIdentityData.uniformColorScheme
  ];
  
  const score = (checks.filter(Boolean).length / checks.length) * 100;
  return Math.round(score);
};

// Calculate Staff Qualification Score
export const calculateStaffQualificationScore = (staffData?: any): number => {
  if (!staffData) return 50; // Default neutral score when not assessed
  
  let score = 0;
  const totalEmployees = staffData.totalEmployees || 1;
  
  // Qualifikationsgrad (40% der Bewertung)
  const qualifiedStaff = staffData.skilled_workers + staffData.masters;
  const qualificationRatio = qualifiedStaff / totalEmployees;
  score += qualificationRatio * 40;
  
  // Meister-Quote (20% der Bewertung)
  const masterRatio = staffData.masters / totalEmployees;
  score += masterRatio * 20;
  
  // Zertifizierungen (25% der Bewertung)
  const certCount = Object.values(staffData.certifications || {}).filter(Boolean).length;
  score += (certCount / 6) * 25;
  
  // Branchenspezifische Qualifikationen (15% der Bewertung)
  const industrySpecificCount = (staffData.industry_specific || []).length;
  const maxIndustrySpecific = 6; // Durchschnittliche Anzahl pro Branche
  score += (industrySpecificCount / maxIndustrySpecific) * 15;
  
  return Math.round(Math.min(100, score));
};

export const calculateQuoteResponseScore = (quoteResponseData?: QuoteResponseData | null) => {
  console.log('=== QUOTE RESPONSE SCORE BERECHNUNG GESTARTET ===');
  console.log('Quote Response Data:', quoteResponseData);
  
  if (!quoteResponseData) {
    console.log('Keine Quote Response Daten -> Score: 50 (Standard)');
    return 50;
  }
  
  let score = 0;
  
  // Reaktionszeit (40% der Bewertung)
  switch (quoteResponseData.responseTime) {
    case '1-hour': score += 40; break;
    case '2-4-hours': score += 35; break;
    case '4-8-hours': score += 30; break;
    case '1-day': score += 20; break;
    case '2-3-days': score += 10; break;
    case 'over-3-days': score += 5; break;
    default: score += 0; break;
  }
  
  // Kontaktmöglichkeiten (20% der Bewertung)
  const contactCount = Object.values(quoteResponseData.contactMethods).filter(Boolean).length;
  score += Math.min(20, contactCount * 4);
  
  // Antwortqualität (20% der Bewertung)
  switch (quoteResponseData.responseQuality) {
    case 'excellent': score += 20; break;
    case 'good': score += 15; break;
    case 'average': score += 10; break;
    case 'poor': score += 5; break;
    default: score += 0; break;
  }
  
  // Service-Features (20% der Bewertung)
  if (quoteResponseData.automaticConfirmation) score += 5;
  if (quoteResponseData.followUpProcess) score += 5;
  if (quoteResponseData.personalContact) score += 5;
  
  // Erreichbarkeitszeiten
  switch (quoteResponseData.availabilityHours) {
    case '24-7': score += 5; break;
    case 'extended-hours': score += 3; break;
    case 'business-hours': score += 2; break;
    default: score += 0; break;
  }
  
  const finalScore = Math.round(Math.min(100, score));
  
  console.log('=== QUOTE RESPONSE SCORE ERGEBNIS ===');
  console.log(`Reaktionszeit: ${quoteResponseData.responseTime} -> Punkte basierend darauf`);
  console.log(`Kontaktmöglichkeiten: ${contactCount} -> ${Math.min(20, contactCount * 4)} Punkte`);
  console.log(`Antwortqualität: ${quoteResponseData.responseQuality} -> Punkte basierend darauf`);
  console.log(`Service-Features: ${[quoteResponseData.automaticConfirmation, quoteResponseData.followUpProcess, quoteResponseData.personalContact].filter(Boolean).length * 5} Punkte`);
  console.log(`FINALER QUOTE RESPONSE SCORE: ${finalScore}`);
  console.log('=== BERECHNUNG BEENDET ===');
  
  return finalScore;
};

// Neue Funktionen für Kategorie-Scores (jeweils maximal 100 Punkte)
export const calculateSEOContentScore = (
  realData: RealBusinessData, 
  keywordsScore: number | null,
  businessData?: any,
  privacyData?: any,
  accessibilityData?: any
): number => {
  const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
  const defaultKeywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;
  
  const seoScore = realData.seo.score;
  const localSEOScore = calculateLocalSEOScore(businessData, realData);
  const imprintScore = realData.imprint.score;
  const accessibilityScore = calculateAccessibilityScore(realData);
  const dataPrivacyScore = 75; // Default-Wert
  
  // Gewichtung innerhalb der Kategorie
  const weightedScore = 
    (seoScore * 25) +
    (currentKeywordsScore * 20) +
    (localSEOScore * 25) +
    (imprintScore * 15) +
    (accessibilityScore * 10) +
    (dataPrivacyScore * 5);
    
  return Math.round(weightedScore / 100);
};

export const calculatePerformanceMobileScore = (realData: RealBusinessData): number => {
  const performanceScore = realData.performance.score;
  const mobileScore = realData.mobile.overallScore;
  
  // 60% Performance, 40% Mobile
  const weightedScore = (performanceScore * 60) + (mobileScore * 40);
  return Math.round(weightedScore / 100);
};

export const calculateSocialMediaCategoryScore = (
  realData: RealBusinessData,
  manualSocialData?: ManualSocialData | null,
  manualWorkplaceData?: any
): number => {
  const socialMediaScore = calculateSocialMediaScore(realData, manualSocialData);
  const socialProofScore = realData.socialProof.overallScore;
  const reviewsScore = realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0;
  const workplaceScore = realData.workplace.overallScore;
  
  // Gewichtung: Social Media 40%, Reviews 35%, Social Proof 15%, Workplace 10%
  const weightedScore = 
    (socialMediaScore * 40) +
    (reviewsScore * 35) +
    (socialProofScore * 15) +
    (workplaceScore * 10);
    
  return Math.round(weightedScore / 100);
};

export const calculateStaffServiceScore = (
  staffData?: any,
  quoteResponseData?: QuoteResponseData | null,
  corporateIdentityData?: any,
  hourlyRateData?: { ownRate: number; regionAverage: number }
): number => {
  const staffQualificationScore = calculateStaffQualificationScore(staffData);
  const quoteScore = calculateQuoteResponseScore(quoteResponseData);
  const corporateScore = calculateCorporateIdentityScore(corporateIdentityData);
  const hourlyScore = calculateHourlyRateScore(hourlyRateData);
  
  // Nur bewerten wenn Daten vorhanden sind
  let totalWeight = 0;
  let weightedScore = 0;
  
  if (staffData) {
    weightedScore += staffQualificationScore * 35;
    totalWeight += 35;
  }
  
  if (quoteResponseData) {
    weightedScore += quoteScore * 30;
    totalWeight += 30;
  }
  
  if (corporateIdentityData) {
    weightedScore += corporateScore * 20;
    totalWeight += 20;
  }
  
  if (hourlyRateData) {
    weightedScore += hourlyScore * 15;
    totalWeight += 15;
  }
  
  return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
};

export const calculateOverallScore = (
  realData: RealBusinessData,
  keywordsScore: number | null,
  manualSocialData?: ManualSocialData | null,
  businessData?: any,
  staffData?: any,
  hourlyRateData?: { ownRate: number; regionAverage: number },
  quoteResponseData?: QuoteResponseData | null
): number => {
  const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
  const defaultKeywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;
  
  const seoScore = realData.seo.score;
  const performanceScore = realData.performance.score;
  const mobileScore = realData.mobile.overallScore;
  const localSEOScore = calculateLocalSEOScore(businessData, realData);
  const reviewsScore = realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0;
  const socialMediaScore = calculateSocialMediaScore(realData, manualSocialData);
  const socialProofScore = realData.socialProof.overallScore;
  const imprintScore = realData.imprint.score;
  const staffQualificationScore = calculateStaffQualificationScore(staffData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);
  const workplaceScore = realData.workplace.overallScore;
  const competitorScore = realData.competitors.length > 0 ? 80 : 60;

  // Neue Berechnung: Durchschnitt der 4 Hauptkategorien
  const seoContentScore = calculateSEOContentScore(realData, keywordsScore, businessData);
  const performanceMobileScore = calculatePerformanceMobileScore(realData);
  const socialMediaCategoryScore = calculateSocialMediaCategoryScore(realData, manualSocialData);
  const staffServiceScore = calculateStaffServiceScore(staffData, quoteResponseData);

  // Durchschnitt der 4 Kategorien
  let totalCategories = 0;
  let totalScore = 0;

  if (seoContentScore > 0) {
    totalScore += seoContentScore;
    totalCategories++;
  }
  
  if (performanceMobileScore > 0) {
    totalScore += performanceMobileScore;
    totalCategories++;
  }
  
  if (socialMediaCategoryScore > 0) {
    totalScore += socialMediaCategoryScore;
    totalCategories++;
  }
  
  if (staffServiceScore > 0) {
    totalScore += staffServiceScore;
    totalCategories++;
  }

  return totalCategories > 0 ? Math.round(totalScore / totalCategories) : 0;
};

// Berechnung für Local SEO Score - SEHR STRENGE BEWERTUNG für Handwerk
export const calculateLocalSEOScore = (businessData: any, realData: RealBusinessData) => {
  console.log('=== LOCAL SEO SCORE BERECHNUNG GESTARTET (SEHR STRENG) ===');
  
  let localScore = 20; // Sehr niedriger Startwert, da lokales SEO für Handwerk KRITISCH ist
  
  // Google My Business Simulation (40% Gewichtung - HÖCHSTE PRIORITÄT)
  const hasGoodSEO = realData.seo.score >= 70;
  const hasMetaDescription = realData.seo.metaDescription && realData.seo.metaDescription.length >= 100;
  const hasGoodHeadings = realData.seo.headings.h1.length > 0 && realData.seo.headings.h2.length >= 2;
  
  // Google My Business Score (40 Punkte möglich)
  let gmbScore = 0;
  if (hasGoodSEO) gmbScore += 15; // Grundlegende Web-Präsenz
  if (hasMetaDescription) gmbScore += 10; // Gute Meta-Beschreibungen deuten auf GMB-Pflege hin
  if (hasGoodHeadings) gmbScore += 8; // Strukturierte Inhalte
  if (realData.seo.titleTag && realData.seo.titleTag.includes(businessData.address?.split(',')[1]?.trim() || '')) {
    gmbScore += 7; // Lokale Keywords im Title
  }
  
  // NAP (Name, Address, Phone) Konsistenz (25% Gewichtung)
  let napScore = 0;
  if (businessData.address && businessData.address.length > 10) napScore += 8; // Vollständige Adresse vorhanden
  if (realData.seo.metaDescription && realData.seo.metaDescription.includes(businessData.address?.split(',')[1]?.trim() || '')) {
    napScore += 7; // Lokale Ortschaft in Meta-Description
  }
  if (realData.seo.score >= 80) napScore += 5; // Hohe SEO-Qualität deutet auf NAP-Konsistenz hin
  if (hasGoodHeadings) napScore += 5; // Strukturierte Daten wahrscheinlich
  
  // Lokale Citations und Verzeichnisse (20% Gewichtung)
  let citationScore = 0;
  if (realData.seo.score >= 60) citationScore += 6; // Basis-Verzeichnisse wahrscheinlich
  if (hasGoodSEO) citationScore += 6; // Bessere Verzeichnis-Präsenz bei guter SEO
  if (realData.performance.score >= 70) citationScore += 4; // Schnelle Website = professionellere Präsenz
  if (realData.reviews.google.count > 0) citationScore += 4; // Google Reviews vorhanden
  
  // Lokale Keywords und Content (15% Gewichtung)
  let localContentScore = 0;
  const industryKeywords = realData.keywords.filter(k => k.found).length;
  if (industryKeywords >= 3) localContentScore += 5; // Branchenkeywords gefunden
  if (industryKeywords >= 5) localContentScore += 3; // Viele Branchenkeywords
  if (realData.seo.metaDescription && realData.seo.metaDescription.length >= 120) {
    localContentScore += 4; // Ausführliche lokale Beschreibungen
  }
  if (realData.seo.headings.h2.length >= 3) localContentScore += 3; // Strukturierter lokaler Content
  
  // SEHR STRENGE BEWERTUNG - Jeder fehlende Aspekt führt zu drastischen Abzügen
  let penalties = 0;
  
  // Kritische Penalties für Handwerksbetriebe
  if (!hasGoodSEO) {
    penalties += 25; // Schlechte SEO = schlechte lokale Sichtbarkeit
    console.log('KRITISCHER ABZUG: Schlechte SEO-Grundlage -> -25');
  }
  
  if (realData.reviews.google.count === 0) {
    penalties += 20; // Keine Google Reviews = sehr schlecht für lokales SEO
    console.log('KRITISCHER ABZUG: Keine Google Reviews -> -20');
  }
  
  if (!hasMetaDescription) {
    penalties += 15; // Schlechte Meta-Descriptions = schlechte lokale Snippets
    console.log('KRITISCHER ABZUG: Schlechte/fehlende Meta-Description -> -15');
  }
  
  if (!hasGoodHeadings) {
    penalties += 15; // Schlechte Struktur = schlechte lokale Inhalte
    console.log('KRITISCHER ABZUG: Schlechte Heading-Struktur -> -15');
  }
  
  if (realData.performance.score < 50) {
    penalties += 10; // Schlechte Performance schadet lokaler Sichtbarkeit
    console.log('KRITISCHER ABZUG: Schlechte Performance -> -10');
  }
  
  // Finale Berechnung
  const rawScore = localScore + gmbScore + napScore + citationScore + localContentScore - penalties;
  const finalScore = Math.max(0, Math.min(100, rawScore));
  
  console.log('=== LOCAL SEO SCORE ERGEBNIS (SEHR STRENG) ===');
  console.log(`Startwert: ${localScore}`);
  console.log(`Google My Business: +${gmbScore} (von 40 möglich)`);
  console.log(`NAP Konsistenz: +${napScore} (von 25 möglich)`);
  console.log(`Citations: +${citationScore} (von 20 möglich)`);
  console.log(`Lokaler Content: +${localContentScore} (von 15 möglich)`);
  console.log(`Penalties: -${penalties}`);
  console.log(`Raw Score: ${rawScore}`);
  console.log(`FINALER LOCAL SEO SCORE: ${finalScore}`);
  console.log(`Lokale Sichtbarkeit: ${finalScore >= 80 ? 'EXZELLENT' : finalScore >= 60 ? 'GUT' : finalScore >= 40 ? 'AUSBAUFÄHIG' : 'KRITISCH'}`);
  console.log('=== BERECHNUNG BEENDET ===');
  
  return finalScore;
}
