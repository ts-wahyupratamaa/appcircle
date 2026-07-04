import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';

const TAP_WINDOW_MS = 320;

const GALLERY_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  quality: 0.85,
  aspect: [3, 4],
};

const CAMERA_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: false,
  quality: 0.85,
  cameraType: ImagePicker.CameraType.front,
};

type Options = {
  onPick: (uri: string) => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

export function useTapPhotoPicker({ onPick, disabled, loading }: Options) {
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    return () => {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
    };
  }, []);

  const openCamera = useCallback(async () => {
    if (disabled || loading || busy.current) {
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Akses kamera', 'Izinkan akses kamera dulu ya.');
      return;
    }
    busy.current = true;
    try {
      const result = await ImagePicker.launchCameraAsync(CAMERA_OPTIONS);
      if (!result.canceled && result.assets[0]?.uri) {
        await onPick(result.assets[0].uri);
      }
    } finally {
      busy.current = false;
    }
  }, [disabled, loading, onPick]);

  const openGallery = useCallback(async () => {
    if (disabled || loading || busy.current) {
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Akses galeri', 'Izinkan akses foto dulu ya.');
      return;
    }
    busy.current = true;
    try {
      const result = await ImagePicker.launchImageLibraryAsync(GALLERY_OPTIONS);
      if (!result.canceled && result.assets[0]?.uri) {
        await onPick(result.assets[0].uri);
      }
    } finally {
      busy.current = false;
    }
  }, [disabled, loading, onPick]);

  const onPress = useCallback(() => {
    if (disabled || loading || busy.current) {
      return;
    }

    tapCount.current += 1;
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
    }

    tapTimer.current = setTimeout(() => {
      const count = tapCount.current;
      tapCount.current = 0;
      tapTimer.current = null;

      if (count >= 3) {
        void openGallery();
      } else if (count === 2) {
        void openCamera();
      }
    }, TAP_WINDOW_MS);
  }, [disabled, loading, openCamera, openGallery]);

  return { onPress };
}
