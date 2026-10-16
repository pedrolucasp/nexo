import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

const PAGES = [
  {
    title: 'Bem vindo ao nexo',
    body: 'Registre seu humor ao longo do dia, sempre depois que aconteceu. É um diário, não uma cobrança.',
  },
  {
    title: 'No seu ritmo',
    body: 'Anote quantos momentos quiser. Cada registro guarda o humor, a intensidade e o que aconteceu.',
  },
  {
    title: 'Olhe para trás',
    body: 'Com o tempo, o Histórico e a Jornada mostram padrões entre humor, sono, gatilhos e ações de cuidado.',
  },
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const { completeOnboarding } = useAuth();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const page = PAGES[index];
  const isLast = index === PAGES.length - 1;

  const finish = async () => {
    if (saving) return;

    setSaving(true);
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setSaving(false);
      router.replace('/(tabs)/new');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: textColor }]}>{page.title}</Text>
        <Text style={[styles.body, { color: textColor, opacity: 0.7 }]}>
          {page.body}
        </Text>
      </View>

      <View style={styles.dots}>
        {PAGES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === index ? tintColor : textColor,
                opacity: i === index ? 1 : 0.2,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <Button
          title={isLast ? 'Começar' : 'Próximo'}
          loading={saving}
          onPress={() => (isLast ? finish() : setIndex((i) => i + 1))}
        />
        {!isLast && (
          <Button
            variant="outline"
            title="Pular"
            onPress={finish}
            disabled={saving}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actions: {
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
