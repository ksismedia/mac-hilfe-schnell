
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

export const useManualData = () => {
  const [manualImprintData, setManualImprintData] = useState<ManualImprintData | null>(null);
  const [manualSocialData, setManualSocialData] = useState<ManualSocialData | null>(null);

  const updateImprintData = useCallback((data: ManualImprintData | null) => {
    setManualImprintData(data);
    console.log('Manual Imprint Data Updated:', data);
  }, []);

  const updateSocialData = useCallback((data: ManualSocialData | null) => {
    setManualSocialData(data);
    console.log('Manual Social Data Updated:', data);
  }, []);

  const clearAllData = useCallback(() => {
    setManualImprintData(null);
    setManualSocialData(null);
  }, []);

  return {
    manualImprintData,
    manualSocialData,
    updateImprintData,
    updateSocialData,
    clearAllData
  };
};
