import { Stack } from 'expo-router';

export default function PrincipalLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="teachers" />
      <Stack.Screen name="teacher-detail" />
      <Stack.Screen name="students" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}
