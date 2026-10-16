import React, { useState, useEffect } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Button, Input } from "@/components/ui";
import { Text } from "@/components/ui/Text";
import { AuthScreen } from "@/components/auth/AuthScreen";
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
  const tintColor = useThemeColor({}, "tint");

  const [spinValue] = useState(() => new Animated.Value(0));
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

          if (updateResponse) {
            updateAuthUser(updateResponse.user);
          }
        }
      }

      router.replace("/");
    } catch (error) {
      if (error instanceof ApiError && error.fields) {
        setErrors(translateFields(error.fields));
      } else {
        showToast(translateError(error) || "Falha ao fazer login", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar style="dark" />
      <AuthScreen
        header={
          <Animated.View
            style={[styles.logoContainer, { transform: [{ rotate: spin }] }]}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>
        }
        title="Bem vindo de volta"
        titleTestID="text-welcome"
        subtitle="Logue na sua conta nexo"
        footer={
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: textColor, opacity: 0.7 }]}>
              Não tem uma conta ainda?{" "}
            </Text>
            <Link
              href="/auth/signup"
              asChild
              style={StyleSheet.flatten([styles.link, { color: tintColor }])}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.footerText,
                  { color: tintColor },
                ])}
              >
                Cadastre-se
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

          <Input
            label="Senha"
            type="password"
            value={password}
            onChangeText={setPassword}
            placeholder="Qual sua senha?"
            error={errors.password}
            showPasswordToggle
            testID="input-password"
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
            testID="button-login"
          />

          <Link
            href="/auth/forgot-password"
            style={StyleSheet.flatten([styles.link, { color: tintColor }])}
            asChild
          >
            <Text
              style={StyleSheet.flatten([
                styles.footerText,
                { color: textColor, opacity: 0.7 },
              ])}
            >
              Esqueceu a senha?
            </Text>
          </Link>
        </View>
      </AuthScreen>
    </>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 10,
  },
  logo: {
    width: 120,
    height: 120,
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
  },
  footerText: {
    fontSize: 14,
  },
});
