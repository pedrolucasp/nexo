import { View, Switch, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { Colors, Typography, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { useMedicineRegimens, useToggleMedicineRegimen } from "@/hooks";
import { MedicineRegimen } from "@/lib/api";

const PERIODICITY_LABELS: Record<string, string> = {
  ONCE: "Uma vez",
  DAILY: "Diário",
  TWICE_DAILY: "2x ao dia",
  THREE_TIMES_DAILY: "3x ao dia",
  WEEKLY: "Semanal",
  BIWEEKLY: "Quinzenal",
  MONTHLY: "Mensal",
};

function scheduleSummary(regimen: MedicineRegimen): string {
  const times = regimen.scheduledAt.length > 0
    ? regimen.scheduledAt.join(" · ")
    : null;
  const label = PERIODICITY_LABELS[regimen.periodicity] ?? regimen.periodicity;
  return times ? `${times} · ${label}` : label;
}

export function MedicineRegimenList() {
  const { data, isLoading } = useMedicineRegimens();
  const toggleRegimen = useToggleMedicineRegimen();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  const regimens = data?.regimens ?? [];

  return (
    <View style={styles.container}>
      {regimens.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum medicamento cadastrado</Text>
        </View>
      ) : (
        regimens.map((regimen) => (
          <TouchableOpacity
            key={regimen.id}
            style={styles.row}
            activeOpacity={0.7}
            onPress={() => router.push(`/medicine-regimens/${regimen.id}`)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="bandage-outline" size={18} color={Colors.light.tint} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{regimen.name}</Text>
              <Text style={styles.meta}>
                {regimen.dosage} · {scheduleSummary(regimen)}
              </Text>
            </View>
            <Switch
              value={regimen.active}
              onValueChange={(val) =>
                toggleRegimen.mutate({ id: String(regimen.id), active: val })
              }
              trackColor={{ true: Colors.light.tint, false: Colors.light.divider }}
              thumbColor="#fff"
            />
          </TouchableOpacity>
        ))
      )}


      <Button
        title="Cadastrar outro medicamento"
        variant="dashed"
        onPress={() => router.push('/care-actions/medicine-new')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 1 },
  center: { padding: Spacing.cardGap, alignItems: "center" },
  empty: { padding: Spacing.cardGap },
  emptyText: { ...Typography.bodyMd, color: Colors.light.textSecondary },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: Spacing.cardGap,
    gap: 12,
    ...Shadows.sm,
    borderRadius: BorderRadius.lg,
    marginBottom: 5
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.tint + "1A",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1 },
  name: { ...Typography.bodyMd, fontWeight: "600" },
  meta: { ...Typography.labelSm, color: Colors.light.textSecondary },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: Spacing.cardGap,
    paddingHorizontal: 4,
  },
  addText: { ...Typography.bodyMd, color: Colors.light.tint, fontWeight: "600" },
});
