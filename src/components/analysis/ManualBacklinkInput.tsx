import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ManualBacklinkData } from '@/hooks/useManualData';

interface ManualBacklinkInputProps {
  onSave: (data: ManualBacklinkData) => void;
  initialData?: ManualBacklinkData | null;
}

export const ManualBacklinkInput: React.FC<ManualBacklinkInputProps> = ({
  onSave,
  initialData
}) => {
  const { toast } = useToast();
  const [data, setData] = React.useState<ManualBacklinkData>({
    totalBacklinks: initialData?.totalBacklinks || 0,
    qualityScore: initialData?.qualityScore || 60,
    domainAuthority: initialData?.domainAuthority || 30,
    localRelevance: initialData?.localRelevance || 70,
    spamLinks: initialData?.spamLinks || 0,
    notes: initialData?.notes || ''
  });

  const handleSave = () => {
    onSave(data);
    toast({
      title: "Backlink-Daten gespeichert",
      description: "Die manuelle Backlink-Bewertung wurde erfolgreich gespeichert.",
    });
  };

  const handleReset = () => {
    setData({
      totalBacklinks: 0,
      qualityScore: 60,
      domainAuthority: 30,
      localRelevance: 70,
      spamLinks: 0,
      notes: ''
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔗 Manuelle Backlink-Bewertung
        </CardTitle>
        <CardDescription>
          Bewerten Sie das Backlink-Profil basierend auf manueller Analyse
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="total-backlinks" className="text-sm font-medium">
                Anzahl Backlinks gesamt
              </Label>
              <Input
                id="total-backlinks"
                type="number"
                value={data.totalBacklinks}
                onChange={(e) => setData(prev => ({ 
                  ...prev, 
                  totalBacklinks: parseInt(e.target.value) || 0 
                }))}
                placeholder="0"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="spam-links" className="text-sm font-medium">
                Spam/Toxische Links
              </Label>
              <Input
                id="spam-links"
                type="number"
                value={data.spamLinks}
                onChange={(e) => setData(prev => ({ 
                  ...prev, 
                  spamLinks: parseInt(e.target.value) || 0 
                }))}
                placeholder="0"
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Backlink-Qualität ({data.qualityScore}%)
            </Label>
            <Slider
              value={[data.qualityScore]}
              onValueChange={([value]) => setData(prev => ({ ...prev, qualityScore: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Durchschnittliche Qualität der verlinkenden Seiten
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Domain Authority ({data.domainAuthority}%)
            </Label>
            <Slider
              value={[data.domainAuthority]}
              onValueChange={([value]) => setData(prev => ({ ...prev, domainAuthority: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Autorität der verlinkenden Domains
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">
              Lokale Relevanz ({data.localRelevance}%)
            </Label>
            <Slider
              value={[data.localRelevance]}
              onValueChange={([value]) => setData(prev => ({ ...prev, localRelevance: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Wie relevant sind die Links für die lokale Zielgruppe
            </p>
          </div>

          <div>
            <Label htmlFor="backlink-notes" className="text-sm font-medium">
              Zusätzliche Notizen
            </Label>
            <Textarea
              id="backlink-notes"
              placeholder="Besondere Beobachtungen zum Backlink-Profil..."
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