-- Enable UUID and JSON extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- Users Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  default_currency CHAR(3) NOT NULL DEFAULT 'AUD' CHECK (LENGTH(default_currency) = 3),
  time_zone VARCHAR(100) NOT NULL DEFAULT 'Australia/Sydney',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email) WHERE is_active = true;
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- Financial Accounts Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS financial_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) NOT NULL, -- 'Checking', 'Savings', 'Investment', 'Loan', 'CreditCard'
  institution_name VARCHAR(255),
  currency_code CHAR(3) NOT NULL DEFAULT 'AUD',
  opening_balance NUMERIC(15, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_financial_accounts_user_id ON financial_accounts(user_id);
CREATE INDEX idx_financial_accounts_user_active ON financial_accounts(user_id, is_active);

-- ============================================================================
-- Categories Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category_type VARCHAR(50) NOT NULL, -- 'Income', 'Expense'
  parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon VARCHAR(50),
  color VARCHAR(7), -- Hex color code
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(user_id, category_type);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);

-- ============================================================================
-- Transactions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'Income', 'Expense', 'Transfer'
  amount NUMERIC(15, 2) NOT NULL,
  currency_code CHAR(3) NOT NULL DEFAULT 'AUD',
  transaction_date DATE NOT NULL,
  description VARCHAR(500),
  merchant VARCHAR(255),
  notes VARCHAR(1000),
  status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Cleared', 'Reconciled'
  related_transfer_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_transfer ON transactions(related_transfer_id);

-- ============================================================================
-- Transfers Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  to_account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  amount NUMERIC(15, 2) NOT NULL,
  currency_code CHAR(3) NOT NULL DEFAULT 'AUD',
  transfer_date DATE NOT NULL,
  description VARCHAR(500),
  notes VARCHAR(1000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transfers_user_id ON transfers(user_id);
CREATE INDEX idx_transfers_from_account ON transfers(from_account_id);
CREATE INDEX idx_transfers_to_account ON transfers(to_account_id);

-- ============================================================================
-- Budgets Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  budget_month DATE NOT NULL, -- First day of month
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_month ON budgets(user_id, budget_month);
CREATE UNIQUE INDEX idx_budgets_user_month ON budgets(user_id, budget_month);

-- ============================================================================
-- Budget Categories Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  planned_amount NUMERIC(15, 2) NOT NULL,
  rollover_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budget_categories_budget ON budget_categories(budget_id);
CREATE INDEX idx_budget_categories_category ON budget_categories(category_id);
CREATE UNIQUE INDEX idx_budget_categories_unique ON budget_categories(budget_id, category_id);

-- ============================================================================
-- Savings Goals Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  icon VARCHAR(50),
  color VARCHAR(7),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX idx_savings_goals_active ON savings_goals(user_id, is_active);

-- ============================================================================
-- Recurring Transactions Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'Income', 'Expense'
  description VARCHAR(500),
  frequency VARCHAR(50) NOT NULL, -- 'Daily', 'Weekly', 'Fortnightly', 'Monthly', 'Quarterly', 'Yearly'
  next_occurrence DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  last_generated_on DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_active ON recurring_transactions(user_id, is_active);
CREATE INDEX idx_recurring_transactions_next ON recurring_transactions(next_occurrence) WHERE is_active = true;

-- ============================================================================
-- Notifications Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'BudgetAlert', 'GoalMilestone', 'RecurringTransaction', 'System'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- ============================================================================
-- Audit Logs Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  entity_name VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_name, entity_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users RLS: Users can only see their own data
CREATE POLICY users_select_self ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_update_self ON users
  FOR UPDATE USING (auth.uid() = id);

-- Financial Accounts RLS: Users can only see their own accounts
CREATE POLICY accounts_select_self ON financial_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY accounts_insert_own ON financial_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY accounts_update_own ON financial_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY accounts_delete_own ON financial_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Categories RLS: Users can only see their own categories
CREATE POLICY categories_select_self ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY categories_insert_own ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY categories_update_own ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY categories_delete_own ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Transactions RLS: Users can only see their own transactions
CREATE POLICY transactions_select_self ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY transactions_insert_own ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY transactions_update_own ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY transactions_delete_own ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Transfers RLS: Users can only see their own transfers
CREATE POLICY transfers_select_self ON transfers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY transfers_insert_own ON transfers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY transfers_delete_own ON transfers
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets RLS: Users can only see their own budgets
CREATE POLICY budgets_select_self ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY budgets_insert_own ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY budgets_update_own ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY budgets_delete_own ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Budget Categories RLS: Inherit from budget
CREATE POLICY budget_categories_select ON budget_categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_categories.budget_id
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY budget_categories_insert ON budget_categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_id
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY budget_categories_update ON budget_categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_categories.budget_id
      AND budgets.user_id = auth.uid()
    )
  );

