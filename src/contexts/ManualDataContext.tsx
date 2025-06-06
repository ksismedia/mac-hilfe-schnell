
import React, { createContext, useContext, ReactNode } from 'react';
import { useManualData, ManualImprintData, ManualSocialData } from '@/hooks/useManualData';

interface ManualDataContextType {
  manualImprintData: ManualImprintData | null;
  manualSocialData: ManualSocialData | null;
  updateImprintData: (data: ManualImprintData | null) => void;
  updateSocialData: (data: ManualSocialData | null) => void;
  clearAllData: () => void;
}

const ManualDataContext = createContext<ManualDataContextType | undefined>(undefined);

export const ManualDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const manualDataHook = useManualData();
  
  return (
    <ManualDataContext.Provider value={manualDataHook}>
      {children}
    </ManualDataContext.Provider>
  );
};

export const useManualDataContext = () => {
  const context = useContext(ManualDataContext);
  if (context === undefined) {
    throw new Error('useManualDataContext must be used within a ManualDataProvider');
  }
  return context;
};
