import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExternalLink, Link, AlertCircle, CheckCircle, Edit, Search, RefreshCw } from 'lucide-react';
import { ManualBacklinkInput } from './ManualBacklinkInput';
import { useManualData } from '@/hooks/useManualData';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { Skeleton } from '@/components/ui/skeleton';
import { useExtensionDataLoader } from '@/hooks/useExtensionDataLoader';
import { useSavedAnalyses } from '@/hooks/useSavedAnalyses';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

interface BacklinkAnalysisProps {
  url: string;
}

const BacklinkAnalysis: React.FC<BacklinkAnalysisProps> = ({ url }) => {
  const { manualBacklinkData, updateManualBacklinkData } = useManualData();
  const { savedExtensionData, setSavedExtensionData, currentAnalysis } = useAnalysisContext();
  const { loadLatestExtensionData, isLoading } = useExtensionDataLoader();
  const { updateAnalysis } = useSavedAnalyses();
  const [webMentions, setWebMentions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Derive showExtensionData from savedExtensionData - always show if data exists
  const showExtensionData = !!savedExtensionData;
  
  // Load extension data from Supabase
  const handleLoadExtensionData = async () => {
    const data = await loadLatestExtensionData();
    
    if (data && setSavedExtensionData) {
      setSavedExtensionData(data);
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
  
  // Get automatic link data from extension (only if manually loaded)
  const hasExtensionData = showExtensionData && savedExtensionData !== null;
  const internalLinks = hasExtensionData ? savedExtensionData.content?.links?.internal || [] : [];
  const externalLinks = hasExtensionData ? savedExtensionData.content?.links?.external || [] : [];

  // Calculate backlink score from manual data
  const calculateBacklinkScore = () => {
    if (!manualBacklinkData) return 0;
    
    const qualityScore = Math.round(
      (manualBacklinkData.qualityScore + 
       manualBacklinkData.domainAuthority + 
       manualBacklinkData.localRelevance) / 3
    );

    // Calculate spam penalty
    const spamPenalty = manualBacklinkData.totalBacklinks > 0 
      ? (manualBacklinkData.spamLinks / manualBacklinkData.totalBacklinks) * 30 
      : 0;
    
    return Math.max(0, Math.round(qualityScore - spamPenalty));
  };

  const backlinkScore = calculateBacklinkScore();

  // Search for web mentions of the URL
  const searchBacklinks = async () => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const domain = url.replace('https://', '').replace('http://', '').replace('www.', '');
      const searchQuery = `link:${domain} OR "${domain}"`;
      const results = await GoogleAPIService.searchWeb(searchQuery, 10);

      if (results && results.items) {
        // Filter out results from the own domain
        const filteredResults = results.items.filter((item: any) => {
          const itemDomain = (item.displayLink || item.link || '')
            .replace('https://', '')
            .replace('http://', '')
            .replace('www.', '')
            .split('/')[0];
          
          return itemDomain !== domain;
        });
        
        setWebMentions(filteredResults);
      } else {
        setWebMentions([]);
      }
    } catch (error) {
      console.error('Backlink search error:', error);
      setWebMentions([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Auto-start search on mount
    searchBacklinks();
  }, [url]);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'hoch': return 'score-text-medium';
      case 'mittel': return 'score-text-high';
      case 'niedrig': return 'score-text-low';
      default: return 'score-text-low';
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'hoch': return 'default';
      case 'mittel': return 'secondary';
      case 'niedrig': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Backlink-Analyse
            <div className="flex items-center gap-2">
              {manualBacklinkData && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  📝 Manuell bewertet
                </Badge>
              )}
              <div 
                className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                  backlinkScore >= 90 ? 'bg-yellow-400 text-black' : 
                  backlinkScore >= 61 ? 'bg-green-500 text-white' : 
                  backlinkScore > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {backlinkScore > 0 ? `${backlinkScore}%` : '—'}
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Backlink-Profil und Web-Erwähnungen
            {manualBacklinkData?.notes && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <strong>Manuelle Notizen:</strong> {manualBacklinkData.notes}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="automatic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="automatic">Automatische Analyse</TabsTrigger>
              <TabsTrigger value="web-mentions" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Web-Erwähnungen
              </TabsTrigger>
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
                          Klicken Sie auf "Daten laden", um automatisch erkannte Links anzuzeigen
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
                      {showExtensionData && currentAnalysis && (
                        <Button
                          onClick={handleSaveExtensionData}
                          variant="default"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Speichern
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
          <div className="space-y-6">
            {/* Automatische Link-Daten von Extension */}
            {hasExtensionData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link className="h-5 w-5" />
                    Link-Struktur (Automatisch erkannt)
                  </CardTitle>
                  <CardDescription>
                    Von der Chrome Extension automatisch extrahierte Link-Daten
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {internalLinks.length}
                      </div>
                      <div className="text-sm text-gray-600">Interne Links</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {externalLinks.length}
                      </div>
                      <div className="text-sm text-gray-600">Externe Links</div>
                    </div>
                  </div>
                  
                  {externalLinks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Externe Links:</h4>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {externalLinks.slice(0, 10).map((link: any, idx: number) => (
                          <div key={idx} className="text-xs p-2 bg-gray-50 rounded flex items-center gap-2">
                            <ExternalLink className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <a 
                              href={link.href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate"
                            >
                              {link.text || link.href}
                            </a>
                          </div>
                        ))}
                        {externalLinks.length > 10 && (
                          <p className="text-xs text-gray-500 italic">
                            ... und {externalLinks.length - 10} weitere
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Backlink-Profil - Mit manuellen Daten wenn vorhanden */}
            {manualBacklinkData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Backlink-Profil (Manuelle Bewertung)</CardTitle>
                  <CardDescription>
                    Detaillierte manuelle Analyse des Backlink-Profils
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {manualBacklinkData.totalBacklinks}
                      </div>
                      <div className="text-sm text-gray-600">Backlinks gesamt</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold score-text-low">
                        {manualBacklinkData.spamLinks}
                      </div>
                      <div className="text-sm text-gray-600">Spam/Toxische Links</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold score-text-medium">
                        {manualBacklinkData.totalBacklinks - manualBacklinkData.spamLinks}
                      </div>
                      <div className="text-sm text-gray-600">Qualitäts-Links</div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Backlink-Qualität</span>
                        <span className="text-sm font-bold">{manualBacklinkData.qualityScore}%</span>
                      </div>
                      <Progress value={manualBacklinkData.qualityScore} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Durchschnittliche Qualität der verlinkenden Seiten
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Domain Authority</span>
                        <span className="text-sm font-bold">{manualBacklinkData.domainAuthority}%</span>
                      </div>
                      <Progress value={manualBacklinkData.domainAuthority} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Autorität der verlinkenden Domains
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">Lokale Relevanz</span>
                        <span className="text-sm font-bold">{manualBacklinkData.localRelevance}%</span>
                      </div>
                      <Progress value={manualBacklinkData.localRelevance} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        Relevanz der Links für die lokale Zielgruppe
                      </p>
                    </div>
                  </div>
                  
                  {manualBacklinkData.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Zusätzliche Notizen:</p>
                      <p className="text-sm text-blue-700">{manualBacklinkData.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : hasExtensionData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Backlink-Übersicht (Extension-Daten)</CardTitle>
                  <CardDescription>
                    Automatisch erkannte Link-Struktur verfügbar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-lg font-semibold text-blue-900">Interne Links</div>
                      <div className="text-3xl font-bold text-blue-600">{internalLinks.length}</div>
                      <div className="text-sm text-blue-700 mt-1">Innerhalb der Website</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-lg font-semibold text-purple-900">Externe Links</div>
                      <div className="text-3xl font-bold text-purple-600">{externalLinks.length}</div>
                      <div className="text-sm text-purple-700 mt-1">Zu anderen Websites</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <p className="text-sm text-green-800">
                      <strong>💡 Hinweis:</strong> Diese Daten wurden automatisch von der Chrome Extension erkannt. 
                      Für eine detaillierte Backlink-Bewertung nutzen Sie bitte den Tab "Manuelle Bewertung", 
                      um Backlink-Qualität, Domain Authority und lokale Relevanz zu bewerten.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Backlink-Profil</CardTitle>
                  <CardDescription>
                    Keine Backlink-Daten verfügbar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 space-y-4">
                    <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
                    <div>
                      <p className="font-semibold text-gray-700">Keine Backlink-Analyse vorhanden</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Bitte verwenden Sie den Tab "Manuelle Bewertung", um Backlink-Daten einzugeben.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
            </TabsContent>
            
            <TabsContent value="web-mentions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Web-Erwähnungen
                    <Button 
                      onClick={searchBacklinks} 
                      disabled={isSearching}
                      size="sm"
                      variant="outline"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {isSearching ? 'Suche läuft...' : 'Erneut suchen'}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Online-Erwähnungen Ihrer Website auf anderen Domains
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSearching ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : hasSearched && webMentions.length === 0 ? (
                    <div className="text-center py-8 space-y-4">
                      <AlertCircle className="h-12 w-12 mx-auto text-yellow-500" />
                      <div>
                        <p className="font-semibold text-gray-700">Keine Web-Erwähnungen gefunden</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Dies kann folgende Ursachen haben:
                        </p>
                        <ul className="text-sm text-gray-500 mt-2 space-y-1 text-left max-w-md mx-auto">
                          <li>• Die Google Custom Search API ist nicht aktiviert</li>
                          <li>• Die Website ist noch sehr neu</li>
                          <li>• Es gibt tatsächlich keine externen Erwähnungen</li>
                        </ul>
                        <p className="text-sm text-blue-600 mt-4">
                          💡 Prüfen Sie die API-Einstellungen in den Projekteinstellungen
                        </p>
                      </div>
                    </div>
                  ) : webMentions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-700">
                          {webMentions.length} Web-Erwähnung(en) gefunden
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {webMentions.map((mention, index) => (
                          <Card key={index} className="border-l-4 border-l-blue-500">
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <a 
                                  href={mention.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-semibold text-blue-600 hover:underline flex items-center gap-2"
                                >
                                  {mention.title}
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                                <p className="text-sm text-gray-600">
                                  {mention.snippet}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {mention.displayLink}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Klicken Sie auf "Erneut suchen", um Web-Erwähnungen zu finden
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="manual" className="mt-6">
              <ManualBacklinkInput 
                onSave={updateManualBacklinkData}
                initialData={manualBacklinkData}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacklinkAnalysis;
