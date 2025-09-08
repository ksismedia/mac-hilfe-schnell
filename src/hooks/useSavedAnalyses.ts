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
    privacyData?: any;
    accessibilityData?: any;
  };
}

const STORAGE_KEY = 'saved_analyses';

// Vollständige Default-RealData-Struktur basierend auf der tatsächlichen Interface
const createDefaultRealData = (): RealBusinessData => ({
  company: {
    name: 'Demo Unternehmen',
    address: 'Musterstraße 1, 12345 Berlin',
    url: 'https://example.com',
    industry: 'shk',
    phone: '',
    email: ''
  },
  seo: {
    titleTag: 'Demo Titel',
    metaDescription: 'Demo Beschreibung',
    headings: { h1: [], h2: [], h3: [] },
    altTags: { total: 0, withAlt: 0 },
    score: 75
  },
  performance: {
    loadTime: 2.5,
    lcp: 2.0,
    fid: 100,
    cls: 0.1,
    score: 80
  },
  reviews: {
    google: {
      rating: 0,
      count: 0,
      recent: []
    }
  },
  competitors: [],
  keywords: [],
  imprint: {
    found: true,
    completeness: 80,
    missingElements: [],
    foundElements: [],
    score: 80
  },
  socialMedia: {
    facebook: {
      found: false,
      followers: 0,
      lastPost: '',
      engagement: ''
    },
    instagram: {
      found: false,
      followers: 0,
      lastPost: '',
      engagement: ''
    },
    overallScore: 65
  },
  workplace: {
    kununu: {
      found: false,
      rating: 0,
      reviews: 0
    },
    glassdoor: {
      found: false,
      rating: 0,
      reviews: 0
    },
    overallScore: 0
  },
  socialProof: {
    testimonials: 0,
    certifications: [],
    awards: [],
    overallScore: 65
  },
  mobile: {
    responsive: true,
    touchFriendly: true,
    pageSpeedMobile: 75,
    pageSpeedDesktop: 80,
    overallScore: 85,
    issues: []
  }
});

