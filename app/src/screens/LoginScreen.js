// LoginScreen adapted from web app for React Native
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../contexts/UserContext';
import colors from '../styles/colors';

export default function LoginScreen({ navigation }) {
  const { login, signup } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

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
      setShowSuccess(true);
    }
  };

  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setUsername('');
    setPassword('');
    setClassLevel('');
  };

  const classOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

  return (
    <LinearGradient
      colors={['#2563EB', '#4338CA', '#3730A3']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Emoji */}
            <Text style={styles.emoji}>{isSignup ? '🎓' : '👋'}</Text>

            {/* Title */}
            <Text style={styles.title}>
              {isSignup ? 'Join Math GPT!' : 'Welcome Back!'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignup
                ? 'Start your math learning journey'
                : 'Continue your learning adventure'}
            </Text>

            {/* Form */}
            <View style={styles.form}>
              {/* Username Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              {/* Class Level Picker (Signup only) */}
              {isSignup && (
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setShowClassPicker(true)}
                >
                  <Text style={[styles.input, !classLevel && styles.placeholder]}>
                    {classLevel ? `Class ${classLevel}` : 'Select class'}
                  </Text>
                </TouchableOpacity>
              )}

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {/* Error Message */}
              {error ? (
                <Animated.View
                  style={[
                    styles.errorContainer,
                    { transform: [{ translateX: shakeAnim }] },
                  ]}
                >
                  <Text style={styles.errorText}>⚠️ {error}</Text>
                </Animated.View>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading || showSuccess}
              >
                <LinearGradient
                  colors={['#22C55E', '#16A34A']}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading
                      ? 'Processing...'
                      : showSuccess
                      ? '✓ Success!'
                      : isSignup
                      ? 'Sign Up'
                      : 'Login'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Toggle Mode */}
            <TouchableOpacity onPress={handleToggleMode}>
              <Text style={styles.toggleText}>
                {isSignup
                  ? 'Already have an account? Login'
                  : "New user? Sign up"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Class Picker Modal */}
      <Modal
        visible={showClassPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowClassPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Class</Text>
            <ScrollView style={styles.pickerScroll}>
              {classOptions.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.pickerItem,
                    classLevel === c && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setClassLevel(c);
                    setShowClassPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      classLevel === c && styles.pickerItemTextSelected,
                    ]}
                  >
                    Class {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowClassPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Welcome!</Text>
            <Text style={styles.successSubtitle}>Redirecting...</Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  placeholder: {
    color: 'rgba(255,255,255,0.5)',
  },
  errorContainer: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderWidth: 2,
    borderColor: '#F87171',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#F87171',
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    color: '#67E8F9',
    fontSize: 14,
    marginTop: 24,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1B4B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerScroll: {
    maxHeight: 300,
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  pickerItemSelected: {
    backgroundColor: colors.primary.blue,
  },
  pickerItemText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    fontWeight: 'bold',
  },
  modalClose: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#67E8F9',
    fontSize: 16,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  successSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
});
