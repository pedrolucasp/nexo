import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link, useLocalSearchParams, router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Input } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { translateError } from '@/lib/errors/translations';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!password) {
      newErrors.password = 'A senha é obrigatória';
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

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    if (!token) {
      showToast('Token não encontrado. Solicite um novo link de recuperação.', 'error');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      showToast('Senha recuperada com sucesso!', 'success');
      router.replace('/auth/login');
    } catch (error) {
      showToast(translateError(error) || 'Falha em recuperar a conta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreen
      title="Recuperar a conta"
      subtitle="Digite uma nova senha para sua conta"
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textColor, opacity: 0.7 }]}>
            Lembrou da senha?{' '}
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
          onPress={handleResetPassword}
          loading={loading}
          style={styles.resetButton}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
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
  },
  footerText: {
    fontSize: 14,
  },
});
