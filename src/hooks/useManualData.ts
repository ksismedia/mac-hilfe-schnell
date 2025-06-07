
import { useState, useCallback } from 'react';

export interface ManualImprintData {
  found: boolean;
  elements: string[];
}

export interface ManualSocialData {
  facebookUrl: string;
  instagramUrl: string;
  facebookFollowers: string;
  instagramFollowers: string;
  facebookLastPost: string;
  instagramLastPost: string;
}

export interface ManualCompetitorServices {
  [competitorName: string]: string[];
}

export interface ManualCompetitor {
  name: string;
  rating: number;
  reviews: number;
  distance: string;
}

export const useManualData = () => {
  const [manualImprintData, setManualImprintData] = useState<ManualImprintData | null>(null);
  const [manualSocialData, setManualSocialData] = useState<ManualSocialData | null>(null);
  const [manualCompetitorServices, setManualCompetitorServices] = useState<ManualCompetitorServices>({});
  const [manualCompetitors, setManualCompetitors] = useState<ManualCompetitor[]>([]);

  const updateImprintData = useCallback((data: ManualImprintData | null) => {
    setManualImprintData(data);
    console.log('Manual Imprint Data Updated:', data);
  }, []);

  const updateSocialData = useCallback((data: ManualSocialData | null) => {
    setManualSocialData(data);
    console.log('Manual Social Data Updated:', data);
  }, []);

  const updateCompetitorServices = useCallback((competitorName: string, services: string[]) => {
    setManualCompetitorServices(prev => ({
      ...prev,
      [competitorName]: services
    }));
    console.log('Manual Competitor Services Updated:', competitorName, services);
  }, []);

  const addManualCompetitor = useCallback((competitor: ManualCompetitor) => {
    setManualCompetitors(prev => [...prev, competitor]);
    console.log('Manual Competitor Added:', competitor);
  }, []);

  const removeManualCompetitor = useCallback((index: number) => {
    setManualCompetitors(prev => prev.filter((_, i) => i !== index));
    console.log('Manual Competitor Removed at index:', index);
  }, []);

  return {
    manualImprintData,
    manualSocialData,
    manualCompetitorServices,
    manualCompetitors,
    updateImprintData,
    updateSocialData,
    updateCompetitorServices,
    addManualCompetitor,
    removeManualCompetitor
  };
};
