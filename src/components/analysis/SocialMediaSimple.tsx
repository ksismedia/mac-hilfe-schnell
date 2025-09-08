
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
import { Edit, Plus, Facebook, Instagram, Linkedin, Twitter, Youtube, Video } from 'lucide-react';

interface SocialMediaSimpleProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
  };
  realData: RealBusinessData;
  manualData?: ManualSocialData | null;
  onManualDataChange?: (data: ManualSocialData | null) => void;
}

const SocialMediaSimple: React.FC<SocialMediaSimpleProps> = ({ 
  businessData, 
  realData, 
  manualData,
  onManualDataChange 
}) => {
  const [showInput, setShowInput] = useState(false);
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

  const onSubmit = (data: ManualSocialData) => {
    if (onManualDataChange) {
      onManualDataChange(data);
    }
    setShowInput(false);
    toast({
      title: "Social Media Daten gespeichert",
      description: "Die Daten wurden erfolgreich übernommen.",
    });
  };

  const handleClear = () => {
    form.reset({
      facebookUrl: '', instagramUrl: '', linkedinUrl: '', twitterUrl: '', youtubeUrl: '', tiktokUrl: '',
      facebookFollowers: '', instagramFollowers: '', linkedinFollowers: '', twitterFollowers: '', youtubeSubscribers: '', tiktokFollowers: '',
      facebookLastPost: '', instagramLastPost: '', linkedinLastPost: '', twitterLastPost: '', youtubeLastPost: '', tiktokLastPost: ''
    });
    if (onManualDataChange) {
      onManualDataChange(null);
    }
    setShowInput(false);
    toast({
      title: "Daten zurückgesetzt",
      description: "Alle Social Media Daten wurden gelöscht.",
    });
  };

  // Einfache Prüfung ob Daten vorhanden sind
  const hasData = Boolean(manualData && (
    manualData.facebookUrl || manualData.instagramUrl || manualData.linkedinUrl || 
    manualData.twitterUrl || manualData.youtubeUrl || manualData.tiktokUrl
  ));

  const platforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      url: manualData?.facebookUrl,
      followers: manualData?.facebookFollowers,
      lastPost: manualData?.facebookLastPost
    },
    {
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      url: manualData?.instagramUrl,
      followers: manualData?.instagramFollowers,
      lastPost: manualData?.instagramLastPost
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      url: manualData?.linkedinUrl,
      followers: manualData?.linkedinFollowers,
      lastPost: manualData?.linkedinLastPost
    },
    {
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      url: manualData?.twitterUrl,
      followers: manualData?.twitterFollowers,
      lastPost: manualData?.twitterLastPost
    },
    {
      name: 'YouTube',
      icon: Youtube,
      color: 'text-red-600',
      url: manualData?.youtubeUrl,
      followers: manualData?.youtubeSubscribers,
      lastPost: manualData?.youtubeLastPost
    },
    {
      name: 'TikTok',
      icon: Video,
      color: 'text-pink-500',
      url: manualData?.tiktokUrl,
      followers: manualData?.tiktokFollowers,
      lastPost: manualData?.tiktokLastPost
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Social Media Analyse
            <div className="flex gap-2">
              <Badge variant={hasData ? "default" : "secondary"}>
                {hasData ? "Aktiv" : "Keine Daten"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowInput(!showInput)}
              >
                {showInput ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Schließen
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Eingeben
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Social Media Präsenz für {realData.company.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showInput ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms.map((platform) => (
                  <div key={platform.name} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <platform.icon className={`h-5 w-5 ${platform.color}`} />
                      <h4 className="font-medium">{platform.name}</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`${platform.name.toLowerCase()}Url`}>URL</Label>
                        <Input
                          id={`${platform.name.toLowerCase()}Url`}
                          placeholder={`${platform.name} URL`}
                          {...form.register(`${platform.name.toLowerCase()}Url` as keyof ManualSocialData)}
                        />
                      </div>
                       <div>
                         <Label htmlFor={`${platform.name.toLowerCase()}Followers`}>
                           {platform.name === 'YouTube' ? 'Abonnenten' : 'Follower'}
                         </Label>
                         <Input
                           id={`${platform.name.toLowerCase()}Followers`}
                           placeholder="Anzahl"
                           {...form.register(
                             platform.name === 'YouTube' 
                               ? 'youtubeSubscribers' 
                               : platform.name === 'TikTok'
                               ? 'tiktokFollowers'
                               : `${platform.name.toLowerCase()}Followers` as keyof ManualSocialData
                           )}
                         />
                       </div>
                      <div>
                        <Label htmlFor={`${platform.name.toLowerCase()}LastPost`}>Letzter Post</Label>
                        <Input
                          id={`${platform.name.toLowerCase()}LastPost`}
                          placeholder="z.B. vor 2 Tagen"
                          {...form.register(`${platform.name.toLowerCase()}LastPost` as keyof ManualSocialData)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  Speichern
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowInput(false)}>
                  Abbrechen
                </Button>
                {hasData && (
                  <Button type="button" variant="destructive" onClick={handleClear}>
                    Alle löschen
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {hasData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platforms.map((platform) => {
                    const isActive = Boolean(platform.url && platform.url.trim() !== '');
                    return (
                      <Card key={platform.name} className={isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center gap-2">
                            <platform.icon className={`h-4 w-4 ${platform.color}`} />
                            {platform.name}
                            <Badge variant={isActive ? "default" : "secondary"} className="ml-auto">
                              {isActive ? "Aktiv" : "Inaktiv"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {isActive ? (
                            <div className="space-y-2 text-sm">
                              <div>
                                <span className="text-gray-600">Follower:</span>
                                <span className="font-medium ml-2">{platform.followers || '0'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Letzter Post:</span>
                                <span className="font-medium ml-2">{platform.lastPost || 'Unbekannt'}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Nicht konfiguriert</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Keine Social Media Daten eingegeben</p>
                  <Button onClick={() => setShowInput(true)} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Social Media Daten hinzufügen
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaSimple;
