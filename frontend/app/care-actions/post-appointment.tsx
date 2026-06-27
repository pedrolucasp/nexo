import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Cards";
import { Colors, Spacing, Typography, BorderRadius, Shadows } from "@/constants/theme";
import { useCareActionLinkStore } from "@/stores";

export default function PostAppointment() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Confirmation block */}
        <View style={styles.confirmationBlock}>
          <View style={styles.outerRing}>
            <View style={styles.innerCircle}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </View>
          </View>
          <Text style={styles.confirmTitle}>Consulta Salva!</Text>
          <Text style={styles.confirmSubtitle}>
            Sua consulta foi registrada com sucesso.
          </Text>
        </View>

        {/* Follow-up card */}
        <Card style={styles.followUpCard}>
          <Text style={styles.followUpTitle}>Algo surgiu na sessão?</Text>
          <Text style={styles.followUpSubtitle}>
            Aproveite para registrar enquanto está fresco
          </Text>

          <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={() => router.replace("/triggers/new?category=THERAPY")}
          >
            <View style={[styles.optionIcon, { backgroundColor: "#ede9fe" }]}>
              <Ionicons name="flash-outline" size={22} color="#7c3aed" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Criar um gatilho</Text>
              <Text style={styles.optionDesc}>
                Registre algo que emergiu na sessão
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.light.disabled}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionRow}
            activeOpacity={0.7}
            onPress={() => router.replace("/new/entry")}
          >
            <View style={[styles.optionIcon, { backgroundColor: "#fef9c3" }]}>
              <Ionicons name="heart-outline" size={22} color="#ca8a04" />
            </View>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>Registrar humor</Text>
              <Text style={styles.optionDesc}>
                Como você está se sentindo agora?
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.light.disabled}
            />
          </TouchableOpacity>
        </Card>

        <Button
          title="Concluir"
          variant="ghost"
          onPress={() => {
            useCareActionLinkStore.getState().clear();
            router.replace("/(tabs)/actions");
          }}
          style={styles.concludeButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 48,
    paddingBottom: 36,
  },
  confirmationBlock: {
    alignItems: "center",
    marginBottom: Spacing.sectionGap,
    gap: 12,
  },
  outerRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E7FDEF",
    alignItems: "center",
    justifyContent: "center",
  },
  innerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.tint,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTitle: {
    ...Typography.headlineMd,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
  },
  confirmSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  followUpCard: {
    padding: Spacing.cardGap,
    marginBottom: Spacing.sectionGap,
    gap: 12,
  },
  followUpTitle: {
    ...Typography.headlineMd,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 2,
  },
  followUpSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.cardGap,
    backgroundColor: "#fff",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    gap: 12,
    ...Shadows.sm,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...Typography.bodyMd,
    fontWeight: "600",
    color: Colors.light.text,
  },
  optionDesc: {
    ...Typography.labelSm,
    color: Colors.light.textSecondary,
  },
  concludeButton: {
    marginTop: 8,
  },
});
