const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return response.json();
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API error');
    }
    return response.json();
  },

  put: async <T>(endpoint: string, data: any, adminPassword?: string): Promise<T> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (adminPassword) {
      headers['X-Admin-Password'] = adminPassword;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API error');
    }
    return response.json();
  },
};
