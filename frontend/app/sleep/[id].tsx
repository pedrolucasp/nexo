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
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Col, Between, Row } from "@/components/ui/LayoutHelpers";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Theme, Colors, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import {
  useSleepRecord,
  useDeleteSleepRecord,
} from "@/hooks/useSleepRecord.queries";
import { formatDate } from "@/lib/utils/time";

export default function SleepDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: sleepRecord, isLoading, isError } = useSleepRecord(id);
  const deleteSleepRecord = useDeleteSleepRecord();
  const [minutesLeft, setMinutesLeft] = useState(0);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const createdAt = sleepRecord?.createdAt;
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
  }, [sleepRecord, isLoading]);

  console.log("sleepRecord", sleepRecord)
  console.log("isLoading", isLoading)

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (isError || !sleepRecord) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Registro não encontrado.</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const handleDelete = async () => {
    await deleteSleepRecord.mutateAsync(String(sleepRecord.id));

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
          <Row style={{ alignItems: "center" }}>
            <View style={[styles.iconWrap, { backgroundColor: '#ede9fe' }]}>
              <MaterialIcons name="bedtime" size={22} color="#7c3aed" />
            </View>
            <Col>
              <Row style={{ alignItems: "flex-end" }}>
                <Text style={styles.averageLabel}>{sleepRecord.average}h</Text>
                <Text style={styles.suffixLabel}>de sono</Text>
              </Row>

              <Text style={styles.dateLabel}>
                {formatDate(new Date(sleepRecord.date))}
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Annotation / notes */}
        {sleepRecord.annotations && (
          <Section>
            <SectionHeader title="Anotações" variant="subtle" />
            <Card style={{ padding: Spacing.cardGap }}>
              <Text style={styles.annotation}>
                "{sleepRecord.annotations?.trim()}"
              </Text>
            </Card>
          </Section>
        )}

        {/* Delete */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>GESTÃO DO REGISTRO</Text>
          <Button
            variant="danger"
            isLoading={deleteSleepRecord.isPending}
            disabled={!canDelete || deleteSleepRecord.isPending}
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
  averageLabel: {
    height: '100%',
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.text,
  },
  averageLabelSuffix: {
    height: '100%',
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.textSecondary,
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
});
