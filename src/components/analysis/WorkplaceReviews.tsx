
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Star, Users, Briefcase, AlertCircle, Edit, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualWorkplaceData } from '@/hooks/useManualData';

interface WorkplaceReviewsProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
  };
  realData: RealBusinessData;
  manualData?: ManualWorkplaceData | null;
  onManualDataChange?: (data: ManualWorkplaceData | null) => void;
}

const WorkplaceReviews: React.FC<WorkplaceReviewsProps> = ({ 
  businessData, 
  realData, 
  manualData,
  onManualDataChange 
}) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const { toast } = useToast();
  const workplaceData = realData.workplace;

  const form = useForm<ManualWorkplaceData>({
    defaultValues: {
      kununuFound: manualData?.kununuFound || false,
      kununuRating: manualData?.kununuRating || '',
      kununuReviews: manualData?.kununuReviews || '',
      glassdoorFound: manualData?.glassdoorFound || false,
      glassdoorRating: manualData?.glassdoorRating || '',
      glassdoorReviews: manualData?.glassdoorReviews || '',
      disableAutoKununu: manualData?.disableAutoKununu || false,
      disableAutoGlassdoor: manualData?.disableAutoGlassdoor || false
    }
  });

  // Reset form when manualData changes
  React.useEffect(() => {
    if (manualData) {
      form.reset(manualData);
      console.log('Form reset with manual workplace data:', manualData);
    }
  }, [manualData, form]);

  const onSubmit = (data: ManualWorkplaceData) => {
    console.log('Submitting workplace data:', data);
    if (onManualDataChange) {
      onManualDataChange(data);
    }
    setShowManualInput(false);
    toast({
      title: "Arbeitgeberbewertungen aktualisiert",
      description: "Die manuell eingegebenen Daten wurden übernommen.",
    });
  };

  const handleClearManual = () => {
    const emptyData = {
      kununuFound: false,
      kununuRating: '',
      kununuReviews: '',
      glassdoorFound: false,
      glassdoorRating: '',
      glassdoorReviews: '',
      disableAutoKununu: false,
      disableAutoGlassdoor: false
    };
    form.reset(emptyData);
    if (onManualDataChange) {
      onManualDataChange(null);
    }
    setShowManualInput(false);
    toast({
      title: "Manuelle Eingaben zurückgesetzt",
      description: "Es werden wieder die automatisch erkannten Daten verwendet.",
    });
  };

  // Improved logic to check for manual data
  const hasManualData = manualData && (
    manualData.kununuFound || 
    manualData.glassdoorFound || 
    manualData.kununuRating !== '' || 
    manualData.glassdoorRating !== ''
  );

  console.log('Current manual workplace data:', manualData);
  console.log('Has manual workplace data:', hasManualData);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Helper function to get display data (manual or automatic)
  const getDisplayData = () => {
    if (hasManualData && manualData) {
      // Check if auto reviews should be disabled
      const kununuData = manualData.disableAutoKununu ? 
        { found: manualData.kununuFound, rating: manualData.kununuRating, reviews: manualData.kununuReviews } :
        (manualData.kununuFound || manualData.kununuRating !== '' ? 
          { found: manualData.kununuFound, rating: manualData.kununuRating, reviews: manualData.kununuReviews } :
          workplaceData.kununu);
      
      const glassdoorData = manualData.disableAutoGlassdoor ? 
        { found: manualData.glassdoorFound, rating: manualData.glassdoorRating, reviews: manualData.glassdoorReviews } :
        (manualData.glassdoorFound || manualData.glassdoorRating !== '' ? 
          { found: manualData.glassdoorFound, rating: manualData.glassdoorRating, reviews: manualData.glassdoorReviews } :
          workplaceData.glassdoor);
      
      return {
        kununu: {
          ...kununuData,
          disabled: manualData.disableAutoKununu
        },
        glassdoor: {
          ...glassdoorData,
          disabled: manualData.disableAutoGlassdoor
        }
      };
    }
    return {
      kununu: {
        ...workplaceData.kununu,
        disabled: false
      },
      glassdoor: {
        ...workplaceData.glassdoor,
        disabled: false
      }
    };
  };

  const displayData = getDisplayData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6" />
              Arbeitgeberbewertungen (Echte Suche)
            </div>
            <div className="flex gap-3 items-center">
              <Badge variant={hasManualData ? "default" : "secondary"}>
                {hasManualData ? "✓ Manuell eingegeben" : "Automatisch erkannt"}
              </Badge>
              <Button
                variant={showManualInput ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowManualInput(!showManualInput)}
                className="bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 min-w-[140px]"
              >
                {showManualInput ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Abbrechen
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Manuell eingeben
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {hasManualData 
              ? `Manuell eingegebene Arbeitgeberbewertungen für ${realData.company.name}`
              : `Live-Suche nach Bewertungen als Arbeitgeber für ${realData.company.name}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showManualInput ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Arbeitgeberbewertungen eingeben</h4>
                <p className="text-sm text-blue-800">
                  Tragen Sie hier Ihre Bewertungen von kununu und Glassdoor ein:
                </p>
              </div>

              {/* Auto-found reviews disable options */}
              {(workplaceData.kununu.found || workplaceData.glassdoor.found) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-orange-900 mb-3">Automatisch gefundene Bewertungen deaktivieren</h4>
                  <div className="space-y-3">
                    {workplaceData.kununu.found && (
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="disableAutoKununu"
                          {...form.register('disableAutoKununu')}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="disableAutoKununu" className="flex-1">
                          <span className="font-medium">Automatisch gefundene kununu-Bewertung ignorieren</span>
                          <div className="text-sm text-gray-600 mt-1">
                            Aktuell gefunden: {workplaceData.kununu.rating}/5 ({workplaceData.kununu.reviews} Bewertungen)
                          </div>
                        </Label>
                      </div>
                    )}
                    {workplaceData.glassdoor.found && (
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="disableAutoGlassdoor"
                          {...form.register('disableAutoGlassdoor')}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="disableAutoGlassdoor" className="flex-1">
                          <span className="font-medium">Automatisch gefundene Glassdoor-Bewertung ignorieren</span>
                          <div className="text-sm text-gray-600 mt-1">
                            Aktuell gefunden: {workplaceData.glassdoor.rating}/5 ({workplaceData.glassdoor.reviews} Bewertungen)
                          </div>
                        </Label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 gap-6">
                {/* kununu Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3 text-blue-700">🏢 kununu</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kununuFound">kununu Profil vorhanden</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="kununuFound"
                          {...form.register('kununuFound')}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Ja, Profil vorhanden</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kununuRating">Bewertung (1-5)</Label>
                      <Input
                        id="kununuRating"
                        placeholder="z.B. 4.2"
                        {...form.register('kununuRating')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kununuReviews">Anzahl Bewertungen</Label>
                      <Input
                        id="kununuReviews"
                        placeholder="z.B. 15"
                        {...form.register('kununuReviews')}
                      />
                    </div>
                  </div>
                </div>

                {/* Glassdoor Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3 text-green-700">🏢 Glassdoor</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="glassdoorFound">Glassdoor Profil vorhanden</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="glassdoorFound"
                          {...form.register('glassdoorFound')}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">Ja, Profil vorhanden</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="glassdoorRating">Bewertung (1-5)</Label>
                      <Input
                        id="glassdoorRating"
                        placeholder="z.B. 3.8"
                        {...form.register('glassdoorRating')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="glassdoorReviews">Anzahl Bewertungen</Label>
                      <Input
                        id="glassdoorReviews"
                        placeholder="z.B. 8"
                        {...form.register('glassdoorReviews')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2"
                >
                  Daten übernehmen
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowManualInput(false)}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-6 py-2"
                >
                  Abbrechen
                </Button>
                {hasManualData && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleClearManual}
                    className="font-medium px-6 py-2"
                  >
                    Zurücksetzen
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <>
              {!displayData.kununu.found && !displayData.glassdoor.found ? (
                <div className="space-y-6">
                  {/* Arbeitsplatz & Arbeitgeber-Bewertung Section */}
                  <div className="bg-[#1a1a1a] text-white rounded-lg p-6 space-y-4">
                    <h3 className="text-xl font-semibold text-yellow-300 mb-4">
                      Arbeitsplatz & Arbeitgeber-Bewertung
                    </h3>
                    
                    <div className="space-y-2">
                      <p className="text-yellow-300">
                        <span className="font-semibold">Arbeitgeber-Bewertung:</span> Verbesserungsbedarf
                      </p>
                      <p className="text-yellow-300">
                        <span className="font-semibold">Empfehlung:</span> Employer Branding stärken
                      </p>
                    </div>

                    <div className="bg-gray-800 rounded-md p-1 mb-4">
                      <div className="bg-gray-600 h-4 rounded-sm w-[5%]"></div>
                    </div>

                    <div className="bg-yellow-600 rounded-lg p-4">
                      <p className="text-white font-medium flex items-center gap-2">
                        <span>▼</span> Arbeitsplatz-Details anzeigen
                      </p>
                    </div>

                    {/* Detaillierte Arbeitgeber-Bewertung */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold flex items-center gap-2">
                        🏢 Detaillierte Arbeitgeber-Bewertung
                      </h4>

                      <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-yellow-300 mb-2">
                          <AlertCircle className="h-5 w-5" />
                          <span className="font-semibold">Arbeitsplatz-Bewertungen nicht vorhanden</span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          Es sind keine Bewertungen auf den Portalen Kununu und Glassdoor ersichtlich.
                        </p>
                      </div>

                      {/* Handlungsempfehlungen */}
                      <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
                        <h5 className="text-yellow-300 font-semibold mb-3">Handlungsempfehlungen:</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">⭐</span>
                            <span>Registrierung in den Portalen vornehmen</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">⭐</span>
                            <span>Mitarbeiter zu Bewertungen animieren</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">⭐</span>
                            <span>Mitarbeiterzufriedenheit regelmäßig messen</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">⭐</span>
                            <span>Positive Arbeitgeber-Bewertungen fördern</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Kununu & Glassdoor Bewertungen */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <h6 className="text-sm font-medium mb-2">Kununu Rating:</h6>
                        <p className="text-gray-400 text-sm mb-2">Nicht erfasst</p>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full w-[20%]"></div>
                        </div>
                      </div>
                      <div>
                        <h6 className="text-sm font-medium mb-2">Glassdoor Rating:</h6>
                        <p className="text-gray-400 text-sm mb-2">Nicht erfasst</p>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full w-[20%]"></div>
                        </div>
                      </div>
                      <div>
                        <h6 className="text-sm font-medium mb-2">Arbeitsklima:</h6>
                        <p className="text-gray-400 text-sm mb-2">Nicht erfasst</p>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full w-[40%]"></div>
                        </div>
                      </div>
                    </div>

                    {/* Fachkräfte-Attraktivität */}
                    <div className="space-y-4">
                      <h5 className="text-lg font-semibold">Fachkräfte-Attraktivität</h5>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <h6 className="text-sm font-medium mb-2">Ausbildungsplätze:</h6>
                          <p className="text-gray-300 text-sm mb-2">Verfügbar</p>
                          <div className="bg-gray-700 rounded-full h-2">
                            <div className="bg-yellow-400 h-2 rounded-full w-[70%]"></div>
                          </div>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium mb-2">Weiterbildung:</h6>
                          <p className="text-gray-300 text-sm mb-2">Standardprogramm</p>
                          <div className="bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-[60%]"></div>
                          </div>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium mb-2">Benefits:</h6>
                          <p className="text-gray-300 text-sm mb-2">Branchenüblich</p>
                          <div className="bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full w-[65%]"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Arbeitsplatz-Empfehlungen */}
                    <div className="bg-yellow-600/20 border border-yellow-500 rounded-lg p-4">
                      <h5 className="text-yellow-300 font-semibold mb-3">Arbeitsplatz-Empfehlungen:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">⭐</span>
                          <span>Mitarbeiterbewertungen auf Kununu und Glassdoor aktiv unterstützen</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">⭐</span>
                          <span>Employer Branding durch authentische Einblicke stärken</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">⭐</span>
                          <span>Ausbildungs- und Karrierewege transparent kommunizieren</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-400">⭐</span>
                          <span>Moderne Benefits und flexible Arbeitszeiten anbieten</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className={displayData.kununu.disabled ? "opacity-50 border-gray-300" : ""}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        kununu
                        {displayData.kununu.disabled ? (
                          <Badge variant="secondary">Deaktiviert</Badge>
                        ) : (
                          <Badge variant={displayData.kununu.found ? "default" : "destructive"}>
                            {displayData.kununu.found ? "Gefunden" : "Nicht gefunden"}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {displayData.kununu.disabled ? (
                        <p className="text-sm text-gray-500">
                          Automatisch gefundene Bewertungen wurden manuell deaktiviert
                        </p>
                      ) : displayData.kununu.found ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {displayData.kununu.rating}
                            </span>
                            <div className="flex">
                              {renderStars(Math.round(parseFloat(displayData.kununu.rating.toString())))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {displayData.kununu.reviews} Bewertungen
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Keine kununu-Bewertungen gefunden
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className={displayData.glassdoor.disabled ? "opacity-50 border-gray-300" : ""}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Glassdoor
                        {displayData.glassdoor.disabled ? (
                          <Badge variant="secondary">Deaktiviert</Badge>
                        ) : (
                          <Badge variant={displayData.glassdoor.found ? "default" : "destructive"}>
                            {displayData.glassdoor.found ? "Gefunden" : "Nicht gefunden"}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {displayData.glassdoor.disabled ? (
                        <p className="text-sm text-gray-500">
                          Automatisch gefundene Bewertungen wurden manuell deaktiviert
                        </p>
                      ) : displayData.glassdoor.found ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {displayData.glassdoor.rating}
                            </span>
                            <div className="flex">
                              {renderStars(Math.round(parseFloat(displayData.glassdoor.rating.toString())))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {displayData.glassdoor.reviews} Bewertungen
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Keine Glassdoor-Bewertungen gefunden
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Echte Daten Hinweis */}
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">✓ Live-Arbeitgeberbewertungssuche</h4>
                <p className="text-sm text-green-700">
                  {hasManualData 
                    ? `Manuell eingegebene Arbeitgeberbewertungen für ${realData.company.name}.`
                    : `Diese Analyse basiert auf einer automatischen Suche nach Arbeitgeberbewertungen für ${realData.company.name}. Da keine speziellen APIs integriert sind, konnten keine Bewertungen gefunden werden.`
                  }
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkplaceReviews;
