export type CsvValue = string | number | Date | null | undefined;

export type CsvColumn<Row> = {
  header: string;
  value: (row: Row) => CsvValue;
};

export type CsvTable<Row> = {
  filename: string;
  columns: CsvColumn<Row>[];
};

export type ExportFile = {
  filename: string;
  content: Buffer;
  rows: number;
};

export type ExportArchive = {
  filename: string;
  buffer: Buffer;
};
