import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AIReviewCheckbox } from './AIReviewCheckbox';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Plus, Trash2, Shield, AlertTriangle, Cookie } from 'lucide-react';
import { ManualDataPrivacyData } from '@/hooks/useManualData';

interface ManualDataPrivacyInputProps {
  data: ManualDataPrivacyData | null;
  onDataChange: (data: ManualDataPrivacyData) => void;
  privacyData?: any; // Benötigt für Violations-Check
}

const ManualDataPrivacyInput: React.FC<ManualDataPrivacyInputProps> = ({ data, onDataChange, privacyData }) => {
  const { reviewStatus, updateReviewStatus } = useAnalysisContext();
  
  // Berechne maximalen erlaubten Score basierend auf kritischen Violations
  const getMaxAllowedScore = () => {
    if (!privacyData?.violations) return 100;
    
    const deselected = data?.deselectedViolations || [];
    let criticalCount = 0;
    
    privacyData.violations.forEach((v: any, i: number) => {
      if (v.severity === 'critical' && !deselected.includes(`auto-${i}`)) {
        criticalCount++;
      }
    });
    
    if (data?.customViolations) {
      data.customViolations.forEach((v: any) => {
        if (v.severity === 'critical') criticalCount++;
      });
    }
    
    if (criticalCount >= 3) return 20;
    if (criticalCount === 2) return 35;
    if (criticalCount === 1) return 59;
    return 100;
  };
  
  const maxScore = getMaxAllowedScore();
  const [currentData, setCurrentData] = useState<ManualDataPrivacyData>(data || {
    hasSSL: true,
    cookiePolicy: false,
    privacyPolicy: false,
    gdprCompliant: false,
    cookieConsent: false,
    dataProcessingAgreement: false,
    dataSubjectRights: false,
    deselectedViolations: [],
    customViolations: [],
    manualCookies: [],
    overallScore: undefined,
    notes: ''
  });
  
  const [newViolation, setNewViolation] = useState({
    description: '',
    severity: 'medium' as 'high' | 'medium' | 'low',
    category: '',
    article: '',
    recommendation: ''
  });

  const [newCookie, setNewCookie] = useState({
    name: '',
    category: 'strictly-necessary' as 'strictly-necessary' | 'analytics' | 'marketing' | 'functional',
    purpose: ''
  });

  // Sync with prop data when it changes
  useEffect(() => {
    if (data) {
      setCurrentData(data);
    }
  }, [data]);

  const updateData = (updates: Partial<ManualDataPrivacyData>) => {
    const updatedData = { ...currentData, ...updates };
    setCurrentData(updatedData);
    onDataChange(updatedData);
  };

  const addCustomViolation = () => {
    if (newViolation.description && newViolation.category) {
      const violation = {
        id: `custom-${Date.now()}`,
        ...newViolation
      };
      
      updateData({
        customViolations: [...currentData.customViolations, violation]
      });
      
      setNewViolation({
        description: '',
        severity: 'medium',
        category: '',
        article: '',
        recommendation: ''
      });
    }
  };

  const removeCustomViolation = (id: string) => {
    updateData({
      customViolations: currentData.customViolations.filter(v => v.id !== id)
    });
  };

  const addManualCookie = () => {
    if (newCookie.name) {
      const cookie = {
        id: `manual-cookie-${Date.now()}`,
        ...newCookie
      };
      
      updateData({
        manualCookies: [...(currentData.manualCookies || []), cookie]
      });
      
      setNewCookie({
        name: '',
        category: 'strictly-necessary',
        purpose: ''
      });
    }
  };

  const removeManualCookie = (id: string) => {
    updateData({
      manualCookies: (currentData.manualCookies || []).filter(c => c.id !== id)
    });
  };

  const getCookieCategoryLabel = (category: string) => {
    switch (category) {
      case 'strictly-necessary': return 'Notwendig';
      case 'analytics': return 'Analytics';
      case 'marketing': return 'Marketing';
      case 'functional': return 'Funktional';
      default: return category;
    }
  };

  const getCookieCategoryColor = (category: string) => {
    switch (category) {
      case 'strictly-necessary': return 'default';
      case 'analytics': return 'secondary';
      case 'marketing': return 'destructive';
      case 'functional': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <>
      <Card className="border-accent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-accent">
            <Shield className="h-5 w-5" />
            Manuelle Datenschutz-Eingabe
          </CardTitle>
        </CardHeader>
      <CardContent className="space-y-6">
        {/* DSGVO Compliance Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">DSGVO-Grundlagen</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="ssl">SSL-Verschlüsselung</Label>
              <Switch
                id="ssl"
                checked={currentData.hasSSL}
                onCheckedChange={(checked) => updateData({ hasSSL: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="privacy-policy">Datenschutzerklärung vorhanden</Label>
              <Switch
                id="privacy-policy"
                checked={currentData.privacyPolicy}
                onCheckedChange={(checked) => updateData({ privacyPolicy: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="cookie-policy">Cookie-Richtlinie</Label>
              <Switch
                id="cookie-policy"
                checked={currentData.cookiePolicy}
                onCheckedChange={(checked) => updateData({ cookiePolicy: checked })}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Erweiterte Compliance</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="gdpr-compliant">DSGVO-konform</Label>
              <Switch
                id="gdpr-compliant"
                checked={currentData.gdprCompliant}
                onCheckedChange={(checked) => updateData({ gdprCompliant: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="cookie-consent">Cookie-Consent</Label>
              <Switch
                id="cookie-consent"
                checked={currentData.cookieConsent}
                onCheckedChange={(checked) => updateData({ cookieConsent: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="data-processing">Auftragsverarbeitung</Label>
              <Switch
                id="data-processing"
                checked={currentData.dataProcessingAgreement}
                onCheckedChange={(checked) => updateData({ dataProcessingAgreement: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="subject-rights">Betroffenenrechte</Label>
              <Switch
                id="subject-rights"
                checked={currentData.dataSubjectRights}
                onCheckedChange={(checked) => updateData({ dataSubjectRights: checked })}
              />
            </div>
          </div>
        </div>

        {/* Overall Score Slider */}
        <div className="space-y-2">
          <Label htmlFor="overall-score">Gesamt-Score überschreiben (0-{maxScore})</Label>
          {maxScore < 100 && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-2">
              <p className="text-xs text-amber-800">
                ⚠️ Score ist auf max. {maxScore}% begrenzt durch {privacyData?.violations?.filter((v: any, i: number) => v.severity === 'critical' && !(data?.deselectedViolations || []).includes(`auto-${i}`)).length || 0} kritische Fehler
              </p>
            </div>
          )}
          <div className="px-2">
            <Slider
              id="overall-score"
              value={[Math.min(currentData.overallScore ?? 50, maxScore)]}
              onValueChange={(value) => {
                const cappedValue = Math.min(value[0], maxScore);
                updateData({ overallScore: cappedValue });
              }}
              max={maxScore}
              min={0}
              step={1}
              className="w-full"
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Aktueller Score: {currentData.overallScore ?? 'Automatisch berechnet'}/{maxScore}
          </div>
        </div>

        {/* Manual Cookies Input */}
        <div className="space-y-4 border-t pt-6">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <Cookie className="h-4 w-4" />
            Manuelle Cookie-Eingabe
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cookie-name">Cookie-Name *</Label>
              <Input
                id="cookie-name"
                placeholder="z.B. _ga, _fbp, session_id"
                value={newCookie.name}
                onChange={(e) => setNewCookie(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cookie-category">Kategorie *</Label>
              <Select 
                value={newCookie.category} 
                onValueChange={(value: 'strictly-necessary' | 'analytics' | 'marketing' | 'functional') => 
                  setNewCookie(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strictly-necessary">Notwendig (ohne Einwilligung)</SelectItem>
                  <SelectItem value="analytics">Analytics (Einwilligung erforderlich)</SelectItem>
                  <SelectItem value="marketing">Marketing (Einwilligung erforderlich)</SelectItem>
                  <SelectItem value="functional">Funktional (Einwilligung erforderlich)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cookie-purpose">Zweck (optional)</Label>
            <Input
              id="cookie-purpose"
              placeholder="z.B. Speichert Benutzer-Session, Tracking von Nutzerverhalten"
              value={newCookie.purpose}
              onChange={(e) => setNewCookie(prev => ({ ...prev, purpose: e.target.value }))}
            />
          </div>
          
          <Button 
            onClick={addManualCookie}
            disabled={!newCookie.name}
            className="w-full"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Cookie hinzufügen
          </Button>
        </div>

        {/* Display Manual Cookies */}
        {(currentData.manualCookies || []).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Hinzugefügte Cookies ({(currentData.manualCookies || []).length})</h4>
            <div className="grid grid-cols-1 gap-3">
              {(currentData.manualCookies || []).map((cookie) => (
                <div key={cookie.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
                  <Cookie className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium text-sm">{cookie.name}</span>
                      <Badge variant={getCookieCategoryColor(cookie.category) as any}>
                        {getCookieCategoryLabel(cookie.category)}
                      </Badge>
                    </div>
                    {cookie.purpose && (
                      <p className="text-xs text-muted-foreground">{cookie.purpose}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeManualCookie(cookie.id)}
                    className="text-destructive hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Violations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Eigene Datenschutz-Verstöße hinzufügen
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="violation-category">Kategorie</Label>
              <Input
                id="violation-category"
                placeholder="z.B. Cookie-Tracking"
                value={newViolation.category}
                onChange={(e) => setNewViolation(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="violation-severity">Schweregrad</Label>
              <Select 
                value={newViolation.severity} 
                onValueChange={(value: 'high' | 'medium' | 'low') => 
                  setNewViolation(prev => ({ ...prev, severity: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Kritisch</SelectItem>
                  <SelectItem value="medium">Wichtig</SelectItem>
                  <SelectItem value="low">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="violation-description">Beschreibung</Label>
            <Textarea
              id="violation-description"
              placeholder="Beschreibung des Datenschutz-Verstoßes..."
              value={newViolation.description}
              onChange={(e) => setNewViolation(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="violation-article">Rechtsgrundlage (optional)</Label>
              <Input
                id="violation-article"
                placeholder="z.B. Art. 6 DSGVO"
                value={newViolation.article}
                onChange={(e) => setNewViolation(prev => ({ ...prev, article: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="violation-recommendation">Empfehlung (optional)</Label>
              <Input
                id="violation-recommendation"
                placeholder="Lösungsvorschlag..."
                value={newViolation.recommendation}
                onChange={(e) => setNewViolation(prev => ({ ...prev, recommendation: e.target.value }))}
              />
            </div>
          </div>
          
          <Button 
            onClick={addCustomViolation}
            disabled={!newViolation.description || !newViolation.category}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Verstoß hinzufügen
          </Button>
        </div>

        {/* Display Custom Violations */}
        {currentData.customViolations.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Eigene Verstöße</h4>
            {currentData.customViolations.map((violation) => (
              <div key={violation.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={
                      violation.severity === 'high' ? 'destructive' : 
                      violation.severity === 'medium' ? 'secondary' : 'outline'
                    }>
                      {violation.severity === 'high' ? 'Kritisch' : 
                       violation.severity === 'medium' ? 'Wichtig' : 'Info'}
                    </Badge>
                    <span className="font-medium text-sm">{violation.category}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{violation.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomViolation(violation.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="privacy-notes">Zusätzliche Notizen</Label>
          <Textarea
            id="privacy-notes"
            placeholder="Weitere Anmerkungen zum Datenschutz..."
            value={currentData.notes || ''}
            onChange={(e) => updateData({ notes: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
    
    <AIReviewCheckbox
      categoryName="Datenschutz (DSGVO)"
      isReviewed={reviewStatus['Datenschutz (DSGVO)']?.isReviewed || false}
      onReviewChange={(reviewed) => updateReviewStatus('Datenschutz (DSGVO)', reviewed)}
    />
    </>
  );
};

export default ManualDataPrivacyInput;