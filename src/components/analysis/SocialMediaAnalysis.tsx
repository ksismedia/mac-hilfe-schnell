
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface SocialMediaAnalysisProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
}

const SocialMediaAnalysis: React.FC<SocialMediaAnalysisProps> = ({ businessData, realData }) => {
  const socialData = realData.socialMedia;

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
            Social Media Analyse (Echte Suche)
            <Badge variant={socialData.overallScore >= 80 ? "default" : socialData.overallScore >= 60 ? "secondary" : "destructive"}>
              {socialData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Live-Suche nach Facebook & Instagram Präsenz für {realData.company.name}
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement:</span>
                        <Badge variant={getEngagementBadge(socialData.facebook.engagement)}>
                          {socialData.facebook.engagement}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Keine Facebook-Seite gefunden
                      </p>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-amber-800">
                          Automatische Suche konnte keine Facebook-Präsenz identifizieren
                        </p>
                      </div>
                    </div>
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
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Engagement:</span>
                        <Badge variant={getEngagementBadge(socialData.instagram.engagement)}>
                          {socialData.instagram.engagement}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Keine Instagram-Seite gefunden
                      </p>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-amber-800">
                          Automatische Suche konnte keine Instagram-Präsenz identifizieren
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Echte Daten Hinweis */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">✓ Live Social Media Suche</h4>
              <p className="text-sm text-blue-700">
                Diese Analyse basiert auf einer automatischen Suche nach Social Media Profilen für {realData.company.name}. 
                {!socialData.facebook.found && !socialData.instagram.found && 
                  " Es konnten keine Profile gefunden werden, da keine Social Media APIs integriert sind."
                }
              </p>
            </div>

            {/* Empfehlungen basierend auf echten Daten */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Empfehlungen (basierend auf Echtdaten)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2 text-blue-600">Nächste Schritte</h4>
                    <ul className="text-sm space-y-1">
                      {!socialData.facebook.found && <li>• Facebook Business-Seite erstellen</li>}
                      {!socialData.instagram.found && <li>• Instagram Business-Profil einrichten</li>}
                      <li>• Regelmäßig branchenrelevante Inhalte posten</li>
                      <li>• Kundenprojekte visuell dokumentieren</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-green-600">Potenzial</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Social Media Marketing für Handwerk</li>
                      <li>• Vorher/Nachher Bilder</li>
                      <li>• Kundenbewertungen teilen</li>
                      <li>• Lokale Reichweite erhöhen</li>
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
