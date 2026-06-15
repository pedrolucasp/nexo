import React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { ScaleSlider } from "@/components/ui/ScaleSlider";
import { Row, Grid } from "@/components/ui/LayoutHelpers";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Cards";
import { Theme } from "@/constants/theme";
import {
  MOOD_COMPONENTS,
  getMoodComponent,
  intensityLabel,
} from "@/constants/mood-components";

import { useMoodEntryStore } from "@/stores/moodEntry";

export default function MoodComponentsScreen() {
  const {
    selectedMood,
    components,
    addComponent,
    removeComponent,
    setComponentIntensity,
  } = useMoodEntryStore();

  const activeIds = components.map((c) => c.id);
  const available = MOOD_COMPONENTS.filter((d) => !activeIds.includes(d.id));

  const handleDone = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color={Theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Adicionar estados</Text>
        <Pressable onPress={handleDone} hitSlop={8}>
          <Text style={styles.headerAction}>Pronto</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        {selectedMood && (
          <View style={styles.subtitleBlock}>
            <Text style={styles.subtitleSmall}>
              Além do humor principal, o que melhor descreve como estou me
              sentindo agora?
            </Text>
          </View>
        )}

        {/* Active components */}
        {components.length > 0 && (
          <Section>
            <SectionHeader
              title="Intensidade"
              info={`Ativos: ${components.length}`}
            />

            {components.map((comp) => {
              const def = getMoodComponent(comp.id);
              if (!def) return null;

              return (
                <Card key={comp.id} style={styles.activeCard}>
                  {/* Card header */}
                  <Row style={styles.activeCardHeader}>
                    <View
                      style={[styles.dot, { backgroundColor: def.color }]}
                    />
                    <Text style={styles.activeCardLabel}>{def.label}</Text>
                    <Pressable
                      onPress={() => removeComponent(comp.id)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name="remove-circle-outline"
                        size={22}
                        color="#F87171"
                      />
                    </Pressable>
                  </Row>

                  {/* Slider */}
                  <ScaleSlider
                    variant="compact"
                    label="Intensidade"
                    value={comp.intensity}
                    onValueChange={(v) => setComponentIntensity(comp.id, v)}
                    min={1}
                    max={3}
                    step={1}
                    minLabel="Suave"
                    maxLabel="Intensa"
                    style={styles.slider}
                  />
                </Card>
              );
            })}
          </Section>
        )}

        {/* Available to add */}
        {available.length > 0 && (
          <Section>
            <SectionHeader title="Estado & Emoções" />
            <Grid gap={2}>
              {available.map((def) => (
                <Card key={def.id} style={styles.availableItem}>
                  <Pressable
                    onPress={() => addComponent(def.id)}
                    style={styles.availableItemInternalWrapper}
                  >
                    <Row gap={8} style={styles.availableInner}>
                      <View
                        style={[styles.dot, { backgroundColor: def.color }]}
                      />
                      <Text style={styles.availableLabel}>{def.label}</Text>
                    </Row>

                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color={Theme.colors.light.smallAddButtonIcon}
                    />
                  </Pressable>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        <Button title="Pronto" onPress={handleDone} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.containerPadding,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.light.divider,
  },
  headerTitle: {
    fontSize: Theme.typography.bodyLg.fontSize,
    fontWeight: "700",
    color: Theme.colors.light.text,
  },
  headerAction: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontWeight: "600",
    color: Theme.colors.light.tint,
  },
  content: {
    padding: Theme.spacing.containerPadding,
    gap: Theme.spacing.sectionGap,
    paddingBottom: 120,
  },
  subtitleBlock: {
    alignItems: "center",
    gap: 4,
  },
  subtitleSmall: {
    fontSize: Theme.typography.bodyMd.fontSize,
    color: Theme.colors.light.textSecondary,
    textAlign: "center",
  },
  subtitleLarge: {
    fontSize: 28,
    fontWeight: "700",
    color: Theme.colors.light.text,
  },
  section: {
    gap: Theme.spacing.cardGap,
  },
  sectionHeader: {
    justifyContent: "space-between",
    alignItems: "center",
  },
  activeCard: {
    padding: Theme.spacing.cardGap,
  },
  activeCardHeader: {
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  activeCardLabel: {
    flex: 1,
    ...{ ...Theme.typography.bodyLg, lineHeight: 24 },
    color: Theme.colors.light.text,
    marginLeft: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    flexShrink: 0,
  },
  slider: {
    marginTop: 4,
  },
  availableItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  availableItemInternalWrapper: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
  },
  availableInner: {
    alignItems: "center",
    flexShrink: 1,
  },
  availableLabel: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontWeight: "500",
    color: Theme.colors.light.text,
  },
});
