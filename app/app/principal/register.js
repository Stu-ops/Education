import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react-native';
import { usePrincipal } from '../../src/contexts/PrincipalContext';

export default function PrincipalRegisterScreen() {
  const { register } = usePrincipal();
  const [form, setForm] = useState({
    username: '', password: '', confirmPassword: '',
    name: '', email: '', phone: '',
    collegeName: '', collegeAddress: '', collegePhone: '', collegeEmail: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.collegeName) {
      setError('Username, password and college name are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register({
      username: form.username, password: form.password,
      name: form.name, email: form.email, phone: form.phone,
      college: {
        name: form.collegeName, address: form.collegeAddress,
        phone: form.collegePhone, email: form.collegeEmail,
      },
    });
    setLoading(false);
    if (!result.success) setError(result.error || 'Registration failed');
    else setInviteCode(result.invite_code);
  };

  const copyCode = () => {
    // Use React Native's built-in clipboard
    const { Clipboard } = require('react-native');
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(inviteCode);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <LinearGradient colors={['#4F46E5', '#3730A3']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={22} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.emoji}>📋</Text>
            <Text style={styles.title}>Register College</Text>
            <Text style={styles.subtitle}>Set up your institution</Text>

            <View style={styles.form}>
              <Text style={styles.sectionLabel}>College Details</Text>
              <TextInput
                style={styles.input} placeholder="College Name *"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.collegeName} onChangeText={v => set('collegeName', v)}
              />
              <TextInput
                style={styles.input} placeholder="Address"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.collegeAddress} onChangeText={v => set('collegeAddress', v)}
              />
              <TextInput
                style={styles.input} placeholder="College Phone"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.collegePhone} onChangeText={v => set('collegePhone', v)}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input} placeholder="College Email"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.collegeEmail} onChangeText={v => set('collegeEmail', v)}
                keyboardType="email-address" autoCapitalize="none"
              />

              <Text style={styles.sectionLabel}>Your Account</Text>
              <TextInput
                style={styles.input} placeholder="Username *"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.username} onChangeText={v => set('username', v)}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input} placeholder="Full Name"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.name} onChangeText={v => set('name', v)}
              />
              <TextInput
                style={styles.input} placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.email} onChangeText={v => set('email', v)}
                keyboardType="email-address" autoCapitalize="none"
              />
              <TextInput
                style={styles.input} placeholder="Phone"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.phone} onChangeText={v => set('phone', v)}
                keyboardType="phone-pad"
              />

              <Text style={styles.sectionLabel}>Password</Text>
              <TextInput
                style={styles.input} placeholder="Password *"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.password} onChangeText={v => set('password', v)}
                secureTextEntry
              />
              <TextInput
                style={styles.input} placeholder="Confirm Password *"
                placeholderTextColor="rgba(255,255,255,0.45)"
                value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)}
                secureTextEntry
              />

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.btn, loading && styles.btnDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.btnGrad}>
                  <Text style={styles.btnText}>{loading ? 'Registering...' : 'Register College'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.linkRow} onPress={() => router.push('/principal/login')}>
              <Text style={styles.linkText}>Already registered? Login</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal visible={!!inviteCode} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <CheckCircle size={48} color="#4F46E5" />
            <Text style={styles.modalTitle}>College Registered!</Text>
            <Text style={styles.modalSub}>Share this invite code with your teachers</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{inviteCode}</Text>
              <TouchableOpacity onPress={copyCode} style={styles.copyBtn}>
                {copied
                  ? <CheckCircle size={22} color="#4F46E5" />
                  : <Copy size={22} color="#4F46E5" />}
              </TouchableOpacity>
            </View>
            <Text style={styles.codeNote}>
              Teachers enter this code when registering to join your college.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => router.replace('/principal/dashboard')}
            >
              <LinearGradient colors={['#6366F1', '#4F46E5']} style={styles.btnGrad}>
                <Text style={styles.btnText}>Go to Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  sectionLabel: {
    fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700',
    letterSpacing: 1, marginBottom: 10, marginTop: 6, textTransform: 'uppercase',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 12,
    padding: 13, color: '#FFF', fontSize: 15, marginBottom: 12,
  },
  errorBox: { backgroundColor: 'rgba(239,68,68,0.25)', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: '#FCA5A5', textAlign: 'center', fontSize: 13 },
  btn: { borderRadius: 12, overflow: 'hidden', marginTop: 6 },
  btnDisabled: { opacity: 0.7 },
  btnGrad: { padding: 14, alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  linkRow: { alignItems: 'center', marginTop: 22 },
  linkText: { color: '#C7D2FE', fontSize: 14 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 28,
    alignItems: 'center', width: '100%', maxWidth: 360, gap: 10,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1E1B4B' },
  modalSub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  codeBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF',
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 14, gap: 14,
  },
  codeText: { fontSize: 28, fontWeight: 'bold', color: '#4F46E5', letterSpacing: 4 },
  copyBtn: { padding: 4 },
  codeNote: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  modalBtn: { borderRadius: 12, overflow: 'hidden', width: '100%', marginTop: 4 },
});
