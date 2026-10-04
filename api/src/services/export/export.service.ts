import { findUserById } from "@app/services/user.service";
import { serializeCsv } from "@app/services/export/csv.serializer";
import { buildManifest } from "@app/services/export/manifest.builder";
import { profileTable } from "@app/services/export/table.descriptors";
import { buildZip } from "@app/services/export/zip.builder";
import { ExportArchive, ExportFile } from "@app/services/export/types";

export async function buildExportArchive(userId: number): Promise<ExportArchive> {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error(`Usuário ${userId} não encontrado para exportação`);
  }

  const generatedAt = new Date();

  const files: ExportFile[] = [serializeCsv(profileTable, [user])];
  const manifest = buildManifest(files, generatedAt);

  return {
    filename: `nexo-dados-${generatedAt.toISOString().slice(0, 10)}.zip`,
    buffer: await buildZip([...files, manifest]),
  };
}
