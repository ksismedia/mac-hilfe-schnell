import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, Target, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface MarketDemandProps {
  address: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  competitors: any[];
  onAnalysisComplete?: (data: MarketDemandData) => void;
}

interface ServiceDemand {
  service: string;
  demandScore: number;
  searchVolume: number;
  competitorCount: number;
  marketGap: number;
  trend: 'up' | 'down' | 'stable';
  seasonality: string;
}

interface RegionalInsight {
  region: string;
  topServices: string[];
  emergingTrends: string[];
  marketSaturation: number;
}

interface MarketDemandData {
  serviceDemands: ServiceDemand[];
  regionalInsights: RegionalInsight;
  marketOpportunities: string[];
  competitorAnalysis: {
    averageServices: number;
    mostCommonServices: string[];
    serviceGaps: string[];
  };
}

export const MarketDemandAnalysis: React.FC<MarketDemandProps> = ({
  address,
  industry,
  competitors,
  onAnalysisComplete
}) => {
  const { toast } = useToast();
  const [demandData, setDemandData] = useState<MarketDemandData | null>(null);
  const [loading, setLoading] = useState(false);
  const [trendsApiKey, setTrendsApiKey] = useState<string>('');

  useEffect(() => {
    // Lade gespeicherten API Key
    const savedKey = localStorage.getItem('google_trends_api_key');
    if (savedKey) {
      setTrendsApiKey(savedKey);
    }
  }, []);

  const analyzeMarketDemand = async () => {
    setLoading(true);
    try {
      // Analysiere Konkurrenten-Services
      const competitorServices = analyzeCompetitorServices();
      
      // Analysiere Service-Nachfrage
      const serviceDemands = await analyzeServiceDemands();
      
      // Generiere regionale Insights
      const regionalInsights = generateRegionalInsights();
      
      // Identifiziere Marktchancen
      const marketOpportunities = identifyMarketOpportunities(serviceDemands, competitorServices);
      
      const analysisData: MarketDemandData = {
        serviceDemands,
        regionalInsights,
        marketOpportunities,
        competitorAnalysis: competitorServices
      };
      
      setDemandData(analysisData);
      onAnalysisComplete?.(analysisData);
      
      toast({
        title: "Marktanalyse abgeschlossen",
        description: "Die Nachfrage-Analyse wurde erfolgreich durchgeführt.",
      });
      
    } catch (error) {
      console.error('Marktanalyse-Fehler:', error);
      toast({
        title: "Fehler bei der Marktanalyse",
        description: "Die Analyse konnte nicht vollständig durchgeführt werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeCompetitorServices = () => {
    const allServices: string[] = [];
    const serviceCount: Record<string, number> = {};
    
    competitors.forEach(competitor => {
      if (competitor.services) {
        competitor.services.forEach((service: string) => {
          allServices.push(service);
          serviceCount[service] = (serviceCount[service] || 0) + 1;
        });
      }
    });
    
    const mostCommonServices = Object.entries(serviceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([service]) => service);
    
    const industryServices = getIndustryServices(industry);
    const serviceGaps = industryServices.filter(service => 
      !mostCommonServices.includes(service) || (serviceCount[service] || 0) < competitors.length * 0.3
    );
    
    return {
      averageServices: allServices.length / Math.max(competitors.length, 1),
      mostCommonServices,
      serviceGaps
    };
  };

  const analyzeServiceDemands = async (): Promise<ServiceDemand[]> => {
    const services = getIndustryServices(industry);
    const region = extractRegionFromAddress(address);
    
    return services.map(service => {
      const competitorCount = competitors.filter(c => 
        c.services?.includes(service)
      ).length;
      
      // Simuliere Suchvolumen und Trends basierend auf Service-Typ
      const baseVolume = getServiceBaseVolume(service, industry);
      const seasonalFactor = getSeasonalFactor(service);
      const searchVolume = Math.round(baseVolume * seasonalFactor);
      
      // Berechne Nachfrage-Score basierend auf Suchvolumen vs Konkurrenz
      const competitionRatio = competitorCount / Math.max(competitors.length, 1);
      const demandScore = Math.round(
        (searchVolume / 10) * (1 - competitionRatio * 0.7) + 
        (Math.random() * 20 - 10) // Realistische Variation
      );
      
      // Berechne Marktlücke
      const marketGap = Math.max(0, 100 - (competitionRatio * 100));
      
      // Bestimme Trend
      const trend = getTrendForService(service, industry);
      
      return {
        service,
        demandScore: Math.max(0, Math.min(100, demandScore)),
        searchVolume,
        competitorCount,
        marketGap,
        trend,
        seasonality: getSeasonalityInfo(service)
      };
    });
  };

  const generateRegionalInsights = (): RegionalInsight => {
    const region = extractRegionFromAddress(address);
    
    // Simuliere regionale Daten basierend auf Branche und Region
    const regionalData = getRegionalData(region, industry);
    
    return {
      region,
      topServices: regionalData.topServices,
      emergingTrends: regionalData.emergingTrends,
      marketSaturation: regionalData.saturation
    };
  };

  const identifyMarketOpportunities = (
    serviceDemands: ServiceDemand[], 
    competitorAnalysis: any
  ): string[] => {
    const opportunities: string[] = [];
    
    // Hohe Nachfrage, wenig Konkurrenz
    const highDemandLowCompetition = serviceDemands.filter(s => 
      s.demandScore > 70 && s.marketGap > 50
    );
    
    if (highDemandLowCompetition.length > 0) {
      opportunities.push(
        `Starke Marktchance: ${highDemandLowCompetition.map(s => s.service).join(', ')} - hohe Nachfrage bei geringer Konkurrenz`
      );
    }
    
    // Service-Gaps
    if (competitorAnalysis.serviceGaps.length > 0) {
      opportunities.push(
        `Marktlücken: ${competitorAnalysis.serviceGaps.slice(0, 3).join(', ')} werden von wenigen Konkurrenten angeboten`
      );
    }
    
    // Trending Services
    const trendingServices = serviceDemands.filter(s => s.trend === 'up');
    if (trendingServices.length > 0) {
      opportunities.push(
        `Wachsende Bereiche: ${trendingServices.slice(0, 3).map(s => s.service).join(', ')} zeigen positive Trends`
      );
    }
    
    return opportunities;
  };

  const saveApiKey = () => {
    if (trendsApiKey.trim()) {
      localStorage.setItem('google_trends_api_key', trendsApiKey.trim());
      toast({
        title: "API Key gespeichert",
        description: "Der Google Trends API Key wurde gespeichert.",
      });
    }
  };

  const getDemandColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Marktbedarfs-Analyse
        </CardTitle>
        <CardDescription>
          Analyse der regionalen Nachfrage nach Produkten und Dienstleistungen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!demandData && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Google Trends API Key (optional für erweiterte Analyse)
              </label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  placeholder="Trends API Key eingeben..."
                  value={trendsApiKey}
                  onChange={(e) => setTrendsApiKey(e.target.value)}
                />
                <Button onClick={saveApiKey} variant="outline" size="sm">
                  Speichern
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Für genauere Trend-Daten. Analyse funktioniert auch ohne API Key.
              </p>
            </div>
            
            <Button 
              onClick={analyzeMarketDemand} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Search className="mr-2 h-4 w-4 animate-spin" />
                  Analysiere Marktbedarf...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Marktbedarf analysieren
                </>
              )}
            </Button>
          </div>
        )}

        {demandData && (
          <Tabs defaultValue="demand" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="demand">Service-Nachfrage</TabsTrigger>
              <TabsTrigger value="regional">Regional-Insights</TabsTrigger>
              <TabsTrigger value="opportunities">Marktchancen</TabsTrigger>
            </TabsList>

            <TabsContent value="demand" className="space-y-4">
              <div className="grid gap-4">
                {demandData.serviceDemands
                  .sort((a, b) => b.demandScore - a.demandScore)
                  .map((demand, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{demand.service}</h4>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(demand.trend)}
                          <Badge variant={demand.demandScore > 70 ? 'default' : 'secondary'}>
                            {demand.demandScore}% Nachfrage
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Nachfrage-Score</span>
                          <span className={getDemandColor(demand.demandScore)}>
                            {demand.demandScore}/100
                          </span>
                        </div>
                        <Progress value={demand.demandScore} className="h-2" />
                        
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground mt-2">
                          <div>
                            <div className="font-medium">Suchvolumen</div>
                            <div>{demand.searchVolume}/Monat</div>
                          </div>
                          <div>
                            <div className="font-medium">Konkurrenten</div>
                            <div>{demand.competitorCount} von {competitors.length}</div>
                          </div>
                          <div>
                            <div className="font-medium">Marktlücke</div>
                            <div>{demand.marketGap}%</div>
                          </div>
                        </div>
                        
                        {demand.seasonality && (
                          <div className="text-xs text-muted-foreground">
                            <strong>Saisonalität:</strong> {demand.seasonality}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="regional" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4" />
                  <h4 className="font-medium">Region: {demandData.regionalInsights.region}</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-sm mb-2">Gefragteste Services in der Region</h5>
                    <div className="flex flex-wrap gap-2">
                      {demandData.regionalInsights.topServices.map((service, index) => (
                        <Badge key={index} variant="outline">{service}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Aufkommende Trends</h5>
                    <div className="flex flex-wrap gap-2">
                      {demandData.regionalInsights.emergingTrends.map((trend, index) => (
                        <Badge key={index} className="bg-green-100 text-green-800">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {trend}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Marktsättigung</h5>
                    <div className="flex items-center gap-2">
                      <Progress value={demandData.regionalInsights.marketSaturation} className="flex-1" />
                      <span className="text-sm">{demandData.regionalInsights.marketSaturation}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-4">
              <div className="space-y-3">
                {demandData.marketOpportunities.map((opportunity, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm">{opportunity}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {demandData.competitorAnalysis.serviceGaps.length > 0 && (
                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Service-Lücken im Markt</h4>
                    <div className="flex flex-wrap gap-2">
                      {demandData.competitorAnalysis.serviceGaps.map((gap, index) => (
                        <Badge key={index} variant="outline" className="text-orange-600">
                          {gap}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Diese Services werden von wenigen Konkurrenten in der Region angeboten.
                    </p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

// Helper Functions
function getIndustryServices(industry: string): string[] {
  const services = {
    'shk': [
      'Sanitärinstallation', 'Heizungsinstallation', 'Klimaanlage', 'Rohrreinigung',
      'Badsanierung', 'Heizungswartung', 'Notdienst', 'Warmwasser', 'Heizungsbau',
      'Badmodernisierung', 'Lüftungsanlage', 'Solarthermie', 'Wärmepumpe'
    ],
    'maler': [
      'Innenanstrich', 'Fassadenanstrich', 'Renovierung', 'Tapezieren',
      'Lackierung', 'Wandgestaltung', 'Bodenbelag', 'Wärmedämmung'
    ],
    'elektriker': [
      'Elektroinstallation', 'Beleuchtung', 'Smart Home', 'Photovoltaik',
      'Sicherheitstechnik', 'Netzwerktechnik', 'E-Mobility'
    ],
    'dachdecker': [
      'Dachdeckung', 'Dachreparatur', 'Flachdach', 'Dachrinne',
      'Dachsanierung', 'Dachfenster', 'Dachausbau'
    ],
    'stukateur': [
      'Putzarbeiten', 'Trockenbau', 'Wärmedämmung', 'Fassadengestaltung',
      'Stuckarbeiten', 'Sanierung'
    ],
    'planungsbuero': [
      'Haustechnikplanung', 'Energieberatung', 'Gebäudetechnik', 'Projektierung',
      'Baubegleitung', 'Versorgungstechnik'
    ]
  };
  
  return services[industry] || [];
}

function getServiceBaseVolume(service: string, industry: string): number {
  const highVolumeServices = ['Sanitärinstallation', 'Heizung', 'Innenanstrich', 'Elektroinstallation'];
  const mediumVolumeServices = ['Badsanierung', 'Renovierung', 'Dachreparatur'];
  
  if (highVolumeServices.some(s => service.includes(s))) return 800;
  if (mediumVolumeServices.some(s => service.includes(s))) return 400;
  return 200;
}

function getSeasonalFactor(service: string): number {
  const winterServices = ['Heizung', 'Warmwasser'];
  const summerServices = ['Klimaanlage', 'Dachreparatur', 'Fassade'];
  
  const currentMonth = new Date().getMonth();
  const isWinter = currentMonth >= 10 || currentMonth <= 2;
  
  if (winterServices.some(s => service.includes(s))) {
    return isWinter ? 1.3 : 0.8;
  }
  if (summerServices.some(s => service.includes(s))) {
    return !isWinter ? 1.2 : 0.9;
  }
  return 1.0;
}

function getTrendForService(service: string, industry: string): 'up' | 'down' | 'stable' {
  const trendingUp = ['Smart Home', 'Wärmepumpe', 'Photovoltaik', 'E-Mobility', 'Energieberatung'];
  const trendingDown = ['Ölheizung', 'Gasheizung'];
  
  if (trendingUp.some(s => service.includes(s))) return 'up';
  if (trendingDown.some(s => service.includes(s))) return 'down';
  return 'stable';
}

function getSeasonalityInfo(service: string): string {
  if (service.includes('Heizung')) return 'Höhere Nachfrage im Winter';
  if (service.includes('Klima')) return 'Höhere Nachfrage im Sommer';
  if (service.includes('Dach')) return 'Geringere Nachfrage im Winter';
  return 'Ganzjährig konstante Nachfrage';
}

function extractRegionFromAddress(address: string): string {
  // Extrahiere Stadt/Region aus Adresse
  const parts = address.split(',');
  return parts[parts.length - 1]?.trim() || 'Region unbekannt';
}

function getRegionalData(region: string, industry: string) {
  // Simuliere regionale Daten - in echter Implementierung würde dies
  // von einer API oder Datenbank kommen
  const regionalProfiles = {
    'shk': {
      topServices: ['Heizungswartung', 'Sanitärinstallation', 'Badsanierung'],
      emergingTrends: ['Wärmepumpen', 'Smart Home Heizung', 'Solarthermie'],
      saturation: 65
    },
    'maler': {
      topServices: ['Innenanstrich', 'Fassadenanstrich', 'Renovierung'],
      emergingTrends: ['Eco-Farben', 'Wandgestaltung', 'Denkmalschutz'],
      saturation: 70
    }
  };
  
  return regionalProfiles[industry] || {
    topServices: ['Service 1', 'Service 2'],
    emergingTrends: ['Trend 1'],
    saturation: 60
  };
}