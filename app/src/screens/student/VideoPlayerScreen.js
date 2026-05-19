import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import Constants from 'expo-constants';
import colors from '../../styles/colors';

const { width } = Dimensions.get('window');
const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export default function VideoPlayerScreen() {
  const { videoUrl, videoTitle } = useLocalSearchParams();
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});

  // Resolve full URL — file_path from backend is a relative path like /uploads/videos/...
  const resolvedUrl = videoUrl
    ? videoUrl.startsWith('http')
      ? videoUrl
      : `${BACKEND_URL}${videoUrl}`
    : null;

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

  const formatTime = (ms) => {
    if (!ms) return '0:00';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${String(s % 60).padStart(2, '0')}`;
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {videoTitle || 'Video'}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Video */}
        <View style={styles.videoContainer}>
          {resolvedUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: resolvedUrl }}
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

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlBtn} onPress={handleRestart}>
            <RotateCcw size={22} color="#FFF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause}>
            <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.playBtnGrad}>
              {status.isPlaying
                ? <Pause size={30} color="#FFF" />
                : <Play size={30} color="#FFF" />}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ width: 48 }} />
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle} numberOfLines={2}>{videoTitle || 'Video'}</Text>
          <Text style={styles.infoStatus}>
            {status.isPlaying
              ? `▶ Playing — ${formatTime(status.positionMillis)}`
              : status.positionMillis > 0
                ? `⏸ Paused — ${formatTime(status.positionMillis)}`
                : 'Ready to play'}
          </Text>
          {status.durationMillis ? (
            <Text style={styles.infoDuration}>
              Duration: {formatTime(status.durationMillis)}
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1, fontSize: 17, fontWeight: 'bold',
    color: '#FFF', textAlign: 'center',
  },
  videoContainer: {
    width,
    height: width * 0.5625, // 16:9
    backgroundColor: '#000',
  },
  video: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: 'rgba(255,255,255,0.5)', fontSize: 15 },
  controls: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', padding: 20, gap: 24,
  },
  controlBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  playBtn: { borderRadius: 34, overflow: 'hidden' },
  playBtnGrad: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    margin: 16, borderRadius: 14, padding: 16,
  },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 6 },
  infoStatus: { fontSize: 13, color: 'rgba(255,255,255,0.7)' },
  infoDuration: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
});
