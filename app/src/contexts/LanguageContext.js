// LanguageContext adapted from web app for React Native
import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

export const LanguageContext = createContext();

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await storage.getItem('language');
      if (savedLang) {
        setLang(savedLang);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleLang = async () => {
    const newLang = lang === 'hi' ? 'en' : 'hi';
    setLang(newLang);
    await storage.setItem('language', newLang);
  };

  const setLanguage = async (newLang) => {
    setLang(newLang);
    await storage.setItem('language', newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLanguage, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}
