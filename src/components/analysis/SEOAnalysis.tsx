import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, AlertTriangle, Database, Wifi } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { useExtensionData } from '@/hooks/useExtensionData';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { Checkbox } from '@/components/ui/checkbox';
import { ManualSEOData } from '@/hooks/useManualData';

interface SEOAnalysisProps {
  url: string;
  realData?: RealBusinessData;
  manualSEOData?: ManualSEOData | null;
  onManualSEODataChange?: (data: ManualSEOData | null) => void;
}

const SEOAnalysis: React.FC<SEOAnalysisProps> = ({ url, realData, manualSEOData, onManualSEODataChange }) => {
  const { reviewStatus, updateReviewStatus, savedExtensionData } = useAnalysisContext();
  const { extensionData } = useExtensionData();
  
  // Use live extension data or fallback to saved extension data
  const activeExtensionData = extensionData || savedExtensionData;
  
  // Get extension SEO data
  const hasExtensionData = activeExtensionData !== null;
  const extensionSEO = activeExtensionData?.seo;
  
  // DEBUG: Log alt-tags data sources
  console.log('🔍 SEO Alt-Tags Debug:', {
    hasExtensionData,
    extensionSEOExists: !!extensionSEO,
    extensionAltTags: extensionSEO?.altTags,
    realDataAltTags: realData?.seo?.altTags,
    url
  });
  
  // Prüfe ob Fallback-Daten verwendet werden
  const isUsingFallbackData = realData?.seo.titleTag === 'Konnte nicht geladen werden' ||
                               realData?.seo.metaDescription === 'Website-Inhalte konnten nicht abgerufen werden';

  // Priorisiere Extension-Daten wenn verfügbar, sonst verwende realData, sonst Fallback
  const useExtensionAltTags = hasExtensionData && extensionSEO?.altTags;

  // Check if an issue is deselected
  const isIssueDeselected = (issueId: string): boolean => {
    return manualSEOData?.deselectedIssues?.includes(issueId) || false;
  };

  // Toggle issue deselection
  const toggleIssueDeselection = (issueId: string) => {
    if (!onManualSEODataChange) return;

    const currentDeselected = manualSEOData?.deselectedIssues || [];
    let newDeselected: string[];

    if (currentDeselected.includes(issueId)) {
      newDeselected = currentDeselected.filter(id => id !== issueId);
    } else {
      newDeselected = [...currentDeselected, issueId];
    }

    onManualSEODataChange({
      ...manualSEOData,
      deselectedIssues: newDeselected,
    });
  };
  
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
    // PRIORISIERE Extension-Daten für Alt-Tags wenn verfügbar
    altTags: useExtensionAltTags ? {
      imagesTotal: extensionSEO.altTags.total || 0,
      imagesWithAlt: extensionSEO.altTags.withAlt || 0,
      coverage: (extensionSEO.altTags.total !== undefined && extensionSEO.altTags.total > 0) ? 
        Math.round(((extensionSEO.altTags.withAlt || 0) / extensionSEO.altTags.total) * 100) : 0,
      score: (extensionSEO.altTags.total !== undefined && extensionSEO.altTags.total > 0) ? 
        Math.round(((extensionSEO.altTags.withAlt || 0) / extensionSEO.altTags.total) * 100) : 0,
      isRealData: true,
      source: 'extension'
    } : {
      imagesTotal: realData.seo.altTags.total || 0,
      imagesWithAlt: realData.seo.altTags.withAlt || 0,
      coverage: (realData.seo.altTags.total !== undefined && realData.seo.altTags.total > 0) ? 
        Math.round(((realData.seo.altTags.withAlt || 0) / realData.seo.altTags.total) * 100) : 0,
      score: (realData.seo.altTags.total !== undefined && realData.seo.altTags.total > 0) ? 
        Math.round(((realData.seo.altTags.withAlt || 0) / realData.seo.altTags.total) * 100) : 0,
      isRealData: !isUsingFallbackData,
      source: 'pagespeed'
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

  // Determine which issues have problems (score < 70)
  const hasIssue = {
    titleTag: seoData.titleTag.score < 70,
    metaDescription: seoData.metaDescription.score < 70,
    headingStructure: seoData.headingStructure.score < 70,
    altTags: seoData.altTags.score < 70,
  };

  // Calculate effective scores (consider deselections)
  const getEffectiveScore = (issueId: string, originalScore: number): number => {
    if (isIssueDeselected(issueId) && originalScore < 70) {
      // If issue is deselected and was problematic, treat as resolved (score 80)
      return 80;
    }
    return originalScore;
  };

  const getStatusIcon = (score: number, issueId?: string) => {
    const effectiveScore = issueId ? getEffectiveScore(issueId, score) : score;
    const isDeselected = issueId ? isIssueDeselected(issueId) : false;
    
    if (isDeselected && score < 70) {
      return <CheckCircle className="h-5 w-5 text-blue-500" />; // Deselected issue
    }
    if (effectiveScore >= 90) return <CheckCircle className="h-5 w-5 text-yellow-500" />;
    if (effectiveScore >= 61) return <AlertCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getScoreColor = (score: number, issueId?: string) => {
    const effectiveScore = issueId ? getEffectiveScore(issueId, score) : score;
    const isDeselected = issueId ? isIssueDeselected(issueId) : false;
    
    if (isDeselected && score < 70) {
      return "text-blue-600"; // Deselected issue
    }
    if (effectiveScore >= 90) return "text-yellow-600";
    if (effectiveScore >= 61) return "text-green-600";
    return "text-red-600";
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

  const getTitleTagRating = (score: number) => {
    if (score >= 90) return "Exzellent - perfekte Länge und Struktur";
    if (score >= 80) return "Sehr gut - ideal für Suchmaschinen";
    if (score >= 70) return "Gut - könnte optimiert werden";
    if (score >= 60) return "Ausreichend - Verbesserungsbedarf";
    return "Unzureichend - dringend überarbeiten";
  };

  const getMetaDescriptionRating = (score: number) => {
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

  // Render deselection checkbox if there's an issue
  const renderDeselectionCheckbox = (issueId: string, label: string) => {
    if (!hasIssue[issueId as keyof typeof hasIssue]) return null;
    
    return (
      <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 border border-amber-200 rounded">
        <Checkbox
          id={`deselect-${issueId}`}
          checked={isIssueDeselected(issueId)}
          onCheckedChange={() => toggleIssueDeselection(issueId)}
        />
        <label 
          htmlFor={`deselect-${issueId}`}
          className="text-sm text-amber-800 cursor-pointer"
        >
          Fehler abwählen: {label}
        </label>
        {isIssueDeselected(issueId) && (
          <Badge className="bg-blue-100 text-blue-800 text-xs">Abgewählt</Badge>
        )}
      </div>
    );
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
            {/* Chrome Extension SEO-Daten (wenn verfügbar) */}
            {hasExtensionData && extensionSEO && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">SEO-Daten von Chrome Extension erkannt</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-blue-900">Title:</span>
                    <p className="text-blue-700 bg-white p-2 rounded mt-1 text-xs">
                      {extensionSEO.titleTag || 'Nicht gefunden'}
                    </p>
                    <span className="text-xs text-blue-600">Länge: {extensionSEO.titleTag?.length || 0} Zeichen</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900">Meta Description:</span>
                    <p className="text-blue-700 bg-white p-2 rounded mt-1 text-xs">
                      {extensionSEO.metaDescription || 'Nicht gefunden'}
                    </p>
                    <span className="text-xs text-blue-600">Länge: {extensionSEO.metaDescription?.length || 0} Zeichen</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900">Überschriften:</span>
                    <div className="bg-white p-2 rounded mt-1 space-y-1">
                      <div className="text-xs text-blue-700">H1: {extensionSEO.headings?.h1?.length || 0}</div>
                      <div className="text-xs text-blue-700">H2: {extensionSEO.headings?.h2?.length || 0}</div>
                      <div className="text-xs text-blue-700">H3: {extensionSEO.headings?.h3?.length || 0}</div>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-900">Alt-Tags:</span>
                    <div className="bg-white p-2 rounded mt-1">
                      <div className="text-xs text-blue-700">
                        {extensionSEO.altTags?.withAlt || 0} von {extensionSEO.altTags?.total || 0} Bildern
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        {extensionSEO.altTags?.total > 0 
                          ? `${Math.round((extensionSEO.altTags.withAlt / extensionSEO.altTags.total) * 100)}% abgedeckt`
                          : 'Keine Bilder gefunden'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
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

            {/* Hinweis zur Fehler-Abwahl */}
            {onManualSEODataChange && (Object.values(hasIssue).some(v => v)) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Manuelle Fehler-Abwahl möglich</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Bei automatisch erkannten SEO-Problemen können Sie Fehler manuell abwählen, wenn diese nicht relevant sind 
                  oder bewusst so umgesetzt wurden. Abgewählte Fehler werden in der Bewertung nicht berücksichtigt.
                </p>
              </div>
            )}

            {/* Title Tag */}
            <div className={`border rounded-lg p-4 ${isIssueDeselected('titleTag') ? 'border-blue-300 bg-blue-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.titleTag.score, 'titleTag')}
                    Title-Tag
                  </h3>
                  {getDataSourceBadge(seoData.titleTag.isRealData)}
                  {isIssueDeselected('titleTag') && (
                    <Badge className="bg-blue-100 text-blue-800">Abgewählt</Badge>
                  )}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.titleTag.score, 'titleTag')}`}>
                  {isIssueDeselected('titleTag') && seoData.titleTag.score < 70 ? '80' : seoData.titleTag.score}/100
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
                  <span className={`font-medium ${getScoreColor(seoData.titleTag.score, 'titleTag')}`}>
                    {isIssueDeselected('titleTag') ? 'Fehler abgewählt' : getTitleTagRating(seoData.titleTag.score)}
                  </span>
                </div>
                <Progress value={getEffectiveScore('titleTag', seoData.titleTag.score)} className="h-2" />
                {renderDeselectionCheckbox('titleTag', 'Title-Tag ist bewusst so gestaltet')}
              </div>
            </div>

            {/* Meta Description */}
            <div className={`border rounded-lg p-4 ${isIssueDeselected('metaDescription') ? 'border-blue-300 bg-blue-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.metaDescription.score, 'metaDescription')}
                    Meta Description
                  </h3>
                  {getDataSourceBadge(seoData.metaDescription.isRealData)}
                  {isIssueDeselected('metaDescription') && (
                    <Badge className="bg-blue-100 text-blue-800">Abgewählt</Badge>
                  )}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.metaDescription.score, 'metaDescription')}`}>
                  {isIssueDeselected('metaDescription') && seoData.metaDescription.score < 70 ? '80' : seoData.metaDescription.score}/100
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
                  <span className={`font-medium ${getScoreColor(seoData.metaDescription.score, 'metaDescription')}`}>
                    {isIssueDeselected('metaDescription') ? 'Fehler abgewählt' : getMetaDescriptionRating(seoData.metaDescription.score)}
                  </span>
                </div>
                <Progress value={getEffectiveScore('metaDescription', seoData.metaDescription.score)} className="h-2" />
                {renderDeselectionCheckbox('metaDescription', 'Meta Description ist bewusst so gestaltet')}
              </div>
            </div>

            {/* Überschriftenstruktur */}
            <div className={`border rounded-lg p-4 ${isIssueDeselected('headingStructure') ? 'border-blue-300 bg-blue-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.headingStructure.score, 'headingStructure')}
                    Überschriftenstruktur
                  </h3>
                  {getDataSourceBadge(seoData.headingStructure.isRealData)}
                  {isIssueDeselected('headingStructure') && (
                    <Badge className="bg-blue-100 text-blue-800">Abgewählt</Badge>
                  )}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.headingStructure.score, 'headingStructure')}`}>
                  {isIssueDeselected('headingStructure') && seoData.headingStructure.score < 70 ? '80' : seoData.headingStructure.score}/100
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
                <Progress value={getEffectiveScore('headingStructure', seoData.headingStructure.score)} className="h-2" />
                <p className={`text-sm font-medium ${getScoreColor(seoData.headingStructure.score, 'headingStructure')}`}>
                  {isIssueDeselected('headingStructure') ? 'Fehler abgewählt' : getHeadingRating(seoData.headingStructure.score, seoData.headingStructure.h1Count)}
                </p>
                {renderDeselectionCheckbox('headingStructure', 'Überschriftenstruktur ist bewusst so gewählt')}
              </div>
            </div>

            {/* Alt-Tags */}
            <div className={`border rounded-lg p-4 ${isIssueDeselected('altTags') ? 'border-blue-300 bg-blue-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.altTags.score, 'altTags')}
                    Alt-Tags für Bilder
                  </h3>
                  {seoData.altTags.source === 'extension' ? (
                    <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      <Database className="h-3 w-3 mr-1" />
                      Chrome Extension
                    </Badge>
                  ) : (
                    getDataSourceBadge(seoData.altTags.isRealData)
                  )}
                  {isIssueDeselected('altTags') && (
                    <Badge className="bg-blue-100 text-blue-800">Abgewählt</Badge>
                  )}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.altTags.score, 'altTags')}`}>
                  {isIssueDeselected('altTags') && seoData.altTags.score < 70 ? '80' : seoData.altTags.score}/100
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
                <Progress value={isIssueDeselected('altTags') && seoData.altTags.coverage < 70 ? 80 : seoData.altTags.coverage} className="h-2" />
                <p className={`text-sm font-medium ${getScoreColor(seoData.altTags.score, 'altTags')}`}>
                  {isIssueDeselected('altTags') ? 'Fehler abgewählt' : getAltTagRating(seoData.altTags.score)}
                </p>
                {renderDeselectionCheckbox('altTags', 'Alt-Tags sind bewusst nicht gesetzt oder nicht relevant')}
              </div>
            </div>

            {/* Zusammenfassung abgewählter Fehler */}
            {manualSEOData?.deselectedIssues && manualSEOData.deselectedIssues.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Abgewählte SEO-Fehler ({manualSEOData.deselectedIssues.length})</h4>
                <ul className="text-sm text-blue-700 list-disc list-inside">
                  {manualSEOData.deselectedIssues.includes('titleTag') && <li>Title-Tag</li>}
                  {manualSEOData.deselectedIssues.includes('metaDescription') && <li>Meta Description</li>}
                  {manualSEOData.deselectedIssues.includes('headingStructure') && <li>Überschriftenstruktur</li>}
                  {manualSEOData.deselectedIssues.includes('altTags') && <li>Alt-Tags für Bilder</li>}
                </ul>
                <p className="text-xs text-blue-600 mt-2">
                  Diese Fehler wurden manuell abgewählt und fließen nicht negativ in die Bewertung ein.
                </p>
              </div>
            )}

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
      
      <AIReviewCheckbox
        categoryName="SEO-Analyse"
        isReviewed={reviewStatus['SEO-Analyse']?.isReviewed || false}
        onReviewChange={(reviewed) => updateReviewStatus('SEO-Analyse', reviewed)}
      />
    </div>
  );
};

export default SEOAnalysis;
