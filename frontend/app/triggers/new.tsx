import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";

import { Card } from "@/components/ui/Cards";
import { TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing, Typography, Colors, BorderRadius } from "@/constants/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCreateTrigger, useMoodEntries } from "@/hooks";
import { CategoryChips, CategoryOption } from "@/components/ui/CategoryChips";
import { TriggerCategory } from "@/constants/triggers";
import { TRIGGER_CATEGORY_DEFINITIONS } from "@/constants/trigger-categories";
import { TimePicker } from "@/components/ui/TimePicker";
import { getMood } from "@/constants/moods";
import { LinkRow } from "@/components/ui/LinkRow";

const TRIGGER_CATEGORIES: CategoryOption<TriggerCategory>[] =
  TRIGGER_CATEGORY_DEFINITIONS.map((d) => ({
    label: d.label,
    value: d.id,
    icon: <MaterialIcons size={16} color={d.color} name={d.icon} />,
  }));

export default function NewTrigger() {
  const [moment, setMoment] = useState(new Date());
  const [comment, setComment] = useState("");
  const { category: initialCategory } = useLocalSearchParams<{ category?: string }>();
  const [category, setCategory] = useState(initialCategory ?? "WORK");
  const createTrigger = useCreateTrigger();
  const [linkMood, setLinkMood] = useState(false);
  const { data: moodEntries, isLoading: isLoadingMood } = useMoodEntries({
    limit: 1,
  });

  const latestMood = moodEntries?.entries[0] ?? null;
  const moodDef = latestMood
    ? getMood(latestMood.selectedMood.toLowerCase())
    : null;

  const save = async () => {
    const data = {
      moment,
      comment,
      category,
      ...(linkMood && latestMood ? { moodId: latestMood.id } : null),
    };

    await createTrigger.mutateAsync(data);
    router.replace("/(tabs)/actions");
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.innerHeaderWrapper}>
              <View style={[styles.headerIcon, { backgroundColor: "#FFF7ED" }]}>
                <Ionicons name="flash-outline" size={20} color="#EA580C" />
              </View>

              <View style={styles.headerTitleSubtitle}>
                <Text style={styles.headerTitle}>Aconteceu algo?</Text>
                <Text style={styles.headerSubtitle}>
                  Registre acontecimentos fora do padrão
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              Identificar gatilhos ajuda a entender melhor seus padrões
              emocionais
            </Text>
          </View>

          <Section>
            <SectionHeader title="Horário do Evento" />
            <TimePicker value={moment} onChange={setMoment} />
          </Section>

          <Section>
            <SectionHeader title="Selecionar uma categoria" />
            <CategoryChips
              options={TRIGGER_CATEGORIES}
              active={category}
              onChange={setCategory}
            />
          </Section>

          <Section>
            <SectionHeader title="Adicione detalhes" />

            <Card style={styles.mainCard}>
              <TextArea
                label="Comentários sobre"
                variant="darkGhost"
                onChangeText={(val) => setComment(val)}
                value={comment}
                minRows={5}
                maxRows={10}
                placeholder="Descreva o que gerou esse sentimento"
              />
            </Card>
          </Section>

          <Section>
            <SectionHeader title="Vincular registro" />

            <LinkRow
              icon={
                <View
                  style={[styles.iconWrap, { backgroundColor: "transparent" }]}
                >
                  <Text style={styles.moodIconEmoji}>
                    {moodDef?.icon ?? "😐"}
                  </Text>
                </View>
              }
              label="Humor atual"
              sublabel={
                isLoadingMood ? "..." : (moodDef?.label ?? "Nenhum registrado")
              }
              disabled={!latestMood}
              value={linkMood && !!latestMood}
              onToggle={setLinkMood}
            />

            <LinkRow
              icon={
                <MaterialIcons
                  name="psychology"
                  size={40}
                  color={Colors.light.disabled}
                />
              }
              label="Prática"
              sublabel={"Nenhuma registrada"}
              disabled={true}
              value={false}
              onToggle={() => {
                console.log("When we get that");
              }}
            />
          </Section>

          <Button title="Salvar Registro" onPress={save} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    marginBottom: 50,
  },
  mainCard: {
    padding: Spacing.cardGap,
  },
  // Header
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
  keyboardView: {
    flex: 1,
  },
  moodIconEmoji: {
    fontSize: 26,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
});
