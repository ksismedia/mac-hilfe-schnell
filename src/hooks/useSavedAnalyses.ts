
import { useState, useCallback, useEffect } from 'react';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualImprintData, ManualSocialData, ManualWorkplaceData, ManualCompetitor, CompetitorServices, CompanyServices, ManualCorporateIdentityData } from './useManualData';

export interface SavedAnalysis {
  id: string;
  name: string;
  savedAt: string;
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management';
  };
  realData: RealBusinessData;
  manualData: {
    imprint?: ManualImprintData;
    social?: ManualSocialData;
    workplace?: ManualWorkplaceData;
    corporateIdentity?: ManualCorporateIdentityData;
    competitors: ManualCompetitor[];
    competitorServices: CompetitorServices;
    removedMissingServices: string[];
    deletedCompetitors?: string[];
    keywordData?: Array<{ keyword: string; found: boolean; volume: number; position: number }>;
    keywordScore?: number;
    companyServices?: CompanyServices;
    privacyData?: any; // Datenschutz-Analysedaten
    accessibilityData?: any; // Barrierefreiheits-Analysedaten
  };
}

const STORAGE_KEY = 'saved_analyses';

export const useSavedAnalyses = () => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  // Lade gespeicherte Analysen beim Start
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const analyses = JSON.parse(stored);
        if (Array.isArray(analyses)) {
          setSavedAnalyses(analyses);
        } else {
          console.error('Gespeicherte Analysen sind kein Array:', analyses);
          setSavedAnalyses([]);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Analysen:', error);
      // Clear corrupt data
      localStorage.removeItem(STORAGE_KEY);
      setSavedAnalyses([]);
    }
  }, []);

  // Speichere eine Analyse
  const saveAnalysis = useCallback((
    name: string,
    businessData: SavedAnalysis['businessData'],
    realData: RealBusinessData,
    manualData: SavedAnalysis['manualData']
  ) => {
    const newAnalysis: SavedAnalysis = {
      id: Date.now().toString(),
      name,
      savedAt: new Date().toISOString(),
      businessData,
      realData,
      manualData
    };

    const updatedAnalyses = [...savedAnalyses, newAnalysis];
    setSavedAnalyses(updatedAnalyses);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
    
    return newAnalysis.id;
  }, [savedAnalyses]);

  // Aktualisiere eine bestehende Analyse
  const updateAnalysis = useCallback((
    id: string,
    name: string,
    businessData: SavedAnalysis['businessData'],
    realData: RealBusinessData,
    manualData: SavedAnalysis['manualData']
  ) => {
    const updatedAnalyses = savedAnalyses.map(analysis => 
      analysis.id === id 
        ? { ...analysis, name, businessData, realData, manualData, savedAt: new Date().toISOString() }
        : analysis
    );
    
    setSavedAnalyses(updatedAnalyses);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
  }, [savedAnalyses]);

  // Lösche eine Analyse
  const deleteAnalysis = useCallback((id: string) => {
    const updatedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
    setSavedAnalyses(updatedAnalyses);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
  }, [savedAnalyses]);

  // Lade eine Analyse
  const loadAnalysis = useCallback((id: string): SavedAnalysis | null => {
    return savedAnalyses.find(analysis => analysis.id === id) || null;
  }, [savedAnalyses]);

  // Exportiere eine Analyse als JSON
  const exportAnalysis = useCallback((id: string) => {
    const analysis = loadAnalysis(id);
    if (!analysis) return;

    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${analysis.name}_${analysis.savedAt.split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }, [loadAnalysis]);

  return {
    savedAnalyses,
    saveAnalysis,
    updateAnalysis,
    deleteAnalysis,
    loadAnalysis,
    exportAnalysis
  };
};
