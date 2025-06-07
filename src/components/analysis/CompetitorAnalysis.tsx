
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import ManualCompetitorInput from './ManualCompetitorInput';
import CompetitorServicesInput from './CompetitorServicesInput';
import { ManualCompetitor, CompetitorServices } from '@/hooks/useManualData';

interface CompetitorAnalysisProps {
  address: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  realData: RealBusinessData;
  manualCompetitors: ManualCompetitor[];
  competitorServices: CompetitorServices;
  onCompetitorsChange: (competitors: ManualCompetitor[]) => void;
  onCompetitorServicesChange: (competitorName: string, services: string[]) => void;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ 
  address, 
  industry, 
  realData,
  manualCompetitors,
  competitorServices,
  onCompetitorsChange,
  onCompetitorServicesChange
}) => {
  const extractCityFromAddress = (address: string) => {
    const parts = address.split(',');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    const addressParts = address.trim().split(' ');
    return addressParts[addressParts.length - 1] || 'Ihrer Stadt';
  };

  const city = extractCityFromAddress(address);

  // Berechne eigene Bewertung basierend auf realData
  const ownRating = realData.reviews.google.rating || 4.2;
  const ownReviewCount = realData.reviews.google.count || 0;

  // Schätze eigene Services (falls verfügbar, sonst Durchschnitt für Branche)
  const estimateOwnServicesCount = () => {
    const industryServiceCounts = {
      'shk': 8, // Heizung, Sanitär, Klima, Wartung, etc.
      'maler': 6, // Innen-/Außenanstrich, Renovierung, etc.
      'elektriker': 7, // Installation, Wartung, Smart Home, etc.
      'dachdecker': 5, // Dachdeckung, Reparatur, Dämmung, etc.
      'stukateur': 6, // Putz, Trockenbau, Sanierung, etc.
      'planungsbuero': 10 // Verschiedene Planungsarten
    };
    return industryServiceCounts[industry] || 6;
  };

  const ownServicesCount = estimateOwnServicesCount();

  // Berechne Services-Score für einen Konkurrenten
  const calculateServicesScore = (servicesCount: number) => {
    if (servicesCount === 0) return 0;
    // Services-Score: 0-100 basierend auf Anzahl der Services
    // Mehr Services = höherer Score, aber mit abnehmenden Erträgen
    return Math.min(100, (servicesCount / 10) * 100);
  };

  // Berechne Gesamt-Performance-Score für einen Konkurrenten
  const calculateCompetitorScore = (competitor: any) => {
    const ratingScore = (competitor.rating / 5) * 100; // 0-100
    const reviewScore = Math.min(100, (competitor.reviews / 50) * 100); // 0-100, max bei 50+ Reviews
    const servicesScore = calculateServicesScore(competitor.services.length);
    
    // Gewichtung: Rating 50%, Reviews 30%, Services 20%
    return (ratingScore * 0.5) + (reviewScore * 0.3) + (servicesScore * 0.2);
  };

  // Kombiniere echte und manuelle Konkurrenten mit erweiterten Scores
  const allCompetitors = [
    ...realData.competitors.map(comp => {
      const services = competitorServices[comp.name] || [];
      return {
        ...comp,
        services,
        isManual: false,
        performanceScore: calculateCompetitorScore({...comp, services})
      };
    }),
    ...manualCompetitors.map(comp => ({
      name: comp.name,
      rating: comp.rating,
      reviews: comp.reviews,
      distance: comp.distance,
      services: comp.services || [],
      isManual: true,
      performanceScore: calculateCompetitorScore(comp)
    }))
  ];

  const getComparisonIcon = (competitorValue: number, ownValue: number) => {
    if (competitorValue > ownValue) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (competitorValue < ownValue) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getPerformanceColor = (competitorValue: number, ownValue: number) => {
    if (competitorValue > ownValue) return 'text-red-600';
    if (competitorValue < ownValue) return 'text-green-600';
    return 'text-gray-600';
  };

  // Berechne eigenen Performance-Score
  const ownPerformanceScore = calculateCompetitorScore({
    rating: ownRating,
    reviews: ownReviewCount,
    services: { length: ownServicesCount }
  });

  // Berechne durchschnittliche Konkurrenz-Performance
  const avgCompetitorRating = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + comp.rating, 0) / allCompetitors.length 
    : 0;
  
  const avgCompetitorReviews = allCompetitors.length > 0
    ? allCompetitors.reduce((sum, comp) => sum + comp.reviews, 0) / allCompetitors.length
    : 0;

  const avgCompetitorServices = allCompetitors.length > 0
    ? allCompetitors.reduce((sum, comp) => sum + comp.services.length, 0) / allCompetitors.length
    : 0;

  const avgCompetitorPerformance = allCompetitors.length > 0
    ? allCompetitors.reduce((sum, comp) => sum + comp.performanceScore, 0) / allCompetitors.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Manuelle Eingabe */}
      <ManualCompetitorInput 
        competitors={manualCompetitors}
        onCompetitorsChange={onCompetitorsChange}
      />

      {/* Vergleichs-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Ihr Unternehmen vs. lokale Konkurrenz</CardTitle>
          <CardDescription>
            Direkter Leistungsvergleich mit {allCompetitors.length} lokalen Konkurrenten in {city}
            {manualCompetitors.length > 0 && (
              <span className="ml-2">
                (davon {manualCompetitors.length} manuell hinzugefügt)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Eigene Performance */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-600">
                  {realData.company.name}
                </CardTitle>
                <Badge variant="default">Ihr Unternehmen</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bewertung:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-bold">{ownRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rezensionen:</span>
                    <span className="font-bold">{ownReviewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Services (geschätzt):</span>
                    <span className="font-bold">{ownServicesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gesamt-Score:</span>
                    <span className="font-bold">{Math.round(ownPerformanceScore)}/100</span>
                  </div>
                  <Progress value={ownPerformanceScore} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Konkurrenz-Durchschnitt */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-600">
                  Konkurrenz-Durchschnitt
                </CardTitle>
                <Badge variant="secondary">
                  {allCompetitors.length} Unternehmen
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bewertung:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-bold">{avgCompetitorRating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rezensionen:</span>
                    <span className="font-bold">{Math.round(avgCompetitorReviews)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Services:</span>
                    <span className="font-bold">{Math.round(avgCompetitorServices)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gesamt-Score:</span>
                    <span className="font-bold">{Math.round(avgCompetitorPerformance)}/100</span>
                  </div>
                  <Progress value={avgCompetitorPerformance} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Performance-Vergleich */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-600">
                  Ihr Vorsprung
                </CardTitle>
                <Badge variant="outline">Vergleich</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bewertung:</span>
                    <div className="flex items-center gap-1">
                      {getComparisonIcon(avgCompetitorRating, ownRating)}
                      <span className={`font-bold ${getPerformanceColor(avgCompetitorRating, ownRating)}`}>
                        {ownRating > avgCompetitorRating ? '+' : ''}{(ownRating - avgCompetitorRating).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rezensionen:</span>
                    <div className="flex items-center gap-1">
                      {getComparisonIcon(avgCompetitorReviews, ownReviewCount)}
                      <span className={`font-bold ${getPerformanceColor(avgCompetitorReviews, ownReviewCount)}`}>
                        {ownReviewCount > avgCompetitorReviews ? '+' : ''}{ownReviewCount - Math.round(avgCompetitorReviews)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Services:</span>
                    <div className="flex items-center gap-1">
                      {getComparisonIcon(avgCompetitorServices, ownServicesCount)}
                      <span className={`font-bold ${getPerformanceColor(avgCompetitorServices, ownServicesCount)}`}>
                        {ownServicesCount > avgCompetitorServices ? '+' : ''}{ownServicesCount - Math.round(avgCompetitorServices)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gesamt-Score:</span>
                    <div className="flex items-center gap-1">
                      {getComparisonIcon(avgCompetitorPerformance, ownPerformanceScore)}
                      <span className={`font-bold ${getPerformanceColor(avgCompetitorPerformance, ownPerformanceScore)}`}>
                        {ownPerformanceScore > avgCompetitorPerformance ? '+' : ''}{Math.round(ownPerformanceScore - avgCompetitorPerformance)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Detaillierte Konkurrenzanalyse */}
      <Card>
        <CardHeader>
          <CardTitle>Konkurrenzanalyse für {city}</CardTitle>
          <CardDescription>
            Lokale Konkurrenten in der {industry.toUpperCase()}-Branche im Umkreis von {address}
            <br />
            <small className="text-blue-600">
              Services fließen jetzt mit 20% Gewichtung in die Gesamtbewertung ein
            </small>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allCompetitors.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <MapPin className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Keine Konkurrenten gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                Es konnten keine direkten Konkurrenten in der Nähe von {address} gefunden werden.
                Nutzen Sie die manuelle Eingabe oben, um bekannte Konkurrenten hinzuzufügen.
              </p>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✓ Marktchance für Sie!</h4>
                <ul className="text-sm text-green-800 text-left space-y-1">
                  <li>• Schwache lokale Online-Konkurrenz</li>
                  <li>• Großes Potenzial für digitale Marktführerschaft</li>
                  <li>• Investieren Sie in lokale SEO-Optimierung</li>
                  <li>• Bauen Sie als Erster eine starke Online-Präsenz auf</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {allCompetitors
                .sort((a, b) => b.performanceScore - a.performanceScore)
                .map((competitor, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{competitor.name}</h3>
                        {competitor.isManual && (
                          <Badge variant="outline" className="text-xs">
                            Manuell
                          </Badge>
                        )}
                        {competitor.performanceScore > ownPerformanceScore && (
                          <Badge variant="destructive" className="text-xs">
                            Stärker
                          </Badge>
                        )}
                        {competitor.performanceScore < ownPerformanceScore && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Schwächer
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          Score: {Math.round(competitor.performanceScore)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {competitor.distance} entfernt
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{competitor.rating}</span>
                        <span className="text-sm text-gray-600">({competitor.reviews} Reviews)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Services:</span>
                      <span className="font-medium">{competitor.services.length}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">vs. Sie:</span>
                      {getComparisonIcon(competitor.performanceScore, ownPerformanceScore)}
                      <span className={`text-sm font-medium ${getPerformanceColor(competitor.performanceScore, ownPerformanceScore)}`}>
                        {competitor.performanceScore > ownPerformanceScore ? 'Besser' : competitor.performanceScore < ownPerformanceScore ? 'Schlechter' : 'Gleich'}
                      </span>
                    </div>
                    
                    <Progress value={competitor.performanceScore} className="w-full" />
                  </div>

                  {/* Services Input für automatisch gefundene Konkurrenten */}
                  {!competitor.isManual && (
                    <CompetitorServicesInput
                      competitorName={competitor.name}
                      currentServices={competitor.services}
                      onServicesChange={(services) => onCompetitorServicesChange(competitor.name, services)}
                    />
                  )}

                  {/* Services Display für manuelle Konkurrenten */}
                  {competitor.isManual && competitor.services.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">Leistungen:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competitor.services.map((service, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Strategische Empfehlungen */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Strategische Empfehlungen basierend auf Konkurrenzanalyse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-1">Sofort umsetzbar:</h4>
                <ul className="space-y-1">
                  {ownRating < avgCompetitorRating && <li>• Kundenbewertungen aktiv sammeln</li>}
                  {ownReviewCount < avgCompetitorReviews && <li>• Mehr Google-Rezensionen generieren</li>}
                  {ownServicesCount < avgCompetitorServices && <li>• Service-Portfolio erweitern und bewerben</li>}
                  <li>• Google My Business Profil optimieren</li>
                  <li>• Lokale SEO-Keywords verwenden</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">Mittelfristig:</h4>
                <ul className="space-y-1">
                  <li>• Alle Services prominent auf Website darstellen</li>
                  <li>• Social Media Präsenz aufbauen</li>
                  <li>• Referenzprojekte dokumentieren</li>
                  <li>• Website-Performance verbessern</li>
                  <li>• Kundenservice-Qualität steigern</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorAnalysis;
