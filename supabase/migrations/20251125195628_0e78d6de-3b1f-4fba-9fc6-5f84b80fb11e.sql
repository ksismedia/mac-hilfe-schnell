-- Create temporary storage table for extension data
CREATE TABLE IF NOT EXISTS public.extension_data_temp (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL UNIQUE,
  data jsonb NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- Enable RLS
ALTER TABLE public.extension_data_temp ENABLE ROW LEVEL SECURITY;

-- Allow public access (no auth required) for temporary data
CREATE POLICY "Anyone can store extension data"
  ON public.extension_data_temp
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can retrieve extension data"
  ON public.extension_data_temp
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can delete expired data"
  ON public.extension_data_temp
  FOR DELETE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_extension_data_session_id 
  ON public.extension_data_temp(session_id);

CREATE INDEX IF NOT EXISTS idx_extension_data_expires_at 
  ON public.extension_data_temp(expires_at);

-- Auto-cleanup function for expired data
CREATE OR REPLACE FUNCTION cleanup_expired_extension_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.extension_data_temp
  WHERE expires_at < now();
END;
$$;