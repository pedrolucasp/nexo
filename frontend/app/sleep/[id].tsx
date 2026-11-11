import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useLocalSearchParams, router, Stack } from "expo-router";

import { Card } from "@/components/ui/Cards";
import { Col, Row } from "@/components/ui/LayoutHelpers";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Theme, Colors, Spacing } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { RecordManagement } from "@/components/ui/RecordManagement";
import {
  useSleepRecord,
  useDeleteSleepRecord,
} from "@/hooks/useSleepRecord.queries";
import { formatDate, formatMinutes, parseDateOnly } from "@/lib/utils/time";

export default function SleepDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: sleepRecord, isLoading, isError } = useSleepRecord(id);
  const deleteSleepRecord = useDeleteSleepRecord();
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
                {formatDate(parseDateOnly(sleepRecord.date))}
              </Text>

              {sleepRecord.wakeMinutes != null && (
                <Text style={styles.dateLabel}>
                  Acordou por volta das {formatMinutes(sleepRecord.wakeMinutes)}
                </Text>
              )}
            </Col>
          </Row>
        </Card>

        {/* Annotation / notes */}
        {sleepRecord.annotations && (
          <Section style={styles.flushSection}>
            <SectionHeader title="Anotações" variant="subtle" />
            <Card style={{ padding: Spacing.cardGap }}>
              <Text style={styles.annotation}>
                &quot;{sleepRecord.annotations?.trim()}&quot;
              </Text>
            </Card>
          </Section>
        )}

        <RecordManagement
          createdAt={sleepRecord.createdAt}
          onEdit={() => router.push(`/sleep/edit/${sleepRecord.id}`)}
          onDelete={handleDelete}
          deleting={deleteSleepRecord.isPending}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.light.background,
  },
  content: {
    padding: Spacing.containerPadding,
    gap: Spacing.sectionGap,
    paddingBottom: 48,
  },
  flushSection: {
    marginBottom: 0,
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
  suffixLabel: {
    height: '100%',
    fontSize: 17,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  dateLabel: {
    fontSize: 13,
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
    backgroundColor: Theme.colors.light.tint,
    borderRadius: Theme.borderRadius.md,
  },
  backButtonText: {
    fontWeight: "700",
    color: Theme.colors.light.text,
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
    color: Theme.colors.light.tint,
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
  deleteInfo: {
    marginTop: 4,
  },
});
