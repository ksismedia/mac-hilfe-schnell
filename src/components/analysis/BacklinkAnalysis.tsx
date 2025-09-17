
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Link, AlertCircle, CheckCircle, Edit } from 'lucide-react';
import { ManualBacklinkInput } from './ManualBacklinkInput';
import { useManualData } from '@/hooks/useManualData';

interface BacklinkAnalysisProps {
  url: string;
}

const BacklinkAnalysis: React.FC<BacklinkAnalysisProps> = ({ url }) => {
  const { manualBacklinkData, updateManualBacklinkData } = useManualData();

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
              <Badge variant={backlinkData.overallScore >= 90 ? "secondary" : backlinkData.overallScore >= 61 ? "default" : "destructive"}>
                {backlinkData.overallScore > 0 ? `${backlinkData.overallScore}/100 Punkte` : '—/100 Punkte'}
              </Badge>
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatic">Automatische Analyse</TabsTrigger>
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
                <CardTitle className="text-lg">Empfehlungen</CardTitle>
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
