import JSZip from "jszip";

import { ExportFile } from "@app/services/export/types";

export async function buildZip(files: ExportFile[]): Promise<Buffer> {
  const zip = new JSZip();

  for (const file of files) {
    zip.file(file.filename, file.content);
  }

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
