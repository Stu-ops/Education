// ChatSection component adapted from web app for React Native
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Image as ImageIcon, Send, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { sendToGemini, sendCheckRequest, setSessionId, getSessionId } from '../utils/api';
import { apiLogger } from '../utils/config';
import { useLanguage } from '../contexts/LanguageContext';
import { useHistoryStore } from '../contexts/HistoryContext';
import { useUser } from '../contexts/UserContext';
import colors from '../styles/colors';

// Teacher Avatar Component
function TeacherAvatar({ expression }) {
  return (
    <View style={styles.avatarTeacher}>
      <Image
        source={require('../../assets/illustrations/avatars/teacher.png')}
        style={styles.avatarImage}
      />
    </View>
  );
}

// Student Avatar Component
function StudentAvatar() {
  return (
    <View style={styles.avatarStudent}>
      <Image
        source={require('../../assets/illustrations/avatars/child.png')}
        style={styles.avatarImage}
      />
    </View>
  );
}
// Typing Indicator Component
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate(dot1, 0);
    animate(dot2, 200);
    animate(dot3, 400);
  }, []);

  return (
    <View style={styles.typingContainer}>
      <TeacherAvatar expression="thinking" />
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View
            key={i}
            style={[
              styles.typingDot,
              {
                transform: [
                  {
                    translateY: dot.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -4],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// Get teacher expression based on message content
const getTeacherExpression = (text) => {
  if (!text) return 'neutral';
  const textStr = typeof text === 'string' ? text : String(text || '');
  const lowerText = textStr.toLowerCase();
  
  if (lowerText.includes('correct') || lowerText.includes('great') || 
      lowerText.includes('excellent') || lowerText.includes('perfect')) {
    return 'celebrating';
  }
  if (lowerText.includes('?') || lowerText.includes('let me') || 
      lowerText.includes('thinking')) {
    return 'thinking';
  }
  if (lowerText.includes('good') || lowerText.includes('nice') || 
      lowerText.includes('well done')) {
    return 'happy';
  }
  return 'neutral';
};

export default function ChatSection({
  isChatExpanded,
  setIsChatExpanded,
  loading,
  setLoading,
  loadMessages,
  preloadSessionId = null,
  initialTopic,
}) {
  const { lang } = useLanguage();
  const { addConversation } = useHistoryStore();
  const { user } = useUser();
  const scrollViewRef = useRef(null);

  const [messages, setMessages] = useState(
    loadMessages || [
      {
        text: lang === 'hi'
          ? 'नमस्ते! मैं आपके सवालों में मदद कर सकता हूँ।'
          : 'Hello! I can help with your  questions.',
        sender: 'bot',
      },
    ]
  );
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (loadMessages && loadMessages.length) {
      setMessages(loadMessages);
    }
  }, [loadMessages]);

  useEffect(() => {
    if (preloadSessionId) {
      setSessionId(preloadSessionId);
    }
  }, [preloadSessionId]);

  useEffect(() => {
    if (initialTopic) {
      handleSend(
        lang === 'hi'
          ? `आइए ${initialTopic} पर बात शुरू करें।`
          : `Let's start learning about ${initialTopic}.`
      );
    }
  }, [initialTopic]);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeTaken((prev) => prev + 1);
    }, 1000);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimeTaken(0);
    startTimer();
  };

  const handleImageUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({
        data: `data:image/jpeg;base64,${asset.base64}`,
        mime: 'image/jpeg',
      });
      setMessages((prev) => [...prev, { image: asset.uri, sender: 'user' }]);
    }
  };

  const handleSend = async (forcedMessage = null) => {
    const userMessage = forcedMessage || input.trim();
    if ((!userMessage && !image) || loading) return;
    if (!user?.username) {
      console.error('User not logged in');
      apiLogger('/chat/send', 'POST', null, { message: 'User not logged in' });
      return;
    }

    const newUserMsg = { text: userMessage, sender: 'user' };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');

    try {
      setLoading(true);
      apiLogger('/chat/send/instant', 'POST (sending)', { text: userMessage, username: user.username });
      
      const response = await sendToGemini(
        { text: userMessage, image: image || null, time_taken: timeTaken },
        user.username
      );

      const reply =
        response.candidates?.[0]?.content?.parts?.[0]?.text ||
        (lang === 'hi' ? 'कोई उत्तर नहीं मिला।' : 'No response received.');

      apiLogger('/chat/send/instant', 'POST (response)', { reply: reply.substring(0, 100) + '...' });

      const replyImage =
        response?.image ||
        response?.bot_message?.image ||
        response?.bot_message?.image_url ||
        null;
      const botMsg = { text: reply, image: replyImage, sender: 'bot' };
      setMessages((prev) => [...prev, botMsg]);
      addConversation([...messages, newUserMsg, botMsg], getSessionId?.() || null);
      resetTimer();
    } catch (error) {
      console.error(error);
      apiLogger('/chat/send/instant', 'POST', null, error);
      setMessages((prev) => [
        ...prev,
        { text: lang === 'hi' ? 'त्रुटि हुई।' : 'An error occurred.', sender: 'bot' },
      ]);
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  const handleCheck = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    const newUserMsg = { text: userMessage, sender: 'user' };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');

    try {
      setLoading(true);
      apiLogger('/chat/send/check', 'POST (sending)', { text: userMessage, username: user.username });
      
      const response = await sendCheckRequest(
        { text: userMessage, image: image || null, time_taken: timeTaken },
        user.username
      );

      const reply = response.bot_message || 'No response received.';
      const replyText = typeof reply === 'string' ? reply : (reply?.text || JSON.stringify(reply));

      apiLogger('/chat/send/check', 'POST (response)', { reply: replyText.substring(0, 100) + '...' });

      const replyImage =
        response?.bot_message?.image ||
        response?.bot_message?.image_url ||
        response?.image ||
        response?.image_url ||
        null;
      const botMsg = { text: replyText, image: replyImage, sender: 'bot' };
      setMessages((prev) => [...prev, botMsg]);
      addConversation([...messages, newUserMsg, botMsg], getSessionId?.() || null);
      resetTimer();
    } catch (error) {
      console.error(error);
      apiLogger('/chat/send/check', 'POST', null, error);
      setMessages((prev) => [
        ...prev,
        { text: 'An error occurred while checking.', sender: 'bot' },
      ]);
    } finally {
      setLoading(false);
      setImage(null);
    }
  };

  const content = (
    <View style={styles.inner}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>
        {lang === 'hi' ? 'शिक्षक' : ' Teacher'}
        </Text>
        {isChatExpanded && (
          <TouchableOpacity style={styles.homeChip} onPress={() => setIsChatExpanded(false)}>
            <Text style={styles.homeChipText}>Home</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.timer}>
        {lang === 'hi' ? `समय: ${timeTaken}s` : `Time: ${timeTaken}s`}
      </Text>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((msg, i) => (
          <View
            key={i}
            style={[
              styles.messageRow,
              msg.sender === 'user' ? styles.messageRowUser : styles.messageRowBot,
            ]}
          >
            {msg.sender === 'user' ? <StudentAvatar /> : <TeacherAvatar expression={getTeacherExpression(msg.text)} />}
            <View style={styles.messageBubbleContainer}>
              {msg.image ? (
                <Image source={{ uri: msg.image }} style={styles.messageImage} />
              ) : (
                <View
                  style={[
                    styles.messageBubble,
                    msg.sender === 'user' ? styles.messageBubbleUser : styles.messageBubbleBot,
                  ]}
                >
                  <Text style={styles.messageText}>{msg.text}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
        {loading && <TypingIndicator />}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={handleImageUpload}>
          <ImageIcon size={18} color={colors.text.muted} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={lang === 'hi' ? 'अपना सवाल पूछें...' : 'Ask your question...'}
          placeholderTextColor={colors.text.muted}
          value={input}
          onChangeText={setInput}
          onFocus={() => setIsChatExpanded(true)}
        />
        <TouchableOpacity
          style={[styles.actionButton, styles.sendButton, loading && styles.buttonDisabled]}
          onPress={() => handleSend()}
          disabled={loading}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.checkButton, loading && styles.buttonDisabled]}
          onPress={handleCheck}
          disabled={loading}
        >
          <Check size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return isChatExpanded ? (
    <Modal visible transparent={false} animationType="slide" onRequestClose={() => setIsChatExpanded(false)}>
      <View style={styles.fullscreen}>{content}</View>
    </Modal>
  ) : (
    <View style={styles.container}>{content}</View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary.creamLight,
    borderRadius: 20,
    padding: 14,
    marginTop: 10,
    flex: 1,
    minHeight: 220,
    borderWidth: 1,
    borderColor: colors.primary.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    elevation: 2,
  },
  fullscreen: {
    flex: 1,
    backgroundColor: colors.primary.cream,
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  inner: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  homeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.primary.creamDark,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  homeChipText: {
    color: colors.text.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  timer: {
    fontSize: 12,
    color: colors.text.muted,
    marginBottom: 8,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
    gap: 8,
  },
  messageRowUser: {
    flexDirection: 'row-reverse',
  },
  messageRowBot: {
    flexDirection: 'row',
  },
  avatarTeacher: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary.border,
    backgroundColor: colors.text.white,
  },
  avatarStudent: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary.border,
    backgroundColor: colors.primary.creamDark,
  },
  avatarImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  messageBubbleContainer: {
    maxWidth: '80%',
    flexShrink: 1,
  },
  messageBubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  messageBubbleUser: {
    backgroundColor: colors.primary.creamDark,
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  messageBubbleBot: {
    backgroundColor: colors.text.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  messageText: {
    color: colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: colors.text.white,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.text.white,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  imageButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: colors.primary.creamDark,
    borderWidth: 1,
    borderColor: colors.primary.border,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    paddingVertical: 8,
  },
  actionButton: {
    borderRadius: 10,
    padding: 10,
  },
  sendButton: {
    backgroundColor: colors.accent.orange,
  },
  checkButton: {
    backgroundColor: colors.accent.blue,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

