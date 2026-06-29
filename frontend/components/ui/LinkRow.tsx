import React from "react";
import { StyleSheet, View, Switch } from "react-native";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Cards";
import { Typography, Colors, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  linkRowCard: {
    padding: Spacing.cardGap,
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  linkRowIcon: {
    width: 40,
    height: 40,
  },
  linkRowDescription: {
    flexGrow: 1,
  },
  linkRowLabel: {
    ...Typography.bodyLg,
  },
  linkRowSublabel: {
    ...Typography.labelSm,
  },
});

type LinkRowProps = {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  disabled?: boolean;
  value?: boolean;
  onToggle: (value: boolean) => void;
};

export const LinkRow = ({
  icon,
  label,
  sublabel,
  disabled,
  value,
  onToggle,
}: LinkRowProps) => {
  return (
    <Card
      style={styles.linkRowCard}
      onPress={() => !disabled && onToggle(!value)}
    >
      {icon}

      <View style={styles.linkRowDescription}>
        <Text style={styles.linkRowLabel}>{label}</Text>
        <Text style={styles.linkRowSublabel}>{sublabel}</Text>
      </View>

      <Switch
        value={value}
        trackColor={{ false: "#767577", true: Colors.light.tint }}
        disabled={disabled}
        onValueChange={onToggle}
      />
    </Card>
  );
};
