// Parent Register Screen
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

export default function ParentRegisterScreen() {
  const { register } = useParent();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    student_username: '',
    name: '',
    email: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.username || !formData.password || !formData.student_username) {
      setError('Please fill required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await register({
      username: formData.username,
      password: formData.password,
      student_username: formData.student_username,
      name: formData.name || formData.username,
      email: formData.email,
    });

    setIsLoading(false);

    if (!result.success) {
      setError(result.message || 'Registration failed');
    } else {
      router.replace('/parent/login');
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

          <Text style={styles.emoji}>📝</Text>
          <Text style={styles.title}>Parent Registration</Text>
          <Text style={styles.subtitle}>Create your parent account</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username *"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={formData.username}
              onChangeText={(v) => updateField('username', v)}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={formData.name}
              onChangeText={(v) => updateField('name', v)}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={formData.email}
              onChangeText={(v) => updateField('email', v)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Child's Username *"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={formData.student_username}
              onChangeText={(v) => updateField('student_username', v)}
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password *"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={formData.password}
              onChangeText={(v) => updateField('password', v)}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={formData.confirmPassword}
              onChangeText={(v) => updateField('confirmPassword', v)}
              secureTextEntry
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Please wait...' : 'Register'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/parent/login')}>
            <Text style={styles.toggleText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, alignItems: 'center', paddingTop: 80 },
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
