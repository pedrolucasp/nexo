import { Text as RNText, type TextProps } from 'react-native';

export function Text({ style, ...rest }: TextProps) {
  return (
    <RNText
      style={[{ fontFamily: 'Inter', fontWeight: '400' }, style]}
      {...rest}
    />
  );
}
