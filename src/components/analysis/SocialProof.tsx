
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Award, Users, MessageSquare, Camera, ThumbsUp } from 'lucide-react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';

interface SocialProofProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung';
  };
  realData: RealBusinessData;
}

const SocialProof: React.FC<SocialProofProps> = ({ businessData, realData }) => {
  const socialProofData = realData.socialProof || {
    overallScore: 0,
    testimonials: 0,
    certifications: [],
    trustSignals: [],
    socialMediaMentions: 0,
    pressReferences: 0,
    awards: []
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return "secondary";        // gelb (90-100%)
    if (score >= 61) return "default";          // grün (61-89%)
    return "destructive";                       // rot (0-60%)
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
            Social Proof Analyse (Echte Daten)
            <div 
              className={`flex items-center justify-center w-14 h-14 rounded-full text-lg font-bold border-2 border-white shadow-md ${
                socialProofData.overallScore >= 90 ? 'bg-yellow-400 text-black' : 
                socialProofData.overallScore >= 61 ? 'bg-green-500 text-white' : 
                'bg-red-500 text-white'
              }`}
            >
              {socialProofData.overallScore}%
            </div>
          </CardTitle>
          <CardDescription>
            Live-Analyse der vertrauensbildenden Elemente auf {realData.company.url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Online-Reputation */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                Online-Reputation (Live-Daten)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl font-bold">{realData?.reviews?.google?.rating || 0}</span>
                    <div className="flex">
                      {renderStars(Math.round(realData?.reviews?.google?.rating || 0))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Google ({realData?.reviews?.google?.count || 0} Bewertungen)
                  </p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {socialProofData.testimonials}
                  </div>
                  <p className="text-sm text-gray-600">Testimonials gefunden</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {socialProofData.certifications.length}
                  </div>
                  <p className="text-sm text-gray-600">Zertifizierungen</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Zertifizierungen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Zertifizierungen & Mitgliedschaften (Live-Analyse)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {socialProofData.certifications.length > 0 ? (
                <div className="space-y-2">
                  {socialProofData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{cert.name}</span>
                      <div className="flex gap-2">
                        <Badge variant={cert.verified ? "default" : "destructive"}>
                          {cert.verified ? "Gefunden" : "Nicht gefunden"}
                        </Badge>
                        <Badge variant={cert.visible ? "default" : "secondary"}>
                          {cert.visible ? "Sichtbar" : "Versteckt"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">Keine Zertifizierungen auf der Website gefunden</p>
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      Empfehlung: Vorhandene Zertifizierungen deutlich auf der Website platzieren
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Auszeichnungen */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ThumbsUp className="h-5 w-5" />
                Auszeichnungen & Anerkennungen (Live-Analyse)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {socialProofData.awards.length > 0 ? (
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
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">Keine Auszeichnungen auf der Website gefunden</p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Empfehlung: Erhaltene Auszeichnungen prominent präsentieren
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Testimonials */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Kundenstimmen & Testimonials (Live-Analyse)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {socialProofData.testimonials}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Testimonial-Hinweise auf der Website gefunden
                </p>
                {socialProofData.testimonials === 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Empfehlung: Kundenstimmen sammeln und auf der Website präsentieren
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Echte Daten Hinweis */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">✓ Live Social Proof Analyse</h4>
            <p className="text-sm text-green-700">
              Diese Analyse basiert auf einer automatischen Durchsuchung der Website {realData.company.url} 
              nach vertrauensbildenden Elementen wie Zertifizierungen, Testimonials und Auszeichnungen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialProof;
