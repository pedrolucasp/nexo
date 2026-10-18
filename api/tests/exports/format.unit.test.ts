import { describe, it, expect } from 'vitest'
import { serializeCsv } from '@app/services/export/csv.serializer'
import { buildManifest } from '@app/services/export/manifest.builder'
import { profileTable } from '@app/services/export/table.descriptors'
import { CsvTable } from '@app/services/export/types'

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

  it('round-trips commas, double quotes, and newlines through escaped fields', () => {
    const table: CsvTable<{ text: string }> = {
      filename: 'notes.csv',
      columns: [{ header: 'Texto', value: (row) => row.text }],
    }

    const values = ['a,b', 'he said "hi"', 'line one\nline two']
    const file = serializeCsv(
      table,
      values.map((text) => ({ text })),
    )
    const body = file.content.toString('utf8').slice(1)

    // RFC 4180: every string field is quoted and any inner quote doubled, so
    // reading the quoted fields back and undoubling the quotes recovers the
    // original values byte-for-byte.
    const fields = [...body.matchAll(/"((?:[^"]|"")*)"/g)].map((match) =>
      match[1].replaceAll('""', '"'),
    )

    expect(fields).toEqual(['Texto', ...values])
    expect(file.rows).toBe(3)
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
  })

  it('lists every file and singularizes a count of one', () => {
    const manifest = buildManifest(
      [
        { filename: 'moods.csv', content: Buffer.from(''), rows: 1 },
        { filename: 'triggers.csv', content: Buffer.from(''), rows: 3 },
      ],
      new Date('2026-10-04T12:00:00.000Z'),
    )
    const text = manifest.content.toString('utf8')

    expect(text).toContain('`moods.csv` — 1 registro')
    expect(text).toContain('`triggers.csv` — 3 registros')
  })
})
