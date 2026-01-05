// BadgeUnlock component for React Native
// Requirements: 6.8 - Badge reveal animation
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function BadgeUnlock({ 
  visible = false, 
  badgeName = 'Achievement', 
  badgeEmoji = '🏆',
  onComplete = () => {} 
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      glowAnim.setValue(0);
      fadeAnim.setValue(0);

      // Start animation sequence
      Animated.sequence([
        // Fade in background
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        // Badge entrance with scale and rotation
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 360,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        // Glow effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: false,
            }),
          ]),
          { iterations: 2 }
        ),
        // Hold for a moment
        Animated.delay(1000),
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete();
      });
    }
  }, [visible]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const glowColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 215, 0, 0)', 'rgba(255, 215, 0, 0.8)'],
  });

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.container}>
          {/* Glow effect */}
          <Animated.View
            style={[
              styles.glowEffect,
              { backgroundColor: glowColor },
            ]}
          />
          
          {/* Badge */}
          <Animated.View
            style={[
              styles.badgeContainer,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotation },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500', '#FF8C00']}
              style={styles.badge}
            >
              <Text style={styles.badgeEmoji}>{badgeEmoji}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Text */}
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: scaleAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.unlockText}>Badge Unlocked!</Text>
            <Text style={styles.badgeNameText}>{badgeName}</Text>
          </Animated.View>

          {/* Sparkles */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            const radius = 120;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <Animated.View
                key={i}
                style={[
                  styles.sparkle,
                  {
                    left: width / 2 + x - 8,
                    top: '50%',
                    marginTop: y - 8,
                    opacity: glowAnim,
                    transform: [
                      { scale: glowAnim },
                      { rotate: rotation },
                    ],
                  },
                ]}
              >
                <Text style={styles.sparkleText}>✨</Text>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
  },
  badgeContainer: {
    marginBottom: 24,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  badgeEmoji: {
    fontSize: 48,
  },
  textContainer: {
    alignItems: 'center',
  },
  unlockText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  badgeNameText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sparkle: {
    position: 'absolute',
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    fontSize: 16,
  },
});