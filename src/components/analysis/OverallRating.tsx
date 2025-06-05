import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

interface OverallRatingProps {
  businessData: BusinessData;
}

const OverallRating: React.FC<OverallRatingProps> = ({ businessData }) => {
  // Simulierte Bewertungsdaten aller Kategorien
  const categoryScores = {
    seo: { score: 82, weight: 15, name: "SEO-Auswertung" },
    keywords: { score: 75, weight: 12, name: "Keyword-Analyse" },
    performance: { score: 78, weight: 10, name: "Ladezeit" },
    backlinks: { score: 72, weight: 8, name: "Backlinks" },
    reviews: { score: 92, weight: 20, name: "Google-Bewertungen" },
    social: { score: 68, weight: 10, name: "Social Media" },
    imprint: { score: 85, weight: 8, name: "Impressum" },
    industry: { score: 70, weight: 12, name: "Branchenmerkmale" },
    overall: { score: 0, weight: 5, name: "Sonstiges" }
  };

  // Gewichtete Gesamtbewertung berechnen
  const totalWeightedScore = Object.values(categoryScores).reduce(
    (sum, category) => sum + (category.score * category.weight), 0
  );
  const totalWeight = Object.values(categoryScores).reduce(
    (sum, category) => sum + category.weight, 0
  );
  const overallScore = Math.round(totalWeightedScore / totalWeight);
  
  // Sterne-Bewertung (1-5)
  const starRating = Math.round((overallScore / 100) * 5 * 10) / 10; // Rundet auf eine Dezimalstelle

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-6 w-6 ${
              i < fullStars 
                ? 'text-yellow-400 fill-current' 
                : i === fullStars && hasHalfStar
                ? 'text-yellow-400 fill-current opacity-50'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-lg font-bold">{starRating}/5</span>
      </div>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-yellow-50";
    return "bg-red-50";
  };

  const getOverallBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getGradeText = (score: number) => {
    if (score >= 90) return "Ausgezeichnet";
    if (score >= 80) return "Sehr gut";
    if (score >= 70) return "Gut";
    if (score >= 60) return "Befriedigend";
    if (score >= 50) return "Ausreichend";
    return "Mangelhaft";
  };

  return (
    <div className="space-y-6">
      {/* Gesamtbewertung Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Gesamtbewertung Online-Auftritt
          </CardTitle>
          <CardDescription className="text-center">
            Gewichtete Analyse aller Bewertungskriterien
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`inline-block p-8 rounded-full ${getScoreBg(overallScore)}`}>
              <div className={`text-5xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}
              </div>
              <div className="text-lg text-gray-600 mt-2">
                von 100 Punkten
              </div>
            </div>
            
            <div className="space-y-2">
              {renderStars(starRating)}
              <Badge variant={getOverallBadge(overallScore)} className="text-lg px-4 py-2">
                {getGradeText(overallScore)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kategorien-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bewertung nach Kategorien</CardTitle>
          <CardDescription>
            Detaillierte Aufschlüsselung der Einzelbewertungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(categoryScores)
              .filter(([key]) => key !== 'overall')
              .sort(([,a], [,b]) => b.score - a.score)
              .map(([key, category]) => (
              <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        Gewichtung: {category.weight}%
                      </span>
                      <Badge variant={getOverallBadge(category.score)}>
                        {category.score}/100
                      </Badge>
                    </div>
                  </div>
                  <Progress value={category.score} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stärken und Schwächen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-600">Stärken</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {Object.entries(categoryScores)
                .filter(([,category]) => category.score >= 80)
                .map(([key, category]) => (
                <li key={key} className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span>{category.name}: {category.score}/100</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Verbesserungsbedarf</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {Object.entries(categoryScores)
                .filter(([,category]) => category.score < 75)
                .sort(([,a], [,b]) => a.score - b.score)
                .map(([key, category]) => (
                <li key={key} className="flex items-center gap-2">
                  <span className="text-red-600">×</span>
                  <span>{category.name}: {category.score}/100</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Handlungsempfehlungen */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top-Handlungsempfehlungen</CardTitle>
          <CardDescription>
            Prioritäre Maßnahmen zur Verbesserung des Online-Auftritts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
              <span className="text-red-600 font-bold">1.</span>
              <div>
                <strong>Social Media Aktivität steigern (68/100)</strong>
                <p className="text-gray-600 mt-1">
                  Regelmäßigere Posts und bessere Community-Interaktion auf Facebook und Instagram
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-600 font-bold">2.</span>
              <div>
                <strong>Branchenspezifische Inhalte ausbauen (70/100)</strong>
                <p className="text-gray-600 mt-1">
                  Mehr branchentypische Merkmale und Services prominent darstellen
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-600 font-bold">3.</span>
              <div>
                <strong>Backlink-Strategie optimieren (72/100)</strong>
                <p className="text-gray-600 mt-1">
                  Defekte Links reparieren und mehr qualitative externe Verlinkungen aufbauen
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverallRating;
