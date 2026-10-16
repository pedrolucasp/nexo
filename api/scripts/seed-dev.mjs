import pg from 'pg'
import bcrypt from 'bcryptjs'

const { Client } = pg

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const DEFAULT_EMAIL = process.env.SEED_EMAIL ?? 'e2e@example.com'
const DEFAULT_PASSWORD = process.env.SEED_PASSWORD ?? 'e2e-password'

// One user per lifecycle state, so the manual verification checklist can jump
// straight to a state instead of re-running signup -> email -> code every time.
const users = [
  {
    firstName: 'E2E',
    lastName: 'User',
    email: DEFAULT_EMAIL,
    password: DEFAULT_PASSWORD,
    active: true,
    onboardingSeen: true,
    activationCode: null,
  },
  {
    firstName: 'Inactive',
    lastName: 'User',
    email: 'inactive@example.com',
    password: 'inactive-password',
    active: false,
    onboardingSeen: false,
    activationCode: '123456',
  },
  {
    firstName: 'Onboarding',
    lastName: 'User',
    email: 'onboarding@example.com',
    password: 'onboarding-password',
    active: true,
    onboardingSeen: false,
    activationCode: null,
  },
]

const db = new Client({ connectionString: dbUrl })
await db.connect()

for (const user of users) {
  const hash = bcrypt.hashSync(user.password, 10)

  // The seeded activation code stays valid for a year so the inactive fixture
  // does not silently rot between runs.
  const codeExpiresAt = user.activationCode
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    : null

  const { rows } = await db.query(
    `INSERT INTO users (
       first_name, last_name, email, encrypted_password, active,
       activation_code, activation_code_expires_at,
       onboarding_seen_at, terms_accepted_at, terms_version, updated_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), '1', NOW())
     ON CONFLICT (email) DO UPDATE
       SET encrypted_password = EXCLUDED.encrypted_password,
           active = EXCLUDED.active,
           activation_code = EXCLUDED.activation_code,
           activation_code_expires_at = EXCLUDED.activation_code_expires_at,
           onboarding_seen_at = EXCLUDED.onboarding_seen_at,
           terms_accepted_at = NOW(),
           terms_version = '1',
           updated_at = NOW()
     RETURNING id, email`,
    [
      user.firstName,
      user.lastName,
      user.email,
      hash,
      user.active,
      user.activationCode,
      codeExpiresAt,
      user.onboardingSeen ? new Date() : null,
    ],
  )

  const suffix = user.activationCode ? ` code=${user.activationCode}` : ''
  console.log(
    `Seeded ${rows[0].email} (id ${rows[0].id}) ` +
      `active=${user.active} onboardingSeen=${user.onboardingSeen}${suffix}`,
  )
}

await db.end()
