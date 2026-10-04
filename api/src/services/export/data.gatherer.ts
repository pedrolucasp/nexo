import { Mood, MoodComponent, User } from "@prisma/client";

import { prisma } from "@app/lib/prisma";
import { findUserById } from "@app/services/user.service";

export type ExportData = {
  user: User;
  moods: Mood[];
  moodComponents: MoodComponent[];
};

export async function gatherExportData(userId: number): Promise<ExportData> {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error(`Usuário ${userId} não encontrado para exportação`);
  }

  const moods = await prisma.mood.findMany({
    where: { userId },
    include: { moodComponents: true },
    orderBy: { moment: "asc" },
  });

  return {
    user,
    moods,
    moodComponents: moods.flatMap((mood) => mood.moodComponents),
  };
}
