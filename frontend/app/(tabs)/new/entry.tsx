import { useState, useEffect } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";

import { View, Text, StyleSheet, ScrollView } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/misc/themed-text";
import { ThemedView } from "@/components/misc/themed-view";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useAuth } from "@/context/AuthContext";
import { Grid, Col, Row, Between, Center } from "@/components/ui/LayoutHelpers";
import { Card } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { Input, TextArea } from "@/components/ui/Input";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing, Typography, Colors } from "@/constants/theme";
import { ScaleSlider } from "@/components/ui/ScaleSlider";
import { MoodComponentCard } from "@/components/ui/MoodComponentCard";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor, useCreateMoodEntry } from "@/hooks";
import { useMoodEntryStore } from "@/stores";

import { MOODS, getMood } from "@/constants/moods";

import { intensityToValue } from "@/constants/mood-components";

import { apiClient } from "@/lib/api";

export default function NewMoodEntry() {
  const { user } = useAuth();
  const tintColor = useThemeColor({}, "tint");

  const { initialMood } = useLocalSearchParams();
  const [annotation, setAnnotation] = useState();
  const [stress, setStress] = useState(0);
  const [anxiety, setAnxiety] = useState(0);
  const [energy, setEnergy] = useState(0);

  const { selectedMood, setSelectedMood, components, reset } =
    useMoodEntryStore();

  const createMoodEntry = useCreateMoodEntry();

  useEffect(() => {
    setSelectedMood(getMood(initialMood));
  }, [initialMood]);

  useEffect(() => {
    return () => reset();
  }, []);

  const saveMoodEntry = async () => {
    const data = {
      selectedMood: selectedMood?.id.toUpperCase(),
      stressLevel: stress,
      energyLevel: energy,
      anxietyLevel: anxiety,
      moment: new Date(),
      annotation: annotation,
      moodComponents: components.map((c) => ({
        component: c.id.toUpperCase(),
        intensity: intensityToValue(c.intensity),
      })),
    };

    const result = await createMoodEntry.mutateAsync(data);
    const moodId = result.mood.id;

    reset();

    router.replace(`/new/post-mood?moodId=${moodId}`);
  };

  const editComponents = () => {
    router.push("/entry/mood-components");
  };

  return (
    <View>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <Center>
            <ThemedText style={styles.statusPrefix}>
              Como você está se sentindo agora?
            </ThemedText>

            <ThemedText style={styles.statusText}>
              {selectedMood?.label || "Neutro"}
            </ThemedText>
          </Center>

          <Card style={styles.resumeCard}>
            <ThemedText style={styles.infoText}>
              Não existe resposta certa ou errada. Estime, de 0 a 10, como tu
              percebe tua energia, estresse e ansiedade neste momento. O
              objetivo é registrar uma impressão geral, não uma medida precisa.
            </ThemedText>

            <Col gap={24}>
              <ScaleSlider
                variant="rich"
                label="Energia"
                value={energy}
                onValueChange={setEnergy}
                icon={
                  <Ionicons name="flower-outline" size={20} color={tintColor} />
                }
                minLabel="Baixa"
                maxLabel="Alta"
              />

              <ScaleSlider
                variant="rich"
                label="Ansiedade"
                value={anxiety}
                onValueChange={setAnxiety}
                icon={<Ionicons name="sad-outline" size={20} color="#FB923C" />}
                minLabel="Calmo"
                maxLabel="Ansioso"
              />

              <ScaleSlider
                variant="rich"
                label="Estresse"
                value={stress}
                onValueChange={setStress}
                icon={<Ionicons name="flame" size={20} color="#f87171" />}
                minLabel="Relaxado"
                maxLabel="Estressado"
              />
            </Col>
          </Card>

          <Card style={styles.annotationsCard}>
            <TextArea
              label="Notas sobre o dia"
              type="text"
              variant="darkGhost"
              onChangeText={(val) => setAnnotation(val)}
              value={annotation}
              minRows={4}
              maxRows={6}
              placeholder="Escreva uma nota rápida sobre o seu dia até o momento..."
            />
          </Card>

          <Section>
            <SectionHeader title="Também estou..." />
            {components.length > 0 ? (
              <Grid gap={2} style={{ marginTop: 8 }}>
                {components.map((comp) => (
                  <MoodComponentCard
                    key={comp.id}
                    id={comp.id}
                    intensity={comp.intensity}
                  />
                ))}
              </Grid>
            ) : null}

            <Button
              title="Adicionar estados & emoções"
              onPress={editComponents}
              textStyle={{ fontWeight: 500 }}
              variant="dashed"
            />
          </Section>

          <Button
            title="Salvar Registro"
            onPress={saveMoodEntry}
            disabled={!components.length}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
  },
  infoText: {
    ...Typography.labelSm,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    fontWeight: "400" as const,
  },
  statusText: {
    ...Typography.headlineXg,
  },
  statusPrefix: {
    ...Typography.bodyMd,
  },
  annotationsCard: {
    padding: Spacing.cardGap,
  },
  resumeCard: {
    padding: Spacing.cardGap,
  },
});
