
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface PerformanceAnalysisProps {
  url: string;
}

const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ url }) => {
  // Simulierte Performance-Daten
  const performanceData = {
    loadTime: 2.8,
    firstContentfulPaint: 1.2,
    largestContentfulPaint: 2.5,
    cumulativeLayoutShift: 0.08,
    timeToInteractive: 3.1,
    overallScore: 78,
    recommendations: [
      "Bildkomprimierung optimieren",
      "Nicht verwendetes CSS entfernen",
      "Browser-Caching aktivieren",
      "JavaScript-Dateien minimieren"
    ]
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getLoadTimeColor = (time: number) => {
    if (time <= 2) return "text-green-600";
    if (time <= 4) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Ladezeit-Messung
            <Badge variant={performanceData.overallScore >= 80 ? "default" : performanceData.overallScore >= 60 ? "secondary" : "destructive"}>
              {performanceData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Performance-Analyse für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Hauptmetriken */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className={`text-3xl font-bold ${getLoadTimeColor(performanceData.loadTime)}`}>
                  {performanceData.loadTime}s
                </div>
                <div className="text-sm text-gray-600 mt-1">Gesamte Ladezeit</div>
                <div className="text-xs text-gray-500 mt-1">
                  {performanceData.loadTime <= 2 ? "Sehr gut" : 
                   performanceData.loadTime <= 4 ? "Verbesserungsbedarf" : "Schlecht"}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className={`text-3xl font-bold ${getLoadTimeColor(performanceData.firstContentfulPaint)}`}>
                  {performanceData.firstContentfulPaint}s
                </div>
                <div className="text-sm text-gray-600 mt-1">First Contentful Paint</div>
                <div className="text-xs text-gray-500 mt-1">
                  Erste sichtbare Inhalte
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className={`text-3xl font-bold ${getLoadTimeColor(performanceData.timeToInteractive)}`}>
                  {performanceData.timeToInteractive}s
                </div>
                <div className="text-sm text-gray-600 mt-1">Time to Interactive</div>
                <div className="text-xs text-gray-500 mt-1">
                  Vollständig interaktiv
                </div>
              </div>
            </div>

            <Progress value={performanceData.overallScore} className="h-3" />

            {/* Detaillierte Metriken */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Core Web Vitals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Largest Contentful Paint</span>
                    <div className="text-right">
                      <div className={`font-bold ${getLoadTimeColor(performanceData.largestContentfulPaint)}`}>
                        {performanceData.largestContentfulPaint}s
                      </div>
                      <div className="text-xs text-gray-500">
                        {performanceData.largestContentfulPaint <= 2.5 ? "Gut" : "Verbesserung nötig"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cumulative Layout Shift</span>
                    <div className="text-right">
                      <div className={`font-bold ${performanceData.cumulativeLayoutShift <= 0.1 ? "text-green-600" : "text-red-600"}`}>
                        {performanceData.cumulativeLayoutShift}
                      </div>
                      <div className="text-xs text-gray-500">
                        {performanceData.cumulativeLayoutShift <= 0.1 ? "Gut" : "Verbesserung nötig"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optimierungsempfehlungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {performanceData.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Performance-Verlauf (simuliert) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance-Bewertung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Ladezeit</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-32 h-2" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Interaktivität</span>
                    <div className="flex items-center gap-2">
                      <Progress value={72} className="w-32 h-2" />
                      <span className="text-sm font-medium">72%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Stabilität</span>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="w-32 h-2" />
                      <span className="text-sm font-medium">90%</span>
                    </div>
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

export default PerformanceAnalysis;
