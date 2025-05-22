// src/api/api.jsx에 감정 분석 API 호출 추가

import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "http://localhost:8000/api", // Update with your actual API URL
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API for diary entries
export const diaryAPI = {
  createEntry: (data) => api.post('/diaries/', data),
  updateEntry: (id, data) => api.put(`/diaries/${id}/change`, data),
  getAllEntries: () => api.get('/diaries/read'),
  getEntryById: (id) => api.get(`/diaries/${id}/read_Diary`),
  deleteEntry: (id) => api.delete(`/diaries/${id}/del`),
  // 새로운 AI 감정 분석 API 추가
  analyzeEmotion: (content) => api.post('/analyze_emotion', { content }),
};

// API for user management
export const userAPI = {
  register: (userData) => api.post('/user/', userData),
  deleteUser: (username) => api.delete(`/user/${username}/del`),
  updateUser: (username, userData) => api.put(`/user/${username}/change`, userData),
  getUserProfile: () => api.get('/user/profile'),
  login: (credentials) => api.post('/user/login', credentials),
};

// API for calendar
export const calendarAPI = {
  getCalendar: () => api.get('/'),
};

export default api;