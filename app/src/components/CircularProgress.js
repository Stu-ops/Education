// CircularProgress component using SVG
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import colors from '../styles/colors';

export default function CircularProgress({ percentage, size = 'mobile' }) {
  const dimensions = size === 'mobile' ? 100 : 140;
  const strokeWidth = size === 'mobile' ? 8 : 10;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={[styles.container, { width: dimensions, height: dimensions }]}>
      <Svg width={dimensions} height={dimensions}>
        {/* Background circle */}
        <Circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <Circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          stroke={colors.primary.cyan}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${dimensions / 2} ${dimensions / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.percentage, size === 'desktop' && styles.percentageLarge]}>
          {Math.round(percentage)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  percentageLarge: {
    fontSize: 32,
  },
});
