
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, TrendingUp, Star, Users, Award, Target, MapPin } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface CompetitorAnalysisProps {
  address: string;
  industry: string;
  realData: RealBusinessData;
  manualCompetitors: Array<{
    name: string;
    rating: number;
    reviews: number;
    services: string[];
    website?: string;
  }>;
  competitorServices: Record<string, { services: string[]; source: 'auto' | 'manual' }>;
  onCompetitorsChange: (competitors: Array<{
    name: string;
    rating: number;
    reviews: number;
    services: string[];
    website?: string;
  }>) => void;
  onCompetitorServicesChange: (name: string, services: string[]) => void;
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
  const [editingServices, setEditingServices] = useState<string | null>(null);
  const [serviceInput, setServiceInput] = useState('');

  // Basis-Services für die Branche
  const getIndustryServices = (industry: string): string[] => {
    const industryServices = {
      'shk': ['Heizungsinstallation', 'Sanitärinstallation', 'Klimaanlagen', 'Rohrreinigung', 'Wartung', 'Notdienst'],
      'maler': ['Innenanstrich', 'Außenanstrich', 'Tapezieren', 'Lackierung', 'Fassadengestaltung', 'Renovierung'],
      'elektriker': ['Elektroinstallation', 'Beleuchtung', 'Smart Home', 'Sicherheitstechnik', 'Wartung', 'Notdienst'],
      'dachdecker': ['Dacheindeckung', 'Dachreparatur', 'Dachrinnen', 'Isolierung', 'Flachdach', 'Wartung'],
      'stukateur': ['Innenputz', 'Außenputz', 'Trockenbau', 'Sanierung', 'Dämmung', 'Stuck'],
      'planungsbuero': ['Planung', 'Beratung', 'Projektmanagement', 'Genehmigungen', 'Überwachung', 'Gutachten']
    };
    return industryServices[industry as keyof typeof industryServices] || [];
  };

  const ownServices = getIndustryServices(industry);

  // Konkurrenten-Score berechnen
  const calculateCompetitorScore = (competitor: { rating: number; reviews: number; services: string[] }) => {
    const ratingScore = (competitor.rating / 5) * 100;
    const reviewScore = Math.min(100, (competitor.reviews / 50) * 100);
    
    const services = Array.isArray(competitor.services) ? competitor.services : [];
    const serviceCount = services.length;
    const baseServiceScore = Math.min(100, (serviceCount / 12) * 100);
    
    const uniqueServices = services.filter((service: string) => 
      typeof service === 'string' && !ownServices.some(ownService => 
        ownService.toLowerCase().includes(service.toLowerCase()) || 
        service.toLowerCase().includes(ownService.toLowerCase())
      )
    );
    
    const uniqueServiceBonus = uniqueServices.length * 5;
    const finalServiceScore = Math.min(100, baseServiceScore + uniqueServiceBonus);
    
    return Math.round((ratingScore * 0.4) + (reviewScore * 0.25) + (finalServiceScore * 0.35));
  };

  // Alle Konkurrenten zusammenführen
  const allCompetitors = [
    ...realData.competitors.map(comp => {
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
        source: 'google' as const
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
        ...comp,
        score,
        uniqueServices,
        source: 'manual' as const
      };
    })
  ];

  // Sortiert nach Score
  const sortedCompetitors = [...allCompetitors].sort((a, b) => b.score - a.score);

  // Durchschnittswerte
  const avgRating = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + comp.rating, 0) / allCompetitors.length 
    : 0;
  const avgReviews = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + comp.reviews, 0) / allCompetitors.length 
    : 0;
  const avgScore = allCompetitors.length > 0 
    ? allCompetitors.reduce((sum, comp) => sum + comp.score, 0) / allCompetitors.length 
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
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Target className="h-6 w-6" />
              Konkurrenzanalyse
            </span>
            <Badge variant={allCompetitors.length > 0 ? "default" : "destructive"}>
              {allCompetitors.length} Konkurrenten gefunden
            </Badge>
          </CardTitle>
          <CardDescription>
            Automatische Analyse der lokalen Konkurrenz in {address} für {industry}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allCompetitors.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Keine Konkurrenten gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                Automatische Suche konnte keine direkten Konkurrenten in der Nähe finden.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Empfehlungen:</h4>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Erweitern Sie Ihren Suchradius</li>
                  <li>• Nutzen Sie die manuelle Konkurrenzeingabe</li>
                  <li>• Überprüfen Sie Ihre Brancheneinstellung</li>
                  <li>• Führen Sie eine lokale Marktanalyse durch</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Marktübersicht */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-blue-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{allCompetitors.length}</div>
                    <div className="text-sm text-gray-600">Konkurrenten</div>
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
                      Services, die Konkurrenten anbieten, Sie aber nicht
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {missingServices.map((service: string, i: number) => (
                        <Badge key={i} variant="outline" className="justify-center bg-orange-50 text-orange-700 border-orange-300">
                          {service}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 p-4 bg-orange-50 rounded-lg">
                      <h4 className="font-semibold text-orange-900 mb-2">Strategische Empfehlungen:</h4>
                      <ul className="text-sm text-orange-800 space-y-1">
                        <li>• Prüfen Sie, welche Services für Ihr Unternehmen relevant sind</li>
                        <li>• Erwägen Sie eine Erweiterung Ihres Leistungsspektrums</li>
                        <li>• Kommunizieren Sie vorhandene Services besser</li>
                        <li>• Partnerschaften für fehlende Services erwägen</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Konkurrenten-Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Konkurrenten-Ranking
                  </CardTitle>
                  <CardDescription>
                    Sortiert nach Gesamtperformance (Bewertungen + Services)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedCompetitors.map((competitor, index) => (
                      <div key={`${competitor.name}-${index}`} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg font-semibold">
                                #{index + 1} {competitor.name}
                              </span>
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
                              {competitor.website && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate max-w-xs">{competitor.website}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getScoreColor(competitor.score)} mb-1`}>
                              {competitor.score}
                            </div>
                            <Badge variant={getScoreBadge(competitor.score)} className="text-xs">
                              Gesamtscore
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Performance-Score</span>
                              <span className={getScoreColor(competitor.score)}>{competitor.score}/100</span>
                            </div>
                            <Progress value={competitor.score} className="h-2" />
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
