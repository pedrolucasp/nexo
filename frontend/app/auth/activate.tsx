import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Button, CodeInput } from '@/components/ui';
import type { CodeInputHandle } from '@/components/ui/CodeInput';
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

  const { activate, requestActivateCode } = useAuth();
  const { showToast } = useToast();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

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
    } catch (error: any) {
      setCode('');
      setCodeError(
        translateError(error.message) ||
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
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>Ativar a conta</Text>
            <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              Digite o código de 6 dígitos enviado para seu email
            </Text>
          </View>

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
  activateButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 20,
    borderTopColor: Colors.light.accentBlue,
    borderTopWidth: 1,
    paddingTop: 20,
  },
  footerText: {
    textAlign: 'center',
    marginBottom: 10,
  },
});
