import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Search, ExternalLink, AlertCircle, CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { Skeleton } from '@/components/ui/skeleton';
import { ManualReputationData } from '@/hooks/useManualData';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ReputationMonitoringProps {
  companyName: string;
  url: string;
  industry: string;
  manualReputationData?: ManualReputationData | null;
  updateReputationData?: (data: ManualReputationData | null) => void;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

const positiveKeywords = ['gut', 'sehr gut', 'empfehlung', 'professionell', 'zuverlässig', 'kompetent', 'freundlich', 'qualität'];
const negativeKeywords = ['schlecht', 'unzufrieden', 'nicht empfehlenswert', 'probleme', 'beschwerde', 'mangelhaft'];

const calculateReputationFromResults = (results: SearchResult[]) => {
  let positiveCount = 0;
  let negativeCount = 0;

  results.forEach((item) => {
    const text = (item.title + ' ' + item.snippet).toLowerCase();
    positiveKeywords.forEach(kw => { if (text.includes(kw)) positiveCount++; });
    negativeKeywords.forEach(kw => { if (text.includes(kw)) negativeCount++; });
  });

  const baseScore = Math.min(results.length * 8, 70);
  const sentimentBonus = Math.min((positiveCount / Math.max(negativeCount, 1)) * 15, 30);
  const finalScore = Math.min(Math.round(baseScore + sentimentBonus), 100);
  const sentiment = positiveCount > negativeCount ? 'positive' as const :
                    negativeCount > positiveCount ? 'negative' as const : 'neutral' as const;

  return { score: finalScore, sentiment };
};

const ReputationMonitoring: React.FC<ReputationMonitoringProps> = ({ 
  companyName, 
  url, 
  industry,
  manualReputationData,
  updateReputationData
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [disabledMentions, setDisabledMentions] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [reputationScore, setReputationScore] = useState(0);
  const [additionalSearchTerms, setAdditionalSearchTerms] = useState<string>('');

  // Initialize from saved data and filter out own domain
  useEffect(() => {
    if (manualReputationData) {
      const cleanUrl = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      const filteredResults = (manualReputationData.searchResults || []).filter((item: SearchResult) => {
        const itemDomain = (item.displayLink || item.link || '')
          .replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
        return itemDomain !== cleanUrl;
      });
      
      setSearchResults(filteredResults);
      setDisabledMentions(manualReputationData.disabledMentions || []);
      setHasSearched(true);
      setAdditionalSearchTerms(manualReputationData.additionalSearchTerms || '');

      // Recalculate score based on enabled results only
      const enabledResults = filteredResults.filter(r => !(manualReputationData.disabledMentions || []).includes(r.link));
      const { score } = calculateReputationFromResults(enabledResults);
      setReputationScore(enabledResults.length > 0 ? score : (filteredResults.length > 0 ? 30 : 0));
    }
  }, [manualReputationData, url]);

  const toggleMention = useCallback((link: string) => {
    setDisabledMentions(prev => {
      const newDisabled = prev.includes(link)
        ? prev.filter(l => l !== link)
        : [...prev, link];

      // Recalculate score with new disabled list
      const enabledResults = searchResults.filter(r => !newDisabled.includes(r.link));
      const { score, sentiment } = calculateReputationFromResults(enabledResults);
      const finalScore = enabledResults.length > 0 ? score : 30;
      setReputationScore(finalScore);

      // Persist
      if (updateReputationData) {
        updateReputationData({
          searchResults,
          reputationScore: finalScore,
          webMentionsCount: enabledResults.length,
          sentiment,
          lastChecked: manualReputationData?.lastChecked || new Date().toISOString(),
          additionalSearchTerms,
          disabledMentions: newDisabled,
        });
      }

      return newDisabled;
    });
  }, [searchResults, updateReputationData, manualReputationData, additionalSearchTerms]);

  const performReputationSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const cleanUrl = url.replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      const domainOnly = cleanUrl.replace(/\.[a-z]{2,}$/, '').replace(/\./g, ' '); // e.g. "schneider-sohn"
      const siteExclude = ` -site:${cleanUrl}`;
      
      // Extrahiere Stadt/PLZ aus dem Firmennamen oder Zusatzbegriffen
      const cityMatch = (companyName + ' ' + additionalSearchTerms).match(/\b(\d{5})\s+([A-ZÄÖÜa-zäöüß-]+)/);
      const city = cityMatch ? cityMatch[2] : '';
      
      // Zusätzliche Begriffe sammeln
      const extraTerms = additionalSearchTerms.trim()
        ? additionalSearchTerms.trim().split(',')
            .map(term => term.trim())
            .filter(term => term.length > 0 && term.length <= 100)
            .map(term => term.replace(/"/g, ''))
        : [];

      // Mehrere gezielte Suchanfragen erstellen
      const queries: string[] = [];
      
      // 1. Firmenname exakt (Hauptsuche)
      queries.push(`"${companyName}"${siteExclude}`);
      
      // 2. Domain-Erwähnungen (andere Seiten die die Domain nennen)
      queries.push(`"${cleanUrl}"${siteExclude}`);
      
      // 3. Firmenname + Stadt (lokale Erwähnungen)
      if (city) {
        queries.push(`"${companyName.replace(/\s+in\s+\d{5}\s+\S+/i, '').trim()}" ${city}${siteExclude}`);
      }
      
      // 4. Zusätzliche Begriffe einzeln mit Stadt
      for (const term of extraTerms.slice(0, 3)) {
        const termQuery = city ? `"${term}" ${city}${siteExclude}` : `"${term}"${siteExclude}`;
        queries.push(termQuery);
      }

      console.log('Reputation: Running', queries.length, 'search queries:', queries);

      // Alle Suchen parallel ausführen
      const searchPromises = queries.map(q => GoogleAPIService.searchWeb(q, 10));
      const allResults = await Promise.all(searchPromises);
      
      // Ergebnisse kombinieren und deduplizieren
      const seenLinks = new Set<string>();
      const combinedResults: SearchResult[] = [];
      
      for (const result of allResults) {
        if (result?.items) {
          for (const item of result.items) {
            // Eigene Domain filtern
            const itemDomain = (item.displayLink || item.link || '')
              .replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
            if (itemDomain === cleanUrl) continue;
            
            // Duplikate filtern (gleicher Link)
            if (seenLinks.has(item.link)) continue;
            seenLinks.add(item.link);
            
            combinedResults.push(item);
          }
        }
      }

      console.log('Reputation: Combined', combinedResults.length, 'unique results from', queries.length, 'queries');

      if (combinedResults.length > 0) {
        setSearchResults(combinedResults);
        const validDisabled = disabledMentions.filter(link => combinedResults.some(r => r.link === link));
        setDisabledMentions(validDisabled);
        
        const enabledResults = combinedResults.filter(r => !validDisabled.includes(r.link));
        const { score, sentiment } = calculateReputationFromResults(enabledResults);
        const finalScore = enabledResults.length > 0 ? score : 30;
        setReputationScore(finalScore);
        
        if (updateReputationData) {
          updateReputationData({
            searchResults: combinedResults,
            reputationScore: finalScore,
            webMentionsCount: enabledResults.length,
            sentiment,
            lastChecked: new Date().toISOString(),
            additionalSearchTerms,
            disabledMentions: validDisabled,
          });
        }
      } else {
        setSearchResults([]);
        setReputationScore(30);
        if (updateReputationData) {
          updateReputationData({
            searchResults: [],
            reputationScore: 30,
            webMentionsCount: 0,
            sentiment: 'neutral',
            lastChecked: new Date().toISOString(),
            additionalSearchTerms,
            disabledMentions: [],
          });
        }
      }
    } catch (error) {
      console.error('Reputation search error:', error);
      setSearchResults([]);
      setReputationScore(0);
    } finally {
      setIsSearching(false);
    }
  };

  const enabledResults = searchResults.filter(r => !disabledMentions.includes(r.link));

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-yellow-400 text-black';
    if (score >= 60) return 'bg-green-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'secondary';
    if (score >= 60) return 'default';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reputation Monitoring
          </div>
          {hasSearched && (
            <div className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${getScoreColor(reputationScore)}`}>
              {reputationScore}%
            </div>
          )}
        </CardTitle>
        <CardDescription>
          Online-Reputation und Erwähnungen im Web
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Additional Search Terms Input */}
          <div className="space-y-2">
            <Label htmlFor="additionalSearchTerms">
              Alternative Firmennamen / Zusatzbegriffe (kommagetrennt)
            </Label>
            <Input
              id="additionalSearchTerms"
              placeholder='z.B. Schneider & Sohn, Schneider Heizungsbau, Thomas Schneider'
              value={additionalSearchTerms}
              onChange={(e) => setAdditionalSearchTerms(e.target.value.slice(0, 500))}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Alternative Schreibweisen oder Namen, unter denen die Firma im Web erwähnt werden könnte. 
              Die Suche findet Seiten, die mindestens einen dieser Begriffe oder den Firmennamen enthalten.
            </p>
          </div>

          {/* Score Overview */}
          {hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">
                  {enabledResults.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  Erwähnungen aktiv
                  {disabledMentions.length > 0 && (
                    <span className="block text-xs">({disabledMentions.length} deaktiviert)</span>
                  )}
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge variant={getScoreBadge(reputationScore)} className="text-base px-4 py-1">
                  {reputationScore >= 90 ? 'Ausgezeichnet' : reputationScore >= 60 ? 'Gut' : 'Ausbaufähig'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">Online-Reputation</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {reputationScore >= 60 ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reputationScore >= 60 ? 'Positive Präsenz' : 'Verbesserungspotenzial'}
                </p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {isSearching ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Gefundene Erwähnungen
                <span className="text-sm font-normal text-muted-foreground">
                  (Deaktivierte Erwähnungen fließen nicht in die Bewertung ein)
                </span>
              </h3>
              {searchResults.map((result, index) => {
                const isDisabled = disabledMentions.includes(result.link);
                return (
                  <Card key={index} className={`transition-shadow ${isDisabled ? 'opacity-50' : 'hover:shadow-md'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <Checkbox
                            checked={!isDisabled}
                            onCheckedChange={() => toggleMention(result.link)}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold text-base mb-1 ${isDisabled ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                            {result.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {result.snippet}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {result.displayLink}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(result.link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : hasSearched ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Keine Erwähnungen im Web gefunden. Das Unternehmen sollte seine Online-Präsenz ausbauen.
              </p>
            </div>
          ) : null}

          {/* Recommendations */}
          {hasSearched && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Handlungsempfehlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {reputationScore < 60 && (
                    <>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                        <span>Aktive Online-Präsenz aufbauen durch regelmäßige Social Media Aktivitäten</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
                        <span>Kunden um Bewertungen auf Google und Branchenportalen bitten</span>
                      </li>
                    </>
                  )}
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Regelmäßiges Monitoring der Online-Reputation durchführen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>Auf negative Bewertungen professionell und zeitnah reagieren</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={performReputationSearch} 
            disabled={isSearching}
            variant="outline"
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Suche läuft...' : 'Erneut suchen'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReputationMonitoring;
