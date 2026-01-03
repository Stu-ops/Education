// Teacher Stack Navigator
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TeacherLoginScreen from '../screens/teacher/TeacherLoginScreen';
import TeacherRegisterScreen from '../screens/teacher/TeacherRegisterScreen';
import TeacherDashboardScreen from '../screens/teacher/TeacherDashboardScreen';
import TeacherUploadScreen from '../screens/teacher/TeacherUploadScreen';
import { TeacherProvider, useTeacher } from '../contexts/TeacherContext';
import { ActivityIndicator, StyleSheet } from 'react-native';
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

function TeacherNavigator() {
  const { teacher, loading } = useTeacher();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!teacher ? (
        <>
          <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />
          <Stack.Screen name="TeacherRegister" component={TeacherRegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
          <Stack.Screen name="TeacherUpload" component={TeacherUploadScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function TeacherStack() {
  return (
    <TeacherProvider>
      <TeacherNavigator />
    </TeacherProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
