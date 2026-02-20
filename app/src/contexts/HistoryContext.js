// HistoryContext adapted from web app for React Native
import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { BACKEND_URL } from '../utils/api';
import { useUser } from './UserContext';
import { apiLogger } from '../utils/config';

export const HistoryContext = createContext();

export function useHistoryStore() {
  return useContext(HistoryContext);
}

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    loadHistory();
  }, [user?.username]);

  const loadHistory = async () => {
    try {
      const savedHistory = await storage.getItem('chatHistory');
      const localHistory = savedHistory ? JSON.parse(savedHistory) : [];
      apiLogger('localStorage/chatHistory', 'GET', localHistory);

      let remoteHistory = [];
      if (user?.username) {
        try {
          const res = await fetch(`${BACKEND_URL}/chat/user/${user.username}`);
          if (res.ok) {
            const data = await res.json();
            remoteHistory = Array.isArray(data) ? data : [];
          }
        } catch (remoteError) {
          apiLogger('remoteHistory', 'GET', null, remoteError);
        }
      }

      const normalize = (item, index) => ({
        id: item.id ?? item.session_id ?? `${Date.now()}-${index}`,
        session_id: item.session_id ?? item.sessionId ?? null,
        title: item.title ?? item.messages?.[0]?.text?.slice(0, 30) ?? 'New Chat',
        messages: item.messages ?? item.chat ?? [],
        timestamp: item.timestamp ?? item.created_at ?? Date.now(),
      });

      const finalHistory = remoteHistory.length
        ? remoteHistory.map(normalize)
        : localHistory.map(normalize);

      setHistory(finalHistory);
      if (remoteHistory.length) {
        saveHistory(finalHistory);
      }
    } catch (error) {
      apiLogger('localStorage/chatHistory', 'GET', null, error);
      console.error('Error loading history:', error);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      await storage.setItem('chatHistory', JSON.stringify(newHistory));
      apiLogger('localStorage/chatHistory', 'SAVE', { count: newHistory.length });
    } catch (error) {
      apiLogger('localStorage/chatHistory', 'SAVE', null, error);
      console.error('Error saving history:', error);
    }
  };

  const addConversation = (messages, sessionId = null) => {
    const id = sessionId || Date.now().toString();
    const title = messages[0]?.text?.slice(0, 30) || 'New Chat';
    const timestamp = Date.now();
    
    apiLogger('history/addConversation', 'ADD', { id, title, messageCount: messages.length });
    
    setHistory((prev) => {
      // Check if conversation with this session already exists
      const existingIndex = prev.findIndex(h => h.session_id === sessionId);
      let newHistory;
      
      if (existingIndex >= 0) {
        // Update existing conversation
        newHistory = [...prev];
        newHistory[existingIndex] = { 
          ...newHistory[existingIndex], 
          messages, 
          title,
          timestamp 
        };
      } else {
        // Add new conversation
        newHistory = [{ id, session_id: sessionId, title, messages, timestamp }, ...prev];
      }
      
      // Keep only last 50 conversations
      newHistory = newHistory.slice(0, 50);
      saveHistory(newHistory);
      return newHistory;
    });
  };

  const clearHistory = async () => {
    apiLogger('history/clearHistory', 'DELETE', { message: 'All history cleared' });
    setHistory([]);
    await storage.removeItem('chatHistory');
  };

  const deleteConversation = async (id) => {
    apiLogger('history/deleteConversation', 'DELETE', { id });
    setHistory((prev) => {
      const newHistory = prev.filter(h => h.id !== id);
      saveHistory(newHistory);
      return newHistory;
    });
  };

  return (
    <HistoryContext.Provider value={{ 
      history, 
      addConversation, 
      clearHistory, 
      deleteConversation 
    }}>
      {children}
    </HistoryContext.Provider>
  );
}
