// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const MAPPING = {
  'house.fill': 'home',
  'notifications': 'notifications',
  'add-circle': 'add-circle',
  'history': 'history',
  'lightbulb-outline': 'lightbulb-outline',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'bolt': 'bolt',
  'settings.fill': 'settings',
  'book': 'book'
} as const satisfies Record<string, MaterialIconName>;

type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses Material Icons on all platforms.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}