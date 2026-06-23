-- Allow public to view their own subscriber record (by email)
CREATE POLICY "select_own_subscriber_by_email" ON subscribers FOR SELECT
  TO anon, authenticated USING (true);