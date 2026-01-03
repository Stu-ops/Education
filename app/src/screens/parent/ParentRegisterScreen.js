// ParentRegisterScreen for React Native
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useParent } from '../../contexts/ParentContext';
import colors from '../../styles/colors';

export default function ParentRegisterScreen() {
  const navigation = useNavigation();
  const { register } = useParent();
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    phone_number: '',
    student_username: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRegister = async () => {
    if (!form.username || !form.password || !form.student_username) {
      setError('Please fill required fields');
      return;
    }

    setIsLoading(true);
    setError('');

    const result = await register(form);
    setIsLoading(false);

    if (result.success) {
      navigation.navigate('ParentLogin');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.emoji}>📝</Text>
          <Text style={styles.title}>Parent Registration</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Username *"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={form.username}
              onChangeText={(v) => handleChange('username', v)}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password *"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={form.password}
              onChangeText={(v) => handleChange('password', v)}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={form.name}
              onChangeText={(v) => handleChange('name', v)}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={form.phone_number}
              onChangeText={(v) => handleChange('phone_number', v)}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Child's Username *"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={form.student_username}
              onChangeText={(v) => handleChange('student_username', v)}
              autoCapitalize="none"
            />

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>
                  {isLoading ? 'Registering...' : 'Register'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('ParentLogin')}>
            <Text style={styles.linkText}>Already have an account? Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  emoji: { fontSize: 60, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 32 },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#F87171', fontSize: 14, textAlign: 'center' },
  button: { borderRadius: 12, overflow: 'hidden' },
  buttonDisabled: { opacity: 0.7 },
  buttonGradient: { paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  linkText: { color: '#67E8F9', fontSize: 14, marginTop: 24 },
});
