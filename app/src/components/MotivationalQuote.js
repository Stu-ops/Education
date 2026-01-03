// MotivationalQuote component for first load overlay
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const quotes = [
  { text: "Math is not about numbers, it's about understanding.", emoji: "🧠" },
  { text: "Every problem has a solution. Keep trying!", emoji: "💪" },
  { text: "Practice makes perfect. You're doing great!", emoji: "⭐" },
  { text: "Learning is a journey, not a destination.", emoji: "🚀" },
  { text: "Mistakes are proof that you're trying.", emoji: "🌟" },
];

export default function MotivationalQuote({ onComplete }) {
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 3 seconds
    const timer = setTimeout(() => {
      handleDismiss();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onComplete) onComplete();
    });
  };

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={handleDismiss}
    >
      <LinearGradient
        colors={['rgba(37,99,235,0.95)', 'rgba(67,56,202,0.95)']}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>{quote.emoji}</Text>
          <Text style={styles.quote}>{quote.text}</Text>
          <Text style={styles.tapHint}>Tap to continue</Text>
        </Animated.View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  quote: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 32,
  },
  tapHint: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
});
