import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualCompetitor, ManualSocialData, CompanyServices, CompetitorServices, ManualCorporateIdentityData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData, ManualLocalSEOData, ManualIndustryReviewData, ManualOnlinePresenceData, ManualConversionData, ManualMobileData, ManualReputationData, useManualData } from '@/hooks/useManualData';
import { FileText, Users, ChartBar, Download } from 'lucide-react';
import { generateCustomerHTML } from './export/htmlGenerator';
import { calculateSimpleSocialScore } from './export/simpleSocialScore';
import { calculateDataPrivacyScore } from './export/scoreCalculations';
import { useAnalysisContext } from '@/contexts/AnalysisContext';
import { AIActComplianceWarning } from './AIActComplianceWarning';
import { useToast } from '@/hooks/use-toast';

interface CustomerHTMLExportProps {
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei';
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
  removedMissingServices?: string[];
  hourlyRateData?: { meisterRate: number; facharbeiterRate: number; azubiRate: number; helferRate: number };
  staffQualificationData?: any;
  quoteResponseData?: any;
  manualContentData?: ManualContentData | null;
  manualAccessibilityData?: ManualAccessibilityData | null;
  manualBacklinkData?: ManualBacklinkData | null;
  manualDataPrivacyData?: ManualDataPrivacyData | null;
  manualLocalSEOData?: ManualLocalSEOData | null;
  manualIndustryReviewData?: ManualIndustryReviewData | null;
  manualOnlinePresenceData?: ManualOnlinePresenceData | null;
  manualConversionData?: ManualConversionData | null;
  manualMobileData?: ManualMobileData | null;
  manualReputationData?: ManualReputationData | null;
  manualKeywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
  keywordScore?: number;
  privacyData?: any;
  accessibilityData?: any;
  securityData?: any;
  calculatedOwnCompanyScore?: number; // DIREKT AUS COMPETITOR ANALYSIS
  extensionData?: any; // Chrome Extension data
}

