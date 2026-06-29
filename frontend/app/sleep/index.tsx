import {
  View,
  StyleSheet,
  ScrollView
} from 'react-native';

import { Card } from '@/components/ui/Cards';
import { Spacing, Typography, Colors } from '@/constants/theme';

export default function SleepHub() {

  return (
    <View>
      <ScrollView
        scrollEventThrottle={16}>
        <View style={styles.container}>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
  }
})
