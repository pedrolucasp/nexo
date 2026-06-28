import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { translateError, translateFields } from '@/lib/errors/translations';

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { showToast } = useToast();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'O nome é obrigatório';
    }

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Por favor entre um email válido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatório';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve conter pelo menos 6 caracteres';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Por favor confirme sua senha';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup({ firstName, lastName, email, password });
      router.replace('/');
    } catch (error: any) {
      if (error instanceof ApiError && error.fields) {
        setErrors(translateFields(error.fields));
      } else {
        showToast(translateError(error.message) || 'Falha no cadastro. Tente novamente.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={[styles.title, { color: textColor }]}>Criar conta</Text>
            <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              Cadastre-se para começar a monitorar o seu humor.
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Digite seu nome"
              error={errors.firstName}
            />

            <Input
              label="Sobrenome (opcional)"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Digite seu sobrenome"
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholder="Qual seu email?"
              error={errors.email}
              autoCapitalize="none"
            />

            <Input
              label="Senha"
              type="password"
              value={password}
              onChangeText={setPassword}
              placeholder="Deve ter no min. 6 caracteres"
              error={errors.password}
              showPasswordToggle
            />

            <Input
              label="Confirme a senha"
              type="password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirme sua senha"
              error={errors.confirmPassword}
              showPasswordToggle
            />

            <Button
              title="Criar conta"
              onPress={handleSignup}
              loading={loading}
              style={styles.signupButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textColor, opacity: 0.7 }]}>
              Já tem uma conta?{' '}
            </Text>
            <Link href="/auth/login" asChild style={[styles.link, { color: tintColor }]}>
              <Text style={[styles.link, { color: tintColor }]}>
                Faça login
              </Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  signupButton: {
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