const CustomerHTMLExport: React.FC<CustomerHTMLExportProps> = ({ 
  businessData, 
  realData, 
  manualImprintData, 
  manualSocialData,
  manualWorkplaceData,
  manualCorporateIdentityData,
  manualCompetitors = [],
  competitorServices = {},
  companyServices,
  deletedCompetitors = new Set(),
  removedMissingServices = [],
  hourlyRateData,
  staffQualificationData,
  quoteResponseData,
  manualContentData,
  manualAccessibilityData,
  manualBacklinkData,
  manualDataPrivacyData,
  manualLocalSEOData,
  manualIndustryReviewData,
  manualOnlinePresenceData,
  manualConversionData,
  manualMobileData,
  manualReputationData,
  manualKeywordData,
  keywordScore,
  privacyData,
  accessibilityData,
  securityData,
  calculatedOwnCompanyScore,
  extensionData
}) => {
  const { toast } = useToast();
  
  // AI Review Status from AnalysisContext (supports both saved and unsaved analyses)
  const { 
    reviewStatus,
    isFullyReviewed,
    getUnreviewedCategories
  } = useAnalysisContext();
  
  // Import useManualData to get current state
  const {
    manualAccessibilityData: currentManualAccessibilityData, 
    manualSocialData: currentManualSocialData,
    manualCorporateIdentityData: currentManualCorporateIdentityData,
    manualWorkplaceData: currentManualWorkplaceData,
    manualLocalSEOData: currentManualLocalSEOData,
    manualIndustryReviewData: currentManualIndustryReviewData,
    manualOnlinePresenceData: currentManualOnlinePresenceData,
    manualConversionData: currentManualConversionData
  } = useManualData();
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

  const generateCustomerReport = async () => {
    console.log('🔴 GENERATE CUSTOMER REPORT AUFGERUFEN');
    await exportAsCustomerReport();
  };

  const exportAsCustomerReport = async () => {
    console.log('🔵 CustomerHTMLExport exportAsCustomerReport called - THIS OPENS IN BROWSER');
    console.log('🔍 Initial securityData:', securityData);
    
    // KI-VO Compliance Check - BLOCKIERE EXPORT WENN NICHT VOLLSTÄNDIG GEPRÜFT
    if (!isFullyReviewed()) {
      const unreviewed = getUnreviewedCategories();
      console.error('⛔ KI-VO BLOCKIERUNG: Export nicht möglich - ungeprüfte AI-Inhalte:', unreviewed);
      
      toast({
        title: '⛔ Export blockiert - KI-Verordnung',
        description: `Export nicht möglich! ${unreviewed.length} Kategorien müssen noch manuell geprüft werden: ${unreviewed.join(', ')}`,
        variant: 'destructive',
        duration: 8000
      });
      
      return; // BLOCKIERE DEN EXPORT
    }
    
    console.log('✅ KI-VO Check passed - all AI content reviewed');
    
    // Use existing security data from state (already loaded in SimpleAnalysisDashboard)
    const exportSecurityData = securityData;
    console.log('🔒 Using security data from state:', exportSecurityData);
    
    console.log('🔥 FINAL CHECK - exportSecurityData before HTML generation:', exportSecurityData);
    console.log('🔥 exportSecurityData is null?', exportSecurityData === null);
    console.log('🔥 exportSecurityData is undefined?', exportSecurityData === undefined);
    
    // DIREKTER ZUGRIFF AUF DEN GLOBALEN SCORE
    const currentOwnCompanyScore = (window as any).globalOwnCompanyScore || calculatedOwnCompanyScore || 87;
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
    console.log('🔴 manualAccessibilityData passed to CustomerHTMLExport:', manualAccessibilityData);
    console.log('🔴 currentManualAccessibilityData from hook:', currentManualAccessibilityData);
    
    // Check if AI content is fully reviewed
    const hasUnreviewedContent = !isFullyReviewed();
    
    console.log('=== STARTING HTML GENERATION ===');
    const htmlContent = generateCustomerHTML({
      businessData,
      realData,
      manualCompetitors,
      competitorServices: competitorServices || {},
      companyServices,
      deletedCompetitors,
      removedMissingServices,
      hourlyRateData: hourlyRateData ? {
        meisterRate: hourlyRateData.meisterRate || 0,
        facharbeiterRate: hourlyRateData.facharbeiterRate || 0,
        azubiRate: hourlyRateData.azubiRate || 0,
        helferRate: hourlyRateData.helferRate || 0,
        serviceRate: (hourlyRateData as any).serviceRate || 0,
        installationRate: (hourlyRateData as any).installationRate || 0,
        regionalMeisterRate: (hourlyRateData as any).regionalMeisterRate || 0,
        regionalFacharbeiterRate: (hourlyRateData as any).regionalFacharbeiterRate || 0,
        regionalAzubiRate: (hourlyRateData as any).regionalAzubiRate || 0,
        regionalHelferRate: (hourlyRateData as any).regionalHelferRate || 0,
        regionalServiceRate: (hourlyRateData as any).regionalServiceRate || 0,
        regionalInstallationRate: (hourlyRateData as any).regionalInstallationRate || 0
      } : undefined,
      missingImprintElements,
      manualSocialData: currentManualSocialData || manualSocialData,
      manualWorkplaceData: currentManualWorkplaceData || manualWorkplaceData,
      manualCorporateIdentityData: currentManualCorporateIdentityData || manualCorporateIdentityData,
      manualKeywordData,
      keywordScore,
      manualImprintData,
      staffQualificationData,
      quoteResponseData,
      manualContentData,
      manualAccessibilityData: currentManualAccessibilityData || manualAccessibilityData,
      manualBacklinkData,
      manualDataPrivacyData,
      manualLocalSEOData: currentManualLocalSEOData || manualLocalSEOData,
      manualIndustryReviewData: currentManualIndustryReviewData || manualIndustryReviewData,
      manualOnlinePresenceData: currentManualOnlinePresenceData || manualOnlinePresenceData,
      manualConversionData: currentManualConversionData || manualConversionData,
      manualMobileData: manualMobileData,
      manualReputationData: manualReputationData,
      privacyData,
      accessibilityData,
      securityData: exportSecurityData,
      calculatedOwnCompanyScore: currentOwnCompanyScore,
      extensionData,
      hasUnreviewedAIContent: hasUnreviewedContent
    });
    console.log('=== HTML CONTENT GENERATED ===');
    console.log('🔥 Was exportSecurityData passed to generateCustomerHTML?', !!exportSecurityData);
    console.log('🔥 HTML includes "Website-Sicherheit"?', htmlContent.includes('Website-Sicherheit'));
    console.log('HTML includes HANDWERK STARS:', htmlContent.includes('HANDWERK STARS'));
    console.log('HTML includes polygon:', htmlContent.includes('polygon'));
    console.log('HTML includes f4c430:', htmlContent.includes('f4c430'));
    console.log('HTML Content Length:', htmlContent.length);
    console.log('First 500 chars:', htmlContent.substring(0, 500));

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  const downloadCustomerReport = async () => {
    console.log('🔴 DOWNLOAD CUSTOMER REPORT CLICKED');
    console.log('🔍 Initial securityData:', securityData);
    
    // KI-VO Compliance Check - BLOCKIERE DOWNLOAD WENN NICHT VOLLSTÄNDIG GEPRÜFT
    if (!isFullyReviewed()) {
      const unreviewed = getUnreviewedCategories();
      console.error('⛔ KI-VO BLOCKIERUNG: Download nicht möglich - ungeprüfte AI-Inhalte:', unreviewed);
      
      toast({
        title: '⛔ Download blockiert - KI-Verordnung',
        description: `Download nicht möglich! ${unreviewed.length} Kategorien müssen noch manuell geprüft werden: ${unreviewed.join(', ')}`,
        variant: 'destructive',
        duration: 8000
      });
      
      return; // BLOCKIERE DEN DOWNLOAD
    }
    
    console.log('✅ KI-VO Check passed - all AI content reviewed');
    
    // CRITICAL: ALWAYS load security data before download
    // Use existing security data from state (already loaded in SimpleAnalysisDashboard)
    const downloadSecurityData = securityData;
    console.log('🔒 Using security data from state for download:', downloadSecurityData);
    
    // WICHTIG: Hole den aktuell berechneten Score aus CompetitorAnalysis
    const currentOwnCompanyScore = (window as any).globalOwnCompanyScore || calculatedOwnCompanyScore;
    console.log('=== DOWNLOAD CUSTOMER REPORT CLICKED ===');
    const missingImprintElements = getMissingImprintElements();
    
    // Check if AI content is fully reviewed
    const hasUnreviewedContent = !isFullyReviewed();
    
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
      removedMissingServices,
      hourlyRateData: hourlyRateData ? {
        meisterRate: hourlyRateData.meisterRate || 0,
        facharbeiterRate: hourlyRateData.facharbeiterRate || 0,
        azubiRate: hourlyRateData.azubiRate || 0,
        helferRate: hourlyRateData.helferRate || 0,
        serviceRate: (hourlyRateData as any).serviceRate || 0,
        installationRate: (hourlyRateData as any).installationRate || 0,
        regionalMeisterRate: (hourlyRateData as any).regionalMeisterRate || 0,
        regionalFacharbeiterRate: (hourlyRateData as any).regionalFacharbeiterRate || 0,
        regionalAzubiRate: (hourlyRateData as any).regionalAzubiRate || 0,
        regionalHelferRate: (hourlyRateData as any).regionalHelferRate || 0,
        regionalServiceRate: (hourlyRateData as any).regionalServiceRate || 0,
        regionalInstallationRate: (hourlyRateData as any).regionalInstallationRate || 0
      } : undefined,
      missingImprintElements,
      manualSocialData,
      manualWorkplaceData: currentManualWorkplaceData || manualWorkplaceData,
      manualCorporateIdentityData,
      manualKeywordData,
      keywordScore,
      manualImprintData,
      staffQualificationData,
      quoteResponseData,
      manualContentData,
      manualAccessibilityData,
      manualBacklinkData,
      manualDataPrivacyData,
      manualLocalSEOData: currentManualLocalSEOData || manualLocalSEOData,
      manualIndustryReviewData: currentManualIndustryReviewData || manualIndustryReviewData,
      manualOnlinePresenceData: currentManualOnlinePresenceData || manualOnlinePresenceData,
      manualConversionData: currentManualConversionData || manualConversionData,
      manualMobileData: manualMobileData,
      manualReputationData: manualReputationData,
      privacyData,
      accessibilityData,
      securityData: downloadSecurityData,
      calculatedOwnCompanyScore: currentOwnCompanyScore,
      extensionData,
      hasUnreviewedAIContent: hasUnreviewedContent
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

          {/* KI-Verordnung (EU AI Act) Compliance Warnung */}
          <AIActComplianceWarning 
            unreviewedCategories={getUnreviewedCategories()}
            isFullyReviewed={isFullyReviewed()}
          />

          <div className="flex gap-3">
            <Button 
              onClick={exportAsCustomerReport}
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
              onClick={async () => {
                await generateCustomerReport();
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
