import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  Text
} from 'react-native';

import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { ThemedText } from '@/components/misc/themed-text'
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'highlighted';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  style,
}) => {
  const isHighlighted = variant === 'highlighted';

  const surfaceColor = useThemeColor({}, 'surface');
  const cardBorderColor = useThemeColor({}, 'cardBorder');
  const accentBlueColor = useThemeColor({}, 'accentBlue');

  const styles = StyleSheet.create({
    card: {
      backgroundColor: surfaceColor,
      borderRadius: BorderRadius.lg,
      borderWidth: 1,
      borderColor: cardBorderColor,
      padding: Spacing.internalPadding,
      marginBottom: Spacing.cardGap,
      ...(isHighlighted && {
        backgroundColor: accentBlueColor,
        borderColor: 'transparent',
      }),
      ...Shadows.sm,
    },
  });

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress && {
          opacity: 0.8,
        },
        style,
      ]}
    >
      {children}
    </Pressable>
  );
};

interface SubtleInfoCardProps {
  text: string;
  style?: ViewStyle;
};

export const SubtleInfoCard: React.FC<SubtleInfoCardProps> = ({
  text,
  style
}) => {
  const accentBlueColor = useThemeColor({}, 'accentBlue');

  const styles = StyleSheet.create({
    card: {
      backgroundColor: accentBlueColor,
      borderRadius: BorderRadius.lg,
      padding: Spacing.cardGap,
      marginBottom: Spacing.cardGap,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'top'
    },
    text: {
      fontSize: 12,
      lineHeight: 18,
      color: Colors.light.textSecondary,
      marginLeft: 10
    },
  });

  return (
    <View style={[styles.card, style]}>
      <Ionicons name="information-circle-outline" size={20} color="gray" />

      <Text style={styles.text}>
        {text.replace(/\s+/g, ' ').trim()}
      </Text>
    </View>
  )
}
