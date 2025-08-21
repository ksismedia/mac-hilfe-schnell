
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData, StaffQualificationData, QuoteResponseData } from '@/hooks/useManualData';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateLocalSEOScore, calculateStaffQualificationScore, calculateQuoteResponseScore, calculateWorkplaceScore } from './export/scoreCalculations';

interface OverallRatingProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management';
  };
  realData: RealBusinessData;
  manualSocialData?: ManualSocialData | null;
  keywordsScore?: number | null;
  staffQualificationData?: StaffQualificationData | null;
  quoteResponseData?: QuoteResponseData | null;
  manualWorkplaceData?: any;
}

const OverallRating: React.FC<OverallRatingProps> = ({ businessData, realData, manualSocialData, keywordsScore, staffQualificationData, quoteResponseData, manualWorkplaceData }) => {
  // Keywords-Score - use provided score or calculate default
  const keywordsFoundCount = realData.keywords.filter(k => k.found).length;
  const defaultKeywordsScore = Math.round((keywordsFoundCount / realData.keywords.length) * 100);
  const currentKeywordsScore = keywordsScore ?? defaultKeywordsScore;

  // Social Media Score - VEREINFACHT
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  
  // Local SEO Score - STRENGE BEWERTUNG MIT HÖCHSTER GEWICHTUNG
  const localSEOScore = calculateLocalSEOScore(businessData, realData);

  // Workplace Score - korrigierte Berechnung verwenden
  const workplaceScore = calculateWorkplaceScore(realData, manualWorkplaceData);

  // Staff Qualification Score - nur bewerten wenn Daten vorhanden
  const staffQualificationScore = calculateStaffQualificationScore(staffQualificationData);
  const quoteResponseScore = calculateQuoteResponseScore(quoteResponseData);

  // Alle Metriken - MIT MITARBEITERQUALIFIZIERUNG (nur wenn Daten vorhanden)
  const baseMetrics = [
    { name: 'Local SEO', score: localSEOScore, weight: 24, maxScore: 100 }, // HÖCHSTE GEWICHTUNG für Handwerk
    { name: 'SEO', score: realData.seo.score, weight: 14, maxScore: 100 },
    { name: 'Performance', score: realData.performance.score, weight: 11, maxScore: 100 },
    { name: 'Impressum', score: realData.imprint.score, weight: 9, maxScore: 100 },
    { name: 'Keywords', score: currentKeywordsScore, weight: 8, maxScore: 100 },
    { name: 'Bewertungen', score: realData.reviews.google.count > 0 ? Math.min(100, realData.reviews.google.rating * 20) : 0, weight: 7, maxScore: 100 },
    { name: 'Mobile', score: realData.mobile.overallScore, weight: 6, maxScore: 100 },
    { name: 'Social Media', score: socialMediaScore, weight: 6, maxScore: 100 },
    { name: 'Social Proof', score: realData.socialProof.overallScore, weight: 4, maxScore: 100 },
    { name: 'Arbeitsplatz', score: workplaceScore, weight: 2, maxScore: 100 },
    { name: 'Konkurrenz', score: realData.competitors.length > 0 ? 80 : 60, weight: 1, maxScore: 100 }
  ];

  // Füge nur bewertete Bereiche hinzu
  const metrics = [...baseMetrics];
  
  if (staffQualificationScore !== null) {
    metrics.push({ name: 'Personal', score: staffQualificationScore, weight: 8, maxScore: 100 });
  }
  
  if (quoteResponseScore !== null) {
    metrics.push({ name: 'Angebotsbearbeitung', score: quoteResponseScore, weight: 6, maxScore: 100 });
  }

  // Gewichteter Gesamtscore
  const totalWeight = metrics.reduce((sum, metric) => sum + metric.weight, 0);
  const weightedScore = metrics.reduce((sum, metric) => sum + (metric.score * metric.weight), 0);
  const overallScore = Math.round(weightedScore / totalWeight);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'score-text-high';
    if (score >= 60) return 'score-text-medium';
    return 'score-text-low';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'secondary'; // gelb
    if (score >= 60) return 'default'; // grün
    return 'destructive'; // rot
  };

  // Prüfung ob Social Media Daten vorhanden
  const hasSocialData = Boolean(manualSocialData && (
    manualSocialData.facebookUrl || manualSocialData.instagramUrl || 
    manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl
  ));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gesamtbewertung - {realData.company.name}</CardTitle>
          <CardDescription>
            Vollständige Analyse für {realData.company.url}
            {hasSocialData && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                ✅ Social Media aktiv
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
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

            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{metric.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {metric.weight}% Gewichtung
                      </Badge>
                      {metric.name === 'Social Media' && (
                        <Badge variant={hasSocialData ? "default" : "destructive"} className="text-xs">
                          {hasSocialData ? `✅ ${socialMediaScore} Punkte` : '❌ Keine Daten'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getScoreColor(metric.score)}`}>
                        {Math.round(metric.score)}/100
                      </span>
                    </div>
                  </div>
                  <Progress value={metric.score} className="h-2" />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold score-text-high">
                  {metrics.filter(m => m.score >= 80).length}
                </div>
                <div className="text-sm text-gray-600">Sehr gut (≥80%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold score-text-medium">
                  {metrics.filter(m => m.score >= 60 && m.score < 80).length}
                </div>
                <div className="text-sm text-gray-600">Gut (60-79%)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold score-text-low">
                  {metrics.filter(m => m.score < 60).length}
                </div>
                <div className="text-sm text-gray-600">Verbesserung nötig (&lt;60%)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverallRating;
