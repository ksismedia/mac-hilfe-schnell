
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Phone, Mail, Calendar, MousePointer, CreditCard, TrendingUp, Users, Eye, Clock, MessageSquare } from 'lucide-react';
import { getScoreTextDescription } from '@/utils/scoreTextUtils';

interface ConversionOptimizationProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
}

const ConversionOptimization: React.FC<ConversionOptimizationProps> = ({ url, industry }) => {
  // Branchenspezifische Conversion-Strategien
  const industryStrategies = {
    shk: {
      primaryGoals: ['Notdienst-Anrufe', 'Wartungsverträge', 'Kostenvoranschläge'],
      seasonalPeaks: ['Winter (Heizung)', 'Sommer (Klima)', 'Frühjahr (Wartung)'],
      urgencyFactors: ['24h Notdienst', 'Soforttermine', 'Garantieleistungen']
    },
    maler: {
      primaryGoals: ['Kostenvoranschläge', 'Beratungstermine', 'Farbkonzepte'],
      seasonalPeaks: ['Frühjahr', 'Herbst', 'vor Umzügen'],
      urgencyFactors: ['Kostenlose Beratung', 'Soforttermine', 'Festpreise']
    },
    elektriker: {
      primaryGoals: ['Störungsbeseitigung', 'Installationsanfragen', 'Smart Home Beratung'],
      seasonalPeaks: ['Ganzjährig', 'Weihnachtszeit', 'Umzugszeiten'],
      urgencyFactors: ['Notdienst 24/7', 'Sicherheitschecks', 'Soforttermine']
    },
    dachdecker: {
      primaryGoals: ['Dachinspektion', 'Reparaturanfragen', 'Dachsanierung'],
      seasonalPeaks: ['Nach Stürmen', 'Frühjahr', 'vor Winter'],
      urgencyFactors: ['Sturmschäden', 'Leckagen', 'Notdienst']
    },
    stukateur: {
      primaryGoals: ['Sanierungsanfragen', 'Kostenvoranschläge', 'Fassadenplanung'],
      seasonalPeaks: ['Frühjahr', 'Sommer', 'Sanierungszeit'],
      urgencyFactors: ['Feuchteschäden', 'Kostenlose Besichtigung', 'Festpreise']
    },
    planungsbuero: {
      primaryGoals: ['Planungsanfragen', 'Beratungstermine', 'Energieaudits'],
      seasonalPeaks: ['Planungszeit', 'Förderphasen', 'Genehmigungszeiten'],
      urgencyFactors: ['Förderfristen', 'Kostenlose Erstberatung', 'Termingarantie']
    }
  };

  const currentStrategy = industryStrategies[industry];

  // Deutlich erweiterte simulierte Conversion-Optimierung-Daten
  const conversionData = {
    overallScore: 67,
    callToActions: {
      score: 72,
      total: 12,
      visible: 9,
      effective: 6,
      aboveFold: 4,
      types: [
        { 
          type: "Telefon", 
          count: 4, 
          placement: "sehr gut", 
          effectiveness: 85,
          clickRate: "12.5%",
          conversionRate: "68%",
          mobileOptimized: true,
          trackingSetup: true
        },
        { 
          type: "Kontaktformular", 
          count: 3, 
          placement: "gut", 
          effectiveness: 60,
          clickRate: "8.2%",
          conversionRate: "45%",
          mobileOptimized: true,
          trackingSetup: false
        },
        { 
          type: "E-Mail", 
          count: 2, 
          placement: "befriedigend", 
          effectiveness: 45,
          clickRate: "3.1%",
          conversionRate: "25%",
          mobileOptimized: false,
          trackingSetup: false
        },
        { 
          type: "WhatsApp", 
          count: 1, 
          placement: "sehr gut", 
          effectiveness: 78,
          clickRate: "15.3%",
          conversionRate: "72%",
          mobileOptimized: true,
          trackingSetup: false
        },
        { 
          type: "Rückruf Service", 
          count: 1, 
          placement: "gut", 
          effectiveness: 82,
          clickRate: "6.8%",
          conversionRate: "85%",
          mobileOptimized: true,
          trackingSetup: true
        },
        { 
          type: "Termin buchen", 
          count: 1, 
          placement: "sehr gut", 
          effectiveness: 90,
          clickRate: "4.2%",
          conversionRate: "92%",
          mobileOptimized: true,
          trackingSetup: true
        }
      ]
    },
    contactMethods: {
      score: 78,
      phone: { 
        visible: true, 
        prominent: true, 
        clickable: true, 
        tracked: true,
        responseTime: "< 3 Klingeltöne",
        availability: "Mo-Fr 7-18h, Sa 8-14h"
      },
      email: { 
        visible: true, 
        prominent: false, 
        clickable: true, 
        responseTime: "< 4h",
        autoResponder: true
      },
      form: { 
        present: true, 
        fields: 5, 
        mobile_friendly: true,
        validationErrors: 2,
        completionRate: "78%",
        loadTime: "1.2s"
      },
      chat: { 
        present: false, 
        hours: "0",
        suggestedImplementation: "Live Chat mit FAQ-Bot"
      },
      whatsapp: {
        present: true,
        businessAccount: true,
        responseTime: "< 30min",
        automatedGreeting: false
      },
      callback: { 
        present: true,
        requestForm: true,
        fulfillmentRate: "92%",
        averageCallbackTime: "< 2h"
      }
    },
    userJourney: {
      score: 64,
      landingPageOptimization: {
        score: 70,
        headline: "klar und nutzenorientiert",
        valueProposition: "deutlich erkennbar",
        trustSignals: 6,
        loadTime: "2.1s",
        mobileExperience: "optimiert"
      },
      navigationClarity: {
        score: 75,
        menuStructure: "logisch",
        searchFunction: false,
        breadcrumbs: true,
        mobileNavigation: "hamburger optimiert"
      },
      informationHierarchy: {
        score: 68,
        contentFlow: "überwiegend logisch",
        scanability: "gut",
        ctaPlacement: "strategisch",
        visualHierarchy: "befriedigend"
      },
      trustElements: {
        score: 60,
        testimonials: 6,
        certifications: 3,
        guarantees: 2,
        securityBadges: 1,
        companylHistory: "prominent"
      },
      urgencyElements: {
        score: 45,
        limitedOffers: 0,
        timeConstraints: 1,
        availability: "teilweise kommuniziert",
        socialProof: "basic vorhanden"
      }
    },
    conversionFunnels: [
      { 
        name: "Hauptkontaktformular", 
        visitors: 1000, 
        views: 450,
        interactions: 120, 
        completions: 35, 
        rate: "3.5%",
        dropOffPoints: ["Telefonnummer", "Nachricht"],
        optimizationPotential: "hoch"
      },
      { 
        name: "Direkter Telefonanruf", 
        visitors: 1000, 
        clicks: 125,
        interactions: 80, 
        completions: 65, 
        rate: "6.5%",
        peakHours: "9-11h, 14-16h",
        optimizationPotential: "mittel"
      },
      { 
        name: "WhatsApp Kontakt", 
        visitors: 1000, 
        clicks: 85,
        interactions: 68, 
        completions: 49, 
        rate: "4.9%",
        responseTime: "< 30min",
        optimizationPotential: "mittel"
      },
      { 
        name: "E-Mail Anfrage", 
        visitors: 1000, 
        clicks: 45,
        interactions: 35, 
        completions: 28, 
        rate: "2.8%",
        bounceRate: "22%",
        optimizationPotential: "sehr hoch"
      },
      { 
        name: "Rückruf anfordern", 
        visitors: 1000, 
        clicks: 68,
        interactions: 58, 
        completions: 52, 
        rate: "5.2%",
        fulfillmentRate: "92%",
        optimizationPotential: "niedrig"
      },
      { 
        name: "Online Terminbuchung", 
        visitors: 1000, 
        clicks: 42,
        interactions: 38, 
        completions: 35, 
        rate: "3.5%",
        noShowRate: "8%",
        optimizationPotential: "niedrig"
      }
    ],
    technicalOptimization: {
      score: 71,
      loadSpeed: {
        desktop: "2.1s",
        mobile: "2.8s",
        coreWebVitals: "teilweise grün"
      },
      mobileResponsive: {
        responsive: true,
        touchTargets: "optimiert",
        fontSizes: "lesbar",
        formUsability: "gut"
      },
      formValidation: {
        clientSide: true,
        serverSide: true,
        errorMessages: "nutzerfreundlich",
        progressIndicator: false
      },
      errorHandling: {
        customPages404: "custom",
        formErrors: "benutzerfreundlich",
        serverErrors: "generisch",
        fallbacks: "basic"
      },
      thankYouPages: {
        present: true,
        personalized: false,
        nextSteps: "klar kommuniziert",
        crossSell: false
      },
      analytics: {
        goalTracking: "basic",
        heatmaps: false,
        userRecordings: false,
        aBTesting: false
      }
    },
    industrySpecificOptimization: {
      score: 58,
      emergencyHandling: currentStrategy.urgencyFactors.includes('24h Notdienst') ? "gut sichtbar" : "ausbaufähig",
      seasonalAdaptation: "statisch",
      localOptimization: "grundlegend vorhanden",
      serviceAreaDisplay: "klar definiert",
      pricingTransparency: "teilweise",
      credentialsDisplay: "vorhanden"
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "score-text-high";   // 90-100% gold
    if (score >= 61) return "score-text-medium"; // 61-89% grün
    return "score-text-low";                     // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "secondary";        // gold
    if (score >= 61) return "default";          // grün
    return "destructive";                       // rot
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
    if (numRate >= 5) return "score-text-medium";
    if (numRate >= 3) return "score-text-high";
    return "score-text-low";
  };

  const getOptimizationBadge = (potential: string) => {
    switch (potential) {
      case "sehr hoch": return "destructive";
      case "hoch": return "secondary";
      case "mittel": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Conversion-Optimierung für {industry.toUpperCase()}
            <Badge variant={getScoreBadge(conversionData.overallScore)}>
              {getScoreTextDescription(conversionData.overallScore, 'general')}
            </Badge>
          </CardTitle>
          <CardDescription>
            Detaillierte Analyse der Konversionsrate und Optimierungspotentiale für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Branchenspezifische Ziele */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Branchenspezifische Conversion-Ziele
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Primäre Ziele</h4>
                  <div className="space-y-1">
                    {currentStrategy.primaryGoals.map((goal, index) => (
                      <Badge key={index} variant="default" className="mr-1 mb-1">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Saisonale Peaks</h4>
                  <div className="space-y-1">
                    {currentStrategy.seasonalPeaks.map((peak, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {peak}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Dringlichkeits-Faktoren</h4>
                  <div className="space-y-1">
                    {currentStrategy.urgencyFactors.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="mr-1 mb-1">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call-to-Actions - Erweitert */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MousePointer className="h-5 w-5" />
                Call-to-Actions (CTAs) - Detailanalyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 border rounded-lg bg-blue-50">
                  <div className="text-2xl font-bold text-blue-600">{conversionData.callToActions.total}</div>
                  <p className="text-sm text-gray-600">Gesamt CTAs</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-green-50">
                  <div className="text-2xl font-bold text-green-600">{conversionData.callToActions.visible}</div>
                  <p className="text-sm text-gray-600">Sichtbare CTAs</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-yellow-50">
                  <div className="text-2xl font-bold text-yellow-600">{conversionData.callToActions.effective}</div>
                  <p className="text-sm text-gray-600">Effektive CTAs</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-purple-50">
                  <div className="text-2xl font-bold text-purple-600">{conversionData.callToActions.aboveFold}</div>
                  <p className="text-sm text-gray-600">Above-the-Fold</p>
                </div>
              </div>

              <div className="space-y-4">
                {conversionData.callToActions.types.map((cta, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-lg">{cta.type}</span>
                        <Badge variant="outline">
                          {cta.count}x vorhanden
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPlacementBadge(cta.placement)}>
                          {cta.placement}
                        </Badge>
                        <Badge variant={getEffectivenessBadge(cta.effectiveness)}>
                          {cta.effectiveness}% effektiv
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Click-Rate:</span>
                        <span className={`ml-1 font-medium ${getConversionRateColor(cta.clickRate)}`}>
                          {cta.clickRate}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversion:</span>
                        <span className={`ml-1 font-medium ${getConversionRateColor(cta.conversionRate)}`}>
                          {cta.conversionRate}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mobile:</span>
                        <Badge variant={cta.mobileOptimized ? "default" : "destructive"} className="ml-1 text-xs">
                          {cta.mobileOptimized ? "✓" : "✗"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-600">Tracking:</span>
                        <Badge variant={cta.trackingSetup ? "default" : "destructive"} className="ml-1 text-xs">
                          {cta.trackingSetup ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Kontaktmöglichkeiten - Erweitert */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Kontaktmöglichkeiten - Vollanalyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Telefon */}
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefon-Kontakt
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Sichtbarkeit:</span>
                      <Badge variant="default" className="ml-1">Excellent</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Antwortzeit:</span>
                      <span className="ml-1 font-medium">{conversionData.contactMethods.phone.responseTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Verfügbarkeit:</span>
                      <span className="ml-1 font-medium text-xs">{conversionData.contactMethods.phone.availability}</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="p-4 border rounded-lg bg-green-50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp Business
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Business Account:</span>
                      <Badge variant="default" className="ml-1">✓ Verifiziert</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Antwortzeit:</span>
                      <span className="ml-1 font-medium">{conversionData.contactMethods.whatsapp.responseTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Auto-Greeting:</span>
                      <Badge variant="destructive" className="ml-1">Nicht eingerichtet</Badge>
                    </div>
                  </div>
                </div>

                {/* Kontaktformular */}
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Kontaktformular
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Felder:</span>
                      <span className="ml-1 font-medium">{conversionData.contactMethods.form.fields}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Completion-Rate:</span>
                      <span className="ml-1 font-medium">{conversionData.contactMethods.form.completionRate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ladezeit:</span>
                      <span className="ml-1 font-medium">{conversionData.contactMethods.form.loadTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Validierungsfehler:</span>
                      <Badge variant="secondary" className="ml-1">{conversionData.contactMethods.form.validationErrors}</Badge>
                    </div>
                  </div>
                </div>

                {/* Rückruf Service */}
                <div className="p-4 border rounded-lg bg-purple-50">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Rückruf-Service
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">Erfüllungsrate:</span>
                      <span className="ml-1 font-medium text-green-600">{conversionData.contactMethods.callback.fulfillmentRate}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Ø Rückrufzeit:</span>
                      <span className="ml-1 font-medium">{conversionData.contactMethods.callback.averageCallbackTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Formular:</span>
                      <Badge variant="default" className="ml-1">Optimiert</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Funnels - Erweitert */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Detaillierte Conversion-Funnel Analyse
              </CardTitle>
              <CardDescription>
                Vollständige Analyse aller Konversionspfade mit Optimierungsempfehlungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {conversionData.conversionFunnels.map((funnel, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-lg">{funnel.name}</h4>
                      <div className="flex gap-2">
                        <Badge variant={getEffectivenessBadge(parseFloat(funnel.rate))} className="text-lg">
                          {funnel.rate} Conversion
                        </Badge>
                        <Badge variant={getOptimizationBadge(funnel.optimizationPotential)}>
                          {funnel.optimizationPotential} Potenzial
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm mb-4">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xl font-bold text-blue-600">{funnel.visitors}</div>
                        <p className="text-gray-600">Besucher</p>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="text-xl font-bold text-yellow-600">
                          {funnel.views || funnel.clicks}
                        </div>
                        <p className="text-gray-600">Views/Clicks</p>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-xl font-bold text-orange-600">{funnel.interactions}</div>
                        <p className="text-gray-600">Interaktionen</p>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xl font-bold text-green-600">{funnel.completions}</div>
                        <p className="text-gray-600">Conversions</p>
                      </div>
                    </div>

                    {/* Zusätzliche Metriken je nach Funnel-Typ */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
                      {funnel.dropOffPoints && (
                        <div>
                          <span>Drop-Off bei: </span>
                          <span className="font-medium text-red-600">{funnel.dropOffPoints.join(', ')}</span>
                        </div>
                      )}
                      {funnel.peakHours && (
                        <div>
                          <span>Peak-Zeiten: </span>
                          <span className="font-medium">{funnel.peakHours}</span>
                        </div>
                      )}
                      {funnel.responseTime && (
                        <div>
                          <span>Antwortzeit: </span>
                          <span className="font-medium">{funnel.responseTime}</span>
                        </div>
                      )}
                      {funnel.bounceRate && (
                        <div>
                          <span>Bounce-Rate: </span>
                          <span className="font-medium">{funnel.bounceRate}</span>
                        </div>
                      )}
                      {funnel.fulfillmentRate && (
                        <div>
                          <span>Erfüllungsrate: </span>
                          <span className="font-medium text-green-600">{funnel.fulfillmentRate}</span>
                        </div>
                      )}
                      {funnel.noShowRate && (
                        <div>
                          <span>No-Show Rate: </span>
                          <span className="font-medium">{funnel.noShowRate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* User Journey - Erweitert */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Journey Optimierung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Landing Page */}
                <div>
                  <h4 className="font-medium mb-3">Landing Page Optimierung</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Headline:</span>
                        <Badge variant="default">{conversionData.userJourney.landingPageOptimization.headline}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Value Proposition:</span>
                        <Badge variant="default">{conversionData.userJourney.landingPageOptimization.valueProposition}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Trust Signals:</span>
                        <span className="font-medium">{conversionData.userJourney.landingPageOptimization.trustSignals}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Ladezeit:</span>
                        <span className="font-medium">{conversionData.userJourney.landingPageOptimization.loadTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Mobile Experience:</span>
                        <Badge variant="default">{conversionData.userJourney.landingPageOptimization.mobileExperience}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={conversionData.userJourney.landingPageOptimization.score} className="h-2" />
                    <span className="text-sm text-gray-600">{conversionData.userJourney.landingPageOptimization.score}/100</span>
                  </div>
                </div>

                {/* Navigation */}
                <div>
                  <h4 className="font-medium mb-3">Navigation & Usability</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Menü-Struktur:</span>
                        <Badge variant="default">{conversionData.userJourney.navigationClarity.menuStructure}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Suchfunktion:</span>
                        <Badge variant="destructive">nicht vorhanden</Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Breadcrumbs:</span>
                        <Badge variant="default">implementiert</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Mobile Navigation:</span>
                        <Badge variant="default">{conversionData.userJourney.navigationClarity.mobileNavigation}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={conversionData.userJourney.navigationClarity.score} className="h-2" />
                    <span className="text-sm text-gray-600">{conversionData.userJourney.navigationClarity.score}/100</span>
                  </div>
                </div>

                {/* Trust & Urgency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Vertrauenselemente</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Testimonials:</span>
                        <span className="font-medium">{conversionData.userJourney.trustElements.testimonials}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zertifikate:</span>
                        <span className="font-medium">{conversionData.userJourney.trustElements.certifications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Garantien:</span>
                        <span className="font-medium">{conversionData.userJourney.trustElements.guarantees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Firmenhistorie:</span>
                        <Badge variant="default">{conversionData.userJourney.trustElements.companylHistory}</Badge>
                      </div>
                    </div>
                    <Progress value={conversionData.userJourney.trustElements.score} className="h-2 mt-3" />
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Dringlichkeits-Elemente</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Limitierte Angebote:</span>
                        <span className="font-medium">{conversionData.userJourney.urgencyElements.limitedOffers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zeitliche Einschränkungen:</span>
                        <span className="font-medium">{conversionData.userJourney.urgencyElements.timeConstraints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verfügbarkeit:</span>
                        <Badge variant="secondary">{conversionData.userJourney.urgencyElements.availability}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Social Proof:</span>
                        <Badge variant="secondary">{conversionData.userJourney.urgencyElements.socialProof}</Badge>
                      </div>
                    </div>
                    <Progress value={conversionData.userJourney.urgencyElements.score} className="h-2 mt-3" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technische Optimierung - Erweitert */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Technische Conversion-Optimierung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Performance */}
                <div>
                  <h4 className="font-medium mb-3">Performance & Ladezeiten</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-xl font-bold text-blue-600">{conversionData.technicalOptimization.loadSpeed.desktop}</div>
                      <p className="text-sm text-gray-600">Desktop Ladezeit</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <div className="text-xl font-bold text-yellow-600">{conversionData.technicalOptimization.loadSpeed.mobile}</div>
                      <p className="text-sm text-gray-600">Mobile Ladezeit</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Badge variant="secondary" className="text-sm">{conversionData.technicalOptimization.loadSpeed.coreWebVitals}</Badge>
                      <p className="text-sm text-gray-600 mt-1">Core Web Vitals</p>
                    </div>
                  </div>
                </div>

                {/* Mobile & Forms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Mobile Optimierung</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Responsive Design:</span>
                        <Badge variant="default">Vollständig</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Touch-Targets:</span>
                        <Badge variant="default">{conversionData.technicalOptimization.mobileResponsive.touchTargets}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Schriftgrößen:</span>
                        <Badge variant="default">{conversionData.technicalOptimization.mobileResponsive.fontSizes}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-3">Formular-Optimierung</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Client-Side Validierung:</span>
                        <Badge variant="default">Implementiert</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Error Messages:</span>
                        <Badge variant="default">{conversionData.technicalOptimization.formValidation.errorMessages}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Progress Indicator:</span>
                        <Badge variant="destructive">Fehlt</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analytics & Tracking */}
                <div>
                  <h4 className="font-medium mb-3">Analytics & Tracking</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 border rounded-lg">
                      <Badge variant="secondary">{conversionData.technicalOptimization.analytics.goalTracking}</Badge>
                      <p className="text-sm text-gray-600 mt-1">Goal Tracking</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Badge variant="destructive">Nicht installiert</Badge>
                      <p className="text-sm text-gray-600 mt-1">Heatmaps</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Badge variant="destructive">Nicht installiert</Badge>
                      <p className="text-sm text-gray-600 mt-1">User Recordings</p>
                    </div>
                    <div className="text-center p-3 border rounded-lg">
                      <Badge variant="destructive">Nicht installiert</Badge>
                      <p className="text-sm text-gray-600 mt-1">A/B Testing</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branchenspezifische Optimierung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Branchenspezifische Conversion-Faktoren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Notdienst-Kommunikation:</span>
                    <Badge variant="default">{conversionData.industrySpecificOptimization.emergencyHandling}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Saisonale Anpassung:</span>
                    <Badge variant="destructive">{conversionData.industrySpecificOptimization.seasonalAdaptation}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Lokale Optimierung:</span>
                    <Badge variant="secondary">{conversionData.industrySpecificOptimization.localOptimization}</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Service-Gebiet:</span>
                    <Badge variant="default">{conversionData.industrySpecificOptimization.serviceAreaDisplay}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Preis-Transparenz:</span>
                    <Badge variant="secondary">{conversionData.industrySpecificOptimization.pricingTransparency}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Qualifikationen:</span>
                    <Badge variant="default">{conversionData.industrySpecificOptimization.credentialsDisplay}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Progress value={conversionData.industrySpecificOptimization.score} className="h-3" />
                <span className="text-sm text-gray-600">Branchenspezifische Optimierung: {conversionData.industrySpecificOptimization.score}/100</span>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionOptimization;
