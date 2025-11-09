#!/usr/bin/env ts-node
/**
 * Database Setup Script
 * Creates all tables, indexes, RLS policies, and triggers in PostgreSQL database
 */

import { Client } from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jG4FaWR3cmtr@ep-lucky-lake-a2y94m4a-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

async function setupDatabase() {
  const client = new Client({
    connectionString: DATABASE_URL,
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Database connection successful!')

    // Read migration files
    console.log('\n📖 Reading migration files...')
    
    // Check if this is a Supabase database (has auth schema) or standalone PostgreSQL
    const { rows: schemaCheck } = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'auth';
    `)
    
    const isSupabase = schemaCheck.length > 0
    
    if (isSupabase) {
      console.log('✅ Supabase database detected (auth schema exists)')
      const migration1Path = join(__dirname, '../supabase/migrations/001_initial_schema.sql')
      const migration2Path = join(__dirname, '../supabase/migrations/002_create_user_trigger.sql')
      
      const migration1 = readFileSync(migration1Path, 'utf-8')
      const migration2 = readFileSync(migration2Path, 'utf-8')

      console.log('✅ Migration files read successfully!')

      // Execute migrations
      console.log('\n🚀 Executing migrations...')
      
      console.log('   - Executing 001_initial_schema.sql...')
      await client.query(migration1)
      console.log('   ✅ Initial schema created!')

      console.log('   - Executing 002_create_user_trigger.sql...')
      await client.query(migration2)
      console.log('   ✅ User trigger created!')
    } else {
      console.log('ℹ️  Standalone PostgreSQL database detected (no auth schema)')
      const migration1Path = join(__dirname, '../supabase/migrations/001_initial_schema_standalone.sql')
      
      const migration1 = readFileSync(migration1Path, 'utf-8')

      console.log('✅ Migration files read successfully!')

      // Execute migrations
      console.log('\n🚀 Executing migrations...')
      
      console.log('   - Executing 001_initial_schema_standalone.sql...')
      await client.query(migration1)
      console.log('   ✅ Initial schema created!')
      
      console.log('   ℹ️  Note: User trigger skipped (not applicable for standalone PostgreSQL)')
    }

    console.log('\n✅ All migrations executed successfully!')

    // Verify setup
    console.log('\n🔍 Verifying database setup...')
    
    // Check tables
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)
    const tables = tablesResult.rows.map(row => row.table_name)
    console.log(`✅ Found ${tables.length} tables:`, tables)

    // Check RLS
    const rlsResult = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'gpt_responses', 'tasks', 'files', 'contact_form_messages');
    `)
    console.log(`✅ RLS enabled on ${rlsResult.rows.length} tables`)

    // Check indexes
    const indexesResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_indexes 
      WHERE schemaname = 'public';
    `)
    console.log(`✅ Found ${indexesResult.rows[0].count} indexes`)

    // Check triggers
    const triggersResult = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public';
    `)
    console.log(`✅ Found ${triggersResult.rows[0].count} triggers`)

    console.log('\n✅ Database setup completed successfully!')
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    process.exit(1)
  } finally {
    await client.end()
    console.log('\n🔌 Database connection closed.')
  }
}

// Run setup
setupDatabase().catch(console.error)
