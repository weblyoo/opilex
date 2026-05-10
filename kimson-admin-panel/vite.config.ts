import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// String-only patterns to avoid esbuild "str.replace is not a function" (RegExp not supported in some paths)
const reactNativeExternals = [
  'react-native',
  'react-native-gesture-handler',
  'react-native-reanimated',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-svg',
  'react-native-worklets',
  'expo',
  'expo-blur',
  'expo-camera',
  'expo-constants',
  'expo-font',
  'expo-linear-gradient',
  'expo-notifications',
  'expo-splash-screen',
  'expo-status-bar',
  '@react-navigation/native',
  '@react-navigation/stack',
  '@react-native-async-storage/async-storage',
  '@expo-google-fonts/ubuntu',
]

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: '/', // Netlify and dev: serve at root
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      // Removed externals that might be causing resolution issues
    },
  },
  optimizeDeps: {
    // Removed excludes that might be causing resolution issues
  },
}))
