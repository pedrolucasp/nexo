import { ExportFile } from "@app/services/export/types";

const countLabel = (rows: number): string =>
  rows === 1 ? "1 registro" : `${rows} registros`;

export function buildManifest(files: ExportFile[], generatedAt: Date): ExportFile {
  const fileLines = files.map(
    (file) => `- \`${file.filename}\` — ${countLabel(file.rows)}`,
  );

  const content = [
    "# Seus dados do nexo",
    "",
    `Arquivo gerado em ${generatedAt.toISOString()}.`,
    "",
    "Este pacote reúne os seus dados do nexo, com um arquivo CSV para cada tipo",
    "de registro.",
    "",
    "## Arquivos",
    "",
    ...fileLines,
    "",
    "## Como ler os arquivos",
    "",
    "As colunas `id` e as terminadas em `_id` são identificadores técnicos. Elas",
    "ligam os registros entre si: por exemplo, um `mood_id` aponta para o `id` do",
    "registro correspondente em `moods.csv`. Mantivemos esses nomes para que você",
    "consiga cruzar as tabelas.",
    "",
  ].join("\n");

  return {
    filename: "leia-me.md",
    content: Buffer.from(content, "utf8"),
    rows: 0,
  };
}
