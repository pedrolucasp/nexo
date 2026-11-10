import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';

interface ChipProps {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onPress: () => void;
}

export function Chip({ label, icon, active = false, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, active && styles.chipActive]}
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
  chipActive: {
    backgroundColor: Colors.light.activeBackground,
    borderColor: Colors.light.tint,
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
