import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image, Video, MessageSquare, Target, Calendar, TrendingUp, Users, Zap, Edit } from 'lucide-react';
import { ManualContentInput } from './ManualContentInput';
import { useManualData } from '@/hooks/useManualData';

interface ContentAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ url, industry }) => {
  const { manualContentData, updateManualContentData } = useManualData();
  
  // Branchenspezifische Content-Themen
  const industryContentTopics = {
    shk: {
      name: 'SHK-Betriebe',
      coreTopics: ['Heizungsinstallation', 'Sanitärreparaturen', 'Klimaanlagen', 'Notdienst', 'Wartungsverträge', 'Energieberatung'],
      seasonalTopics: ['Heizung winterfest machen', 'Klimaanlagen für den Sommer', 'Rohrreinigung Frühjahr'],
      expertTopics: ['Smart Home Integration', 'Wärmepumpen', 'Solarthermie', 'Legionellenprüfung']
    },
    maler: {
      name: 'Malerbetriebe',
      coreTopics: ['Innenanstrich', 'Fassadenanstrich', 'Renovierung', 'Tapezieren', 'Lackierarbeiten', 'Farbberatung'],
      seasonalTopics: ['Fassadenanstrich Frühjahr', 'Winterschutz Anstriche', 'Renovierung vor Umzug'],
      expertTopics: ['Spezialputze', 'Denkmalschutz', 'Wärmedämmung', 'Schimmelbehandlung']
    },
    elektriker: {
      name: 'Elektrikerbetriebe', 
      coreTopics: ['Elektroinstallation', 'Beleuchtung', 'Sicherungskästen', 'Smart Home', 'E-Mobilität', 'Photovoltaik'],
      seasonalTopics: ['Weihnachtsbeleuchtung', 'Gartenstrom Sommer', 'Heizungssteuerung Winter'],
      expertTopics: ['KNX-Systeme', 'Energiespeicher', 'Wallboxen', 'Blitzschutz']
    },
    dachdecker: {
      name: 'Dachdeckerbetriebe',
      coreTopics: ['Dachdeckung', 'Dachreparatur', 'Dachrinnen', 'Isolierung', 'Flachdach', 'Steildach'],
      seasonalTopics: ['Sturm-Reparaturen', 'Wintercheck Dach', 'Dachrinnenreinigung'],
      expertTopics: ['Gründächer', 'Solardächer', 'Dachfenster', 'Blitzableiter']
    },
    stukateur: {
      name: 'Stukateur-Betriebe',
      coreTopics: ['Putzarbeiten', 'Trockenbau', 'Stuck', 'Fassadengestaltung', 'Innenausbau', 'Sanierung'],
      seasonalTopics: ['Fassadensanierung Frühjahr', 'Innenausbau Winter', 'Feuchtigkeitsschäden'],
      expertTopics: ['Historische Fassaden', 'Wärmedämmverbundsysteme', 'Akustikputz', 'Brandschutzputz']
    },
    planungsbuero: {
      name: 'Planungsbüros',
      coreTopics: ['Anlagenplanung', 'Energiekonzepte', 'Gebäudetechnik', 'Beratung', 'Projektmanagement', 'Gutachten'],
      seasonalTopics: ['Energieaudits', 'Heizungsplanung', 'Klimakonzepte'],
      expertTopics: ['BIM-Planung', 'Passivhaus', 'Gebäudeautomation', 'Nachhaltigkeitsberatung']
    }
  };

  const currentIndustry = industryContentTopics[industry];

