
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import ManualCompetitorInput from './ManualCompetitorInput';
import { useManualData } from '@/hooks/useManualData';

interface CompetitorAnalysisProps {
  address: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  realData: RealBusinessData;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ address, industry, realData }) => {
  const { manualCompetitors, updateCompetitors } = useManualData();

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

  // Kombiniere echte und manuelle Konkurrenten
  const allCompetitors = [
    ...realData.competitors.map(comp => ({
      ...comp,
      services: comp.services || [], // Ensure services array exists
      isManual: false
    })),
    ...manualCompetitors.map(comp => ({
      name: comp.name,
      rating: comp.rating,
      reviews: comp.reviews,
      distance: comp.distance,
      services: comp.services || [], // Ensure services array exists
      isManual: true
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

  // Berechne durchschnittliche Konkurrenz-Performance
  const avgCompetitorRating = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + comp.rating, 0) / allCompetitors.length 
    : 0;
  
  const avgCompetitorReviews = allCompetitors.length > 0
    ? allCompetitors.reduce((sum, comp) => sum + comp.reviews, 0) / allCompetitors.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Manuelle Eingabe */}
      <ManualCompetitorInput 
        competitors={manualCompetitors}
        onCompetitorsChange={updateCompetitors}
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
                  <Progress value={ownRating * 20} className="h-2" />
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
                  <Progress value={avgCompetitorRating * 20} className="h-2" />
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
              {allCompetitors.map((competitor, index) => (
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
                        {competitor.rating > ownRating && (
                          <Badge variant="destructive" className="text-xs">
                            Stärker
                          </Badge>
                        )}
                        {competitor.rating < ownRating && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Schwächer
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {competitor.distance} entfernt
                        </span>
                        {competitor.services && competitor.services.length > 0 && (
                          <div className="flex gap-1">
                            {competitor.services.slice(0, 3).map((service, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium">{competitor.rating}</span>
                        <span className="text-sm text-gray-600">({competitor.reviews} Bewertungen)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">vs. Sie:</span>
                      {getComparisonIcon(competitor.rating, ownRating)}
                      <span className={`text-sm font-medium ${getPerformanceColor(competitor.rating, ownRating)}`}>
                        {competitor.rating > ownRating ? 'Besser' : competitor.rating < ownRating ? 'Schlechter' : 'Gleich'}
                      </span>
                    </div>
                    
                    <Progress value={competitor.rating * 20} className="w-full" />
                  </div>
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
                  <li>• Google My Business Profil optimieren</li>
                  <li>• Lokale SEO-Keywords verwenden</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">Mittelfristig:</h4>
                <ul className="space-y-1">
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
