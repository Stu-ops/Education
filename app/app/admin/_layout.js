import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="colleges" />
      <Stack.Screen name="users" />
      <Stack.Screen name="teachers" />
      <Stack.Screen name="videos" />
      <Stack.Screen name="audit-log" />
      <Stack.Screen name="config" />
    </Stack>
  );
}
