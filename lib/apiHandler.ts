import apiClient from './apiClient';

export const apiHandler = {
  // Auth
  auth: {
    loginOrRegister: (idToken: string) => apiClient.post('/auth', { idToken }),
    logout: () => apiClient.delete('/auth'),
    getAuthStatus: () => apiClient.get('/auth/status'),
  },

  // User
  user: {
    getUserProfile: () => apiClient.get('/user/profile'),
  },

  // Products
  product: {
    getProducts: (params: URLSearchParams | string) => apiClient.get(`/products?${params.toString()}`),
    createProduct: (data: Record<string, unknown>) => apiClient.post('/products', data),
    updateProduct: (productId: string, data: Record<string, unknown>) => apiClient.put(`/products/${productId}`, data),
    deleteProduct: (productId: string) => apiClient.delete(`/products/${productId}`),
    getProductById: (productId: URLSearchParams | string) => apiClient.get(`/products/${productId}`),
  },

  // Cart
  cart: {
    getCart: () => apiClient.get('/cart'),
    addToCart: (productId: string, quantity: number) => apiClient.post('/cart', { productId, quantity }),
    removeFromCart: (productId: string) => apiClient.delete('/cart', { data: { productId } }),
    updateCart: (productId: string, quantity: number) => apiClient.put('/cart', { productId, quantity }),
  },

  // Orders
  order: {
    getOrders: (params: URLSearchParams | string) => apiClient.get(`/orders?${params.toString()}`),
    checkout: (data: Record<string, unknown>) => apiClient.post('/orders', data),
    updateOrderStatus: (orderId: string, status: string) => apiClient.put(`/orders/${orderId}`, { status }),
    getOrderById: (orderId: URLSearchParams | string) => apiClient.get(`/orders/${orderId}`),
  },

  // Upload
  utils: {
    uploadImage: (payload: FormData) => {
      return apiClient.post('/upload', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
  },
};