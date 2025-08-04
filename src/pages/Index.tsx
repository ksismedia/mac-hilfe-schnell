import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useExtensionData } from '@/hooks/useExtensionData';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import ExtensionDataProcessor from '@/components/ExtensionDataProcessor';
import SavedAnalysesManager from '@/components/SavedAnalysesManager';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { Search, Globe, MapPin, Building, Star, Key, Eye, EyeOff } from 'lucide-react';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  extensionData?: any;
}

const Index = () => {
  // Stable refs to prevent unnecessary re-renders
  const [step, setStep] = useState<'business' | 'api' | 'results'>('business');
  const [businessData, setBusinessData] = useState<BusinessData>({
    address: '',
    url: '',
    industry: 'shk'
  });
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValidatingApiKey, setIsValidatingApiKey] = useState(false);
  const [loadedAnalysisId, setLoadedAnalysisId] = useState<string | undefined>();
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  
  // Extension Data Hook
  const { extensionData, isFromExtension, clearExtensionData, hasExtensionData } = useExtensionData();

  // Initialization effect - runs only once
  useEffect(() => {
    if (!isInitialized) {
      const existingKey = GoogleAPIService.getApiKey();
      if (existingKey) {
        setApiKey(existingKey);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessData.address || !businessData.url) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    // Check if API key already exists
    const existingKey = GoogleAPIService.getApiKey();
    if (existingKey) {
      setStep('results');
    } else {
      setStep('api');
    }
  };

  const handleForceApiKeyInput = () => {
    setStep('api');
  };

  const handleResetApiKey = () => {
    // Clear stored API key
    localStorage.removeItem('google_api_key');
    GoogleAPIService.setApiKey('');
    setApiKey('');
    setStep('api');
    
    toast({
      title: "API-Key zurückgesetzt",
      description: "Bitte geben Sie einen neuen API-Key ein.",
    });
  };

  const validateAndSaveApiKey = async (keyToValidate: string) => {
    setIsValidatingApiKey(true);

    try {
      const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Berlin&key=${keyToValidate}`;
      const response = await fetch(testUrl);
      const data = await response.json();

      if (response.ok && data.status === 'OK') {
        GoogleAPIService.setApiKey(keyToValidate);
        setStep('results');
        
        toast({
          title: "✅ API-Key erfolgreich",
          description: "Der Google API-Key wurde erfolgreich validiert und gespeichert.",
        });
        
        return true;
      } else {
        throw new Error(`API validation failed: ${data.status || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('API Key validation error:', error);
      toast({
        title: "❌ Ungültiger API-Key",
        description: "Der API-Key konnte nicht validiert werden. Überprüfen Sie die Eingabe.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsValidatingApiKey(false);
    }
  };

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen API-Key ein.",
        variant: "destructive",
      });
      return;
    }

    await validateAndSaveApiKey(apiKey.trim());
  };

  const handleExtensionDataProcess = (processedData: BusinessData) => {
    setBusinessData(processedData);
    setLoadedAnalysisId(undefined);
    setStep('results');
    toast({
      title: "Extension-Analyse gestartet",
      description: `Live-Daten von ${processedData.url} erfolgreich verarbeitet.`,
    });
  };

  const handleBusinessDataChange = (newBusinessData: BusinessData) => {
    setBusinessData(newBusinessData);
  };

  const handleLoadSavedAnalysis = (analysis: any) => {
    // Prevent state updates if we're already in results
    if (step === 'results' && loadedAnalysisId === analysis.id) {
      return;
    }
    
    // Set business data and analysis ID
    setBusinessData(analysis.businessData);
    setLoadedAnalysisId(analysis.id);
    setStep('results');
    
    toast({
      title: "Analyse geladen",
      description: `Die Analyse "${analysis.name}" wurde erfolgreich geladen.`,
    });
  };

  const resetToStart = () => {
    // Prevent multiple reset calls
    if (step === 'business' && !loadedAnalysisId && businessData.address === '' && businessData.url === '') {
      return;
    }
    
    setStep('business');
    setLoadedAnalysisId(undefined);
    setBusinessData({
      address: '',
      url: '',
      industry: 'shk'
    });
    clearExtensionData();
  };

  // Handle extension data if available
  if (hasExtensionData && extensionData && step === 'business') {
    return (
      <ExtensionDataProcessor
        extensionData={extensionData}
        onProcessData={handleExtensionDataProcess}
        onDiscard={clearExtensionData}
      />
    );
  }

  // Show results when ready
  if (step === 'results') {
    return (
      <AnalysisDashboard 
        businessData={businessData} 
        onReset={resetToStart}
        onBusinessDataChange={handleBusinessDataChange}
        loadedAnalysisId={loadedAnalysisId}
      />
    );
  }

  // Show API Key form
  if (step === 'api') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">🔑 Google API-Schlüssel erforderlich</h1>
            <p className="text-gray-300">Für die vollständige Analyse mit echten Daten wird ein Google API-Schlüssel benötigt.</p>
          </div>
          
          <Card className="bg-gray-800 border-yellow-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Key className="h-5 w-5" />
                Google API-Key eingeben
              </CardTitle>
              <CardDescription className="text-gray-300">
                Dieser wird sicher in Ihrem Browser gespeichert.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleApiKeySubmit} className="space-y-4">
                <div>
                  <Label htmlFor="apiKey" className="text-gray-200">Google API-Key</Label>
                  <div className="relative mt-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="pr-10 bg-gray-700 border-gray-600 text-white"
                      disabled={isValidatingApiKey}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      disabled={isValidatingApiKey}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setStep('business')}
                    className="flex-1"
                  >
                    Zurück
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isValidatingApiKey || !apiKey.trim()} 
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
                  >
                    {isValidatingApiKey ? '🔄 Validiere...' : '✅ Weiter zur Analyse'}
                  </Button>
                </div>
              </form>
              
              <div className="mt-6 p-4 bg-blue-900/20 rounded-lg border border-blue-500/30">
                <h4 className="font-medium text-blue-300 mb-2">Benötigte APIs:</h4>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Places API (für Unternehmensdaten und Bewertungen)</li>
                  <li>• PageSpeed Insights API (für Performance-Analyse)</li>
                  <li>• Geocoding API (für Standortdaten)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show business data form (default)
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header mit Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/a9346d0f-f4c9-4697-8b95-78dd3609ddd4.png" 
              alt="Handwerk Stars Logo"
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            UNNA - die Unternehmensanalyse fürs Handwerk
          </h1>
          <p className="text-xl text-gray-300">
            Potenziale und Chancen erkennen, Risiken minimieren!
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-yellow-400 text-black font-semibold">
              <Star className="h-4 w-4 mr-1" />
              Zertifizierter Partner
            </Badge>
          </div>
        </div>

        {/* API-Key Management Buttons */}
        {GoogleAPIService.hasApiKey() && (
          <div className="mb-6 text-center">
            <div className="flex justify-center gap-4 mb-4">
              <Button
                onClick={handleForceApiKeyInput}
                variant="outline"
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
              >
                <Key className="h-4 w-4 mr-2" />
                API-Key bearbeiten
              </Button>
              <Button
                onClick={handleResetApiKey}
                variant="outline"
                className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
              >
                API-Key zurücksetzen
              </Button>
            </div>
            <p className="text-sm text-green-400">✅ API-Key bereits gespeichert</p>
          </div>
        )}

        {/* Gespeicherte Analysen Button */}
        <div className="mb-6 text-center">
          <SavedAnalysesManager onLoadAnalysis={handleLoadSavedAnalysis} />
        </div>

        <Card className="mb-8 bg-gray-800 border-yellow-400/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-400">
              <Search className="h-6 w-6" />
              Betriebsdaten eingeben
            </CardTitle>
            <CardDescription className="text-gray-300">
              Geben Sie die Daten des zu analysierenden Handwerksbetriebs ein
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBusinessSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2 text-gray-200">
                    <MapPin className="h-4 w-4" />
                    Adresse des Betriebs *
                  </Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="z.B. Musterstraße 123, 12345 Musterhausen"
                    value={businessData.address}
                    onChange={(e) => setBusinessData({...businessData, address: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url" className="flex items-center gap-2 text-gray-200">
                    <Globe className="h-4 w-4" />
                    Website-URL *
                  </Label>
                  <Input
                    id="url"
                    type="text"
                    placeholder="https://www.beispiel-handwerker.de"
                    value={businessData.url}
                    onChange={(e) => setBusinessData({...businessData, url: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry" className="flex items-center gap-2 text-gray-200">
                  <Building className="h-4 w-4" />
                  Branche *
                </Label>
                <Select 
                  value={businessData.industry} 
                  onValueChange={(value: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero') => 
                    setBusinessData({...businessData, industry: value})
                  }
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Branche auswählen" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="shk">SHK (Sanitär, Heizung, Klima)</SelectItem>
                    <SelectItem value="maler">Maler und Lackierer</SelectItem>
                    <SelectItem value="elektriker">Elektriker</SelectItem>
                    <SelectItem value="dachdecker">Dachdecker</SelectItem>
                    <SelectItem value="stukateur">Stukateure</SelectItem>
                    <SelectItem value="planungsbuero">Planungsbüro Versorgungstechnik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold" 
                size="lg"
              >
                Weiter zur Analyse
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feature Grid nach neuer Kategoriestruktur */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-yellow-400 text-center mb-6">
            Umfassende Analyse in 4 Hauptkategorien
          </h2>
          
          {/* SEO & Content Kategorie */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              🔍 SEO & Content Analyse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: "SEO-Auswertung", icon: "🔍", desc: "Title-Tags, Meta Description, Überschriften" },
                { title: "Keywords", icon: "🎯", desc: "Branchenspezifische Keywords und Dichte" },
                { title: "Lokale SEO", icon: "📍", desc: "Google My Business und Citations" },
                { title: "Content-Qualität", icon: "📝", desc: "Qualität und Relevanz der Inhalte" },
                { title: "Backlinks", icon: "🔗", desc: "Interne und externe Verlinkungen" },
                { title: "Barrierefreiheit", icon: "♿", desc: "Zugänglichkeit und WCAG-Standards" },
                { title: "Datenschutz", icon: "🔒", desc: "DSGVO-Konformität und Cookies" },
                { title: "Impressum", icon: "📄", desc: "Rechtliche Vollständigkeit" },
                { title: "Konkurrenz", icon: "⚔️", desc: "Vergleich mit lokalen Mitbewerbern" },
                { title: "Branche", icon: "🏗️", desc: "Spezifische Inhaltsanalyse" }
              ].map((feature, index) => (
                <Card key={index} className="bg-gray-800 border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-yellow-400 text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Performance & Technik Kategorie */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              ⚡ Performance & Technik
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Website-Performance", icon: "⚡", desc: "Ladezeiten und Geschwindigkeit" },
                { title: "Mobile-Optimierung", icon: "📱", desc: "Responsive Design und Touch-Bedienung" },
                { title: "Conversion-Optimierung", icon: "🎯", desc: "Call-to-Actions und Kontaktmöglichkeiten" }
              ].map((feature, index) => (
                <Card key={index} className="bg-gray-800 border-green-400/20 hover:border-green-400/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-green-400 text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Social Media & Online-Präsenz Kategorie */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              📱 Social Media & Online-Präsenz
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { title: "Social Media", icon: "📲", desc: "Facebook, Instagram, LinkedIn Profile" },
                { title: "Google-Bewertungen", icon: "⭐", desc: "Bewertungen und Rezensionen" },
                { title: "Social Proof", icon: "👥", desc: "Testimonials und Vertrauenssignale" },
                { title: "Arbeitsplatz-Bewertungen", icon: "💼", desc: "Kununu und andere HR-Plattformen" },
                { title: "Social Media Analyse", icon: "📊", desc: "Detaillierte Social Media Auswertung" }
              ].map((feature, index) => (
                <Card key={index} className="bg-gray-800 border-blue-400/20 hover:border-blue-400/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-blue-400 text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Personal & Service Kategorie */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              👥 Personal & Kundenservice
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Mitarbeiterqualifikation", icon: "🎓", desc: "Ausbildung, Zertifikate, Weiterbildung" },
                { title: "Stundensatz-Analyse", icon: "💰", desc: "Marktvergleich und Positionierung" },
                { title: "Unternehmensidentität", icon: "🏢", desc: "Corporate Identity und Branding" },
                { title: "Kundenservice", icon: "📞", desc: "Reaktionszeit auf Anfragen" }
              ].map((feature, index) => (
                <Card key={index} className="bg-gray-800 border-purple-400/20 hover:border-purple-400/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-purple-400 text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Zusammenfassung */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-400/30">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-yellow-400 mb-3">
                Gesamtbewertung als Durchschnitt aller Kategorien
              </h3>
              <p className="text-gray-300">
                Jede Kategorie wird mit maximal 100 Punkten bewertet. Der Gesamtscore errechnet sich als 
                Durchschnitt der verfügbaren Kategorien, sodass Sie eine faire und ausgewogene Bewertung erhalten.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
