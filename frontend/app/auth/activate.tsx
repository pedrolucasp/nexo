import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, CodeInput } from '@/components/ui';
import type { CodeInputHandle } from '@/components/ui/CodeInput';
import { Text } from '@/components/ui/Text';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { translateError } from '@/lib/errors/translations';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export default function ActivateScreen() {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);
  const codeInputRef = useRef<CodeInputHandle>(null);

  const { activate, requestActivateCode, logout } = useAuth();
  const { showToast } = useToast();
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const submitCode = async (value: string) => {
    if (loading) return;

    if (value.length !== CODE_LENGTH) {
      setCodeError(`O código deve ter ${CODE_LENGTH} dígitos`);
      return;
    }

    setCodeError(undefined);
    setLoading(true);
    try {
      await activate(value);
      showToast('Conta ativada com sucesso!', 'success');
      router.replace('/');
    } catch (error) {
      setCode('');
      setCodeError(
        translateError(error) ||
          'Código incorreto. Verifique o código e tente novamente.',
      );
      codeInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    setCodeError(undefined);
  };

  // Abandons this half-created session. Nothing exists on an inactive account
  // yet, so there is nothing to warn about — it just clears the local session
  // and drops back to login.
  const backToLogin = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const resendCode = async () => {
    if (secondsLeft > 0) return;

    setSecondsLeft(RESEND_COOLDOWN_SECONDS);
    try {
      await requestActivateCode();
      showToast('Novo código enviado. Verifique sua caixa de entrada.', 'success');
    } catch {
      setSecondsLeft(0);
      showToast('Falha ao reenviar o código. Tente novamente.', 'error');
    }
  };

  return (
    <AuthScreen
      title="Ativar a conta"
      subtitle="Digite o código de 6 dígitos enviado para seu email"
      footer={
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: textColor, opacity: 0.7 }]}>
            Não recebeu?{' '}
          </Text>

          <Button
            variant="outline"
            title={
              secondsLeft > 0
                ? `Reenviar em ${secondsLeft}s`
                : 'Reenviar um novo código'
            }
            onPress={resendCode}
            disabled={secondsLeft > 0}
          />

          <Pressable
            onPress={backToLogin}
            style={styles.backLink}
            testID="button-back-to-login"
          >
            <Text style={[styles.backLinkText, { color: tintColor }]}>
              Voltar para login
            </Text>
          </Pressable>
        </View>
      }
    >
      <View style={styles.form}>
        <CodeInput
          ref={codeInputRef}
          value={code}
          onChange={handleCodeChange}
          onComplete={submitCode}
          length={CODE_LENGTH}
          error={codeError}
          editable={!loading}
          accessibilityLabel="Código de ativação de 6 dígitos"
          testIdPrefix="activate-code"
        />

        <Button
          title="Ativar conta"
          onPress={() => submitCode(code)}
          loading={loading}
          style={styles.activateButton}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: 32,
  },
  activateButton: {
    marginTop: 8,
  },
  footer: {
    borderTopColor: Colors.light.accentBlue,
    borderTopWidth: 1,
    paddingTop: 20,
  },
  footerText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  backLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
