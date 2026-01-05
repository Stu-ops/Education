// SuccessAnimation component for React Native
// Requirements: 3.7 - Celebration animation for correct answers
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function SuccessAnimation({ 
  show = false, 
  message = 'Great job!',
  emoji = '🎉',
  duration = 2000 
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef(
    Array.from({ length: 6 }, () => ({
      scale: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (show) {
      // Reset all animations
      scaleAnim.setValue(0);
      bounceAnim.setValue(0);
      fadeAnim.setValue(0);
      sparkleAnims.forEach(anim => {
        anim.scale.setValue(0);
        anim.translateY.setValue(0);
        anim.opacity.setValue(1);
      });

      // Start animation sequence
      Animated.sequence([
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Main emoji entrance with bounce
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          // Sparkle animations
          Animated.stagger(100, 
            sparkleAnims.map((anim, index) => 
              Animated.parallel([
                Animated.spring(anim.scale, {
                  toValue: 1,
                  tension: 80,
                  friction: 6,
                  useNativeDriver: true,
                }),
                Animated.timing(anim.translateY, {
                  toValue: -30 - (index * 10),
                  duration: 800,
                  useNativeDriver: true,
                }),
                Animated.sequence([
                  Animated.delay(400),
                  Animated.timing(anim.opacity, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true,
                  }),
                ]),
              ])
            )
          ),
        ]),
        // Bounce effect
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        // Hold for a moment
        Animated.delay(duration - 1000),
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [show, duration]);

  const bounceScale = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.2],
  });

  if (!show) return null;

  return (
    <Animated.View 
      style={[styles.container, { opacity: fadeAnim }]}
      pointerEvents="none"
    >
      {/* Sparkles */}
      {sparkleAnims.map((anim, index) => {
        const angle = (index * 60) * (Math.PI / 180);
        const radius = 60;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <Animated.View
            key={index}
            style={[
              styles.sparkle,
              {
                left: width / 2 + x - 12,
                top: '50%',
                marginTop: y - 12,
                transform: [
                  { scale: anim.scale },
                  { translateY: anim.translateY },
                ],
                opacity: anim.opacity,
              },
            ]}
          >
            <Text style={styles.sparkleText}>✨</Text>
          </Animated.View>
        );
      })}

      {/* Main success content */}
      <Animated.View
        style={[
          styles.successContent,
          {
            transform: [
              { scale: Animated.multiply(scaleAnim, bounceScale) },
            ],
          },
        ]}
      >
        <Text style={styles.successEmoji}>{emoji}</Text>
        <Text style={styles.successMessage}>{message}</Text>
      </Animated.View>

      {/* Ripple effect */}
      <Animated.View
        style={[
          styles.ripple,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.3, 0],
            }),
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.9)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  successEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  sparkle: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    fontSize: 20,
  },
  ripple: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
});