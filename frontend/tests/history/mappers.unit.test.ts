import {
  mapCareActionToHistoryCard,
  mapMoodToHistoryCard,
  mapSleepToHistoryCard,
  mapTriggerToHistoryCard,
} from "@/lib/history/mappers";
import type {
  ActivityType,
  AppointmentType,
  CareAction,
  MoodEntry,
  SleepRecord,
  Trigger,
} from "@/lib/api";
import type { MoodComponent } from "@/lib/api/types";

const FIXED = new Date(2025, 0, 15, 10, 0, 0);

function mood(overrides: Partial<MoodEntry> = {}): MoodEntry {
  return {
    id: 1,
    annotation: "",
    moment: FIXED,
    selectedMood: "good",
    anxietyLevel: 2,
    energyLevel: 4,
    stressLevel: 1,
    moodComponents: [],
    createdAt: FIXED,
    updatedAt: FIXED,
    ...overrides,
  };
}

function moodComponent(component: string): MoodComponent {
  return {
    id: 1,
    component,
    intensity: "MILD",
    createdAt: FIXED,
    updatedAt: FIXED,
  };
}

function sleep(overrides: Partial<SleepRecord> = {}): SleepRecord {
  return {
    id: 1,
    annotations: "",
    date: FIXED,
    average: 8,
    createdAt: FIXED,
    updatedAt: FIXED,
    ...overrides,
  };
}

function trigger(overrides: Partial<Trigger> = {}): Trigger {
  return {
    id: 1,
    comment: "",
    category: "Trabalho",
    moment: FIXED,
    createdAt: FIXED,
    updatedAt: FIXED,
    ...overrides,
  };
}

function careAction(overrides: Partial<CareAction> = {}): CareAction {
  return {
    id: 1,
    type: "MEDICINE",
    moment: FIXED,
    userId: 1,
    createdAt: FIXED,
    updatedAt: FIXED,
    ...overrides,
  };
}

describe("mapMoodToHistoryCard", () => {
  it("maps the record into a mood card", () => {
    const record = mood({
      id: 7,
      annotation: "Me senti bem hoje",
      moment: new Date(2025, 5, 10, 14, 30),
      selectedMood: "great",
      moodComponents: [moodComponent("ANXIOUS"), moodComponent("CALM")],
    });

    expect(mapMoodToHistoryCard(record)).toStrictEqual({
      id: "mood-7",
      category: "mood",
      timestamp: record.moment.toString(),
      title: "Ótimo",
      summary: "Anxious, Calm · Me senti bem hoje",
      badge: undefined,
      raw: record,
    });
  });

  it("falls back to a generic title for an unknown mood", () => {
    expect(mapMoodToHistoryCard(mood({ selectedMood: "unmapped" })).title).toBe(
      "Humor",
    );
  });

  describe("summary", () => {
    it("joins only the components when there is no annotation", () => {
      const card = mapMoodToHistoryCard(
        mood({
          annotation: "",
          moodComponents: [moodComponent("ANXIOUS"), moodComponent("CALM")],
        }),
      );

      expect(card.summary).toBe("Anxious, Calm");
    });

    it("uses only the annotation when there are no components", () => {
      const card = mapMoodToHistoryCard(
        mood({ annotation: "Tarde tranquila", moodComponents: [] }),
      );

      expect(card.summary).toBe("Tarde tranquila");
    });

    it("joins components and annotation when both are present", () => {
      const card = mapMoodToHistoryCard(
        mood({
          annotation: "Tarde tranquila",
          moodComponents: [moodComponent("CALM")],
        }),
      );

      expect(card.summary).toBe("Calm · Tarde tranquila");
    });

    it("falls back when neither is present", () => {
      const card = mapMoodToHistoryCard(
        mood({ annotation: "", moodComponents: [] }),
      );

      expect(card.summary).toBe("Sem detalhes");
    });
  });
});

