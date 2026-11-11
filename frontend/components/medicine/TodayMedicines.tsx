import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useMedicineToday, useCreateCareAction, medicineTodayKeys } from "@/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { confirmedIndexes, sortedTimes } from "@/lib/medicine/today";

export function TodayMedicines() {
  const { data, isLoading } = useMedicineToday();
  const createCareAction = useCreateCareAction();
  const queryClient = useQueryClient();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  const entries = data?.regimens ?? [];

  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Nenhum medicamento agendado para hoje</Text>
      </View>
    );
  }

  const handleConfirm = async (regimenId: number, slot?: string) => {
    await createCareAction.mutateAsync({
      type: "MEDICINE",
      moment: new Date(),
      regimenId,
      ...(slot ? { scheduledSlot: slot } : {}),
    });

    queryClient.invalidateQueries({ queryKey: medicineTodayKeys.list() });
  };

  return (
    <View style={styles.container}>
      {entries.map((entry) => {
        const times = entry.regimen.scheduledAt.length > 0
          ? sortedTimes(entry.regimen.scheduledAt)
          : ["hoje"];
        const confirmed = confirmedIndexes(entry);

        return (
          <View key={entry.regimen.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <Ionicons name="bandage-outline" size={18} color={Colors.light.tint} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{entry.regimen.name}</Text>
                <Text style={styles.dosage}>{entry.regimen.dosage}</Text>
              </View>
            </View>

            {times.map((time, idx) => {
              const isDone = time === "hoje" ? entry.logs.length > 0 : confirmed.has(idx);

              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeRow, isDone && styles.timeRowConfirmed]}
                  onPress={
                    isDone
                      ? undefined
                      : () =>
                          handleConfirm(
                            entry.regimen.id,
                            time === "hoje" ? undefined : time,
                          )
                  }
                  activeOpacity={isDone ? 1 : 0.7}
                  disabled={isDone || createCareAction.isPending}
                >
                  <Text style={[styles.timeText, isDone && styles.timeTextConfirmed]}>
                    {time === "hoje" ? "Hoje" : time}
                  </Text>
                  {isDone ? (
                    <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                  ) : (
                    <View style={styles.pendingCircle} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.cardGap },
  center: { padding: Spacing.cardGap, alignItems: "center" },
  empty: { padding: Spacing.cardGap },
  emptyText: { ...Typography.bodyMd, color: Colors.light.textSecondary },
  card: {
    backgroundColor: "#fff",
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardGap,
    gap: 10,
    ...Shadows.sm,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
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
  timeRowConfirmed: { backgroundColor: "#F0FFF4", opacity: 0.8 },
  timeText: { ...Typography.bodyMd, fontWeight: "500" },
  timeTextConfirmed: { color: Colors.light.textSecondary },
  pendingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.divider,
  },
});
