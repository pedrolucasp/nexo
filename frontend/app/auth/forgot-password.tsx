import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { translateError } from '@/lib/errors/translations';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [resetToken, setResetToken] = useState(''); // Only for development
  const [errors, setErrors] = useState<{ email?: string }>({});

  const { forgotPassword } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
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
      const data = await forgotPassword(email);
      setEmailSent(true);
      // In development, show the reset token
      if (data.token) {
        setResetToken(data.token);
      }
    } catch (error: any) {
      showToast(translateError(error.message) || 'Falha ao enviar link de recuperação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUseToken = () => {
    if (resetToken) {
      router.push({
        pathname: '/auth/reset-password',
        params: { token: resetToken },
      });
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.successContainer}>
          <Text style={[styles.title, { color: textColor }]}>Verifique seu email</Text>
          <Text style={[styles.message, { color: textColor, opacity: 0.7 }]}>
            Enviamos as instruções para resetar sua senha para {email}
          </Text>

          {/* Development only - show reset token */}
          {resetToken && (
            <View style={styles.devSection}>
              <Text style={[styles.devTitle, { color: tintColor }]}>
                Dev mode:
              </Text>
              <Text style={[styles.devText, { color: textColor, opacity: 0.7 }]}>
                Token: {resetToken}
              </Text>
              <Button
                title="Usar token para resetar senha"
                onPress={handleUseToken}
                style={styles.devButton}
              />
            </View>
          )}

          <View style={styles.actions}>
            <Button
              title="Reenviar email"
              variant="outline"
              onPress={() => setEmailSent(false)}
              style={styles.resendButton}
            />

            <Link href="/auth/login" asChild style={[styles.link, { color: tintColor }]}>
              <Text style={[styles.link, { color: tintColor }]}>
                Voltar para login
              </Text>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={[styles.title, { color: textColor }]}>Esqueceu a senha?</Text>
            <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              Insira seu email para receber as instruções de recuperação
            </Text>
          </View>

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

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textColor, opacity: 0.7 }]}>
              Lembra tua senha?{' '}
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  resetButton: {
    marginTop: 8,
  },
  actions: {
    gap: 16,
  },
  resendButton: {
    marginBottom: 8,
  },
  devSection: {
    marginBottom: 32,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
  },
  devTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  devText: {
    fontSize: 12,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  devButton: {
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
