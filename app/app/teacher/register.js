// Teacher Register Screen
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
import { useTeacher } from '../../src/contexts/TeacherContext';
import { ArrowLeft } from 'lucide-react-native';

export default function TeacherRegisterScreen() {
  const { register } = useTeacher();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    subject: '',
    school: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.username || !formData.password || !formData.name) {
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
      name: formData.name,
      email: formData.email,
      subject: formData.subject || 'Mathematics',
      school: formData.school,
    });

    setIsLoading(false);

    if (!result.success) {
      setError(result.error || 'Registration failed');
    } else {
      router.replace('/teacher/login');
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <LinearGradient colors={['#059669', '#047857']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.emoji}>📚</Text>
          <Text style={styles.title}>Teacher Registration</Text>
          <Text style={styles.subtitle}>Create your teacher account</Text>

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
              placeholder="Full Name *"
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
              placeholder="Subject (e.g., Mathematics)"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={formData.subject}
              onChangeText={(v) => updateField('subject', v)}
            />

            <TextInput
              style={styles.input}
              placeholder="School Name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={formData.school}
              onChangeText={(v) => updateField('school', v)}
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
              <LinearGradient colors={['#10B981', '#059669']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Please wait...' : 'Register'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/teacher/login')}>
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
  scrollContent: { flexGrow: 1, padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { position: 'absolute', top: 50, left: 20, padding: 8, zIndex: 10 },
  emoji: { fontSize: 48, marginBottom: 12, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24, textAlign: 'center' },
  form: { width: '100%', maxWidth: 400, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, alignSelf: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 12, color: '#FFF', fontSize: 15, marginBottom: 12 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.2)', borderRadius: 10, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.4)' },
  errorText: { color: '#FCA5A5', textAlign: 'center', fontSize: 13 },
  button: { borderRadius: 10, overflow: 'hidden', marginTop: 8 },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { padding: 14, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  toggleText: { color: '#A7F3D0', marginTop: 20, textAlign: 'center', fontSize: 14 },
});
