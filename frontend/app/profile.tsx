import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { ThemedView } from '@/components/ui/themed-view'
import { ThemedText } from '@/components/ui/themed-text'
import { Link, useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/api'

export default function Profile() {
  const { user, updateAuthUser } = useAuth();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState();
  const [confirmPassword, setConfirmPassword] = useState();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    setFirstName(user.firstName)
    setLastName(user.lastName)
    setEmail(user.email)
  }, [user])

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const validateForm = () => {
    const newErrors: {
      firstName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string
    } = {};

    if (password) {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Precisa confirmar a senha';
      } else {
        if (password !== confirmPassword) {
          newErrors.confirmPassword = "Senhas não conferem";
        }
      }
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Por favor, use um email válido';
    }

    if (!firstName) {
      newErrors.firstName = 'É necessário ter um nome';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  const handleUpdate = async () => {
    if (!validateForm()) return;

    const data = {};

    data.firstName = firstName
    data.lastName = lastName
    data.email = email

    if (password) {
      data.password = password
    }

    try {
      const id = user.id;

      const response = await apiClient.updateUser({
        id,
        firstName,
        lastName,
        email,
        password
      });

      updateAuthUser(response.user);

      router.replace('/(tabs)/insights');
    } catch (error: any) {
      console.error("[PROFILE]", error)
      Alert.alert('Erro: ', 'Falha ao tentar atualizar o usuário');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar style={'dark'} />
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
              label="Email"
              type="text"
              value={email}
              onChangeText={setEmail}
              placeholder="Qual seu email?"
              error={errors.email}
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
              title="Atualizar perfil"
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
