import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  style,
  textStyle,
  onPress,
  ...props
}) => {
  const primaryColor = useThemeColor({ light: '#0a7ea4', dark: '#4fb3d1' }, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#e0e0e0', dark: '#404040' }, 'border');

  const getBackgroundColor = () => {
    if (disabled) return useThemeColor({ light: '#e5e5e5', dark: '#404040' }, 'background');
    switch (variant) {
      case 'primary':
        return primaryColor;
      case 'secondary':
        return useThemeColor({ light: '#f3f4f6', dark: '#374151' }, 'background');
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return primaryColor;
    }
  };

  const getTextColor = () => {
    if (disabled) return useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'text');
    switch (variant) {
      case 'primary':
        return '#fff';
      case 'secondary':
      case 'outline':
      case 'ghost':
        return textColor;
      default:
        return '#fff';
    }
  };

  const getBorderWidth = () => {
    return variant === 'outline' ? 1 : 0;
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? borderColor : primaryColor;
    }
    return 'transparent';
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 36;
      case 'medium':
        return 44;
      case 'large':
        return 52;
      default:
        return 44;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: getBorderWidth(),
          borderColor: getBorderColor(),
          height: getHeight(),
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
      disabled={disabled || loading}
      onPress={onPress}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: getTextColor(),
              fontSize: getFontSize(),
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  text: {
    fontWeight: '600',
  },
});
