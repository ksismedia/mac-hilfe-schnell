import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualSocialData } from '@/hooks/useManualData';
import { Edit, Plus } from 'lucide-react';

interface SocialMediaAnalysisProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management';
  };
  realData: RealBusinessData;
  manualData?: ManualSocialData | null;
  onManualDataChange?: (data: ManualSocialData | null) => void;
}

const SocialMediaAnalysis: React.FC<SocialMediaAnalysisProps> = ({ 
  businessData, 
  realData, 
  manualData,
  onManualDataChange 
}) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<ManualSocialData>({
    defaultValues: {
      facebookUrl: manualData?.facebookUrl || '',
      instagramUrl: manualData?.instagramUrl || '',
      linkedinUrl: manualData?.linkedinUrl || '',
      twitterUrl: manualData?.twitterUrl || '',
      youtubeUrl: manualData?.youtubeUrl || '',
      tiktokUrl: manualData?.tiktokUrl || '',
      facebookFollowers: manualData?.facebookFollowers || '',
      instagramFollowers: manualData?.instagramFollowers || '',
      linkedinFollowers: manualData?.linkedinFollowers || '',
      twitterFollowers: manualData?.twitterFollowers || '',
      youtubeSubscribers: manualData?.youtubeSubscribers || '',
      tiktokFollowers: manualData?.tiktokFollowers || '',
      facebookLastPost: manualData?.facebookLastPost || '',
      instagramLastPost: manualData?.instagramLastPost || '',
      linkedinLastPost: manualData?.linkedinLastPost || '',
      twitterLastPost: manualData?.twitterLastPost || '',
      youtubeLastPost: manualData?.youtubeLastPost || '',
      tiktokLastPost: manualData?.tiktokLastPost || ''
    }
  });

  // Reset form when manualData changes
  React.useEffect(() => {
    form.reset({
      facebookUrl: manualData?.facebookUrl || '',
      instagramUrl: manualData?.instagramUrl || '',
      linkedinUrl: manualData?.linkedinUrl || '',
      twitterUrl: manualData?.twitterUrl || '',
      youtubeUrl: manualData?.youtubeUrl || '',
      tiktokUrl: manualData?.tiktokUrl || '',
      facebookFollowers: manualData?.facebookFollowers || '',
      instagramFollowers: manualData?.instagramFollowers || '',
      linkedinFollowers: manualData?.linkedinFollowers || '',
      twitterFollowers: manualData?.twitterFollowers || '',
      youtubeSubscribers: manualData?.youtubeSubscribers || '',
      tiktokFollowers: manualData?.tiktokFollowers || '',
      facebookLastPost: manualData?.facebookLastPost || '',
      instagramLastPost: manualData?.instagramLastPost || '',
      linkedinLastPost: manualData?.linkedinLastPost || '',
      twitterLastPost: manualData?.twitterLastPost || '',
      youtubeLastPost: manualData?.youtubeLastPost || '',
      tiktokLastPost: manualData?.tiktokLastPost || ''
    });
    console.log('Form reset with manual data:', manualData);
  }, [manualData, form]);

  const onSubmit = (data: ManualSocialData) => {
    console.log('Submitting social media data:', data);
    if (onManualDataChange) {
      onManualDataChange(data);
    }
    setShowManualInput(false);
    toast({
      title: "Social Media Daten aktualisiert",
      description: "Die manuell eingegebenen Daten wurden übernommen.",
    });
  };

  const handleClearManual = () => {
    form.reset({
      facebookUrl: '', instagramUrl: '', linkedinUrl: '', twitterUrl: '', youtubeUrl: '', tiktokUrl: '',
      facebookFollowers: '', instagramFollowers: '', linkedinFollowers: '', twitterFollowers: '', youtubeSubscribers: '', tiktokFollowers: '',
      facebookLastPost: '', instagramLastPost: '', linkedinLastPost: '', twitterLastPost: '', youtubeLastPost: '', tiktokLastPost: ''
    });
    if (onManualDataChange) {
      onManualDataChange(null);
    }
    setShowManualInput(false);
    toast({
      title: "Manuelle Eingaben zurückgesetzt",
      description: "Es werden wieder die automatisch erkannten Daten verwendet.",
    });
  };

  // KOMPLETT NEUE LOGIK - NUR MANUELLE EINGABEN ZÄHLEN
  const hasManualData = Boolean(manualData && (
    (manualData.facebookUrl && manualData.facebookUrl.trim() !== '') ||
    (manualData.instagramUrl && manualData.instagramUrl.trim() !== '') ||
    (manualData.linkedinUrl && manualData.linkedinUrl.trim() !== '') ||
    (manualData.twitterUrl && manualData.twitterUrl.trim() !== '') ||
    (manualData.youtubeUrl && manualData.youtubeUrl.trim() !== '') ||
    (manualData.tiktokUrl && manualData.tiktokUrl.trim() !== '')
  ));

  // NUR MANUELLE URL-EINGABEN ZÄHLEN - AUTOMATISCHE ERKENNUNG IGNORIERT
  const hasFacebook = Boolean(manualData?.facebookUrl && manualData.facebookUrl.trim() !== '');
  const hasInstagram = Boolean(manualData?.instagramUrl && manualData.instagramUrl.trim() !== '');
  const hasLinkedIn = Boolean(manualData?.linkedinUrl && manualData.linkedinUrl.trim() !== '');
  const hasTwitter = Boolean(manualData?.twitterUrl && manualData.twitterUrl.trim() !== '');
  const hasYouTube = Boolean(manualData?.youtubeUrl && manualData.youtubeUrl.trim() !== '');
  const hasTikTok = Boolean(manualData?.tiktokUrl && manualData.tiktokUrl.trim() !== '');

  console.log('SOCIAL MEDIA STATUS (NUR MANUELL):', {
    hasManualData,
    hasFacebook,
    hasInstagram,
    hasLinkedIn,
    hasTwitter,
    hasYouTube,
    hasTikTok
  });

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
            <div className="flex gap-3 items-center">
              <Badge variant={hasManualData ? "default" : "secondary"}>
                {hasManualData ? "✓ Manuell eingegeben" : "Keine Eingaben"}
              </Badge>
              <Button
                variant={showManualInput ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowManualInput(!showManualInput)}
                className="bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-medium px-4 py-2 min-w-[140px]"
              >
                {showManualInput ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Abbrechen
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Manuell eingeben
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {hasManualData 
              ? `Manuell eingegebene Social Media Daten für ${realData.company.name}`
              : `Keine Social Media Daten eingegeben - nur manuelle Eingaben werden bewertet`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showManualInput ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Social Media Kanäle eingeben</h4>
                <p className="text-sm text-blue-800">
                  Tragen Sie hier Ihre Social Media URLs, Follower-Zahlen und letzte Posts ein:
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Facebook Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3 text-blue-700">📘 Facebook</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="facebookUrl">Facebook URL</Label>
                      <Input
                        id="facebookUrl"
                        placeholder="https://www.facebook.com/ihr-unternehmen"
                        {...form.register('facebookUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebookFollowers">Follower</Label>
                      <Input
                        id="facebookFollowers"
                        placeholder="z.B. 250"
                        {...form.register('facebookFollowers')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebookLastPost">Letzter Post</Label>
                      <Input
                        id="facebookLastPost"
                        placeholder="z.B. vor 3 Tagen"
                        {...form.register('facebookLastPost')}
                      />
                    </div>
                  </div>
                </div>

                {/* Instagram Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3 text-purple-700">📷 Instagram</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="instagramUrl">Instagram URL</Label>
                      <Input
                        id="instagramUrl"
                        placeholder="https://www.instagram.com/ihr-unternehmen"
                        {...form.register('instagramUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagramFollowers">Follower</Label>
                      <Input
                        id="instagramFollowers"
                        placeholder="z.B. 180"
                        {...form.register('instagramFollowers')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagramLastPost">Letzter Post</Label>
                      <Input
                        id="instagramLastPost"
                        placeholder="z.B. vor 1 Woche"
                        {...form.register('instagramLastPost')}
                      />
                    </div>
                  </div>
                </div>

                {/* LinkedIn Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3 text-blue-600">💼 LinkedIn</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                      <Input
                        id="linkedinUrl"
                        placeholder="https://www.linkedin.com/company/ihr-unternehmen"
                        {...form.register('linkedinUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedinFollowers">Follower</Label>
                      <Input
                        id="linkedinFollowers"
                        placeholder="z.B. 120"
                        {...form.register('linkedinFollowers')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedinLastPost">Letzter Post</Label>
                      <Input
                        id="linkedinLastPost"
                        placeholder="z.B. vor 5 Tagen"
                        {...form.register('linkedinLastPost')}
                      />
                    </div>
                  </div>
                </div>

                {/* Twitter Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3 text-blue-400">🐦 Twitter / X</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="twitterUrl">Twitter URL</Label>
                      <Input
                        id="twitterUrl"
                        placeholder="https://twitter.com/ihr-unternehmen"
                        {...form.register('twitterUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterFollowers">Follower</Label>
                      <Input
                        id="twitterFollowers"
                        placeholder="z.B. 85"
                        {...form.register('twitterFollowers')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitterLastPost">Letzter Post</Label>
                      <Input
                        id="twitterLastPost"
                        placeholder="z.B. vor 2 Tagen"
                        {...form.register('twitterLastPost')}
                      />
                    </div>
                  </div>
                </div>

                {/* YouTube Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3 text-red-600">🎥 YouTube</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="youtubeUrl">YouTube URL</Label>
                      <Input
                        id="youtubeUrl"
                        placeholder="https://www.youtube.com/channel/ihr-kanal"
                        {...form.register('youtubeUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtubeSubscribers">Abonnenten</Label>
                      <Input
                        id="youtubeSubscribers"
                        placeholder="z.B. 45"
                        {...form.register('youtubeSubscribers')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtubeLastPost">Letztes Video</Label>
                      <Input
                        id="youtubeLastPost"
                        placeholder="z.B. vor 2 Wochen"
                        {...form.register('youtubeLastPost')}
                      />
                    </div>
                  </div>
                </div>

                {/* TikTok Section */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3 text-pink-600">🎵 TikTok</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tiktokUrl">TikTok URL</Label>
                      <Input
                        id="tiktokUrl"
                        placeholder="https://www.tiktok.com/@ihr-unternehmen"
                        {...form.register('tiktokUrl')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktokFollowers">Follower</Label>
                      <Input
                        id="tiktokFollowers"
                        placeholder="z.B. 350"
                        {...form.register('tiktokFollowers')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tiktokLastPost">Letztes Video</Label>
                      <Input
                        id="tiktokLastPost"
                        placeholder="z.B. vor 4 Tagen"
                        {...form.register('tiktokLastPost')}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2"
                >
                  Daten übernehmen
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowManualInput(false)}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium px-6 py-2"
                >
                  Abbrechen
                </Button>
                {hasManualData && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    onClick={handleClearManual}
                    className="font-medium px-6 py-2"
                  >
                    Zurücksetzen
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Facebook */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      📘 Facebook
                      <Badge variant={hasFacebook ? "default" : "destructive"}>
                        {hasFacebook ? "Eingegeben" : "Nicht eingegeben"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasFacebook ? (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>URL:</strong> {manualData?.facebookUrl}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Follower:</span>
                          <span className="font-medium">{manualData?.facebookFollowers || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Letzter Post:</span>
                          <span className="font-medium">{manualData?.facebookLastPost || 'Nicht angegeben'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Keine Facebook-Daten eingegeben
                        </p>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-amber-800">
                            Nutzen Sie "Manuell eingeben" um Ihre Facebook-Daten hinzuzufügen
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
                      <Badge variant={hasInstagram ? "default" : "destructive"}>
                        {hasInstagram ? "Eingegeben" : "Nicht eingegeben"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasInstagram ? (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>URL:</strong> {manualData?.instagramUrl}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Follower:</span>
                          <span className="font-medium">{manualData?.instagramFollowers || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Letzter Post:</span>
                          <span className="font-medium">{manualData?.instagramLastPost || 'Nicht angegeben'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Keine Instagram-Daten eingegeben
                        </p>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-amber-800">
                            Nutzen Sie "Manuell eingeben" um Ihre Instagram-Daten hinzuzufügen
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* LinkedIn */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      💼 LinkedIn
                      <Badge variant={hasLinkedIn ? "default" : "destructive"}>
                        {hasLinkedIn ? "Eingegeben" : "Nicht eingegeben"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasLinkedIn ? (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>URL:</strong> {manualData?.linkedinUrl}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Follower:</span>
                          <span className="font-medium">{manualData?.linkedinFollowers || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Letzter Post:</span>
                          <span className="font-medium">{manualData?.linkedinLastPost || 'Nicht angegeben'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Keine LinkedIn-Daten eingegeben
                        </p>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-amber-800">
                            Nutzen Sie "Manuell eingeben" um Ihre LinkedIn-Daten hinzuzufügen
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Twitter */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🐦 Twitter / X
                      <Badge variant={hasTwitter ? "default" : "destructive"}>
                        {hasTwitter ? "Eingegeben" : "Nicht eingegeben"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasTwitter ? (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>URL:</strong> {manualData?.twitterUrl}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Follower:</span>
                          <span className="font-medium">{manualData?.twitterFollowers || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Letzter Post:</span>
                          <span className="font-medium">{manualData?.twitterLastPost || 'Nicht angegeben'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Keine Twitter-Daten eingegeben
                        </p>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-amber-800">
                            Nutzen Sie "Manuell eingeben" um Ihre Twitter-Daten hinzuzufügen
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* YouTube */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🎥 YouTube
                      <Badge variant={hasYouTube ? "default" : "destructive"}>
                        {hasYouTube ? "Eingegeben" : "Nicht eingegeben"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasYouTube ? (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>URL:</strong> {manualData?.youtubeUrl}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Abonnenten:</span>
                          <span className="font-medium">{manualData?.youtubeSubscribers || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Letztes Video:</span>
                          <span className="font-medium">{manualData?.youtubeLastPost || 'Nicht angegeben'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Keine YouTube-Daten eingegeben
                        </p>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-amber-800">
                            Nutzen Sie "Manuell eingeben" um Ihre YouTube-Daten hinzuzufügen
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* TikTok */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      🎵 TikTok
                      <Badge variant={hasTikTok ? "default" : "destructive"}>
                        {hasTikTok ? "Eingegeben" : "Nicht eingegeben"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasTikTok ? (
                      <div className="space-y-3">
                        <div className="text-sm">
                          <strong>URL:</strong> {manualData?.tiktokUrl}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Follower:</span>
                          <span className="font-medium">{manualData?.tiktokFollowers || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Letztes Video:</span>
                          <span className="font-medium">{manualData?.tiktokLastPost || 'Nicht angegeben'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Keine TikTok-Daten eingegeben
                        </p>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <p className="text-xs text-amber-800">
                            Nutzen Sie "Manuell eingeben" um Ihre TikTok-Daten hinzuzufügen
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Empfehlungen */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Empfehlungen</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-blue-600">Nächste Schritte</h4>
                      <ul className="text-sm space-y-1">
                        {!hasFacebook && <li>• Facebook Business-Seite erstellen</li>}
                        {!hasInstagram && <li>• Instagram Business-Profil einrichten</li>}
                        {!hasLinkedIn && <li>• LinkedIn Unternehmensseite anlegen</li>}
                        {!hasTwitter && <li>• Twitter/X Business-Account erstellen</li>}
                        {!hasYouTube && <li>• YouTube-Kanal für Firmenpräsentation</li>}
                        {!hasTikTok && <li>• TikTok Business-Account für junge Zielgruppe</li>}
                        <li>• Regelmäßig branchenrelevante Inhalte posten</li>
                        <li>• Kundenprojekte visuell dokumentieren</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Potenzial</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Multi-Channel Social Media Marketing</li>
                        <li>• Vorher/Nachher Bilder und Videos</li>
                        <li>• B2B-Networking über LinkedIn</li>
                        <li>• Kundenbewertungen teilen</li>
                        <li>• Lokale Reichweite erhöhen</li>
                        <li>• Fachkompetenz durch YouTube-Tutorials</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaAnalysis;