  // Erweiterte simulierte Content-Analyse-Daten
  const contentData = {
    overallScore: 69,
    contentQuality: {
      score: 72,
      textLength: 1850,
      readabilityScore: 78,
      uniqueness: 92,
      keywordDensity: 2.3,
      headingStructure: "gut",
      grammarScore: 94,
      technicalAccuracy: 87,
      customerFocus: 76
    },
    contentTypes: {
      textPages: 12,
      images: 28,
      videos: 2,
      downloadContent: 5,
      blogPosts: 8,
      caseStudies: 4,
      faq: 1,
      testimonials: 6
    },
    topicCoverage: {
      score: 66,
      coreTopics: currentIndustry.coreTopics.map((topic, index) => ({
        topic,
        coverage: 85 - (index * 8),
        importance: index < 3 ? "sehr hoch" : index < 5 ? "hoch" : "mittel",
        contentPieces: Math.floor(Math.random() * 5) + 1,
        lastUpdated: `vor ${Math.floor(Math.random() * 60) + 1} Tagen`
      })),
      seasonalTopics: currentIndustry.seasonalTopics.map((topic, index) => ({
        topic,
        coverage: 45 + (index * 15),
        relevance: "saisonal",
        nextRelevance: "in 2 Monaten"
      })),
      expertTopics: currentIndustry.expertTopics.map((topic, index) => ({
        topic,
        coverage: 25 + (index * 20),
        difficulty: "expert",
        potentialValue: "sehr hoch"
      }))
    },
    contentFreshness: {
      score: 58,
      lastUpdate: "vor 3 Monaten",
      blogLastPost: "vor 6 Wochen",
      newsUpdates: 2,
      seasonalContent: false,
      contentCalendar: false,
      updateFrequency: "unregelmäßig",
      trendAwareness: 45
    },
    userEngagement: {
      averageTimeOnPage: "2:45",
      bounceRate: "42%",
      pageViews: 1.8,
      conversionRate: "3.2%",
      socialShares: 23,
      comments: 8,
      downloadRate: "12%",
      returnVisitors: "34%"
    },
    seoOptimization: {
      score: 73,
      metaDescriptions: "60% vollständig",
      internalLinking: "gut strukturiert",
      imageAlt: "80% optimiert",
      contentLength: "überdurchschnittlich",
      keywordOptimization: "ausbaufähig"
    },
    competitorComparison: {
      contentVolume: "durchschnittlich",
      contentQuality: "überdurchschnittlich", 
      updateFrequency: "unterdurchschnittlich",
      topicAbdeckung: "gut",
      recommendation: "Häufigere Updates und mehr Expertencontent"
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "score-text-high";  // 80-100% gelb
    if (score >= 60) return "score-text-medium";   // 60-80% grün
    return "score-text-low";                      // 0-60% rot
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "secondary";        // gelb
    if (score >= 60) return "default";          // grün
    return "destructive";                       // rot
  };

  const getCoverageBadge = (coverage: number) => {
    if (coverage >= 80) return "default";
    if (coverage >= 60) return "secondary";
    return "destructive";
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "sehr hoch": return "destructive";
      case "hoch": return "default";
      case "mittel": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Content-Analyse für {currentIndustry.name}
            <Badge variant={getScoreBadge(contentData.overallScore)}>
              {contentData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Detaillierte Analyse der Website-Inhalte für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="automatic" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatic">Automatische Analyse</TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Manuelle Bewertung
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="automatic" className="space-y-6 mt-6">
              {/* Content-Qualität - Erweitert */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content-Qualität & Struktur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">Grundlagen</h4>
                      <div className="flex justify-between">
                        <span className="text-sm">Textlänge (Wörter):</span>
                        <span className="font-medium">{contentData.contentQuality.textLength.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Lesbarkeit:</span>
                        <span className={`font-medium ${getScoreColor(contentData.contentQuality.readabilityScore)}`}>
                          {contentData.contentQuality.readabilityScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Einzigartigkeit:</span>
                        <span className={`font-medium ${getScoreColor(contentData.contentQuality.uniqueness)}`}>
                          {contentData.contentQuality.uniqueness}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">Qualität</h4>
                      <div className="flex justify-between">
                        <span className="text-sm">Grammatik:</span>
                        <span className={`font-medium ${getScoreColor(contentData.contentQuality.grammarScore)}`}>
                          {contentData.contentQuality.grammarScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Fachliche Korrektheit:</span>
                        <span className={`font-medium ${getScoreColor(contentData.contentQuality.technicalAccuracy)}`}>
                          {contentData.contentQuality.technicalAccuracy}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Kundenfokus:</span>
                        <span className={`font-medium ${getScoreColor(contentData.contentQuality.customerFocus)}`}>
                          {contentData.contentQuality.customerFocus}/100
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">Technisch</h4>
                      <div className="flex justify-between">
                        <span className="text-sm">Keyword-Dichte:</span>
                        <span className="font-medium">{contentData.contentQuality.keywordDensity}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Überschriften-Struktur:</span>
                        <Badge variant={contentData.contentQuality.headingStructure === "gut" ? "default" : "secondary"}>
                          {contentData.contentQuality.headingStructure}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Gesamtqualität</span>
                      <span className={`font-bold ${getScoreColor(contentData.contentQuality.score)}`}>
                        {contentData.contentQuality.score}/100
                      </span>
                    </div>
                    <Progress value={contentData.contentQuality.score} className="h-3" />
                  </div>
                </CardContent>
              </Card>
              
              {/* ... keep existing code (placeholder for other sections) */}
            </TabsContent>
            
            <TabsContent value="manual" className="mt-6">
              <ManualContentInput 
                onSave={updateManualContentData}
                initialData={manualContentData}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalysis;
