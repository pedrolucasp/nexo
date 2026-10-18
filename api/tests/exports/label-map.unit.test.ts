import { describe, it, expect } from 'vitest'
import {
  activityCategoryLabel,
  appointmentTypeLabel,
  baseMoodLabel,
  careActionTypeLabel,
  insightPeriodLabel,
  insightTypeLabel,
  intensityLabel,
  medicinePeriodicityLabel,
  moodComponentLabel,
  notificationKindLabel,
  triggerTypeLabel,
} from '@app/services/export/label.map'

describe('export label maps', () => {
  it('renders the base mood labels in pt-BR', () => {
    expect(baseMoodLabel).toEqual({
      SAD: 'Triste',
      NEUTRAL: 'Neutro',
      GOOD: 'Bem',
      GREAT: 'Ótimo',
      ANGRY: 'Irritado',
    })
  })

  it('renders the mood component labels in pt-BR', () => {
    expect(moodComponentLabel).toEqual({
      JOY: 'Alegria',
      ANGER: 'Raiva',
      SADNESS: 'Tristeza',
      FEAR: 'Medo',
      GUILT: 'Culpa',
      FRUSTRATION: 'Frustração',
      CALM: 'Calmo',
      MOTIVATED: 'Motivado',
      TIREDNESS: 'Cansaço',
      GRATITUDE: 'Gratidão',
      FOCUS: 'Foco',
      RESTLESS: 'Inquieto',
      RELAXED: 'Relaxado',
      OVERWHELMED: 'Sobrecarga',
    })
  })

  it('renders the intensity labels in pt-BR', () => {
    expect(intensityLabel).toEqual({
      LIGHT: 'Suave',
      MODERATE: 'Moderada',
      HIGH: 'Intensa',
    })
  })

  it('renders the trigger type labels in pt-BR', () => {
    expect(triggerTypeLabel).toEqual({
      SOCIAL: 'Social',
      WORK: 'Trabalho',
      HEALTH: 'Saúde',
      PHYSICAL: 'Físico',
      FAMILY: 'Família',
      THERAPY: 'Terapia',
      INTERNAL: 'Interno',
      OTHER: 'Outro',
    })
  })

  it('renders the care action type labels in pt-BR', () => {
    expect(careActionTypeLabel).toEqual({
      MEDICINE: 'Medicação',
      APPOINTMENT: 'Consulta',
      ACTIVITY: 'Atividade',
    })
  })

  it('renders the appointment type labels in pt-BR', () => {
    expect(appointmentTypeLabel).toEqual({
      ANALYST: 'Analista',
      PSYCHIATRIST: 'Psiquiatra',
      GP: 'Clínico geral',
      NUTRITIONIST: 'Nutricionista',
      PHYSIOTHERAPIST: 'Fisioterapeuta',
      OTHER: 'Consulta',
    })
  })

  it('renders the activity category labels in pt-BR', () => {
    expect(activityCategoryLabel).toEqual({
      WALK: 'Caminhada',
      YOGA: 'Yoga',
      GYM: 'Academia',
      MEDITATION: 'Meditação',
      SOCIAL: 'Momento social',
      CREATIVE: 'Atividade criativa',
      OTHER: 'Atividade',
    })
  })

  it('renders the medicine periodicity labels in pt-BR', () => {
    expect(medicinePeriodicityLabel).toEqual({
      ONCE: 'Uma vez',
      DAILY: 'Diário',
      TWICE_DAILY: '2x ao dia',
      THREE_TIMES_DAILY: '3x ao dia',
      WEEKLY: 'Semanal',
      BIWEEKLY: 'Quinzenal',
      MONTHLY: 'Mensal',
    })
  })

  it('renders the insight type labels in pt-BR', () => {
    expect(insightTypeLabel).toEqual({
      MOOD_TREND: 'Tendência de Humor',
      ENERGY_SLEEP_CORRELATION: 'Sono e Energia',
      TRIGGER_PATTERN: 'Padrão de Gatilho',
      WEEKLY_SUMMARY: 'Resumo Semanal',
      STREAK: 'Sequência',
      DAILY_ENERGY: 'Energia do Dia',
      DAILY_SLEEP: 'Sono',
    })
  })

  it('renders the insight period labels in pt-BR', () => {
    expect(insightPeriodLabel).toEqual({
      DAILY: 'Diário',
      WEEKLY: 'Semanal',
      MONTHLY: 'Mensal',
    })
  })

  it('renders the notification kind labels in pt-BR', () => {
    expect(notificationKindLabel).toEqual({
      DAILY_REMINDER: 'Lembrete diário',
      MEDICINE_REMINDER: 'Lembrete de medicação',
      INSIGHT_ALERT: 'Alerta de indicador',
    })
  })
})
