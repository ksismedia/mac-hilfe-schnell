-- Fix: ensure user_id is derived from the authenticated JWT on insert
-- This prevents multi-tab / stale-session mismatches from causing RLS violations.
ALTER TABLE public.saved_analyses
  ALTER COLUMN user_id SET DEFAULT auth.uid();