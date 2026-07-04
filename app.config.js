/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'innerly',
  slug: 'instaintrov',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  scheme: 'instaintrov',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.instaintrov.app',
  },
  android: {
    package: 'com.instaintrov.app',
    adaptiveIcon: {
      backgroundColor: '#0f0f0f',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
    output: 'static',
    name: 'innerly',
    shortName: 'innerly',
    lang: 'id',
    scope: '/',
    themeColor: '#5924CA',
    backgroundColor: '#F5F3F1',
    display: 'standalone',
    startUrl: '/',
    orientation: 'portrait',
  },
  plugins: [
    'expo-router',
    'expo-font',
    [
      'expo-image-picker',
      {
        photosPermission: 'Izinkan akses foto untuk mengirim gambar di chat circle.',
        cameraPermission: 'Izinkan akses kamera untuk foto circle feed.',
      },
    ],
  ],
  extra: {
    isDevPreview: true,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
    },
    eas: {
      projectId: '0458115e-7a30-46a8-9d30-f36aed8656e9',
    },
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    enabled: true,
    checkAutomatically: 'ON_LOAD',
    fallbackToCacheTimeout: 0,
    url: 'https://u.expo.dev/0458115e-7a30-46a8-9d30-f36aed8656e9',
  },
};
