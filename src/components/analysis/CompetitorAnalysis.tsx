
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Star, TrendingUp, TrendingDown, Minus, Award, Target } from 'lucide-react';
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

  // Schätze eigene Services basierend auf Branche
  const getIndustryServices = (industry: string) => {
    const services = {
      'shk': ['Heizungsinstallation', 'Sanitärinstallation', 'Klimaanlagen', 'Wartung & Service', 'Notdienst', 'Badezimmer-Sanierung', 'Rohrreinigung', 'Heizungsoptimierung'],
      'maler': ['Innenanstrich', 'Außenanstrich', 'Tapezieren', 'Renovierung', 'Fassadengestaltung', 'Lackierarbeiten'],
      'elektriker': ['Elektroinstallation', 'Smart Home', 'Beleuchtung', 'Sicherheitstechnik', 'Wartung', 'Notdienst', 'PV-Anlagen'],
      'dachdecker': ['Dachdeckung', 'Dachreparatur', 'Dämmung', 'Dachrinnen', 'Flachdach'],
      'stukateur': ['Innenputz', 'Außenputz', 'Trockenbau', 'Sanierung', 'Wärmedämmung', 'Renovierung'],
      'planungsbuero': ['Architektur', 'Bauplanung', 'Statik', 'Energieberatung', 'Baugenehmigung', 'Projektmanagement', 'Bauüberwachung', 'Sanierungsplanung', 'Brandschutz', 'Barrierefreiheit']
    };
    return services[industry] || services['shk'];
  };

  const ownServices = getIndustryServices(industry);
  const ownServicesCount = ownServices.length;

  // Erweiterte Scoring-Funktion mit Service-Bewertung
  const calculateCompetitorScore = (competitor: any) => {
    const ratingScore = (competitor.rating / 5) * 100;
    const reviewScore = Math.min(100, (competitor.reviews / 50) * 100);
    
    // Service-Score: Berücksichtigt Anzahl und Qualität der Services
    const services = Array.isArray(competitor.services) ? competitor.services : [];
    const serviceCount = services.length;
    const baseServiceScore = Math.min(100, (serviceCount / 12) * 100);
    
    // Bonus für Services, die der eigene Betrieb nicht hat
    const uniqueServices = services.filter((service: string) => 
      typeof service === 'string' && !ownServices.some(ownService => 
        ownService.toLowerCase().includes(service.toLowerCase()) || 
        service.toLowerCase().includes(ownService.toLowerCase())
      )
    );
    
    const uniqueServiceBonus = uniqueServices.length * 5; // 5 Punkte pro einzigartigen Service
    const finalServiceScore = Math.min(100, baseServiceScore + uniqueServiceBonus);
    
    // Gewichtung: Rating 40%, Reviews 25%, Services 35%
    return (ratingScore * 0.4) + (reviewScore * 0.25) + (finalServiceScore * 0.35);
  };

  // Kombiniere alle Konkurrenten mit erweiterten Scores
  const allCompetitors = [
    ...realData.competitors.map(comp => {
      const services = competitorServices[comp.name] || [];
      const score = calculateCompetitorScore({...comp, services});
      
      // Service-Analyse
      const uniqueServices = services.filter((service: string) => 
        typeof service === 'string' && !ownServices.some(ownService => 
          ownService.toLowerCase().includes(service.toLowerCase()) || 
          service.toLowerCase().includes(ownService.toLowerCase())
        )
      );
      
      return {
        ...comp,
        services,
        isManual: false,
        performanceScore: score,
        uniqueServices,
        serviceAdvantage: services.length > ownServicesCount,
        hasUniqueServices: uniqueServices.length > 0
      };
    }),
    ...manualCompetitors.map(comp => {
      const score = calculateCompetitorScore(comp);
      const services = Array.isArray(comp.services) ? comp.services : [];
      
      const uniqueServices = services.filter((service: string) => 
        typeof service === 'string' && !ownServices.some(ownService => 
          ownService.toLowerCase().includes(service.toLowerCase()) || 
          service.toLowerCase().includes(ownService.toLowerCase())
        )
      );
      
      return {
        name: comp.name,
        rating: comp.rating,
        reviews: comp.reviews,
        distance: comp.distance,
        services,
        isManual: true,
        performanceScore: score,
        uniqueServices,
        serviceAdvantage: services.length > ownServicesCount,
        hasUniqueServices: uniqueServices.length > 0
      };
    })
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
    services: ownServices
  });

  // Statistiken
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

  // Service-Gap Analyse
  const allCompetitorServices = new Set<string>();
  allCompetitors.forEach(comp => {
    comp.services.forEach((service: string) => {
      if (typeof service === 'string') {
        allCompetitorServices.add(service);
      }
    });
  });

  const missingServices = Array.from(allCompetitorServices).filter((service: string) => 
    !ownServices.some(ownService => 
      ownService.toLowerCase().includes(service.toLowerCase()) || 
      service.toLowerCase().includes(ownService.toLowerCase())
    )
  );

  return (
    <div className="space-y-6">
      {/* Manuelle Eingabe */}
      <ManualCompetitorInput 
        competitors={manualCompetitors}
        onCompetitorsChange={onCompetitorsChange}
      />

      {/* Service-Gap Analyse */}
      {missingServices.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Target className="h-5 w-5" />
              Service-Lücken Analyse
            </CardTitle>
            <CardDescription className="text-amber-700">
              Services, die Ihre Konkurrenten anbieten, Sie aber möglicherweise nicht
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-amber-800">
                <strong>{missingServices.length} potenzielle Service-Erweiterungen</strong> identifiziert:
              </p>
              <div className="flex flex-wrap gap-2">
                {missingServices.slice(0, 8).map((service, index) => (
                  <Badge key={index} variant="outline" className="bg-white text-amber-800 border-amber-300">
                    {service}
                  </Badge>
                ))}
                {missingServices.length > 8 && (
                  <Badge variant="outline" className="bg-white text-amber-600">
                    +{missingServices.length - 8} weitere
                  </Badge>
                )}
              </div>
              <div className="bg-white rounded-lg p-3 border border-amber-200">
                <h4 className="font-medium text-amber-900 mb-2">💡 Empfehlung:</h4>
                <p className="text-sm text-amber-800">
                  Prüfen Sie, welche dieser Services zu Ihrem Geschäftsmodell passen könnten. 
                  Jeder zusätzliche Service kann Ihren Wettbewerbsvorteil stärken.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vergleichs-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Leistungsvergleich: Ihr Unternehmen vs. Konkurrenz</CardTitle>
          <CardDescription>
            Umfassender Vergleich mit {allCompetitors.length} lokalen Konkurrenten in {city}
            {manualCompetitors.length > 0 && (
              <span className="ml-2">
                (davon {manualCompetitors.length} manuell hinzugefügt)
              </span>
            )}
            <br />
            <small className="text-blue-600">
              Bewertung: 40% Kundenbewertung • 25% Anzahl Reviews • 35% Service-Portfolio
            </small>
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
                    <span className="text-sm">Services:</span>
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

            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-600">
                  Ihr Wettbewerbsposition
                </CardTitle>
                <Badge variant="outline">Direktvergleich</Badge>
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
          <CardTitle>Detaillierte Konkurrenzanalyse für {city}</CardTitle>
          <CardDescription>
            Lokale Konkurrenten in der {industry.toUpperCase()}-Branche sortiert nach Gesamtleistung
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
                            Überlegen
                          </Badge>
                        )}
                        {competitor.performanceScore < ownPerformanceScore && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Unterlegen
                          </Badge>
                        )}
                        {competitor.hasUniqueServices && (
                          <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                            <Award className="h-3 w-3 mr-1" />
                            Zusatz-Services
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
                      {competitor.serviceAdvantage && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                          Mehr als Sie
                        </Badge>
                      )}
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

                  {/* Unique Services Highlight */}
                  {competitor.uniqueServices.length > 0 && (
                    <div className="mb-3 p-2 bg-orange-50 rounded border border-orange-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">
                          Services, die Sie nicht anbieten:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {competitor.uniqueServices.map((service: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs bg-white text-orange-700 border-orange-300">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

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
                      <span className="text-sm font-medium text-gray-700">Alle Leistungen:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competitor.services.map((service: string, i: number) => (
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

          {/* Strategische Empfehlungen basierend auf Service-Analyse */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              📊 Strategische Empfehlungen basierend auf Service-Vergleich
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-1">Sofortige Maßnahmen:</h4>
                <ul className="space-y-1">
                  {ownRating < avgCompetitorRating && <li>• Kundenbewertungen aktiv sammeln</li>}
                  {ownReviewCount < avgCompetitorReviews && <li>• Mehr Google-Rezensionen generieren</li>}
                  {missingServices.length > 0 && <li>• Service-Portfolio um {missingServices.slice(0, 2).join(', ')} erweitern</li>}
                  <li>• Alle bestehenden Services prominent auf Website darstellen</li>
                  <li>• Google My Business Profil mit allen Services aktualisieren</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">Mittelfristige Strategie:</h4>
                <ul className="space-y-1">
                  <li>• Service-Differenzierung: Spezialisierung entwickeln</li>
                  <li>• Cross-Selling zwischen bestehenden Services</li>
                  <li>• Konkurrenz-Services analysieren und übernehmen</li>
                  <li>• Partnerschaften für fehlende Services prüfen</li>
                  <li>• Preispositionierung basierend auf Service-Umfang</li>
                </ul>
              </div>
            </div>
            {allCompetitors.filter(c => c.hasUniqueServices).length > 0 && (
              <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-1">⚠️ Konkurrenzvorteile schließen:</h4>
                <p className="text-blue-800">
                  {allCompetitors.filter(c => c.hasUniqueServices).length} Konkurrenten bieten Services an, die Sie nicht haben. 
                  Prüfen Sie die Nachfrage nach diesen Services in Ihrer Region.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorAnalysis;
