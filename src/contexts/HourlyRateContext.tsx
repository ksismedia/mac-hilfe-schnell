import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface HourlyRateData {
  ownRate: number;
  regionAverage: number;
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

  const hasHourlyRateData = hourlyRateData !== null && hourlyRateData.ownRate > 0;

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