
import { SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { ManualImprintData, ManualSocialData, ManualWorkplaceData, ManualCompetitor, CompetitorServices, ManualCorporateIdentityData, ManualConversionData, ManualMobileData, ManualReputationData, ManualSEOData } from '@/hooks/useManualData';
import { calculateDataPrivacyScore, calculateImprintScore, calculateAccessibilityScore } from '@/components/analysis/export/scoreCalculations';

interface ExtensionWebsiteData {
  url: string;
  domain: string;
  title: string;
  seo: any;
  content: any;
  technical: any;
  performance: any;
  contact: any;
  extractedAt: string;
}

export const loadCompetitorServices = (
  competitorServices: CompetitorServices,
  updateCompetitorServices: (competitorName: string, services: string[], source: 'auto' | 'manual') => void
) => {
  Object.entries(competitorServices).forEach(([competitorName, serviceData]) => {
    updateCompetitorServices(competitorName, serviceData.services, serviceData.source);
  });
};

export const loadSavedAnalysisData = (
  savedAnalysis: SavedAnalysis,
  updateImprintData: (data: ManualImprintData | null) => void,
  updateSocialData: (data: ManualSocialData | null) => void,
  updateWorkplaceData: (data: ManualWorkplaceData | null) => void,
  updateCorporateIdentityData: (data: ManualCorporateIdentityData | null) => void,
  updateCompetitors: (competitors: ManualCompetitor[]) => void,
  updateCompetitorServices: (competitorName: string, services: string[], source: 'auto' | 'manual') => void,
  updateCompanyServices?: (services: string[]) => void,
  setManualKeywordData?: (data: Array<{ keyword: string; found: boolean; volume: number; position: number }> | null) => void,
  updateStaffQualificationData?: (data: any) => void,
  updateHourlyRateData?: (data: any) => void,
  updateQuoteResponseData?: (data: any) => void,
  updateRemovedMissingServices?: (services: string[]) => void,
  addDeletedCompetitor?: (competitorName: string) => void,
  updateManualContentData?: (data: any) => void,
  updateManualAccessibilityData?: (data: any) => void,
  updateManualBacklinkData?: (data: any) => void,
  updateManualDataPrivacyData?: (data: any) => void,
  updateManualLocalSEOData?: (data: any) => void,
  updateManualIndustryReviewData?: (data: any) => void,
  updateManualOnlinePresenceData?: (data: any) => void,
  updateManualConversionData?: (data: ManualConversionData) => void,
  updateManualMobileData?: (data: ManualMobileData) => void,
  updateManualReputationData?: (data: ManualReputationData) => void,
  updateManualSEOData?: (data: ManualSEOData | null) => void,
  setPrivacyData?: (data: any) => void,
  setAccessibilityData?: (data: any) => void,
  setSecurityData?: (data: any) => void,
  setSavedExtensionData?: (data: ExtensionWebsiteData | null) => void,
  updateShowNationalProviders?: (show: boolean) => void,
  updateShowRegionalTrends?: (show: boolean) => void,
  updateRegionalTrendsData?: (data: any) => void
) => {
  console.log('=== Loading Saved Analysis Data ===');
  console.log('Analysis:', savedAnalysis.name);
  console.log('Manual Data:', savedAnalysis.manualData);

  // Restore extension data if available
  if (savedAnalysis.manualData.extensionData && setSavedExtensionData) {
    console.log('🔄 Restoring extension data from saved analysis');
    console.log('Extension data:', savedAnalysis.manualData.extensionData);
    setSavedExtensionData(savedAnalysis.manualData.extensionData);
  } else {
    console.log('⚠️ No extension data found in saved analysis or no setter provided');
    console.log('Has extensionData:', !!savedAnalysis.manualData.extensionData);
    console.log('Has setter:', !!setSavedExtensionData);
  }
  
  // Load manual data and recalculate Imprint score with capping logic
  if (savedAnalysis.manualData?.imprint) {
    console.log('Loading imprint data');
    updateImprintData(savedAnalysis.manualData.imprint);
    
    // Recalculate Imprint score with capping logic for saved analyses
    if (savedAnalysis.realData?.imprint) {
      const recalculatedImprintScore = calculateImprintScore(
        { imprint: savedAnalysis.realData.imprint } as any,
        savedAnalysis.manualData.imprint
      );
      console.log(`📋 Impressum Score neu berechnet: ${recalculatedImprintScore.score}%${recalculatedImprintScore.cappedAt < 100 ? ` (gekappt wegen ${recalculatedImprintScore.missingCriticalCount} fehlender kritischer Elemente)` : ''}`);
    }
  }
  
  if (savedAnalysis.manualData?.social) {
    console.log('Loading social data');
    updateSocialData(savedAnalysis.manualData.social);
  }
  
  if (savedAnalysis.manualData?.workplace) {
    console.log('Loading workplace data');
    updateWorkplaceData(savedAnalysis.manualData.workplace);
  }
  
  if (savedAnalysis.manualData?.corporateIdentity) {
    console.log('Loading corporate design data');
    updateCorporateIdentityData(savedAnalysis.manualData.corporateIdentity);
  }
  
  if (savedAnalysis.manualData?.competitors && Array.isArray(savedAnalysis.manualData.competitors)) {
    console.log('Loading competitors:', savedAnalysis.manualData.competitors.length);
    updateCompetitors(savedAnalysis.manualData.competitors);
  }
  
  if (savedAnalysis.manualData?.competitorServices) {
    console.log('Loading competitor services');
    loadCompetitorServices(savedAnalysis.manualData.competitorServices, updateCompetitorServices);
  }

  // Load removed missing services
  if (savedAnalysis.manualData?.removedMissingServices && updateRemovedMissingServices && Array.isArray(savedAnalysis.manualData.removedMissingServices)) {
    console.log('Loading removed missing services:', savedAnalysis.manualData.removedMissingServices.length);
    updateRemovedMissingServices(savedAnalysis.manualData.removedMissingServices);
  }

  // Load deleted competitors
  if (savedAnalysis.manualData?.deletedCompetitors && addDeletedCompetitor && Array.isArray(savedAnalysis.manualData.deletedCompetitors)) {
    console.log('Loading deleted competitors:', savedAnalysis.manualData.deletedCompetitors.length);
    savedAnalysis.manualData.deletedCompetitors.forEach(competitorName => {
      addDeletedCompetitor(competitorName);
    });
  }
  
  // Load company services if available and function is provided
  if (savedAnalysis.manualData?.companyServices && updateCompanyServices) {
    console.log('Loading company services:', savedAnalysis.manualData.companyServices);
    const services = savedAnalysis.manualData.companyServices.services || [];
    updateCompanyServices(services);
  }
  
  // Load keyword data if available and function is provided
  if (savedAnalysis.manualData?.keywordData && setManualKeywordData) {
    console.log('Loading keyword data:', savedAnalysis.manualData.keywordData.length, 'keywords');
    setManualKeywordData(savedAnalysis.manualData.keywordData);
  }
  
  // Load Staff/Service data if available
  if (savedAnalysis.manualData?.staffQualificationData && updateStaffQualificationData) {
    console.log('Loading staff qualification data');
    updateStaffQualificationData(savedAnalysis.manualData.staffQualificationData);
  }
  
  if (savedAnalysis.manualData?.hourlyRateData && updateHourlyRateData) {
    console.log('Loading hourly rate data');
    updateHourlyRateData(savedAnalysis.manualData.hourlyRateData);
  }
  
  if (savedAnalysis.manualData?.quoteResponseData && updateQuoteResponseData) {
    console.log('Loading quote response data');
    updateQuoteResponseData(savedAnalysis.manualData.quoteResponseData);
  }
  
  // Load additional manual data
  if (savedAnalysis.manualData?.manualContentData && updateManualContentData) {
    console.log('Loading manual content data');
    updateManualContentData(savedAnalysis.manualData.manualContentData);
  }
  
  if (savedAnalysis.manualData?.manualAccessibilityData && updateManualAccessibilityData) {
    console.log('Loading manual accessibility data');
    updateManualAccessibilityData(savedAnalysis.manualData.manualAccessibilityData);
  }
  
  if (savedAnalysis.manualData?.manualBacklinkData && updateManualBacklinkData) {
    console.log('Loading manual backlink data');
    updateManualBacklinkData(savedAnalysis.manualData.manualBacklinkData);
  }
  
  if (savedAnalysis.manualData?.manualDataPrivacyData && updateManualDataPrivacyData) {
    console.log('Loading manual data privacy data');
    updateManualDataPrivacyData(savedAnalysis.manualData.manualDataPrivacyData);
  }
  
  if (savedAnalysis.manualData?.manualLocalSEOData && updateManualLocalSEOData) {
    console.log('Loading manual local SEO data');
    console.log('📍 Local SEO Data from saved analysis:', JSON.stringify(savedAnalysis.manualData.manualLocalSEOData, null, 2));
    console.log('📍 Directories in saved data:', savedAnalysis.manualData.manualLocalSEOData.directories);
    updateManualLocalSEOData(savedAnalysis.manualData.manualLocalSEOData);
  }
  
  if (savedAnalysis.manualData?.manualIndustryReviewData && updateManualIndustryReviewData) {
    console.log('Loading manual industry review data');
    updateManualIndustryReviewData(savedAnalysis.manualData.manualIndustryReviewData);
  }
  
  if (savedAnalysis.manualData?.manualOnlinePresenceData && updateManualOnlinePresenceData) {
    console.log('Loading manual online presence data');
    updateManualOnlinePresenceData(savedAnalysis.manualData.manualOnlinePresenceData);
  }
  
  if (savedAnalysis.manualData?.manualConversionData && updateManualConversionData) {
    console.log('Loading manual conversion data');
    updateManualConversionData(savedAnalysis.manualData.manualConversionData);
  }
  
  if (savedAnalysis.manualData?.manualMobileData && updateManualMobileData) {
    console.log('Loading manual mobile data');
    updateManualMobileData(savedAnalysis.manualData.manualMobileData);
  }
  
  if (savedAnalysis.manualData?.manualReputationData && updateManualReputationData) {
    console.log('Loading manual reputation data');
    updateManualReputationData(savedAnalysis.manualData.manualReputationData);
  }
  
  if (savedAnalysis.manualData?.manualSEOData && updateManualSEOData) {
    console.log('Loading manual SEO data');
    updateManualSEOData(savedAnalysis.manualData.manualSEOData);
  }
  
  // Load cached analysis data (privacy, accessibility, security)
  if (savedAnalysis.manualData?.privacyData && setPrivacyData) {
    console.log('Loading privacy data');
    const loadedPrivacyData = savedAnalysis.manualData.privacyData;
    const manualDataPrivacy = savedAnalysis.manualData?.manualDataPrivacyData;
    
    // KRITISCH: Bei Neutralisierungen muss der Score IMMER neu berechnet werden
    // Gespeicherte overallScore-Werte ignorieren wir in diesem Fall
    let cappedManualData = manualDataPrivacy;
    let shouldRecalculate = false;
    
    if (loadedPrivacyData?.violations) {
      const deselected = manualDataPrivacy?.deselectedViolations || [];
      let criticalCount = 0;
      let neutralizedCount = 0;
      
      // Zähle nicht-deselektierte und nicht-neutralisierte kritische/high Violations
      loadedPrivacyData.violations.forEach((v: any, i: number) => {
        if (!deselected.includes(`auto-${i}`)) {
          // SSL/TLS-bezogene Violations → können durch hasSSL neutralisiert werden
          // WICHTIG: HSTS ist ein separater Security-Header und wird NICHT durch SSL neutralisiert!
          const isSSLViolation = (v.description?.includes('SSL') || 
                                v.description?.includes('TLS') ||
                                v.description?.includes('Verschlüsselung')) &&
                                !v.description?.includes('HSTS');
          
          // Cookie-Banner Violation → kann durch cookieConsent neutralisiert werden
          const isCookieViolation = v.description?.includes('Cookie') && 
                                    v.description?.includes('Banner');
          
          const neutralizedBySSL = isSSLViolation && manualDataPrivacy?.hasSSL === true;
          const neutralizedByCookie = isCookieViolation && manualDataPrivacy?.cookieConsent === true;
          
          if (neutralizedBySSL || neutralizedByCookie) {
            neutralizedCount++;
            shouldRecalculate = true; // Force recalculation wenn Neutralisierungen existieren
          } else if (v.severity === 'critical' || v.severity === 'high') {
            criticalCount++;
          }
        }
      });
      
      // Zähle custom kritische/high Violations
      if (manualDataPrivacy?.customViolations) {
        manualDataPrivacy.customViolations.forEach((v: any) => {
          if (v.severity === 'critical' || v.severity === 'high') {
            criticalCount++;
          }
        });
      }
      
      // Wenn Neutralisierungen existieren, lösche den manuellen overallScore
      // damit der Score neu berechnet wird
      if (shouldRecalculate && manualDataPrivacy?.overallScore !== undefined) {
        console.log(`🔄 Neutralisierungen erkannt (${neutralizedCount} Fehler neutralisiert), Score wird neu berechnet statt ${manualDataPrivacy.overallScore}% zu verwenden`);
        cappedManualData = {
          ...manualDataPrivacy,
          overallScore: undefined // Entferne manuellen Score bei Neutralisierungen
        };
      } else if (manualDataPrivacy?.overallScore !== undefined) {
        // Kein Recalculation nötig, aber Score könnte trotzdem gekappt werden müssen
        let maxScore = 100;
        if (criticalCount >= 3) maxScore = 20;
        else if (criticalCount === 2) maxScore = 35;
        else if (criticalCount === 1) maxScore = 59;
        
        if (manualDataPrivacy.overallScore > maxScore) {
          console.log(`⚠️ Manueller Score ${manualDataPrivacy.overallScore}% wird auf ${maxScore}% gekappt (${criticalCount} kritische Fehler verbleibend)`);
          cappedManualData = {
            ...manualDataPrivacy,
            overallScore: maxScore
          };
        }
      }
      
      // Update State
      if (cappedManualData !== manualDataPrivacy && updateManualDataPrivacyData) {
        updateManualDataPrivacyData(cappedManualData);
      }
    }
    
    // Berechne Score mit dem GEKAPPTEN manualDataPrivacy
    const recalculatedScore = calculateDataPrivacyScore(
      savedAnalysis.realData, 
      loadedPrivacyData, 
      cappedManualData
    );
    
    // Setze korrigierten Score
    setPrivacyData({
      ...loadedPrivacyData,
      score: recalculatedScore
    });
  }
  
  if (savedAnalysis.manualData?.accessibilityData && setAccessibilityData) {
    console.log('Loading accessibility data');
    const accessibilityData = savedAnalysis.manualData.accessibilityData;
    const manualAccessibilityData = savedAnalysis.manualData?.manualAccessibilityData;
    
    // Recalculate Accessibility score with capping logic for saved analyses
    const recalculatedAccessibilityScore = calculateAccessibilityScore(
      accessibilityData,
      manualAccessibilityData
    );
    
    // Zähle kritische Violations für Logging
    const criticalViolations = (accessibilityData?.violations || []).filter((v: any) => 
      v.impact === 'critical' || v.impact === 'serious'
    );
    
    console.log(`♿ Barrierefreiheit Score neu berechnet: ${recalculatedAccessibilityScore}%${criticalViolations.length > 0 ? ` (${criticalViolations.length} kritische Violation-Typen erkannt)` : ''}`);
    
    // Setze korrigierten Score
    setAccessibilityData({
      ...accessibilityData,
      score: recalculatedAccessibilityScore
    });
  }
  
  if (savedAnalysis.manualData?.securityData && setSecurityData) {
    console.log('Loading security data');
    setSecurityData(savedAnalysis.manualData.securityData);
  }
  
  // Load extension data
  if (savedAnalysis.manualData?.extensionData && setSavedExtensionData) {
    console.log('Loading extension data');
    setSavedExtensionData(savedAnalysis.manualData.extensionData);
  }
  
  // Load national providers toggle
  if (savedAnalysis.manualData?.showNationalProviders !== undefined && updateShowNationalProviders) {
    console.log('Loading showNationalProviders:', savedAnalysis.manualData.showNationalProviders);
    updateShowNationalProviders(savedAnalysis.manualData.showNationalProviders);
  }
  
  // Load regional trends toggle and data
  if (savedAnalysis.manualData?.showRegionalTrends !== undefined && updateShowRegionalTrends) {
    console.log('Loading showRegionalTrends:', savedAnalysis.manualData.showRegionalTrends);
    updateShowRegionalTrends(savedAnalysis.manualData.showRegionalTrends);
  }
  
  if (savedAnalysis.manualData?.regionalTrendsData && updateRegionalTrendsData) {
    console.log('Loading regionalTrendsData:', savedAnalysis.manualData.regionalTrendsData);
    updateRegionalTrendsData(savedAnalysis.manualData.regionalTrendsData);
  }
  
  console.log('Saved analysis data loaded successfully');
};
