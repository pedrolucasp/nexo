import { View } from "react-native";
import { Label } from "@/components/ui/Input";
import { TimePicker } from "@/components/ui/TimePicker";
import { minutesToDate, wakeMinutesFromDate } from "@/lib/utils/time";

export const DEFAULT_WAKE_MINUTES = 420;

type Props = {
  value: number;
  onChange: (minutes: number) => void;
};

export function WakeTimePicker({ value, onChange }: Props) {
  return (
    <View>
      <Label text="Acordou por volta das" />
      <TimePicker
        value={minutesToDate(value)}
        onChange={(date) => onChange(wakeMinutesFromDate(date))}
      />
    </View>
  );
}
