// API service for exercise analysis platform
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

// Auth token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('auth_token', token);
};

export const getAuthToken = (): string | null => {
  return authToken;
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('auth_token');
};

// API request wrapper with auth
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAuthToken();
    window.location.href = '/athlete/login';
    throw new Error('Authentication required');
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  login: async (email: string, password: string, role: 'athlete' | 'official') => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    height?: number;
    weight?: number;
    age?: number;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  refreshToken: async () => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Exercise Analysis API
export const analysisAPI = {
  startLiveAnalysis: async (exerciseType: string) => {
    return apiRequest('/analysis/live/start', {
      method: 'POST',
      body: JSON.stringify({ exerciseType }),
    });
  },

  stopLiveAnalysis: async (sessionId: string) => {
    return apiRequest(`/analysis/live/stop/${sessionId}`, {
      method: 'POST',
    });
  },

  analyzeVideo: async (exerciseType: string, videoFile: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('exerciseType', exerciseType);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error'));

      xhr.open('POST', `${API_BASE_URL}/analysis/video/upload`);
      if (authToken) {
        xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
      }
      xhr.send(formData);
    });
  },

  getAnalysisResults: async (analysisId: string) => {
    return apiRequest(`/analysis/results/${analysisId}`);
  },

  getSessionHistory: async (limit = 20, offset = 0) => {
    return apiRequest(`/analysis/history?limit=${limit}&offset=${offset}`);
  },
};

// Real-time WebSocket for live analysis
export class LiveAnalysisSocket {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;

  connect(sessionId: string, onMessage: (data: any) => void, onError: (error: Event) => void) {
    this.sessionId = sessionId;
    const wsUrl = `${API_BASE_URL.replace('http', 'ws')}/analysis/live/${sessionId}`;
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    this.ws.onerror = onError;
    
    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendFrame(frameData: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'frame',
        data: frameData,
      }));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Officials API
export const officialsAPI = {
  getSubmissions: async (status?: 'pending' | 'approved' | 'rejected') => {
    const query = status ? `?status=${status}` : '';
    return apiRequest(`/officials/submissions${query}`);
  },

  reviewSubmission: async (submissionId: string, action: 'approve' | 'reject', notes?: string) => {
    return apiRequest(`/officials/submissions/${submissionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ action, notes }),
    });
  },

  getSubmissionDetails: async (submissionId: string) => {
    return apiRequest(`/officials/submissions/${submissionId}`);
  },
};

export default {
  authAPI,
  analysisAPI,
  officialsAPI,
  LiveAnalysisSocket,
};