
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
  const { toast } = useToast();

  useEffect(() => {
    // API Key wird jetzt serverseitig verwaltet
    toast({
      title: "Info",
      description: "API-Key wird jetzt serverseitig in Supabase verwaltet. Diese Seite ist nicht mehr notwendig.",
    });
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Info",
      description: "API-Key wird jetzt serverseitig verwaltet. Weiterleitung zur Analyse...",
    });
    
    setTimeout(() => {
      onApiKeySet();
    }, 100);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Google API-Key (Serverseitig)
          </CardTitle>
          <CardDescription>
            Der Google API-Key wird jetzt sicher serverseitig in Supabase verwaltet.
            Sie können direkt mit der Analyse fortfahren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Button type="submit" className="w-full">
              Zur Analyse fortfahren
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Mit dem serverseitigen API-Key werden automatisch analysiert:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Places API (Unternehmensdaten und Bewertungen)</li>
              <li>✓ PageSpeed Insights API (Performance, SEO, Accessibility)</li>
              <li>✓ Geocoding API (Standortdaten für Wettbewerber)</li>
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
