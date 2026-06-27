import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";

import { Card } from "@/components/ui/Cards";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing, Typography, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { TimePicker } from "@/components/ui/TimePicker";
import { useCreateCareAction } from "@/hooks";
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
    case 'WEEKLY':
    case 'BIWEEKLY':
    case 'MONTHLY': return 1;
  }
}

export default function MedicineNewCareAction() {
  const [medicineName, setMedicineName] = useState('');
  const [medicineDosage, setMedicineDosage] = useState('');
  const [medicinePeriodicity, setMedicinePeriodicity] = useState<MedicinePeriodicity>('ONCE');
  const [scheduledTimes, setScheduledTimes] = useState<Date[]>([]);

  const createCareAction = useCreateCareAction();

  const handleSave = async () => {
    const count = getTimePickerCount(medicinePeriodicity);
    const scheduledAt = scheduledTimes.slice(0, count).map(
      d => `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`
    );

    await createCareAction.mutateAsync({
      type: 'MEDICINE',
      moment: new Date(),
      medicine: {
        name: medicineName,
        dosage: medicineDosage,
        periodicity: medicinePeriodicity,
        scheduledAt,
      },
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
            <View style={styles.periodicityRow}>
              {PERIODICITY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.periodicityChip,
                    medicinePeriodicity === opt.value && styles.periodicityChipActive,
                  ]}
                  onPress={() => {
                    setMedicinePeriodicity(opt.value);
                    const count = getTimePickerCount(opt.value);
                    setScheduledTimes(prev =>
                      count === 0 ? [] :
                      count > prev.length ? [...prev, ...Array(count - prev.length).fill(new Date())] :
                      prev.slice(0, count)
                    );
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodicityChipLabel,
                      medicinePeriodicity === opt.value && styles.periodicityChipLabelActive,
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
            loading={createCareAction.isPending}
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
    marginBottom: 50,
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
  periodicityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  periodicityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
  },
  periodicityChipActive: {
    backgroundColor: Colors.light.tint + '1A',
    borderColor: Colors.light.tint,
  },
  periodicityChipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  periodicityChipLabelActive: {
    fontWeight: '600',
    color: Colors.light.text,
  },
});
