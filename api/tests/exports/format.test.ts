import { describe, it, expect } from 'vitest'
import { serializeCsv } from '@app/services/export/csv.serializer'
import { buildManifest } from '@app/services/export/manifest.builder'
import { profileTable } from '@app/services/export/table.descriptors'

describe('serializeCsv', () => {
  it('keeps the header row and a BOM when the table has no rows', () => {
    const file = serializeCsv(profileTable, [])
    const text = file.content.toString('utf8')

    expect(text.startsWith('\ufeff')).toBe(true)
    expect(file.rows).toBe(0)

    const lines = text.slice(1).split('\r\n').filter(Boolean)
    expect(lines).toHaveLength(1)
    expect(lines[0]).toContain('Email')
  })
})

describe('buildManifest', () => {
  it('states the generation time and lists each file with its row count', () => {
    const manifest = buildManifest(
      [{ filename: 'profile.csv', content: Buffer.from(''), rows: 0 }],
      new Date('2026-10-04T12:00:00.000Z'),
    )
    const text = manifest.content.toString('utf8')

    expect(manifest.filename).toBe('leia-me.md')
    expect(text).toContain('2026-10-04T12:00:00.000Z')
    expect(text).toContain('`profile.csv` — 0 registros')
    expect(text).toContain('_id')
    expect(text).toContain('traduzidos')
  })
})
