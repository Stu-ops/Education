// Student Layout
import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="find-teachers" />
      <Stack.Screen name="my-teachers" />
      <Stack.Screen name="teacher-videos" />
      <Stack.Screen name="video-player" />
    </Stack>
  );
}
