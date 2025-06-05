import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface KeywordAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ url, industry }) => {
  // Branchenspezifische Keywords
  const industryKeywords = {
    shk: ['sanitär', 'heizung', 'klima', 'installation', 'wartung', 'notdienst', 'badezimmer', 'rohrreinigung'],
    maler: ['malerei', 'lackierung', 'fassade', 'anstrich', 'renovierung', 'innenausbau', 'farbe', 'tapete'],
    elektriker: ['elektro', 'installation', 'beleuchtung', 'smart home', 'sicherheit', 'photovoltaik', 'stromnetz'],
    dachdecker: ['dach', 'dachdeckung', 'ziegel', 'abdichtung', 'dachrinne', 'dachsanierung', 'schiefer', 'isolierung'],
    stukateur: ['stuck', 'putz', 'fassade', 'innenausbau', 'gips', 'verputz', 'sanierung', 'renovierung'],
    planungsbuero: ['planung', 'versorgungstechnik', 'heizung', 'sanitär', 'klima', 'energie', 'beratung', 'konzept']
  };

  // Simulierte Keyword-Daten
  const keywordData = {
    totalKeywords: industryKeywords[industry].length,
    foundKeywords: 6,
    overallDensity: 2.8,
    overallScore: 75,
    keywords: industryKeywords[industry].map((keyword, index) => ({
      keyword,
      found: index < 6,
      frequency: index < 6 ? Math.floor(Math.random() * 15) + 3 : 0,
      density: index < 6 ? +(Math.random() * 3 + 0.5).toFixed(1) : 0,
      visibility: index < 6 ? ['hoch', 'mittel', 'niedrig'][Math.floor(Math.random() * 3)] : 'nicht gefunden'
    }))
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'hoch': return 'text-green-600';
      case 'mittel': return 'text-yellow-600';
      case 'niedrig': return 'text-orange-600';
      default: return 'text-red-600';
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'hoch': return 'default';
      case 'mittel': return 'secondary';
      case 'niedrig': return 'outline';
      default: return 'destructive';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Keyword-Analyse
            <Badge variant={keywordData.overallScore >= 80 ? "default" : keywordData.overallScore >= 60 ? "secondary" : "destructive"}>
              {keywordData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Branchenspezifische Keyword-Auswertung für {industry.toUpperCase()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Übersicht */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {keywordData.foundKeywords}/{keywordData.totalKeywords}
                </div>
                <div className="text-sm text-gray-600">Keywords gefunden</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {keywordData.overallDensity}%
                </div>
                <div className="text-sm text-gray-600">Durchschnittliche Dichte</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((keywordData.foundKeywords / keywordData.totalKeywords) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Abdeckung</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {keywordData.overallScore}
                </div>
                <div className="text-sm text-gray-600">Gesamtscore</div>
              </div>
            </div>

            <Progress value={keywordData.overallScore} className="h-3" />

            {/* Keyword-Tabelle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detaillierte Keyword-Analyse</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-center">Häufigkeit</TableHead>
                      <TableHead className="text-center">Dichte (%)</TableHead>
                      <TableHead className="text-center">Sichtbarkeit</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordData.keywords.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.keyword}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.frequency || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.density || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={getVisibilityColor(item.visibility)}>
                            {item.visibility}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getVisibilityBadge(item.visibility)}>
                            {item.found ? 'Gefunden' : 'Fehlt'}
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
                    <span className="text-green-600">✓</span>
                    <span>Gute Keyword-Abdeckung für Hauptbegriffe der Branche</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600">!</span>
                    <span>Erhöhen Sie die Häufigkeit von "notdienst" und "wartung"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">×</span>
                    <span>Fehlende Keywords sollten in Meta-Tags und Überschriften integriert werden</span>
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

export default KeywordAnalysis;
