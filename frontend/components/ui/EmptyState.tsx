import { View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/constants/theme";

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyState({
  title,
  subtitle,
  icon = "leaf-outline",
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={40} color={Colors.light.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 32,
    gap: Spacing.inlineGapSm,
  },
  title: {
    ...Typography.bodyLg,
    color: Colors.light.text,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
});
