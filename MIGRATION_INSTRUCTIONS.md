# Supabase Database Migration Instructions

This guide will help you migrate your database schema to Supabase.

## Prerequisites

1. Supabase project created at: https://verjlcwvbvypgunwsbtu.supabase.co
2. Environment variables configured in `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## Migration Steps

### Option 1: Using Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/sql/new

2. **Run Initial Schema Migration**
   - Open the file: `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into the SQL editor
   - Click "Run" to execute
   - Wait for completion

3. **Run User Trigger Migration**
   - Open the file: `supabase/migrations/002_create_user_trigger.sql`
   - Copy the entire contents
   - Paste into the SQL editor
   - Click "Run" to execute
   - Wait for completion

4. **Verify Migration**
   - Go to: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/editor
   - Check that the following tables exist:
     - `users`
     - `gpt_responses`
     - `tasks`
     - `files`
     - `daily_stats`
     - `page_view_sources`
     - `logs`
     - `contact_form_messages`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Link to your project
supabase link --project-ref verjlcwvbvypgunwsbtu

# Run migrations
supabase db push
```

### Option 3: Using Direct Database Connection

If you have the database password, you can use the setup script:

```bash
# Set DATABASE_URL with your actual password
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@verjlcwvbvypgunwsbtu.supabase.co:5432/postgres"

# Run the setup script
npm run setup:db
```

## Post-Migration Verification

1. **Check Tables**
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

2. **Check RLS Policies**
   ```sql
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

3. **Test Webhook Endpoint**
   - Your webhook is available at: `/api/webhook/webhook`
   - Test with: `curl -X POST http://localhost:3000/api/webhook/webhook -H "Content-Type: application/json" -d '{"test": "data"}'`

## Troubleshooting

### Error: "relation already exists"
- Some tables may already exist. The migration uses `CREATE TABLE IF NOT EXISTS`, so this is safe to ignore.

### Error: "permission denied"
- Make sure you're using the service role key for administrative operations.
- Check that RLS policies are correctly set up.

### Error: "function does not exist"
- Make sure the UUID extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## Next Steps

After migration:
1. Update your application to use Supabase client libraries
2. Test authentication flows
3. Verify data access patterns work with RLS policies
4. Test the webhook endpoint at `/api/webhook/webhook`

