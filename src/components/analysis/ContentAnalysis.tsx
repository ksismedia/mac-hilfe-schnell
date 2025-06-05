
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Image, Video, MessageSquare, Target, Calendar, TrendingUp, Users, Zap } from 'lucide-react';

interface ContentAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ url, industry }) => {
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
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

          {/* Content-Typen - Erweitert */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Content-Portfolio Übersicht</CardTitle>
              <CardDescription>Vollständige Inventur aller Content-Arten</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg bg-blue-50">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.textPages}</div>
                  <p className="text-sm text-gray-600">Textseiten</p>
                  <p className="text-xs text-blue-600">Hauptcontent</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-green-50">
                  <Image className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.images}</div>
                  <p className="text-sm text-gray-600">Bilder</p>
                  <p className="text-xs text-green-600">SEO-optimiert: 80%</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-purple-50">
                  <Video className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.videos}</div>
                  <p className="text-sm text-gray-600">Videos</p>
                  <p className="text-xs text-purple-600">Ausbaufähig</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-orange-50">
                  <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.downloadContent}</div>
                  <p className="text-sm text-gray-600">Downloads</p>
                  <p className="text-xs text-orange-600">Lead-Magnete</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-red-50">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.blogPosts}</div>
                  <p className="text-sm text-gray-600">Blog-Posts</p>
                  <p className="text-xs text-red-600">Regelmäßig updaten</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-yellow-50">
                  <Users className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.caseStudies}</div>
                  <p className="text-sm text-gray-600">Fallstudien</p>
                  <p className="text-xs text-yellow-600">Vertrauen schaffen</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-indigo-50">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-indigo-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.testimonials}</div>
                  <p className="text-sm text-gray-600">Testimonials</p>
                  <p className="text-xs text-indigo-600">Social Proof</p>
                </div>
                <div className="text-center p-3 border rounded-lg bg-pink-50">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-pink-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.faq}</div>
                  <p className="text-sm text-gray-600">FAQ-Sektion</p>
                  <p className="text-xs text-pink-600">Erweitern empfohlen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kern-Themen Abdeckung */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Kern-Themen für {currentIndustry.name}</CardTitle>
              <CardDescription>
                Wesentliche Dienstleistungsbereiche und deren Content-Abdeckung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentData.topicCoverage.coreTopics.map((topic, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{topic.topic}</span>
                        <Badge variant={getImportanceBadge(topic.importance)}>
                          {topic.importance}
                        </Badge>
                      </div>
                      <Badge variant={getCoverageBadge(topic.coverage)}>
                        {topic.coverage}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-2">
                      <span>Content-Pieces: {topic.contentPieces}</span>
                      <span>Letztes Update: {topic.lastUpdated}</span>
                      <span>Wichtigkeit: {topic.importance}</span>
                    </div>
                    <Progress value={topic.coverage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Saisonale Themen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Saisonale Content-Strategie
              </CardTitle>
              <CardDescription>Zeitspezifische Themen und deren Potenzial</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentData.topicCoverage.seasonalTopics.map((topic, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{topic.topic}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{topic.relevance}</Badge>
                        <Badge variant={getCoverageBadge(topic.coverage)}>
                          {topic.coverage}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Nächste Relevanz: {topic.nextRelevance}</p>
                    <Progress value={topic.coverage} className="h-2 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expert-Themen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Expert-Content Potenzial
              </CardTitle>
              <CardDescription>Spezialisierte Themen für Thought Leadership</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentData.topicCoverage.expertTopics.map((topic, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{topic.topic}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline">{topic.difficulty}</Badge>
                        <Badge variant={getCoverageBadge(topic.coverage)}>
                          {topic.coverage}%
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Potentieller Wert: {topic.potentialValue}</p>
                    <Progress value={topic.coverage} className="h-2 mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Freshness - Erweitert */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Content-Aktualität & Wartung</CardTitle>
              <CardDescription>Analyse der Content-Pflege und Update-Strategie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Update-Status</h4>
                  <div className="flex justify-between">
                    <span className="text-sm">Letztes Update:</span>
                    <span className="font-medium text-red-600">{contentData.contentFreshness.lastUpdate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Letzter Blog-Post:</span>
                    <span className="font-medium text-yellow-600">{contentData.contentFreshness.blogLastPost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Update-Häufigkeit:</span>
                    <Badge variant="destructive">{contentData.contentFreshness.updateFrequency}</Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Content-Strategie</h4>
                  <div className="flex justify-between">
                    <span className="text-sm">Content-Kalender:</span>
                    <Badge variant={contentData.contentFreshness.contentCalendar ? "default" : "destructive"}>
                      {contentData.contentFreshness.contentCalendar ? "Vorhanden" : "Fehlt"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Trend-Bewusstsein:</span>
                    <span className={`font-medium ${getScoreColor(contentData.contentFreshness.trendAwareness)}`}>
                      {contentData.contentFreshness.trendAwareness}/100
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Saisonaler Content:</span>
                    <Badge variant={contentData.contentFreshness.seasonalContent ? "default" : "destructive"}>
                      {contentData.contentFreshness.seasonalContent ? "Vorhanden" : "Fehlt"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Aktualitäts-Score</span>
                  <span className={`font-bold ${getScoreColor(contentData.contentFreshness.score)}`}>
                    {contentData.contentFreshness.score}/100
                  </span>
                </div>
                <Progress value={contentData.contentFreshness.score} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* User Engagement - Erweitert */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Nutzer-Engagement & Performance
              </CardTitle>
              <CardDescription>Detaillierte Analyse der Content-Performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {contentData.userEngagement.averageTimeOnPage}
                  </div>
                  <p className="text-sm text-gray-600">Verweildauer</p>
                  <p className="text-xs text-blue-600">Überdurchschnittlich</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {contentData.userEngagement.bounceRate}
                  </div>
                  <p className="text-sm text-gray-600">Absprungrate</p>
                  <p className="text-xs text-yellow-600">Verbesserungsfähig</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {contentData.userEngagement.pageViews}
                  </div>
                  <p className="text-sm text-gray-600">Seiten/Besuch</p>
                  <p className="text-xs text-green-600">Gut</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {contentData.userEngagement.conversionRate}
                  </div>
                  <p className="text-sm text-gray-600">Conversion-Rate</p>
                  <p className="text-xs text-purple-600">Branchendurchschnitt</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {contentData.userEngagement.socialShares}
                  </div>
                  <p className="text-sm text-gray-600">Social Shares</p>
                  <p className="text-xs text-red-600">Ausbaufähig</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {contentData.userEngagement.comments}
                  </div>
                  <p className="text-sm text-gray-600">Kommentare</p>
                  <p className="text-xs text-indigo-600">Niedrig</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {contentData.userEngagement.downloadRate}
                  </div>
                  <p className="text-sm text-gray-600">Download-Rate</p>
                  <p className="text-xs text-orange-600">Gut</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">
                    {contentData.userEngagement.returnVisitors}
                  </div>
                  <p className="text-sm text-gray-600">Wiederkehrende Besucher</p>
                  <p className="text-xs text-teal-600">Durchschnittlich</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO-Optimierung */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Content-SEO Optimierung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meta-Descriptions:</span>
                  <Badge variant="secondary">{contentData.seoOptimization.metaDescriptions}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Interne Verlinkung:</span>
                  <Badge variant="default">{contentData.seoOptimization.internalLinking}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Bild Alt-Texte:</span>
                  <Badge variant="default">{contentData.seoOptimization.imageAlt}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content-Länge:</span>
                  <Badge variant="default">{contentData.seoOptimization.contentLength}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Keyword-Optimierung:</span>
                  <Badge variant="secondary">{contentData.seoOptimization.keywordOptimization}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Konkurrenz-Vergleich */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content-Konkurrenzvergleich</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Content-Volumen:</span>
                    <Badge variant="secondary">{contentData.competitorComparison.contentVolume}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Content-Qualität:</span>
                    <Badge variant="default">{contentData.competitorComparison.contentQuality}</Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Update-Häufigkeit:</span>
                    <Badge variant="destructive">{contentData.competitorComparison.updateFrequency}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Themen-Abdeckung:</span>
                    <Badge variant="default">{contentData.competitorComparison.topicAbdeckung}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Handlungsempfehlung</h4>
                <p className="text-sm text-blue-800">{contentData.competitorComparison.recommendation}</p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalysis;
