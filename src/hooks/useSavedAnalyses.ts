import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealBusinessData } from '@/services/BusinessAnalysisService';
import { ManualImprintData, ManualSocialData, ManualWorkplaceData, ManualCompetitor, CompetitorServices, CompanyServices, ManualCorporateIdentityData, StaffQualificationData, HourlyRateData, QuoteResponseData, ManualContentData, ManualAccessibilityData, ManualBacklinkData, ManualDataPrivacyData, ManualLocalSEOData, ManualIndustryReviewData, ManualOnlinePresenceData, ManualConversionData, ManualMobileData, ManualReputationData, ManualSEOData } from './useManualData';
import { AuditLogService } from '@/services/AuditLogService';

export interface SavedAnalysis {
  id: string;
  name: string;
  savedAt: string;
  deletedAt?: string | null;
  businessData: {
    address: string;
    url: string;
    industry: 'shk' | 'maler' | 'elektriker' | 'dachdecker' | 'stukateur' | 'planungsbuero' | 'facility-management' | 'holzverarbeitung' | 'baeckerei' | 'blechbearbeitung';
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
    manualDataPrivacyData?: ManualDataPrivacyData;
    manualLocalSEOData?: ManualLocalSEOData;
    manualIndustryReviewData?: ManualIndustryReviewData;
    manualOnlinePresenceData?: ManualOnlinePresenceData;
    manualConversionData?: ManualConversionData;
    manualMobileData?: ManualMobileData;
    manualReputationData?: ManualReputationData;
    manualSEOData?: ManualSEOData;
    privacyData?: any;
    accessibilityData?: any;
    securityData?: any;
    extensionData?: any;
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
    overallScore: 0  // Kein Dummy-Score - nur echte Daten zählen
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
    overallScore: 0  // Kein Dummy-Score - nur echte Daten zählen
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
  const [trashedAnalyses, setTrashedAnalyses] = useState<SavedAnalysis[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state management
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'User:', session?.user?.id || 'anonymous');
      setUser(session?.user ?? null);
    });

    // Get initial session immediately
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

      const allAnalyses: SavedAnalysis[] = data.map(item => ({
        id: item.id,
        name: item.name,
        savedAt: item.saved_at,
        deletedAt: item.deleted_at,
        businessData: item.business_data as SavedAnalysis['businessData'],
        realData: { ...createDefaultRealData(), ...(item.real_data as any) },
        manualData: { competitors: [], competitorServices: {}, removedMissingServices: [], ...(item.manual_data as any) }
      }));

      // Split into active and trashed
      const active = allAnalyses.filter(a => !a.deletedAt);
      const trashed = allAnalyses.filter(a => a.deletedAt);

      console.log(`Loaded ${active.length} active and ${trashed.length} trashed analyses from database`);
      
      // Check if we need to migrate localStorage analyses
      await migrateLocalStorageAnalyses(active);
      
      setSavedAnalyses(active);
      setTrashedAnalyses(trashed);
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
        
        console.log(`Migration completed. Now have ${updatedAnalyses.length} analyses in database`);
        
        // Update state immediately with the complete list including migrated analyses
        setSavedAnalyses(updatedAnalyses);
      } else {
        console.error('Failed to reload after migration:', reloadError);
        // Fallback: at least set the original analyses
        setSavedAnalyses(currentDbAnalyses);
      }

    } catch (error) {
      console.error('Migration error:', error);
    }
  };

  const loadAnalysesFromLocalStorage = () => {
    try {
      console.log('Loading from localStorage...');
      console.log('STORAGE_KEY:', STORAGE_KEY);
      
      const stored = localStorage.getItem(STORAGE_KEY);
      console.log('Raw localStorage value:', stored);
      console.log('Value type:', typeof stored);
      console.log('Value length:', stored?.length);
      
      if (stored && stored !== 'null' && stored !== 'undefined') {
        console.log('Valid stored data found, parsing...');
        const parsed = JSON.parse(stored);
        console.log('Parsed data:', parsed);
        console.log('Is array:', Array.isArray(parsed));
        
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
          console.log('Analyses:', analyses.map(a => ({ id: a.id, name: a.name })));
          setSavedAnalyses(analyses);
          return;
        } else {
          console.warn('Parsed data is not an array:', typeof parsed);
        }
      } else {
        console.log('No valid data in localStorage');
        console.log('stored === null:', stored === null);
        console.log('stored === "null":', stored === 'null');
        console.log('stored === "undefined":', stored === 'undefined');
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

    console.log('=== SAVE ANALYSIS TO DATABASE ===');
    console.log('User logged in:', !!user, 'User ID:', user?.id);
    console.log('Analysis name:', name);
    
    if (user) {
      try {
        console.log('Inserting into Supabase database...');
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

        console.log('Database insert result:', { data, error });
        if (error) {
          console.error('Database insert error:', error);
          throw error;
        }

        const newAnalysis: SavedAnalysis = {
          id: data.id,
          name: data.name,
          savedAt: data.saved_at,
          businessData: data.business_data as SavedAnalysis['businessData'],
          realData: completeRealData,
          manualData: completeManualData
        };

        setSavedAnalyses(prev => [newAnalysis, ...prev]);
        
        // Audit log
        await AuditLogService.log({
          action: 'create',
          resourceType: 'analysis',
          resourceId: newAnalysis.id,
          resourceName: name,
          details: { businessData }
        });
        
        return newAnalysis.id;
      } catch (error) {
        console.error('Database save error:', error);
        throw error;
      }
    } else {
      console.log('Saving analysis to localStorage (anonymous user)...');
      const newAnalysis: SavedAnalysis = {
        id: crypto.randomUUID(),
        name,
        savedAt: new Date().toISOString(),
        businessData,
        realData: completeRealData,
        manualData: completeManualData
      };

      console.log('New analysis created:', { id: newAnalysis.id, name: newAnalysis.name });
      
      const updatedAnalyses = [newAnalysis, ...savedAnalyses];
      console.log('Updated analyses array length:', updatedAnalyses.length);
      
      const jsonString = JSON.stringify(updatedAnalyses);
      console.log('JSON string length:', jsonString.length);
      
      localStorage.setItem(STORAGE_KEY, jsonString);
      console.log('Saved to localStorage with key:', STORAGE_KEY);
      
      // Verify it was saved
      const verification = localStorage.getItem(STORAGE_KEY);
      console.log('Verification - data in localStorage:', verification ? 'exists' : 'MISSING!');
      console.log('Verification - length:', verification?.length);
      
      setSavedAnalyses(updatedAnalyses);
      console.log('State updated with', updatedAnalyses.length, 'analyses');
      
      // Audit log
      await AuditLogService.log({
        action: 'create',
        resourceType: 'analysis',
        resourceId: newAnalysis.id,
        resourceName: name,
        details: { businessData }
      });
      
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
        
        // Audit log
        await AuditLogService.log({
          action: 'update',
          resourceType: 'analysis',
          resourceId: id,
          resourceName: name
        });
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

  // Soft-delete: Move to trash
  const deleteAnalysis = useCallback(async (id: string) => {
    const deletedAt = new Date().toISOString();
    
    if (user) {
      try {
        const { error } = await supabase
          .from('saved_analyses')
          .update({ deleted_at: deletedAt })
          .eq('id', id);

        if (error) throw error;

        // Move from active to trashed
        const analysis = savedAnalyses.find(a => a.id === id);
        if (analysis) {
          setSavedAnalyses(prev => prev.filter(a => a.id !== id));
          setTrashedAnalyses(prev => [{ ...analysis, deletedAt }, ...prev]);
        }
        
        // Audit log
        await AuditLogService.log({
          action: 'soft_delete',
          resourceType: 'analysis',
          resourceId: id
        });
      } catch (error) {
        console.error('Database soft-delete error:', error);
        throw error;
      }
    } else {
      // For localStorage, also support soft-delete
      const analysis = savedAnalyses.find(a => a.id === id);
      if (analysis) {
        const trashedAnalysis = { ...analysis, deletedAt };
        setSavedAnalyses(prev => prev.filter(a => a.id !== id));
        setTrashedAnalyses(prev => [trashedAnalysis, ...prev]);
        
        // Update localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const allAnalyses = JSON.parse(stored);
          const updated = allAnalyses.map((a: any) => 
            a.id === id ? { ...a, deletedAt } : a
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      }
    }
  }, [savedAnalyses, user]);

  // Restore from trash
  const restoreAnalysis = useCallback(async (id: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('saved_analyses')
          .update({ deleted_at: null })
          .eq('id', id);

        if (error) throw error;

        // Move from trashed to active
        const analysis = trashedAnalyses.find(a => a.id === id);
        if (analysis) {
          setTrashedAnalyses(prev => prev.filter(a => a.id !== id));
          setSavedAnalyses(prev => [{ ...analysis, deletedAt: null }, ...prev]);
        }
        
        // Audit log
        await AuditLogService.log({
          action: 'restore',
          resourceType: 'analysis',
          resourceId: id
        });
      } catch (error) {
        console.error('Database restore error:', error);
        throw error;
      }
    } else {
      const analysis = trashedAnalyses.find(a => a.id === id);
      if (analysis) {
        const restoredAnalysis = { ...analysis, deletedAt: null };
        setTrashedAnalyses(prev => prev.filter(a => a.id !== id));
        setSavedAnalyses(prev => [restoredAnalysis, ...prev]);
        
        // Update localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const allAnalyses = JSON.parse(stored);
          const updated = allAnalyses.map((a: any) => 
            a.id === id ? { ...a, deletedAt: null } : a
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
      }
    }
  }, [trashedAnalyses, user]);

  // Permanent delete
  const permanentlyDeleteAnalysis = useCallback(async (id: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('saved_analyses')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setTrashedAnalyses(prev => prev.filter(a => a.id !== id));
        
        // Audit log
        await AuditLogService.log({
          action: 'permanent_delete',
          resourceType: 'analysis',
          resourceId: id
        });
      } catch (error) {
        console.error('Database permanent delete error:', error);
        throw error;
      }
    } else {
      setTrashedAnalyses(prev => prev.filter(a => a.id !== id));
      
      // Update localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allAnalyses = JSON.parse(stored);
        const updated = allAnalyses.filter((a: any) => a.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
    }
  }, [user]);

  // Empty trash (permanently delete all trashed)
  const emptyTrash = useCallback(async () => {
    if (user) {
      try {
        const { error } = await supabase
          .from('saved_analyses')
          .delete()
          .not('deleted_at', 'is', null);

        if (error) throw error;

        const count = trashedAnalyses.length;
        setTrashedAnalyses([]);
        
        // Audit log
        await AuditLogService.log({
          action: 'empty_trash',
          resourceType: 'analysis',
          details: { count }
        });
      } catch (error) {
        console.error('Database empty trash error:', error);
        throw error;
      }
    } else {
      // Update localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const allAnalyses = JSON.parse(stored);
        const updated = allAnalyses.filter((a: any) => !a.deletedAt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      setTrashedAnalyses([]);
    }
  }, [trashedAnalyses, user]);

  const loadAnalysis = useCallback((id: string): SavedAnalysis | null => {
    console.log('🔍 Loading analysis with ID:', id);
    
    // FIRST: Always check localStorage directly - most reliable
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && stored !== 'null' && stored !== 'undefined') {
        const localAnalyses = JSON.parse(stored);
        if (Array.isArray(localAnalyses)) {
          const localFound = localAnalyses.find((analysis: any) => analysis.id === id);
          if (localFound) {
            console.log('Found analysis in localStorage:', localFound.name);
            console.log('📍 LocalSEO data in localStorage:', localFound.manualData?.manualLocalSEOData);
            console.log('📍 Directories in localStorage:', localFound.manualData?.manualLocalSEOData?.directories);
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
            return completeAnalysis;
          }
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    
    // SECOND: Check in current savedAnalyses (database)
    const found = savedAnalyses.find(analysis => analysis.id === id);
    if (found) {
      console.log('Found analysis in savedAnalyses (database):', found.name);
      console.log('📍 LocalSEO data in database:', found.manualData?.manualLocalSEOData);
      console.log('📍 Directories in database:', found.manualData?.manualLocalSEOData?.directories);
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
      console.log('📍 Complete analysis manualData:', completeAnalysis.manualData);
      console.log('📍 Complete analysis LocalSEO:', completeAnalysis.manualData?.manualLocalSEOData);
      return completeAnalysis;
    }
    
    console.log('Analysis not found');
    return null;
  }, [savedAnalyses]);

  // Helper function to save localStorage analysis to database
  const saveAnalysisToDatabase = async (analysis: SavedAnalysis) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('saved_analyses')
        .upsert({
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
        console.log('Successfully saved analysis to database:', analysis.name);
        // Reload analyses after successful save
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
    trashedAnalyses,
    saveAnalysis,
    updateAnalysis,
    deleteAnalysis,
    restoreAnalysis,
    permanentlyDeleteAnalysis,
    emptyTrash,
    loadAnalysis,
    exportAnalysis,
    user,
    isLoading
  };
};