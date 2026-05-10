import { useState, useEffect } from 'react';
import {
  Link, router, useLocalSearchParams
} from 'expo-router';

import {
  View,
  Text,
  StyleSheet
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useAuth } from '@/context/AuthContext';
import { Grid, Col, Row, Between } from '@/components/ui/LayoutHelpers';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Section, SectionHeader } from '@/components/ui/Sections';

export default function NewMoodEntry() {
  const { user } = useAuth();
  // TODO: transform this into a specific mood component
  const { initialMood } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <ThemedText>
        Little black sub {initialMood}
      </ThemedText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'pink'
  }
});
