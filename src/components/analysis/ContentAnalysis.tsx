import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCw, CheckCircle, AlertCircle, Edit } from 'lucide-react';
import { ManualContentInput } from './ManualContentInput';
import { useManualData } from '@/hooks/useManualData';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { useExtensionDataLoader } from '@/hooks/useExtensionDataLoader';
import { useSavedAnalyses } from '@/hooks/useSavedAnalyses';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

interface ContentAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei';
}

const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ url, industry }) => {
  const { manualContentData, updateManualContentData } = useManualData();
  const { reviewStatus, updateReviewStatus, savedExtensionData, setSavedExtensionData, currentAnalysis } = useAnalysisContext();
  const { loadLatestExtensionData, isLoading } = useExtensionDataLoader();
  const { updateAnalysis } = useSavedAnalyses();
  
  // Derive showExtensionData from savedExtensionData - always show if data exists
  const showExtensionData = !!savedExtensionData;
  
  // Load extension data from Supabase and auto-save to current analysis
  const handleLoadExtensionData = async () => {
    const data = await loadLatestExtensionData();
    
    if (data) {
      setSavedExtensionData(data);
      
      // Auto-save to current analysis if one exists
      if (currentAnalysis) {
        try {
          await updateAnalysis(
            currentAnalysis.id,
            currentAnalysis.name,
            currentAnalysis.businessData,
            currentAnalysis.realData,
            {
              ...currentAnalysis.manualData,
              extensionData: data
            }
          );
          toast.success('Extension-Daten geladen und gespeichert!');
        } catch (error) {
          console.error('Fehler beim Auto-Speichern:', error);
          toast.error('Daten geladen, aber Speichern fehlgeschlagen');
        }
      } else {
        toast.success('Extension-Daten geladen! Speichern Sie die Analyse, um die Daten zu behalten.');
      }
    }
  };
  
  // Save extension data to current analysis
  const handleSaveExtensionData = async () => {
    if (!currentAnalysis || !savedExtensionData) {
      toast.error('Keine Analyse oder Extension-Daten verfügbar');
      return;
    }
    
    try {
      await updateAnalysis(
        currentAnalysis.id,
        currentAnalysis.name,
        currentAnalysis.businessData,
        currentAnalysis.realData,
        {
          ...currentAnalysis.manualData,
          extensionData: savedExtensionData
        }
      );
      toast.success('Extension-Daten erfolgreich gespeichert!');
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      toast.error('Fehler beim Speichern der Extension-Daten');
    }
  };
  
  // Get automatic content data from extension (only if manually loaded)
  const hasExtensionData = showExtensionData && savedExtensionData !== null;
  const contentText = hasExtensionData ? savedExtensionData.content?.fullText || '' : '';
  const wordCount = hasExtensionData ? savedExtensionData.content?.wordCount || 0 : 0;
  
  // Branchenspezifische Content-Themen
  const industryContentTopics = {
    shk: {
      name: 'SHK-Betriebe',
      coreTopics: ['Heizungsinstallation', 'Sanitärreparaturen', 'Klimaanlagen', 'Notdienst', 'Wartungsverträge', 'Energieberatung'],
      seasonalTopics: ['Heizung winterfest machen', 'Klimaanlagen für den Sommer', 'Rohrreinigung Frühjahr'],
      expertTopics: ['Smart Home Integration', 'Wärmepumpen', 'Solarthermie', 'Legionellenprüfung']
    },
    maler: {
      name: 'Malerbetriebe',
      coreTopics: ['Innenanstrich', 'Fassadenanstrich', 'Renovierung', 'Tapezieren', 'Lackierarbeiten', 'Farbberatung'],
      seasonalTopics: ['Fassadenanstrich Frühjahr', 'Winterschutz Anstriche', 'Renovierung vor Umzug'],
      expertTopics: ['Spezialputze', 'Denkmalschutz', 'Wärmedämmung', 'Schimmelbehandlung']
    },
    elektriker: {
      name: 'Elektrikerbetriebe', 
      coreTopics: ['Elektroinstallation', 'Beleuchtung', 'Sicherungskästen', 'Smart Home', 'E-Mobilität', 'Photovoltaik'],
      seasonalTopics: ['Weihnachtsbeleuchtung', 'Gartenstrom Sommer', 'Heizungssteuerung Winter'],
      expertTopics: ['KNX-Systeme', 'Energiespeicher', 'Wallboxen', 'Blitzschutz']
    },
    dachdecker: {
      name: 'Dachdeckerbetriebe',
      coreTopics: ['Dachdeckung', 'Dachreparatur', 'Dachrinnen', 'Isolierung', 'Flachdach', 'Steildach'],
      seasonalTopics: ['Sturm-Reparaturen', 'Wintercheck Dach', 'Dachrinnenreinigung'],
      expertTopics: ['Gründächer', 'Solardächer', 'Dachfenster', 'Blitzableiter']
    },
    stukateur: {
      name: 'Stukateur-Betriebe',
      coreTopics: ['Putzarbeiten', 'Trockenbau', 'Stuck', 'Fassadengestaltung', 'Innenausbau', 'Sanierung'],
      seasonalTopics: ['Fassadensanierung Frühjahr', 'Innenausbau Winter', 'Feuchtigkeitsschäden'],
      expertTopics: ['Historische Fassaden', 'Wärmedämmverbundsysteme', 'Akustikputz', 'Brandschutzputz']
    },
    planungsbuero: {
      name: 'Planungsbüros',
      coreTopics: ['Anlagenplanung', 'Energiekonzepte', 'Gebäudetechnik', 'Beratung', 'Projektmanagement', 'Gutachten'],
      seasonalTopics: ['Energieaudits', 'Heizungsplanung', 'Klimakonzepte'],
      expertTopics: ['BIM-Planung', 'Passivhaus', 'Gebäudeautomation', 'Nachhaltigkeitsberatung']
    },
    'facility-management': {
      name: 'Facility Management',
      coreTopics: ['Gebäudereinigung', 'Hausmeisterdienst', 'Wartung', 'Sicherheitsdienst', 'Grünpflege', 'Energiemanagement'],
      seasonalTopics: ['Winterdienst', 'Gartenpflege Sommer', 'Heizungsablesung', 'Klimawartung'],
      expertTopics: ['Smart Building', 'Nachhaltigkeitsmanagement', 'Compliance', 'Digitales Facility Management']
    }
  };

  // Safe access to industry data with fallback
  const currentIndustry = industryContentTopics[industry] || {
    name: 'Allgemein',
    coreTopics: ['Service', 'Qualität', 'Beratung', 'Wartung', 'Reparatur', 'Installation'],
    seasonalTopics: ['Frühjahrscheck', 'Sommerservice', 'Wintervorbereitung'],
    expertTopics: ['Speziallösungen', 'Beratung', 'Modernisierung', 'Effizienz']
  };

  // Calculate content score from manual data
  const calculateContentScore = () => {
    if (!manualContentData) return 0;
    
    return Math.round(
      (manualContentData.textQuality + 
       manualContentData.contentRelevance + 
       manualContentData.expertiseLevel + 
       manualContentData.contentFreshness) / 4
    );
  };

  const contentScore = calculateContentScore();
  const hasContentData = manualContentData !== null;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "score-text-high";   // 90-100% gold
    if (score >= 61) return "score-text-medium"; // 61-89% grün
    return "score-text-low";                     // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "secondary";        // gold
    if (score >= 61) return "default";          // grün
    return "destructive";                       // rot
  };

  const getCoverageBadge = (coverage: number) => {
    if (coverage >= 80) return "default";
    if (coverage >= 60) return "secondary";
    return "destructive";
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "sehr hoch": return "destructive";
      case "hoch": return "default";
      case "mittel": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Content-Analyse für {currentIndustry.name}
            <div className="flex items-center gap-2">
              {hasContentData && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  📝 Manuell bewertet
                </Badge>
              )}
              <div 
                className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                  contentScore >= 90 ? 'bg-yellow-400 text-black' : 
                  contentScore >= 61 ? 'bg-green-500 text-white' : 
                  contentScore > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {contentScore > 0 ? `${contentScore}%` : '—'}
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Content-Qualität und Relevanz für {url}
            {manualContentData?.notes && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <strong>Manuelle Notizen:</strong> {manualContentData.notes}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="automatic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatic">Automatische Analyse</TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Manuelle Bewertung
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="automatic" className="space-y-6 mt-6">
              {/* Button to load extension data */}
              <Card className="mb-6 border-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-semibold">
                          Extension-Daten laden
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Klicken Sie auf "Daten laden", um automatisch erkannte Inhalte anzuzeigen
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleLoadExtensionData}
                        disabled={showExtensionData || isLoading}
                        variant={showExtensionData ? "secondary" : "default"}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Lädt...' : showExtensionData ? 'Daten geladen' : 'Daten laden'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Automatische Content-Daten von Extension */}
              {hasExtensionData && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Content-Struktur (Automatisch erkannt)
                    </CardTitle>
                    <CardDescription>
                      Von der Chrome Extension automatisch extrahierte Content-Daten
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {wordCount}
                        </div>
                        <div className="text-sm text-gray-600">Wörter gesamt</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {Math.round(wordCount / 200)}
                        </div>
                        <div className="text-sm text-gray-600">Geschätzte Lesezeit (Min.)</div>
                      </div>
                    </div>
                    
                    {contentText && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-sm mb-2">Content-Vorschau:</h4>
                        <div className="p-3 bg-gray-50 rounded text-xs text-gray-700 max-h-32 overflow-y-auto">
                          {contentText.slice(0, 500)}...
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-xs text-blue-700">
                        💡 <strong>Hinweis:</strong> Dies sind automatisch erkannte Daten. Für eine detaillierte Qualitätsbewertung nutzen Sie bitte den Tab "Manuelle Bewertung".
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {hasContentData ? (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Content-Qualität (Manuelle Bewertung)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Textqualität</span>
                            <span className="text-sm font-bold">{manualContentData!.textQuality}%</span>
                          </div>
                          <Progress value={manualContentData!.textQuality} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Grammatik, Rechtschreibung, Stil
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Content-Relevanz</span>
                            <span className="text-sm font-bold">{manualContentData!.contentRelevance}%</span>
                          </div>
                          <Progress value={manualContentData!.contentRelevance} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Relevanz für die Zielgruppe
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Expertise-Level</span>
                            <span className="text-sm font-bold">{manualContentData!.expertiseLevel}%</span>
                          </div>
                          <Progress value={manualContentData!.expertiseLevel} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Fachliche Tiefe und Kompetenz
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium">Content-Aktualität</span>
                            <span className="text-sm font-bold">{manualContentData!.contentFreshness}%</span>
                          </div>
                          <Progress value={manualContentData!.contentFreshness} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Aktualität und Pflege der Inhalte
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Gesamtscore</span>
                        <span className={`font-bold ${getScoreColor(contentScore)}`}>
                          {contentScore}%
                        </span>
                      </div>
                      <Progress value={contentScore} className="h-3" />
                    </div>
                    
                    {manualContentData!.notes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Zusätzliche Notizen:</p>
                        <p className="text-sm text-blue-700">{manualContentData!.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : hasExtensionData ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Content-Analyse (Extension-Daten)
                    </CardTitle>
                    <CardDescription>
                      Automatisch erkannte Content-Daten sind verfügbar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="text-lg font-semibold text-blue-900">Wortanzahl</div>
                          <div className="text-3xl font-bold text-blue-600">{wordCount}</div>
                          <div className="text-sm text-blue-700 mt-1">
                            {wordCount > 500 ? '✓ Gute Content-Länge' : '⚠ Content könnte ausführlicher sein'}
                          </div>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <div className="text-lg font-semibold text-purple-900">Lesezeit</div>
                          <div className="text-3xl font-bold text-purple-600">~{Math.round(wordCount / 200)} Min.</div>
                          <div className="text-sm text-purple-700 mt-1">Durchschnittliche Lesedauer</div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                        <p className="text-sm text-green-800">
                          <strong>💡 Hinweis:</strong> Diese Daten wurden automatisch von der Chrome Extension erkannt. 
                          Für eine detaillierte qualitative Bewertung nutzen Sie bitte den Tab "Manuelle Bewertung", 
                          um die Content-Qualität, Relevanz, Expertise und Aktualität zu bewerten.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Content-Analyse</CardTitle>
                    <CardDescription>
                      Keine Content-Daten verfügbar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 space-y-4">
                      <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
                      <div>
                        <p className="font-semibold text-gray-700">Keine Content-Analyse vorhanden</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Bitte verwenden Sie den Tab "Manuelle Bewertung", um die Content-Qualität zu bewerten.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="manual" className="mt-6">
              <ManualContentInput 
                onSave={updateManualContentData}
                initialData={manualContentData}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <AIReviewCheckbox
        categoryName="Content-Qualität"
        isReviewed={reviewStatus['Content-Qualität']?.isReviewed || false}
        onReviewChange={(reviewed) => updateReviewStatus('Content-Qualität', reviewed)}
      />
    </div>
  );
};

export default ContentAnalysis;
