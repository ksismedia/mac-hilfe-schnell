
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
  facebookFollowers: string;
  instagramFollowers: string;
  linkedinFollowers: string;
  twitterFollowers: string;
  youtubeSubscribers: string;
  facebookLastPost: string;
  instagramLastPost: string;
  linkedinLastPost: string;
  twitterLastPost: string;
  youtubeLastPost: string;
}

export interface ManualWorkplaceData {
  kununuFound: boolean;
  kununuRating: string;
  kununuReviews: string;
  glassdoorFound: boolean;
  glassdoorRating: string;
  glassdoorReviews: string;
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

export const useManualData = () => {
  const [manualImprintData, setManualImprintData] = useState<ManualImprintData | null>(null);
  const [manualSocialData, setManualSocialData] = useState<ManualSocialData | null>(null);
  const [manualWorkplaceData, setManualWorkplaceData] = useState<ManualWorkplaceData | null>(null);
  const [manualCompetitors, setManualCompetitors] = useState<ManualCompetitor[]>([]);
  const [competitorServices, setCompetitorServices] = useState<CompetitorServices>({});
  const [removedMissingServices, setRemovedMissingServices] = useState<string[]>([]);
  const [companyServices, setCompanyServices] = useState<CompanyServices>({ services: [] });
  const [deletedCompetitors, setDeletedCompetitors] = useState<Set<string>>(new Set());

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

  return {
    manualImprintData,
    manualSocialData,
    manualWorkplaceData,
    manualCompetitors,
    competitorServices,
    removedMissingServices,
    companyServices,
    deletedCompetitors,
    updateImprintData,
    updateSocialData,
    updateWorkplaceData,
    updateCompetitors,
    updateCompetitorServices,
    updateRemovedMissingServices,
    addRemovedMissingService,
    updateCompanyServices,
    addDeletedCompetitor,
    removeDeletedCompetitor
  };
};
