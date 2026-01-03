export default {
  expo: {
    name: "Math GPT",
    slug: "math-gpt",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    scheme: "mathgpt",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#2563EB"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.mathgpt.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#2563EB"
      },
      package: "com.mathgpt.app"
    },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro"
    },
    plugins: [
      "expo-router"
    ],
    extra: {
      // Change this to your backend server IP
      apiUrl: "http://192.168.31.120:8000"
    }
  }
};
