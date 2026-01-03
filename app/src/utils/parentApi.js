// Parent API utilities adapted from web app for React Native
import Constants from 'expo-constants';
import storage from './storage';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

// Parse error from response
const parseError = async (res) => {
  try {
    const data = await res.json();
    return {
      type: res.status === 401 ? 'auth' : 'api',
      message: data.detail || 'An error occurred',
      status: res.status,
    };
  } catch {
    return {
      type: 'api',
      message: 'An error occurred',
      status: res.status,
    };
  }
};

export async function registerParent(data) {
  const res = await fetch(`${API_URL}/parents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw error;
  }

  return await res.json();
}

export async function loginParent({ username, password }) {
  const res = await fetch(`${API_URL}/parents/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw error;
  }

  const data = await res.json();
  
  if (data.access_token) {
    await storage.setItem('parentToken', data.access_token);
  }
  
  return data;
}

export async function fetchParentStats(token) {
  const res = await fetch(`${API_URL}/parents/stats`, {
    method: 'GET',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw error;
  }

  return await res.json();
}

export async function sendParentFeedback(feedback, token) {
  const res = await fetch(`${API_URL}/parents/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ feedback }),
  });

  if (!res.ok) {
    const error = await parseError(res);
    throw error;
  }

  return await res.json();
}

export async function getParentToken() {
  return await storage.getItem('parentToken');
}

export async function clearParentToken() {
  await storage.removeItem('parentToken');
}

export async function isParentAuthenticated() {
  const token = await getParentToken();
  return !!token;
}
