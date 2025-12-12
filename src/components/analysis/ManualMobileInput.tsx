import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Smartphone, Save } from 'lucide-react';
import { ManualMobileData } from '@/hooks/useManualData';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

interface ManualMobileInputProps {
  initialData: ManualMobileData | null;
  onDataChange: (data: ManualMobileData) => void;
}

const ManualMobileInput: React.FC<ManualMobileInputProps> = ({ initialData, onDataChange }) => {
  const { reviewStatus, updateReviewStatus } = useAnalysisContext();
  const [formData, setFormData] = useState<ManualMobileData>(
    initialData || {
      viewportConfig: 'correct',
      flexibleLayouts: 80,
      imageOptimization: 85,
      mobileLoadTime: 2.5,
      coreWebVitals: {
        lcp: 2.5,
        fid: 100,
        cls: 0.1
      },
      mobileFirstIndex: true,
      buttonSize: 'touch-friendly',
      tapDistance: 'sufficient',
      scrollBehavior: 'smooth',
      navigationMobileFriendly: true,
      readableTextSize: true,
      noHorizontalScrolling: true,
      appropriateInteractiveElements: true,
      responsiveDesignScore: 80,
      performanceScore: 75,
      touchOptimizationScore: 85,
      overallScore: 80,
      notes: ''
    }
  );

  useEffect(() => {
    const calculatedScore = calculateScore(formData);
    if (calculatedScore !== formData.overallScore) {
      setFormData(prev => ({ ...prev, overallScore: calculatedScore }));
    }
  }, [
    formData.viewportConfig,
    formData.flexibleLayouts,
    formData.imageOptimization,
    formData.mobileLoadTime,
    formData.coreWebVitals,
    formData.mobileFirstIndex,
    formData.buttonSize,
    formData.tapDistance,
    formData.scrollBehavior,
    formData.navigationMobileFriendly,
    formData.readableTextSize,
    formData.noHorizontalScrolling,
    formData.appropriateInteractiveElements
  ]);

  const calculateScore = (data: ManualMobileData): number => {
    // Responsive Design Score (max 35 Punkte)
    let responsiveScore = 0;
    
    // Viewport Config (10 Punkte)
    if (data.viewportConfig === 'correct') responsiveScore += 10;
    else if (data.viewportConfig === 'incorrect') responsiveScore += 5;
    
    // Flexible Layouts (15 Punkte, basierend auf %)
    responsiveScore += (data.flexibleLayouts / 100) * 15;
    
    // Image Optimization (10 Punkte, basierend auf %)
    responsiveScore += (data.imageOptimization / 100) * 10;
    
    // Mobile Performance Score (max 35 Punkte)
    let performanceScore = 0;
    
    // Mobile Load Time (15 Punkte)
    if (data.mobileLoadTime <= 1.5) performanceScore += 15;
    else if (data.mobileLoadTime <= 2.5) performanceScore += 12;
    else if (data.mobileLoadTime <= 3.5) performanceScore += 8;
    else if (data.mobileLoadTime <= 5) performanceScore += 4;
    
    // Core Web Vitals LCP (8 Punkte)
    if (data.coreWebVitals.lcp <= 2.5) performanceScore += 8;
    else if (data.coreWebVitals.lcp <= 4) performanceScore += 5;
    else performanceScore += 2;
    
    // Core Web Vitals FID (6 Punkte)
    if (data.coreWebVitals.fid <= 100) performanceScore += 6;
    else if (data.coreWebVitals.fid <= 300) performanceScore += 3;
    
    // Core Web Vitals CLS (6 Punkte)
    if (data.coreWebVitals.cls <= 0.1) performanceScore += 6;
    else if (data.coreWebVitals.cls <= 0.25) performanceScore += 3;
    
    // Touch Optimization Score (max 30 Punkte)
    let touchScore = 0;
    
    // Button Size (10 Punkte)
    if (data.buttonSize === 'touch-friendly') touchScore += 10;
    else if (data.buttonSize === 'acceptable') touchScore += 6;
    else touchScore += 2;
    
    // Tap Distance (10 Punkte)
    if (data.tapDistance === 'good') touchScore += 10;
    else if (data.tapDistance === 'sufficient') touchScore += 6;
    else touchScore += 4;
    
    // Scroll Behavior (10 Punkte)
    if (data.scrollBehavior === 'smooth') touchScore += 10;
    else if (data.scrollBehavior === 'acceptable') touchScore += 6;
    else touchScore += 2;
    
    // Total Score (100 Punkte möglich)
    const totalScore = Math.round(responsiveScore + performanceScore + touchScore);
    
    // Update individual scores
    const newData = {
      ...data,
      responsiveDesignScore: Math.round(responsiveScore),
      performanceScore: Math.round(performanceScore),
      touchOptimizationScore: Math.round(touchScore)
    };
    
    return Math.min(100, totalScore);
  };

  const handleSave = () => {
    const finalData = { ...formData, overallScore: calculateScore(formData) };
    onDataChange(finalData);
    toast.success('Mobile-Optimierung Daten gespeichert');
  };

  const updateField = <K extends keyof ManualMobileData>(
    field: K,
    value: ManualMobileData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-yellow-600";
    if (score >= 61) return "text-green-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "secondary";
    if (score >= 61) return "default";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Manuelle Mobile-Optimierung Eingabe
              </CardTitle>
              <CardDescription>
                Erfassen Sie detaillierte Daten zur mobilen Optimierung
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Gesamtbewertung</div>
              <Badge variant={getScoreBadge(formData.overallScore)} className="text-lg px-3 py-1">
                {formData.overallScore}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Responsive Design */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📱 Responsive Design
              <Badge variant={getScoreBadge(formData.responsiveDesignScore)}>
                {formData.responsiveDesignScore} Punkte
              </Badge>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="viewportConfig">Viewport-Konfiguration</Label>
                  <Select
                    value={formData.viewportConfig}
                    onValueChange={(value: 'correct' | 'incorrect' | 'missing') => 
                      updateField('viewportConfig', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="correct">Korrekt (10 Punkte)</SelectItem>
                      <SelectItem value="incorrect">Fehlerhaft (5 Punkte)</SelectItem>
                      <SelectItem value="missing">Fehlend (0 Punkte)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Flexible Layouts: {formData.flexibleLayouts}%</Label>
                <Slider
                  value={[formData.flexibleLayouts]}
                  onValueChange={([value]) => updateField('flexibleLayouts', value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Wie gut passt sich das Layout an verschiedene Bildschirmgrößen an?
                </p>
              </div>

              <div>
                <Label>Bildoptimierung: {formData.imageOptimization}%</Label>
                <Slider
                  value={[formData.imageOptimization]}
                  onValueChange={([value]) => updateField('imageOptimization', value)}
                  max={100}
                  step={5}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Responsive Bilder, korrekte Größen für mobile Geräte
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Mobile Performance */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              ⚡ Mobile Performance
              <Badge variant={getScoreBadge(formData.performanceScore)}>
                {formData.performanceScore} Punkte
              </Badge>
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="mobileLoadTime">Mobile Ladezeit (Sekunden)</Label>
                <Input
                  id="mobileLoadTime"
                  type="number"
                  step="0.1"
                  value={formData.mobileLoadTime}
                  onChange={(e) => updateField('mobileLoadTime', parseFloat(e.target.value))}
                  className="mt-1"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Ideal: ≤ 1.5s (15 Punkte), Gut: ≤ 2.5s (12 Punkte)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="lcp">LCP (Sekunden)</Label>
                  <Input
                    id="lcp"
                    type="number"
                    step="0.1"
                    value={formData.coreWebVitals.lcp}
                    onChange={(e) => updateField('coreWebVitals', {
                      ...formData.coreWebVitals,
                      lcp: parseFloat(e.target.value)
                    })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Largest Contentful Paint
                  </p>
                </div>

                <div>
                  <Label htmlFor="fid">FID (Millisekunden)</Label>
                  <Input
                    id="fid"
                    type="number"
                    step="10"
                    value={formData.coreWebVitals.fid}
                    onChange={(e) => updateField('coreWebVitals', {
                      ...formData.coreWebVitals,
                      fid: parseFloat(e.target.value)
                    })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    First Input Delay
                  </p>
                </div>

                <div>
                  <Label htmlFor="cls">CLS</Label>
                  <Input
                    id="cls"
                    type="number"
                    step="0.01"
                    value={formData.coreWebVitals.cls}
                    onChange={(e) => updateField('coreWebVitals', {
                      ...formData.coreWebVitals,
                      cls: parseFloat(e.target.value)
                    })}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Cumulative Layout Shift
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="mobileFirstIndex"
                  checked={formData.mobileFirstIndex}
                  onCheckedChange={(checked) => updateField('mobileFirstIndex', checked)}
                />
                <Label htmlFor="mobileFirstIndex">Mobile-First Indexing aktiv</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Touch Optimization */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              👆 Touch-Optimierung
              <Badge variant={getScoreBadge(formData.touchOptimizationScore)}>
                {formData.touchOptimizationScore} Punkte
              </Badge>
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="buttonSize">Button-Größen</Label>
                  <Select
                    value={formData.buttonSize}
                    onValueChange={(value: 'touch-friendly' | 'too-small' | 'acceptable') => 
                      updateField('buttonSize', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="touch-friendly">Touch-freundlich (10 Punkte)</SelectItem>
                      <SelectItem value="acceptable">Akzeptabel (6 Punkte)</SelectItem>
                      <SelectItem value="too-small">Zu klein (2 Punkte)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tapDistance">Tap-Abstände</Label>
                  <Select
                    value={formData.tapDistance}
                    onValueChange={(value: 'sufficient' | 'insufficient' | 'good') => 
                      updateField('tapDistance', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="good">Ausgezeichnet (10 Punkte)</SelectItem>
                      <SelectItem value="sufficient">Ausreichend (6 Punkte)</SelectItem>
                      <SelectItem value="insufficient">Unzureichend (4 Punkte)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scrollBehavior">Scroll-Verhalten</Label>
                  <Select
                    value={formData.scrollBehavior}
                    onValueChange={(value: 'smooth' | 'jerky' | 'acceptable') => 
                      updateField('scrollBehavior', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smooth">Flüssig (10 Punkte)</SelectItem>
                      <SelectItem value="acceptable">Akzeptabel (6 Punkte)</SelectItem>
                      <SelectItem value="jerky">Ruckelig (2 Punkte)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="navigationMobileFriendly"
                    checked={formData.navigationMobileFriendly}
                    onCheckedChange={(checked) => updateField('navigationMobileFriendly', checked)}
                  />
                  <Label htmlFor="navigationMobileFriendly">Navigation mobilfreundlich</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="readableTextSize"
                    checked={formData.readableTextSize}
                    onCheckedChange={(checked) => updateField('readableTextSize', checked)}
                  />
                  <Label htmlFor="readableTextSize">Lesbare Textgröße</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="noHorizontalScrolling"
                    checked={formData.noHorizontalScrolling}
                    onCheckedChange={(checked) => updateField('noHorizontalScrolling', checked)}
                  />
                  <Label htmlFor="noHorizontalScrolling">Kein horizontales Scrollen</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="appropriateInteractiveElements"
                    checked={formData.appropriateInteractiveElements}
                    onCheckedChange={(checked) => updateField('appropriateInteractiveElements', checked)}
                  />
                  <Label htmlFor="appropriateInteractiveElements">Passende interaktive Elemente</Label>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notizen */}
          <div>
            <Label htmlFor="notes">Zusätzliche Notizen</Label>
            <Textarea
              id="notes"
              placeholder="Weitere Beobachtungen zur mobilen Optimierung..."
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>

          {/* AI Review Checkbox */}
          <AIReviewCheckbox 
            categoryName="Mobile-Optimierung"
            isReviewed={reviewStatus['mobile-optimization']?.isReviewed || false}
            onReviewChange={(checked) => updateReviewStatus('mobile-optimization', checked)}
          />

          {/* Speichern Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} size="lg" className="gap-2">
              <Save className="h-4 w-4" />
              Änderungen speichern
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Score-Übersicht */}
      <Card>
        <CardHeader>
          <CardTitle>Bewertungsübersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-medium">Responsive Design:</span>
              <Badge variant={getScoreBadge(formData.responsiveDesignScore)}>
                {formData.responsiveDesignScore} / 35 Punkte
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Mobile Performance:</span>
              <Badge variant={getScoreBadge(formData.performanceScore)}>
                {formData.performanceScore} / 35 Punkte
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Touch-Optimierung:</span>
              <Badge variant={getScoreBadge(formData.touchOptimizationScore)}>
                {formData.touchOptimizationScore} / 30 Punkte
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Gesamtbewertung:</span>
              <Badge variant={getScoreBadge(formData.overallScore)} className="text-lg px-3 py-1">
                {formData.overallScore}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualMobileInput;
