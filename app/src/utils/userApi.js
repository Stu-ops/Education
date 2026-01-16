// User API utilities adapted from web app for React Native
import Constants from 'expo-constants';
import { apiLogger } from './config';

const API_URL = (Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000') + '/users';

export async function loginUser({ username, password }) {
  const endpoint = '/users/login';
  try {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.detail || 'Invalid credentials');
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

export async function signupUser(data) {
  const endpoint = '/users/signup';
  console.log('Signup Payload:', data);

  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.detail || 'Signup failed');
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

export async function fetchUser(token) {
  const endpoint = '/users/me';
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!res.ok) {
      apiLogger(endpoint, 'GET', null, { message: 'Failed to fetch user' });
      return null;
    }

    const data = await res.json();
    apiLogger(endpoint, 'GET', data);
    return data;
  } catch (error) {
    apiLogger(endpoint, 'GET', null, error);
    return null;
  }
}

export async function saveUser(updates, token) {
  const endpoint = '/users/update';
  try {
    console.log('saveUser - sending updates:', updates);
    
    const res = await fetch(`${API_URL}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Unknown error' }));
      console.error('saveUser error response:', res.status, errorData);
      apiLogger(endpoint, 'PUT', null, { 
        status: res.status, 
        message: errorData.detail || 'Failed to save user',
        errors: errorData 
      });
      return null;
    }
    
    const data = await res.json();
    console.log('saveUser success:', data);
    apiLogger(endpoint, 'PUT', data);
    return data;
  } catch (error) {
    console.error('saveUser exception:', error);
    apiLogger(endpoint, 'PUT', null, error);
    return null;
  }
}
