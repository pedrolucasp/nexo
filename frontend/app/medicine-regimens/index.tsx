import { ScrollView, StyleSheet } from "react-native";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing } from "@/constants/theme";
import { TodayMedicines } from "@/components/medicine/TodayMedicines";
import { MedicineRegimenList } from "@/components/medicine/MedicineRegimenList";

export default function MedicineRegimens() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      scrollEventThrottle={16}
    >
      <Section>
        <SectionHeader title="Hoje" />
        <TodayMedicines />
      </Section>

      <Section>
        <SectionHeader
          title="Seus medicamentos"
          subtitle="Gerencie seus medicamentos e horários"
        />
        <MedicineRegimenList />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.containerPadding,
    paddingVertical: Spacing.sectionGap,
    gap: Spacing.sectionGap,
    paddingBottom: 80,
  },
});
