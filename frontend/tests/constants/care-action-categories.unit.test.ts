import {
  getActivityCategory,
  getCareActionMeta,
} from "@/constants/care-action-categories";
import type {
  AppointmentType,
  CareAction,
  CareActionType,
  MedicineRegimen,
} from "@/lib/api";

const FIXED = new Date(2025, 0, 15, 10, 0, 0);

const GENERIC_ACTIVITY = {
  icon: "star",
  color: "#6B7280",
  iconBackground: "#F3F4F6",
  label: "Atividade",
};

const APPOINTMENTS: { type: AppointmentType; label: string }[] = [
  { type: "ANALYST", label: "Analista" },
  { type: "PSYCHIATRIST", label: "Psiquiatra" },
  { type: "GP", label: "Clínico" },
  { type: "NUTRITIONIST", label: "Nutricionista" },
  { type: "PHYSIOTHERAPIST", label: "Fisioterapeuta" },
  { type: "OTHER", label: "Consulta" },
];

function regimen(overrides: Partial<MedicineRegimen> = {}): MedicineRegimen {
  return {
    id: 1,
    name: "Sertralina",
    dosage: "50mg",
    periodicity: "DAILY",
    scheduledAt: ["08:00"],
    active: true,
    userId: 1,
    createdAt: FIXED,
    updatedAt: FIXED,
    ...overrides,
  };
}

function careAction(overrides: Partial<CareAction> = {}): CareAction {
  return {
    id: 1,
    type: "ACTIVITY",
    moment: FIXED,
    userId: 1,
    createdAt: FIXED,
    updatedAt: FIXED,
    ...overrides,
  };
}

describe("getCareActionMeta", () => {
  it.each(APPOINTMENTS)("labels a $type appointment", ({ type, label }) => {
    expect(
      getCareActionMeta(
        careAction({
          type: "APPOINTMENT",
          appointment: { id: 1, careActionId: 1, type, duration: 50 },
        }),
      ),
    ).toStrictEqual({
      icon: "psychology",
      color: "#1D4ED8",
      iconBackground: "#DBEAFE",
      label,
    });
  });

  it("falls back to a generic appointment without a detail", () => {
    expect(getCareActionMeta(careAction({ type: "APPOINTMENT" }))).toStrictEqual(
      {
        icon: "psychology",
        color: "#1D4ED8",
        iconBackground: "#DBEAFE",
        label: "Consulta",
      },
    );
  });

  it("labels medicine by the regimen name", () => {
    expect(
      getCareActionMeta(
        careAction({
          type: "MEDICINE",
          medicineLog: {
            id: 1,
            careActionId: 1,
            takenAt: FIXED,
            regimen: regimen(),
          },
        }),
      ),
    ).toStrictEqual({
      icon: "medication",
      color: "#7C3AED",
      iconBackground: "#EDE9FE",
      label: "Sertralina",
    });
  });

  it("falls back to a generic medicine label without a regimen", () => {
    expect(getCareActionMeta(careAction({ type: "MEDICINE" }))).toStrictEqual({
      icon: "medication",
      color: "#7C3AED",
      iconBackground: "#EDE9FE",
      label: "Medicação",
    });
  });

  it("labels an activity by its activity type", () => {
    expect(
      getCareActionMeta(
        careAction({
          type: "ACTIVITY",
          activity: { id: 1, careActionId: 1, type: "WALK" },
        }),
      ),
    ).toStrictEqual({
      icon: "directions-walk",
      color: "#059669",
      iconBackground: "#D1FAE5",
      label: "Caminhada",
    });
  });

  it("falls back to a generic activity without a detail", () => {
    expect(getCareActionMeta(careAction({ type: "ACTIVITY" }))).toStrictEqual(
      GENERIC_ACTIVITY,
    );
  });

  it("falls back to a generic care action for a type it does not know", () => {
    const unknown = careAction({ type: "UNKNOWN" as unknown as CareActionType });

    expect(getCareActionMeta(unknown)).toStrictEqual({
      icon: "star",
      color: "#6B7280",
      iconBackground: "#F3F4F6",
      label: "Cuidado",
    });
  });
});

describe("getActivityCategory", () => {
  it("finds an activity by its type", () => {
    expect(getActivityCategory("YOGA")).toStrictEqual({
      icon: "self-improvement",
      color: "#7C3AED",
      iconBackground: "#EDE9FE",
      label: "Yoga",
    });
  });

  it("falls back to the catch-all activity", () => {
    expect(getActivityCategory()).toStrictEqual(GENERIC_ACTIVITY);
    expect(getActivityCategory("SKATE")).toStrictEqual(GENERIC_ACTIVITY);
  });
});
