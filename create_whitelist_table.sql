-- ============================================
-- SPX SOKO Dashboard - Whitelist Table Setup
-- ============================================
-- Project: https://tnzwrnvggqrkstokcrrr.supabase.co
-- Description: Email whitelist untuk Google OAuth authorization
-- Date: 2026-09-26
-- ============================================

-- Create whitelist table
CREATE TABLE IF NOT EXISTS whitelist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE whitelist IS 'Email whitelist for authorized users in SPX SOKO Dashboard';
COMMENT ON COLUMN whitelist.email IS 'Authorized email address (lowercase, unique)';

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_whitelist_email ON whitelist(email);

-- Enable Row Level Security
ALTER TABLE whitelist ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if any
DROP POLICY IF EXISTS "Allow all operations" ON whitelist;

-- Create policy to allow all operations (development mode)
-- TODO: Restrict this in production to admin-only writes
CREATE POLICY "Allow all operations" ON whitelist
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Insert default whitelist emails
INSERT INTO whitelist (email) VALUES 
  ('rafi.alvian@spxexpress.com'),
  ('admin@spxsoko.online')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Verification Query
-- ============================================
-- Run this to check if table was created successfully:

SELECT 
  'Whitelist table created!' as status,
  COUNT(*) as total_emails
FROM whitelist;

-- Expected output: 2 emails (rafi.alvian@spxexpress.com, admin@spxsoko.online)

-- ============================================
-- Optional: Add more default emails
-- ============================================
-- Uncomment and modify as needed:

-- INSERT INTO whitelist (email) VALUES 
--   ('another.user@spxexpress.com'),
--   ('manager@spxsoko.online')
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Production Security Setup (TODO)
-- ============================================
-- When moving to production, update RLS policy:

/*
-- Drop development policy
DROP POLICY IF EXISTS "Allow all operations" ON whitelist;

-- Allow anyone to read whitelist (for login check)
CREATE POLICY "Allow read for authentication" ON whitelist
  FOR SELECT
  USING (true);

-- Only allow admin to insert/update/delete
-- You'll need to implement admin check logic
CREATE POLICY "Admin only write" ON whitelist
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );
*/

-- ============================================
-- Useful Queries
-- ============================================

-- View all whitelisted emails:
-- SELECT email, created_at FROM whitelist ORDER BY created_at DESC;

-- Add new email:
-- INSERT INTO whitelist (email) VALUES ('newuser@company.com');

-- Remove email:
-- DELETE FROM whitelist WHERE email = 'user@company.com';

-- Check if email exists:
-- SELECT EXISTS(SELECT 1 FROM whitelist WHERE email = 'test@example.com');
