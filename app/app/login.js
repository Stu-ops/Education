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
  Image,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import { useUser } from '../src/contexts/UserContext';
import colors from '../src/styles/colors';

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
    const result = isSignup
      ? await signup(username, password, classLevel)
      : await login(username, password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.message || 'Something went wrong');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const classOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <View style={styles.container}>
      <Image source={require('../assets/illustrations/symbols.png')} style={styles.bgTop} resizeMode="contain" />
      <Image source={require('../assets/illustrations/symbols.png')} style={styles.bgBottom} resizeMode="contain" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>{isSignup ? 'Join Masterly' : 'Login'}</Text>
            <Text style={styles.subtitle}>
              {isSignup ? 'Start your learning journey' : 'Sign in to continue learning'}
            </Text>

            {/* Row 1: Parent · Child · Teacher */}
            <View style={styles.roleRow}>
              <TouchableOpacity style={styles.roleItem} onPress={() => router.push('/parent/login')}>
                <View style={styles.roleCircle}>
                  <Image source={require('../assets/illustrations/avatars/parent.png')} style={styles.roleAvatar} />
                </View>
                <Text style={[styles.roleLabel, styles.roleParent]}>PARENT</Text>
              </TouchableOpacity>

              <View style={styles.roleItem}>
                <View style={[styles.roleCircle, styles.roleActive]}>
                  <Image source={require('../assets/illustrations/avatars/child.png')} style={styles.roleAvatar} />
                </View>
                <Text style={[styles.roleLabel, styles.roleChild]}>CHILD</Text>
              </View>

              <TouchableOpacity style={styles.roleItem} onPress={() => router.push('/teacher/login')}>
                <View style={styles.roleCircle}>
                  <Image source={require('../assets/illustrations/avatars/teacher.png')} style={styles.roleAvatar} />
                </View>
                <Text style={[styles.roleLabel, styles.roleTeacher]}>TEACHER</Text>
              </TouchableOpacity>
            </View>

            {/* Row 2: Principal · Admin */}
            <View style={[styles.roleRow, styles.roleRowCenter]}>
              <TouchableOpacity style={styles.roleItem} onPress={() => router.push('/principal/login')}>
                <View style={[styles.roleCircle, styles.rolePrincipalCircle]}>
                  <Text style={styles.roleEmoji}>🏫</Text>
                </View>
                <Text style={[styles.roleLabel, styles.rolePrincipal]}>PRINCIPAL</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.roleItem} onPress={() => router.push('/admin/login')}>
                <View style={[styles.roleCircle, styles.roleAdminCircle]}>
                  <Text style={styles.roleEmoji}>🛡️</Text>
                </View>
                <Text style={[styles.roleLabel, styles.roleAdmin]}>ADMIN</Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <Text style={styles.fieldLabel}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor={colors.text.muted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              {isSignup && (
                <>
                  <Text style={styles.fieldLabel}>Class</Text>
                  <TouchableOpacity style={styles.input} onPress={() => setShowClassPicker(true)}>
                    <Text style={classLevel ? styles.inputText : styles.placeholder}>
                      {classLevel ? `Class ${classLevel}` : 'Select your class'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.text.muted}
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
                <Text style={styles.buttonText}>
                  {isLoading ? 'Processing...' : isSignup ? 'SIGN UP' : 'LOGIN'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleMuted}>
                {isSignup ? 'Already have an account? ' : 'New user? '}
              </Text>
              <TouchableOpacity onPress={() => { setIsSignup(!isSignup); setError(''); }}>
                <Text style={styles.toggleAction}>{isSignup ? 'Login' : 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.cream },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
  },
  bgTop: { position: 'absolute', top: -80, left: -120, width: 320, height: 320, opacity: 0.5 },
  bgBottom: { position: 'absolute', bottom: -140, right: -120, width: 380, height: 380, opacity: 0.5, transform: [{ rotate: '12deg' }] },
  title: { fontSize: 30, fontWeight: '800', color: colors.text.primary, marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.text.muted, marginBottom: 20, textAlign: 'center' },
  roleRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  roleRowCenter: { justifyContent: 'center' },
  roleItem: { alignItems: 'center' },
  roleCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F3B64E',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  roleActive: { borderWidth: 3, borderColor: colors.accent.orange },
  roleAvatar: { width: 40, height: 40, resizeMode: 'contain' },
  roleLabel: { marginTop: 5, fontSize: 10, fontWeight: '700' },
  roleParent: { color: '#EF4444' },
  roleChild: { color: colors.accent.orange },
  roleTeacher: { color: colors.accent.blue },
  rolePrincipalCircle: { backgroundColor: '#818CF8' },
  roleAdminCircle: { backgroundColor: '#F87171' },
  roleEmoji: { fontSize: 26 },
  rolePrincipal: { color: '#4F46E5' },
  roleAdmin: { color: '#DC2626' },
  form: { width: '100%', maxWidth: 380, marginTop: 4 },
  fieldLabel: { fontSize: 12, color: colors.text.muted, marginBottom: 5, marginTop: 4, paddingLeft: 4 },
  input: {
    backgroundColor: colors.primary.creamLight,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    color: colors.text.primary,
    fontSize: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.primary.border,
    justifyContent: 'center',
  },
  inputText: { color: colors.text.primary, fontSize: 15 },
  placeholder: { color: colors.text.muted, fontSize: 15 },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { color: '#B91C1C', textAlign: 'center', fontSize: 13 },
  button: {
    borderRadius: 14,
    backgroundColor: colors.accent.orange,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  toggleMuted: { color: colors.text.muted, fontSize: 13 },
  toggleAction: { color: colors.accent.orange, fontSize: 13, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.primary.creamLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text.primary, textAlign: 'center', marginBottom: 14 },
  modalItem: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  modalItemText: { color: colors.text.primary, fontSize: 16, textAlign: 'center' },
  modalCancel: { color: colors.text.muted, textAlign: 'center', marginTop: 14, fontSize: 15 },
});
