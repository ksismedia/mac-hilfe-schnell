
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useManualDataContext } from '@/contexts/ManualDataContext';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { Progress } from '@/components/ui/progress';
import { Facebook, Instagram, Edit3, Save, X } from 'lucide-react';

interface SocialMediaAnalysisProps {
  businessData: {
    url: string;
    address: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
}

const SocialMediaAnalysis: React.FC<SocialMediaAnalysisProps> = ({ businessData, realData }) => {
  const { manualSocialData, updateSocialData } = useManualDataContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    facebookUrl: '',
    instagramUrl: '',
    facebookFollowers: '',
    instagramFollowers: '',
    facebookLastPost: '',
    instagramLastPost: ''
  });

  useEffect(() => {
    if (manualSocialData) {
      setEditData(manualSocialData);
    } else {
      setEditData({
        facebookUrl: realData.socialMedia.facebook.url || '',
        instagramUrl: realData.socialMedia.instagram.url || '',
        facebookFollowers: realData.socialMedia.facebook.followers?.toString() || '',
        instagramFollowers: realData.socialMedia.instagram.followers?.toString() || '',
        facebookLastPost: realData.socialMedia.facebook.lastPost || '',
        instagramLastPost: realData.socialMedia.instagram.lastPost || ''
      });
    }
  }, [manualSocialData, realData]);

  const handleSave = () => {
    updateSocialData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (manualSocialData) {
      setEditData(manualSocialData);
    } else {
      setEditData({
        facebookUrl: realData.socialMedia.facebook.url || '',
        instagramUrl: realData.socialMedia.instagram.url || '',
        facebookFollowers: realData.socialMedia.facebook.followers?.toString() || '',
        instagramFollowers: realData.socialMedia.instagram.followers?.toString() || '',
        facebookLastPost: realData.socialMedia.facebook.lastPost || '',
        instagramLastPost: realData.socialMedia.instagram.lastPost || ''
      });
    }
    setIsEditing(false);
  };

  // Verwende manuelle Daten wenn verfügbar, sonst Analysedaten
  const currentData = manualSocialData ? {
    facebook: {
      url: manualSocialData.facebookUrl,
      followers: parseInt(manualSocialData.facebookFollowers) || 0,
      lastPost: manualSocialData.facebookLastPost,
      found: !!manualSocialData.facebookUrl
    },
    instagram: {
      url: manualSocialData.instagramUrl,
      followers: parseInt(manualSocialData.instagramFollowers) || 0,
      lastPost: manualSocialData.instagramLastPost,
      found: !!manualSocialData.instagramUrl
    }
  } : realData.socialMedia;

  // Score-Berechnung basierend auf aktuellen Daten
  const facebookScore = currentData.facebook.found ? (currentData.facebook.followers > 100 ? 100 : 60) : 0;
  const instagramScore = currentData.instagram.found ? (currentData.instagram.followers > 100 ? 100 : 60) : 0;
  const overallScore = Math.round((facebookScore + instagramScore) / 2);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              📲 Social Media Analyse
              {manualSocialData && (
                <Badge variant="outline" className="text-blue-600 bg-blue-50">
                  Manuell bearbeitet
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Facebook und Instagram Präsenz für {businessData.url}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}/100
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              {isEditing ? 'Abbrechen' : 'Bearbeiten'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hauptbewertung */}
        <div className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
            {overallScore}/100
          </div>
          <Badge variant={getScoreBadge(overallScore)} className="text-lg px-4 py-2">
            Social Media Score
          </Badge>
          <div className="mt-3 text-sm text-gray-600">
            {currentData.facebook.found && currentData.instagram.found ? 'Beide Plattformen aktiv' :
             currentData.facebook.found || currentData.instagram.found ? 'Eine Plattform aktiv' : 
             'Keine Social Media Präsenz gefunden'}
          </div>
        </div>

        {/* Bearbeitungsmodus */}
        {isEditing && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg space-y-4">
            <h3 className="font-semibold text-yellow-900">Manuelle Eingabe</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook
                </h4>
                <div className="space-y-2">
                  <Label>Profil-URL</Label>
                  <Input
                    value={editData.facebookUrl}
                    onChange={(e) => setEditData({ ...editData, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follower/Likes</Label>
                  <Input
                    value={editData.facebookFollowers}
                    onChange={(e) => setEditData({ ...editData, facebookFollowers: e.target.value })}
                    placeholder="z.B. 250"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Letzter Post</Label>
                  <Input
                    value={editData.facebookLastPost}
                    onChange={(e) => setEditData({ ...editData, facebookLastPost: e.target.value })}
                    placeholder="z.B. vor 2 Tagen"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  Instagram
                </h4>
                <div className="space-y-2">
                  <Label>Profil-URL</Label>
                  <Input
                    value={editData.instagramUrl}
                    onChange={(e) => setEditData({ ...editData, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Follower</Label>
                  <Input
                    value={editData.instagramFollowers}
                    onChange={(e) => setEditData({ ...editData, instagramFollowers: e.target.value })}
                    placeholder="z.B. 180"
                    type="number"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Letzter Post</Label>
                  <Input
                    value={editData.instagramLastPost}
                    onChange={(e) => setEditData({ ...editData, instagramLastPost: e.target.value })}
                    placeholder="z.B. vor 1 Woche"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {/* Plattform-Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Facebook */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Facebook</h3>
              <Badge variant={currentData.facebook.found ? "default" : "destructive"}>
                {currentData.facebook.found ? "Gefunden" : "Nicht gefunden"}
              </Badge>
            </div>
            
            {currentData.facebook.found ? (
              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div><strong>URL:</strong> {currentData.facebook.url}</div>
                    <div><strong>Follower/Likes:</strong> {currentData.facebook.followers?.toLocaleString() || 'Unbekannt'}</div>
                    <div><strong>Letzter Post:</strong> {currentData.facebook.lastPost || 'Unbekannt'}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Facebook Score</span>
                    <span className={getScoreColor(facebookScore)}>{facebookScore}/100</span>
                  </div>
                  <Progress value={facebookScore} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">Keine Facebook-Präsenz gefunden</p>
              </div>
            )}
          </div>

          {/* Instagram */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-600" />
              <h3 className="text-lg font-semibold">Instagram</h3>
              <Badge variant={currentData.instagram.found ? "default" : "destructive"}>
                {currentData.instagram.found ? "Gefunden" : "Nicht gefunden"}
              </Badge>
            </div>
            
            {currentData.instagram.found ? (
              <div className="space-y-3">
                <div className="bg-pink-50 border border-pink-200 p-4 rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div><strong>URL:</strong> {currentData.instagram.url}</div>
                    <div><strong>Follower:</strong> {currentData.instagram.followers?.toLocaleString() || 'Unbekannt'}</div>
                    <div><strong>Letzter Post:</strong> {currentData.instagram.lastPost || 'Unbekannt'}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Instagram Score</span>
                    <span className={getScoreColor(instagramScore)}>{instagramScore}/100</span>
                  </div>
                  <Progress value={instagramScore} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <p className="text-sm text-red-800">Keine Instagram-Präsenz gefunden</p>
              </div>
            )}
          </div>
        </div>

        {/* Empfehlungen */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Empfehlungen</h3>
          <div className="space-y-2 text-sm text-blue-800">
            {overallScore >= 80 ? (
              <p>Excellent Social Media Präsenz! Halten Sie die regelmäßige Aktivität aufrecht.</p>
            ) : overallScore >= 60 ? (
              <div>
                <p className="font-medium">Gute Basis - Optimierungspotential vorhanden:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {!currentData.facebook.found && <li>Facebook Business-Seite erstellen</li>}
                  {!currentData.instagram.found && <li>Instagram Business-Profil einrichten</li>}
                  <li>Regelmäßige Posts (mindestens 2-3 pro Woche)</li>
                  <li>Mehr Follower durch Content-Marketing gewinnen</li>
                </ul>
              </div>
            ) : (
              <div>
                <p className="font-medium">Dringender Handlungsbedarf:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Social Media Strategie entwickeln</li>
                  <li>Business-Profile auf Facebook und Instagram erstellen</li>
                  <li>Hochwertigen Content erstellen und teilen</li>
                  <li>Mit lokaler Community interagieren</li>
                  <li>Referenzen und Arbeitsbeispiele zeigen</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialMediaAnalysis;
