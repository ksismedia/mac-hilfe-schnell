import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SavedAnalysis } from '@/hooks/useSavedAnalyses';

interface AnalysisContextType {
  currentAnalysis: SavedAnalysis | null;
  setCurrentAnalysis: (analysis: SavedAnalysis | null) => void;
  clearAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysisContext = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysisContext must be used within an AnalysisProvider');
  }
  return context;
};

interface AnalysisProviderProps {
  children: ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<SavedAnalysis | null>(null);

  const clearAnalysis = () => {
    setCurrentAnalysis(null);
  };

  return (
    <AnalysisContext.Provider value={{
      currentAnalysis,
      setCurrentAnalysis,
      clearAnalysis
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};