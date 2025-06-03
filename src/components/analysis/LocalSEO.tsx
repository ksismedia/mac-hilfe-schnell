
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Star, Clock, Phone, Globe } from 'lucide-react';

interface LocalSEOProps {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker';
}

const LocalSEO: React.FC<LocalSEOProps> = ({ address, url, industry }) => {
  // Simulierte Local SEO Daten
  const localSEOData = {
    overallScore: 74,
    googleMyBusiness: {
      score: 82,
      claimed: true,
      verified: true,
      complete: 75,
      photos: 12,
      posts: 3,
      lastUpdate: "vor 2 Wochen"
    },
    localCitations: {
      score: 68,
      totalCitations: 15,
      consistent: 12,
      inconsistent: 3,
      topDirectories: [
        { name: "Google My Business", status: "vollständig" },
        { name: "Bing Places", status: "unvollständig" },
        { name: "Yelp", status: "nicht gefunden" },
        { name: "Gelbe Seiten", status: "vollständig" },
        { name: "WerkenntdenBesten", status: "vollständig" }
      ]
    },
    localKeywords: {
      score: 71,
      ranking: [
        { keyword: `${industry} ${address.split(',')[1]?.trim()}`, position: 8, volume: "hoch" },
        { keyword: `Handwerker ${address.split(',')[1]?.trim()}`, position: 15, volume: "mittel" },
        { keyword: `${industry} Notdienst`, position: 12, volume: "mittel" },
        { keyword: `${industry} in der Nähe`, position: 6, volume: "hoch" }
      ]
    },
    onPageLocal: {
      score: 78,
      addressVisible: true,
      phoneVisible: true,
      openingHours: true,
      localSchema: false,
      localContent: 65
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return "text-green-600";
    if (position <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "vollständig": return "default";
      case "unvollständig": return "secondary";
      default: return "destructive";
    }
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
            Analyse der lokalen Suchmaschinenoptimierung für {address}
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
                  <div className="text-2xl font-bold text-green-600">
                    {localSEOData.localCitations.consistent}
                  </div>
                  <p className="text-sm text-gray-600">Konsistent</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
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
                    <Badge variant={getStatusBadge(directory.status)}>
                      {directory.status}
                    </Badge>
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
                      <Badge variant="outline" className="ml-2 text-xs">
                        {keyword.volume} Volumen
                      </Badge>
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
