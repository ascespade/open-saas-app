#!/usr/bin/env ts-node
/**
 * Database Connection Test Script
 * Tests connection to PostgreSQL database and validates schema
 */

import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jG4FaWR3cmtr@ep-lucky-lake-a2y94m4a-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

// Note: The database currently has Prisma tables (User, Task, etc.) instead of Supabase tables (users, tasks, etc.)
// This script tests the connection and reports what tables exist

async function testDatabaseConnection() {
  const client = new Client({
    connectionString: DATABASE_URL,
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Database connection successful!')

    // Test 1: Check if tables exist
    console.log('\n📊 Checking tables...')
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)
    const tables = tablesResult.rows.map(row => row.table_name)
    console.log(`✅ Found ${tables.length} tables:`, tables)

    // Check for both Prisma-style (PascalCase) and Supabase-style (snake_case) tables
    const expectedSupabaseTables = [
      'users',
      'gpt_responses',
      'tasks',
      'files',
      'daily_stats',
      'page_view_sources',
      'logs',
      'contact_form_messages',
    ]
    
    const expectedPrismaTables = [
      'User',
      'GptResponse',
      'Task',
      'File',
      'DailyStats',
      'PageViewSource',
      'Logs',
      'ContactFormMessage',
    ]

    const missingSupabaseTables = expectedSupabaseTables.filter(table => !tables.includes(table))
    const missingPrismaTables = expectedPrismaTables.filter(table => !tables.includes(table))
    
    if (missingSupabaseTables.length > 0 && missingPrismaTables.length > 0) {
      console.warn('⚠️  Missing Supabase tables:', missingSupabaseTables)
      console.warn('⚠️  Missing Prisma tables:', missingPrismaTables)
      console.log('ℹ️  Note: Database appears to have a different schema. Run migrations to create Supabase tables.')
    } else if (tables.some(t => expectedSupabaseTables.includes(t))) {
      console.log('✅ Supabase tables found!')
    } else if (tables.some(t => expectedPrismaTables.includes(t))) {
      console.log('⚠️  Prisma tables found instead of Supabase tables. Run migrations to convert.')
    } else {
      console.log('✅ All expected tables exist!')
    }

    // Test 2: Check RLS policies
    console.log('\n🔒 Checking Row Level Security...')
    const rlsResult = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('users', 'gpt_responses', 'tasks', 'files', 'contact_form_messages');
    `)
    console.log('✅ RLS status:', rlsResult.rows)

    // Test 3: Check indexes
    console.log('\n📇 Checking indexes...')
    const indexesResult = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      ORDER BY tablename, indexname;
    `)
    console.log(`✅ Found ${indexesResult.rows.length} indexes`)
    indexesResult.rows.forEach(row => {
      console.log(`   - ${row.indexname} on ${row.tablename}`)
    })

    // Test 4: Check triggers
    console.log('\n⚡ Checking triggers...')
    const triggersResult = await client.query(`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_schema = 'public';
    `)
    console.log(`✅ Found ${triggersResult.rows.length} triggers`)
    triggersResult.rows.forEach(row => {
      console.log(`   - ${row.trigger_name} on ${row.event_object_table}`)
    })

    // Test 5: Test basic queries
    console.log('\n🧪 Testing basic queries...')
    
    // Count users
    const usersCount = await client.query('SELECT COUNT(*) FROM users')
    console.log(`✅ Users count: ${usersCount.rows[0].count}`)

    // Count tasks
    const tasksCount = await client.query('SELECT COUNT(*) FROM tasks')
    console.log(`✅ Tasks count: ${tasksCount.rows[0].count}`)

    // Count files
    const filesCount = await client.query('SELECT COUNT(*) FROM files')
    console.log(`✅ Files count: ${filesCount.rows[0].count}`)

    // Count gpt_responses
    const gptResponsesCount = await client.query('SELECT COUNT(*) FROM gpt_responses')
    console.log(`✅ GPT responses count: ${gptResponsesCount.rows[0].count}`)

    // Test 6: Check foreign key constraints
    console.log('\n🔗 Checking foreign key constraints...')
    const fkResult = await client.query(`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public';
    `)
    console.log(`✅ Found ${fkResult.rows.length} foreign key constraints`)
    fkResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}.${row.column_name} -> ${row.foreign_table_name}.${row.foreign_column_name}`)
    })

    console.log('\n✅ All database tests passed!')
  } catch (error) {
    console.error('❌ Database test failed:', error)
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

// Run tests
testDatabaseConnection().catch(console.error)
