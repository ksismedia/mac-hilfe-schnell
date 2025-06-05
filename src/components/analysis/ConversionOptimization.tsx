import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Phone, Mail, Calendar, MousePointer, CreditCard } from 'lucide-react';

interface ConversionOptimizationProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

const ConversionOptimization: React.FC<ConversionOptimizationProps> = ({ url, industry }) => {
  // Simulierte Conversion-Optimierung-Daten
  const conversionData = {
    overallScore: 67,
    callToActions: {
      score: 72,
      total: 8,
      visible: 6,
      effective: 4,
      types: [
        { type: "Telefon", count: 3, placement: "gut", effectiveness: 85 },
        { type: "Kontaktformular", count: 2, placement: "befriedigend", effectiveness: 60 },
        { type: "E-Mail", count: 2, placement: "gut", effectiveness: 70 },
        { type: "Termin buchen", count: 1, placement: "sehr gut", effectiveness: 90 }
      ]
    },
    contactMethods: {
      score: 78,
      phone: { visible: true, prominent: true, clickable: true },
      email: { visible: true, prominent: false, clickable: true },
      form: { present: true, fields: 5, mobile_friendly: true },
      chat: { present: false, hours: "0" },
      callback: { present: false }
    },
    userJourney: {
      score: 64,
      landingPageOptimization: 70,
      navigationClarity: 75,
      informationHierarchy: 68,
      trustElements: 60,
      urgencyElements: 45
    },
    conversionFunnels: [
      { 
        name: "Kontaktformular", 
        visitors: 1000, 
        interactions: 120, 
        completions: 35, 
        rate: "3.5%" 
      },
      { 
        name: "Telefonanruf", 
        visitors: 1000, 
        interactions: 80, 
        completions: 65, 
        rate: "6.5%" 
      },
      { 
        name: "E-Mail Anfrage", 
        visitors: 1000, 
        interactions: 45, 
        completions: 28, 
        rate: "2.8%" 
      }
    ],
    technicalOptimization: {
      score: 71,
      loadSpeed: 2.8,
      mobileResponsive: true,
      formValidation: true,
      errorHandling: false,
      thankYouPages: true
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getEffectivenessBadge = (effectiveness: number) => {
    if (effectiveness >= 80) return "default";
    if (effectiveness >= 60) return "secondary";
    return "destructive";
  };

  const getPlacementBadge = (placement: string) => {
    switch (placement) {
      case "sehr gut": return "default";
      case "gut": return "default";
      case "befriedigend": return "secondary";
      default: return "destructive";
    }
  };

  const getConversionRateColor = (rate: string) => {
    const numRate = parseFloat(rate);
    if (numRate >= 5) return "text-green-600";
    if (numRate >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Conversion-Optimierung
            <Badge variant={getScoreBadge(conversionData.overallScore)}>
              {conversionData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Analyse der Konversionsrate und Optimierungspotentiale für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Call-to-Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Call-to-Actions (CTAs)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Gesamt CTAs:</span>
                    <span className="font-medium">{conversionData.callToActions.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sichtbare CTAs:</span>
                    <span className="font-medium">{conversionData.callToActions.visible}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Effektive CTAs:</span>
                    <span className="font-medium">{conversionData.callToActions.effective}</span>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">CTA Effektivität</span>
                    <span className={`font-bold ${getScoreColor(conversionData.callToActions.score)}`}>
                      {conversionData.callToActions.score}/100
                    </span>
                  </div>
                  <Progress value={conversionData.callToActions.score} className="h-2" />
                </div>
              </div>

              <div className="space-y-3">
                {conversionData.callToActions.types.map((cta, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{cta.type}</span>
                        <Badge variant="outline">
                          {cta.count}x
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPlacementBadge(cta.placement)}>
                          {cta.placement}
                        </Badge>
                        <Badge variant={getEffectivenessBadge(cta.effectiveness)}>
                          {cta.effectiveness}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kontaktmöglichkeiten */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Kontaktmöglichkeiten
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon
                    </span>
                    <div className="flex gap-1">
                      <Badge variant={conversionData.contactMethods.phone.visible ? "default" : "destructive"}>
                        {conversionData.contactMethods.phone.visible ? "Sichtbar" : "Versteckt"}
                      </Badge>
                      <Badge variant={conversionData.contactMethods.phone.prominent ? "default" : "secondary"}>
                        {conversionData.contactMethods.phone.prominent ? "Prominent" : "Unauffällig"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      E-Mail
                    </span>
                    <div className="flex gap-1">
                      <Badge variant={conversionData.contactMethods.email.visible ? "default" : "destructive"}>
                        {conversionData.contactMethods.email.visible ? "Sichtbar" : "Versteckt"}
                      </Badge>
                      <Badge variant={conversionData.contactMethods.email.prominent ? "default" : "secondary"}>
                        {conversionData.contactMethods.email.prominent ? "Prominent" : "Unauffällig"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Kontaktformular</span>
                    <Badge variant={conversionData.contactMethods.form.present ? "default" : "destructive"}>
                      {conversionData.contactMethods.form.present ? `${conversionData.contactMethods.form.fields} Felder` : "Nicht vorhanden"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">Live Chat</span>
                    <Badge variant={conversionData.contactMethods.chat.present ? "default" : "destructive"}>
                      {conversionData.contactMethods.chat.present ? "Aktiv" : "Nicht verfügbar"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnels */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Conversion-Funnels
              </CardTitle>
              <CardDescription>
                Analyse der verschiedenen Konversionspfade
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionData.conversionFunnels.map((funnel, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{funnel.name}</h4>
                      <Badge variant={getEffectivenessBadge(parseFloat(funnel.rate))} className="text-lg">
                        {funnel.rate}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{funnel.visitors}</div>
                        <p className="text-gray-600">Besucher</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-600">{funnel.interactions}</div>
                        <p className="text-gray-600">Interaktionen</p>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{funnel.completions}</div>
                        <p className="text-gray-600">Conversions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Journey */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">User Journey Optimierung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Landing Page Optimierung</span>
                  <div className="flex items-center gap-2">
                    <Progress value={conversionData.userJourney.landingPageOptimization} className="w-20 h-2" />
                    <span className="text-sm font-medium">{conversionData.userJourney.landingPageOptimization}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Navigation Klarheit</span>
                  <div className="flex items-center gap-2">
                    <Progress value={conversionData.userJourney.navigationClarity} className="w-20 h-2" />
                    <span className="text-sm font-medium">{conversionData.userJourney.navigationClarity}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Informations-Hierarchie</span>
                  <div className="flex items-center gap-2">
                    <Progress value={conversionData.userJourney.informationHierarchy} className="w-20 h-2" />
                    <span className="text-sm font-medium">{conversionData.userJourney.informationHierarchy}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Vertrauenselemente</span>
                  <div className="flex items-center gap-2">
                    <Progress value={conversionData.userJourney.trustElements} className="w-20 h-2" />
                    <span className="text-sm font-medium">{conversionData.userJourney.trustElements}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dringlichkeits-Elemente</span>
                  <div className="flex items-center gap-2">
                    <Progress value={conversionData.userJourney.urgencyElements} className="w-20 h-2" />
                    <span className="text-sm font-medium">{conversionData.userJourney.urgencyElements}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technische Optimierung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Technische Optimierung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Ladegeschwindigkeit:</span>
                    <span className="font-medium">{conversionData.technicalOptimization.loadSpeed}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mobile Responsive:</span>
                    <Badge variant={conversionData.technicalOptimization.mobileResponsive ? "default" : "destructive"}>
                      {conversionData.technicalOptimization.mobileResponsive ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Formular-Validierung:</span>
                    <Badge variant={conversionData.technicalOptimization.formValidation ? "default" : "destructive"}>
                      {conversionData.technicalOptimization.formValidation ? "Implementiert" : "Fehlt"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Danke-Seiten:</span>
                    <Badge variant={conversionData.technicalOptimization.thankYouPages ? "default" : "destructive"}>
                      {conversionData.technicalOptimization.thankYouPages ? "Vorhanden" : "Fehlen"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionOptimization;
