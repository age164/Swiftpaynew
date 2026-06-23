-- SwiftPay Database Schema

-- Merchants table
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  business_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  billing_frequency TEXT NOT NULL CHECK (billing_frequency IN ('weekly', 'monthly', 'yearly')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscribers table
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'paused')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  merchant_id UUID REFERENCES merchants(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed')),
  payment_reference TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Merchants policies (users can only access their own merchant record)
CREATE POLICY "select_own_merchant" ON merchants FOR SELECT
  TO authenticated USING (auth.uid()::text = id::text OR email = auth.jwt() ->> 'email');
CREATE POLICY "insert_own_merchant" ON merchants FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "update_own_merchant" ON merchants FOR UPDATE
  TO authenticated USING (auth.uid()::text = id::text);

-- Plans policies
CREATE POLICY "select_own_plans" ON plans FOR SELECT
  TO authenticated USING (merchant_id::text = auth.uid()::text);
CREATE POLICY "insert_own_plans" ON plans FOR INSERT
  TO authenticated WITH CHECK (merchant_id::text = auth.uid()::text);
CREATE POLICY "update_own_plans" ON plans FOR UPDATE
  TO authenticated USING (merchant_id::text = auth.uid()::text) WITH CHECK (merchant_id::text = auth.uid()::text);
CREATE POLICY "delete_own_plans" ON plans FOR DELETE
  TO authenticated USING (merchant_id::text = auth.uid()::text);

-- Subscribers policies
CREATE POLICY "select_own_subscribers" ON subscribers FOR SELECT
  TO authenticated USING (merchant_id::text = auth.uid()::text);
CREATE POLICY "insert_own_subscribers" ON subscribers FOR INSERT
  TO authenticated WITH CHECK (merchant_id::text = auth.uid()::text);
CREATE POLICY "update_own_subscribers" ON subscribers FOR UPDATE
  TO authenticated USING (merchant_id::text = auth.uid()::text) WITH CHECK (merchant_id::text = auth.uid()::text);
CREATE POLICY "delete_own_subscribers" ON subscribers FOR DELETE
  TO authenticated USING (merchant_id::text = auth.uid()::text);

-- Payments policies
CREATE POLICY "select_own_payments" ON payments FOR SELECT
  TO authenticated USING (merchant_id::text = auth.uid()::text);
CREATE POLICY "insert_own_payments" ON payments FOR INSERT
  TO authenticated WITH CHECK (merchant_id::text = auth.uid()::text);
CREATE POLICY "update_own_payments" ON payments FOR UPDATE
  TO authenticated USING (merchant_id::text = auth.uid()::text) WITH CHECK (merchant_id::text = auth.uid()::text);

-- Create indexes for performance
CREATE INDEX idx_plans_merchant_id ON plans(merchant_id);
CREATE INDEX idx_subscribers_merchant_id ON subscribers(merchant_id);
CREATE INDEX idx_subscribers_plan_id ON subscribers(plan_id);
CREATE INDEX idx_payments_merchant_id ON payments(merchant_id);
CREATE INDEX idx_payments_subscriber_id ON payments(subscriber_id);
CREATE INDEX idx_payments_plan_id ON payments(plan_id);