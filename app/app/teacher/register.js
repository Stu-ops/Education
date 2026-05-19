import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTeacher } from '../../src/contexts/TeacherContext';
import { ArrowLeft } from 'lucide-react-native';

export default function TeacherRegisterScreen() {
  const { register } = useTeacher();
  const [formData, setFormData] = useState({
    username: '', password: '', confirmPassword: '',
    name: '', email: '', subject: '', school: '', invite_code: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!formData.username || !formData.password || !formData.name) {
      setError('Username, full name and password are required');
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
      ...(formData.invite_code ? { invite_code: formData.invite_code } : {}),
    });
    setIsLoading(false);
    if (!result.success) setError(result.error || 'Registration failed');
    else router.replace('/teacher/login');
  };

  return (
    <LinearGradient colors={['#059669', '#047857']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.emoji}>📚</Text>
            <Text style={styles.title}>Teacher Registration</Text>
            <Text style={styles.subtitle}>Create your teacher account</Text>

            <View style={styles.form}>
              <Text style={styles.sectionLabel}>Account Details</Text>
              <TextInput style={styles.input} placeholder="Username *" placeholderTextColor="rgba(255,255,255,0.45)"
                value={formData.username} onChangeText={v => set('username', v)} autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Full Name *" placeholderTextColor="rgba(255,255,255,0.45)"
                value={formData.name} onChangeText={v => set('name', v)} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor="rgba(255,255,255,0.45)"
                value={formData.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" />
              <TextInput style={styles.input} placeholder="Subject (e.g. Mathematics)" placeholderTextColor="rgba(255,255,255,0.45)"
                value={formData.subject} onChangeText={v => set('subject', v)} />
              <TextInput style={styles.input} placeholder="School Name" placeholderTextColor="rgba(255,255,255,0.45)"
                value={formData.school} onChangeText={v => set('school', v)} />

              <Text style={styles.sectionLabel}>College (optional)</Text>
              <TextInput style={styles.input} placeholder="Invite Code (8 characters)" placeholderTextColor="rgba(255,255,255,0.45)"
                value={formData.invite_code} onChangeText={v => set('invite_code', v.toUpperCase())}
                autoCapitalize="characters" maxLength={8} />
              <Text style={styles.hint}>Get this code from your principal to link to a college</Text>

              <Text style={styles.sectionLabel}>Password</Text>
              <TextInput style={styles.input} placeholder="Password *" placeholderTextColor="rgba(255,255,255,0.45)"
                value={formData.password} onChangeText={v => set('password', v)} secureTextEntry />
              <TextInput style={styles.input} placeholder="Confirm Password *" placeholderTextColor="rgba(255,255,255,0.45)"
                value={formData.confirmPassword} onChangeText={v => set('confirmPassword', v)} secureTextEntry />

              {error ? <View style={styles.errorBox}><Text style={styles.errorText}>⚠️ {error}</Text></View> : null}

              <TouchableOpacity style={[styles.btn, isLoading && styles.btnDisabled]} onPress={handleRegister} disabled={isLoading}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.btnGrad}>
                  <Text style={styles.btnText}>{isLoading ? 'Please wait...' : 'Register'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/teacher/login')}>
              <Text style={styles.linkText}>Already have an account? Login</Text>
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
  scroll: { flexGrow: 1, padding: 24, paddingTop: 16, paddingBottom: 40 },
  backBtn: { alignSelf: 'flex-start', padding: 8, marginBottom: 20, marginLeft: -4 },
  emoji: { fontSize: 48, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 24 },
  form: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 20 },
  sectionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1, marginBottom: 10, marginTop: 6, textTransform: 'uppercase' },
  input: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12, padding: 13, color: '#FFF', fontSize: 15, marginBottom: 12 },
  hint: { fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: -8, marginBottom: 12, paddingLeft: 2 },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.25)', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: '#FCA5A5', textAlign: 'center', fontSize: 13 },
  btn: { borderRadius: 12, overflow: 'hidden', marginTop: 6 },
  btnDisabled: { opacity: 0.7 },
  btnGrad: { padding: 14, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  linkRow: { alignItems: 'center', marginTop: 22 },
  linkText: { color: '#A7F3D0', fontSize: 14 },
});
