// TeacherContext adapted from web app for React Native
import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';
import Constants from 'expo-constants';
import { apiLogger } from '../utils/config';

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
    const endpoint = '/teachers/me';
    try {
      console.log('[TeacherContext] Fetching teacher profile...');
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('[TeacherContext] Profile response status:', response.status);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('[TeacherContext] Non-JSON response:', text);
          apiLogger(endpoint, 'GET', null, { message: 'Invalid response format' });
          await storage.removeItem('teacherToken');
          await storage.removeItem('teacherId');
          await storage.removeItem('teacherUsername');
          return;
        }

        console.log('[TeacherContext] Teacher profile:', JSON.stringify(data, null, 2));
        apiLogger(endpoint, 'GET', data);
        setTeacher(data);
      } else {
        apiLogger(endpoint, 'GET', null, { message: 'Failed to fetch profile', status: response.status });
        await storage.removeItem('teacherToken');
        await storage.removeItem('teacherId');
        await storage.removeItem('teacherUsername');
      }
    } catch (error) {
      console.error('[TeacherContext] Error fetching teacher profile:', error);
      apiLogger(endpoint, 'GET', null, error);
      await storage.removeItem('teacherToken');
      await storage.removeItem('teacherId');
      await storage.removeItem('teacherUsername');
    }
  };

  const fetchStudents = async (token, forceRefresh = false) => {
    const endpoint = '/teachers/students-raw';
    try {
      const teacherUsername = await storage.getItem('teacherUsername');
      if (!teacherUsername) {
        console.log('[TeacherContext] No teacher username found');
        return [];
      }
      
      console.log('[TeacherContext] Fetching students for:', teacherUsername);
      const url = `${BACKEND_URL}${endpoint}?teacher_username=${encodeURIComponent(teacherUsername)}${forceRefresh ? '&_t=' + Date.now() : ''}`;
      const response = await fetch(url);

      console.log('[TeacherContext] Students response status:', response.status);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          console.error('[TeacherContext] Non-JSON response:', text);
          apiLogger(endpoint, 'GET', null, { message: 'Invalid response format' });
          return [];
        }

        console.log('[TeacherContext] Students data:', JSON.stringify(data, null, 2));
        apiLogger(endpoint, 'GET', data);
        const studentsList = data.students || [];
        setStudents(studentsList);
        return studentsList;
      }
      apiLogger(endpoint, 'GET', null, { message: 'Failed to fetch students', status: response.status });
      return [];
    } catch (error) {
      console.error('[TeacherContext] Error fetching students:', error);
      apiLogger(endpoint, 'GET', null, error);
      return [];
    }
  };

  const login = async (credentials) => {
    const endpoint = '/teachers/login';
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        apiLogger(endpoint, 'POST', null, error);
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      apiLogger(endpoint, 'POST', data);
      await storage.setItem('teacherToken', data.access_token);
      await storage.setItem('teacherId', data.teacher_id.toString());
      await storage.setItem('teacherUsername', data.username);

      await fetchTeacherProfile(data.access_token);
      await fetchStudents(data.access_token);
      return { success: true };
    } catch (error) {
      apiLogger(endpoint, 'POST', null, error);
      return { success: false, error: error.message };
    }
  };

  const register = async (formData) => {
    const endpoint = '/teachers/register';
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = response.headers.get('content-type');
      
      if (!response.ok) {
        // Try to parse error as JSON, fallback to text
        let errorMessage = 'Registration failed';
        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.detail || error.message || errorMessage;
          } catch (e) {
            errorMessage = await response.text();
          }
        } else {
          errorMessage = await response.text();
        }
        apiLogger(endpoint, 'POST', null, { message: errorMessage });
        throw new Error(errorMessage);
      }

      // Parse successful response
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { message: 'Registration successful' };
      }
      
      apiLogger(endpoint, 'POST', data);
      return { success: true };
    } catch (error) {
      apiLogger(endpoint, 'POST', null, error);
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
    const endpoint = '/teachers/students/add';
    try {
      const token = await storage.getItem('teacherToken');
      const requestBody = {
        student_username: student.username,
        class_level: student.class
      };
      
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        apiLogger(endpoint, 'POST', null, error);
        throw new Error(error.detail || 'Failed to add student');
      }

      const data = await response.json();
      apiLogger(endpoint, 'POST', data);
      await fetchStudents(token, true);
      return { success: true };
    } catch (error) {
      apiLogger(endpoint, 'POST', null, error);
      return { success: false, error: error.message };
    }
  };

  const removeStudent = async (studentUsername) => {
    const endpoint = `/teachers/students/${studentUsername}`;
    try {
      const token = await storage.getItem('teacherToken');
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        apiLogger(endpoint, 'DELETE', null, error);
        throw new Error(error.detail || 'Failed to remove student');
      }

      const data = await response.json();
      apiLogger(endpoint, 'DELETE', data);
      await fetchStudents(token);
      return { success: true };
    } catch (error) {
      apiLogger(endpoint, 'DELETE', null, error);
      return { success: false, error: error.message };
    }
  };

  const uploadContent = async (formData) => {
    const endpoint = '/teachers/upload';
    try {
      const token = await storage.getItem('teacherToken');
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        apiLogger(endpoint, 'POST', null, error);
        throw new Error(error.detail || 'Upload failed');
      }

      const data = await response.json();
      apiLogger(endpoint, 'POST', data);
      await fetchTeacherProfile(token);
      return { success: true, data };
    } catch (error) {
      apiLogger(endpoint, 'POST', null, error);
      return { success: false, error: error.message };
    }
  };

  const uploadMultipleFiles = async (formData) => {
    const endpoint = '/teachers/upload/multiple';
    try {
      const token = await storage.getItem('teacherToken');
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        apiLogger(endpoint, 'POST', null, error);
        throw new Error(error.detail || 'Multiple upload failed');
      }

      const data = await response.json();
      apiLogger(endpoint, 'POST', data);
      await fetchTeacherProfile(token);
      return { success: true, data };
    } catch (error) {
      apiLogger(endpoint, 'POST', null, error);
      return { success: false, error: error.message };
    }
  };

  const getUploadInfo = async () => {
    const endpoint = '/teachers/upload/info';
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`);
      
      if (!response.ok) {
        apiLogger(endpoint, 'GET', null, { message: 'Failed to get upload info' });
        throw new Error('Failed to get upload info');
      }

      const data = await response.json();
      apiLogger(endpoint, 'GET', data);
      return { success: true, data };
    } catch (error) {
      apiLogger(endpoint, 'GET', null, error);
      return { success: false, error: error.message };
    }
  };

  const getTeacherFiles = async (fileType = null) => {
    const endpoint = '/teachers/files';
    try {
      const token = await storage.getItem('teacherToken');
      const url = fileType 
        ? `${BACKEND_URL}${endpoint}?file_type=${fileType}`
        : `${BACKEND_URL}${endpoint}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const error = await response.json();
        apiLogger(endpoint, 'GET', null, error);
        throw new Error(error.detail || 'Failed to get files');
      }

      const data = await response.json();
      apiLogger(endpoint, 'GET', data);
      return { success: true, data };
    } catch (error) {
      apiLogger(endpoint, 'GET', null, error);
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
