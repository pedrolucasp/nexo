import pg from 'pg'
import { Queue } from 'bullmq'

const { Client } = pg

const dbUrl = process.env.DATABASE_URL ?? 'postgres://user:password@localhost:5430/orbit_dev'
const targetEmail = process.env.SEED_EMAIL ?? 'porcellis@eletrotupi.com'

const REGIMENS = [
  { key: 'lamotrigina', name: 'Lamotrigina', dosage: '100 mg', periodicity: 'DAILY', time: '08:00' },
  { key: 'litio', name: 'Lítio', dosage: '300 mg', periodicity: 'DAILY', time: '21:00' },
]

// Intensity is a property of the feeling, not something worth spelling out on
// every entry
const COMPONENT_INTENSITY = {
  JOY: 'MODERATE',
  ANGER: 'HIGH',
  SADNESS: 'MODERATE',
  FEAR: 'MODERATE',
  GUILT: 'MODERATE',
  FRUSTRATION: 'MODERATE',
  CALM: 'LIGHT',
  MOTIVATED: 'MODERATE',
  TIREDNESS: 'MODERATE',
  GRATITUDE: 'MODERATE',
  FOCUS: 'MODERATE',
  RESTLESS: 'MODERATE',
  RELAXED: 'LIGHT',
  OVERWHELMED: 'HIGH',
}

