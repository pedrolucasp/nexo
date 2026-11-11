import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { router } from "expo-router";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing, Typography, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMedicineToday, useCreateCareAction } from "@/hooks";
import {
  TodayBucket,
  bucketOf,
  confirmedIndexes,
  dueToday,
  hasElapsed,
  sortedTimes,
} from "@/lib/medicine/today";
import type { TodayMedicineEntry } from "@/lib/api";

const BUCKETS: { key: TodayBucket; title: string }[] = [
  { key: "late", title: "Atrasados" },
  { key: "upcoming", title: "Próximos" },
  { key: "taken", title: "Tomados" },
];

export default function MedicineCareAction() {
  const { data, isLoading } = useMedicineToday();
  const createCareAction = useCreateCareAction();
  const now = new Date();

  const due = (data?.regimens ?? []).filter(dueToday);
  const byBucket = new Map<TodayBucket, TodayMedicineEntry[]>();

  for (const entry of due) {
    const bucket = bucketOf(entry, now);
    byBucket.set(bucket, [...(byBucket.get(bucket) ?? []), entry]);
  }

  const groups = BUCKETS.map((bucket) => ({
    ...bucket,
    entries: byBucket.get(bucket.key) ?? [],
  })).filter((group) => group.entries.length > 0);

  const handleConfirm = async (regimenId: number, slot: string) => {
    await createCareAction.mutateAsync({
      type: "MEDICINE",
      moment: new Date(),
      regimenId,
      scheduledSlot: slot,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Nenhum medicamento para hoje.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {groups.map((group) => (
        <Section key={group.key} style={styles.section}>
          <SectionHeader title={group.title} />

          {group.entries.map((entry) => {
            const times = sortedTimes(entry.regimen.scheduledAt);
            const confirmed = confirmedIndexes(entry);

            return (
              <View
                key={entry.regimen.id}
                style={[styles.card, group.key === "taken" && styles.cardTaken]}
              >
                <TouchableOpacity
                  style={styles.cardHeader}
                  activeOpacity={0.7}
                  onPress={() => router.push("/medicine-regimens")}
                  accessibilityRole="button"
                  accessibilityLabel={
                    `${entry.regimen.name}, ${entry.regimen.dosage}. ` +
                    "Abrir gerenciamento de medicamentos"
                  }
                >
                  <View style={styles.iconWrap}>
                    <Ionicons name="bandage-outline" size={18} color={Colors.light.tint} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.name}>{entry.regimen.name}</Text>
                    <Text style={styles.dosage}>{entry.regimen.dosage}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.light.disabled} />
                </TouchableOpacity>

                {times.map((time, index) => {
                  const isDone = confirmed.has(index);
                  const isLate = !isDone && hasElapsed(time, now);

                  return (
                    <TouchableOpacity
                      key={`${time}-${index}`}
                      style={[styles.timeRow, isDone && styles.timeRowConfirmed]}
                      onPress={
                        isDone
                          ? undefined
                          : () => handleConfirm(entry.regimen.id, time)
                      }
                      activeOpacity={isDone ? 1 : 0.7}
                      disabled={isDone || createCareAction.isPending}
                      accessibilityRole="button"
                      accessibilityLabel={`Registrar dose de ${entry.regimen.name} às ${time}`}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          isDone && styles.timeTextConfirmed,
                          isLate && styles.timeTextLate,
                        ]}
                      >
                        {time}
                      </Text>
                      {isDone ? (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={Colors.light.success}
                        />
                      ) : (
                        <View
                          style={[styles.pendingCircle, isLate && styles.pendingCircleLate]}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            );
          })}
        </Section>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    marginBottom: Spacing.sectionGap,
  },
  section: {
    marginBottom: 0,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
  },
  emptyText: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardGap,
    gap: 10,
    marginBottom: Spacing.cardGap,
    ...Shadows.sm,
  },
  cardTaken: {
    opacity: 0.65,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.tint + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  cardInfo: { flex: 1 },
  name: { ...Typography.bodyMd, fontWeight: "600" },
  dosage: { ...Typography.labelSm, color: Colors.light.textSecondary },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.background,
  },
  timeRowConfirmed: {
    backgroundColor: Colors.light.activeBackground,
    opacity: 0.8,
  },
  timeText: { ...Typography.bodyMd, fontWeight: "500" },
  timeTextConfirmed: { color: Colors.light.textSecondary },
  timeTextLate: { color: Colors.light.danger },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.divider,
  },
  pendingCircleLate: {
    borderColor: Colors.light.danger,
  },
});
