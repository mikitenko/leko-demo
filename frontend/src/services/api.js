import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// Додаємо токен до кожного запиту
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обробка 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Products ─────────────────────────────────────────────────────────────────
export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id, locale) => api.get(`/products/${id}`, { params: { locale } }),
  getCategories: () => api.get('/products/categories'),
  getFilters: (category) => api.get('/products/filters', { params: { category } }),

  // Admin
  adminList: (params) => api.get('/products/admin/list', { params }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  uploadPhotos: (id, files) => {
    const form = new FormData();
    files.forEach((f) => form.append('photos', f));
    return api.post(`/products/${id}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deletePhoto: (photoId) => api.delete(`/products/photos/${photoId}`),
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

export default api;