// A hand-authored five-week record, oldest first. It follows one arc rather
// than random picks: a rough patch around a work deadline, a weekend out, and
// a calmer recovery. Offsets are days before today and times are local
// wall-clock strings. Entries that would land in the future are skipped.
//
// moods:       [time, mood, energy, stress, anxiety, annotation, components]
// triggers:    [time, category, comment, moodIndex, perceivedImpact]
// activities:  [time, type, duration, moodIndex, triggerIndex]
// appointments:[time, type, duration, note, moodIndex, triggerIndex]
const story = [
  {
    offset: 35,
    sleep: [6.8, 'Acordei antes do despertador'],
    moods: [
      ['08:20', 'GOOD', 6, 3, 2, 'Acordei disposto, mas ainda com sono', ['CALM', 'MOTIVATED']],
      ['13:10', 'NEUTRAL', 5, 4, 3, 'Tarde arrastada', ['FOCUS', 'TIREDNESS']],
      ['20:40', 'GOOD', 6, 3, 2, 'Jantar tranquilo em casa', ['CALM', 'RELAXED']],
    ],
    triggers: [['16:00', 'WORK', 'Reunião de alinhamento longa', 1, 3]],
    activities: [['18:30', 'WALK', 30, 2, 0]],
  },
  {
    offset: 34,
    sleep: [5.6, 'Acordei de madrugada'],
    moods: [
      ['08:40', 'SAD', 3, 5, 6, 'Noite ruim, corpo pesado', ['SADNESS', 'TIREDNESS']],
      ['14:00', 'NEUTRAL', 4, 5, 5, 'Café ajudou um pouco', ['TIREDNESS', 'FOCUS']],
    ],
    triggers: [['09:30', 'PHYSICAL', 'Noite mal dormida', 0, 4]],
  },
  {
    offset: 33,
    sleep: [7.4, 'Boa noite de sono'],
    moods: [
      ['08:15', 'GREAT', 8, 2, 2, 'Acordei bem, dia de sol', ['JOY', 'MOTIVATED']],
      ['12:45', 'GOOD', 7, 3, 2, 'Almoço com um colega', ['CALM', 'FOCUS']],
      ['21:00', 'GOOD', 6, 3, 3, 'Série e chá antes de dormir', ['RELAXED', 'CALM']],
    ],
    activities: [['07:30', 'WALK', 40, 0]],
  },
  {
    offset: 32,
    sleep: [6.9, 'Sono razoável'],
    moods: [
      ['09:00', 'NEUTRAL', 5, 4, 4, 'Rotina normal', ['FOCUS']],
      ['15:30', 'NEUTRAL', 5, 4, 4, 'Projeto andando devagar', ['TIREDNESS', 'FOCUS']],
    ],
    triggers: [['11:00', 'WORK', 'Prazo do relatório se aproximando', 0, 3]],
  },
  {
    offset: 31,
    sleep: [6.2, 'Acordei algumas vezes'],
    moods: [
      ['08:30', 'GOOD', 6, 3, 3, 'Disposto apesar do sono picado', ['CALM', 'MOTIVATED']],
      ['19:50', 'NEUTRAL', 4, 5, 4, 'Fim do dia pesado', ['TIREDNESS']],
    ],
    activities: [['18:00', 'GYM', 60, 0]],
  },
  {
    offset: 30,
    sleep: [8.1, 'Dormi muito bem'],
    moods: [
      ['09:10', 'GREAT', 8, 2, 2, 'Descansado de verdade', ['JOY', 'GRATITUDE']],
      ['14:00', 'GOOD', 7, 3, 2, 'Dia produtivo', ['FOCUS', 'MOTIVATED']],
    ],
    activities: [['17:00', 'MEDITATION', 15, 1]],
  },
  {
    offset: 29,
    sleep: [7.0, 'Boa noite'],
    moods: [
      ['08:00', 'GOOD', 6, 3, 3, 'Acordei bem', ['CALM']],
      ['12:30', 'NEUTRAL', 5, 4, 4, 'Almoço rápido', ['TIREDNESS']],
      ['21:10', 'NEUTRAL', 5, 5, 4, 'Fiquei pensando na conversa', ['RESTLESS', 'TIREDNESS']],
    ],
    triggers: [['19:00', 'FAMILY', 'Conversa tensa com meu pai', 2, 4]],
  },
  {
    offset: 28,
    sleep: [5.9, 'Acordei ansioso'],
    moods: [
      ['08:20', 'SAD', 3, 6, 6, 'Ansiedade desde cedo', ['FEAR', 'TIREDNESS']],
      ['13:00', 'NEUTRAL', 4, 5, 5, 'Consegui trabalhar um pouco', ['FOCUS', 'TIREDNESS']],
      ['20:30', 'SAD', 3, 5, 6, 'Cabeça cheia', ['OVERWHELMED', 'SADNESS']],
    ],
    triggers: [['09:10', 'INTERNAL', 'Pensamentos ansiosos', 0, 4]],
  },
  {
    offset: 27,
    sleep: [7.2, 'Dormi melhor'],
    moods: [
      ['08:00', 'NEUTRAL', 5, 4, 4, 'Ainda um pouco para baixo', ['TIREDNESS']],
      ['18:30', 'GOOD', 6, 3, 3, 'Yoga ajudou a soltar o corpo', ['CALM', 'RELAXED']],
    ],
    activities: [['18:00', 'YOGA', 45, 1]],
  },
  {
    offset: 26,
    sleep: [6.6, 'Sono ok'],
    moods: [
      ['08:30', 'GOOD', 6, 3, 3, 'Disposto', ['MOTIVATED']],
      ['13:30', 'NEUTRAL', 5, 4, 4, 'Reunião longa', ['FOCUS', 'TIREDNESS']],
    ],
    triggers: [['10:00', 'WORK', 'Reunião com cliente difícil', 0, 3]],
  },
  {
    offset: 25,
    sleep: [6.0, 'Acordei no susto'],
    moods: [
      ['08:10', 'ANGRY', 5, 8, 6, 'Trânsito e atraso', ['ANGER', 'FRUSTRATION']],
      ['14:00', 'NEUTRAL', 4, 5, 4, 'Respirei e segui o dia', ['CALM', 'FOCUS']],
      ['21:00', 'NEUTRAL', 5, 4, 4, 'Noite calma', ['RELAXED']],
    ],
    triggers: [['08:00', 'OTHER', 'Trânsito parado', 0, 4]],
  },
  {
    offset: 24,
    sleep: [7.8, 'Boa noite'],
    moods: [
      ['09:00', 'GOOD', 7, 3, 2, 'Acordei bem', ['CALM', 'MOTIVATED']],
      ['16:00', 'GREAT', 8, 2, 2, 'Notícia boa no trabalho', ['JOY', 'GRATITUDE']],
    ],
    activities: [['18:30', 'SOCIAL', 90, 1]],
  },
  {
    offset: 23,
    sleep: [7.1, 'Sono bom'],
    moods: [
      ['08:20', 'GOOD', 6, 3, 3, 'Dia de terapia', ['CALM']],
      ['14:00', 'NEUTRAL', 5, 4, 4, 'Tarde tranquila', ['FOCUS']],
      ['20:00', 'GOOD', 6, 3, 2, 'Saí da sessão mais leve', ['CALM', 'GRATITUDE']],
    ],
    activities: [['08:40', 'WALK', 30, 0]],
    appointments: [['10:00', 'ANALYST', 50, 'Sessão semanal', 2]],
  },
  {
    offset: 22,
    sleep: [5.4, 'Dormi pouco'],
    moods: [
      ['08:00', 'SAD', 2, 6, 7, 'Dormi mal e acordei ansioso', ['FEAR', 'TIREDNESS']],
      ['12:40', 'NEUTRAL', 4, 5, 5, 'Difícil concentrar', ['TIREDNESS']],
      ['20:00', 'SAD', 3, 6, 6, 'Cansaço acumulado', ['SADNESS', 'TIREDNESS']],
    ],
    triggers: [['09:00', 'WORK', 'Deadline nesta semana', 0, 5]],
  },
  {
    offset: 21,
    sleep: [5.1, 'Noite muito ruim'],
    moods: [
      ['08:10', 'ANGRY', 4, 8, 7, 'Muito estresse acumulado', ['ANGER', 'FRUSTRATION']],
      ['13:00', 'NEUTRAL', 4, 6, 6, 'Segurei a onda', ['TIREDNESS', 'RESTLESS']],
      ['21:30', 'SAD', 3, 6, 6, 'Sem energia para nada', ['OVERWHELMED', 'SADNESS']],
    ],
    triggers: [
      ['09:30', 'WORK', 'Prazo apertado no projeto', 0, 5],
      ['20:30', 'INTERNAL', 'Autocobrança', 2, 3],
    ],
  },
  {
    offset: 20,
    sleep: [5.5, 'Acordei cansado'],
    moods: [
      ['08:00', 'NEUTRAL', 4, 6, 6, 'Dia começa pesado', ['TIREDNESS', 'RESTLESS']],
      ['12:30', 'SAD', 3, 6, 7, 'Me senti para baixo', ['SADNESS']],
      ['19:30', 'SAD', 3, 5, 6, 'Queria só dormir', ['TIREDNESS', 'OVERWHELMED']],
    ],
    triggers: [['10:30', 'WORK', 'Reunião estressante', 1, 5]],
    activities: [['17:00', 'WALK', 25, 2, 0]],
    skipMeds: ['litio'],
  },
  {
    offset: 19,
    sleep: [4.8, 'Acordei várias vezes'],
    moods: [
      ['08:20', 'SAD', 2, 7, 8, 'Noite muito ruim', ['SADNESS', 'FEAR']],
      ['14:00', 'NEUTRAL', 4, 6, 6, 'Café e um pouco de sol ajudaram', ['TIREDNESS']],
      ['22:00', 'ANGRY', 4, 7, 6, 'Irritado com tudo', ['FRUSTRATION', 'RESTLESS']],
    ],
    triggers: [['11:00', 'PHYSICAL', 'Dor de cabeça forte', 0, 4]],
    skipMeds: ['litio'],
  },
  {
    offset: 18,
    sleep: [6.0, 'Dormi melhor'],
    moods: [
      ['09:00', 'NEUTRAL', 5, 5, 5, 'Ainda cansado', ['TIREDNESS']],
      ['15:00', 'NEUTRAL', 5, 4, 4, 'Entreguei o relatório', ['FOCUS']],
      ['21:00', 'GOOD', 6, 3, 3, 'Alívio depois da entrega', ['CALM', 'GRATITUDE']],
    ],
    triggers: [['14:00', 'WORK', 'Correria para entregar o relatório', 1, 3]],
    activities: [['19:00', 'MEDITATION', 10, 2]],
    skipMeds: ['lamotrigina'],
  },
  {
    offset: 17,
    sleep: [7.6, 'Boa noite'],
    moods: [
      ['08:30', 'GOOD', 6, 3, 2, 'Sensação de alívio', ['CALM', 'MOTIVATED']],
      ['13:30', 'GOOD', 6, 3, 2, 'Dia mais leve', ['FOCUS']],
    ],
    activities: [['18:00', 'GYM', 60, 0]],
  },
  {
    offset: 16,
    sleep: [7.2, 'Sono bom'],
    moods: [
      ['08:10', 'GOOD', 6, 3, 2, 'Acordei bem', ['CALM']],
      ['20:00', 'GREAT', 8, 2, 2, 'Noite tranquila com a família', ['JOY', 'GRATITUDE', 'CALM']],
    ],
  },
  {
    offset: 15,
    sleep: [7.0, 'Sono ok'],
    moods: [
      ['08:20', 'NEUTRAL', 5, 4, 4, 'Rotina', ['FOCUS']],
      ['14:00', 'GOOD', 6, 3, 3, 'Tarde produtiva', ['MOTIVATED']],
      ['21:00', 'GOOD', 6, 3, 2, 'Desenhei um pouco', ['CALM', 'RELAXED']],
    ],
    activities: [['18:30', 'CREATIVE', 60, 2]],
  },
  {
    offset: 14,
    sleep: [6.4, 'Acordei antes do alarme'],
    moods: [
      ['08:40', 'NEUTRAL', 5, 4, 4, 'Dia comum', ['TIREDNESS']],
      ['13:00', 'NEUTRAL', 5, 4, 4, 'Feedback no trabalho', ['FOCUS', 'RESTLESS']],
    ],
    triggers: [['10:00', 'WORK', 'Feedback no trabalho', 1, 3]],
  },
  {
    offset: 13,
    sleep: [7.9, 'Dormi muito bem'],
    moods: [
      ['09:00', 'GREAT', 8, 2, 2, 'Descansado', ['JOY', 'MOTIVATED']],
      ['16:00', 'GOOD', 7, 3, 2, 'Consulta foi bem', ['CALM']],
    ],
    activities: [['17:30', 'WALK', 45, 1]],
    appointments: [['11:00', 'PSYCHIATRIST', 30, 'Retorno e ajuste da Lamotrigina', 1]],
  },
  {
    offset: 12,
    sleep: [7.3, 'Boa noite'],
    moods: [
      ['08:15', 'GOOD', 6, 3, 2, 'Acordei bem', ['CALM']],
      ['13:20', 'GOOD', 6, 3, 2, 'Almoço tranquilo', ['FOCUS']],
      ['20:30', 'NEUTRAL', 5, 4, 4, 'Cansaço normal', ['TIREDNESS']],
    ],
    triggers: [['09:00', 'HEALTH', 'Consulta de rotina', 0, 2]],
  },
  {
    offset: 11,
    sleep: [6.8, 'Sono ok'],
    moods: [
      ['08:30', 'NEUTRAL', 5, 4, 4, 'Dia nublado', ['TIREDNESS']],
      ['18:00', 'GOOD', 6, 3, 3, 'Yoga no fim do dia', ['CALM', 'RELAXED']],
    ],
    activities: [['18:00', 'YOGA', 45, 1]],
  },
  {
    offset: 10,
    sleep: [7.5, 'Boa noite'],
    moods: [
      ['08:00', 'GOOD', 6, 3, 2, 'Acordei bem', ['CALM', 'MOTIVATED']],
      ['14:00', 'GREAT', 8, 2, 2, 'Bom dia no trabalho', ['JOY', 'FOCUS']],
    ],
    activities: [['19:00', 'SOCIAL', 90, 1]],
  },
  {
    offset: 9,
    sleep: [7.7, 'Dormi bem'],
    moods: [
      ['09:10', 'GOOD', 7, 3, 2, 'Fim de semana começando', ['CALM']],
      ['13:00', 'NEUTRAL', 5, 4, 4, 'Almoço em família', ['TIREDNESS']],
      ['20:00', 'GREAT', 8, 2, 2, 'Aniversário de um amigo', ['JOY', 'GRATITUDE']],
    ],
    triggers: [['15:00', 'SOCIAL', 'Aniversário de um amigo', 2, 2]],
  },
  {
    offset: 8,
    sleep: [7.1, 'Sono bom'],
    moods: [
      ['08:10', 'GOOD', 6, 3, 2, 'Acordei bem', ['CALM']],
      ['12:30', 'NEUTRAL', 5, 4, 3, 'Domingo preguiçoso', ['RELAXED']],
    ],
    activities: [['17:00', 'WALK', 30, 1]],
  },
  {
    offset: 7,
    sleep: [6.5, 'Acordei pensando na semana'],
    moods: [
      ['08:20', 'NEUTRAL', 5, 4, 4, 'Preocupação com a semana', ['RESTLESS']],
      ['13:40', 'NEUTRAL', 5, 4, 4, 'Organizei as coisas', ['FOCUS']],
      ['20:40', 'GOOD', 6, 3, 3, 'Noite tranquila', ['CALM']],
    ],
    triggers: [['09:00', 'INTERNAL', 'Preocupação com a semana', 0, 3]],
  },
  {
    offset: 6,
    sleep: [7.4, 'Boa noite'],
    moods: [
      ['08:00', 'GOOD', 6, 3, 2, 'Acordei bem', ['CALM', 'MOTIVATED']],
      ['15:00', 'GOOD', 7, 3, 2, 'Dia produtivo', ['FOCUS']],
      ['21:00', 'GREAT', 8, 2, 2, 'Treino foi ótimo', ['JOY', 'MOTIVATED']],
    ],
    activities: [['18:00', 'GYM', 60, 2]],
  },
  {
    offset: 5,
    sleep: [6.2, 'Acordei algumas vezes'],
    moods: [
      ['08:30', 'NEUTRAL', 5, 4, 4, 'Dia comum', ['TIREDNESS']],
      ['13:00', 'NEUTRAL', 5, 4, 4, 'Reunião de planejamento', ['FOCUS']],
    ],
    triggers: [['10:00', 'WORK', 'Reunião de planejamento', 1, 3]],
  },
  {
    offset: 4,
    sleep: [7.0, 'Sono bom'],
    moods: [
      ['08:15', 'GOOD', 6, 3, 2, 'Acordei bem', ['CALM']],
      ['14:00', 'GOOD', 6, 3, 3, 'Dia tranquilo', ['FOCUS']],
      ['20:00', 'GOOD', 6, 3, 2, 'Sessão de terapia', ['CALM', 'GRATITUDE']],
    ],
    activities: [['18:30', 'WALK', 30, 2]],
    appointments: [['09:30', 'ANALYST', 50, 'Sessão de terapia', 2]],
  },
  {
    offset: 3,
    sleep: [7.8, 'Dormi muito bem'],
    moods: [
      ['09:00', 'GREAT', 8, 2, 2, 'Descansado', ['JOY', 'GRATITUDE']],
      ['13:00', 'GOOD', 6, 3, 2, 'Dia leve', ['CALM']],
    ],
    activities: [['19:00', 'MEDITATION', 15, 1]],
  },
  {
    offset: 2,
    sleep: [6.9, 'Sono ok'],
    moods: [
      ['08:20', 'GOOD', 6, 3, 3, 'Acordei bem', ['CALM']],
      ['14:30', 'NEUTRAL', 5, 5, 4, 'Discussão em família', ['RESTLESS', 'TIREDNESS']],
      ['21:00', 'GOOD', 6, 3, 3, 'Conversamos e ficou tudo bem', ['CALM', 'GRATITUDE']],
    ],
    triggers: [['14:00', 'FAMILY', 'Discussão em família', 1, 4]],
  },
  {
    offset: 1,
    sleep: [7.3, 'Boa noite'],
    moods: [
      ['08:10', 'GOOD', 6, 3, 2, 'Acordei bem', ['CALM', 'MOTIVATED']],
      ['13:00', 'NEUTRAL', 5, 4, 3, 'Tarde calma', ['FOCUS']],
    ],
    activities: [['18:00', 'YOGA', 45, 1]],
  },
  {
    offset: 0,
    sleep: [7.0, 'Acordei antes do despertador'],
    moods: [
      ['08:00', 'GOOD', 6, 3, 2, 'Disposto para o dia', ['CALM', 'MOTIVATED']],
      ['13:00', 'NEUTRAL', 5, 4, 3, 'Tarde produtiva', ['FOCUS']],
    ],
    activities: [['12:30', 'WALK', 20, 1]],
  },
]

