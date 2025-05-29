
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SEOAnalysisProps {
  url: string;
}

const SEOAnalysis: React.FC<SEOAnalysisProps> = ({ url }) => {
  // Simulierte SEO-Daten
  const seoData = {
    titleTag: {
      present: true,
      length: 65,
      content: "Meisterbetrieb Schmidt - Sanitär, Heizung & Klima in München",
      score: 85
    },
    metaDescription: {
      present: true,
      length: 155,
      content: "Ihr zuverlässiger SHK-Meisterbetrieb in München. 25 Jahre Erfahrung in Sanitär, Heizung und Klimatechnik. Kostenlose Beratung und 24h Notdienst.",
      score: 92
    },
    headingStructure: {
      h1Count: 1,
      h2Count: 4,
      h3Count: 8,
      structure: "Gut strukturiert",
      score: 78
    },
    altTags: {
      imagesTotal: 12,
      imagesWithAlt: 9,
      coverage: 75,
      score: 75
    },
    overallScore: 82
  };

  const getStatusIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            SEO-Auswertung
            <Badge variant={seoData.overallScore >= 80 ? "default" : seoData.overallScore >= 60 ? "secondary" : "destructive"}>
              {seoData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Analyse der wichtigsten SEO-Faktoren für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Title Tag */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {getStatusIcon(seoData.titleTag.score)}
                  Title-Tag
                </h3>
                <span className={`font-bold ${getScoreColor(seoData.titleTag.score)}`}>
                  {seoData.titleTag.score}/100
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  "{seoData.titleTag.content}"
                </p>
                <div className="flex justify-between text-sm">
                  <span>Länge: {seoData.titleTag.length} Zeichen</span>
                  <span className={seoData.titleTag.length <= 70 ? "text-green-600" : "text-red-600"}>
                    {seoData.titleTag.length <= 70 ? "Optimal" : "Zu lang"}
                  </span>
                </div>
                <Progress value={seoData.titleTag.score} className="h-2" />
              </div>
            </div>

            {/* Meta Description */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {getStatusIcon(seoData.metaDescription.score)}
                  Meta Description
                </h3>
                <span className={`font-bold ${getScoreColor(seoData.metaDescription.score)}`}>
                  {seoData.metaDescription.score}/100
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  "{seoData.metaDescription.content}"
                </p>
                <div className="flex justify-between text-sm">
                  <span>Länge: {seoData.metaDescription.length} Zeichen</span>
                  <span className={seoData.metaDescription.length <= 160 ? "text-green-600" : "text-red-600"}>
                    {seoData.metaDescription.length <= 160 ? "Optimal" : "Zu lang"}
                  </span>
                </div>
                <Progress value={seoData.metaDescription.score} className="h-2" />
              </div>
            </div>

            {/* Überschriftenstruktur */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {getStatusIcon(seoData.headingStructure.score)}
                  Überschriftenstruktur
                </h3>
                <span className={`font-bold ${getScoreColor(seoData.headingStructure.score)}`}>
                  {seoData.headingStructure.score}/100
                </span>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{seoData.headingStructure.h1Count}</div>
                    <div className="text-gray-600">H1 Tags</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{seoData.headingStructure.h2Count}</div>
                    <div className="text-gray-600">H2 Tags</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{seoData.headingStructure.h3Count}</div>
                    <div className="text-gray-600">H3 Tags</div>
                  </div>
                </div>
                <Progress value={seoData.headingStructure.score} className="h-2" />
                <p className="text-sm text-gray-600">{seoData.headingStructure.structure}</p>
              </div>
            </div>

            {/* Alt-Tags */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {getStatusIcon(seoData.altTags.score)}
                  Alt-Tags für Bilder
                </h3>
                <span className={`font-bold ${getScoreColor(seoData.altTags.score)}`}>
                  {seoData.altTags.score}/100
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Bilder mit Alt-Tags:</span>
                  <span>{seoData.altTags.imagesWithAlt}/{seoData.altTags.imagesTotal}</span>
                </div>
                <Progress value={seoData.altTags.coverage} className="h-2" />
                <p className="text-sm text-gray-600">
                  {seoData.altTags.coverage}% der Bilder haben Alt-Attribute
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOAnalysis;
