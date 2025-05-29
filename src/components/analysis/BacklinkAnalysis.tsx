
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface BacklinkAnalysisProps {
  url: string;
}

const BacklinkAnalysis: React.FC<BacklinkAnalysisProps> = ({ url }) => {
  // Simulierte Backlink-Daten
  const backlinkData = {
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
    ]
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'hoch': return 'text-green-600';
      case 'mittel': return 'text-yellow-600';
      case 'niedrig': return 'text-red-600';
      default: return 'text-gray-600';
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
            <Badge variant={backlinkData.overallScore >= 80 ? "default" : backlinkData.overallScore >= 60 ? "secondary" : "destructive"}>
              {backlinkData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Analyse der internen und externen Verlinkungen
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                <div className="text-2xl font-bold text-green-600">
                  {backlinkData.externalLinks}
                </div>
                <div className="text-sm text-gray-600">Externe Links</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
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
                    <span className="text-red-600">×</span>
                    <span>Defekte interne Links reparieren (besonders /referenzen)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">!</span>
                    <span>Mehr interne Verlinkungen zwischen verwandten Seiten hinzufügen</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Externe Links zu hochwertigen Branchenpartnern sind gut gewählt</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacklinkAnalysis;
