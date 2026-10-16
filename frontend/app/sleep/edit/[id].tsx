import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useState } from "react";
import { router, useLocalSearchParams, Stack } from "expo-router";

import { Card } from "@/components/ui/Cards";
import { TextArea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spacing, Typography, Colors, BorderRadius } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { ScaleSlider } from "@/components/ui/ScaleSlider";
import { useSleepRecord, useUpdateSleepRecord } from "@/hooks";
import { parseDateOnly } from "@/lib/utils/time";
import type { SleepRecord } from "@/lib/api";

export default function EditSleepRecord() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: sleepRecord, isLoading } = useSleepRecord(id);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  if (!sleepRecord) {
    return null;
  }

  return <EditSleepForm id={id} sleepRecord={sleepRecord} />;
}

function EditSleepForm({ id, sleepRecord }: { id: string; sleepRecord: SleepRecord }) {
  const updateSleepRecord = useUpdateSleepRecord();

  const [date, setDate] = useState(parseDateOnly(sleepRecord.date));
  const [annotations, setAnnotations] = useState(sleepRecord.annotations || "");
  const [average, setAverage] = useState(sleepRecord.average);

  const formatValue = (value: number): string => {
    return String(value).replaceAll(".", ",");
  };

  const save = async () => {
    const data = {
      date,
      annotations,
      average,
    };

    await updateSleepRecord.mutateAsync({ id: String(id), payload: data });
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <Stack.Screen options={{ title: "Editar Registro" }} />
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.innerHeaderWrapper}>
              <View style={[styles.headerIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="moon-outline" size={20} color="#2563EB" />
              </View>

              <View style={styles.headerTitleSubtitle}>
                <Text style={styles.headerTitle}>Editar Sono</Text>
                <Text style={styles.headerSubtitle}>
                  Atualize os dados do sono
                </Text>
              </View>
            </View>

            <Text style={styles.description}>
              Você pode editar este registro nos primeiros 5 minutos após a
              criação.
            </Text>
          </View>

          <Card style={styles.mainCard}>
            <DatePickerField
              label="Data do Registro"
              initialDate={date}
              maximumDate={new Date()}
              onChange={setDate}
            />

            <View style={{ marginVertical: 15 }}>
              <ScaleSlider
                label="Duração"
                value={average}
                onValueChange={setAverage}
                onValueFormat={formatValue}
                step={0.5}
                min={0.0}
                max={15.0}
                minLabel="0h"
                maxLabel="15h"
              />
            </View>

            <TextArea
              label="Notas sobre a qualidade"
              variant="darkGhost"
              onChangeText={(val) => setAnnotations(val)}
              value={annotations}
              minRows={5}
              maxRows={10}
              placeholder="Como você se sentiu ao acordar? Teve sonhos marcantes?"
            />
          </Card>

          <Button
            title="Salvar Alterações"
            onPress={save}
            loading={updateSleepRecord.isPending}
            disabled={updateSleepRecord.isPending}
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
