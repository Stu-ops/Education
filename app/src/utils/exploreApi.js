// Explore API utilities adapted from web app for React Native
import axios from 'axios';
import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export async function getExploreData() {
  try {
    const res = await axios.get(`${API_BASE_URL}/explore`);
    return res.data;
  } catch (error) {
    console.error('Error fetching explore data:', error);
    return null;
  }
}

export async function getTopics() {
  try {
    const res = await axios.get(`${API_BASE_URL}/topics/`);
    return res.data;
  } catch (error) {
    console.error('Error fetching topics:', error);
    return [];
  }
}
