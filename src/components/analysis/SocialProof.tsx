
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Award, MessageSquare, ThumbsUp, RefreshCw } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { toast } from 'sonner';

interface SocialProofProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung' | 'innenausbau' | 'metallverarbeitung';
  };
  realData: RealBusinessData;
  onSocialProofUpdate?: (data: any) => void;
}

const SocialProof: React.FC<SocialProofProps> = ({ businessData, realData, onSocialProofUpdate }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [localData, setLocalData] = useState<any>(null);

  const rawSocialProof = localData || realData.socialProof || {
    overallScore: 0,
    testimonials: 0,
    certifications: [],
    trustSignals: [],
    socialMediaMentions: 0,
    pressReferences: 0,
    awards: []
  };

  // Dynamisch berechnen statt gespeicherten Wert nutzen
  const calculateSocialProofScore = () => {
    let score = 0;
    
    // Google Reviews (max 50 Punkte)
    const googleRating = realData?.reviews?.google?.rating || 0;
    const googleCount = realData?.reviews?.google?.count || 0;
    if (googleCount > 0) {
      const ratingScore = (googleRating / 5) * 25;
      const countScore = Math.min(25, googleCount >= 100 ? 25 : googleCount >= 50 ? 20 : googleCount >= 20 ? 15 : googleCount >= 10 ? 10 : 5);
      score += ratingScore + countScore;
    }
    
    // Testimonials (max 15 Punkte)
    score += Math.min(15, (rawSocialProof.testimonials || 0) * 5);
    
    // Zertifizierungen (max 20 Punkte)
    const certs = rawSocialProof.certifications || [];
    score += Math.min(20, certs.filter((c: any) => c.verified).length * 10);
    
    // Auszeichnungen (max 15 Punkte)
    const awards = rawSocialProof.awards || [];
    score += Math.min(15, awards.length * 10);
    
    return Math.min(100, Math.round(score));
  };

  const calculatedScore = calculateSocialProofScore();
  const socialProofData = { ...rawSocialProof, overallScore: calculatedScore };

  const handleRescan = async () => {
    const url = businessData.url || realData.company?.url;
    if (!url) {
      toast.error('Keine URL für die Analyse verfügbar');
      return;
    }

    setIsScanning(true);
    toast.info('Social Proof wird analysiert...');

    try {
      const response = await fetch(url, { mode: 'no-cors' }).catch(() => null);
      
      // Da wir wegen CORS keinen direkten Zugriff haben, nutzen wir eine heuristische Analyse
      // basierend auf bekannten Mustern für Handwerker-Websites
      const certKeywords = [
        { name: 'Handwerkskammer-Mitglied', keywords: ['handwerkskammer', 'hwk', 'meisterbetrieb'] },
        { name: 'Innungsmitglied', keywords: ['innung', 'innungsbetrieb', 'innungsmitglied'] },
        { name: 'TÜV-Zertifiziert', keywords: ['tüv', 'tuev', 'tüv-zertifiziert'] },
        { name: 'ISO-Zertifiziert', keywords: ['iso 9001', 'iso-zertifiziert', 'din iso'] },
        { name: 'Fachbetrieb', keywords: ['fachbetrieb', 'zertifizierter fachbetrieb'] },
        { name: 'Energieberater', keywords: ['energieberater', 'energieberatung', 'bafa'] },
        { name: 'SHK-Fachbetrieb', keywords: ['shk-fachbetrieb', 'shk fachbetrieb'] },
      ];

      const testimonialKeywords = ['kundenstimme', 'referenz', 'testimonial', 'erfahrung', 'bewertung', 'kundenmeinung', 'das sagen unsere kunden', 'kundenfeedback'];
      const awardKeywords = ['auszeichnung', 'award', 'preis', 'beste', 'top', 'sieger', 'gewinner'];

      // Versuche den HTML-Inhalt über die Extension oder Proxy zu laden
      let htmlContent = '';
      try {
        const proxyResponse = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`);
        if (proxyResponse.ok) {
          htmlContent = (await proxyResponse.text()).toLowerCase();
        }
      } catch {
        console.log('Proxy-Zugriff fehlgeschlagen, nutze heuristische Analyse');
      }

      let testimonials = 0;
      const certifications: Array<{ name: string; verified: boolean; visible: boolean }> = [];
      const awards: Array<{ name: string; source: string; year: number }> = [];

      if (htmlContent) {
        // Echte HTML-Analyse
        for (const cert of certKeywords) {
          const found = cert.keywords.some(kw => htmlContent.includes(kw));
          if (found) {
            certifications.push({ name: cert.name, verified: true, visible: true });
          }
        }

        for (const kw of testimonialKeywords) {
          if (htmlContent.includes(kw)) {
            testimonials++;
          }
        }

        for (const kw of awardKeywords) {
          if (htmlContent.includes(kw)) {
            awards.push({ name: `Auszeichnung gefunden ("${kw}")`, source: 'Website-Analyse', year: new Date().getFullYear() });
          }
        }

        toast.success(`Website analysiert: ${certifications.length} Zertifizierungen, ${testimonials} Testimonial-Hinweise, ${awards.length} Auszeichnungen gefunden`);
      } else {
        toast.warning('Website konnte nicht direkt geladen werden. Bitte Extension-Daten nutzen für genauere Ergebnisse.');
      }

      const newData = {
        testimonials,
        certifications,
        awards,
        overallScore: 0, // wird dynamisch berechnet
      };

      setLocalData(newData);
      if (onSocialProofUpdate) {
        onSocialProofUpdate(newData);
      }
    } catch (error) {
      console.error('Social Proof Scan fehlgeschlagen:', error);
      toast.error('Fehler bei der Social Proof Analyse');
    } finally {
      setIsScanning(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Social Proof Analyse</span>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRescan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isScanning ? 'Wird analysiert...' : 'Neu analysieren'}
              </Button>
              <div 
                className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                  socialProofData.overallScore >= 90 ? 'bg-yellow-400 text-black' : 
                  socialProofData.overallScore >= 60 ? 'bg-green-500 text-white' : 
                  'bg-red-500 text-white'
                }`}
              >
                {socialProofData.overallScore}%
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Analyse der vertrauensbildenden Elemente auf {realData.company.url}
            {localData && (
              <Badge variant="default" className="ml-2 bg-green-600">
                Aktualisiert
              </Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Online-Reputation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                Online-Reputation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold">{realData?.reviews?.google?.rating || 0}</span>
                    <div className="flex">
                      {renderStars(Math.round(realData?.reviews?.google?.rating || 0))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Google ({realData?.reviews?.google?.count || 0} Bewertungen)
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {socialProofData.testimonials}
                  </div>
                  <p className="text-sm text-gray-600">Testimonials gefunden</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {socialProofData.certifications.length}
                  </div>
                  <p className="text-sm text-gray-600">Zertifizierungen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zertifizierungen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Zertifizierungen & Mitgliedschaften
              </CardTitle>
            </CardHeader>
            <CardContent>
              {socialProofData.certifications.length > 0 ? (
                <div className="space-y-2">
                  {socialProofData.certifications.map((cert: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{cert.name}</span>
                      <div className="flex gap-2">
                        <Badge variant={cert.verified ? "default" : "destructive"}>
                          {cert.verified ? "Gefunden" : "Nicht gefunden"}
                        </Badge>
                        <Badge variant={cert.visible ? "default" : "secondary"}>
                          {cert.visible ? "Sichtbar" : "Versteckt"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">Keine Zertifizierungen auf der Website gefunden</p>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      Empfehlung: Vorhandene Zertifizierungen deutlich auf der Website platzieren
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auszeichnungen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                Auszeichnungen & Anerkennungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              {socialProofData.awards.length > 0 ? (
                <div className="space-y-3">
                  {socialProofData.awards.map((award: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{award.name}</h4>
                          <p className="text-sm text-gray-600">{award.source}</p>
                        </div>
                        <Badge variant="outline">{award.year}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">Keine Auszeichnungen auf der Website gefunden</p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Empfehlung: Erhaltene Auszeichnungen prominent präsentieren
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Testimonials */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kundenstimmen & Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {socialProofData.testimonials}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Testimonial-Hinweise auf der Website gefunden
                </p>
                {socialProofData.testimonials === 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Empfehlung: Kundenstimmen sammeln und auf der Website präsentieren
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hinweis */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✓ Social Proof Analyse</h4>
            <p className="text-sm text-green-700">
              Diese Analyse durchsucht die Website {realData.company.url} nach vertrauensbildenden Elementen 
              wie Zertifizierungen, Testimonials und Auszeichnungen. Klicken Sie "Neu analysieren" um die Suche zu wiederholen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProof;
