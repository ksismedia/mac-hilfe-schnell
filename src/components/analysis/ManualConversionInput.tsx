import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ManualConversionData } from '@/hooks/useManualData';
import { z } from 'zod';

interface ManualConversionInputProps {
  onSave: (data: ManualConversionData) => void;
  initialData?: ManualConversionData | null;
}

// Validation Schema
const conversionDataSchema = z.object({
  totalCTAs: z.number().min(0).max(100),
  visibleCTAs: z.number().min(0).max(100),
  effectiveCTAs: z.number().min(0).max(100),
  aboveFoldCTAs: z.number().min(0).max(100),
  ctaScore: z.number().min(0).max(100),
  contactScore: z.number().min(0).max(100),
  userJourneyScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  notes: z.string().max(1000).optional()
});

const getDefaultData = (): ManualConversionData => ({
  totalCTAs: 0,
  visibleCTAs: 0,
  effectiveCTAs: 0,
  aboveFoldCTAs: 0,
  ctaTypes: [],
  contactMethods: {
    phone: { visible: false, prominent: false, clickable: false },
    email: { visible: false, prominent: false },
    form: { present: false, mobileOptimized: false },
    chat: { present: false },
    whatsapp: { present: false },
    callback: { present: false }
  },
  ctaScore: 0,
  contactScore: 0,
  userJourneyScore: 0,
  overallScore: 0,
  userJourneyDetails: {
    landingPageScore: 0,
    navigationScore: 0,
    informationHierarchyScore: 0,
    trustElementsScore: 0,
    readabilityScore: 0
  },
  notes: ''
});

