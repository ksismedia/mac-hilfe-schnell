
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface CompetitorAnalysisProps {
  address: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  realData: RealBusinessData;
}

const CompetitorAnalysis: React.FC<CompetitorAnalysisProps> = ({ address, industry, realData }) => {
  const extractCityFromAddress = (address: string) => {
    const parts = address.split(',');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    const addressParts = address.trim().split(' ');
    return addressParts[addressParts.length - 1] || 'Ihrer Stadt';
  };

  const city = extractCityFromAddress(address);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Konkurrenzanalyse für {city}</CardTitle>
          <CardDescription>
            Echte Konkurrenten-Suche in der {industry.toUpperCase()}-Branche im Umkreis von {address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {realData.competitors.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <MapPin className="h-12 w-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Keine lokalen Konkurrenten gefunden
              </h3>
              <p className="text-gray-500 mb-4">
                Bei der automatischen Suche konnten keine direkten Konkurrenten in der Nähe von {address} identifiziert werden.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Warum keine Konkurrenten gefunden wurden:</h4>
                <ul className="text-sm text-blue-800 text-left space-y-1">
                  <li>• Begrenzte öffentliche Geschäftsverzeichnisse</li>
                  <li>• Fehlende Google Places API Integration</li>
                  <li>• Spezifische Branchennische</li>
                  <li>• Konkurrenten mit schwacher Online-Präsenz</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {realData.competitors.map((competitor, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{competitor.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {competitor.distance} entfernt
                        </span>
                      </div>
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
          )}

          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Empfehlung für lokale Marktpositionierung</h3>
            <p className="text-sm text-green-800">
              {realData.competitors.length === 0 
                ? "Nutzen Sie die geringe lokale Online-Konkurrenz zu Ihrem Vorteil. Investieren Sie in lokale SEO und Google My Business Optimierung."
                : "Fokussieren Sie sich auf erstklassigen Kundenservice und Online-Bewertungen, um sich von der Konkurrenz abzuheben."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompetitorAnalysis;
