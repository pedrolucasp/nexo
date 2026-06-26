import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/Button';
import { Section, SectionHeader } from '@/components/ui/Sections';
import { Spacing, Typography, Colors, BorderRadius } from '@/constants/theme';
import { useTriggers, useLinkMoodToTrigger } from '@/hooks';
import { getTriggerCategory } from '@/constants/trigger-categories';
import { Trigger } from '@/lib/api';

type FlowState = 'PICK_TRIGGER' | 'PICK_IMPACT';

export default function PostMoodLinks() {
  const { moodId } = useLocalSearchParams<{ moodId: string }>();
  const [flowState, setFlowState] = useState<FlowState>('PICK_TRIGGER');
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | null>(null);
  const [impact, setImpact] = useState<number>(3);

  const { data, isLoading } = useTriggers({ limit: 5 });
  const linkMood = useLinkMoodToTrigger();

  const triggers = data?.entries ?? [];

  const handleSelectTrigger = (trigger: Trigger) => {
    setSelectedTrigger(trigger);
    setFlowState('PICK_IMPACT');
  };

  const handleSaveLink = async () => {
    if (!selectedTrigger || !moodId) return;
    await linkMood.mutateAsync({
      triggerId: String(selectedTrigger.id),
      moodId,
      perceivedImpact: impact,
    });
    router.back();
  };

  if (flowState === 'PICK_TRIGGER') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Algo influenciou esse humor?</Text>
          <Text style={styles.subtitle}>
            Selecione um gatilho recente para vincular
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {isLoading && <ActivityIndicator style={{ marginTop: 20 }} />}

          {!isLoading && triggers.length === 0 && (
            <Text style={styles.emptyText}>Nenhum gatilho recente</Text>
          )}

          {triggers.map((trigger) => {
            const cat = getTriggerCategory(trigger.category);
            return (
              <TouchableOpacity
                key={trigger.id}
                style={styles.triggerCard}
                activeOpacity={0.7}
                onPress={() => handleSelectTrigger(trigger)}
              >
                <View style={[styles.triggerIcon, { backgroundColor: cat.iconBackground }]}>
                  <MaterialIcons name={cat.icon} size={18} color={cat.color} />
                </View>
                <View style={styles.triggerText}>
                  <Text style={styles.triggerCategory}>{cat.label}</Text>
                  {trigger.comment ? (
                    <Text style={styles.triggerComment} numberOfLines={1}>{trigger.comment}</Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.light.disabled} />
              </TouchableOpacity>
            );
          })}

          <Button title="Pular" variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  // PICK_IMPACT
  const cat = selectedTrigger ? getTriggerCategory(selectedTrigger.category) : null;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Qual foi o impacto?</Text>
        <Text style={styles.subtitle}>De 1 (leve) a 5 (muito forte)</Text>
      </View>

      {selectedTrigger && cat && (
        <View style={styles.selectedTrigger}>
          <View style={[styles.triggerIcon, { backgroundColor: cat.iconBackground }]}>
            <MaterialIcons name={cat.icon} size={18} color={cat.color} />
          </View>
          <Text style={styles.selectedTriggerLabel}>{cat.label}</Text>
        </View>
      )}

      <View style={styles.impactRow}>
        {[1, 2, 3, 4, 5].map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.impactDot, impact === v && styles.impactDotActive]}
            activeOpacity={0.7}
            onPress={() => setImpact(v)}
          >
            <Text style={[styles.impactLabel, impact === v && styles.impactLabelActive]}>{v}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Vincular"
        onPress={handleSaveLink}
        loading={linkMood.isPending}
        style={{ marginTop: 8 }}
      />
      <Button
        title="Voltar"
        variant="ghost"
        onPress={() => setFlowState('PICK_TRIGGER')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.containerPadding,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 16,
  },
  header: { gap: 6 },
  title: { ...Typography.headlineMd },
  subtitle: { ...Typography.bodyMd, color: Colors.light.textSecondary },
  scrollContent: { gap: 10, paddingBottom: 20 },
  emptyText: { ...Typography.bodyMd, color: Colors.light.textSecondary, textAlign: 'center', marginTop: 20 },
  triggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardGap,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    gap: 12,
  },
  triggerIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerText: { flex: 1, gap: 2 },
  triggerCategory: { ...Typography.bodyMd, fontWeight: '600' },
  triggerComment: { ...Typography.labelSm, color: Colors.light.textSecondary },
  selectedTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.cardGap,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.light.divider,
  },
  selectedTriggerLabel: { ...Typography.bodyMd, fontWeight: '600' },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 8,
  },
  impactDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.light.divider,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  impactDotActive: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.tint + '1A',
  },
  impactLabel: { fontSize: 18, fontWeight: '600', color: Colors.light.textSecondary },
  impactLabelActive: { color: Colors.light.text },
});
