import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Award, Users, MessageSquare, Camera, ThumbsUp } from 'lucide-react';

interface SocialProofProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
}

const SocialProof: React.FC<SocialProofProps> = ({ businessData }) => {
  // Simulierte Social Proof Daten
  const socialProofData = {
    overallScore: 76,
    testimonials: {
      count: 18,
      averageLength: 125,
      withPhotos: 12,
      video: 2,
      quality: "gut"
    },
    certifications: [
      { name: "Handwerkskammer-Mitglied", verified: true, visible: true },
      { name: "TÜV-Zertifiziert", verified: true, visible: false },
      { name: "Fachbetrieb", verified: true, visible: true },
      { name: "Umweltschutz-Zertifikat", verified: false, visible: false }
    ],
    awards: [
      { name: "Bester Handwerker 2023", source: "Lokale Zeitung", year: 2023 },
      { name: "Kundenservice-Award", source: "Branchenverband", year: 2022 }
    ],
    mediaPresence: {
      presseMentions: 3,
      interviews: 1,
      caseStudies: 4,
      beforeAfter: 8
    },
    trustSignals: {
      guarantees: true,
      insurance: true,
      experience: "15+ Jahre",
      teamSize: 8,
      projectsCompleted: 450
    },
    onlineReputation: {
      googleRating: 4.6,
      googleReviews: 127,
      facebookRating: 4.4,
      facebookReviews: 23,
      otherPlatforms: 2
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Social Proof Analyse
            <Badge variant={getScoreBadge(socialProofData.overallScore)}>
              {socialProofData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Vertrauensbildende Elemente und soziale Nachweise
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Kundenbewertungen Übersicht */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                Online-Reputation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold">{socialProofData.onlineReputation.googleRating}</span>
                    <div className="flex">
                      {renderStars(Math.round(socialProofData.onlineReputation.googleRating))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Google ({socialProofData.onlineReputation.googleReviews} Bewertungen)
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold">{socialProofData.onlineReputation.facebookRating}</span>
                    <div className="flex">
                      {renderStars(Math.round(socialProofData.onlineReputation.facebookRating))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Facebook ({socialProofData.onlineReputation.facebookReviews} Bewertungen)
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {socialProofData.onlineReputation.otherPlatforms}
                  </div>
                  <p className="text-sm text-gray-600">Weitere Plattformen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kundenstimmen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kundenstimmen & Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Anzahl Testimonials:</span>
                    <span className="font-medium">{socialProofData.testimonials.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Mit Fotos:</span>
                    <span className="font-medium">{socialProofData.testimonials.withPhotos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Video-Testimonials:</span>
                    <span className="font-medium">{socialProofData.testimonials.video}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Durchschnittslänge:</span>
                    <span className="font-medium">{socialProofData.testimonials.averageLength} Wörter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Qualität:</span>
                    <Badge variant={socialProofData.testimonials.quality === "gut" ? "default" : "secondary"}>
                      {socialProofData.testimonials.quality}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zertifizierungen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Zertifizierungen & Mitgliedschaften
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {socialProofData.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">{cert.name}</span>
                    <div className="flex gap-2">
                      <Badge variant={cert.verified ? "default" : "destructive"}>
                        {cert.verified ? "Verifiziert" : "Nicht verifiziert"}
                      </Badge>
                      <Badge variant={cert.visible ? "default" : "secondary"}>
                        {cert.visible ? "Sichtbar" : "Versteckt"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Auszeichnungen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                Auszeichnungen & Anerkennungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {socialProofData.awards.map((award, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{award.name}</h4>
                        <p className="text-sm text-gray-600">{award.source}</p>
                      </div>
                      <Badge variant="outline">{award.year}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Medienpräsenz */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Medienpräsenz & Case Studies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {socialProofData.mediaPresence.presseMentions}
                  </div>
                  <p className="text-sm text-gray-600">Presse-Erwähnungen</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {socialProofData.mediaPresence.interviews}
                  </div>
                  <p className="text-sm text-gray-600">Interviews</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {socialProofData.mediaPresence.caseStudies}
                  </div>
                  <p className="text-sm text-gray-600">Case Studies</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {socialProofData.mediaPresence.beforeAfter}
                  </div>
                  <p className="text-sm text-gray-600">Vorher/Nachher</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vertrauenssignale */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Vertrauenssignale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Garantie:</span>
                    <Badge variant={socialProofData.trustSignals.guarantees ? "default" : "destructive"}>
                      {socialProofData.trustSignals.guarantees ? "Vorhanden" : "Nicht vorhanden"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Versicherung:</span>
                    <Badge variant={socialProofData.trustSignals.insurance ? "default" : "destructive"}>
                      {socialProofData.trustSignals.insurance ? "Versichert" : "Nicht versichert"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Erfahrung:</span>
                    <span className="font-medium">{socialProofData.trustSignals.experience}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Team-Größe:</span>
                    <span className="font-medium">{socialProofData.trustSignals.teamSize} Mitarbeiter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Abgeschlossene Projekte:</span>
                    <span className="font-medium">{socialProofData.trustSignals.projectsCompleted}+</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProof;
