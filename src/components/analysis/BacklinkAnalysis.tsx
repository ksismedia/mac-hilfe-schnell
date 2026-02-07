import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExternalLink, Link, AlertCircle, CheckCircle, Edit, Search, RefreshCw, Info } from 'lucide-react';
import { ManualBacklinkInput } from './ManualBacklinkInput';
import { useManualData } from '@/hooks/useManualData';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateBacklinksScore } from './export/scoreCalculations';
import { Checkbox } from '@/components/ui/checkbox';

interface BacklinkAnalysisProps {
  url: string;
  manualBacklinkData?: any;
  updateManualBacklinkData?: (data: any) => void;
  realData?: any;
  manualReputationData?: any;
}

const BacklinkAnalysis: React.FC<BacklinkAnalysisProps> = ({ 
  url, 
  manualBacklinkData: propManualBacklinkData, 
  updateManualBacklinkData: propUpdateManualBacklinkData,
  realData,
  manualReputationData
}) => {
  // Use props if provided, otherwise fall back to hook
  const hookData = useManualData();
  const manualBacklinkData = propManualBacklinkData ?? hookData.manualBacklinkData;
  const updateManualBacklinkData = propUpdateManualBacklinkData ?? hookData.updateManualBacklinkData;
  const [webMentions, setWebMentions] = useState<any[]>(propManualBacklinkData?.webMentions || []);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!(propManualBacklinkData?.webMentions?.length));
  
  // Local state for disabledBacklinks to ensure immediate UI updates
  const [localDisabledBacklinks, setLocalDisabledBacklinks] = useState<string[]>(
    propManualBacklinkData?.disabledBacklinks || []
  );
  
  // Track initial URL to detect when a different analysis is loaded
  const [initialUrl, setInitialUrl] = useState(url);
  
  // Only sync local state when loading a DIFFERENT analysis (URL changes)
  useEffect(() => {
    if (url !== initialUrl) {
      console.log('🔗 Loading different analysis - syncing disabledBacklinks from props');
      setLocalDisabledBacklinks(propManualBacklinkData?.disabledBacklinks || []);
      setWebMentions(propManualBacklinkData?.webMentions || []);
      setHasSearched(!!(propManualBacklinkData?.webMentions?.length));
      setInitialUrl(url);
    }
  }, [url, initialUrl, propManualBacklinkData]);
  
  // NOTE: Extension "external links" are OUTBOUND links (from the site), NOT backlinks!
  // Real backlinks only come from web mentions (Google Search results) and manual data

  // Helper function to update parent state while preserving all local values
  const persistBacklinkData = (updates: Partial<any>) => {
    const currentData = {
      ...manualBacklinkData,
      disabledBacklinks: localDisabledBacklinks,
      webMentions: webMentions
    };
    console.log('🔗 persistBacklinkData - before:', { 
      disabledBacklinks: currentData.disabledBacklinks?.length,
      webMentions: currentData.webMentions?.length 
    });
    const newData = { ...currentData, ...updates };
    console.log('🔗 persistBacklinkData - after:', { 
      disabledBacklinks: newData.disabledBacklinks?.length,
      webMentions: newData.webMentions?.length 
    });
    updateManualBacklinkData(newData);
  };

  // Toggle backlink disabled status
  const toggleBacklinkDisabled = (backlinkUrl: string) => {
    const isCurrentlyDisabled = localDisabledBacklinks.includes(backlinkUrl);
    
    const newDisabledList = isCurrentlyDisabled
      ? localDisabledBacklinks.filter((url: string) => url !== backlinkUrl)
      : [...localDisabledBacklinks, backlinkUrl];
    
    console.log('🔗 toggleBacklinkDisabled:', { backlinkUrl, isCurrentlyDisabled, newDisabledList, currentWebMentions: webMentions.length });
    
    // Update local state immediately for UI
    setLocalDisabledBacklinks(newDisabledList);
    
    // Persist to parent - explicitly pass updated disabledBacklinks
    persistBacklinkData({ disabledBacklinks: newDisabledList });
  };

  // Calculate backlink score using centralized function (now considers disabled backlinks)
  // Use localDisabledBacklinks to ensure score reflects current UI state
  const backlinkScore = calculateBacklinksScore(
    realData,
    { ...manualBacklinkData, disabledBacklinks: localDisabledBacklinks, webMentions },
    manualReputationData,
    webMentions
  );

  // Search for web mentions of the URL (REAL BACKLINKS)
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
        
        // Save webMentions using helper function that preserves all local state
        persistBacklinkData({
          webMentions: filteredResults,
          lastSearched: new Date().toISOString()
        });
      } else {
        setWebMentions([]);
        persistBacklinkData({
          webMentions: [],
          lastSearched: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Backlink search error:', error);
      setWebMentions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // NOTE: webMentions sync is now handled in the URL-change useEffect above

  useEffect(() => {
    // Only auto-search if no saved webMentions and not already searched
    if (!webMentions.length && !hasSearched && !isSearching) {
      searchBacklinks();
    }
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
                  backlinkScore >= 60 ? 'bg-green-500 text-white' : 
                  backlinkScore > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600'
                }`}
              >
                {backlinkScore > 0 ? `${backlinkScore}%` : '—'}
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Backlinks sind Links VON anderen Websites AUF diese Seite
            {manualBacklinkData?.notes && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <strong>Manuelle Notizen:</strong> {manualBacklinkData.notes}
              </div>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Info-Box: Was sind Backlinks? */}
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Was sind Backlinks?</p>
                <p className="text-sm text-blue-800">
                  Backlinks sind Links von <strong>anderen Websites</strong>, die auf Ihre Website verweisen. 
                  Sie sind wichtig für SEO und zeigen, wie relevant und vertrauenswürdig Ihre Website ist.
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue="web-mentions" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="web-mentions" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Web-Erwähnungen (Backlinks)
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Manuelle Bewertung
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="web-mentions" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    Web-Erwähnungen (Echte Backlinks)
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
                    Links von anderen Websites, die auf diese Seite verweisen
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
                          {webMentions.filter(m => !localDisabledBacklinks.includes(m.link)).length} Backlink(s) aktiv
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        {webMentions.map((mention, index) => {
                          const isDisabled = localDisabledBacklinks.includes(mention.link);
                          
                          return (
                            <Card key={index} className={`border-l-4 ${isDisabled ? 'border-l-gray-300 opacity-50' : 'border-l-blue-500'}`}>
                              <CardContent className="pt-4">
                                <div className="space-y-2">
                                  <div className="flex items-start gap-3">
                                    <Checkbox 
                                      checked={!isDisabled}
                                      onCheckedChange={() => toggleBacklinkDisabled(mention.link)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
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
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Klicken Sie auf "Erneut suchen", um Web-Erwähnungen zu finden
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Backlink-Profil - Mit manuellen Daten wenn vorhanden */}
              {manualBacklinkData && (
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
              )}
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-6 mt-6">
              <ManualBacklinkInput
                initialData={{
                  ...manualBacklinkData,
                  disabledBacklinks: localDisabledBacklinks,
                  webMentions: webMentions
                }}
                onSave={(data) => {
                  console.log('🔗 ManualBacklinkInput onSave - preserving local state:', {
                    localDisabledBacklinks: localDisabledBacklinks.length,
                    webMentions: webMentions.length
                  });
                  // Use persistBacklinkData to ensure all local state is preserved
                  persistBacklinkData({
                    totalBacklinks: data.totalBacklinks,
                    qualityScore: data.qualityScore,
                    domainAuthority: data.domainAuthority,
                    localRelevance: data.localRelevance,
                    spamLinks: data.spamLinks,
                    notes: data.notes
                  });
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacklinkAnalysis;