export const ManualConversionInput: React.FC<ManualConversionInputProps> = ({
  onSave,
  initialData
}) => {
  const { toast } = useToast();
  const [data, setData] = useState<ManualConversionData>(
    initialData || getDefaultData()
  );

  const handleSave = () => {
    try {
      console.log('=== SAVING CONVERSION DATA ===');
      console.log('Data to save:', data);
      
      // Validate numeric fields
      conversionDataSchema.parse({
        totalCTAs: data.totalCTAs,
        visibleCTAs: data.visibleCTAs,
        effectiveCTAs: data.effectiveCTAs,
        aboveFoldCTAs: data.aboveFoldCTAs,
        ctaScore: data.ctaScore,
        contactScore: data.contactScore,
        userJourneyScore: data.userJourneyScore,
        overallScore: data.overallScore,
        notes: data.notes
      });

      console.log('Validation successful, calling onSave...');
      onSave(data);
      console.log('onSave called');
      
      toast({
        title: "Conversion-Daten gespeichert",
        description: "Die manuellen Conversion-Bewertungen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validierungsfehler",
        description: "Bitte überprüfen Sie Ihre Eingaben.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setData(getDefaultData());
  };

  const addCTAType = () => {
    setData(prev => ({
      ...prev,
      ctaTypes: [
        ...prev.ctaTypes,
        {
          type: '',
          count: 0,
          effectiveness: 50,
          mobileOptimized: false,
          trackingSetup: false
        }
      ]
    }));
  };

  const removeCTAType = (index: number) => {
    setData(prev => ({
      ...prev,
      ctaTypes: prev.ctaTypes.filter((_, i) => i !== index)
    }));
  };

  const updateCTAType = (index: number, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      ctaTypes: prev.ctaTypes.map((cta, i) => 
        i === index ? { ...cta, [field]: value } : cta
      )
    }));
  };

  // Auto-calculate User Journey Score from details
  React.useEffect(() => {
    if (data.userJourneyDetails) {
      const { landingPageScore, navigationScore, informationHierarchyScore, trustElementsScore, readabilityScore } = data.userJourneyDetails;
      const avg = Math.round((landingPageScore + navigationScore + informationHierarchyScore + trustElementsScore + readabilityScore) / 5);
      if (avg !== data.userJourneyScore) {
        setData(prev => ({ ...prev, userJourneyScore: avg }));
      }
    }
  }, [data.userJourneyDetails]);

  // Auto-calculate overall score
  React.useEffect(() => {
    const avg = Math.round((data.ctaScore + data.contactScore + data.userJourneyScore) / 3);
    if (avg !== data.overallScore) {
      setData(prev => ({ ...prev, overallScore: avg }));
    }
  }, [data.ctaScore, data.contactScore, data.userJourneyScore]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎯 Manuelle Conversion-Bewertung
        </CardTitle>
        <CardDescription>
          Bewerten Sie Call-to-Actions, Kontaktmethoden und User Journey
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Call-to-Action Statistiken */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold">Call-to-Action (CTA) Statistiken</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalCTAs">Gesamt-CTAs</Label>
              <Input
                id="totalCTAs"
                type="number"
                min="0"
                max="100"
                value={data.totalCTAs}
                onChange={(e) => setData(prev => ({ 
                  ...prev, 
                  totalCTAs: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="visibleCTAs">Sichtbare CTAs</Label>
              <Input
                id="visibleCTAs"
                type="number"
                min="0"
                max="100"
                value={data.visibleCTAs}
                onChange={(e) => setData(prev => ({ 
                  ...prev, 
                  visibleCTAs: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="effectiveCTAs">Effektive CTAs</Label>
              <Input
                id="effectiveCTAs"
                type="number"
                min="0"
                max="100"
                value={data.effectiveCTAs}
                onChange={(e) => setData(prev => ({ 
                  ...prev, 
                  effectiveCTAs: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="aboveFoldCTAs">Above-the-Fold CTAs</Label>
              <Input
                id="aboveFoldCTAs"
                type="number"
                min="0"
                max="100"
                value={data.aboveFoldCTAs}
                onChange={(e) => setData(prev => ({ 
                  ...prev, 
                  aboveFoldCTAs: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* CTA-Typen */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">CTA-Typen</h4>
            <Button onClick={addCTAType} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              CTA-Typ hinzufügen
            </Button>
          </div>
          
          {data.ctaTypes.map((cta, index) => (
            <div key={index} className="p-4 bg-muted/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  placeholder="CTA-Typ (z.B. Telefon, Kontaktformular)"
                  value={cta.type}
                  onChange={(e) => updateCTAType(index, 'type', e.target.value.slice(0, 50))}
                  className="flex-1 mr-2"
                />
                <Button
                  onClick={() => removeCTAType(index)}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Anzahl</Label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={cta.count}
                    onChange={(e) => updateCTAType(index, 'count', Math.min(50, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Effektivität ({cta.effectiveness}%)</Label>
                  <Slider
                    value={[cta.effectiveness]}
                    onValueChange={([value]) => updateCTAType(index, 'effectiveness', value)}
                    max={100}
                    min={0}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={cta.mobileOptimized}
                    onCheckedChange={(checked) => updateCTAType(index, 'mobileOptimized', checked)}
                  />
                  <Label>Mobile optimiert</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={cta.trackingSetup}
                    onCheckedChange={(checked) => updateCTAType(index, 'trackingSetup', checked)}
                  />
                  <Label>Tracking aktiv</Label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Kontaktmethoden */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold">Kontaktmethoden</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Telefon</span>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.contactMethods.phone.visible}
                    onCheckedChange={(checked) => setData(prev => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        phone: { ...prev.contactMethods.phone, visible: checked }
                      }
                    }))}
                  />
                  <Label>Sichtbar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.contactMethods.phone.prominent}
                    onCheckedChange={(checked) => setData(prev => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        phone: { ...prev.contactMethods.phone, prominent: checked }
                      }
                    }))}
                  />
                  <Label>Prominent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.contactMethods.phone.clickable}
                    onCheckedChange={(checked) => setData(prev => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        phone: { ...prev.contactMethods.phone, clickable: checked }
                      }
                    }))}
                  />
                  <Label>Klickbar</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>E-Mail</span>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.contactMethods.email.visible}
                    onCheckedChange={(checked) => setData(prev => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        email: { ...prev.contactMethods.email, visible: checked }
                      }
                    }))}
                  />
                  <Label>Sichtbar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.contactMethods.email.prominent}
                    onCheckedChange={(checked) => setData(prev => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        email: { ...prev.contactMethods.email, prominent: checked }
                      }
                    }))}
                  />
                  <Label>Prominent</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Kontaktformular</span>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.contactMethods.form.present}
                    onCheckedChange={(checked) => setData(prev => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        form: { ...prev.contactMethods.form, present: checked }
                      }
                    }))}
                  />
                  <Label>Vorhanden</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={data.contactMethods.form.mobileOptimized}
                    onCheckedChange={(checked) => setData(prev => ({
                      ...prev,
                      contactMethods: {
                        ...prev.contactMethods,
                        form: { ...prev.contactMethods.form, mobileOptimized: checked }
                      }
                    }))}
                  />
                  <Label>Mobile optimiert</Label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Live-Chat</span>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={data.contactMethods.chat.present}
                  onCheckedChange={(checked) => setData(prev => ({
                    ...prev,
                    contactMethods: {
                      ...prev.contactMethods,
                      chat: { present: checked }
                    }
                  }))}
                />
                <Label>Vorhanden</Label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>WhatsApp</span>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={data.contactMethods.whatsapp.present}
                  onCheckedChange={(checked) => setData(prev => ({
                    ...prev,
                    contactMethods: {
                      ...prev.contactMethods,
                      whatsapp: { present: checked }
                    }
                  }))}
                />
                <Label>Vorhanden</Label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Rückruf-Service</span>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={data.contactMethods.callback.present}
                  onCheckedChange={(checked) => setData(prev => ({
                    ...prev,
                    contactMethods: {
                      ...prev.contactMethods,
                      callback: { present: checked }
                    }
                  }))}
                />
                <Label>Vorhanden</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">
              CTA-Score ({data.ctaScore}%)
            </Label>
            <Slider
              value={[data.ctaScore]}
              onValueChange={([value]) => setData(prev => ({ ...prev, ctaScore: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Kontaktmethoden-Score ({data.contactScore}%)
            </Label>
            <Slider
              value={[data.contactScore]}
              onValueChange={([value]) => setData(prev => ({ ...prev, contactScore: value }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              User Journey Score ({data.userJourneyScore}%) - Durchschnitt
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              Wird automatisch aus den 5 Unterkategorien berechnet
            </p>
            <Slider
              value={[data.userJourneyScore]}
              max={100}
              min={0}
              disabled
              className="mt-2 opacity-60"
            />
          </div>
        </div>

        {/* User Journey Details */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h4 className="font-semibold">User Journey Details</h4>
          
          <div>
            <Label className="text-sm font-medium">
              Landing Page ({data.userJourneyDetails?.landingPageScore || 0}%)
            </Label>
            <p className="text-xs text-muted-foreground">
              Headline, Value Proposition, Trust Signals
            </p>
            <Slider
              value={[data.userJourneyDetails?.landingPageScore || 0]}
              onValueChange={([value]) => setData(prev => ({ 
                ...prev, 
                userJourneyDetails: { ...prev.userJourneyDetails!, landingPageScore: value }
              }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Navigation ({data.userJourneyDetails?.navigationScore || 0}%)
            </Label>
            <p className="text-xs text-muted-foreground">
              Menüstruktur, Breadcrumbs, Suchfunktion
            </p>
            <Slider
              value={[data.userJourneyDetails?.navigationScore || 0]}
              onValueChange={([value]) => setData(prev => ({ 
                ...prev, 
                userJourneyDetails: { ...prev.userJourneyDetails!, navigationScore: value }
              }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Informationshierarchie ({data.userJourneyDetails?.informationHierarchyScore || 0}%)
            </Label>
            <p className="text-xs text-muted-foreground">
              Content Flow, Scanability, CTA-Platzierung
            </p>
            <Slider
              value={[data.userJourneyDetails?.informationHierarchyScore || 0]}
              onValueChange={([value]) => setData(prev => ({ 
                ...prev, 
                userJourneyDetails: { ...prev.userJourneyDetails!, informationHierarchyScore: value }
              }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Vertrauenselemente ({data.userJourneyDetails?.trustElementsScore || 0}%)
            </Label>
            <p className="text-xs text-muted-foreground">
              Testimonials, Zertifikate, Garantien
            </p>
            <Slider
              value={[data.userJourneyDetails?.trustElementsScore || 0]}
              onValueChange={([value]) => setData(prev => ({ 
                ...prev, 
                userJourneyDetails: { ...prev.userJourneyDetails!, trustElementsScore: value }
              }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium">
              Lesbarkeit ({data.userJourneyDetails?.readabilityScore || 0}%)
            </Label>
            <p className="text-xs text-muted-foreground">
              Schriftgröße, Kontrast, Zeilenlänge, Absätze
            </p>
            <Slider
              value={[data.userJourneyDetails?.readabilityScore || 0]}
              onValueChange={([value]) => setData(prev => ({ 
                ...prev, 
                userJourneyDetails: { ...prev.userJourneyDetails!, readabilityScore: value }
              }))}
              max={100}
              min={0}
              step={5}
              className="mt-2"
            />
          </div>

          <div className="p-4 bg-primary/10 rounded-lg">
            <Label className="text-sm font-medium">
              Gesamt-Score (automatisch berechnet): {data.overallScore}%
            </Label>
          </div>
        </div>

        {/* Notizen */}
        <div>
          <Label htmlFor="notes">Zusätzliche Notizen</Label>
          <Textarea
            id="notes"
            placeholder="Zusätzliche Beobachtungen zur Conversion-Optimierung..."
            value={data.notes}
            onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value.slice(0, 1000) }))}
            className="mt-1"
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {data.notes?.length || 0}/1000 Zeichen
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Speichern
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Zurücksetzen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManualConversionInput;
