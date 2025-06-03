
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Image, Video, MessageSquare, Target } from 'lucide-react';

interface ContentAnalysisProps {
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker';
}

const ContentAnalysis: React.FC<ContentAnalysisProps> = ({ url, industry }) => {
  // Simulierte Content-Analyse-Daten
  const contentData = {
    overallScore: 69,
    contentQuality: {
      score: 72,
      textLength: 1850,
      readabilityScore: 78,
      uniqueness: 92,
      keywordDensity: 2.3,
      headingStructure: "gut"
    },
    contentTypes: {
      textPages: 12,
      images: 28,
      videos: 2,
      downloadContent: 5,
      blogPosts: 8
    },
    topicCoverage: {
      score: 66,
      industryTopics: [
        { topic: "Leistungen", coverage: 85, importance: "hoch" },
        { topic: "Referenzen", coverage: 70, importance: "hoch" },
        { topic: "Preise", coverage: 45, importance: "mittel" },
        { topic: "Team", coverage: 80, importance: "mittel" },
        { topic: "Notdienst", coverage: 60, importance: "hoch" },
        { topic: "Wartung", coverage: 40, importance: "mittel" }
      ]
    },
    contentFreshness: {
      score: 58,
      lastUpdate: "vor 3 Monaten",
      blogLastPost: "vor 6 Wochen",
      newsUpdates: 2,
      seasonalContent: false
    },
    userEngagement: {
      averageTimeOnPage: "2:45",
      bounceRate: "42%",
      pageViews: 1.8,
      conversionRate: "3.2%"
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Content-Analyse
            <Badge variant={getScoreBadge(contentData.overallScore)}>
              {contentData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Umfassende Analyse der Website-Inhalte für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Content-Qualität */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content-Qualität
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
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
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Gesamtqualität</span>
                  <span className={`font-bold ${getScoreColor(contentData.contentQuality.score)}`}>
                    {contentData.contentQuality.score}/100
                  </span>
                </div>
                <Progress value={contentData.contentQuality.score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Content-Typen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Content-Typen Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.textPages}</div>
                  <p className="text-sm text-gray-600">Textseiten</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Image className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.images}</div>
                  <p className="text-sm text-gray-600">Bilder</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Video className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.videos}</div>
                  <p className="text-sm text-gray-600">Videos</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Target className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.downloadContent}</div>
                  <p className="text-sm text-gray-600">Downloads</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold">{contentData.contentTypes.blogPosts}</div>
                  <p className="text-sm text-gray-600">Blog-Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Topic Coverage */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Branchenspezifische Themen-Abdeckung</CardTitle>
              <CardDescription>
                Relevante Themen für {industry === 'shk' ? 'SHK-Betriebe' : industry === 'maler' ? 'Malerbetriebe' : industry === 'elektriker' ? 'Elektrikerbetriebe' : 'Dachdeckerbetriebe'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contentData.topicCoverage.industryTopics.map((topic, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{topic.topic}</span>
                        <Badge variant="outline" size="sm">
                          {topic.importance}
                        </Badge>
                      </div>
                      <Badge variant={getCoverageBadge(topic.coverage)}>
                        {topic.coverage}%
                      </Badge>
                    </div>
                    <Progress value={topic.coverage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Freshness */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Content-Aktualität</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Letztes Update:</span>
                    <span className="font-medium">{contentData.contentFreshness.lastUpdate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Letzter Blog-Post:</span>
                    <span className="font-medium">{contentData.contentFreshness.blogLastPost}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">News-Updates (Monat):</span>
                    <span className="font-medium">{contentData.contentFreshness.newsUpdates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Saisonaler Content:</span>
                    <Badge variant={contentData.contentFreshness.seasonalContent ? "default" : "destructive"}>
                      {contentData.contentFreshness.seasonalContent ? "Vorhanden" : "Fehlt"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Aktualitäts-Score</span>
                  <span className={`font-bold ${getScoreColor(contentData.contentFreshness.score)}`}>
                    {contentData.contentFreshness.score}/100
                  </span>
                </div>
                <Progress value={contentData.contentFreshness.score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* User Engagement */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Nutzer-Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {contentData.userEngagement.averageTimeOnPage}
                  </div>
                  <p className="text-sm text-gray-600">Verweildauer</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {contentData.userEngagement.bounceRate}
                  </div>
                  <p className="text-sm text-gray-600">Absprungrate</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {contentData.userEngagement.pageViews}
                  </div>
                  <p className="text-sm text-gray-600">Seiten/Besuch</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {contentData.userEngagement.conversionRate}
                  </div>
                  <p className="text-sm text-gray-600">Conversion-Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalysis;
