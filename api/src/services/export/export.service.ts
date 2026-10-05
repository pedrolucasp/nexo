import { serializeCsv } from "@app/services/export/csv.serializer";
import { gatherExportData } from "@app/services/export/data.gatherer";
import { buildManifest } from "@app/services/export/manifest.builder";
import {
  activityTable,
  appointmentTable,
  careActionTable,
  medicineLogTable,
  medicineRegimenTable,
  moodComponentTable,
  moodTable,
  profileTable,
  sleepRecordTable,
  triggerMoodLinkTable,
  triggerTable,
} from "@app/services/export/table.descriptors";
import { buildZip } from "@app/services/export/zip.builder";
import { ExportArchive, ExportFile } from "@app/services/export/types";

export async function buildExportArchive(userId: number): Promise<ExportArchive> {
  const {
    user,
    moods,
    moodComponents,
    sleepRecords,
    triggers,
    triggerMoodLinks,
    careActions,
    medicineLogs,
    appointments,
    activities,
    medicineRegimens,
  } = await gatherExportData(userId);
  const generatedAt = new Date();

  const files: ExportFile[] = [
    serializeCsv(profileTable, [user]),
    serializeCsv(moodTable, moods),
    serializeCsv(moodComponentTable, moodComponents),
    serializeCsv(sleepRecordTable, sleepRecords),
    serializeCsv(triggerTable, triggers),
    serializeCsv(triggerMoodLinkTable, triggerMoodLinks),
    serializeCsv(careActionTable, careActions),
    serializeCsv(medicineLogTable, medicineLogs),
    serializeCsv(appointmentTable, appointments),
    serializeCsv(activityTable, activities),
    serializeCsv(medicineRegimenTable, medicineRegimens),
  ];
  const manifest = buildManifest(files, generatedAt);

  return {
    filename: `nexo-dados-${generatedAt.toISOString().slice(0, 10)}.zip`,
    buffer: await buildZip([...files, manifest]),
  };
}
