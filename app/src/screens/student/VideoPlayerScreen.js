// VideoPlayerScreen for React Native
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import colors from '../../styles/colors';

const { width } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { videoUrl, videoTitle } = route.params || {};
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});

  const handlePlayPause = async () => {
    if (status.isPlaying) {
      await videoRef.current?.pauseAsync();
    } else {
      await videoRef.current?.playAsync();
    }
  };

  const handleRestart = async () => {
    await videoRef.current?.setPositionAsync(0);
    await videoRef.current?.playAsync();
  };

  return (
    <LinearGradient colors={colors.gradients.main} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{videoTitle || 'Video'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.videoContainer}>
          {videoUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={setStatus}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Video not available</Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={handleRestart}>
            <RotateCcw size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              style={styles.playButtonGradient}
            >
              {status.isPlaying ? (
                <Pause size={32} color="#FFFFFF" />
              ) : (
                <Play size={32} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>
          <View style={{ width: 48 }} />
        </View>

        <View style={styles.info}>
          <Text style={styles.infoTitle}>{videoTitle}</Text>
          <Text style={styles.infoStatus}>
            {status.isPlaying ? 'Playing' : status.positionMillis > 0 ? 'Paused' : 'Ready to play'}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 12,
  },
  videoContainer: {
    width: width,
    height: width * 0.5625, // 16:9 aspect ratio
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    borderRadius: 36,
    overflow: 'hidden',
  },
  playButtonGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 16,
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoStatus: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
});
