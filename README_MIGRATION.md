# Next.js Migration & Supabase Setup

This project has been converted from Wasp to Next.js and configured to use Supabase as the database.

## Quick Start

### 1. Environment Setup

The `.env.local` file has been created with your Supabase credentials:
- **Project URL**: https://verjlcwvbvypgunwsbtu.supabase.co
- **Anon Key**: Configured
- **Service Role Key**: Configured

### 2. Database Migration

**IMPORTANT**: You need to get your database password from Supabase to complete the migration.

1. Go to: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/settings/database
2. Find your database password (or reset it if needed)
3. Update `DATABASE_URL` in `.env.local` with the actual password

Then run the migration using one of these methods:

#### Method A: Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/sql/new
2. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
3. Click "Run"
4. Copy and paste the contents of `supabase/migrations/002_create_user_trigger.sql`
5. Click "Run"

#### Method B: Using Setup Script

```bash
# Update DATABASE_URL in .env.local with your password first
npm run setup:db
```

### 3. Webhook Endpoint

The webhook endpoint is now available at:
- **URL**: `/api/webhook/webhook`
- **Method**: POST (and GET for testing)
- **Original n8n URL**: https://n8n-9q4d.onrender.com/webhook/webhook

You can test it:
```bash
# Test GET request
curl http://localhost:3000/api/webhook/webhook

# Test POST request
curl -X POST http://localhost:3000/api/webhook/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### 4. Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The app will be available at: http://localhost:3000

## Project Structure

- `app/` - Next.js App Router pages and API routes
- `app/api/webhook/webhook/` - Webhook endpoint matching n8n format
- `lib/supabase/` - Supabase client configuration
  - `client.ts` - Browser client
  - `server.ts` - Server client (with RLS)
  - `admin.ts` - Admin client (bypasses RLS, for webhooks/admin)
- `supabase/migrations/` - Database migration files
- `.env.local` - Environment variables (already configured)

## Key Changes from Wasp

1. **Database**: Now using Supabase instead of direct PostgreSQL
2. **API Routes**: Converted from Wasp operations to Next.js API routes
3. **Authentication**: Using Supabase Auth (configured in `lib/supabase/`)
4. **Webhook**: New endpoint at `/api/webhook/webhook` matching your n8n setup

## Next Steps

1. ✅ Complete database migration (see step 2 above)
2. ✅ Test webhook endpoint
3. ✅ Verify authentication works
4. ✅ Test all API routes
5. Deploy to production

## Troubleshooting

### Webhook not working?
- Check that the endpoint is accessible: `curl http://localhost:3000/api/webhook/webhook`
- Check server logs for errors
- Verify Supabase credentials in `.env.local`

### Database connection issues?
- Verify `DATABASE_URL` has the correct password
- Check Supabase dashboard for connection status
- Ensure migrations have been run

### Migration errors?
- Some errors like "relation already exists" are safe to ignore
- Check Supabase SQL editor for detailed error messages
- See `MIGRATION_INSTRUCTIONS.md` for detailed troubleshooting

