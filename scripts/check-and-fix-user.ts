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

async function checkAndFixUser(email: string) {
  try {
    console.log(`🔍 Checking for user: ${email}`)

    // Get auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    const authUser = authUsers.users.find(u => u.email === email)

    if (!authUser) {
      console.log(`❌ User ${email} not found in auth.users`)
      return
    }

    console.log(`✅ Found auth user: ${authUser.id}`)

    // Check if user exists in users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') {
        console.log('⚠️  User record not found in users table. Creating...')

        // Create user record
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email || null,
            username: null,
            is_admin: false,
            credits: 3,
          })
          .select()
          .single()

        if (createError) {
          console.error('❌ Error creating user record:', createError)
          return
        }

        console.log('✅ User record created successfully!')
        console.log('📋 User data:', newUser)
      } else {
        console.error('❌ Error checking user:', userError)
      }
    } else {
      console.log('✅ User record exists in users table')
      console.log('📋 User data:', user)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

const email = process.argv[2] || 'khaledjamal51@gmail.com'
checkAndFixUser(email).then(() => {
  console.log('\n✅ Done!')
  process.exit(0)
})

