import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Svg,
  Rect,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BaseMoodOption, IntensityLevel, MoodComponentOption } from '@prisma/client'
import { ReportData } from './report.data'
import { LOGO_DATA_URI } from './logo'

const T = {
  title: 'Relatório de Humor e Bem-Estar',
  appName: 'Nexo',
  tagline: 'Nexo · Rastreador de humor — usenexo.xyz',
  confidential: 'Confidencial — uso clínico',
  sections: {
    glance: 'Visão Geral do Período',
    distribution: 'Distribuição de Humor',
    heatmap: 'Mapa de Calor Diário',
    components: 'Sentimentos & Emoções',
    log: 'Registros e níveis (ansiedade, energia e estresse)',
  },
  stats: {
    checkins: 'Check-ins',
    topMood: 'Humor predominante',
    daysTracked: 'Dias rastreados',
  },
  moods: {
    GREAT: 'Ótimo', GOOD: 'Bom', NEUTRAL: 'Neutro',
    SAD: 'Triste', ANGRY: 'Irritado',
  } as Record<BaseMoodOption, string>,
  intensity: {
    LIGHT: 'Leve', MODERATE: 'Moderado', HIGH: 'Alto',
  } as Record<IntensityLevel, string>,
  components: {
    JOY: 'Alegria', ANGER: 'Raiva', SADNESS: 'Tristeza',
    FEAR: 'Medo', GUILT: 'Culpa', FRUSTRATION: 'Frustração',
    CALM: 'Calma', MOTIVATED: 'Motivação', TIREDNESS: 'Cansaço',
    GRATITUDE: 'Gratidão', FOCUS: 'Foco', RESTLESS: 'Agitação',
    RELAXED: 'Relaxado', OVERWHELMED: 'Sobrecarga',
  } as Record<MoodComponentOption, string>,
  tableHeaders: {
    component: 'Componente', count: 'Qtd', avgIntensity: 'Int. Média',
    date: 'Data', mood: 'Humor', anxiety: 'Ans', stress: 'Est',
    energy: 'Ene', note: 'Nota',
  },
}

const MOOD_COLORS: Record<BaseMoodOption, string> = {
  GREAT: '#378ADD',
  GOOD: '#639922',
  NEUTRAL: '#888780',
  SAD: '#1D9E75',
  ANGRY: '#D85A30',
}

const INTENSITY_COLORS: Record<IntensityLevel, string> = {
  LIGHT: '#639922',
  MODERATE: '#BA7517',
  HIGH: '#D85A30',
}

const EMPTY_CELL = '#E8E7E2'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    color: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
  },
  headerLogo: {
    width: 48,
    height: 48,
    objectFit: 'contain',
  },
  headerSub: {
    fontSize: 8,
    color: '#666666',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: 'column',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#888888',
  },
  section: {
    marginTop: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
  },
  statLabel: {
    fontSize: 7,
    color: '#888888',
    marginBottom: 3,
  },
  statValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    width: 60,
    fontSize: 8,
  },
  barPct: {
    width: 32,
    fontSize: 8,
    textAlign: 'right',
    color: '#666666',
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  heatmapWeekLabel: {
    width: 24,
    fontSize: 7,
    color: '#888888',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tableCell: {
    fontSize: 7,
  },
  footnote: {
    fontSize: 6,
    color: '#aaaaaa',
    marginTop: 6,
    fontFamily: 'Helvetica-Oblique',
  },
})

function formatPeriod(start: Date, end: Date): string {
  const s = format(start, 'd MMM', { locale: ptBR })
  const e = format(end, 'd MMM yyyy', { locale: ptBR })
  return `${s} – ${e}`
}

function truncate(str: string | null, max: number): string {
  if (!str) return '—'
  return str.length > max ? str.slice(0, max) + '…' : str
}

function topMoodLabel(dist: ReportData['moodDistribution']): string {
  const top = [...dist].sort((a, b) => b.count - a.count)[0]
  return top && top.count > 0 ? T.moods[top.mood] : '—'
}

type SectionHeaderProps = { label: string }
function SectionHeader({ label }: SectionHeaderProps) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{label}</Text>
    </View>
  )
}

type StatBoxProps = { label: string; value: string }
function StatBox({ label, value }: StatBoxProps) {
  return (
    <View style={s.statBox}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  )
}

const BAR_MAX_WIDTH = 350

