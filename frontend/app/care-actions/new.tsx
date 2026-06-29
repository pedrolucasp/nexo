import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { router } from "expo-router";

import { Spacing, Typography, Colors, BorderRadius, Shadows } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";

export default function NewCareAction() {
  return (
    <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
      <ScrollView scrollEventThrottle={16}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Que tipo de ação?</Text>
            <Text style={styles.headerSubtitle}>
              Selecione o tipo de ação de cuidado que deseja registrar
            </Text>
          </View>

          <TouchableOpacity
            style={styles.typeCard}
            activeOpacity={0.7}
            onPress={() => router.push('/care-actions/medicine')}
          >
            <View style={[styles.typeIcon, { backgroundColor: '#E7FDEF' }]}>
              <Ionicons name="bandage-outline" size={24} color="#13EC5B" />
            </View>
            <View style={styles.typeTextWrap}>
              <Text style={styles.typeTitle}>Medicamento</Text>
              <Text style={styles.typeDesc}>Registre a tomada de um medicamento</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeCard}
            activeOpacity={0.7}
            onPress={() => router.push('/care-actions/appointment')}
          >
            <View style={[styles.typeIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="medkit-outline" size={24} color="#2563EB" />
            </View>
            <View style={styles.typeTextWrap}>
              <Text style={styles.typeTitle}>Consulta</Text>
              <Text style={styles.typeDesc}>Registre uma consulta ou sessão</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.disabled} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.typeCard}
            activeOpacity={0.7}
            onPress={() => router.push('/care-actions/activity')}
          >
            <View style={[styles.typeIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="walk-outline" size={24} color="#EA580C" />
            </View>
            <View style={styles.typeTextWrap}>
              <Text style={styles.typeTitle}>Atividade</Text>
              <Text style={styles.typeDesc}>Registre uma atividade física ou mental</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.disabled} />
          </TouchableOpacity>
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
  typeCard: {
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
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTextWrap: {
    flex: 1,
    gap: 2,
  },
  typeTitle: {
    ...Typography.bodyLg,
  },
  typeDesc: {
    ...Typography.labelSm,
    color: Colors.light.textSecondary,
  },
});
