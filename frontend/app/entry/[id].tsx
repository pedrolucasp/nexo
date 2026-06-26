import { useState, useEffect, use } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, SubtleInfoCard } from "@/components/ui/Cards";
import { NoLinkMessage } from "@/components/misc/NoLinkMessage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Col, Between, Row } from "@/components/ui/LayoutHelpers";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Theme, Colors, Spacing } from "@/constants/theme";
import { getMood } from "@/constants/moods";
import {
  getMoodComponent,
  intensityLabel,
  intensityToValue,
} from "@/constants/mood-components";
import { useMoodEntry, useDeleteMoodEntry } from "@/hooks";
import { getTimeBadge, formatMoment } from "@/lib/utils/time";
import { MoodComponentCard } from "@/components/ui/MoodComponentCard";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getTriggerCategory } from "@/constants/trigger-categories";

const impactColor = (n: number) => {
  if (n <= 1) return '#86efac';
  if (n <= 2) return '#22c55e';
  if (n <= 3) return '#f59e0b';
  if (n <= 4) return '#f97316';
  return '#ef4444';
};

export default function MoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading, isError } = useMoodEntry(id);
  const deleteMoodEntry = useDeleteMoodEntry();
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const moment = new Date(entry?.moment);
      const createdAt = new Date(entry?.moment);
      const msSinceCreation = Date.now() - createdAt.getTime();
      const deletionWindowMs = 5 * 60 * 1000;

      const newCanDelete = msSinceCreation < deletionWindowMs;
      const newMinutesLeft = Math.max(
        0,
        Math.ceil((deletionWindowMs - msSinceCreation) / 60000),
      );

      setCanDelete(newCanDelete);
      setMinutesLeft(newMinutesLeft);
    };

    updateTimer(); // Set initial values

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [entry?.moment]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Theme.colors.tint} />
      </View>
    );
  }

  if (isError || !entry) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Registro não encontrado.</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const moment = new Date(entry.moment);
  const moodDef = getMood(entry.selectedMood.toLowerCase());
  const badge = getTimeBadge(moment);

  const handleDelete = async () => {
    await deleteMoodEntry.mutateAsync(String(entry.id));

    router.back();
  };

  const deleteButtonMsg = () => {
    const msg = "Excluir Registro";
    const timeLeftStr = `(Disponível por ${minutesLeft < 1 ? "<1" : minutesLeft}:00)`;
    const suffix = canDelete ? timeLeftStr : "(Expirado)";

    return `${msg} ${suffix}`;
  };

  return (
    <>
      <Stack.Screen options={{ title: "Ver detalhes" }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header card */}
        <Card style={styles.headerCard}>
          <Between>
            <Row gap={12} style={{ alignItems: "center" }}>
              <Text style={styles.moodIcon}>{moodDef?.icon ?? "😐"}</Text>
              <Col gap={2}>
                <Text style={styles.moodLabel}>
                  {moodDef?.label ?? entry.selectedMood}
                </Text>
                <Text style={styles.moodTime}>{formatMoment(moment)}</Text>
              </Col>
            </Row>
            {/* If this is the latest mood entry, show the active badge */}
            <Badge
              label="Registro Ativo"
              backgroundColor={Theme.colors.activeBackground}
              color={Theme.colors.tint}
            />
          </Between>
        </Card>

        {/* Core levels */}
        <Section>
          <SectionHeader title="Níveis emocionais" variant="subtle" />
          {[
            { id: "energy", label: "Energia", value: entry.energyLevel },
            { id: "stress", label: "Estresse", value: entry.stressLevel },
            { id: "anxiety", label: "Ansiedade", value: entry.anxietyLevel },
          ].map((item, index, arr) => (
            <Card key={item.id} style={{ padding: Spacing.cardGap }}>
              <View key={item.label}>
                <View style={styles.componentRow}>
                  <Text style={styles.componentLabel}>{item.label}</Text>
                  <Text style={styles.componentIntensityGreen}>
                    {item.value}/10
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(item.value / 10) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </Card>
          ))}
        </Section>

        <Section>
          <SectionHeader title="Além disso, sinto..." variant="subtle" />
          <Col gap={0}>
            {entry.moodComponents.map((comp, index) => {
              const def = getMoodComponent(comp.component.toLowerCase());
              const numericIntensity =
                comp.intensity === "LIGHT"
                  ? 2
                  : comp.intensity === "MODERATE"
                    ? 5
                    : 8;

              return (
                <MoodComponentCard
                  key={comp.id}
                  id={comp.component.toLowerCase()}
                  intensity={comp.intensity}
                />
              );
            })}
          </Col>
        </Section>

        {/* Linked triggers */}
        <Section>
          <SectionHeader title="Vínculo" variant="subtle" />
          {entry.triggerLinks && entry.triggerLinks.length > 0 ? (
            <Col gap={8}>
              {entry.triggerLinks.map((link) => {
                const cat = getTriggerCategory(link.trigger.category);
                return (
                  <Pressable
                    key={link.id}
                    onPress={() => router.push(`/triggers/${link.trigger.id}`)}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  >
                    <Card style={styles.linkCard}>
                      <Row style={{ alignItems: "center", gap: 12 }}>
                        <View style={[styles.linkIconCircle, { backgroundColor: cat.iconBackground }]}>
                          <MaterialIcons name={cat.icon} size={22} color={cat.color} />
                        </View>
                        <Col gap={3} style={{ flex: 1 }}>
                          <Row style={{ alignItems: "center", gap: 6 }}>
                            <Text style={styles.linkLabel}>{cat.label}</Text>
                            <Badge label="Gatilho" variant="orange" style={undefined} />
                          </Row>
                          <Text style={styles.linkTime}>
                            {formatMoment(new Date(link.trigger.moment))}
                          </Text>
                        </Col>
                        <Ionicons name="chevron-forward" size={16} color={Colors.light.disabled} />
                      </Row>
                      <View style={styles.impactBar}>
                        <View
                          style={[
                            styles.impactFill,
                            {
                              width: `${(link.perceivedImpact / 5) * 100}%` as any,
                              backgroundColor: impactColor(link.perceivedImpact),
                            },
                          ]}
                        />
                      </View>
                    </Card>
                  </Pressable>
                );
              })}
            </Col>
          ) : (
            <NoLinkMessage />
          )}
        </Section>

        {/* Annotation / notes */}
        {entry.annotation && (
          <Section>
            <SectionHeader title="Anotações" variant="subtle" />
            <Card style={{ padding: Spacing.cardGap }}>
              <Text style={styles.annotation}>
                "{entry.annotation?.trim()}"
              </Text>
            </Card>
          </Section>
        )}

        {/* Delete */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GESTÃO DO REGISTRO</Text>
          <Button
            variant="danger"
            isLoading={deleteMoodEntry.isPending}
            disabled={!canDelete || deleteMoodEntry.isPending}
            onPress={handleDelete}
            title={deleteButtonMsg()}
          />

          <SubtleInfoCard
            style={styles.deleteInfo}
            text={`
              A exclusão de registros é permitida apenas nos primeiros 5 minutos
              após o envio para garantir a integridade do histórico emocional.
              `}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
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
    backgroundColor: Theme.colors.tint,
    borderRadius: Theme.borderRadius.md,
  },
  backButtonText: {
    fontWeight: "700",
    color: Theme.colors.text,
  },

  // Header
  headerCard: {
    padding: 16,
  },
  moodIcon: {
    fontSize: 40,
  },
  moodLabel: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.text,
  },
  moodTime: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },

  // Sections
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

  // Components
  componentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  componentLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  componentIntensity: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  componentIntensityGreen: {
    fontSize: 13,
    fontWeight: "700",
    color: Theme.colors.tint,
  },
  progressTrack: {
    height: 6,
    backgroundColor: Theme.colors.light.divider,
    borderRadius: Theme.borderRadius.full,
    marginBottom: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Theme.colors.light.tint,
    borderRadius: Theme.borderRadius.full,
  },
  // Annotation
  annotation: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    padding: 4,
  },
  // Linked trigger cards
  linkCard: {
    padding: Spacing.cardGap,
    overflow: "hidden",
    gap: 10,
  },
  linkIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  linkTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  linkLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.light.text,
  },
  impactBar: {
    height: 3,
    backgroundColor: Colors.light.divider,
    borderRadius: 99,
    overflow: "hidden",
  },
  impactFill: {
    height: "100%",
    borderRadius: 99,
  },

});
