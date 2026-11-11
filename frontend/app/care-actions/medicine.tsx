import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { router } from "expo-router";

import { Button } from "@/components/ui/Button";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing, Typography, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useMedicineRegimens, useCreateCareAction } from "@/hooks";

export default function MedicineCareAction() {
  const { data: regimensData, isLoading: isLoadingRegimens } = useMedicineRegimens();
  const createCareAction = useCreateCareAction();

  const regimens = regimensData?.regimens ?? [];

  const handleSelectRegimen = async (regimenId: number) => {
    await createCareAction.mutateAsync({
      type: 'MEDICINE',
      moment: new Date(),
      regimenId,
    });
    router.replace('/(tabs)/actions');
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Qual medicamento?</Text>
            <Text style={styles.headerSubtitle}>
              Toque para editar ou registre a dose tomada
            </Text>
          </View>

          {isLoadingRegimens && (
            <Text style={styles.loadingText}>Carregando medicamentos...</Text>
          )}

          {!isLoadingRegimens && regimens.length > 0 && (
            <Section>
              <SectionHeader title="Medicamentos cadastrados" />
              {regimens.map((regimen) => (
                <View key={regimen.id} style={styles.regimenRow}>
                  <TouchableOpacity
                    style={styles.regimenChip}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/medicine-regimens/${regimen.id}`)}
                  >
                    <Ionicons name="bandage-outline" size={18} color={Colors.light.tint} />
                    <View style={styles.regimenChipText}>
                      <Text style={styles.regimenChipName}>{regimen.name}</Text>
                      <Text style={styles.regimenChipDosage}>{regimen.dosage}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={Colors.light.disabled} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.doseButton}
                    activeOpacity={0.7}
                    onPress={() => handleSelectRegimen(regimen.id)}
                    disabled={createCareAction.isPending}
                    accessibilityLabel={`Registrar dose de ${regimen.name}`}
                  >
                    <Ionicons name="checkmark" size={16} color={Colors.light.text} />
                    <Text style={styles.doseButtonText}>Tomei</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </Section>
          )}

          <Button
            title="Cadastrar outro medicamento"
            variant="dashed"
            onPress={() => router.push('/care-actions/medicine-new')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    gap: 24,
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    marginBottom: Spacing.sectionGap,
  },
  header: {
    gap: 8,
  },
  headerTitle: {
    ...Typography.headlineMd,
  },
  headerSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
  },
  loadingText: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  regimenRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
    marginBottom: 8,
  },
  regimenChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardGap,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    gap: 12,
    ...Shadows.sm,
  },
  doseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.tint,
  },
  doseButtonText: {
    ...Typography.labelSm,
    fontWeight: '600',
    color: Colors.light.text,
  },
  regimenChipText: {
    flex: 1,
    gap: 2,
  },
  regimenChipName: {
    ...Typography.bodyMd,
    fontWeight: '600',
  },
  regimenChipDosage: {
    ...Typography.labelSm,
    color: Colors.light.textSecondary,
  },
});
