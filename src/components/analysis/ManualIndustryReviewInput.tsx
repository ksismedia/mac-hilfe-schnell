import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlatformReview {
  platformName: string;
  rating: number;
  reviewCount: number;
  profileUrl?: string;
  isVerified: boolean;
  lastReviewDate?: string;
}

interface ManualIndustryReviewInputProps {
  onUpdate: (data: { platforms: PlatformReview[]; overallScore: number }) => void;
  initialData?: { platforms: PlatformReview[]; overallScore: number };
}

const PLATFORM_OPTIONS = [
  "MyHammer",
  "11880.com",
  "Handwerker-Versand.de",
  "WhoFinance",
  "Jameda",
  "Trustpilot",
  "ProvenExpert",
  "Yelp",
  "Andere"
];

export const ManualIndustryReviewInput = ({ onUpdate, initialData }: ManualIndustryReviewInputProps) => {
  const { toast } = useToast();
  const [platforms, setPlatforms] = useState<PlatformReview[]>(
    initialData?.platforms || []
  );
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlatform, setCurrentPlatform] = useState<PlatformReview>({
    platformName: "",
    rating: 0,
    reviewCount: 0,
    profileUrl: "",
    isVerified: false,
    lastReviewDate: ""
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const calculateOverallScore = (platformList: PlatformReview[]) => {
    if (platformList.length === 0) return 0;

    const avgRating = platformList.reduce((sum, p) => sum + p.rating, 0) / platformList.length;
    const totalReviews = platformList.reduce((sum, p) => sum + p.reviewCount, 0);
    const verifiedCount = platformList.filter(p => p.isVerified).length;

    // Score berechnen: 50% Rating, 30% Anzahl Bewertungen, 20% Verifizierung
    const ratingScore = (avgRating / 5) * 50;
    const reviewScore = Math.min((totalReviews / 50) * 30, 30);
    const verificationScore = (verifiedCount / platformList.length) * 20;

    return Math.round(ratingScore + reviewScore + verificationScore);
  };

  const handleAddOrUpdatePlatform = () => {
    if (!currentPlatform.platformName || currentPlatform.rating === 0) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie mindestens Plattform und Bewertung aus",
        variant: "destructive",
      });
      return;
    }

    let updatedPlatforms: PlatformReview[];
    if (editIndex !== null) {
      updatedPlatforms = platforms.map((p, i) => i === editIndex ? currentPlatform : p);
      setEditIndex(null);
    } else {
      updatedPlatforms = [...platforms, currentPlatform];
    }

    setPlatforms(updatedPlatforms);
    setCurrentPlatform({
      platformName: "",
      rating: 0,
      reviewCount: 0,
      profileUrl: "",
      isVerified: false,
      lastReviewDate: ""
    });

    toast({
      title: "Erfolg",
      description: editIndex !== null ? "Plattform aktualisiert" : "Plattform hinzugefügt",
    });
  };

  const handleEditPlatform = (index: number) => {
    setCurrentPlatform(platforms[index]);
    setEditIndex(index);
    setIsEditing(true);
  };

  const handleDeletePlatform = (index: number) => {
    const updatedPlatforms = platforms.filter((_, i) => i !== index);
    setPlatforms(updatedPlatforms);
    toast({
      title: "Erfolg",
      description: "Plattform gelöscht",
    });
  };

  const handleSave = () => {
    const overallScore = calculateOverallScore(platforms);
    onUpdate({ platforms, overallScore });
    setIsEditing(false);
    toast({
      title: "Erfolg",
      description: "Bewertungsplattform-Daten gespeichert",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Branchenspezifische Bewertungsplattformen
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Bearbeiten
            </Button>
          ) : (
            <Button onClick={handleSave} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="space-y-4">
            {platforms.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Keine Plattformen erfasst. Klicken Sie auf "Bearbeiten" um Daten hinzuzufügen.
              </p>
            ) : (
              <>
                <div className="grid gap-4">
                  {platforms.map((platform, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{platform.platformName}</p>
                          <p className="text-sm text-muted-foreground">
                            ⭐ {platform.rating}/5 • {platform.reviewCount} Bewertungen
                          </p>
                           {platform.isVerified && (
                            <p className="text-sm text-success">✓ Verifiziert</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold">
                    Gesamt-Score: 
                    <span className={
                      calculateOverallScore(platforms) >= 90 ? "text-warning ml-1" :
                      calculateOverallScore(platforms) >= 60 ? "text-success ml-1" :
                      "text-destructive ml-1"
                    }>
                      {calculateOverallScore(platforms)}%
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label>Plattform</Label>
                <Select
                  value={currentPlatform.platformName}
                  onValueChange={(value) =>
                    setCurrentPlatform({ ...currentPlatform, platformName: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Plattform auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORM_OPTIONS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bewertung (1-5)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={currentPlatform.rating || ""}
                    onChange={(e) =>
                      setCurrentPlatform({
                        ...currentPlatform,
                        rating: parseFloat(e.target.value) || 0
                      })
                    }
                    placeholder="4.5"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Anzahl Bewertungen</Label>
                  <Input
                    type="number"
                    min="0"
                    value={currentPlatform.reviewCount || ""}
                    onChange={(e) =>
                      setCurrentPlatform({
                        ...currentPlatform,
                        reviewCount: parseInt(e.target.value) || 0
                      })
                    }
                    placeholder="25"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Profil-URL (optional)</Label>
                <Input
                  type="url"
                  value={currentPlatform.profileUrl || ""}
                  onChange={(e) =>
                    setCurrentPlatform({ ...currentPlatform, profileUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label>Datum letzte Bewertung (optional)</Label>
                <Input
                  type="date"
                  value={currentPlatform.lastReviewDate || ""}
                  onChange={(e) =>
                    setCurrentPlatform({ ...currentPlatform, lastReviewDate: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentPlatform.isVerified}
                  onCheckedChange={(checked) =>
                    setCurrentPlatform({ ...currentPlatform, isVerified: checked })
                  }
                />
                <Label>Verifiziertes Profil</Label>
              </div>

              <Button onClick={handleAddOrUpdatePlatform} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                {editIndex !== null ? "Plattform aktualisieren" : "Plattform hinzufügen"}
              </Button>
            </div>

            {platforms.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Erfasste Plattformen:</h4>
                {platforms.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{platform.platformName}</p>
                      <p className="text-sm text-muted-foreground">
                        {platform.rating}/5 • {platform.reviewCount} Bewertungen
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPlatform(index)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePlatform(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
