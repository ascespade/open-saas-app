-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (Note: Supabase Auth handles auth.users, this is our custom user table)
-- The id should match auth.users.id (auth.uid())
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  payment_processor_user_id TEXT UNIQUE,
  lemon_squeezy_customer_portal_url TEXT,
  subscription_status TEXT,
  subscription_plan TEXT,
  date_paid TIMESTAMP WITH TIME ZONE,
  credits INTEGER DEFAULT 3
);

-- Create gpt_responses table
CREATE TABLE IF NOT EXISTS gpt_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  time TEXT DEFAULT '1',
  is_done BOOLEAN DEFAULT FALSE
);

-- Create files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  s3_key TEXT NOT NULL
);

-- Create daily_stats table
CREATE TABLE IF NOT EXISTS daily_stats (
  id SERIAL PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW() UNIQUE,
  total_views INTEGER DEFAULT 0,
  prev_day_views_change_percent TEXT DEFAULT '0',
  user_count INTEGER DEFAULT 0,
  paid_user_count INTEGER DEFAULT 0,
  user_delta INTEGER DEFAULT 0,
  paid_user_delta INTEGER DEFAULT 0,
  total_revenue DOUBLE PRECISION DEFAULT 0,
  total_profit DOUBLE PRECISION DEFAULT 0
);

-- Create page_view_sources table
CREATE TABLE IF NOT EXISTS page_view_sources (
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  daily_stats_id INTEGER REFERENCES daily_stats(id) ON DELETE SET NULL,
  visitors INTEGER NOT NULL,
  PRIMARY KEY (date, name)
);

-- Create logs table
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message TEXT NOT NULL,
  level TEXT NOT NULL
);

-- Create contact_form_messages table
CREATE TABLE IF NOT EXISTS contact_form_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gpt_responses_user_id ON gpt_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_form_messages_user_id ON contact_form_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_page_view_sources_daily_stats_id ON page_view_sources(daily_stats_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpt_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_view_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_form_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Admins can update all users
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- RLS Policies for gpt_responses table
CREATE POLICY "Users can read own gpt_responses" ON gpt_responses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gpt_responses" ON gpt_responses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gpt_responses" ON gpt_responses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gpt_responses" ON gpt_responses
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for tasks table
CREATE POLICY "Users can read own tasks" ON tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for files table
CREATE POLICY "Users can read own files" ON files
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON files
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON files
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON files
  FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for contact_form_messages table
CREATE POLICY "Users can read own messages" ON contact_form_messages
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON contact_form_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can read all messages
CREATE POLICY "Admins can read all messages" ON contact_form_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Admins can update all messages
CREATE POLICY "Admins can update all messages" ON contact_form_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- RLS Policies for daily_stats table
-- Admins can read all stats
CREATE POLICY "Admins can read daily_stats" ON daily_stats
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Service role can insert/update stats (for cron jobs)
-- Note: This will be handled via service role key in API routes

-- RLS Policies for page_view_sources table
-- Admins can read all sources
CREATE POLICY "Admins can read page_view_sources" ON page_view_sources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- RLS Policies for logs table
-- Admins can read all logs
CREATE POLICY "Admins can read logs" ON logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND is_admin = TRUE
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on gpt_responses
CREATE TRIGGER update_gpt_responses_updated_at
  BEFORE UPDATE ON gpt_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
