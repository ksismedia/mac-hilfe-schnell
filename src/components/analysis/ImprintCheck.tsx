
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useManualDataContext } from '@/contexts/ManualDataContext';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { CheckCircle, XCircle, AlertTriangle, Edit3, Save, X } from 'lucide-react';

interface ImprintCheckProps {
  url: string;
  realData: RealBusinessData;
}

const ImprintCheck: React.FC<ImprintCheckProps> = ({ url, realData }) => {
  const { manualImprintData, updateImprintData } = useManualDataContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    found: false,
    elements: [] as string[]
  });

  useEffect(() => {
    if (manualImprintData) {
      setEditData(manualImprintData);
    } else {
      setEditData({
        found: realData.imprint.found,
        elements: realData.imprint.elements || []
      });
    }
  }, [manualImprintData, realData]);

  const handleSave = () => {
    updateImprintData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (manualImprintData) {
      setEditData(manualImprintData);
    } else {
      setEditData({
        found: realData.imprint.found,
        elements: realData.imprint.elements || []
      });
    }
    setIsEditing(false);
  };

  const handleAddElement = () => {
    setEditData({
      ...editData,
      elements: [...editData.elements, '']
    });
  };

  const handleRemoveElement = (index: number) => {
    setEditData({
      ...editData,
      elements: editData.elements.filter((_, i) => i !== index)
    });
  };

  const handleElementChange = (index: number, value: string) => {
    const newElements = [...editData.elements];
    newElements[index] = value;
    setEditData({
      ...editData,
      elements: newElements
    });
  };

  // Verwende manuelle Daten wenn verfügbar, sonst Analysedaten
  const currentData = manualImprintData || {
    found: realData.imprint.found,
    elements: realData.imprint.elements || []
  };

  const score = currentData.found ? 100 : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              📄 Impressumsprüfung
              {manualImprintData && (
                <Badge variant="outline" className="text-blue-600 bg-blue-50">
                  Manuell bearbeitet
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Rechtliche Vollständigkeit der Anbieterkennzeichnung für {url}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
              {score}/100
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              {isEditing ? 'Abbrechen' : 'Bearbeiten'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hauptbewertung */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-3">
            {currentData.found ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
            <Badge variant={getScoreBadge(score)} className="text-lg px-4 py-2">
              {currentData.found ? 'Impressum gefunden' : 'Impressum fehlt'}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            {currentData.found ? 
              `${currentData.elements.length} Pflichtangaben identifiziert` : 
              'Keine Impressums-Seite gefunden'
            }
          </div>
        </div>

        {/* Bearbeitungsmodus */}
        {isEditing && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-yellow-900">Manuelle Eingabe</h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={editData.found}
                onCheckedChange={(checked) => setEditData({ ...editData, found: checked })}
              />
              <Label>Impressum vorhanden</Label>
            </div>

            {editData.found && (
              <div className="space-y-3">
                <Label>Gefundene Impressums-Elemente:</Label>
                {editData.elements.map((element, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={element}
                      onChange={(e) => handleElementChange(index, e.target.value)}
                      placeholder="z.B. Firmenname, Adresse, Telefon..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveElement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={handleAddElement}
                  className="w-full"
                >
                  Element hinzufügen
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {/* Detaillierte Analyse */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detaillierte Analyse</h3>
          
          {currentData.found ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">✓ Gefundene Elemente</h4>
                <ul className="space-y-1 text-sm text-green-800">
                  {currentData.elements.map((element, index) => (
                    <li key={index}>• {element}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">✗ Impressum nicht gefunden</h4>
              <p className="text-sm text-red-800">
                Es konnte keine Impressums-Seite identifiziert werden. Dies kann rechtliche Konsequenzen haben.
              </p>
            </div>
          )}
        </div>

        {/* Empfehlungen */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Empfehlungen</h3>
          <div className="space-y-2 text-sm text-blue-800">
            {currentData.found ? (
              <div>
                <p className="font-medium">Das Impressum ist vorhanden. Stellen Sie sicher, dass es vollständig ist:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Vollständiger Name und Anschrift des Dienstanbieters</li>
                  <li>Telefonnummer und E-Mail-Adresse</li>
                  <li>Handelsregistereintrag (falls vorhanden)</li>
                  <li>Umsatzsteuer-Identifikationsnummer</li>
                  <li>Zuständige Aufsichtsbehörde (bei erlaubnispflichtigen Tätigkeiten)</li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="font-medium">Dringend erforderlich: Impressum erstellen und einbinden</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Impressum-Seite erstellen mit allen Pflichtangaben</li>
                  <li>Link im Footer und/oder Hauptmenü platzieren</li>
                  <li>Deutlich als "Impressum" oder "Anbieterkennzeichnung" bezeichnen</li>
                  <li>Von jeder Seite aus maximal 2 Klicks erreichbar</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImprintCheck;
