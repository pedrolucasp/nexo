import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Theme } from '@/constants/theme';

type SliderVariant = 'rich' | 'compact';

interface ScaleSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  icon?: React.ReactNode;      // rich variant only
  showMax?: boolean;           // shows "x/10" format instead of just "x"
  variant?: SliderVariant;
  style?: ViewStyle;
}

export const ScaleSlider: React.FC<ScaleSliderProps> = ({
  label,
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  minLabel,
  maxLabel,
  icon,
  showMax,
  variant = 'compact',
  style,
}) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');
  const trackingColor = useThemeColor({}, 'sliderTracking');
  const sliderLabelsColor = useThemeColor({}, 'sliderLabels');

  const isRich = variant === 'rich';

  const valueDisplay = showMax || !isRich
    ? `${value}/${max}`
    : `${value}`;

  return (
    <View style={[styles.container, style]}>

      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          {isRich && icon && (
            <View style={styles.iconWrapper}>{icon}</View>
          )}
          <Text style={[
            isRich ? styles.labelRich : styles.labelCompact,
            { color: textColor },
          ]}>
            {label}
          </Text>
        </View>

        <Text style={[
          isRich ? styles.valueRich : styles.valueCompact,
          { color: textColor },
        ]}>
          {valueDisplay}
        </Text>
      </View>

      <View style={{ marginRight: -10, marginLeft: -10 }}>
        {/* Slider */}
        <Slider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={trackingColor}
          maximumTrackTintColor={trackingColor}
          thumbTintColor={tintColor}
        />
      </View>

      {/* Min / Max labels */}
      {(minLabel || maxLabel) && (
        <View style={styles.rangeLabels}>
          {minLabel && (
            <Text style={[styles.rangeLabel, { color: sliderLabelsColor }]}>
              {minLabel.toUpperCase()}
            </Text>
          )}
          {maxLabel && (
            <Text style={[styles.rangeLabel, { color: sliderLabelsColor }]}>
              {maxLabel.toUpperCase()}
            </Text>
          )}
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Rich variant
  labelRich: {
    fontSize: 14,
    fontWeight: 500
  },
  valueRich: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: 600
  },

  // Compact variant
  labelCompact: {
    fontSize: Theme.typography.bodyLg.fontSize,
  },
  valueCompact: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontWeight: Theme.typography.bodyMd.fontWeight,
    color: Theme.colors.light.textSecondary,
  },

  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  rangeLabel: {
    ...Theme.typography.labelXs,
    fontWeight: 500,
  },
});
