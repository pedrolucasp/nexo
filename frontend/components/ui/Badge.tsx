import {
  StyleSheet,
  View
} from 'react-native';
import { Text } from '@/components/ui/Text';

// Badge color palettes
export const badgeVariants = {
  green:  { bg: "#d4f5e2", text: "#1a7a48", dot: "#34c272" },
  blue:   { bg: "#dbeafe", text: "#1d4ed8", dot: "#3b82f6" },
  yellow: { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
  red:    { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
  purple: { bg: "#ede9fe", text: "#5b21b6", dot: "#8b5cf6" },
  gray:   { bg: "#f1f5f9", text: "#475569", dot: "#94a3b8" },
  orange: { bg: "#ffedd5", text: "#9a3412", dot: "#f97316" },
  pink:   { bg: "#fce7f3", text: "#9d174d", dot: "#ec4899" },
};

// TODO: Add a subtle variant and allow to drop the dot as well
// TODO: Experiment with a less round-ish version?
export const Badge = ({ label, variant = "green", style }) => {
  const palette = badgeVariants[variant] ?? badgeVariants.green;

  const styles = StyleSheet.create({
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 999,
      flexShrink: 0,
    },
    badgeDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    badgeText: {
      fontSize: 13,
      fontWeight: "600",
      letterSpacing: 0.1,
    }
  });

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      <View style={[styles.badgeDot, { backgroundColor: palette.dot }]} />
      <Text style={[styles.badgeText, { color: palette.text }]}>{label}</Text>
    </View>
  );
}