describe("mapSleepToHistoryCard", () => {
  it("maps the record into a sleep card", () => {
    const record = sleep({
      id: 4,
      average: 7.5,
      annotations: "Dormi bem",
      createdAt: new Date(2025, 0, 15, 8, 0, 0),
    });

    expect(mapSleepToHistoryCard(record)).toStrictEqual({
      id: "sleep-4",
      category: "sleep",
      timestamp: record.createdAt.toISOString(),
      title: "Sono",
      summary: "7h 30min · Dormi bem",
      badge: { label: "Excelente", variant: "green" },
      raw: record,
    });
  });

  it("keeps a string timestamp as-is", () => {
    const timestamp = "2025-01-15T13:00:00.000Z";
    const card = mapSleepToHistoryCard(
      sleep({ createdAt: timestamp as unknown as Date }),
    );

    expect(card.timestamp).toBe(timestamp);
  });

  it("omits the separator when there is no annotation", () => {
    expect(mapSleepToHistoryCard(sleep({ average: 8 })).summary).toBe(
      "8h 00min",
    );
  });

  describe("quality badge thresholds", () => {
    it.each([
      [9, "Excelente", "green"],
      [7, "Excelente", "green"],
      [6.99, "Regular", "yellow"],
      [5, "Regular", "yellow"],
      [4.99, "Ruim", "red"],
      [0, "Ruim", "red"],
    ])("labels %p hours as %p", (average, label, variant) => {
      expect(mapSleepToHistoryCard(sleep({ average })).badge).toEqual({
        label,
        variant,
      });
    });
  });

  it("pads the minutes to two digits", () => {
    expect(mapSleepToHistoryCard(sleep({ average: 6.5 })).summary).toBe(
      "6h 30min",
    );
    expect(mapSleepToHistoryCard(sleep({ average: 6.0167 })).summary).toBe(
      "6h 01min",
    );
  });
});

describe("mapTriggerToHistoryCard", () => {
  it("maps the record into a trigger card", () => {
    const record = trigger({
      id: 3,
      category: "Trabalho",
      comment: "Muito estresse",
      moment: new Date(2025, 2, 1, 9, 0, 0),
    });

    expect(mapTriggerToHistoryCard(record)).toStrictEqual({
      id: "trigger-3",
      category: "trigger",
      timestamp: record.moment.toString(),
      title: "Gatilho",
      summary: "Trabalho · Muito estresse",
      badge: undefined,
      raw: record,
    });
  });

  it("drops the separator when there is no comment", () => {
    const card = mapTriggerToHistoryCard(
      trigger({ category: "Sono", comment: "" }),
    );

    expect(card.summary).toBe("Sono");
  });
});

