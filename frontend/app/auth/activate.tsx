import React, { useState } from 'react';
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
import { Colors } from '@/constants/theme'
import { useAuth } from '@/context/AuthContext';

export default function ActivateScreen() {
  const { userId } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<{
    code?: string;
  }>({});

  const { activate } = useAuth();
  const [loading, setLoading] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!code) {
      newErrors.code = 'O código é obrigatório';
    } else if (code.length < 6) {
      newErrors.code = 'O código deve conter pelo menos 6 caracteres';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleActivate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await activate(Number(code.replaceAll(' ', '')));

      Alert.alert('Sucesso!', 'Conta ativada com sucesso', [
        {
          text: 'OK',
          onPress: () => router.replace('/'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Erro: ', error.message || 'Falha em ativar a conta');
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
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
            <Text style={[styles.title, { color: textColor }]}>Ativar a conta</Text>
            <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              Digite o código de ativação enviado para seu email
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Código"
              type="text"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              placeholder="Digite o código enviado para sua conta"
              error={errors.code}
            />

            <Button
              title="Ativar conta"
              onPress={handleActivate}
              loading={loading}
              style={styles.resetButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textColor, opacity: 0.7 }]}>
              Não recebeu?{' '}
            </Text>

            <Button variant="outline" title="Reenviar um novo código" onPressed={resendCode} />
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
  resetButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 20,
    borderTopColor: Colors.light.accentBlue,
    borderTopWidth: 1,
    paddingTop: 20
  },
  footerText: {
    textAlign: 'center',
    marginBottom: 10
  }
});
