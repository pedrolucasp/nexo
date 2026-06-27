import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Cards";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing, Typography, Colors, BorderRadius } from "@/constants/theme";
import { TimePicker } from "@/components/ui/TimePicker";
import { useMedicineRegimen, useUpdateMedicineRegimen } from "@/hooks";
import { MedicinePeriodicity } from "@/lib/api";

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
  const updateRegimen = useUpdateMedicineRegimen();

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [periodicity, setPeriodicity] = useState<MedicinePeriodicity>("DAILY");
  const [scheduledTimes, setScheduledTimes] = useState<Date[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data?.regimen && !initialized) {
      const r = data.regimen;
      setName(r.name);
      setDosage(r.dosage);
      setPeriodicity(r.periodicity as MedicinePeriodicity);
      setScheduledTimes(timesToDates(r.scheduledAt));
      setInitialized(true);
    }
  }, [data, initialized]);

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

  if (isLoading || !initialized) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

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
            <View style={styles.periodicityRow}>
              {PERIODICITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.periodicityChip,
                    periodicity === opt.value && styles.periodicityChipActive,
                  ]}
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
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodicityChipLabel,
                      periodicity === opt.value && styles.periodicityChipLabelActive,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  periodicityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  periodicityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
  },
  periodicityChipActive: {
    backgroundColor: Colors.light.tint + "1A",
    borderColor: Colors.light.tint,
  },
  periodicityChipLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  periodicityChipLabelActive: {
    fontWeight: "600",
    color: Colors.light.text,
  },
});
