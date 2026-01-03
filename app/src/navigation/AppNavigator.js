// Main App Navigator with authentication flow
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useUser } from '../contexts/UserContext';
import colors from '../styles/colors';

// Stacks
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import ParentStack from './ParentStack';
import TeacherStack from './TeacherStack';

// Student screens for teacher content
import FindTeachersScreen from '../screens/student/FindTeachersScreen';
import TeacherVideosScreen from '../screens/student/TeacherVideosScreen';
import VideoPlayerScreen from '../screens/student/VideoPlayerScreen';
import MyTeachersScreen from '../screens/student/MyTeachersScreen';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <LinearGradient
      colors={colors.gradients.main}
      style={styles.loadingContainer}
    >
      <ActivityIndicator size="large" color="#FFFFFF" />
    </LinearGradient>
  );
}

export default function AppNavigator() {
  const { user, loading } = useUser();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="FindTeachers" component={FindTeachersScreen} />
            <Stack.Screen name="TeacherVideos" component={TeacherVideosScreen} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayerScreen} />
            <Stack.Screen name="MyTeachers" component={MyTeachersScreen} />
          </>
        )}
        <Stack.Screen name="Parent" component={ParentStack} />
        <Stack.Screen name="Teacher" component={TeacherStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
