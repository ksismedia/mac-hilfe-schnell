import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image, Video, MessageSquare, Target, Calendar, TrendingUp, Users, Zap, Edit, AlertCircle } from 'lucide-react';
import { ManualContentInput } from './ManualContentInput';
import { useManualData } from '@/hooks/useManualData';
import { useExtensionData } from '@/hooks/useExtensionData';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';

interface ContentAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei';
}

const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ url, industry }) => {
  const { manualContentData, updateManualContentData } = useManualData();
  const { extensionData } = useExtensionData();
  const { reviewStatus, updateReviewStatus, savedExtensionData } = useAnalysisContext();
  
  // Use live extension data or fallback to saved extension data
  const activeExtensionData = extensionData || savedExtensionData;
  
  // Get automatic content data from extension
  const hasExtensionData = activeExtensionData !== null;
  const contentText = activeExtensionData?.content?.fullText || '';
  const wordCount = activeExtensionData?.content?.wordCount || 0;
  
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
