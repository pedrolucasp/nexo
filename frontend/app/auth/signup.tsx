import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Input } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { AuthScreen } from '@/components/auth/AuthScreen';
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptedTerms?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const { showToast } = useToast();
  const textColor = useThemeColor({}, 'text');
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

    if (!acceptedTerms) {
      newErrors.acceptedTerms = 'Você precisa aceitar os termos para continuar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signup({ firstName, lastName, email, password, acceptedTerms });
      router.replace('/');
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        setErrors(translateFields(error.fields));
      } else {
        showToast(translateError(error) || 'Falha no cadastro. Tente novamente.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Criar conta"
      subtitle="Cadastre-se para começar a monitorar o seu humor."
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textColor, opacity: 0.7 }]}>
            Já tem uma conta?{' '}
          </Text>
          <Link href="/auth/login" asChild style={StyleSheet.flatten([styles.link, { color: tintColor }])}>
            <Text style={StyleSheet.flatten([styles.link, { color: tintColor }])}>
              Faça login
            </Text>
          </Link>
        </View>
      }
    >
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

        <View style={styles.termsRow}>
          <Pressable
            onPress={() => setAcceptedTerms((value) => !value)}
            hitSlop={8}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: acceptedTerms }}
            testID="checkbox-terms"
          >
            <Ionicons
              name={acceptedTerms ? 'checkbox' : 'square-outline'}
              size={22}
              color={acceptedTerms ? tintColor : textColor}
            />
          </Pressable>

          <Text style={[styles.termsText, { color: textColor }]}>
            Li e aceito os{' '}
          </Text>

          <Link href="/terms" asChild style={StyleSheet.flatten([styles.termsLink, { color: tintColor }])}>
            <Text style={StyleSheet.flatten([styles.termsLink, { color: tintColor }])}>
              Termos e Condições
            </Text>
          </Link>
        </View>

        {errors.acceptedTerms && (
          <Text style={[styles.termsError, { color: '#ef4444' }]}>
            {errors.acceptedTerms}
          </Text>
        )}

        <Button
          title="Criar conta"
          onPress={handleSignup}
          loading={loading}
          style={styles.signupButton}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: 32,
  },
  signupButton: {
    marginTop: 8,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  termsText: {
    fontSize: 14,
  },
  termsLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  termsError: {
    fontSize: 12,
    marginBottom: 8,
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
  },
  footerText: {
    fontSize: 14,
  },
});
