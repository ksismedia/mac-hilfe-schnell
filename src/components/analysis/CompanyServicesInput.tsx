
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, Building2, Target } from 'lucide-react';
import { CompanyServices } from '@/hooks/useManualData';

interface CompanyServicesInputProps {
  companyServices: CompanyServices;
  onServicesChange: (services: string[]) => void;
  industry: string;
}

const CompanyServicesInput: React.FC<CompanyServicesInputProps> = ({
  companyServices,
  onServicesChange,
  industry
}) => {
  const [newService, setNewService] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Standard-Services je nach Branche
  const getIndustryStandardServices = (industry: string): string[] => {
    const standardServices = {
      'shk': [
        'Heizungsinstallation', 'Sanitärinstallation', 'Klimaanlagen', 'Rohrreinigung', 
        'Wartung', 'Notdienst', 'Badsanierung', 'Badmodernisierung', 'Wärmepumpe', 
        'Barrierefreies Bad', 'Photovoltaik', 'Gasinstallation', 'Wasserinstallation'
      ],
      'maler': [
        'Innenanstrich', 'Außenanstrich', 'Tapezieren', 'Lackierung', 
        'Fassadengestaltung', 'Renovierung', 'Malarbeiten', 'Wandgestaltung'
      ],
      'elektriker': [
        'Elektroinstallation', 'Beleuchtung', 'Smart Home', 'Sicherheitstechnik', 
        'Wartung', 'Notdienst', 'Photovoltaik', 'Elektroprüfung'
      ],
      'dachdecker': [
        'Dacheindeckung', 'Dachreparatur', 'Dachrinnen', 'Isolierung', 
        'Flachdach', 'Wartung', 'Dachsanierung', 'Photovoltaik'
      ],
      'stukateur': [
        'Innenputz', 'Außenputz', 'Trockenbau', 'Sanierung', 
        'Dämmung', 'Stuck', 'Wärmedämmung'
      ],
      'planungsbuero': [
        'Planung', 'Beratung', 'Projektmanagement', 'Genehmigungen', 
        'Überwachung', 'Gutachten', 'Energieberatung'
      ],
      'facility-management': [
        'Büroreinigung', 'Glasreinigung', 'Hausmeisterservice', 'Gartenpflege', 
        'Winterdienst', 'Sicherheitsdienst', 'Wartung & Instandhaltung', 'Objektbetreuung'
      ],
      'baeckerei': [
        'Frische Brötchen', 'Brot & Backwaren', 'Kuchen & Torten', 'Frühstücksangebot', 
        'Cafe-Betrieb', 'Catering', 'Bio-Backwaren', 'Konditorei-Spezialitäten', 
        'Sonderanfertigungen', 'Partyservice'
      ],
      'blechbearbeitung': [
        'Blechzuschnitt', 'Kantarbeiten', 'Schweißarbeiten', 'Laserschneiden',
        'Dachrinnen', 'Dachentwässerung', 'Fassadenverkleidung', 'Abdichtungen',
        'Metallverarbeitung', 'Edelstahlarbeiten', 'Kupferarbeiten', 'Aluminiumarbeiten',
        'Blechdächer', 'Fassaden', 'Lüftungsbau', 'Reparaturservice'
      ]
    };
    return standardServices[industry as keyof typeof standardServices] || [];
  };

  const standardServices = getIndustryStandardServices(industry);
  const currentServices = companyServices.services || [];

  const addService = () => {
    if (newService.trim() && !currentServices.includes(newService.trim())) {
      const updatedServices = [...currentServices, newService.trim()];
      onServicesChange(updatedServices);
      setNewService('');
    }
  };

  const addBulkServices = () => {
    if (bulkInput.trim()) {
      const newServices = bulkInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !currentServices.includes(s));
      
      if (newServices.length > 0) {
        const updatedServices = [...currentServices, ...newServices];
        onServicesChange(updatedServices);
        setBulkInput('');
        setShowBulkInput(false);
      }
    }
  };

  const removeService = (serviceToRemove: string) => {
    const updatedServices = currentServices.filter(service => service !== serviceToRemove);
    onServicesChange(updatedServices);
  };

  const addStandardService = (service: string) => {
    if (!currentServices.includes(service)) {
      const updatedServices = [...currentServices, service];
      onServicesChange(updatedServices);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Eigene Unternehmensleistungen
        </CardTitle>
        <CardDescription>
          Verwalten Sie Ihre Leistungen für eine präzise Konkurrenzanalyse und Bewertung
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Aktuelle Services */}
        {currentServices.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Ihre Leistungen ({currentServices.length})</h4>
            <div className="flex flex-wrap gap-2">
              {currentServices.map((service, index) => (
                <Badge key={index} variant="default" className="flex items-center gap-1">
                  {service}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-500" 
                    onClick={() => removeService(service)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Standard-Services für die Branche */}
        {standardServices.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Branchenübliche Leistungen ({industry.toUpperCase()})
            </h4>
            <div className="flex flex-wrap gap-2">
              {standardServices
                .filter(service => !currentServices.includes(service))
                .map((service, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => addStandardService(service)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {service}
                </Badge>
              ))}
            </div>
            {standardServices.filter(service => !currentServices.includes(service)).length === 0 && (
              <p className="text-sm text-green-600">✅ Alle branchenüblichen Leistungen erfasst</p>
            )}
          </div>
        )}

        {/* Neue Leistung hinzufügen */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h4 className="font-medium">Neue Leistung hinzufügen</h4>
          
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="z.B. Solaranlagen, Energieberatung..."
              onKeyPress={(e) => e.key === 'Enter' && addService()}
            />
            <Button onClick={addService} disabled={!newService.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Hinzufügen
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowBulkInput(!showBulkInput)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Mehrere Leistungen auf einmal
            </Button>
          </div>

          {showBulkInput && (
            <div className="space-y-2">
              <Label htmlFor="bulk-services">Mehrere Leistungen (kommagetrennt)</Label>
              <Textarea
                id="bulk-services"
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Solaranlagen, Energieberatung, Smart Home Installation..."
                className="h-20"
              />
              <div className="flex gap-2">
                <Button onClick={addBulkServices} disabled={!bulkInput.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Alle hinzufügen
                </Button>
                <Button variant="outline" onClick={() => setShowBulkInput(false)}>
                  Abbrechen
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Informationen */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 Warum sind eigene Leistungen wichtig?</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Präzise Bewertung:</strong> Vergleich Ihrer Services mit Konkurrenten</li>
            <li>• <strong>Gap-Analyse:</strong> Identifikation fehlender Leistungen</li>
            <li>• <strong>Marktposition:</strong> Bewertung Ihres Leistungsspektrums</li>
            <li>• <strong>Kundenreport:</strong> Vollständige Darstellung in der Ausgabe</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyServicesInput;
