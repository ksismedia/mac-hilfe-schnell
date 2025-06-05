
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { Key, CheckCircle, ExternalLink } from 'lucide-react';

interface APIKeyManagerProps {
  onApiKeySet: () => void;
}

const APIKeyManager: React.FC<APIKeyManagerProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const validateAndSetApiKey = async () => {
    if (!apiKey.trim()) return;

    setIsValidating(true);
    
    try {
      // Test API Key mit einer einfachen Geocoding-Anfrage
      const testResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=Berlin&key=${apiKey.trim()}`
      );

      if (testResponse.ok) {
        const data = await testResponse.json();
        if (data.status === 'OK') {
          GoogleAPIService.setApiKey(apiKey.trim());
          setIsValid(true);
          setTimeout(() => {
            onApiKeySet();
          }, 1000);
        } else {
          throw new Error('Invalid API key');
        }
      } else {
        throw new Error('API key validation failed');
      }
    } catch (error) {
      console.error('API key validation error:', error);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Google API Konfiguration</CardTitle>
          <CardDescription>
            Geben Sie Ihren Google API Key ein, um echte Daten zu analysieren
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">Google API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={isValidating}
            />
          </div>

          <Button 
            onClick={validateAndSetApiKey}
            disabled={!apiKey.trim() || isValidating}
            className="w-full"
          >
            {isValidating ? 'Validiere...' : 'API Key setzen'}
          </Button>

          {isValid && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                API Key erfolgreich validiert! Analyse wird gestartet...
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-blue-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-blue-900">Benötigte APIs:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Places API (Firmendetails & Bewertungen)</li>
              <li>• PageSpeed Insights API (Performance)</li>
              <li>• Geocoding API (Standortdaten)</li>
            </ul>
            <a 
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-3 w-3" />
              Google Cloud Console
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIKeyManager;
