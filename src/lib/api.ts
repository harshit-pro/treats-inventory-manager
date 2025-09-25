import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Auth API
export const authAPI = {
  login: (data: LoginRequest) => api.post('/auth/login', data),
  register: (data: RegisterRequest) => api.post('/auth/register', data),
};

// Sweets API
export const sweetsAPI = {
  getAll: () => api.get<Sweet[]>('/sweets'),
  search: (params: { name?: string; category?: string; minPrice?: number; maxPrice?: number }) =>
    api.get<Sweet[]>('/sweets/search', { params }),
  create: (data: Omit<Sweet, 'id'>) => api.post<Sweet>('/sweets', data),
  update: (id: string, data: Partial<Sweet>) => api.put<Sweet>(`/sweets/${id}`, data),
  delete: (id: string) => api.delete(`/sweets/${id}`),
  purchase: (id: string, quantity: number = 1) => 
    api.post(`/sweets/${id}/purchase`, { quantity }),
  restock: (id: string, quantity: number) => 
    api.post(`/sweets/${id}/restock`, { quantity }),
};

export default api;