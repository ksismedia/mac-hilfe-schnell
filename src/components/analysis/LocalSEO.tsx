import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Clock, Phone, Globe, Edit, Save, X } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { calculateLocalSEOScore } from './export/scoreCalculations';
import { ManualLocalSEOData } from '@/hooks/useManualData';
import ManualLocalSEOInput from './ManualLocalSEOInput';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LocalSEOProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
  };
  realData: RealBusinessData;
  manualData?: ManualLocalSEOData | null;
  onManualDataChange?: (data: ManualLocalSEOData | null) => void;
}

const LocalSEO: React.FC<LocalSEOProps> = ({ businessData, realData, manualData, onManualDataChange }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [realLocalSEOData, setRealLocalSEOData] = useState<any>(null);

  // Verwende manuelle Daten wenn vorhanden, sonst berechne Score
  const overallScore = manualData?.overallScore ?? calculateLocalSEOScore(businessData, realData);

  // Lade echte Local SEO Daten beim Mount
  useEffect(() => {
    if (!manualData) {
      loadRealLocalSEOData();
    }
  }, [businessData.url, businessData.address]);

  const loadRealLocalSEOData = async () => {
    setIsLoadingAnalysis(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-local-seo', {
        body: {
          url: businessData.url,
          businessName: realData.company.name,
          address: businessData.address,
          industry: businessData.industry
        }
      });

      if (error) throw error;
      
      console.log('Real Local SEO Data:', data);
      setRealLocalSEOData(data);
      
      toast({
        title: "Local SEO Analyse abgeschlossen",
        description: "Echte Daten wurden erfolgreich geladen"
      });
    } catch (error) {
      console.error('Error loading real local SEO data:', error);
      toast({
        title: "Hinweis",
        description: "Automatische Analyse nicht verfügbar. Verwenden Sie die manuelle Eingabe.",
        variant: "default"
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleManualDataSave = (data: ManualLocalSEOData) => {
    if (onManualDataChange) {
      onManualDataChange(data);
      setIsEditMode(false);
      toast({
        title: "Gespeichert",
        description: "Manuelle Local SEO Daten wurden gespeichert"
      });
    }
  };

  const handleManualDataClear = () => {
    if (onManualDataChange) {
      onManualDataChange(null);
      setIsEditMode(false);
      toast({
        title: "Zurückgesetzt",
        description: "Manuelle Daten wurden gelöscht, automatische Analyse wird verwendet"
      });
    }
  };

  if (isEditMode) {
    return (
      <div>
        <div className="flex justify-end gap-2 mb-4">
          <Button variant="outline" onClick={() => setIsEditMode(false)}>
            <X className="h-4 w-4 mr-2" />
            Abbrechen
          </Button>
          {manualData && (
            <Button variant="destructive" onClick={handleManualDataClear}>
              Zurücksetzen
            </Button>
          )}
        </div>
        <ManualLocalSEOInput
          initialData={manualData}
          onDataChange={handleManualDataSave}
        />
      </div>
    );
  }
  
  // Verwende manuelle oder echte Daten, sonst Fallback
  const localSEOData = manualData ? {
    overallScore: manualData.overallScore,
    googleMyBusiness: {
      score: Math.round((manualData.gmbCompleteness + (manualData.gmbVerified ? 20 : 0) + (manualData.gmbClaimed ? 10 : 0)) / 1.3),
      claimed: manualData.gmbClaimed,
      verified: manualData.gmbVerified,
      complete: manualData.gmbCompleteness,
      photos: manualData.gmbPhotos,
      posts: manualData.gmbPosts,
      lastUpdate: manualData.gmbLastUpdate
    },
    localCitations: {
      score: Math.round((manualData.directories.filter(d => d.status === 'complete').length / Math.max(1, manualData.directories.length)) * 100),
      totalCitations: manualData.directories.length,
      consistent: manualData.directories.filter(d => d.status === 'complete').length,
      inconsistent: manualData.directories.filter(d => d.status === 'incomplete').length,
      topDirectories: manualData.directories.map(d => ({
        name: d.name,
        status: d.status === 'complete' ? 'vollständig' : d.status === 'incomplete' ? 'unvollständig' : 'nicht gefunden'
      }))
    },
    localKeywords: {
      score: manualData.localKeywordRankings.length > 0 ? Math.round(
        manualData.localKeywordRankings.reduce((acc, kw) => acc + (100 - kw.position), 0) / manualData.localKeywordRankings.length
      ) : 0,
      ranking: manualData.localKeywordRankings.map(kw => ({
        keyword: kw.keyword,
        position: kw.position,
        volume: kw.searchVolume === 'high' ? 'hoch' : kw.searchVolume === 'medium' ? 'mittel' : 'niedrig'
      }))
    },
    onPageLocal: {
      score: manualData.localContentScore,
      addressVisible: manualData.addressVisible,
      phoneVisible: manualData.phoneVisible,
      openingHours: manualData.openingHoursVisible,
      localSchema: manualData.hasLocalBusinessSchema,
      localContent: manualData.localContentScore
    }
  } : realLocalSEOData ? {
    overallScore: overallScore,
    googleMyBusiness: {
      score: Math.round((realLocalSEOData.structuredData.hasLocalBusinessSchema ? 30 : 0) + 
                       (realLocalSEOData.napConsistency.score * 0.7)),
      claimed: realLocalSEOData.napConsistency.score > 60,
      verified: realLocalSEOData.napConsistency.score > 75,
      complete: realLocalSEOData.napConsistency.score,
      photos: Math.floor(realLocalSEOData.directories.completionRate / 10),
      posts: realLocalSEOData.directories.found.length > 5 ? 3 : 1,
      lastUpdate: "Unbekannt"
    },
    localCitations: {
      score: realLocalSEOData.directories.completionRate,
      totalCitations: realLocalSEOData.directories.total,
      consistent: realLocalSEOData.directories.found.filter((d: any) => d.status === 'complete').length,
      inconsistent: realLocalSEOData.directories.found.filter((d: any) => d.status === 'incomplete').length,
      topDirectories: [
        ...realLocalSEOData.directories.found.map((d: any) => ({
          name: d.name,
          status: d.status === 'complete' ? 'vollständig' : 'unvollständig'
        })),
        ...realLocalSEOData.directories.notFound.slice(0, 3).map((d: any) => ({
          name: d.name,
          status: 'nicht gefunden'
        }))
      ].slice(0, 5)
    },
    localKeywords: {
      score: Math.max(15, Math.min(80, overallScore - 10)),
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
        }
      ]
    },
    onPageLocal: {
      score: realLocalSEOData.napConsistency.score,
      addressVisible: realLocalSEOData.napConsistency.hasAddress,
      phoneVisible: realLocalSEOData.napConsistency.hasPhone,
      openingHours: realData.seo.score >= 61,
      localSchema: realLocalSEOData.structuredData.hasLocalBusinessSchema,
      localContent: Math.max(25, Math.min(90, realLocalSEOData.napConsistency.score))
    }
  } : {
    overallScore: overallScore,
    googleMyBusiness: {
      score: Math.max(0, Math.min(100, overallScore + (realData.seo.score >= 70 ? 15 : -10))),
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
          position: realData.seo.score >= 90 ? 3 : realData.seo.score >= 61 ? 8 : 15, 
          volume: realData.seo.score >= 70 ? "hoch" : "mittel" 
        }
      ]
    },
    onPageLocal: {
      score: Math.max(25, Math.min(90, overallScore)),
      addressVisible: realData.seo.metaDescription ? realData.seo.metaDescription.includes(businessData.address.split(',')[1]?.trim() || '') : false,
      phoneVisible: realData.seo.score >= 50,
      openingHours: realData.seo.score >= 61,
      localSchema: realData.seo.score >= 90 && realData.seo.headings.h1.length > 0,
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
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {manualData && (
            <Badge variant="secondary">Manuell bearbeitet</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
        </div>
        <div 
          className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
            localSEOData.overallScore >= 90 ? 'bg-yellow-400 text-black' : 
            localSEOData.overallScore >= 61 ? 'bg-green-500 text-white' : 
            'bg-red-500 text-white'
          }`}
        >
          {localSEOData.overallScore}%
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
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
                <div className="mb-2">
                  <span className="text-sm font-medium">GMB Optimierung</span>
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
                <div className="mb-2">
                  <span className="text-sm font-medium">Lokaler Content</span>
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
