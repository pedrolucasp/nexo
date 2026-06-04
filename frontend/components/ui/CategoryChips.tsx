import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/theme';

export type CategoryOption<T extends string = string> = {
  label: string;
  value: T;
  icon: React.ReactNode;
};

type Props<T extends string = string> = {
  options: CategoryOption<T>[];
  active: T | null;
  onChange: (value: T) => void;
  columns?: number;
};

export function CategoryChips<T extends string = string>({
  options,
  active,
  onChange,
  columns = 2,
}: Props<T>) {
  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              { width: `${100 / columns - 2}%` as any },
              isActive && styles.chipActive,
            ]}
          >
            <View style={styles.chipInner}>
              <View style={styles.iconWrapper}>{option.icon}</View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: Colors.light.tint + '1A', // ~10% opacity tint background
    borderColor: Colors.light.tint,
  },
  chipInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
    letterSpacing: -0.1,
  },
  labelActive: {
    fontWeight: '600',
  },
});
