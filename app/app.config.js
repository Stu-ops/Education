export default {
  expo: {
    name: "Masterly",
    slug: "masterly",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "masterly",
    primaryColor: "#F97316",

    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#FAF2EF"
    },

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.masterly.app",
      backgroundColor: "#FAF2EF"
    },

    android: {
      label: "Masterly",             
      package: "com.masterly.app",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#21273A"
      }
    },

    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },

    plugins: ["expo-router"],

    extra: {
      apiUrl: "http://192.168.1.7:8000",
      API_LOGGER: process.env.EXPO_PUBLIC_API_LOGGER ?? process.env.API_LOGGER ?? "false"
    }
  }
};
