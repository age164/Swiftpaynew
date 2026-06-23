-- Fix the insecure INSERT policy on merchants table
-- Drop the existing policy that allows unrestricted access
DROP POLICY IF EXISTS "insert_own_merchant" ON merchants;

-- Create a secure policy that only allows users to insert their own merchant record
CREATE POLICY "insert_own_merchant" ON merchants FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = id::text);