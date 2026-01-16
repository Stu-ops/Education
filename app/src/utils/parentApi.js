// Parent API utilities adapted from web app for React Native
import Constants from 'expo-constants';
import storage from './storage';
import { apiLogger } from './config';

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
  const endpoint = '/parents/register';
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await parseError(res);
      apiLogger(endpoint, 'POST', null, error);
      throw error;
    }

    const result = await res.json();
    apiLogger(endpoint, 'POST', result);
    return result;
  } catch (error) {
    apiLogger(endpoint, 'POST', null, error);
    throw error;
  }
}

export async function loginParent({ username, password }) {
  const endpoint = '/parents/login';
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const error = await parseError(res);
      apiLogger(endpoint, 'POST', null, error);
      throw error;
    }

    const data = await res.json();
    apiLogger(endpoint, 'POST', data);
    
    if (data.access_token) {
      await storage.setItem('parentToken', data.access_token);
    }
    
    return data;
  } catch (error) {
    apiLogger(endpoint, 'POST', null, error);
    throw error;
  }
}

export async function fetchParentStats(token) {
  const endpoint = '/parents/stats';
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });

    if (!res.ok) {
      const error = await parseError(res);
      apiLogger(endpoint, 'GET', null, error);
      throw error;
    }

    const data = await res.json();
    apiLogger(endpoint, 'GET', data);
    return data;
  } catch (error) {
    apiLogger(endpoint, 'GET', null, error);
    throw error;
  }
}

export async function sendParentFeedback(feedback, token) {
  const endpoint = '/parents/feedback';
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ feedback }),
    });

    if (!res.ok) {
      const error = await parseError(res);
      apiLogger(endpoint, 'POST', null, error);
      throw error;
    }

    const data = await res.json();
    apiLogger(endpoint, 'POST', data);
    return data;
  } catch (error) {
    apiLogger(endpoint, 'POST', null, error);
    throw error;
  }
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
