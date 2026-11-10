import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useState } from "react";
import { router } from "expo-router";

import { Card } from "@/components/ui/Cards";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { CategoryChips, CategoryOption } from "@/components/ui/CategoryChips";
import { Spacing, Typography, Colors, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCreateCareAction } from "@/hooks";
import { ActivityType } from "@/lib/api";
import { ACTIVITY_TYPE_OPTIONS, getActivityCategory } from "@/constants/care-action-categories";

const ACTIVITY_TYPES: CategoryOption<ActivityType>[] =
  ACTIVITY_TYPE_OPTIONS.map(({ icon, ...option }) => {
    const meta = getActivityCategory(option.value);
    return {
      ...option,
      color: meta.color,
      iconBackground: meta.iconBackground,
      icon: <Ionicons name={icon} size={16} color={meta.color} />,
    };
  });

export default function ActivityCareAction() {
  const [activityType, setActivityType] = useState<ActivityType>('WALK');
  const [activityDuration, setActivityDuration] = useState('');

  const createCareAction = useCreateCareAction();

  const handleSave = async () => {
    await createCareAction.mutateAsync({
      type: 'ACTIVITY',
      moment: new Date(),
      activity: {
        type: activityType,
        duration: activityDuration ? Number(activityDuration) : undefined,
      },
    });
    router.replace('/(tabs)/actions');
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Registrar atividade</Text>
            <Text style={styles.headerSubtitle}>
              Qual atividade você realizou?
            </Text>
          </View>

          <Section>
            <SectionHeader title="Tipo de atividade" />
            <CategoryChips
              options={ACTIVITY_TYPES}
              active={activityType}
              onChange={setActivityType}
            />
          </Section>

          <Section>
            <SectionHeader title="Duração (min, opcional)" />
            <Card style={{ padding: Spacing.cardGap }}>
              <Input
                label="Duração em minutos"
                value={activityDuration}
                onChangeText={setActivityDuration}
                placeholder="Ex: 30"
                keyboardType="numeric"
                variant="darkGhost"
              />
            </Card>
          </Section>

          <Button
            title="Salvar"
            onPress={handleSave}
            loading={createCareAction.isPending}
            style={{ ...Shadows.lg }}
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
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    marginBottom: Spacing.sectionGap,
  },
  header: {
    gap: 8,
  },
  headerTitle: {
    ...Typography.headlineMd,
  },
  headerSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
  },
});