type MoodBarProps = {
  mood: BaseMoodOption
  count: number
  pct: number
  maxPct: number
}
function MoodBar({ mood, count, pct, maxPct }: MoodBarProps) {
  const barWidth = maxPct > 0 ? (pct / maxPct) * BAR_MAX_WIDTH : 0
  const color = MOOD_COLORS[mood]
  return (
    <View style={s.barRow}>
      <Text style={s.barLabel}>{T.moods[mood]}</Text>
      <Svg width={BAR_MAX_WIDTH} height={12}>
        <Rect x={0} y={2} width={BAR_MAX_WIDTH} height={8}
          rx={2} fill={EMPTY_CELL} />
        {barWidth > 0 && (
          <Rect x={0} y={2} width={barWidth} height={8}
            rx={2} fill={color} />
        )}
      </Svg>
      <Text style={s.barPct}>{pct}%</Text>
      <Text style={[s.barPct, { width: 24 }]}>{count}</Text>
    </View>
  )
}

const CELL = 52
const GAP = 4

type HeatmapRowProps = {
  week: number
  cells: Array<{ date: string; mood: BaseMoodOption | null }>
  startDow: number
}
function HeatmapRow({ week, cells, startDow }: HeatmapRowProps) {
  const totalCols = 7
  const svgWidth = totalCols * (CELL + GAP)

  return (
    <View style={s.heatmapRow}>
      <Text style={s.heatmapWeekLabel}>S{week}</Text>
      <Svg width={svgWidth} height={CELL}>
        {Array.from({ length: totalCols }).map((_, col) => {
          const dayIndex = col - startDow
          const cell = dayIndex >= 0 ? cells[dayIndex] : undefined
          const fill = cell
            ? cell.mood ? MOOD_COLORS[cell.mood] : EMPTY_CELL
            : '#f8f8f8'
          return (
            <Rect
              key={col}
              x={col * (CELL + GAP)}
              y={0}
              width={CELL}
              height={CELL}
              rx={3}
              fill={fill}
            />
          )
        })}
      </Svg>
    </View>
  )
}

type TableHeaderProps = { cols: string[]; widths: number[] }
function TableHeader({ cols, widths }: TableHeaderProps) {
  return (
    <View style={s.tableHeaderRow}>
      {cols.map((col, i) => (
        <Text key={i}
          style={[s.tableCell, { width: widths[i], fontFamily: 'Helvetica-Bold' }]}>
          {col}
        </Text>
      ))}
    </View>
  )
}

type TableRowProps = {
  cols: string[]
  widths: number[]
  even: boolean
  colors?: (string | undefined)[]
}
function TableRow({ cols, widths, even, colors }: TableRowProps) {
  return (
    <View style={[s.tableRow, { backgroundColor: even ? '#F8F7F4' : '#ffffff' }]}>
      {cols.map((col, i) => (
        <Text key={i}
          style={[s.tableCell, { width: widths[i], color: colors?.[i] ?? '#1a1a1a' }]}>
          {col}
        </Text>
      ))}
    </View>
  )
}

type PageHeaderProps = { data: ReportData }
function PageHeader({ data }: PageHeaderProps) {
  const name = [data.user.firstName, data.user.lastName].filter(Boolean).join(' ')
  const period = formatPeriod(data.periodStart, data.periodEnd)
  return (
    <View style={s.header}>
      <View>
        <Text style={s.headerTitle}>{T.title}</Text>
        <Text style={s.headerSub}>{name} · {period}</Text>
      </View>

      <Image src={LOGO_DATA_URI} style={s.headerLogo} />
    </View>
  )
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <View style={s.footerRow}>
        <Text style={s.footerText}>{T.tagline}</Text>
        <Text
          style={s.footerText}
          render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
            `${pageNumber} / ${totalPages}`
          }
        />
      </View>
      <Text style={[s.footerText, { marginTop: 2 }]}>{T.confidential}</Text>
    </View>
  )
}

function buildHeatmapWeeks(
  dailyMoods: ReportData['dailyMoods'],
): Array<{
  week: number
  cells: Array<{ date: string; mood: BaseMoodOption | null }>
  startDow: number
}> {
  const weeks: ReturnType<typeof buildHeatmapWeeks> = []
  let weekNum = 1
  let i = 0

  if (dailyMoods.length === 0) return weeks

  const firstDow = new Date(dailyMoods[0].date + 'T12:00:00').getDay()

  while (i < dailyMoods.length) {
    const slots = 7 - (weekNum === 1 ? firstDow : 0)
    const cells = dailyMoods.slice(i, i + slots)

    weeks.push({ week: weekNum, cells, startDow: weekNum === 1 ? firstDow : 0 })
    i += slots
    weekNum++
  }

  return weeks
}

