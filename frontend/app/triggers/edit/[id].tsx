import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams, Stack } from "expo-router";

import { Card } from "@/components/ui/Cards";
import { TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing, Typography, Colors, BorderRadius } from "@/constants/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUpdateTrigger, useTrigger } from "@/hooks";
import { CategoryChips, CategoryOption } from "@/components/ui/CategoryChips";
import { TriggerCategory } from "@/constants/triggers";
import { TRIGGER_CATEGORY_DEFINITIONS } from "@/constants/trigger-categories";
import { TimePicker } from "@/components/ui/TimePicker";

const TRIGGER_CATEGORIES: CategoryOption<TriggerCategory>[] =
  TRIGGER_CATEGORY_DEFINITIONS.map((d) => ({
    label: d.label,
    value: d.id,
    icon: <MaterialIcons size={16} color={d.color} name={d.icon} />,
  }));

export default function EditTrigger() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: trigger, isLoading } = useTrigger(id);
  const updateTrigger = useUpdateTrigger();

  const [moment, setMoment] = useState(new Date());
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("WORK");

  useEffect(() => {
    if (trigger) {
      setMoment(new Date(trigger.moment));
      setComment(trigger.comment || "");
      setCategory(trigger.category);
    }
  }, [trigger]);

  const save = async () => {
    const data = {
      moment,
      comment,
      category,
    };

    await updateTrigger.mutateAsync({ id: String(id), payload: data });
    router.back();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <Stack.Screen options={{ title: "Editar Registro" }} />
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.innerHeaderWrapper}>
              <View style={[styles.headerIcon, { backgroundColor: "#FFF7ED" }]}>
                <Ionicons name="flash-outline" size={20} color="#EA580C" />
              </View>

              <View style={styles.headerTitleSubtitle}>
                <Text style={styles.headerTitle}>Editar Gatilho</Text>
                <Text style={styles.headerSubtitle}>
                  Atualize os dados do acontecimento
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              Você pode editar este registro nos primeiros 5 minutos após a
              criação.
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

          <Button
            title="Salvar Alterações"
            onPress={save}
            isLoading={updateTrigger.isPending}
            disabled={updateTrigger.isPending}
          />
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
