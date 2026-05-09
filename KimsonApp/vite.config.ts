import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Web build: use DOM-based Logo so we don't pull in react-native
      './Logo': './LogoWeb',
    },
  },
  build: {
    rollupOptions: {
      external: [
        // Exclude React Native packages from web build
        'react-native',
        /^react-native\/.*/,
        /^expo\/.*/,
        /^@react-navigation\/.*/,
        /^@react-native-async-storage\/.*/,
        /^react-native-gesture-handler/,
        /^react-native-reanimated/,
        /^react-native-safe-area-context/,
        /^react-native-screens/,
        /^react-native-svg/,
        /^react-native-worklets/,
        /^expo-blur/,
        /^expo-camera/,
        /^expo-constants/,
        /^expo-font/,
        /^expo-linear-gradient/,
        /^expo-notifications/,
        /^expo-splash-screen/,
        /^expo-status-bar/,
        /^@expo-google-fonts\/.*/,
      ],
    },
    commonjsOptions: {
      ignore: [
        // Ignore React Native packages
        'react-native',
        /^react-native\/.*/,
        /^expo\/.*/,
        /^@react-navigation\/.*/,
        /^@react-native-async-storage\/.*/,
        /^react-native-gesture-handler/,
        /^react-native-reanimated/,
        /^react-native-safe-area-context/,
        /^react-native-screens/,
        /^react-native-svg/,
        /^react-native-worklets/,
        /^expo-blur/,
        /^expo-camera/,
        /^expo-constants/,
        /^expo-font/,
        /^expo-linear-gradient/,
        /^expo-notifications/,
        /^expo-splash-screen/,
        /^expo-status-bar/,
        /^@expo-google-fonts\/.*/,
      ],
    },
  },
  optimizeDeps: {
    exclude: [
      // Exclude React Native packages from pre-bundling
      'react-native',
      /^react-native\/.*/,
      /^expo\/.*/,
      /^@react-navigation\/.*/,
      /^@react-native-async-storage\/.*/,
      /^react-native-gesture-handler/,
      /^react-native-reanimated/,
      /^react-native-safe-area-context/,
      /^react-native-screens/,
      /^react-native-svg/,
      /^react-native-worklets/,
      /^expo-blur/,
      /^expo-camera/,
      /^expo-constants/,
      /^expo-font/,
      /^expo-linear-gradient/,
      /^expo-notifications/,
      /^expo-splash-screen/,
      /^expo-status-bar/,
      /^@expo-google-fonts\/.*/,
    ],
  },
})
