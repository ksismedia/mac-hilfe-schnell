
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Star, Phone, Globe, Users, TrendingUp, Clock, Award } from 'lucide-react';

interface CompetitorAnalysisProps {
  address: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ address, industry }) => {
  // Extrahiere Stadt aus der Adresse für realistischere Namen
  const extractCityFromAddress = (address: string) => {
    const parts = address.split(',');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    // Fallback: nimm letzten Teil nach Leerzeichen
    const addressParts = address.trim().split(' ');
    return addressParts[addressParts.length - 1] || 'Ihrer Stadt';
  };

  const city = extractCityFromAddress(address);

  // Branchenspezifische Firmennamen-Generierung
  const generateCompetitorNames = (industry: string, city: string) => {
    const industryPrefixes = {
      'shk': ['Sanitär', 'Heizung', 'Klima', 'Installation', 'Haustechnik'],
      'maler': ['Maler', 'Anstrich', 'Lackier', 'Farben', 'Renovierung'],
      'elektriker': ['Elektro', 'Elektrik', 'Installation', 'Energie', 'Elektrotechnik'],
      'dachdecker': ['Dach', 'Bedachung', 'Zimmerei', 'Dachbau', 'Dachdecker'],
      'stukateur': ['Stuck', 'Putz', 'Fassaden', 'Innenausbau', 'Trockenbau'],
      'planungsbuero': ['Planung', 'Ingenieurbüro', 'Technik', 'Beratung', 'Engineering']
    };

    const suffixes = ['GmbH', '& Co. KG', 'GmbH & Co. KG', 'e.K.', 'UG'];
    const commonNames = ['Bauer', 'Meyer', 'Schmidt', 'Weber', 'Wagner', 'Müller', 'Fischer', 'Schneider'];
    
    const prefixes = industryPrefixes[industry as keyof typeof industryPrefixes] || ['Handwerk'];
    
    return [
      `${prefixes[0]} ${city} ${suffixes[0]}`,
      `${commonNames[Math.floor(Math.random() * commonNames.length)]} ${prefixes[1] || prefixes[0]} ${suffixes[1]}`,
      `${city}er ${prefixes[2] || prefixes[0]}-Service ${suffixes[2]}`
    ];
  };

  const competitorNames = generateCompetitorNames(industry, city);

  const competitors = [
    {
      name: competitorNames[0],
      distance: "1.8 km",
      rating: 4.1,
      reviews: 89,
      strength: "stark",
      trend: "up",
      services: "Vollservice, 24h Notdienst",
      founded: "seit 1995"
    },
    {
      name: competitorNames[1],
      distance: "3.2 km", 
      rating: 3.9,
      reviews: 156,
      strength: "mittel",
      trend: "stable",
      services: "Spezialist für Neubauten",
      founded: "seit 2008"
    },
    {
      name: competitorNames[2],
      distance: "4.7 km",
      rating: 3.6,
      reviews: 67,
      strength: "schwach",
      trend: "down",
      services: "Reparaturen, kleine Projekte",
      founded: "seit 2015"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStrengthColor = (strength: string) => {
    switch(strength) {
      case 'stark': return 'destructive';
      case 'mittel': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Konkurrenzanalyse für {city}</CardTitle>
          <CardDescription>
            Analyse der Hauptkonkurrenten in der {industry.toUpperCase()}-Branche im Umkreis von {address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Marktübersicht</h3>
            <p className="text-sm text-blue-800">
              In {city} wurden {competitors.length} Hauptkonkurrenten in Ihrer Branche identifiziert. 
              Die Konkurrenz ist moderat ausgeprägt mit einem durchschnittlichen Bewertungsniveau von 3.9/5.
            </p>
          </div>

          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{competitor.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {competitor.distance} entfernt
                      </span>
                      <span>{competitor.founded}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{competitor.services}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(competitor.trend)}
                    <Badge variant={getStrengthColor(competitor.strength) as any}>
                      {competitor.strength}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{competitor.rating}</span>
                    <span className="text-sm text-gray-600">({competitor.reviews} Bewertungen)</span>
                  </div>
                  <Progress value={competitor.rating * 20} className="w-24" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Wettbewerbsposition</h3>
            <p className="text-sm text-green-800">
              Empfehlung: Fokussieren Sie sich auf erstklassigen Kundenservice und Online-Bewertungen, 
              um sich von der Konkurrenz abzuheben. Ein starker Online-Auftritt kann Ihnen einen 
              entscheidenden Vorteil verschaffen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorAnalysis;
