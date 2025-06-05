import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Users, Briefcase, TrendingUp, Award } from 'lucide-react';

interface WorkplaceReviewsProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
}

const WorkplaceReviews: React.FC<WorkplaceReviewsProps> = ({ businessData }) => {
  // Simulierte Arbeitsplatz-Bewertungsdaten
  const workplaceData = {
    overallScore: 71,
    platforms: [
      {
        name: "Kununu",
        rating: 4.1,
        reviews: 23,
        verified: true,
        categories: {
          workLifeBalance: 4.2,
          salary: 3.8,
          atmosphere: 4.3,
          management: 3.9,
          career: 3.7
        }
      },
      {
        name: "Xing",
        rating: 3.9,
        reviews: 8,
        verified: false,
        categories: {
          workLifeBalance: 4.0,
          salary: 3.6,
          atmosphere: 4.1,
          management: 3.8,
          career: 3.5
        }
      },
      {
        name: "StepStone",
        rating: 4.0,
        reviews: 12,
        verified: true,
        categories: {
          workLifeBalance: 3.9,
          salary: 3.7,
          atmosphere: 4.2,
          management: 3.8,
          career: 3.6
        }
      }
    ],
    employerBranding: {
      score: 68,
      presence: "vorhanden",
      jobPostings: 3,
      companyDescription: true,
      benefits: [
        "Flexible Arbeitszeiten",
        "Firmenwagen",
        "Weiterbildungsmöglichkeiten",
        "Betriebliche Altersvorsorge"
      ],
      weaknesses: [
        "Begrenzte Karrieremöglichkeiten",
        "Gehalt unter Branchendurchschnitt"
      ]
    },
    recruitment: {
      activeRecruiting: true,
      responseTime: "3-5 Tage",
      jobPortals: 4,
      socialMediaRecruiting: false
    },
    employeeRetention: {
      averageTenure: "4.2 Jahre",
      turnoverRate: "15%",
      satisfaction: 78
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.0) return "text-green-600";
    if (score >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 70) return "default";
    if (score >= 50) return "secondary";
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

  const categoryNames = {
    workLifeBalance: "Work-Life-Balance",
    salary: "Gehalt & Benefits",
    atmosphere: "Arbeitsatmosphäre",
    management: "Führung",
    career: "Karriere & Entwicklung"
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Arbeitsplatz-Bewertungen
            <Badge variant={getScoreBadge(workplaceData.overallScore)}>
              {workplaceData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Analyse der Arbeitgeberbewertungen auf Kununu und anderen Plattformen
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Plattform-Übersicht */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {workplaceData.platforms.map((platform, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {platform.name}
                    {platform.verified && (
                      <Badge variant="default">Verifiziert</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-2xl font-bold">{platform.rating}</span>
                      <div className="flex">
                        {renderStars(Math.round(platform.rating))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {platform.reviews} Bewertungen
                    </p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {Object.entries(platform.categories).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">
                          {categoryNames[key as keyof typeof categoryNames]}:
                        </span>
                        <span className={`font-medium ${getScoreColor(value)}`}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Employer Branding */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5" />
                Employer Branding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Online-Präsenz:</span>
                    <Badge variant={workplaceData.employerBranding.presence === "vorhanden" ? "default" : "destructive"}>
                      {workplaceData.employerBranding.presence}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Aktuelle Stellenausschreibungen:</span>
                    <span className="font-medium">{workplaceData.employerBranding.jobPostings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Unternehmensbeschreibung:</span>
                    <Badge variant={workplaceData.employerBranding.companyDescription ? "default" : "destructive"}>
                      {workplaceData.employerBranding.companyDescription ? "Vorhanden" : "Fehlt"}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Employer Brand Score</span>
                    <span className={`font-bold ${getScoreColor(workplaceData.employerBranding.score / 20)}`}>
                      {workplaceData.employerBranding.score}/100
                    </span>
                  </div>
                  <Progress value={workplaceData.employerBranding.score} className="h-2" />
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Angebotene Benefits:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {workplaceData.employerBranding.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✓</span>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium mb-3 text-red-600">Häufige Kritikpunkte:</h4>
                <div className="space-y-1">
                  {workplaceData.employerBranding.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-red-600">×</span>
                      <span>{weakness}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recruiting */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recruiting & Personalgewinnung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Aktives Recruiting:</span>
                    <Badge variant={workplaceData.recruitment.activeRecruiting ? "default" : "destructive"}>
                      {workplaceData.recruitment.activeRecruiting ? "Ja" : "Nein"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Antwortzeit:</span>
                    <span className="font-medium">{workplaceData.recruitment.responseTime}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Job-Portale:</span>
                    <span className="font-medium">{workplaceData.recruitment.jobPortals}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Social Media Recruiting:</span>
                    <Badge variant={workplaceData.recruitment.socialMediaRecruiting ? "default" : "destructive"}>
                      {workplaceData.recruitment.socialMediaRecruiting ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mitarbeiterbindung */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Mitarbeiterbindung & Zufriedenheit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {workplaceData.employeeRetention.averageTenure}
                  </div>
                  <p className="text-sm text-gray-600">Durchschnittliche Betriebszugehörigkeit</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {workplaceData.employeeRetention.turnoverRate}
                  </div>
                  <p className="text-sm text-gray-600">Fluktuationsrate</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {workplaceData.employeeRetention.satisfaction}%
                  </div>
                  <p className="text-sm text-gray-600">Mitarbeiterzufriedenheit</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkplaceReviews;
