import 'react-native-gesture-handler';

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CircleProvider } from '../src/context/CircleProvider';
import { ProfileProvider } from '../src/context/ProfileProvider';
import { ThemeProvider } from '../src/context/ThemeProvider';

function useRegisterServiceWorker() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ponytail: SW opsional — app tetap jalan tanpa offline shell
    });
    // ambil update SW saat app dibuka dari Home Screen
    navigator.serviceWorker.ready.then((reg) => {
      void reg.update();
    });
    const onControllerChange = () => {
      // SW baru aktif — reload sekali biar bundle terbaru
      if (sessionStorage.getItem('innerly-sw-reloaded')) {
        return;
      }
      sessionStorage.setItem('innerly-sw-reloaded', '1');
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);
}

export default function RootLayout() {
  useRegisterServiceWorker();

  const [loaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // web: jangan blank selamanya kalau font gagal (path/CDN)
  if (!loaded && !fontError && Platform.OS !== 'web') {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ProfileProvider>
          <CircleProvider>
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="home" />
              <Stack.Screen name="circle-chat" />
              <Stack.Screen name="wish-detail" />
            </Stack>
          </CircleProvider>
        </ProfileProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
