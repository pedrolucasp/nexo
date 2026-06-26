import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
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
              Selecione um medicamento existente ou registre um novo
            </Text>
          </View>

          {isLoadingRegimens && (
            <Text style={styles.loadingText}>Carregando medicamentos...</Text>
          )}

          {!isLoadingRegimens && regimens.length > 0 && (
            <Section>
              <SectionHeader title="Medicamentos cadastrados" />
              {regimens.map((regimen) => (
                <TouchableOpacity
                  key={regimen.id}
                  style={styles.regimenChip}
                  activeOpacity={0.7}
                  onPress={() => handleSelectRegimen(regimen.id)}
                  disabled={createCareAction.isPending}
                >
                  <Ionicons name="bandage-outline" size={18} color={Colors.light.tint} />
                  <View style={styles.regimenChipText}>
                    <Text style={styles.regimenChipName}>{regimen.name}</Text>
                    <Text style={styles.regimenChipDosage}>{regimen.dosage}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.light.disabled} />
                </TouchableOpacity>
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
    marginBottom: 50,
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
  regimenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardGap,
    borderWidth: 1,
    borderColor: Colors.light.divider,
    gap: 12,
    marginBottom: 8,
    ...Shadows.sm,
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
