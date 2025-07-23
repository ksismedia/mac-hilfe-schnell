import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Edit3, Save, X } from 'lucide-react';
import { ManualCorporateIdentityData } from '@/hooks/useManualData';

interface CorporateIdentityAnalysisProps {
  businessData: {
    companyName: string;
    url: string;
  };
  manualData: ManualCorporateIdentityData | null;
  onUpdate: (data: ManualCorporateIdentityData | null) => void;
}

export function CorporateIdentityAnalysis({ businessData, manualData, onUpdate }: CorporateIdentityAnalysisProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ManualCorporateIdentityData>({
    uniformLogo: false,
    uniformWorkClothing: false,
    uniformVehicleBranding: false,
    uniformColorScheme: false,
    notes: ''
  });

  useEffect(() => {
    if (manualData) {
      setFormData(manualData);
    }
  }, [manualData]);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (manualData) {
      setFormData(manualData);
    } else {
      setFormData({
        uniformLogo: false,
        uniformWorkClothing: false,
        uniformVehicleBranding: false,
        uniformColorScheme: false,
        notes: ''
      });
    }
    setIsEditing(false);
  };

  const calculateScore = () => {
    if (!manualData) return 0;
    const checks = [
      manualData.uniformLogo,
      manualData.uniformWorkClothing,
      manualData.uniformVehicleBranding,
      manualData.uniformColorScheme
    ];
    const score = (checks.filter(Boolean).length / checks.length) * 100;
    return Math.round(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 75) return 'default';
    if (score >= 50) return 'secondary';
    return 'destructive';
  };

  const score = calculateScore();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Corporate Identity Analyse
              {manualData ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
            </CardTitle>
            <CardDescription>
              Bewertung der einheitlichen Corporate Identity von {businessData.companyName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {manualData && (
              <Badge variant={getScoreBadge(score)} className="text-sm">
                {score}% Konsistenz
              </Badge>
            )}
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                {manualData ? 'Bearbeiten' : 'Erfassen'}
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Speichern
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!manualData && !isEditing && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <p className="text-lg font-medium mb-2">Corporate Identity noch nicht bewertet</p>
            <p className="mb-4">
              Bewerten Sie die Einheitlichkeit der Corporate Identity Elemente
            </p>
            <Button onClick={() => setIsEditing(true)}>
              Jetzt bewerten
            </Button>
          </div>
        )}

        {manualData && !isEditing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Einheitliches Logo</span>
                  {manualData.uniformLogo ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Einheitliche Arbeitskleidung</span>
                  {manualData.uniformWorkClothing ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Einheitliche Fahrzeugbeklebung</span>
                  {manualData.uniformVehicleBranding ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Einheitliche Farbgebung</span>
                  {manualData.uniformColorScheme ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            
            {manualData.notes && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <Label className="text-sm font-medium">Notizen:</Label>
                <p className="mt-1 text-sm">{manualData.notes}</p>
              </div>
            )}

            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium">Corporate Identity Score:</span>
                <Badge variant={getScoreBadge(score)} className={getScoreColor(score)}>
                  {score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {score >= 75 && "Sehr gute Corporate Identity Konsistenz"}
                {score >= 50 && score < 75 && "Durchschnittliche Corporate Identity Konsistenz"}
                {score < 50 && "Verbesserungsbedarf bei der Corporate Identity"}
              </p>
            </div>
          </div>
        )}

        {isEditing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uniformLogo"
                  checked={formData.uniformLogo}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, uniformLogo: checked === true }))
                  }
                />
                <Label htmlFor="uniformLogo">
                  Einheitliches Logo (auf Website, Visitenkarten, Fahrzeugen, etc.)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uniformWorkClothing"
                  checked={formData.uniformWorkClothing}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, uniformWorkClothing: checked === true }))
                  }
                />
                <Label htmlFor="uniformWorkClothing">
                  Einheitliche Arbeitskleidung (Logo, Farben, Design)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uniformVehicleBranding"
                  checked={formData.uniformVehicleBranding}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, uniformVehicleBranding: checked === true }))
                  }
                />
                <Label htmlFor="uniformVehicleBranding">
                  Einheitliche Fahrzeugbeklebung (Logo, Kontaktdaten, Design)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="uniformColorScheme"
                  checked={formData.uniformColorScheme}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, uniformColorScheme: checked === true }))
                  }
                />
                <Label htmlFor="uniformColorScheme">
                  Einheitliche Farbgebung (Website, Materialien, Fahrzeuge)
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notizen (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Zusätzliche Bemerkungen zur Corporate Identity..."
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}