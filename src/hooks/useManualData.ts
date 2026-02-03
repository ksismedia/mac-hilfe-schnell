
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
  // New fields for disabling automatically found reviews
  disableAutoKununu: boolean;
  disableAutoGlassdoor: boolean;
}

export interface ManualCorporateIdentityData {
  // Corporate Design (5 Felder)
  uniformLogo: 'yes' | 'no' | 'unknown';
  uniformWorkClothing: 'yes' | 'no' | 'unknown';
  uniformColorScheme: 'yes' | 'no' | 'unknown';
  uniformTypography: 'yes' | 'no' | 'unknown';
  uniformWebsiteDesign: 'yes' | 'no' | 'unknown';
  
  // Eingesetzte Werbemittel (2 Felder)
  hauszeitung: 'yes' | 'no' | 'unknown';
  herstellerInfos: 'yes' | 'no' | 'unknown';
  
  // Außenwirkung Fahrzeugflotte (2 Felder)
  uniformVehicleBranding: 'yes' | 'no' | 'unknown';
  vehicleCondition: 'yes' | 'no' | 'unknown';
  
  // Außenwerbung (2 Felder)
  bauzaunBanner: 'yes' | 'no' | 'unknown';
  bandenWerbung: 'yes' | 'no' | 'unknown';
  
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
  office_workers: number;
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
  // Neue Felder für Schulungen und Zertifikate
  offers_employee_training: boolean; // Ob Mitarbeiter Schulungen machen können
  employee_certifications: Array<{
    name: string;
    employees_certified: number;
    renewal_interval?: string;
  }>;
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
  disabledBacklinks?: string[]; // URLs of manually disabled backlinks
  webMentions?: any[]; // Web mentions from backlink search (persisted for export)
  lastSearched?: string; // ISO timestamp of last search
}

export interface ManualDataPrivacyData {
  hasSSL: boolean;
  cookiePolicy: boolean;
  privacyPolicy: boolean;
  gdprCompliant: boolean;
  cookieConsent: boolean;
  dataProcessingAgreement: boolean;
  dataSubjectRights: boolean;
  // Neue DSGVO-Parameter
  thirdCountryTransfer: boolean; // Art. 44-49 DSGVO
  thirdCountryTransferDetails?: string; // Details zu Drittland-Transfers
  dataProtectionOfficer: boolean; // Art. 37 DSGVO - Datenschutzbeauftragter
  processingRegister: boolean; // Art. 30 DSGVO - Verarbeitungsverzeichnis
  // Tracking-Scripts
  trackingScripts: Array<{
    id: string;
    name: string;
    type: 'analytics' | 'marketing' | 'social' | 'other';
    provider: string;
    consentRequired: boolean;
  }>;
  // Externe Dienste / Auftragsverarbeiter
  externalServices: Array<{
    id: string;
    name: string;
    purpose: string;
    dataProcessingAgreement: boolean;
    thirdCountry: boolean;
    country?: string;
  }>;
  deselectedViolations: string[]; // IDs of violations that were manually deselected
  customViolations: Array<{
    id: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: string;
    article?: string;
    recommendation?: string;
  }>;
  manualCookies?: Array<{
    id: string;
    name: string;
    category: 'strictly-necessary' | 'analytics' | 'marketing' | 'functional';
    purpose?: string;
  }>;
  overallScore: number; // Manual override score
  notes?: string;
}

export interface LocalSEODirectory {
  name: string;
  status: 'complete' | 'incomplete' | 'not-found';
  url?: string;
  claimedByOwner?: boolean;
  verified?: boolean;
  completeness?: number;
  lastUpdate?: string;
}

export interface ManualLocalSEOData {
  // Google My Business
  gmbClaimed: boolean;
  gmbVerified: boolean;
  gmbCompleteness: number; // 0-100
  gmbPhotos: number;
  gmbPosts: number;
  gmbLastUpdate: string;
  
  // Verzeichnisse
  directories: LocalSEODirectory[];
  
