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
    <View style={styles.container}>
      <Image
        source={require('../assets/illustrations/symbols.png')}
        style={styles.bgTop}
        resizeMode="contain"
      />
      <Image
        source={require('../assets/illustrations/symbols.png')}
        style={styles.bgBottom}
        resizeMode="contain"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{isSignup ? 'Join Masterly' : 'Login'}</Text>
          <Text style={styles.subtitle}>{isSignup ? 'Start your learning journey' : 'Sign in to continue learning'}</Text>

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

          <View style={styles.form}>
            <Text style={styles.fieldLabel}>Please enter Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor={colors.text.muted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {isSignup && (
              <>
                <Text style={styles.fieldLabel}>Select Class</Text>
                <TouchableOpacity
                  style={styles.input}
                  onPress={() => setShowClassPicker(true)}
                >
                  <Text style={classLevel ? styles.inputText : styles.placeholder}>
                    {classLevel ? `Class ${classLevel}` : 'Select class'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <Text style={styles.fieldLabel}>Please enter Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>?? {error}</Text>
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
            {isSignup ? (
              <>
                <Text style={styles.toggleMuted}>Already have an account? </Text>
                <TouchableOpacity onPress={() => { setIsSignup(!isSignup); setError(''); }}>
                  <Text style={styles.toggleAction}>Login</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.toggleMuted}>New user? </Text>
                <TouchableOpacity onPress={() => { setIsSignup(!isSignup); setError(''); }}>
                  <Text style={styles.toggleAction}>Sign Up</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.cream },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'flex-start', padding: 20, alignItems: 'center', paddingTop: 90 },
  bgTop: { position: 'absolute', top: -80, left: -120, width: 320, height: 320, opacity: 0.5 },
  bgBottom: { position: 'absolute', bottom: -140, right: -120, width: 380, height: 380, opacity: 0.5, transform: [{ rotate: '12deg' }] },
  title: { fontSize: 32, fontWeight: '800', color: colors.text.primary, marginBottom: 6 },
  subtitle: { fontSize: 13, color: colors.text.muted, marginBottom: 24 },
  roleRow: { flexDirection: 'row', gap: 18, marginBottom: 22 },
  roleItem: { alignItems: 'center' },
  roleCircle: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#F3B64E', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  roleActive: { borderWidth: 3, borderColor: colors.accent.orange },
  roleAvatar: { width: 42, height: 42, resizeMode: 'contain' },
  roleLabel: { marginTop: 6, fontSize: 11, fontWeight: '700' },
  roleParent: { color: '#EF4444' },
  roleChild: { color: colors.accent.orange },
  roleTeacher: { color: colors.accent.blue },
  form: { width: '100%', maxWidth: 360 },
  fieldLabel: { width: '100%', maxWidth: 360, fontSize: 12, color: colors.text.muted, marginBottom: 6, marginTop: 6 },
  input: { backgroundColor: colors.primary.creamLight, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 18, color: colors.text.primary, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: colors.primary.border, justifyContent: 'center' },
  inputText: { color: colors.text.primary, fontSize: 16 },
  placeholder: { color: colors.text.muted, fontSize: 16 },
  errorBox: { backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#FCA5A5' },
  errorText: { color: '#B91C1C', textAlign: 'center', fontSize: 12 },
  button: { borderRadius: 999, overflow: 'hidden', backgroundColor: colors.accent.orange, paddingVertical: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.6 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  toggleMuted: { color: colors.text.muted, fontSize: 12 },
  toggleAction: { color: colors.accent.orange, fontSize: 12, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.primary.creamLight, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '60%', borderWidth: 1, borderColor: colors.primary.border },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary, textAlign: 'center', marginBottom: 16 },
  modalItem: { padding: 14, backgroundColor: '#FFFFFF', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: colors.primary.border },
  modalItemText: { color: colors.text.primary, fontSize: 16, textAlign: 'center' },
  modalCancel: { color: colors.text.muted, textAlign: 'center', marginTop: 16, fontSize: 16 },
});
