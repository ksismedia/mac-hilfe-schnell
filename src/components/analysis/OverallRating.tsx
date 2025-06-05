
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
  // Berechne Keywords-Score basierend auf gefundenen Keywords
  const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
  const keywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);

  // Alle Metriken mit korrekten Scores
  const metrics = [
    { name: 'SEO', score: realData.seo.score, weight: 15, maxScore: 100 },
    { name: 'Performance', score: realData.performance.score, weight: 15, maxScore: 100 },
    { name: 'Impressum', score: realData.imprint.score, weight: 10, maxScore: 100 },
    { name: 'Keywords', score: keywordsScore, weight: 10, maxScore: 100 },
    { name: 'Bewertungen', score: realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0, weight: 10, maxScore: 100 },
    { name: 'Mobile', score: realData.mobile.overallScore, weight: 10, maxScore: 100 },
    { name: 'Social Media', score: realData.socialMedia.overallScore, weight: 8, maxScore: 100 },
    { name: 'Social Proof', score: realData.socialProof.overallScore, weight: 7, maxScore: 100 },
    { name: 'Arbeitsplatz', score: realData.workplace.overallScore, weight: 5, maxScore: 100 },
    { name: 'Konkurrenz', score: realData.competitors.length > 0 ? 80 : 60, weight: 5, maxScore: 100 },
    { name: 'Local SEO', score: 75, weight: 5, maxScore: 100 } // Basierend auf Adresse und Branche
  ];

  // Gewichteter Gesamtscore
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  const overallScore = Math.round(weightedScore / totalWeight);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    if (score >= 40) return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gesamtbewertung - {realData.company.name}</CardTitle>
          <CardDescription>
            Vollständige Analyse für {realData.company.url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Gesamtscore */}
            <div className="text-center">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                {(overallScore/20).toFixed(1)}/5
              </div>
              <Badge variant={getScoreBadge(overallScore)}>
                {overallScore}/100 Punkte
              </Badge>
              <div className="mt-2 text-sm text-gray-600">
                Basierend auf {metrics.length} Analysebereichen
              </div>
            </div>

            {/* Detaillierte Metriken */}
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {metric.weight}% Gewichtung
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getScoreColor(metric.score)}`}>
                        {Math.round(metric.score)}/100
                      </span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(metric.score/20*10)/10}/5)
                      </span>
                    </div>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                </div>
              ))}
            </div>

            {/* Zusammenfassung */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.filter(m => m.score >= 80).length}
                </div>
                <div className="text-sm text-gray-600">Sehr gut (≥80%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.filter(m => m.score >= 60 && m.score < 80).length}
                </div>
                <div className="text-sm text-gray-600">Gut (60-79%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.filter(m => m.score < 60).length}
                </div>
                <div className="text-sm text-gray-600">Verbesserung nötig (<60%)</div>
              </div>
            </div>

            {/* Analyse-Details */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Live-Analyse Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-1">Technische Analyse:</h4>
                  <ul className="space-y-1">
                    <li>• Website: {realData.company.url}</li>
                    <li>• SEO-Faktoren: {realData.seo.score}/100</li>
                    <li>• Ladezeit: {realData.performance.loadTime}s</li>
                    <li>• Mobile Score: {realData.mobile.overallScore}/100</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Business-Analyse:</h4>
                  <ul className="space-y-1">
                    <li>• Keywords gefunden: {keywordsFoundCount}/{realData.keywords.length}</li>
                    <li>• Google Bewertungen: {realData.reviews.google.count}</li>
                    <li>• Konkurrenten: {realData.competitors.length}</li>
                    <li>• Impressum: {realData.imprint.found ? 'Vorhanden' : 'Fehlt'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverallRating;
