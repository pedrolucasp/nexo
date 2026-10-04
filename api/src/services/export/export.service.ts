import { serializeCsv } from "@app/services/export/csv.serializer";
import { gatherExportData } from "@app/services/export/data.gatherer";
import { buildManifest } from "@app/services/export/manifest.builder";
import {
  moodComponentTable,
  moodTable,
  profileTable,
} from "@app/services/export/table.descriptors";
import { buildZip } from "@app/services/export/zip.builder";
import { ExportArchive, ExportFile } from "@app/services/export/types";

export async function buildExportArchive(userId: number): Promise<ExportArchive> {
  const { user, moods, moodComponents } = await gatherExportData(userId);
  const generatedAt = new Date();

  const files: ExportFile[] = [
    serializeCsv(profileTable, [user]),
    serializeCsv(moodTable, moods),
    serializeCsv(moodComponentTable, moodComponents),
  ];
  const manifest = buildManifest(files, generatedAt);

  return {
    filename: `nexo-dados-${generatedAt.toISOString().slice(0, 10)}.zip`,
    buffer: await buildZip([...files, manifest]),
  };
}
