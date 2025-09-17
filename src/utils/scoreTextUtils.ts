/**
 * Utility functions to convert numeric scores to text descriptions
 */

export const getScoreTextDescription = (
  score: number, 
  category: 'general' | 'hourlyRate' | 'accessibility' | 'privacy' | 'social' | 'workplace' | 'seo' | 'performance' | 'mobile' | 'content' | 'imprint' = 'general'
): string => {
  switch (category) {
    case 'hourlyRate':
      if (score === 30) return 'Ausbaufähig';
      if (score === 50) return 'Über Marktdurchschnitt';
      if (score === 70) return 'Marktgerecht';
      if (score === 85) return 'Wettbewerbsfähig';
      if (score === 100) return 'Sehr wettbewerbsfähig';
      break;
      
    case 'seo':
      if (score >= 90) return 'Hervorragend optimiert';
      if (score >= 75) return 'Gut optimiert';
      if (score >= 60) return 'Grundoptimierung vorhanden';
      if (score >= 40) return 'Verbesserungsbedarf';
      return 'Erhebliche Mängel';
      
    case 'performance':
      if (score >= 90) return 'Sehr schnell';
      if (score >= 75) return 'Schnell';
      if (score >= 60) return 'Akzeptabel';
      if (score >= 40) return 'Langsam';
      return 'Sehr langsam';
      
    case 'mobile':
      if (score >= 90) return 'Vollständig optimiert';
      if (score >= 75) return 'Gut optimiert';
      if (score >= 60) return 'Grundoptimierung';
      if (score >= 40) return 'Ausbaufähig';
      return 'Nicht mobiloptimiert';
      
    case 'content':
      if (score >= 90) return 'Hervorragender Content';
      if (score >= 75) return 'Guter Content';
      if (score >= 60) return 'Durchschnittlicher Content';
      if (score >= 40) return 'Ausbaufähiger Content';
      return 'Unzureichender Content';
      
    case 'imprint':
      if (score >= 90) return 'Vollständig';
      if (score >= 75) return 'Weitgehend vollständig';
      if (score >= 60) return 'Grunddaten vorhanden';
      if (score >= 40) return 'Unvollständig';
      return 'Erhebliche Mängel';
      
    case 'social':
      if (score >= 80) return 'Sehr aktiv';
      if (score >= 60) return 'Aktiv';
      if (score >= 40) return 'Mäßig aktiv';
      return 'Inaktiv';
      
    case 'workplace':
      if (score >= 70) return 'Sehr gute Bewertungen';
      if (score >= 50) return 'Gute Bewertungen';
      return 'Verbesserungsbedarf';
      
    case 'privacy':
      if (score >= 90) return 'DSGVO-konform';
      if (score >= 70) return 'Gute Compliance';
      if (score >= 50) return 'Verbesserungsbedarf';
      return 'Kritische Mängel';
      
    case 'accessibility':
      if (score >= 95) return 'Vollständig barrierefrei';
      if (score >= 80) return 'Gut zugänglich';
      if (score >= 60) return 'Grundlegende Barrierefreiheit';
      return 'Erhebliche Barrieren';
      
    case 'general':
    default:
      if (score >= 90) return 'Sehr gut';
      if (score >= 75) return 'Gut';
      if (score >= 60) return 'Befriedigend';
      if (score >= 40) return 'Ausbaufähig';
      return 'Mangelhaft';
  }
  
  // Fallback for specific hourly rate scores that don't match exact values
  if (category === 'hourlyRate') {
    if (score >= 85) return 'Sehr wettbewerbsfähig';
    if (score >= 70) return 'Wettbewerbsfähig';
    if (score >= 60) return 'Marktgerecht';
    if (score >= 40) return 'Über Marktdurchschnitt';
    return 'Ausbaufähig';
  }
  
  return score > 0 ? getScoreTextDescription(score, 'general') : '—';
};

export const getScoreVariant = (score: number): 'default' | 'secondary' | 'destructive' => {
  if (score >= 90) return 'secondary'; // gold/best
  if (score >= 61) return 'default'; // green/good  
  return 'destructive'; // red/poor
};