import { prisma } from '@app/lib/prisma';
import { TriggerMoodLink } from '@prisma/client';

export const linkTriggerToMood = async (
  triggerId: number,
  moodId: number,
  perceivedImpact: number,
): Promise<TriggerMoodLink> => {
  const existing = await prisma.triggerMoodLink.findUnique({
    where: {
      triggerId_moodId: { triggerId, moodId },
    },
  });

  if (existing) {
    throw new Error(`Link between trigger ${triggerId} and mood ${moodId} already exists`);
  }

  return prisma.triggerMoodLink.create({
    data: { triggerId, moodId, perceivedImpact },
  });
};

export const unlinkTriggerFromMood = async (
  triggerId: number,
  moodId: number,
): Promise<TriggerMoodLink> => {
  return prisma.triggerMoodLink.delete({
    where: {
      triggerId_moodId: { triggerId, moodId },
    },
  });
};
