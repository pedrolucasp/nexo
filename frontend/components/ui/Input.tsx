import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';

type InputVariant = 'default' | 'ghost' | 'darkGhost';

interface BaseInputProps {
  label?: string;
  error?: string;
  variant?: InputVariant;
}

function useInputStyles(variant: InputVariant, error?: string) {
  let backgroundColor = null;

  const textColor = useThemeColor({}, 'text');
  const defaultBackgroundColor = useThemeColor({}, 'inputBackgroundColor');
  const backgroundDarkGhostColor = useThemeColor({}, 'inputBackgroundDarkGhostColor');
  const borderColor = useThemeColor({}, 'inputBorderColor');
  const placeholderColor = useThemeColor({}, 'inputPlaceholderColor');
  const errorColor = '#ef4444';

  const isGhost = variant === 'ghost';
  const isDarkGhost = variant === 'darkGhost';

  if (isDarkGhost) {
    backgroundColor = backgroundDarkGhostColor;
  } else if (isGhost) {
    backgroundColor = 'transparent';
  } else {
    backgroundColor = defaultBackgroundColor;
  }

  const inputStyle = {
    color: textColor,
    backgroundColor: backgroundColor,
    borderColor: error ? errorColor : borderColor,
    borderWidth: isGhost || isDarkGhost ? 0 : 1,
  };

  return { textColor, placeholderColor, errorColor, inputStyle };
}

interface InputProps extends TextInputProps, BaseInputProps {
  type?: 'text' | 'email' | 'password';
  showPasswordToggle?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  variant = 'default',
  type = 'text',
  showPasswordToggle = false,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const { textColor, placeholderColor, errorColor, inputStyle } = useInputStyles(variant, error);

  const keyboardType = type === 'email' ? 'email-address' : 'default';
  const secureTextEntry = type === 'password' && !showPassword;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          key={`${type}-${showPassword}`}
          style={[styles.input, inputStyle, style]}
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
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={8}
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
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}
    </View>
  );
};

interface TextAreaProps extends TextInputProps, BaseInputProps {
  minRows?: number;
  maxRows?: number;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  variant = 'default',
  minRows = 3,
  maxRows,
  style,
  ...props
}) => {
  const { textColor, placeholderColor, errorColor, inputStyle } = useInputStyles(variant, error);

  const minHeight = minRows * 24;
  const maxHeight = maxRows ? maxRows * 24 : undefined;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      <TextInput
        style={[
          styles.textArea,
          inputStyle,
          { minHeight, maxHeight },
          style,
        ]}
        placeholderTextColor={placeholderColor}
        multiline
        textAlignVertical="top"
        scrollEnabled={!!maxRows}
        {...props}
      />
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
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
  textArea: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    top: 13,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});
