
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, AlertTriangle, Database, Wifi } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface SEOAnalysisProps {
  url: string;
  realData?: RealBusinessData;
}

const SEOAnalysis: React.FC<SEOAnalysisProps> = ({ url, realData }) => {
  // Prüfe ob Fallback-Daten verwendet werden
  const isUsingFallbackData = realData?.seo.titleTag === 'Konnte nicht geladen werden' || 
                               realData?.seo.metaDescription === 'Website-Inhalte konnten nicht abgerufen werden';

  // Verwende echte Daten wenn verfügbar, sonst Fallback
  const seoData = realData ? {
    titleTag: {
      present: realData.seo.titleTag !== 'Kein Title-Tag gefunden',
      length: realData.seo.titleTag.length,
      content: realData.seo.titleTag,
      score: realData.seo.titleTag !== 'Kein Title-Tag gefunden' ? 
        (realData.seo.titleTag.length <= 70 ? 85 : 65) : 25,
      isRealData: !isUsingFallbackData
    },
    metaDescription: {
      present: realData.seo.metaDescription !== 'Keine Meta-Description gefunden',
      length: realData.seo.metaDescription.length,
      content: realData.seo.metaDescription,
      score: realData.seo.metaDescription !== 'Keine Meta-Description gefunden' ? 
        (realData.seo.metaDescription.length <= 160 ? 90 : 70) : 25,
      isRealData: !isUsingFallbackData
    },
    headingStructure: {
      h1Count: realData.seo.headings.h1.length,
      h2Count: realData.seo.headings.h2.length,
      h3Count: realData.seo.headings.h3.length,
      structure: realData.seo.headings.h1.length === 1 ? "Gut strukturiert" : 
        realData.seo.headings.h1.length > 1 ? "Mehrere H1-Tags" : "Keine H1-Tags",
      score: realData.seo.headings.h1.length === 1 ? 80 : 
        realData.seo.headings.h1.length > 1 ? 60 : 30,
      isRealData: !isUsingFallbackData
    },
    altTags: {
      imagesTotal: realData.seo.altTags.total,
      imagesWithAlt: realData.seo.altTags.withAlt,
      coverage: realData.seo.altTags.total > 0 ? 
        Math.round((realData.seo.altTags.withAlt / realData.seo.altTags.total) * 100) : 100,
      score: realData.seo.altTags.total > 0 ? 
        Math.round((realData.seo.altTags.withAlt / realData.seo.altTags.total) * 100) : 100,
      isRealData: !isUsingFallbackData
    },
    overallScore: realData.seo.score
  } : {
    // Fallback-Daten
    titleTag: {
      present: true,
      length: 65,
      content: "Daten werden geladen...",
      score: 85,
      isRealData: false
    },
    metaDescription: {
      present: true,
      length: 155,
      content: "Daten werden geladen...",
      score: 92,
      isRealData: false
    },
    headingStructure: {
      h1Count: 1,
      h2Count: 4,
      h3Count: 8,
      structure: "Wird analysiert...",
      score: 78,
      isRealData: false
    },
    altTags: {
      imagesTotal: 0,
      imagesWithAlt: 0,
      coverage: 0,
      score: 0,
      isRealData: false
    },
    overallScore: 0
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-yellow-500" />;  // 90-100% gold
    if (score >= 61) return <AlertCircle className="h-5 w-5 text-green-500" />;   // 61-89% green
    return <XCircle className="h-5 w-5 text-red-500" />;                         // 0-60% red
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-yellow-600";  // 90-100% gold
    if (score >= 61) return "text-green-600";   // 61-89% grün
    return "text-red-600";                      // 0-60% rot
  };

  const getDataSourceBadge = (isRealData: boolean) => {
    if (isRealData) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
          <Wifi className="h-3 w-3 mr-1" />
          Live-Daten
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          <Database className="h-3 w-3 mr-1" />
          Fallback-Daten
        </Badge>
      );
    }
  };

  const getTitleTagRating = (score: number, length: number) => {
    if (score >= 90) return "Exzellent - perfekte Länge und Struktur";
    if (score >= 80) return "Sehr gut - ideal für Suchmaschinen";
    if (score >= 70) return "Gut - könnte optimiert werden";
    if (score >= 60) return "Ausreichend - Verbesserungsbedarf";
    return "Unzureichend - dringend überarbeiten";
  };

  const getMetaDescriptionRating = (score: number, length: number) => {
    if (score >= 90) return "Exzellent - optimal für Suchergebnisse";
    if (score >= 80) return "Sehr gut - ansprechend formuliert";
    if (score >= 70) return "Gut - könnte prägnanter sein";
    if (score >= 60) return "Ausreichend - zu lang oder zu kurz";
    return "Unzureichend - fehlt oder zu kurz";
  };

  const getHeadingRating = (score: number, h1Count: number) => {
    if (score >= 90) return "Exzellent - perfekt strukturiert";
    if (score >= 75) return "Sehr gut - klare Hierarchie";
    if (score >= 60) return "Ausreichend - verbesserungsfähig";
    if (h1Count > 1) return "Kritisch - mehrere H1-Tags gefunden";
    if (h1Count === 0) return "Kritisch - keine Hauptüberschrift vorhanden";
    return "Unzureichend - Struktur fehlt";
  };

  const getAltTagRating = (score: number) => {
    if (score >= 100) return "Perfekt - alle Bilder beschrieben";
    if (score >= 80) return "Sehr gut - fast vollständig";
    if (score >= 60) return "Ausreichend - einige Bilder ohne Beschreibung";
    if (score >= 40) return "Mangelhaft - viele Bilder fehlen";
    return "Unzureichend - Alt-Tags fehlen größtenteils";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            SEO-Auswertung
          </CardTitle>
          <CardDescription>
            SEO-Analyse für {url} - Datenquellen werden pro Bereich angezeigt
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Globale Warnung bei Fallback-Daten */}
            {isUsingFallbackData && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Website konnte nicht vollständig analysiert werden</h4>
                </div>
                <p className="text-sm text-amber-700">
                  Die Website {url} konnte nicht vollständig gescannt werden (möglicherweise durch CORS-Schutz oder Sicherheitseinstellungen). 
                  Bereiche mit Fallback-Daten sind entsprechend gekennzeichnet.
                </p>
              </div>
            )}

            {/* Title Tag */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.titleTag.score)}
                    Title-Tag
                  </h3>
                  {getDataSourceBadge(seoData.titleTag.isRealData)}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.titleTag.score)}`}>
                  {seoData.titleTag.score}/100
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-500 italic">
                  Der Seitentitel erscheint in Suchergebnissen und Browser-Tabs. Ideal sind 50-70 Zeichen mit wichtigen Keywords am Anfang.
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  "{seoData.titleTag.content}"
                </p>
                <div className="flex justify-between text-sm">
                  <span>Länge: {seoData.titleTag.length} Zeichen</span>
                  <span className={`font-medium ${getScoreColor(seoData.titleTag.score)}`}>
                    {getTitleTagRating(seoData.titleTag.score, seoData.titleTag.length)}
                  </span>
                </div>
                <Progress value={seoData.titleTag.score} className="h-2" />
              </div>
            </div>

            {/* Meta Description */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.metaDescription.score)}
                    Meta Description
                  </h3>
                  {getDataSourceBadge(seoData.metaDescription.isRealData)}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.metaDescription.score)}`}>
                  {seoData.metaDescription.score}/100
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-500 italic">
                  Die Kurzbeschreibung wird unter Ihrem Seitentitel in Google angezeigt. Optimal sind 120-160 Zeichen mit klarem Mehrwert.
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  "{seoData.metaDescription.content}"
                </p>
                <div className="flex justify-between text-sm">
                  <span>Länge: {seoData.metaDescription.length} Zeichen</span>
                  <span className={`font-medium ${getScoreColor(seoData.metaDescription.score)}`}>
                    {getMetaDescriptionRating(seoData.metaDescription.score, seoData.metaDescription.length)}
                  </span>
                </div>
                <Progress value={seoData.metaDescription.score} className="h-2" />
              </div>
            </div>

            {/* Überschriftenstruktur */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.headingStructure.score)}
                    Überschriftenstruktur
                  </h3>
                  {getDataSourceBadge(seoData.headingStructure.isRealData)}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.headingStructure.score)}`}>
                  {seoData.headingStructure.score}/100
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-500 italic">
                  Überschriften gliedern Ihre Inhalte für Leser und Suchmaschinen. Ideal ist genau eine H1 als Hauptüberschrift, gefolgt von H2 und H3 für Unterkapitel.
                </p>
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
                <p className={`text-sm font-medium ${getScoreColor(seoData.headingStructure.score)}`}>
                  {getHeadingRating(seoData.headingStructure.score, seoData.headingStructure.h1Count)}
                </p>
              </div>
            </div>

            {/* Alt-Tags */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.altTags.score)}
                    Alt-Tags für Bilder
                  </h3>
                  {getDataSourceBadge(seoData.altTags.isRealData)}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.altTags.score)}`}>
                  {seoData.altTags.score}/100
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-gray-500 italic">
                  Alt-Texte beschreiben Bilder für Suchmaschinen und Screenreader. Jedes Bild sollte eine aussagekräftige Beschreibung haben.
                </p>
                <div className="flex justify-between text-sm">
                  <span>Bilder mit Alt-Tags:</span>
                  <span className="font-semibold">{seoData.altTags.imagesWithAlt}/{seoData.altTags.imagesTotal}</span>
                </div>
                <Progress value={seoData.altTags.coverage} className="h-2" />
                <p className={`text-sm font-medium ${getScoreColor(seoData.altTags.score)}`}>
                  {getAltTagRating(seoData.altTags.score)}
                </p>
              </div>
            </div>

            {/* Status-Hinweis für echte Daten */}
            {realData && !isUsingFallbackData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✓ Vollständige Live-Datenanalyse</h4>
                <p className="text-sm text-green-700">
                  Alle SEO-Daten wurden erfolgreich von Ihrer Website {url} abgerufen und analysiert.
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
