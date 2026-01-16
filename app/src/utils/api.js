// API utilities adapted from web app for React Native
import axios from 'axios';
import storage from './storage';
import Constants from 'expo-constants';
import { apiLogger } from './config';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

const backendApi = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Generic requests
export const getRequest = async (url, params = {}) => {
  try {
    const response = await backendApi.get(url, { params });
    apiLogger(url, 'GET', response.data);
    return response.data;
  } catch (error) {
    apiLogger(url, 'GET', null, error);
    throw error;
  }
};

export const postRequest = async (url, data = {}, params = {}) => {
  try {
    const response = await backendApi.post(url, data, { params });
    apiLogger(url, 'POST', response.data);
    return response.data;
  } catch (error) {
    apiLogger(url, 'POST', null, error);
    throw error;
  }
};

// Session Management
let currentSessionId = null;

// Initialize session from storage
export const initSession = async () => {
  currentSessionId = await storage.getItem('session_id');
};

// Generate UUID for session
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Send message to FastAPI backend
export const sendToGemini = async (input, username) => {
  try {
    if (!currentSessionId) {
      currentSessionId = generateUUID();
      await storage.setItem('session_id', currentSessionId);
    }

    const payload = {
      text: input.text || '',
      image: input.image?.data || null,
      time_taken: input.time_taken || 0,
      sender: 'user',
      session_id: currentSessionId,
    };

    if (!username) throw new Error('Username is required');

    const response = await postRequest(`/chat/send/instant/${username}`, payload);
    const botMessage = response.bot_message?.text || 'No reply.';

    return {
      candidates: [{ content: { parts: [{ text: botMessage }] } }],
    };
  } catch (error) {
    console.error('Backend call failed:', error);
    throw error;
  }
};

export const sendCheckRequest = async (input, username) => {
  try {
    if (!currentSessionId) {
      currentSessionId = generateUUID();
      await storage.setItem('session_id', currentSessionId);
    }

    const payload = {
      text: input.text || '',
      image: input.image?.data || null,
      time_taken: input.time_taken || 0,
      sender: 'user',
      session_id: currentSessionId,
    };

    const response = await postRequest(`/chat/send/check/${username}`, payload);
    return response;
  } catch (error) {
    console.error('Check Request failed:', error);
    throw error;
  }
};

export const resetSession = async () => {
  currentSessionId = null;
  await storage.removeItem('session_id');
  await storage.removeItem('chatMessages');
  console.log('Chat session reset successfully');
};

export const setSessionId = async (id) => {
  if (!id) return;
  currentSessionId = id;
  await storage.setItem('session_id', id);
};

export const getSessionId = () => currentSessionId;

export { BACKEND_URL };
