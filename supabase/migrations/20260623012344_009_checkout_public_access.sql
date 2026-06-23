-- Enable public access for checkout functionality

-- Allow public to view active plans (for checkout pages)
CREATE POLICY "select_active_plans_public" ON plans FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- Allow public to insert subscribers (for checkout signup)
CREATE POLICY "insert_subscribers_public" ON subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Allow public to insert payments (for checkout flow)
CREATE POLICY "insert_payments_public" ON payments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- Allow public to view merchant info for checkout display
CREATE POLICY "select_merchant_for_checkout" ON merchants FOR SELECT
  TO anon, authenticated USING (true);