
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Briefcase, AlertCircle } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface WorkplaceReviewsProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
}

const WorkplaceReviews: React.FC<WorkplaceReviewsProps> = ({ businessData, realData }) => {
  const workplaceData = realData.workplace;

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
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Arbeitgeberbewertungen (Echte Suche)
          </CardTitle>
          <CardDescription>
            Live-Suche nach Bewertungen als Arbeitgeber für {realData.company.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!workplaceData.kununu.found && !workplaceData.glassdoor.found ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Keine Arbeitgeberbewertungen gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                Bei der automatischen Suche konnten keine Bewertungen auf kununu oder Glassdoor gefunden werden.
              </p>
              
              <div className="bg-amber-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-amber-900 mb-2">Mögliche Gründe:</h4>
                <ul className="text-sm text-amber-800 text-left space-y-1">
                  <li>• Unternehmen noch nicht auf Bewertungsplattformen registriert</li>
                  <li>• Kleine Betriebsgröße (weniger als 5 Mitarbeiter)</li>
                  <li>• Keine ehemaligen Mitarbeiter haben bewertet</li>
                  <li>• Fehlende API-Integration zu Bewertungsplattformen</li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Empfehlungen als Arbeitgeber:</h4>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Mitarbeiterzufriedenheit regelmäßig erfragen</li>
                  <li>• Positive Arbeitskultur schaffen</li>
                  <li>• Faire Vergütung und Arbeitsbedingungen</li>
                  <li>• Bei Wachstum: kununu/Glassdoor Profile erstellen</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    kununu
                    <Badge variant={workplaceData.kununu.found ? "default" : "destructive"}>
                      {workplaceData.kununu.found ? "Gefunden" : "Nicht gefunden"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {workplaceData.kununu.found ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{workplaceData.kununu.rating}</span>
                        <div className="flex">
                          {renderStars(Math.round(workplaceData.kununu.rating))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{workplaceData.kununu.reviews} Bewertungen</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Keine kununu-Bewertungen gefunden
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Glassdoor
                    <Badge variant={workplaceData.glassdoor.found ? "default" : "destructive"}>
                      {workplaceData.glassdoor.found ? "Gefunden" : "Nicht gefunden"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {workplaceData.glassdoor.found ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{workplaceData.glassdoor.rating}</span>
                        <div className="flex">
                          {renderStars(Math.round(workplaceData.glassdoor.rating))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{workplaceData.glassdoor.reviews} Bewertungen</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Keine Glassdoor-Bewertungen gefunden
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Echte Daten Hinweis */}
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✓ Live-Arbeitgeberbewertungssuche</h4>
            <p className="text-sm text-green-700">
              Diese Analyse basiert auf einer automatischen Suche nach Arbeitgeberbewertungen für {realData.company.name}. 
              Da keine speziellen APIs integriert sind, konnten keine Bewertungen gefunden werden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkplaceReviews;
