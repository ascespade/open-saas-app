/**
 * Apply RLS fix directly using pg library
 */

import { Client } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { config } from 'dotenv'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not configured!')
  process.exit(1)
}

async function applyRLSFix() {
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    console.log('🔌 Connecting to database...')
    await client.connect()
    console.log('✅ Connected!')

    // Read the fix SQL
    const fixSqlPath = resolve(process.cwd(), 'scripts/fix-rls-infinite-recursion.sql')
    const fixSql = readFileSync(fixSqlPath, 'utf-8')

    console.log('\n🔧 Applying RLS fix...')

    // Execute the SQL
    await client.query(fixSql)

    console.log('✅ RLS fix applied successfully!')

  } catch (error: any) {
    console.error('❌ Error applying RLS fix:', error.message)
    if (error.code === '42P17') {
      console.error('   This error suggests the fix is already partially applied')
      console.error('   or there\'s still a recursion issue')
    }
    throw error
  } finally {
    await client.end()
  }
}

applyRLSFix()
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error)
    process.exit(1)
  })

