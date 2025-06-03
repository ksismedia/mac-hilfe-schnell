
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Smartphone, Tablet, Monitor, Wifi, TouchpadIcon } from 'lucide-react';

interface MobileOptimizationProps {
  url: string;
}

const MobileOptimization: React.FC<MobileOptimizationProps> = ({ url }) => {
  // Simulierte Mobile-Optimierung-Daten
  const mobileData = {
    overallScore: 72,
    pageSpeed: {
      mobile: 68,
      desktop: 85,
      firstContentfulPaint: "2.1s",
      largestContentfulPaint: "3.8s",
      cumulativeLayoutShift: 0.15
    },
    responsiveDesign: {
      score: 78,
      viewports: {
        mobile: "gut",
        tablet: "sehr gut", 
        desktop: "sehr gut"
      },
      touchFriendly: true,
      textReadability: 85
    },
    usability: {
      score: 75,
      buttonSize: "ausreichend",
      navigationEase: "gut",
      contentAccess: "sehr gut",
      formUsability: 70
    },
    issues: [
      { type: "Kritisch", description: "Zu kleine Touch-Targets auf mobilen Geräten", impact: "Hoch" },
      { type: "Warnung", description: "Langsame Ladezeit auf mobilen Verbindungen", impact: "Mittel" },
      { type: "Info", description: "Bilder könnten für mobile Geräte optimiert werden", impact: "Niedrig" }
    ]
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

  const getIssueColor = (type: string) => {
    switch (type) {
      case "Kritisch": return "destructive";
      case "Warnung": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Mobile-Optimierung Check
            <Badge variant={getScoreBadge(mobileData.overallScore)}>
              {mobileData.overallScore}/100 Punkte
            </Badge>
          </CardTitle>
          <CardDescription>
            Analyse der mobilen Benutzerfreundlichkeit für {url}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Performance-Übersicht */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Performance-Vergleich
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Mobile Geschwindigkeit</span>
                    <span className={`font-bold ${getScoreColor(mobileData.pageSpeed.mobile)}`}>
                      {mobileData.pageSpeed.mobile}/100
                    </span>
                  </div>
                  <Progress value={mobileData.pageSpeed.mobile} className="h-2 mb-4" />
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Desktop Geschwindigkeit</span>
                    <span className={`font-bold ${getScoreColor(mobileData.pageSpeed.desktop)}`}>
                      {mobileData.pageSpeed.desktop}/100
                    </span>
                  </div>
                  <Progress value={mobileData.pageSpeed.desktop} className="h-2" />
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">First Contentful Paint:</span>
                    <span className="font-medium">{mobileData.pageSpeed.firstContentfulPaint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Largest Contentful Paint:</span>
                    <span className="font-medium">{mobileData.pageSpeed.largestContentfulPaint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cumulative Layout Shift:</span>
                    <span className="font-medium">{mobileData.pageSpeed.cumulativeLayoutShift}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsive Design */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Responsive Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 border rounded-lg">
                  <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Mobile</p>
                  <Badge variant={mobileData.responsiveDesign.viewports.mobile === "sehr gut" ? "default" : "secondary"}>
                    {mobileData.responsiveDesign.viewports.mobile}
                  </Badge>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Tablet className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Tablet</p>
                  <Badge variant={mobileData.responsiveDesign.viewports.tablet === "sehr gut" ? "default" : "secondary"}>
                    {mobileData.responsiveDesign.viewports.tablet}
                  </Badge>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Desktop</p>
                  <Badge variant={mobileData.responsiveDesign.viewports.desktop === "sehr gut" ? "default" : "secondary"}>
                    {mobileData.responsiveDesign.viewports.desktop}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Touch-freundlich:</span>
                  <span className={`font-medium ${mobileData.responsiveDesign.touchFriendly ? 'text-green-600' : 'text-red-600'}`}>
                    {mobileData.responsiveDesign.touchFriendly ? "Ja" : "Nein"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Text-Lesbarkeit:</span>
                  <span className="font-medium">{mobileData.responsiveDesign.textReadability}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usability */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TouchpadIcon className="h-5 w-5" />
                Mobile Usability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Button-Größe</span>
                  <Badge variant={mobileData.usability.buttonSize === "gut" ? "default" : "secondary"}>
                    {mobileData.usability.buttonSize}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Navigation</span>
                  <Badge variant={mobileData.usability.navigationEase === "gut" ? "default" : "secondary"}>
                    {mobileData.usability.navigationEase}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Content-Zugriff</span>
                  <Badge variant={mobileData.usability.contentAccess === "sehr gut" ? "default" : "secondary"}>
                    {mobileData.usability.contentAccess}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Formular-Usability</span>
                  <div className="flex items-center gap-2">
                    <Progress value={mobileData.usability.formUsability} className="w-20 h-2" />
                    <span className="text-sm">{mobileData.usability.formUsability}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Erkannte Probleme */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Erkannte Probleme</CardTitle>
              <CardDescription>
                Verbesserungsvorschläge für die mobile Optimierung
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mobileData.issues.map((issue, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getIssueColor(issue.type)}>
                        {issue.type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Impact: {issue.impact}
                      </span>
                    </div>
                    <p className="text-sm">{issue.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileOptimization;
