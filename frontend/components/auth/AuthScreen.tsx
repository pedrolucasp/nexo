import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { useThemeColor } from '@/hooks/use-theme-color';

interface AuthScreenProps {
  title?: string;
  subtitle?: string;
  titleTestID?: string;
  // Sits above the title — login puts its animated logo here.
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

// The one layout every auth screen shares. Top-aligned on purpose: a form whose
// error rows grow must not re-center (and scroll) the whole screen when it does.
export function AuthScreen({
  title,
  subtitle,
  titleTestID,
  header,
  footer,
  children,
  contentContainerStyle,
}: AuthScreenProps) {
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView behavior="height" style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={[styles.scrollContainer, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {header}

          {(title || subtitle) && (
            <View style={styles.header}>
              {title && (
                <Text testID={titleTestID} style={[styles.title, { color: textColor }]}>
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text style={[styles.subtitle, { color: textColor, opacity: 0.7 }]}>
                  {subtitle}
                </Text>
              )}
            </View>
          )}

          {children}

          {footer && <View style={styles.footer}>{footer}</View>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
});
