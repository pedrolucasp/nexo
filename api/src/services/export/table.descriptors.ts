import { User } from "@prisma/client";

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
