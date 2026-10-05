import {
  Activity,
  Appointment,
  CareAction,
  Insight,
  MedicineLog,
  MedicineRegimen,
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
  careActions: CareAction[];
  medicineLogs: MedicineLog[];
  appointments: Appointment[];
  activities: Activity[];
  medicineRegimens: MedicineRegimen[];
  insights: Insight[];
};

export async function gatherExportData(userId: number): Promise<ExportData> {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error(`Usuário ${userId} não encontrado para exportação`);
  }

  const [
    moods,
    sleepRecords,
    triggers,
    triggerMoodLinks,
    careActions,
    medicineRegimens,
    insights,
  ] = await Promise.all([
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
    prisma.careAction.findMany({
      where: { userId },
      include: { medicineLog: true, appointment: true, activity: true },
      orderBy: { moment: "asc" },
    }),
    prisma.medicineRegimen.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.insight.findMany({
      where: { userId },
      orderBy: { generatedAt: "asc" },
    }),
  ]);

  return {
    user,
    moods,
    moodComponents: moods.flatMap((mood) => mood.moodComponents),
    sleepRecords,
    triggers,
    triggerMoodLinks,
    careActions,
    medicineLogs: careActions.flatMap((action) =>
      action.medicineLog ? [action.medicineLog] : [],
    ),
    appointments: careActions.flatMap((action) =>
      action.appointment ? [action.appointment] : [],
    ),
    activities: careActions.flatMap((action) =>
      action.activity ? [action.activity] : [],
    ),
    medicineRegimens,
    insights,
  };
}
