-- ==============================================================================
-- MZANSI MIDNIGHT // GOOGLE PLAY CLOSED TESTING & VISITA TESTERS SCHEMA
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create Play Testers Table
CREATE TABLE IF NOT EXISTS public.mzansi_play_testers (
    id BIGSERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    list_name TEXT NOT NULL DEFAULT 'Visita Testers',
    status TEXT NOT NULL DEFAULT 'registered', -- 'registered' | 'synced_to_google' | 'invited'
    source TEXT NOT NULL DEFAULT 'web_client',
    device_info TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by email and list
CREATE INDEX IF NOT EXISTS idx_mzansi_play_testers_email ON public.mzansi_play_testers (email);
CREATE INDEX IF NOT EXISTS idx_mzansi_play_testers_list ON public.mzansi_play_testers (list_name, status);

-- 2. Row Level Security (RLS) Configuration
ALTER TABLE public.mzansi_play_testers ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public anon client) to register their email for testing
CREATE POLICY "Allow public tester registration"
    ON public.mzansi_play_testers FOR INSERT
    WITH CHECK (true);

-- Allow reading tester entries (e.g., verifying status or admin export)
CREATE POLICY "Allow public read access for testers"
    ON public.mzansi_play_testers FOR SELECT
    USING (true);

-- Allow updating tester entries (e.g. status changes via admin or sync scripts)
CREATE POLICY "Allow updates for testers"
    ON public.mzansi_play_testers FOR UPDATE
    USING (true)
    WITH CHECK (true);

