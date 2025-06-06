
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { Edit, Plus } from 'lucide-react';

interface SocialMediaAnalysisProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
}

interface ManualSocialData {
  facebookUrl: string;
  instagramUrl: string;
  facebookFollowers: string;
  instagramFollowers: string;
  facebookLastPost: string;
  instagramLastPost: string;
}

const SocialMediaAnalysis: React.FC<SocialMediaAnalysisProps> = ({ businessData, realData }) => {
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualData, setManualData] = useState<ManualSocialData | null>(null);
  const { toast } = useToast();
  
  const form = useForm<ManualSocialData>({
    defaultValues: {
      facebookUrl: '',
      instagramUrl: '',
      facebookFollowers: '',
      instagramFollowers: '',
      facebookLastPost: '',
      instagramLastPost: ''
    }
  });

  const onSubmit = (data: ManualSocialData) => {
    setManualData(data);
    setShowManualInput(false);
    toast({
      title: "Social Media Daten aktualisiert",
      description: "Die manuell eingegebenen Daten wurden übernommen.",
    });
  };

  // Verwende manuelle Daten falls vorhanden, sonst Fallback
  const socialData = realData.socialMedia;
  const hasManualData = manualData && (manualData.facebookUrl || manualData.instagramUrl);

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
                {hasManualData ? "✓ Manuell eingegeben" : "Automatisch erkannt"}
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
              : `Live-Suche nach Facebook & Instagram Präsenz für ${realData.company.name}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showManualInput ? (
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">Social Media Kanäle eingeben</h4>
                <p className="text-sm text-blue-800">
                  Tragen Sie hier Ihre Social Media URLs, Follower-Zahlen und Informationen zu letzten Posts ein:
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebookUrl">Facebook URL</Label>
                  <Input
                    id="facebookUrl"
                    placeholder="https://www.facebook.com/ihr-unternehmen"
                    {...form.register('facebookUrl')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookFollowers">Facebook Follower</Label>
                  <Input
                    id="facebookFollowers"
                    placeholder="z.B. 250"
                    {...form.register('facebookFollowers')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebookLastPost">Facebook - Letzter Post</Label>
                  <Input
                    id="facebookLastPost"
                    placeholder="z.B. vor 2 Tagen, vor 1 Woche"
                    {...form.register('facebookLastPost')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    placeholder="https://www.instagram.com/ihr-unternehmen"
                    {...form.register('instagramUrl')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramFollowers">Instagram Follower</Label>
                  <Input
                    id="instagramFollowers"
                    placeholder="z.B. 180"
                    {...form.register('instagramFollowers')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramLastPost">Instagram - Letzter Post</Label>
                  <Input
                    id="instagramLastPost"
                    placeholder="z.B. vor 1 Tag, vor 3 Tagen"
                    {...form.register('instagramLastPost')}
                  />
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
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Platform Übersicht */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      📘 Facebook
                      <Badge variant={(hasManualData && manualData?.facebookUrl) || socialData.facebook.found ? "default" : "destructive"}>
                        {(hasManualData && manualData?.facebookUrl) || socialData.facebook.found ? "Gefunden" : "Nicht gefunden"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(hasManualData && manualData?.facebookUrl) || socialData.facebook.found ? (
                      <div className="space-y-3">
                        {hasManualData && manualData?.facebookUrl && (
                          <div className="text-sm">
                            <strong>URL:</strong> {manualData.facebookUrl}
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Follower:</span>
                          <span className="font-medium">
                            {hasManualData && manualData?.facebookFollowers ? manualData.facebookFollowers : socialData.facebook.followers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Letzter Post:</span>
                          <span className="font-medium">
                            {hasManualData && manualData?.facebookLastPost ? manualData.facebookLastPost : socialData.facebook.lastPost}
                          </span>
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
                      <Badge variant={(hasManualData && manualData?.instagramUrl) || socialData.instagram.found ? "default" : "destructive"}>
                        {(hasManualData && manualData?.instagramUrl) || socialData.instagram.found ? "Gefunden" : "Nicht gefunden"}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(hasManualData && manualData?.instagramUrl) || socialData.instagram.found ? (
                      <div className="space-y-3">
                        {hasManualData && manualData?.instagramUrl && (
                          <div className="text-sm">
                            <strong>URL:</strong> {manualData.instagramUrl}
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Follower:</span>
                          <span className="font-medium">
                            {hasManualData && manualData?.instagramFollowers ? manualData.instagramFollowers : socialData.instagram.followers}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Letzter Post:</span>
                          <span className="font-medium">
                            {hasManualData && manualData?.instagramLastPost ? manualData.instagramLastPost : socialData.instagram.lastPost}
                          </span>
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
                            Nutzen Sie "Manuell eingeben" um Ihre Instagram-Daten hinzuzufügen
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
                        {!(hasManualData && manualData?.facebookUrl) && !socialData.facebook.found && <li>• Facebook Business-Seite erstellen</li>}
                        {!(hasManualData && manualData?.instagramUrl) && !socialData.instagram.found && <li>• Instagram Business-Profil einrichten</li>}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialMediaAnalysis;
