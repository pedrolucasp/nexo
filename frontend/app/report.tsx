import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { Stack } from 'expo-router'
import { format, subDays } from 'date-fns'
import { Paths, File } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { Section, SectionHeader } from '@/components/ui/Sections'
import { DatePickerField } from '@/components/ui/DatePickerField'
import { apiClient, ApiError } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import { translateError } from '@/lib/errors/translations'
import { Colors, Spacing, BorderRadius } from '@/constants/theme'

const PRESETS = [
  { label: '7 dias', days: 7 },
  { label: '30 dias', days: 30 },
  { label: '90 dias', days: 90 },
  { label: 'Personalizado', days: 0 },
]

export default function ReportScreen() {
  const { showToast } = useToast()

  const [preset, setPreset] = useState(30)
  const [startDate, setStartDate] = useState(() => subDays(new Date(), 30))
  const [endDate, setEndDate] = useState(() => new Date())
  const [loading, setLoading] = useState(false)

  const isCustom = preset === 0

  function selectPreset(days: number) {
    setPreset(days)
    if (days > 0) {
      setStartDate(subDays(new Date(), days))
      setEndDate(new Date())
    }
  }

  async function handleGenerate() {
    setLoading(true)
    try {
      const buffer = await apiClient.generateReport(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd'),
      )

      const fileName = `nexo-report-${format(startDate, 'yyyy-MM')}.pdf`
      const file = new File(Paths.cache, fileName)
      file.write(new Uint8Array(buffer))
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Salvar relatório',
      })
    } catch (err) {
      showToast(
        err instanceof ApiError ? translateError(err.message) : 'Erro ao gerar relatório',
        'error',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <Stack.Screen options={{ title: 'Relatório' }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Seu relatório de humor</Text>
          <Text style={styles.introBody}>
            Reúne os registros do período escolhido — humores, sentimentos e
            níveis de ansiedade, estresse e energia — num PDF pronto para
            compartilhar com seu terapeuta ou guardar só pra você.
          </Text>
        </View>

        <Section>
          <SectionHeader title="Período" />
          <View style={styles.chips}>
            {PRESETS.map((p) => (
              <TouchableOpacity
                key={p.days}
                style={[styles.chip, preset === p.days && styles.chipActive]}
                onPress={() => selectPreset(p.days)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    preset === p.days && styles.chipTextActive,
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        {isCustom && (
          <Section>
            <SectionHeader title="Intervalo" />
            <DatePickerField
              label="De"
              initialDate={startDate}
              onChange={setStartDate}
              maximumDate={endDate}
            />
            <View style={{ height: Spacing.cardGap }} />
            <DatePickerField
              label="Até"
              initialDate={endDate}
              onChange={setEndDate}
              minimumDate={startDate}
              maximumDate={new Date()}
            />
          </Section>
        )}

        <Button
          title="Gerar relatório"
          variant="primary"
          size="large"
          loading={loading}
          onPress={handleGenerate}
          style={{ marginTop: Spacing.sectionGap }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: Spacing.containerPadding,
    paddingBottom: Spacing.sectionGap,
  },
  intro: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.cardGap,
    marginBottom: Spacing.cardGap,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 6,
  },
  introBody: {
    fontSize: 13,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.light.borderDashed,
    backgroundColor: Colors.light.surface,
  },
  chipActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.text,
  },
  chipTextActive: {
    color: Colors.light.background,
  },
})
