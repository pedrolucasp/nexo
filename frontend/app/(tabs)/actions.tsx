import { View, Text, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/misc/themed-text';
import { ThemedView } from '@/components/misc/themed-view';
import { ScreenLayout } from '@/components/ui/ScreenLayout';
import { useAuth } from '@/context/AuthContext';
import { Section, SectionHeader } from '@/components/ui/Sections';
import { Card, SubtleInfoCard } from '@/components/ui/Cards';
import { Grid, Col, Row, Between } from '@/components/ui/LayoutHelpers';
import { Button } from '@/components/ui/Button'
import { Shadows, Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { Ionicons, Octicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';

export default function Actions() {
  const { user } = useAuth();

  const onPressSleep = () => {
    router.push('/sleep/new')
  }

  const onPressTrigger = () => {
    router.push('/triggers/new')
  }

  return (
    <ScreenLayout userName={user.firstName} userAvatar={user.avatarURL}
      onNotificationPress={() => console.log('Notifications')}
      showNotificationBadge={true}>
      <Section>
        <SectionHeader
          title="Hub de Ações e Gestão"
          subtitle="Sua ferramenta de apoio para menter a rotina de saúde organizada e monitorada"
          >
        </SectionHeader>

        <Button title="Registrar Intervenção" size="large" style={{
          ...Shadows.lg
        }} />
      </Section>

      <Card style={{ padding: Spacing.cardGap, height: 150 }}>
        <View style={[styles.cardIcon, { backgroundColor: '#E7FDEF' }]}>
          <Ionicons name="bandage-outline" size={20} color="#13EC5B" />
        </View>

        <Text style={styles.cardTitleHeadline}>
          Gerenciar Medicamentos
        </Text>

        <Text style={styles.cardDescriptionHeadline}>
          Controle horários, doses e estoque de suas prescrições.
        </Text>
      </Card>

      <Grid gap={4}>
        <Card onPress={onPressSleep} style={{ padding: Spacing.cardGap }}>
          <View style={[styles.cardIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="moon-outline" size={20} color="#2563EB" />
          </View>

          <Text style={styles.cardTitle}>
            Registrar Sono
          </Text>

          <Text style={styles.cardDescription}>
            Informe duração e qualidade do sono.
          </Text>
        </Card>

        <Card style={{ padding: Spacing.cardGap }} onPress={onPressTrigger}>
          <View style={[styles.cardIcon, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="flash-outline" size={20} color="#EA580C" />
          </View>

          <Text style={styles.cardTitle}>
            Adicionar Gatilho
          </Text>

          <Text style={styles.cardDescription}>
            Registre eventos que aferatam seu humor.
          </Text>
        </Card>
      </Grid>

      <Card style={styles.disclaimerCard}>
        <View style={styles.disclaimerTitleContainer}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.light.tint} />
          <Text style={styles.disclaimerTitleText}>Nota de Apoio</Text>
        </View>

        <Text style={styles.disclaimerText}>
          Este aplicativo é um assistente digital para
          auxiliar no seu monitoramento diário. Em caso
          de emergência ou sintomas graves, entre em
          contato imediatamente com seu médico ou
          serviços de saúde locais.
        </Text>

        <View style={styles.disclaimerHelp}>
          <Link href="https://expo.dev" style={styles.disclaimerHelpText}>
            Ver canais de ajuda <Octicons name="link-external" size={12} color="black" />
          </Link>
        </View>
      </Card>
    </ScreenLayout>
  )
}

const styles = StyleSheet.create({
  cardIcon: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    width: 48,
    borderRadius: BorderRadius.md,
  },
  cardTitleHeadline: {
    ...Typography.headlineMd,
    lineHeight: 20,
    marginTop: 4
  },
  cardTitle: {
    ...Typography.bodyLg,
    lineHeight: 20,
    marginTop: 4
  },
  cardDescriptionHeadline: {
    ...Typography.bodyMg,
    color: Colors.light.textSecondary,
    marginTop: 4
  },
  cardDescription: {
    ...Typography.labelSm,
    color: Colors.light.textSecondary,
    marginTop: 4
  },
  disclaimerCard: {
    padding: Spacing.cardGap,
    marginTop: 20
  },
  disclaimerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
    marginBottom: 10
  },
  disclaimerTitleText: {
    fontWeight: 600,
    fontSize: 16,
    lineHeight: 20,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.light.textSecondary,
  },
  disclaimerHelp: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.light.divider,
    paddingTop: 5,
  },
  disclaimerHelpText: {
    color: "#0f172a",
    fontWeight: 500,
    fontSize: 12,
    lineHeight: 16,
    alignItems: 'center'
  }
})
