import pg from 'pg'
import bcrypt from 'bcryptjs'

const { Client } = pg

const dbUrl = process.env.DATABASE_URL
const email = process.env.SEED_EMAIL ?? 'e2e@example.com'
const password = process.env.SEED_PASSWORD ?? 'e2e-password'

if (!dbUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const db = new Client({ connectionString: dbUrl })
await db.connect()

const hash = bcrypt.hashSync(password, 10)
const { rows } = await db.query(
  `INSERT INTO users (first_name, last_name, email, encrypted_password, active, updated_at)
   VALUES ($1, $2, $3, $4, true, NOW())
   ON CONFLICT (email) DO UPDATE
     SET encrypted_password = EXCLUDED.encrypted_password,
         active = true,
         updated_at = NOW()
   RETURNING id, email`,
  ['E2E', 'User', email, hash],
)

await db.end()

console.log(`Seeded user: ${rows[0].email} (id ${rows[0].id})`)
