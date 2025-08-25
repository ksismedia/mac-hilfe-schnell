
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import ManualKeywordInput from './ManualKeywordInput';

interface KeywordAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management';
  realData: RealBusinessData;
  onScoreChange?: (score: number | null) => void;
  onKeywordDataChange?: (keywordData: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null) => void;
  loadedKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null;
  loadedKeywordScore?: number | null;
  onNavigateToNextCategory?: () => void; // Neue Prop für Navigation
}

const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ url, industry, realData, onScoreChange, onKeywordDataChange, loadedKeywordData, loadedKeywordScore, onNavigateToNextCategory }) => {
  const [keywordData, setKeywordData] = useState(() => {
    const initialFoundKeywords = realData.keywords.filter(k => k.found).length;
    return {
      totalKeywords: realData.keywords.length,
      foundKeywords: initialFoundKeywords,
      overallDensity: 2.8,
      overallScore: Math.round((initialFoundKeywords / realData.keywords.length) * 100),
      keywords: realData.keywords
    };
  });

  const [showManualInput, setShowManualInput] = useState(false);

  // Update keywords wenn sich realData ändert (Parameter-Wechsel)
  useEffect(() => {
    const initialFoundKeywords = realData.keywords.filter(k => k.found).length;
    setKeywordData({
      totalKeywords: realData.keywords.length,
      foundKeywords: initialFoundKeywords,
      overallDensity: 2.8,
      overallScore: Math.round((initialFoundKeywords / realData.keywords.length) * 100),
      keywords: realData.keywords
    });
  }, [realData, industry]);

  // Load saved keyword data when available
  useEffect(() => {
    if (loadedKeywordData && loadedKeywordData.length > 0) {
      console.log('=== LOADING SAVED KEYWORD DATA ===');
      console.log('Loaded data:', loadedKeywordData);
      console.log('Loaded score:', loadedKeywordScore);
      
      const foundKeywords = loadedKeywordData.filter(k => k.found).length;
      const score = loadedKeywordScore !== undefined && loadedKeywordScore !== null 
        ? loadedKeywordScore 
        : Math.max(30, Math.round((foundKeywords / loadedKeywordData.length) * 100));
      
      setKeywordData({
        totalKeywords: loadedKeywordData.length,
        foundKeywords,
        overallDensity: foundKeywords > 0 ? 2.8 : 0,
        overallScore: score,
        keywords: loadedKeywordData
      });
      
      // Notify parent about loaded state
      onScoreChange?.(score);
      onKeywordDataChange?.(loadedKeywordData);
    }
  }, [loadedKeywordData, loadedKeywordScore, onScoreChange, onKeywordDataChange]);

  // Zeige manuelle Eingabe automatisch, wenn keine Keywords gefunden wurden
  useEffect(() => {
    if (keywordData.foundKeywords === 0) {
      setShowManualInput(true);
    }
  }, [keywordData.foundKeywords]);

  const handleManualKeywordsUpdate = (manualKeywords: Array<{ keyword: string; found: boolean; volume: number; position: number }>) => {
    console.log('=== MANUAL KEYWORDS UPDATE ===');
    console.log('Manual Keywords:', manualKeywords);
    
    if (manualKeywords.length > 0) {
      const foundKeywords = manualKeywords.filter(k => k.found).length;
      
      // Anspruchsvollere Bewertung: 
      // - Mindestens 5 Keywords für 100%
      // - Bonus für mehr Keywords
      let newScore = 0;
      if (foundKeywords === 0) {
        newScore = 0;
      } else if (manualKeywords.length < 5) {
        // Bei weniger als 5 Keywords: max 80%
        newScore = Math.round((foundKeywords / manualKeywords.length) * 80);
      } else {
        // Bei 5+ Keywords: volle Bewertung möglich
        const baseScore = (foundKeywords / manualKeywords.length) * 100;
        // Bonus für viele Keywords
        const keywordBonus = Math.min(10, manualKeywords.length - 5);
        newScore = Math.min(100, Math.round(baseScore + keywordBonus));
      }
      
      console.log('Found Keywords:', foundKeywords, 'Total:', manualKeywords.length, 'New Score:', newScore);
      
      setKeywordData({
        totalKeywords: manualKeywords.length,
        foundKeywords,
        overallDensity: foundKeywords > 0 ? 2.8 : 0,
        overallScore: newScore,
        keywords: manualKeywords
      });
      
      console.log('Calling onScoreChange with:', newScore);
      // Notify parent about score change
      onScoreChange?.(newScore);
      onKeywordDataChange?.(manualKeywords);
    } else {
      // Fallback zu ursprünglichen Daten
      const originalFoundKeywords = realData.keywords.filter(k => k.found).length;
      const originalScore = Math.round((originalFoundKeywords / realData.keywords.length) * 100);
      
      setKeywordData({
        totalKeywords: realData.keywords.length,
        foundKeywords: originalFoundKeywords,
        overallDensity: 2.8,
        overallScore: originalScore,
        keywords: realData.keywords
      });
      
      console.log('Resetting to original data, calling onScoreChange with null');
      // Notify parent about score change
      onScoreChange?.(null); // Reset to let parent use default
      onKeywordDataChange?.(null); // Reset keyword data
    }
  };

  const getVisibilityColor = (found: boolean) => {
    return found ? 'text-green-600' : 'text-red-600';
  };

  const getVisibilityBadge = (found: boolean) => {
    return found ? 'default' : 'destructive';
  };

  const toggleKeywordStatus = (index: number) => {
    const updatedKeywords = keywordData.keywords.map((kw, i) => 
      i === index 
        ? { 
            ...kw, 
            found: !kw.found,
            position: !kw.found ? Math.floor(Math.random() * 20) + 1 : 0
          }
        : kw
    );
    
    const foundKeywords = updatedKeywords.filter(k => k.found).length;
    
    // Berechne neuen Score basierend auf aktualisierten Keywords
    let newScore = 0;
    if (foundKeywords === 0) {
      newScore = 0;
    } else if (updatedKeywords.length < 5) {
      newScore = Math.round((foundKeywords / updatedKeywords.length) * 80);
    } else {
      const baseScore = (foundKeywords / updatedKeywords.length) * 100;
      const keywordBonus = Math.min(10, updatedKeywords.length - 5);
      newScore = Math.min(100, Math.round(baseScore + keywordBonus));
    }
    
    setKeywordData({
      ...keywordData,
      foundKeywords,
      overallScore: newScore,
      keywords: updatedKeywords
    });
    
    // Benachrichtige Parent über Änderungen
    onScoreChange?.(newScore);
    onKeywordDataChange?.(updatedKeywords);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Keyword-Analyse
            <div className="flex items-center gap-2">
              {keywordData.foundKeywords === 0 && (
                <Badge variant="destructive">Keine Keywords gefunden</Badge>
              )}
              <Badge variant={keywordData.overallScore >= 80 ? "secondary" : keywordData.overallScore >= 60 ? "default" : "destructive"}>
                {keywordData.overallScore}/100 Punkte
              </Badge>
            </div>
          </CardTitle>
          <CardDescription>
            Live-Analyse der Website-Inhalte für {industry.toUpperCase()}
            {keywordData.foundKeywords === 0 && (
              <span className="block text-red-600 mt-1">
                ⚠️ Automatische Analyse fehlgeschlagen - Nutzen Sie die manuelle Eingabe unten
              </span>
            )}
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
                  {(() => {
                    const score = keywordData.overallScore;
                    if (score === null || score === undefined || isNaN(score)) {
                      return 'N/A';
                    }
                    return `${Math.round(score)}%`;
                  })()}
                </div>
                <div className="text-sm text-gray-600">Gesamtscore</div>
              </div>
            </div>

            <Progress value={keywordData.overallScore || 0} className="h-3" />

            {/* Keyword-Tabelle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Keyword-Analyse von {url}</CardTitle>
                <CardDescription>
                  Klicken Sie auf die Status-Badges, um Keywords manuell zu bearbeiten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Keyword</TableHead>
                      <TableHead className="text-center">Auf Website gefunden</TableHead>
                      <TableHead className="text-center">Suchvolumen (geschätzt)</TableHead>
                      <TableHead className="text-center">Status (klickbar)</TableHead>
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
                          <Badge 
                            variant={getVisibilityBadge(item.found)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => toggleKeywordStatus(index)}
                            title="Klicken um Status zu ändern"
                          >
                            {item.found ? 'Gefunden' : 'Fehlt'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Manuelle Keyword-Eingabe - Nur wenn nötig */}
            {keywordData.foundKeywords === 0 && (
              <ManualKeywordInput 
                onKeywordsUpdate={handleManualKeywordsUpdate}
                industry={industry}
                currentKeywords={[]} // Leere Liste für neue manuelle Eingabe
                onSaveRequested={() => {
                  console.log('Save requested from KeywordAnalysis');
                }}
                onNavigateNext={() => {
                  // Direkte Navigation über die Parent-Komponente
                  onNavigateToNextCategory?.();
                }}
              />
            )}

            {/* Empfehlungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Empfehlungen</CardTitle>
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
                      <span>Fehlende Keywords: {keywordData.keywords.filter(k => !k.found).map(k => k.keyword).join(', ')}</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">ℹ</span>
                    <span>
                      {keywordData.foundKeywords === 0 
                        ? 'Die automatische Analyse konnte keine Keywords finden. Nutzen Sie die manuelle Eingabe für eine genaue Bewertung.'
                        : `Diese Analyse basiert auf dem tatsächlichen Inhalt Ihrer Website ${url}`
                      }
                    </span>
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
