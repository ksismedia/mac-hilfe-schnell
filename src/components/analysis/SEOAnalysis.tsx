
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface SEOAnalysisProps {
  url: string;
  realData?: RealBusinessData;
}

const SEOAnalysis: React.FC<SEOAnalysisProps> = ({ url, realData }) => {
  // Verwende echte Daten wenn verfügbar, sonst Fallback
  const seoData = realData ? {
    titleTag: {
      present: realData.seo.titleTag !== 'Kein Title-Tag gefunden',
      length: realData.seo.titleTag.length,
      content: realData.seo.titleTag,
      score: realData.seo.titleTag !== 'Kein Title-Tag gefunden' ? 
        (realData.seo.titleTag.length <= 70 ? 85 : 65) : 25
    },
    metaDescription: {
      present: realData.seo.metaDescription !== 'Keine Meta-Description gefunden',
      length: realData.seo.metaDescription.length,
      content: realData.seo.metaDescription,
      score: realData.seo.metaDescription !== 'Keine Meta-Description gefunden' ? 
        (realData.seo.metaDescription.length <= 160 ? 90 : 70) : 25
    },
    headingStructure: {
      h1Count: realData.seo.headings.h1.length,
      h2Count: realData.seo.headings.h2.length,
      h3Count: realData.seo.headings.h3.length,
      structure: realData.seo.headings.h1.length === 1 ? "Gut strukturiert" : 
        realData.seo.headings.h1.length > 1 ? "Mehrere H1-Tags" : "Keine H1-Tags",
      score: realData.seo.headings.h1.length === 1 ? 80 : 
        realData.seo.headings.h1.length > 1 ? 60 : 30
    },
    altTags: {
      imagesTotal: realData.seo.altTags.total,
      imagesWithAlt: realData.seo.altTags.withAlt,
      coverage: realData.seo.altTags.total > 0 ? 
        Math.round((realData.seo.altTags.withAlt / realData.seo.altTags.total) * 100) : 100,
      score: realData.seo.altTags.total > 0 ? 
        Math.round((realData.seo.altTags.withAlt / realData.seo.altTags.total) * 100) : 100
    },
    overallScore: realData.seo.score
  } : {
    // Fallback-Daten
    titleTag: {
      present: true,
      length: 65,
      content: "Daten werden geladen...",
      score: 85
    },
    metaDescription: {
      present: true,
      length: 155,
      content: "Daten werden geladen...",
      score: 92
    },
    headingStructure: {
      h1Count: 1,
      h2Count: 4,
      h3Count: 8,
      structure: "Wird analysiert...",
      score: 78
    },
    altTags: {
      imagesTotal: 0,
      imagesWithAlt: 0,
      coverage: 0,
      score: 0
    },
    overallScore: 0
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
            SEO-Auswertung (Echte Daten)
            <Badge variant={seoData.overallScore >= 80 ? "default" : seoData.overallScore >= 60 ? "secondary" : "destructive"}>
              {seoData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Live-Analyse der SEO-Faktoren für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Title Tag */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold flex items-center gap-2">
                  {getStatusIcon(seoData.titleTag.score)}
                  Title-Tag (Live-Daten)
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
                  Meta Description (Live-Daten)
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
                  Überschriftenstruktur (Live-Daten)
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
                  Alt-Tags für Bilder (Live-Daten)
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

            {/* Echte Daten Hinweis */}
            {realData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✓ Live-Datenanalyse</h4>
                <p className="text-sm text-green-700">
                  Diese Daten wurden direkt von Ihrer Website {url} abgerufen und analysiert.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOAnalysis;
