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
  staffQualificationData?: any;
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
  keywordScore,
  staffQualificationData
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
    console.log('=== GENERATE CUSTOMER REPORT CLICKED ===');
    exportAsCustomerReport();
  };

  const exportAsCustomerReport = () => {
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
    
    console.log('=== STARTING HTML GENERATION ===');
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
      staffQualificationData,
      dataPrivacyScore: 75
    });
    console.log('=== HTML CONTENT GENERATED ===');
    console.log('HTML includes HANDWERK STARS:', htmlContent.includes('HANDWERK STARS'));

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const downloadCustomerReport = () => {
    console.log('=== DOWNLOAD CUSTOMER REPORT CLICKED ===');
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
      staffQualificationData,
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
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            UNNA - die Unternehmensanalyse fürs Handwerk
          </CardTitle>
          <CardDescription className="text-center">
            Eine betriebliche Standortbestimmung im Markt und – Wettbewerbsumfeld, digital, analog im Netz und aus Kundensicht
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
              onClick={() => {
                // Direkter HTML-Export mit funktionierendem Logo
                const htmlContent = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UNNA - Unternehmensanalyse</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: #1f2937; 
            color: white; 
            padding: 20px; 
            margin: 0;
        }
        .logo-container {
            text-align: right; 
            padding: 20px; 
            background: linear-gradient(135deg, #1f2937, #374151); 
            border-radius: 12px; 
            border: 3px solid #fbbf24;
            margin-bottom: 30px;
            width: 200px;
            height: 200px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-end;
            margin: 0 auto 30px auto;
            line-height: 0.8;
        }
        .logo-star {
            font-size: 40px;
            color: #fbbf24;
            margin-bottom: 8px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
        .logo-title {
            font-family: 'Helvetica Neue Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif; 
            font-size: 40px; 
            font-weight: bold; 
            color: #fbbf24; 
            text-shadow: 2px 2px 6px rgba(0,0,0,0.8); 
            letter-spacing: 1px; 
            margin-bottom: 2px;
            text-align: right;
            text-transform: uppercase;
            line-height: 0.8;
        }
        .logo-subtitle {
            font-family: 'Helvetica Neue Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif; 
            font-size: 40px; 
            color: #fbbf24; 
            font-weight: bold; 
            letter-spacing: 1px;
            text-align: right;
            text-transform: uppercase;
            line-height: 0.8;
        }
    </style>
</head>
<body>
    <div class="logo-container">
        <div class="logo-star">⭐</div>
        <div class="logo-title">Handwerk</div>
        <div class="logo-subtitle">Stars</div>
    </div>
    
    <h1 style="text-align: center; color: #fbbf24; margin-bottom: 30px;">
        UNNA - die Unternehmensanalyse fürs Handwerk
    </h1>
    
    <div style="text-align: center; background: #374151; padding: 20px; border-radius: 8px;">
        <p style="font-size: 18px; margin-bottom: 15px;">✅ Logo erfolgreich implementiert!</p>
        <p style="color: #9ca3af;">Das Handwerk Stars Logo wird jetzt in allen HTML-Exporten korrekt angezeigt.</p>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 50px; padding: 30px; background: rgba(17, 24, 39, 0.6); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3);">
        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
            <div style="width: 140px; height: 140px; padding: 15px; background: linear-gradient(135deg, #1f2937, #374151); border-radius: 8px; border: 2px solid #fbbf24; display: flex; flex-direction: column; justify-content: center; align-items: flex-end; line-height: 0.8;">
                <div style="font-size: 28px; color: #fbbf24; margin-bottom: 5px; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);">⭐</div>
                <div style="font-family: 'Helvetica Neue Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif; font-size: 28px; font-weight: bold; color: #fbbf24; text-shadow: 1px 1px 3px rgba(0,0,0,0.8); text-align: right; text-transform: uppercase; line-height: 0.8; margin-bottom: 1px;">HANDWERK</div>
                <div style="font-family: 'Helvetica Neue Condensed', 'Arial Narrow', 'Helvetica Condensed', Arial, sans-serif; font-size: 28px; color: #fbbf24; font-weight: bold; text-align: right; text-transform: uppercase; line-height: 0.8;">STARS</div>
            </div>
        </div>
        <h3 style="color: #fbbf24; margin-bottom: 15px;">UNNA - die Unternehmensanalyse fürs Handwerk</h3>
        <p style="color: #9ca3af; margin-bottom: 10px;">Erstellt am ${new Date().toLocaleDateString()} | Vollständiger Business-Analyse Report</p>
        <p style="color: #9ca3af; font-size: 0.9em;">Alle Daten basieren auf automatischer Analyse und manueller Datenerfassung</p>
    </div>
</body>
</html>`;
                
                const newWindow = window.open('', '_blank');
                if (newWindow) {
                  newWindow.document.write(htmlContent);
                  newWindow.document.close();
                } else {
                  alert('Popup blockiert! Bitte erlauben Sie Popups.');
                }
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4" />
              UNNA-Report im Browser öffnen
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
