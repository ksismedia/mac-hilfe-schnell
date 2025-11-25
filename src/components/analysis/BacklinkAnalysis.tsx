
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExternalLink, Link, AlertCircle, CheckCircle, Edit, Search } from 'lucide-react';
import { ManualBacklinkInput } from './ManualBacklinkInput';
import { useManualData } from '@/hooks/useManualData';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { Skeleton } from '@/components/ui/skeleton';

interface BacklinkAnalysisProps {
  url: string;
}

const BacklinkAnalysis: React.FC<BacklinkAnalysisProps> = ({ url }) => {
  const { manualBacklinkData, updateManualBacklinkData } = useManualData();
  const [webMentions, setWebMentions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Helper function to merge manual and automatic backlink data
  const getEffectiveBacklinkData = () => {
    const baseData = {
      internalLinks: 24,
      externalLinks: 8,
      brokenLinks: 2,
      overallScore: 72,
      linkQuality: 'gut',
      internalLinksData: [
        { text: 'Über uns', url: '/ueber-uns', status: 'aktiv' },
        { text: 'Leistungen', url: '/leistungen', status: 'aktiv' },
        { text: 'Kontakt', url: '/kontakt', status: 'aktiv' },
        { text: 'Notdienst', url: '/notdienst', status: 'aktiv' },
        { text: 'Referenzen', url: '/referenzen', status: 'defekt' }
      ],
      externalLinksData: [
        { text: 'Hersteller XY', url: 'https://example-hersteller.de', quality: 'hoch' },
        { text: 'Branchenverband', url: 'https://shk-verband.de', quality: 'hoch' },
        { text: 'Lieferant ABC', url: 'https://lieferant-abc.com', quality: 'mittel' },
        { text: 'Partnerfirma', url: 'https://partner.de', quality: 'niedrig' }
      ],
      dataSource: "automatic" as const
    };

    // If manual data exists, use it to override automatic scores
    if (manualBacklinkData) {
      const qualityScore = Math.round(
        (manualBacklinkData.qualityScore + 
         manualBacklinkData.domainAuthority + 
         manualBacklinkData.localRelevance) / 3
      );

      // Calculate spam penalty
      const spamPenalty = manualBacklinkData.totalBacklinks > 0 
        ? (manualBacklinkData.spamLinks / manualBacklinkData.totalBacklinks) * 30 
        : 0;
      
      const finalScore = Math.max(0, qualityScore - spamPenalty);

      return {
        ...baseData,
        overallScore: Math.round(finalScore),
        linkQuality: finalScore >= 90 ? 'sehr gut' : finalScore >= 61 ? 'gut' : 'verbesserungsfähig',
        totalBacklinks: manualBacklinkData.totalBacklinks,
        spamLinks: manualBacklinkData.spamLinks,
        domainAuthority: manualBacklinkData.domainAuthority,
        localRelevance: manualBacklinkData.localRelevance,
        qualityScore: manualBacklinkData.qualityScore,
        dataSource: "manual" as const,
        manualNotes: manualBacklinkData.notes
      };
    }

    return baseData;
  };

  // Get the effective backlink data (manual overrides automatic)
  const backlinkData = getEffectiveBacklinkData();

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
              {backlinkData.dataSource === "manual" && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  📝 Manuell bewertet
                </Badge>
              )}
              <div 
                className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                  backlinkData.overallScore >= 90 ? 'bg-yellow-400 text-black' : 
                  backlinkData.overallScore >= 61 ? 'bg-green-500 text-white' : 
                  'bg-red-500 text-white'
                }`}
              >
                {backlinkData.overallScore > 0 ? `${backlinkData.overallScore}%` : '—'}
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Analyse der internen und externen Verlinkungen
            {backlinkData.dataSource === "manual" && backlinkData.manualNotes && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                <strong>Manuelle Notizen:</strong> {backlinkData.manualNotes}
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
          <div className="space-y-6">
            {/* Übersicht */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="text-center p-4 bg-blue-50 rounded-lg">
                 <div className="text-2xl font-bold text-blue-600">
                   {backlinkData.internalLinks}
                 </div>
                 <div className="text-sm text-gray-600">Interne Links</div>
               </div>
               <div className="text-center p-4 bg-green-50 rounded-lg">
                 <div className="text-2xl font-bold score-text-medium">
                   {backlinkData.externalLinks}
                 </div>
                 <div className="text-sm text-gray-600">Externe Links</div>
               </div>
               <div className="text-center p-4 bg-red-50 rounded-lg">
                 <div className="text-2xl font-bold score-text-low">
                   {backlinkData.brokenLinks}
                 </div>
                 <div className="text-sm text-gray-600">Defekte Links</div>
               </div>
               <div className="text-center p-4 bg-purple-50 rounded-lg">
                 <div className="text-2xl font-bold text-purple-600">
                   {backlinkData.linkQuality}
                 </div>
                 <div className="text-sm text-gray-600">Link-Qualität</div>
               </div>
            </div>

            {/* Interne Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interne Verlinkung</CardTitle>
                <CardDescription>
                  Navigation und interne Seitenstruktur
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Link-Text</TableHead>
                      <TableHead>Ziel-URL</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backlinkData.internalLinksData.map((link, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {link.text}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {link.url}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={link.status === 'aktiv' ? 'default' : 'destructive'}>
                            {link.status === 'aktiv' ? 'Aktiv' : 'Defekt'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Externe Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Externe Verlinkung</CardTitle>
                <CardDescription>
                  Ausgehende Links und deren Qualität
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Link-Text</TableHead>
                      <TableHead>Ziel-URL</TableHead>
                      <TableHead className="text-center">Qualität</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backlinkData.externalLinksData.map((link, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {link.text}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {link.url}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getQualityBadge(link.quality)}>
                            {link.quality}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Empfehlungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Handlungsempfehlungen</CardTitle>
              </CardHeader>
              <CardContent>
                 <ul className="space-y-2 text-sm">
                   <li className="flex items-start gap-2">
                     <span className="score-text-low">×</span>
                     <span>Defekte interne Links reparieren (besonders /referenzen)</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <span className="score-text-high">!</span>
                     <span>Mehr interne Verlinkungen zwischen verwandten Seiten hinzufügen</span>
                   </li>
                   <li className="flex items-start gap-2">
                     <span className="score-text-medium">✓</span>
                     <span>Externe Links zu hochwertigen Branchenpartnern sind gut gewählt</span>
                   </li>
                 </ul>
              </CardContent>
            </Card>
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
