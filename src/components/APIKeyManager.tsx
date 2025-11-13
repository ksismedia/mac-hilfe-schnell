
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
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
      console.log('Validating API key format...', apiKey.substring(0, 10) + '...');
      
      // Sehr einfache Format-Validierung für Google API Keys
      if (!apiKey || apiKey.length < 10) {
        throw new Error('API-Key ist zu kurz');
      }
      
      if (!apiKey.startsWith('AIza')) {
        console.warn('API-Key beginnt nicht mit AIza, aber wir akzeptieren ihn trotzdem');
      }
      
      // API-Key setzen
      GoogleAPIService.setApiKey(apiKey);
      console.log('API key saved successfully');
      
      toast({
        title: "API-Key gespeichert",
        description: "Der Google API-Key wurde erfolgreich gespeichert.",
      });
      
      // Kurze Verzögerung und dann weiterleiten
      setTimeout(() => {
        onApiKeySet();
      }, 100);
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
            <h4 className="font-medium text-blue-900 mb-2">Mit Ihrem API-Key werden automatisch analysiert:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Places API (Unternehmensdaten und Bewertungen)</li>
              <li>✓ PageSpeed Insights API (Performance, SEO, Accessibility)</li>
              <li>✓ Geocoding API (Standortdaten für Wettbewerber)</li>
            </ul>
          </div>
          
          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">Manuelle Eingabe erforderlich für:</h4>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Conversion-Daten (Call-to-Actions, Kontaktmethoden)</li>
              <li>• Detaillierte Content-Analyse</li>
              <li>• Spezifische Branchendaten</li>
            </ul>
            <p className="text-xs text-amber-700 mt-2">
              Hinweis: Für automatische Conversion-Tracking würde Google Analytics 4 benötigt werden.
            </p>
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
