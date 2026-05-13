import { prisma } from '@app/lib/prisma';
import { Mood } from '@prisma/client';

import { CreateMoodInput } from '@app/schemas';

export const createMood = async (userId: number, input: CreateMoodInput): Promise<Mood> => {
  const { moodComponents, ...moodData } = input;

  return prisma.mood.create({
    data: {
      ...moodData,
      userId,
      moodComponents: {
        create: moodComponents
      }
    },
    include: { moodComponents: true }
  });
};

export const getMoodsByUserId = async (userId: number): Promise<Mood[]> => {
  return prisma.mood.findMany({
    where: { userId },
    include: { moodComponents: true },
    orderBy: { moment: 'desc' }
  });
};
