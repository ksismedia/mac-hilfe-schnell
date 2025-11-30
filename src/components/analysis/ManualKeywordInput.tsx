
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check } from 'lucide-react';

interface ManualKeywordInputProps {
  onKeywordsUpdate: (keywords: Array<{ keyword: string; found: boolean; volume: number; position: number }>) => void;
  industry: string;
  currentKeywords?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  onSaveRequested?: () => void;
  onNavigateNext?: () => void; // Neue Prop für Navigation
}

const ManualKeywordInput: React.FC<ManualKeywordInputProps> = ({ 
  onKeywordsUpdate, 
  industry, 
  currentKeywords,
  onSaveRequested,
  onNavigateNext
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [manualKeywords, setManualKeywords] = useState<Array<{ keyword: string; found: boolean; volume: number; position: number }>>(currentKeywords || []);

  // Update wenn sich currentKeywords ändern
  useEffect(() => {
    if (currentKeywords && currentKeywords.length > 0) {
      setManualKeywords(currentKeywords);
    }
  }, [currentKeywords]);

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const keyword = {
        keyword: newKeyword.trim(),
        found: false,
        volume: Math.floor(Math.random() * 500) + 100,
        position: 0
      };
      
      const updatedKeywords = [...manualKeywords, keyword];
      setManualKeywords(updatedKeywords);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    const updatedKeywords = manualKeywords.filter((_, i) => i !== index);
    setManualKeywords(updatedKeywords);
  };

  const toggleKeywordFound = (index: number) => {
    const updatedKeywords = manualKeywords.map((kw, i) => 
      i === index 
        ? { 
            ...kw, 
            found: !kw.found,
            position: !kw.found ? Math.floor(Math.random() * 20) + 1 : 0
          }
        : kw
    );
    setManualKeywords(updatedKeywords);
  };

  const applyData = () => {
    console.log('=== APPLY DATA BUTTON CLICKED ===');
    console.log('Applying manual keywords:', manualKeywords);
    onKeywordsUpdate(manualKeywords);
    
    // Toast anzeigen für besseres Feedback
    if (manualKeywords.length > 0) {
      // Automatisch zur nächsten Kategorie navigieren nach erfolgreicher Anwendung
      setTimeout(() => {
        console.log('Triggering navigation...');
        onNavigateNext?.();
      }, 1000); // Längere Verzögerung für bessere UX
    }
  };

  const getIndustryKeywords = (industry: string) => {
    const suggestions = {
      'shk': [
        'sanitär', 'heizung', 'klima', 'installation', 'wartung', 'notdienst', 
        'rohrreinigung', 'badezimmer', 'bad', 'installateur', 'badsanierung', 
        'badmodernisierung', 'wärmepumpe', 'barrierefreies bad', 'photovoltaik',
        'heizungsbau', 'klimaanlage', 'lüftung', 'sanitärinstallation', 'handwerker',
        'meisterbetrieb', 'sanitärtechnik', 'heizungstechnik', 'klimatechnik'
      ],
      'maler': [
        'maler', 'lackierung', 'fassade', 'anstrich', 'renovierung', 'tapezieren', 
        'malerbetrieb', 'wärmedämmung', 'innenausbau', 'bodenbelag', 'malerei',
        'fassadensanierung', 'innenanstrich', 'außenanstrich', 'malerarbeiten',
        'handwerker', 'meisterbetrieb', 'renovierungsarbeiten', 'wandgestaltung'
      ],
      'elektriker': [
        'elektriker', 'elektro', 'installation', 'beleuchtung', 'smart home', 
        'elektroinstallation', 'photovoltaik', 'sicherheitstechnik', 'brandschutz', 
        'stromausfall', 'elektrotechnik', 'elektroarbeiten', 'elektroplanung',
        'handwerker', 'meisterbetrieb', 'elektromontage', 'energietechnik'
      ],
      'dachdecker': [
        'dachdecker', 'dach', 'ziegel', 'abdichtung', 'flachdach', 'dachsanierung', 
        'dachrinne', 'photovoltaik', 'dachdeckerei', 'sturmsicherung', 'dachdeckung',
        'dachbau', 'dacharbeiten', 'dacheindeckung', 'dachschutz',
        'handwerker', 'meisterbetrieb', 'dachreparatur', 'dachmodernisierung'
      ],
      'stukateur': [
        'stuck', 'putz', 'fassade', 'innenausbau', 'trockenbau', 'stukateur',
        'verputz', 'oberputz', 'unterputz', 'wärmedämmung', 'fassadenputz',
        'handwerker', 'meisterbetrieb', 'putzarbeiten', 'stuckarbeiten'
      ],
      'planungsbuero': [
        'planung', 'versorgungstechnik', 'beratung', 'technikplanung', 'planungsbüro',
        'haustechnik', 'gebäudetechnik', 'anlagenplanung', 'technische planung',
        'ingenieurbüro', 'fachplanung', 'projektplanung', 'bauplanung'
      ],
      'facility-management': [
        'facility management', 'gebäudemanagement', 'hausmeisterdienst', 'reinigung',
        'gebäudereinigung', 'büroreinigung', 'unterhaltsreinigung', 'grundreinigung',
        'glasreinigung', 'fensterreinigung', 'wartung', 'instandhaltung', 'haustechnik',
        'sicherheitsdienst', 'pförtnerdienst', 'grünpflege', 'winterdienst',
        'energiemanagement', 'objektbetreuung', 'liegenschaftsservice', 'catering'
      ],
      'baeckerei': [
        'bäckerei', 'backwaren', 'brot', 'brötchen', 'gebäck', 'konditorei',
        'frühstück', 'cafe', 'kuchen', 'torte', 'backhaus', 'bäcker',
        'handwerk', 'traditional', 'frisch', 'regional', 'vollkorn', 'bio',
        'feinbäckerei', 'meisterbetrieb', 'bäckermeister', 'backstube', 'tradition'
      ],
      'blechbearbeitung': [
        'blechbearbeitung', 'klempner', 'klempnerei', 'spengler', 'blechner',
        'dachrinne', 'dachentwässerung', 'fassadenverkleidung', 'metallbau',
        'blechzuschnitt', 'kantarbeiten', 'schweißarbeiten', 'laserschneiden',
        'metallverarbeitung', 'edelstahl', 'zink', 'kupfer', 'aluminium',
        'dachklempner', 'abdichtung', 'meisterbetrieb', 'handwerker'
      ]
    };
    return suggestions[industry as keyof typeof suggestions] || ['handwerk', 'service'];
  };

  const addSuggestedKeyword = (keyword: string) => {
    if (!manualKeywords.find(kw => kw.keyword === keyword)) {
      const newKw = {
        keyword,
        found: false,
        volume: Math.floor(Math.random() * 500) + 100,
        position: 0
      };
      
      const updatedKeywords = [...manualKeywords, newKw];
      setManualKeywords(updatedKeywords);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Manuelle Keyword-Eingabe
          <Badge variant="secondary">Notfall-Option</Badge>
        </CardTitle>
        <CardDescription>
          Fügen Sie Keywords manuell hinzu, falls die automatische Analyse nicht funktioniert
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keyword-Vorschläge für die Branche */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Branchenspezifische Vorschläge:</Label>
          <div className="flex flex-wrap gap-2">
            {getIndustryKeywords(industry).map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => addSuggestedKeyword(suggestion)}
                className="text-xs"
                disabled={!!manualKeywords.find(kw => kw.keyword === suggestion)}
              >
                <Plus className="h-3 w-3 mr-1" />
                {suggestion}
              </Button>
            ))}
          </div>
        </div>

        {/* Manuelles Hinzufügen */}
        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Neues Keyword eingeben..."
            onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
          />
          <Button onClick={addKeyword} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Liste der hinzugefügten Keywords */}
        {manualKeywords.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hinzugefügte Keywords:</Label>
            <div className="space-y-2">
              {manualKeywords.map((keyword, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{keyword.keyword}</span>
                    <Badge 
                      variant={keyword.found ? "default" : "destructive"}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => toggleKeywordFound(index)}
                      title="Klicken um Status zu ändern"
                    >
                      {keyword.found ? '✅ Gefunden' : '❌ Nicht gefunden'}
                    </Badge>
                    {keyword.found && (
                      <span className="text-xs text-gray-500">Pos. {keyword.position}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKeyword(index)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            {/* Daten übernehmen und Navigation Buttons */}
            <div className="flex justify-center gap-3 pt-4">
              <Button 
                onClick={applyData}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                <Check className="h-4 w-4 mr-2" />
                Daten übernehmen
              </Button>
              {manualKeywords.length > 0 && onNavigateNext && (
                <Button 
                  onClick={() => {
                    applyData();
                    setTimeout(() => onNavigateNext(), 200);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  ➡️ Weiter zur nächsten Kategorie
                </Button>
              )}
              {onSaveRequested && (
                <Button 
                  onClick={() => {
                    applyData();
                    setTimeout(() => onSaveRequested(), 100);
                  }}
                  variant="outline"
                  size="lg"
                >
                  💾 Speichern
                </Button>
              )}
            </div>
          </div>
        )}

        {manualKeywords.length > 0 && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            💡 Tipp: Klicken Sie auf die Status-Badges, um zu markieren, ob ein Keyword auf der Website gefunden wurde. Anschließend auf "Daten übernehmen" klicken.
            <br />
            <strong>Bewertung:</strong> Bei weniger als 5 Keywords max. 80% möglich. Für 100% mindestens 5 Keywords benötigt.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManualKeywordInput;
