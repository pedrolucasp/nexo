import {
  TouchableOpacity,
  StyleSheet,
  SectionList,
  View,
  Alert,
  Switch,
  Pressable,
} from "react-native";
import { Text } from '@/components/ui/Text';
import { useState } from "react";
import { router } from "expo-router";
import { Card } from "@/components/ui/Cards";
import ScreenLayout from "@/components/ui/ScreenLayout";
import { BorderRadius, Colors, Fonts, Spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/context/AuthContext";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { TimePicker } from "@/components/ui/TimePicker";
import { usePatchUserMe } from "@/hooks/useUserPreferences.queries";
import { useToast } from '@/context/ToastContext';

export default function Settings() {
  const { user, logout, updateAuthUser } = useAuth();
  const [allowWeeklyInsights, setAllowWeeklyInsights] = useState(false);
  const { showToast } = useToast();

  const notificationsEnabled = user?.notificationsEnabled ?? true;
  const dailyReminderTime = user?.dailyReminderTime ?? "20:00";

  const patchUserMe = usePatchUserMe((updatedUser) => {
    updateAuthUser(updatedUser);
  });

  const handleNotificationToggle = (value: boolean) => {
    patchUserMe.mutate({ notificationsEnabled: value });
  };

  const handleTimeChange = (date: Date) => {
    const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    patchUserMe.mutate({ dailyReminderTime: time });
  };

  const textColor = useThemeColor({}, "text");

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que quer sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleInvisibleMode = () => {};

  const handleDataExport = () => {
    Alert.alert("Exportar dados", "Deseja exportar seus dados?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Exportar",
        style: "destructive",
        onPress: () => {
          showToast("Você receberá um e-mail com os dados exportados", "success")
        },
      },
    ]);
  };

  return (
    <ScreenLayout
      userName={user.firstName}
      userAvatar={user.avatarURL}
      showNotificationBadge={true}
    >
      <Section>
        <SectionHeader title="Perfil" />

        <Card style={{ padding: Spacing.cardGap }} onPress={handleProfilePress}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={styles.cardTitle}>Dados Pessoais</Text>
              <Text style={styles.cardSubtitle}>Nome, Email e senha</Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </View>
        </Card>
      </Section>

      <Section>
        <SectionHeader title="Notificações" />

        <Card style={{ padding: Spacing.cardGap }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: Colors.light.accentBlue, marginBottom: 5 },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={Colors.light.black}
              />
            </View>

            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginLeft: 12,
                flex: 1,
              }}
            >
              <Text style={styles.cardTitle}>Lembrete diário de humor</Text>
              <Text>{notificationsEnabled ? `Diário às ${dailyReminderTime}` : "Desativado"}</Text>
            </View>

            <Switch
              onValueChange={handleNotificationToggle}
              thumbColor={Colors.light.tint}
              trackColor={{
                false: Colors.light.disabled,
                true: Colors.light.gray,
              }}
              value={notificationsEnabled}
              disabled={patchUserMe.isPending}
            />
          </View>

          {notificationsEnabled && (
            <TimePicker
              value={(() => {
                const [h, m] = dailyReminderTime.split(":").map(Number);
                const d = new Date();
                d.setHours(h, m, 0, 0);
                return d;
              })()}
              onChange={handleTimeChange}
            />
          )}

          <View style={styles.divider} />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={[
                styles.cardIcon,
                { backgroundColor: Colors.light.accentPurple },
              ]}
            >
              <Ionicons name="sparkles" size={20} color={Colors.light.black} />
            </View>

            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginLeft: 12,
                flex: 1,
              }}
            >
              <Text style={styles.cardTitle}>Indicadores semanais</Text>
              <Text>Relatórios de progressos</Text>
            </View>

            <Switch
              onValueChange={setAllowWeeklyInsights}
              value={allowWeeklyInsights}
              thumbColor={Colors.light.tint}
              trackColor={{
                false: Colors.light.disabled,
                true: Colors.light.gray,
              }}
            />
          </View>
        </Card>
      </Section>

      <Section>
        <SectionHeader title="Relatório" />
        <Card
          style={{ padding: Spacing.cardGap }}
          onPress={() => router.push("/report")}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="picture-as-pdf"
                size={24}
                color={Colors.light.textSecondary}
              />
              <Text style={{ marginLeft: 8, ...styles.cardTitle }}>
                Gerar Relatório
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </View>
        </Card>
      </Section>

      <Section>
        <SectionHeader title="Privacidade" />

        <Card style={{ padding: Spacing.cardGap }}>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={handleInvisibleMode}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="lock"
                size={24}
                color={Colors.light.textSecondary}
              />

              <Text
                style={{
                  marginLeft: 8,
                  color: Colors.light.text,
                  fontSize: 14,
                  fontWeight: "500" as const,
                }}
              >
                Privacidade
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={handleDataExport}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="storage"
                size={24}
                color={Colors.light.textSecondary}
              />

              <Text
                style={{
                  marginLeft: 8,
                  color: Colors.light.text,
                  fontSize: 14,
                  fontWeight: "500" as const,
                }}
              >
                Exportar Meus Dados
              </Text>
            </View>

            <MaterialIcons
              name="file-download"
              size={24}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>
        </Card>
      </Section>

      <Button
        title="Sair da Conta"
        onPress={handleLogout}
        variant="outline"
        style={{ borderColor: Colors.light.danger }}
        textStyle={{ color: Colors.light.danger }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    paddingTop: 10,
  },
  item: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
  },
  cardIcon: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    width: 48,
    borderRadius: BorderRadius.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  logout: {
    color: "#FF2C2C",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D1D5DB",
    marginVertical: 16,
  },
});
