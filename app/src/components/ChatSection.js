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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as ImageIcon, Send, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { sendToGemini, sendCheckRequest, setSessionId } from '../utils/api';
import { apiLogger } from '../utils/config';
import { useLanguage } from '../contexts/LanguageContext';
import { useHistoryStore } from '../contexts/HistoryContext';
import { useUser } from '../contexts/UserContext';
import colors from '../styles/colors';

// Teacher Avatar Component
function TeacherAvatar({ expression }) {
  const expressions = {
    neutral: '🧑‍🏫',
    thinking: '🤔',
    happy: '😊',
    celebrating: '🎉',
  };
  return (
    <LinearGradient
      colors={['#A855F7', '#EC4899']}
      style={styles.avatar}
    >
      <Text style={styles.avatarEmoji}>
        {expressions[expression] || expressions.neutral}
      </Text>
    </LinearGradient>
  );
}

// Student Avatar Component
function StudentAvatar() {
  return (
    <LinearGradient
      colors={['#22C55E', '#3B82F6']}
      style={styles.avatar}
    >
      <Text style={styles.avatarEmoji}>👤</Text>
    </LinearGradient>
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
          ? 'नमस्ते! मैं आपके गणित के सवालों की मदद कर सकता हूँ।'
          : 'Hello! I can help with your math questions.',
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
    if (preloadSessionId) {
      setSessionId(preloadSessionId);
    }
  }, [preloadSessionId]);

  useEffect(() => {
    if (initialTopic) {
      handleSend(
        lang === 'hi'
          ? `${initialTopic} पर बात शुरू करें।`
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

      setMessages((prev) => [...prev, { text: reply, sender: 'bot' }]);
      addConversation([...messages, newUserMsg, { text: reply, sender: 'bot' }]);
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

      setMessages((prev) => [...prev, { text: replyText, sender: 'bot' }]);
      addConversation([...messages, newUserMsg, { text: replyText, sender: 'bot' }]);
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

  return (
    <View style={[styles.container, isChatExpanded && styles.containerExpanded]}>
      <Text style={styles.title}>
        {lang === 'hi' ? 'गणित शिक्षक' : 'Math Teacher'}
      </Text>
      <Text style={styles.timer}>⏱️ {timeTaken}s since last message</Text>

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
          <ImageIcon size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder={lang === 'hi' ? 'अपना सवाल पूछें...' : 'Ask your question...'}
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={input}
          onChangeText={setInput}
          onFocus={() => setIsChatExpanded(true)}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.buttonDisabled]}
          onPress={() => handleSend()}
          disabled={loading}
        >
          <LinearGradient colors={['#22C55E', '#16A34A']} style={styles.sendButtonGradient}>
            <Send size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkButton, loading && styles.buttonDisabled]}
          onPress={handleCheck}
          disabled={loading}
        >
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.sendButtonGradient}>
            <Check size={18} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    flex: 1,
    minHeight: 200,
  },
  containerExpanded: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    marginTop: 0,
    borderRadius: 0,
    zIndex: 1000,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  timer: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarEmoji: {
    fontSize: 18,
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
    backgroundColor: '#22C55E',
    borderBottomRightRadius: 4,
  },
  messageBubbleBot: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 8,
    gap: 8,
  },
  imageButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingVertical: 8,
  },
  sendButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    padding: 10,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
