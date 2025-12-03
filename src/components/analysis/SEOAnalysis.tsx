import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, AlertTriangle, Database, Wifi, Check, X } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { useExtensionData } from '@/hooks/useExtensionData';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
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
  
  // Prüfe ob Fallback-Daten verwendet werden
  const isUsingFallbackData = realData?.seo.titleTag === 'Konnte nicht geladen werden' ||
                               realData?.seo.metaDescription === 'Website-Inhalte konnten nicht abgerufen werden';

  // Priorisiere Extension-Daten wenn verfügbar
  const useExtensionAltTags = hasExtensionData && extensionSEO?.altTags;

  // Check if element is confirmed (user says it's OK)
  const isElementConfirmed = (elementId: string): boolean => {
    return manualSEOData?.confirmedElements?.includes(elementId) || false;
  };

  // Check if element is rejected (user says it's NOT OK)
  const isElementRejected = (elementId: string): boolean => {
    return manualSEOData?.rejectedElements?.includes(elementId) || false;
  };

  // Get element status: 'confirmed' | 'rejected' | 'pending'
  const getElementStatus = (elementId: string): 'confirmed' | 'rejected' | 'pending' => {
    if (isElementConfirmed(elementId)) return 'confirmed';
    if (isElementRejected(elementId)) return 'rejected';
    return 'pending';
  };

  // Set element status
  const setElementStatus = (elementId: string, status: 'confirmed' | 'rejected' | 'pending') => {
    if (!onManualSEODataChange) return;

    const currentConfirmed = manualSEOData?.confirmedElements || [];
    const currentRejected = manualSEOData?.rejectedElements || [];

    let newConfirmed = currentConfirmed.filter(id => id !== elementId);
    let newRejected = currentRejected.filter(id => id !== elementId);

    if (status === 'confirmed') {
      newConfirmed = [...newConfirmed, elementId];
    } else if (status === 'rejected') {
      newRejected = [...newRejected, elementId];
    }

    onManualSEODataChange({
      ...manualSEOData,
      confirmedElements: newConfirmed,
      rejectedElements: newRejected,
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
    titleTag: { present: true, length: 0, content: "Daten werden geladen...", score: 0, isRealData: false },
    metaDescription: { present: true, length: 0, content: "Daten werden geladen...", score: 0, isRealData: false },
    headingStructure: { h1Count: 0, h2Count: 0, h3Count: 0, structure: "Wird analysiert...", score: 0, isRealData: false },
    altTags: { imagesTotal: 0, imagesWithAlt: 0, coverage: 0, score: 0, isRealData: false },
    overallScore: 0
  };

  // Calculate effective score based on confirmation status
  // Rejected = score capped at 30, Pending = original score, Confirmed = original score
  const getEffectiveScore = (elementId: string, originalScore: number): number => {
    const status = getElementStatus(elementId);
    if (status === 'rejected') {
      return Math.min(originalScore, 30); // Cap at 30 if rejected
    }
    return originalScore;
  };

  const getStatusIcon = (score: number, elementId: string) => {
    const status = getElementStatus(elementId);
    const effectiveScore = getEffectiveScore(elementId, score);
    
    if (status === 'rejected') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (status === 'confirmed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    // Pending - show based on auto score
    if (effectiveScore >= 70) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <AlertTriangle className="h-5 w-5 text-amber-500" />;
  };

  const getScoreColor = (score: number, elementId: string) => {
    const status = getElementStatus(elementId);
    if (status === 'rejected') return "text-red-600";
    if (status === 'confirmed') return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-amber-600";
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

  // Render confirmation buttons for each element
  const renderConfirmationButtons = (elementId: string, label: string) => {
    if (!onManualSEODataChange) return null;
    
    const status = getElementStatus(elementId);
    
    return (
      <div className="flex items-center gap-2 mt-3 p-3 bg-muted/50 border border-border rounded-lg">
        <span className="text-sm font-medium mr-2">Bewertung:</span>
        <Button
          size="sm"
          variant={status === 'confirmed' ? 'default' : 'outline'}
          className={status === 'confirmed' ? 'bg-green-600 hover:bg-green-700' : ''}
          onClick={() => setElementStatus(elementId, status === 'confirmed' ? 'pending' : 'confirmed')}
        >
          <Check className="h-4 w-4 mr-1" />
          Bestätigt
        </Button>
        <Button
          size="sm"
          variant={status === 'rejected' ? 'default' : 'outline'}
          className={status === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
          onClick={() => setElementStatus(elementId, status === 'rejected' ? 'pending' : 'rejected')}
        >
          <X className="h-4 w-4 mr-1" />
          Nicht bestätigt
        </Button>
        {status !== 'pending' && (
          <Badge className={status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {status === 'confirmed' ? 'OK' : 'Fehler'}
          </Badge>
        )}
      </div>
    );
  };

  // Count rejected elements for summary
  const rejectedCount = (manualSEOData?.rejectedElements || []).length;
  const confirmedCount = (manualSEOData?.confirmedElements || []).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            SEO-Auswertung
          </CardTitle>
          <CardDescription>
            SEO-Analyse für {url} - Bitte bestätigen oder ablehnen Sie die erkannten Elemente
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
                  </div>
                  <div>
                    <span className="font-medium text-blue-900">Meta Description:</span>
                    <p className="text-blue-700 bg-white p-2 rounded mt-1 text-xs">
                      {extensionSEO.metaDescription || 'Nicht gefunden'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Hinweis zur Bewertung */}
            {onManualSEODataChange && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <h4 className="font-semibold text-amber-800">Manuelle Bewertung erforderlich</h4>
                </div>
                <p className="text-sm text-amber-700">
                  Bitte überprüfen Sie jedes SEO-Element und bestätigen oder lehnen Sie es ab. 
                  <strong> Nicht bestätigte Elemente werden als Fehler gewertet</strong> und fließen negativ in die Bewertung ein.
                </p>
              </div>
            )}

            {/* Summary of confirmed/rejected */}
            {(confirmedCount > 0 || rejectedCount > 0) && (
              <div className="flex gap-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm"><strong>{confirmedCount}</strong> bestätigt</span>
                </div>
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm"><strong>{rejectedCount}</strong> nicht bestätigt (Fehler)</span>
                </div>
              </div>
            )}

            {/* Title Tag */}
            <div className={`border rounded-lg p-4 ${getElementStatus('titleTag') === 'rejected' ? 'border-red-300 bg-red-50/30' : getElementStatus('titleTag') === 'confirmed' ? 'border-green-300 bg-green-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.titleTag.score, 'titleTag')}
                    Title-Tag
                  </h3>
                  {getDataSourceBadge(seoData.titleTag.isRealData)}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.titleTag.score, 'titleTag')}`}>
                  {getEffectiveScore('titleTag', seoData.titleTag.score)}/100
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground italic">
                  Der Seitentitel erscheint in Suchergebnissen und Browser-Tabs. Ideal sind 50-70 Zeichen.
                </p>
                <p className="text-sm bg-muted p-2 rounded">
                  "{seoData.titleTag.content}"
                </p>
                <div className="flex justify-between text-sm">
                  <span>Länge: {seoData.titleTag.length} Zeichen</span>
                  <span className={`font-medium ${getScoreColor(seoData.titleTag.score, 'titleTag')}`}>
                    {getElementStatus('titleTag') === 'rejected' ? 'Als Fehler markiert' : getTitleTagRating(seoData.titleTag.score)}
                  </span>
                </div>
                <Progress value={getEffectiveScore('titleTag', seoData.titleTag.score)} className="h-2" />
                {renderConfirmationButtons('titleTag', 'Title-Tag')}
              </div>
            </div>

            {/* Meta Description */}
            <div className={`border rounded-lg p-4 ${getElementStatus('metaDescription') === 'rejected' ? 'border-red-300 bg-red-50/30' : getElementStatus('metaDescription') === 'confirmed' ? 'border-green-300 bg-green-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.metaDescription.score, 'metaDescription')}
                    Meta Description
                  </h3>
                  {getDataSourceBadge(seoData.metaDescription.isRealData)}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.metaDescription.score, 'metaDescription')}`}>
                  {getEffectiveScore('metaDescription', seoData.metaDescription.score)}/100
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground italic">
                  Die Kurzbeschreibung wird unter Ihrem Seitentitel in Google angezeigt. Optimal sind 120-160 Zeichen.
                </p>
                <p className="text-sm bg-muted p-2 rounded">
                  "{seoData.metaDescription.content}"
                </p>
                <div className="flex justify-between text-sm">
                  <span>Länge: {seoData.metaDescription.length} Zeichen</span>
                  <span className={`font-medium ${getScoreColor(seoData.metaDescription.score, 'metaDescription')}`}>
                    {getElementStatus('metaDescription') === 'rejected' ? 'Als Fehler markiert' : getMetaDescriptionRating(seoData.metaDescription.score)}
                  </span>
                </div>
                <Progress value={getEffectiveScore('metaDescription', seoData.metaDescription.score)} className="h-2" />
                {renderConfirmationButtons('metaDescription', 'Meta Description')}
              </div>
            </div>

            {/* Überschriftenstruktur */}
            <div className={`border rounded-lg p-4 ${getElementStatus('headingStructure') === 'rejected' ? 'border-red-300 bg-red-50/30' : getElementStatus('headingStructure') === 'confirmed' ? 'border-green-300 bg-green-50/30' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getStatusIcon(seoData.headingStructure.score, 'headingStructure')}
                    Überschriftenstruktur
                  </h3>
                  {getDataSourceBadge(seoData.headingStructure.isRealData)}
                </div>
                <span className={`font-bold ${getScoreColor(seoData.headingStructure.score, 'headingStructure')}`}>
                  {getEffectiveScore('headingStructure', seoData.headingStructure.score)}/100
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground italic">
                  Überschriften gliedern Ihre Inhalte. Ideal ist genau eine H1 als Hauptüberschrift.
                </p>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg">{seoData.headingStructure.h1Count}</div>
                    <div className="text-muted-foreground">H1 Tags</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{seoData.headingStructure.h2Count}</div>
                    <div className="text-muted-foreground">H2 Tags</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg">{seoData.headingStructure.h3Count}</div>
                    <div className="text-muted-foreground">H3 Tags</div>
                  </div>
                </div>
                <Progress value={getEffectiveScore('headingStructure', seoData.headingStructure.score)} className="h-2" />
                <p className={`text-sm font-medium ${getScoreColor(seoData.headingStructure.score, 'headingStructure')}`}>
                  {getElementStatus('headingStructure') === 'rejected' ? 'Als Fehler markiert' : getHeadingRating(seoData.headingStructure.score, seoData.headingStructure.h1Count)}
                </p>
                {renderConfirmationButtons('headingStructure', 'Überschriftenstruktur')}
              </div>
            </div>

            {/* Alt-Tags */}
            <div className={`border rounded-lg p-4 ${getElementStatus('altTags') === 'rejected' ? 'border-red-300 bg-red-50/30' : getElementStatus('altTags') === 'confirmed' ? 'border-green-300 bg-green-50/30' : ''}`}>
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
                </div>
                <span className={`font-bold ${getScoreColor(seoData.altTags.score, 'altTags')}`}>
                  {getEffectiveScore('altTags', seoData.altTags.score)}/100
                </span>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground italic">
                  Alt-Texte beschreiben Bilder für Suchmaschinen und Screenreader.
                </p>
                <div className="flex justify-between text-sm">
                  <span>Bilder mit Alt-Tags:</span>
                  <span className="font-semibold">{seoData.altTags.imagesWithAlt}/{seoData.altTags.imagesTotal}</span>
                </div>
                <Progress value={getEffectiveScore('altTags', seoData.altTags.coverage)} className="h-2" />
                <p className={`text-sm font-medium ${getScoreColor(seoData.altTags.score, 'altTags')}`}>
                  {getElementStatus('altTags') === 'rejected' ? 'Als Fehler markiert' : getAltTagRating(seoData.altTags.score)}
                </p>
                {renderConfirmationButtons('altTags', 'Alt-Tags')}
              </div>
            </div>

            {/* Zusammenfassung nicht bestätigter Fehler */}
            {rejectedCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">⚠️ Nicht bestätigte SEO-Elemente ({rejectedCount})</h4>
                <ul className="text-sm text-red-700 list-disc list-inside">
                  {manualSEOData?.rejectedElements?.includes('titleTag') && <li>Title-Tag - als Fehler markiert</li>}
                  {manualSEOData?.rejectedElements?.includes('metaDescription') && <li>Meta Description - als Fehler markiert</li>}
                  {manualSEOData?.rejectedElements?.includes('headingStructure') && <li>Überschriftenstruktur - als Fehler markiert</li>}
                  {manualSEOData?.rejectedElements?.includes('altTags') && <li>Alt-Tags für Bilder - als Fehler markiert</li>}
                </ul>
                <p className="text-xs text-red-600 mt-2">
                  Diese Elemente wurden als fehlerhaft markiert und fließen negativ in die Gesamtbewertung ein.
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
