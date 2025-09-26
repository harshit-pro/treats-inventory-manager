import axios from 'axios';
const API_BASE_URL = 'http://localhost:8086/api';
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Dummy credentials for testing
const DUMMY_CREDENTIALS = [
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: '1',
      username: 'admin',
      email: 'admin@sweetshop.com',
      role: 'ADMIN' as const
    }
  },
  {
    username: 'user',
    password: 'user123',
    user: {
      id: '2',
      username: 'user',
      email: 'user@sweetshop.com',
      role: 'USER' as const
    }
  }
];

// Auth API
export const authAPI = {
  login: async (data: LoginRequest) => {
    // Check dummy credentials first
    const dummyUser = DUMMY_CREDENTIALS.find(
      cred => cred.username === data.username && cred.password === data.password
    );
    if (dummyUser) {
      return Promise.resolve({
        data: {
          token: `dummy-jwt-token-${dummyUser.user.id}`,
          user: dummyUser.user,
        },
      });
    }

    // Try multiple endpoints and payload shapes to match various backends
    const endpoints = ['/auth/login', '/login', '/auth/signin'];
    const payloads: Array<Record<string, string>> = [
      { username: data.username, password: data.password },
      { email: data.username, password: data.password },
      { userName: data.username, password: data.password },
      { login: data.username, password: data.password },
    ];

    let lastError: any = null;
    for (const endpoint of endpoints) {
      for (const body of payloads) {
        try {
          return await api.post(endpoint, body);
        } catch (error: any) {
          lastError = error;
          // If unauthorized or not found, continue trying other shapes/paths
          const status = error?.response?.status;
          if (status && ![400, 401, 404].includes(status)) {
            // For other server errors, stop early
            throw error;
          }
        }
      }
    }
    throw lastError;
  },
  register: (data: RegisterRequest) => api.post('/auth/register', data),
};

// Normalize backend sweet to frontend type (ensure id is string)
function normalizeSweet(raw: any): Sweet {
  return {
    id: String(raw.id ?? raw.sweetId ?? ''),
    name: raw.name,
    category: raw.category,
    price: Number(raw.price),
    quantity: Number(raw.quantity),
    description: raw.description ?? undefined,
    // Be tolerant to different backend field names
    imageUrl: (raw.imageUrl || raw.imageURL || raw.image || raw.imgUrl || raw.img || undefined),
  };
}
// Sweets API
export const sweetsAPI = {
  getAll: async () => {
    const res = await api.get('/sweets/all');
    console.log(res.data);
    const data = Array.isArray(res.data) ? res.data.map(normalizeSweet) : [];
    return { data } as { data: Sweet[] };
  },
  search: async (params: { name?: string; category?: string; minPrice?: number; maxPrice?: number }) => {
    const res = await api.get('/sweets/search', { params });
    const data = Array.isArray(res.data) ? res.data.map(normalizeSweet) : [];
    return { data } as { data: Sweet[] };
  },
  // create sweet with image using multipart/form-data: parts: sweet (json), image (file)
  create: async (data: Omit<Sweet, 'id'> & { imageFile: File }) => {
    const formData = new FormData();
    formData.append('sweet', new Blob([
      JSON.stringify({
        name: data.name,
        category: data.category,
        price: data.price,
        quantity: data.quantity,
        description: data.description ?? '',
        imageUrl: data.imageUrl ?? ''
      })
    ], { type: 'application/json' }));
    formData.append('image', data.imageFile);
    const res = await api.post('/sweets/add', formData);
    return { data: normalizeSweet(res.data) } as { data: Sweet };
  },
  update: async (id: string, data: Partial<Sweet>) => {
    const res = await api.put(`/sweets/update/${id}`, data);
    return { data: normalizeSweet(res.data) } as { data: Sweet };
  },
  delete: (id: string) => api.delete(`/sweets/delete/${id}`),
  purchase: (id: string, quantity: number = 1) =>
    api.post(`/sweets/purchase/${id}`, { quantity }),
  restock: (id: string, quantity: number) =>
    api.post(`/sweets/restock/${id}`, { quantity }),
};
export default api;