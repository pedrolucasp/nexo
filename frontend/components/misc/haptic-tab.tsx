import { BottomTabBarButtonProps } from 'expo-router/js-tabs';
import { Platform, Pressable } from 'react-native';
import type { Ref } from 'react';
import type { View } from 'react-native';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  const { ref, onPressIn, ...rest } = props;
  return (
    <Pressable
      {...rest}
      ref={ref as Ref<View>}
      onPressIn={(ev) => {
        if (Platform.OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}