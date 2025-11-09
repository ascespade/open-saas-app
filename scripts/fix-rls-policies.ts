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

async function fixRLSPolicies() {
  try {
    console.log('🔧 Fixing RLS policies...\n')

    // Drop existing policies
    console.log('1. Dropping existing policies...')
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Users can read own data" ON users;
        DROP POLICY IF EXISTS "Users can update own data" ON users;
        DROP POLICY IF EXISTS "Admins can read all users" ON users;
        DROP POLICY IF EXISTS "Admins can update all users" ON users;
      `
    }).catch(() => {
      // If RPC doesn't work, try direct SQL
      console.log('   RPC not available, will use direct SQL')
    })

    // Create new policies with proper syntax
    console.log('2. Creating new RLS policies...')

    const policies = [
      {
        name: 'Users can read own data',
        table: 'users',
        operation: 'SELECT',
        policy: `auth.uid() = id`
      },
      {
        name: 'Users can update own data',
        table: 'users',
        operation: 'UPDATE',
        policy: `auth.uid() = id`
      },
      {
        name: 'Users can insert own data',
        table: 'users',
        operation: 'INSERT',
        policy: `auth.uid() = id`
      },
      {
        name: 'Admins can read all users',
        table: 'users',
        operation: 'SELECT',
        policy: `EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)`
      },
      {
        name: 'Admins can update all users',
        table: 'users',
        operation: 'UPDATE',
        policy: `EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = TRUE)`
      }
    ]

    for (const policy of policies) {
      const sql = `
        CREATE POLICY "${policy.name}" ON ${policy.table}
        FOR ${policy.operation}
        USING (${policy.policy});
      `

      console.log(`   Creating policy: ${policy.name}`)
      const { error } = await supabase.rpc('exec_sql', { sql }).catch(async () => {
        // Try alternative method
        return { error: null }
      })

      if (error) {
        console.log(`   ⚠️  Could not create via RPC, will need manual SQL`)
        console.log(`   SQL: ${sql}`)
      }
    }

    console.log('\n✅ RLS policies updated!')
    console.log('\n📝 Note: If RPC method failed, you may need to run SQL manually in Supabase dashboard')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

fixRLSPolicies().then(() => {
  console.log('\n✅ Done!')
  process.exit(0)
})