CREATE POLICY budget_categories_delete ON budget_categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budgets WHERE budgets.id = budget_id
      AND budgets.user_id = auth.uid()
    )
  );

-- Savings Goals RLS: Users can only see their own goals
CREATE POLICY savings_goals_select_self ON savings_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY savings_goals_insert_own ON savings_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY savings_goals_update_own ON savings_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY savings_goals_delete_own ON savings_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Recurring Transactions RLS: Users can only see their own recurring transactions
CREATE POLICY recurring_transactions_select_self ON recurring_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY recurring_transactions_insert_own ON recurring_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY recurring_transactions_update_own ON recurring_transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY recurring_transactions_delete_own ON recurring_transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications RLS: Users can only see their own notifications
CREATE POLICY notifications_select_self ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY notifications_delete_own ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Audit Logs RLS: Users can only see their own audit logs
CREATE POLICY audit_logs_select_self ON audit_logs
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- Seed Default Categories (as a function for easy re-use)
-- ============================================================================
CREATE OR REPLACE FUNCTION seed_default_categories_for_user(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Income categories
  INSERT INTO categories (user_id, name, category_type, icon, color, is_active)
  VALUES
    (p_user_id, 'Salary', 'Income', '💼', '#10b981', true),
    (p_user_id, 'Freelance', 'Income', '🎨', '#3b82f6', true),
    (p_user_id, 'Investments', 'Income', '📈', '#8b5cf6', true),
    (p_user_id, 'Other Income', 'Income', '💰', '#f59e0b', true)
  ON CONFLICT DO NOTHING;

  -- Expense categories
  INSERT INTO categories (user_id, name, category_type, icon, color, is_active)
  VALUES
    (p_user_id, 'Groceries', 'Expense', '🛒', '#ef4444', true),
    (p_user_id, 'Dining Out', 'Expense', '🍽️', '#f97316', true),
    (p_user_id, 'Transportation', 'Expense', '🚗', '#06b6d4', true),
    (p_user_id, 'Utilities', 'Expense', '💡', '#6366f1', true),
    (p_user_id, 'Healthcare', 'Expense', '⚕️', '#ec4899', true),
    (p_user_id, 'Entertainment', 'Expense', '🎭', '#a78bfa', true),
    (p_user_id, 'Shopping', 'Expense', '🛍️', '#f472b6', true),
    (p_user_id, 'Subscriptions', 'Expense', '📱', '#14b8a6', true),
    (p_user_id, 'Travel', 'Expense', '✈️', '#0ea5e9', true),
    (p_user_id, 'Other Expense', 'Expense', '📌', '#94a3b8', true);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Helper View for Account Balances
-- ============================================================================
CREATE OR REPLACE VIEW account_balances AS
SELECT
  fa.id,
  fa.user_id,
  fa.name,
  fa.account_type,
  fa.currency_code,
  fa.opening_balance +
  COALESCE(SUM(
    CASE
      WHEN t.transaction_type = 'Transfer' AND t.account_id = fa.id AND t.amount > 0 THEN t.amount
      WHEN t.transaction_type = 'Transfer' AND t.account_id = fa.id AND t.amount < 0 THEN t.amount
      WHEN t.transaction_type = 'Income' THEN t.amount
      WHEN t.transaction_type = 'Expense' THEN -ABS(t.amount)
      ELSE 0
    END
  ), 0) AS current_balance,
  COUNT(DISTINCT t.id) AS transaction_count
FROM financial_accounts fa
LEFT JOIN transactions t ON t.account_id = fa.id AND t.status IN ('Cleared', 'Reconciled')
WHERE fa.is_active = true
GROUP BY fa.id, fa.user_id, fa.name, fa.account_type, fa.currency_code, fa.opening_balance;

-- ============================================================================
-- Helper View for Budget Performance
-- ============================================================================
CREATE OR REPLACE VIEW budget_performance AS
SELECT
  b.id AS budget_id,
  b.user_id,
  b.budget_month,
  c.id AS category_id,
  c.name AS category_name,
  COALESCE(bc.planned_amount, 0) AS planned_amount,
  COALESCE(SUM(ABS(t.amount)), 0) AS actual_amount,
  COALESCE(bc.planned_amount, 0) - COALESCE(SUM(ABS(t.amount)), 0) AS remaining_amount
FROM budgets b
CROSS JOIN categories c
LEFT JOIN budget_categories bc ON bc.budget_id = b.id AND bc.category_id = c.id
LEFT JOIN transactions t ON t.category_id = c.id
  AND t.user_id = b.user_id
  AND t.transaction_type = 'Expense'
  AND DATE_TRUNC('month', t.transaction_date)::DATE = b.budget_month
WHERE c.user_id = b.user_id AND c.category_type = 'Expense'
GROUP BY b.id, b.user_id, b.budget_month, c.id, c.name, bc.planned_amount;
