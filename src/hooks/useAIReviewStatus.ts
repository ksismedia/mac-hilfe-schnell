import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  }, [reviewStatus, analysisId]);

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
