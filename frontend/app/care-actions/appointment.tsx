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
import { TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { CategoryChips, CategoryOption } from "@/components/ui/CategoryChips";
import { Spacing, Typography, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCreateCareAction } from "@/hooks";
import { AppointmentType } from "@/lib/api";

const APPOINTMENT_TYPES: CategoryOption<AppointmentType>[] = [
  { label: 'Analista', value: 'ANALYST', icon: <Ionicons name="person-outline" size={16} color={Colors.light.tint} /> },
  { label: 'Psiquiatra', value: 'PSYCHIATRIST', icon: <Ionicons name="medical-outline" size={16} color={Colors.light.tint} /> },
  { label: 'Clínico', value: 'GP', icon: <Ionicons name="fitness-outline" size={16} color={Colors.light.tint} /> },
  { label: 'Nutricionista', value: 'NUTRITIONIST', icon: <Ionicons name="nutrition-outline" size={16} color={Colors.light.tint} /> },
  { label: 'Outro', value: 'OTHER', icon: <Ionicons name="help-outline" size={16} color={Colors.light.tint} /> },
];

const DURATIONS = [30, 45, 50, 60];

export default function AppointmentCareAction() {
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('ANALYST');
  const [appointmentDuration, setAppointmentDuration] = useState<number>(50);
  const [appointmentNote, setAppointmentNote] = useState('');

  const createCareAction = useCreateCareAction();

  const handleSave = async () => {
    await createCareAction.mutateAsync({
      type: 'APPOINTMENT',
      moment: new Date(),
      appointment: {
        type: appointmentType,
        duration: appointmentDuration,
        note: appointmentNote || undefined,
      },
    });
    router.replace('/care-actions/post-appointment');
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Registrar consulta</Text>
            <Text style={styles.headerSubtitle}>
              Informe os detalhes da consulta ou sessão
            </Text>
          </View>

          <Section>
            <SectionHeader title="Tipo de consulta" />
            <CategoryChips
              options={APPOINTMENT_TYPES}
              active={appointmentType}
              onChange={setAppointmentType}
            />
          </Section>

          <Section>
            <SectionHeader title="Duração (min)" />
            <View style={styles.durationRow}>
              {DURATIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.durationChip,
                    appointmentDuration === d && styles.durationChipActive,
                  ]}
                  onPress={() => setAppointmentDuration(d)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.durationLabel,
                      appointmentDuration === d && styles.durationLabelActive,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section>
            <SectionHeader title="Notas (opcional)" />
            <Card style={{ padding: Spacing.cardGap }}>
              <TextArea
                label="Como foi a consulta?"
                variant="darkGhost"
                value={appointmentNote}
                onChangeText={setAppointmentNote}
                minRows={4}
                placeholder="Descreva brevemente..."
              />
            </Card>
          </Section>

          <Button
            title="Salvar"
            onPress={handleSave}
            loading={createCareAction.isPending}
            style={{ ...Shadows.lg }}
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
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  durationChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
    minWidth: 64,
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: Colors.light.tint + '1A',
    borderColor: Colors.light.tint,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  durationLabelActive: {
    color: Colors.light.text,
  },
});
