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
import { TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { CategoryChips, CategoryOption } from "@/components/ui/CategoryChips";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Spacing, Typography, Colors, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCreateCareAction } from "@/hooks";
import { AppointmentType } from "@/lib/api";
import { useCareActionLinkStore } from "@/stores";
import {
  APPOINTMENT_TYPE_OPTIONS,
  APPOINTMENT_DURATIONS,
} from "@/constants/care-action-categories";

const APPOINTMENT_TYPES: CategoryOption<AppointmentType>[] =
  APPOINTMENT_TYPE_OPTIONS.map(({ icon, ...option }) => ({
    ...option,
    icon: <Ionicons name={icon} size={16} color={Colors.light.tint} />,
  }));

export default function AppointmentCareAction() {
  const [appointmentType, setAppointmentType] = useState<AppointmentType>('ANALYST');
  const [appointmentDuration, setAppointmentDuration] = useState<number>(50);
  const [appointmentNote, setAppointmentNote] = useState('');

  const createCareAction = useCreateCareAction();

  const handleSave = async () => {
    const result = await createCareAction.mutateAsync({
      type: 'APPOINTMENT',
      moment: new Date(),
      appointment: {
        type: appointmentType,
        duration: appointmentDuration,
        note: appointmentNote || undefined,
      },
    });
    useCareActionLinkStore.getState().setPending(result.careAction.id);
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
            <ChipRow>
              {APPOINTMENT_DURATIONS.map((d) => (
                <Chip
                  key={d}
                  label={String(d)}
                  active={appointmentDuration === d}
                  onPress={() => setAppointmentDuration(d)}
                />
              ))}
            </ChipRow>
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
});
