import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { Text } from '@/components/ui/Text';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { apiClient, ApiError } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { translateError } from '@/lib/errors/translations';
import { Colors } from '@/constants/theme';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  onUploadSuccess?: () => void;
  onRemoveSuccess?: () => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar = null,
  onUploadSuccess,
  onRemoveSuccess,
}) => {
  const [preview, setPreview] = useState<string | null>(currentAvatar);
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleImagePick = async (useCamera: boolean = false): Promise<void> => {
    try {
      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setPreview(asset.uri);
        await uploadAvatar(asset.fileName, asset.uri, asset.mimeType);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showToast('Falha ao selecionar imagem', 'error');
    }
  };

  const uploadAvatar = async (fileName: string, imageUri: string, mimeType: string): Promise<void> => {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: mimeType,
        name: fileName,
      } as any);

      const response = await apiClient.avatar(formData);

      onUploadSuccess?.(response.user);
    } catch (error) {
      console.error('Upload error:', error);
      showToast(
        error instanceof ApiError ? translateError(error.message) : 'Falha ao enviar foto',
        'error',
      );
      setPreview(currentAvatar);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = (): void => {
    Alert.alert('Remover sua foto', 'Tem certeza que quer remover sua foto de perfil?', [
      {
        text: 'Cancelar',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Remover',
        onPress: async () => {
          setIsLoading(true);

          try {
            const response = await apiClient.removeAvatar();

            setPreview(null);
            onRemoveSuccess?.(response.user);
          } catch (error) {
            console.error('Remove error:', error);
            showToast(
              error instanceof ApiError ? translateError(error.message) : 'Falha ao remover foto',
              'error',
            );
          } finally {
            setIsLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handlePressIn = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (): void => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const showImageOptions = (): void => {
    Alert.alert('Selecionar uma foto de perfil', 'Escolha de onde você quer:', [
      {
        text: 'Câmera',
        onPress: () => handleImagePick(true),
      },
      {
        text: 'Galeria',
        onPress: () => handleImagePick(false),
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        {preview ? (
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: preview }} style={styles.avatarImage} />
            {isLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.avatarPlaceholder}
            onPress={showImageOptions}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Ionicons name="cloud-upload-outline" size={32} color="#666" />
            <Text style={styles.placeholderText}>Adicione uma foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.avatarActions}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={showImageOptions}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.editBtnText}>ALTERAR FOTO</Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        {preview && (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.removeBtn]}
              onPress={handleRemove}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.removeBtnText}>REMOVER FOTO</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 32,
    paddingVertical: 32,
  },
  avatarSection: {
    position: 'relative',
    width: 160,
    height: 160,
  },
  avatarWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#d0d0d0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  avatarActions: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    maxWidth: 320,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 140,
  },
  editBtn: {
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  removeBtn: {
  },
  removeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.danger,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default AvatarUpload;
