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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dashed' | 'danger';
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
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const borderDashedColor = useThemeColor({}, 'borderDashed');

  const getBackgroundColor = () => {
    if (disabled) return useThemeColor({ light: '#e5e5e5', dark: '#404040' }, 'background');
    switch (variant) {
      case 'primary':
        return primaryColor;
      case 'secondary':
        return useThemeColor({ light: '#f3f4f6', dark: '#374151' }, 'background');
      case 'danger':
        return useThemeColor({}, 'danger');
      case 'outline':
      case 'ghost':
      case 'dashed':
        return 'transparent';
      default:
        return primaryColor;
    }
  };

  const getTextColor = () => {
    if (disabled) return useThemeColor({}, 'text');

    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'outline':
      case 'ghost':
        return textColor;
      case 'dashed':
        return textSecondaryColor;
      default:
        return '#fff';
    }
  };

  const getBorderWidth = () => {
    if (variant === 'outline' || variant === 'dashed') {
      return 1;
    } else {
      return 0;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline' || variant === 'dashed') {
      if (disabled) {
        return borderColor;
      } else if (variant === 'dashed') {
        return borderDashedColor;
      } else {
        return primaryColor;
      }
    }

    return 'transparent';
  };

  const getBorderStyle = () => {
    return variant === 'dashed' ? 'dashed' : 'solid';
  }

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
          borderStyle: getBorderStyle(),
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
