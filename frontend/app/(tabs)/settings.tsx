import {
  TouchableOpacity,
  StyleSheet,
  View,
  Switch,
} from "react-native";
import { Text } from '@/components/ui/Text';
import { useState } from "react";
import { router } from "expo-router";
import { Card } from "@/components/ui/Cards";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { BorderRadius, Colors, Spacing, Typography } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useAuth } from "@/context/AuthContext";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TimePicker } from "@/components/ui/TimePicker";
import { usePatchUserMe } from "@/hooks/useUserPreferences.queries";
import { useToast } from '@/context/ToastContext';
import { apiClient } from "@/lib/api";

export default function Settings() {
  const { user, logout, updateAuthUser } = useAuth();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const { showToast } = useToast();

  const pushEnabled = user?.pushEnabled ?? true;
  const dailyReminderTime = user?.dailyReminderTime ?? null;
  const reminderEnabled = dailyReminderTime !== null;
  const weeklyResumeEnabled = user?.weeklyResumeEnabled ?? false;
  const [lastReminderTime, setLastReminderTime] = useState("20:00");
  const reminderTime = dailyReminderTime ?? lastReminderTime;

  const patchUserMe = usePatchUserMe((updatedUser) => {
    updateAuthUser(updatedUser);
  });

  const handlePushToggle = (value: boolean) => {
    patchUserMe.mutate({ pushEnabled: value });
  };

  const handleReminderToggle = (value: boolean) => {
    if (dailyReminderTime) {
      setLastReminderTime(dailyReminderTime);
    }

    patchUserMe.mutate({ dailyReminderTime: value ? reminderTime : null });
  };

  const handleWeeklyResumeToggle = (value: boolean) => {
    patchUserMe.mutate({ weeklyResumeEnabled: value });
  };

  const handleTimeChange = (date: Date) => {
    const time = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    setLastReminderTime(time);
    patchUserMe.mutate({ dailyReminderTime: time });
  };

  const textColor = useThemeColor({}, "text");

  const handleLogout = () => {
    setLogoutVisible(true);
  };

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleInvisibleMode = () => {};

  const handleDataExport = () => {
    setExportVisible(true);
  };

  const handleExportConfirm = async () => {
    setExporting(true);

    try {
      const { message } = await apiClient.exportData();

      setExportVisible(false);
      showToast(message, "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Não foi possível exportar seus dados",
        "error",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScreenLayout
      userName={user?.firstName}
      userAvatar={user?.avatarURL}
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
              <Text style={[styles.rowLabel, { width: '100%' }]}>Dados Pessoais</Text>
              <Text style={styles.rowSubtitle}>Nome, Email e senha</Text>
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
              <Text style={styles.rowLabel}>Notificações por push</Text>
              <Text style={styles.rowSubtitle}>
                Os lembretes continuam no app mesmo com o push desativado.
              </Text>
            </View>

            <Switch
              onValueChange={handlePushToggle}
              thumbColor={Colors.light.tint}
              trackColor={{
                false: Colors.light.disabled,
                true: Colors.light.gray,
              }}
              value={pushEnabled}
              disabled={patchUserMe.isPending}
            />
          </View>

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
                { backgroundColor: Colors.light.accentIndigo, marginBottom: 5 },
              ]}
            >
              <Ionicons
                name="alarm-outline"
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
              <Text style={styles.rowLabel}>Lembrete diário de humor</Text>
              <Text style={styles.rowSubtitle}>
                {reminderEnabled ? `Diário às ${reminderTime}` : "Desativado"}
              </Text>
            </View>

            <Switch
              onValueChange={handleReminderToggle}
              thumbColor={Colors.light.tint}
              trackColor={{
                false: Colors.light.disabled,
                true: Colors.light.gray,
              }}
              value={reminderEnabled}
              disabled={patchUserMe.isPending}
            />
          </View>

          {reminderEnabled && (
            <TimePicker
              value={(() => {
                const [h, m] = reminderTime.split(":").map(Number);
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
              <Text style={styles.rowLabel}>Resumo semanal</Text>
              <Text style={styles.rowSubtitle}>
                Mostra um resumo no topo da Jornada, a partir dos seus dados.
                Desativar não afeta os indicadores semanais.
              </Text>
            </View>

            <Switch
              onValueChange={handleWeeklyResumeToggle}
              value={weeklyResumeEnabled}
              thumbColor={Colors.light.tint}
              trackColor={{
                false: Colors.light.disabled,
                true: Colors.light.gray,
              }}
              disabled={patchUserMe.isPending}
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
              <Text style={[styles.rowLabel, { marginLeft: 8 }]}>
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

              <Text style={[styles.rowLabel, { marginLeft: 8 }]}>
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

              <Text style={[styles.rowLabel, { marginLeft: 8 }]}>
                Exportar Meus Dados
              </Text>
            </View>

            <MaterialIcons
              name="file-download"
              size={24}
              color={Colors.light.textSecondary}
            />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={() => router.push("/terms")}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="description"
                size={24}
                color={Colors.light.textSecondary}
              />

              <Text style={[styles.rowLabel, { marginLeft: 8 }]}>
                Termos e Condições
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </TouchableOpacity>
        </Card>
      </Section>

      <Button
        title="Sair da Conta"
        onPress={handleLogout}
        variant="outline"
        style={{ borderColor: Colors.light.danger }}
        testID="button-logout"
        textStyle={{ color: Colors.light.danger }}
      />

      <ConfirmModal
        visible={logoutVisible}
        title="Sair da conta"
        message="Tem certeza que quer sair?"
        confirmLabel="Sair"
        cancelLabel="Cancelar"
        destructive
        onCancel={() => setLogoutVisible(false)}
        onConfirm={() => {
          setLogoutVisible(false);
          logout();
        }}
        testID="logout-confirm"
      />

      <ConfirmModal
        visible={exportVisible}
        title="Exportar meus dados"
        message={
          "Vamos preparar um arquivo com todos os seus dados e enviá-lo " +
          "para o e-mail abaixo. Pode levar alguns instantes."
        }
        detail={user?.email}
        confirmLabel="Exportar"
        cancelLabel="Cancelar"
        loading={exporting}
        onCancel={() => setExportVisible(false)}
        onConfirm={handleExportConfirm}
        testID="export-confirm"
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  cardIcon: {
    paddingVertical: 15,
    paddingHorizontal: 14,
    width: 48,
    borderRadius: BorderRadius.md,
  },
  rowLabel: {
    ...Typography.bodyLg,
    color: Colors.light.text,
  },
  rowSubtitle: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#D1D5DB",
    marginVertical: 16,
  },
});
