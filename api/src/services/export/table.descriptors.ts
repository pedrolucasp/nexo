import { Mood, MoodComponent, User } from "@prisma/client";

import {
  baseMoodLabel,
  intensityLabel,
  moodComponentLabel,
} from "@app/services/export/label.map";
import { CsvTable } from "@app/services/export/types";

const booleanLabel = (value: boolean): string => (value ? "Sim" : "Não");

export const profileTable: CsvTable<User> = {
  filename: "profile.csv",
  columns: [
    { header: "id", value: (user) => user.id },
    { header: "Nome", value: (user) => user.firstName },
    { header: "Sobrenome", value: (user) => user.lastName },
    { header: "Email", value: (user) => user.email },
    { header: "Ativo", value: (user) => booleanLabel(user.active) },
    {
      header: "Notificações",
      value: (user) => booleanLabel(user.notificationsEnabled),
    },
    { header: "Lembrete diário", value: (user) => user.dailyReminderTime },
    { header: "Criado em", value: (user) => user.createdAt },
    { header: "Atualizado em", value: (user) => user.updatedAt },
  ],
};

export const moodTable: CsvTable<Mood> = {
  filename: "moods.csv",
  columns: [
    { header: "id", value: (mood) => mood.id },
    { header: "Humor", value: (mood) => baseMoodLabel[mood.selectedMood] },
    { header: "Ansiedade", value: (mood) => mood.anxietyLevel },
    { header: "Estresse", value: (mood) => mood.stressLevel },
    { header: "Energia", value: (mood) => mood.energyLevel },
    { header: "Momento", value: (mood) => mood.moment },
    { header: "Anotação", value: (mood) => mood.annotation },
  ],
};

export const moodComponentTable: CsvTable<MoodComponent> = {
  filename: "mood_components.csv",
  columns: [
    { header: "id", value: (component) => component.id },
    { header: "mood_id", value: (component) => component.moodId },
    {
      header: "Sentimento",
      value: (component) => moodComponentLabel[component.component],
    },
    {
      header: "Intensidade",
      value: (component) => intensityLabel[component.intensity],
    },
  ],
};