export const useSavedAnalyses = () => {
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'User:', session?.user?.id || 'anonymous');
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session loaded. User:', session?.user?.id || 'anonymous');
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load analyses when user state changes
  useEffect(() => {
    const loadAnalyses = async () => {
      setIsLoading(true);
      console.log('Loading analyses for user:', user?.id || 'anonymous');
      
      if (user) {
        await loadAnalysesFromDatabase();
      } else {
        loadAnalysesFromLocalStorage();
      }
      
      setIsLoading(false);
    };

    loadAnalyses();
  }, [user]);

  const loadAnalysesFromDatabase = async () => {
    try {
      console.log('Loading from Supabase database...');
      
      const { data, error } = await supabase
        .from('saved_analyses')
        .select('*')
        .order('saved_at', { ascending: false });

      if (error) throw error;

      const analyses: SavedAnalysis[] = data.map(item => ({
        id: item.id,
        name: item.name,
        savedAt: item.saved_at,
        businessData: item.business_data as SavedAnalysis['businessData'],
        realData: { ...createDefaultRealData(), ...(item.real_data as any) },
        manualData: { competitors: [], competitorServices: {}, removedMissingServices: [], ...(item.manual_data as any) }
      }));

      console.log(`Loaded ${analyses.length} analyses from database`);
      
      // Check if we need to migrate localStorage analyses
      await migrateLocalStorageAnalyses(analyses);
      
      setSavedAnalyses(analyses);
    } catch (error) {
      console.error('Database error:', error);
      loadAnalysesFromLocalStorage();
    }
  };

  const migrateLocalStorageAnalyses = async (currentDbAnalyses: SavedAnalysis[]) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored || stored === 'null' || stored === 'undefined') return;

      const localAnalyses = JSON.parse(stored);
      if (!Array.isArray(localAnalyses) || localAnalyses.length === 0) return;

      console.log(`Found ${localAnalyses.length} localStorage analyses to potentially migrate`);

      // Find analyses that are in localStorage but not in database
      const dbIds = new Set(currentDbAnalyses.map(a => a.id));
      const analysesToMigrate = localAnalyses.filter((local: any) => !dbIds.has(local.id));

      if (analysesToMigrate.length === 0) {
        console.log('No new analyses to migrate');
        return;
      }

      console.log(`Migrating ${analysesToMigrate.length} analyses to database`);

      // Migrate each analysis
      for (const analysis of analysesToMigrate) {
        const completeRealData = { ...createDefaultRealData(), ...analysis.realData };
        const completeManualData = { 
          competitors: [], 
          competitorServices: {}, 
          removedMissingServices: [], 
          ...analysis.manualData 
        };

        const { error } = await supabase
          .from('saved_analyses')
          .insert({
            id: analysis.id, // Keep the original ID
            name: analysis.name,
            business_data: analysis.businessData as any,
            real_data: completeRealData as any,
            manual_data: completeManualData as any,
            user_id: user?.id,
            saved_at: analysis.savedAt
          });

        if (error) {
          console.error('Migration error for analysis:', analysis.name, error);
        } else {
          console.log('Successfully migrated analysis:', analysis.name);
        }
      }

      // Reload analyses after migration
      const { data: updatedData, error: reloadError } = await supabase
        .from('saved_analyses')
        .select('*')
        .order('saved_at', { ascending: false });

      if (!reloadError && updatedData) {
        const updatedAnalyses: SavedAnalysis[] = updatedData.map(item => ({
          id: item.id,
          name: item.name,
          savedAt: item.saved_at,
          businessData: item.business_data as SavedAnalysis['businessData'],
          realData: { ...createDefaultRealData(), ...(item.real_data as any) },
          manualData: { competitors: [], competitorServices: {}, removedMissingServices: [], ...(item.manual_data as any) }
        }));
        
        setSavedAnalyses(updatedAnalyses);
        console.log(`Migration completed. Now have ${updatedAnalyses.length} analyses in database`);
      }

    } catch (error) {
      console.error('Migration error:', error);
    }
  };

  const loadAnalysesFromLocalStorage = () => {
    try {
      console.log('Loading from localStorage...');
      
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored && stored !== 'null' && stored !== 'undefined') {
        const parsed = JSON.parse(stored);
        
        if (Array.isArray(parsed)) {
          // Ensure all analyses have complete data structures
          const analyses = parsed.map(analysis => ({
            ...analysis,
            realData: { ...createDefaultRealData(), ...analysis.realData },
            manualData: { 
              competitors: [], 
              competitorServices: {}, 
              removedMissingServices: [], 
              ...analysis.manualData 
            }
          }));
          
          console.log(`Loaded ${analyses.length} analyses from localStorage`);
          setSavedAnalyses(analyses);
          return;
        }
      }
      
      // Nur leeres Array setzen - keine Demo-Analyse erstellen
      console.log('No existing data found, setting empty array');
      setSavedAnalyses([]);
      
    } catch (error) {
      console.error('localStorage error:', error);
      setSavedAnalyses([]);
    }
  };

  const saveAnalysis = useCallback(async (
    name: string,
    businessData: SavedAnalysis['businessData'],
    realData: RealBusinessData,
    manualData: SavedAnalysis['manualData']
  ) => {
    const completeRealData = { ...createDefaultRealData(), ...realData };
    const completeManualData = { 
      competitors: [], 
      competitorServices: {}, 
      removedMissingServices: [], 
      ...manualData 
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('saved_analyses')
          .insert({
            name,
            business_data: businessData as any,
            real_data: completeRealData as any,
            manual_data: completeManualData as any,
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
          realData: completeRealData,
          manualData: completeManualData
        };

        setSavedAnalyses(prev => [newAnalysis, ...prev]);
        return newAnalysis.id;
      } catch (error) {
        console.error('Database save error:', error);
        throw error;
      }
    } else {
      const newAnalysis: SavedAnalysis = {
        id: Date.now().toString(),
        name,
        savedAt: new Date().toISOString(),
        businessData,
        realData: completeRealData,
        manualData: completeManualData
      };

      const updatedAnalyses = [newAnalysis, ...savedAnalyses];
      setSavedAnalyses(updatedAnalyses);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
      
      return newAnalysis.id;
    }
  }, [savedAnalyses, user]);

  const updateAnalysis = useCallback(async (
    id: string,
    name: string,
    businessData: SavedAnalysis['businessData'],
    realData: RealBusinessData,
    manualData: SavedAnalysis['manualData']
  ) => {
    const completeRealData = { ...createDefaultRealData(), ...realData };
    const completeManualData = { 
      competitors: [], 
      competitorServices: {}, 
      removedMissingServices: [], 
      ...manualData 
    };

    if (user) {
      try {
        const { error } = await supabase
          .from('saved_analyses')
          .update({
            name,
            business_data: businessData as any,
            real_data: completeRealData as any,
            manual_data: completeManualData as any
          })
          .eq('id', id);

        if (error) throw error;

        setSavedAnalyses(prev => prev.map(analysis => 
          analysis.id === id 
            ? { ...analysis, name, businessData, realData: completeRealData, manualData: completeManualData, savedAt: new Date().toISOString() }
            : analysis
        ));
      } catch (error) {
        console.error('Database update error:', error);
        throw error;
      }
    } else {
      const updatedAnalyses = savedAnalyses.map(analysis => 
        analysis.id === id 
          ? { ...analysis, name, businessData, realData: completeRealData, manualData: completeManualData, savedAt: new Date().toISOString() }
          : analysis
      );
      
      setSavedAnalyses(updatedAnalyses);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
    }
  }, [savedAnalyses, user]);

  const deleteAnalysis = useCallback(async (id: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('saved_analyses')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setSavedAnalyses(prev => prev.filter(analysis => analysis.id !== id));
      } catch (error) {
        console.error('Database delete error:', error);
        throw error;
      }
    } else {
      const updatedAnalyses = savedAnalyses.filter(analysis => analysis.id !== id);
      setSavedAnalyses(updatedAnalyses);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAnalyses));
    }
  }, [savedAnalyses, user]);

  const loadAnalysis = useCallback((id: string): SavedAnalysis | null => {
    console.log('Loading analysis with ID:', id);
    const found = savedAnalyses.find(analysis => analysis.id === id) || null;
    
    if (found) {
      // Ensure complete data structure
      const completeAnalysis = {
        ...found,
        realData: { ...createDefaultRealData(), ...found.realData },
        manualData: { 
          competitors: [], 
          competitorServices: {}, 
          removedMissingServices: [], 
          ...found.manualData 
        }
      };
      console.log('Found and completed analysis:', completeAnalysis.name);
      return completeAnalysis;
    }
    
    // Fallback: Try to load from localStorage regardless of user status
    try {
      console.log('Analysis not found in current list, checking localStorage...');
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored !== 'null' && stored !== 'undefined') {
        const localAnalyses = JSON.parse(stored);
        if (Array.isArray(localAnalyses)) {
          const localFound = localAnalyses.find((analysis: any) => analysis.id === id);
          if (localFound) {
            console.log('Found analysis in localStorage:', localFound.name);
            const completeAnalysis = {
              ...localFound,
              realData: { ...createDefaultRealData(), ...localFound.realData },
              manualData: { 
                competitors: [], 
                competitorServices: {}, 
                removedMissingServices: [], 
                ...localFound.manualData 
              }
            };
            
            // If user is logged in, try to save this analysis to database
            if (user) {
              console.log('User is logged in, attempting to save localStorage analysis to database...');
              saveAnalysisToDatabase(completeAnalysis).catch(error => 
                console.error('Failed to save localStorage analysis to database:', error)
              );
            }
            
            return completeAnalysis;
          }
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    console.log('Analysis not found in database or localStorage');
    return null;
  }, [savedAnalyses, user]);

  // Helper function to save localStorage analysis to database
  const saveAnalysisToDatabase = async (analysis: SavedAnalysis) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('saved_analyses')
        .insert({
          id: analysis.id,
          name: analysis.name,
          business_data: analysis.businessData as any,
          real_data: analysis.realData as any,
          manual_data: analysis.manualData as any,
          user_id: user.id,
          saved_at: analysis.savedAt
        });

      if (error) {
        console.error('Error saving to database:', error);
      } else {
        console.log('Successfully saved localStorage analysis to database:', analysis.name);
        // Reload analyses to include the newly saved one
        loadAnalysesFromDatabase();
      }
    } catch (error) {
      console.error('Database save error:', error);
    }
  };

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
    user,
    isLoading
  };
};