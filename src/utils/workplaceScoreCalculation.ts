import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualWorkplaceData } from '@/hooks/useManualData';

export const calculateWorkplaceScore = (
  realData: RealBusinessData,
  manualWorkplaceData?: ManualWorkplaceData | null
): number => {
  let score = 0;
  const maxPoints = 100;
  let platformsWithData = 0;

  // Kununu-Bewertung prüfen
  let kununuFound = false;
  let kununuRating = '';
  let kununuReviews = '';

  if (manualWorkplaceData?.disableAutoKununu) {
    // Auto-Kununu ist deaktiviert - nur manuelle Daten verwenden wenn vorhanden
    if (manualWorkplaceData.kununuRating !== '' || manualWorkplaceData.kununuReviews !== '') {
      kununuFound = manualWorkplaceData.kununuFound;
      kununuRating = manualWorkplaceData.kununuRating;
      kununuReviews = manualWorkplaceData.kununuReviews;
    }
    // Wenn keine manuellen Daten: kununuFound bleibt false
  } else if (manualWorkplaceData && (manualWorkplaceData.kununuFound || manualWorkplaceData.kununuRating !== '')) {
    // Manuelle Daten vorhanden, Auto nicht deaktiviert
    kununuFound = manualWorkplaceData.kununuFound || realData.workplace?.kununu?.found || false;
    kununuRating = manualWorkplaceData.kununuRating || (realData.workplace?.kununu?.rating || 0).toString();
    kununuReviews = manualWorkplaceData.kununuReviews || (realData.workplace?.kununu?.reviews || 0).toString();
  } else {
    // Nur automatische Daten
    kununuFound = realData.workplace?.kununu?.found || false;
    kununuRating = (realData.workplace?.kununu?.rating || 0).toString();
    kununuReviews = (realData.workplace?.kununu?.reviews || 0).toString();
  }

  if (kununuFound) {
    platformsWithData++;
    const rating = parseFloat(kununuRating);
    const reviews = parseInt(kununuReviews);
    
    if (!isNaN(rating) && rating > 0) {
      score += (rating / 5) * 25;
      
      if (reviews >= 50) score += 15;
      else if (reviews >= 20) score += 12;
      else if (reviews >= 10) score += 8;
      else if (reviews >= 5) score += 5;
      else if (reviews >= 1) score += 2;
    }
  }

  // Glassdoor-Bewertung prüfen
  let glassdoorFound = false;
  let glassdoorRating = '';
  let glassdoorReviews = '';

  if (manualWorkplaceData?.disableAutoGlassdoor) {
    // Auto-Glassdoor ist deaktiviert - nur manuelle Daten verwenden wenn vorhanden
    if (manualWorkplaceData.glassdoorRating !== '' || manualWorkplaceData.glassdoorReviews !== '') {
      glassdoorFound = manualWorkplaceData.glassdoorFound;
      glassdoorRating = manualWorkplaceData.glassdoorRating;
      glassdoorReviews = manualWorkplaceData.glassdoorReviews;
    }
    // Wenn keine manuellen Daten: glassdoorFound bleibt false
  } else if (manualWorkplaceData && (manualWorkplaceData.glassdoorFound || manualWorkplaceData.glassdoorRating !== '')) {
    // Manuelle Daten vorhanden, Auto nicht deaktiviert
    glassdoorFound = manualWorkplaceData.glassdoorFound || realData.workplace?.glassdoor?.found || false;
    glassdoorRating = manualWorkplaceData.glassdoorRating || (realData.workplace?.glassdoor?.rating || 0).toString();
    glassdoorReviews = manualWorkplaceData.glassdoorReviews || (realData.workplace?.glassdoor?.reviews || 0).toString();
  } else {
    // Nur automatische Daten
    glassdoorFound = realData.workplace?.glassdoor?.found || false;
    glassdoorRating = (realData.workplace?.glassdoor?.rating || 0).toString();
    glassdoorReviews = (realData.workplace?.glassdoor?.reviews || 0).toString();
  }

  if (glassdoorFound) {
    platformsWithData++;
    const rating = parseFloat(glassdoorRating);
    const reviews = parseInt(glassdoorReviews);
    
    if (!isNaN(rating) && rating > 0) {
      score += (rating / 5) * 25;
      
      if (reviews >= 50) score += 15;
      else if (reviews >= 20) score += 12;
      else if (reviews >= 10) score += 8;
      else if (reviews >= 5) score += 5;
      else if (reviews >= 1) score += 2;
    }
  }

  // Platform presence bonus
  if (platformsWithData >= 2) {
    score += 20;
  } else if (platformsWithData === 1) {
    score += 10;
  }

  // Wenn keine Plattformen Daten haben, -1 zurückgeben für "—" Anzeige
  if (platformsWithData === 0) {
    return -1;
  }

  return Math.min(score, maxPoints);
};