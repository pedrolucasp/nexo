import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";

import { Card } from "@/components/ui/Cards";
import { Input, TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing, Typography, Colors, BorderRadius } from "@/constants/theme";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCreateTrigger } from "@/hooks";
import { CategoryChips, CategoryOption } from "@/components/ui/CategoryChips";
import { TriggerCategory } from "@/constants/triggers";

const TRIGGER_CATEGORIES: CategoryOption<TriggerCategory>[] = [
  {
    label: "Trabalho",
    value: "WORK",
    icon: <Ionicons size={16} color="#60A5FA" name="briefcase" />,
  },
  {
    label: "Social",
    value: "SOCIAL",
    icon: <MaterialIcons size={16} color="#AF52DE" name="diversity-1" />,
  },
  {
    label: "Saúde",
    value: "HEALTH",
    icon: <MaterialIcons size={16} color="#34C759" name="healing" />,
  },
  {
    label: "Família",
    value: "FAMILY",
    icon: <MaterialIcons size={16} color="#FF9500" name="family-restroom" />,
  },
  {
    label: "Outros",
    value: "OTHER",
    icon: <Ionicons size={16} color="#8E8E93" name="ellipsis-horizontal" />,
  },
];

export default function NewTrigger() {
  const [moment, setMoment] = useState(new Date());
  const [comment, setComment] = useState("");
  const [category, setCategory] = useState("WORK");
  const createTrigger = useCreateTrigger();

  const save = async () => {
    const data = {
      moment,
      comment,
      category,
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
});
