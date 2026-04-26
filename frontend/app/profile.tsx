import { useState, useEffect } from 'react';
import {
  ThemedView
} from '@/components/ui/themed-view'

import {
  ThemedText
} from '@/components/ui/themed-text'

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Input } from '@/components/ui';

export default function Profile() {
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [email, setEmail] = useState();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleUpdate = () => {}

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior='height'
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Edite o seu perfil</Text>
            <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              Altere suas configurações
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Primeiro Nome"
              type="text"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Qual seu nome?"
              error={errors.firstName}
            />

            <Input
              label="Sobrenome"
              type="text"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Qual seu sobrenome?"
              error={errors.lastName}
            />

            <Input
              label="Nova senha"
              type="password"
              value={password}
              onChangeText={setPassword}
              placeholder="Digite uma nova senha"
              error={errors.password}
              showPasswordToggle
            />

            <Input
              label="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirme a nova senha"
              error={errors.confirmPassword}
              showPasswordToggle
            />

            <Button
              title="Trocar senha"
              onPress={handleUpdate}
              loading={loading}
              style={styles.resetButton}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'start',
    minHeight: '100%',
  },
  header: {
    alignItems: 'left',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'left',
  },
  form: {
    marginBottom: 32,
  },
  resetButton: {
    marginTop: 8,
  },
  link: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
  },
});
