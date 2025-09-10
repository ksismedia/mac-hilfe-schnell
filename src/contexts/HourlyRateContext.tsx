import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

interface HourlyRateContextType {
  hourlyRateData: HourlyRateData | null;
  hasHourlyRateData: boolean;
  updateHourlyRateData: (data: HourlyRateData | null) => void;
  clearHourlyRateData: () => void;
}

const HourlyRateContext = createContext<HourlyRateContextType | undefined>(undefined);

interface HourlyRateProviderProps {
  children: ReactNode;
}

export const HourlyRateProvider: React.FC<HourlyRateProviderProps> = ({ children }) => {
  const [hourlyRateData, setHourlyRateData] = useState<HourlyRateData | null>(null);

  const updateHourlyRateData = useCallback((data: HourlyRateData | null) => {
    setHourlyRateData(data);
    console.log('Hourly Rate Data Updated:', data);
  }, []);

  const clearHourlyRateData = useCallback(() => {
    setHourlyRateData(null);
    console.log('Hourly Rate Data Cleared');
  }, []);

  const hasHourlyRateData = hourlyRateData !== null && (hourlyRateData.meisterRate > 0 || hourlyRateData.facharbeiterRate > 0 || hourlyRateData.azubiRate > 0 || hourlyRateData.helferRate > 0 || hourlyRateData.serviceRate > 0 || hourlyRateData.installationRate > 0 || hourlyRateData.regionalMeisterRate > 0 || hourlyRateData.regionalFacharbeiterRate > 0 || hourlyRateData.regionalAzubiRate > 0 || hourlyRateData.regionalHelferRate > 0 || hourlyRateData.regionalServiceRate > 0 || hourlyRateData.regionalInstallationRate > 0);

  const value: HourlyRateContextType = {
    hourlyRateData,
    hasHourlyRateData,
    updateHourlyRateData,
    clearHourlyRateData,
  };

  return (
    <HourlyRateContext.Provider value={value}>
      {children}
    </HourlyRateContext.Provider>
  );
};

export const useHourlyRate = (): HourlyRateContextType => {
  const context = useContext(HourlyRateContext);
  if (context === undefined) {
    throw new Error('useHourlyRate must be used within a HourlyRateProvider');
  }
  return context;
};