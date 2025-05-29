
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

interface GoogleReviewsProps {
  address: string;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ address }) => {
  // Simulierte Google-Bewertungsdaten
  const reviewData = {
    averageRating: 4.6,
    totalReviews: 127,
    ratingDistribution: {
      5: 78,
      4: 32,
      3: 12,
      2: 3,
      1: 2
    },
    recentReviews: [
      {
        author: "Maria S.",
        rating: 5,
        date: "vor 2 Tagen",
        text: "Sehr professionelle Arbeit! Der Installateur war pünktlich und hat alles sauber erledigt. Die neue Heizung funktioniert einwandfrei."
      },
      {
        author: "Thomas M.",
        rating: 4,
        date: "vor 1 Woche",
        text: "Guter Service, faire Preise. Kleiner Abzug für die etwas längere Wartezeit auf den Termin."
      },
      {
        author: "Jennifer K.",
        rating: 5,
        date: "vor 2 Wochen",
        text: "Absolut empfehlenswert! Schnelle Hilfe beim Notdienst und sehr kompetente Beratung."
      }
    ],
    overallScore: 92
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Google-Bewertungen
            <Badge variant={reviewData.overallScore >= 80 ? "default" : reviewData.overallScore >= 60 ? "secondary" : "destructive"}>
              {reviewData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Bewertungsanalyse für {address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Bewertungsübersicht */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-4xl font-bold text-yellow-600">
                    {reviewData.averageRating}
                  </span>
                  <div className="flex">
                    {renderStars(Math.round(reviewData.averageRating))}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Durchschnittsbewertung
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {reviewData.totalReviews}
                </div>
                <p className="text-sm text-gray-600">
                  Gesamte Bewertungen
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round((reviewData.ratingDistribution[5] / reviewData.totalReviews) * 100)}%
                </div>
                <p className="text-sm text-gray-600">
                  5-Sterne-Bewertungen
                </p>
              </div>
            </div>

            {/* Bewertungsverteilung */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bewertungsverteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm font-medium">{stars}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      </div>
                      <Progress 
                        value={(reviewData.ratingDistribution[stars] / reviewData.totalReviews) * 100} 
                        className="flex-1 h-2"
                      />
                      <span className="text-sm text-gray-600 w-8">
                        {reviewData.ratingDistribution[stars]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Aktuelle Bewertungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktuelle Bewertungen</CardTitle>
                <CardDescription>
                  Die 3 neuesten Kundenbewertungen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewData.recentReviews.map((review, index) => (
                    <div key={index} className="border-b last:border-b-0 pb-4 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{review.author}</span>
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{review.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bewertungsanalyse */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bewertungsanalyse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Stärken</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Sehr hohe Kundenzufriedenheit (4,6/5)</li>
                      <li>• Pünktlichkeit wird oft gelobt</li>
                      <li>• Professionelle Arbeitsweise</li>
                      <li>• Zuverlässiger Notdienst</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-yellow-600">Verbesserungspotential</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Wartezeiten bei Terminen verkürzen</li>
                      <li>• Mehr aktive Bewertungsanfragen</li>
                      <li>• Antworten auf Bewertungen</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleReviews;
