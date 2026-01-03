// Home Screen
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { useLanguage } from '../../src/contexts/LanguageContext';

export default function HomeScreen() {
  const { lang, toggleLang } = useLanguage();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: lang === 'hi' ? 'नमस्ते! मैं गणित में मदद कर सकता हूँ।' : 'Hello! I can help with math.', sender: 'bot' }
  ]);

  const topics = [
    { label: lang === 'hi' ? 'संख्याएँ' : 'Numbers', icon: '123', colors: ['#A855F7', '#EC4899'] },
    { label: lang === 'hi' ? 'जोड़' : 'Addition', icon: '+', colors: ['#3B82F6', '#06B6D4'] },
    { label: lang === 'hi' ? 'घटाव' : 'Subtraction', icon: '−', colors: ['#22C55E', '#10B981'] },
    { label: lang === 'hi' ? 'आकार' : 'Shapes', icon: '⬤', colors: ['#F97316', '#EAB308'] },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    setMessage('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        text: lang === 'hi' ? 'मैं आपकी मदद करूंगा!' : "I'll help you with that!",
        sender: 'bot'
      }]);
    }, 1000);
  };

  return (
    <LinearGradient colors={['#2563EB', '#4338CA']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <LinearGradient colors={['#2563EB', '#4F46E5']} style={styles.header}>
            <View>
              <Text style={styles.logo}>📘 Math GPT</Text>
              <Text style={styles.tagline}>
                {lang === 'hi' ? 'गणित सीखने में मज़ा!' : 'Learning math is fun!'}
              </Text>
            </View>
            <TouchableOpacity style={styles.langButton} onPress={toggleLang}>
              <Text style={styles.langText}>{lang === 'hi' ? 'EN' : 'हि'}</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Topics Grid */}
          <View style={styles.topicsGrid}>
            {topics.map((topic, i) => (
              <TouchableOpacity key={i} style={styles.topicCard}>
                <LinearGradient colors={topic.colors} style={styles.topicIcon}>
                  <Text style={styles.topicIconText}>{topic.icon}</Text>
                </LinearGradient>
                <Text style={styles.topicLabel}>{topic.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Chat Section */}
          <View style={styles.chatSection}>
            <Text style={styles.chatTitle}>
              {lang === 'hi' ? 'गणित शिक्षक' : 'Math Teacher'}
            </Text>
            <ScrollView style={styles.messageList}>
              {messages.map((msg, i) => (
                <View key={i} style={[styles.messageBubble, msg.sender === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={styles.messageText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={lang === 'hi' ? 'सवाल पूछें...' : 'Ask a question...'}
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={message}
                onChangeText={setMessage}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.sendGradient}>
                  <Send size={18} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, padding: 12, paddingBottom: 90 },
  header: { borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  logo: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  langButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  langText: { color: '#FFF', fontWeight: '600' },
  topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  topicCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 12 },
  topicIcon: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  topicIconText: { fontSize: 20, color: '#FFF' },
  topicLabel: { color: '#FFF', fontWeight: '500' },
  chatSection: { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12 },
  chatTitle: { fontSize: 16, fontWeight: '600', color: '#FFF', marginBottom: 8 },
  messageList: { flex: 1 },
  messageBubble: { maxWidth: '80%', padding: 10, borderRadius: 12, marginBottom: 8 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#22C55E' },
  botBubble: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)' },
  messageText: { color: '#FFF' },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingLeft: 12, marginTop: 8 },
  input: { flex: 1, color: '#FFF', paddingVertical: 12 },
  sendButton: { borderRadius: 8, overflow: 'hidden', margin: 4 },
  sendGradient: { padding: 10 },
});
