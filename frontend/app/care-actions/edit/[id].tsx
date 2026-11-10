import { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Cards";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { CategoryChips, CategoryOption } from "@/components/ui/CategoryChips";
import { Chip, ChipRow } from "@/components/ui/Chip";
import {
  Spacing,
  Typography,
  Colors,
} from "@/constants/theme";
import {
  APPOINTMENT_TYPE_OPTIONS,
  ACTIVITY_TYPE_OPTIONS,
  APPOINTMENT_DURATIONS,
} from "@/constants/care-action-categories";
import {
  useCareAction,
  usePatchCareAction,
  useEditingWindow,
} from "@/hooks";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/lib/api";
import { translateError } from "@/lib/errors/translations";
import type {
  ActivityType,
  AppointmentType,
  CareAction,
} from "@/lib/api";

const APPOINTMENT_OPTIONS: CategoryOption<AppointmentType>[] =
  APPOINTMENT_TYPE_OPTIONS.map(({ icon, ...option }) => ({
    ...option,
    icon: <Ionicons name={icon} size={16} color={Colors.light.tint} />,
  }));

const ACTIVITY_OPTIONS: CategoryOption<ActivityType>[] =
  ACTIVITY_TYPE_OPTIONS.map(({ icon, ...option }) => ({
    ...option,
    icon: <Ionicons name={icon} size={16} color={Colors.light.tint} />,
  }));

export default function EditCareAction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: careAction, isLoading } = useCareAction(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!careAction) {
    return null;
  }

  return <EditCareActionForm id={id} careAction={careAction} />;
}

function EditCareActionForm({
  id,
  careAction,
}: {
  id: string;
  careAction: CareAction;
}) {
  const patchCareAction = usePatchCareAction();
  const { canEdit } = useEditingWindow(careAction.createdAt);
  const { showToast } = useToast();

  const [appointmentType, setAppointmentType] = useState<AppointmentType>(
    careAction.appointment?.type ?? "ANALYST",
  );
  const [appointmentDuration, setAppointmentDuration] = useState<number>(
    careAction.appointment?.duration ?? 50,
  );
  const [appointmentNote, setAppointmentNote] = useState(
    careAction.appointment?.note ?? "",
  );

  const [activityType, setActivityType] = useState<ActivityType>(
    careAction.activity?.type ?? "WALK",
  );
  const [activityDuration, setActivityDuration] = useState(
    careAction.activity?.duration ? String(careAction.activity.duration) : "",
  );

  const save = async () => {
    try {
      await patchCareAction.mutateAsync({
        id: String(id),
        data: {
          ...(careAction.type === "APPOINTMENT" && {
            appointment: {
              type: appointmentType,
              duration: appointmentDuration,
              note: appointmentNote || undefined,
            },
          }),
          ...(careAction.type === "ACTIVITY" && {
            activity: {
              type: activityType,
              duration: activityDuration
                ? Number(activityDuration)
                : undefined,
            },
          }),
        },
      });
      router.back();
    } catch (error) {
      showToast(
        error instanceof ApiError
          ? translateError(error)
          : "Falha ao alterar a ação de cuidado",
        "error",
      );
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <Stack.Screen options={{ title: "Editar Registro" }} />
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Editar Ação de Cuidado</Text>
            <Text style={styles.headerSubtitle}>
              Atualize os dados do registro
            </Text>
            <Text style={styles.description}>
              Você pode editar este registro nos primeiros 5 minutos após a
              criação.
            </Text>
          </View>

          {careAction.type === "APPOINTMENT" && (
            <>
              <Section>
                <SectionHeader title="Tipo de consulta" />
                <CategoryChips
                  options={APPOINTMENT_OPTIONS}
                  active={appointmentType}
                  onChange={setAppointmentType}
                />
              </Section>

              <Section>
                <SectionHeader title="Duração (min)" />
                <ChipRow>
                  {APPOINTMENT_DURATIONS.map((duration) => (
                    <Chip
                      key={duration}
                      label={String(duration)}
                      active={appointmentDuration === duration}
                      onPress={() => setAppointmentDuration(duration)}
                    />
                  ))}
                </ChipRow>
              </Section>

              <Section>
                <SectionHeader title="Notas (opcional)" />
                <Card style={styles.card}>
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
            </>
          )}

          {careAction.type === "ACTIVITY" && (
            <>
              <Section>
                <SectionHeader title="Tipo de atividade" />
                <CategoryChips
                  options={ACTIVITY_OPTIONS}
                  active={activityType}
                  onChange={setActivityType}
                />
              </Section>

              <Section>
                <SectionHeader title="Duração (min, opcional)" />
                <Card style={styles.card}>
                  <Input
                    label="Duração em minutos"
                    value={activityDuration}
                    onChangeText={setActivityDuration}
                    placeholder="Ex: 30"
                    keyboardType="numeric"
                    variant="darkGhost"
                  />
                </Card>
              </Section>
            </>
          )}

          {careAction.type === "MEDICINE" && (
            <Card style={styles.card}>
              <Text style={styles.medicineNote}>
                A dose de um medicamento não é editável: nome, dosagem e
                frequência pertencem ao medicamento, não ao registro da tomada.
                Edite o medicamento na tela de gerenciamento.
              </Text>
            </Card>
          )}

          <Button
            title="Salvar Alterações"
            onPress={save}
            loading={patchCareAction.isPending}
            disabled={
              !canEdit ||
              patchCareAction.isPending ||
              careAction.type === "MEDICINE"
            }
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    marginBottom: 50,
  },
  card: {
    padding: Spacing.cardGap,
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
  description: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    marginTop: 12,
  },
  medicineNote: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
  },
});
