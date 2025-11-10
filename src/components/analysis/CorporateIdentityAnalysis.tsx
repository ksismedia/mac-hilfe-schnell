import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Edit3, Save, X } from 'lucide-react';
import { ManualCorporateIdentityData } from '@/hooks/useManualData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    // Corporate Design
    uniformLogo: false,
    uniformWorkClothing: false,
    uniformColorScheme: false,
    uniformTypography: false,
    uniformWebsiteDesign: false,
    // Eingesetzte Werbemittel
    hauszeitung: false,
    herstellerInfos: false,
    // Außenwirkung Fahrzeugflotte
    uniformVehicleBranding: false,
    vehicleCondition: false,
    // Außenwerbung
    bauzaunBanner: false,
    bandenWerbung: false,
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
        uniformColorScheme: false,
        uniformTypography: false,
        uniformWebsiteDesign: false,
        hauszeitung: false,
        herstellerInfos: false,
        uniformVehicleBranding: false,
        vehicleCondition: false,
        bauzaunBanner: false,
        bandenWerbung: false,
        notes: ''
      });
    }
    setIsEditing(false);
  };

  const calculateCorporateDesignScore = () => {
    if (!manualData) return 0;
    const checks = [
      manualData.uniformLogo,
      manualData.uniformWorkClothing,
      manualData.uniformColorScheme,
      manualData.uniformTypography,
      manualData.uniformWebsiteDesign
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const calculateWerbemittelScore = () => {
    if (!manualData) return 0;
    const checks = [
      manualData.hauszeitung,
      manualData.herstellerInfos
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const calculateFahrzeugflotteScore = () => {
    if (!manualData) return 0;
    const checks = [
      manualData.uniformVehicleBranding,
      manualData.vehicleCondition
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const calculateAussenWerbungScore = () => {
    if (!manualData) return 0;
    const checks = [
      manualData.bauzaunBanner,
      manualData.bandenWerbung
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  };

  const calculateOverallScore = () => {
    if (!manualData) return 0;
    return Math.round((
      calculateCorporateDesignScore() + 
      calculateWerbemittelScore() + 
      calculateFahrzeugflotteScore() + 
      calculateAussenWerbungScore()
    ) / 4);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-600';
    if (score >= 61) return 'text-green-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'secondary';
    if (score >= 61) return 'default';
    return 'destructive';
  };

  const overallScore = calculateOverallScore();
  const cdScore = calculateCorporateDesignScore();
  const wmScore = calculateWerbemittelScore();
  const ffScore = calculateFahrzeugflotteScore();
  const awScore = calculateAussenWerbungScore();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              Außendarstellung & Erscheinungsbild
              {manualData ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
            </CardTitle>
            <CardDescription>
              Bewertung der Außendarstellung von {businessData.companyName}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {manualData && (
              <Badge variant={getScoreBadge(overallScore)} className="text-sm">
                {overallScore}% Gesamt
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
            <p className="text-lg font-medium mb-2">Außendarstellung noch nicht bewertet</p>
            <p className="mb-4">
              Bewerten Sie die Außendarstellung und das Erscheinungsbild
            </p>
            <Button onClick={() => setIsEditing(true)}>
              Jetzt bewerten
            </Button>
          </div>
        )}

        {manualData && !isEditing && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="cd">Corporate Design</TabsTrigger>
              <TabsTrigger value="wm">Werbemittel</TabsTrigger>
              <TabsTrigger value="ff">Fahrzeugflotte</TabsTrigger>
              <TabsTrigger value="aw">Außenwerbung</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Corporate Design</h4>
                    <Badge variant={getScoreBadge(cdScore)}>{cdScore}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {cdScore >= 80 ? 'Sehr konsistent' : cdScore >= 60 ? 'Gut' : 'Verbesserungsbedarf'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Werbemittel</h4>
                    <Badge variant={getScoreBadge(wmScore)}>{wmScore}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {wmScore >= 80 ? 'Sehr gut' : wmScore >= 50 ? 'Teilweise' : 'Kaum vorhanden'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Fahrzeugflotte</h4>
                    <Badge variant={getScoreBadge(ffScore)}>{ffScore}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ffScore >= 80 ? 'Professionell' : ffScore >= 50 ? 'Ausbaufähig' : 'Schwach'}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Außenwerbung</h4>
                    <Badge variant={getScoreBadge(awScore)}>{awScore}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {awScore >= 80 ? 'Aktiv' : awScore >= 50 ? 'Teilweise' : 'Kaum vorhanden'}
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="cd" className="space-y-3">
              <h4 className="font-medium mb-3">Corporate Design ({cdScore}%)</h4>
              <div className="space-y-2">
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
                <div className="flex items-center justify-between">
                  <span>Einheitliche Farbgebung</span>
                  {manualData.uniformColorScheme ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Einheitliche Typografie</span>
                  {manualData.uniformTypography ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Einheitliches Website-Design</span>
                  {manualData.uniformWebsiteDesign ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wm" className="space-y-3">
              <h4 className="font-medium mb-3">Eingesetzte Werbemittel ({wmScore}%)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Hauszeitung</span>
                  {manualData.hauszeitung ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Herstellerinfos</span>
                  {manualData.herstellerInfos ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ff" className="space-y-3">
              <h4 className="font-medium mb-3">Außenwirkung Fahrzeugflotte ({ffScore}%)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Einheitliche Fahrzeugbeklebung</span>
                  {manualData.uniformVehicleBranding ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Fahrzeugzustand</span>
                  {manualData.vehicleCondition ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aw" className="space-y-3">
              <h4 className="font-medium mb-3">Außenwerbung ({awScore}%)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Bauzaunbanner</span>
                  {manualData.bauzaunBanner ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>Bandenwerbung (Sportmarketing)</span>
                  {manualData.bandenWerbung ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {isEditing && (
          <Tabs defaultValue="cd" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cd">Corporate Design</TabsTrigger>
              <TabsTrigger value="wm">Werbemittel</TabsTrigger>
              <TabsTrigger value="ff">Fahrzeugflotte</TabsTrigger>
              <TabsTrigger value="aw">Außenwerbung</TabsTrigger>
            </TabsList>

            <TabsContent value="cd" className="space-y-4">
              <h4 className="font-medium">Corporate Design</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uniformLogo"
                    checked={formData.uniformLogo}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, uniformLogo: checked === true }))
                    }
                  />
                  <Label htmlFor="uniformLogo">
                    Einheitliches Logo
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
                    Einheitliche Arbeitskleidung
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
                    Einheitliche Farbgebung
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uniformTypography"
                    checked={formData.uniformTypography}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, uniformTypography: checked === true }))
                    }
                  />
                  <Label htmlFor="uniformTypography">
                    Einheitliche Typografie
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uniformWebsiteDesign"
                    checked={formData.uniformWebsiteDesign}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, uniformWebsiteDesign: checked === true }))
                    }
                  />
                  <Label htmlFor="uniformWebsiteDesign">
                    Einheitliches Website-Design
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wm" className="space-y-4">
              <h4 className="font-medium">Eingesetzte Werbemittel</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hauszeitung"
                    checked={formData.hauszeitung}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, hauszeitung: checked === true }))
                    }
                  />
                  <Label htmlFor="hauszeitung">
                    Hauszeitung
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="herstellerInfos"
                    checked={formData.herstellerInfos}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, herstellerInfos: checked === true }))
                    }
                  />
                  <Label htmlFor="herstellerInfos">
                    Herstellerinfos
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ff" className="space-y-4">
              <h4 className="font-medium">Außenwirkung Fahrzeugflotte</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uniformVehicleBranding"
                    checked={formData.uniformVehicleBranding}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, uniformVehicleBranding: checked === true }))
                    }
                  />
                  <Label htmlFor="uniformVehicleBranding">
                    Einheitliche Fahrzeugbeklebung
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="vehicleCondition"
                    checked={formData.vehicleCondition}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, vehicleCondition: checked === true }))
                    }
                  />
                  <Label htmlFor="vehicleCondition">
                    Fahrzeugzustand (gepflegt, sauber)
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aw" className="space-y-4">
              <h4 className="font-medium">Außenwerbung</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bauzaunBanner"
                    checked={formData.bauzaunBanner}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, bauzaunBanner: checked === true }))
                    }
                  />
                  <Label htmlFor="bauzaunBanner">
                    Bauzaunbanner
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="bandenWerbung"
                    checked={formData.bandenWerbung}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, bandenWerbung: checked === true }))
                    }
                  />
                  <Label htmlFor="bandenWerbung">
                    Bandenwerbung (Sportmarketing)
                  </Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {isEditing && (
          <div className="mt-4">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Zusätzliche Bemerkungen..."
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="mt-1"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CorporateIdentityAnalysis;
