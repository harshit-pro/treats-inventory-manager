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
      // Return dummy response matching backend format
      return Promise.resolve({
        data: {
          token: `dummy-jwt-token-${dummyUser.user.id}`,
          user: dummyUser.user
        }
      });
    }
    
    // If not dummy credentials, try actual API
    return api.post('/auth/login', data);
  },
  register: (data: RegisterRequest) => api.post('/auth/register', data),
};

// Dummy sweets data for demo
const DUMMY_SWEETS: Sweet[] = [
  {
    id: '1',
    name: 'Chocolate Truffle',
    category: 'Chocolate',
    price: 12.99,
    quantity: 25,
    description: 'Rich dark chocolate truffles with cocoa powder',
    imageUrl: 'https://images.unsplash.com/photo-1511911063821-19f4a75bf5dd?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    name: 'Strawberry Cake',
    category: 'Cake',
    price: 24.99,
    quantity: 8,
    description: 'Fresh strawberry layer cake with cream frosting',
    imageUrl: 'https://images.unsplash.com/photo-1464347744102-11db6282f854?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    name: 'Rainbow Macarons',
    category: 'Macaron',
    price: 18.50,
    quantity: 15,
    description: 'Colorful French macarons with various flavors',
    imageUrl: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    name: 'Vanilla Cupcakes',
    category: 'Cupcake',
    price: 8.99,
    quantity: 30,
    description: 'Classic vanilla cupcakes with buttercream frosting',
    imageUrl: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&h=300&fit=crop'
  },
  {
    id: '5',
    name: 'Chocolate Cookies',
    category: 'Cookie',
    price: 6.50,
    quantity: 0,
    description: 'Chewy chocolate chip cookies - Out of stock!',
    imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop'
  },
  {
    id: '6',
    name: 'Lemon Tart',
    category: 'Tart',
    price: 15.75,
    quantity: 12,
    description: 'Tangy lemon curd tart with pastry crust',
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop'
  }
];

// Sweets API
export const sweetsAPI = {
  getAll: async () => {
    try {
      return await api.get<Sweet[]>('/sweets');
    } catch (error) {
      // Return dummy data if backend is not available
      return Promise.resolve({ data: DUMMY_SWEETS });
    }
  },
  search: async (params: { name?: string; category?: string; minPrice?: number; maxPrice?: number }) => {
    try {
      return await api.get<Sweet[]>('/sweets/search', { params });
    } catch (error) {
      // Filter dummy data based on search params
      let filtered = DUMMY_SWEETS;
      
      if (params.name) {
        filtered = filtered.filter(sweet => 
          sweet.name.toLowerCase().includes(params.name!.toLowerCase())
        );
      }
      if (params.category) {
        filtered = filtered.filter(sweet => 
          sweet.category.toLowerCase() === params.category!.toLowerCase()
        );
      }
      if (params.minPrice !== undefined) {
        filtered = filtered.filter(sweet => sweet.price >= params.minPrice!);
      }
      if (params.maxPrice !== undefined) {
        filtered = filtered.filter(sweet => sweet.price <= params.maxPrice!);
      }
      
      return Promise.resolve({ data: filtered });
    }
  },
  create: (data: Omit<Sweet, 'id'>) => api.post<Sweet>('/sweets', data),
  update: (id: string, data: Partial<Sweet>) => api.put<Sweet>(`/sweets/${id}`, data),
  delete: (id: string) => api.delete(`/sweets/${id}`),
  purchase: (id: string, quantity: number = 1) => 
    api.post(`/sweets/${id}/purchase`, { quantity }),
  restock: (id: string, quantity: number) => 
    api.post(`/sweets/${id}/restock`, { quantity }),
};

export default api;