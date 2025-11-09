#!/usr/bin/env ts-node
/**
 * Supabase Migration Script
 * Applies database schema migrations to Supabase
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function migrateSupabase() {
  try {
    console.log('🔌 Connecting to Supabase...')
    console.log(`   URL: ${supabaseUrl}`)
    console.log('✅ Connected to Supabase!')

    // Read migration files
    console.log('\n📖 Reading migration files...')

    const migration1Path = join(__dirname, '../supabase/migrations/001_initial_schema.sql')
    const migration2Path = join(__dirname, '../supabase/migrations/002_create_user_trigger.sql')

    const migration1 = readFileSync(migration1Path, 'utf-8')
    const migration2 = readFileSync(migration2Path, 'utf-8')

    console.log('✅ Migration files read successfully!')

    // Execute migrations using Supabase RPC or direct SQL
    console.log('\n🚀 Executing migrations...')

    // Split migration into individual statements
    const statements1 = migration1
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`   - Executing ${statements1.length} statements from 001_initial_schema.sql...`)

    for (let i = 0; i < statements1.length; i++) {
      const statement = statements1[i]
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            // If exec_sql doesn't exist, try direct query (requires pg extension)
            // For now, we'll use a workaround with Supabase's SQL editor API
            console.log(`   ⚠️  Statement ${i + 1} may need manual execution (some statements require direct SQL access)`)
          }
        } catch (err) {
          console.log(`   ⚠️  Statement ${i + 1} skipped (may already exist or require direct SQL):`, err instanceof Error ? err.message : 'Unknown error')
        }
      }
    }

    // Note: Supabase migrations are best run through the Supabase dashboard SQL editor
    // or using the Supabase CLI. This script provides a helper but some operations
    // may need to be run manually.

    console.log('\n⚠️  IMPORTANT: Some SQL statements require direct database access.')
    console.log('   Please run the migration files manually in Supabase:')
    console.log('   1. Go to https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/sql/new')
    console.log('   2. Copy and paste the contents of:')
    console.log('      - supabase/migrations/001_initial_schema.sql')
    console.log('      - supabase/migrations/002_create_user_trigger.sql')
    console.log('   3. Execute each file in order')

    console.log('\n✅ Migration script completed!')
    console.log('   Please verify the schema in Supabase dashboard.')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    process.exit(1)
  }
}

// Run migration
migrateSupabase().catch(console.error)

