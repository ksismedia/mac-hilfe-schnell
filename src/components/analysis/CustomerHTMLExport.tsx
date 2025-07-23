import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, CompanyServices, CompetitorServices, ManualCorporateIdentityData } from '@/hooks/useManualData';
import { FileText, Users, ChartBar, Download } from 'lucide-react';
import { generateCustomerHTML } from './export/htmlGenerator';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';

interface CustomerHTMLExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero';
  };
  realData: RealBusinessData;
  manualImprintData?: any;
  manualSocialData?: ManualSocialData | null;
  manualWorkplaceData?: any;
  manualCorporateIdentityData?: ManualCorporateIdentityData | null;
  manualCompetitors?: ManualCompetitor[];
  competitorServices?: CompetitorServices;
  companyServices?: CompanyServices;
  deletedCompetitors?: Set<string>;
  hourlyRateData?: { ownRate: number; regionAverage: number };
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
}

const CustomerHTMLExport: React.FC<CustomerHTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualWorkplaceData,
  manualCompetitors = [],
  competitorServices = {},
  companyServices,
  deletedCompetitors = new Set(),
    manualCorporateIdentityData,
    hourlyRateData,
  manualKeywordData,
  keywordScore
}) => {
  // Function to get missing imprint elements with detailed descriptions for customer report
  const getMissingImprintElements = () => {
    console.log('manualImprintData:', manualImprintData);
    
    // Wenn kein manualImprintData vorhanden ist oder es nicht found ist
    if (!manualImprintData || !manualImprintData.found) {
      return [
        'Vollständiger Firmenname',
        'Rechtsform des Unternehmens',
        'Geschäftsadresse',
        'Kontaktdaten (Telefon/E-Mail)',
        'Handelsregisternummer',
        'Steuernummer/USt-ID',
        'Aufsichtsbehörde',
        'Kammerzugehörigkeit',
        'Berufsbezeichnung',
        'Vertretungsberechtigte'
      ];
    }

    const standardElements = [
      'Vollständiger Firmenname',
      'Rechtsform des Unternehmens', 
      'Geschäftsadresse',
      'Kontaktdaten (Telefon/E-Mail)',
      'Handelsregisternummer',
      'Steuernummer/USt-ID',
      'Aufsichtsbehörde',
      'Kammerzugehörigkeit',
      'Berufsbezeichnung',
      'Vertretungsberechtigte'
    ];

    const foundElements = manualImprintData?.elements || [];
    console.log('foundElements:', foundElements);
    
    const missingElements = standardElements.filter(element => {
      const isFound = foundElements.some(found => {
        const elementKey = element.toLowerCase().split(' ')[0];
        const foundKey = found.toLowerCase();
        return foundKey.includes(elementKey) || 
               (foundKey.includes('firma') || foundKey.includes('firmenname') || foundKey.includes('name')) && elementKey === 'vollständiger' ||
               foundKey.includes('geschäftsführer') && elementKey === 'vertretungsberechtigte' ||
               foundKey.includes('inhaber') && elementKey === 'vertretungsberechtigte' ||
               (foundKey.includes('telefon') || foundKey.includes('email') || foundKey.includes('e-mail')) && elementKey === 'kontaktdaten' ||
               foundKey.includes('handels') && elementKey === 'handelsregisternummer' ||
               (foundKey.includes('ust') || foundKey.includes('steuer')) && elementKey === 'steuernummer' ||
               foundKey.includes('adresse') && elementKey === 'geschäftsadresse' ||
               foundKey.includes('rechtsform') && elementKey === 'rechtsform' ||
               foundKey.includes('aufsicht') && elementKey === 'aufsichtsbehörde' ||
               foundKey.includes('kammer') && elementKey === 'kammerzugehörigkeit' ||
               foundKey.includes('beruf') && elementKey === 'berufsbezeichnung';
      });
      return !isFound;
    });
    
    console.log('missingElements:', missingElements);
    return missingElements;
  };

  const generateCustomerReport = () => {
    const missingImprintElements = getMissingImprintElements();
    
    // Social Media Score für Customer Report berechnen
    const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
    console.log('Customer Report - Social Media Score:', socialMediaScore);
    console.log('Customer Report - Manual Social Data being passed:', manualSocialData);
    
    console.log('Passing missingImprintElements to HTML generator:', missingImprintElements);
    
    // DEBUG: Log all competitor data
    console.log('DEBUG CustomerHTMLExport - manualCompetitors:', manualCompetitors);
    console.log('DEBUG CustomerHTMLExport - competitorServices:', competitorServices);
    console.log('DEBUG CustomerHTMLExport - companyServices:', companyServices);
    console.log('DEBUG CustomerHTMLExport - deletedCompetitors:', deletedCompetitors);
    
    const htmlContent = generateCustomerHTML({
      businessData,
      realData,
      manualCompetitors,
      competitorServices: competitorServices || {},
      companyServices,
      deletedCompetitors,
      hourlyRateData,
      missingImprintElements,
      manualSocialData,
      manualWorkplaceData,
      manualCorporateIdentityData,
      manualKeywordData,
      keywordScore,
      manualImprintData,
      dataPrivacyScore: 75
    });

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const downloadCustomerReport = () => {
    const missingImprintElements = getMissingImprintElements();
    
    // Social Media Score für Customer Report berechnen
    const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
    console.log('Customer Report Download - Social Media Score:', socialMediaScore);
    console.log('Customer Report Download - Manual Social Data being passed:', manualSocialData);
    
    console.log('Passing missingImprintElements to HTML generator for download:', missingImprintElements);
    
    const htmlContent = generateCustomerHTML({
      businessData,
      realData,
      manualCompetitors,
      competitorServices: competitorServices || {},
      companyServices,
      deletedCompetitors,
      hourlyRateData,
      missingImprintElements,
      manualSocialData,
      manualWorkplaceData,
      manualCorporateIdentityData,
      manualKeywordData,
      keywordScore,
      manualImprintData,
      dataPrivacyScore: 75
    });

    try {
      // Create and download the HTML file
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      // Ensure the link is properly configured
      link.href = url;
      link.download = `Social-Listening-Report-${businessData.url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.html`;
      link.style.display = 'none';
      
      // Add to DOM, click, and clean up
      document.body.appendChild(link);
      link.click();
      
      // Clean up with a small delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('Download initiated successfully');
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      }
    }
  };

  const missingElements = getMissingImprintElements();
  const socialMediaScore = calculateSimpleSocialScore(manualSocialData);
  const hasSocialData = Boolean(manualSocialData && (
    manualSocialData.facebookUrl || manualSocialData.instagramUrl || 
    manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl
  ));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Social Listening und Monitoring Report
          </CardTitle>
          <CardDescription>
            Umfassende, professionelle Analyse für die Kundenpräsentation - mit korrigierter Social Media Bewertung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-700">✨ Kundenoptimiert:</h4>
              <ul className="text-sm space-y-1 text-blue-600">
                <li>• Executive Summary mit Gesamt-Score</li>
                <li>• Anonymisierte Konkurrenzanalyse (alle Konkurrenten)</li>
                <li>• Realistische Social Media Bewertung</li>
                <li>• Nutzerfreundlichkeit & Verfügbarkeit</li>
                <li>• Kununu/Glassdoor Arbeitsplatz-Bewertungen</li>
                <li>• Korrekte Rechtssicherheit-Analyse</li>
                <li>• Professionelles Design ohne Firmennamen</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-green-700">📊 Social Media Status:</h4>
              <ul className="text-sm space-y-1 text-green-600">
                <li>• Score: <strong>{calculateSimpleSocialScore(manualSocialData)}/100</strong></li>
                <li>• Status: {Boolean(manualSocialData && (manualSocialData.facebookUrl || manualSocialData.instagramUrl || manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl)) ? '✅ Aktiv' : '❌ Inaktiv'}</li>
                <li>• Plattformen: {Boolean(manualSocialData && (manualSocialData.facebookUrl || manualSocialData.instagramUrl || manualSocialData.linkedinUrl || manualSocialData.twitterUrl || manualSocialData.youtubeUrl)) ? 'Konfiguriert' : 'Nicht erfasst'}</li>
                <li>• Bewertung: Realistisch angepasst</li>
              </ul>
            </div>
          </div>

          {companyServices && companyServices.services.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">✅ Unternehmensleistungen erfasst:</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>• <strong>{companyServices.services.length} Leistungen</strong> für die Konkurrenzanalyse berücksichtigt</p>
                <p>• <strong>Präzise Bewertung:</strong> Vergleich basiert auf Ihren tatsächlichen Services</p>
                <p>• <strong>Gap-Analyse:</strong> Identifikation fehlender Leistungen im Marktvergleich</p>
              </div>
            </div>
          )}

          {getMissingImprintElements().length > 0 && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">⚠️ Impressum-Warnung erkannt:</h4>
              <div className="text-sm text-red-700 space-y-1">
                <p>• <strong>{getMissingImprintElements().length} fehlende Pflichtangaben</strong> im Impressum identifiziert</p>
                <p>• <strong>Rechtliche Risiken:</strong> Abmahnungen und Bußgelder möglich</p>
                <p>• <strong>Kundenreport:</strong> Enthält detaillierte Handlungsempfehlungen</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={generateCustomerReport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              Social Listening Report im Browser öffnen
            </Button>
            <Button 
              onClick={downloadCustomerReport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              Als HTML-Datei herunterladen
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                generateCustomerReport();
                setTimeout(() => {
                  window.print();
                }, 1000);
              }}
              className="flex items-center gap-2"
            >
              <ChartBar className="h-4 w-4" />
              Report erstellen & drucken
            </Button>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">🎯 Korrigierte Bewertung:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• <strong>Social Media:</strong> Realistische Bewertung statt automatisch 100%</p>
              <p>• <strong>Einzelplattform:</strong> Max. 70 Punkte pro Kanal</p>
              <p>• <strong>Follower-Bewertung:</strong> Gestaffelt nach Anzahl</p>
              <p>• <strong>Aktivität:</strong> Post-Häufigkeit wird berücksichtigt</p>
              <p>• <strong>Multi-Platform:</strong> Kleiner Bonus für mehrere Kanäle</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerHTMLExport;
