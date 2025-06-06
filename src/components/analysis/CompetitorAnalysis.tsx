
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Star, TrendingUp, TrendingDown, Minus, Award, Users, Clock, CheckCircle } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface CompetitorAnalysisProps {
  address: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  realData: RealBusinessData;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ address, industry, realData }) => {
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

  // Erweiterte Leistungsanalyse basierend auf verfügbaren Daten
  const analyzeCompetitorPerformance = (competitor: any) => {
    const performance = {
      customerSatisfaction: competitor.rating,
      marketPresence: Math.min(100, (competitor.reviews / 10) * 20), // Reviews als Indikator für Marktpräsenz
      reliability: competitor.rating > 4.0 ? 85 : competitor.rating > 3.5 ? 70 : 50,
      digitalPresence: competitor.reviews > 20 ? 80 : competitor.reviews > 10 ? 60 : 40,
      trustworthiness: Math.min(100, (competitor.rating * 20) + (competitor.reviews > 5 ? 20 : 0))
    };

    // Geschätzte Leistungskategorien basierend auf Bewertungsmustern
    const estimatedServices = {
      quality: competitor.rating >= 4.5 ? 'Sehr gut' : competitor.rating >= 4.0 ? 'Gut' : competitor.rating >= 3.5 ? 'Durchschnitt' : 'Verbesserungsbedarf',
      customerService: competitor.rating >= 4.0 && competitor.reviews >= 10 ? 'Exzellent' : 'Standard',
      pricingCompetitiveness: competitor.reviews >= 15 ? 'Wettbewerbsfähig' : 'Unbekannt',
      responseTime: competitor.rating >= 4.0 ? 'Schnell' : 'Standard'
    };

    return { performance, estimatedServices };
  };

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
  const avgCompetitorRating = realData.competitors.length > 0 
    ? realData.competitors.reduce((sum, comp) => sum + comp.rating, 0) / realData.competitors.length 
    : 0;
  
  const avgCompetitorReviews = realData.competitors.length > 0
    ? realData.competitors.reduce((sum, comp) => sum + comp.reviews, 0) / realData.competitors.length
    : 0;

  // Marktpositionierung berechnen
  const strongerCompetitors = realData.competitors.filter(c => c.rating > ownRating).length;
  const weakerCompetitors = realData.competitors.filter(c => c.rating < ownRating).length;
  const marketPosition = strongerCompetitors === 0 ? 'Marktführer' : 
                        strongerCompetitors <= 2 ? 'Top-Position' : 
                        weakerCompetitors >= strongerCompetitors ? 'Oberes Mittelfeld' : 'Verbesserungspotential';

  return (
    <div className="space-y-6">
      {/* Erweiterte Marktpositionierung */}
      <Card>
        <CardHeader>
          <CardTitle>Marktpositionierung & Leistungsvergleich</CardTitle>
          <CardDescription>
            Ihre Position unter {realData.competitors.length} lokalen Konkurrenten in {city}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Marktposition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-600">{marketPosition}</div>
                <p className="text-sm text-gray-600 mt-1">
                  {strongerCompetitors} stärker, {weakerCompetitors} schwächer
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Kundenzufriedenheit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-600">{ownRating.toFixed(1)}/5</div>
                <p className="text-sm text-gray-600 mt-1">
                  {ownRating > avgCompetitorRating ? 'Überdurchschnittlich' : 'Verbesserungsbedarf'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-yellow-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-yellow-600 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Bewertungsdichte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-yellow-600">{ownReviewCount}</div>
                <p className="text-sm text-gray-600 mt-1">
                  {ownReviewCount > avgCompetitorReviews ? 'Gut etabliert' : 'Ausbaufähig'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Wettbewerbsvorteil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-600">
                  {Math.round(((ownRating - avgCompetitorRating) * 20) + ((ownReviewCount - avgCompetitorReviews) / 5))}%
                </div>
                <p className="text-sm text-gray-600 mt-1">Relativer Vorteil</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Detaillierte Konkurrenzanalyse mit Leistungsvergleich */}
      <Card>
        <CardHeader>
          <CardTitle>Detaillierte Leistungsanalyse der Konkurrenz</CardTitle>
          <CardDescription>
            Umfassender Vergleich von Servicequalität, Kundenzufriedenheit und Marktpräsenz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {realData.competitors.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <MapPin className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Keine lokalen Konkurrenten gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                Bei der automatischen Suche konnten keine direkten Konkurrenten in der Nähe von {address} identifiziert werden.
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
            <div className="space-y-6">
              {realData.competitors.map((competitor, index) => {
                const analysis = analyzeCompetitorPerformance(competitor);
                return (
                  <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{competitor.name}</h3>
                          <Badge variant={competitor.rating > ownRating ? "destructive" : "default"} className={competitor.rating <= ownRating ? "bg-green-600" : ""}>
                            Rang #{index + 1}
                          </Badge>
                          {competitor.rating >= 4.5 && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {competitor.distance} entfernt
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {competitor.rating}/5 ({competitor.reviews} Bewertungen)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Leistungsvergleich */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-800 mb-1">Servicequalität</div>
                        <div className="text-lg font-bold text-blue-600">{analysis.estimatedServices.quality}</div>
                        <Progress value={analysis.performance.customerSatisfaction * 20} className="h-2 mt-2" />
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-800 mb-1">Marktpräsenz</div>
                        <div className="text-lg font-bold text-green-600">{analysis.performance.marketPresence}%</div>
                        <Progress value={analysis.performance.marketPresence} className="h-2 mt-2" />
                      </div>
                      
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-yellow-800 mb-1">Zuverlässigkeit</div>
                        <div className="text-lg font-bold text-yellow-600">{analysis.performance.reliability}%</div>
                        <Progress value={analysis.performance.reliability} className="h-2 mt-2" />
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-purple-800 mb-1">Vertrauenswürdigkeit</div>
                        <div className="text-lg font-bold text-purple-600">{analysis.performance.trustworthiness}%</div>
                        <Progress value={analysis.performance.trustworthiness} className="h-2 mt-2" />
                      </div>
                    </div>

                    {/* Geschätzte Leistungsdetails */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Geschätzte Stärken:</h4>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Kundenservice: {analysis.estimatedServices.customerService}
                          </li>
                          <li className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            Reaktionszeit: {analysis.estimatedServices.responseTime}
                          </li>
                          <li className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-500" />
                            Preisgestaltung: {analysis.estimatedServices.pricingCompetitiveness}
                          </li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Direkter Vergleich zu Ihnen:</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span>Bewertung:</span>
                            <div className="flex items-center gap-2">
                              {getComparisonIcon(competitor.rating, ownRating)}
                              <span className={`font-medium ${getPerformanceColor(competitor.rating, ownRating)}`}>
                                {competitor.rating > ownRating ? `+${(competitor.rating - ownRating).toFixed(1)}` : 
                                 competitor.rating < ownRating ? `${(competitor.rating - ownRating).toFixed(1)}` : 'Gleich'}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Bewertungen:</span>
                            <div className="flex items-center gap-2">
                              {getComparisonIcon(competitor.reviews, ownReviewCount)}
                              <span className={`font-medium ${getPerformanceColor(competitor.reviews, ownReviewCount)}`}>
                                {competitor.reviews > ownReviewCount ? `+${competitor.reviews - ownReviewCount}` : 
                                 competitor.reviews < ownReviewCount ? `${competitor.reviews - ownReviewCount}` : 'Gleich'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Strategische Handlungsempfehlungen basierend auf Leistungsanalyse */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-4">
              🎯 Strategische Empfehlungen basierend auf Leistungsanalyse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-800 mb-3">Sofortige Optimierungen:</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  {ownRating < avgCompetitorRating && (
                    <li className="flex items-start gap-2">
                      <TrendingUp className="h-4 w-4 text-red-500 mt-0.5" />
                      Servicequalität steigern - Konkurrenz liegt bei {avgCompetitorRating.toFixed(1)}/5
                    </li>
                  )}
                  {ownReviewCount < avgCompetitorReviews && (
                    <li className="flex items-start gap-2">
                      <Users className="h-4 w-4 text-yellow-500 mt-0.5" />
                      Mehr Kundenbewertungen sammeln - Ziel: {Math.ceil(avgCompetitorReviews)} Bewertungen
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <Award className="h-4 w-4 text-green-500 mt-0.5" />
                    Alleinstellungsmerkmale deutlicher kommunizieren
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5" />
                    Kundenservice-Prozesse optimieren
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 mb-3">Langzeit-Strategien:</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-purple-500 mt-0.5" />
                    Premium-Positionierung durch Qualitätsnachweis
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-indigo-500 mt-0.5" />
                    Schnellere Reaktionszeiten als Wettbewerbsvorteil
                  </li>
                  <li className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                    Lokale Marktführerschaft durch kontinuierliche Verbesserung
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                    Regelmäßiges Monitoring der Konkurrenzentwicklung
                  </li>
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
