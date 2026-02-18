
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import ManualKeywordInput from './ManualKeywordInput';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { useExtensionDataLoader } from '@/hooks/useExtensionDataLoader';
import { Download, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import IndustryFocusSelector from './IndustryFocusSelector';
import { industryFocusAreas } from '@/data/industryFocusAreas';
import { focusAreaKeywordMapping } from '@/data/focusAreaKeywordMapping';

interface KeywordAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung' | 'innenausbau';
  realData: RealBusinessData;
  onScoreChange?: (score: number | null) => void;
  onKeywordDataChange?: (keywordData: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null) => void;
  loadedKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null;
  loadedKeywordScore?: number | null;
  onNavigateToNextCategory?: () => void;
  companyServices?: string[];
  loadedFocusAreas?: string[] | null;
  onFocusAreasChange?: (focusAreas: string[]) => void;
}

// Generiert leistungsspezifische Keywords aus den Unternehmensleistungen
const generateServiceKeywords = (services: string[], industry: string): string[] => {
  if (!services || services.length === 0) return [];
  
  const serviceKeywords: string[] = [];
  
  for (const service of services) {
    const lower = service.toLowerCase().trim();
    if (!lower) continue;
    
    // Das Service selbst als Keyword
    serviceKeywords.push(lower);
    
    // Zusammengesetzte Keywords mit typischen Suffixen
    const suffixes = ['service', 'firma', 'fachbetrieb', 'kosten', 'angebot'];
    for (const suffix of suffixes.slice(0, 2)) {
      serviceKeywords.push(`${lower} ${suffix}`);
    }
  }
  
  return serviceKeywords;
};

