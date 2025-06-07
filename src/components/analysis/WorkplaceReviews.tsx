
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
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
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
      glassdoorReviews: manualData?.glassdoorReviews || ''
    }
  });

  // Reset form when manualData changes
  React.useEffect(() => {
    form.reset({
      kununuFound: manualData?.kununuFound || false,
      kununuRating: manualData?.kununuRating || '',
      kununuReviews: manualData?.kununuReviews || '',
      glassdoorFound: manualData?.glassdoorFound || false,
      glassdoorRating: manualData?.glassdoorRating || '',
      glassdoorReviews: manualData?.glassdoorReviews || ''
    });
    console.log('Form reset with manual workplace data:', manualData);
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
    form.reset({
      kununuFound: false,
      kununuRating: '',
      kununuReviews: '',
      glassdoorFound: false,
      glassdoorRating: '',
      glassdoorReviews: ''
    });
    if (onManualDataChange) {
      onManualDataChange(null);
    }
    setShowManualInput(false);
    toast({
      title: "Manuelle Eingaben zurückgesetzt",
      description: "Es werden wieder die automatisch erkannten Daten verwendet.",
    });
  };

  const hasManualData = manualData && (manualData.kununuFound || manualData.glassdoorFound);

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
              {!workplaceData.kununu.found && !workplaceData.glassdoor.found && !hasManualData ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <AlertCircle className="h-12 w-12 mx-auto text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    Keine Arbeitgeberbewertungen gefunden
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Bei der automatischen Suche konnten keine Bewertungen auf kununu oder Glassdoor gefunden werden.
                  </p>
                  
                  <div className="bg-amber-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-amber-900 mb-2">Mögliche Gründe:</h4>
                    <ul className="text-sm text-amber-800 text-left space-y-1">
                      <li>• Unternehmen noch nicht auf Bewertungsplattformen registriert</li>
                      <li>• Kleine Betriebsgröße (weniger als 5 Mitarbeiter)</li>
                      <li>• Keine ehemaligen Mitarbeiter haben bewertet</li>
                      <li>• Fehlende API-Integration zu Bewertungsplattformen</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">Empfehlungen als Arbeitgeber:</h4>
                    <ul className="text-sm text-blue-800 text-left space-y-1">
                      <li>• Mitarbeiterzufriedenheit regelmäßig erfragen</li>
                      <li>• Positive Arbeitskultur schaffen</li>
                      <li>• Faire Vergütung und Arbeitsbedingungen</li>
                      <li>• Bei Wachstum: kununu/Glassdoor Profile erstellen</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        kununu
                        <Badge variant={(hasManualData && manualData?.kununuFound) || workplaceData.kununu.found ? "default" : "destructive"}>
                          {(hasManualData && manualData?.kununuFound) || workplaceData.kununu.found ? "Gefunden" : "Nicht gefunden"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(hasManualData && manualData?.kununuFound) || workplaceData.kununu.found ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {hasManualData && manualData?.kununuRating ? manualData.kununuRating : workplaceData.kununu.rating}
                            </span>
                            <div className="flex">
                              {renderStars(Math.round(parseFloat(hasManualData && manualData?.kununuRating ? manualData.kununuRating : workplaceData.kununu.rating.toString())))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {hasManualData && manualData?.kununuReviews ? manualData.kununuReviews : workplaceData.kununu.reviews} Bewertungen
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Keine kununu-Bewertungen gefunden
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        Glassdoor
                        <Badge variant={(hasManualData && manualData?.glassdoorFound) || workplaceData.glassdoor.found ? "default" : "destructive"}>
                          {(hasManualData && manualData?.glassdoorFound) || workplaceData.glassdoor.found ? "Gefunden" : "Nicht gefunden"}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(hasManualData && manualData?.glassdoorFound) || workplaceData.glassdoor.found ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold">
                              {hasManualData && manualData?.glassdoorRating ? manualData.glassdoorRating : workplaceData.glassdoor.rating}
                            </span>
                            <div className="flex">
                              {renderStars(Math.round(parseFloat(hasManualData && manualData?.glassdoorRating ? manualData.glassdoorRating : workplaceData.glassdoor.rating.toString())))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            {hasManualData && manualData?.glassdoorReviews ? manualData.glassdoorReviews : workplaceData.glassdoor.reviews} Bewertungen
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
