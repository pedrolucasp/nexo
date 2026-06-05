import { useRef } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { HistoryCategory } from "@/lib/history/types";
import { Colors } from "@/constants/theme";

export type FilterOption = {
  label: string;
  value: HistoryCategory | "all";
};

export const HISTORY_FILTERS: FilterOption[] = [
  { label: "Tudo", value: "all" },
  { label: "Humor", value: "mood" },
  { label: "Sono", value: "sleep" },
  { label: "Gatilho", value: "trigger" },
];

type Props = {
  active: HistoryCategory | "all";
  onChange: (value: HistoryCategory | "all") => void;
};

export function FilterPills({ active, onChange }: Props) {
  const scrollRef = useRef<ScrollView>(null);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {HISTORY_FILTERS.map((filter) => {
          const isActive = filter.value === active;
          return (
            <TouchableOpacity
              key={filter.value}
              onPress={() => onChange(filter.value)}
              activeOpacity={0.7}
              style={[styles.pill, isActive && styles.pillActive]}
            >
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/*
        TODO: needs a new build, probably
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.fadeRight}
          pointerEvents="none"
        />
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: "row",
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "#F2F2F7",
    borderWidth: 1,
    borderColor: "transparent",
    elevation: 1,
  },
  pillActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#3C3C43",
    letterSpacing: -0.1,
  },
  labelActive: {
    color: Colors.light.text,
  },
  fadeRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 48,
  },
});
