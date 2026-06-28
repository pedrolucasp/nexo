import { eachDayOfInterval, format } from 'date-fns'
import { prisma } from '@app/lib/prisma'
import {
  BaseMoodOption,
  MoodComponentOption,
  IntensityLevel,
} from '@prisma/client'

export type ReportData = {
  user: { firstName: string; lastName: string | null }
  periodStart: Date
  periodEnd: Date
  totalCheckins: number
  moodDistribution: Array<{
    mood: BaseMoodOption
    count: number
    pct: number
  }>
  dailyMoods: Array<{ date: string; mood: BaseMoodOption | null }>
  topComponents: Array<{
    component: MoodComponentOption
    count: number
    avgIntensity: IntensityLevel
  }>
  checkinLog: Array<{
    moment: Date
    mood: BaseMoodOption
    anxietyLevel: number
    stressLevel: number
    energyLevel: number
    annotation: string | null
  }>
}

const MOOD_ORDER: BaseMoodOption[] = [
  'GREAT', 'GOOD', 'NEUTRAL', 'SAD', 'ANGRY',
]


export async function buildReportData(
  userId: number,
  start: Date,
  end: Date,
): Promise<ReportData> {
  const [user, moods] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    }),
    prisma.mood.findMany({
      where: {
        userId,
        moment: { gte: start, lte: end },
      },
      include: { moodComponents: true },
      orderBy: { moment: 'desc' },
    }),
  ])

  const total = moods.length

  const moodCounts = Object.fromEntries(
    MOOD_ORDER.map(m => [m, 0]),
  ) as Record<BaseMoodOption, number>

  for (const m of moods) moodCounts[m.selectedMood]++

  const moodDistribution = MOOD_ORDER.map(mood => ({
    mood,
    count: moodCounts[mood],
    pct: total === 0 ? 0 : Math.round((moodCounts[mood] / total) * 1000) / 10,
  }))

  const byDate = new Map<string, typeof moods[number][]>()
  for (const m of moods) {
    const key = format(m.moment, 'yyyy-MM-dd')
    const group = byDate.get(key) ?? []
    group.push(m)
    byDate.set(key, group)
  }

  const days = eachDayOfInterval({ start, end })
  const dailyMoods = days.map(day => {
    const key = format(day, 'yyyy-MM-dd')
    const group = byDate.get(key)
    if (!group || group.length === 0) return { date: key, mood: null }
    const last = group.reduce((a, b) =>
      b.moment > a.moment ? b : a,
    )
    return { date: key, mood: last.selectedMood }
  })

  const componentGroups = new Map<
    MoodComponentOption,
    IntensityLevel[]
  >()
  for (const m of moods) {
    for (const c of m.moodComponents) {
      const arr = componentGroups.get(c.component) ?? []
      arr.push(c.intensity)
      componentGroups.set(c.component, arr)
    }
  }

  const topComponents = Array.from(componentGroups.entries())
    .map(([component, intensities]) => {
      const freq = new Map<IntensityLevel, number>()
      for (const i of intensities) freq.set(i, (freq.get(i) ?? 0) + 1)
      const avgIntensity = Array.from(freq.entries()).reduce((a, b) =>
        b[1] > a[1] ? b : a,
      )[0]
      return { component, count: intensities.length, avgIntensity }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const checkinLog = moods.slice(0, 50).map(m => ({
    moment: m.moment,
    mood: m.selectedMood,
    anxietyLevel: m.anxietyLevel,
    stressLevel: m.stressLevel,
    energyLevel: m.energyLevel,
    annotation: m.annotation,
  }))

  return {
    user,
    periodStart: start,
    periodEnd: end,
    totalCheckins: total,
    moodDistribution,
    dailyMoods,
    topComponents,
    checkinLog,
  }
}
