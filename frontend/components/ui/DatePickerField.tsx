import { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from '@/constants/theme';
import { Label } from '@/components/ui/Input';

export default function DatePickerField({
  label,
  initialDate = new Date(),
  onChange,
  minimumDate,
  maximumDate,
}) {
  const [date, setDate] = useState(initialDate);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setDate(initialDate);
  }, [initialDate]);

  const openPicker = () => setShow(true);

  const handleChange = (event, selectedDate) => {
    setShow(false);

    if (selectedDate) {
      setDate(selectedDate);
      if (onChange) onChange(selectedDate);
    }
  };

  const formatted = format(date, "dd/MM/yyyy");

  return (
    <View>
      <Label text={label} />

      <Pressable onPress={openPicker}
                 style={({ pressed }) => [styles.container, pressed && styles.pressed]}>
        <Text style={styles.dateText}>{formatted}</Text>
        <MaterialCommunityIcons name="calendar-outline" size={22} color="#6B7280" />
      </Pressable>

      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={"default"}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '500',
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase'
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6", // light gray pill
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    minWidth: 220,
  },
  pressed: {
    opacity: 0.8,
  },
  dateText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
});