const KeywordAnalysis: React.FC<KeywordAnalysisProps> = ({ url, industry, realData, onScoreChange, onKeywordDataChange, loadedKeywordData, loadedKeywordScore, onNavigateToNextCategory, companyServices, loadedFocusAreas, onFocusAreasChange }) => {
  const { reviewStatus, updateReviewStatus } = useAnalysisContext();
  const { loadLatestExtensionData, isLoading: isLoadingExtension } = useExtensionDataLoader();
  const [extensionTextLoaded, setExtensionTextLoaded] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  
  // Industry focus areas (Schwerpunkte) - must be before mergeWithServiceKeywords
  const availableFocusAreas = industryFocusAreas[industry] || [];
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(
    () => loadedFocusAreas && loadedFocusAreas.length > 0 
      ? loadedFocusAreas 
      : availableFocusAreas.map(a => a.id)
  );

  const handleFocusAreasChange = (areas: string[]) => {
    setSelectedFocusAreas(areas);
    onFocusAreasChange?.(areas);
  };

  // Filter keywords by selected focus areas
  const filterByFocusAreas = useCallback((keywords: Array<{ keyword: string; found: boolean; volume: number; position: number }>) => {
    const industryMapping = focusAreaKeywordMapping[industry];
    if (!industryMapping || selectedFocusAreas.length === 0) return keywords;
    
    // If all focus areas are selected, don't filter
    if (selectedFocusAreas.length === availableFocusAreas.length) return keywords;
    
    // Collect allowed patterns from selected focus areas
    const allowedPatterns = new Set<string>();
    for (const areaId of selectedFocusAreas) {
      const patterns = industryMapping[areaId];
      if (patterns) {
        patterns.forEach(p => allowedPatterns.add(p.toLowerCase()));
      }
    }
    
    if (allowedPatterns.size === 0) return keywords;
    
    const filtered = keywords.filter(kw => {
      const kwLower = kw.keyword.toLowerCase();
      for (const pattern of allowedPatterns) {
        if (kwLower.includes(pattern) || pattern.includes(kwLower)) {
          return true;
        }
      }
      return false;
    });
    
    return filtered.length > 0 ? filtered : keywords;
  }, [industry, selectedFocusAreas, availableFocusAreas]);

  // Merge industry keywords with service-specific keywords
  const mergeWithServiceKeywords = useCallback((baseKeywords: typeof realData.keywords) => {
    // First filter by focus areas
    const focusFiltered = filterByFocusAreas(baseKeywords);
    
    if (!companyServices || companyServices.length === 0) return focusFiltered;
    
    const existingKeywordSet = new Set(focusFiltered.map(k => k.keyword.toLowerCase()));
    const serviceKws = generateServiceKeywords(companyServices, industry);
    
    const additionalKeywords = serviceKws
      .filter(kw => !existingKeywordSet.has(kw.toLowerCase()))
      .slice(0, 10)
      .map(kw => ({
        keyword: kw,
        found: false,
        volume: 100,
        position: 0
      }));
    
    return [...focusFiltered, ...additionalKeywords];
  }, [companyServices, industry, filterByFocusAreas]);

  const [keywordData, setKeywordData] = useState(() => {
    const baseKeywords = realData.keywords || [];
    const keywords = mergeWithServiceKeywords(baseKeywords);
    const initialFoundKeywords = keywords.filter(k => k.found).length;
    return {
      totalKeywords: keywords.length,
      foundKeywords: initialFoundKeywords,
      overallDensity: 2.8,
      overallScore: keywords.length > 0 ? Math.round((initialFoundKeywords / keywords.length) * 100) : 0,
      keywords: keywords
    };
  });

  // Update keywords wenn sich realData oder companyServices ändern
  useEffect(() => {
    const baseKeywords = realData.keywords || [];
    const keywords = mergeWithServiceKeywords(baseKeywords);
    const initialFoundKeywords = keywords.filter(k => k.found).length;
    setKeywordData({
      totalKeywords: keywords.length,
      foundKeywords: initialFoundKeywords,
      overallDensity: 2.8,
      overallScore: keywords.length > 0 ? Math.round((initialFoundKeywords / keywords.length) * 100) : 0,
      keywords: keywords
    });
  }, [realData, industry, mergeWithServiceKeywords]);

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

  // Extension-Daten laden und Keywords gegen den vollen Text prüfen
  const handleLoadExtensionData = useCallback(async () => {
    const extData = await loadLatestExtensionData();
    if (!extData) return;

    const fullText = (extData.content?.fullText || '').toLowerCase();
    if (!fullText || fullText.length < 10) {
      toast.error('Extension-Daten enthalten keinen verwertbaren Text.');
      return;
    }

    console.log('Extension-Text geladen:', fullText.length, 'Zeichen');

    // Alle aktuellen Keywords gegen den vollen Extension-Text prüfen
    const updatedKeywords = keywordData.keywords.map(kw => {
      const kwLower = kw.keyword.toLowerCase();
      const found = fullText.includes(kwLower);
      return {
        ...kw,
        found,
        position: found ? Math.max(1, Math.min(100, Math.round((fullText.indexOf(kwLower) / fullText.length) * 100))) : 0
      };
    });

    const foundCount = updatedKeywords.filter(k => k.found).length;
    let newScore = 0;
    if (foundCount === 0) {
      newScore = 0;
    } else if (updatedKeywords.length < 5) {
      newScore = Math.round((foundCount / updatedKeywords.length) * 80);
    } else {
      const baseScore = (foundCount / updatedKeywords.length) * 100;
      const keywordBonus = Math.min(10, updatedKeywords.length - 5);
      newScore = Math.min(100, Math.round(baseScore + keywordBonus));
    }

    setKeywordData({
      totalKeywords: updatedKeywords.length,
      foundKeywords: foundCount,
      overallDensity: foundCount > 0 ? 2.8 : 0,
      overallScore: newScore,
      keywords: updatedKeywords
    });

    setExtensionTextLoaded(true);
    onScoreChange?.(newScore);
    onKeywordDataChange?.(updatedKeywords);
    toast.success(`Keywords aktualisiert: ${foundCount}/${updatedKeywords.length} auf der Website gefunden`);
  }, [keywordData.keywords, loadLatestExtensionData, onScoreChange, onKeywordDataChange]);
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
      const keywords = realData.keywords || [];
      const originalFoundKeywords = keywords.filter(k => k.found).length;
      const originalScore = keywords.length > 0 ? Math.round((originalFoundKeywords / keywords.length) * 100) : 0;
      
      setKeywordData({
        totalKeywords: keywords.length,
        foundKeywords: originalFoundKeywords,
        overallDensity: 2.8,
        overallScore: originalScore,
        keywords: keywords
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
              <div 
                className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                  keywordData.overallScore >= 90 ? 'bg-yellow-400 text-black' : 
                  keywordData.overallScore >= 60 ? 'bg-green-500 text-white' : 
                  'bg-red-500 text-white'
                }`}
              >
                {keywordData.overallScore}%
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Live-Analyse der Website-Inhalte für {industry.toUpperCase()}
            {keywordData.foundKeywords === 0 && (
              <span className="block text-red-600 mt-1">
                ⚠️ Automatische Analyse fehlgeschlagen - Nutzen Sie die manuelle Eingabe oder laden Sie Extension-Daten
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Branchen-Schwerpunkte */}
            <IndustryFocusSelector
              industry={industry}
              selectedFocusAreas={selectedFocusAreas}
              onFocusAreasChange={handleFocusAreasChange}
            />

            {/* Extension-Daten laden Button */}
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <Button
                onClick={handleLoadExtensionData}
                disabled={isLoadingExtension}
                variant="outline"
                className="flex items-center gap-2"
              >
                {extensionTextLoaded ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Download className="w-4 h-4" />}
                {isLoadingExtension ? 'Lade...' : extensionTextLoaded ? 'Extension-Daten geladen' : 'Extension-Daten laden'}
              </Button>
              <span className="text-sm text-gray-400">
                {extensionTextLoaded 
                  ? `✅ Keywords wurden gegen den vollständigen Website-Text geprüft`
                  : 'Prüft Keywords gegen den vollständigen Website-Text der Chrome Extension'
                }
              </span>
            </div>
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
                <CardTitle className="text-lg">Handlungsempfehlungen</CardTitle>
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
      
      <AIReviewCheckbox
        categoryName="Keyword-Analyse"
        isReviewed={reviewStatus['Keyword-Analyse']?.isReviewed || false}
        onReviewChange={(reviewed) => updateReviewStatus('Keyword-Analyse', reviewed)}
      />
    </div>
  );
};

export default KeywordAnalysis;
