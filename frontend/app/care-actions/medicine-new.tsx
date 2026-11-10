import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useState } from "react";
import { router } from "expo-router";

import { Card } from "@/components/ui/Cards";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Spacing, Typography, Colors } from "@/constants/theme";
import { TimePicker } from "@/components/ui/TimePicker";
import { useCreateMedicineRegimen } from "@/hooks";
import { MedicinePeriodicity } from "@/lib/api";

const PERIODICITY_OPTIONS: { label: string; value: MedicinePeriodicity }[] = [
  { label: 'Uma vez', value: 'ONCE' },
  { label: 'Diário', value: 'DAILY' },
  { label: '2x ao dia', value: 'TWICE_DAILY' },
  { label: '3x ao dia', value: 'THREE_TIMES_DAILY' },
  { label: 'Semanal', value: 'WEEKLY' },
  { label: 'Quinzenal', value: 'BIWEEKLY' },
  { label: 'Mensal', value: 'MONTHLY' },
];

function getTimePickerCount(p: MedicinePeriodicity): number {
  switch (p) {
    case 'ONCE': return 0;
    case 'DAILY': return 1;
    case 'TWICE_DAILY': return 2;
    case 'THREE_TIMES_DAILY': return 3;
    default: return 1;
  }
}

export default function MedicineNewCareAction() {
  const [medicineName, setMedicineName] = useState('');
  const [medicineDosage, setMedicineDosage] = useState('');
  const [medicinePeriodicity, setMedicinePeriodicity] = useState<MedicinePeriodicity>('ONCE');
  const [scheduledTimes, setScheduledTimes] = useState<Date[]>([]);

  const createRegimen = useCreateMedicineRegimen();

  const handleSave = async () => {
    const count = getTimePickerCount(medicinePeriodicity);
    const scheduledAt = scheduledTimes.slice(0, count).map(
      d => `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
    );

    await createRegimen.mutateAsync({
      name: medicineName,
      dosage: medicineDosage,
      periodicity: medicinePeriodicity,
      scheduledAt,
    });
    router.replace('/(tabs)/actions');
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Novo medicamento</Text>
            <Text style={styles.headerSubtitle}>
              Informe os detalhes do medicamento
            </Text>
          </View>

          <Section>
            <SectionHeader title="Detalhes" />
            <Card style={{ padding: Spacing.cardGap }}>
              <Input
                label="Nome"
                value={medicineName}
                onChangeText={setMedicineName}
                placeholder="Ex: Fluoxetina"
                variant="darkGhost"
              />
              <Input
                label="Dosagem"
                value={medicineDosage}
                onChangeText={setMedicineDosage}
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
                  variant="solid"
                  active={medicinePeriodicity === opt.value}
                  onPress={() => {
                    setMedicinePeriodicity(opt.value);
                    const count = getTimePickerCount(opt.value);
                    setScheduledTimes(prev =>
                      count === 0 ? [] :
                      count > prev.length ? [...prev, ...Array(count - prev.length).fill(new Date())] :
                      prev.slice(0, count)
                    );
                  }}
                />
              ))}
            </ChipRow>
          </Section>

          {scheduledTimes.length > 0 && (
            <Section>
              <SectionHeader title={scheduledTimes.length === 1 ? 'Horário' : 'Horários'} />
              {scheduledTimes.map((t, i) => (
                <View style={{ marginTop: 10 }} key={i}>
                  <TimePicker
                    value={t}
                    onChange={(date) =>
                      setScheduledTimes(prev => prev.map((v, idx) => idx === i ? date : v))
                    }
                  />
                </View>
              ))}
            </Section>
          )}

          <Button
            title="Salvar"
            onPress={handleSave}
            loading={createRegimen.isPending}
            disabled={!medicineName || !medicineDosage}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    marginBottom: Spacing.sectionGap,
  },
  header: {
    gap: 8,
  },
  headerTitle: {
    ...Typography.headlineMd,
  },
  headerSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
  },
});
