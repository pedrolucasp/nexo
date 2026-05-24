import {
  View,
  Text,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/Cards';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Spacing, Typography, Colors, BorderRadius } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DatePickerField from '@/components/ui/DatePickerField';
import { ScaleSlider } from '@/components/ui/ScaleSlider';

export default function NewSleepRecord() {
  const [day, setDay] = useState(new Date())
  const [annotation, setAnnotation] = useState();
  const [duration, setDuration] = useState(7.5);

  const formatValue = (value: number): string => {
    return String(value).replaceAll('.', ',');
  };

  const save = async () => {
    const data = {
      day,
      annotation,
      duration
    };

    console.log("Sleep record:", data)
    //await createSleepRecord.mutateAsync(data)
    //router.replace("/")
  };

  return (
    <View>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.innerHeaderWrapper}>
              <View style={[styles.headerIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="moon-outline" size={20} color="#2563EB" />
              </View>

              <View style={styles.headerTitleSubtitle}>
                <Text style={styles.headerTitle}>Bom descanso</Text>
                <Text style={styles.headerSubtitle}>Registre sua noite de sono</Text>
              </View>
            </View>

            <Text style={styles.description}>
              Acompanhar seu sono ajuda a entender como seu corpo se recupera
              e melhora sua performance diária.
            </Text>
          </View>

          <Card style={styles.mainCard}>
            <DatePickerField
              label="Data do Registro"
              initialDate={day}
              maximumDate={new Date()}
              onChange={setDay}
            />

            <View style={{ marginVertical: 15 }}>
              <ScaleSlider
                label="Duração"
                value={duration}
                onValueChange={setDuration}
                onValueFormat={formatValue}
                step={0.5}
                min={0.0}
                max={15.0}
                minLabel="0h"
                maxLabel="15h" />
            </View>

            <TextArea
              label="Notas sobre a qualidade"
              type="text"
              variant="darkGhost"
              onChangeText={(val) => setAnnotation(val)}
              value={annotation}
              minRows={5}
              maxRows={10}
              placeholder="Como você se sentiu ao acordar? Teve sonhos marcantes?"
              style={styles.notes}
            />
          </Card>

          <Button title="Salvar Registro" onPress={save} />
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
  mainCard: {
    padding: Spacing.cardGap
  },
  // Header
  header: {
  },
  headerIcon: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    width: 48,
    borderRadius: BorderRadius.md,
  },
  innerHeaderWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitleSubtitle: {
    marginLeft: 10
  },
  headerTitle: {
    ...Typography.headlineMd
  },
  headerSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary
  },
  description: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    marginTop: 20
  }
})
