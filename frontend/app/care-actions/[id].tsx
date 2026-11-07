import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Card } from "@/components/ui/Cards";
import { Col, Row } from "@/components/ui/LayoutHelpers";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Badge } from "@/components/ui/Badge";
import { Typography, Theme, Colors, Spacing } from "@/constants/theme";
import {
  useCareAction,
  useDeleteCareAction,
} from "@/hooks/useCareAction.queries";
import { useTrigger } from "@/hooks/useTrigger.queries";
import { useMoodEntry } from "@/hooks/useMoodEntries.queries";
import { getActivityCategory } from "@/constants/care-action-categories";
import { getTriggerCategory } from "@/constants/trigger-categories";
import { getMood } from "@/constants/moods";
import { formatMoment } from "@/lib/utils/time";
import type { CareAction } from "@/lib/api";
import { RecordManagement } from "@/components/ui/RecordManagement";

// TODO: Generalize these into a single source of truth, similar to other
// constants

// label helpers
const APPOINTMENT_LABELS: Record<string, string> = {
  ANALYST: "Analista",
  PSYCHIATRIST: "Psiquiatra",
  GP: "Clínico geral",
  NUTRITIONIST: "Nutricionista",
  PHYSIOTHERAPIST: "Fisioterapeuta",
  OTHER: "Consulta",
};

const ACTIVITY_LABELS: Record<string, string> = {
  WALK: "Caminhada",
  YOGA: "Yoga",
  GYM: "Academia",
  MEDITATION: "Meditação",
  SOCIAL: "Momento social",
  CREATIVE: "Atividade criativa",
  OTHER: "Atividade",
};

const PERIODICITY_LABELS: Record<string, string> = {
  ONCE: "Dose única",
  DAILY: "1× ao dia",
  TWICE_DAILY: "2× ao dia",
  THREE_TIMES_DAILY: "3× ao dia",
  WEEKLY: "1× por semana",
  BIWEEKLY: "2× por semana",
  MONTHLY: "1× por mês",
};

// header meta
type HeaderMeta = {
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  iconBg: string;
  title: string;
};

function resolveHeader(ca: CareAction): HeaderMeta {
  switch (ca.type) {
    case "MEDICINE":
      return {
        icon: "medication",
        color: "#7C3AED",
        iconBg: "#EDE9FE",
        title: ca.medicineLog?.regimen?.name ?? "Medicamento",
      };
    case "APPOINTMENT":
      return {
        icon: "psychology",
        color: "#1D4ED8",
        iconBg: "#DBEAFE",
        title: `Consulta · ${APPOINTMENT_LABELS[ca.appointment?.type ?? ""] ?? "Consulta"}`,
      };
    case "ACTIVITY": {
      const meta = getActivityCategory(ca.activity?.type);
      return {
        icon: meta.icon,
        color: meta.color,
        iconBg: meta.iconBackground,
        title: ACTIVITY_LABELS[ca.activity?.type ?? ""] ?? "Atividade",
      };
    }
    default:
      return {
        icon: "star",
        color: "#6B7280",
        iconBg: "#F3F4F6",
        title: "Ação de cuidado",
      };
  }
}

// DetailRow
// TODO: Might as well generalize this into a component
type DetailRowProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
};

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <Row style={styles.detailRow}>
      <View style={styles.detailIconWrap}>
        <MaterialIcons name={icon} size={18} color="#6366F1" />
      </View>
      <Col gap={1}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </Col>
    </Row>
  );
}

