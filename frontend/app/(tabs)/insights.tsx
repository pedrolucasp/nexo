import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { useAuth } from "@/context/AuthContext";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { WeeklyResume } from "@/components/insights/WeeklyResume";
import { MoodTrendWidget } from "@/components/insights/MoodTrendWidget";
import { EnergySleepWidget } from "@/components/insights/EnergySleepWidget";
import { TriggerPatternWidget } from "@/components/insights/TriggerPatternWidget";

export default function Insights() {
  const { user } = useAuth();

  return (
    <ScreenLayout
      userName={user?.firstName}
      userAvatar={user?.avatarURL}
      showNotificationBadge={true}
    >
      <WeeklyResume
        avgMood="Neutro"
        stats={[
          { label: "Média de Sono", value: "7.2h" },
          { label: "Humor Estável", value: "92%" },
        ]}
      />

      <Section>
        <SectionHeader title="Indicadores" subtitle="Baseado nos últimos 7 dias" />

        <EnergySleepWidget />

        <MoodTrendWidget />

        <TriggerPatternWidget />
      </Section>
    </ScreenLayout>
  );
}
