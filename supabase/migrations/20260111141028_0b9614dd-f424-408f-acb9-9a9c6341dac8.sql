-- Add deleted_at column for soft-delete
ALTER TABLE public.saved_analyses
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for efficient filtering
CREATE INDEX idx_saved_analyses_deleted_at ON public.saved_analyses(deleted_at);

-- Update RLS policies to exclude deleted analyses by default for SELECT
DROP POLICY IF EXISTS "Users can view their own saved analyses" ON public.saved_analyses;

CREATE POLICY "Users can view their own saved analyses"
ON public.saved_analyses
FOR SELECT
USING (auth.uid() = user_id);

-- Function to permanently delete analyses that have been soft-deleted for more than 30 days
CREATE OR REPLACE FUNCTION public.cleanup_soft_deleted_analyses()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.saved_analyses
  WHERE deleted_at IS NOT NULL
    AND deleted_at < (now() - INTERVAL '30 days');
END;
$$;