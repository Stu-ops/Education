// Parent Stack Navigator
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ParentLoginScreen from '../screens/parent/ParentLoginScreen';
import ParentRegisterScreen from '../screens/parent/ParentRegisterScreen';
import ParentDashboardScreen from '../screens/parent/ParentDashboardScreen';
import ParentProfileScreen from '../screens/parent/ParentProfileScreen';
import { ParentProvider, useParent } from '../contexts/ParentContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../styles/colors';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <LinearGradient colors={colors.gradients.main} style={styles.loading}>
      <ActivityIndicator size="large" color="#FFFFFF" />
    </LinearGradient>
  );
}

function ParentNavigator() {
  const { parent, loading } = useParent();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!parent ? (
        <>
          <Stack.Screen name="ParentLogin" component={ParentLoginScreen} />
          <Stack.Screen name="ParentRegister" component={ParentRegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} />
          <Stack.Screen name="ParentProfile" component={ParentProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function ParentStack() {
  return (
    <ParentProvider>
      <ParentNavigator />
    </ParentProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
