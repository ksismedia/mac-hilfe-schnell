
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface OverallRatingProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
}

const OverallRating: React.FC<OverallRatingProps> = ({ businessData, realData }) => {
  const metrics = [
    { name: 'SEO', score: realData.seo.score, weight: 25 },
    { name: 'Performance', score: realData.performance.score, weight: 20 },
    { name: 'Impressum', score: realData.imprint.score, weight: 15 },
    { name: 'Keywords', score: realData.keywords.filter(k => k.found).length * 12.5, weight: 20 },
    { name: 'Bewertungen', score: realData.reviews.google.count > 0 ? 80 : 20, weight: 20 }
  ];

  const overallScore = Math.round(
    metrics.reduce((sum, metric) => sum + (metric.score * metric.weight / 100), 0)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gesamtbewertung - {realData.company.name}</CardTitle>
        <CardDescription>
          Echte Datenanalyse für {realData.company.url}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {Math.round(overallScore/20*10)/10}/5
            </div>
            <Badge variant={overallScore >= 80 ? "default" : overallScore >= 60 ? "secondary" : "destructive"}>
              {overallScore}/100 Punkte
            </Badge>
          </div>

          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{metric.name}</span>
                  <span className="text-sm text-gray-600">{Math.round(metric.score)}/100</span>
                </div>
                <Progress value={metric.score} className="h-2" />
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Echte Datenanalyse</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Website direkt analysiert: {realData.company.url}</li>
              <li>• SEO-Faktoren live geprüft</li>
              <li>• Performance gemessen</li>
              <li>• Impressum rechtlich bewertet</li>
              <li>• Keywords im Inhalt gesucht</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallRating;
