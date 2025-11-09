/**
 * Check if tables exist and create them if needed using Supabase REST API workarounds
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function checkTables() {
  try {
    console.log('🔍 Checking if tables exist...')

    // Try to query users table
    const { data, error } = await supabase.from('users').select('count').limit(1)

    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        console.log('❌ Tables do not exist!')
        console.log('\n📋 You need to run the migration SQL manually.')
        console.log('🔗 Go to: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/sql/new')
        console.log('\n📝 Run the SQL from:')
        console.log('   1. supabase/migrations/001_initial_schema.sql')
        console.log('   2. supabase/migrations/002_create_user_trigger.sql')
        return false
      } else {
        console.error('❌ Error checking tables:', error.message)
        return false
      }
    }

    console.log('✅ Tables exist!')
    return true
  } catch (error) {
    console.error('❌ Error:', error)
    return false
  }
}

checkTables().then(exists => {
  if (!exists) {
    console.log('\n⚠️  Migration required before the app will work!')
    process.exit(1)
  } else {
    console.log('\n✅ Database is ready!')
    process.exit(0)
  }
})

