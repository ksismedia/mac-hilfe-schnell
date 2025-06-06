
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

export const useManualData = () => {
  const [manualImprintData, setManualImprintData] = useState<ManualImprintData | null>(null);
  const [manualSocialData, setManualSocialData] = useState<ManualSocialData | null>(null);
  const [manualCompetitorServices, setManualCompetitorServices] = useState<ManualCompetitorServices>({});

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

  return {
    manualImprintData,
    manualSocialData,
    manualCompetitorServices,
    updateImprintData,
    updateSocialData,
    updateCompetitorServices
  };
};
