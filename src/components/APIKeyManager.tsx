
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { Eye, EyeOff, Key } from 'lucide-react';
import SavedAnalysesManager from './SavedAnalysesManager';

interface APIKeyManagerProps {
  onApiKeySet: () => void;
  onLoadSavedAnalysis?: (analysis: any) => void;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ onApiKeySet, onLoadSavedAnalysis }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Prüfe ob bereits ein API-Key gespeichert ist
    const savedKey = GoogleAPIService.getApiKey();
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen API-Key ein.",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);

    try {
      console.log('Validating API key format...');
      
      // Einfache Format-Validierung für Google API Keys
      if (!apiKey.startsWith('AIza')) {
        throw new Error('Google API-Keys beginnen mit "AIza"');
      }
      
      if (apiKey.length < 35 || apiKey.length > 45) {
        throw new Error('Google API-Keys haben normalerweise 39 Zeichen');
      }
      
      // API-Key setzen
      GoogleAPIService.setApiKey(apiKey);
      console.log('API key saved successfully');
      
      toast({
        title: "API-Key gespeichert",
        description: "Der Google API-Key wurde erfolgreich gespeichert und wird bei der Analyse validiert.",
      });
      
      onApiKeySet();
    } catch (error) {
      console.error('API-Key Validierung fehlgeschlagen:', error);
      toast({
        title: "Ungültiger API-Key",
        description: error.message || "Bitte überprüfen Sie das Format Ihres Google API-Keys.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Google API-Key erforderlich
          </CardTitle>
          <CardDescription>
            Für die Live-Analyse mit echten Google-Daten wird ein Google API-Key benötigt. 
            Dieser wird sicher in Ihrem Browser gespeichert.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="apiKey">Google API-Key</Label>
              <div className="relative mt-1">
                <Input
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={isValidating} className="w-full">
              {isValidating ? 'Validiere API-Key...' : 'API-Key validieren und Analyse starten'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Benötigte APIs:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Places API (für Unternehmensdaten und Bewertungen)</li>
              <li>• PageSpeed Insights API (für Performance-Analyse)</li>
              <li>• Geocoding API (für Standortdaten)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {onLoadSavedAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Oder gespeicherte Analyse laden</CardTitle>
            <CardDescription>
              Laden Sie eine zuvor gespeicherte Analyse, ohne einen neuen API-Key zu benötigen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SavedAnalysesManager onLoadAnalysis={onLoadSavedAnalysis} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default APIKeyManager;
