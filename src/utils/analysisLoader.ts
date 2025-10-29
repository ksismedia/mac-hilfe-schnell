
import { SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { ManualImprintData, ManualSocialData, ManualWorkplaceData, ManualCompetitor, CompetitorServices, ManualCorporateIdentityData } from '@/hooks/useManualData';

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
  updateManualOnlinePresenceData?: (data: any) => void
) => {
  console.log('Loading saved analysis data:', savedAnalysis.id);
  
  // Load manual data
  if (savedAnalysis.manualData?.imprint) {
    console.log('Loading imprint data');
    updateImprintData(savedAnalysis.manualData.imprint);
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
  
  console.log('Saved analysis data loaded successfully');
};
