import Constants from 'expo-constants';
import storage from './storage';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

const authHeaders = async () => {
  const token = await storage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
};

export const loginAdmin = async (username, password) => {
  const res = await fetch(`${BACKEND_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const getPlatformStats = async () => {
  const res = await fetch(`${BACKEND_URL}/admin/stats`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getColleges = async () => {
  const res = await fetch(`${BACKEND_URL}/admin/colleges`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getAdminUsers = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  const res = await fetch(`${BACKEND_URL}/admin/users${query ? `?${query}` : ''}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getAdminTeachers = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  const res = await fetch(`${BACKEND_URL}/admin/teachers${query ? `?${query}` : ''}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const suspendAccount = async (role, id) => {
  const res = await fetch(`${BACKEND_URL}/admin/accounts/${role}/${id}/suspend`, {
    method: 'PUT',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const reactivateAccount = async (role, id) => {
  const res = await fetch(`${BACKEND_URL}/admin/accounts/${role}/${id}/reactivate`, {
    method: 'PUT',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const deleteCollege = async (collegeId) => {
  const res = await fetch(`${BACKEND_URL}/admin/colleges/${collegeId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getAdminVideos = async (params = {}) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v != null))
  ).toString();
  const res = await fetch(`${BACKEND_URL}/admin/videos${query ? `?${query}` : ''}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const deleteVideo = async (videoId) => {
  const res = await fetch(`${BACKEND_URL}/admin/videos/${videoId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const flagVideo = async (videoId) => {
  const res = await fetch(`${BACKEND_URL}/admin/videos/${videoId}/flag`, {
    method: 'PUT',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getAnnouncement = async () => {
  const res = await fetch(`${BACKEND_URL}/admin/announcement`);
  return handleResponse(res);
};

export const setAnnouncement = async (value) => {
  const res = await fetch(`${BACKEND_URL}/admin/announcement`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify({ value }),
  });
  return handleResponse(res);
};

export const getAuditLog = async (page = 1, pageSize = 50) => {
  const res = await fetch(`${BACKEND_URL}/admin/audit-log?page=${page}&page_size=${pageSize}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getConfig = async (key) => {
  const res = await fetch(`${BACKEND_URL}/admin/config/${key}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const setConfig = async (key, value) => {
  const res = await fetch(`${BACKEND_URL}/admin/config/${key}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify({ value }),
  });
  return handleResponse(res);
};
