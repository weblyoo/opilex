export default {
  expo: {
    name: "Opilex",
    slug: "opilex-cables",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/opilex-splash-screen.jpg",
      resizeMode: "contain",
      backgroundColor: "#E30613"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.opilex.cables",
      icon: "./assets/icon.png",
      buildNumber: "1.0.0"
    },
    android: {
      icon: "./assets/icon.png",
      adaptiveIcon: {
        foregroundImage: "./assets/icon.png",
        backgroundColor: "#E30613",
        monochromeImage: "./assets/icon.png"
      },
      package: "com.opilex.cables",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      versionCode: 1
    },
    web: {
      favicon: "./assets/icon.png",
      bundler: "metro"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow Opilex app to access your camera to scan QR codes."
        }
      ]
    ],
    extra: {
      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "",
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "",
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "",
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
        androidApiKey: process.env.EXPO_PUBLIC_FIREBASE_ANDROID_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || ""
      },
      sandbox: {
        apiKey: process.env.EXPO_PUBLIC_SANDBOX_API_KEY || "",
        apiSecret: process.env.EXPO_PUBLIC_SANDBOX_API_SECRET || "",
        useMockKyc: process.env.EXPO_PUBLIC_USE_MOCK_KYC === "true"
      },
      eas: {
        projectId: "b5c11a5b-9371-4fb7-91b8-73fd20c9980d"
      }
    },
    assetBundlePatterns: [
      "**/*"
    ],
    updates: {
      fallbackToCacheTimeout: 0
    }
  }
};

