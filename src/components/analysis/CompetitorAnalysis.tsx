import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CompetitorAnalysisProps {
  address: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ address, industry }) => {
  // Simulierte Daten für die Konkurrenzanalyse
  const competitors = [
    {
      name: "Müller GmbH",
      distance: "2.1 km",
      rating: 4.3,
      reviews: 127,
      strength: "stark",
      trend: "up"
    },
    {
      name: "Schmidt & Co",
      distance: "3.5 km", 
      rating: 4.1,
      reviews: 89,
      strength: "mittel",
      trend: "stable"
    },
    {
      name: "Weber Handwerk",
      distance: "4.2 km",
      rating: 3.8,
      reviews: 156,
      strength: "schwach",
      trend: "down"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Konkurrenzanalyse</CardTitle>
          <CardDescription>
            Analyse der Hauptkonkurrenten in der Region um {address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {competitors.map((competitor, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{competitor.name}</h3>
                    <p className="text-sm text-gray-600">{competitor.distance} entfernt</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(competitor.trend)}
                    <Badge variant={competitor.strength === 'stark' ? 'destructive' : competitor.strength === 'mittel' ? 'secondary' : 'default'}>
                      {competitor.strength}
                    </Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">★</span>
                    <span>{competitor.rating}</span>
                    <span className="text-sm text-gray-600">({competitor.reviews} Bewertungen)</span>
                  </div>
                  <Progress value={competitor.rating * 20} className="w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorAnalysis;
