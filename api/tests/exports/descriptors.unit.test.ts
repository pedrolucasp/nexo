import { describe, it, expect } from 'vitest'
import { Insight, MedicineRegimen, SleepRecord, User } from '@prisma/client'
import {
  insightTable,
  medicineRegimenTable,
  profileTable,
  sleepRecordTable,
} from '@app/services/export/table.descriptors'
import { CsvTable } from '@app/services/export/types'

const columnValue = <Row>(table: CsvTable<Row>, header: string) => {
  const column = table.columns.find((column) => column.header === header)

  if (!column) throw new Error(`a tabela não tem a coluna ${header}`)

  return column.value
}

describe('boolean descriptor values', () => {
  it('renders true as Sim and false as Não', () => {
    const user = { active: true, pushEnabled: false } as User

    expect(columnValue(profileTable, 'Ativo')(user)).toBe('Sim')
    expect(columnValue(profileTable, 'Notificações por push')(user)).toBe('Não')
  })

  it('renders a regimen active flag the same way', () => {
    const regimen = { active: false } as MedicineRegimen

    expect(columnValue(medicineRegimenTable, 'Ativo')(regimen)).toBe('Não')
  })
})

describe('json descriptor values', () => {
  it('serializes metadata to a JSON string', () => {
    const insight = { metadata: { delta: -1, avgFirst: 5 } } as unknown as Insight

    expect(columnValue(insightTable, 'Metadados')(insight)).toBe(
      '{"delta":-1,"avgFirst":5}',
    )
  })

  it('keeps null metadata empty instead of the string "null"', () => {
    const insight = { metadata: null } as Insight

    expect(columnValue(insightTable, 'Metadados')(insight)).toBeNull()
  })
})

describe('date-only descriptor values', () => {
  it('drops the time from a sleep record date', () => {
    const record = { date: new Date('2026-10-17T15:45:30.000Z') } as SleepRecord

    expect(columnValue(sleepRecordTable, 'Data')(record)).toBe('2026-10-17')
  })
})
