import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

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

async function applyRLSFix() {
  try {
    console.log('🔧 Fixing RLS infinite recursion issue...\n')

    // Read the SQL file
    const sql = readFileSync(resolve(process.cwd(), 'scripts/fix-rls-infinite-recursion.sql'), 'utf-8')

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 Executing ${statements.length} SQL statements...\n`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        console.log(`   ${i + 1}. Executing statement...`)
        try {
          // Use REST API to execute SQL (Supabase doesn't have direct SQL execution via JS client)
          // We'll need to use the Supabase dashboard or provide instructions
          console.log(`   ⚠️  Cannot execute SQL directly via JS client`)
          console.log(`   📋 Please run this SQL in Supabase SQL Editor:`)
          console.log(`   ${statement}`)
          console.log('')
        } catch (error: any) {
          console.error(`   ❌ Error:`, error.message)
        }
      }
    }

    console.log('\n✅ SQL statements prepared!')
    console.log('\n📝 IMPORTANT: Please run the SQL from scripts/fix-rls-infinite-recursion.sql')
    console.log('   in the Supabase SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/sql/new')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

applyRLSFix().then(() => {
  console.log('\n✅ Done!')
  process.exit(0)
})

