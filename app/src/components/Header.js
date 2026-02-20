// Header component adapted from web app for React Native
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';
import { resetSession } from '../utils/api';
import colors from '../styles/colors';

export default function Header({ onReset }) {
  const { lang, toggleLang } = useLanguage();
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleReset = async () => {
    setIsLogoAnimating(true);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
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
    <View style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={handleReset} activeOpacity={0.8} style={styles.logoWrap}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }], flexDirection: 'row', alignItems: 'center' }}>
            <Image source={require('../../assets/icon.png')} style={styles.logoIcon} />
            <Text style={styles.logoText}>Masterly</Text>
          </Animated.View>
        </TouchableOpacity>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
            <Text style={[styles.langText, lang === 'hi' && styles.langTextActive]}>हि</Text>
            <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>A</Text>
          </TouchableOpacity>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>T</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.navy,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 28,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.white,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 6,
  },
  langText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  langTextActive: {
    color: colors.text.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
    fontWeight: '700',
  },
  profileCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    color: colors.text.white,
    fontWeight: '700',
  },
});
