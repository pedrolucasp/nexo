import { stringify } from "csv-stringify/sync";

import { CsvTable, CsvValue, ExportFile } from "@app/services/export/types";

// Dates become ISO-8601 strings so they are quoted like any other string and
// sort unambiguously regardless of the reader's locale.
const normalize = (value: CsvValue): string | number | null => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();

  return value;
};

export function serializeCsv<Row>(table: CsvTable<Row>, rows: Row[]): ExportFile {
  const records = rows.map((row) => {
    const record: Record<string, string | number | null> = {};

    for (const column of table.columns) {
      record[column.header] = normalize(column.value(row));
    }

    return record;
  });

  const body = stringify(records, {
    header: true,
    columns: table.columns.map((column) => column.header),
    record_delimiter: "\r\n",
    quoted_string: true,
  });

  return {
    filename: table.filename,
    content: Buffer.from(`\ufeff${body}`, "utf8"),
    rows: rows.length,
  };
}
