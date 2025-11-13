
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Key, Info, Trash2 } from 'lucide-react';
import SavedAnalysesManager from './SavedAnalysesManager';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface APIKeyManagerProps {
  onApiKeySet: () => void;
  onLoadSavedAnalysis?: (analysis: any) => void;
}

const USER_API_KEY_STORAGE = 'user_google_api_key';

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ onApiKeySet, onLoadSavedAnalysis }) => {
  const [userApiKey, setUserApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has their own API key stored
    const stored = localStorage.getItem(USER_API_KEY_STORAGE);
    if (stored) {
      setUserApiKey(stored);
      setHasStoredKey(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!userApiKey.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen gültigen API-Key ein.",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem(USER_API_KEY_STORAGE, userApiKey.trim());
    setHasStoredKey(true);
    
    toast({
      title: "✅ API-Key gespeichert",
      description: "Ihr persönlicher Google API-Key wird nun verwendet. Sie haben eigene Rate-Limits (240 Anfragen/Min).",
    });
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem(USER_API_KEY_STORAGE);
    setUserApiKey('');
    setHasStoredKey(false);
    
    toast({
      title: "API-Key entfernt",
      description: "Der zentrale API-Key wird nun verwendet (gemeinsame Rate-Limits).",
    });
  };

  const handleContinue = () => {
    onApiKeySet();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Google API-Key Verwaltung
          </CardTitle>
          <CardDescription>
            Verwenden Sie Ihren eigenen API-Key für höhere Rate-Limits oder nutzen Sie den zentralen Key.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Empfehlung:</strong> Verwenden Sie Ihren eigenen Google API-Key für unbegrenzte Analysen ohne Wartezeiten.
              Ohne eigenen Key teilen sich alle Nutzer die Rate-Limits des zentralen Keys.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">
                Ihr persönlicher Google API-Key (optional)
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={userApiKey}
                    onChange={(e) => setUserApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button 
                  onClick={handleSaveApiKey}
                  variant={hasStoredKey ? "secondary" : "default"}
                >
                  {hasStoredKey ? 'Aktualisieren' : 'Speichern'}
                </Button>
                {hasStoredKey && (
                  <Button 
                    onClick={handleRemoveApiKey}
                    variant="destructive"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  → API-Key erstellen in der Google Cloud Console
                </a>
              </p>
            </div>

            {hasStoredKey && (
              <Alert className="bg-green-50 border-green-200">
                <Info className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Ihr eigener API-Key ist aktiv. Sie haben eigene Rate-Limits (240 Anfragen/Min).
                </AlertDescription>
              </Alert>
            )}

            {!hasStoredKey && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <Info className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  ⚠️ Kein eigener API-Key gespeichert. Der zentrale Key wird verwendet (gemeinsame Rate-Limits).
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={handleContinue} className="w-full" size="lg">
              Zur Analyse fortfahren
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Mit dem API-Key werden analysiert:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Places API (Unternehmensdaten und Bewertungen)</li>
              <li>✓ PageSpeed Insights API (Performance, SEO, Accessibility)</li>
              <li>✓ Geocoding API (Standortdaten für Wettbewerber)</li>
              <li>✓ Nearby Search API (Wettbewerbsanalyse)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {onLoadSavedAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Oder gespeicherte Analyse laden</CardTitle>
            <CardDescription>
              Laden Sie eine zuvor gespeicherte Analyse.
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

// Export helper function to get user API key
export const getUserApiKey = (): string | null => {
  return localStorage.getItem(USER_API_KEY_STORAGE);
};
