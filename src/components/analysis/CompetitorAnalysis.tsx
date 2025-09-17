import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, TrendingUp, Star, Users, Award, Target, MapPin, X } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, CompetitorServices, CompanyServices } from '@/hooks/useManualData';
import CompanyServicesInput from './CompanyServicesInput';
import ManualCompetitorInput from './ManualCompetitorInput';

interface CompetitorAnalysisProps {
  address: string;
  industry: string;
  realData: RealBusinessData;
  manualCompetitors: ManualCompetitor[];
  competitorServices: CompetitorServices;
  removedMissingServices: string[];
  companyServices: CompanyServices;
  deletedCompetitors: Set<string>;
  onCompetitorsChange: (competitors: ManualCompetitor[]) => void;
  onCompetitorServicesChange: (name: string, services: string[]) => void;
  onRemovedMissingServicesChange: (service: string) => void;
  onCompanyServicesChange: (services: string[]) => void;
  onDeletedCompetitorChange: (competitorName: string) => void;
  onRestoreCompetitorChange: (competitorName: string) => void;
  onCompanyScoreChange?: (score: number) => void;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ 
  address, 
  industry, 
  realData,
  manualCompetitors,
  competitorServices,
  removedMissingServices,
  companyServices,
  deletedCompetitors,
  onCompetitorsChange,
  onCompetitorServicesChange,
  onRemovedMissingServicesChange,
  onCompanyServicesChange,
  onDeletedCompetitorChange,
  onRestoreCompetitorChange,
  onCompanyScoreChange
}) => {
  const [editingServices, setEditingServices] = useState<string | null>(null);
  const [serviceInput, setServiceInput] = useState('');

  // Branchenspezifische Services für jedes Gewerbe
  const getIndustryServices = (industry: string): string[] => {
    const industryMap: { [key: string]: string[] } = {
      'shk': ['heizung', 'sanitär', 'klima', 'lüftung', 'installation', 'wartung', 'reparatur', 'badumbau', 'rohrreinigung'],
      'maler': ['malen', 'lackieren', 'tapezieren', 'fassade', 'renovierung', 'anstrich', 'wandgestaltung', 'bodenbelag'],
      'elektriker': ['elektro', 'installation', 'beleuchtung', 'schaltschrank', 'photovoltaik', 'smart home', 'automation'],
      'dachdecker': ['dach', 'ziegel', 'schiefer', 'flachdach', 'dachrinne', 'dämmung', 'abdichtung', 'reparatur'],
      'stukateur': ['putz', 'stuck', 'gips', 'fassade', 'dämmung', 'trockenbau', 'renovierung'],
      'planungsbuero': ['planung', 'architektur', 'statik', 'beratung', 'projekt', 'bauüberwachung', 'genehmigung'],
      'facility-management': ['wartung', 'reinigung', 'sicherheit', 'gebäude', 'instandhaltung', 'service']
    };
    return industryMap[industry] || [];
  };

  // Prüft ob ein Service branchenspezifisch ist
  const isIndustrySpecific = (service: string, currentIndustry: string): boolean => {
    const industryServices = getIndustryServices(currentIndustry);
    const serviceLower = service.toLowerCase();
    return industryServices.some(industryService => 
      serviceLower.includes(industryService) || industryService.includes(serviceLower)
    );
  };

  // Basis-Services für die Branche (kompatibel mit vorhandenem Code)
  const getIndustryServicesOld = (industry: string): string[] => {
    const industryServices = {
      'shk': ['Heizungsinstallation', 'Sanitärinstallation', 'Klimaanlagen', 'Rohrreinigung', 'Wartung', 'Notdienst'],
      'maler': ['Innenanstrich', 'Außenanstrich', 'Tapezieren', 'Lackierung', 'Fassadengestaltung', 'Renovierung'],
      'elektriker': ['Elektroinstallation', 'Beleuchtung', 'Smart Home', 'Sicherheitstechnik', 'Wartung', 'Notdienst'],
      'dachdecker': ['Dacheindeckung', 'Dachreparatur', 'Dachrinnen', 'Isolierung', 'Flachdach', 'Wartung'],
      'stukateur': ['Innenputz', 'Außenputz', 'Trockenbau', 'Sanierung', 'Dämmung', 'Stuck'],
      'planungsbuero': ['Planung', 'Beratung', 'Projektmanagement', 'Genehmigungen', 'Überwachung', 'Gutachten'],
      'facility-management': ['Büroreinigung', 'Glasreinigung', 'Hausmeisterservice', 'Gartenpflege', 'Winterdienst', 'Sicherheitsdienst']
    };
    return industryServices[industry as keyof typeof industryServices] || [];
  };

  // Verwende eigene Services statt Standard-Services
  const ownServices = companyServices.services.length > 0 ? companyServices.services : getIndustryServicesOld(industry);
  
  // Services für Score-Berechnung: eigene Services + entfernte "fehlende" Services
  const ownServicesForScore = [...ownServices, ...removedMissingServices];
  
  // Verbesserte Service-Vergleichsfunktion mit Synonym-Erkennung
  const areServicesSimilar = (service1: string, service2: string): boolean => {
    if (!service1 || !service2) return false;
    
    const s1 = service1.toLowerCase().trim();
    const s2 = service2.toLowerCase().trim();
    
    // Exakte Übereinstimmung
    if (s1 === s2) return true;
    
    // Eine enthält die andere
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Gemeinsame Kernwörter (mindestens 3 Zeichen)
    const words1 = s1.split(/[\s\-_]+/).filter(w => w.length >= 3);
    const words2 = s2.split(/[\s\-_]+/).filter(w => w.length >= 3);
    
    const commonWords = words1.filter(w1 => 
      words2.some(w2 => w1.includes(w2) || w2.includes(w1))
    );
    
    // Als ähnlich betrachten wenn mindestens 50% der Wörter übereinstimmen
    const similarity = commonWords.length / Math.min(words1.length, words2.length);
    return similarity >= 0.5;
  };
  
  console.log('=== COMPETITOR ANALYSIS DEBUG ===');
  console.log('ownServices (original):', ownServices);
  console.log('removedMissingServices (ich biete auch an):', removedMissingServices);
  console.log('ownServicesForScore (total):', ownServicesForScore);
  
  console.log('🟢 REMOVED MISSING SERVICES EFFECT:');
  console.log('🟢 removedMissingServices array:', removedMissingServices);
  console.log('🟢 Should add', removedMissingServices.length, 'services to own score calculation');

  // Konkurrenten-Score berechnen - WICHTIG: Verwendet unterschiedliche Logik für eigenes vs. andere Unternehmen
  const calculateCompetitorScore = (competitor: { name?: string; rating: number; reviews: number; services: string[] }) => {
    try {
      const rating = typeof competitor.rating === 'number' && !isNaN(competitor.rating) ? competitor.rating : 0;
      const reviews = typeof competitor.reviews === 'number' && !isNaN(competitor.reviews) ? competitor.reviews : 0;
      
      // Rating-Score: <4.5 muss unter 80% bleiben (neue Faustformel)
      const ratingScore = rating >= 4.5 
        ? 80 + ((rating - 4.5) / 0.5) * 15  // 80-95% für 4.5-5.0
        : rating >= 3.5 
          ? 60 + ((rating - 3.5) * 20)      // 60-80% für 3.5-4.5
          : rating >= 2.5 
            ? 40 + ((rating - 2.5) * 20)    // 40-60% für 2.5-3.5
            : rating * 16;                  // 0-40% für unter 2.5
      
      // Review-Score: Basiert auf geschätzten positiven Bewertungen (Rating 4+ von 5)
      const positiveReviewsRatio = rating > 0 ? Math.min((rating - 1) / 4, 1) : 0; // Schätzt Anteil positiver Bewertungen
      const estimatedPositiveReviews = Math.round(reviews * positiveReviewsRatio);
      
      const reviewScore = reviews <= 25 
        ? Math.min(50 + estimatedPositiveReviews * 1.6, 90)  // Basiert auf positiven Reviews
        : Math.min(95, 90 + Math.log10(estimatedPositiveReviews / 25) * 5); // Max 95%
      
      const services = Array.isArray(competitor.services) ? competitor.services : [];
      const serviceCount = services.length;
      
      // Unterscheide zwischen branchenspezifischen und branchenfremden Services
      const industrySpecificServices = services.filter(service => 
        isIndustrySpecific(service, industry)
      );
      const nonIndustryServices = services.filter(service => 
        !isIndustrySpecific(service, industry)
      );
      
      // Service-Score: Fairere Bewertung - Qualität vor Quantität
      // Basis-Score abhängig von Service-Anzahl, aber mit fairerer Skalierung
      let baseServiceScore;
      if (serviceCount === 0) {
        baseServiceScore = 15;  // Sehr niedrig ohne Services
      } else if (serviceCount <= 3) {
        baseServiceScore = 30 + (serviceCount * 15);  // 45-75% für 1-3 Services (Spezialbetriebe)
      } else if (serviceCount <= 8) {
        baseServiceScore = 75 + ((serviceCount - 3) * 2);  // 77-85% für 4-8 Services (Standard)
      } else if (serviceCount <= 15) {
        baseServiceScore = 85 + ((serviceCount - 8) * 0.7);  // 85-90% für 9-15 Services
      } else {
        baseServiceScore = Math.min(90 + ((serviceCount - 15) * 0.3), 93);  // Max 93% für >15 Services
      }
      
      // Spezialisierungsbonus: Belohnt hohen Anteil branchenspezifischer Services
      const specializationRatio = serviceCount > 0 ? industrySpecificServices.length / serviceCount : 0;
      const specializationBonus = specializationRatio * 8; // Bis zu 8 Punkte für 100% Spezialisierung
      
      // Branchenrelevanz-Score: Wichtiger als pure Anzahl
      const industryRelevanceScore = Math.min(industrySpecificServices.length * 3.5, 25); // Max 25 Punkte für relevante Services
      
      console.log(`🟡 Service calculation for ${competitor.name}:`, {
        serviceCount,
        calculation: serviceCount <= 10 
          ? `(${serviceCount} / 10) * 50 = ${((serviceCount / 10) * 50).toFixed(1)}%`
          : `50 + ((${serviceCount} - 10) * 2) = ${(50 + ((serviceCount - 10) * 2)).toFixed(1)}%`,
        baseServiceScore: baseServiceScore.toFixed(1)
      });
      
      // FAIRE Lösung: Konkurrenten werden gegen die ursprüngliche Service-Liste bewertet
      // So werden sie nicht durch abgewählte Services benachteiligt
      const uniqueServices = services.filter((service: string) => 
        typeof service === 'string' && service.trim().length > 0 && 
        !ownServices.some(ownService => 
          typeof ownService === 'string' && ownService.trim().length > 0 && 
          areServicesSimilar(ownService, service)
        )
      );
      
      console.log(`🎯 Fair evaluation for ${competitor.name}:`, {
        competitorServices: serviceCount,
        uniqueServicesAgainstUs: uniqueServices.length,
        referenceServiceList: 'ownServicesForScore (same for all)',
        fairness: 'All competitors evaluated against same extended service list'
      });
      
      // Qualitäts-Malus für zu viele branchenfremde Services (Verwässerung)
      const dilutionPenalty = nonIndustryServices.length > 5 ? (nonIndustryServices.length - 5) * 0.8 : 0;
      
      // Finaler Service-Score: Basis + Spezialisierung + Relevanz - Verwässerung
      const finalServiceScore = Math.min(baseServiceScore + specializationBonus + industryRelevanceScore - dilutionPenalty, 96);
      
      // Dynamische Gewichtung: Je mehr Services, desto wichtiger wird die Google-Bewertung
      // Rating-Gewichtung steigt mit Anzahl der Services (30-55%)
      // Service-Gewichtung sinkt entsprechend (40-25%)
      const ratingWeight = Math.min(0.30 + (serviceCount * 0.015), 0.55); // 30% bei 0 Services, bis 55% bei 16+ Services
      const serviceWeight = Math.max(0.40 - (serviceCount * 0.01), 0.25);  // 40% bei 0 Services, bis 25% bei 15+ Services
      const reviewWeight = 1 - ratingWeight - serviceWeight; // Rest für Reviews (15-30%)
      
      const score = Math.min((ratingScore * ratingWeight) + (reviewScore * reviewWeight) + (finalServiceScore * serviceWeight), 96);
      
      console.log(`Score calculation for ${competitor.name || 'Competitor'}:`, {
        rating, ratingScore: ratingScore.toFixed(1), 
        reviews, reviewScore: reviewScore.toFixed(1),
        positiveReviewsRatio: (positiveReviewsRatio * 100).toFixed(1) + '%',
        estimatedPositiveReviews, 
        serviceCount, 
        industryServices: industrySpecificServices.length,
        nonIndustryServices: nonIndustryServices.length,
        specializationRatio: (specializationRatio * 100).toFixed(1) + '%',
        baseServiceScore: baseServiceScore.toFixed(1),
        specializationBonus: specializationBonus.toFixed(1),
        industryRelevanceScore: industryRelevanceScore.toFixed(1),
        dilutionPenalty: dilutionPenalty.toFixed(1),
        finalServiceScore: finalServiceScore.toFixed(1),
        weights: {
          rating: `${(ratingWeight * 100).toFixed(1)}%`,
          reviews: `${(reviewWeight * 100).toFixed(1)}%`,
          services: `${(serviceWeight * 100).toFixed(1)}%`
        },
        finalScore: score.toFixed(1)
      });
      
      return Math.min(Math.round(isNaN(score) ? 0 : score), 96); // Max 96%
    } catch (error) {
      console.error('Error calculating competitor score:', error);
      return 0;
    }
  };

  // Lösch-Funktionen
  const handleDeleteCompetitor = (competitorName: string, source: 'google' | 'manual' | 'own') => {
    if (source === 'own') return; // Eigenes Unternehmen kann nicht gelöscht werden
    
    onDeletedCompetitorChange(competitorName);
    
    // Bei manuellen Konkurrenten auch aus der Liste entfernen
    if (source === 'manual') {
      const updatedManualCompetitors = manualCompetitors.filter(comp => comp.name !== competitorName);
      onCompetitorsChange(updatedManualCompetitors);
    }
  };

  const handleRestoreCompetitor = (competitorName: string) => {
    onRestoreCompetitorChange(competitorName);
  };

  // Alle Konkurrenten zusammenführen - ERST berechnen, DANN eigenes Unternehmen bewerten
  const allCompetitors = [
    ...realData.competitors
      .filter(comp => !deletedCompetitors.has(comp.name))
      .map(comp => {
        const services = competitorServices[comp.name]?.services || [];
        const score = calculateCompetitorScore({...comp, services});
        
        const uniqueServices = services.filter((service: string) => 
          typeof service === 'string' && !ownServices.some(ownService => 
            ownService.toLowerCase().includes(service.toLowerCase()) || 
            service.toLowerCase().includes(ownService.toLowerCase())
          )
        );
        
        return {
          ...comp,
          services,
          score,
          uniqueServices,
          source: 'google' as const,
          location: (comp as any).location || comp.distance
        };
      }),
    ...manualCompetitors
      .filter(comp => !deletedCompetitors.has(comp.name))
      .map(comp => {
        console.log('FINAL DEBUG: Processing manual competitor', comp.name, 'with data:', comp);
        // Verwende die Services direkt aus dem manuellen Konkurrenten
        const services = Array.isArray(comp.services) ? comp.services : [];
        console.log('FINAL DEBUG: Manual competitor services for', comp.name, ':', services);
        const score = calculateCompetitorScore({
          rating: comp.rating,
          reviews: comp.reviews,
          services: services
        });
        console.log('FINAL DEBUG: Calculated score for', comp.name, ':', score);
        
        const uniqueServices = services.filter((service: string) => 
          typeof service === 'string' && !ownServices.some(ownService => 
            ownService.toLowerCase().includes(service.toLowerCase()) || 
            service.toLowerCase().includes(ownService.toLowerCase())
          )
        );
        
        const result = {
          name: comp.name,
          rating: comp.rating,
          reviews: comp.reviews,
          distance: comp.distance,
          services,
          score,
          uniqueServices,
          source: 'manual' as const,
          location: comp.distance
        };
        console.log('FINAL DEBUG: Final result for', comp.name, ':', result);
        return result;
      })
  ];

  // Eigenes Unternehmen für Vergleich - INKL. Abwählbonus
  const ownCompany = {
    name: realData.company.name,
    rating: realData.reviews.google.rating,
    reviews: realData.reviews.google.count,
    services: ownServicesForScore, // WICHTIG: Verwende gefilterte Services für Score-Berechnung
    source: 'own' as const,
    location: 'Ihr Unternehmen'
  };
  
  // Basis-Score für eigenes Unternehmen berechnen
  const baseOwnScore = calculateCompetitorScore(ownCompany);
  
  console.log('CompetitorAnalysis - ownCompany object passed to calculateCompetitorScore:', ownCompany);
  
  // Moderater Bonus für abgewählte Services (Verhältnis zur Konkurrenz)
  const avgCompetitorServiceCount = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + (comp.services?.length || 0), 0) / allCompetitors.length 
    : ownServicesForScore.length;
    
  // Bonus-Berechnung: Pro abgewähltem Service 0.3 Punkte, aber maximal 10% des Basis-Scores
  const serviceRemovalBonus = Math.min(
    removedMissingServices.length * 0.3, 
    baseOwnScore * 0.10
  );
  
  // Finaler Score für eigenes Unternehmen
  const ownCompanyScore = Math.min(baseOwnScore + serviceRemovalBonus, 96);
  
  console.log('=== COMPETITOR ANALYSIS - OWN COMPANY SCORE ===');
  console.log('CompetitorAnalysis - ownServicesForScore:', ownServicesForScore);
  console.log('CompetitorAnalysis - removedMissingServices:', removedMissingServices);
  console.log('CompetitorAnalysis - baseOwnScore:', baseOwnScore);
  console.log('CompetitorAnalysis - serviceRemovalBonus:', serviceRemovalBonus.toFixed(1));
  console.log('CompetitorAnalysis - finalOwnCompanyScore:', ownCompanyScore);
  
  // WICHTIG: Score an Parent-Komponente weiterleiten
  if (onCompanyScoreChange) {
    onCompanyScoreChange(ownCompanyScore);
  }

  // Sortiert nach Score - INKLUSIVE eigenem Unternehmen für Ranking
  const sortedCompetitors = [
    {
      ...ownCompany,
      score: ownCompanyScore,
      uniqueServices: [],
      services: ownServicesForScore, // Verwende gefilterte Services auch für Anzeige
      source: 'own' as const
    },
    ...allCompetitors
  ].sort((a, b) => b.score - a.score);

  // WICHTIG: Score und Konkurrenten-Daten für CustomerHTMLExport verfügbar machen
  console.log('=== SETTING GLOBAL COMPETITOR DATA ===');
  console.log('ownCompanyScore:', ownCompanyScore);
  console.log('allCompetitors being set:', allCompetitors);
  console.log('sortedCompetitors being set:', sortedCompetitors);
  
  (window as any).globalOwnCompanyScore = ownCompanyScore;
  (window as any).globalAllCompetitors = allCompetitors;
  (window as any).globalSortedCompetitors = sortedCompetitors;
  
  console.log('=== GLOBAL DATA SET CONFIRMATION ===');
  console.log('window.globalAllCompetitors after setting:', (window as any).globalAllCompetitors);
  console.log('window.globalOwnCompanyScore after setting:', (window as any).globalOwnCompanyScore);

  // Gelöschte Konkurrenten für Wiederherstellung - SICHER
  const deletedGoogleCompetitors = realData?.competitors?.filter(comp => 
    comp && comp.name && deletedCompetitors.has(comp.name)
  ) || [];
  const deletedManualCompetitors = manualCompetitors?.filter(comp => 
    comp && comp.name && deletedCompetitors.has(comp.name)
  ) || [];

  // Durchschnittswerte - SICHER
  const avgRating = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + (comp?.rating || 0), 0) / allCompetitors.length 
    : 0;
  const avgReviews = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + (comp?.reviews || 0), 0) / allCompetitors.length 
    : 0;
  const avgScore = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + (comp?.score || 0), 0) / allCompetitors.length 
    : 0;

  // Service-Gap Analyse
  const allCompetitorServices = new Set<string>();
  allCompetitors.forEach(comp => {
    comp.services.forEach((service: string) => {
      if (typeof service === 'string') {
        allCompetitorServices.add(service);
      }
    });
  });

  // Verbesserte Logik für fehlende Services
  const missingServices = Array.from(allCompetitorServices).filter((service: string) => 
    !ownServicesForScore.some(ownService => 
      areServicesSimilar(ownService, service)
    ) && !removedMissingServices.includes(service)
  );

  // Funktion zum Entfernen fehlender Services
  const handleRemoveMissingService = (service: string) => {
    console.log('🔴 REMOVING MISSING SERVICE:', service);
    console.log('🔴 Current removedMissingServices BEFORE:', removedMissingServices);
    console.log('🔴 Current ownServicesForScore BEFORE:', ownServicesForScore);
    console.log('🔴 Current own company score BEFORE:', ownCompanyScore);
    
    onRemovedMissingServicesChange(service);
    
    // Log nach der Änderung (wird beim nächsten Render sichtbar)
    console.log('🔴 Called onRemovedMissingServicesChange with:', service);
  };

  const handleServiceEdit = (competitorName: string) => {
    const currentServices = competitorServices[competitorName]?.services || [];
    setServiceInput(currentServices.join(', '));
    setEditingServices(competitorName);
  };

  const handleServiceSave = () => {
    if (editingServices) {
      const services = serviceInput.split(',').map(s => s.trim()).filter(s => s.length > 0);
      onCompetitorServicesChange(editingServices, services);
      setEditingServices(null);
      setServiceInput('');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'score-text-high';   // 90-100% gold
    if (score >= 61) return 'score-text-medium'; // 61-89% grün
    return 'score-text-low';                     // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'secondary';        // gold
    if (score >= 61) return 'default';          // grün
    return 'destructive';                       // rot
  };

  return (
    <div className="space-y-6">
      {/* Eigene Unternehmensleistungen */}
      <CompanyServicesInput
        companyServices={companyServices}
        onServicesChange={onCompanyServicesChange}
        industry={industry}
      />

      {/* Manuelle Wettbewerber-Eingabe */}
      <ManualCompetitorInput
        competitors={manualCompetitors}
        onCompetitorsChange={onCompetitorsChange}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Wettbewerbsanalyse & Marktumfeld
            </span>
            <Badge variant={allCompetitors.length > 0 ? "default" : "destructive"}>
              {allCompetitors.length} Wettbewerber gefunden
            </Badge>
          </CardTitle>
          <CardDescription>
            Automatische Analyse des lokalen Wettbewerbs in {address} für {industry}
            {companyServices.services.length > 0 && (
              <span className="block mt-1 text-green-600">
                ✅ {companyServices.services.length} eigene Leistungen erfasst
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allCompetitors.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Keine Wettbewerber gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                Automatische Suche konnte keine direkten Wettbewerber in der Nähe finden.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Empfehlungen:</h4>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Erweitern Sie Ihren Suchradius</li>
                  <li>• Nutzen Sie die manuelle Wettbewerbereingabe</li>
                  <li>• Überprüfen Sie Ihre Brancheneinstellung</li>
                  <li>• Führen Sie eine lokale Marktanalyse durch</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               {/* Eigenes Unternehmen */}
               <Card className="border-yellow-400 bg-yellow-50">
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg text-yellow-700">
                     <Award className="h-5 w-5 inline mr-2" />
                     Ihr Unternehmen - {realData.company.name}
                   </CardTitle>
                   <CardDescription>
                     Ihre aktuelle Marktposition im Wettbewerbsvergleich
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   <div className="flex justify-between items-center">
                     <div>
                       <div className="flex items-center gap-4 text-sm">
                         <div className="flex items-center gap-1">
                           <Star className="h-4 w-4 fill-current text-yellow-500" />
                           <span>{realData.reviews.google.rating.toFixed(1)}</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <Users className="h-4 w-4" />
                           <span>{realData.reviews.google.count} Bewertungen</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <span>{ownServices.length} Services</span>
                         </div>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className={`text-2xl font-bold ${getScoreColor(ownCompanyScore)} mb-1`}>
                         {ownCompanyScore}
                       </div>
                       <Badge variant={getScoreBadge(ownCompanyScore)} className="text-xs">
                         Ihr Score
                       </Badge>
                     </div>
                   </div>
                   <div className="mt-3">
                     <div className="flex justify-between text-sm mb-1">
                       <span>Ihre Performance</span>
                       <span className={getScoreColor(ownCompanyScore)}>{ownCompanyScore > 0 ? `${ownCompanyScore}/100` : '—/100'}</span>
                     </div>
                     <Progress value={ownCompanyScore > 0 ? ownCompanyScore : 0} className="h-2" />
                   </div>
                   <div className="mt-3 text-sm text-gray-600">
                     Position: {ownCompanyScore >= avgScore ? '✅ Über dem Durchschnitt' : '⚠️ Unter dem Durchschnitt'} 
                     (Markt-Ø: {Math.round(avgScore)} Punkte)
                   </div>
                 </CardContent>
               </Card>

               {/* Marktübersicht */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <Card className="border-blue-200">
                   <CardContent className="p-4 text-center">
                     <div className="text-2xl font-bold text-blue-600">{allCompetitors.length}</div>
                     <div className="text-sm text-gray-600">Wettbewerber</div>
                   </CardContent>
                 </Card>
                 <Card className="border-yellow-200">
                   <CardContent className="p-4 text-center">
                     <div className="text-2xl font-bold text-yellow-600">{avgRating.toFixed(1)}</div>
                     <div className="text-sm text-gray-600">Ø Bewertung</div>
                   </CardContent>
                 </Card>
                 <Card className="border-purple-200">
                   <CardContent className="p-4 text-center">
                     <div className="text-2xl font-bold text-purple-600">{Math.round(avgReviews)}</div>
                     <div className="text-sm text-gray-600">Ø Rezensionen</div>
                   </CardContent>
                 </Card>
                 <Card className="border-green-200">
                   <CardContent className="p-4 text-center">
                     <div className="text-2xl font-bold text-green-600">{Math.round(avgScore)}</div>
                     <div className="text-sm text-gray-600">Ø Gesamtscore</div>
                   </CardContent>
                 </Card>
               </div>

              {/* Service-Gap Analyse */}
              {missingServices.length > 0 && (
                <Card className="border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-orange-600">
                      <AlertCircle className="h-5 w-5 inline mr-2" />
                      Fehlende Serviceleistungen
                    </CardTitle>
                    <CardDescription>
                      Services, die Wettbewerber anbieten, Sie aber nicht
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {missingServices.map((service: string, i: number) => (
                        <Badge key={i} variant="outline" className="justify-center bg-orange-50 text-orange-700 border-orange-300 flex items-center gap-1">
                          {service}
                          <X 
                            className="h-3 w-3 cursor-pointer hover:text-red-500" 
                            onClick={() => handleRemoveMissingService(service)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg">
                      <h4 className="font-semibold text-yellow-300 mb-3">Strategische Handlungsempfehlungen:</h4>
                      <div className="space-y-2">
                        {(() => {
                          // Check if own company is better than all competitors
                          const allOtherCompetitors = sortedCompetitors.filter(c => c.source !== 'own');
                          const bestCompetitorScore = allOtherCompetitors.length > 0 ? Math.max(...allOtherCompetitors.map(c => c.score)) : 0;
                          const isDominant = ownCompanyScore > bestCompetitorScore && allOtherCompetitors.length > 0;
                          
                          if (isDominant) {
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-400">⭐</span>
                                  <span>Dominierende Marktposition im unmittelbaren Marktumfeld</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-400">⭐</span>
                                  <span>Keine unmittelbaren Maßnahmen zur Steigerung der Wettbewerbsfähigkeit notwendig</span>
                                </div>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-400">⭐</span>
                                  <span>Prüfen Sie, welche Services für Ihr Unternehmen relevant sind</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-400">⭐</span>
                                  <span>Erwägen Sie eine Erweiterung Ihres Leistungsspektrums</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-400">⭐</span>
                                  <span>Kommunizieren Sie vorhandene Services besser</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-yellow-400">⭐</span>
                                  <span>Partnerschaften für fehlende Services erwägen</span>
                                </div>
                              </>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Gelöschte Konkurrenten - FIXED */}
              {(deletedGoogleCompetitors.length > 0 || deletedManualCompetitors.length > 0) && (
                <Card className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-red-600">
                      <X className="h-5 w-5 inline mr-2" />
                      Gelöschte Wettbewerber ({deletedGoogleCompetitors.length + deletedManualCompetitors.length})
                    </CardTitle>
                    <CardDescription>
                      Wettbewerber, die manuell aus der Analyse entfernt wurden
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {deletedGoogleCompetitors.map((competitor, index) => (
                        <div key={`deleted-google-${competitor.name}-${index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-red-900">{competitor.name}</span>
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
                              Google
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreCompetitor(competitor.name)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            Wiederherstellen
                          </Button>
                        </div>
                      ))}
                      {deletedManualCompetitors.map((competitor, index) => (
                        <div key={`deleted-manual-${competitor.name}-${index}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-red-900">{competitor.name}</span>
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-300">
                              Manuell
                            </Badge>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestoreCompetitor(competitor.name)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            Wiederherstellen
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Marktpositions-Vergleich */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Marktpositions-Vergleich
                  </CardTitle>
                  <CardDescription>
                    Ihre Position: {sortedCompetitors.findIndex(c => c.source === 'own') + 1} von {sortedCompetitors.length} | 
                    Ihr Score: {ownCompanyScore} Punkte | 
                    Stärkster Konkurrent: {sortedCompetitors.find(c => c.source !== 'own')?.score || 0} Punkte
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Bewertungsverteilung:</h4>
                    <div className="text-sm text-blue-800">
                      <div><strong>Rating:</strong> 50% | <strong>Anzahl Bewertungen:</strong> 20% | <strong>Services:</strong> 30%</div>
                      <div className="mt-2"><strong>Unter dem Marktdurchschnitt:</strong> 0-60 Punkte | <strong>Mittel:</strong> 61-80 Punkte | <strong>Hoch:</strong> 81-100 Punkte</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Konkurrenten-Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Wettbewerber-Ranking
                  </CardTitle>
                  <CardDescription>
                    Sortiert nach Gesamtperformance (ohne Ihr Unternehmen)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedCompetitors.filter(c => c.source !== 'own').map((competitor, index) => (
                      <div key={`${competitor.name}-${index}`} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-semibold">
                                #{index + 1} {competitor.name}
                              </span>
                              {competitor.location && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-300">
                                  {competitor.location}
                                </Badge>
                              )}
                              <Badge variant={competitor.source === 'google' ? 'default' : 'secondary'}>
                                {competitor.source === 'google' ? 'Google' : 'Manuell'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-current text-yellow-500" />
                                <span>{competitor.rating.toFixed(1)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{competitor.reviews} Bewertungen</span>
                              </div>
                              {('distance' in competitor && competitor.distance && competitor.distance !== competitor.location) && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{competitor.distance}</span>
                                </div>
                              )}
                               {'website' in competitor && competitor.website && (
                                 <div className="flex items-center gap-1">
                                   <MapPin className="h-4 w-4" />
                                   <span className="truncate max-w-xs">{String(competitor.website)}</span>
                                 </div>
                               )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(competitor.score)} mb-1`}>
                                {competitor.score}
                              </div>
                              <Badge variant={getScoreBadge(competitor.score)} className="text-xs">
                                Gesamtscore
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteCompetitor(competitor.name, competitor.source)}
                              className="flex items-center gap-1"
                            >
                              <X className="h-4 w-4" />
                              Entfernen
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Performance-Score</span>
                              <span className={getScoreColor(competitor.score)}>{competitor.score > 0 ? `${competitor.score}/100` : '—/100'}</span>
                            </div>
                            <Progress value={competitor.score > 0 ? competitor.score : 0} className="h-2" />
                          </div>

                          {competitor.uniqueServices.length > 0 && (
                            <div>
                              <span className="text-sm font-medium text-orange-600 mb-2 block">
                                Exklusive Services ({competitor.uniqueServices.length}):
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {competitor.uniqueServices.map((service: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-300">
                                    {service}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {editingServices === competitor.name ? (
                            <div className="space-y-2">
                              <Label htmlFor="services">Services bearbeiten:</Label>
                              <Input
                                id="services"
                                value={serviceInput}
                                onChange={(e) => setServiceInput(e.target.value)}
                                placeholder="Services kommagetrennt eingeben..."
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleServiceSave}>Speichern</Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingServices(null)}>
                                  Abbrechen
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="text-sm font-medium text-gray-700">Services ({competitor.services.length}):</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {competitor.services.map((service: string, i: number) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {service}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleServiceEdit(competitor.name)}
                              >
                                Services bearbeiten
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorAnalysis;
