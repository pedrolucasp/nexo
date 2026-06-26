import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 4,
    paddingVertical: Spacing.cardGap,
  },
  text: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    flex: 1,
    lineHeight: 20,
    fontStyle: 'italic',
    fontSize: 12
  },
  bold: {
    fontWeight: "700"
  },
});

const MESSAGES = {
  general: (
    <>
      Registros também podem ser
      <Text style={styles.bold}> Sem vínculo </Text>
      ou{" "}
      <Text style={styles.bold}>Vinculados a uma ação de cuidado</Text> (ex:
      Meditação, Exercício).
    </>
  ),
};

interface NoLinkMessageProps {
  variant?: keyof typeof MESSAGES;
}

export function NoLinkMessage({ variant = "general" }: NoLinkMessageProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="information-circle-outline" size={20} color={Colors.light.textSecondary} />
      <Text style={styles.text}>{MESSAGES[variant] ?? MESSAGES.general}</Text>
    </View>
  );
}
