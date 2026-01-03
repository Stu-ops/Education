// AccuracyCard component with animated counter and sparkle effects
// Requirements: 6.2 - Display accuracy percentage with animated count-up and sparkle effects for high accuracy
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import colors from '../styles/colors';

const SPARKLE_COUNT = 6;

// Individual sparkle component
const Sparkle = ({ delay, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.2,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 0.5,
              duration: 400,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(800),
        ])
      ).start();
    };

    animate();
  }, [delay, opacity, scale]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Text
      style={[
        styles.sparkle,
        style,
        {
          opacity,
          transform: [{ scale }, { rotate: spin }],
        },
      ]}
    >
      ✨
    </Animated.Text>
  );
};

export default function AccuracyCard({ accuracy = 0, subtitle = 'Last 7 days' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const isHighAccuracy = accuracy >= 90;

  // Count-up animation
  useEffect(() => {
    animatedValue.setValue(0);
    setDisplayValue(0);

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    Animated.timing(animatedValue, {
      toValue: accuracy,
      duration: 1500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [accuracy]);

  // Pulse animation for high accuracy
  useEffect(() => {
    if (isHighAccuracy) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [isHighAccuracy]);

  // Generate sparkle positions around the percentage
  const sparklePositions = [
    { top: -5, right: 10 },
    { top: 5, left: 5 },
    { bottom: 10, right: 5 },
    { bottom: 5, left: 15 },
    { top: 15, right: -5 },
    { bottom: -5, left: 0 },
  ];

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(34, 197, 94, 0.0)', 'rgba(34, 197, 94, 0.3)'],
  });

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Accuracy</Text>
      
      <Animated.View
        style={[
          styles.accuracyContainer,
          isHighAccuracy && {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Glow effect for high accuracy */}
        {isHighAccuracy && (
          <Animated.View
            style={[
              styles.glowEffect,
              { backgroundColor: glowColor },
            ]}
          />
        )}
        
        <View style={styles.percentageWrapper}>
          <Text style={[
            styles.accuracyText,
            isHighAccuracy && styles.highAccuracyText,
          ]}>
            {displayValue}
            <Text style={styles.percentSign}>%</Text>
          </Text>
          
          {/* Sparkle effects for high accuracy */}
          {isHighAccuracy && sparklePositions.map((pos, index) => (
            <Sparkle
              key={index}
              delay={index * 200}
              style={pos}
            />
          ))}
        </View>
      </Animated.View>

      {/* Achievement indicator for high accuracy */}
      {isHighAccuracy && (
        <View style={styles.achievementBadge}>
          <Text style={styles.achievementEmoji}>🌟</Text>
          <Text style={styles.achievementText}>Excellent!</Text>
        </View>
      )}

      <Text style={styles.cardSubtext}>{subtitle}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  accuracyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  percentageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.secondary.green,
    textAlign: 'center',
  },
  highAccuracyText: {
    textShadowColor: 'rgba(34, 197, 94, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  percentSign: {
    fontSize: 24,
    fontWeight: '600',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 14,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 8,
    gap: 4,
  },
  achievementEmoji: {
    fontSize: 12,
  },
  achievementText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary.green,
  },
  cardSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
});