describe("mapCareActionToHistoryCard", () => {
  describe("medicine", () => {
    it("uses the regimen name and dosage", () => {
      const record = careAction({
        id: 10,
        type: "MEDICINE",
        medicineLog: {
          id: 1,
          careActionId: 10,
          takenAt: FIXED,
          regimen: {
            id: 1,
            name: "Ritalina",
            dosage: "10mg",
            periodicity: "DAILY",
            scheduledAt: [],
            active: true,
            userId: 1,
            createdAt: FIXED,
            updatedAt: FIXED,
          },
        },
      });

      expect(mapCareActionToHistoryCard(record)).toStrictEqual({
        id: "care_action-10",
        category: "care_action",
        subtype: "medicine",
        timestamp: record.moment.toString(),
        title: "Ritalina",
        summary: "10mg",
        raw: record,
      });
    });

    it("falls back when there is no regimen", () => {
      const card = mapCareActionToHistoryCard(careAction({ type: "MEDICINE" }));

      expect(card.title).toBe("Medicamento");
      expect(card.summary).toBe("Sem dosagem registrada");
    });
  });

  describe("appointment", () => {
    it("joins the duration and the note", () => {
      const record = careAction({
        id: 20,
        type: "APPOINTMENT",
        appointment: {
          id: 1,
          careActionId: 20,
          type: "ANALYST",
          duration: 50,
          note: "Boa sessão",
        },
      });

      expect(mapCareActionToHistoryCard(record)).toStrictEqual({
        id: "care_action-20",
        category: "care_action",
        subtype: "appointment",
        timestamp: record.moment.toString(),
        title: "Consulta · Analista",
        summary: "50 min · Boa sessão",
        badge: undefined,
        raw: record,
      });
    });

    it("falls back when there are no details", () => {
      const card = mapCareActionToHistoryCard(
        careAction({ type: "APPOINTMENT", appointment: undefined }),
      );

      expect(card.summary).toBe("Sem anotações");
      expect(card.title).toBe("Consulta · Consulta");
    });

    it.each([
      ["ANALYST", "Analista"],
      ["PSYCHIATRIST", "Psiquiatra"],
      ["GP", "Clínico geral"],
      ["NUTRITIONIST", "Nutricionista"],
      ["PHYSIOTHERAPIST", "Fisioterapeuta"],
      ["OTHER", "Consulta"],
      ["unmapped", "Consulta"],
    ] as const)("labels the %p appointment as %p", (type, label) => {
      const card = mapCareActionToHistoryCard(
        careAction({
          type: "APPOINTMENT",
          appointment: {
            id: 1,
            careActionId: 1,
            type: type as AppointmentType,
            duration: 30,
          },
        }),
      );

      expect(card.title).toBe(`Consulta · ${label}`);
    });

    describe("vínculo badge", () => {
      it("is absent with no links", () => {
        expect(
          mapCareActionToHistoryCard(careAction({ type: "APPOINTMENT" })).badge,
        ).toBeUndefined();
      });

      it("uses the singular for a single link", () => {
        expect(
          mapCareActionToHistoryCard(
            careAction({ type: "APPOINTMENT", triggerId: 5 }),
          ).badge,
        ).toEqual({ label: "1 vínculo", variant: "blue" });
      });

      it("uses the plural for two links", () => {
        expect(
          mapCareActionToHistoryCard(
            careAction({ type: "APPOINTMENT", triggerId: 5, moodId: 6 }),
          ).badge,
        ).toEqual({ label: "2 vínculos", variant: "blue" });
      });
    });
  });

  describe("activity", () => {
    it("uses the activity label and duration", () => {
      const record = careAction({
        id: 30,
        type: "ACTIVITY",
        activity: { id: 1, careActionId: 30, type: "WALK", duration: 30 },
      });

      expect(mapCareActionToHistoryCard(record)).toStrictEqual({
        id: "care_action-30",
        category: "care_action",
        subtype: "activity",
        timestamp: record.moment.toString(),
        title: "Caminhada",
        summary: "30 min",
        raw: record,
      });
    });

    it("falls back when there is no duration", () => {
      const card = mapCareActionToHistoryCard(
        careAction({
          type: "ACTIVITY",
          activity: { id: 1, careActionId: 1, type: "YOGA" },
        }),
      );

      expect(card.summary).toBe("Sem duração registrada");
    });

    it.each([
      ["WALK", "Caminhada"],
      ["YOGA", "Yoga"],
      ["GYM", "Academia"],
      ["MEDITATION", "Meditação"],
      ["SOCIAL", "Momento social"],
      ["CREATIVE", "Atividade criativa"],
      ["OTHER", "Atividade"],
      ["unmapped", "Atividade"],
    ] as const)("labels the %p activity as %p", (type, label) => {
      const card = mapCareActionToHistoryCard(
        careAction({
          type: "ACTIVITY",
          activity: {
            id: 1,
            careActionId: 1,
            type: type as ActivityType,
          },
        }),
      );

      expect(card.title).toBe(label);
    });
  });

  it("falls back for an unknown care-action type", () => {
    const record = careAction({
      id: 40,
      type: "SOMETHING_ELSE" as unknown as CareAction["type"],
    });

    expect(mapCareActionToHistoryCard(record)).toStrictEqual({
      id: "care_action-40",
      category: "care_action",
      timestamp: record.moment.toString(),
      title: "Ação de cuidado",
      summary: "",
      raw: record,
    });
  });
});
