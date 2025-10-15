import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

interface PlatformReview {
  platformName: string;
  rating: number;
  reviewCount: number;
  profileUrl?: string;
  isVerified: boolean;
  lastReviewDate?: string;
}

interface IndustryReviewPlatformsProps {
  platforms: PlatformReview[];
  overallScore: number;
}

export const IndustryReviewPlatforms = ({ platforms, overallScore }: IndustryReviewPlatformsProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Branchenspezifische Bewertungsplattformen</CardTitle>
          <Badge className={getScoreBadge(overallScore)}>
            Score: {overallScore}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {platforms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Daten für branchenspezifische Plattformen erfasst</p>
            </div>
          ) : (
            platforms.map((platform, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{platform.platformName}</h4>
                        {platform.isVerified && (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        {renderStars(platform.rating)}
                        <span className={`font-bold ${getScoreColor(platform.rating * 20)}`}>
                          {platform.rating.toFixed(1)}/5
                        </span>
                      </div>
                    </div>
                    {platform.profileUrl && (
                      <a
                        href={platform.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Anzahl Bewertungen</p>
                      <p className="font-semibold">{platform.reviewCount}</p>
                    </div>
                    {platform.lastReviewDate && (
                      <div>
                        <p className="text-muted-foreground">Letzte Bewertung</p>
                        <p className="font-semibold">{platform.lastReviewDate}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <Badge variant={platform.isVerified ? "default" : "secondary"}>
                        {platform.isVerified ? "Verifiziert" : "Nicht verifiziert"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {platforms.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Zusammenfassung</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Durchschnittliche Bewertung</p>
                  <p className="font-semibold">
                    {(platforms.reduce((sum, p) => sum + p.rating, 0) / platforms.length).toFixed(2)}/5
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gesamt Bewertungen</p>
                  <p className="font-semibold">
                    {platforms.reduce((sum, p) => sum + p.reviewCount, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Plattformen</p>
                  <p className="font-semibold">{platforms.length}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verifizierte Profile</p>
                  <p className="font-semibold">
                    {platforms.filter(p => p.isVerified).length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
