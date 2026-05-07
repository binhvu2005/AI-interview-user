import { API_ENDPOINTS } from './api.config';

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void, reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const fetchWithAuth = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  let token = localStorage.getItem('token');
  let customInit = init || {};

  if (token) {
    customInit.headers = {
      ...customInit.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  const response = await fetch(input, customInit);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      return response;
    }

    if (isRefreshing) {
      // If already refreshing, wait for the new token
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(newToken => {
        customInit.headers = {
          ...customInit.headers,
          'Authorization': `Bearer ${newToken}`
        };
        return fetch(input, customInit);
      }).catch(err => {
        return Promise.reject(err);
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!refreshRes.ok) {
        throw new Error('Refresh failed');
      }

      const data = await refreshRes.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);

      token = data.token;
      
      processQueue(null, token);

      // Retry the original request
      customInit.headers = {
        ...customInit.headers,
        'Authorization': `Bearer ${token}`
      };
      
      return fetch(input, customInit);

    } catch (err) {
      processQueue(err, null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return response; // Return the original 401
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};
