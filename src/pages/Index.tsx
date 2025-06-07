import React, { useState } from 'react';
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
import { Search, Globe, MapPin, Building, Zap, Download } from 'lucide-react';

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
  const { toast } = useToast();
  
  // Extension Data Hook
  const { extensionData, isFromExtension, clearExtensionData, hasExtensionData } = useExtensionData();

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

    setIsAnalyzing(true);
    
    // Simuliere Analyseprozess
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsAnalyzing(false);
    setShowResults(true);
    
    toast({
      title: "Analyse abgeschlossen",
      description: "Die Auswertung des Online-Auftritts wurde erfolgreich durchgeführt.",
    });
  };

  const handleExtensionDataProcess = (processedData: BusinessData) => {
    console.log('Extension-Daten verarbeitet:', processedData);
    setBusinessData(processedData);
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

  const resetAnalysis = () => {
    setShowResults(false);
    setBusinessData({
      address: '',
      url: '',
      industry: 'shk'
    });
    clearExtensionData();
  };

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
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Handwerker Online-Auftritt Analyse
          </h1>
          <p className="text-xl text-gray-600">
            Umfassende Bewertung von Webseite, Google-Bewertungen und Social-Media-Kanälen
          </p>
        </div>

        {/* Extension Hinweis */}
        <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Zap className="h-5 w-5" />
              🚀 NEU: Chrome Extension verfügbar!
            </CardTitle>
            <CardDescription className="text-green-700">
              Analysieren Sie jede Website direkt mit einem Klick - ohne CORS-Probleme oder API-Limits!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-green-800">
                <strong>Vorteile der Extension:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>✓ Vollständige Website-Analyse ohne Einschränkungen</li>
                  <li>✓ Echte SEO-Daten direkt von der Website</li>
                  <li>✓ Keine API-Kosten oder Limits</li>
                  <li>✓ Ein Klick zur Analyse jeder Website</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    toast({
                      title: "Extension-Installation",
                      description: "Kopieren Sie den chrome-extension Ordner und laden Sie ihn in Chrome als Developer Extension.",
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Installation anzeigen
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    // Öffne Chrome Extensions Seite
                    window.open('chrome://extensions/', '_blank');
                  }}
                >
                  Chrome Extensions öffnen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6" />
              Betriebsdaten eingeben
              {isFromExtension && (
                <Badge variant="default" className="bg-green-100 text-green-800 ml-2">
                  <Zap className="h-3 w-3 mr-1" />
                  Mit Extension-Unterstützung
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Geben Sie die Daten des zu analysierenden Handwerksbetriebs ein oder nutzen Sie die Chrome Extension
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adresse des Betriebs *
                  </Label>
                  <Input
                    id="address"
                    placeholder="z.B. Musterstraße 123, 12345 Musterhausen"
                    value={businessData.address}
                    onChange={(e) => setBusinessData({...businessData, address: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website-URL *
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://www.beispiel-handwerker.de"
                    value={businessData.url}
                    onChange={(e) => setBusinessData({...businessData, url: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Branche *
                </Label>
                <Select 
                  value={businessData.industry} 
                  onValueChange={(value: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero') => 
                    setBusinessData({...businessData, industry: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Branche auswählen" />
                  </SelectTrigger>
                  <SelectContent>
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
                className="w-full" 
                disabled={isAnalyzing}
                size="lg"
              >
                {isAnalyzing ? "Analyse läuft..." : "Online-Auftritt analysieren"}
              </Button>
            </form>
          </CardContent>
        </Card>

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
            <Card key={index} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
