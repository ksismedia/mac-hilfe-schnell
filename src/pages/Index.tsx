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
import APIKeyManager from '@/components/APIKeyManager';
import { GoogleAPIService } from '@/services/GoogleAPIService';
import { Search, Globe, MapPin, Building, Star, FolderOpen } from 'lucide-react';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  extensionData?: any;
}

const Index = () => {
  const [businessData, setBusinessData] = useState<BusinessData>({
    address: '',
    url: '',
    industry: 'shk'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [loadedAnalysisId, setLoadedAnalysisId] = useState<string | undefined>();
  const { toast } = useToast();
  
  // Extension Data Hook
  const { extensionData, isFromExtension, clearExtensionData, hasExtensionData } = useExtensionData();

  // Check API key on mount
  useEffect(() => {
    if (!GoogleAPIService.hasApiKey()) {
      setNeedsApiKey(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessData.address || !businessData.url) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive",
      });
      return;
    }

    startAnalysis();
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
      toast({
        title: "Analyse abgeschlossen",
        description: "Die Auswertung des Online-Auftritts wurde erfolgreich durchgeführt.",
      });
    }, 1000);
  };

  const handleApiKeySet = () => {
    setNeedsApiKey(false);
    toast({
      title: "API-Schlüssel gesetzt",
      description: "Die Analyse wird mit echten Google-Daten durchgeführt.",
    });
  };

  const handleContinueWithoutApiKey = () => {
    setNeedsApiKey(false);
    toast({
      title: "Fortfahren ohne API-Schlüssel",
      description: "Die Analyse wird mit Beispieldaten durchgeführt.",
    });
  };

  const handleExtensionDataProcess = (processedData: BusinessData) => {
    console.log('Extension-Daten verarbeitet:', processedData);
    setBusinessData(processedData);
    setLoadedAnalysisId(undefined); // Clear any loaded analysis
    
    // Check for API key before starting analysis
    if (!GoogleAPIService.hasApiKey()) {
      setNeedsApiKey(true);
      return;
    }
    
    setShowResults(true);
    toast({
      title: "Extension-Analyse gestartet",
      description: `Live-Daten von ${processedData.url} erfolgreich verarbeitet.`,
    });
  };

  const handleBusinessDataChange = (newBusinessData: BusinessData) => {
    console.log('Business data updated from saved analysis:', newBusinessData);
    setBusinessData(newBusinessData);
  };

  const handleLoadSavedAnalysis = (analysis: any) => {
    console.log('Loading saved analysis on main page:', analysis);
    
    // Setze die Business-Daten aus der gespeicherten Analyse
    if (analysis.businessData) {
      setBusinessData(analysis.businessData);
    }
    
    // Setze die Analysis-ID für das Dashboard
    setLoadedAnalysisId(analysis.id);
    
    // Zeige das Dashboard an
    setShowResults(true);
    
    toast({
      title: "Analyse geladen",
      description: `Die Analyse "${analysis.name}" wurde erfolgreich geladen.`,
    });
  };

  const resetAnalysis = () => {
    setShowResults(false);
    setNeedsApiKey(false);
    setLoadedAnalysisId(undefined);
    setBusinessData({
      address: '',
      url: '',
      industry: 'shk'
    });
    clearExtensionData();
  };

  // Show API Key dialog first if needed
  if (needsApiKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <div className="max-w-4xl mx-auto pt-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-yellow-400 mb-2">Google API-Schlüssel erforderlich</h1>
            <p className="text-gray-300">Für die vollständige Analyse mit echten Daten wird ein Google API-Schlüssel benötigt.</p>
          </div>
          
          <APIKeyManager onApiKeySet={handleApiKeySet} />
          
          <div className="mt-6 text-center">
            <Button 
              onClick={handleContinueWithoutApiKey}
              variant="outline"
            >
              Ohne API-Schlüssel fortfahren (mit Beispieldaten)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-yellow-400 mb-2">Website wird analysiert...</h2>
            <p className="text-gray-300">Dies kann einige Sekunden dauern</p>
          </div>
        </div>
      </div>
    );
  }

  // Zeige Extension-Datenverarbeitung wenn verfügbar
  if (hasExtensionData && extensionData && !showResults) {
    return (
      <ExtensionDataProcessor
        extensionData={extensionData}
        onProcessData={handleExtensionDataProcess}
        onDiscard={clearExtensionData}
      />
    );
  }

  // Zeige Analyse-Dashboard wenn Ergebnisse vorhanden
  if (showResults) {
    return (
      <AnalysisDashboard 
        businessData={businessData} 
        onReset={resetAnalysis}
        onBusinessDataChange={handleBusinessDataChange}
        loadedAnalysisId={loadedAnalysisId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header mit Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/lovable-uploads/5a2019ec-f8dd-42b4-bf03-3a7fdb9696b8.png" 
              alt="Handwerk Stars Logo" 
              className="h-32 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            Social Listening und Monitoring
          </h1>
          <p className="text-xl text-gray-300">
            Professionelle Bewertung von Webseite, Google-Bewertungen und Social-Media-Kanälen
          </p>
          <div className="mt-4">
            <Badge variant="secondary" className="bg-yellow-400 text-black font-semibold">
              <Star className="h-4 w-4 mr-1" />
              Zertifizierter Partner
            </Badge>
          </div>
        </div>

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
            <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={isAnalyzing}
                size="lg"
              >
                {isAnalyzing ? "Analyse läuft..." : "Online-Auftritt analysieren"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {[
            { title: "SEO-Auswertung", icon: "🔍", desc: "Title-Tags, Meta Description, Überschriften" },
            { title: "Keyword-Analyse", icon: "🎯", desc: "Branchenspezifische Keywords und Dichte" },
            { title: "Ladezeit-Messung", icon: "⚡", desc: "Performance und Geschwindigkeit" },
            { title: "Mobile-Optimierung", icon: "📱", desc: "Responsive Design und Touch-Bedienung" },
            { title: "Lokale SEO", icon: "📍", desc: "Google My Business und Citations" },
            { title: "Content-Analyse", icon: "📝", desc: "Qualität und Relevanz der Inhalte" },
            { title: "Konkurrenzanalyse", icon: "⚔️", desc: "Vergleich mit lokalen Mitbewerbern" },
            { title: "Backlink-Check", icon: "🔗", desc: "Interne und externe Verlinkungen" },
            { title: "Google-Bewertungen", icon: "⭐", desc: "Bewertungen und Rezensionen" },
            { title: "Social Media", icon: "📲", desc: "Facebook & Instagram Analyse" },
            { title: "Social Proof", icon: "👥", desc: "Testimonials und Vertrauenssignale" },
            { title: "Conversion-Optimierung", icon: "🎯", desc: "Call-to-Actions und Kontaktmöglichkeiten" },
            { title: "Arbeitsplatz-Bewertungen", icon: "💼", desc: "Kununu und andere HR-Plattformen" },
            { title: "Impressumsprüfung", icon: "📄", desc: "Rechtliche Vollständigkeit" },
            { title: "Branchenmerkmale", icon: "🏗️", desc: "Spezifische Inhaltsanalyse" },
            { title: "PDF-Export", icon: "📊", desc: "Vollständiger Analysebericht" }
          ].map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all bg-gray-800 border-gray-600 hover:border-yellow-400/50">
              <CardContent className="p-4">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-sm mb-1 text-yellow-400">{feature.title}</h3>
                <p className="text-xs text-gray-400">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
