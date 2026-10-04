import {
  Mood,
  MoodComponent,
  SleepRecord,
  Trigger,
  TriggerMoodLink,
  User,
} from "@prisma/client";

import { prisma } from "@app/lib/prisma";
import { findUserById } from "@app/services/user.service";

export type ExportData = {
  user: User;
  moods: Mood[];
  moodComponents: MoodComponent[];
  sleepRecords: SleepRecord[];
  triggers: Trigger[];
  triggerMoodLinks: TriggerMoodLink[];
};

export async function gatherExportData(userId: number): Promise<ExportData> {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error(`Usuário ${userId} não encontrado para exportação`);
  }

  const [moods, sleepRecords, triggers, triggerMoodLinks] = await Promise.all([
    prisma.mood.findMany({
      where: { userId },
      include: { moodComponents: true },
      orderBy: { moment: "asc" },
    }),
    prisma.sleepRecord.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    }),
    prisma.trigger.findMany({
      where: { userId },
      orderBy: { moment: "asc" },
    }),
    prisma.triggerMoodLink.findMany({
      where: { trigger: { userId } },
      orderBy: { linkedAt: "asc" },
    }),
  ]);

  return {
    user,
    moods,
    moodComponents: moods.flatMap((mood) => mood.moodComponents),
    sleepRecords,
    triggers,
    triggerMoodLinks,
  };
}