type Props = { data: ReportData }

export default function ReportDocument({ data }: Props) {
  const maxPct = Math.max(...data.moodDistribution.map(d => d.pct), 0)
  const daysTracked = data.dailyMoods.filter(d => d.mood !== null).length
  const heatmapWeeks = buildHeatmapWeeks(data.dailyMoods)

  return (
    <Document>
      {/* Page 1 */}
      <Page size="A4" style={s.page}>
        <PageHeader data={data} />
        <PageFooter />

        <SectionHeader label={T.sections.glance} />
        <View style={s.statRow}>
          <StatBox label={T.stats.checkins} value={String(data.totalCheckins)} />
          <StatBox label={T.stats.topMood} value={topMoodLabel(data.moodDistribution)} />
          <StatBox label={T.stats.daysTracked} value={String(daysTracked)} />
          <StatBox
            label="Período"
            value={`${data.dailyMoods.length}d`}
          />
        </View>

        <SectionHeader label={T.sections.distribution} />
        {data.moodDistribution.map(d => (
          <MoodBar
            key={d.mood}
            mood={d.mood}
            count={d.count}
            pct={d.pct}
            maxPct={maxPct}
          />
        ))}

        <SectionHeader label={T.sections.heatmap} />
        {heatmapWeeks.map(({ week, cells, startDow }) => (
          <HeatmapRow key={week} week={week} cells={cells} startDow={startDow} />
        ))}
      </Page>

      {/* Page 2 */}
      <Page size="A4" style={s.page}>
        <PageHeader data={data} />
        <PageFooter />

        <SectionHeader label={T.sections.components} />
        {data.topComponents.length > 0 ? (
          <View>
            <TableHeader
              cols={[
                T.tableHeaders.component,
                T.tableHeaders.count,
                T.tableHeaders.avgIntensity,
              ]}
              widths={[200, 60, 100]}
            />
            {data.topComponents.map((c, i) => (
              <TableRow
                key={c.component}
                even={i % 2 === 1}
                cols={[
                  T.components[c.component] ?? c.component,
                  String(c.count),
                  T.intensity[c.avgIntensity],
                ]}
                widths={[200, 60, 100]}
                colors={[
                  undefined,
                  undefined,
                  INTENSITY_COLORS[c.avgIntensity],
                ]}
              />
            ))}
          </View>
        ) : (
          <Text style={[s.tableCell, { color: '#888888', marginTop: 4 }]}>
            Sem componentes registrados no período.
          </Text>
        )}

        <SectionHeader label={T.sections.log} />

        <Text style={[s.footnote, { marginBottom: 10 }]}>
          Ans = Ansiedade · Est = Estresse · Ene = Energia.
          Níveis percebidos de 0 a 10.
        </Text>

        {data.checkinLog.length > 0 ? (
          <View>
            <TableHeader
              cols={[
                T.tableHeaders.date,
                T.tableHeaders.mood,
                T.tableHeaders.anxiety,
                T.tableHeaders.stress,
                T.tableHeaders.energy,
                T.tableHeaders.note,
              ]}
              widths={[56, 78, 30, 30, 30, 75]}
            />
            {data.checkinLog.map((entry, i) => (
              <TableRow
                key={i}
                even={i % 2 === 1}
                cols={[
                  format(entry.moment, 'd MMM', { locale: ptBR }),
                  T.moods[entry.mood] ?? entry.mood,
                  String(entry.anxietyLevel),
                  String(entry.stressLevel),
                  String(entry.energyLevel),
                  truncate(entry.annotation?.trim(), 73),
                ]}
                widths={[56, 78, 30, 30, 30, 75]}
                colors={[
                  undefined,
                  MOOD_COLORS[entry.mood],
                  undefined,
                  undefined,
                  undefined,
                  undefined,
                ]}
              />
            ))}
          </View>
        ) : (
          <Text style={[s.tableCell, { color: '#888888', marginTop: 4 }]}>
            Sem check-ins no período.
          </Text>
        )}
      </Page>
    </Document>
  )
}
