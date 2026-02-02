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
import { Search, Globe, MapPin, Building, Star, Key, Eye, EyeOff, LogIn, LogOut, User, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSavedAnalyses, SavedAnalysis } from '@/hooks/useSavedAnalyses';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung' | 'innenausbau';
  extensionData?: any;
}

const Index = () => {
  const navigate = useNavigate();
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
  const [user, setUser] = useState<any>(null);
  const [analysisToLoad, setAnalysisToLoad] = useState<SavedAnalysis | null>(null);
  const { toast } = useToast();
  
  // Extension Data Hook
  const { extensionData, isFromExtension, clearExtensionData, hasExtensionData } = useExtensionData();
  
  // Removed useSavedAnalyses dependency - using direct context approach

  // Authentication useEffect
  useEffect(() => {
    console.log('Setting up auth listeners...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'Session exists:', !!session, 'User ID:', session?.user?.id);
      setUser(session?.user ?? null);
    });

    // Immediate session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check - Session exists:', !!session, 'User ID:', session?.user?.id);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initialization effect - runs only once
  useEffect(() => {
    if (!isInitialized) {
      const existingKey = GoogleAPIService.getApiKey();
      if (existingKey) {
        setApiKey(existingKey);
      }
      
      // Clean any analysis URL parameters immediately
      const url = new URL(window.location.href);
      if (url.searchParams.has('loadAnalysis') || url.searchParams.has('load') || url.searchParams.has('analysisId')) {
        url.searchParams.delete('loadAnalysis');
        url.searchParams.delete('load');
        url.searchParams.delete('analysisId');
        window.history.replaceState({}, '', url.toString());
        console.log('Cleaned analysis URL parameters');
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

    // Clear any loaded analysis when starting new analysis
    setAnalysisToLoad(null);

    // Check if API key already exists
    const existingKey = GoogleAPIService.getApiKey();
    console.log('Existing API key found:', !!existingKey);
    
    if (existingKey && existingKey.length > 0) {
      console.log('Moving to results with existing API key');
      setStep('results');
    } else {
      console.log('No valid API key found, requesting API key input');
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
    console.log('Validating API key...');

    try {
      // Use CORS proxy for API validation
      const testUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=Berlin&key=${keyToValidate}`;
      const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(testUrl)}`;
      
      console.log('Testing API key with URL:', proxiedUrl);
      const response = await fetch(proxiedUrl);
      
      if (!response.ok) {
        console.error('Network error:', response.status, response.statusText);
        throw new Error(`Network error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API validation response:', data);

      if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
        console.log('API key is valid, saving...');
        GoogleAPIService.setApiKey(keyToValidate);
        setApiKey(keyToValidate);
        
        // Clear any loaded analysis when starting new analysis
        setAnalysisToLoad(null);
        
        console.log('Moving to results step...');
        setStep('results');
        
        toast({
          title: "✅ API-Key erfolgreich",
          description: "Der Google API-Key wurde erfolgreich validiert und gespeichert.",
        });
        
        return true;
      } else {
        console.error('API validation failed with status:', data.status);
        throw new Error(`API validation failed: ${data.status || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('API Key validation error:', error);
      toast({
        title: "❌ Ungültiger API-Key",
        description: "Der API-Key konnte nicht validiert werden. Überprüfen Sie die Eingabe und Internetverbindung.",
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

  // Removed handleBusinessDataChange - not needed as business data is stable during analysis

  const handleLoadSavedAnalysis = (analysis: SavedAnalysis) => {
    console.log('Loading analysis:', analysis.name);
    setBusinessData(analysis.businessData);
    setAnalysisToLoad(analysis);  // Store complete analysis
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
    setAnalysisToLoad(null);  // Clear loaded analysis
    setBusinessData({
      address: '',
      url: '',
      industry: 'shk'
    });
    clearExtensionData();
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Fehler beim Abmelden",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Sie wurden erfolgreich abgemeldet.",
      });
    }
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
        analysisData={analysisToLoad}  // Pass complete analysis
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

        {/* Authentication and Saved Analyses */}
        <div className="mb-6">
          {/* Auth Status Banner */}
          {!user && (
            <div className="mb-4 p-4 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-center">
              <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Analysen werden nur lokal gespeichert</h3>
              <p className="text-gray-300 text-sm mb-3">
                Ohne Anmeldung gehen Ihre Analysen beim Schließen des Browsers verloren.
              </p>
              <Button variant="outline" onClick={() => navigate('/auth')} className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black">
                <LogIn className="h-4 w-4 mr-2" />
                Jetzt anmelden für dauerhafte Speicherung
              </Button>
            </div>
          )}
          
          <div className="text-center">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
              <SavedAnalysesManager onLoadAnalysis={handleLoadSavedAnalysis} />
              {user ? (
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Badge variant="outline" className="flex items-center gap-2 bg-green-500/20 border-green-500 text-green-400">
                    <User className="h-3 w-3" />
                    ✅ Angemeldet: {user.email}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate('/compliance')}>
                    <Shield className="h-4 w-4 mr-2" />
                    Compliance
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Abmelden
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Anmelden
                </Button>
              )}
            </div>
          </div>
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
                  onValueChange={(value: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung' | 'innenausbau') => 
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
                    <SelectItem value="facility-management">Facility-Management & Gebäudereinigung</SelectItem>
                    <SelectItem value="holzverarbeitung">Holzverarbeitung (Schreiner/Tischler)</SelectItem>
                    <SelectItem value="baeckerei">Bäckereifachbetrieb</SelectItem>
                    <SelectItem value="blechbearbeitung">Blechbearbeitung/Klempnerei</SelectItem>
                    <SelectItem value="innenausbau">Innenausbau</SelectItem>
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
            Umfassende Analyse in 6 Hauptkategorien
          </h2>
          
          {/* Online-Qualität · Relevanz · Autorität */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              🔍 Online-Qualität · Relevanz · Autorität
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

          {/* Webseiten-Performance & Technik */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              ⚡ Webseiten-Performance & Technik
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

          {/* Online-/Web-/Social-Media Performance */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              📱 Online-/Web-/Social-Media Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { title: "Social Media", icon: "📲", desc: "Facebook, Instagram, LinkedIn Profile" },
                { title: "Social Proof", icon: "👥", desc: "Testimonials und Vertrauenssignale" },
                { title: "Social Media Analyse", icon: "📊", desc: "Detaillierte Social Media Auswertung" },
                { title: "Google-Bewertungen", icon: "⭐", desc: "Bewertungen und Rezensionen" },
                { title: "Branchenplattformen", icon: "🏆", desc: "MyHammer, 11880, ProvenExpert" },
                { title: "Online-Präsenz", icon: "🔍", desc: "Google Bilder, Videos & Shorts" }
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

          {/* Markt & Marktumfeld */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              📈 Markt & Marktumfeld
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: "Stundensatzanalyse", icon: "💰", desc: "Marktvergleich und Positionierung" },
                { title: "Mitarbeiterqualifikation", icon: "🎓", desc: "Ausbildung, Zertifikate, Weiterbildung" },
                { title: "Wettbewerbsanalyse", icon: "⚔️", desc: "Vergleich mit lokalen Mitbewerbern" },
                { title: "Arbeitsplatz-Bewertungen", icon: "💼", desc: "Kununu und andere HR-Plattformen" }
              ].map((feature, index) => (
                <Card key={index} className="bg-gray-800 border-orange-400/20 hover:border-orange-400/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-orange-400 text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Außendarstellung & Erscheinungsbild */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              🎨 Außendarstellung & Erscheinungsbild
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {[
                { title: "Corporate Design", icon: "🏢", desc: "Corporate Design und Branding" }
              ].map((feature, index) => (
                <Card key={index} className="bg-gray-800 border-pink-400/20 hover:border-pink-400/40 transition-colors">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl mb-2">{feature.icon}</div>
                    <h3 className="font-semibold text-pink-400 text-sm mb-1">{feature.title}</h3>
                    <p className="text-xs text-gray-400">{feature.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Qualität · Service · Kundenorientierung */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-yellow-300 mb-4 flex items-center gap-2">
              📞 Qualität · Service · Kundenorientierung
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {[
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
