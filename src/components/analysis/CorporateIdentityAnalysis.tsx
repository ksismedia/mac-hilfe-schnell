import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Edit3, Save, X, HelpCircle } from 'lucide-react';
import { ManualCorporateIdentityData } from '@/hooks/useManualData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
    uniformLogo: 'unknown',
    uniformWorkClothing: 'unknown',
    uniformColorScheme: 'unknown',
    uniformTypography: 'unknown',
    uniformWebsiteDesign: 'unknown',
    // Eingesetzte Werbemittel
    hauszeitung: 'unknown',
    herstellerInfos: 'unknown',
    // Außenwirkung Fahrzeugflotte
    uniformVehicleBranding: 'unknown',
    vehicleCondition: 'unknown',
    // Außenwerbung
    bauzaunBanner: 'unknown',
    bandenWerbung: 'unknown',
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
        uniformLogo: 'unknown',
        uniformWorkClothing: 'unknown',
        uniformColorScheme: 'unknown',
        uniformTypography: 'unknown',
        uniformWebsiteDesign: 'unknown',
        hauszeitung: 'unknown',
        herstellerInfos: 'unknown',
        uniformVehicleBranding: 'unknown',
        vehicleCondition: 'unknown',
        bauzaunBanner: 'unknown',
        bandenWerbung: 'unknown',
        notes: ''
      });
    }
    setIsEditing(false);
  };

  const calculateScore = (fields: Array<'yes' | 'no' | 'unknown'>) => {
    const knownFields = fields.filter(f => f !== 'unknown');
    if (knownFields.length === 0) return 0;
    const yesCount = knownFields.filter(f => f === 'yes').length;
    return Math.round((yesCount / knownFields.length) * 100);
  };

  const calculateCorporateDesignScore = () => {
    if (!manualData) return 0;
    return calculateScore([
      manualData.uniformLogo,
      manualData.uniformWorkClothing,
      manualData.uniformColorScheme,
      manualData.uniformTypography,
      manualData.uniformWebsiteDesign
    ]);
  };

  const calculateWerbemittelScore = () => {
    if (!manualData) return 0;
    return calculateScore([
      manualData.hauszeitung,
      manualData.herstellerInfos
    ]);
  };

  const calculateFahrzeugflotteScore = () => {
    if (!manualData) return 0;
    return calculateScore([
      manualData.uniformVehicleBranding,
      manualData.vehicleCondition
    ]);
  };

  const calculateAussenWerbungScore = () => {
    if (!manualData) return 0;
    return calculateScore([
      manualData.bauzaunBanner,
      manualData.bandenWerbung
    ]);
  };

  const calculateOverallScore = () => {
    if (!manualData) return 0;
    const scores = [
      calculateCorporateDesignScore(),
      calculateWerbemittelScore(),
      calculateFahrzeugflotteScore(),
      calculateAussenWerbungScore()
    ].filter(s => s > 0); // Nur Scores einbeziehen, wo Daten vorhanden sind
    
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const getImprovementSuggestions = () => {
    if (!manualData) return [];
    const suggestions: string[] = [];
    
    // Corporate Design
    if (manualData.uniformLogo === 'no') suggestions.push('Einheitliches Logo auf allen Kanälen implementieren');
    if (manualData.uniformWorkClothing === 'no') suggestions.push('Einheitliche Arbeitskleidung für Mitarbeiter einführen');
    if (manualData.uniformColorScheme === 'no') suggestions.push('Corporate Farbgebung definieren und konsistent nutzen');
    if (manualData.uniformTypography === 'no') suggestions.push('Einheitliche Typografie festlegen');
    if (manualData.uniformWebsiteDesign === 'no') suggestions.push('Website-Design an Corporate Design anpassen');
    
    // Werbemittel
    if (manualData.hauszeitung === 'no') suggestions.push('Hauszeitung oder Newsletter zur Kundenbindung einführen');
    if (manualData.herstellerInfos === 'no') suggestions.push('Herstellerinformationen und Produktbroschüren bereitstellen');
    
    // Fahrzeugflotte
    if (manualData.uniformVehicleBranding === 'no') suggestions.push('Fahrzeugbeklebung mit Logo und Kontaktdaten umsetzen');
    if (manualData.vehicleCondition === 'no') suggestions.push('Fahrzeugpflege und -wartung verbessern');
    
    // Außenwerbung
    if (manualData.bauzaunBanner === 'no') suggestions.push('Bauzaunbanner für Baustellen-Marketing nutzen');
    if (manualData.bandenWerbung === 'no') suggestions.push('Sportmarketing durch Bandenwerbung erwägen');
    
    return suggestions;
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

  const getStatusIcon = (status: 'yes' | 'no' | 'unknown') => {
    if (status === 'yes') return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === 'no') return <X className="h-5 w-5 text-red-600" />;
    return <HelpCircle className="h-5 w-5 text-gray-400" />;
  };

  const overallScore = calculateOverallScore();
  const cdScore = calculateCorporateDesignScore();
  const wmScore = calculateWerbemittelScore();
  const ffScore = calculateFahrzeugflotteScore();
  const awScore = calculateAussenWerbungScore();
  const suggestions = getImprovementSuggestions();

  const RadioField = ({ 
    id, 
    label, 
    value, 
    onChange 
  }: { 
    id: string; 
    label: string; 
    value: 'yes' | 'no' | 'unknown'; 
    onChange: (value: 'yes' | 'no' | 'unknown') => void;
  }) => (
    <div className="space-y-2 p-3 border rounded-lg">
      <Label className="text-sm font-medium">{label}</Label>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as 'yes' | 'no' | 'unknown')}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id={`${id}-yes`} />
          <Label htmlFor={`${id}-yes`} className="cursor-pointer">Ja</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id={`${id}-no`} />
          <Label htmlFor={`${id}-no`} className="cursor-pointer">Nein</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="unknown" id={`${id}-unknown`} />
          <Label htmlFor={`${id}-unknown`} className="cursor-pointer text-muted-foreground">Keine Info verfügbar</Label>
        </div>
      </RadioGroup>
    </div>
  );

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

              {suggestions.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    Verbesserungsvorschläge
                  </h4>
                  <ul className="space-y-1 text-sm">
                    {suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cd" className="space-y-3">
              <h4 className="font-medium mb-3">Corporate Design ({cdScore}%)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Einheitliches Logo</span>
                  {getStatusIcon(manualData.uniformLogo)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Einheitliche Arbeitskleidung</span>
                  {getStatusIcon(manualData.uniformWorkClothing)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Einheitliche Farbgebung</span>
                  {getStatusIcon(manualData.uniformColorScheme)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Einheitliche Typografie</span>
                  {getStatusIcon(manualData.uniformTypography)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Einheitliches Website-Design</span>
                  {getStatusIcon(manualData.uniformWebsiteDesign)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wm" className="space-y-3">
              <h4 className="font-medium mb-3">Eingesetzte Werbemittel ({wmScore}%)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Hauszeitung</span>
                  {getStatusIcon(manualData.hauszeitung)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Herstellerinfos</span>
                  {getStatusIcon(manualData.herstellerInfos)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ff" className="space-y-3">
              <h4 className="font-medium mb-3">Außenwirkung Fahrzeugflotte ({ffScore}%)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Einheitliche Fahrzeugbeklebung</span>
                  {getStatusIcon(manualData.uniformVehicleBranding)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Fahrzeugzustand</span>
                  {getStatusIcon(manualData.vehicleCondition)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="aw" className="space-y-3">
              <h4 className="font-medium mb-3">Außenwerbung ({awScore}%)</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Bauzaunbanner</span>
                  {getStatusIcon(manualData.bauzaunBanner)}
                </div>
                <div className="flex items-center justify-between">
                  <span>Bandenwerbung (Sportmarketing)</span>
                  {getStatusIcon(manualData.bandenWerbung)}
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

            <TabsContent value="cd" className="space-y-3">
              <h4 className="font-medium mb-3">Corporate Design</h4>
              <RadioField 
                id="uniformLogo"
                label="Einheitliches Logo"
                value={formData.uniformLogo}
                onChange={(v) => setFormData(prev => ({ ...prev, uniformLogo: v }))}
              />
              <RadioField 
                id="uniformWorkClothing"
                label="Einheitliche Arbeitskleidung"
                value={formData.uniformWorkClothing}
                onChange={(v) => setFormData(prev => ({ ...prev, uniformWorkClothing: v }))}
              />
              <RadioField 
                id="uniformColorScheme"
                label="Einheitliche Farbgebung"
                value={formData.uniformColorScheme}
                onChange={(v) => setFormData(prev => ({ ...prev, uniformColorScheme: v }))}
              />
              <RadioField 
                id="uniformTypography"
                label="Einheitliche Typografie"
                value={formData.uniformTypography}
                onChange={(v) => setFormData(prev => ({ ...prev, uniformTypography: v }))}
              />
              <RadioField 
                id="uniformWebsiteDesign"
                label="Einheitliches Website-Design"
                value={formData.uniformWebsiteDesign}
                onChange={(v) => setFormData(prev => ({ ...prev, uniformWebsiteDesign: v }))}
              />
            </TabsContent>

            <TabsContent value="wm" className="space-y-3">
              <h4 className="font-medium mb-3">Eingesetzte Werbemittel</h4>
              <RadioField 
                id="hauszeitung"
                label="Hauszeitung"
                value={formData.hauszeitung}
                onChange={(v) => setFormData(prev => ({ ...prev, hauszeitung: v }))}
              />
              <RadioField 
                id="herstellerInfos"
                label="Herstellerinfos"
                value={formData.herstellerInfos}
                onChange={(v) => setFormData(prev => ({ ...prev, herstellerInfos: v }))}
              />
            </TabsContent>

            <TabsContent value="ff" className="space-y-3">
              <h4 className="font-medium mb-3">Außenwirkung Fahrzeugflotte</h4>
              <RadioField 
                id="uniformVehicleBranding"
                label="Einheitliche Fahrzeugbeklebung"
                value={formData.uniformVehicleBranding}
                onChange={(v) => setFormData(prev => ({ ...prev, uniformVehicleBranding: v }))}
              />
              <RadioField 
                id="vehicleCondition"
                label="Fahrzeugzustand (gepflegt, sauber)"
                value={formData.vehicleCondition}
                onChange={(v) => setFormData(prev => ({ ...prev, vehicleCondition: v }))}
              />
            </TabsContent>

            <TabsContent value="aw" className="space-y-3">
              <h4 className="font-medium mb-3">Außenwerbung</h4>
              <RadioField 
                id="bauzaunBanner"
                label="Bauzaunbanner"
                value={formData.bauzaunBanner}
                onChange={(v) => setFormData(prev => ({ ...prev, bauzaunBanner: v }))}
              />
              <RadioField 
                id="bandenWerbung"
                label="Bandenwerbung (Sportmarketing)"
                value={formData.bandenWerbung}
                onChange={(v) => setFormData(prev => ({ ...prev, bandenWerbung: v }))}
              />
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
