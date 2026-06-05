import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Image,
  Text,
  ImageSourcePropType,
  ViewStyle,
} from "react-native";
import { Spacing, Typography, BorderRadius } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

type IconSource = string | ImageSourcePropType; // either string or a svg

// Specialized variant with labels below
interface MoodSelectorProps {
  items: T<{
    id: string;
    icon: IconSource;
    label: string;
  }>;
  value?: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  items,
  value,
  onSelect,
  disabled = false,
  style,
}) => {
  const accentBlueColor = useThemeColor({}, "accentBlue");
  const tintColor = useThemeColor({}, "tint");
  const surfaceColor = useThemeColor({}, "surface");
  const dividerColor = useThemeColor({}, "divider");
  const textSecondaryColor = useThemeColor({}, "textSecondary");

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: Spacing.inlineGapSm,
      justifyContent: "space-around",
      alignItems: "flex-start",
      flexWrap: "wrap",
    },
    itemWrapper: {
      alignItems: "center",
      gap: 8,
      flex: 1,
      minWidth: "8%",
    },
    itemButton: {
      width: 50,
      height: 50,
      borderRadius: BorderRadius.lg,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: surfaceColor,
      borderWidth: 1,
      borderColor: dividerColor,
    },
    itemButtonActive: {
      backgroundColor: accentBlueColor,
      borderColor: "transparent",
    },
    icon: {
      fontSize: 48,
      lineHeight: 48,
    },
    emojiText: {
      fontSize: 36,
      lineHeight: 40,
    },
    label: {
      fontSize: Typography.labelSm.fontSize,
      fontWeight: "500",
      color: textSecondaryColor,
      textAlign: "center",
    },
  });

  const isEmoji = (icon: IconSource): icon is string =>
    typeof icon === "string";

  return (
    <View style={[styles.container, style]}>
      {items.map((item) => {
        const isSelected = value === item.id;

        return (
          <View key={item.id} style={styles.itemWrapper}>
            <Pressable
              onPress={() => !disabled && onSelect(item.id)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.itemButton,
                isSelected && styles.itemButtonActive,
                pressed && !disabled && { opacity: 0.7 },
                disabled && { opacity: 0.5 },
              ]}
            >
              {isEmoji(item.icon) ? (
                <Text style={styles.emojiText}>{item.icon}</Text>
              ) : (
                <Image
                  source={item.icon}
                  style={{
                    width: 48,
                    height: 48,
                  }}
                  resizeMode="contain"
                />
              )}
            </Pressable>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};
