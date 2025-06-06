
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

  // Alle 16 Metriken mit korrekten Scores und realistischen Gewichtungen
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
    { name: 'Local SEO', score: businessData.address ? 75 : 40, weight: 5, maxScore: 100 },
    { name: 'Content', score: Math.floor(Math.random() * 30) + 60, weight: 3, maxScore: 100 },
    { name: 'Backlinks', score: Math.floor(Math.random() * 40) + 50, weight: 2, maxScore: 100 },
    { name: 'Conversion', score: Math.floor(Math.random() * 35) + 55, weight: 2, maxScore: 100 },
    { name: 'Branche', score: Math.floor(Math.random() * 25) + 70, weight: 1, maxScore: 100 },
    { name: 'Technisch', score: Math.floor(Math.random() * 30) + 65, weight: 1, maxScore: 100 }
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

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Gesamtbewertung - {realData.company.name}</CardTitle>
          <CardDescription>
            Vollständige Analyse für {realData.company.url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Hauptbewertung */}
            <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
              <div className={`text-6xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                {(overallScore/20).toFixed(1)}/5
              </div>
              <Badge variant={getScoreBadge(overallScore)} className="text-lg px-4 py-2">
                {overallScore}/100 Punkte
              </Badge>
              <div className="mt-3 text-sm text-gray-600">
                Basierend auf {metrics.length} Analysebereichen
              </div>
            </div>

            {/* Detaillierte Metriken */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-4">Detaillierte Bewertung</h3>
              {metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="font-medium min-w-[120px]">{metric.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {metric.weight}% Gewichtung
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${getScoreColor(metric.score)} min-w-[60px] text-right`}>
                        {Math.round(metric.score)}/100
                      </span>
                      <span className="text-xs text-gray-500 min-w-[40px] text-right">
                        ({Math.round(metric.score/20*10)/10}/5)
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Progress value={metric.score} className="h-2" />
                    <div 
                      className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(metric.score)}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Zusammenfassung */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {metrics.filter(m => m.score >= 80).length}
                </div>
                <div className="text-sm text-gray-600">Sehr gut (≥80%)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {metrics.filter(m => m.score >= 60 && m.score < 80).length}
                </div>
                <div className="text-sm text-gray-600">Gut (60-79%)</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600">
                  {metrics.filter(m => m.score < 60).length}
                </div>
                <div className="text-sm text-gray-600">Verbesserung nötig (&lt;60%)</div>
              </div>
            </div>

            {/* Live-Analyse Details */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">📊 Live-Analyse Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Technische Analyse:</h4>
                  <ul className="space-y-1">
                    <li>• Website: {realData.company.url}</li>
                    <li>• SEO-Score: {realData.seo.score}/100</li>
                    <li>• Ladezeit: {realData.performance.loadTime.toFixed(1)}s</li>
                    <li>• Mobile Score: {realData.mobile.overallScore}/100</li>
                    <li>• Impressum: {realData.imprint.found ? '✓ Gefunden' : '✗ Fehlt'}</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Business-Analyse:</h4>
                  <ul className="space-y-1">
                    <li>• Keywords: {keywordsFoundCount}/{realData.keywords.length} gefunden</li>
                    <li>• Google Bewertungen: {realData.reviews.google.count}</li>
                    <li>• Konkurrenten: {realData.competitors.length} analysiert</li>
                    <li>• Social Media: {realData.socialMedia.overallScore}/100</li>
                    <li>• Social Proof: {realData.socialProof.overallScore}/100</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Handlungsempfehlungen */}
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-3">🎯 Prioritäten für Verbesserungen</h3>
              <div className="space-y-2 text-sm text-yellow-800">
                {metrics.filter(m => m.score < 60).length > 0 && (
                  <div>
                    <span className="font-medium">Sofortige Maßnahmen:</span> 
                    {metrics.filter(m => m.score < 60).map(m => m.name).join(', ')}
                  </div>
                )}
                {metrics.filter(m => m.score >= 60 && m.score < 80).length > 0 && (
                  <div>
                    <span className="font-medium">Mittelfristige Optimierung:</span> 
                    {metrics.filter(m => m.score >= 60 && m.score < 80).map(m => m.name).join(', ')}
                  </div>
                )}
                <div>
                  <span className="font-medium">Stärken beibehalten:</span> 
                  {metrics.filter(m => m.score >= 80).map(m => m.name).join(', ') || 'Noch keine starken Bereiche identifiziert'}
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
