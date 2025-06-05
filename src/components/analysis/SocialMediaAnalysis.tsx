import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BusinessData {
  address: string;
  url: string;
  industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
}

interface SocialMediaAnalysisProps {
  businessData: BusinessData;
}

const SocialMediaAnalysis: React.FC<SocialMediaAnalysisProps> = ({ businessData }) => {
  // Simulierte Social Media Daten
  const socialData = {
    facebook: {
      found: true,
      followers: 847,
      lastPost: "vor 3 Tagen",
      postFrequency: "2-3x pro Woche",
      engagement: "mittel"
    },
    instagram: {
      found: true,
      followers: 523,
      lastPost: "vor 1 Tag",
      postFrequency: "täglich",
      engagement: "hoch"
    },
    overallScore: 68,
    recentPosts: [
      {
        platform: "Instagram",
        content: "Neue Heizungsanlage erfolgreich installiert! 🔧 #heizung #installation",
        date: "vor 1 Tag",
        likes: 34,
        comments: 5
      },
      {
        platform: "Facebook",
        content: "Tipp des Tages: Regelmäßige Wartung verlängert die Lebensdauer Ihrer Heizung!",
        date: "vor 3 Tagen",
        likes: 28,
        comments: 12
      }
    ]
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'hoch': return 'text-green-600';
      case 'mittel': return 'text-yellow-600';
      case 'niedrig': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEngagementBadge = (engagement: string) => {
    switch (engagement) {
      case 'hoch': return 'default';
      case 'mittel': return 'secondary';
      case 'niedrig': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Social Media Analyse
            <Badge variant={socialData.overallScore >= 80 ? "default" : socialData.overallScore >= 60 ? "secondary" : "destructive"}>
              {socialData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Facebook & Instagram Präsenz-Analyse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Platform Übersicht */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Facebook */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📘 Facebook
                    <Badge variant={socialData.facebook.found ? "default" : "destructive"}>
                      {socialData.facebook.found ? "Gefunden" : "Nicht gefunden"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {socialData.facebook.found ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Follower:</span>
                        <span className="font-medium">{socialData.facebook.followers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Letzter Post:</span>
                        <span className="font-medium">{socialData.facebook.lastPost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Post-Häufigkeit:</span>
                        <span className="font-medium">{socialData.facebook.postFrequency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement:</span>
                        <Badge variant={getEngagementBadge(socialData.facebook.engagement)}>
                          {socialData.facebook.engagement}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Keine Facebook-Seite gefunden
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Instagram */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    📷 Instagram
                    <Badge variant={socialData.instagram.found ? "default" : "destructive"}>
                      {socialData.instagram.found ? "Gefunden" : "Nicht gefunden"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {socialData.instagram.found ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Follower:</span>
                        <span className="font-medium">{socialData.instagram.followers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Letzter Post:</span>
                        <span className="font-medium">{socialData.instagram.lastPost}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Post-Häufigkeit:</span>
                        <span className="font-medium">{socialData.instagram.postFrequency}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement:</span>
                        <Badge variant={getEngagementBadge(socialData.instagram.engagement)}>
                          {socialData.instagram.engagement}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Keine Instagram-Seite gefunden
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Aktuelle Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Aktuelle Posts</CardTitle>
                <CardDescription>
                  Letzte Beiträge auf den Social Media Kanälen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {socialData.recentPosts.map((post, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{post.platform}</Badge>
                        <span className="text-sm text-gray-500">{post.date}</span>
                      </div>
                      <p className="text-sm mb-3">{post.content}</p>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>👍 {post.likes} Likes</span>
                        <span>💬 {post.comments} Kommentare</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Empfehlungen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Empfehlungen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Stärken</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Aktive Instagram-Präsenz</li>
                      <li>• Regelmäßige Posts</li>
                      <li>• Gutes Engagement auf Instagram</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-yellow-600">Verbesserungen</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Facebook-Aktivität erhöhen</li>
                      <li>• Mehr visuelle Inhalte</li>
                      <li>• Hashtag-Strategie optimieren</li>
                      <li>• Community-Interaktion steigern</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaAnalysis;
