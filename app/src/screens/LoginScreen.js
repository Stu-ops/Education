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
  Image,
} from 'react-native';
import { useUser } from '../contexts/UserContext';
import colors from '../styles/colors';

export default function LoginScreen({ navigation }) {
  const { login, signup } = useUser();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [error, setError] = useState('');
  const [isSignup, setIsSignup] = useState(true);
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
    <View style={styles.container}>
      <Image
        source={require('../../assets/illustrations/symbols.png')}
        style={styles.symbolTop}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />
      <Image
        source={require('../../assets/illustrations/symbols.png')}
        style={styles.symbolBottom}
        resizeMode="contain"
        accessibilityIgnoresInvertColors
      />

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
            <Text style={styles.title}>
              {isSignup ? 'Join Masterly' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignup
                ? 'Start your math journey'
                : 'Continue your learning adventure'}
            </Text>

            <View style={styles.form}>
              <Text style={styles.label}>Please enter Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor={colors.text.soft}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              {isSignup && (
                <>
                  <Text style={styles.label}>Select Class</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowClassPicker(true)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.inputText,
                        !classLevel && styles.placeholder,
                      ]}
                    >
                      {classLevel ? `Class ${classLevel}` : 'Select class'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <Text style={styles.label}>Please enter Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.text.soft}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {error ? (
                <Animated.View
                  style={[
                    styles.errorContainer,
                    { transform: [{ translateX: shakeAnim }] },
                  ]}
                >
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              ) : null}

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading || showSuccess}
                activeOpacity={0.85}
              >
                <Text style={styles.buttonText}>
                  {isLoading
                    ? 'Processing...'
                    : showSuccess
                    ? 'Success!'
                    : isSignup
                    ? 'SIGN UP'
                    : 'LOGIN'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleToggleMode}>
              <Text style={styles.toggleText}>
                {isSignup
                  ? 'Already have an account ? Login'
                  : 'New user? Sign up'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

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

      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Welcome!</Text>
            <Text style={styles.successSubtitle}>Redirecting...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.cream,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.muted,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'transparent',
    padding: 0,
  },
  label: {
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.primary.creamLight,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
    color: colors.text.primary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.primary.border,
    marginBottom: 18,
  },
  inputText: {
    color: colors.text.primary,
    fontSize: 15,
  },
  placeholder: {
    color: colors.text.soft,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  errorText: {
    color: colors.accent.red,
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.accent.orange,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  toggleText: {
    color: colors.text.muted,
    fontSize: 13,
    marginTop: 20,
    textAlign: 'center',
  },
  symbolTop: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 140,
    height: 140,
    opacity: 0.9,
  },
  symbolBottom: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 140,
    height: 140,
    opacity: 0.9,
    transform: [{ rotate: '180deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.primary.creamLight,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
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
    backgroundColor: colors.primary.cream,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  pickerItemSelected: {
    backgroundColor: colors.accent.orange,
    borderColor: colors.accent.orangeDeep,
  },
  pickerItemText: {
    color: colors.text.primary,
    fontSize: 15,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    fontWeight: 'bold',
    color: colors.text.white,
  },
  modalClose: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    color: colors.text.muted,
    fontSize: 16,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successContent: {
    backgroundColor: colors.primary.creamLight,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.text.muted,
    marginTop: 8,
  },
});
