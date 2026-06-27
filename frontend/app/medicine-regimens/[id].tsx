import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Spacing, Typography, Colors } from "@/constants/theme";

export default function MedicineRegimenDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medicamento #{id}</Text>
      <Text style={styles.subtitle}>Em breve: edição de medicamento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.containerPadding,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { ...Typography.headlineMd },
  subtitle: { ...Typography.bodyMd, color: Colors.light.textSecondary, marginTop: 8 },
});
