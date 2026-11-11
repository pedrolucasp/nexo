import {
  View,
  Switch,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
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
  const [showInactive, setShowInactive] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.light.tint} />
      </View>
    );
  }

  const regimens = data?.regimens ?? [];
  const inUse = regimens.filter((regimen) => regimen.active);
  const inactive = regimens.filter((regimen) => !regimen.active);

  const renderRow = (regimen: MedicineRegimen) => (
    <View key={regimen.id} style={styles.row}>
      <TouchableOpacity
        style={styles.rowMain}
        activeOpacity={0.7}
        onPress={() => router.push(`/medicine-regimens/${regimen.id}`)}
        accessibilityRole="button"
        accessibilityLabel={`Editar ${regimen.name}`}
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
      </TouchableOpacity>

      <View style={styles.switchWrap}>
        <Text style={styles.switchLabel}>Em uso</Text>
        <Switch
          value={regimen.active}
          onValueChange={(val) =>
            toggleRegimen.mutate({ id: String(regimen.id), active: val })
          }
          trackColor={{ true: Colors.light.tint, false: Colors.light.divider }}
          thumbColor={Colors.light.surface}
          accessibilityLabel={`${regimen.name} em uso`}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {regimens.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhum medicamento cadastrado</Text>
        </View>
      ) : (
        inUse.map(renderRow)
      )}

      <Button
        title="Novo medicamento"
        variant="dashed"
        onPress={() => router.push("/medicine-regimens/new")}
      />

      {inactive.length > 0 && (
        <View style={styles.inactiveGroup}>
          <Pressable
            style={styles.inactiveHeader}
            onPress={() => setShowInactive((value) => !value)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Desligados"
          >
            <Ionicons
              name={showInactive ? "chevron-down" : "chevron-forward"}
              size={16}
              color={Colors.light.textSecondary}
            />
            <Text style={styles.inactiveTitle}>Desligados</Text>
          </Pressable>

          {showInactive && inactive.map(renderRow)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.cardGap },
  center: { padding: Spacing.cardGap, alignItems: "center" },
  empty: { padding: Spacing.cardGap },
  emptyText: { ...Typography.bodyMd, color: Colors.light.textSecondary },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    padding: Spacing.cardGap,
    gap: 12,
    ...Shadows.sm,
    borderRadius: BorderRadius.lg,
  },
  rowMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  switchWrap: {
    alignItems: "center",
    gap: Spacing.inlineGapSm,
  },
  switchLabel: {
    ...Typography.labelSm,
    color: Colors.light.textSecondary,
  },
  inactiveGroup: { gap: Spacing.cardGap },
  inactiveHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.inlineGapSm,
    paddingVertical: Spacing.inlineGapSm,
  },
  inactiveTitle: {
    ...Typography.labelSm,
    fontWeight: "600",
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
});
