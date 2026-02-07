import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Clock, Phone, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

export interface QuoteResponseData {
  responseTime: string; // '1-hour', '2-4-hours', '4-8-hours', '1-day', '2-3-days', 'over-3-days', 'no-response-2-days', 'no-response'
  contactMethods: {
    phone: boolean;
    email: boolean;
    contactForm: boolean;
    whatsapp: boolean;
    messenger: boolean;
  };
  automaticConfirmation: boolean;
  responseQuality: string; // 'excellent', 'good', 'average', 'poor'
  followUpProcess: boolean;
  availabilityHours: string; // 'business-hours', 'extended-hours', '24-7'
  personalContact: boolean;
  notes?: string;
}

interface QuoteResponseInputProps {
  data?: QuoteResponseData;
  onDataChange: (data: QuoteResponseData) => void;
}

const QuoteResponseInput: React.FC<QuoteResponseInputProps> = ({ data, onDataChange }) => {
  const [formData, setFormData] = useState<QuoteResponseData>(data || {
    responseTime: '',
    contactMethods: {
      phone: false,
      email: false,
      contactForm: false,
      whatsapp: false,
      messenger: false,
    },
    automaticConfirmation: false,
    responseQuality: '',
    followUpProcess: false,
    availabilityHours: '',
    personalContact: false,
    notes: ''
  });

  const handleInputChange = (field: keyof QuoteResponseData, value: any) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);
  };

  const handleContactMethodChange = (method: keyof QuoteResponseData['contactMethods'], checked: boolean) => {
    const updatedData = {
      ...formData,
      contactMethods: {
        ...formData.contactMethods,
        [method]: checked
      }
    };
    setFormData(updatedData);
  };

  const handleSave = () => {
    onDataChange(formData);
  };

  const calculateScore = () => {
    // Wenn keine Antwort erhalten wurde, ist der Score maximal 10%
    if (formData.responseTime === 'no-response') {
      return 10;
    }
    
    // Nach 2 Tagen keine Reaktion ist kritisch - maximal 15%
    if (formData.responseTime === 'no-response-2-days') {
      return 15;
    }
    
    let score = 0;
    
    // Reaktionszeit (40% der Bewertung)
    switch (formData.responseTime) {
      case '1-hour': score += 40; break;
      case '2-4-hours': score += 35; break;
      case '4-8-hours': score += 30; break;
      case '1-day': score += 20; break;
      case '2-3-days': score += 10; break;
      case 'over-3-days': score += 5; break;
    }
    
    // Kontaktmöglichkeiten (20% der Bewertung)
    const contactCount = Object.values(formData.contactMethods).filter(Boolean).length;
    score += Math.min(20, contactCount * 4);
    
    // Antwortqualität (20% der Bewertung)
    switch (formData.responseQuality) {
      case 'excellent': score += 20; break;
      case 'good': score += 15; break;
      case 'average': score += 10; break;
      case 'poor': score += 5; break;
    }
    
    // Weitere Faktoren (20% der Bewertung)
    if (formData.automaticConfirmation) score += 5;
    if (formData.followUpProcess) score += 5;
    if (formData.personalContact) score += 5;
    if (formData.availabilityHours === '24-7') score += 5;
    else if (formData.availabilityHours === 'extended-hours') score += 3;
    else if (formData.availabilityHours === 'business-hours') score += 2;
    
    return Math.min(100, score);
  };

  const score = calculateScore();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-600';  // 90-100% gold
    if (score >= 60) return 'text-green-600';   // 60-89% green
    return 'text-red-600';                      // 0-59% red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Ausgezeichnet';
    if (score >= 60) return 'Gut';
    if (score >= 40) return 'Verbesserungsbedarf';
    return 'Kritisch';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Reaktion auf Angebotsanfragen
        </CardTitle>
        <CardDescription>
          Bewerten Sie, wie schnell und professionell auf Kundenanfragen reagiert wird
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        {score > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">Anfragebearbeitung-Score</h4>
                <p className="text-sm text-gray-600">Basierend auf Reaktionszeit und Service-Qualität</p>
              </div>
              <div className="text-right">
                <div className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</div>
                <div className="text-sm text-gray-500">{getScoreLabel(score)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Reaktionszeit */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Durchschnittliche Reaktionszeit auf Anfragen
          </Label>
          <Select 
            value={formData.responseTime} 
            onValueChange={(value) => handleInputChange('responseTime', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Reaktionszeit auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-hour">Innerhalb 1 Stunde</SelectItem>
              <SelectItem value="2-4-hours">2-4 Stunden</SelectItem>
              <SelectItem value="4-8-hours">4-8 Stunden</SelectItem>
              <SelectItem value="1-day">1 Tag</SelectItem>
              <SelectItem value="2-3-days">2-3 Tage</SelectItem>
              <SelectItem value="over-3-days">Über 3 Tage</SelectItem>
              <SelectItem value="no-response-2-days" className="text-orange-600">Nach 2 Tagen keine Reaktion</SelectItem>
              <SelectItem value="no-response" className="text-destructive">Keine Antwort erhalten</SelectItem>
            </SelectContent>
          </Select>
          {formData.responseTime === 'no-response-2-days' && (
            <div className="bg-orange-100 border border-orange-300 p-3 rounded-lg flex items-start gap-2 mt-2">
              <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-orange-700">
                <strong>Kritisch:</strong> Keine Reaktion innerhalb von 2 Tagen signalisiert mangelnden Kundenservice und führt häufig zu Auftragsverlust. 
                Kunden erwarten zeitnahe Rückmeldungen. Der maximale Score ist auf 15% begrenzt.
              </p>
            </div>
          )}
          {formData.responseTime === 'no-response' && (
            <div className="bg-destructive/10 border border-destructive/30 p-3 rounded-lg flex items-start gap-2 mt-2">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <p className="text-sm text-destructive">
                <strong>Sehr kritisch:</strong> Keine Antwort auf eine Kundenanfrage ist ein gravierendes Qualitätsproblem. 
                Der maximale Score ist auf 10% begrenzt.
              </p>
            </div>
          )}
        </div>

        {/* Kontaktmöglichkeiten */}
        <div className="space-y-3">
          <Label>Verfügbare Kontaktmöglichkeiten</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'phone', label: 'Telefon', icon: Phone },
              { key: 'email', label: 'E-Mail', icon: Mail },
              { key: 'contactForm', label: 'Kontaktformular', icon: MessageSquare },
              { key: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
              { key: 'messenger', label: 'Messenger', icon: MessageSquare },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={formData.contactMethods[key as keyof typeof formData.contactMethods]}
                  onCheckedChange={(checked) => 
                    handleContactMethodChange(key as keyof typeof formData.contactMethods, !!checked)
                  }
                />
                <Label htmlFor={key} className="flex items-center gap-1 text-sm">
                  <Icon className="h-3 w-3" />
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Service-Qualität */}
        <div className="space-y-2">
          <Label>Qualität der ersten Antwort</Label>
          <Select 
            value={formData.responseQuality} 
            onValueChange={(value) => handleInputChange('responseQuality', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Antwortqualität bewerten" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">Ausgezeichnet (detailliert, professionell)</SelectItem>
              <SelectItem value="good">Gut (informativ, höflich)</SelectItem>
              <SelectItem value="average">Durchschnittlich (Standard-Antwort)</SelectItem>
              <SelectItem value="poor">Schlecht (unprofessionell, vage)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Erreichbarkeit */}
        <div className="space-y-2">
          <Label>Erreichbarkeitszeiten</Label>
          <Select 
            value={formData.availabilityHours} 
            onValueChange={(value) => handleInputChange('availabilityHours', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Erreichbarkeit auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="business-hours">Geschäftszeiten (Mo-Fr 8-17 Uhr)</SelectItem>
              <SelectItem value="extended-hours">Erweiterte Zeiten (Mo-Sa 7-20 Uhr)</SelectItem>
              <SelectItem value="24-7">24/7 Erreichbarkeit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Zusätzliche Services */}
        <div className="space-y-3">
          <Label>Zusätzliche Service-Features</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="automaticConfirmation"
                checked={formData.automaticConfirmation}
                onCheckedChange={(checked) => handleInputChange('automaticConfirmation', !!checked)}
              />
              <Label htmlFor="automaticConfirmation" className="flex items-center gap-1 text-sm">
                <CheckCircle className="h-3 w-3" />
                Automatische Eingangsbestätigung
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="followUpProcess"
                checked={formData.followUpProcess}
                onCheckedChange={(checked) => handleInputChange('followUpProcess', !!checked)}
              />
              <Label htmlFor="followUpProcess" className="text-sm">
                Strukturierter Nachfass-Prozess
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="personalContact"
                checked={formData.personalContact}
                onCheckedChange={(checked) => handleInputChange('personalContact', !!checked)}
              />
              <Label htmlFor="personalContact" className="text-sm">
                Persönlicher Ansprechpartner
              </Label>
            </div>
          </div>
        </div>

        {/* Notizen */}
        <div className="space-y-2">
          <Label htmlFor="notes">Zusätzliche Notizen</Label>
          <Textarea
            id="notes"
            placeholder="Besonderheiten im Anfrageprozess..."
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        {/* Bewertung */}
        {score > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Bewertungsdetails</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Reaktionszeit: {formData.responseTime === '1-hour' ? '40/40' : formData.responseTime === '2-4-hours' ? '35/40' : '≤30/40'}</div>
              <div>Kontaktmöglichkeiten: {Math.min(20, Object.values(formData.contactMethods).filter(Boolean).length * 4)}/20</div>
              <div>Antwortqualität: {formData.responseQuality === 'excellent' ? '20/20' : formData.responseQuality === 'good' ? '15/20' : '≤10/20'}</div>
              <div>Service-Features: {[formData.automaticConfirmation, formData.followUpProcess, formData.personalContact].filter(Boolean).length * 5 + (formData.availabilityHours === '24-7' ? 5 : formData.availabilityHours === 'extended-hours' ? 3 : 2)}/20</div>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          <MessageSquare className="h-4 w-4 mr-2" />
          Anfragebearbeitung-Daten speichern
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuoteResponseInput;