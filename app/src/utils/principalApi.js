import Constants from 'expo-constants';
import storage from './storage';

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

const authHeaders = async () => {
  const token = await storage.getItem('principalToken');
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

export const registerPrincipal = async (payload) => {
  const res = await fetch(`${BACKEND_URL}/principal/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
};

export const loginPrincipal = async (username, password) => {
  const res = await fetch(`${BACKEND_URL}/principal/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handleResponse(res);
};

export const getMe = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/me`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getInviteCode = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/invite-code`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const refreshInviteCode = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/invite-code/refresh`, {
    method: 'POST',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getTeachers = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/teachers`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getTeacherDetail = async (teacherId) => {
  const res = await fetch(`${BACKEND_URL}/principal/teachers/${teacherId}`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const deactivateTeacher = async (teacherId) => {
  const res = await fetch(`${BACKEND_URL}/principal/teachers/${teacherId}/deactivate`, {
    method: 'PUT',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const reactivateTeacher = async (teacherId) => {
  const res = await fetch(`${BACKEND_URL}/principal/teachers/${teacherId}/reactivate`, {
    method: 'PUT',
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getStudents = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/students`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getAnalytics = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/analytics`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getStudentAnalytics = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/analytics/students`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getContentAnalytics = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/analytics/content`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};

export const getContestAnalytics = async () => {
  const res = await fetch(`${BACKEND_URL}/principal/analytics/contests`, {
    headers: await authHeaders(),
  });
  return handleResponse(res);
};
