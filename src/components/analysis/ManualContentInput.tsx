import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ManualContentData } from '@/hooks/useManualData';

interface ManualContentInputProps {
  onSave: (data: ManualContentData) => void;
  initialData?: ManualContentData | null;
}

export const ManualContentInput: React.FC<ManualContentInputProps> = ({
  onSave,
  initialData
}) => {
  const { toast } = useToast();
  const [data, setData] = React.useState<ManualContentData>({
    textQuality: initialData?.textQuality || 75,
    contentRelevance: initialData?.contentRelevance || 80,
    expertiseLevel: initialData?.expertiseLevel || 70,
    contentFreshness: initialData?.contentFreshness || 65,
    notes: initialData?.notes || ''
  });

  const handleSave = () => {
    onSave(data);
    toast({
      title: "Content-Daten gespeichert",
      description: "Die manuellen Content-Bewertungen wurden erfolgreich gespeichert.",
    });
  };

  const handleReset = () => {
    setData({
      textQuality: 75,
      contentRelevance: 80,
      expertiseLevel: 70,
      contentFreshness: 65,
      notes: ''
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📝 Manuelle Content-Bewertung
        </CardTitle>
        <CardDescription>
          Bewerten Sie die Inhaltsqualität manuell für präzise Analysen
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              Textqualität ({data.textQuality}%)
            </Label>
            <Slider
              value={[data.textQuality]}
              onValueChange={([value]) => setData(prev => ({ ...prev, textQuality: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Rechtschreibung, Grammatik, Lesbarkeit
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Branchenrelevanz ({data.contentRelevance}%)
            </Label>
            <Slider
              value={[data.contentRelevance]}
              onValueChange={([value]) => setData(prev => ({ ...prev, contentRelevance: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Wie relevant sind die Inhalte für die Zielgruppe
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Expertise-Level ({data.expertiseLevel}%)
            </Label>
            <Slider
              value={[data.expertiseLevel]}
              onValueChange={([value]) => setData(prev => ({ ...prev, expertiseLevel: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fachliche Tiefe und Expertise erkennbar
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Aktualität ({data.contentFreshness}%)
            </Label>
            <Slider
              value={[data.contentFreshness]}
              onValueChange={([value]) => setData(prev => ({ ...prev, contentFreshness: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Wie aktuell und zeitgemäß sind die Inhalte
            </p>
          </div>

          <div>
            <Label htmlFor="content-notes" className="text-sm font-medium">
              Zusätzliche Notizen
            </Label>
            <Textarea
              id="content-notes"
              placeholder="Besondere Beobachtungen zur Content-Qualität..."
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
  );
};