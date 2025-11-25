import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SavedAnalysis } from '@/hooks/useSavedAnalyses';
import { useAIReviewStatus, AIReviewStatus } from '@/hooks/useAIReviewStatus';

interface ExtensionWebsiteData {
  url: string;
  domain: string;
  title: string;
  seo: {
    titleTag: string;
    metaDescription: string;
    metaKeywords: string;
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
    };
    altTags: {
      total: number;
      withAlt: number;
      images: Array<{
        src: string;
        alt: string;
        hasAlt: boolean;
      }>;
    };
  };
  content: {
    fullText: string;
    wordCount: number;
    links: {
      internal: Array<{ href: string; text: string; title: string }>;
      external: Array<{ href: string; text: string; title: string }>;
    };
  };
  technical: {
    hasImprint: boolean;
    hasPrivacyPolicy: boolean;
    hasContactForm: boolean;
    structuredData: any[];
  };
  performance: {
    imageCount: number;
    scriptCount: number;
    cssCount: number;
    resourcesWithoutAlt: number;
  };
  contact: {
    phone: string[];
    email: string[];
    address: string[];
  };
  extractedAt: string;
}

interface AnalysisContextType {
  currentAnalysis: SavedAnalysis | null;
  setCurrentAnalysis: (analysis: SavedAnalysis | null) => void;
  clearAnalysis: () => void;
  reviewStatus: AIReviewStatus;
  updateReviewStatus: (category: string, isReviewed: boolean, notes?: string) => Promise<AIReviewStatus>;
  isFullyReviewed: () => boolean;
  getUnreviewedCategories: () => string[];
  savedExtensionData: ExtensionWebsiteData | null;
  setSavedExtensionData: (data: ExtensionWebsiteData | null) => void;
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
  const [savedExtensionData, setSavedExtensionData] = useState<ExtensionWebsiteData | null>(null);
  
  // Only clear extension data when explicitly switching between different saved analyses
  React.useEffect(() => {
    console.log('📊 Current analysis changed:', currentAnalysis?.id);
    // Don't clear extension data just because no analysis is loaded
    // Extension data should persist independently
  }, [currentAnalysis]);
  
  // AI Review Status für KI-VO Compliance
  const {
    reviewStatus,
    updateReviewStatus,
    isFullyReviewed,
    getUnreviewedCategories,
    initializeCategories
  } = useAIReviewStatus(currentAnalysis?.id);
  
  // Initialize AI review categories - IMMER, auch ohne gespeicherte Analyse
  React.useEffect(() => {
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
  }, [initializeCategories]);

  const clearAnalysis = () => {
    setCurrentAnalysis(null);
    setSavedExtensionData(null);
    console.log('🧹 Analysis and extension data cleared');
  };

  return (
    <AnalysisContext.Provider value={{
      currentAnalysis,
      setCurrentAnalysis,
      clearAnalysis,
      reviewStatus,
      updateReviewStatus,
      isFullyReviewed,
      getUnreviewedCategories,
      savedExtensionData,
      setSavedExtensionData
    }}>
      {children}
    </AnalysisContext.Provider>
  );
};