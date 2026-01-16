// Home Screen
import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import storage from '../../src/utils/storage';

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

  // Parse messages from params if they exist
  const preloadMessages = params?.messages ? JSON.parse(params.messages) : null;
  const preloadSessionId = params?.session_id || null;

  useEffect(() => {
    checkFirstLoad();
  }, []);

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
    <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Motivational Quote Overlay */}
      {showQuote && isFirstLoad && (
        <MotivationalQuote onComplete={handleQuoteComplete} />
      )}

      <SafeAreaView style={styles.safeArea}>
        <TouchableWithoutFeedback onPress={() => setIsChatExpanded(false)}>
          <View style={styles.content}>
            <View style={styles.card}>
              <Header onReset={handleReset} />
              <ProgressBar loading={loading} />

              <View style={styles.mainContent}>
                {!isChatExpanded && (
                  <FeatureGrid onTopicClick={handleTopicClick} />
                )}

                <ChatSection
                  setIsChatExpanded={setIsChatExpanded}
                  isChatExpanded={isChatExpanded}
                  setLoading={setLoading}
                  loading={loading}
                  loadMessages={preloadMessages}
                  preloadSessionId={preloadSessionId}
                  initialTopic={initialTopic}
                />
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, padding: 8, paddingBottom: 80 },
  card: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: 12 },
  mainContent: { flex: 1 },
});
