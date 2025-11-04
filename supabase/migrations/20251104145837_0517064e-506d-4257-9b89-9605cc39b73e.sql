-- Fix search_path for security definer functions
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  retention_days INTEGER;
  auto_delete BOOLEAN;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get retention settings
  SELECT 
    data_retention_settings.retention_days,
    data_retention_settings.auto_delete_enabled
  INTO retention_days, auto_delete
  FROM public.data_retention_settings
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Only proceed if auto-delete is enabled
  IF auto_delete THEN
    cutoff_date := now() - (retention_days || ' days')::INTERVAL;
    
    -- Delete old analyses
    DELETE FROM public.saved_analyses
    WHERE saved_at < cutoff_date;
    
    -- Delete old audit logs (keep longer - 2 years)
    DELETE FROM public.audit_logs
    WHERE created_at < (now() - INTERVAL '730 days');
    
    -- Delete old AI logs (same as analyses)
    DELETE FROM public.ai_usage_logs
    WHERE created_at < cutoff_date;
    
    -- Update last cleanup timestamp
    UPDATE public.data_retention_settings
    SET last_cleanup_at = now()
    WHERE id = (SELECT id FROM public.data_retention_settings ORDER BY created_at DESC LIMIT 1);
  END IF;
END;
$$;