  // NAP Konsistenz
  napConsistencyScore: number; // 0-100
  napIssues: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
  }>;
  
  // Structured Data
  hasLocalBusinessSchema: boolean;
  hasOrganizationSchema: boolean;
  schemaTypes: string[];
  
  // Lokale Keywords (Positionen)
  localKeywordRankings: Array<{
    keyword: string;
    position: number;
    searchVolume: 'high' | 'medium' | 'low';
    trend: 'up' | 'down' | 'stable';
  }>;
  
  // On-Page Local Faktoren
  addressVisible: boolean;
  phoneVisible: boolean;
  openingHoursVisible: boolean;
  localContentScore: number; // 0-100
  
  // Gesamtscore
  overallScore: number; // 0-100
  notes?: string;
}

export interface ManualSEOData {
  // Confirmed SEO elements - unconfirmed elements count as errors
  confirmedElements: string[]; // IDs: 'titleTag', 'metaDescription', 'headingStructure', 'altTags'
  // Explicitly rejected elements - these count as errors regardless of auto-detected score
  rejectedElements: string[]; // Same IDs - user says this element is NOT OK
  notes?: string;
}

export interface PlatformReview {
  platformName: string;
  rating: number;
  reviewCount: number;
  profileUrl?: string;
  isVerified: boolean;
  lastReviewDate?: string;
}

export interface ManualIndustryReviewData {
  platforms: PlatformReview[];
  overallScore: number;
}

export interface ManualOnlinePresenceData {
  items: Array<{
    url: string;
    type: 'image' | 'video' | 'short';
    relevance: 'high' | 'medium' | 'low';
    isOwn?: boolean;
  }>;
  overallScore?: number;
  simpleCounts?: {
    images: number;
    videos: number;
    shorts: number;
    imageRelevance?: 'high' | 'medium' | 'low';
    videoRelevance?: 'high' | 'medium' | 'low';
    shortRelevance?: 'high' | 'medium' | 'low';
    // Neue Felder für eigene/fremde Inhalte
    ownImages?: number;
    ownVideos?: number;
    ownShorts?: number;
    foreignImages?: number;
    foreignVideos?: number;
    foreignShorts?: number;
  };
}

export interface ManualReputationData {
  searchResults: Array<{
    title: string;
    link: string;
    snippet: string;
    displayLink: string;
  }>;
  reputationScore: number; // 0-100
  webMentionsCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  lastChecked?: string;
  additionalSearchTerms?: string;
  notes?: string;
}

export interface ManualConversionData {
  // Call-to-Action
  totalCTAs: number;
  visibleCTAs: number;
  effectiveCTAs: number;
  aboveFoldCTAs: number;
  
  // CTA-Typen mit Performance
  ctaTypes: Array<{
    type: string;
    count: number;
    effectiveness: number; // 0-100
    mobileOptimized: boolean;
    trackingSetup: boolean;
  }>;
  
  // Kontaktmethoden
  contactMethods: {
    phone: { visible: boolean; prominent: boolean; clickable: boolean };
    email: { visible: boolean; prominent: boolean };
    form: { present: boolean; mobileOptimized: boolean };
    chat: { present: boolean };
    whatsapp: { present: boolean };
    callback: { present: boolean };
  };
  
  // Scores
  ctaScore: number; // 0-100
  contactScore: number; // 0-100
  userJourneyScore: number; // 0-100
  overallScore: number; // 0-100
  
  // User Journey Details
  userJourneyDetails?: {
    landingPageScore: number;
    navigationScore: number;
    informationHierarchyScore: number;
    trustElementsScore: number;
    readabilityScore: number;
  };
  
  notes?: string;
}

export interface ManualMobileData {
  // Responsive Design
  viewportConfig: 'correct' | 'incorrect' | 'missing';
  flexibleLayouts: number; // 0-100%
  imageOptimization: number; // 0-100%
  
