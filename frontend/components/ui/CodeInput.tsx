import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Text } from '@/components/ui/Text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BorderRadius, Spacing } from '@/constants/theme';

export interface CodeInputHandle {
  focus: () => void;
}

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  editable?: boolean;
  testIdPrefix?: string;
  accessibilityLabel?: string;
  onComplete?: (value: string) => void;
}

// A single hidden TextInput backs the six boxes: it keeps paste and the
// platform one-time-code autofill working, and exposes the code as one
// accessible control instead of six unrelated fields.
export const CodeInput = forwardRef<CodeInputHandle, CodeInputProps>(
  (
    {
      value,
      onChange,
      length = 6,
      error,
      editable = true,
      testIdPrefix = 'code-input',
      accessibilityLabel,
      onComplete,
    },
    ref,
  ) => {
    const inputRef = useRef<TextInput>(null);
    const [focused, setFocused] = useState(false);
    const [caret, setCaret] = useState(0);

    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'inputBackgroundColor');
    const borderColor = useThemeColor({}, 'inputBorderColor');
    const focusBorderColor = useThemeColor({}, 'inputFocusBorderColor');
    const errorColor = useThemeColor({}, 'danger');

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
    }));

    const digits = Array.from({ length }, (_, index) => value[index] ?? '');
    const cursor = Math.min(caret, value.length);
    const activeIndex = focused && cursor < length ? cursor : -1;

    const handleChangeText = (text: string) => {
      const sanitized = text.replace(/\D/g, '').slice(0, length);

      if (sanitized === value) return;

      onChange(sanitized);
      setCaret(sanitized.length);

      if (sanitized.length === length) {
        onComplete?.(sanitized);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.boxes}>
          {digits.map((digit, index) => {
            const isActive = index === activeIndex;
            const boxBorderColor = error
              ? errorColor
              : isActive
                ? focusBorderColor
                : borderColor;

            return (
              <View
                key={index}
                accessible={false}
                testID={`${testIdPrefix}-box-${index}`}
                style={[
                  styles.box,
                  {
                    backgroundColor,
                    borderColor: boxBorderColor,
                    borderWidth: isActive || error ? 2 : 1,
                  },
                ]}
              >
                <Text style={[styles.digit, { color: textColor }]}>{digit}</Text>
              </View>
            );
          })}

          <TextInput
            ref={inputRef}
            testID={`${testIdPrefix}-input`}
            value={value}
            onChangeText={handleChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSelectionChange={(event) =>
              setCaret(event.nativeEvent.selection.end)
            }
            keyboardType="number-pad"
            inputMode="numeric"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            editable={editable}
            caretHidden
            accessibilityLabel={accessibilityLabel}
            style={styles.hiddenInput}
          />
        </View>

        {error ? (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.errorText, { color: errorColor }]}
          >
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);

CodeInput.displayName = 'CodeInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  boxes: {
    flexDirection: 'row',
    gap: Spacing.inlineGapSm,
    height: 48,
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  digit: {
    fontSize: 24,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.01,
    color: 'transparent',
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
});
