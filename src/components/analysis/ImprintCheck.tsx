
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, AlertCircle, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface ImprintCheckProps {
  url: string;
  realData: RealBusinessData;
  onManualDataChange?: (data: ManualImprintData | null) => void;
  initialManualData?: ManualImprintData | null;
}

interface ManualImprintData {
  found: boolean;
  elements: string[];
}

const requiredElements = [
  'Firmenname',
  'Rechtsform',
  'Geschäftsführer/Inhaber',
  'Adresse',
  'Telefonnummer',
  'E-Mail-Adresse',
  'Handelsregisternummer',
  'Steuernummer',
  'USt-IdNr.',
  'Kammerzugehörigkeit',
  'Berufsbezeichnung',
  'Aufsichtsbehörde'
];

const ImprintCheck: React.FC<ImprintCheckProps> = ({ 
  url, 
  realData, 
  onManualDataChange,
  initialManualData 
}) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualData, setManualData] = useState<ManualImprintData | null>(initialManualData || null);
  const [selectedElements, setSelectedElements] = useState<string[]>(initialManualData?.elements || []);
  const { toast } = useToast();

  // Initialize selected elements when initialManualData changes
  useEffect(() => {
    if (initialManualData) {
      setManualData(initialManualData);
      setSelectedElements(initialManualData.elements);
    }
  }, [initialManualData]);

  // Informiere Parent-Komponente über Änderungen
  useEffect(() => {
    if (onManualDataChange) {
      onManualDataChange(manualData);
    }
  }, [manualData, onManualDataChange]);

  const handleElementChange = (element: string, checked: boolean) => {
    if (checked) {
      setSelectedElements([...selectedElements, element]);
    } else {
      setSelectedElements(selectedElements.filter(e => e !== element));
    }
  };

  const handleManualSubmit = () => {
    const newManualData: ManualImprintData = {
      found: selectedElements.length > 0,
      elements: selectedElements
    };
    setManualData(newManualData);
    setShowManualInput(false);
    toast({
      title: "Impressum-Daten aktualisiert",
      description: `${selectedElements.length} Elemente wurden manuell bestätigt.`,
    });
  };

  // Verwende manuelle Daten falls vorhanden, sonst automatische Erkennung
  const imprintData = manualData ? {
    found: manualData.found,
    foundElements: manualData.elements,
    missingElements: requiredElements.filter(e => !manualData.elements.includes(e)),
    completeness: Math.round((manualData.elements.length / requiredElements.length) * 100),
    score: Math.round((manualData.elements.length / requiredElements.length) * 100)
  } : realData.imprint;

  const getStatusIcon = (present: boolean) => {
    return present ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Impressumsprüfung
            <div className="flex gap-3 items-center">
              <Badge variant={manualData ? "default" : "secondary"}>
                {manualData ? "✓ Manuell geprüft" : "Automatisch erkannt"}
              </Badge>
              <Badge variant={imprintData.score >= 80 ? "default" : imprintData.score >= 60 ? "secondary" : "destructive"}>
                {imprintData.score}/100 Punkte
              </Badge>
              <Button
                variant={showManualInput ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowManualInput(!showManualInput)}
                className="bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 min-w-[120px]"
              >
                <Edit className="h-4 w-4 mr-2" />
                {showManualInput ? "Abbrechen" : "Manuell prüfen"}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {manualData 
              ? `Manuell geprüfte Impressum-Vollständigkeit für ${url}`
              : `Live-Analyse der rechtlichen Vollständigkeit für ${url}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showManualInput ? (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Manuell prüfen</h4>
                <p className="text-sm text-blue-800">
                  Prüfen Sie Ihr Impressum auf {url} und markieren Sie alle vorhandenen Elemente:
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requiredElements.map((element) => (
                  <div key={element} className="flex items-center space-x-2">
                    <Checkbox
                      id={element}
                      checked={selectedElements.includes(element)}
                      onCheckedChange={(checked) => handleElementChange(element, checked as boolean)}
                    />
                    <Label htmlFor={element} className="text-sm">{element}</Label>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleManualSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2"
                >
                  Prüfung abschließen ({selectedElements.length} Elemente)
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowManualInput(false)}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-6 py-2"
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Gesamtübersicht */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {imprintData.found ? '✓' : '✗'}
                  </div>
                  <p className="text-sm text-gray-600">
                    Impressum gefunden
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {imprintData.completeness}%
                  </div>
                  <p className="text-sm text-gray-600">
                    Vollständigkeit
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 mb-2">
                    {imprintData.foundElements.length}
                  </div>
                  <p className="text-sm text-gray-600">
                    Vorhandene Elemente
                  </p>
                </div>
              </div>

              <Progress value={imprintData.completeness} className="h-3" />

              {/* Gefundene Elemente */}
              {imprintData.foundElements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Vorhandene Angaben {manualData ? "(Manuell bestätigt)" : "(Automatisch erkannt)"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {imprintData.foundElements.map((element, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{element}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Fehlende Elemente */}
              {imprintData.missingElements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-red-600">
                      Fehlende Angaben
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {imprintData.missingElements.map((element, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm">{element}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Datenquelle Hinweis */}
              <div className={`${manualData ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} rounded-lg p-4`}>
                <h4 className={`font-semibold ${manualData ? 'text-green-800' : 'text-blue-800'} mb-2`}>
                  {manualData ? "✓ Manuell geprüfte Daten" : "✓ Live-Impressumsanalyse"}
                </h4>
                <p className={`text-sm ${manualData ? 'text-green-700' : 'text-blue-700'}`}>
                  {manualData 
                    ? `Die Impressum-Analyse basiert auf Ihrer manuellen Prüfung der Website ${url}.`
                    : `Diese Analyse basiert auf dem tatsächlichen Inhalt Ihrer Website ${url}. Alle gefundenen und fehlenden Elemente wurden automatisch erkannt.`
                  }
                </p>
              </div>

              {/* Verbesserungsempfehlungen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Empfehlungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {imprintData.missingElements.map((element, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">{element} hinzufügen</span>
                      </div>
                    ))}
                    {imprintData.foundElements.map((element, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{element} ist vorhanden</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImprintCheck;
