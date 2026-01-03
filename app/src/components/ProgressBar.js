// ProgressBar component for loading indicator
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import colors from '../styles/colors';

export default function ProgressBar({ loading }) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      progressAnim.setValue(0);
    }
  }, [loading]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  if (!loading) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.progress, { width }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary.cyan,
    borderRadius: 2,
  },
});
