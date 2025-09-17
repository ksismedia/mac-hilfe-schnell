
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface PerformanceAnalysisProps {
  url: string;
  realData: RealBusinessData;
}

const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ url, realData }) => {
  const performanceData = realData.performance;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "score-text-high";   // 90-100% gold
    if (score >= 61) return "score-text-medium"; // 61-89% grün
    return "score-text-low";                     // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "secondary";        // gold (90-100%)
    if (score >= 61) return "default";          // grün (61-89%)
    return "destructive";                       // rot (0-60%)
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Performance-Analyse (Live-Messung)
            <Badge variant={getScoreBadge(performanceData.score)}>
              {performanceData.score}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Echte Ladezeiten-Messung für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Ladezeit-Metriken</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Ladezeit gesamt:</span>
                    <span className={`font-bold ${getScoreColor(100 - performanceData.loadTime * 20)}`}>
                      {performanceData.loadTime}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Largest Contentful Paint:</span>
                    <span className="font-medium">{performanceData.lcp}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">First Input Delay:</span>
                    <span className="font-medium">{performanceData.fid}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Cumulative Layout Shift:</span>
                    <span className="font-medium">{performanceData.cls}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(performanceData.score)}`}>
                      {performanceData.score}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">von 100 Punkten</div>
                    <Progress value={performanceData.score} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">✓ Live-Performance-Messung</h4>
              <p className="text-sm text-blue-700">
                Diese Werte wurden direkt beim Aufruf von {url} gemessen und spiegeln die reale Performance wider.
              </p>
            </div>

            {performanceData.score < 60 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Verbesserungsempfehlungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {performanceData.loadTime > 3 && (
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">×</span>
                        <span>Ladezeit über 3 Sekunden - Optimierung der Website-Geschwindigkeit empfohlen</span>
                      </li>
                    )}
                    {performanceData.lcp > 2.5 && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span>LCP-Wert verbesserungsbedürftig - Bilder und Inhalte optimieren</span>
                      </li>
                    )}
                    {performanceData.cls > 0.1 && (
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span>Layout-Verschiebungen reduzieren für bessere Nutzererfahrung</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceAnalysis;
