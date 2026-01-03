// HistoryContext adapted from web app for React Native
import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const HistoryContext = createContext();

export function useHistoryStore() {
  return useContext(HistoryContext);
}

export function HistoryProvider({ children }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const savedHistory = await storage.getItem('chatHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      await storage.setItem('chatHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const addConversation = (messages, sessionId = null) => {
    const id = sessionId || Date.now().toString();
    const title = messages[0]?.text?.slice(0, 30) || 'New Chat';
    const timestamp = Date.now();
    
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
    setHistory([]);
    await storage.removeItem('chatHistory');
  };

  const deleteConversation = async (id) => {
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
