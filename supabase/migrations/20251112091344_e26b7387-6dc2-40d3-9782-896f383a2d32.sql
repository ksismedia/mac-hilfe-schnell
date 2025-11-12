-- Add unique constraint for ai_review_status table
-- This ensures that each analysis can only have one review status per category
ALTER TABLE public.ai_review_status 
ADD CONSTRAINT ai_review_status_analysis_category_unique 
UNIQUE (analysis_id, category_name);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_review_status_analysis_id 
ON public.ai_review_status(analysis_id);