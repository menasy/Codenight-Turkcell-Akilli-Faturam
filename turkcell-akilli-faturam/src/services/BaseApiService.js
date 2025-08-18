// Base API service - Single Responsibility Principle
import axios from 'axios';

class BaseApiService {
  constructor(baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api') {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response.data,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  async get(url, params = {}) {
    return this.api.get(url, { params });
  }

  async post(url, data = {}) {
    return this.api.post(url, data);
  }

  async put(url, data = {}) {
    return this.api.put(url, data);
  }

  async delete(url) {
    return this.api.delete(url);
  }
}

export default BaseApiService;
