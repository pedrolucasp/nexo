import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Cards";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Spacing, Typography, Colors } from "@/constants/theme";
import { TimePicker } from "@/components/ui/TimePicker";
import { useMedicineRegimen, useUpdateMedicineRegimen } from "@/hooks";
import type { MedicinePeriodicity, MedicineRegimen } from "@/lib/api";

const PERIODICITY_OPTIONS: { label: string; value: MedicinePeriodicity }[] = [
  { label: "Uma vez", value: "ONCE" },
  { label: "Diário", value: "DAILY" },
  { label: "2x ao dia", value: "TWICE_DAILY" },
  { label: "3x ao dia", value: "THREE_TIMES_DAILY" },
  { label: "Semanal", value: "WEEKLY" },
  { label: "Quinzenal", value: "BIWEEKLY" },
  { label: "Mensal", value: "MONTHLY" },
];

function getTimePickerCount(p: MedicinePeriodicity): number {
  switch (p) {
    case "ONCE": return 0;
    case "DAILY": return 1;
    case "TWICE_DAILY": return 2;
    case "THREE_TIMES_DAILY": return 3;
    default: return 1;
  }
}

function timesToDates(times: string[]): Date[] {
  return times.map((t) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  });
}

export default function MedicineRegimenEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useMedicineRegimen(id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  if (!data?.regimen) {
    return null;
  }

  return <MedicineRegimenForm id={id} regimen={data.regimen} />;
}

function MedicineRegimenForm({ id, regimen }: { id: string; regimen: MedicineRegimen }) {
  const updateRegimen = useUpdateMedicineRegimen();

  const [name, setName] = useState(regimen.name);
  const [dosage, setDosage] = useState(regimen.dosage);
  const [periodicity, setPeriodicity] = useState<MedicinePeriodicity>(regimen.periodicity);
  const [scheduledTimes, setScheduledTimes] = useState<Date[]>(
    timesToDates(regimen.scheduledAt),
  );

  const handleSave = async () => {
    const count = getTimePickerCount(periodicity);
    const scheduledAt = scheduledTimes.slice(0, count).map(
      (d) =>
        `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
    );

    await updateRegimen.mutateAsync({
      id,
      payload: { name, dosage, periodicity, scheduledAt },
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Editar medicamento</Text>
            <Text style={styles.headerSubtitle}>
              Atualize os detalhes do medicamento
            </Text>
          </View>

          <Section>
            <SectionHeader title="Detalhes" />
            <Card style={{ padding: Spacing.cardGap }}>
              <Input
                label="Nome"
                value={name}
                onChangeText={setName}
                placeholder="Ex: Fluoxetina"
                variant="darkGhost"
              />
              <Input
                label="Dosagem"
                value={dosage}
                onChangeText={setDosage}
                placeholder="Ex: 20mg"
                variant="darkGhost"
              />
            </Card>
          </Section>

          <Section>
            <SectionHeader title="Frequência" />
            <ChipRow>
              {PERIODICITY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  active={periodicity === opt.value}
                  onPress={() => {
                    setPeriodicity(opt.value);
                    const count = getTimePickerCount(opt.value);
                    setScheduledTimes((prev) =>
                      count === 0
                        ? []
                        : count > prev.length
                        ? [...prev, ...Array(count - prev.length).fill(new Date())]
                        : prev.slice(0, count)
                    );
                  }}
                />
              ))}
            </ChipRow>
          </Section>

          {scheduledTimes.length > 0 && (
            <Section>
              <SectionHeader
                title={scheduledTimes.length === 1 ? "Horário" : "Horários"}
              />
              {scheduledTimes.map((t, i) => (
                <View style={{ marginTop: 10 }} key={i}>
                  <TimePicker
                    value={t}
                    onChange={(date) =>
                      setScheduledTimes((prev) =>
                        prev.map((v, idx) => (idx === i ? date : v))
                      )
                    }
                  />
                </View>
              ))}
            </Section>
          )}

          <Button
            title="Salvar"
            onPress={handleSave}
            loading={updateRegimen.isPending}
            disabled={!name || !dosage}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    marginBottom: 50,
  },
  header: { gap: 8 },
  headerTitle: { ...Typography.headlineMd },
  headerSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
  },
});
