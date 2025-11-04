-- Create table for AI review status persistence
CREATE TABLE public.ai_review_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL,
  category_name TEXT NOT NULL,
  is_reviewed BOOLEAN NOT NULL DEFAULT false,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_id UUID,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(analysis_id, category_name)
);

-- Enable RLS
ALTER TABLE public.ai_review_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view review status for their analyses"
ON public.ai_review_status
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.saved_analyses
    WHERE id = ai_review_status.analysis_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create review status for their analyses"
ON public.ai_review_status
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.saved_analyses
    WHERE id = ai_review_status.analysis_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update review status for their analyses"
ON public.ai_review_status
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.saved_analyses
    WHERE id = ai_review_status.analysis_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete review status for their analyses"
ON public.ai_review_status
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.saved_analyses
    WHERE id = ai_review_status.analysis_id
    AND user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_review_status_updated_at
BEFORE UPDATE ON public.ai_review_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();