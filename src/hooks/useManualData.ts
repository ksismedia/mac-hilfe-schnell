
import { useState, useCallback } from 'react';

export interface ManualImprintData {
  found: boolean;
  elements: string[];
}

export interface ManualSocialData {
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  facebookFollowers: string;
  instagramFollowers: string;
  linkedinFollowers: string;
  twitterFollowers: string;
  youtubeSubscribers: string;
  tiktokFollowers: string;
  facebookLastPost: string;
  instagramLastPost: string;
  linkedinLastPost: string;
  twitterLastPost: string;
  youtubeLastPost: string;
  tiktokLastPost: string;
}

export interface ManualWorkplaceData {
  kununuFound: boolean;
  kununuRating: string;
  kununuReviews: string;
  glassdoorFound: boolean;
  glassdoorRating: string;
  glassdoorReviews: string;
}

export interface ManualCorporateIdentityData {
  uniformLogo: boolean;
  uniformWorkClothing: boolean;
  uniformVehicleBranding: boolean;
  uniformColorScheme: boolean;
  uniformTypography?: boolean;
  uniformBusinessCards?: boolean;
  uniformWebsiteDesign?: boolean;
  uniformDocumentTemplates?: boolean;
  uniformSignage?: boolean;
  uniformPackaging?: boolean;
  notes?: string;
}

export interface ManualCompetitor {
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  services: string[];
  website?: string;
}

export interface CompetitorServices {
  [competitorName: string]: {
    services: string[];
    source: 'auto' | 'manual';
  };
}

export interface ManualCompetitorData {
  competitors: ManualCompetitor[];
  removedMissingServices: string[];
}

export interface CompanyServices {
  services: string[];
  lastUpdated?: string;
}

export interface StaffQualificationData {
  totalEmployees: number;
  apprentices: number;
  skilled_workers: number;
  masters: number;
  office_workers: number; // Neue Rubrik: Bürokräfte
  unskilled_workers: number;
  certifications: {
    welding_certificates: boolean;
    safety_training: boolean;
    first_aid: boolean;
    digital_skills: boolean;
    instructor_qualification: boolean;
    business_qualification: boolean;
  };
  industry_specific: string[];
  specializations: string;
  training_budget_per_year: number;
  average_experience_years: number;
}

export interface HourlyRateData {
  meisterRate: number;
  facharbeiterRate: number;
  azubiRate: number;
  helferRate: number;
  serviceRate: number;
  installationRate: number;
  // Regional rates for comparison
  regionalMeisterRate: number;
  regionalFacharbeiterRate: number;
  regionalAzubiRate: number;
  regionalHelferRate: number;
  regionalServiceRate: number;
  regionalInstallationRate: number;
}

export interface QuoteResponseData {
  responseTime: string;
  contactMethods: {
    phone: boolean;
    email: boolean;
    contactForm: boolean;
    whatsapp: boolean;
    messenger: boolean;
  };
  automaticConfirmation: boolean;
  responseQuality: string;
  followUpProcess: boolean;
  availabilityHours: string;
  personalContact: boolean;
  notes?: string;
}

export interface ManualContentData {
  textQuality: number; // 1-100 Score
  contentRelevance: number; // 1-100 Score
  expertiseLevel: number; // 1-100 Score
  contentFreshness: number; // 1-100 Score
  notes?: string;
}

export interface ManualAccessibilityData {
  keyboardNavigation: boolean;
  screenReaderCompatible: boolean;
  colorContrast: boolean;
  altTextsPresent: boolean;
  focusVisibility: boolean;
  textScaling: boolean;
  overallScore: number; // 1-100 Score
  notes?: string;
}

export interface ManualBacklinkData {
  totalBacklinks: number;
  qualityScore: number; // 1-100 Score
  domainAuthority: number; // 1-100 Score
  localRelevance: number; // 1-100 Score
  spamLinks: number;
  notes?: string;
}

