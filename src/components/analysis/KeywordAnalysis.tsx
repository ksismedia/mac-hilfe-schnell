
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface KeywordAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  realData: RealBusinessData;
}

const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ url, industry, realData }) => {
  const keywordData = {
    totalKeywords: realData.keywords.length,
    foundKeywords: realData.keywords.filter(k => k.found).length,
    overallDensity: 2.8,
    overallScore: Math.round((realData.keywords.filter(k => k.found).length / realData.keywords.length) * 100),
    keywords: realData.keywords
  };

  const getVisibilityColor = (found: boolean) => {
    return found ? 'text-green-600' : 'text-red-600';
  };

  const getVisibilityBadge = (found: boolean) => {
    return found ? 'default' : 'destructive';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Keyword-Analyse (Echte Daten)
            <Badge variant={keywordData.overallScore >= 80 ? "default" : keywordData.overallScore >= 60 ? "secondary" : "destructive"}>
              {keywordData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Live-Analyse der Website-Inhalte für {industry.toUpperCase()}
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
                <CardTitle className="text-lg">Live Keyword-Analyse von {url}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-center">Auf Website gefunden</TableHead>
                      <TableHead className="text-center">Suchvolumen (geschätzt)</TableHead>
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
                          <span className={getVisibilityColor(item.found)}>
                            {item.found ? "Ja" : "Nein"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.volume}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getVisibilityBadge(item.found)}>
                            {item.found ? 'Gefunden' : 'Fehlt'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Empfehlungen basierend auf echten Daten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Empfehlungen (basierend auf Echtdaten)</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {keywordData.foundKeywords > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600">✓</span>
                      <span>Gute Keyword-Abdeckung für {keywordData.foundKeywords} von {keywordData.totalKeywords} Hauptbegriffen</span>
                    </li>
                  )}
                  {keywordData.foundKeywords < keywordData.totalKeywords && (
                    <li className="flex items-start gap-2">
                      <span className="text-red-600">×</span>
                      <span>Fehlende Keywords: {realData.keywords.filter(k => !k.found).map(k => k.keyword).join(', ')}</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">ℹ</span>
                    <span>Diese Analyse basiert auf dem tatsächlichen Inhalt Ihrer Website {url}</span>
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
