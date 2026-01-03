// Login Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Users, GraduationCap } from 'lucide-react-native';
import { useUser } from '../src/contexts/UserContext';

export default function LoginScreen() {
  const { login, signup } = useUser();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);

  const handleSubmit = async () => {
    if (!username || !password || (isSignup && !classLevel)) {
      setError('Please fill all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    let result;
    if (isSignup) {
      result = await signup(username, password, classLevel);
    } else {
      result = await login(username, password);
    }

    setIsLoading(false);

    if (!result.success) {
      setError(result.message || 'Something went wrong');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const classOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Portal Links at Top */}
          <View style={styles.portalRow}>
            <TouchableOpacity style={styles.portalLink} onPress={() => router.push('/parent/login')}>
              <LinearGradient colors={['#7C3AED', '#A855F7']} style={styles.portalLinkGradient}>
                <Users size={16} color="#FFF" />
                <Text style={styles.portalLinkText}>Parent</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.portalLink} onPress={() => router.push('/teacher/login')}>
              <LinearGradient colors={['#059669', '#10B981']} style={styles.portalLinkGradient}>
                <GraduationCap size={16} color="#FFF" />
                <Text style={styles.portalLinkText}>Teacher</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.emoji}>{isSignup ? '🎓' : '👋'}</Text>
          <Text style={styles.title}>
            {isSignup ? 'Join Math GPT!' : 'Welcome Back!'}
          </Text>
          <Text style={styles.subtitle}>
            {isSignup ? 'Start your math journey' : 'Continue learning'}
          </Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {isSignup && (
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowClassPicker(true)}
              >
                <Text style={classLevel ? styles.inputText : styles.placeholder}>
                  {classLevel ? `Class ${classLevel}` : 'Select class'}
                </Text>
              </TouchableOpacity>
            )}

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
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => { setIsSignup(!isSignup); setError(''); }}>
            <Text style={styles.toggleText}>
              {isSignup ? 'Already have an account? Login' : "New user? Sign up"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showClassPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Class</Text>
            <ScrollView>
              {classOptions.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={styles.modalItem}
                  onPress={() => { setClassLevel(c); setShowClassPicker(false); }}
                >
                  <Text style={styles.modalItemText}>Class {c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowClassPicker(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, alignItems: 'center' },
  portalRow: { flexDirection: 'row', gap: 10, marginBottom: 24, width: '100%', maxWidth: 400 },
  portalLink: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  portalLinkGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
  portalLinkText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 32 },
  form: { width: '100%', maxWidth: 400, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 24 },
  input: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 14, color: '#FFF', fontSize: 16, marginBottom: 16, justifyContent: 'center' },
  inputText: { color: '#FFF', fontSize: 16 },
  placeholder: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { color: '#F87171', textAlign: 'center' },
  button: { borderRadius: 12, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { padding: 14, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  toggleText: { color: '#67E8F9', marginTop: 24 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#1E1B4B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 16 },
  modalItem: { padding: 14, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 8 },
  modalItemText: { color: '#FFF', fontSize: 16, textAlign: 'center' },
  modalCancel: { color: '#67E8F9', textAlign: 'center', marginTop: 16, fontSize: 16 },
});