export const useManualData = () => {
  const [manualImprintData, setManualImprintData] = useState<ManualImprintData | null>(null);
  const [manualSocialData, setManualSocialData] = useState<ManualSocialData | null>(null);
  const [manualWorkplaceData, setManualWorkplaceData] = useState<ManualWorkplaceData | null>(null);
  const [manualCorporateIdentityData, setManualCorporateIdentityData] = useState<ManualCorporateIdentityData | null>(null);
  const [manualCompetitors, setManualCompetitors] = useState<ManualCompetitor[]>([]);
  const [competitorServices, setCompetitorServices] = useState<CompetitorServices>({});
  const [removedMissingServices, setRemovedMissingServices] = useState<string[]>([]);
  const [companyServices, setCompanyServices] = useState<CompanyServices>({ services: [] });
  const [deletedCompetitors, setDeletedCompetitors] = useState<Set<string>>(new Set());
  const [staffQualificationData, setStaffQualificationData] = useState<StaffQualificationData | null>(null);
  const [hourlyRateData, setHourlyRateData] = useState<HourlyRateData | null>(null);
  const [quoteResponseData, setQuoteResponseData] = useState<QuoteResponseData | null>(null);
  const [manualContentData, setManualContentData] = useState<ManualContentData | null>(null);
  const [manualAccessibilityData, setManualAccessibilityData] = useState<ManualAccessibilityData | null>(null);
  const [manualBacklinkData, setManualBacklinkData] = useState<ManualBacklinkData | null>(null);

  const updateImprintData = useCallback((data: ManualImprintData | null) => {
    setManualImprintData(data);
    console.log('Manual Imprint Data Updated:', data);
  }, []);

  const updateSocialData = useCallback((data: ManualSocialData | null) => {
    setManualSocialData(data);
    console.log('Manual Social Data Updated:', data);
  }, []);

  const updateWorkplaceData = useCallback((data: ManualWorkplaceData | null) => {
    setManualWorkplaceData(data);
    console.log('Manual Workplace Data Updated:', data);
  }, []);

  const updateCorporateIdentityData = useCallback((data: ManualCorporateIdentityData | null) => {
    setManualCorporateIdentityData(data);
    console.log('Manual Corporate Design Data Updated:', data);
  }, []);

  const updateCompetitors = useCallback((competitors: ManualCompetitor[]) => {
    setManualCompetitors(competitors);
    console.log('Manual Competitors Updated:', competitors);
  }, []);

  const updateCompetitorServices = useCallback((competitorName: string, services: string[], source: 'auto' | 'manual' = 'manual') => {
    setCompetitorServices(prev => ({
      ...prev,
      [competitorName]: {
        services,
        source
      }
    }));
    console.log('Competitor Services Updated:', competitorName, services, source);
  }, []);

  const updateRemovedMissingServices = useCallback((services: string[]) => {
    setRemovedMissingServices(services);
    console.log('Removed Missing Services Updated:', services);
  }, []);

  const addRemovedMissingService = useCallback((service: string) => {
    setRemovedMissingServices(prev => {
      if (!prev.includes(service)) {
        return [...prev, service];
      }
      return prev;
    });
  }, []);

  const updateCompanyServices = useCallback((services: string[]) => {
    setCompanyServices({
      services,
      lastUpdated: new Date().toISOString()
    });
    console.log('Company Services Updated:', services);
  }, []);

  const addDeletedCompetitor = useCallback((competitorName: string) => {
    setDeletedCompetitors(prev => new Set([...prev, competitorName]));
  }, []);

  const removeDeletedCompetitor = useCallback((competitorName: string) => {
    setDeletedCompetitors(prev => {
      const newSet = new Set(prev);
      newSet.delete(competitorName);
      return newSet;
    });
  }, []);

  const updateStaffQualificationData = useCallback((data: StaffQualificationData | null) => {
    setStaffQualificationData(data);
    console.log('Staff Qualification Data Updated:', data);
  }, []);

  const updateHourlyRateData = useCallback((data: HourlyRateData | null) => {
    setHourlyRateData(data);
    console.log('Hourly Rate Data Updated:', data);
  }, []);

  const updateQuoteResponseData = useCallback((data: QuoteResponseData | null) => {
    setQuoteResponseData(data);
    console.log('Quote Response Data Updated:', data);
  }, []);

  const updateManualContentData = useCallback((data: ManualContentData | null) => {
    setManualContentData(data);
    console.log('Manual Content Data Updated:', data);
  }, []);

  const updateManualAccessibilityData = useCallback((data: ManualAccessibilityData | null) => {
    setManualAccessibilityData(data);
    console.log('Manual Accessibility Data Updated:', data);
  }, []);

  const updateManualBacklinkData = useCallback((data: ManualBacklinkData | null) => {
    setManualBacklinkData(data);
    console.log('Manual Backlink Data Updated:', data);
  }, []);

  return {
    manualImprintData,
    manualSocialData,
    manualWorkplaceData,
    manualCorporateIdentityData,
    manualCompetitors,
    competitorServices,
    removedMissingServices,
    companyServices,
    deletedCompetitors,
    staffQualificationData,
    hourlyRateData,
    quoteResponseData,
    manualContentData,
    manualAccessibilityData,
    manualBacklinkData,
    updateImprintData,
    updateSocialData,
    updateWorkplaceData,
    updateCorporateIdentityData,
    updateCompetitors,
    updateCompetitorServices,
    updateRemovedMissingServices,
    addRemovedMissingService,
    updateCompanyServices,
    addDeletedCompetitor,
    removeDeletedCompetitor,
    updateStaffQualificationData,
    updateHourlyRateData,
    updateQuoteResponseData,
    updateManualContentData,
    updateManualAccessibilityData,
    updateManualBacklinkData
  };
};
