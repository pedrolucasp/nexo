import pg from 'pg'

const { Client } = pg

const dbUrl = process.env.DATABASE_URL ?? 'postgres://user:password@localhost:5430/orbit_dev'
const targetEmail = process.env.SEED_EMAIL ?? 'porcellis@eletrotupi.com'
const DAYS = 35

// Reproducible PRNG so the demo dataset is stable between runs.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20261019)

const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const between = (min, max) => Math.floor(rand() * (max - min + 1)) + min
const round1 = (n) => Math.round(n * 10) / 10

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ---- mood ----
function pickMood() {
  const r = rand()
  if (r < 0.15) return 'GREAT'
  if (r < 0.5) return 'GOOD'
  if (r < 0.75) return 'NEUTRAL'
  if (r < 0.9) return 'SAD'
  return 'ANGRY'
}

const MOOD_LEVELS = {
  GREAT: { energy: [7, 9], stress: [1, 3], anxiety: [1, 3] },
  GOOD: { energy: [6, 8], stress: [2, 4], anxiety: [2, 4] },
  NEUTRAL: { energy: [4, 6], stress: [3, 5], anxiety: [3, 5] },
  SAD: { energy: [2, 4], stress: [4, 6], anxiety: [5, 7] },
  ANGRY: { energy: [4, 6], stress: [7, 9], anxiety: [6, 8] },
}

const MOOD_COMPONENTS = {
  GREAT: ['JOY', 'GRATITUDE', 'MOTIVATED', 'CALM'],
  GOOD: ['CALM', 'FOCUS', 'RELAXED', 'MOTIVATED'],
  NEUTRAL: ['CALM', 'TIREDNESS', 'FOCUS', 'RELAXED'],
  SAD: ['SADNESS', 'TIREDNESS', 'OVERWHELMED', 'GUILT', 'FEAR'],
  ANGRY: ['ANGER', 'FRUSTRATION', 'RESTLESS'],
}

const MOOD_ANNOTATIONS = {
  GREAT: ['Dia muito produtivo', 'Acordei bem disposto', 'Me senti leve e animado', null],
  GOOD: ['Dia tranquilo', 'Boa noite de sono', 'Trabalho rendeu bem', null],
  NEUTRAL: ['Nada de especial hoje', 'Rotina normal', 'Cansado, mas ok', null],
  SAD: ['Noite mal dormida', 'Me senti para baixo', 'Sem energia hoje', null],
  ANGRY: ['Estresse no trabalho', 'Briga em casa', 'Trânsito me irritou', null],
}

const INTENSITIES = ['LIGHT', 'MODERATE', 'HIGH']

function componentsFor(mood) {
  const pool = MOOD_COMPONENTS[mood]
  const count = between(1, Math.min(3, pool.length))
  const chosen = new Set()
  while (chosen.size < count) chosen.add(pick(pool))

  return [...chosen].map((component) => {
    let intensity = pick(INTENSITIES)
    if (['ANGER', 'FEAR', 'OVERWHELMED', 'FRUSTRATION'].includes(component) && intensity === 'LIGHT') {
      intensity = 'MODERATE'
    }
    if (['CALM', 'RELAXED'].includes(component) && intensity === 'HIGH') {
      intensity = 'MODERATE'
    }
    return { component, intensity }
  })
}

// ---- sleep ----
const SLEEP_NOTES = ['Boa noite de sono', 'Acordei de madrugada', 'Demorei para pegar no sono', 'Sono leve', null]

// ---- triggers ----
const TRIGGER_POOL = [
  { category: 'WORK', comment: 'Reunião estressante no trabalho' },
  { category: 'WORK', comment: 'Prazo apertado no projeto' },
  { category: 'FAMILY', comment: 'Discussão em família' },
  { category: 'PHYSICAL', comment: 'Noite mal dormida' },
  { category: 'PHYSICAL', comment: 'Dor de cabeça forte' },
  { category: 'INTERNAL', comment: 'Pensamentos ansiosos' },
  { category: 'INTERNAL', comment: 'Sentimento de culpa' },
  { category: 'SOCIAL', comment: 'Encontro com amigos' },
  { category: 'SOCIAL', comment: 'Evento social no fim de semana' },
  { category: 'HEALTH', comment: 'Consulta de rotina' },
  { category: 'THERAPY', comment: 'Sessão de terapia' },
  { category: 'FAMILY', comment: 'Visita de parentes' },
]

// ---- medicine ----
const REGIMENS = [
  { name: 'Lítio', dosage: '300 mg', periodicity: 'DAILY', scheduledAt: ['20:00'] },
  { name: 'Lamotrigina', dosage: '100 mg', periodicity: 'DAILY', scheduledAt: ['08:00'] },
]

// ---- activities ----
const ACTIVITY_POOL = [
  { type: 'WALK', duration: 30 },
  { type: 'WALK', duration: 45 },
  { type: 'MEDITATION', duration: 15 },
  { type: 'GYM', duration: 60 },
  { type: 'YOGA', duration: 45 },
  { type: 'CREATIVE', duration: 60 },
  { type: 'SOCIAL', duration: 90 },
]

