import { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Text } from '@/components/ui/Text';
import { router, useLocalSearchParams, Link } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { Card } from "@/components/ui/Cards";
import { Section } from '@/components/ui/Sections';
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { Colors, Spacing, Typography, BorderRadius, Shadows } from "@/constants/theme";
import { getTriggerCategory } from "@/constants/trigger-categories";
import { useTriggers, useLinkMoodToTrigger } from "@/hooks";
import { Trigger } from "@/lib/api";
import { formatMoment } from '@/lib/utils/time';

export default function PostMood() {
  const { moodId } = useLocalSearchParams<{ moodId: string }>();
  const { user } = useAuth();

  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  const [impact, setImpact] = useState(3);
  const [linked, setLinked] = useState(false);

  const { data: triggersData, isLoading: isLoadingTriggers } = useTriggers({ limit: 3 });
  const recentTriggers = triggersData?.entries ?? [];

  const linkMoodToTrigger = useLinkMoodToTrigger();

  const handleLink = async () => {
    if (!selectedTrigger || !moodId) return;
    await linkMoodToTrigger.mutateAsync({
      triggerId: String(selectedTrigger.id),
      moodId,
      perceivedImpact: impact,
    });

    setLinked(true);
    setSelectedTrigger(null);
  };

  return (
    <ScreenLayout
      userName={user?.firstName}
      userAvatar={user?.avatarURL}
    >
      {/* Confirmation block */}
      <View style={styles.confirmationBlock}>
        <View style={styles.outerRing}>
          <View style={styles.innerCircle}>
            <Ionicons name="checkmark" size={32} color="#fff" />
          </View>
        </View>
        <Text style={styles.confirmTitle}>Humor Salvo!</Text>
        <Text style={styles.confirmSubtitle}>
          Seu registro foi armazenado com sucesso.
        </Text>
      </View>

      {/* Link prompt card */}
      {linked ? (
        <View style={styles.linkedRow}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.light.tint} />
          <Text style={styles.linkedText}>Gatilho vinculado</Text>
        </View>
      ) : (
        <Card style={styles.linkCard}>
          {selectedTrigger ? (
            /* Impact picker state */
            <View style={styles.impactPicker}>
              {/* Selected trigger header */}
              <View style={styles.selectedTriggerRow}>
                {(() => {
                  const cat = getTriggerCategory(selectedTrigger.category);
                  return (
                    <>
                      <View style={[styles.triggerIconBubble, { backgroundColor: cat.iconBackground }]}>
                        <MaterialIcons name={cat.icon} size={18} color={cat.color} />
                      </View>
                      <Text style={styles.selectedTriggerLabel} numberOfLines={1}>
                        {cat.label}
                      </Text>
                    </>
                  );
                })()}
                <TouchableOpacity
                  onPress={() => setSelectedTrigger(null)}
                  hitSlop={8}
                  style={styles.deselectButton}
                >
                  <Ionicons name="close" size={18} color={Colors.light.textSecondary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.impactLabel}>Qual foi o impacto?</Text>

              <View style={styles.impactButtons}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const isSelected = impact === n;
                  return (
                    <TouchableOpacity
                      key={n}
                      style={[
                        styles.impactCircle,
                        isSelected && styles.impactCircleSelected,
                      ]}
                      onPress={() => setImpact(n)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.impactCircleText,
                          isSelected && styles.impactCircleTextSelected,
                        ]}
                      >
                        {n}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button
                title="Vincular"
                onPress={handleLink}
                loading={linkMoodToTrigger.isPending}
                style={{ marginTop: 4, ...Shadows.lg }}
              />
            </View>
          ) : (
            /* Trigger selection state */
            <>
              <Text style={styles.linkCardTitle}>
                Algo aconteceu que pode ter influenciado esse humor?
              </Text>
              <Text style={styles.linkCardSubtitle}>
                Selecione um gatilho recente ou adicione um novo.
              </Text>

              {isLoadingTriggers ? (
                <ActivityIndicator style={{ marginTop: 12 }} />
              ) : (
                <View style={styles.triggerGrid}>
                  {recentTriggers.map((trigger) => {
                    const cat = getTriggerCategory(trigger.category);
                    return (
                      <Pressable
                        key={trigger.id}
                        style={({ pressed }) => [
                          styles.triggerGridItem,
                          pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => setSelectedTrigger(trigger)}
                      >
                        <View style={[styles.triggerIconBubble, { backgroundColor: cat.iconBackground }]}>
                          <MaterialIcons name={cat.icon} size={20} color={cat.color} />
                        </View>
                        <Text style={styles.triggerItemLabel} numberOfLines={2}>
                          {cat.label}
                        </Text>
                        <Text style={styles.triggerItemLabel} numberOfLines={2}>
                          {formatMoment(trigger.moment)}
                        </Text>
                      </Pressable>
                    );
                  })}

                  {/* New trigger item */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.triggerGridItem,
                      styles.newTriggerItem,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => router.push(`/triggers/new?moodId=${moodId}`)}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color={Colors.light.textSecondary}
                    />
                    <Text style={styles.newTriggerLabel}>Novo gatilho</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </Card>
      )}

      <Button
        title={linked ? 'Voltar para a tela inicial' : 'Pular essa etapa'}
        variant="ghost"
        onPress={() => router.replace("/(tabs)/new")}
        style={styles.concludeButton}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  linkCard: {
    padding: Spacing.cardGap,
    marginBottom: Spacing.sectionGap,
  },
  linkCardTitle: {
    ...Typography.bodyMd,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 4,
  },
  linkCardSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  triggerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  triggerGridItem: {
    width: "48%",
    minHeight: 80,
    backgroundColor: "#fff",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    gap: 6,
    ...Shadows.sm,
  },
  newTriggerItem: {
    borderStyle: "dashed",
    borderColor: Colors.light.borderDashed,
    backgroundColor: "transparent",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  triggerIconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerItemLabel: {
    ...Typography.labelSm,
    color: Colors.light.text,
    textAlign: "center",
  },
  newTriggerLabel: {
    ...Typography.labelSm,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  // Impact picker
  impactPicker: {
    gap: 12,
  },
  selectedTriggerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  selectedTriggerLabel: {
    ...Typography.bodyMd,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
  },
  deselectButton: {
    padding: 4,
  },
  impactLabel: {
    ...Typography.bodyMd,
    fontWeight: "600",
    color: Colors.light.text,
  },
  impactButtons: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  impactCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
    alignItems: "center",
    justifyContent: "center",
  },
  impactCircleSelected: {
    backgroundColor: Colors.light.tint + "1A",
    borderColor: Colors.light.tint,
  },
  impactCircleText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
  },
  impactCircleTextSelected: {
    color: Colors.light.text,
  },
  // Linked success
  linkedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: Spacing.sectionGap,
    paddingHorizontal: 4,
  },
  linkedText: {
    ...Typography.bodyMd,
    fontWeight: "600",
    color: Colors.light.tint,
    textAlign: 'center'
  },
  moodList: {
    gap: 8,
  },
  concludeButton: {
    marginTop: 8,
  },
});
