
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Star, AlertCircle, RefreshCw, Key } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { GoogleAPIService } from '@/services/GoogleAPIService';

interface GoogleReviewsProps {
  address: string;
  realData: RealBusinessData;
  onReviewsUpdate?: (reviews: { rating: number; count: number; recent: any[] }) => void;
}

const GoogleReviews: React.FC<GoogleReviewsProps> = ({ address, realData, onReviewsUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [realTimeData, setRealTimeData] = useState<any>(null);

  useEffect(() => {
    setHasApiKey(GoogleAPIService.hasApiKey());
  }, []);

  const reviewData = realTimeData?.reviews?.google || realData.reviews.google;

  const handleRefreshData = async () => {
    if (!GoogleAPIService.hasApiKey()) {
      console.warn('Keine Google API Key verfügbar - kann keine echten Daten abrufen');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Versuche Google Places Daten zu laden für:', address);
      const placeData = await GoogleAPIService.getPlaceDetails(address);
      
      if (placeData) {
        console.log('Google Places Daten erfolgreich geladen:', placeData);
        
        const googleReviewsData = {
          count: placeData.user_ratings_total || 0,
          rating: placeData.rating || 0,
          recent: placeData.reviews?.slice(0, 5).map((review: any) => ({
            author: review.author_name,
            rating: review.rating,
            text: review.text,
            date: new Date(review.time * 1000).toLocaleDateString('de-DE')
          })) || []
        };
        
        const processedData = {
          reviews: {
            google: googleReviewsData
          }
        };
        
        setRealTimeData(processedData);
        
        // Propagate updated reviews to parent
        if (onReviewsUpdate) {
          onReviewsUpdate(googleReviewsData);
        }
      } else {
        console.warn('Keine Google Places Daten verfügbar');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Google Places Daten:', error);
    } finally {
      setIsLoading(false);
    }
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
            <span className="flex items-center gap-2">
              Google-Bewertungen
              {realTimeData && (
                <Badge variant="default" className="bg-green-600">
                  Live-Daten
                </Badge>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={reviewData.count > 0 ? "default" : "destructive"}>
                {reviewData.count > 0 ? `${reviewData.count} Bewertungen` : "Keine Bewertungen"}
              </Badge>
              {hasApiKey && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleRefreshData}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Aktualisieren
                </Button>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            {hasApiKey ? (
              <span className="flex items-center gap-2">
                <Key className="h-4 w-4 text-green-600" />
                Google Places API verbunden - Live-Suche für {address}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Key className="h-4 w-4 text-amber-600" />
                Simulierte Daten - Für echte Daten Google API Key hinzufügen
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasApiKey && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <h4 className="font-semibold text-amber-900">Google API Key fehlt</h4>
              </div>
              <p className="text-sm text-amber-800 mb-2">
                Für echte Google-Bewertungen wird ein Google Places API Key benötigt.
              </p>
              <p className="text-xs text-amber-700">
                Aktuell werden realistische Beispieldaten angezeigt.
              </p>
            </div>
          )}

          {reviewData.count === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Keine Google-Bewertungen gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                {hasApiKey 
                  ? "Bei der Live-Suche konnten keine Google-Bewertungen gefunden werden."
                  : "Simulierte Daten zeigen keine Bewertungen für dieses Beispiel."
                }
              </p>
              
              <div className="bg-amber-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-amber-900 mb-2">Mögliche Gründe:</h4>
                <ul className="text-sm text-amber-800 text-left space-y-1">
                  <li>• Kein Google My Business Eintrag vorhanden</li>
                  <li>• Unternehmen noch nicht beansprucht</li>
                  <li>• Sehr neue Firma ohne Bewertungen</li>
                  {!hasApiKey && <li>• Fehlende Google Places API Integration</li>}
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Handlungsempfehlungen:</h4>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Google My Business Profil erstellen/beanspruchen</li>
                  <li>• Kunden aktiv um Bewertungen bitten</li>
                  <li>• Exzellenten Service für positive Bewertungen bieten</li>
                  <li>• Bewertungsmanagement-System einführen</li>
                  {!hasApiKey && <li>• Google Places API Key für echte Daten hinzufügen</li>}
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
                      {realTimeData && " (Live-Daten von Google)"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviewData.recent.map((review: any, index: number) => (
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

              {/* Bewertungserklärung */}
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">So wird der Google-Bewertungs-Score berechnet</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-blue-800 mb-2">Bewertungsgüte (40% Gewichtung)</p>
                      <p className="text-blue-700 mb-1">Berechnung: (Sterne / 5) × 40 Punkte</p>
                      <p className="text-blue-700">Bonus: +5 Punkte für Ratings zwischen 4.2–4.8★ (authentischer Bereich)</p>
                    </div>
                    <div>
                      <p className="font-medium text-blue-800 mb-2">Anzahl Bewertungen (60% Gewichtung)</p>
                      <ul className="text-blue-700 space-y-0.5">
                        <li>• 200+ Bewertungen: 60 Punkte (Exzellent)</li>
                        <li>• 100–199: 48 Punkte (Sehr gut)</li>
                        <li>• 50–99: 35 Punkte (Gut)</li>
                        <li>• 30–49: 25 Punkte (Akzeptabel)</li>
                        <li>• 10–29: 15 Punkte (Ausbaufähig)</li>
                        <li>• 1–9: 5 Punkte (Kritisch)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs text-blue-600">
                      Die Anzahl der Bewertungen wird stärker gewichtet, da viele Bewertungen im Handwerk ein stärkeres Vertrauenssignal sind als eine perfekte Durchschnittsnote.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* API Status Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                  <span>
                    {hasApiKey 
                      ? "Live-Daten von Google Places API"
                      : "Simulierte Daten - Für echte Daten API Key hinzufügen"
                    }
                  </span>
                  {realTimeData && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Zuletzt aktualisiert: {new Date().toLocaleTimeString('de-DE')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleReviews;
