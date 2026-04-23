// Frontend Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    ME: `${API_BASE_URL}/api/auth/me`,
    PROFILE: `${API_BASE_URL}/api/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/change-password`,
    CV: `${API_BASE_URL}/api/auth/cv`,
  },
  AI: {
    ANALYZE_CV: `${API_BASE_URL}/api/ai/analyze-cv`,
    GENERATE_QUESTIONS: `${API_BASE_URL}/api/ai/generate-questions`,
    CHAT: `${API_BASE_URL}/api/ai/chat`,
  },
  INTERVIEWS: {
    SAVE: `${API_BASE_URL}/api/interviews/save`,
    GET_ALL: `${API_BASE_URL}/api/interviews`,
    GET_ONE: (id: string) => `${API_BASE_URL}/api/interviews/${id}`,
  },
  DATA: {
    SETUP_OPTIONS: `${API_BASE_URL}/api/data/setup-options`,
  }
};
