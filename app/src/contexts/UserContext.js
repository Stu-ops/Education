// UserContext adapted from web app for React Native
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import storage from '../utils/storage';
import { fetchUser, saveUser, loginUser, signupUser } from '../utils/userApi';

export const UserContext = createContext();

export function useUser() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const token = await storage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const u = await fetchUser(token);
        if (u) setUser(u);
      }
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  const login = async (username, password) => {
    try {
      const data = await loginUser({ username, password });

      if (data.access_token) {
        await storage.setItem('token', data.access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`;

        const u = await fetchUser(data.access_token);
        setUser(u);
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  // SIGNUP
  const signup = async (username, password, classLevel) => {
    try {
      const payload = {
        username,
        password,
        name: username,
        level: 1,
        email: '',
        avatar: '',
        class_level: classLevel,
        age: null,
        school: '',
      };

      const data = await signupUser(payload);
      if (data) return await login(username, password);

      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Signup failed' };
    }
  };

  // UPDATE USER
  const updateUser = async (updates) => {
    const token = await storage.getItem('token');
    if (!user || !token) return null;

    try {
      const payload = {
        ...updates,
        // Ensure class_level is properly mapped
        class_level: updates.class_level || updates.classLevel,
      };

      // Remove any frontend-only fields
      delete payload.classLevel;

      console.log('Updating user with payload:', payload);
      
      const updated = await saveUser(payload, token);
      if (updated) {
        setUser(updated);
        return updated;
      }
      return null;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  };

  const logout = async () => {
    await storage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
