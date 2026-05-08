/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#12ED5C';
const tintColorSecondary = '#618A70';
const black = '#121712';

export const Colors = {
  light: {
    text: '#121712',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: tintColorSecondary,
    tabIconSelected: black,
  },
};

export const Fonts = Platform.select({
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
});
