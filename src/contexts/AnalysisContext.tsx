import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { useAIReviewStatus, AIReviewStatus } from '@/hooks/useAIReviewStatus';

interface AnalysisContextType {
  currentAnalysis: SavedAnalysis | null;
  setCurrentAnalysis: (analysis: SavedAnalysis | null) => void;
  clearAnalysis: () => void;
  reviewStatus: AIReviewStatus;
  updateReviewStatus: (category: string, isReviewed: boolean, notes?: string) => Promise<AIReviewStatus>;
  isFullyReviewed: () => boolean;
  getUnreviewedCategories: () => string[];
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
  
  // AI Review Status für KI-VO Compliance
  const {
    reviewStatus,
    updateReviewStatus,
    isFullyReviewed,
    getUnreviewedCategories,
    initializeCategories
  } = useAIReviewStatus(currentAnalysis?.id);
  
  // Initialize AI review categories when analysis changes
  React.useEffect(() => {
    if (currentAnalysis) {
      const aiCategories = [
        'SEO-Analyse',
        'Performance-Analyse',
        'Keyword-Analyse',
        'Content-Qualität',
        'Barrierefreiheit',
        'Datenschutz (DSGVO)',
        'Lokales SEO',
        'Wettbewerbsanalyse'
      ];
      initializeCategories(aiCategories);
    }
  }, [currentAnalysis, initializeCategories]);

  const clearAnalysis = () => {
    setCurrentAnalysis(null);
  };

  return (
    <AnalysisContext.Provider value={{
      currentAnalysis,
      setCurrentAnalysis,
      clearAnalysis,
      reviewStatus,
      updateReviewStatus,
      isFullyReviewed,
      getUnreviewedCategories
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};