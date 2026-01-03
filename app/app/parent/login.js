// Parent Login Screen
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useParent } from '../../src/contexts/ParentContext';
import { ArrowLeft } from 'lucide-react-native';

export default function ParentLoginScreen() {
  const { login } = useParent();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await login(username, password);
    setIsLoading(false);

    if (!result.success) {
      setError(result.message || 'Login failed');
    } else {
      router.replace('/parent/dashboard');
    }
  };

  return (
    <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.emoji}>👨‍👩‍👧</Text>
          <Text style={styles.title}>Parent Portal</Text>
          <Text style={styles.subtitle}>Monitor your child's progress</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Please wait...' : 'Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/parent/register')}>
            <Text style={styles.toggleText}>New parent? Register here</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, alignItems: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, padding: 8 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32 },
  form: { width: '100%', maxWidth: 400, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 24 },
  input: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 16, marginBottom: 16 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: '#F87171', textAlign: 'center' },
  button: { borderRadius: 12, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { padding: 14, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  toggleText: { color: '#E9D5FF', marginTop: 24 },
});
