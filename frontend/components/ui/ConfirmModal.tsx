import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import {
  BorderRadius,
  Colors,
  Spacing,
  Shadows,
  Typography,
} from '@/constants/theme';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  message,
  detail,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
  testID = 'confirm-modal',
}) => {
  const dismiss = () => {
    if (!loading) {
      onCancel();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={dismiss}
          testID={`${testID}-overlay`}
        />

        <View style={styles.cardContainer} pointerEvents="box-none">
          <Pressable
            style={styles.card}
            accessibilityViewIsModal
            testID={testID}
          >
            <Text style={styles.title}>{title}</Text>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            {detail ? (
              <View style={styles.detail}>
                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ) : null}

            <View style={styles.footer}>
              <Button
                title={cancelLabel}
                variant="ghost"
                style={styles.footerButton}
                disabled={loading}
                onPress={onCancel}
                testID={`${testID}-cancel`}
              />
              <Button
                title={confirmLabel}
                variant={destructive ? 'danger' : 'primary'}
                style={styles.footerButton}
                loading={loading}
                onPress={onConfirm}
                testID={`${testID}-confirm`}
              />
            </View>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const OVERLAY_BACKGROUND = 'rgba(15, 23, 42, 0.55)';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: OVERLAY_BACKGROUND,
  },
  cardContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.containerPadding * 1.5,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.light.cardBorder,
    padding: Spacing.containerPadding + 4,
    ...Shadows.md,
  },
  title: {
    ...Typography.headlineMd,
    color: Colors.light.text,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodyMd,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.inlineGapSm,
  },
  detail: {
    marginTop: Spacing.cardGap,
    backgroundColor: Colors.light.accentBlue,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.inlineGapSm,
    paddingHorizontal: Spacing.cardGap,
  },
  detailText: {
    ...Typography.bodyLg,
    color: Colors.light.text,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.cardGap,
    marginTop: Spacing.containerPadding,
  },
  footerButton: {
    flex: 1,
  },
});
