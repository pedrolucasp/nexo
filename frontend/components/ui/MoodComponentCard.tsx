import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@/components/ui/Text';
import { Row } from '@/components/ui/LayoutHelpers';
import { Card } from '@/components/ui/Cards';
import { getMoodComponent, intensityLabel } from '@/constants/mood-components';
import { Theme } from '@/constants/theme';

interface MoodComponentCardProps {
  id: string;
  intensity: number;
  style?: ViewStyle;
}

export const MoodComponentCard: React.FC<MoodComponentCardProps> = ({
  id,
  intensity,
  style,
}) => {
  const definition = getMoodComponent(id);
  if (!definition) return null;

  return (
    <Card style={[styles.card, style]}>
      <Row gap={6} style={styles.inner}>
        <View style={styles.mood}>
          <View style={[styles.dot, { backgroundColor: definition.color }]} />
          <Text style={styles.label} numberOfLines={1}>
            {definition.label}
          </Text>
        </View>

        <Text style={styles.intensity} numberOfLines={1}>
          {intensityLabel(intensity)}
        </Text>
      </Row>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  mood: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  inner: {
    alignItems: 'baseline',
    flexShrink: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    flexShrink: 0,
    marginRight: 4,
    justifyContent: 'center'
  },
  label: {
    fontSize: Theme.typography.bodyMd.fontSize,
    fontWeight: '600',
    color: Theme.colors.light.text,
    flexShrink: 1,
  },
  intensity: {
    fontSize: Theme.typography.labelSm.fontSize,
    color: Theme.colors.light.moodIntensityLabel,
    flexShrink: 1,
    height: '100%',
  },
});
