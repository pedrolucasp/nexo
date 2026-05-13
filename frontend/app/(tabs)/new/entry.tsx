import { useState, useEffect } from 'react';
import {
  Link, router, useLocalSearchParams
} from 'expo-router';

import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useAuth } from '@/context/AuthContext';
import { Grid, Col, Row, Between, Center } from '@/components/ui/LayoutHelpers';
import { Card } from '@/components/ui/Cards';
import { Button } from '@/components/ui/Button';
import { Input, TextArea } from '@/components/ui/Input';
import { Section, SectionHeader } from '@/components/ui/Sections';
import { Spacing, Typography, Colors } from '@/constants/theme';
import { ScaleSlider } from '@/components/ui/ScaleSlider';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  useMoodEntryStore,
} from '@/stores/moodEntry';

import {
  MOODS,
  getMood
} from '@/constants/moods';

export default function NewMoodEntry() {
  const { user } = useAuth();
  const tintColor = useThemeColor({}, 'tint');

  const { initialMood } = useLocalSearchParams();
  const [stress, setStress] = useState(0);
  const [anxiety, setAnxiety] = useState(0);
  const [energy, setEnergy] = useState(0);

  const {
    selectedMood,
    setSelectedMood,
    components,
  } = useMoodEntryStore();

  useEffect(() => {
    setSelectedMood(getMood(initialMood));
  }, [initialMood]);

  const editComponents = () => {
    console.log("Wants to open the components");

    router.push("/entry/mood-components")
  }

  return (
    <View>
      <ScrollView
        scrollEventThrottle={16}>
        <View style={styles.container}>
          <Center>
            <ThemedText style={styles.statusPrefix}>
              Como você está se sentindo agora?
            </ThemedText>

            <ThemedText style={styles.statusText}>
              {selectedMood.label || "Neutro"}
            </ThemedText>
          </Center>

          <Card style={styles.resumeCard}>
            <Col gap={24}>
              <ScaleSlider
                variant="rich"
                label="Energia"
                value={energy}
                onValueChange={setEnergy}
                icon={<Ionicons name="flower-outline" size={20} color={tintColor} />}
                minLabel="Baixa"
                maxLabel="Alta"
              />

              <ScaleSlider
                variant="rich"
                label="Ansiedade"
                value={anxiety}
                onValueChange={setAnxiety}
                icon={<Ionicons name="sad-outline" size={20} color="#FB923C" />}
                minLabel="Calmo"
                maxLabel="Ansioso"
              />

              <ScaleSlider
                variant="rich"
                label="Estresse"
                value={stress}
                onValueChange={setStress}
                icon={<Ionicons name="flame" size={20} color="#f87171" />}
                minLabel="Relaxado"
                maxLabel="Estressado"
              />
            </Col>
          </Card>

          <Card style={styles.annotationsCard}>
            <TextArea
              label="Notas sobre o dia"
              type="text"
              variant="darkGhost"
              onChangeText={(val) => console.log(val)}
              minRows={4}
              maxRows={6}
              placeholder="Escreva uma nota rápida sobre o seu dia até o momento..."
            />
          </Card>

          <Section>
            <SectionHeader title="Componentes do Humor" info="Editar" />
            <Grid gap={4}>
              <Card style={{height: 38}} />
              <Card style={{height: 38}} />
            </Grid>

            <Button title="Adicionar Componentes"
                    onPress={editComponents}
                    textStyle={{ fontWeight: 500 }}
                    variant="dashed"
                    />
          </Section>
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
  },
  statusText: {
    ...Typography.headlineXg,
  },
  statusPrefix: {
    ...Typography.bodyMd
  },
  annotationsCard: {
    padding: Spacing.cardGap
  },
  resumeCard: {
    padding: Spacing.cardGap,
  }
});
