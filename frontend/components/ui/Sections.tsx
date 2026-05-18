import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { ThemedText } from '@/components/misc/themed-text'
import { Row, Between } from '@/components/ui/LayoutHelpers';

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
  subtitle?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'subtle';
}

// XXX: A Section must either have a label as a pill/informative thing
// or it should be a link
export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  info,
  actionLabel,
  onActionPress,
  variant,
  style,
}) => {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const textSecondaryColor = useThemeColor({}, 'textSecondary')

  const getTextColor = () => {
    switch (variant) {
      case 'subtle':
        return textSecondaryColor;
      default:
        return textColor;
    }
  };

  const getFont = () => {
    switch (variant) {
      case 'subtle':
        return {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.8,
          color: Colors.light.textSecondary,
          textTransform: 'uppercase',
        };
      default:
        return {
          fontSize: Typography.headlineMd.fontSize,
          fontWeight: Typography.headlineMd.fontWeight,
        };
    }
  }

  const styles = StyleSheet.create({
    headerContainer: {
      marginBottom: variant == 'subtle' ? 10 : (Spacing.cardGap * 2),
    },
    title: {
      color: getTextColor(),
      ...getFont(),
    },
    subtitle: {
      fontSize: 14,
      color: textSecondaryColor,
      lineHeight: 20,
      marginTop: 4
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
      <Between>
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
      </Between>

      {subtitle && (
        <Row>
          <ThemedText style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        </Row>
      )}
    </View>
  );
};

