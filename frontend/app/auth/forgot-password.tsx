import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Link } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Input } from '@/components/ui';
import { Text } from '@/components/ui/Text';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { translateError } from '@/lib/errors/translations';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});

  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  const validateForm = () => {
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Por favor entre um email válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await forgotPassword(email);
      setEmailSent(true);
    } catch (error) {
      showToast(translateError(error) || 'Falha ao enviar link de recuperação', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthScreen
        title="Verifique seu email"
        subtitle={`Enviamos as instruções para resetar sua senha para ${email}`}
        footer={
          <View style={styles.actions}>
            <Button
              title="Reenviar email"
              variant="outline"
              onPress={() => setEmailSent(false)}
            />

            <Link href="/auth/login" asChild style={StyleSheet.flatten([styles.link, { color: tintColor }])}>
              <Text style={StyleSheet.flatten([styles.link, { color: tintColor }])}>
                Voltar para login
              </Text>
            </Link>
          </View>
        }
      />
    );
  }

  return (
    <AuthScreen
      title="Esqueceu a senha?"
      subtitle="Insira seu email para receber as instruções de recuperação"
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textColor, opacity: 0.7 }]}>
            Lembra tua senha?{' '}
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
          label="Email"
          type="email"
          value={email}
          onChangeText={setEmail}
          placeholder="Qual seu email?"
          error={errors.email}
          autoCapitalize="none"
        />

        <Button
          title="Enviar link de recuperação"
          onPress={handleForgotPassword}
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
  actions: {
    gap: 16,
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
