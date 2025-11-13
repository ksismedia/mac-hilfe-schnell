-- Create table for accessibility analysis cache
CREATE TABLE IF NOT EXISTS public.accessibility_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Create index for faster URL lookups
CREATE INDEX IF NOT EXISTS idx_accessibility_cache_url ON public.accessibility_cache(url);

-- Create index for expiry cleanup
CREATE INDEX IF NOT EXISTS idx_accessibility_cache_expires_at ON public.accessibility_cache(expires_at);

-- Enable Row Level Security
ALTER TABLE public.accessibility_cache ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read cached results (public data)
CREATE POLICY "Anyone can read accessibility cache"
ON public.accessibility_cache
FOR SELECT
USING (true);

-- Allow service role to insert/update cache (edge functions)
CREATE POLICY "Service role can manage cache"
ON public.accessibility_cache
FOR ALL
USING (true);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION public.cleanup_expired_accessibility_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.accessibility_cache
  WHERE expires_at < now();
END;
$$;

COMMENT ON TABLE public.accessibility_cache IS 'Caches Google PageSpeed Accessibility analysis results for 24 hours to reduce API calls and prevent rate limiting';
COMMENT ON FUNCTION public.cleanup_expired_accessibility_cache() IS 'Removes expired accessibility cache entries. Can be called periodically via pg_cron or manually';