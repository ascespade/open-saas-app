import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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

async function runMigration() {
  try {
    console.log('🔌 Connecting to Supabase...')

    // Read migration files
    const migration1Path = join(__dirname, '../supabase/migrations/001_initial_schema.sql')
    const migration2Path = join(__dirname, '../supabase/migrations/002_create_user_trigger.sql')

    const migration1 = readFileSync(migration1Path, 'utf-8')
    const migration2 = readFileSync(migration2Path, 'utf-8')

    console.log('📖 Migration files read successfully!')

    // Split into statements and execute
    const statements1 = migration1
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`\n🚀 Executing ${statements1.length} statements from initial schema...`)

    for (let i = 0; i < statements1.length; i++) {
      const statement = statements1[i] + ';'
      if (statement.trim() && statement !== ';') {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            // Try direct query via REST API
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseServiceKey,
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({ sql: statement }),
            })

            if (!response.ok) {
              console.log(`   ⚠️  Statement ${i + 1} may need manual execution`)
            } else {
              console.log(`   ✅ Statement ${i + 1} executed`)
            }
          } else {
            console.log(`   ✅ Statement ${i + 1} executed`)
          }
        } catch (err) {
          console.log(`   ⚠️  Statement ${i + 1} skipped:`, err instanceof Error ? err.message : 'Unknown error')
        }
      }
    }

    console.log('\n✅ Migration completed!')
    console.log('⚠️  Note: Some statements may need to be run manually in Supabase dashboard')
    console.log('   Go to: https://supabase.com/dashboard/project/verjlcwvbvypgunwsbtu/sql/new')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration().catch(console.error)