async function main() {
  const db = new Client({ connectionString: dbUrl })
  await db.connect()

  try {
    const { rows } = await db.query(
      'SELECT id, first_name, last_name FROM users WHERE email = $1',
      [targetEmail],
    )
    if (rows.length === 0) {
      console.error(`User ${targetEmail} not found`)
      process.exitCode = 1
      return
    }

    const user = rows[0]
    const userId = user.id

    // Wipe existing demo data, children first (FK-safe order).
    await db.query('DELETE FROM care_actions WHERE user_id = $1', [userId])
    await db.query('DELETE FROM medicine_regimens WHERE user_id = $1', [userId])
    await db.query('DELETE FROM triggers WHERE user_id = $1', [userId])
    await db.query('DELETE FROM sleep_records WHERE user_id = $1', [userId])
    await db.query('DELETE FROM moods WHERE user_id = $1', [userId])
    await db.query('DELETE FROM insights WHERE user_id = $1', [userId])

    const now = new Date()
    const dayAt = (offset) => {
      const d = new Date(now)
      d.setDate(now.getDate() - offset)
      return d
    }

    const counts = { moods: 0, sleep: 0, triggers: 0, medicine: 0, activities: 0 }

    // moods
    for (let d = DAYS; d >= 0; d--) {
      const r = rand()
      const count = r < 0.05 ? 0 : r < 0.5 ? 1 : r < 0.85 ? 2 : 3

      for (let i = 0; i < count; i++) {
        const mood = pickMood()
        const levels = MOOD_LEVELS[mood]

        const moment = new Date(dayAt(d))
        moment.setHours(pick([9, 12, 15, 18, 21]) + between(0, 2), between(0, 59), 0, 0)

        const res = await db.query(
          `INSERT INTO moods
             (user_id, selected_mood, energy_level, stress_level, anxiety_level, annotation, moment)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [
            userId,
            mood,
            between(...levels.energy),
            between(...levels.stress),
            between(...levels.anxiety),
            pick(MOOD_ANNOTATIONS[mood]),
            moment,
          ],
        )

        for (const c of componentsFor(mood)) {
          await db.query(
            'INSERT INTO mood_components (mood_id, component, intensity) VALUES ($1, $2, $3)',
            [res.rows[0].id, c.component, c.intensity],
          )
        }
        counts.moods++
      }
    }

    // sleep records — one per night
    for (let d = DAYS; d >= 0; d--) {
      const day = dayAt(d)
      const average = round1(5.5 + rand() * 3)
      const note = pick(SLEEP_NOTES)
      await db.query(
        'INSERT INTO sleep_records (user_id, average, date, annotations, updated_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, average, localDateStr(day), note],
      )
      counts.sleep++
    }

    // triggers
    for (let i = 0; i < TRIGGER_POOL.length; i++) {
      const t = TRIGGER_POOL[i]
      const moment = new Date(dayAt(between(0, DAYS)))
      moment.setHours(between(8, 21), between(0, 59), 0, 0)
      await db.query(
        'INSERT INTO triggers (user_id, category, moment, comment, updated_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, t.category, moment, t.comment],
      )
      counts.triggers++
    }

    // medicine regimens + logs
    for (const r of REGIMENS) {
      const reg = await db.query(
        `INSERT INTO medicine_regimens (user_id, name, dosage, periodicity, scheduled_at, active, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING id`,
        [userId, r.name, r.dosage, r.periodicity, r.scheduledAt],
      )
      const regimenId = reg.rows[0].id

      for (let d = DAYS; d >= 0; d--) {
        if (rand() < 0.25) continue

        const moment = new Date(dayAt(d))
        const [h, m] = pick(r.scheduledAt).split(':').map(Number)
        moment.setHours(h, m, 0, 0)

        const ca = await db.query(
          "INSERT INTO care_actions (user_id, type, moment, updated_at) VALUES ($1, 'MEDICINE', $2, NOW()) RETURNING id",
          [userId, moment],
        )
        await db.query(
          'INSERT INTO medicine_logs (care_action_id, regimen_id, taken_at) VALUES ($1, $2, $3)',
          [ca.rows[0].id, regimenId, moment],
        )
        counts.medicine++
      }
    }

    // activities
    for (let i = 0; i < 10; i++) {
      const a = pick(ACTIVITY_POOL)
      const moment = new Date(dayAt(between(0, DAYS)))
      moment.setHours(between(7, 20), between(0, 59), 0, 0)

      const ca = await db.query(
        "INSERT INTO care_actions (user_id, type, moment, updated_at) VALUES ($1, 'ACTIVITY', $2, NOW()) RETURNING id",
        [userId, moment],
      )
      await db.query(
        'INSERT INTO activities (care_action_id, type, duration) VALUES ($1, $2, $3)',
        [ca.rows[0].id, a.type, a.duration],
      )
      counts.activities++
    }

    const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
    console.log(`Seeded demo data for ${targetEmail} (id ${user.id}, ${name})`)
    console.log(counts)
  } finally {
    await db.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
