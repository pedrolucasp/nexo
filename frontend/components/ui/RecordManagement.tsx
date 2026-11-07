import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { SubtleInfoCard } from "@/components/ui/Cards";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";
import { useEditingWindow } from "@/hooks/useEditingWindow";

interface RecordManagementProps {
  createdAt?: Date | string | null;
  onEdit: () => void;
  onDelete: () => void;
  deleting?: boolean;
}

// The pair that closes every detail screen: editing and removal share one
// Editing Window, so they share one countdown and one explanation.
export function RecordManagement({
  createdAt,
  onEdit,
  onDelete,
  deleting = false,
}: RecordManagementProps) {
  const { canEdit, buttonSuffix } = useEditingWindow(createdAt);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>GESTÃO DO REGISTRO</Text>

      <Button
        variant="outline"
        disabled={!canEdit}
        onPress={onEdit}
        title={`Editar Registro ${buttonSuffix}`}
      />

      <Button
        variant="danger"
        loading={deleting}
        disabled={!canEdit || deleting}
        onPress={onDelete}
        title={`Excluir Registro ${buttonSuffix}`}
      />

      <SubtleInfoCard
        style={styles.info}
        text={`
          A edição e a exclusão de registros são permitidas apenas nos primeiros
          5 minutos após o envio para garantir a integridade do histórico
          emocional.
          `}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    color: Colors.light.textSecondary,
    textTransform: "uppercase",
  },
  info: {
    marginTop: 4,
  },
});
