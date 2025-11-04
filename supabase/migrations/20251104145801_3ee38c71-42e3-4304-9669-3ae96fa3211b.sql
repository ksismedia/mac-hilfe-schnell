-- Audit Log Tabelle für Nachvollziehbarkeit aller Aktionen
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'view', 'export'
  resource_type TEXT NOT NULL, -- 'analysis', 'manual_data', 'export'
  resource_id UUID,
  resource_name TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI Usage Log für AI-Act Compliance
CREATE TABLE public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id UUID,
  ai_model TEXT NOT NULL, -- z.B. 'google-pagespeed', 'keyword-analysis'
  ai_function TEXT NOT NULL, -- z.B. 'seo-scoring', 'content-analysis'
  input_data JSONB,
  output_data JSONB,
  confidence_score DECIMAL(5,2), -- 0-100
  was_reviewed BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Compliance Consent Tracking
CREATE TABLE public.user_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL, -- 'terms_of_use', 'data_processing', 'audit_logging'
  consent_version TEXT NOT NULL,
  consented_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  UNIQUE(user_id, consent_type)
);

-- Data Retention Settings
CREATE TABLE public.data_retention_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retention_days INTEGER NOT NULL DEFAULT 365,
  auto_delete_enabled BOOLEAN DEFAULT true,
  last_cleanup_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default retention settings
INSERT INTO public.data_retention_settings (retention_days, auto_delete_enabled)
VALUES (365, true);

-- Enable RLS on all tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_retention_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs (users can view their own logs, admins can view all)
CREATE POLICY "Users can view their own audit logs"
ON public.audit_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- RLS Policies for ai_usage_logs
CREATE POLICY "Users can view their own AI usage logs"
ON public.ai_usage_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI usage logs"
ON public.ai_usage_logs
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update review status"
ON public.ai_usage_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_consent
CREATE POLICY "Users can view their own consent"
ON public.user_consent
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their consent"
ON public.user_consent
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for data_retention_settings (read-only for users)
CREATE POLICY "Anyone authenticated can view retention settings"
ON public.data_retention_settings
FOR SELECT
TO authenticated
USING (true);

-- Indexes for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource_type ON public.audit_logs(resource_type);

CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs(user_id);
CREATE INDEX idx_ai_usage_logs_analysis_id ON public.ai_usage_logs(analysis_id);
CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs(created_at DESC);
CREATE INDEX idx_ai_usage_logs_was_reviewed ON public.ai_usage_logs(was_reviewed);

-- Function for automatic cleanup of old data
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Trigger to update updated_at on data_retention_settings
CREATE TRIGGER update_data_retention_settings_updated_at
BEFORE UPDATE ON public.data_retention_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();