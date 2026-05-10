import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { ThemedText } from '@/components/misc/themed-text'

import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SectionProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Section: React.FC<SectionProps> = ({ children, style }) => {
  const styles = StyleSheet.create({
    section: {
      marginBottom: Spacing.sectionGap,
    },
  });
  return <View style={[styles.section, style]}>{children}</View>;
};

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
}

// XXX: A Section must either have a label as a pill/informative thing
// or it should be a link
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  info,
  actionLabel,
  onActionPress,
  style,
}) => {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: (Spacing.cardGap * 2),
    },
    title: {
      fontSize: Typography.headlineMd.fontSize,
      fontWeight: Typography.headlineMd.fontWeight,
      color: textColor,
    },
    actionButton: {
      padding: 4,
    },
    actionText: {
      fontSize: Typography.bodyMd.fontSize,
      fontWeight: '600',
      color: tintColor,
    },
  });

  // TODO: Rework these when we finally have chips/badges
  return (
    <View style={[styles.headerContainer, style]}>
      <ThemedText style={styles.title}>
        {title}
      </ThemedText>

      {info && !actionLabel && (
        <ThemedText>
          {info}
        </ThemedText>
      )}

      {actionLabel && !info && onActionPress && (
        <Pressable
          style={styles.actionButton}
          onPress={onActionPress}
          hitSlop={8}
        >
          <ThemedText style={styles.actionText}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
};

