// Frontend Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
    PROFILE: `${API_BASE_URL}/auth/profile`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    CV: `${API_BASE_URL}/auth/cv`,
  },
  AI: {
    ANALYZE_CV: `${API_BASE_URL}/ai/analyze-cv`,
    GENERATE_QUESTIONS: `${API_BASE_URL}/ai/generate-questions`,
    CHAT: `${API_BASE_URL}/ai/chat`,
  },
  INTERVIEWS: {
    SAVE: `${API_BASE_URL}/interviews/save`,
    GET_ALL: `${API_BASE_URL}/interviews`,
    GET_ONE: (id: string) => `${API_BASE_URL}/interviews/${id}`,
  },
  DATA: {
    SETUP_OPTIONS: `${API_BASE_URL}/data/setup-options`,
  }
};
