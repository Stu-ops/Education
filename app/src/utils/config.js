// App Configuration
// Set DEBUG_API to true to show alerts for every API call with response data

import { Alert } from 'react-native';

export const config = {
  // Set to true to enable API call alerts with response data
  DEBUG_API: true,
};

// Helper function to log API calls
export const apiLogger = (endpoint, method, response, error = null) => {
  if (!config.DEBUG_API) return;

  if (error) {
    Alert.alert(
      `❌ API Error: ${method}`,
      `Endpoint: ${endpoint}\n\nError: ${error.message || JSON.stringify(error)}`,
      [{ text: 'OK' }]
    );
  } else {
    const responseStr =
      typeof response === 'object'
        ? JSON.stringify(response, null, 2).substring(0, 500)
        : String(response);

    Alert.alert(
      `✅ API Success: ${method}`,
      `Endpoint: ${endpoint}\n\nResponse:\n${responseStr}${responseStr.length >= 500 ? '...(truncated)' : ''}`,
      [{ text: 'OK' }]
    );
  }
};
