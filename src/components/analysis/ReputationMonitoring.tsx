import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, AlertCircle, CheckCircle, TrendingUp, MessageSquare, Building2, Globe, MapPin, Briefcase } from 'lucide-react';
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

const positiveKeywords = ['gut', 'sehr gut', 'empfehlung', 'professionell', 'zuverlässig', 'kompetent', 'freundlich', 'qualität', 'top', 'hervorragend', 'super', 'klasse', 'perfekt', 'ausgezeichnet'];
const negativeKeywords = ['schlecht', 'unzufrieden', 'nicht empfehlenswert', 'probleme', 'beschwerde', 'mangelhaft', 'warnung', 'betrug', 'abzocke', 'unseriös'];

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

  // Eigene Eingabefelder
  const [inputCompanyName, setInputCompanyName] = useState(companyName || '');
  const [inputBusinessPurpose, setInputBusinessPurpose] = useState(industry || '');
  const [inputAddress, setInputAddress] = useState('');
  const [inputUrl, setInputUrl] = useState(url || '');
  const [inputAltNames, setInputAltNames] = useState('');

  // Sync from props on mount
  useEffect(() => {
    if (companyName && !inputCompanyName) setInputCompanyName(companyName);
    if (industry && !inputBusinessPurpose) setInputBusinessPurpose(industry);
    if (url && !inputUrl) setInputUrl(url);
  }, [companyName, industry, url]);

  // Restore saved search inputs
  useEffect(() => {
    if (manualReputationData) {
      const cleanUrl = (inputUrl || url).replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      const filteredResults = (manualReputationData.searchResults || []).filter((item: SearchResult) => {
        const itemDomain = (item.displayLink || item.link || '')
          .replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
        return itemDomain !== cleanUrl;
      });
      
      setSearchResults(filteredResults);
      setDisabledMentions(manualReputationData.disabledMentions || []);
      setHasSearched(true);

      // Restore input fields from saved data
      if ((manualReputationData as any).inputCompanyName) setInputCompanyName((manualReputationData as any).inputCompanyName);
      if ((manualReputationData as any).inputBusinessPurpose) setInputBusinessPurpose((manualReputationData as any).inputBusinessPurpose);
      if ((manualReputationData as any).inputAddress) setInputAddress((manualReputationData as any).inputAddress);
      if ((manualReputationData as any).inputUrl) setInputUrl((manualReputationData as any).inputUrl);
      if ((manualReputationData as any).inputAltNames) setInputAltNames((manualReputationData as any).inputAltNames);

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

      const enabledResults = searchResults.filter(r => !newDisabled.includes(r.link));
      const { score, sentiment } = calculateReputationFromResults(enabledResults);
      const finalScore = enabledResults.length > 0 ? score : 30;
      setReputationScore(finalScore);

      if (updateReputationData) {
        updateReputationData({
          searchResults,
          reputationScore: finalScore,
          webMentionsCount: enabledResults.length,
          sentiment,
          lastChecked: manualReputationData?.lastChecked || new Date().toISOString(),
          additionalSearchTerms: inputAltNames,
          disabledMentions: newDisabled,
          inputCompanyName, inputBusinessPurpose, inputAddress, inputUrl, inputAltNames,
        } as any);
      }

      return newDisabled;
    });
  }, [searchResults, updateReputationData, manualReputationData, inputCompanyName, inputBusinessPurpose, inputAddress, inputUrl, inputAltNames]);

  const performReputationSearch = async () => {
    if (!inputCompanyName.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const cleanUrl = (inputUrl || url).replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
      const siteExclude = cleanUrl ? ` -site:${cleanUrl}` : '';

      // Stadt aus Adresse extrahieren
      const addressParts = inputAddress.trim().split(/[,\s]+/);
      const city = addressParts.find(part => part.length > 2 && !/^\d+$/.test(part) && !/^\d{5}$/.test(part)) || '';
      const plz = addressParts.find(part => /^\d{5}$/.test(part)) || '';

      // Alternative Namen
      const altNames = inputAltNames.trim()
        ? inputAltNames.trim().split(',').map(n => n.trim()).filter(n => n.length > 0 && n.length <= 100)
        : [];

      // Gezielte Suchanfragen basierend auf den Eingabefeldern
      const queries: string[] = [];

      // 1. Firmenname exakt
      queries.push(`"${inputCompanyName.trim()}"${siteExclude}`);

      // 2. Firmenname + Stadt (wenn vorhanden)
      if (city) {
        queries.push(`"${inputCompanyName.trim()}" "${city}"${siteExclude}`);
      }

      // 3. Firmenname + Unternehmenszweck
      if (inputBusinessPurpose.trim()) {
        queries.push(`"${inputCompanyName.trim()}" ${inputBusinessPurpose.trim()}${siteExclude}`);
      }

      // 4. Firmenname + Unternehmenszweck + Stadt
      if (inputBusinessPurpose.trim() && city) {
        queries.push(`"${inputCompanyName.trim()}" ${inputBusinessPurpose.trim()} ${city}${siteExclude}`);
      }

      // 5. URL/Domain-Erwähnungen
      if (cleanUrl) {
        queries.push(`"${cleanUrl}"${siteExclude}`);
      }

      // 6. Firmenname + Bewertung/Erfahrung
      queries.push(`"${inputCompanyName.trim()}" Bewertung OR Erfahrung OR Rezension${siteExclude}`);

      // 7. Alternative Firmennamen
      for (const altName of altNames.slice(0, 3)) {
        queries.push(`"${altName}"${city ? ` "${city}"` : ''}${siteExclude}`);
      }

      console.log('Reputation: Running', queries.length, 'search queries:', queries);

      const searchPromises = queries.map(q => GoogleAPIService.searchWeb(q, 10));
      const allResults = await Promise.all(searchPromises);
      
      const seenLinks = new Set<string>();
      const combinedResults: SearchResult[] = [];
      
      for (const result of allResults) {
        if (result?.items) {
          for (const item of result.items) {
            const itemDomain = (item.displayLink || item.link || '')
              .replace('https://', '').replace('http://', '').replace('www.', '').split('/')[0];
            if (cleanUrl && itemDomain === cleanUrl) continue;
            if (seenLinks.has(item.link)) continue;
            seenLinks.add(item.link);
            combinedResults.push(item);
          }
        }
      }

      console.log('Reputation: Combined', combinedResults.length, 'unique results');

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
            additionalSearchTerms: inputAltNames,
            disabledMentions: validDisabled,
            inputCompanyName, inputBusinessPurpose, inputAddress, inputUrl, inputAltNames,
          } as any);
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
            additionalSearchTerms: inputAltNames,
            disabledMentions: [],
            inputCompanyName, inputBusinessPurpose, inputAddress, inputUrl, inputAltNames,
          } as any);
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
          Sucht gezielt nach Online-Erwähnungen Ihres Unternehmens auf Basis der eingegebenen Daten
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Eingabefelder */}
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Suchkriterien festlegen
              </CardTitle>
              <CardDescription className="text-xs">
                Je genauer die Angaben, desto relevanter die Ergebnisse
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rep-company" className="flex items-center gap-1.5 text-sm">
                    <Building2 className="h-3.5 w-3.5" />
                    Firmenname *
                  </Label>
                  <Input
                    id="rep-company"
                    value={inputCompanyName}
                    onChange={(e) => setInputCompanyName(e.target.value.slice(0, 200))}
                    placeholder="z.B. Schneider & Sohn GmbH"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rep-purpose" className="flex items-center gap-1.5 text-sm">
                    <Briefcase className="h-3.5 w-3.5" />
                    Unternehmenszweck / Branche
                  </Label>
                  <Input
                    id="rep-purpose"
                    value={inputBusinessPurpose}
                    onChange={(e) => setInputBusinessPurpose(e.target.value.slice(0, 200))}
                    placeholder="z.B. Heizung Sanitär, Malerbetrieb"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rep-address" className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-3.5 w-3.5" />
                    Adresse / Stadt
                  </Label>
                  <Input
                    id="rep-address"
                    value={inputAddress}
                    onChange={(e) => setInputAddress(e.target.value.slice(0, 300))}
                    placeholder="z.B. 59423 Unna oder Musterstraße 1, 59423 Unna"
                    maxLength={300}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rep-url" className="flex items-center gap-1.5 text-sm">
                    <Globe className="h-3.5 w-3.5" />
                    Website-URL
                  </Label>
                  <Input
                    id="rep-url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value.slice(0, 300))}
                    placeholder="z.B. www.schneider-sohn.de"
                    maxLength={300}
                  />
                  <p className="text-xs text-muted-foreground">
                    Eigene Website wird aus den Ergebnissen ausgeschlossen
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rep-altnames" className="flex items-center gap-1.5 text-sm">
                  <Search className="h-3.5 w-3.5" />
                  Alternative Firmennamen (kommagetrennt, optional)
                </Label>
                <Input
                  id="rep-altnames"
                  value={inputAltNames}
                  onChange={(e) => setInputAltNames(e.target.value.slice(0, 500))}
                  placeholder="z.B. Schneider Heizungsbau, Thomas Schneider Sanitär"
                  maxLength={500}
                />
              </div>

              <Button 
                onClick={performReputationSearch} 
                disabled={isSearching || !inputCompanyName.trim()}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? 'Suche läuft...' : hasSearched ? 'Erneut suchen' : 'Reputation analysieren'}
              </Button>
            </CardContent>
          </Card>

          {/* Score Overview */}
          {hasSearched && !isSearching && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          {hasSearched && !isSearching && (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ReputationMonitoring;
