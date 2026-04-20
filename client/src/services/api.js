import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (userData) => api.post('/auth/login', userData);

// Chore APIs
export const getChores = () => api.get('/chores');
export const createChore = (choreData) => api.post('/chores', choreData);
//export const updateChore = (id, status) => api.put(`/chores/${id}`, { status });
export const updateChore = (id, data) => api.put(`/chores/${id}`, data);
export const deleteChore = (id) => api.delete(`/chores/${id}`);

export default api;