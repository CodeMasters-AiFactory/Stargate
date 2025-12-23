-- STARGATE PORTAL - Credits & Usage Schema
-- Run this to add credit tracking tables

-- User credits and package info
CREATE TABLE IF NOT EXISTS user_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  package_type VARCHAR(20) DEFAULT 'starter',
  total_credits INTEGER DEFAULT 50,
  used_credits INTEGER DEFAULT 0,
  bonus_credits INTEGER DEFAULT 0,
  renews_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Usage logs for billing and analytics
CREATE TABLE IF NOT EXISTS usage_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  model VARCHAR(20) NOT NULL, -- haiku, sonnet, opus
  action VARCHAR(20) NOT NULL, -- chat, generate, edit
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  credits_used INTEGER NOT NULL,
  api_cost_usd DECIMAL(10, 6) DEFAULT 0,
  project_id VARCHAR(100),
  session_id VARCHAR(100),
  message_preview TEXT, -- First 100 chars of message
  created_at TIMESTAMP DEFAULT NOW()
);

-- Credit purchase history
CREATE TABLE IF NOT EXISTS credit_purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  credits_amount INTEGER NOT NULL,
  price_zar DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Package subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  package_type VARCHAR(20) NOT NULL,
  price_zar DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired
  starts_at TIMESTAMP DEFAULT NOW(),
  ends_at TIMESTAMP,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_date ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_model ON usage_logs(model);
CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  p_user_id INTEGER,
  p_credits INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  current_remaining INTEGER;
BEGIN
  SELECT (total_credits + bonus_credits - used_credits) INTO current_remaining
  FROM user_credits WHERE user_id = p_user_id;
  
  IF current_remaining >= p_credits THEN
    UPDATE user_credits 
    SET used_credits = used_credits + p_credits,
        updated_at = NOW()
    WHERE user_id = p_user_id;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to add bonus credits
CREATE OR REPLACE FUNCTION add_bonus_credits(
  p_user_id INTEGER,
  p_credits INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE user_credits 
  SET bonus_credits = bonus_credits + p_credits,
      updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- View for usage analytics
CREATE OR REPLACE VIEW usage_analytics AS
SELECT 
  user_id,
  model,
  COUNT(*) as message_count,
  SUM(credits_used) as total_credits,
  SUM(api_cost_usd) as total_api_cost,
  SUM(tokens_in) as total_tokens_in,
  SUM(tokens_out) as total_tokens_out,
  DATE(created_at) as usage_date
FROM usage_logs
GROUP BY user_id, model, DATE(created_at);

-- View for daily revenue
CREATE OR REPLACE VIEW daily_revenue AS
SELECT 
  DATE(created_at) as date,
  SUM(price_zar) as total_revenue,
  COUNT(*) as purchase_count
FROM credit_purchases
WHERE status = 'completed'
GROUP BY DATE(created_at);

COMMENT ON TABLE user_credits IS 'Tracks user credit balance and package';
COMMENT ON TABLE usage_logs IS 'Logs every AI API call for billing';
COMMENT ON TABLE credit_purchases IS 'Credit pack purchases';
COMMENT ON TABLE subscriptions IS 'Monthly package subscriptions';