function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Mirrors the per-user jobs the API enqueues after a write, for every insight
// type, so the seeded history also fills the Insights tab
async function dispatchInsightRecalculation(userId) {
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 7)

  const week = {
    periodStart: weekStart.toISOString(),
    periodEnd: now.toISOString(),
  }

  // The daily processors derive the app-timezone day from periodStart, so the
  // current instant is enough for both fields
  const day = {
    periodStart: now.toISOString(),
    periodEnd: now.toISOString(),
  }

  const queue = new Queue('insights', {
    connection: {
      host: process.env.VALKEY_HOST ?? 'localhost',
      port: Number(process.env.VALKEY_PORT ?? 6379),
    },
    defaultJobOptions: { removeOnComplete: true },
  })

  try {
    await queue.addBulk([
      { name: 'insight:mood-trend', data: { userId, ...week } },
      { name: 'insight:energy-sleep', data: { userId, ...week } },
      { name: 'insight:trigger-pattern', data: { userId, ...week } },
      { name: 'insight:daily-energy', data: { userId, ...day } },
      { name: 'insight:daily-sleep', data: { userId, ...day } },
    ])
  } finally {
    await queue.close()
  }
}

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
    const momentAt = (offset, time) => {
      const [hours, minutes] = time.split(':').map(Number)
      const d = dayAt(offset)
      d.setHours(hours, minutes, 0, 0)
      return d
    }

    const regimens = {}
    for (const regimen of REGIMENS) {
      const { rows: inserted } = await db.query(
        `INSERT INTO medicine_regimens
           (user_id, name, dosage, periodicity, scheduled_at, active, updated_at)
         VALUES ($1, $2, $3, $4, $5, true, NOW())
         RETURNING id`,
        [userId, regimen.name, regimen.dosage, regimen.periodicity, [regimen.time]],
      )
      regimens[regimen.key] = inserted[0].id
    }

    const counts = {
      moods: 0,
      sleep: 0,
      triggers: 0,
      links: 0,
      medicine: 0,
      activities: 0,
      appointments: 0,
    }

    const insertCareAction = async (type, moment, links = {}) => {
      const { rows: inserted } = await db.query(
        `INSERT INTO care_actions
           (user_id, type, moment, trigger_id, mood_id, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         RETURNING id`,
        [userId, type, moment, links.triggerId ?? null, links.moodId ?? null],
      )
      return inserted[0].id
    }

    for (const entry of story) {
      const { offset } = entry

      if (entry.sleep) {
        const [average, annotations] = entry.sleep
        await db.query(
          `INSERT INTO sleep_records
             (user_id, average, date, annotations, updated_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [userId, average, localDateStr(dayAt(offset)), annotations],
        )
        counts.sleep++
      }

      // Moods go in first so triggers and care actions can point at them.
      const moodIds = []
      for (const [time, mood, energy, stress, anxiety, annotation, components = []] of entry.moods ?? []) {
        const moment = momentAt(offset, time)
        if (moment > now) continue

        const { rows: inserted } = await db.query(
          `INSERT INTO moods
             (user_id, selected_mood, energy_level, stress_level, anxiety_level, annotation, moment, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           RETURNING id`,
          [userId, mood, energy, stress, anxiety, annotation, moment],
        )
        const moodId = inserted[0].id
        moodIds.push(moodId)

        for (const component of components) {
          await db.query(
            'INSERT INTO mood_components (mood_id, component, intensity) VALUES ($1, $2, $3)',
            [moodId, component, COMPONENT_INTENSITY[component] ?? 'MODERATE'],
          )
        }
        counts.moods++
      }

      const triggerIds = []
      for (const [time, category, comment, moodIndex, impact] of entry.triggers ?? []) {
        const moment = momentAt(offset, time)
        if (moment > now) continue

        const { rows: inserted } = await db.query(
          `INSERT INTO triggers (user_id, category, moment, comment, updated_at)
           VALUES ($1, $2, $3, $4, NOW())
           RETURNING id`,
          [userId, category, moment, comment],
        )
        const triggerId = inserted[0].id
        triggerIds.push(triggerId)

        const moodId = moodIndex == null ? undefined : moodIds[moodIndex]
        if (moodId) {
          await db.query(
            'INSERT INTO trigger_mood_links (trigger_id, mood_id, perceived_impact) VALUES ($1, $2, $3)',
            [triggerId, moodId, impact ?? 3],
          )
          counts.links++
        }
        counts.triggers++
      }

      // The two daily medicines, skipped on the days the entry calls out.
      for (const regimen of REGIMENS) {
        if ((entry.skipMeds ?? []).includes(regimen.key)) continue

        const moment = momentAt(offset, regimen.time)
        if (moment > now) continue

        const careActionId = await insertCareAction('MEDICINE', moment)
        await db.query(
          'INSERT INTO medicine_logs (care_action_id, regimen_id, taken_at) VALUES ($1, $2, $3)',
          [careActionId, regimens[regimen.key], moment],
        )
        counts.medicine++
      }

      for (const [time, type, duration, moodIndex, triggerIndex] of entry.activities ?? []) {
        const moment = momentAt(offset, time)
        if (moment > now) continue

        const careActionId = await insertCareAction('ACTIVITY', moment, {
          moodId: moodIndex == null ? undefined : moodIds[moodIndex],
          triggerId: triggerIndex == null ? undefined : triggerIds[triggerIndex],
        })
        await db.query(
          'INSERT INTO activities (care_action_id, type, duration) VALUES ($1, $2, $3)',
          [careActionId, type, duration],
        )
        counts.activities++
      }

      for (const [time, type, duration, note, moodIndex, triggerIndex] of entry.appointments ?? []) {
        const moment = momentAt(offset, time)
        if (moment > now) continue

        const careActionId = await insertCareAction('APPOINTMENT', moment, {
          moodId: moodIndex == null ? undefined : moodIds[moodIndex],
          triggerId: triggerIndex == null ? undefined : triggerIds[triggerIndex],
        })
        await db.query(
          'INSERT INTO appointments (care_action_id, type, duration, note) VALUES ($1, $2, $3, $4)',
          [careActionId, type, duration, note],
        )
        counts.appointments++
      }
    }

    const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
    console.log(`Seeded demo data for ${targetEmail} (id ${user.id}, ${name})`)
    console.log(counts)

    try {
      await dispatchInsightRecalculation(userId)
      console.log('Queued insight recalculation')
    } catch (err) {
      console.error(
        'Seeded the data, but could not queue insight recalculation:',
        err.message,
      )
      process.exitCode = 1
    }
  } finally {
    await db.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
