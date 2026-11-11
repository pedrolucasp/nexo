import { ScrollView, StyleSheet } from "react-native";
import { Section, SectionHeader } from "@/components/ui/Sections";
import { Spacing } from "@/constants/theme";
import { MedicineRegimenList } from "@/components/medicine/MedicineRegimenList";

export default function MedicineRegimens() {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      scrollEventThrottle={16}
    >
      <Section>
        <SectionHeader
          title="Meus medicamentos"
          subtitle="Horários, dosagem e o que está em uso"
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
