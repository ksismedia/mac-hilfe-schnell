import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ManualAccessibilityData } from '@/hooks/useManualData';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';

interface ManualAccessibilityInputProps {
  onSave: (data: ManualAccessibilityData) => void;
  initialData?: ManualAccessibilityData | null;
}

export const ManualAccessibilityInput: React.FC<ManualAccessibilityInputProps> = ({
  onSave,
  initialData
}) => {
  const { toast } = useToast();
  const { reviewStatus, updateReviewStatus } = useAnalysisContext();
  const [data, setData] = React.useState<ManualAccessibilityData>({
    keyboardNavigation: initialData?.keyboardNavigation || false,
    screenReaderCompatible: initialData?.screenReaderCompatible || false,
    colorContrast: initialData?.colorContrast || false,
    altTextsPresent: initialData?.altTextsPresent || false,
    focusVisibility: initialData?.focusVisibility || false,
    textScaling: initialData?.textScaling || false,
    overallScore: initialData?.overallScore || 70,
    notes: initialData?.notes || ''
  });

  const handleSave = () => {
    onSave(data);
    toast({
      title: "Accessibility-Daten gespeichert",
      description: "Die manuelle Barrierefreiheits-Bewertung wurde erfolgreich gespeichert.",
    });
  };

  const handleReset = () => {
    setData({
      keyboardNavigation: false,
      screenReaderCompatible: false,
      colorContrast: false,
      altTextsPresent: false,
      focusVisibility: false,
      textScaling: false,
      overallScore: 70,
      notes: ''
    });
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ♿ Manuelle Accessibility-Bewertung
          </CardTitle>
          <CardDescription>
            Bewerten Sie die Barrierefreiheit basierend auf manuellen Tests
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keyboard-nav"
                checked={data.keyboardNavigation}
                onCheckedChange={(checked) => 
                  setData(prev => ({ ...prev, keyboardNavigation: !!checked }))
                }
              />
              <Label htmlFor="keyboard-nav" className="text-sm">
                Keyboard-Navigation funktioniert
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="screen-reader"
                checked={data.screenReaderCompatible}
                onCheckedChange={(checked) => 
                  setData(prev => ({ ...prev, screenReaderCompatible: !!checked }))
                }
              />
              <Label htmlFor="screen-reader" className="text-sm">
                Screen Reader kompatibel
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="color-contrast"
                checked={data.colorContrast}
                onCheckedChange={(checked) => 
                  setData(prev => ({ ...prev, colorContrast: !!checked }))
                }
              />
              <Label htmlFor="color-contrast" className="text-sm">
                Ausreichender Farbkontrast
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="alt-texts"
                checked={data.altTextsPresent}
                onCheckedChange={(checked) => 
                  setData(prev => ({ ...prev, altTextsPresent: !!checked }))
                }
              />
              <Label htmlFor="alt-texts" className="text-sm">
                Alt-Texte vorhanden
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="focus-visibility"
                checked={data.focusVisibility}
                onCheckedChange={(checked) => 
                  setData(prev => ({ ...prev, focusVisibility: !!checked }))
                }
              />
              <Label htmlFor="focus-visibility" className="text-sm">
                Focus-Indikator sichtbar
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="text-scaling"
                checked={data.textScaling}
                onCheckedChange={(checked) => 
                  setData(prev => ({ ...prev, textScaling: !!checked }))
                }
              />
              <Label htmlFor="text-scaling" className="text-sm">
                Text skaliert bis 200%
              </Label>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Gesamt-Accessibility Score ({data.overallScore}%)
            </Label>
            <Slider
              value={[data.overallScore]}
              onValueChange={([value]) => setData(prev => ({ ...prev, overallScore: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Basierend auf manuellen Tests und Gesamteindruck
            </p>
          </div>

          <div>
            <Label htmlFor="accessibility-notes" className="text-sm font-medium">
              Zusätzliche Notizen
            </Label>
            <Textarea
              id="accessibility-notes"
              placeholder="Besondere Beobachtungen zur Barrierefreiheit..."
              value={data.notes}
              onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Speichern
          </Button>
          <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Zurücksetzen
          </Button>
        </div>
      </CardContent>
    </Card>
    
    <AIReviewCheckbox
      categoryName="Barrierefreiheit"
      isReviewed={reviewStatus['Barrierefreiheit']?.isReviewed || false}
      onReviewChange={(reviewed) => updateReviewStatus('Barrierefreiheit', reviewed)}
    />
    </>
  );
};