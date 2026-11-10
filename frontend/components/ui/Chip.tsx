import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';

interface ChipProps {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  color?: string;
  colorBackground?: string;
  variant?: 'soft' | 'solid';
  onPress: () => void;
}

export function Chip({
  label,
  icon,
  active = false,
  color,
  colorBackground,
  variant = 'soft',
  onPress,
}: ChipProps) {
  const activeStyle =
    variant === 'solid'
      ? {
          backgroundColor: color ?? Colors.light.tint,
          borderColor: color ?? Colors.light.tint,
        }
      : {
          backgroundColor: colorBackground ?? Colors.light.activeBackground,
          borderColor: color ?? Colors.light.tint,
        };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, active && activeStyle]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.label, active && styles.labelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.inlineGapSm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.inlineGapSm,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 1.5,
    borderColor: Colors.light.divider,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  labelActive: {
    fontWeight: '600',
  },
});
