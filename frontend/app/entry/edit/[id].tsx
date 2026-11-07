import { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { TextArea } from "@/components/ui/Input";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { ScaleSlider } from "@/components/ui/ScaleSlider";
import { MoodSelector } from "@/components/ui/EmojiSelectors";
import { MoodComponentCard } from "@/components/ui/MoodComponentCard";
import { Grid, Col } from "@/components/ui/LayoutHelpers";
import { Spacing, Typography, Colors, BorderRadius } from "@/constants/theme";
import { MOODS } from "@/constants/moods";
import { intensityToValue } from "@/constants/mood-components";
import { useMoodEntry, useUpdateMoodEntry, useEditingWindow } from "@/hooks";
import { useMoodEntryStore } from "@/stores";
import { useToast } from "@/context/ToastContext";
import { ApiError } from "@/lib/api";
import { translateError } from "@/lib/errors/translations";
import type { MoodEntry } from "@/lib/api";

export default function EditMoodEntry() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: entry, isLoading } = useMoodEntry(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!entry) {
    return null;
  }

  return <EditMoodForm id={id} entry={entry} />;
}

function EditMoodForm({ id, entry }: { id: string; entry: MoodEntry }) {
  const updateMoodEntry = useUpdateMoodEntry();
  const { canEdit } = useEditingWindow(entry.createdAt);
  const { showToast } = useToast();

  const { selectedMood, setSelectedMood, components, setComponents, reset } =
    useMoodEntryStore();

  const [anxiety, setAnxiety] = useState(entry.anxietyLevel);
  const [stress, setStress] = useState(entry.stressLevel);
  const [energy, setEnergy] = useState(entry.energyLevel);
  const [annotation, setAnnotation] = useState(entry.annotation ?? "");

  // Seed the shared picker store from the record, then clear it on the way out
  // so the creation flow starts empty as it does today.
  useEffect(() => {
    setSelectedMood(entry.selectedMood.toLowerCase());
    setComponents(
      entry.moodComponents.map((component) => ({
        id: component.component.toLowerCase(),
        intensity:
          component.intensity === "LIGHT"
            ? 1
            : component.intensity === "MODERATE"
              ? 2
              : 3,
      })),
    );
  }, [entry, setSelectedMood, setComponents]);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  const save = async () => {
    try {
      await updateMoodEntry.mutateAsync({
        id: String(id),
        payload: {
          selectedMood: (selectedMood ?? "neutral").toUpperCase(),
          anxietyLevel: anxiety,
          stressLevel: stress,
          energyLevel: energy,
          annotation,
          moodComponents: components.map((component) => ({
            component: component.id.toUpperCase(),
            intensity: intensityToValue(component.intensity),
          })),
        },
      });
      router.back();
    } catch (error) {
      showToast(
        error instanceof ApiError
          ? translateError(error)
          : "Falha ao alterar o registro de humor",
        "error",
      );
    }
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <Stack.Screen options={{ title: "Editar Registro" }} />
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.innerHeaderWrapper}>
              <View style={[styles.headerIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="happy-outline" size={20} color="#2563EB" />
              </View>

              <View style={styles.headerTitleSubtitle}>
                <Text style={styles.headerTitle}>Editar Humor</Text>
                <Text style={styles.headerSubtitle}>
                  Atualize os dados do registro
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              Você pode editar este registro nos primeiros 5 minutos após a
              criação.
            </Text>
          </View>

          <Section>
            <SectionHeader title="Como você estava se sentindo?" />
            <Card style={{ padding: Spacing.cardGap }}>
              <MoodSelector
                items={MOODS}
                value={selectedMood ?? undefined}
                onSelect={setSelectedMood}
              />
            </Card>
          </Section>

          <Card style={styles.card}>
            <Col gap={24}>
              <ScaleSlider
                variant="rich"
                label="Energia"
                value={energy}
                onValueChange={setEnergy}
                minLabel="Baixa"
                maxLabel="Alta"
              />

              <ScaleSlider
                variant="rich"
                label="Ansiedade"
                value={anxiety}
                onValueChange={setAnxiety}
                minLabel="Calmo"
                maxLabel="Ansioso"
              />

              <ScaleSlider
                variant="rich"
                label="Estresse"
                value={stress}
                onValueChange={setStress}
                minLabel="Relaxado"
                maxLabel="Estressado"
              />
            </Col>
          </Card>

          <Card style={styles.card}>
            <TextArea
              label="Notas sobre o dia"
              variant="darkGhost"
              onChangeText={setAnnotation}
              value={annotation}
              minRows={4}
              maxRows={8}
              placeholder="Escreva uma nota rápida sobre o seu dia até o momento..."
            />
          </Card>

          <Section>
            <SectionHeader title="Também estou..." />
            {components.length > 0 ? (
              <Grid gap={2} style={{ marginTop: 8 }}>
                {components.map((component) => (
                  <MoodComponentCard
                    key={component.id}
                    id={component.id}
                    intensity={component.intensity}
                  />
                ))}
              </Grid>
            ) : null}

            <Button
              title="Editar estados & emoções"
              onPress={() => router.push("/entry/mood-components")}
              textStyle={{ fontWeight: 500 }}
              variant="dashed"
            />
          </Section>

          <Button
            title="Salvar Alterações"
            onPress={save}
            loading={updateMoodEntry.isPending}
            disabled={!canEdit || updateMoodEntry.isPending || !components.length}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    marginBottom: 50,
  },
  card: {
    padding: Spacing.cardGap,
  },
  header: {},
  headerIcon: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    width: 48,
    borderRadius: BorderRadius.md,
  },
  innerHeaderWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleSubtitle: {
    marginLeft: 10,
  },
  headerTitle: {
    ...Typography.headlineMd,
  },
  headerSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
  },
  description: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    marginTop: 20,
  },
});
