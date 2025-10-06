import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';

interface IndustryFeaturesProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
  };
}

const IndustryFeatures: React.FC<IndustryFeaturesProps> = ({ businessData }) => {
  // Branchenspezifische Merkmalsgruppen
  const industryFeatureGroups = {
    shk: [
      {
        group: "Beratung & Service",
        features: [
          { name: "Kostenlose Beratung", found: true, importance: "hoch" },
          { name: "Vor-Ort-Termin", found: true, importance: "hoch" },
          { name: "Energieberatung", found: false, importance: "mittel" },
          { name: "24h Notdienst", found: true, importance: "hoch" }
        ]
      },
      {
        group: "Transparenz & Vertrauen",
        features: [
          { name: "Kostenvoranschlag", found: true, importance: "hoch" },
          { name: "Festpreisgarantie", found: false, importance: "mittel" },
          { name: "Garantieleistungen", found: true, importance: "hoch" },
          { name: "Zertifizierungen", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Referenzen & Qualität",
        features: [
          { name: "Referenzprojekte", found: true, importance: "hoch" },
          { name: "Kundenbewertungen", found: true, importance: "hoch" },
          { name: "Meisterbetrieb-Siegel", found: true, importance: "mittel" },
          { name: "Vorher-Nachher Bilder", found: false, importance: "niedrig" }
        ]
      }
    ],
    maler: [
      {
        group: "Beratung & Service",
        features: [
          { name: "Farbberatung", found: true, importance: "hoch" },
          { name: "Kostenlose Besichtigung", found: true, importance: "hoch" },
          { name: "Materialberatung", found: false, importance: "mittel" },
          { name: "Terminflexibilität", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Leistungsspektrum",
        features: [
          { name: "Innen- und Außenanstrich", found: true, importance: "hoch" },
          { name: "Fassadensanierung", found: true, importance: "hoch" },
          { name: "Tapezierarbeiten", found: true, importance: "mittel" },
          { name: "Dekortechniken", found: false, importance: "niedrig" }
        ]
      }
    ],
    elektriker: [
      {
        group: "Sicherheit & Normen",
        features: [
          { name: "VDE-konforme Installation", found: true, importance: "hoch" },
          { name: "Sicherheitsprüfungen", found: true, importance: "hoch" },
          { name: "Blitzschutz", found: false, importance: "mittel" },
          { name: "E-Check Prüfungen", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Moderne Technologien",
        features: [
          { name: "Smart Home Integration", found: true, importance: "hoch" },
          { name: "LED-Beleuchtung", found: true, importance: "mittel" },
          { name: "Photovoltaik", found: false, importance: "mittel" },
          { name: "E-Mobilität/Wallbox", found: true, importance: "mittel" }
        ]
      }
    ],
    dachdecker: [
      {
        group: "Dacharten & Materialien",
        features: [
          { name: "Steildach", found: true, importance: "hoch" },
          { name: "Flachdach", found: true, importance: "hoch" },
          { name: "Gründach", found: false, importance: "niedrig" },
          { name: "Solarintegration", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Sicherheit & Qualität",
        features: [
          { name: "Absturzsicherung", found: true, importance: "hoch" },
          { name: "Gewährleistung", found: true, importance: "hoch" },
          { name: "Sturmschäden-Service", found: true, importance: "mittel" },
          { name: "Gerüstbau", found: false, importance: "mittel" }
        ]
      }
    ],
    stukateur: [
      {
        group: "Stuckarbeiten & Techniken",
        features: [
          { name: "Klassische Stucktechniken", found: true, importance: "hoch" },
          { name: "Moderne Stuckelemente", found: true, importance: "hoch" },
          { name: "Denkmalpflege", found: false, importance: "mittel" },
          { name: "Fassadenstuck", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Putz & Oberflächen",
        features: [
          { name: "Innenwandputz", found: true, importance: "hoch" },
          { name: "Außenputz", found: true, importance: "hoch" },
          { name: "Dekorputz", found: true, importance: "mittel" },
          { name: "Wärmedämmputz", found: false, importance: "mittel" }
        ]
      },
      {
        group: "Restaurierung & Sanierung",
        features: [
          { name: "Stuckrestaurierung", found: true, importance: "hoch" },
          { name: "Altbausanierung", found: true, importance: "mittel" },
          { name: "Brandschadensanierung", found: false, importance: "niedrig" },
          { name: "Schimmelsanierung", found: true, importance: "mittel" }
        ]
      }
    ],
    planungsbuero: [
      {
        group: "Planung & Engineering",
        features: [
          { name: "TGA-Planung", found: true, importance: "hoch" },
          { name: "3D-BIM-Modellierung", found: true, importance: "hoch" },
          { name: "Energiekonzepte", found: true, importance: "hoch" },
          { name: "HOAI-konforme Planung", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Software & Tools",
        features: [
          { name: "CAD-Planung", found: true, importance: "hoch" },
          { name: "BIM-Software", found: true, importance: "hoch" },
          { name: "Simulationssoftware", found: false, importance: "mittel" },
          { name: "Projektmanagement-Tools", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Beratung & Expertise",
        features: [
          { name: "Nachhaltigkeitsberatung", found: true, importance: "hoch" },
          { name: "Energieeffizienz-Konzepte", found: true, importance: "hoch" },
          { name: "Brandschutzplanung", found: false, importance: "mittel" },
          { name: "Baubegleitung", found: true, importance: "mittel" }
        ]
      }
    ],
    'facility-management': [
      {
        group: "Gebäudereinigung",
        features: [
          { name: "Büroreinigung", found: true, importance: "hoch" },
          { name: "Glasreinigung", found: true, importance: "hoch" },
          { name: "Industriereinigung", found: false, importance: "mittel" },
          { name: "Grundreinigung", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Facility Services",
        features: [
          { name: "Hausmeisterservice", found: true, importance: "hoch" },
          { name: "Sicherheitsdienste", found: false, importance: "mittel" },
          { name: "Gartenpflege", found: true, importance: "mittel" },
          { name: "Winterdienst", found: true, importance: "mittel" }
        ]
      },
      {
        group: "Wartung & Instandhaltung",
        features: [
          { name: "Technische Wartung", found: true, importance: "hoch" },
          { name: "Kleine Reparaturen", found: true, importance: "hoch" },
          { name: "Aufzugswartung", found: false, importance: "niedrig" },
          { name: "Klimaanlagenwartung", found: false, importance: "mittel" }
        ]
      }
    ],
    holzverarbeitung: [
      {
        group: "Handwerkliche Kompetenz",
        features: [
          { name: "Maßanfertigungen", found: true, importance: "hoch" },
          { name: "Massivholzverarbeitung", found: true, importance: "hoch" },
          { name: "Oberflächenbehandlung", found: true, importance: "mittel" },
          { name: "Antike Restaurierung", found: false, importance: "mittel" }
        ]
      },
      {
        group: "Leistungsspektrum",
        features: [
          { name: "Möbelbau", found: true, importance: "hoch" },
          { name: "Küchenbau", found: true, importance: "hoch" },
          { name: "Einbauschränke", found: true, importance: "hoch" },
          { name: "Treppen", found: false, importance: "mittel" }
        ]
      },
      {
        group: "Beratung & Service",
        features: [
          { name: "Beratung vor Ort", found: true, importance: "hoch" },
          { name: "3D-Planung", found: false, importance: "mittel" },
          { name: "Aufmaß-Service", found: true, importance: "mittel" },
          { name: "Montage-Service", found: true, importance: "hoch" }
        ]
      }
    ]
  };

  const currentFeatures = industryFeatureGroups[businessData.industry];
  
  // Berechnung der Scores
  const totalFeatures = currentFeatures.reduce((sum, group) => sum + group.features.length, 0);
  const foundFeatures = currentFeatures.reduce((sum, group) => 
    sum + group.features.filter(f => f.found).length, 0
  );
  const overallScore = Math.round((foundFeatures / totalFeatures) * 100);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'hoch': return 'text-red-600';
      case 'mittel': return 'text-yellow-600';
      case 'niedrig': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'hoch': return 'destructive';
      case 'mittel': return 'secondary';
      case 'niedrig': return 'outline';
      default: return 'outline';
    }
  };

  const industryNames = {
    shk: 'SHK (Sanitär, Heizung, Klima)',
    maler: 'Maler und Lackierer',
    elektriker: 'Elektriker',
    dachdecker: 'Dachdecker',
    stukateur: 'Stukateure',
    planungsbuero: 'Planungsbüro Versorgungstechnik',
    'facility-management': 'Facility-Management & Gebäudereinigung',
    holzverarbeitung: 'Holzverarbeitung (Schreiner/Tischler)'
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Branchenspezifische Merkmale
            <div 
              className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                overallScore >= 81 ? 'bg-yellow-400 text-black' : 
                overallScore >= 61 ? 'bg-green-500 text-white' : 
                'bg-red-500 text-white'
              }`}
            >
              {overallScore}%
            </div>
          </CardTitle>
          <CardDescription>
            Analyse der typischen {industryNames[businessData.industry]}-Inhalte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Übersicht */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {foundFeatures}/{totalFeatures}
                </div>
                <div className="text-sm text-gray-600">Merkmale gefunden</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {overallScore}%
                </div>
                <div className="text-sm text-gray-600">Vollständigkeit</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {currentFeatures.length}
                </div>
                <div className="text-sm text-gray-600">Merkmalsgruppen</div>
              </div>
            </div>

            <Progress value={overallScore} className="h-3" />

            {/* Merkmalsgruppen */}
            {currentFeatures.map((group, groupIndex) => (
              <Card key={groupIndex}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {group.group}
                    <Badge variant="outline">
                      {group.features.filter(f => f.found).length}/{group.features.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {feature.found ? 
                            <CheckCircle className="h-5 w-5 text-green-500" /> :
                            <XCircle className="h-5 w-5 text-red-500" />
                          }
                          <span className="font-medium">{feature.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getImportanceBadge(feature.importance)}>
                            {feature.importance}
                          </Badge>
                          <Badge variant={feature.found ? "default" : "destructive"}>
                            {feature.found ? "Vorhanden" : "Fehlt"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Branchenspezifische Empfehlungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Branchenspezifische Empfehlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {businessData.industry === 'shk' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600">×</span>
                        <span><strong>Kritisch:</strong> Energieberatung fehlt - wichtiger Trend im SHK-Bereich</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span><strong>Empfehlung:</strong> Festpreisgarantie anbieten für mehr Kundensicherheit</span>
                      </div>
                    </>
                  )}
                  {businessData.industry === 'maler' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Positiv:</strong> Farbberatung wird hervorgehoben</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span><strong>Empfehlung:</strong> Materialberatung ergänzen</span>
                      </div>
                    </>
                  )}
                  {businessData.industry === 'elektriker' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Positiv:</strong> Smart Home wird beworben</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span><strong>Trend:</strong> Photovoltaik-Angebot ergänzen</span>
                      </div>
                    </>
                  )}
                  {businessData.industry === 'dachdecker' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Positiv:</strong> Sicherheitsaspekte werden betont</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span><strong>Empfehlung:</strong> Gerüstbau-Service erwähnen</span>
                      </div>
                    </>
                  )}
                  {businessData.industry === 'stukateur' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Positiv:</strong> Klassische Stucktechniken werden hervorgehoben</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-red-600">×</span>
                        <span><strong>Kritisch:</strong> Denkmalpflege fehlt - wichtiges Differenzierungsmerkmal</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span><strong>Empfehlung:</strong> Wärmedämmputz-Kompetenz ergänzen</span>
                      </div>
                    </>
                  )}
                   {businessData.industry === 'planungsbuero' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Positiv:</strong> BIM-Kompetenz wird betont</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span><strong>Empfehlung:</strong> Simulationssoftware-Expertise ergänzen</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span><strong>Trend:</strong> Brandschutzplanung als zusätzliche Kompetenz</span>
                      </div>
                    </>
                   )}
                   {businessData.industry === 'facility-management' && (
                    <>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Positiv:</strong> Grundlegende Reinigungsleistungen werden angeboten</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-yellow-600">!</span>
                        <span><strong>Empfehlung:</strong> Industriereinigung als Zusatzservice</span>
                      </div>
                       <div className="flex items-start gap-2">
                         <span className="text-yellow-600">!</span>
                         <span><strong>Potenzial:</strong> Sicherheitsdienste für Komplettlösungen</span>
                       </div>
                     </>
                    )}
                   {businessData.industry === 'holzverarbeitung' && (
                     <>
                       <div className="flex items-start gap-2">
                         <span className="text-green-600">✓</span>
                         <span><strong>Positiv:</strong> Maßanfertigungen werden hervorgehoben</span>
                       </div>
                       <div className="flex items-start gap-2">
                         <span className="text-red-600">×</span>
                         <span><strong>Kritisch:</strong> 3D-Planung fehlt - wichtiger Trend in der Holzverarbeitung</span>
                       </div>
                       <div className="flex items-start gap-2">
                         <span className="text-yellow-600">!</span>
                         <span><strong>Empfehlung:</strong> Treppen-Kompetenz ergänzen für breiteres Leistungsspektrum</span>
                       </div>
                       <div className="flex items-start gap-2">
                         <span className="text-yellow-600">!</span>
                         <span><strong>Trend:</strong> Antike Restaurierung als Differenzierungsmerkmal</span>
                       </div>
                     </>
                   )}
                 </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IndustryFeatures;
