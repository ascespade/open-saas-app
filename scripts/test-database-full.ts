#!/usr/bin/env ts-node
import { Client } from 'pg'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_jG4FaWR3cmtr@ep-lucky-lake-a2y94m4a-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

async function testDatabase() {
  const client = new Client({ connectionString: DATABASE_URL })
  try {
    await client.connect()
    console.log('✅ Connected to database')

    // Test INSERT
    const testUser = await client.query(`
      INSERT INTO users (id, email, username, credits)
      VALUES (gen_random_uuid(), 'test@example.com', 'testuser', 5)
      RETURNING id, email, username, credits
    `)
    console.log('✅ INSERT test:', testUser.rows[0])

    // Test SELECT
    const users = await client.query('SELECT * FROM users WHERE email = $1', ['test@example.com'])
    console.log('✅ SELECT test:', users.rows.length, 'user(s) found')

    // Test UPDATE
    await client.query('UPDATE users SET credits = $1 WHERE email = $2', [10, 'test@example.com'])
    const updated = await client.query('SELECT credits FROM users WHERE email = $1', ['test@example.com'])
    console.log('✅ UPDATE test: credits =', updated.rows[0].credits)

    // Test DELETE
    await client.query('DELETE FROM users WHERE email = $1', ['test@example.com'])
    const deleted = await client.query('SELECT * FROM users WHERE email = $1', ['test@example.com'])
    console.log('✅ DELETE test:', deleted.rows.length === 0 ? 'User deleted' : 'Error')

    // Test foreign keys
    const fkTest = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.table_constraints 
      WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public'
    `)
    console.log('✅ Foreign keys:', fkTest.rows[0].count)

    // Test indexes
    const idxTest = await client.query(`
      SELECT COUNT(*) as count FROM pg_indexes 
      WHERE schemaname = 'public'
    `)
    console.log('✅ Indexes:', idxTest.rows[0].count)

    console.log('\n✅ All database tests passed!')
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

testDatabase().catch(console.error)
