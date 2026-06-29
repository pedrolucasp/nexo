import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  Easing
} from "react-native";
import { Text } from "@/components/ui/Text";
import { Link, router } from "expo-router";
import { Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { apiClient, ApiError } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { translateError, translateFields } from "@/lib/errors/translations";
import { registerForPushNotifications } from "@/hooks/useRegisterPushToken";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);

  const { login, updateAuthUser } = useAuth();
  const { showToast } = useToast();
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");

  const spinValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 12000, // 12s per full turn (slow)
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Por favor, use um email válido";
    }

    if (!password) {
      newErrors.password = "Senha é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await login(email, password);

      if (response?.user) {
        const token = await registerForPushNotifications();
        if (token) {
          const updateResponse = await apiClient.updateUser({
            id: response.user.id,
            pushToken: token,
          });

          console.log("UPDATE USER response: ", updateResponse);

          if (updateResponse) {
            updateAuthUser(updateResponse.user);
          }
        }
      }

      router.replace("/");
    } catch (error: any) {
      console.log("LOGIN error: ", error);
      if (error instanceof ApiError && error.fields) {
        setErrors(translateFields(error.fields));
      } else {
        showToast(translateError(error.message) || 'Falha ao fazer login', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
        <StatusBar style={'dark'} />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <View style={styles.header}>
            <Text style={[styles.title, { color: textColor }]}>
              Bem vindo de volta
            </Text>
            <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
              Logue na sua conta nexo
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

            <Input
              label="Senha"
              type="password"
              value={password}
              onChangeText={setPassword}
              placeholder="Qual sua senha?"
              error={errors.password}
              showPasswordToggle
            />

            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
            />

            <Link
              href="/auth/forgot-password"
              style={[styles.link, { color: tintColor }]}
              asChild
            >
              <Text
                style={[styles.footerText, { color: textColor, opacity: 0.7 }]}
              >
                Esqueceu a senha?
              </Text>
            </Link>
          </View>

          <View style={styles.footer}>
            <Text
              style={[styles.footerText, { color: textColor, opacity: 0.7 }]}
            >
              Não tem uma conta ainda?{" "}
            </Text>

            <Link
              href="/auth/signup"
              asChild
              style={[styles.link, { color: tintColor }]}
            >
              <Text
                style={[styles.footerText, { color: textColor, opacity: 0.7 }]}
              >
                Cadastre-se
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 10,
  },
  logo: {
    width: 120,
    height: 120,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    minHeight: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  form: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  link: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
  },
});
