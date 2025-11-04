import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIReviewStatus {
  [category: string]: {
    isReviewed: boolean;
    reviewedAt?: string;
    reviewerEmail?: string;
    reviewNotes?: string;
  };
}

export const useAIReviewStatus = (analysisId?: string) => {
  const [reviewStatus, setReviewStatus] = useState<AIReviewStatus>({});
  const { toast } = useToast();

  // Load review status from DB when analysisId changes
  useEffect(() => {
    const loadReviewStatus = async () => {
      if (!analysisId) return;

      const { data, error } = await supabase
        .from('ai_review_status')
        .select('*')
        .eq('analysis_id', analysisId);

      if (error) {
        console.error('Error loading review status:', error);
        return;
      }

      if (data) {
        const loadedStatus: AIReviewStatus = {};
        data.forEach(item => {
          loadedStatus[item.category_name] = {
            isReviewed: item.is_reviewed,
            reviewedAt: item.reviewed_at || undefined,
            reviewerEmail: undefined, // We don't store email directly
            reviewNotes: item.review_notes || undefined
          };
        });
        setReviewStatus(loadedStatus);
      }
    };

    loadReviewStatus();
  }, [analysisId]);

  const updateReviewStatus = useCallback(async (
    category: string, 
    isReviewed: boolean,
    notes?: string
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const newStatus = {
      ...reviewStatus,
      [category]: {
        isReviewed,
        reviewedAt: isReviewed ? new Date().toISOString() : undefined,
        reviewerEmail: isReviewed && user ? user.email : undefined,
        reviewNotes: notes
      }
    };
    
    setReviewStatus(newStatus);

    // Save to database if we have an analysis ID
    if (analysisId) {
      const { error: upsertError } = await supabase
        .from('ai_review_status')
        .upsert({
          analysis_id: analysisId,
          category_name: category,
          is_reviewed: isReviewed,
          reviewed_at: isReviewed ? new Date().toISOString() : null,
          reviewer_id: isReviewed && user ? user.id : null,
          review_notes: notes || null
        }, {
          onConflict: 'analysis_id,category_name'
        });

      if (upsertError) {
        console.error('Error saving review status:', upsertError);
        toast({
          title: "Fehler beim Speichern",
          description: "Der Review-Status konnte nicht gespeichert werden.",
          variant: "destructive"
        });
        return newStatus;
      }
    }

    // Log to AI usage logs if we have an analysis ID
    if (analysisId && user) {
      await supabase.from('ai_usage_logs').insert({
        user_id: user.id,
        analysis_id: analysisId,
        ai_model: category,
        ai_function: 'manual_review',
        was_reviewed: isReviewed,
        reviewed_by: isReviewed ? user.id : null,
        reviewed_at: isReviewed ? new Date().toISOString() : null,
        review_notes: notes || null,
        input_data: {},
        output_data: {}
      });
    }

    return newStatus;
  }, [reviewStatus, analysisId, toast]);

  const isFullyReviewed = useCallback(() => {
    const categories = Object.keys(reviewStatus);
    if (categories.length === 0) return false;
    return categories.every(cat => reviewStatus[cat]?.isReviewed);
  }, [reviewStatus]);

  const getUnreviewedCategories = useCallback(() => {
    return Object.keys(reviewStatus).filter(cat => !reviewStatus[cat]?.isReviewed);
  }, [reviewStatus]);

  const initializeCategories = useCallback((categories: string[]) => {
    const initialStatus: AIReviewStatus = {};
    categories.forEach(cat => {
      initialStatus[cat] = { isReviewed: false };
    });
    setReviewStatus(initialStatus);
  }, []);

  return {
    reviewStatus,
    updateReviewStatus,
    isFullyReviewed,
    getUnreviewedCategories,
    initializeCategories,
    setReviewStatus
  };
};
