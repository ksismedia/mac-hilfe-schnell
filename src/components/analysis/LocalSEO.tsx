import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Star, Clock, Phone, Globe } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { calculateLocalSEOScore } from './export/scoreCalculations';

interface LocalSEOProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
  };
  realData: RealBusinessData;
}

const LocalSEO: React.FC<LocalSEOProps> = ({ businessData, realData }) => {
  // Berechne den strengen Local SEO Score
  const overallScore = calculateLocalSEOScore(businessData, realData);
  
  // Simulierte Local SEO Daten - jetzt basierend auf realData und strengerer Bewertung
  const localSEOData = {
    overallScore: overallScore, // Verwendung des berechneten strengen Scores
    googleMyBusiness: {
      score: Math.max(0, Math.min(100, overallScore + (realData.seo.score >= 70 ? 15 : -10))), // Strenger an SEO-Qualität gekoppelt
      claimed: realData.seo.score >= 60,
      verified: realData.seo.score >= 70,
      complete: Math.max(30, Math.min(95, realData.seo.score + 10)),
      photos: realData.seo.score >= 60 ? Math.floor(realData.seo.score / 8) : 2,
      posts: realData.seo.score >= 70 ? 3 : realData.seo.score >= 50 ? 1 : 0,
      lastUpdate: realData.seo.score >= 60 ? "vor 2 Wochen" : "vor 3 Monaten"
    },
    localCitations: {
      score: Math.max(20, Math.min(85, overallScore - 5)), // Strenger bewertet
      totalCitations: realData.seo.score >= 60 ? 15 : realData.seo.score >= 40 ? 8 : 3,
      consistent: realData.seo.score >= 70 ? 12 : realData.seo.score >= 50 ? 6 : 2,
      inconsistent: realData.seo.score >= 70 ? 3 : realData.seo.score >= 50 ? 5 : 8,
      topDirectories: [
        { name: "Google My Business", status: realData.seo.score >= 60 ? "vollständig" : "unvollständig" },
        { name: "Bing Places", status: realData.seo.score >= 50 ? "unvollständig" : "nicht gefunden" },
        { name: "Yelp", status: realData.seo.score >= 70 ? "vollständig" : "nicht gefunden" },
        { name: "Gelbe Seiten", status: realData.seo.score >= 40 ? "vollständig" : "unvollständig" },
        { name: "WerkenntdenBesten", status: realData.seo.score >= 60 ? "vollständig" : "nicht gefunden" }
      ]
    },
    localKeywords: {
      score: Math.max(15, Math.min(80, overallScore - 10)), // Sehr streng bei lokalen Keywords
      ranking: [
        { 
          keyword: `${businessData.industry} ${businessData.address.split(',')[1]?.trim()}`, 
          position: realData.seo.score >= 70 ? 8 : realData.seo.score >= 50 ? 15 : 25, 
          volume: realData.seo.score >= 60 ? "hoch" : "niedrig" 
        },
        { 
          keyword: `Handwerker ${businessData.address.split(',')[1]?.trim()}`, 
          position: realData.seo.score >= 60 ? 12 : 20, 
          volume: realData.seo.score >= 50 ? "mittel" : "niedrig" 
        },
        { 
          keyword: `${businessData.industry} Notdienst`, 
          position: realData.seo.score >= 70 ? 6 : 18, 
          volume: realData.seo.score >= 60 ? "mittel" : "niedrig" 
        },
        { 
          keyword: `${businessData.industry} in der Nähe`, 
          position: realData.seo.score >= 80 ? 3 : realData.seo.score >= 60 ? 8 : 15, 
          volume: realData.seo.score >= 70 ? "hoch" : "mittel" 
        }
      ]
    },
    onPageLocal: {
      score: Math.max(25, Math.min(90, overallScore)),
      addressVisible: realData.seo.metaDescription ? realData.seo.metaDescription.includes(businessData.address.split(',')[1]?.trim() || '') : false,
      phoneVisible: realData.seo.score >= 50,
      openingHours: realData.seo.score >= 60,
      localSchema: realData.seo.score >= 80 && realData.seo.headings.h1.length > 0,
      localContent: Math.max(20, Math.min(85, realData.seo.score - 15)) // Strenger lokaler Content-Score
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "score-text-high";   // 90-100% gold
    if (score >= 61) return "score-text-medium"; // 61-89% grün
    return "score-text-low";                     // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "secondary";        // gold (90-100%)
    if (score >= 61) return "default";          // grün (61-89%)
    return "destructive";                       // rot (0-60%)
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return "score-text-medium";
    if (position <= 10) return "score-text-high";
    return "score-text-low";
  };

  const getStatusBadgeClass = (status: string) => {
    console.log('DEBUG LocalSEO - Status:', status);
    let className = "";
    switch (status) {
      case "vollständig": 
        className = "bg-yellow-400 text-black"; // gelb
        console.log('DEBUG: vollständig -> gelb');
        break;
      case "unvollständig": 
        className = "bg-red-500 text-white"; // rot
        console.log('DEBUG: unvollständig -> rot');
        break;
      default: 
        className = "bg-red-500 text-white"; // rot (nicht gefunden)
        console.log('DEBUG: nicht gefunden -> rot');
        break;
    }
    console.log('DEBUG: Final className:', className);
    return className;
  };

  const getVolumeBadgeClass = (volume: string) => {
    console.log('DEBUG LocalSEO - Volume:', volume);
    let className = "";
    switch (volume) {
      case "hoch": 
        className = "bg-yellow-400 text-black"; // gelb
        console.log('DEBUG: hoch -> gelb');
        break;
      case "mittel": 
        className = "bg-green-500 text-white"; // grün  
        console.log('DEBUG: mittel -> grün');
        break;
      case "niedrig": 
        className = "bg-red-500 text-white"; // rot
        console.log('DEBUG: niedrig -> rot');
        break;
      default: 
        className = "bg-red-500 text-white"; // rot
        console.log('DEBUG: default -> rot');
        break;
    }
    console.log('DEBUG: Final volume className:', className);
    return className;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Lokale SEO-Faktoren
            <Badge variant={getScoreBadge(localSEOData.overallScore)}>
              {localSEOData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Analyse der lokalen Suchmaschinenoptimierung für {businessData.address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google My Business */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Google My Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Beansprucht:</span>
                    <Badge variant={localSEOData.googleMyBusiness.claimed ? "default" : "destructive"}>
                      {localSEOData.googleMyBusiness.claimed ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Verifiziert:</span>
                    <Badge variant={localSEOData.googleMyBusiness.verified ? "default" : "destructive"}>
                      {localSEOData.googleMyBusiness.verified ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Vollständigkeit:</span>
                    <span className={`font-medium ${getScoreColor(localSEOData.googleMyBusiness.complete)}`}>
                      {localSEOData.googleMyBusiness.complete}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Fotos:</span>
                    <span className="font-medium">{localSEOData.googleMyBusiness.photos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Posts (letzte 30 Tage):</span>
                    <span className="font-medium">{localSEOData.googleMyBusiness.posts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Letztes Update:</span>
                    <span className="font-medium">{localSEOData.googleMyBusiness.lastUpdate}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">GMB Optimierung</span>
                  <span className={`font-bold ${getScoreColor(localSEOData.googleMyBusiness.score)}`}>
                    {localSEOData.googleMyBusiness.score}/100
                  </span>
                </div>
                <Progress value={localSEOData.googleMyBusiness.score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Local Citations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Lokale Verzeichnisse (Citations)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                 <div className="text-center">
                   <div className="text-2xl font-bold text-blue-600">
                     {localSEOData.localCitations.totalCitations}
                   </div>
                   <p className="text-sm text-gray-600">Gefundene Einträge</p>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold score-text-medium">
                     {localSEOData.localCitations.consistent}
                   </div>
                   <p className="text-sm text-gray-600">Konsistent</p>
                 </div>
                 <div className="text-center">
                   <div className="text-2xl font-bold score-text-low">
                     {localSEOData.localCitations.inconsistent}
                   </div>
                   <p className="text-sm text-gray-600">Inkonsistent</p>
                 </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium mb-2">Top-Verzeichnisse:</h4>
                {localSEOData.localCitations.topDirectories.map((directory, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{directory.name}</span>
                     <div
                       className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                         directory.status === "vollständig" 
                           ? "bg-yellow-400 text-black" 
                           : "bg-red-500 text-white"
                       }`}
                     >
                       {directory.status}
                     </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Local Keywords */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Lokale Keyword-Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {localSEOData.localKeywords.ranking.map((keyword, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{keyword.keyword}</span>
                        <div
                          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ml-2 ${
                            keyword.volume === "hoch" 
                              ? "bg-yellow-400 text-black"
                              : keyword.volume === "mittel" 
                              ? "bg-green-500 text-white" 
                              : "bg-red-500 text-white"
                          }`}
                        >
                          {keyword.volume} Volumen
                        </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getPositionColor(keyword.position)}`}>
                        #{keyword.position}
                      </div>
                      <div className="text-xs text-gray-500">Position</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* On-Page Local Faktoren */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">On-Page Local Faktoren</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse sichtbar
                    </span>
                    <Badge variant={localSEOData.onPageLocal.addressVisible ? "default" : "destructive"}>
                      {localSEOData.onPageLocal.addressVisible ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Telefon sichtbar
                    </span>
                    <Badge variant={localSEOData.onPageLocal.phoneVisible ? "default" : "destructive"}>
                      {localSEOData.onPageLocal.phoneVisible ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Öffnungszeiten
                    </span>
                    <Badge variant={localSEOData.onPageLocal.openingHours ? "default" : "destructive"}>
                      {localSEOData.onPageLocal.openingHours ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Local Schema</span>
                    <Badge variant={localSEOData.onPageLocal.localSchema ? "default" : "destructive"}>
                      {localSEOData.onPageLocal.localSchema ? "Implementiert" : "Fehlt"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Lokaler Content</span>
                  <span className="font-medium">{localSEOData.onPageLocal.localContent}%</span>
                </div>
                <Progress value={localSEOData.onPageLocal.localContent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalSEO;
