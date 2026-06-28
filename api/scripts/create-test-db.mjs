import pg from 'pg'

const { Client } = pg

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const url = new URL(dbUrl)
const dbName = url.pathname.slice(1)
url.pathname = '/postgres'

const client = new Client({ connectionString: url.toString() })
await client.connect()
await client.query(`CREATE DATABASE "${dbName}"`).catch((err) => {
  if (err.code !== '42P04') throw err // 42P04 = database already exists
})
await client.end()

console.log(`Database "${dbName}" is ready.`)
