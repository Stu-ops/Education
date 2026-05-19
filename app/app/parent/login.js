import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView,
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
    if (!username || !password) { setError('Please fill all fields'); return; }
    setIsLoading(true);
    setError('');
    const result = await login(username, password);
    setIsLoading(false);
    if (!result.success) setError(result.message || 'Login failed');
    else router.replace('/parent/dashboard');
  };

  return (
    <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.emoji}>👨‍👩‍👧</Text>
            <Text style={styles.title}>Parent Portal</Text>
            <Text style={styles.subtitle}>Monitor your child's progress</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {error ? <View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View> : null}
              <TouchableOpacity style={[styles.btn, isLoading && styles.btnDisabled]} onPress={handleLogin} disabled={isLoading}>
                <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.btnGrad}>
                  <Text style={styles.btnText}>{isLoading ? 'Please wait...' : 'Login'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/parent/register')}>
              <Text style={styles.linkText}>New parent? Register here</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingTop: 16 },
  backBtn: { alignSelf: 'flex-start', padding: 8, marginBottom: 24, marginLeft: -4 },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 28 },
  form: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 20 },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 6, marginTop: 4, fontWeight: '600' },
  input: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 15, marginBottom: 14 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.25)', borderRadius: 10, padding: 12, marginBottom: 14 },
  errorText: { color: '#FCA5A5', textAlign: 'center', fontSize: 13 },
  btn: { borderRadius: 12, overflow: 'hidden', marginTop: 4 },
  btnDisabled: { opacity: 0.7 },
  btnGrad: { padding: 14, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  linkRow: { alignItems: 'center', marginTop: 24 },
  linkText: { color: '#E9D5FF', fontSize: 14 },
});
