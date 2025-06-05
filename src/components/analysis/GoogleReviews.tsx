
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, AlertCircle } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface GoogleReviewsProps {
  address: string;
  realData: RealBusinessData;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ address, realData }) => {
  const reviewData = realData.reviews.google;

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
            Google-Bewertungen (Echte Suche)
            <Badge variant={reviewData.count > 0 ? "default" : "destructive"}>
              {reviewData.count > 0 ? `${reviewData.count} Bewertungen` : "Keine Bewertungen"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Live-Suche nach Google-Bewertungen für {address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reviewData.count === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Keine Google-Bewertungen gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                Bei der automatischen Suche konnten keine Google-Bewertungen für dieses Unternehmen gefunden werden.
              </p>
              
              <div className="bg-amber-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-amber-900 mb-2">Mögliche Gründe:</h4>
                <ul className="text-sm text-amber-800 text-left space-y-1">
                  <li>• Kein Google My Business Eintrag vorhanden</li>
                  <li>• Unternehmen noch nicht beansprucht</li>
                  <li>• Sehr neue Firma ohne Bewertungen</li>
                  <li>• Fehlende Google Places API Integration</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Empfehlungen:</h4>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Google My Business Profil erstellen/beanspruchen</li>
                  <li>• Kunden aktiv um Bewertungen bitten</li>
                  <li>• Exzellenten Service für positive Bewertungen bieten</li>
                  <li>• Bewertungsmanagement-System einführen</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Bewertungsübersicht */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-yellow-600">
                      {reviewData.rating}
                    </span>
                    <div className="flex">
                      {renderStars(Math.round(reviewData.rating))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Durchschnittsbewertung
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {reviewData.count}
                  </div>
                  <p className="text-sm text-gray-600">
                    Gesamte Bewertungen
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {reviewData.recent.length}
                  </div>
                  <p className="text-sm text-gray-600">
                    Aktuelle Bewertungen
                  </p>
                </div>
              </div>

              {/* Aktuelle Bewertungen */}
              {reviewData.recent.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Aktuelle Bewertungen</CardTitle>
                    <CardDescription>
                      Die neuesten Kundenbewertungen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviewData.recent.map((review, index) => (
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
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleReviews;
