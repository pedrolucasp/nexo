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
import { Theme, Typography, Colors, Spacing } from "@/constants/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getTriggerCategory } from "@/constants/trigger-categories";
import { getCareActionMeta } from "@/constants/care-action-categories";
import {
  useTrigger,
  useDeleteTrigger,
} from "@/hooks/useTrigger.queries";
import { usePatchCareAction } from "@/hooks";
import { useCareActionLinkStore } from "@/stores";
import { formatMoment } from "@/lib/utils/time";
import { getMood } from "@/constants/moods";

const impactColor = (n: number) => {
  if (n <= 1) return '#86efac';
  if (n <= 2) return '#22c55e';
  if (n <= 3) return '#f59e0b';
  if (n <= 4) return '#f97316';
  return '#ef4444';
};

export default function TriggerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: trigger, isLoading, isError } = useTrigger(id);
  const deleteTrigger = useDeleteTrigger();
  const patchCareAction = usePatchCareAction();
  const { pendingId, triggerLinked } = useCareActionLinkStore();
  const hasPendingCareAction = !!pendingId && !triggerLinked;
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const createdAt = new Date(trigger?.createdAt);
      if (!createdAt) return;

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

    if (isLoading) return;

    updateTimer(); // Set initial values

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [trigger, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (isError || !trigger) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Registro não encontrado.</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const meta = getTriggerCategory(trigger.category);

  const handleDelete = async () => {
    await deleteTrigger.mutateAsync(String(trigger.id));
    router.back();
  };

  const handleLinkCareAction = async () => {
    const careActionId = useCareActionLinkStore.getState().linkTrigger();
    if (!careActionId) return;
    await patchCareAction.mutateAsync({
      id: String(careActionId),
      data: { triggerId: trigger.id },
    });
  };

  const deleteButtonMsg = () => {
    const msg = "Excluir Registro";
    const timeLeftStr = `(Disponível por ${minutesLeft < 1 ? "<1" : minutesLeft}:00)`;
    const suffix = canDelete ? timeLeftStr : "(Expirado)";

    return `${msg} ${suffix}`;
  };

  const hasAnyLinks = (
    trigger.careActions && trigger.careActions.length > 0
  ) || (trigger.moodLinks && trigger.moodLinks.length > 0);

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
          <Row style={{ alignItems: "center" }}>
            <View style={[styles.iconWrap, { backgroundColor: meta.iconBackground }]}>
              <MaterialIcons name={meta.icon} size={22} color={meta.color} />
            </View>

            <Col gap={2}>
              <Text style={styles.triggerLabel}>
                {meta.label}
              </Text>
              <Text style={styles.triggerMoment}>
                {formatMoment(new Date(trigger.moment))}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Pending care action link banner */}
        {hasPendingCareAction && (
          <Pressable
            onPress={handleLinkCareAction}
            disabled={patchCareAction.isPending}
            style={({ pressed }) => [
              styles.linkBanner,
              pressed && { opacity: 0.75 },
            ]}
          >
            <View style={styles.linkBannerIcon}>
              <Ionicons name="link-outline" size={18} color="#1D4ED8" />
            </View>
            <Text style={styles.linkBannerText}>
              Vincular à consulta registrada
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#1D4ED8" />
          </Pressable>
        )}

        {/* Linked moods */}
        <Section>
          <SectionHeader title="Vínculo" variant="subtle" />
          {!!hasAnyLinks ? (
            <Col gap={8}>
              {trigger.moodLinks.map((link) => {
                const moodDef = getMood(link.mood.selectedMood.toLowerCase());
                return (
                  <Pressable
                    key={link.id}
                    onPress={() => router.push(`/entry/${link.mood.id}`)}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  >
                    <Card style={styles.linkCard}>
                      <Row style={{ alignItems: "center", gap: 12 }}>
                        <View style={styles.linkIconCircle}>
                          <Text style={styles.linkMoodEmoji}>{moodDef?.icon ?? "😐"}</Text>
                        </View>
                        <Col gap={3} style={{ flex: 1 }}>
                          <Row style={{ alignItems: "center", gap: 6 }}>
                            <Text style={styles.linkLabel}>
                              {moodDef?.label ?? link.mood.selectedMood}
                            </Text>

                            <Badge
                              label="Humor"
                              variant="yellow"
                              style={undefined}
                            />
                          </Row>

                          <Text style={styles.linkTime}>
                            {formatMoment(new Date(link.mood.moment))}
                          </Text>
                        </Col>
                        <Ionicons name="chevron-forward" size={16} color={Colors.light.disabled} />
                      </Row>
                      <View style={styles.impactBar}>
                        <View
                          style={[
                            styles.impactFill,
                            {
                              width: `${(link.perceivedImpact / 5) * 100}%`,
                              backgroundColor: impactColor(link.perceivedImpact),
                            },
                          ]}
                        />
                      </View>
                    </Card>
                  </Pressable>
                );
              })}

              {trigger.careActions.map((ca) => {
                const meta = getCareActionMeta(ca);
                return (
                  <Pressable
                    key={ca.id}
                    onPress={() => (router.push as any)(`/care-actions/${ca.id}`)}
                    style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                  >
                    <Card style={styles.linkCard}>
                      <Row style={{ alignItems: 'center', gap: 12 }}>
                        <View style={[styles.linkIconCircle, { backgroundColor: meta.iconBackground }]}>
                          <MaterialIcons name={meta.icon as any} size={22} color={meta.color} />
                        </View>
                        <Col gap={3} style={{ flex: 1 }}>
                          <Row style={{ alignItems: 'center', gap: 6 }}>
                            <Text style={styles.linkLabel}>{meta.label}</Text>
                            <Badge label="Consulta" variant="info" style={undefined} />
                          </Row>
                          <Text style={styles.linkTime}>
                            {formatMoment(new Date(ca.moment))}
                          </Text>
                        </Col>
                        <Ionicons name="chevron-forward" size={16} color={Colors.light.disabled} />
                      </Row>
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
        {trigger.comment && (
          <Section>
            <SectionHeader title="Anotações" variant="subtle" />
            <Card style={{ padding: Spacing.cardGap }}>
              <Text style={styles.annotation}>
                "{trigger.comment?.trim()}"
              </Text>
            </Card>
          </Section>
        )}

        {/* Delete */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GESTÃO DO REGISTRO</Text>
          <Button
            variant="outline"
            isLoading={false}
            disabled={!canDelete}
            onPress={() => router.push(`/triggers/edit/${trigger.id}`)}
            title="Editar Registro"
          />
          <Button
            variant="danger"
            isLoading={deleteTrigger.isPending}
            disabled={!canDelete || deleteTrigger.isPending}
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
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1
  },
  headerCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  triggerLabel: {
    ...Typography.headlineLg,
    color: Colors.light.text,
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

  // Pending link banner
  linkBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    padding: 12,
  },
  linkBannerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
  },

  // Header
  headerCard: {
    padding: 16,
  },
  triggerMoment: {
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

  // Annotation
  annotation: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    padding: 4,
  },
  // Linked mood cards
  linkCard: {
    padding: Spacing.cardGap,
    overflow: "hidden",
    gap: 10,
  },
  linkIconCircle: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  linkMoodEmoji: {
    fontSize: 28,
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
