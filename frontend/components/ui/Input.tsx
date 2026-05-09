import React from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  type?: 'text' | 'email' | 'password';
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  type = 'text',
  showPasswordToggle = false,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'inputBackgroundColor');
  const borderColor = useThemeColor({}, 'inputBorderColor');
  const errorColor = '#ef4444';
  const placeholderColor = useThemeColor({ light: '#9ca3af', dark: '#6b7280' }, 'placeholder');

  const keyboardType = type === 'email' ? 'email-address' : 'default';
  const secureTextEntry = type === 'password' && !showPassword;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              color: textColor,
              backgroundColor,
              borderColor: error ? errorColor : borderColor,
            },
            style,
          ]}
          placeholderTextColor={placeholderColor}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={type === 'email' ? 'none' : props.autoCapitalize}
          autoCorrect={type === 'email' || type === 'password' ? false : props.autoCorrect}
          {...props}
        />
        {type === 'password' && showPasswordToggle && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color={placeholderColor}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: errorColor }]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    paddingHorizontal: 12,
    paddingRight: 44,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 13,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
});
