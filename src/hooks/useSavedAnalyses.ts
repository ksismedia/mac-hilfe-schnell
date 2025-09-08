
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualImprintData, ManualSocialData, ManualWorkplaceData, ManualCompetitor, CompetitorServices, CompanyServices, ManualCorporateIdentityData, StaffQualificationData, HourlyRateData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData } from './useManualData';

export interface SavedAnalysis {
  id: string;
  name: string;
  savedAt: string;
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung';
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
    staffQualificationData?: StaffQualificationData;
    hourlyRateData?: HourlyRateData;
    quoteResponseData?: QuoteResponseData;
    manualContentData?: ManualContentData;
    manualAccessibilityData?: ManualAccessibilityData;
    manualBacklinkData?: ManualBacklinkData;
    privacyData?: any; // Datenschutz-Analysedaten
    accessibilityData?: any; // Barrierefreiheits-Analysedaten
  };
}

const STORAGE_KEY = 'saved_analyses';

export const useSavedAnalyses = () => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [user, setUser] = useState<any>(null);

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Lade gespeicherte Analysen beim Start
  useEffect(() => {
    console.log('useSavedAnalyses: User state changed:', user?.id || 'no user');
    
    if (user) {
      console.log('User authenticated, loading from database');
      loadAnalysesFromDatabase();
    } else {
      console.log('No user, loading from localStorage');
      
      // Test: Erstelle eine Demo-Analyse wenn keine vorhanden
      const existingData = localStorage.getItem(STORAGE_KEY);
      if (!existingData || existingData === 'null') {
        console.log('Creating demo analysis for testing...');
        const demoAnalysis = {
          id: 'demo-123',
          name: 'Demo Analyse',
          savedAt: new Date().toISOString(),
          businessData: {
            address: 'Musterstraße 1, Berlin',
            url: 'https://example.com',
            industry: 'shk' as const
          },
          realData: {
            keywords: [],
            seo: { score: 75 },
            social: { facebook: { found: false }, instagram: { found: false } },
            workplace: { glassdoor: { found: false }, kununu: { found: false } },
            performance: { score: 80 },
            accessibility: { score: 70 },
            reviews: { google: { found: false, count: 0, rating: 0 } }
          },
          manualData: {}
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([demoAnalysis]));
        console.log('Demo analysis created');
      }
      
      // Kurze Verzögerung für localStorage-Initialisierung
      setTimeout(() => {
        loadAnalysesFromLocalStorage();
      }, 100);
    }
  }, [user]);

  const loadAnalysesFromDatabase = async () => {
    try {
      console.log('Loading analyses from database for user:', user?.id);
      
      if (!user) {
        console.log('No user found, skipping database load');
        return;
      }

      const { data, error } = await supabase
        .from('saved_analyses')
        .select('*')
        .order('saved_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Database query successful, data:', data);

      const analyses: SavedAnalysis[] = data.map(item => ({
        id: item.id,
        name: item.name,
        savedAt: item.saved_at,
        businessData: item.business_data as SavedAnalysis['businessData'],
        realData: item.real_data as unknown as RealBusinessData,
        manualData: item.manual_data as unknown as SavedAnalysis['manualData']
      }));

      console.log('Mapped analyses:', analyses);
      setSavedAnalyses(analyses);
    } catch (error) {
      console.error('Fehler beim Laden der Analysen aus der Datenbank:', error);
      // Fallback auf localStorage
      loadAnalysesFromLocalStorage();
    }
  };

  const loadAnalysesFromLocalStorage = () => {
    try {
      console.log('Loading analyses from localStorage...');
      
      // Teste localStorage direkt
      const keys = Object.keys(localStorage);
      console.log('All localStorage keys:', keys);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('Raw localStorage data for key "saved_analyses":', stored);
      
      if (stored && stored !== 'null' && stored !== 'undefined') {
        const analyses = JSON.parse(stored);
        console.log('Parsed analyses from localStorage:', analyses);
        
        if (Array.isArray(analyses) && analyses.length > 0) {
          console.log('Setting analyses state with', analyses.length, 'analyses');
          setSavedAnalyses(analyses);
        } else {
          console.log('Empty or invalid analyses array in localStorage');
          setSavedAnalyses([]);
        }
      } else {
        console.log('No valid stored analyses found in localStorage');
        // Teste ob es andere Keys mit Analysen gibt
        const alternativeKeys = keys.filter(key => key.includes('analys') || key.includes('saved'));
        console.log('Alternative analysis keys found:', alternativeKeys);
        setSavedAnalyses([]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der gespeicherten Analysen:', error);
      localStorage.removeItem(STORAGE_KEY);
      setSavedAnalyses([]);
    }
  };

  // Speichere eine Analyse
  const saveAnalysis = useCallback(async (
    name: string,
    businessData: SavedAnalysis['businessData'],
    realData: RealBusinessData,
    manualData: SavedAnalysis['manualData']
  ) => {
    if (user) {
      // Speichere in Datenbank
      try {
        const { data, error } = await supabase
          .from('saved_analyses')
          .insert({
            name,
            business_data: businessData as any,
            real_data: realData as any,
            manual_data: manualData as any,
            user_id: user.id
          })
          .select()
          .single();

        if (error) throw error;

        const newAnalysis: SavedAnalysis = {
          id: data.id,
          name: data.name,
          savedAt: data.saved_at,
          businessData: data.business_data as SavedAnalysis['businessData'],
          realData: data.real_data as unknown as RealBusinessData,
          manualData: data.manual_data as unknown as SavedAnalysis['manualData']
        };

        setSavedAnalyses(prev => [...prev, newAnalysis]);
        return newAnalysis.id;
      } catch (error) {
        console.error('Fehler beim Speichern in der Datenbank:', error);
        throw error;
      }
    } else {
      // Fallback auf localStorage
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
    }
  }, [savedAnalyses, user]);

  // Aktualisiere eine bestehende Analyse
  const updateAnalysis = useCallback(async (
    id: string,
    name: string,
    businessData: SavedAnalysis['businessData'],
    realData: RealBusinessData,
    manualData: SavedAnalysis['manualData']
  ) => {
    if (user) {
      // Aktualisiere in Datenbank
      try {
        const { error } = await supabase
          .from('saved_analyses')
          .update({
            name,
            business_data: businessData as any,
            real_data: realData as any,
            manual_data: manualData as any
          })
          .eq('id', id);

        if (error) throw error;

        setSavedAnalyses(prev => prev.map(analysis => 
          analysis.id === id 
            ? { ...analysis, name, businessData, realData, manualData, savedAt: new Date().toISOString() }
            : analysis
        ));
      } catch (error) {
        console.error('Fehler beim Aktualisieren in der Datenbank:', error);
        throw error;
      }
    } else {
      // Fallback auf localStorage
      const updatedAnalyses = savedAnalyses.map(analysis => 
        analysis.id === id 
          ? { ...analysis, name, businessData, realData, manualData, savedAt: new Date().toISOString() }
          : analysis
      );
      
      setSavedAnalyses(updatedAnalyses);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
    }
  }, [savedAnalyses, user]);

  // Lösche eine Analyse
  const deleteAnalysis = useCallback(async (id: string) => {
    if (user) {
      // Lösche aus Datenbank
      try {
        const { error } = await supabase
          .from('saved_analyses')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      } catch (error) {
        console.error('Fehler beim Löschen aus der Datenbank:', error);
        throw error;
      }
    } else {
      // Fallback auf localStorage
      const updatedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
      setSavedAnalyses(updatedAnalyses);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
    }
  }, [savedAnalyses, user]);

  // Lade eine Analyse
  const loadAnalysis = useCallback((id: string): SavedAnalysis | null => {
    console.log('Loading analysis with ID:', id);
    console.log('Available analyses:', savedAnalyses.map(a => ({ id: a.id, name: a.name })));
    
    const found = savedAnalyses.find(analysis => analysis.id === id) || null;
    console.log('Found analysis:', found ? found.name : 'Not found');
    
    return found;
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
    exportAnalysis,
    user
  };
};
