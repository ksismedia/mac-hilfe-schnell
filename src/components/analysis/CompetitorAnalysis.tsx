
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Users, Star, Globe } from 'lucide-react';

interface CompetitorAnalysisProps {
  address: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker';
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ address, industry }) => {
  // Simulierte Konkurrenzanalyse-Daten
  const competitorData = {
    overallScore: 78,
    localCompetitors: [
      {
        name: "Müller Handwerk GmbH",
        distance: "1.2 km",
        rating: 4.3,
        reviews: 89,
        website: "professionell",
        socialMedia: "aktiv",
        ranking: "höher"
      },
      {
        name: "Schmidt & Partner",
        distance: "2.1 km", 
        rating: 4.1,
        reviews: 156,
        website: "basic",
        socialMedia: "wenig aktiv",
        ranking: "ähnlich"
      },
      {
        name: "Handwerksprofi24",
        distance: "3.5 km",
        rating: 3.9,
        reviews: 67,
        website: "veraltet",
        socialMedia: "inaktiv",
        ranking: "niedriger"
      }
    ],
    marketPosition: {
      ranking: 3,
      totalCompetitors: 15,
      marketShare: "12%"
    },
    strengths: [
      "Überdurchschnittliche Google-Bewertungen",
      "Moderne Website-Gestaltung",
      "Gute lokale Sichtbarkeit"
    ],
    weaknesses: [
      "Weniger Bewertungen als Hauptkonkurrenten",
      "Social Media Aktivität ausbaufähig",
      "Begrenzte Online-Präsenz"
    ]
  };

  const getRankingIcon = (ranking: string) => {
    switch (ranking) {
      case "höher": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "niedriger": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getWebsiteQuality = (quality: string) => {
    switch (quality) {
      case "professionell": return "default";
      case "basic": return "secondary";
      default: return "destructive";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Konkurrenzanalyse
            <Badge variant={competitorData.overallScore >= 70 ? "default" : "secondary"}>
              {competitorData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Analyse lokaler Konkurrenten im Umkreis von {address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Marktposition */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Marktposition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    #{competitorData.marketPosition.ranking}
                  </div>
                  <p className="text-sm text-gray-600">
                    von {competitorData.marketPosition.totalCompetitors} lokalen Anbietern
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {competitorData.marketPosition.marketShare}
                  </div>
                  <p className="text-sm text-gray-600">
                    Geschätzter Marktanteil
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    {competitorData.localCompetitors.length}
                  </div>
                  <p className="text-sm text-gray-600">
                    Direkte Konkurrenten
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Konkurrenten-Vergleich */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Lokale Konkurrenten</CardTitle>
              <CardDescription>
                Vergleich mit anderen Anbietern in der Nähe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorData.localCompetitors.map((competitor, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{competitor.name}</h4>
                        <p className="text-sm text-gray-500">{competitor.distance} entfernt</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRankingIcon(competitor.ranking)}
                        <span className="text-sm font-medium capitalize">{competitor.ranking}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Bewertung:</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span className="font-medium">{competitor.rating}</span>
                          <span className="text-gray-500">({competitor.reviews})</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Website:</span>
                        <div className="mt-1">
                          <Badge variant={getWebsiteQuality(competitor.website)} size="sm">
                            {competitor.website}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Social Media:</span>
                        <p className="font-medium">{competitor.socialMedia}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Online-Ranking:</span>
                        <p className="font-medium capitalize">{competitor.ranking}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stärken und Schwächen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Wettbewerbsvorteile</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {competitorData.strengths.map((strength, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600">Verbesserungsbedarf</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {competitorData.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-red-600">×</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorAnalysis;
