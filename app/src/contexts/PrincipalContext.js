import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import { loginPrincipal, registerPrincipal, getMe, getInviteCode, refreshInviteCode } from '../utils/principalApi';

const PrincipalContext = createContext();

export const usePrincipal = () => {
  const ctx = useContext(PrincipalContext);
  if (!ctx) throw new Error('usePrincipal must be used within PrincipalProvider');
  return ctx;
};

export const PrincipalProvider = ({ children }) => {
  const [principal, setPrincipal] = useState(null);
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const token = await storage.getItem('principalToken');
      if (token) {
        const data = await getMe();
        setPrincipal(data);
        setCollege(data.college || null);
      }
    } catch {
      await storage.removeItem('principalToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const data = await loginPrincipal(username, password);
      await storage.setItem('principalToken', data.access_token);
      const profile = await getMe();
      setPrincipal(profile);
      setCollege(profile.college || null);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const register = async (payload) => {
    try {
      const data = await registerPrincipal(payload);
      await storage.setItem('principalToken', data.access_token);
      const profile = await getMe();
      setPrincipal(profile);
      setCollege(profile.college || null);
      return { success: true, invite_code: data.invite_code };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  const logout = async () => {
    await storage.removeItem('principalToken');
    setPrincipal(null);
    setCollege(null);
  };

  const fetchProfile = async () => {
    try {
      const data = await getMe();
      setPrincipal(data);
      setCollege(data.college || null);
    } catch {}
  };

  const fetchInviteCode = async () => {
    try {
      return await getInviteCode();
    } catch (e) {
      return { error: e.message };
    }
  };

  const doRefreshInviteCode = async () => {
    try {
      const data = await refreshInviteCode();
      return { success: true, invite_code: data.invite_code };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  return (
    <PrincipalContext.Provider value={{
      principal, college, loading,
      login, register, logout, fetchProfile,
      fetchInviteCode, refreshInviteCode: doRefreshInviteCode,
    }}>
      {children}
    </PrincipalContext.Provider>
  );
};
