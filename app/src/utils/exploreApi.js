// Explore API utilities adapted from web app for React Native
import axios from 'axios';
import Constants from 'expo-constants';
import storage from './storage';
import { apiLogger } from './config';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export async function getExploreData() {
  const endpoint = '/explore/';
  try {
    const token = await storage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_BASE_URL}${endpoint}`, { headers });
    apiLogger(endpoint, 'GET', res.data);
    return res.data;
  } catch (error) {
    apiLogger(endpoint, 'GET', null, error);
    console.error('Error fetching explore data:', error);
    return null;
  }
}

export async function getTopics() {
  const endpoint = '/topics/';
  try {
    const token = await storage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_BASE_URL}${endpoint}`, { headers });
    apiLogger(endpoint, 'GET', res.data);
    return res.data;
  } catch (error) {
    apiLogger(endpoint, 'GET', null, error);
    console.error('Error fetching topics:', error);
    return [];
  }
}
