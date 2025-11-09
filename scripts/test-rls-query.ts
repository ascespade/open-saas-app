import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!')
  process.exit(1)
}

async function testRLSQuery() {
  console.log('🔍 Testing RLS query with authenticated user...\n')

  // First, authenticate as the user
  const anonClient = createClient(supabaseUrl, supabaseAnonKey)

  console.log('1. Authenticating user...')
  const { data: authData, error: authError } = await anonClient.auth.signInWithPassword({
    email: 'khaledjamal51@gmail.com',
    password: 'A123456',
  })

  if (authError) {
    console.error('❌ Authentication failed:', authError.message)
    return
  }

  if (!authData.user) {
    console.error('❌ No user returned from authentication')
    return
  }

  console.log('✅ Authenticated as:', authData.user.email)
  console.log('   User ID:', authData.user.id)

  // Now try to query the users table with the authenticated client
  console.log('\n2. Querying users table with authenticated client...')
  const { data: userData, error: userError } = await anonClient
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (userError) {
    console.error('❌ Query failed:', userError.code, userError.message)
    console.error('   Details:', userError)

    // Check if it's an RLS issue
    if (userError.code === '42501' || userError.message?.includes('permission')) {
      console.log('\n💡 This is an RLS (Row Level Security) policy issue.')
      console.log('   The user is authenticated but cannot read from the users table.')
      console.log('   Checking RLS policies...')

      // Use service role to check if user exists
      const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      const { data: adminData, error: adminError } = await adminClient
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (adminError) {
        console.error('❌ Admin query also failed:', adminError.message)
      } else {
        console.log('✅ User exists in database (checked with admin client)')
        console.log('   User data:', adminData)
        console.log('\n💡 The RLS policy needs to be fixed.')
        console.log('   The policy should allow: auth.uid() = id')
      }
    }
  } else {
    console.log('✅ Query successful!')
    console.log('   User data:', userData)
  }

  // Test with service role (should always work)
  console.log('\n3. Testing with service role (bypasses RLS)...')
  const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: adminData, error: adminError } = await adminClient
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single()

  if (adminError) {
    console.error('❌ Admin query failed:', adminError.message)
  } else {
    console.log('✅ Admin query successful (as expected)')
    console.log('   User data:', adminData)
  }
}

testRLSQuery().then(() => {
  console.log('\n✅ Test completed!')
  process.exit(0)
}).catch((error) => {
  console.error('❌ Test failed:', error)
  process.exit(1)
})

