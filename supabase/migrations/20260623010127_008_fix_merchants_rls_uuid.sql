-- Fix the merchants INSERT policy with proper UUID comparison
DROP POLICY IF EXISTS "insert_own_merchant" ON merchants;

-- Use direct UUID comparison instead of text casting
CREATE POLICY "insert_own_merchant" ON merchants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);