// Home Screen
import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, StatusBar, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { BACKEND_URL } from '../../src/utils/api';
import storage from '../../src/utils/storage';
import colors from '../../src/styles/colors';

import Header from '../../src/components/Header';
import ProgressBar from '../../src/components/ProgressBar';
import FeatureGrid from '../../src/components/FeatureGrid';
import ChatSection from '../../src/components/ChatSection';
import MotivationalQuote from '../../src/components/MotivationalQuote';

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialTopic, setInitialTopic] = useState(null);
  const [showQuote, setShowQuote] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [loadedMessages, setLoadedMessages] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('General'); // ← shared subject state

  // Parse messages from params if they exist
  const safeParseMessages = (raw) => {
    if (!raw) return null;
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const list = Array.isArray(parsed) ? parsed : parsed?.messages;
      if (!Array.isArray(list)) return null;
      return list.map((m) => {
        const text =
          m?.text ??
          m?.message ??
          m?.content ??
          m?.bot_message ??
          '';
        const image =
          m?.image ??
          m?.image_url ??
          m?.imageUrl ??
          null;
        const senderRaw =
          m?.sender ??
          m?.role ??
          m?.sender_type ??
          (m?.is_bot ? 'bot' : null);
        const sender =
          senderRaw === 'assistant' || senderRaw === 'bot' || senderRaw === 'ai'
            ? 'bot'
            : senderRaw === 'user' || senderRaw === 'student'
              ? 'user'
              : m?.is_bot
                ? 'bot'
                : 'user';
        return { text: String(text || ''), image, sender };
      }).filter((m) => m.text || m.image);
    } catch {
      return null;
    }
  };

  const preloadMessages = safeParseMessages(params?.messages);
  const preloadSessionId = params?.session_id || null;

  useEffect(() => {
    checkFirstLoad();
  }, []);

  useEffect(() => {
    const loadSessionMessages = async () => {
      if (!preloadSessionId) return;
      try {
        const res = await fetch(`${BACKEND_URL}/chat/session/${preloadSessionId}`);
        if (!res.ok) return;
        const data = await res.json();
        const normalized = safeParseMessages(data);
        if (normalized?.length) setLoadedMessages(normalized);
      } catch (err) {
        console.error('Failed to load session messages:', err);
      }
    };

    loadSessionMessages();
  }, [preloadSessionId]);

  const checkFirstLoad = async () => {
    const hasShownQuote = await storage.getItem('hasShownQuote');
    if (hasShownQuote) {
      setShowQuote(false);
      setIsFirstLoad(false);
    }
  };

  const handleTopicClick = (topic) => {
    setInitialTopic(topic);
    setIsChatExpanded(true);
  };

  const handleQuoteComplete = async () => {
    setShowQuote(false);
    setIsFirstLoad(false);
    await storage.setItem('hasShownQuote', 'true');
  };

  const handleReset = () => {
    setIsChatExpanded(false);
    setInitialTopic(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Motivational Quote Overlay */}
      {showQuote && isFirstLoad && (
        <MotivationalQuote onComplete={handleQuoteComplete} />
      )}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerWrap}>
          <Header onReset={handleReset} />
        </View>
        <TouchableWithoutFeedback
          onPress={() => setIsChatExpanded(false)}
          disabled={isChatExpanded}
        >
          <View style={styles.content}>
            <View style={styles.card}>
              <ProgressBar loading={loading} />

              <View style={styles.mainContent}>
                {!isChatExpanded && (
                  <>
                    <FeatureGrid
                      key={selectedSubject}
                      onTopicClick={handleTopicClick}
                      selectedSubject={selectedSubject}
                    />
                  </>
                )}

                <ChatSection
                  setIsChatExpanded={setIsChatExpanded}
                  isChatExpanded={isChatExpanded}
                  setLoading={setLoading}
                  loading={loading}
                  loadMessages={loadedMessages || preloadMessages}
                  preloadSessionId={preloadSessionId}
                  initialTopic={initialTopic}
                  selectedSubject={selectedSubject}
                  onSubjectChange={setSelectedSubject}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
        {isChatExpanded && (
          <Pressable style={styles.overlay} onPress={() => setIsChatExpanded(false)} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary.cream },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 12, paddingTop: 6, paddingBottom: 78 },
  card: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    alignSelf: 'stretch',
    width: '100%',
    maxWidth: '100%',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  mainContent: { flex: 1, minHeight: 0, position: 'relative', paddingBottom: 8 },
  seeMore: { textAlign: 'center', color: colors.text.muted, fontSize: 12, marginTop: 4, marginBottom: 6, fontWeight: '600', letterSpacing: 0.2 },
  headerWrap: { paddingHorizontal: 12, paddingTop: 8, marginBottom: 6 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 900,
  },
});
