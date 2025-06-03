import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import AnalysisDashboard from '@/components/AnalysisDashboard';
import { Search, Globe, MapPin, Building } from 'lucide-react';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker';
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

  const resetAnalysis = () => {
    setShowResults(false);
    setBusinessData({
      address: '',
      url: '',
      industry: 'shk'
    });
  };

  if (showResults) {
    return <AnalysisDashboard businessData={businessData} onReset={resetAnalysis} />;
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

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-6 w-6" />
              Betriebsdaten eingeben
            </CardTitle>
            <CardDescription>
              Geben Sie die Daten des zu analysierenden Handwerksbetriebs ein
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
                  onValueChange={(value: 'shk' | 'maler' | 'elektriker' | 'dachdecker') => 
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
