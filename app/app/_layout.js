// Root layout with providers
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../src/contexts/UserContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { HistoryProvider } from '../src/contexts/HistoryContext';
import { ParentProvider } from '../src/contexts/ParentContext';
import { TeacherProvider } from '../src/contexts/TeacherContext';

export default function RootLayout() {
  return (
    <UserProvider>
      <LanguageProvider>
        <HistoryProvider>
          <ParentProvider>
            <TeacherProvider>
              <StatusBar style="light" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="login" />
                <Stack.Screen name="parent" />
                <Stack.Screen name="teacher" />
              </Stack>
            </TeacherProvider>
          </ParentProvider>
        </HistoryProvider>
      </LanguageProvider>
    </UserProvider>
  );
}
