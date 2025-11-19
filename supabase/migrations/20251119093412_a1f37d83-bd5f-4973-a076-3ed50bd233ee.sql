-- Fix audit logs security: Create controlled logging function and restrict RLS

-- 1. Create SECURITY DEFINER function for controlled audit log creation
CREATE OR REPLACE FUNCTION public.create_audit_log(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_resource_name TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Require authentication
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Insert the audit log
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    resource_name,
    details,
    ip_address,
    user_agent
  ) VALUES (
    v_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_resource_name,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- 2. Drop the insecure policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- 3. Create restrictive RLS policies
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Authenticated function can insert via RPC"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (false); -- Block direct inserts from authenticated users

-- 4. Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION public.create_audit_log TO authenticated;