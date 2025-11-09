# Database Migration Guide

## Quick Migration (Using Supabase Dashboard)

1. Go to: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/sql/new
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste into the SQL editor and click "Run"
4. Copy the contents of `supabase/migrations/002_create_user_trigger.sql`
5. Paste into the SQL editor and click "Run"

## Automated Migration (Using Script)

If you have your database password:

1. Get your database password from: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/settings/database
2. Update `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@verjlcwvbvypgunwsbtu.supabase.co:5432/postgres
   ```
3. Run the migration:
   ```bash
   npm run migrate:direct
   ```

## Verify Migration

After running the migration, verify tables exist:
```bash
npm run check-tables
```

