import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;