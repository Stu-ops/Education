// TeacherContext adapted from web app for React Native
import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import Constants from 'expo-constants';

const TeacherContext = createContext();

export const useTeacher = () => {
  const context = useContext(TeacherContext);
  if (!context) {
    throw new Error('useTeacher must be used within a TeacherProvider');
  }
  return context;
};

const BACKEND_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:8000';

export const TeacherProvider = ({ children }) => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    initializeTeacher();
  }, []);

  const initializeTeacher = async () => {
    try {
      const token = await storage.getItem('teacherToken');
      if (token) {
        await fetchTeacherProfile(token);
        await fetchStudents(token);
      }
    } catch (error) {
      console.error('Error initializing teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherProfile = async (token) => {
    try {
      const response = await fetch(`${BACKEND_URL}/teachers/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setTeacher(data);
      } else {
        await storage.removeItem('teacherToken');
        await storage.removeItem('teacherId');
        await storage.removeItem('teacherUsername');
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      await storage.removeItem('teacherToken');
      await storage.removeItem('teacherId');
      await storage.removeItem('teacherUsername');
    }
  };

  const fetchStudents = async (token, forceRefresh = false) => {
    try {
      const teacherUsername = await storage.getItem('teacherUsername');
      if (!teacherUsername) return [];
      
      const url = `${BACKEND_URL}/teachers/students-raw?teacher_username=${teacherUsername}${forceRefresh ? '&_t=' + Date.now() : ''}`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const studentsList = data.students || [];
        setStudents(studentsList);
        return studentsList;
      }
      return [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch(`${BACKEND_URL}/teachers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      await storage.setItem('teacherToken', data.access_token);
      await storage.setItem('teacherId', data.teacher_id.toString());
      await storage.setItem('teacherUsername', data.username);

      await fetchTeacherProfile(data.access_token);
      await fetchStudents(data.access_token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (formData) => {
    try {
      const response = await fetch(`${BACKEND_URL}/teachers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Registration failed');
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await storage.removeItem('teacherToken');
    await storage.removeItem('teacherId');
    await storage.removeItem('teacherUsername');
    setTeacher(null);
    setStudents([]);
  };

  const addStudent = async (student) => {
    try {
      const token = await storage.getItem('teacherToken');
      const requestBody = {
        student_username: student.username,
        class_level: student.class
      };
      
      const response = await fetch(`${BACKEND_URL}/teachers/students/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to add student');
      }

      await fetchStudents(token, true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const removeStudent = async (studentUsername) => {
    try {
      const token = await storage.getItem('teacherToken');
      const response = await fetch(`${BACKEND_URL}/teachers/students/${studentUsername}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to remove student');
      }

      await fetchStudents(token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const uploadContent = async (formData) => {
    try {
      const token = await storage.getItem('teacherToken');
      const response = await fetch(`${BACKEND_URL}/teachers/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      await fetchTeacherProfile(token);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const uploadMultipleFiles = async (formData) => {
    try {
      const token = await storage.getItem('teacherToken');
      const response = await fetch(`${BACKEND_URL}/teachers/upload/multiple`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Multiple upload failed');
      }

      const data = await response.json();
      await fetchTeacherProfile(token);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getUploadInfo = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/teachers/upload/info`);
      
      if (!response.ok) {
        throw new Error('Failed to get upload info');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const getTeacherFiles = async (fileType = null) => {
    try {
      const token = await storage.getItem('teacherToken');
      const url = fileType 
        ? `${BACKEND_URL}/teachers/files?file_type=${fileType}`
        : `${BACKEND_URL}/teachers/files`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to get files');
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    teacher,
    loading,
    students,
    login,
    register,
    logout,
    addStudent,
    removeStudent,
    uploadContent,
    uploadMultipleFiles,
    getUploadInfo,
    getTeacherFiles,
    fetchTeacherProfile,
    fetchStudents
  };

  return (
    <TeacherContext.Provider value={value}>
      {children}
    </TeacherContext.Provider>
  );
};