  // Mobile Performance
  mobileLoadTime: number; // seconds
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint in seconds
    fid: number; // First Input Delay in ms
    cls: number; // Cumulative Layout Shift
  };
  mobileFirstIndex: boolean;
  
  // Touch Optimization
  buttonSize: 'touch-friendly' | 'too-small' | 'acceptable';
  tapDistance: 'sufficient' | 'insufficient' | 'good';
  scrollBehavior: 'smooth' | 'jerky' | 'acceptable';
  
  // Mobile UX
  navigationMobileFriendly: boolean;
  readableTextSize: boolean;
  noHorizontalScrolling: boolean;
  appropriateInteractiveElements: boolean;
  
  // Scores
  responsiveDesignScore: number; // 0-100
  performanceScore: number; // 0-100
  touchOptimizationScore: number; // 0-100
  overallScore: number; // 0-100
  
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
  const [manualDataPrivacyData, setManualDataPrivacyData] = useState<ManualDataPrivacyData | null>(null);
  const [manualLocalSEOData, setManualLocalSEOData] = useState<ManualLocalSEOData | null>(null);
  const [manualIndustryReviewData, setManualIndustryReviewData] = useState<ManualIndustryReviewData | null>(null);
  const [manualOnlinePresenceData, setManualOnlinePresenceData] = useState<ManualOnlinePresenceData | null>(null);
  const [manualConversionData, setManualConversionData] = useState<ManualConversionData | null>(null);
  const [manualMobileData, setManualMobileData] = useState<ManualMobileData | null>(null);
  const [manualReputationData, setManualReputationData] = useState<ManualReputationData | null>(null);
  const [manualSEOData, setManualSEOData] = useState<ManualSEOData | null>(null);
  const [showNationalProviders, setShowNationalProviders] = useState<boolean>(false);
  const [showRegionalTrends, setShowRegionalTrends] = useState<boolean>(false);
  const [regionalTrendsData, setRegionalTrendsData] = useState<any>(null);

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

  const updateManualDataPrivacyData = useCallback((data: ManualDataPrivacyData | null) => {
    console.log('🔒 useManualData: updateManualDataPrivacyData called with:', data);
    console.log('🔒 trackingScripts in update:', data?.trackingScripts);
    console.log('🔒 externalServices in update:', data?.externalServices);
    setManualDataPrivacyData(data);
    console.log('Manual Data Privacy Data Updated:', data);
  }, []);

  const updateManualLocalSEOData = useCallback((data: ManualLocalSEOData | null) => {
    setManualLocalSEOData(data);
    console.log('Manual Local SEO Data Updated:', data);
  }, []);

  const updateManualIndustryReviewData = useCallback((data: ManualIndustryReviewData | null) => {
    setManualIndustryReviewData(data);
    console.log('Manual Industry Review Data Updated:', data);
  }, []);

  const updateManualOnlinePresenceData = useCallback((data: ManualOnlinePresenceData | null) => {
    setManualOnlinePresenceData(data);
    console.log('Manual Online Presence Data Updated:', data);
  }, []);

  const updateManualConversionData = useCallback((data: ManualConversionData | null) => {
    console.log('=== updateManualConversionData called ===');
    console.log('New data:', data);
    setManualConversionData(data);
    console.log('Manual Conversion Data Updated:', data);
  }, []);

  const updateManualMobileData = useCallback((data: ManualMobileData | null) => {
    setManualMobileData(data);
    console.log('Manual Mobile Data Updated:', data);
  }, []);

  const updateManualReputationData = useCallback((data: ManualReputationData | null) => {
    setManualReputationData(data);
    console.log('Manual Reputation Data Updated:', data);
  }, []);

  const updateManualSEOData = useCallback((data: ManualSEOData | null) => {
    setManualSEOData(data);
    console.log('Manual SEO Data Updated:', data);
  }, []);

  const updateShowNationalProviders = useCallback((show: boolean) => {
    setShowNationalProviders(show);
    console.log('Show National Providers Updated:', show);
  }, []);

  const updateShowRegionalTrends = useCallback((show: boolean) => {
    setShowRegionalTrends(show);
    console.log('Show Regional Trends Updated:', show);
  }, []);

  const updateRegionalTrendsData = useCallback((data: any) => {
    setRegionalTrendsData(data);
    console.log('Regional Trends Data Updated:', data);
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
    manualDataPrivacyData,
    manualLocalSEOData,
    manualIndustryReviewData,
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
    updateManualBacklinkData,
    updateManualDataPrivacyData,
    updateManualLocalSEOData,
    updateManualIndustryReviewData,
    manualOnlinePresenceData,
    updateManualOnlinePresenceData,
    manualConversionData,
    updateManualConversionData,
    manualMobileData,
    updateManualMobileData,
    manualReputationData,
    updateManualReputationData,
    manualSEOData,
    updateManualSEOData,
    showNationalProviders,
    updateShowNationalProviders,
    showRegionalTrends,
    updateShowRegionalTrends,
    regionalTrendsData,
    updateRegionalTrendsData,
  };
};
