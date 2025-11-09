/**
 * Direct PostgreSQL migration using pg library
 * This requires the DATABASE_URL with password
 */

import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get DATABASE_URL - user needs to set the password
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl || databaseUrl.includes('[YOUR-PASSWORD]')) {
  console.error('❌ DATABASE_URL not configured with password!')
  console.error('📝 Please update .env.local with your database password:')
  console.error('   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@verjlcwvbvypgunwsbtu.supabase.co:5432/postgres')
  console.error('\n💡 Get your password from: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/settings/database')
  process.exit(1)
}

async function migrate() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!')

    // Read migration files
    const migration1Path = join(__dirname, '../supabase/migrations/001_initial_schema.sql')
    const migration2Path = join(__dirname, '../supabase/migrations/002_create_user_trigger.sql')

    const migration1 = readFileSync(migration1Path, 'utf-8')
    const migration2 = readFileSync(migration2Path, 'utf-8')

    console.log('\n🚀 Running migration 1: initial_schema.sql...')
    await client.query(migration1)
    console.log('✅ Migration 1 completed!')

    console.log('\n🚀 Running migration 2: create_user_trigger.sql...')
    await client.query(migration2)
    console.log('✅ Migration 2 completed!')

    // Verify tables
    console.log('\n🔍 Verifying tables...')
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `)
    console.log(`✅ Found ${result.rows.length} tables:`, result.rows.map(r => r.table_name).join(', '))

    console.log('\n✅ All migrations completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    process.exit(1)
  } finally {
    await client.end()
  }
}

migrate().catch(console.error)

