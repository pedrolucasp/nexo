import { useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Text } from "@/components/ui/Text";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { formatMinutes } from "@/lib/utils/time";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

function formatTime(date: Date): string {
  return formatMinutes(date.getHours() * 60 + date.getMinutes());
}

export const TimePicker: React.FC<Props> = ({ value, onChange }) => {
  const [show, setShow] = useState(false);

  const handleChange = (_: DateTimePickerEvent, selected?: Date) => {
    setShow(false);

    if (selected) {
      onChange(selected);
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShow(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.timeText}>{formatTime(value)}</Text>
        <Ionicons
          name="time-outline"
          size={20}
          color="#8E8E9A"
          strokeWidth={1.5}
        />
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={value}
          mode="time"
          display="default"
          onChange={handleChange}
          onTouchCancel={() => setShow(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
    letterSpacing: 0.5,
    fontVariant: ["tabular-nums"],
  },
});