export default function CareActionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: careAction, isLoading, isError } = useCareAction(id);
  const deleteCareAction = useDeleteCareAction();

  const triggerId = String(careAction?.triggerId ?? "");
  const moodId = String(careAction?.moodId ?? "");
  const { data: trigger } = useTrigger(triggerId);
  const { data: mood } = useMoodEntry(moodId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (isError || !careAction) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Registro não encontrado.</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const header = resolveHeader(careAction);

  const handleDelete = async () => {
    await deleteCareAction.mutateAsync(String(careAction.id));
    router.back();
  };

  const hasLink = !!(careAction.triggerId || careAction.moodId);

  return (
    <>
      <Stack.Screen options={{ title: "Ver detalhes" }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={{ padding: Spacing.cardGap }}>
          <Row style={{ alignItems: "center" }}>
            <View style={[styles.iconWrap, { backgroundColor: header.iconBg }]}>
              <MaterialIcons
                name={header.icon}
                size={22}
                color={header.color}
              />
            </View>
            <Col gap={2}>
              <Text style={styles.title}>{header.title}</Text>
              <Text style={styles.subtitle}>
                {formatMoment(new Date(careAction.moment))}
              </Text>
            </Col>
          </Row>
        </Card>

        <Card style={styles.topCard}>
          {careAction.type === "MEDICINE" && (
            <>
              {careAction.medicineLog?.regimen?.dosage ? (
                <DetailRow
                  icon="medication"
                  label="Dosagem"
                  value={careAction.medicineLog.regimen.dosage}
                />
              ) : null}
              {careAction.medicineLog?.regimen?.periodicity ? (
                <DetailRow
                  icon="schedule"
                  label="Frequência"
                  value={
                    PERIODICITY_LABELS[
                      careAction.medicineLog.regimen.periodicity
                    ] ?? careAction.medicineLog.regimen.periodicity
                  }
                />
              ) : null}
            </>
          )}

          {careAction.type === "APPOINTMENT" && (
            <>
              <DetailRow
                icon="psychology"
                label="Tipo"
                value={
                  APPOINTMENT_LABELS[careAction.appointment?.type ?? ""] ??
                  "Consulta"
                }
              />
              {careAction.appointment?.duration ? (
                <DetailRow
                  icon="timer"
                  label="Duração"
                  value={`${careAction.appointment.duration} min`}
                />
              ) : null}
            </>
          )}

          {careAction.type === "ACTIVITY" && (
            <>
              <DetailRow
                icon={header.icon}
                label="Tipo"
                value="Atividade"
              />
              {careAction.activity?.duration ? (
                <DetailRow
                  icon="timer"
                  label="Duração"
                  value={`${careAction.activity.duration} min`}
                />
              ) : null}
            </>
          )}
        </Card>

        {careAction.appointment?.note ? (
          <Section>
            <SectionHeader title="Anotações" variant="subtle" />
            <Card style={{ padding: Spacing.cardGap }}>
              <Text style={styles.annotation}>
                &quot;{careAction.appointment.note.trim()}&quot;
              </Text>
            </Card>
          </Section>
        ) : null}

        {hasLink && (
          <Section>
            <SectionHeader title="Vínculo" variant="subtle" />
            <Col gap={8}>
              {trigger && (
                <Pressable
                  onPress={() =>
                    router.push(`/triggers/${trigger.id}`)
                  }
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Card style={styles.linkCard}>
                    <Row style={{ alignItems: "center", gap: 12 }}>
                      {(() => {
                        const meta = getTriggerCategory(trigger.category);
                        return (
                          <View
                            style={[
                              styles.linkIconCircle,
                              { backgroundColor: meta.iconBackground },
                            ]}
                          >
                            <MaterialIcons
                              name={meta.icon}
                              size={20}
                              color={meta.color}
                            />
                          </View>
                        );
                      })()}
                      <Col gap={2} style={{ flex: 1 }}>
                        <Row style={{ alignItems: "center", gap: 6 }}>
                          <Text style={styles.linkLabel}>
                            {getTriggerCategory(trigger.category).label}
                          </Text>
                          <Badge label="Gatilho" variant="yellow" style={undefined} />
                        </Row>
                        <Text style={styles.linkTime}>
                          {formatMoment(new Date(trigger.moment))}
                        </Text>
                      </Col>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={Colors.light.disabled}
                      />
                    </Row>
                  </Card>
                </Pressable>
              )}

              {mood && (
                <Pressable
                  onPress={() =>
                    router.push(`/entry/${mood.id}`)
                  }
                  style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                >
                  <Card style={styles.linkCard}>
                    <Row style={{ alignItems: "center", gap: 12 }}>
                      <View style={styles.linkIconCircle}>
                        <Text style={styles.linkEmoji}>
                          {getMood(mood.selectedMood.toLowerCase())?.icon ?? "😐"}
                        </Text>
                      </View>
                      <Col gap={2} style={{ flex: 1 }}>
                        <Row style={{ alignItems: "center", gap: 6 }}>
                          <Text style={styles.linkLabel}>
                            {getMood(mood.selectedMood.toLowerCase())?.label ?? mood.selectedMood}
                          </Text>
                          <Badge label="Humor" variant="yellow" style={undefined} />
                        </Row>
                        <Text style={styles.linkTime}>
                          {formatMoment(new Date(mood.moment))}
                        </Text>
                      </Col>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={Colors.light.disabled}
                      />
                    </Row>
                  </Card>
                </Pressable>
              )}
            </Col>
          </Section>
        )}

        <RecordManagement
          createdAt={careAction.createdAt}
          onEdit={() => router.push(`/care-actions/edit/${careAction.id}`)}
          onDelete={handleDelete}
          deleting={deleteCareAction.isPending}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.containerPadding,
    gap: Spacing.sectionGap,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.light.tint,
    borderRadius: Theme.borderRadius.md,
  },
  backButtonText: {
    fontWeight: "700",
    color: Colors.light.text,
  },

  // Top card
  topCard: {
    padding: 16,
    gap: 0,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  title: {
    ...Typography.headlineLg,
    fontWeight: 700,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.divider,
    marginVertical: 12,
  },

  // Detail rows
  detailRow: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.text,
  },

  // Link cards
  linkCard: {
    padding: Spacing.cardGap,
  },
  linkIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  linkLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  linkTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  linkEmoji: {
    fontSize: 22,
  },

  // Management
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
  },
  deleteInfo: {
    marginTop: 4,
  },

  // Annotation
  annotation: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    padding: 4,
  },
});
