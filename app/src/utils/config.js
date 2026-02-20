// App Configuration
// Control API alerts with env var:
// EXPO_PUBLIC_API_LOGGER=false (preferred) or extra.API_LOGGER in app.config.js

import { Alert } from 'react-native';
import Constants from 'expo-constants';

const parseBool = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === 'boolean') return value;
  const v = String(value).trim().toLowerCase();
  return !(v === 'false' || v === '0' || v === 'off' || v === 'no');
};

const envFlag =
  process.env.EXPO_PUBLIC_API_LOGGER ??
  Constants.expoConfig?.extra?.API_LOGGER ??
  Constants.manifest?.extra?.API_LOGGER ??
  Constants.expoConfig?.extra?.apiLogger;

export const config = {
  // Set to false to disable API call alerts
  DEBUG_API: parseBool(envFlag, false),
};

// Helper function to log API calls
export const apiLogger = (endpoint, method, response, error = null) => {
  if (!config.DEBUG_API) return;

  if (error) {
    Alert.alert(
      `API Error: ${method}`,
      `Endpoint: ${endpoint}\n\nError: ${error.message || JSON.stringify(error)}`,
      [{ text: 'OK' }]
    );
  } else {
    const responseStr =
      typeof response === 'object'
        ? JSON.stringify(response, null, 2).substring(0, 500)
        : String(response);

    Alert.alert(
      `API Success: ${method}`,
      `Endpoint: ${endpoint}\n\nResponse:\n${responseStr}${responseStr.length >= 500 ? '...(truncated)' : ''}`,
      [{ text: 'OK' }]
    );
  }
};
