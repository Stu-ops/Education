import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { loginAdmin } from '../utils/adminApi';

const AdminContext = createContext();

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const token = await storage.getItem('adminToken');
      const username = await storage.getItem('adminUsername');
      if (token && username) {
        setAdmin({ username });
      }
    } catch {
      await storage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const data = await loginAdmin(username, password);
      await storage.setItem('adminToken', data.access_token);
      await storage.setItem('adminUsername', username);
      setAdmin({ username, id: data.admin_id });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    await storage.removeItem('adminToken');
    await storage.removeItem('adminUsername');
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};
