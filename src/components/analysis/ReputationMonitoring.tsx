import React, { useState, useEffect } from 'react';
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

const ReputationMonitoring: React.FC<ReputationMonitoringProps> = ({ 
  companyName, 
  url, 
  industry,
  manualReputationData,
  updateReputationData
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [reputationScore, setReputationScore] = useState(0);
  const [additionalSearchTerms, setAdditionalSearchTerms] = useState<string>('');

  // Initialize from saved data
  useEffect(() => {
    if (manualReputationData) {
      setSearchResults(manualReputationData.searchResults || []);
      setReputationScore(manualReputationData.reputationScore || 0);
      setHasSearched(true);
      setAdditionalSearchTerms(manualReputationData.additionalSearchTerms || '');
    }
  }, [manualReputationData]);

  const performReputationSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);

    try {
      // Erweiterte Suche nach Erwähnungen des Unternehmens
      const cleanUrl = url.replace('https://', '').replace('http://', '').replace('www.', '');
      
      // Build search query with additional terms
      let searchQuery = `"${companyName}" OR ${cleanUrl}`;
      
      // Add user-defined additional search terms (sanitized)
      if (additionalSearchTerms.trim()) {
        const sanitizedTerms = additionalSearchTerms
          .trim()
          .split(',')
          .map(term => term.trim())
          .filter(term => term.length > 0 && term.length <= 100)
          .map(term => `"${term.replace(/"/g, '')}"`)
          .join(' OR ');
        
        if (sanitizedTerms) {
          searchQuery += ` OR ${sanitizedTerms}`;
        }
      }
      
      console.log('Starting reputation search with query:', searchQuery);
      const results = await GoogleAPIService.searchWeb(searchQuery, 10);

      console.log('Search results received:', results);
      console.log('Has items?', results?.items?.length);

      if (results && results.items && results.items.length > 0) {
        setSearchResults(results.items);
        
        // Berechne Reputation Score basierend auf Anzahl und Art der Erwähnungen
        const positiveKeywords = ['gut', 'sehr gut', 'empfehlung', 'professionell', 'zuverlässig', 'kompetent', 'freundlich', 'qualität'];
        const negativeKeywords = ['schlecht', 'unzufrieden', 'nicht empfehlenswert', 'probleme', 'beschwerde', 'mangelhaft'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        
        results.items.forEach((item: SearchResult) => {
          const text = (item.title + ' ' + item.snippet).toLowerCase();
          positiveKeywords.forEach(keyword => {
            if (text.includes(keyword)) positiveCount++;
          });
          negativeKeywords.forEach(keyword => {
            if (text.includes(keyword)) negativeCount++;
          });
        });

        // Score basierend auf Anzahl der Erwähnungen und Sentiment
        const baseScore = Math.min(results.items.length * 8, 70); // Max 70 für Erwähnungen
        const sentimentBonus = Math.min((positiveCount / Math.max(negativeCount, 1)) * 15, 30);
        const finalScore = Math.min(Math.round(baseScore + sentimentBonus), 100);
        
        setReputationScore(finalScore);
        setSearchResults(results.items);
        
        // Determine sentiment
        const sentimentValue = positiveCount > negativeCount ? 'positive' : 
                              negativeCount > positiveCount ? 'negative' : 'neutral';
        
        // Save to manual data
        if (updateReputationData) {
          updateReputationData({
            searchResults: results.items,
            reputationScore: finalScore,
            webMentionsCount: results.items.length,
            sentiment: sentimentValue,
            lastChecked: new Date().toISOString(),
            additionalSearchTerms: additionalSearchTerms,
          });
        }
      } else {
        console.warn('No results found or empty results array');
        console.log('Search API response:', JSON.stringify(results, null, 2));
        setSearchResults([]);
        setReputationScore(30);
        if (updateReputationData) {
          updateReputationData({
            searchResults: [],
            reputationScore: 30,
            webMentionsCount: 0,
            sentiment: 'neutral',
            lastChecked: new Date().toISOString(),
            additionalSearchTerms: additionalSearchTerms,
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

  // Removed auto-start - user must click button to search

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-yellow-400 text-black';
    if (score >= 61) return 'bg-green-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'secondary';
    if (score >= 61) return 'default';
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
              Zusätzliche Suchbegriffe (kommagetrennt)
            </Label>
            <Input
              id="additionalSearchTerms"
              placeholder='z.B. "Firmenname GmbH", "Geschäftsführer Name"'
              value={additionalSearchTerms}
              onChange={(e) => setAdditionalSearchTerms(e.target.value.slice(0, 500))}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              Geben Sie zusätzliche Namen oder Begriffe ein, nach denen gesucht werden soll
            </p>
          </div>
          {/* Score Overview */}
          {hasSearched && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-primary mb-1">
                  {searchResults.length}
                </div>
                <p className="text-sm text-muted-foreground">Erwähnungen gefunden</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Badge variant={getScoreBadge(reputationScore)} className="text-base px-4 py-1">
                  {reputationScore >= 90 ? 'Ausgezeichnet' : reputationScore >= 61 ? 'Gut' : 'Ausbaufähig'}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">Online-Reputation</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  {reputationScore >= 61 ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <AlertCircle className="h-6 w-6 text-yellow-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {reputationScore >= 61 ? 'Positive Präsenz' : 'Verbesserungspotenzial'}
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
              </h3>
              {searchResults.map((result, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-base mb-1 text-primary">
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
              ))}
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
                  {reputationScore < 61 && (
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
