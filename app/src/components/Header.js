// Header component adapted from web app for React Native
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { resetSession } from '../utils/api';
import colors from '../styles/colors';

export default function Header({ onReset }) {
  const { lang, toggleLang } = useLanguage();
  const navigation = useNavigation();
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleReset = async () => {
    setIsLogoAnimating(true);
    
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => setIsLogoAnimating(false));

    await resetSession();
    if (onReset) onReset();
  };

  return (
    <LinearGradient
      colors={['#2563EB', '#4F46E5']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <TouchableOpacity onPress={handleReset} activeOpacity={0.8}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Text style={styles.logo}>📘 Math GPT</Text>
            <Text style={styles.tagline}>
              {lang === 'hi' ? 'गणित सीखने में मज़ा आता है!' : 'Learning math is fun!'}
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Parent Portal Link */}
          <TouchableOpacity
            style={styles.parentButton}
            onPress={() => navigation.navigate('Parent')}
          >
            <Text style={styles.parentEmoji}>👨‍👩‍👧</Text>
          </TouchableOpacity>

          {/* Language Toggle */}
          <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
            <View style={styles.langOptions}>
              <Text
                style={[
                  styles.langText,
                  lang === 'hi' && styles.langTextActive,
                ]}
              >
                अ
              </Text>
              <Text
                style={[
                  styles.langText,
                  lang === 'en' && styles.langTextActive,
                ]}
              >
                A
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  parentButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  parentEmoji: {
    fontSize: 18,
  },
  langToggle: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  langOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  langText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  langTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
