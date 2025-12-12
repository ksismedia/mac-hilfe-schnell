
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { toast } from 'sonner';

interface PerformanceAnalysisProps {
  url: string;
  realData: RealBusinessData;
  onPerformanceUpdate?: (newPerformanceData: RealBusinessData['performance']) => void;
}

const PerformanceAnalysis: React.FC<PerformanceAnalysisProps> = ({ url, realData, onPerformanceUpdate }) => {
  const { reviewStatus, updateReviewStatus } = useAnalysisContext();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [localPerformanceData, setLocalPerformanceData] = useState<RealBusinessData['performance'] | null>(null);
  
  const performanceData = localPerformanceData || realData.performance;

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

  const handleRefreshPerformance = async () => {
    if (!url) {
      toast.error('Keine URL für die Performance-Messung vorhanden');
      return;
    }

    setIsRefreshing(true);
    toast.info('Performance-Messung gestartet... Dies kann 10-25 Sekunden dauern.');

    try {
      const pageSpeedData = await GoogleAPIService.getPageSpeedInsights(url);
      
      if (pageSpeedData?._timeout) {
        toast.warning('Die Messung hat zu lange gedauert. Bitte versuchen Sie es später erneut.');
        setIsRefreshing(false);
        return;
      }

      if (pageSpeedData?.lighthouseResult) {
        const lighthouse = pageSpeedData.lighthouseResult;
        const performanceScore = Math.round((lighthouse.categories?.performance?.score || 0) * 100);
        
        const newPerformanceData: RealBusinessData['performance'] = {
          loadTime: parseFloat((lighthouse.audits?.['speed-index']?.numericValue / 1000 || 3).toFixed(1)),
          lcp: parseFloat((lighthouse.audits?.['largest-contentful-paint']?.numericValue / 1000 || 2.5).toFixed(1)),
          fid: Math.round(lighthouse.audits?.['max-potential-fid']?.numericValue || 100),
          cls: parseFloat((lighthouse.audits?.['cumulative-layout-shift']?.numericValue || 0.1).toFixed(2)),
          score: performanceScore
        };

        setLocalPerformanceData(newPerformanceData);
        
        if (onPerformanceUpdate) {
          onPerformanceUpdate(newPerformanceData);
        }

        toast.success(`Performance-Messung abgeschlossen: ${performanceScore}%`);
      } else {
        toast.error('Keine Performance-Daten erhalten. Bitte versuchen Sie es später erneut.');
      }
    } catch (error) {
      console.error('Performance refresh error:', error);
      toast.error('Fehler bei der Performance-Messung');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              Performance-Analyse (Live-Messung)
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshPerformance}
                disabled={isRefreshing}
                className="ml-2"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Messung läuft...' : 'Neu messen'}
              </Button>
            </div>
            <div 
              className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                performanceData.score >= 90 ? 'bg-yellow-400 text-black' : 
                performanceData.score >= 61 ? 'bg-green-500 text-white' : 
                'bg-red-500 text-white'
              }`}
            >
              {performanceData.score}%
            </div>
          </CardTitle>
          <CardDescription>
            Echte Ladezeiten-Messung für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isRefreshing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Performance-Messung läuft...</p>
                  <p className="text-xs text-blue-600">Dies kann 10-25 Sekunden dauern. Bitte warten.</p>
                </div>
              </div>
            )}

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
                {localPerformanceData && <span className="font-medium"> (Aktualisiert)</span>}
              </p>
            </div>

            {performanceData.score < 60 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Handlungsempfehlungen zur Verbesserung</CardTitle>
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
      
      <AIReviewCheckbox
        categoryName="Performance-Analyse"
        isReviewed={reviewStatus['Performance-Analyse']?.isReviewed || false}
        onReviewChange={(reviewed) => updateReviewStatus('Performance-Analyse', reviewed)}
      />
    </div>
  );
};

export default PerformanceAnalysis;
